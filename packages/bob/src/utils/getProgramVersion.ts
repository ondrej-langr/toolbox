import { program } from '~/constants/program.js';

export const getProgramVersion = () => program.version() ?? '0.0.0';
