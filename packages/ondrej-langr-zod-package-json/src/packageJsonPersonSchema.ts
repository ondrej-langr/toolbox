import { z } from 'zod';

export const packageJsonPersonSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  url: z.string().url().optional(),
});
