import { defineTemplateFile } from 'tsuru';
import { packageJsonSchema } from 'tsuru/schemas';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return {
    ...existingValidated,
    scripts: {
      ...existingValidated.scripts,
      test: 'turbo run test',
    },
  };
});
