import { packageJsonSchema } from '@ondrejlangr/zod-package-json';
import { defineTemplateFile } from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/tools';

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
