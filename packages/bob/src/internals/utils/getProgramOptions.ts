import { ProgramOptions } from '~/types/ProgramOptions.js';

export const getProgramOptions = (): ProgramOptions => global.cachedProgramOptions;
