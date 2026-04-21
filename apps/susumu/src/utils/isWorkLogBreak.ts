import type { WorkLog } from './getAllWorkLogs';

export const isWorkLogBreak = (log: WorkLog) =>
  // This is for legacy data that doesn't have isPeriodBreak field
  log.name.toLowerCase() === 'volno' ||
  // New schema supports breaks
  log.type === 'break';
