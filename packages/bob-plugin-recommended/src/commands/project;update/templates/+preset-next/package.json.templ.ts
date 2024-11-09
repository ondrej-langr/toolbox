import lodash from 'lodash';
import type { Json } from '~/schemas/jsonSchema.js';
import { packageJsonSchema } from '~/schemas/packageJsonSchema.js';
import { TemplateFile } from '~/TemplateFile.js';

export default TemplateFile.define('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return lodash.merge(existingValidated, {
    commands: {
      build: 'next build',
    },
    dependencies: {
      next: '^14',
    },
  }) as Json;
});
