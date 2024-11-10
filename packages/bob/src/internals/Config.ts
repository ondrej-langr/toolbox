import path from 'path';

export type ConfigOptions = {
  /** Defines plugin package names that current project uses. If bob is executed in project inside workspace project it will inherit those configurations */
  plugins?: string[] | undefined;
};

export class Config {
  private options: ConfigOptions;
  constructor(options: ConfigOptions) {
    this.options = options;
  }

  getOptions() {
    return this.options;
  }

  static async loadAt(projectRoot: string) {
    const projectConfigPath = path.join(projectRoot, '.bob', 'config.ts');
    const plugin = await import(projectConfigPath);
    const defaultExport = plugin && ('default' in plugin ? plugin.default : plugin);
    const hasValidExport = defaultExport && defaultExport instanceof Config;

    return hasValidExport ? defaultExport : null;
  }
}
