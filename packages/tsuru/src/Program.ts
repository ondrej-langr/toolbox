import { Command as CommanderCommand } from 'commander';
import { glob } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import type { DefaultProgramOptions } from './DefaultProgramOptions.js';
import { FileSystem } from './FileSystem.js';
import { Command } from './internals/Command.js';
import { commandsLoader } from './internals/commandsLoader.js';
import {
  Config,
  type ConfigOptions,
} from './internals/Config.js';
import {
  COMMANDS_GLOB_FILE_MATCH,
  COMMANDS_GLOB_FILE_MATCH_WITH_FOLDER,
  TSURU_FOLDER_NAME,
} from './internals/constants.js';
import { Plugin } from './internals/Plugin.js';
import {
  createLogger,
  type Logger,
} from './logger/createLogger.js';
import { Project } from './Project.js';
import { Workspace } from './Workspace.js';

export type ProgramConstructorOptions = {
  /** The name of your program */
  name: string;
  /** Program aliases, only first is shown in the help */
  aliases?: string[];
  /** Description of this program */
  description?: string;
  /** Your program version */
  version?: string;
  commandsRoots?: Set<string>;
  plugins?: string[];
};

export class Program {
  private commanderProgram: CommanderCommand;
  private plugins: Map<string, Plugin>;
  private commands: Set<Command<any>>;
  readonly logger: Logger;

  constructor(
    private readonly options: ProgramConstructorOptions,
  ) {
    this.logger = createLogger({
      name: options.name,
    });
  }

  private async getCommanderProgram() {
    if (typeof this.commanderProgram === 'undefined') {
      const { name, description, version, aliases } =
        this.options;

      this.commanderProgram = new CommanderCommand();
      this.commanderProgram.name(name);

      if (description) {
        this.commanderProgram.description(description);
      }

      if (version) {
        this.commanderProgram.version(version);
      }

      if (aliases) {
        this.commanderProgram.aliases(aliases);
      }

      this.commanderProgram
        .option(
          '-c, --cwd <value>',
          'Define cwd for commands, defaults to cwd that this cli application is executed from',
          (passedValue) =>
            path.isAbsolute(passedValue)
              ? passedValue
              : path.join(process.cwd(), passedValue),
          process.cwd(),
        )
        .option(
          '-d, --debug',
          'If true it enables logging debug messages',
          false,
        );

      this.logger.debug('Initialized program');
    }

    return this.commanderProgram;
  }

  /** Gets project for which current command has been executed */
  async getProject() {
    const program = await this.getCommanderProgram();
    const { cwd } = program.opts<DefaultProgramOptions>();
    let projectOrWorkspace: Project | Workspace | null = null;

    this.logger.debug(
      `Getting project or workspace at current cwd "${cwd}"`,
    );

    try {
      projectOrWorkspace = await Workspace.loadAt(cwd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }

      try {
        projectOrWorkspace = await Project.loadAt(cwd);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw error;
        }
      }
    }

