import type { JsonLikeObject } from '@ondrej-langr/zod-package-json';

import type { FileTypeParser } from './FileTypeParser.js';

export const jsonFileTypeParser: FileTypeParser<
  JsonLikeObject | undefined
> = {
  serialize: (value) => JSON.stringify(value, null, 2),
  deserialize: (value) =>
    value ? (JSON.parse(value) as any) : value,
};
