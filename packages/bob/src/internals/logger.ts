import colors from 'picocolors';
import type { Json } from '~/schemas/jsonSchema.js';

const runWhenDebugEnabled =
  <T extends (...params: any[]) => any>(
    action: T,
  ) =>
  (...params: Parameters<T>) => {
    if (!process.argv0.includes('--debug')) {
      return;
    }

    action(...params);
  };

export const logger = {
  debug: runWhenDebugEnabled(
    (message: string, meta?: Json) =>
      console.log(
        colors.blue(
          `[DEBUG]: ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
        ),
      ),
  ),

  info: (message: string, meta?: Json) =>
    console.log(
      colors.blue(
        `[INFO]: ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
      ),
    ),

  warn: (message: string, meta?: Json) =>
    console.log(
      colors.yellow(
        `[WARN]: ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
      ),
    ),

  success: (message: string, meta?: Json) =>
    console.log(
      colors.green(
        `[SUCCESS]: ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
      ),
    ),
};
