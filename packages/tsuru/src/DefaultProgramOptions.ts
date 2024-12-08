export interface DefaultProgramOptions {
  cwd: string;
  debug: boolean;
}

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var cachedProgramOptions: DefaultProgramOptions;
}
