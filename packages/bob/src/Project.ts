import path from 'path';

import { FileSystem } from './FileSystem.js';
import type { Workspace } from './Workspace.js';
import { PACKAGE_JSON, PNPM_WORKSPACE_YAML } from './constants.js';
import { PackageJson, packageJsonSchema } from './schemas/packageJsonSchema.js';

const recursiveFindNonWorkspacePackageJson = (startAt: string): string | null => {
  const closest = FileSystem.findFile(PACKAGE_JSON, {
    cwd: startAt,
  });

  if (!closest) {
    return null;
  }

  const closestDirname = path.dirname(closest);
  const isWorkspace = FileSystem.existsSync(path.join(closestDirname, PNPM_WORKSPACE_YAML));

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

  constructor(packageRoot: string, packageJsonContents: PackageJson, workspace: Workspace | null = null) {
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
      throw new Error(`Not a valid Node.js package, missing ${PACKAGE_JSON} at ${packageJsonPath}`);
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

    console.log({ nearestPackageJson });

    projectPath = path.dirname(nearestPackageJson);

    return this.loadAt(projectPath);
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
