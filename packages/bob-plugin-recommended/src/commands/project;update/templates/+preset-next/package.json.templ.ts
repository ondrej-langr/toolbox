import { defineTemplateFile } from '@ondrej-langr/bob';
import { packageJsonSchema } from '@ondrej-langr/bob/schemas';
import { merge } from 'webpack-merge';

export default defineTemplateFile(
  'json',
  (existing) => {
    const existingValidated =
      packageJsonSchema.parse(existing);

    return merge<
      Partial<typeof existingValidated>
    >(existingValidated, {
      commands: {
        build: 'next build',
      },
      dependencies: {
        next: '^14',
      },
    });
  },
);
