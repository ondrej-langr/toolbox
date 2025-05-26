import { z } from 'zod';

import { jsonLikeObjectSchema } from './jsonLikeObjectSchema.js';
import { packageJsonPersonSchema } from './packageJsonPersonSchema.js';
import { packageVersionSchema } from './packageVersionSchema.js';
import { projectNameSchema } from './projectNameSchema.js';

const dependencySchema = z.record(z.string(), z.string());

export const packageJsonSchema = z
  .object({
    name: projectNameSchema,
    description: z.string(),
    type: z.enum(['commonjs', 'module']).optional(),
    version: packageVersionSchema.optional(),
    workspaces: z.array(z.string()).optional(),
    scripts: z.record(z.string(), z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    homepage: z.string().url().optional(),
    license: z.string().default('MIT'),
    author: packageJsonPersonSchema.optional(),
    contributors: z.array(packageJsonPersonSchema).optional(),
    files: z.array(z.string()).optional(),
    browser: z.string().optional(),
    bin: z
      .string()
      .or(z.record(z.string(), z.string()))
      .optional(),
    repository: z
      .object({
        type: z.literal('git'),
        url: z.string().url(),
        directory: z.string().optional(),
      })
      .optional(),
    config: z
      .record(
        z.string(),
        z.string().or(z.number()).or(z.record(z.string())),
      )
      .describe(
        'Config parameters which will Node traslate into environment variables. Each variable can be accessible under this key "npm_package_config_<key>"',
      )
      .optional(),
    dependencies: dependencySchema.optional(),
    devDependencies: dependencySchema.optional(),
    peerDependencies: dependencySchema.optional(),
    peerDependenciesMeta: z
      .record(
        z.string(),
        z.record(z.literal('optional'), z.boolean()),
      )
      .optional(),
    overrides: dependencySchema
      .or(z.record(z.literal('pnpm'), dependencySchema))
      .optional(),
    private: z.boolean().optional(),
    engines: z
      .record(z.literal('node').or(z.string()), z.string())
      .default({}),
    packageManager: z.string().optional(),
    exports: z
      .record(
        z.string(),
        z.string().or(
          z
            .object({
              import: z.string().optional(),
              types: z.string().optional(),
              browser: z.string().optional(),
              require: z.string().optional(),
              default: z.string().optional(),
            })
            .refine(
              (value) => Object.keys(value).length > 0,
              'Please define atleast one export field for current export',
            ),
        ),
      )
      .optional(),
  })
  .and(jsonLikeObjectSchema);

export type PackageJson = z.output<typeof packageJsonSchema>;
