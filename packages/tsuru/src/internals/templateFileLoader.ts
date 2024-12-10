import { defaultLoaders } from 'cosmiconfig';

import { FileSystem } from '../FileSystem.js';

import { TemplateFile } from './TemplateFile.js';

const ENCODING: BufferEncoding = 'utf8';

const resolveTsOrJs = async (
  filepath: string,
): Promise<TemplateFile<any, any>> => {
  const isTs = filepath.endsWith('.ts');

  const result = await defaultLoaders[isTs ? '.ts' : '.js'](
    filepath,
    '',
  );
  if (result instanceof TemplateFile === false) {
    throw new Error(
      `Template file at ${filepath} is incorrect. Please export return type from TemplateFile.define as default export from that file.`,
    );
  }

  return result;
};
const extensionsToLoaders: Record<
  string,
  (filepath: string) => Promise<TemplateFile<any, any>>
> = {
  '.ejs': async (templateLocation: string) => {
    const templateContents = await FileSystem.cacheless.readFile(
      templateLocation,
      {
        encoding: ENCODING,
      },
    );

    return new TemplateFile(
      'text',
      () =>
        // TODO: variables and actual renderer
        templateContents,
    );
  },
  '.templ.ts': resolveTsOrJs,
  '.templ.js': resolveTsOrJs,
};
const loadTemplate = async (filepath: string) => {
  const [, result] = Object.entries(extensionsToLoaders).find(
    ([extension]) => filepath.endsWith(extension),
  )!;

  return result(filepath);
};

export const templateFileLoader = {
  loaders: extensionsToLoaders,
  load: loadTemplate,
};
