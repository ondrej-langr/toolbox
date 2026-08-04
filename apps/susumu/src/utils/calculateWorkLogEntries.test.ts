import * as Evolu from '@evolu/common';
import { describe, expect, it } from 'vitest';

import { calculateWorkLogEntries } from './calculateWorkLogEntries';

const createProjectId = (value: string) =>
  Evolu.createIdFromString<'Project'>(value);
const createWorkLogId = (value: string) =>
  Evolu.createIdFromString<'WorkLog'>(value);

describe('calculateWorkLogEntries', () => {
  it('closes active ranges when a break starts', () => {
    const alphaProjectId = createProjectId('project-alpha');

    expect(
      calculateWorkLogEntries([
        {
          id: createWorkLogId('work-log-1'),
          context: null,
          projectId: alphaProjectId,
          projectName: 'Alpha',
          appVersion: '0.8.1',
          name: 'Kickoff',
          at: '2026-08-04T09:00:00.000Z',
          type: null,
        },
        {
          id: createWorkLogId('work-log-2'),
          context: null,
          projectId: null,
          projectName: null,
          appVersion: '0.8.1',
          name: 'Break',
          at: '2026-08-04T09:30:00.000Z',
          type: 'break',
        },
        {
          id: createWorkLogId('work-log-3'),
          context: null,
          projectId: alphaProjectId,
          projectName: 'Alpha',
          appVersion: '0.8.1',
          name: 'Resume',
          at: '2026-08-04T09:45:00.000Z',
          type: null,
        },
        {
          id: createWorkLogId('work-log-4'),
          context: null,
          projectId: null,
          projectName: null,
          appVersion: '0.8.1',
          name: 'Break',
          at: '2026-08-04T10:00:00.000Z',
          type: 'break',
        },
      ]),
    ).toStrictEqual([
      {
        projectId: alphaProjectId,
        projectName: 'Alpha',
        minutes: 45,
      },
    ]);
  });

  it('does not emit zero-minute projects', () => {
    const alphaProjectId = createProjectId('project-alpha');
    const betaProjectId = createProjectId('project-beta');

    expect(
      calculateWorkLogEntries([
        {
          id: createWorkLogId('work-log-1'),
          context: null,
          projectId: alphaProjectId,
          projectName: 'Alpha',
          appVersion: '0.8.1',
          name: 'Kickoff',
          at: '2026-08-04T09:00:00.000Z',
          type: null,
        },
        {
          id: createWorkLogId('work-log-2'),
          context: null,
          projectId: null,
          projectName: null,
          appVersion: '0.8.1',
          name: 'Break',
          at: '2026-08-04T09:30:00.000Z',
          type: 'break',
        },
        {
          id: createWorkLogId('work-log-3'),
          context: null,
          projectId: betaProjectId,
          projectName: 'Beta',
          appVersion: '0.8.1',
          name: 'Planning',
          at: '2026-08-04T09:45:00.000Z',
          type: null,
        },
      ]),
    ).toStrictEqual([
      {
        projectId: alphaProjectId,
        projectName: 'Alpha',
        minutes: 30,
      },
    ]);
  });
});
