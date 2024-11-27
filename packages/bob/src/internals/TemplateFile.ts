import ts from 'typescript';
import yaml from 'yaml';
import { getAstFromString } from '~/ast/js-ts/getAstFromString.js';
import { getStringFromAstNode } from '~/ast/js-ts/getStringFromAstNode.js';
import { FileSystem } from '~/FileSystem.js';
import type {
  Json,
  JsonPartial,
} from '~/schemas/jsonSchema.js';

import type { MaybePromise } from './types/MaybePromise.js';

export type TemplateHandler<
  I,
  O = I,
  V = Record<string, any>,
> = (
  incomming: I | undefined,
  metadata: { variables?: V },
) => MaybePromise<O>;

export type JsonTemplateHandler = TemplateHandler<
  Json,
  JsonPartial
>;
export type TextTemplateHandler =
  TemplateHandler<string>;
export type YamlTemplateHandler = TemplateHandler<
  Json,
  JsonPartial
>;
export type TSTemplateHandler = TemplateHandler<
  ts.SourceFile,
  ts.SourceFile
>;
export type JSTemplateHandler = TemplateHandler<
  ts.SourceFile,
  ts.SourceFile
>;

export interface TemplateHandlerTypeToHandler {
  json: JsonTemplateHandler;
  text: TextTemplateHandler;
  yaml: YamlTemplateHandler;
  ts: TSTemplateHandler;
  js: JSTemplateHandler;
}

const fileParser: {
  [key in keyof TemplateHandlerTypeToHandler]: {
    deserialize: (
      existingFileContents?: string,
    ) =>
      | ReturnType<
          TemplateHandlerTypeToHandler[key]
        >
      | undefined;
    serialize: (
      value: Awaited<
        ReturnType<
          TemplateHandlerTypeToHandler[key]
        >
      >,
    ) => MaybePromise<string>;
  };
} = {
  json: {
    serialize: (value) =>
      JSON.stringify(value, null, 2),
    deserialize: (value) =>
      value ? (JSON.parse(value) as Json) : value,
  },
  text: {
    serialize: (value) => value ?? '',
    deserialize: (value) => value ?? '',
  },
  yaml: {
    serialize: (value) => yaml.stringify(value),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    deserialize: (value) =>
      value ? yaml.parse(value) : value,
  },
  ts: {
    serialize: (value) =>
      getStringFromAstNode(value),
    deserialize: (value) =>
      getAstFromString(value ?? ''),
  },
  js: {
    serialize: (value) =>
      getStringFromAstNode(value),
    deserialize: (value) =>
      getAstFromString(value ?? ''),
  },
};

// TODO: variables, would that be even welcomed?
/**
 * Manages templates
 */
export class TemplateFile<
  K extends keyof TemplateHandlerTypeToHandler,
  H extends TemplateHandlerTypeToHandler[K],
  V extends Record<string, any>,
> {
  private handler: H;

  private readonly type: K;

  constructor(type: K, handler: H) {
    this.type = type;
    this.handler = handler;
  }

  private async runTemplateHandler(
    existingFileContentsAsString:
      | string
      | undefined = undefined,
    variables?: V,
  ) {
    const existingContentDeserialized =
      await Promise.resolve(
        fileParser[this.type].deserialize(
          existingFileContentsAsString,
        ),
      );

    const result = await Promise.resolve(
      this.handler(
        existingContentDeserialized as any,
        // Make sure that variables are always an object
        { variables: variables ?? {} },
      ),
    );

    return await fileParser[this.type].serialize(
      result as any,
    );
  }

  async writeTo(
    resultLocation: string,
    variables?: V,
  ) {
    const existingFileContentsAsString =
      await FileSystem.readFile(resultLocation);
    const templateContents =
      await this.runTemplateHandler(
        existingFileContentsAsString,
        variables,
      );

    FileSystem.writeFile(
      resultLocation,
      templateContents,
    );
  }
}
