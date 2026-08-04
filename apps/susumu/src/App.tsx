import * as Evolu from '@evolu/common';
import { useQuery } from '@evolu/react';
import {
  ClockIcon,
  InfoCircledIcon,
  MoonIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Container,
  DataList,
  Flex,
  IconButton,
  Popover,
  Select,
  Separator,
  Skeleton,
  Text,
  TextField,
} from '@radix-ui/themes';
import dayjs, { Dayjs } from 'dayjs';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { APP_VERSION } from './appVersion';
import { MigrationGate } from './components/MigrationGate';
import { Profile } from './components/Profile';
import { ProjectsDialog } from './components/ProjectsDialog';
import { TimeTrackerWidget } from './components/TimeTrackerWidget';
import { getProjectColor } from './constants';
import { useEvolu } from './hooks/useEvolu';
import type { ProjectId, WorkLogId } from './schema';
import { calculateWorkLogEntries } from './utils/calculateWorkLogEntries';
import { formatMinutes } from './utils/formatMinutes';
import { formatSeconds } from './utils/formatSeconds';
import type { WorkLog } from './utils/getAllWorkLogs';
import { getAllWorkLogs } from './utils/getAllWorkLogs';
import { getProjects } from './utils/getProjects';
import { getWorkLogsForDate } from './utils/getWorkLogsForDate';
import { getWorkLogsForMonth } from './utils/getWorkLogsForMonth';
import { isWorkLogBreak } from './utils/isWorkLogBreak';

const calculateEntries = (logs: WorkLog[]) => {
  const totals: Record<string, number> = {};

  logs.forEach((log, index) => {
    const previousLog = logs[index - 1];

    if (!previousLog || isWorkLogBreak(previousLog)) {
      return;
    }

    const diff = Math.floor(
      dayjs(log.at).diff(previousLog.at, 'second') / 60,
    );

    totals[previousLog.name] ??= 0;
    totals[previousLog.name] += diff;
  });

  return totals;
};

const WorkLogDurationBadge = ({
  startAt,
  endAt,
  isLive,
}: {
  startAt: string;
  endAt: string | null;
  isLive: boolean;
}) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(() =>
    dayjs(),
  );

  useEffect(() => {
    if (!isLive) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isLive]);

  if (!isLive && !endAt) {
    return null;
  }

  const seconds = Math.max(
    (endAt ? dayjs(endAt) : currentTime).diff(startAt, 'second'),
    0,
  );

  return (
    <Badge color="gray" variant="soft" radius="medium" size="3">
      {formatSeconds(seconds)}
    </Badge>
  );
};
const syncProjectName = (
  log: WorkLog,
  projectNamesById: ReadonlyMap<ProjectId, string>,
): WorkLog => {
  const projectName = log.projectId
    ? projectNamesById.get(log.projectId)
    : null;

  return projectName && projectName !== log.projectName
    ? { ...log, projectName }
    : log;
};

