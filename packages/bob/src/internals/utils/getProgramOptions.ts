import { ProgramOptions } from '~/types/ProgramOptions';

export const getProgramOptions = (): ProgramOptions => global.cachedProgramOptions;
