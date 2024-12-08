import type ts from 'typescript';

import { getAstFromString } from '../ast/js-ts/getAstFromString.js';
import { getStringFromAstNode } from '../ast/js-ts/getStringFromAstNode.js';

import type { FileTypeParser } from './FileTypeParser.js';

export const typescriptFileTypeParser: FileTypeParser<ts.SourceFile> =
  {
    serialize: (value) => getStringFromAstNode(value),
    deserialize: (value) => getAstFromString(value ?? ''),
  };
