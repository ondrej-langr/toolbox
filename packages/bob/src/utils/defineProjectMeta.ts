/* eslint-disable @typescript-eslint/no-explicit-any -- ok for this cases */
import path from 'node:path';
import type { z } from 'zod';

import { FileSystem } from '../FileSystem.js';
import type { Project } from '../Project.js';

type ProjectMetaValueSchema = z.ZodObject<{
  config:
    | z.ZodDiscriminatedUnion<string, any>
    | z.ZodIntersection<any, any>
    | z.ZodNull
    | z.ZodObject<{
        [x: string]:
          | z.ZodObject<{ [x: string]: z.ZodType<z.Scalars> }>
          | z.ZodType<z.Scalars>;
      }>;
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
  V extends z.output<S> = z.output<S>,
>(schema: S) {
  return {
    writeForProject(project: Project, metadata: V) {
      const snapshotPath = createSnapshotPath(project.getRoot());

      FileSystem.writeJson(snapshotPath, metadata);
    },
    async getForProject(project: Project, initialState?: V) {
      // eslint-disable-next-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias
      const that = this;
      const rawMetadata = await loadSnapshot(project.getRoot());
      const metadata = schema.parse(rawMetadata ? JSON.parse(rawMetadata) : initialState);

      return {
        save() {
          that.writeForProject(project, metadata as V);

          return this;
        },
        setConfig(config: NonNullable<V['config']>) {
          metadata.config = config;
          this.save();

          return this;
        },
        getConfig(): NonNullable<V['config']> {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- type is inherited from parameters
          return metadata.config;
        },
      };
    },
  };
}
