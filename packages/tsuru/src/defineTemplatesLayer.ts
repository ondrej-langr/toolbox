import path from 'node:path';

import { getCallerFilename } from './internals/getCallerFilename.js';
import {
  type LayerConstructorOptions,
  TemplatesLayer,
} from './internals/TemplatesLayer.js';

/** @deprecated Will be removed as template layers are not recommended anymore */
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
