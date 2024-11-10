import { Command as CommanderCommand } from 'commander';
import { glob } from 'glob';
import { createRequire } from 'node:module';
import path from 'node:path';
import { DefaultProgramOptions } from '~/DefaultProgramOptions.js';
import { FileSystem } from '~/FileSystem.js';
import { Project } from '~/Project.js';
import { Workspace } from '~/Workspace.js';

import { Command } from './Command.js';
import { Config, ConfigOptions } from './Config.js';
import { PACKAGE_RUNTIME_ROOT } from './constants.js';
import { Plugin } from './Plugin.js';

const require = createRequire(import.meta.filename);

export class Program {
  private commanderProgram: CommanderCommand;
  private plugins: Map<string, Plugin>;
  private commands: Set<Command<any>>;
  private projectOrWorkspace: Project | Workspace;

  private async getCommanderProgram() {
    if (typeof this.commanderProgram === 'undefined') {
      const bobPackage = await Project.loadAt(path.join(PACKAGE_RUNTIME_ROOT, '..'));
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
        .option('-d, --debug', 'If true it enables logging debug messages', false);
    }

    return this.commanderProgram;
  }

  /** Gets project */
  async getProject() {
    const program = await this.getCommanderProgram();
    const { cwd } = program.opts<DefaultProgramOptions>();

    try {
      this.projectOrWorkspace = await Workspace.loadAt(cwd);
    } catch {
      this.projectOrWorkspace = await Project.loadAt(cwd);
    }

    return this.projectOrWorkspace;
  }

  private async getPlugins() {
    if (typeof this.plugins === 'undefined') {
      const project = await this.getProject();
      const projectBobConfig = await Config.loadAt(project.getRoot());
      const totalConfigPluginsOptions: ConfigOptions['plugins'] = [];

      if (projectBobConfig) {
        totalConfigPluginsOptions.push(...(projectBobConfig.getOptions().plugins ?? []));
      }

      if (project.workspace) {
        const workspaceBobConfig = await Config.loadAt(project.workspace.getRoot());

        totalConfigPluginsOptions.push(
          ...(workspaceBobConfig?.getOptions().plugins ?? []),
        );
      }

      const resolvedPlugins = await Promise.all(
        totalConfigPluginsOptions.map(
          async (pluginPackageName) =>
            [pluginPackageName, await Plugin.loadAt(pluginPackageName)] as const,
        ),
      );

      this.plugins = new Map(resolvedPlugins);
    }

    return this.plugins;
  }

  private async getCommands() {
    if (typeof this.commands === 'undefined') {
      const plugins = await this.getPlugins();

      const commandsAsPromises: Promise<Command<any>[]>[] = [];
      for (const [pluginPackageName] of plugins) {
        const pluginPackageSrcPathname = path.basename(
          require.resolve(pluginPackageName),
        );

        const commandsMatch = path.join(
          pluginPackageSrcPathname,
          'commands',
          '*',
          'command.js',
        );
        commandsAsPromises.push(
          glob(commandsMatch).then(async (commandsPathnames) =>
            Promise.all(
              commandsPathnames.map(async (commandPathname): Promise<Command<any>> => {
                const command = await import(commandPathname);
                const defaultExport =
                  command && ('default' in command ? command.default : command);
                const hasValidExport = defaultExport && defaultExport instanceof Command;

                if (!hasValidExport) {
                  throw new Error(
                    `Command at ${commandPathname} has invalid default export. Please use defineCommand function. If it used there are multiple versions of @ondrej-langr/bob package`,
                  );
                }

                return command;
              }),
            ),
          ),
        );
      }
      const resolvedCommands = await Promise.all(commandsAsPromises);
      this.commands = new Set(resolvedCommands.flatMap((commands) => commands));
    }

    return this.commands;
  }

  private async setupCommands() {
    const commands = await this.getCommands();
    const commanderProgram = await this.getCommanderProgram();

    for (const command of commands) {
      commanderProgram
        .command(command.name)
        .description(command.description)
        .action(async () => {
          await command.execute();
        });
    }
  }

  async getOptions() {
    const commanderProgram = await this.getCommanderProgram();

    return commanderProgram.opts<DefaultProgramOptions>();
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

    await this.setupCommands();

    // Start program
    await this.commanderProgram.parseAsync();

    // TODO: create a local pull request for written files when appropriate action turns that on
    // Commit all files in one go
    await FileSystem.commit();
  }
}