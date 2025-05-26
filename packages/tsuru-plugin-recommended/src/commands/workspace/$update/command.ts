import path from 'node:path';
import {
  defineCommand,
  defineTemplatesLayer,
  FileSystem,
  Workspace,
} from 'tsuru';
import { PROJECT_METADATA_WORKSPACE_NAMESPACE } from '~/constants.js';
import { workspaceMetadataSchema } from '~/workspaceMetadataSchema.js';

import updateProjectCommand from '../../project/$update/command.js';

export default defineCommand({
  description: 'Update workspace',
  async handler() {
    const program = this.getProgram();
    const options = await program.getOptions();
    const { cwd } = options;
    const workspaceOrProject = await program.getProject();

    if (
      !workspaceOrProject ||
      (workspaceOrProject instanceof Workspace === false &&
        (await Workspace.loadNearest(
          workspaceOrProject.getRoot(),
        )) === null)
    ) {
      throw new Error(
        `No workspace has been found on ${cwd} or anywhere up in the file system`,
      );
    }
    const workspace =
      workspaceOrProject instanceof Workspace
        ? workspaceOrProject
        : (await Workspace.loadNearest(
            workspaceOrProject.getRoot(),
          ))!;

    const definedMetadata = await workspace
      .getMetadataNamespace(
        PROJECT_METADATA_WORKSPACE_NAMESPACE,
        workspaceMetadataSchema,
      )
      .get();

    await defineTemplatesLayer('templates').renderTemplates(
      workspace.getRoot(),
    );

    // const metadata = await this.getMetadata();
    for (const [featureName, enabled] of Object.entries(
      definedMetadata.config.features,
    )) {
      if (!enabled) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const featureTemplateFolderName = `+feature-${featureName}`;
      const rootFeatureTemplatesPath = path.join(
        this.options.templatesRoot!,
        featureTemplateFolderName,
      );

      if (
        FileSystem.cacheless.existsSync(rootFeatureTemplatesPath)
      ) {
        await defineTemplatesLayer(
          `templates/${featureTemplateFolderName}`,
        ).renderTemplates(workspace.getRoot());
      }
    }

    const projects = await workspace.getProjects();

    for (const project of projects) {
      program.setCwd(project.getRoot());
      await updateProjectCommand.execute();
    }
  },
});
