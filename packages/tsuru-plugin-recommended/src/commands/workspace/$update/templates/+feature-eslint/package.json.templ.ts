import { packageJsonSchema } from '@ondrej-langr/zod-package-json';
import { defineTemplateFile } from 'tsuru';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return {
    ...existingValidated,
    scripts: {
      ...existingValidated.scripts,
      lint: 'turbo run lint',
    },
  };
});
