import type ts from 'typescript';
import { getAstFromString } from '~/tools/getAstFromString.js';
import { getStringFromAstNode } from '~/tools/getStringFromAstNode.js';

import type { FileTypeParser } from './FileTypeParser.js';

export const typescriptFileTypeParser: FileTypeParser<ts.SourceFile> =
  {
    serialize: (value) => getStringFromAstNode(value),
    deserialize: (value) => getAstFromString(value ?? ''),
  };
