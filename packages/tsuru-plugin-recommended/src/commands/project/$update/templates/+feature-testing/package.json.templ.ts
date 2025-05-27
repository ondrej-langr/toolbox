import { defineTemplateFile } from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/ast/json';
import { packageJsonSchema } from 'tsuru/schemas';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return applyPackageJsonTemplate({
    templatePackageJson: {
      scripts: {
        test: 'pnpm test:unit && pnpm test:types',
        'test:unit': 'vitest --watch false --passWithNoTests',
        'test:types': 'tsc --noEmit',
      },
      devDependencies: {
        vitest: '^1.6.0',
        'vite-tsconfig-paths': '^5.0.1',
      },
    },
    userPackageJson: existingValidated,
  });
});
