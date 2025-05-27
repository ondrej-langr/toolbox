import { packageVersionSchema } from '@ondrej-langr/zod-package-json';
import semver from 'semver';
import { z } from 'zod';

import type { MaybePromise } from './internals/MaybePromise.js';

export type MigrationVersion =
  | `>${string}`
  | `>=${string}`
  | `<${string}`
  | `<=${string}`;
export type Migration<TInput extends any = undefined> = {
  /** Migration handler */
  handler: (variables: TInput) => MaybePromise<void>;
};
export type DefineMigrationsOptions = {
  /** Defines package name for which versions should be the migrations triggered */
  forPackageName: string;
  /** Record of version rules and its handlers  */
  items: Record<MigrationVersion, Migration>;
};

export interface DefinedMigrations<
  TInput extends any = undefined,
> {
  run(variables: TInput): MaybePromise<MigrationVersion[]>;
}

const simplePackageJsonSchema = z.object({
  version: packageVersionSchema,
});

const shouldRunMigration = (
  currentVersion: string,
  rule: MigrationVersion,
) => {
  switch (true) {
    case rule.startsWith('>='):
      return semver.gte(rule.replace('>=', ''), currentVersion);
    case rule.startsWith('<='):
      return semver.lte(rule.replace('<=', ''), currentVersion);
    case rule.startsWith('>'):
      return semver.gt(rule.replace('>', ''), currentVersion);
    case rule.startsWith('<'):
      return semver.lt(rule.replace('<', ''), currentVersion);
    default:
      throw new Error(
        `Version rule ${currentVersion} is not supported`,
      );
  }
};

/**
 * Handles migrations for specific package version updates.
 */
export const defineMigrations = <TInput extends any = undefined>(
  options: DefineMigrationsOptions,
): DefinedMigrations<TInput> => {
  const { items, forPackageName } = options;

  return {
    async run(variables) {
      const itemsAsArray = Object.entries(items);
      const packageJson = await import(
        `${forPackageName}/package.json`
      );
      const validated =
        simplePackageJsonSchema.safeParse(packageJson);

      if (validated.error) {
        throw new Error(
          `Package ${forPackageName} has missing version field`,
          { cause: validated.error },
        );
      }

      const {
        data: { version: packageJsonVersion },
      } = validated;

      const executedMigrations: MigrationVersion[] = [];
      for (const [rule, { handler }] of itemsAsArray) {
        const shouldRun = shouldRunMigration(
          packageJsonVersion,
          rule as MigrationVersion,
        );

        if (shouldRun) {
          await handler(variables as any);
          executedMigrations.push(rule as any);
        }
      }

      return executedMigrations;
    },
  };
};
