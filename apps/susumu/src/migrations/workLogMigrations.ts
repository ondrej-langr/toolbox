import * as Evolu from '@evolu/common';

import { APP_VERSION } from '../appVersion';
import type {
  ProjectId,
  WorkLogId,
  WorkLogType,
} from '../schema';
import type { WorkLog } from '../utils/getAllWorkLogs';
import type { Project } from '../utils/getProjects';
import { isWorkLogBreak } from '../utils/isWorkLogBreak';

export type PendingWorkLog = WorkLog;

export interface ProjectUpsert {
  id: ProjectId;
  name: string;
}

export interface WorkLogUpdate {
  id: WorkLogId;
  projectId?: ProjectId | null;
  appVersion: string | null;
  context: string | null;
  type?: WorkLogType | null;
  name?: string;
}

export interface WorkLogMigrationPlan {
  projectUpserts: readonly ProjectUpsert[];
  workLogUpdates: readonly WorkLogUpdate[];
}

export interface WorkLogMigration {
  id: string;
  fromVersion: string | null;
  toVersion: string;
  notes: readonly string[];
  matches: (row: PendingWorkLog) => boolean;
  plan: (args: {
    workLogs: readonly PendingWorkLog[];
    projects: readonly Project[];
  }) => WorkLogMigrationPlan;
}

export interface PendingWorkLogMigrationPlan {
  migration: WorkLogMigration;
  pendingWorkLogs: readonly PendingWorkLog[];
  projectUpserts: readonly ProjectUpsert[];
  workLogUpdates: readonly WorkLogUpdate[];
}

const legacyProjectsAndVersioningMigration: WorkLogMigration = {
  id: 'legacy-projects-and-versioning',
  fromVersion: null,
  toVersion: APP_VERSION,
  notes: [
    'Create editable project records from existing context labels.',
    'Attach each non-break worklog to a project.',
    'Stamp every migrated worklog with the current Susumu version and normalize break rows.',
  ],
  matches: (row) =>
    row.appVersion == null ||
    (!isWorkLogBreak(row) && row.projectId == null) ||
    (isWorkLogBreak(row) &&
      (row.type == null || row.name.toLowerCase() === 'volno')),
  plan: ({ workLogs, projects }) => {
    const knownProjectIds = new Set(projects.map((project) => project.id));
    const projectUpserts: ProjectUpsert[] = [];
    const workLogUpdates: WorkLogUpdate[] = [];

    for (const row of workLogs) {
      if (isWorkLogBreak(row)) {
        workLogUpdates.push({
          id: row.id,
          projectId: null,
          type: 'break',
          name: 'Break',
          appVersion: APP_VERSION,
          context: null,
        });
        continue;
      }

      const displayName = row.context?.trim() || 'Unknown project';
      const normalizedName = displayName.trim().toLowerCase();
      const projectId = Evolu.createIdFromString<'Project'>(
        `susumu-project:${normalizedName}`,
      );

      if (!knownProjectIds.has(projectId)) {
        projectUpserts.push({ id: projectId, name: displayName });
        knownProjectIds.add(projectId);
      }

      workLogUpdates.push({
        id: row.id,
        projectId,
        appVersion: APP_VERSION,
        context: null,
      });
    }

    return { projectUpserts, workLogUpdates };
  },
};

export const workLogMigrations: readonly WorkLogMigration[] = [
  legacyProjectsAndVersioningMigration,
];

export const getFirstPendingWorkLogMigration = (args: {
  workLogs: readonly PendingWorkLog[];
  projects: readonly Project[];
}): PendingWorkLogMigrationPlan | null => {
  for (const migration of workLogMigrations) {
    const pendingWorkLogs = args.workLogs.filter((row) =>
      migration.matches(row),
    );

    if (pendingWorkLogs.length === 0) {
      continue;
    }

    const plan = migration.plan({
      workLogs: pendingWorkLogs,
      projects: args.projects,
    });

    return {
      migration,
      pendingWorkLogs,
      projectUpserts: plan.projectUpserts,
      workLogUpdates: plan.workLogUpdates,
    };
  }

  return null;
};
