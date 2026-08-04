import { sqliteTrue } from '@evolu/common';

import { evolu } from '../evolu';
import type { ProjectId } from '../schema';

export interface Project {
  id: ProjectId;
  name: string;
}

export const getProjects = () =>
  evolu.createQuery((db) =>
    db
      .selectFrom('project')
      .selectAll()
      .where('isDeleted', 'is not', sqliteTrue)
      .orderBy('createdAt', 'asc'),
  );