function App() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(() =>
    dayjs(),
  );
  const [selectedProjectId, setSelectedProjectId] =
    useState<ProjectId | null>(null);
  const evolu = useEvolu();
  const allWorkLogs = useQuery(getAllWorkLogs());
  const projects = useQuery(getProjects());
  const todayTimeLogs = useQuery(
    getWorkLogsForDate(currentDate),
  );
  const thisMonth = useQuery(getWorkLogsForMonth(currentDate));
  const nameInputRef = useRef<HTMLInputElement>(null);
  const currentDateIsToday = useMemo(
    () => currentDate.isSame(dayjs(), 'day'),
    [currentDate],
  );
  const currentDateIsThisMonth = useMemo(
    () => currentDate.isSame(dayjs(), 'month'),
    [currentDate],
  );
  const projectNamesById = useMemo(
    () =>
      new Map(
        projects.map(
          (project) => [project.id, project.name] as const,
        ),
      ),
    [projects],
  );
  const resolvedTodayTimeLogs = useMemo(
    () =>
      todayTimeLogs.map((log) =>
        syncProjectName(log, projectNamesById),
      ),
    [projectNamesById, todayTimeLogs],
  );
  const resolvedThisMonth = useMemo(
    () =>
      thisMonth.map((log) =>
        syncProjectName(log, projectNamesById),
      ),
    [projectNamesById, thisMonth],
  );

  useEffect(() => {
    if (projects.length === 0) {
      if (selectedProjectId !== null) {
        setSelectedProjectId(null);
      }

      return;
    }

    const selectedProjectStillExists = selectedProjectId
      ? projects.some(
          (project) => project.id === selectedProjectId,
        )
      : false;

    if (!selectedProjectStillExists) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const handleDeleteClick = (id: WorkLogId) => {
    evolu.update('workLog', {
      id,
      isDeleted: Evolu.sqliteTrue,
    });
  };

  const thisMonthForEachProject = calculateWorkLogEntries(
    resolvedThisMonth,
  );
  const todayForEachProject = calculateWorkLogEntries(
    resolvedTodayTimeLogs,
  );

  const takeBreak = useCallback(() => {
    evolu.insert('workLog', {
      projectId: null,
      context: null,
      name: 'Break',
      at: dayjs().toISOString(),
      type: 'break',
      appVersion: APP_VERSION,
    });
  }, [evolu]);

  useEffect(() => {
    const ctrlBListener = (event: KeyboardEvent) => {
      const lastItem = resolvedTodayTimeLogs.at(-1);

      if (
        event.ctrlKey &&
        event.key === 'b' &&
        lastItem &&
        !isWorkLogBreak(lastItem)
      ) {
        takeBreak();
      }
    };

    window.addEventListener('keydown', ctrlBListener);

    return () => {
      window.removeEventListener('keydown', ctrlBListener);
    };
  }, [resolvedTodayTimeLogs, takeBreak]);

  const lastItem = resolvedTodayTimeLogs.at(-1);

  return (
    <Container px="4" mt="2" mb="4">
      <Suspense
        fallback={<Skeleton width="200x" height="40px" />}
      >
        <Profile />
      </Suspense>
      <MigrationGate workLogs={allWorkLogs} projects={projects}>
        <Flex
          gap={{ initial: '6', sm: '4' }}
          mt="9"
          direction={{ initial: 'column', sm: 'row' }}
        >
          <Box flexGrow={'1'}>
            <Flex direction="column" gap="5">
              {resolvedTodayTimeLogs.length === 0 && (
                <Text>
                  {currentDateIsToday
                    ? 'No time logs for today. Start by adding one.'
                    : 'No time logs for chosen day.'}
                </Text>
              )}
              {resolvedTodayTimeLogs.map(
                (item, index, items) => {
                  const projectName =
                    item.projectName ??
                    item.context ??
                    'Unknown project';
                  const nextItem = items[index + 1];
                  const isLiveEntry =
                    currentDateIsToday &&
                    index === items.length - 1;

                  return (
                    <Flex
                      gapX="2"
                      justify={'between'}
                      align="center"
                      key={item.id}
                    >
                      {isWorkLogBreak(item) ? (
                        <Callout.Root
                          className="py-1.5! flex-1 rounded-sm!"
                          variant="surface"
                        >
                          <Callout.Icon>
                            <MoonIcon />
                          </Callout.Icon>
                          <Callout.Text>
                            {item.name}
                          </Callout.Text>
                        </Callout.Root>
                      ) : (
                        <Flex
                          direction="column"
                          flexGrow={'1'}
                          mt={'-2'}
                        >
                          <Text
                            size="1"
                            color="gray"
                            weight="bold"
                            className="text-[10px]! opacity-80"
                          >
                            <Badge
                              color={getProjectColor(
                                item.projectId,
                              )}
                              className="relative -top-0.5 mr-2"
                              variant="solid"
                            />
                            {projectName.toUpperCase()}
                          </Text>
                          <Text size="3">{item.name}</Text>
                        </Flex>
                      )}
                      <Flex gap="1" align="center">
                        <Popover.Root>
                          <Popover.Trigger>
                            <Badge
                              color="iris"
                              variant="outline"
                              radius="medium"
                              size={'3'}
                              className="py-1.5!"
                            >
                              {dayjs(item.at).format('HH:mm')}
                              <ClockIcon />
                            </Badge>
                          </Popover.Trigger>
                          <Popover.Content>
                            <form
                              onSubmit={(event) => {
                                event.preventDefault();

                                const formData = new FormData(
                                  event.currentTarget,
                                );
                                const time = formData
                                  .get('time')
                                  ?.toString();

                                if (!time) {
                                  return;
                                }

                                const [hour, minute] =
                                  time.split(':');
                                const newDate = dayjs(item.at)
                                  .set('hour', Number(hour))
                                  .set('minute', Number(minute));

                                evolu.update('workLog', {
                                  id: item.id,
                                  at: newDate.toISOString(),
                                });

                                document.dispatchEvent(
                                  new KeyboardEvent('keydown', {
                                    key: 'Escape',
                                    code: 'Escape',
                                    bubbles: true,
                                  }),
                                );
                              }}
                            >
                              <Flex gap="2">
                                <TextField.Root
                                  type="time"
                                  name="time"
                                  defaultValue={dayjs(
                                    item.at,
                                  ).format('HH:mm')}
                                />
                                <Button type="submit">
                                  Submit
                                </Button>
                              </Flex>
                            </form>
                          </Popover.Content>
                        </Popover.Root>
                        <WorkLogDurationBadge
                          startAt={item.at}
                          endAt={nextItem?.at ?? null}
                          isLive={isLiveEntry}
                        />
                      </Flex>
                      <IconButton
                        color="red"
                        size="2"
                        onClick={() =>
                          handleDeleteClick(item.id)
                        }
                      >
                        <TrashIcon width="20" height="20" />
                      </IconButton>
                    </Flex>
                  );
                },
              )}
            </Flex>
            <Separator
              orientation="horizontal"
              my={'4'}
              size="4"
            />
            {projects.length === 0 ? (
              <Callout.Root color="orange" variant="soft">
                <Flex direction="column" gap="3" align="start">
                  <Callout.Text>
                    Create a project before adding worklogs.
                  </Callout.Text>
                  <ProjectsDialog
                    projects={projects}
                    trigger={
                      <Button color="orange" variant="solid">
                        Create project
                      </Button>
                    }
                  />
                </Flex>
              </Callout.Root>
            ) : (
              currentDateIsToday && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();

                    if (!selectedProjectId) {
                      return;
                    }

                    const formData = new FormData(
                      event.currentTarget,
                    );
                    const name =
                      formData.get('name')?.toString() ?? '';
                    const result = evolu.insert('workLog', {
                      projectId: selectedProjectId,
                      context: null,
                      name,
                      at: dayjs().toISOString(),
                      appVersion: APP_VERSION,
                    });

                    if (result.ok && nameInputRef.current) {
                      nameInputRef.current.value = '';
                    }
                  }}
                >
                  <Flex gap="2">
                    <Select.Root
                      name="projectId"
                      value={selectedProjectId ?? undefined}
                      onValueChange={(value) => {
                        setSelectedProjectId(value as ProjectId);
                      }}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {projects.map((project) => (
                          <Select.Item
                            value={project.id}
                            key={project.id}
                          >
                            {project.name.toUpperCase()}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    <ProjectsDialog
                      projects={projects}
                      trigger={
                        <Button type="button" variant="soft">
                          Projects
                        </Button>
                      }
                    />
                    <TextField.Root
                      ref={nameInputRef}
                      name="name"
                      placeholder="Name of the action"
                      style={{
                        width: '100%',
                      }}
                    />
                  </Flex>
                </form>
              )
            )}
          </Box>
          <Box
            width="100%"
            maxWidth={{ sm: '300px', initial: '100%' }}
          >
            <Card>
              <Text size="2" weight="bold">
                Selected date:{' '}
                {currentDateIsToday
                  ? 'Today'
                  : currentDate.format('DD.MM. YYYY')}
              </Text>

              <Flex gap="2" justify="between" mt="4">
                <Button
                  variant="classic"
                  size={'1'}
                  onClick={() =>
                    setCurrentDate((dateOrToday) =>
                      (currentDateIsToday
                        ? dayjs()
                        : dateOrToday
                      ).subtract(1, 'day'),
                    )
                  }
                >
                  Previous
                </Button>

                <Button
                  variant="classic"
                  onClick={() => setCurrentDate(dayjs())}
                  disabled={currentDateIsToday}
                  size={'1'}
                >
                  Today
                </Button>

                <Button
                  variant="classic"
                  size={'1'}
                  disabled={currentDateIsToday}
                  onClick={() =>
                    setCurrentDate((dateOrToday) =>
                      (currentDateIsToday
                        ? dayjs()
                        : dateOrToday
                      ).add(1, 'day'),
                    )
                  }
                >
                  Next
                </Button>
              </Flex>
            </Card>

            <Separator
              orientation="horizontal"
              my={'4'}
              style={{
                width: '100%',
              }}
            />

            {projects.length > 0 &&
              lastItem &&
              currentDateIsToday && (
                <>
                  <TimeTrackerWidget
                    lastItem={lastItem}
                    takeBreak={takeBreak}
                  />

                  <Separator
                    orientation="horizontal"
                    my={'4'}
                    style={{
                      width: '100%',
                    }}
                  />
                </>
              )}

            <Card>
              <DataList.Root>
                {todayForEachProject.map(
                  ({ projectId, projectName, minutes }) => {
                    const projectItems =
                      resolvedTodayTimeLogs.filter(
                        (log) =>
                          log.projectId === projectId ||
                          isWorkLogBreak(log),
                      );
                    const collectedEntries =
                      calculateEntries(projectItems);
                    const collectedEntriesAsEntries =
                      Object.entries(collectedEntries);

                    return (
                      <DataList.Item
                        align="center"
                        key={projectId}
                      >
                        <DataList.Label minWidth="88px">
                          {currentDateIsToday
                            ? 'Today'
                            : 'Current date'}{' '}
                          {projectName.toUpperCase()}
                        </DataList.Label>
                        <DataList.Value className="justify-end items-center">
                          {collectedEntriesAsEntries.length >
                            0 && (
                            <Popover.Root>
                              <Popover.Trigger>
                                <IconButton
                                  size="1"
                                  variant="ghost"
                                  mr="2"
                                >
                                  <InfoCircledIcon fontSize="14px" />
                                </IconButton>
                              </Popover.Trigger>
                              <Popover.Content>
                                <DataList.Root>
                                  {collectedEntriesAsEntries.map(
                                    ([name, total]) => (
                                      <DataList.Item key={name}>
                                        <DataList.Label>
                                          {name}
                                        </DataList.Label>
                                        <DataList.Value>
                                          {formatMinutes(
                                            total,
                                          ) || '0min'}
                                        </DataList.Value>
                                      </DataList.Item>
                                    ),
                                  )}
                                </DataList.Root>
                              </Popover.Content>
                            </Popover.Root>
                          )}
                          <Badge
                            color={getProjectColor(projectId)}
                            variant="solid"
                            radius="full"
                            size={'3'}
                          >
                            {formatMinutes(minutes)}
                          </Badge>
                        </DataList.Value>
                      </DataList.Item>
                    );
                  },
                )}
              </DataList.Root>
            </Card>

            <Separator
              orientation="horizontal"
              my={'4'}
              style={{
                width: '100%',
              }}
            />
            <Card>
              <DataList.Root>
                {thisMonthForEachProject.map(
                  ({ projectId, projectName, minutes }) => (
                    <DataList.Item
                      align="center"
                      key={projectId}
                    >
                      <DataList.Label minWidth="88px">
                        {currentDateIsThisMonth
                          ? 'This month'
                          : 'Current month'}{' '}
                        {projectName.toUpperCase()}
                      </DataList.Label>
                      <DataList.Value className="justify-end items-center">
                        <Badge
                          color={getProjectColor(projectId)}
                          variant="soft"
                          radius="full"
                          size={'3'}
                        >
                          {formatMinutes(minutes)}
                        </Badge>
                      </DataList.Value>
                    </DataList.Item>
                  ),
                )}
              </DataList.Root>
            </Card>
          </Box>
        </Flex>
      </MigrationGate>
    </Container>
  );
}

export default App;
