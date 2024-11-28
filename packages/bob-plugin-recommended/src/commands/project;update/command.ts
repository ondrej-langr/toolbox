import {
  defineCommand,
  defineTemplatesLayer,
  FileSystem,
  Project,
  Workspace,
} from '@ondrej-langr/bob';
import path from 'node:path';
import { PROJECT_METADATA_PROJECT_NAMESPACE } from '~/constants.js';
import { projectMetadataSchema } from '~/projectMetadataSchema.js';

export default defineCommand<{
  projectLocationInWorkspace?: string;
}>({
  description: 'Update project',
  questions() {
    const program = this.getProgram();

    return [
      {
        name: 'projectLocationInWorkspace',
        type: 'list',
        message:
          'What project should be updated in current workspace?',
        async when() {
          const closestProjectOrWorkspace =
            await program.getProject();

          return (
            !!closestProjectOrWorkspace &&
            closestProjectOrWorkspace instanceof Workspace
          );
        },
        async choices() {
          const workspace = await program.getProject();
          if (
            !workspace ||
            workspace instanceof Workspace === false
          ) {
            throw new Error(
              'Cannot show choices when project is not workspace. This is a bug of @ondrej-langr/bob',
            );
          }

          const workspaceProjects =
            await workspace.getProjects();

          if (!workspaceProjects?.length) {
            throw new Error('Workspace has no projects');
          }

          return workspaceProjects.map((project) =>
            project.getRoot().replace(workspace.getRoot(), ''),
          );
        },
      },
    ];
  },
  async handler() {
    const program = this.getProgram();
    const options = await program.getOptions();
    const closestProjectOrWorkspace = await program.getProject();
    const { cwd } = options;

    if (!closestProjectOrWorkspace) {
      throw new Error(
        `No workspace or project has been found on ${cwd} or anywhere up in the file system`,
      );
    }

    const answers = this.getAnswers();
    const renderTo = answers.projectLocationInWorkspace
      ? path.join(
          closestProjectOrWorkspace.getRoot(),
          answers.projectLocationInWorkspace,
        )
      : closestProjectOrWorkspace.getRoot();

    const project = answers.projectLocationInWorkspace
      ? await Project.loadAt(renderTo)
      : (closestProjectOrWorkspace as Project);

    const projectMeta = await project
      .getMetadataNamespace(
        PROJECT_METADATA_PROJECT_NAMESPACE,
        projectMetadataSchema,
      )
      .get();

    const presetTemplateFolderName = `+preset-${projectMeta.config.preset}`;

    this.addTemplatesLayer(defineTemplatesLayer('templates'), {
      renderTo,
    });

    this.addTemplatesLayer(
      defineTemplatesLayer(presetTemplateFolderName),
      { renderTo },
    );

    if (
      projectMeta.config.preset === 'next' &&
      projectMeta.config.features['testing-e2e']
    ) {
      this.addTemplatesLayer(
        defineTemplatesLayer(
          `templates/${presetTemplateFolderName}/+feature-testing-e2e`,
        ),
        { renderTo },
      );
    }

    for (const [featureName, enabled] of Object.entries(
      projectMeta.config.features,
    )) {
      if (!enabled) {
        continue;
      }

      const featureTemplateFolderName = `+feature-${featureName}`;
      const rootFeatureTemplatesPath = path.join(
        this.options.templatesRoot!,
        featureTemplateFolderName,
      );
      const presetFeatureTemplatesPath = path.join(
        this.options.templatesRoot!,
        presetTemplateFolderName,
        featureTemplateFolderName,
      );

      if (
        FileSystem.cacheless.existsSync(rootFeatureTemplatesPath)
      ) {
        this.addTemplatesLayer(
          defineTemplatesLayer(featureTemplateFolderName),
          { renderTo },
        );
      }

      if (
        FileSystem.cacheless.existsSync(
          presetFeatureTemplatesPath,
        )
      ) {
        this.addTemplatesLayer(
          defineTemplatesLayer(
            `templates/${presetTemplateFolderName}/${featureTemplateFolderName}`,
          ),
          { renderTo },
        );
      }
    }
  },
});
