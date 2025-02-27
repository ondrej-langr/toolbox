import colors from 'picocolors';

import type { JsonLikeObject } from '../schemas/jsonLikeObjectSchema.js';

const runWhenDebugEnabled =
  <T extends (...params: any[]) => any>(action: T) =>
  (...params: Parameters<T>) => {
    if (!process.argv.includes('--debug')) {
      return;
    }

    action(...params);
  };

export const logger = {
  debug: runWhenDebugEnabled(
    (message: string, meta?: JsonLikeObject) =>
      console.log(
        `${colors.blue('@tsuru debug:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
      ),
  ),

  error: (message: string, meta?: JsonLikeObject) =>
    console.log(
      `${colors.red('@tsuru error:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),

  info: (message: string, meta?: JsonLikeObject) =>
    console.log(
      `${colors.blue('@tsuru info:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),

  warn: (message: string, meta?: JsonLikeObject) =>
    console.log(
      `${colors.yellow('@tsuru warn:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),

  success: (message: string, meta?: JsonLikeObject) =>
    console.log(
      `${colors.green('@tsuru success:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),
};
