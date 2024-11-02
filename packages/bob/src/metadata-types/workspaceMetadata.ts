import { z } from 'zod';
import { defineProjectMeta } from '~/utils/defineProjectMeta.js';

export const workspaceMetadataConfigFeatures = ['eslint', 'prettier'] as const;

const workspaceSnapshotSchema = z.object({
  config: z.object({
    features: z.object(
      Object.fromEntries(workspaceMetadataConfigFeatures.map((key) => [key, z.boolean()])) as {
        [key in (typeof workspaceMetadataConfigFeatures)[number]]: z.ZodBoolean;
      },
    ),
  }),
});

export const workspaceMetadata = defineProjectMeta(workspaceSnapshotSchema);
