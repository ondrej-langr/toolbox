import { packageJsonSchema } from '@ondrejlangr/zod-package-json';
import { defineTemplateFile } from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/tools';
import { getPackageJsonDefaults } from '~/getPackageJsonDefaults.js';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return applyPackageJsonTemplate({
    templatePackageJson: {
      version: existingValidated.version ?? '0.0.0',
      ...getPackageJsonDefaults(),
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      devDependencies: {
        '@types/node': '^20.11.24',
      },
    },
    userPackageJson: existingValidated,
  });
});
