import { defineTemplateFile } from '@ondrej-langr/bob';
import { packageJsonSchema } from '@ondrej-langr/bob/schemas';

export default defineTemplateFile(
  'json',
  (existing) => {
    const existingValidated =
      packageJsonSchema.parse(existing);

    return {
      ...existingValidated,
      scripts: {
        ...existingValidated.scripts,
        test: 'turbo run test',
      },
    };
  },
);
