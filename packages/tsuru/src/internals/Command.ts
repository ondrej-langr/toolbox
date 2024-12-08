import inquirer from 'inquirer';
import type { DistinctQuestion as InquirerQuestion } from 'inquirer';

import type { DefaultCommandAnswers } from '../DefaultCommandAnswers.js';
import type { Json } from '../schemas/jsonSchema.js';

import { logger } from './logger.js';
import type { Program } from './Program.js';
import type { MaybeArray } from './types/MaybeArray.js';
import type { MaybePromise } from './types/MaybePromise.js';

export type CommandQuestion<
  CommandAnswers extends DefaultCommandAnswers,
> = InquirerQuestion<CommandAnswers> & {
  name: keyof CommandAnswers;
};

export type CommandOptions<
  CommandAnswers extends DefaultCommandAnswers,
> = {
  templatesRoot?: string | undefined;

  /**
   * {@link https://github.com/SBoudrias/Inquirer.js Inquirer.js} questions as array, each array item could be function which will return question or null
   */
  questions:
    | Array<CommandQuestion<CommandAnswers>>
    | ((
        this: Command<CommandAnswers>,
      ) => MaybePromise<Array<CommandQuestion<CommandAnswers>>>);

  /**
   * Runs before current layer is executed
   */
  handler?: // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | ((
        this: Command<CommandAnswers>,
      ) => MaybePromise<MaybeArray<Command<any>> | void>)
    | undefined;
};

export class Command<
  CommandAnswers extends DefaultCommandAnswers,
> {
  readonly options: CommandOptions<CommandAnswers>;
  readonly name: string;
  readonly description: string;
  readonly logger: typeof logger;
  private answers: CommandAnswers | undefined;
  private program: Omit<Program, 'run'>;

  constructor(
    name: string,
    description: string,
    options: CommandOptions<CommandAnswers>,
  ) {
    this.name = name;
    this.description = description;
    this.options = options;
    this.logger = logger;
  }

  /**
   * Safely returns answers - if there are no answers yet then we throw
   */
  getAnswers(): CommandAnswers {
    if (!this.answers) {
      throw new Error('Ask questions first');
    }

    return this.answers;
  }

  private async askQuestions(
    initialAnswers?: Partial<CommandAnswers>,
  ) {
    if (!this.options.questions) {
      return this;
    }

    const resolvedQuestions = Array.isArray(
      this.options.questions,
    )
      ? this.options.questions
      : await Promise.resolve(
          this.options.questions.apply(this),
        );

    this.answers = await inquirer.prompt<CommandAnswers>(
      resolvedQuestions,
      initialAnswers,
    );

    return this;
  }

  setProgram(program: Program) {
    this.program = program;

    return this;
  }

  getProgram() {
    if (typeof this.program === 'undefined') {
      throw new Error('Command does not belong to any program');
    }

    return this.program;
  }

  // TODO: through params override program options
  async execute() {
    const options = this.getProgram().getOptions();

    logger.debug('Running command', {
      name: this.name,
      options: options as unknown as Json,
    });

    await this.askQuestions();

    await Promise.resolve(this.options?.handler?.apply(this));
  }

  getAsKey() {
    return this.name;
  }

  toString() {
    return this.name;
  }
}