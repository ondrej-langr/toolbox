import { DateIso, sqliteTrue } from '@evolu/common';
import type { Dayjs } from 'dayjs';

import { evolu } from '../evolu';

export const getWorkLogsForDate = (date: Dayjs) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .selectAll()
      .where(
        'at',
        '>=',
        DateIso.orThrow(date.startOf('day').toISOString()),
      )
      .where(
        'at',
        '<=',
        DateIso.orThrow(date.endOf('day').toISOString()),
      )
      .where('isDeleted', 'is not', sqliteTrue)
      .orderBy('at', 'asc'),
  );
