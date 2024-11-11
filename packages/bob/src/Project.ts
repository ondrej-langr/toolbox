import path from 'node:path';
import { z } from 'zod';

import { FileSystem } from './FileSystem.js';
import {
  BOB_FOLDER_NAME,
  PACKAGE_JSON,
  PNPM_WORKSPACE_YAML,
} from './internals/constants.js';
import { logger } from './internals/logger.js';
import type { PackageJson } from './schemas/packageJsonSchema.js';
import { packageJsonSchema } from './schemas/packageJsonSchema.js';
import type { Workspace } from './Workspace.js';

const METADATA_PATH_IN_PROJECT = path.join(BOB_FOLDER_NAME, 'metadata.json');
const recursiveFindNonWorkspacePackageJson = (startAt: string): string | null => {
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
    return recursiveFindNonWorkspacePackageJson(path.dirname(closestDirname));
  }

  return closest;
};

// TODO: probably separate this even more. This should be overall implementation that Workspace uses, but we will hit
// the need to have workspace package only stuff.
// Having it here and not separating it could mean that workspace could be under another workspace. That kind of scope could be too large to support
export class Project {
  /**
   * Root of this package
   */
  private readonly root: string;

  /**
   * Workspace of this package
   */
  readonly workspace: Workspace | null = null;

  /**
   * Loaded and parsed package.json contents
   */
  private packageJsonContents: PackageJson;

  constructor(
    packageRoot: string,
    packageJsonContents: PackageJson,
    workspace: Workspace | null = null,
  ) {
    this.root = packageRoot;
    this.packageJsonContents = packageJsonContents;
    this.workspace = workspace;
  }

  // TODO: this should load from our filesystem
  /**
   * Loads necessary info and returns new instance
   */
  static async loadAt(at: string, workspace?: Workspace) {
    const packageJsonPath = path.join(at, PACKAGE_JSON);
    const packageJsonContent = await FileSystem.readJson(packageJsonPath, {
      schema: packageJsonSchema,
    });

    if (!packageJsonContent) {
      throw new Error(
        `Not a valid Node.js package, missing ${PACKAGE_JSON} at ${packageJsonPath}`,
      );
    }

    return new Project(at, packageJsonContent, workspace);
  }

  /**
   * Gets nearest possible project for provided path (walks recursively up until it hits user root)
   * If found project is workspace it skips it and continues
   */
  static async loadNearest(startFrom: string): Promise<InstanceType<typeof this> | null> {
    let projectPath: string | undefined;

    const nearestPackageJson = recursiveFindNonWorkspacePackageJson(startFrom);
    if (!nearestPackageJson) {
      return null;
    }

    projectPath = path.dirname(nearestPackageJson);

    return this.loadAt(projectPath);
  }

  private async readMetadataFile() {
    const metadataJsonFilepath = path.join(this.getRoot(), METADATA_PATH_IN_PROJECT);
    let metadataFromFile: Record<string, Record<string, any>> = {};

    if (FileSystem.existsSync(metadataJsonFilepath)) {
      metadataFromFile = await FileSystem.readJson(metadataJsonFilepath, {
        // Make sure that its an object
        schema: z.record(z.string(), z.record(z.any())),
      })
        .catch((error) => {
          logger.warn(`Failed to read or parse the ${METADATA_PATH_IN_PROJECT}`, {
            errorMessage: error instanceof Error ? error.message : error,
            metadataJsonFilepath,
          });

          return {};
        })
        .then((result) => result ?? {});
    }

    return metadataFromFile;
  }

  getMetadataNamespace<TMetadataSchema extends z.ZodObject<any>>(
    namespace: string,
    schema: TMetadataSchema,
  ) {
    return {
      /** Gets metadata for current project, validated according to @{link schema} */
      get: async (): Promise<z.output<TMetadataSchema>> => {
        const metadataFromFile = await this.readMetadataFile();
        const metadataUnderNamespace = metadataFromFile[namespace] ?? {};

        return await schema.parseAsync(metadataUnderNamespace);
      },
      /** Records new value for metadata. Not validated when saving to file */
      set: async (newValue: z.infer<TMetadataSchema>) => {
        const metadataFromFile = await this.readMetadataFile();

        metadataFromFile[namespace] = newValue;

        FileSystem.writeJson(
          path.join(this.getRoot(), METADATA_PATH_IN_PROJECT),
          metadataFromFile,
        );
      },
    };
  }

  /**
   * Gets root of this package
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
