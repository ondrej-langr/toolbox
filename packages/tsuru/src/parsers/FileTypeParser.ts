import type { MaybePromise } from '../internals/MaybePromise.js';

export interface FileTypeParser<TDataType extends any> {
  /** Method that takes initial file content and deserializes it into more approachable format. For example AST */
  deserialize: (
    existingFileContents?: string,
  ) => TDataType | undefined;
  /** Method that takes serialized cotent (for example AST) and serialiues it into string format */
  serialize: (value: Awaited<TDataType>) => MaybePromise<string>;
}
