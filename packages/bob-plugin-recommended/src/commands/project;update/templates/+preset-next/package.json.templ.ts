import { defineTemplateFile } from '@ondrej-langr/bob';
import { Json, packageJsonSchema } from '@ondrej-langr/bob/schemas';
import { merge } from 'webpack-merge';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return merge(existingValidated, {
    commands: {
      build: 'next build',
    },
    dependencies: {
      next: '^14',
    },
  } as Partial<typeof existingValidated>) as Json;
});
