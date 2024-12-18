import { glob } from 'glob';
import nodeFs from 'node:fs';
import path from 'node:path';

import { TemplateFile } from './TemplateFile.js';
import type { MaybePromise } from './types/MaybePromise.js';
import { createEjsTemplateFile } from './utils/createEjsTemplateFile.js';

const allowedTemplateExtensions = [
  'ejs',
  'templ.ts',
  'templ.js',
];

export interface LayerConstructorOptions<
  TVariables extends Record<string, any> | undefined = undefined,
> {
  /**
   * Runs before current layer is executed
   */
  onBeforeRender?: (
    this: TemplatesLayer<TVariables>,
  ) => MaybePromise<void>;
  /**
   * Runs after current layer is executed
   */
  onAfterRender?: (
    this: TemplatesLayer<TVariables>,
  ) => MaybePromise<void>;

  /**
   * Runs before each file that is being created
   * You can return object that is passed into each file as values that can be accessed inside templates
   */
  onBeforeFileRender?: (
    this: TemplatesLayer<TVariables>,
  ) => MaybePromise<Record<string, any> | void>;

  /**
   * Runs after each file that has been created
   */
  onAfterFileRender?: (
    this: TemplatesLayer<TVariables>,
  ) => MaybePromise<void>;
}

// TODO: this should be dumb rendering engine - find all templates and render them all. Everything other should control command
export class TemplatesLayer<
  TVariables extends Record<string, any> | undefined = undefined,
> {
  private readonly options:
    | LayerConstructorOptions<TVariables>
    | undefined;

  private readonly dirname: string;

  constructor(
    dirname: string,
    options?: LayerConstructorOptions<TVariables>,
  ) {
    this.options = options;
    this.dirname = dirname;
  }

  /**
   * Resolves paths to templates
   */
  private async resolveTemplates(): Promise<
    { files: string[]; templatesRoot: string }[]
  > {
    const globsAsPromises: Promise<
      Awaited<ReturnType<typeof this.resolveTemplates>>[number]
    >[] = [];

    // TODO: validate this in constructor perhaps? Templates should be always present
    if (nodeFs.existsSync(this.dirname) === false) {
      throw new Error(
        `Defined template folder ${this.dirname} does not exist`,
      );
    }

    globsAsPromises.push(
      glob(
        allowedTemplateExtensions.map((templateExtension) =>
          path.join(
            this.dirname,
            '**',
            `*.${templateExtension}`,
          ),
        ),
        {
          dot: true,
          ignore: {
            // Ignore all folders starting with "+" which is reserved for naming nested template roots
            childrenIgnored: (path) => path.name.startsWith('+'),
          },
        },
      ).then((files) => ({
        files,
        templatesRoot: this.dirname,
      })),
    );

    return await Promise.all(globsAsPromises);
  }

  async renderTemplates(
    to: string,
    ...other: TVariables extends undefined ? [] : [TVariables]
  ) {
    const [variables] = other;
    const [resolvedFiles] = await Promise.all([
      this.resolveTemplates(),
      Promise.resolve(this.options?.onBeforeRender?.apply(this)),
    ]);

    const createdFilesAsPromises: Promise<void>[] = [];
    for (const {
      files: templateLocations,
      templatesRoot,
    } of resolvedFiles) {
      for (const templateFileLocation of templateLocations) {
        // Realpath of to-be-created file
        const writeTemplateTo = templateFileLocation
          .replace(templatesRoot, to)
          .replace(
            new RegExp(
              `\\.(${allowedTemplateExtensions.map((v) => v.replaceAll('.', String.raw`\.`)).join('|')})`,
            ),
            '',
          );

        createdFilesAsPromises.push(
          Promise.resolve()
            .then(async () => {
              await this.options?.onBeforeFileRender?.apply(
                this,
              );
              const template: TemplateFile<any, any, any> =
                await (templateFileLocation.endsWith('.ejs')
                  ? createEjsTemplateFile(templateFileLocation)
                  : import(templateFileLocation).then(
                      (module) => {
                        if (
                          'default' in module === false ||
                          module.default instanceof
                            TemplateFile ===
                            false
                        ) {
                          throw new Error(
                            `Template file at ${templateFileLocation} is incorrect. Please export return type from TemplateFile.define as default export from that file.`,
                          );
                        }

                        return module.default;
                      },
                    ));

              await template.writeTo(writeTemplateTo, variables);
            })
            .then(async () => {
              await Promise.resolve(
                this.options?.onAfterFileRender?.apply(this),
              );
            }),
        );
      }
    }

    await Promise.all(createdFilesAsPromises);
    await Promise.resolve(
      this.options?.onAfterRender?.apply(this),
    );

    return this;
  }
}
