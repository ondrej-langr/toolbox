import { ProgramOptions } from '~/ProgramOptions.js';

export const getProgramOptions = (): ProgramOptions => global.cachedProgramOptions;
