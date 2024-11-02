import { z } from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
export type Json = Json[] | Literal | { [key: string]: Json };
export type JsonPartial =
  | JsonPartial[]
  | Literal
  | { [key: string]: JsonPartial | undefined };

export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);
