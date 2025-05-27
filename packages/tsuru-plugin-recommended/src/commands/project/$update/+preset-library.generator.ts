import fs from 'node:fs';
import path from 'node:path';
import {
  defineTemplateFile,
  FileSystem,
  type Project,
} from 'tsuru';
import { applyPackageJsonTemplate } from 'tsuru/tools';
import type { z } from 'zod';
import { getPackageJsonDefaults } from '~/getPackageJsonDefaults.js';
import type { workspaceMetadataSchema } from '~/workspaceMetadataSchema.js';

const getSwrcFileContents = (type: 'module' | 'commonjs') =>
  JSON.stringify(
    {
      $schema: 'https://swc.rs/schema.json',
      module: {
        type: type === 'module' ? 'nodenext' : 'commonjs',
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
  const typesScripts = [];

  const scripts = new Map<string, string>(
    Object.entries({
      test: 'echo "Error: no test specified" && exit 1',
      prebuild: 'rm -rf dist .temp',

      'build:cjs':
        'swc ./src -d dist/cjs --copy-files --include-dotfiles --strip-leading-paths --config-file .cjs.swcrc && echo \"{ \\\"type\\\": \\\"commonjs\\\" }\" > dist/cjs/package.json',

      'build:esm':
        'swc ./src -d dist --copy-files --include-dotfiles --strip-leading-paths --config-file .esm.swcrc && echo \"{ \\\"type\\\": \\\"module\\\" }\" > dist/package.json',
    }),
  );

  const buildScripts = ['pnpm build:types'];
  const buildTypesScripts = [];

  if (isEsm || dualBuild) {
    buildScripts.push('pnpm build:esm');
    buildTypesScripts.push(
      'tsc --project tsconfig.build.json --outDir dist',
    );
  } else {
    scripts.delete('build:esm');
  }

  if (isCjs || dualBuild) {
    buildScripts.push('pnpm build:cjs');
    buildTypesScripts.push(
      'tsc --project tsconfig.build.json --outDir dist/cjs',
    );
  } else {
    scripts.delete('build:cjs');
  }

  scripts.set('build', buildScripts.join(' && '));
  scripts.set('build:types', buildTypesScripts.join(' && '));

  if (existingPackageJson.exports) {
    for (const [exportKey, exportValue] of Object.entries(
      existingPackageJson.exports,
    )) {
      if (typeof exportValue === 'string') {
        continue;
      }

      let filepath = 'index.js';

      if (exportKey !== '.') {
        const isDirectory =
          fs.existsSync(
            path.join(projectPath, 'src', exportKey),
          ) &&
          fs
            .statSync(path.join(projectPath, 'src', exportKey))
            .isDirectory();

        if (isDirectory) {
          filepath = path.join(exportKey, 'index.js');
        } else {
          filepath = exportKey.endsWith('.js')
            ? exportKey
            : `${exportKey}.js`;
        }
      }

      const esmFilepath = `./${path.join('./dist', filepath)}`;

      const totalExports: typeof exportValue = {
        ...((isCjs || dualBuild) && {
          require: {
            default: esmFilepath.replace('/dist/', '/dist/cjs/'),
            types: esmFilepath
              .replace('/dist/', '/dist/cjs/')
              .replace('.js', '.d.ts'),
          },
        }),
        ...((isEsm || dualBuild) && {
          import: {
            default: esmFilepath,
            types: esmFilepath.replace('.js', '.d.ts'),
          },
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
      getSwrcFileContents('module'),
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
