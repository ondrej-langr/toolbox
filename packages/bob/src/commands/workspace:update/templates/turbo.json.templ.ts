import { turboJsonSchema } from '~/schemas/turboJsonSchema.js';
import { TemplateFile } from '~/TemplateFile.js';

const mergeWithoutDuplicates = <const A extends Array<any>, const B extends Array<any>>(
  a: A,
  b: B,
) => [...new Set(...a, ...b)] as A & B;

export default TemplateFile.define('json', (unvalid) => {
  const prev = turboJsonSchema.parse(unvalid);

  return {
    ...prev,
    globalDependencies: mergeWithoutDuplicates(
      'globalDependencies' in prev && prev.globalDependencies
        ? prev.globalDependencies
        : [],
      ['**/.env.*local'],
    ),
    $schema: 'https://turbo.build/schema.json',
    tasks: {
      ...prev.tasks,
      build: {
        ...prev.tasks.build,
        dependsOn: mergeWithoutDuplicates(['^build'], prev.tasks.build?.dependsOn ?? []),
        outputs: mergeWithoutDuplicates(
          ['.next/**', 'dist/**'],
          prev.tasks.build?.outputs ?? [],
        ),
      },
      test: {
        ...prev.tasks.test,
        dependsOn: mergeWithoutDuplicates(
          ['^build', 'typecheck', 'lint'],
          prev.tasks.build?.dependsOn ?? [],
        ),
        outputs: mergeWithoutDuplicates(
          ['coverage/**', 'test-results.xml'],
          prev.tasks.build?.outputs ?? [],
        ),
      },
      lint: {
        ...prev.tasks.lint,
        dependsOn: mergeWithoutDuplicates(['^build'], prev.tasks.build?.dependsOn ?? []),
      },
      typecheck: {
        ...prev.tasks.typecheck,
        dependsOn: mergeWithoutDuplicates(['^build'], prev.tasks.build?.dependsOn ?? []),
      },
    },
  };
});
