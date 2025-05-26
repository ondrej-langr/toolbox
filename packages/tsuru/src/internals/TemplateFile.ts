import { DeleteFileTemplateResult } from '../DeleteFileTemplateResult.js';
import { FileSystem } from '../FileSystem.js';
import type { FileTypeToParsers } from '../parsers/FileTypeToParsers.js';
import { javascriptFileTypeParser } from '../parsers/javascriptFileTypeParser.js';
import { jsonFileTypeParser } from '../parsers/jsonFileTypeParser.js';
import { textFileTypeParser } from '../parsers/textFileTypeParser.js';
import { typescriptFileTypeParser } from '../parsers/typescriptFileTypeParser.js';
import { yamlFileTypeParser } from '../parsers/yamlFileTypeParser.js';

import type { MaybePromise } from './MaybePromise.js';

const parsers: FileTypeToParsers = {
  js: javascriptFileTypeParser,
  json: jsonFileTypeParser,
  text: textFileTypeParser,
  ts: typescriptFileTypeParser,
  yaml: yamlFileTypeParser,
};

export type TemplateFileHandler<
  TParserType extends keyof FileTypeToParsers,
  TVariables extends Record<string, any>,
> = (
  fileContext: Parameters<
    FileTypeToParsers[TParserType]['serialize']
  >[0],
  context: { variables: TVariables },
) => MaybePromise<
  | ReturnType<FileTypeToParsers[TParserType]['deserialize']>
  | DeleteFileTemplateResult
>;

/**
 * Manages templates
 */
export class TemplateFile<
  TVariables extends Record<string, any>,
  TParserType extends keyof FileTypeToParsers,
  THandler extends TemplateFileHandler<
    TParserType,
    TVariables
  > = TemplateFileHandler<TParserType, TVariables>,
> {
  constructor(
    private readonly type: TParserType,
    private handler: THandler,
  ) {}

  private async runTemplateHandler(
    existingFileContentsAsString: string | undefined = undefined,
    variables?: TVariables,
  ) {
    const parser = parsers[this.type];

    const existingContentDeserialized = await Promise.resolve(
      parser.deserialize(existingFileContentsAsString),
    );

    const result = await Promise.resolve(
      this.handler(
        existingContentDeserialized as any,
        // Make sure that variables are always an object
        { variables: (variables ?? {}) as TVariables },
      ),
    );

    if (result instanceof DeleteFileTemplateResult) {
      return result;
    }

    return await parser.serialize(result as any);
  }

  async writeTo(resultLocation: string, variables?: TVariables) {
    const existingFileContentsAsString =
      await FileSystem.readFile(resultLocation);

    const templateContents = await this.runTemplateHandler(
      existingFileContentsAsString,
      variables,
    );

    if (templateContents instanceof DeleteFileTemplateResult) {
      FileSystem.delete(resultLocation);
    } else {
      FileSystem.writeFile(resultLocation, templateContents);
    }
  }
}
