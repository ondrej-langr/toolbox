import inquirer, { Answers as InquirerQuestionAnswers, DistinctQuestion } from 'inquirer';
import path from 'path';

import { LayerConstructorOptions, TemplateLayer } from './TemplateLayer.js';
import { getProgramOptions, program } from './program.js';
import { MaybeArray } from './types/MaybeArray.js';
import { MaybePromise } from './types/MaybePromise.js';
import { getCallerFilename } from './utils/getCallerFilename.js';
import { log } from './utils/log.js';

export type CommandOptions<
  QuestionAnswers extends InquirerQuestionAnswers,
  Question = DistinctQuestion<QuestionAnswers> & { name: keyof QuestionAnswers },
> = {
  templatesRoot?: string | undefined;

  /**
   * {@link https://github.com/SBoudrias/Inquirer.js Inquirer.js} questions as array, each array item could be function which will return question or null
   */
  questions: ((this: Command<QuestionAnswers>) => MaybePromise<Array<Question>>) | Array<Question>;

  /**
   * Runs before current layer is executed
   */
  handler?: ((this: Command<QuestionAnswers>) => MaybePromise<void | MaybeArray<Command<any>>>) | undefined;
};

export class Command<QuestionAnswers extends InquirerQuestionAnswers> {
  readonly options: CommandOptions<QuestionAnswers>;
  readonly name: string;
  readonly description: string;
  private answers: QuestionAnswers | undefined;
  private templateLayers: Array<{
    templatePathRelative: string;
    renderTo: string;
    readonly layer: TemplateLayer;
  }> = [];

  constructor(name: string, description: string, options: CommandOptions<QuestionAnswers>) {
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

  private async askQuestions(initialAnswers?: Partial<QuestionAnswers>) {
    if (!this.options.questions) {
      return this;
    }

    const resolvedQuestions = Array.isArray(this.options.questions)
      ? this.options.questions
      : await Promise.resolve(this.options.questions.apply(this));

    this.answers = await inquirer.prompt<QuestionAnswers>(resolvedQuestions, initialAnswers);

    return this;
  }

  bindTemplatesLayer(
    relativeTemplatesPath: string,
    options: LayerConstructorOptions<QuestionAnswers> & { renderTo: string },
  ) {
    if (path.isAbsolute(relativeTemplatesPath) && relativeTemplatesPath !== '/') {
      throw new Error(`Templates layer path "${relativeTemplatesPath}" must be relative`);
    }

    if (!this.options.templatesRoot) {
      throw new Error('Cannot register template when no templatesRoot option has been provided');
    }

    const { renderTo, ...layerOptions } = options;

    this.templateLayers.push({
      templatePathRelative: relativeTemplatesPath,
      renderTo,
      layer: new TemplateLayer(
        path.join(this.options.templatesRoot, relativeTemplatesPath === '/' ? '' : relativeTemplatesPath),
        layerOptions,
      ),
    });

    return this;
  }

  async renderTemplateLayers() {
    for (const { layer, renderTo } of this.templateLayers) {
      await layer.renderTemplates(renderTo, this.answers);
    }
  }

  async execute() {
    const options = getProgramOptions();

    log.debug('Running command', {
      name: this.name,
      options,
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

  static define<QuestionAnswers extends InquirerQuestionAnswers>(
    options: Omit<CommandOptions<QuestionAnswers>, 'templatesRoot'> & { description: string },
  ) {
    const filepath = getCallerFilename();
    const { description, ...commandOptions } = options;
    const filename = path.basename(filepath);
    const commandRoot = path.dirname(filepath);
    let commandName = path.basename(commandRoot);

    if (filename != 'command.js' && filename !== 'command.ts') {
      throw new Error(`File where Command.define is called must be named command.ts. Got ${filename}`);
    }

    if (commandName.includes('$')) {
      commandName = commandName.replaceAll('$', path.basename(commandName));
    }

    const command = new Command(commandName, description, {
      ...commandOptions,
      templatesRoot: path.join(commandRoot, 'templates'),
    });

    log.debug(`Defined command ${commandName}`);

    program
      .command(command.name)
      .description(command.description)
      .action(async () => {
        await command.execute();
      });

    return command;
  }
}
