import { z } from 'zod';

export const workspaceMetadataConfigFeatures = ['eslint', 'prettier', 'testing'] as const;

export const workspaceMetadataSchema = z.object({
  config: z.object({
    features: z.object(
      Object.fromEntries(
        workspaceMetadataConfigFeatures.map((key) => [key, z.boolean().default(false)]),
      ) as {
        [key in (typeof workspaceMetadataConfigFeatures)[number]]: z.ZodDefault<z.ZodBoolean>;
      },
    ),
  }),
});
