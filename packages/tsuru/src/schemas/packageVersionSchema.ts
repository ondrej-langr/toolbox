import semver from 'semver';
import { z } from 'zod';

export const packageVersionSchema = z
  .string()
  .refine((value) =>
    semver.valid(value)
      ? true
      : `Version ${value} is not a valid semver version`,
  );
