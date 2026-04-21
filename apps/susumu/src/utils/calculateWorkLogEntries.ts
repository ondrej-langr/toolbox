import dayjs, { Dayjs } from 'dayjs';

import { contexts } from '../constants';

import type { WorkLog } from './getAllWorkLogs';
import { isWorkLogBreak } from './isWorkLogBreak';

export const calculateWorkLogEntries = (logs: WorkLog[]) => {
  const timeForContext = Object.fromEntries(
    contexts.map((item) => [item, 0] as const),
  ) as Record<(typeof contexts)[number], number>;

  const contextRangeStarts = Object.fromEntries(
    contexts.map((item) => [item, null] as const),
  ) as Record<(typeof contexts)[number], null | Dayjs>;

  logs.forEach((log, index, items) => {
    const previous = items[index - 1];
    const logHasContext =
      contextRangeStarts[log.context] !== null;

    if (!logHasContext) {
      contextRangeStarts[log.context] = log.at;
    }

    // End previous if it has a different context
    if (
      previous &&
      previous.context !== log.context &&
      !isWorkLogBreak(previous)
    ) {
      timeForContext[previous.context] += Math.abs(
        dayjs(previous.at).diff(log.at, 'second'),
      );
      contextRangeStarts[previous.context] = null;

      return;
    }

    // "Volno" ends all the context ranges
    if (isWorkLogBreak(log)) {
      for (const context of contexts) {
        if (contextRangeStarts[context] !== null) {
          timeForContext[context] += Math.abs(
            dayjs(contextRangeStarts[context]).diff(
              log.at,
              'second',
            ),
          );

          contextRangeStarts[context] = null;
        }
      }

      return;
    }

    // calculate time for the current context comparing with the previous log
    if (
      previous &&
      previous.context === log.context &&
      !isWorkLogBreak(log) &&
      !isWorkLogBreak(previous)
    ) {
      timeForContext[log.context] += Math.abs(
        dayjs(previous.at).diff(log.at, 'second'),
      );
      contextRangeStarts[log.context] = log.at;

      return;
    }
  });

  return Object.fromEntries(
    Object.entries(timeForContext).map(([context, time]) => [
      context,
      Math.ceil(time / 60),
    ]),
  );
};
