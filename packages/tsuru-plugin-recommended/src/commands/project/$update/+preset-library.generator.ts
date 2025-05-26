import path from 'node:path';
import {
  defineTemplateFile,
  FileSystem,
  type Project,
} from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/ast/json';
import type { z } from 'zod';
import { getPackageJsonDefaults } from '~/getPackageJsonDefaults.js';
import type { workspaceMetadataSchema } from '~/workspaceMetadataSchema.js';

const getSwrcFileContents = (type: 'module' | 'commonjs') =>
  JSON.stringify(
    {
      $schema: 'https://swc.rs/schema.json',
      module: {
        type: 'nodenext',
      },
      jsc: {
        target: 'esnext',
        baseUrl: './src',
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        paths: {
          '~/*': ['./*'],
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    },
    null,
    2,
  );

export const presetLibraryGenerator = async (
  project: Project,
  metadata: z.output<typeof workspaceMetadataSchema>,
) => {
  const projectPath = project.getRoot();
  const existingPackageJson = project.getPackageInfo();
  const isEsm = existingPackageJson?.type === 'module';
  const isCjs = existingPackageJson?.type === 'commonjs';

  const typeIsDefined = existingPackageJson?.type !== undefined;
  const dualBuild = !typeIsDefined;

  const scripts = new Map<string, string>(
    Object.entries({
      test: 'echo "Error: no test specified" && exit 1',
      prebuild: 'rm -rf dist .temp',
      'build:types': 'tsc --project tsconfig.build.json',

      'build:cjs':
        'swc ./src -d dist/cjs --copy-files --include-dotfiles --strip-leading-paths --config-file .cjs.swcrc',

      'build:esm':
        'swc ./src -d dist --copy-files --include-dotfiles --strip-leading-paths --config-file .esm.swcrc',
    }),
  );

  const buildScripts = ['pnpm build:types'];

  if (isEsm || dualBuild) {
    buildScripts.push('pnpm build:esm');
  } else {
    scripts.delete('build:esm');
  }

  if (isCjs || dualBuild) {
    buildScripts.push('pnpm build:cjs');
  } else {
    scripts.delete('build:cjs');
  }

  scripts.set('build', buildScripts.join(' && '));

  if (existingPackageJson.exports) {
    for (const [exportKey, exportValue] of Object.entries(
      existingPackageJson.exports,
    )) {
      if (typeof exportValue === 'string') {
        continue;
      }

      const filepath =
        exportKey === '.'
          ? '$exports/index.js'
          : `$exports/${exportKey}.js`;

      const totalExports: typeof exportValue = {
        types: `./dist/${filepath.replace('.js', '.d.ts')}`,
        ...((isCjs || dualBuild) && {
          require: `./dist/cjs/${filepath}`,
        }),
        ...((isCjs || dualBuild) && {
          import: `./dist/${filepath}`,
        }),
      };

      existingPackageJson.exports[exportKey] = totalExports;
    }
  }

  FileSystem.writeJson(
    path.join(projectPath, 'package.json'),
    applyPackageJsonTemplate({
      templatePackageJson: {
        private: existingPackageJson.private ?? true,
        version: existingPackageJson.version ?? '0.0.0',
        ...getPackageJsonDefaults(),
        scripts: {
          ...Object.fromEntries(scripts.entries()),
        },
        devDependencies: {
          '@types/node': '^20.11.24',
        },
      },
      userPackageJson: existingPackageJson,
    }),
  );

  const cjsSwcrcFilePath = path.join(projectPath, '.cjs.swcrc');
  const esmSwcrcFilePath = path.join(projectPath, '.esm.swcrc');

  if (dualBuild || isCjs) {
    FileSystem.writeFile(
      cjsSwcrcFilePath,
      getSwrcFileContents('commonjs'),
    );
  } else {
    FileSystem.delete(cjsSwcrcFilePath);
  }

  if (dualBuild || isEsm) {
    FileSystem.writeFile(
      esmSwcrcFilePath,
      getSwrcFileContents('commonjs'),
    );
  } else {
    FileSystem.delete(esmSwcrcFilePath);
  }

  defineTemplateFile('json', (prev) => ({
    extends: './tsconfig.json',
    compilerOptions: {
      noEmit: false,
      outDir: 'dist',
      rootDir: 'src',
      sourceMap: true,
      declarationMap: true,
      emitDeclarationOnly: true,
      tsBuildInfoFile: 'dist/tsconfig.build.tsbuildinfo',
    },
    include: ['src/**/*'],
    exclude: ['dist', 'node_modules'],
    references: [],
  })).writeTo(path.join(projectPath, 'tsconfig.build.json'));

  defineTemplateFile('json', (prev) => ({
    extends: '@apitree.cz/ts-config/library',
    compilerOptions: {
      module: isCjs || dualBuild ? 'preserve' : 'NodeNext',
      moduleResolution:
        isCjs || dualBuild ? 'bundler' : 'NodeNext',
      noEmit: false,
      verbatimModuleSyntax: true,
      tsBuildInfoFile: 'dist/tsconfig.typecheck.tsbuildinfo',
      paths: {
        '~/*': ['./src/*'],
      },
    },
    include: [
      '.eslintrc.cjs',
      'src/**/*',
      'tests/**/*',
      'vitest.config.ts',
    ],
    exclude: ['dist', 'node_modules'],
  })).writeTo(path.join(projectPath, 'tsconfig.json'));
};
