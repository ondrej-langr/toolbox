import { sqliteTrue } from '@evolu/common';

import { evolu } from '../evolu';
import type {
  ProjectId,
  WorkLogId,
  WorkLogType,
} from '../schema';

export interface WorkLog {
  id: WorkLogId;
  context: string | null;
  projectId: ProjectId | null;
  projectName: string | null;
  appVersion: string | null;
  name: string;
  at: string;
  type: WorkLogType | null;
}

export const getAllWorkLogs = () =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .leftJoin('project', 'project.id', 'workLog.projectId')
      .selectAll('workLog')
      .select('project.name as projectName')
      .where('workLog.isDeleted', 'is not', sqliteTrue)
      .orderBy('workLog.at', 'asc'),
  );
