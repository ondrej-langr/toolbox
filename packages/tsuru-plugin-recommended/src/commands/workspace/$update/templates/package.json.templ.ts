import { packageJsonSchema } from '@ondrejlangr/zod-package-json';
import { defineTemplateFile } from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/tools';
import { getPackageJsonDefaults } from '~/getPackageJsonDefaults.js';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return applyPackageJsonTemplate({
    templatePackageJson: {
      description: existingValidated.description ?? '',
      license: 'MIT',
      name: existingValidated.name ?? 'TODO',
      ...getPackageJsonDefaults(),
      version: existingValidated.version ?? '0.0.0',
      scripts: {
        'deps:check': 'pnpm dlx taze -r',
        build: 'turbo run build',
      },
      dependencies: {
        '@apitree.cz/prettier-config': '^0.2.3',
        '@changesets/changelog-github': '^0.5.0',
        '@changesets/cli': '^2.27.5',
        '@swc/cli': '^0.3.12',
        '@swc/core': '^1.6.4',
        '@trivago/prettier-plugin-sort-imports': '^5.2.2',
        prettier: '^3.5.3',
        'prettier-plugin-packagejson': '^2.5.0',
        turbo: '^2.0.4',
        vite: '^5.3.1',
        vitest: '^1.6.0',
        '@apitree.cz/eslint-config': '^0.3.5',
        '@apitree.cz/ts-config': '^0.2.3',
        eslint: '^8.57.0',
      },
    },
    userPackageJson: existingValidated,
  });
});
