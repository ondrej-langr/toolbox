import * as Evolu from '@evolu/common';

const WorkLogId = Evolu.id('WorkLog');
export type WorkLogId = typeof WorkLogId.Type;

const WorkLogType = Evolu.union('work', 'break');
export type WorkLogType = typeof WorkLogType.Type;

export const Schema = {
  workLog: {
    id: WorkLogId,
    context: Evolu.String100,
    name: Evolu.NonEmptyString1000,
    at: Evolu.DateIso,
    type: Evolu.nullOr(WorkLogType),
  },
} satisfies Evolu.EvoluSchema;
