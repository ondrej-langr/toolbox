import type { packageJsonSchema } from '@ondrejlangr/zod-package-json';
import type { z } from 'zod';

export const getPackageJsonDefaults = () =>
  ({
    engines: {
      node: '>=20',
      pnpm: '>=8',
    },
    packageManager: 'pnpm@9.7.0',
  }) satisfies Pick<
    z.input<typeof packageJsonSchema>,
    'author' | 'engines' | 'packageManager' | 'type'
  >;
