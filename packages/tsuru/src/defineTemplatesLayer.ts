import path from 'node:path';

import { getCallerFilename } from './internals/getCallerFilename.js';
import {
  type LayerConstructorOptions,
  TemplatesLayer,
} from './internals/TemplatesLayer.js';

export const defineTemplatesLayer = <
  TVariables extends Record<string, any> | undefined = undefined,
>(
  templatesRootPath: string,
  options?: LayerConstructorOptions<TVariables>,
) => {
  const callerFilepath = getCallerFilename();

  const realTemplatePath = path.join(
    path.dirname(callerFilepath),
    templatesRootPath,
  );

  return new TemplatesLayer(realTemplatePath, options);
};
