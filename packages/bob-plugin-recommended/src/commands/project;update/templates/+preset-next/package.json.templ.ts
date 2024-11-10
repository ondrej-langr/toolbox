import { defineTemplateFile } from '@ondrej-langr/bob';
import { Json, packageJsonSchema } from '@ondrej-langr/bob/schemas';
import lodash from 'lodash';

export default defineTemplateFile('json', (existing) => {
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
