import type {
  DistinctQuestion,
  Answers as InquirerQuestionAnswers,
} from 'inquirer';
import inquirer from 'inquirer';

import type { Json } from '../schemas/jsonSchema.js';

import { logger } from './logger.js';
import type { Program } from './Program.js';
import { TemplatesLayer } from './TemplatesLayer.js';
import type { MaybeArray } from './types/MaybeArray.js';
import type { MaybePromise } from './types/MaybePromise.js';

export interface CommandOptions<
  QuestionAnswers extends InquirerQuestionAnswers,
  Question = DistinctQuestion<QuestionAnswers> & {
    name: keyof QuestionAnswers;
  },
> {
  templatesRoot?: string | undefined;

  /**
   * {@link https://github.com/SBoudrias/Inquirer.js Inquirer.js} questions as array, each array item could be function which will return question or null
   */
  questions:
    | Array<Question>
    | ((
        this: Command<QuestionAnswers>,
      ) => MaybePromise<Array<Question>>);

  /**
   * Runs before current layer is executed
   */
  handler?: // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | ((
        this: Command<QuestionAnswers>,
      ) => MaybePromise<MaybeArray<Command<any>> | void>)
    | undefined;
}

export class Command<
  QuestionAnswers extends InquirerQuestionAnswers,
> {
  readonly options: CommandOptions<QuestionAnswers>;
  readonly name: string;
  readonly description: string;
  private answers: QuestionAnswers | undefined;
  private program: Omit<Program, 'run'>;

  private templateLayers: Array<{
    renderTo: string;
    readonly layer: TemplatesLayer;
  }> = [];

  constructor(
    name: string,
    description: string,
    options: CommandOptions<QuestionAnswers>,
  ) {
    this.name = name;
    this.description = description;
    this.options = options;
  }

  /**
   * Safely returns answers - if there are no answers yet then we throw
   */
  getAnswers() {
    if (!this.answers) {
      throw new Error('Ask questions first');
    }

    return this.answers;
  }

  private async askQuestions(
    initialAnswers?: Partial<QuestionAnswers>,
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

    this.answers = await inquirer.prompt<QuestionAnswers>(
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

  addTemplatesLayer(
    templatesLayer: TemplatesLayer,
    options: Pick<
      (typeof this.templateLayers)[number],
      'renderTo'
    >,
  ) {
    this.templateLayers.push({
      layer: templatesLayer,
      ...options,
    });
  }

  // bindTemplatesLayer(
  //   relativeTemplatesPath: string,
  //   options: LayerConstructorOptions<QuestionAnswers> & {
  //     renderTo: string;
  //   },
  // ) {
  //   if (
  //     path.isAbsolute(relativeTemplatesPath) &&
  //     relativeTemplatesPath !== '/'
  //   ) {
  //     throw new Error(
  //       `Templates layer path "${relativeTemplatesPath}" must be relative`,
  //     );
  //   }

  //   if (!this.options.templatesRoot) {
  //     throw new Error(
  //       'Cannot register template when no templatesRoot option has been provided',
  //     );
  //   }

  //   const { renderTo, ...layerOptions } = options;

  //   this.templateLayers.push({
  //     templatePathRelative: relativeTemplatesPath,
  //     renderTo,
  //     layer: new TemplatesLayer(
  //       path.join(
  //         this.options.templatesRoot,
  //         relativeTemplatesPath === '/'
  //           ? ''
  //           : relativeTemplatesPath,
  //       ),
  //       layerOptions,
  //     ),
  //   });

  //   return this;
  // }

  async renderTemplateLayers() {
    for (const { layer, renderTo } of this.templateLayers) {
      // eslint-disable-next-line no-await-in-loop -- intended
      await layer.renderTemplates(renderTo, this.answers);
    }
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
    await this.renderTemplateLayers();
  }

  getAsKey() {
    return this.name;
  }

  toString() {
    return this.name;
  }
}
