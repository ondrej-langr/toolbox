import { defineTemplateFile } from '@ondrej-langr/bob';
import { packageJsonSchema } from '@ondrej-langr/bob/schemas';
import { getPackageJsonDefaults } from '~/getPackageJsonDefaults.js';

export default defineTemplateFile('json', (existing) => {
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
