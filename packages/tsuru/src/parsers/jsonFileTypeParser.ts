import type { JsonPartial } from '../schemas/jsonSchema.js';

import type { FileTypeParser } from './FileTypeParser.js';

export const jsonFileTypeParser: FileTypeParser<
  JsonPartial | undefined
> = {
  serialize: (value) => JSON.stringify(value, null, 2),
  deserialize: (value) =>
    value ? (JSON.parse(value) as JsonPartial) : value,
};
