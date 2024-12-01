import { packageJsonSchema } from '@ondrej-langr/bob/schemas';
import type { z } from 'zod';

export const getPackageJsonDefaults = () =>
  ({
    type: 'module',
    engines: {
      node: '>=20',
      pnpm: '>=8',
    },
    packageManager: 'pnpm@9.7.0',
  }) satisfies Pick<
    z.input<typeof packageJsonSchema>,
    'author' | 'engines' | 'packageManager' | 'type'
  >;
