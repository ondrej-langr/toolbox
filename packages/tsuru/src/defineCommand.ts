import path from 'node:path';

import type { DefaultCommandAnswers } from './DefaultCommandAnswers.js';
import {
  Command,
  type CommandOptions,
} from './internals/Command.js';
import { ALLOWED_COMMAND_FILE_EXTENSIONS } from './internals/constants.js';
import { getCallerFilename } from './internals/getCallerFilename.js';
import { logger } from './internals/logger.js';

export type DefineCommandOptions<
  CommandAnswers extends DefaultCommandAnswers,
> = Omit<
  CommandOptions<CommandAnswers>,
  'templatesRoot' | 'schema'
> & {
  description: string;
};

export function defineCommand<
  CommandAnswers extends DefaultCommandAnswers,
>(
  options: DefineCommandOptions<CommandAnswers>,
): Command<CommandAnswers> {
  const filepath = getCallerFilename();
  const { description, ...commandOptions } = options;
  const filename = path.basename(filepath);
  const commandRoot = path.dirname(filepath);
  let commandName = path.basename(commandRoot);

  const isAllowedExtension =
    !!ALLOWED_COMMAND_FILE_EXTENSIONS.find((extension) =>
      filename.endsWith(`.${extension}`),
    );
  if (!isAllowedExtension) {
    throw new Error(
      `File where Command.define is called must be named command.ts. Got ${filename}`,
    );
  }

  if (commandName.includes('$')) {
    commandName = commandName.replaceAll(
      '$',
      path.basename(commandName),
    );
  }

  if (commandName.includes(';')) {
    commandName = commandName.replaceAll(';', ':');
  }

  const command = new Command(commandName, description, {
    ...commandOptions,
    templatesRoot: path.join(commandRoot, 'templates'),
  });

  logger.debug(`Defined command ${commandName}`);

  return command;
}
