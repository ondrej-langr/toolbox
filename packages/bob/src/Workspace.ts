import { glob } from 'glob';
import path from 'node:path';
import yaml from 'yaml';
import { z } from 'zod';

import { FileSystem } from './FileSystem.js';
import { PACKAGE_JSON, PNPM_WORKSPACE_YAML } from './internals/constants.js';
import { Project } from './Project.js';

const workspaceYamlSchema = z.object({
  packages: z
    .array(z.string())
    .nullable()
    .transform((value) => value ?? []),
});

export class Workspace extends Project {
  private projects: Project[] | undefined;

  constructor(fromProject: Project) {
    super(fromProject.getRoot(), fromProject.getPackageInfo());

    if (!FileSystem.existsSync(path.join(this.getRoot(), PNPM_WORKSPACE_YAML))) {
      throw new Error(
        `Not a valid workspace. Missing ${PNPM_WORKSPACE_YAML} at ${this.getRoot()}`,
      );
    }
  }

  static override async loadAt(at: string): Promise<Workspace> {
    const loadedProject = await super.loadAt(at);
    const workspace = new Workspace(loadedProject);

    // Preload projects
    await workspace.getProjects();

    return workspace;
  }

  /**
   * Gets nearest possible workspace for provided path (walks recursively up until it hits user root - uses {@link https://github.com/antonk52/lilconfig | lilconfig})
   */
  static override async loadNearest(
    startFrom: string,
  ): Promise<InstanceType<typeof this> | null> {
    let projectPath: string | undefined;
    const nearestWorkspaceYaml = FileSystem.findFile(PNPM_WORKSPACE_YAML, {
      cwd: startFrom,
    });

    if (!nearestWorkspaceYaml) {
      return null;
    }

    projectPath = path.dirname(nearestWorkspaceYaml);

    return this.loadAt(projectPath);
  }

  async getProjectsPathsRaw() {
    const workspaceFilepath = path.join(this.getRoot(), PNPM_WORKSPACE_YAML);
    const workspacesYamlContent = await FileSystem.readFile(workspaceFilepath);

    if (!workspacesYamlContent) {
      throw new Error(
        `YAML workspace file at "${workspaceFilepath}" is either empty or does not exist`,
      );
    }

    const { packages } = workspaceYamlSchema.parse(yaml.parse(workspacesYamlContent));

    return packages;
  }

  /**
  Imports and parsed workspace config from package manager and returns real paths of projects
  */
  async getProjectsPaths() {
    const packages = await this.getProjectsPathsRaw();

    // TODO: This wont work when workspace is created and lives in memory
    return await Promise.all(
      packages.map((matcher) =>
        glob(
          path.join(
            matcher,
            matcher.endsWith('*') ? PACKAGE_JSON : path.join('*', PACKAGE_JSON),
          ),
          {
            cwd: this.getRoot(),
            absolute: true,
          },
        ),
      ),
    ).then((results) => results.flat().map(path.dirname));
  }

  /**
   * Gets workspace packages as array of {@link Package} instances
   */
  async getProjects() {
    if (this.projects?.length) {
      return this.projects;
    }

    const projectsPaths = await this.getProjectsPaths();
    const projectsAsPromises: Promise<Project>[] = [];
    for (const packageRoot of projectsPaths) {
      projectsAsPromises.push(Project.loadAt(packageRoot, this));
    }

    this.projects = await Promise.all(projectsAsPromises);

    return this.projects;
  }
}
