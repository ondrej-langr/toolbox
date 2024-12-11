import {
  TemplateFile,
  type TemplateFileHandler,
} from './internals/TemplateFile.js';
import type { FileTypeToParsers } from './parsers/FileTypeToParsers.js';

export function defineTemplateFile<
  TVariables extends Record<string, any>,
  TParserType extends keyof FileTypeToParsers,
  THandler extends TemplateFileHandler<
    TParserType,
    TVariables
  > = TemplateFileHandler<TParserType, TVariables>,
>(
  type: TParserType,
  handler: THandler,
): TemplateFile<TVariables, TParserType, THandler> {
  return new TemplateFile(type, handler);
}
