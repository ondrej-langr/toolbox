import { FileSystem } from '../../FileSystem.js';
import { TemplateFile } from '../TemplateFile.js';

const ENCODING: BufferEncoding = 'utf8';

export const createEjsTemplateFile = async (templateLocation: string) => {
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
};
