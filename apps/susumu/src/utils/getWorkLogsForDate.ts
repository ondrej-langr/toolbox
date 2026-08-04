import { DateIso, sqliteTrue } from '@evolu/common';
import type { Dayjs } from 'dayjs';

import { evolu } from '../evolu';

export const getWorkLogsForDate = (date: Dayjs) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .leftJoin('project', 'project.id', 'workLog.projectId')
      .selectAll('workLog')
      .select('project.name as projectName')
      .where(
        'workLog.at',
        '>=',
        DateIso.orThrow(date.startOf('day').toISOString()),
      )
      .where(
        'workLog.at',
        '<=',
        DateIso.orThrow(date.endOf('day').toISOString()),
      )
      .where('workLog.isDeleted', 'is not', sqliteTrue)
      .orderBy('workLog.at', 'asc'),
  );
