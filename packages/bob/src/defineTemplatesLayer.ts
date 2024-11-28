import path from 'node:path';

import {
  type LayerConstructorOptions,
  TemplatesLayer,
} from './internals/TemplatesLayer.js';
import { getCallerFilename } from './internals/utils/getCallerFilename.js';

export const defineTemplatesLayer = <
  TVariables extends Record<string, any>,
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
