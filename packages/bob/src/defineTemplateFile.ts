import {
  TemplateFile,
  type TemplateFileHandler,
} from './internals/TemplateFile.js';
import type { FileTypeToParsers } from './parsers/FileTypeToParsers.js';

export function defineTemplateFile<
  TParserType extends keyof FileTypeToParsers,
  TVariables extends Record<string, any>,
  THandler = TemplateFileHandler<TParserType, TVariables>,
>(
  type: TParserType,
  handler: THandler,
): TemplateFile<TParserType, TVariables, THandler> {
  return new TemplateFile(type, handler);
}
