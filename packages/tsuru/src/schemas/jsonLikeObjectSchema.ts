import { z } from 'zod';

const literalSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.undefined(),
]);
type Literal = z.infer<typeof literalSchema>;

export type JsonLikeValue =
  | JsonLikeValue[]
  | Literal
  | { [key: string]: JsonLikeValue };

export type JsonLikeObject = { [key: string]: JsonLikeValue };

export const jsonLikeObjectSchema: z.ZodType<JsonLikeObject> =
  z.lazy(() =>
    z.record(
      z.union([
        literalSchema,
        z.array(jsonLikeObjectSchema),
        jsonLikeObjectSchema,
      ]),
    ),
  );
