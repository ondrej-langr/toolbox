import { defineTemplateFile } from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/ast/json';
import { packageJsonSchema } from 'tsuru/schemas';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return applyPackageJsonTemplate({
    templatePackageJson: {
      scripts: {
        lint: 'eslint .',
      },
      devDependencies: {
        eslint: '^8.57.0',
      },
    },
    userPackageJson: existingValidated,
  });
});
