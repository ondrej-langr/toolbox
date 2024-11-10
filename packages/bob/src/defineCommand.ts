import type { Answers as InquirerQuestionAnswers } from 'inquirer';
import path from 'node:path';

import { Command, CommandOptions } from './internals/Command.js';
import { logger } from './internals/logger.js';
import { getCallerFilename } from './internals/utils/getCallerFilename.js';

export function defineCommand<QuestionAnswers extends InquirerQuestionAnswers>(
  options: Omit<CommandOptions<QuestionAnswers>, 'templatesRoot'> & {
    description: string;
  },
) {
  const filepath = getCallerFilename();
  const { description, ...commandOptions } = options;
  const filename = path.basename(filepath);
  const commandRoot = path.dirname(filepath);
  let commandName = path.basename(commandRoot);

  if (filename !== 'command.js' && filename !== 'command.ts') {
    throw new Error(
      `File where Command.define is called must be named command.ts. Got ${filename}`,
    );
  }

  if (commandName.includes('$')) {
    commandName = commandName.replaceAll('$', path.basename(commandName));
  }

  if (commandName.includes(';')) {
    commandName = commandName.replaceAll(':', path.basename(commandName));
  }

  const command = new Command(commandName, description, {
    ...commandOptions,
    templatesRoot: path.join(commandRoot, 'templates'),
  });

  logger.debug(`Defined command ${commandName}`);

  return command;
}
