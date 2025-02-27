import colors from 'picocolors';

import type { JsonLikeObject } from '../schemas/jsonLikeObjectSchema.js';

const isDebugEnabled = process.argv.includes('--debug');

type LoggerHandler = (
  message: string,
  meta?: JsonLikeObject,
) => void;

enum MessageTypes {
  DEBUG = 'debug',
  ERROR = 'error',
  INFO = 'info',
  WARN = 'warn',
  SUCCESS = 'success',
}

type TypesToColor = Record<
  MessageTypes,
  (message: string) => string
>;
const typeToColor: TypesToColor = {
  [MessageTypes.DEBUG]: colors.blue,
  [MessageTypes.ERROR]: colors.red,
  [MessageTypes.INFO]: colors.blue,
  [MessageTypes.WARN]: colors.yellow,
  [MessageTypes.SUCCESS]: colors.green,
};

const createMessage = (
  type: MessageTypes,
  message: string,
  meta?: JsonLikeObject,
) => {
  const withColor = typeToColor[type];
  const prefix = `@tsuru ${type}:`;

  return `${withColor(prefix)} ${message}${meta ? ` ${JSON.stringify(meta, null, 2)}` : ''}`;
};

const createLog =
  (type: MessageTypes): LoggerHandler =>
  (message, meta) => {
    if (type === MessageTypes.DEBUG && !isDebugEnabled) {
      return;
    }

    console.log(createMessage(type, message, meta));
  };

interface Logger {
  debug: LoggerHandler;
  error: LoggerHandler;
  info: LoggerHandler;
  warn: LoggerHandler;
  success: LoggerHandler;
}
export const logger: Logger = {
  debug: createLog(MessageTypes.DEBUG),
  error: createLog(MessageTypes.ERROR),
  info: createLog(MessageTypes.INFO),
  warn: createLog(MessageTypes.WARN),
  success: createLog(MessageTypes.SUCCESS),
};
