import { packageJsonSchema } from '../../../schemas/packageJsonSchema.js';
import { TemplateFile } from '../../../TemplateFile.js';
import { getPackageJsonDefaults } from '../../../utils/getPackageJsonDefaults.js';

export default TemplateFile.define('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return {
    private: true,
    version: existingValidated.version ?? '0.0.0',
    ...existingValidated,
    ...getPackageJsonDefaults(),
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
      ...existingValidated.scripts,
    },
    devDependencies: {
      ...existingValidated.devDependencies,
      '@types/node': '^20.11.24',
    },
  };
});
