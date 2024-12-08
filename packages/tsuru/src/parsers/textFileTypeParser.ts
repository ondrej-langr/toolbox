import type { FileTypeParser } from './FileTypeParser.js';

export const textFileTypeParser: FileTypeParser<string> = {
  serialize: (value) => value ?? '',
  deserialize: (value) => value ?? '',
};
