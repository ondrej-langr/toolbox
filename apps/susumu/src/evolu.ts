import {
  createEvolu,
  DateIso,
  SimpleName,
  sqliteTrue,
} from '@evolu/common';
import { evoluReactWebDeps } from '@evolu/react-web';
import { Dayjs } from 'dayjs';

import { Schema } from './schema';

export const evolu = createEvolu(evoluReactWebDeps)(Schema, {
  name: SimpleName.orThrow('susumu'),
  transports: [
    {
      type: 'WebSocket',
      url: 'wss://sync.susumu.ondrejlangr.cz',
    },
  ],
});

export const getLogsForDate = (date: Dayjs) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .selectAll()
      .where(
        'createdAt',
        '>=',
        DateIso.orThrow(date.startOf('day').toISOString()),
      )
      .where(
        'createdAt',
        '<=',
        DateIso.orThrow(date.endOf('day').toISOString()),
      )
      .where('isDeleted', 'is not', sqliteTrue)
      .orderBy('createdAt', 'asc'),
  );

export const getLogsForMonth = (date: Dayjs) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('workLog')
      .selectAll()
      .where(
        'createdAt',
        '>=',
        DateIso.orThrow(date.startOf('month').toISOString()),
      )
      .where(
        'createdAt',
        '<=',
        DateIso.orThrow(date.endOf('month').toISOString()),
      )
      .where('isDeleted', 'is not', sqliteTrue)
      .orderBy('createdAt', 'asc'),
  );
