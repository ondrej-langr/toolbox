import { z } from 'zod';
import type { projectPresets } from '~/commands/project/$create/constants.js';
import { presetNextRouterChoices } from '~/commands/project/$create/presetNextRouterChoices.js';

const presetsToMetaConfig = {
  empty: z.object({
    preset: z.literal('empty'),
  }),
  next: z.object({
    preset: z.literal('next'),
    routerPreset: presetNextRouterChoices,
  }),
  library: z.object({
    preset: z.literal('library'),
  }),
} satisfies Record<
  (typeof projectPresets)[number],
  z.ZodObject<any>
>;

export const projectMetadataConfigFeatures = [
  'testing',
  'eslint',
  'prettier',
  'testing-e2e',
] as const;

export const projectMetadataSchema = z.object({
  config: z
    .discriminatedUnion('preset', [
      presetsToMetaConfig.empty,
      presetsToMetaConfig.next,
      presetsToMetaConfig.library,
    ])
    .and(
      z.object({
        features: z.object(
          Object.fromEntries(
            projectMetadataConfigFeatures.map((key) => [
              key,
              z.boolean().default(false),
            ]),
          ) as {
            [key in (typeof projectMetadataConfigFeatures)[number]]: z.ZodDefault<z.ZodBoolean>;
          },
        ),
      }),
    ),
});
