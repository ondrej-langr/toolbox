import type { AsyncDynamicQuestionProperty } from 'inquirer';
import path from 'node:path';
import type { z } from 'zod';
import { FileSystem } from '~/FileSystem.js';
import {
  projectMetadata,
  projectMetadataConfigFeatures,
} from '~/metadata-types/projectMetadata.js';
import { Project } from '~/Project.js';
import { getProgramOptions } from '~/utils/getProgramOptions.js';

import { Command } from '../../Command.js';
import type { packageJsonSchema } from '../../schemas/packageJsonSchema.js';
import { projectNameSchema } from '../../schemas/projectNameSchema.js';
import { getPackageJsonDefaults } from '../../utils/getPackageJsonDefaults.js';
import { Workspace } from '../../Workspace.js';
import projectUpdateCommand from '../project;update/command.js';

import { projectPresets } from './constants.js';
import { getProjectFolderNameFromProjectName } from './getProjectFolderNameFromProjectName.js';
import { presetNextRouterChoices } from './presetNextRouterChoices.js';

let _forWorkspace: Workspace | null = null;
const getWorkspace = async () => {
  const { cwd } = getProgramOptions();
  _forWorkspace ??= await Workspace.loadNearest(cwd);
  return _forWorkspace;
};

const enabledWhenInWorkspace: AsyncDynamicQuestionProperty<boolean, any> = async () =>
  !!(await getWorkspace());

export default Command.define<{
  name: string;
  description: string;
  preset: (typeof projectPresets)[number];
  projectLocationInWorkspace?: string;
  presetNextRouterPreset?: z.infer<typeof presetNextRouterChoices>;
  selectedFeatures: typeof projectMetadataConfigFeatures;
}>({
  description: 'Create project',
  questions: [
    {
      name: 'name',
      type: 'input',
      message: 'Whats the project name?',
      validate(input) {
        const zodOutput = projectNameSchema.safeParse(input);

        if (zodOutput.error) {
          return zodOutput.error.format()._errors.join(', ');
        }

        return true;
      },
    },
    {
      name: 'description',
      type: 'input',
      message: "What's the workspace description?",
    },
    {
      name: 'preset',
      type: 'list',
      message: 'Choose project preset',
      choices: projectPresets,
    },
    {
      name: 'presetNextRouterPreset',
      type: 'list',
      message: 'Select router type',
      when: ({ preset }) => preset === 'next',
      default: Object.values(presetNextRouterChoices.enum['app-router']),
      choices: Object.values(presetNextRouterChoices.enum),
    },
    {
      name: 'selectedFeatures',
      type: 'checkbox',
      message: 'Select features',
      default: projectMetadataConfigFeatures,
      async choices(answers) {
        let result = [...projectMetadataConfigFeatures];

        if (await getWorkspace()) {
          // Prettier configuration is taken from workspace
          result = result.filter((value) => value !== 'prettier');
        }

        if (answers.preset === 'next') {
          return result;
        }

        // Disable option for testing-e2e outside of next preset
        return result.filter((value) => value !== 'testing-e2e');
      },
    },
    {
      name: 'projectLocationInWorkspace',
      type: 'list',
      message: 'What will be the project location inside current workspace?',
      when: enabledWhenInWorkspace,
      async choices(answers) {
        const workspaces = await (await getWorkspace())?.getProjectsPathsRaw();

        return (
          workspaces?.map((workspacePath) =>
            path.join(
              workspacePath.replace('/*', ''),
              getProjectFolderNameFromProjectName(answers.name),
            ),
          ) ?? []
        );
      },
    },
  ],
  async handler() {
    const { cwd } = getProgramOptions();
    const {
      projectLocationInWorkspace,
      name,
      description,
      preset,
      presetNextRouterPreset,
      selectedFeatures,
    } = this.getAnswers();

    const projectPath = projectLocationInWorkspace
      ? path.join((await getWorkspace())!.getRoot(), projectLocationInWorkspace)
      : path.join(cwd, name.replace('@', '').replace('/', '-'));

    FileSystem.writeJson(path.join(projectPath, 'package.json'), {
      name,
      description,
      ...getPackageJsonDefaults(),
      ...(preset !== 'next' && { private: true }),
    } satisfies z.input<typeof packageJsonSchema>);

    const newProject = await Project.loadAt(projectPath);
    const features = Object.fromEntries(
      projectMetadataConfigFeatures.map((key) => [key, selectedFeatures.includes(key)]),
    ) as { [key in (typeof projectMetadataConfigFeatures)[number]]: boolean };

    projectMetadata.writeForProject(newProject, {
      config:
        preset === 'next'
          ? {
              preset,
              routerPreset: presetNextRouterPreset!,
              features,
            }
          : {
              preset,
              features,
            },
    });

    getProgramOptions().cwd = projectPath;

    // Create initial files on create
    this.bindTemplatesLayer(`+preset-${preset}`, { renderTo: projectPath });
    if (preset === 'next') {
      this.bindTemplatesLayer(`+preset-next/+preset-${presetNextRouterPreset}`, {
        renderTo: projectPath,
      });
    }

    await projectUpdateCommand.execute();
  },
});
