import path from 'path';
import { FileSystem } from '~/FileSystem.js';
import { projectMetadata } from '~/metadata-types/projectMetadata.js';
import { log } from '~/utils/log.js';

import { Command } from '../../Command.js';
import { Project } from '../../Project.js';
import { Workspace } from '../../Workspace.js';
import { getProgramOptions } from '../../program.js';

let closestWorkspace: Workspace | null = null;
let closestProject: Project | null = null;

export default Command.define<{
  projectLocationInWorkspace?: string;
}>({
  description: 'Update project',
  questions: [
    {
      name: 'projectLocationInWorkspace',
      type: 'list',
      message: 'What project should be updated in current workspace?',
      async when() {
        const { cwd } = getProgramOptions();
        closestWorkspace ??= await Workspace.loadNearest(cwd);
        closestProject ??= await Project.loadNearest(cwd);

        if (closestWorkspace && closestProject && closestWorkspace?.getRoot() !== closestProject?.getRoot()) {
          log.debug('valid project', {
            work: closestWorkspace?.getRoot(),
            proj: closestProject?.getRoot(),
          });
          return false;
        }

        return !!closestWorkspace;
      },
      async choices() {
        const workspaceProjects = await closestWorkspace?.getProjects();

        if (!workspaceProjects?.length) {
          throw new Error('Workspace has no projects');
        }

        return workspaceProjects.map((project) => project.getRoot().replace(closestWorkspace!.getRoot(), ''));
      },
    },
  ],
  async handler() {
    const { cwd } = getProgramOptions();
    if (!closestProject && !closestWorkspace) {
      throw new Error(`No workspace or project has been found on ${cwd} or anywhere up in the file system`);
    }

    const answers = this.getAnswers();
    let renderTo = closestProject
      ? closestProject.getRoot()
      : path.join(closestWorkspace!.getRoot(), answers.projectLocationInWorkspace!);

    const project = closestProject || (await Project.loadAt(renderTo));
    const projectMeta = await projectMetadata.getForProject(project);
    const projectConfig = projectMeta.getConfig();

    const presetTemplateFolderName = `+preset-${projectConfig.preset}`;

    this.bindTemplatesLayer('/', { renderTo });
    this.bindTemplatesLayer(presetTemplateFolderName, { renderTo });

    if (projectConfig.preset === 'next' && projectConfig.features['testing-e2e']) {
      this.bindTemplatesLayer(`${presetTemplateFolderName}/+feature-testing-e2e`, { renderTo });
    }

    for (const [featureName, enabled] of Object.entries(projectConfig.features)) {
      if (!enabled) {
        continue;
      }

      const featureTemplateFolderName = `+feature-${featureName}`;
      const rootFeatureTemplatesPath = path.join(this.options.templatesRoot!, featureTemplateFolderName);
      const presetFeatureTemplatesPath = path.join(
        this.options.templatesRoot!,
        presetTemplateFolderName,
        featureTemplateFolderName,
      );

      if (FileSystem.cacheless.existsSync(rootFeatureTemplatesPath)) {
        this.bindTemplatesLayer(featureTemplateFolderName, { renderTo });
      }

      if (FileSystem.cacheless.existsSync(presetFeatureTemplatesPath)) {
        this.bindTemplatesLayer(`${presetTemplateFolderName}/${featureTemplateFolderName}`, { renderTo });
      }
    }
  },
});
