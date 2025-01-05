import { defineTemplateFile } from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/ast/json';
import { packageJsonSchema } from 'tsuru/schemas';

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
