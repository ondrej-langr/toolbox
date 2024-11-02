import path from 'path';
import { FileSystem } from '~/FileSystem.js';
import { workspaceMetadata } from '~/metadata-types/workspaceMetadata.js';

import { Command } from '../../Command.js';
import { Workspace } from '../../Workspace.js';
import { getProgramOptions } from '../../program.js';

export default Command.define({
  description: 'Update workspace',
  questions: [],
  async handler() {
    const { cwd } = getProgramOptions();
    const workspace = await Workspace.loadNearest(cwd);

    if (!workspace) {
      throw new Error(`No workspace has been found on ${cwd} or anywhere up in the file system`);
    }

    this.bindTemplatesLayer('/', {
      renderTo: workspace.getRoot(),
    });

    const workspaceMeta = await workspaceMetadata.getForProject(workspace);
    const workspaceConfig = workspaceMeta.getConfig();

    for (const [featureName, enabled] of Object.entries(workspaceConfig.features)) {
      if (!enabled) {
        continue;
      }

      const featureTemplateFolderName = `+feature-${featureName}`;
      const rootFeatureTemplatesPath = path.join(this.options.templatesRoot!, featureTemplateFolderName);

      if (FileSystem.cacheless.existsSync(rootFeatureTemplatesPath)) {
        this.bindTemplatesLayer(featureTemplateFolderName, { renderTo: workspace.getRoot() });
      }
    }
  },
});
