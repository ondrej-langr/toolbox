import { Command as CommanderCommand } from 'commander';
import { glob } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import type { DefaultProgramOptions } from '../DefaultProgramOptions.js';
import { FileSystem } from '../FileSystem.js';
import { Project } from '../Project.js';
import { Workspace } from '../Workspace.js';

import { Command } from './Command.js';
import { commandsLoader } from './commandsLoader.js';
import { Config, type ConfigOptions } from './Config.js';
import {
  COMMANDS_GLOB_FILE_MATCH,
  PACKAGE_RUNTIME_ROOT,
  TSURU_FOLDER_NAME,
} from './constants.js';
import { logger } from './logger.js';
import { Plugin } from './Plugin.js';

export class Program {
  private commanderProgram: CommanderCommand;
  private plugins: Map<string, Plugin>;
  private commands: Set<Command<any>>;

  private async getCommanderProgram() {
    if (typeof this.commanderProgram === 'undefined') {
      const bobPackage = await Project.loadAt(
        path.join(PACKAGE_RUNTIME_ROOT, '..'),
      );
      const bobPackageJson = bobPackage.getPackageInfo();

      this.commanderProgram = new CommanderCommand()
        .name(bobPackageJson.name)
        .description(bobPackageJson.description)
        .version(bobPackageJson.version ?? 'unknown')
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

      logger.debug('Initialized program');
    }

    return this.commanderProgram;
  }

  /** Gets project for which current command has been executed */
  async getProject() {
    const program = await this.getCommanderProgram();
    const { cwd } = program.opts<DefaultProgramOptions>();
    let projectOrWorkspace: Project | Workspace | null = null;

    logger.debug(
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
        [];
      logger.debug(`Initializing plugins...`);

      if (project) {
        logger.debug(`Loading project Tsuru config...`);
        const projectBobConfig = await Config.loadAt(
          project.getRoot(),
        );

        if (projectBobConfig) {
          totalConfigPluginsOptions.push(
            ...(projectBobConfig.getOptions().plugins ?? []),
          );
        }

        logger.debug(`Loading workspace Tsuru config...`);
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

      logger.debug(
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
        // Find commands in plugins
        ...[...plugins.entries()].map(([pluginPackageName]) => {
          const pluginPackageSrcRoot = path.dirname(
            fileURLToPath(
              import.meta.resolve(pluginPackageName),
            ),
          );

          return path.join(
            pluginPackageSrcRoot,
            COMMANDS_GLOB_FILE_MATCH,
          );
        }),
      ];

      if (project) {
        // Find commands in current project where command has been executed
        commandsGlobMatches.push(
          path.join(
            project.getRoot(),
            TSURU_FOLDER_NAME,
            COMMANDS_GLOB_FILE_MATCH,
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
                COMMANDS_GLOB_FILE_MATCH,
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
          logger.debug(
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
      logger.debug(`Attaching command "${command.name}"`);
      commanderProgram
        .command(command.name)
        .description(command.description)
        .action(async () => {
          await command.execute();
        });
    }

    logger.debug('All possible commands attached...');
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

  constructor() {}

  async run() {
    // 1. FIND PLUGINS
    // 2. ATTACH PROGRAM OPTIONS
    // 3. SETUP COMMANDER
    // 4. ATTACH ALL COMMANDS FROM PLUGINS
    // 5. RUN
    logger.debug('Starting...');

    await this.setupCommands();

    logger.debug('Checking if command was provided...');
    if (process.argv.length < 3) {
      logger.debug('No command has been provided, exiting...');
      this.commanderProgram.help();
    } else {
      logger.info('Welcome!');
    }

    // Start program
    logger.debug('Parsing commands and running...');
    await this.commanderProgram.parseAsync();

    logger.debug(
      'Everything ok, comitting files to local filesystem...',
    );
    await FileSystem.commit();

    logger.success('All work done 🎉');
    logger.success('Bye!');
  }
}
