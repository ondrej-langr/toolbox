import { getProgramOptions } from '~/program.js';
import { Json } from '~/schemas/jsonSchema.js';

const runWhenDebugEnabled =
  <T extends (...params: any[]) => any>(action: T) =>
  (...params: Parameters<T>) => {
    if (!getProgramOptions().debug) {
      return;
    }

    action(...params);
  };

export const log = {
  debug: runWhenDebugEnabled((message: string, meta?: Json) =>
    console.log(
      `\x1b[0m\x1b[34m[DEBUG]: ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),
  ),
};
