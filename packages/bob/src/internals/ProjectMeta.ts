import path from 'node:path';
import type { z } from 'zod';
import { FileSystem } from '~/FileSystem.js';
import { Project } from '~/Project.js';

type ProjectMetaValueSchema = z.ZodObject<{
  config:
    | z.ZodDiscriminatedUnion<string, any>
    | z.ZodNull
    | z.ZodObject<{ [x: string]: z.ZodType<z.Scalars> }>;
}>;

function createSnapshotPath(root: string) {
  return path.join(root, '.bob', 'snapshot.json');
}

async function loadSnapshot(root: string) {
  const snapshotPath = createSnapshotPath(root);

  return FileSystem.readFile(snapshotPath);
}

export function defineProjectMeta<
  S extends ProjectMetaValueSchema,
  V extends z.output<S>,
>(schema: S) {
  return {
    writeForProject(project: Project, metadata: V) {
      const snapshotPath = createSnapshotPath(project.getRoot());

      FileSystem.writeJson(snapshotPath, metadata);
    },
    async getForProject(project: Project, initialState?: V) {
      const { writeForProject } = this;
      const rawMetadata = await loadSnapshot(project.getRoot());
      const metadata = schema.parse(rawMetadata ?? initialState);

      return {
        save() {
          writeForProject(project, metadata as V);

          return this;
        },
        setConfig(config: NonNullable<V['config']>) {
          metadata.config = config;
          this.save();

          return this;
        },
        getConfig(): NonNullable<V['config']> {
          return metadata.config;
        },
      };
    },
  };
}
