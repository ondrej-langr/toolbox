import { glob } from 'glob';

import { BOB_FOLDER_NAME } from './constants.js';

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

    const plugin = await import(foundConfigFilePaths[0]);
    const defaultExport =
      plugin && ('default' in plugin ? plugin.default : plugin);
    const hasValidExport =
      defaultExport && defaultExport instanceof Config;

    return hasValidExport ? defaultExport : null;
  }
}
