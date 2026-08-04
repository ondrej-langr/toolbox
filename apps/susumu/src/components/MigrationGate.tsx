import {
  Box,
  Button,
  Callout,
  Card,
  DataList,
  Flex,
  Popover,
  Text,
} from '@radix-ui/themes';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useEvolu } from '../hooks/useEvolu';
import { getFirstPendingWorkLogMigration } from '../migrations/workLogMigrations';
import type { WorkLog } from '../utils/getAllWorkLogs';
import type { Project } from '../utils/getProjects';

export const MigrationGate = ({
  workLogs,
  projects,
  children,
}: {
  workLogs: readonly WorkLog[];
  projects: readonly Project[];
  children: ReactNode;
}) => {
  const evolu = useEvolu();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<
    string | null
  >(null);
  const pendingMigration = useMemo(
    () =>
      getFirstPendingWorkLogMigration({
        workLogs,
        projects,
      }),
    [projects, workLogs],
  );

  useEffect(() => {
    if (!pendingMigration) {
      setIsMigrating(false);
      setMigrationError(null);
    }
  }, [pendingMigration]);

  if (!pendingMigration) {
    return children;
  }

  return (
    <Box className="relative">
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none select-none opacity-60"
        style={{ filter: 'blur(10px)' }}
      >
        {children}
      </div>
      <Flex
        align="center"
        justify="center"
        className="fixed inset-0 z-20 px-4 py-8"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgb(15 23 42 / 0.18)',
        }}
      >
        <Card
          size="4"
          style={{ width: '100%', maxWidth: '560px' }}
        >
          <Flex direction="column" gap="4">
            <Box>
              <Text as="div" size="5" weight="bold">
                Data migration required
              </Text>
              <Text as="div" color="gray" mt="2">
                Susumu found worklogs created before project
                support. Migrate them before continuing.
              </Text>
            </Box>

            <DataList.Root size="1">
              <DataList.Item>
                <DataList.Label>From</DataList.Label>
                <DataList.Value>
                  {pendingMigration.migration.fromVersion ??
                    'Legacy data'}
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label>To</DataList.Label>
                <DataList.Value>
                  {pendingMigration.migration.toVersion}
                </DataList.Value>
              </DataList.Item>
              <Popover.Root>
                <DataList.Item>
                  <DataList.Label>
                    <Popover.Trigger>
                      <button
                        type="button"
                        className="cursor-pointer underline underline-offset-2"
                      >
                        Affected entries
                      </button>
                    </Popover.Trigger>
                  </DataList.Label>
                  <DataList.Value>
                    {pendingMigration.pendingWorkLogs.length}
                  </DataList.Value>
                </DataList.Item>
                <Popover.Content align="start">
                  <Box asChild>
                    <ul className="space-y-2">
                      {pendingMigration.pendingWorkLogs.map(
                        (workLog) => (
                          <li key={workLog.id}>
                            <Flex
                              justify="between"
                              align="center"
                              gap="3"
                            >
                              <Text>{workLog.name}</Text>
                              <Text size="1" color="gray">
                                {dayjs(workLog.at).format(
                                  'DD.MM.YYYY HH:mm',
                                )}
                              </Text>
                            </Flex>
                          </li>
                        ),
                      )}
                    </ul>
                  </Box>
                </Popover.Content>
              </Popover.Root>
            </DataList.Root>

            <Box asChild>
              <ul className="ml-5 list-disc">
                {pendingMigration.migration.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Box>

            {migrationError && (
              <Callout.Root color="red" variant="soft">
                <Callout.Text>{migrationError}</Callout.Text>
              </Callout.Root>
            )}

            <Button
              disabled={isMigrating}
              onClick={() => {
                setIsMigrating(true);
                setMigrationError(null);

                for (const projectUpsert of pendingMigration.projectUpserts) {
                  const result = evolu.upsert(
                    'project',
                    projectUpsert,
                  );

                  if (!result.ok) {
                    setMigrationError(String(result.error));
                    setIsMigrating(false);
                    return;
                  }
                }

                for (const workLogUpdate of pendingMigration.workLogUpdates) {
                  const result = evolu.update(
                    'workLog',
                    workLogUpdate,
                  );

                  if (!result.ok) {
                    setMigrationError(String(result.error));
                    setIsMigrating(false);
                    return;
                  }
                }
              }}
            >
              Migrate entries
            </Button>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};
