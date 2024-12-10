import colors from 'picocolors';

import type { Json } from '../schemas/jsonSchema.js';

const runWhenDebugEnabled =
  <T extends (...params: any[]) => any>(action: T) =>
  (...params: Parameters<T>) => {
    if (!process.argv.includes('--debug')) {
      return;
    }

    action(...params);
  };

export const logger = {
  debug: runWhenDebugEnabled((message: string, meta?: Json) =>
    console.log(
      `${colors.blue('debug@tsuru:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),
  ),

  error: (message: string, meta?: Json) =>
    console.log(
      `${colors.red('error@tsuru:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),

  info: (message: string, meta?: Json) =>
    console.log(
      `${colors.blue('info@tsuru:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),

  warn: (message: string, meta?: Json) =>
    console.log(
      `${colors.yellow('warn@tsuru:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),

  success: (message: string, meta?: Json) =>
    console.log(
      `${colors.green('success@tsuru:')} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`,
    ),
};
