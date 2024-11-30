import { glob } from 'glob';

import { BOB_FOLDER_NAME } from './constants.js';
import { logger } from './logger.js';

export type ConfigOptions = {
  /** Defines plugin package names that current project uses. If bob is executed in project inside workspace project it will inherit those configurations */
  plugins?: string[] | undefined;
};

const allowedConfigFileExtensions = ['.js', '.cjs', '.mjs'];

export class Config {
  private options: ConfigOptions;
  constructor(options: ConfigOptions) {
    this.options = options;
  }

  getOptions() {
    return this.options;
  }

  static async loadAt(projectRoot: string) {
    const foundConfigFilePaths = await glob(
      allowedConfigFileExtensions.map(
        (extension) => `${BOB_FOLDER_NAME}/config${extension}`,
      ),
      { cwd: projectRoot, absolute: true },
    );

    if (!foundConfigFilePaths.length) {
      return null;
    }

    const configFilepath = foundConfigFilePaths[0]!;

    const plugin = await import(configFilepath).catch(
      (error) => {
        logger.debug(
          `Failed to load the bob config at ${configFilepath}, because ${error}`,
        );

        return null;
      },
    );
    const defaultExport =
      plugin && ('default' in plugin ? plugin.default : plugin);
    const hasValidExport =
      defaultExport && defaultExport instanceof Config;

    return hasValidExport ? defaultExport : null;
  }
}
