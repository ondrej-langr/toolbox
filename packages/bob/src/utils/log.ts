import type { Json } from '~/schemas/jsonSchema.js';

import { getProgramOptions } from './getProgramOptions.js';

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
      `\u001B[0m\u001B[34m[DEBUG]: ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),
  ),
};
