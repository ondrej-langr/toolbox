import { packageJsonSchema } from '../../../../schemas/packageJsonSchema.js';
import { TemplateFile } from '../../../../TemplateFile.js';

export default TemplateFile.define('json', (existing) => {
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
