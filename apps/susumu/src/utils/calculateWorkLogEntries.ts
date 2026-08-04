import dayjs from 'dayjs';

import type { ProjectId } from '../schema';

import type { WorkLog } from './getAllWorkLogs';
import { isWorkLogBreak } from './isWorkLogBreak';

interface ProjectDuration {
  projectId: ProjectId;
  projectName: string;
  seconds: number;
}

export interface ProjectWorkLogEntry {
  projectId: ProjectId;
  projectName: string;
  minutes: number;
}

export const calculateWorkLogEntries = (logs: WorkLog[]) => {
  const durationByProject = new Map<ProjectId, ProjectDuration>();

  logs.forEach((log, index, items) => {
    const previousLog = items[index - 1];

    if (!previousLog || isWorkLogBreak(previousLog)) {
      return;
    }

    if (!previousLog.projectId) {
      return;
    }

    const projectName =
      previousLog.projectName ??
      previousLog.context ??
      'Unknown project';
    const seconds = Math.abs(
      dayjs(previousLog.at).diff(log.at, 'second'),
    );
    const currentDuration = durationByProject.get(
      previousLog.projectId,
    );

    if (currentDuration) {
      currentDuration.seconds += seconds;
      return;
    }

    durationByProject.set(previousLog.projectId, {
      projectId: previousLog.projectId,
      projectName,
      seconds,
    });
  });

  return Array.from(durationByProject.values())
    .map(({ seconds, ...projectDuration }) => ({
      ...projectDuration,
      minutes: Math.ceil(seconds / 60),
    }))
    .filter((projectEntry) => projectEntry.minutes > 0)
    .sort(
      (left, right) =>
        right.minutes - left.minutes ||
        left.projectName.localeCompare(right.projectName),
    );
};
