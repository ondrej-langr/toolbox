import { sqliteTrue } from '@evolu/common';

import { evolu } from '../evolu';

export type WorkLog = ReturnType<typeof getAllWorkLogs>['Row'];

export const getAllWorkLogs = () =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .selectAll()
      .where('isDeleted', 'is not', sqliteTrue)
      .orderBy('at', 'asc'),
  );