    return projectOrWorkspace;
  }

  private async getPlugins() {
    if (typeof this.plugins === 'undefined') {
      const project = await this.getProject();
      const totalConfigPluginsOptions: ConfigOptions['plugins'] =
        [...(this.options.plugins ?? [])];
      this.logger.debug(`Initializing plugins...`);

      if (project) {
        this.logger.debug(`Loading project Tsuru config...`);
        const projectBobConfig = await Config.loadAt(
          project.getRoot(),
        );

        if (projectBobConfig) {
          totalConfigPluginsOptions.push(
            ...(projectBobConfig.getOptions().plugins ?? []),
          );
        }

        this.logger.debug(`Loading workspace Tsuru config...`);
        const projectWorkspace = await Workspace.loadNearest(
          project.getRoot(),
        );
        if (projectWorkspace) {
          const workspaceBobConfig = await Config.loadAt(
            projectWorkspace.getRoot(),
          );

          totalConfigPluginsOptions.push(
            ...(workspaceBobConfig?.getOptions().plugins ?? []),
          );
        }
      }
      // TODO: allow user to define plugins with cli arguments

      this.logger.debug(
        `Resolving plugins from workspaces and projects...`,
      );
      const resolvedPlugins = await Promise.all(
        totalConfigPluginsOptions.map(
          async (pluginPackageName) =>
            [
              pluginPackageName,
              await Plugin.loadAt(pluginPackageName),
            ] as const,
        ),
      );

      this.plugins = new Map(resolvedPlugins);
    }

    return this.plugins;
  }

  private async getCommands() {
    if (typeof this.commands === 'undefined') {
      const plugins = await this.getPlugins();
      const project = await this.getProject();

      const commandsGlobMatches: string[] = [
        // Find program defined commands
        ...[...(this.options.commandsRoots ?? [])].map(
          (absolutePath) =>
            path.join(absolutePath, COMMANDS_GLOB_FILE_MATCH),
        ),
        // Find commands in plugins
        ...[...plugins.entries()].map(([pluginPackageName]) => {
          const pluginPackageSrcRoot = path.dirname(
            fileURLToPath(
              import.meta.resolve(pluginPackageName),
            ),
          );

          return path.join(
            pluginPackageSrcRoot,
            COMMANDS_GLOB_FILE_MATCH_WITH_FOLDER,
          );
        }),
      ];

      if (project) {
        // Find commands in current project where command has been executed
        commandsGlobMatches.push(
          path.join(
            project.getRoot(),
            TSURU_FOLDER_NAME,
            COMMANDS_GLOB_FILE_MATCH_WITH_FOLDER,
          ),
        );

        // Find commands in workspace if its there
        if (project instanceof Workspace === false) {
          const projectWorkspace = await Workspace.loadNearest(
            project.getRoot(),
          );

          if (projectWorkspace) {
            commandsGlobMatches.push(
              path.join(
                projectWorkspace.getRoot(),
                TSURU_FOLDER_NAME,
                COMMANDS_GLOB_FILE_MATCH_WITH_FOLDER,
              ),
            );
          }
        }
      }

      const commandsPathnames = await glob(commandsGlobMatches, {
        absolute: true,
      });

      const commandsAsPromises = commandsPathnames.map(
        async (commandPathname): Promise<Command<any>> => {
          this.logger.debug(
            `Registering command under "${commandPathname}"`,
          );

          const { config: command } =
            (await commandsLoader.load(commandPathname))!;

          const hasValidExport =
            command && command instanceof Command;

          if (!hasValidExport) {
            throw new Error(
              `Command at ${commandPathname} has invalid default export. Please use defineCommand function. If it used there are multiple versions of tsuru package`,
            );
          }

          return command.setProgram(this);
        },
      );
      const resolvedCommands = await Promise.all(
        commandsAsPromises,
      );
      this.commands = new Set(
        resolvedCommands.flatMap((commands) => commands),
      );
    }

    return this.commands;
  }

  private async setupCommands() {
    const commands = await this.getCommands();
    const commanderProgram = await this.getCommanderProgram();

    for (const command of commands) {
      this.logger.debug(`Attaching command "${command.name}"`);
      commanderProgram
        .command(command.name)
        .description(command.description)
        .action(async () => {
          await command.execute();
        });
    }

    this.logger.debug('All possible commands attached...');
  }

  async getOptions(): Promise<DefaultProgramOptions> {
    const commanderProgram = await this.getCommanderProgram();

    return commanderProgram.opts<DefaultProgramOptions>();
  }

  async setCwd(newValue: string) {
    const commanderProgram = await this.getCommanderProgram();

    commanderProgram.setOptionValue('cwd', newValue);

    return this;
  }

  async getVersion() {
    const commanderProgram = await this.getCommanderProgram();

    return commanderProgram.version() ?? '0.0.0';
  }

  async run() {
    // 1. FIND PLUGINS
    // 2. ATTACH PROGRAM OPTIONS
    // 3. SETUP COMMANDER
    // 4. ATTACH ALL COMMANDS FROM PLUGINS
    // 5. RUN
    this.logger.debug('Starting...');

    await this.setupCommands();

    this.logger.debug('Checking if command was provided...');
    if (process.argv.length < 3) {
      this.logger.debug(
        'No command has been provided, exiting...',
      );
      this.commanderProgram.help();
    } else {
      this.logger.info('Welcome!');
    }

    // Start program
    this.logger.debug('Parsing commands and running...');
    await this.commanderProgram.parseAsync();

    this.logger.debug(
      'Everything ok, comitting files to local filesystem...',
    );
    await FileSystem.commit();

    this.logger.success('All work done 🎉');
    this.logger.success('Bye!');
  }
}
