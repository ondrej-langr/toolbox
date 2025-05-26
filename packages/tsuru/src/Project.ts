import path from 'node:path';
import { z } from 'zod';

import { InvalidPackageJsonError } from './exceptions/InvalidPackageJsonError.js';
import { PackageJsonMissingError } from './exceptions/PackageJsonMissingError.js';
import { FileSystem } from './FileSystem.js';
import {
  PACKAGE_JSON,
  PNPM_WORKSPACE_YAML,
  TSURU_FOLDER_NAME,
} from './internals/constants.js';
import { logger } from './internals/logger.js';
import type { JsonLikeValue } from './schemas/jsonLikeObjectSchema.js';
import type { PackageJson } from './schemas/packageJsonSchema.js';
import { packageJsonSchema } from './schemas/packageJsonSchema.js';

const recursiveFindNonWorkspacePackageJson = (
  startAt: string,
): string | null => {
  const closest = FileSystem.findFile(PACKAGE_JSON, {
    cwd: startAt,
  });

  if (!closest) {
    return null;
  }

  const closestDirname = path.dirname(closest);
  const isWorkspace = FileSystem.existsSync(
    path.join(closestDirname, PNPM_WORKSPACE_YAML),
  );

  if (isWorkspace) {
    return recursiveFindNonWorkspacePackageJson(
      path.dirname(closestDirname),
    );
  }

  return closest;
};

// TODO: probably separate this even more. This should be overall implementation that Workspace uses, but we will hit
// the need to have workspace package only stuff.
// Having it here and not separating it could mean that workspace could be under another workspace. That kind of scope could be too large to support
export class Project {
  constructor(
    /**
     * Root of this package
     */
    private readonly root: string,
    /**
     * Loaded and parsed package.json contents
     */
    private packageJsonContents: PackageJson,
  ) {}

  // TODO: this should load from our filesystem
  /**
   * Loads necessary info and returns new instance
   */
  static async loadAt(at: string) {
    const packageJsonPath = path.join(at, PACKAGE_JSON);

    try {
      const packageJsonContent = FileSystem.readJson(
        packageJsonPath,
        {
          schema: packageJsonSchema,
        },
      );

      if (!packageJsonContent) {
        throw new PackageJsonMissingError(at);
      }

      return new Project(at, packageJsonContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new InvalidPackageJsonError(packageJsonPath);
      }

      throw error;
    }
  }

  /**
   * Gets nearest possible project for provided path (walks recursively up until it hits user root)
   * If found project is workspace it skips it and continues
   */
  static async loadNearest(
    startFrom: string,
  ): Promise<InstanceType<typeof this> | null> {
    let projectPath: string | undefined;

    const nearestPackageJson =
      recursiveFindNonWorkspacePackageJson(startFrom);
    if (!nearestPackageJson) {
      return null;
    }

    projectPath = path.dirname(nearestPackageJson);

    return this.loadAt(projectPath);
  }

  private getMetadataPath() {
    return path.join(
      this.getRoot(),
      TSURU_FOLDER_NAME,
      'metadata.json',
    );
  }
  private async readMetadataFile() {
    const metadataJsonFilepath = this.getMetadataPath();
    let metadataFromFile: Record<
      string,
      Record<string, any>
    > = {};

    if (FileSystem.existsSync(metadataJsonFilepath)) {
      try {
        metadataFromFile =
          FileSystem.readJson(metadataJsonFilepath, {
            // Make sure that its an object
            schema: z.record(z.string(), z.record(z.any())),
          }) ?? {};
      } catch (error) {
        logger.warn(
          `Failed to read or parse the ${metadataJsonFilepath.replace(this.getRoot(), '')}`,
          {
            errorMessage: (error instanceof Error
              ? error.message
              : error) as JsonLikeValue,
            metadataJsonFilepath,
          },
        );
      }
    }

    return metadataFromFile;
  }

  hasEnabledTsuru() {
    const metadataJsonFilepath = this.getMetadataPath();

    return FileSystem.existsSync(metadataJsonFilepath);
  }

  getMetadataNamespace<TMetadataSchema extends z.ZodObject<any>>(
    namespace: string,
    schema: TMetadataSchema,
  ) {
    return {
      /** Gets metadata for current project, validated according to @{link schema} */
      get: async (): Promise<z.output<TMetadataSchema>> => {
        const metadataFromFile = await this.readMetadataFile();
        const metadataUnderNamespace =
          metadataFromFile[namespace] ?? {};

        return await schema
          .parseAsync(metadataUnderNamespace)
          .catch((error) => {
            logger.error(
              'Failed to parse the project metadata with provided schema. Please see the error bellow',
              {
                metadataFromFile,
                metadataFromFileForGivenNamespace:
                  metadataUnderNamespace,
                givenNamespace: namespace,
                metadataFilePath: this.getMetadataPath(),
              },
            );

            throw error;
          });
      },
      /** Records new value for metadata. Not validated when saving to file */
      set: async (newValue: z.infer<TMetadataSchema>) => {
        const metadataFromFile = await this.readMetadataFile();

        metadataFromFile[namespace] = newValue;

        FileSystem.writeJson(
          this.getMetadataPath(),
          metadataFromFile,
        );
      },
    };
  }

  /**
   * Gets the root of this package
   */
  getRoot() {
    return this.root;
  }

  /**
   * Gets package.json contents - parsed and represented in custom format
   */
  getPackageInfo() {
    return this.packageJsonContents;
  }

  /**
   * Gets version of current package
   */
  getVersion() {
    const packageInfo = this.getPackageInfo();

    return packageInfo.version;
  }
}
