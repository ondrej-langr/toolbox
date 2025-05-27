import { PackageJson } from '@ondrejlangr/zod-package-json/dist';
import { describe, expect, it } from 'vitest';

import { applyPackageJsonTemplate } from '../../src/tools/applyPackageJsonTemplate';

const createCurrentPackageJson = (): PackageJson => ({
  name: 'test',
  description: 'This is a user description',
  engines: {},
  license: 'MIT',
  type: 'module',
  devDependencies: {},
});

describe('applyPackageJsonTemplate', () => {
  it('should apply package.json template correctly', () => {
    const currentPackageJson: PackageJson =
      createCurrentPackageJson();

    currentPackageJson.devDependencies = {
      secondLib: '^1.2.4',
      thirdLib: '1.2.5',
      fourthLib: '^1.2.5',
      fifthLib: '^1.2.5',
    };
    currentPackageJson.engines = {
      node: '>=20',
      otherTool: '20.4.2',
    };

    const packageJsonFromTemplates: Partial<PackageJson> = {
      type: 'commonjs',
      dependencies: {
        zeroLib: '^1.2.4',
      },
      devDependencies: {
        secondLib: '1.4.4',
        thirdLib: '^1.1.1',
        fourthLib: '^1.1.5',
        fifthLib: '^2.2.5',
      },
      engines: {
        node: '>=20.5.1',
        otherTool: '>=20',
      },
    };

    expect(
      applyPackageJsonTemplate({
        templatePackageJson: packageJsonFromTemplates,
        userPackageJson: currentPackageJson,
      }),
    ).toMatchObject({
      name: 'test',
      description: 'This is a user description',
      license: 'MIT',
      type: 'commonjs',
      dependencies: {
        zeroLib: '^1.2.4',
      },
      devDependencies: {
        secondLib: '1.4.4',
        thirdLib: '1.2.5',
        fourthLib: '^1.2.5',
        fifthLib: '^2.2.5',
      },
      engines: {
        node: '>=20.5.1',
        otherTool: '20.4.2',
      },
    } satisfies PackageJson);
  });

  it('should not create unnecessary empty objects for dependencies', () => {
    const currentPackageJson: PackageJson =
      createCurrentPackageJson();
    delete currentPackageJson.devDependencies;

    const packageJsonFromTemplates: Partial<PackageJson> = {
      type: 'commonjs',
    };

    expect(
      applyPackageJsonTemplate({
        templatePackageJson: packageJsonFromTemplates,
        userPackageJson: currentPackageJson,
      }),
    ).toMatchObject({
      name: 'test',
      description: 'This is a user description',
      engines: {},
      license: 'MIT',
      type: 'commonjs',
    } satisfies PackageJson);
  });

  it.each([
    ['pnpm@9.0.0', 'pnpm@9.1.2', 'pnpm@9.1.2'],
    ['pnpm@9.1.3', 'pnpm@9.0.1', 'pnpm@9.1.3'],
    ['npm@9.0.0', 'pnpm@9.1.4', 'pnpm@9.1.4'],
    [undefined, 'pnpm@9.1.5', 'pnpm@9.1.5'],
    [undefined, 'pnpm@9.1.6', 'pnpm@9.1.6'],
    ['pnpm@9.1.7', undefined, 'pnpm@9.1.7'],
    [undefined, undefined, undefined],
  ] as [
    string | undefined,
    string | undefined,
    string | undefined,
  ][])(
    'when packageManagerField is set to %s and template requires %s it should result in %s',
    (
      currentPackageManager,
      templatePackageManager,
      resultPackageManager,
    ) => {
      const currentPackageJson: PackageJson =
        createCurrentPackageJson();
      delete currentPackageJson.devDependencies;
      delete currentPackageJson.packageManager;

      currentPackageJson.packageManager = currentPackageManager;

      const packageJsonFromTemplates: Partial<PackageJson> = {
        packageManager: templatePackageManager,
      };

      expect(
        applyPackageJsonTemplate({
          templatePackageJson: packageJsonFromTemplates,
          userPackageJson: currentPackageJson,
        }),
      ).toMatchObject({
        name: 'test',
        description: 'This is a user description',
        engines: {},
        license: 'MIT',
        type: 'module',
        packageManager: resultPackageManager,
      } satisfies PackageJson);
    },
  );
});
