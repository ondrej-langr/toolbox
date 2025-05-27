import type { JsonLikeObject } from '@ondrejlangr/zod-package-json';
import yaml from 'yaml';

import type { FileTypeParser } from './FileTypeParser.js';

export const yamlFileTypeParser: FileTypeParser<
  JsonLikeObject | undefined
> = {
  serialize: (value) => yaml.stringify(value ?? ''),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  deserialize: (value) => (value ? yaml.parse(value) : value),
};
