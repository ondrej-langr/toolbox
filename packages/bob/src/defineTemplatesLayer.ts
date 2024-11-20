import type { Answers as InquirerQuestionAnswers } from 'inquirer';
import path from 'node:path';

import {
  type LayerConstructorOptions,
  TemplatesLayer,
} from './internals/TemplatesLayer.js';
import { getCallerFilename } from './internals/utils/getCallerFilename.js';

export const defineTemplatesLayer = <
  QuestionAnswers extends
    InquirerQuestionAnswers = InquirerQuestionAnswers,
>(
  templatesRootPath: string,
  options?: LayerConstructorOptions<QuestionAnswers>,
) => {
  const callerFilepath = getCallerFilename();

  const realTemplatePath = path.join(
    path.dirname(callerFilepath),
    templatesRootPath,
  );

  return new TemplatesLayer(
    realTemplatePath,
    options,
  );
};
