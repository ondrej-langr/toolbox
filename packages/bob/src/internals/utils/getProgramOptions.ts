import type { DefaultProgramOptions } from '~/DefaultProgramOptions.js';

export const getProgramOptions =
  (): DefaultProgramOptions =>
    global.cachedProgramOptions;
