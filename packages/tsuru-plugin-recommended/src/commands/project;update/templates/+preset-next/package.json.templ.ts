import { defineTemplateFile } from 'tsuru';
import { packageJsonSchema } from 'tsuru/schemas';
import { merge } from 'webpack-merge';

export default defineTemplateFile('json', async (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return merge(existingValidated, {
    commands: {
      build: 'next build',
    },
    dependencies: {
      next: '^14',
    },
  } as Partial<typeof existingValidated>);
});
