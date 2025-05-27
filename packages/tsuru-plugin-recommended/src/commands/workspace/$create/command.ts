import type { packageJsonSchema } from '@ondrej-langr/zod-package-json';
import path from 'node:path';
import { defineCommand, FileSystem, Workspace } from 'tsuru';
import type { z } from 'zod';
import { PROJECT_METADATA_WORKSPACE_NAMESPACE } from '~/constants.js';
import { getPackageJsonDefaults } from '~/getPackageJsonDefaults.js';
import {
  workspaceMetadataConfigFeatures,
  workspaceMetadataSchema,
} from '~/workspaceMetadataSchema.js';

import updateWorkspaceCommand from '../$update/command.js';

const WORKSPACE_NAME_REGEX = /([a-z]|[1-9]|-){2,}/;

export default defineCommand<{
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

        return (
          isValid ||
          `Workspace name must follow this regex ${WORKSPACE_NAME_REGEX}`
        );
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
    const program = this.getProgram();
    const options = await program.getOptions();
    const { cwd } = options;
    const { name, description, selectedFeatures } =
      this.getAnswers();

    const workspacePath =
      name === path.basename(cwd) ? cwd : path.join(cwd, name);

    FileSystem.writeJson(
      path.join(workspacePath, 'package.json'),
      {
        name,
        description,
        ...getPackageJsonDefaults(),
      } satisfies z.input<typeof packageJsonSchema>,
    );
    FileSystem.writeFile(
      path.join(workspacePath, 'pnpm-workspace.yaml'),
      'packages:',
    );

    const newProject = await Workspace.loadAt(workspacePath);
    await newProject
      .getMetadataNamespace(
        PROJECT_METADATA_WORKSPACE_NAMESPACE,
        workspaceMetadataSchema,
      )
      .set({
        config: {
          features: Object.fromEntries(
            workspaceMetadataConfigFeatures.map((key) => [
              key,
              selectedFeatures.includes(key),
            ]),
          ) as {
            [key in (typeof workspaceMetadataConfigFeatures)[number]]: boolean;
          },
        },
      });

    // Prepare cwd for update workspace command
    await program.setCwd(workspacePath);

    await updateWorkspaceCommand.execute();
  },
});
