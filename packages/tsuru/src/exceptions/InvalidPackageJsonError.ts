import type { z } from 'zod';

export class InvalidPackageJsonError extends Error {
  constructor(
    readonly packageJsonPath: string,
    readonly zodError?: z.ZodError,
  ) {
    super(`Invalid package.json at ${packageJsonPath}`);
  }
}
