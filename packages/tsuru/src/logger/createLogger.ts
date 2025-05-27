import type { JsonLikeObject } from '@ondrejlangr/zod-package-json';
import colors from 'picocolors';

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

export interface Logger {
  debug: LoggerHandler;
  error: LoggerHandler;
  info: LoggerHandler;
  warn: LoggerHandler;
  success: LoggerHandler;
}
export type CreateLoggerOptions = {
  name: string;
};
export const createLogger = (
  options: CreateLoggerOptions,
): Logger => {
  const createMessage = (
    type: MessageTypes,
    message: string,
    meta?: JsonLikeObject,
  ) => {
    const withColor = typeToColor[type];
    const prefix = `${options.name.startsWith('@') ? '' : '@'}${options.name} ${type}:`;

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

  return {
    debug: createLog(MessageTypes.DEBUG),
    error: createLog(MessageTypes.ERROR),
    info: createLog(MessageTypes.INFO),
    warn: createLog(MessageTypes.WARN),
    success: createLog(MessageTypes.SUCCESS),
  };
};
