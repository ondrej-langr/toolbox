import { defineTemplateFile } from '@ondrej-langr/bob';
import { turboJsonSchema } from '~/turboJsonSchema.js';

const mergeWithoutDuplicates = <
  const A extends Array<any>,
  const B extends Array<any>,
>(
  a: A,
  b: B,
) => [...new Set([...a, ...b])] as A & B;

export default defineTemplateFile('json', (unvalid) => {
  const previous = turboJsonSchema.parse(unvalid);

  return {
    ...previous,
    globalDependencies: mergeWithoutDuplicates(
      'globalDependencies' in previous &&
        previous.globalDependencies
        ? previous.globalDependencies
        : [],
      ['**/.env.*local'],
    ),
    $schema: 'https://turbo.build/schema.json',
    tasks: {
      ...previous.tasks,
      build: {
        ...previous.tasks.build,
        dependsOn: mergeWithoutDuplicates(
          ['^build'],
          previous.tasks.build?.dependsOn ?? [],
        ),
        outputs: mergeWithoutDuplicates(
          ['.next/**', 'dist/**'],
          previous.tasks.build?.outputs ?? [],
        ),
      },
      test: {
        ...previous.tasks.test,
        dependsOn: mergeWithoutDuplicates(
          ['^build', 'typecheck', 'lint'],
          previous.tasks.build?.dependsOn ?? [],
        ),
        outputs: mergeWithoutDuplicates(
          ['coverage/**', 'test-results.xml'],
          previous.tasks.build?.outputs ?? [],
        ),
      },
      lint: {
        ...previous.tasks.lint,
        dependsOn: mergeWithoutDuplicates(
          ['^build'],
          previous.tasks.build?.dependsOn ?? [],
        ),
      },
      typecheck: {
        ...previous.tasks.typecheck,
        dependsOn: mergeWithoutDuplicates(
          ['^build'],
          previous.tasks.build?.dependsOn ?? [],
        ),
      },
    },
  };
});
