import { DateIso, sqliteTrue } from '@evolu/common';
import type { Dayjs } from 'dayjs';

import { evolu } from '../evolu';

export const getWorkLogsForMonth = (date: Dayjs) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .leftJoin('project', 'project.id', 'workLog.projectId')
      .selectAll('workLog')
      .select('project.name as projectName')
      .where(
        'workLog.at',
        '>=',
        DateIso.orThrow(date.startOf('month').toISOString()),
      )
      .where(
        'workLog.at',
        '<=',
        DateIso.orThrow(date.endOf('month').toISOString()),
      )
      .where('workLog.isDeleted', 'is not', sqliteTrue)
      .orderBy('workLog.at', 'asc'),
  );
