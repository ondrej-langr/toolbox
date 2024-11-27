import { z } from 'zod';

const tasks = z.record(
  z.string(),
  z.object({
    dependsOn: z.array(z.string()).optional(),
    env: z.array(z.string()).optional(),
    passThroughEnv: z.array(z.string()).nullish(),
    dotEnv: z.array(z.string()).nullish(),
    outputs: z.array(z.string()).nullish(),
    cache: z.boolean().optional(),
    interactive: z.boolean().optional(),
    persistent: z.boolean().optional(),
    inputs: z.array(z.string()).optional(),
    outputLogs: z
      .enum([
        'full',
        'hash-only',
        'new-only',
        'errors-only',
        'none',
      ])
      .optional(),
  }),
);

const rootSchema = z.object({
  tasks,
  globalDependencies: z.array(z.string()).optional(),
  globalEnv: z.array(z.string()).optional(),
  globalPassThroughEnv: z.array(z.string()).optional(),
  globalDotEnv: z.array(z.string()).nullish(),
});

const workspaceSchema = z.object({
  tasks,
  extends: z.array(z.string()),
});

export const turboJsonSchema = z
  .object({
    $schema: z.string(),
  })
  .and(rootSchema.or(workspaceSchema));
