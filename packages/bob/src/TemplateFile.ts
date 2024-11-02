import ts from 'typescript';
import yaml from 'yaml';

import { FileSystem } from './FileSystem.js';
import { Json, JsonPartial } from './schemas/jsonSchema.js';
import { MaybePromise } from './types/MaybePromise.js';
import { getAstFromString } from './utils/ast/getAstFromString.js';
import { getStringFromAstNode } from './utils/ast/getStringFromAstNode.js';

export type TemplateHandler<I, O = I> = (incomming?: I) => MaybePromise<O>;

export type JsonTemplateHandler = TemplateHandler<Json, JsonPartial>;
export type TextTemplateHandler = TemplateHandler<string>;
export type YamlTemplateHandler = TemplateHandler<Json, JsonPartial>;
export type TSTemplateHandler = TemplateHandler<ts.SourceFile, ts.SourceFile>;
export type JSTemplateHandler = TemplateHandler<ts.SourceFile, ts.SourceFile>;

export type TemplateHandlerTypeToHandler = {
  json: JsonTemplateHandler;
  text: TextTemplateHandler;
  yaml: YamlTemplateHandler;
  ts: TSTemplateHandler;
  js: JSTemplateHandler;
};

const fileParser: {
  [key in keyof TemplateHandlerTypeToHandler]: {
    deserialize: (
      existingFileContents?: string,
    ) => ReturnType<TemplateHandlerTypeToHandler[key]> | undefined;
    serialize: (
      value: Awaited<ReturnType<TemplateHandlerTypeToHandler[key]>>,
    ) => MaybePromise<string>;
  };
} = {
  json: {
    serialize: (value) => JSON.stringify(value, null, 2),
    deserialize: (value) => (value ? (JSON.parse(value) as Json) : value),
  },
  text: {
    serialize: (value) => value ?? '',
    deserialize: (value) => value ?? '',
  },
  yaml: {
    serialize: (value) => yaml.stringify(value),
    deserialize: (value) => (value ? yaml.parse(value) : value),
  },
  ts: {
    serialize: (value) => getStringFromAstNode(value),
    deserialize: (value) => getAstFromString(value ?? ''),
  },
  js: {
    serialize: (value) => getStringFromAstNode(value),
    deserialize: (value) => getAstFromString(value ?? ''),
  },
};

// TODO: variables, would that be even welcomed?
/**
 * Manages templates
 */
export class TemplateFile<
  K extends keyof TemplateHandlerTypeToHandler,
  H extends TemplateHandlerTypeToHandler[K],
> {
  private handler: H;
  private readonly type: K;

  constructor(type: K, handler: H) {
    this.type = type;
    this.handler = handler;
  }

  private async runTemplateHandler(
    existingFileContentsAsString: string | undefined = undefined,
  ) {
    const existingContentDeserialized = await Promise.resolve(
      fileParser[this.type].deserialize(existingFileContentsAsString),
    );

    const result = await Promise.resolve(
      this.handler(existingContentDeserialized as any),
    );

    return await fileParser[this.type].serialize(result as any);
  }

  static define<
    K extends keyof TemplateHandlerTypeToHandler,
    H extends TemplateHandlerTypeToHandler[K],
  >(type: K, handler: H) {
    return new TemplateFile(type, handler);
  }

  async writeTo(resultLocation: string) {
    const existingFileContentsAsString = await FileSystem.readFile(resultLocation);
    const templateContents = await this.runTemplateHandler(existingFileContentsAsString);

    FileSystem.writeFile(resultLocation, templateContents);
  }
}
