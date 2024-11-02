import path from 'path';
import { z } from 'zod';
import { FileSystem } from '~/FileSystem.js';
import { Project } from '~/Project.js';
import { Workspace } from '~/Workspace.js';
import { workspaceMetadata, workspaceMetadataConfigFeatures } from '~/metadata-types/workspaceMetadata.js';

import { Command } from '../../Command.js';
import { getProgramOptions } from '../../program.js';
import { packageJsonSchema } from '../../schemas/packageJsonSchema.js';
import { getPackageJsonDefaults } from '../../utils/getPackageJsonDefaults.js';
import updateWorkspaceCommand from '../workspace:update/command.js';

const WORKSPACE_NAME_REGEX = /([a-z]|[1-9]|-){2,}/;

export default Command.define<{
  name: string;
  description: string;
  selectedFeatures: typeof workspaceMetadataConfigFeatures;
}>({
  description: 'Create workspace',
  questions: [
    {
      name: 'name',
      type: 'input',
      message: "What's the workspace name?",
      validate(input) {
        const isValid = WORKSPACE_NAME_REGEX.test(String(input));

        return isValid || `Workspace name must follow this regex ${WORKSPACE_NAME_REGEX}`;
      },
    },
    {
      name: 'description',
      type: 'input',
      message: "What's the workspace description?",
    },
    {
      name: 'selectedFeatures',
      type: 'checkbox',
      message: 'Select features',
      default: workspaceMetadataConfigFeatures,
      choices: workspaceMetadataConfigFeatures,
    },
  ],
  async handler() {
    const { cwd } = getProgramOptions();
    const { name, description, selectedFeatures } = this.getAnswers();

    const workspacePath = name === path.basename(cwd) ? cwd : path.join(cwd, name);

    FileSystem.writeJson(path.join(workspacePath, 'package.json'), {
      name,
      description,
      ...getPackageJsonDefaults(),
    } satisfies z.input<typeof packageJsonSchema>);
    FileSystem.writeFile(path.join(workspacePath, 'pnpm-workspace.yaml'), 'packages:');

    getProgramOptions().cwd = workspacePath;

    const newProject = await Workspace.loadAt(workspacePath);

    workspaceMetadata.writeForProject(newProject, {
      config: {
        features: Object.fromEntries(
          workspaceMetadataConfigFeatures.map((key) => [key, selectedFeatures.includes(key)]),
        ) as { [key in (typeof workspaceMetadataConfigFeatures)[number]]: boolean },
      },
    });

    await updateWorkspaceCommand.execute();
  },
});
