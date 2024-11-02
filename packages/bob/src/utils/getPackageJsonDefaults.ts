import { z } from 'zod';

import { getProgramVersion } from '../program.js';
import { packageJsonSchema } from '../schemas/packageJsonSchema.js';

export const getPackageJsonDefaults = () =>
  ({
    type: 'module',
    engines: {
      node: '>=20',
      pnpm: '>=8',
      bob: getProgramVersion(),
    },
    packageManager: 'pnpm@9.7.0',
  }) satisfies Pick<z.input<typeof packageJsonSchema>, 'type' | 'author' | 'engines' | 'packageManager'>;
