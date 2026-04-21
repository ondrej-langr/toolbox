import { DateIso, sqliteTrue } from '@evolu/common';
import type { Dayjs } from 'dayjs';

import { evolu } from '../evolu';

export const getWorkLogsForMonth = (date: Dayjs) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .selectAll()
      .where(
        'at',
        '>=',
        DateIso.orThrow(date.startOf('month').toISOString()),
      )
      .where(
        'at',
        '<=',
        DateIso.orThrow(date.endOf('month').toISOString()),
      )
      .where('isDeleted', 'is not', sqliteTrue)
      .orderBy('at', 'asc'),
  );
