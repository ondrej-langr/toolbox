import { packageJsonSchema } from '../../../../schemas/packageJsonSchema.js';
import { TemplateFile } from '../../../../TemplateFile.js';

export default TemplateFile.define('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return {
    ...existingValidated,
    scripts: {
      ...existingValidated.scripts,
      test: 'vitest --watch false',
    },
    devDependencies: {
      ...existingValidated.devDependencies,
      vitest: '^1.6.0',
      'vite-tsconfig-paths': '^5.0.1',
    },
  };
});
