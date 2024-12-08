import { defineTemplateFile } from 'tsuru';
import { packageJsonSchema } from 'tsuru/schemas';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return {
    ...existingValidated,
    scripts: {
      ...existingValidated.scripts,
      lint: 'eslint .',
    },
    devDependencies: {
      ...existingValidated.devDependencies,
      eslint: '^8.57.0',
    },
  };
});
