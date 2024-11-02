import type { z } from 'zod';

import type { packageJsonSchema } from '../schemas/packageJsonSchema.js';

import { getProgramVersion } from './getProgramVersion.js';

export const getPackageJsonDefaults = () =>
  ({
    type: 'module',
    author: {
      name: 'ApiTree',
      email: 'info@apitree.cz',
      url: 'https://apitree.cz',
    },
    engines: {
      node: '>=20',
      pnpm: '>=8',
      bob: getProgramVersion(),
    },
    packageManager: 'pnpm@9.7.0',
  }) satisfies Pick<
    z.input<typeof packageJsonSchema>,
    'author' | 'engines' | 'packageManager' | 'type'
  >;
