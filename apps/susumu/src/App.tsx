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
  Tooltip,
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

import { Profile } from './components/Profile';
import { TimeTrackerWidget } from './components/TimeTrackerWidget';
import { contexts, contextToColors } from './constants';
import { useEvolu } from './hooks/useEvolu';
import type { WorkLogId, WorkLogType } from './schema';
import { calculateWorkLogEntries } from './utils/calculateWorkLogEntries';
import { formatMinutes } from './utils/formatMinutes';
import type { WorkLog } from './utils/getAllWorkLogs';
import { getWorkLogsForDate } from './utils/getWorkLogsForDate';
import { getWorkLogsForMonth } from './utils/getWorkLogsForMonth';
import { isWorkLogBreak } from './utils/isWorkLogBreak';

const calculateEntries = (logs: WorkLog[]) => {
  const totals: Record<string, number> = {};

  logs.forEach((log, index) => {
    const previousLog = logs[index - 1];
    if (!previousLog || isWorkLogBreak(previousLog)) return;

    const diff = Math.floor(
      dayjs(log.at).diff(previousLog.at, 'second') / 60,
    );

    totals[previousLog.name] ??= 0;
    totals[previousLog.name] += diff;
  });

  return totals;
};

function App() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(() =>
    dayjs(),
  );
  const evolu = useEvolu();

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

  const handleDeleteClick = (id: WorkLogId) => {
    evolu.update('workLog', {
      id,
      isDeleted: Evolu.sqliteTrue,
    });
  };

  const thisMonthForEachContext = calculateWorkLogEntries([
    ...thisMonth,
  ]);
  const todayForEachContext = calculateWorkLogEntries([
    ...todayTimeLogs,
  ]);

  const takeBreak = useCallback(() => {
    evolu.insert('workLog', {
      context: 'Unknown',
      name: 'Break',
      at: dayjs().toISOString(),
      type: 'break' satisfies WorkLogType,
    });
  }, [evolu]);

  useEffect(() => {
    const ctrlBListener = (e: KeyboardEvent) => {
      const lastItem = todayTimeLogs.at(-1);

      // Insert break when Ctrl+B is pressed and the last item is not a break
      if (
        e.ctrlKey &&
        e.key === 'b' &&
        !isWorkLogBreak(lastItem)
      ) {
        takeBreak();
      }
    };

    window.addEventListener('keydown', ctrlBListener);

    return () => {
      window.removeEventListener('keydown', ctrlBListener);
    };
  }, [todayTimeLogs, takeBreak]);

  const lastItem = todayTimeLogs.at(-1);

  return (
    <Container px="4" mt="2" mb="4">
      <Suspense
        fallback={<Skeleton width="200x" height="40px" />}
      >
        <Profile />
      </Suspense>
      <Flex
        gap={{ initial: '6', sm: '4' }}
        mt="9"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box flexGrow={'1'}>
          <Flex direction="column" gap="5">
            {todayTimeLogs.length === 0 && (
              <Text>
                {currentDateIsToday
                  ? 'No time logs for today. Start by adding one.'
                  : 'No time logs for chosen day.'}
              </Text>
            )}
            {todayTimeLogs.map((item) => {
              return (
                <Flex gapX="2" justify={'between'} key={item.id}>
                  {isWorkLogBreak(item) ? (
                    <Callout.Root
                      className="py-1.5! flex-1 rounded-sm!"
                      variant="surface"
                    >
                      <Callout.Icon>
                        <MoonIcon />
                      </Callout.Icon>
                      <Callout.Text>{item.name}</Callout.Text>
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
                          color={contextToColors[item.context]}
                          className="relative -top-0.5 mr-2"
                          variant="solid"
                        />
                        {item.context.toUpperCase()}
                      </Text>
                      <Text size="3">{item.name}</Text>
                    </Flex>
                  )}
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
                        onSubmit={(e) => {
                          e.preventDefault();

                          const formData = new FormData(
                            e.target as HTMLFormElement,
                          );
                          const time = formData
                            .get('time')
                            .toString();
                          const [hour, minute] = time.split(':');

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
                            defaultValue={dayjs(item.at).format(
                              'HH:mm',
                            )}
                          />
                          <Button type="submit">Submit</Button>
                        </Flex>
                      </form>
                    </Popover.Content>
                  </Popover.Root>
                  <IconButton
                    color="red"
                    size="2"
                    onClick={() => handleDeleteClick(item.id)}
                  >
                    <TrashIcon width="20" height="20" />
                  </IconButton>
                </Flex>
              );
            })}
          </Flex>
          <Separator
            orientation="horizontal"
            my={'4'}
            size="4"
          />
          {currentDateIsToday && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(
                  e.target as HTMLFormElement,
                );
                const name = formData.get('name');
                const context = formData.get(
                  'context',
                ) as (typeof contexts)[number];

                evolu.insert('workLog', {
                  context,
                  name: name as string,
                  at: dayjs().toISOString(),
                });

                nameInputRef.current.value = '';
              }}
            >
              <Flex gap="2">
                <Select.Root name="context" defaultValue="aco">
                  <Select.Trigger />
                  <Select.Content>
                    {contexts.map((contextName) => (
                      <Select.Item
                        value={contextName}
                        key={contextName}
                      >
                        {contextName.toUpperCase()}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
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

          {lastItem && currentDateIsToday && (
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
              {Object.entries(todayForEachContext).map(
                ([contextName, count]) => {
                  const contextItems = todayTimeLogs.filter(
                    (log) =>
                      log.context === contextName ||
                      isWorkLogBreak(log),
                  );
                  const collectedEntries =
                    calculateEntries(contextItems);
                  const collectedEntriesAsEntries =
                    Object.entries(collectedEntries);

                  return (
                    <DataList.Item
                      align="center"
                      key={contextName}
                    >
                      <DataList.Label minWidth="88px">
                        {currentDateIsToday
                          ? 'Today'
                          : 'Current date'}{' '}
                        {contextName.toUpperCase()}
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
                                        {formatMinutes(total) ||
                                          '0min'}
                                      </DataList.Value>
                                    </DataList.Item>
                                  ),
                                )}
                              </DataList.Root>
                            </Popover.Content>
                          </Popover.Root>
                        )}
                        <Badge
                          color={contextToColors[contextName]}
                          variant="solid"
                          radius="full"
                          size={'3'}
                        >
                          {formatMinutes(count)}
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
              {Object.entries(thisMonthForEachContext).map(
                ([contextName, count]) => (
                  <DataList.Item
                    align="center"
                    key={contextName}
                  >
                    <DataList.Label minWidth="88px">
                      {currentDateIsThisMonth
                        ? 'This month'
                        : 'Current month'}{' '}
                      {contextName.toUpperCase()}
                    </DataList.Label>
                    <DataList.Value className="justify-end items-center">
                      <Badge
                        color={contextToColors[contextName]}
                        variant="soft"
                        radius="full"
                        size={'3'}
                      >
                        {formatMinutes(count)}
                      </Badge>
                    </DataList.Value>
                  </DataList.Item>
                ),
              )}
            </DataList.Root>
          </Card>
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
