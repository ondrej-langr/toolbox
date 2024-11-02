import { packageJsonSchema } from '~/schemas/packageJsonSchema.js';
import { TemplateFile } from '~/TemplateFile.js';
import { getPackageJsonDefaults } from '~/utils/getPackageJsonDefaults.js';

export default TemplateFile.define('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return {
    ...existingValidated,
    version: existingValidated.version ?? '0.0.0',
    ...getPackageJsonDefaults(),
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
      ...existingValidated.scripts,
      'deps:check': 'pnpm dlx taze -r',
      format: 'prettier . -w',
      build: 'turbo run build',
    },
    dependencies: {
      '@apitree.cz/prettier-config': '^0.2.3',
      '@changesets/changelog-github': '^0.5.0',
      '@changesets/cli': '^2.27.5',
      '@swc/cli': '^0.3.12',
      '@swc/core': '^1.6.4',
      '@trivago/prettier-plugin-sort-imports': '^4.3.0',
      prettier: '^3.3.2',
      'prettier-plugin-packagejson': '^2.5.0',
      turbo: '^2.0.4',
      vite: '^5.3.1',
      vitest: '^1.6.0',
      '@apitree.cz/eslint-config': '^0.3.5',
      '@apitree.cz/ts-config': '^0.2.3',
      eslint: '^8.57.0',
    },
  };
});
