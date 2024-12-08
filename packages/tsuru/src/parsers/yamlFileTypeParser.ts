import yaml from 'yaml';

import type { JsonPartial } from '../schemas/jsonSchema.js';

import type { FileTypeParser } from './FileTypeParser.js';

export const yamlFileTypeParser: FileTypeParser<JsonPartial> = {
  serialize: (value) => yaml.stringify(value),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  deserialize: (value) => (value ? yaml.parse(value) : value),
};
