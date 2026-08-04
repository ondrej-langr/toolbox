import * as Evolu from '@evolu/common';
import { describe, expect, it } from 'vitest';

import { APP_VERSION } from '../appVersion';
import {
  getFirstPendingWorkLogMigration,
} from './workLogMigrations';

const createWorkLogId = (value: string) =>
  Evolu.createIdFromString<'WorkLog'>(value);
const createProjectId = (value: string) =>
  Evolu.createIdFromString<'Project'>(value);

describe('getFirstPendingWorkLogMigration', () => {
  it('collapses repeated legacy contexts into one deterministic project', () => {
    const projectId = createProjectId('susumu-project:client a');
    const pendingMigration = getFirstPendingWorkLogMigration({
      projects: [],
      workLogs: [
        {
          id: createWorkLogId('work-log-1'),
          context: 'Client A',
          projectId: null,
          projectName: null,
          appVersion: null,
          name: 'Kickoff',
          at: '2026-08-04T09:00:00.000Z',
          type: null,
        },
        {
          id: createWorkLogId('work-log-2'),
          context: 'Client A',
          projectId: null,
          projectName: null,
          appVersion: null,
          name: 'Review',
          at: '2026-08-04T10:00:00.000Z',
          type: null,
        },
      ],
    });

    expect(pendingMigration).not.toBeNull();
    expect(pendingMigration?.projectUpserts).toStrictEqual([
      { id: projectId, name: 'Client A' },
    ]);
    expect(pendingMigration?.workLogUpdates).toStrictEqual([
      {
        id: createWorkLogId('work-log-1'),
        projectId,
        appVersion: APP_VERSION,
        context: null,
      },
      {
        id: createWorkLogId('work-log-2'),
        projectId,
        appVersion: APP_VERSION,
        context: null,
      },
    ]);
  });

  it('does not overwrite an already renamed project on rerun', () => {
    const projectId = createProjectId('susumu-project:client a');
    const pendingMigration = getFirstPendingWorkLogMigration({
      projects: [{ id: projectId, name: 'Acme' }],
      workLogs: [
        {
          id: createWorkLogId('work-log-3'),
          context: 'Client A',
          projectId: null,
          projectName: null,
          appVersion: null,
          name: 'Standup',
          at: '2026-08-04T11:00:00.000Z',
          type: null,
        },
      ],
    });

    expect(pendingMigration).not.toBeNull();
    expect(pendingMigration?.projectUpserts).toStrictEqual([]);
    expect(pendingMigration?.workLogUpdates).toStrictEqual([
      {
        id: createWorkLogId('work-log-3'),
        projectId,
        appVersion: APP_VERSION,
        context: null,
      },
    ]);
  });

  it('normalizes legacy break rows', () => {
    const pendingMigration = getFirstPendingWorkLogMigration({
      projects: [],
      workLogs: [
        {
          id: createWorkLogId('work-log-break'),
          context: 'Legacy context',
          projectId: null,
          projectName: null,
          appVersion: null,
          name: 'Volno',
          at: '2026-08-04T12:00:00.000Z',
          type: null,
        },
      ],
    });

    expect(pendingMigration).not.toBeNull();
    expect(pendingMigration?.projectUpserts).toStrictEqual([]);
    expect(pendingMigration?.workLogUpdates).toStrictEqual([
      {
        id: createWorkLogId('work-log-break'),
        projectId: null,
        type: 'break',
        name: 'Break',
        appVersion: APP_VERSION,
        context: null,
      },
    ]);
  });
});
