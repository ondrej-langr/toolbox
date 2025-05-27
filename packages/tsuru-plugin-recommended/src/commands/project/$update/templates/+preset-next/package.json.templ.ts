import { packageJsonSchema } from '@ondrejlangr/zod-package-json';
import { defineTemplateFile } from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/tools';

export default defineTemplateFile('json', async (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return applyPackageJsonTemplate({
    templatePackageJson: {
      commands: {
        build: 'next build',
      },
      dependencies: {
        next: '^14',
      },
    },
    userPackageJson: existingValidated,
  });
});
