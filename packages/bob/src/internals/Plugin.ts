export type PluginOptions = {};

export class Plugin {
  private options: PluginOptions;
  constructor(options: PluginOptions) {
    this.options = options;
  }

  getOptions() {
    return this.options;
  }

  static async loadAt(packageName: string) {
    const plugin = await import(packageName);
    const defaultExport =
      plugin &&
      ('default' in plugin
        ? plugin.default
        : plugin);
    const hasValidExport =
      defaultExport &&
      defaultExport instanceof Plugin;

    if (!hasValidExport) {
      throw new Error(
        `Failed to resolve bob plugin "${packageName}, because its default export is created with definePlugin function. If it is you probably have multiple versions of @ondrej-langr/bob installed."`,
      );
    }

    return defaultExport;
  }
}
