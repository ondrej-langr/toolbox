import * as Evolu from '@evolu/common';
import { useQuery } from '@evolu/react';
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
  Kbd,
  Link,
  Popover,
  Select,
  Separator,
  Skeleton,
  Strong,
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
import { contexts, contextToColors } from './constants';
import { useEvolu } from './hooks/useEvolu';
import type { WorkLogId, WorkLogType } from './schema';
import { calculateWorkLogEntries } from './utils/calculateWorkLogEntries';
import { formatMinutes } from './utils/formatMinutes';
import { formatSeconds } from './utils/formatSeconds';
import { getWorkLogsForDate } from './utils/getWorkLogsForDate';
import { getWorkLogsForMonth } from './utils/getWorkLogsForMonth';
import { isWorkLogBreak } from './utils/isWorkLogBreak';

function App() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(() =>
    dayjs(),
  );
  const evolu = useEvolu();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentDate(dayjs());
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const todayTimeLogs = useQuery(
    getWorkLogsForDate(currentDate),
  );
  const thisMonth = useQuery(getWorkLogsForMonth(currentDate));
  const nameInputRef = useRef<HTMLInputElement>(null);
  const currentDateIsToday = useMemo(
    () => currentDate.isSame(dayjs(), 'day'),
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
        fallback={<Skeleton width="200x" height="32px" />}
      >
        <Profile />
      </Suspense>
      <Flex
        gap={{ initial: '6', sm: '4' }}
        mt="9"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box flexGrow={'1'}>
          <Flex direction="column" gap="3">
            {todayTimeLogs.length === 0 && (
              <Text>
                {currentDateIsToday
                  ? 'No time logs for today. Start by adding one.'
                  : 'No time logs for chosen day.'}
              </Text>
            )}
            {todayTimeLogs.map((item) => {
              return (
                <Flex gapX="5" justify={'between'} key={item.id}>
                  {isWorkLogBreak(item) ? (
                    <Flex gap="5" align="center" flexGrow={'1'}>
                      <Text size="2">{item.name}</Text>
                      <Separator
                        color="green"
                        style={{ flexGrow: '1' }}
                      />
                    </Flex>
                  ) : (
                    <Flex direction="column" flexGrow={'1'}>
                      <Text
                        size="1"
                        color={contextToColors[item.context]}
                        weight="bold"
                      >
                        {item.context.toUpperCase()}
                      </Text>
                      <Text size="5">{item.name}</Text>
                    </Flex>
                  )}
                  <Flex gap="2" align="center">
                    <Popover.Root>
                      <Popover.Trigger>
                        <Badge
                          color="iris"
                          variant="outline"
                          radius="medium"
                          size={'3'}
                        >
                          {dayjs(item.at).format('HH:mm')}
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
                      D
                    </IconButton>
                  </Flex>
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

          {lastItem && (
            <>
              <Callout.Root color="gray" variant="soft">
                <Callout.Icon>--</Callout.Icon>
                <Callout.Text>
                  {isWorkLogBreak(lastItem) ? (
                    'You are on a break'
                  ) : (
                    <>
                      Current task is taking{' '}
                      <Strong>
                        {formatSeconds(
                          currentDate.diff(
                            lastItem.at,
                            'seconds',
                          ),
                        )}
                      </Strong>{' '}
                      <br />
                      <Tooltip
                        content={
                          <>
                            Or press{' '}
                            <Kbd size="1">Ctrl + b</Kbd>{' '}
                          </>
                        }
                      >
                        <Link
                          href="#"
                          role="button"
                          mt="2"
                          style={{ display: 'inline-block' }}
                          onClick={takeBreak}
                        >
                          Take break
                        </Link>
                      </Tooltip>
                    </>
                  )}
                </Callout.Text>
              </Callout.Root>

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
                ([contextName, count]) => (
                  <DataList.Item
                    align="center"
                    key={contextName}
                  >
                    <DataList.Label minWidth="88px">
                      Today {contextName.toUpperCase()}
                    </DataList.Label>
                    <DataList.Value className="justify-end">
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
                ),
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
                      This month {contextName.toUpperCase()}
                    </DataList.Label>
                    <DataList.Value className="justify-end">
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
