import type { Json } from '~/schemas/jsonSchema.js';

import { getProgramOptions } from './utils/getProgramOptions';

const runWhenDebugEnabled =
  <T extends (...params: any[]) => any>(action: T) =>
  (...params: Parameters<T>) => {
    if (!getProgramOptions().debug) {
      return;
    }

    action(...params);
  };

export const logger = {
  debug: runWhenDebugEnabled((message: string, meta?: Json) =>
    console.log(
      `\u001B[0m\u001B[34m[DEBUG]: ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),
  ),
};
