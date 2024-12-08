import { defineTemplateFile } from 'tsuru';
import { packageJsonSchema } from 'tsuru/schemas';

export default defineTemplateFile('json', (existing) => {
  const existingValidated = packageJsonSchema.parse(existing);

  return {
    ...existingValidated,
    scripts: {
      ...existingValidated.scripts,
      test: 'pnpm test:unit && pnpm test:types',
      'test:unit': 'vitest --watch false',
      'test:types': 'tsc --noEmit',
    },
    devDependencies: {
      ...existingValidated.devDependencies,
      vitest: '^1.6.0',
      'vite-tsconfig-paths': '^5.0.1',
    },
  };
});
