import * as Evolu from '@evolu/common';
import { useQuery } from '@evolu/react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  DataList,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Link,
  Popover,
  Reset,
  Select,
  Separator,
  Skeleton,
  Text,
  TextField,
  type TextProps,
} from '@radix-ui/themes';
import dayjs, { Dayjs } from 'dayjs';
import jsQR from 'jsqr';
import QrCode from 'qrcode';
import { Suspense, use, useMemo, useRef, useState } from 'react';

import { getLogsForDate, getLogsForMonth } from './evolu';
import { useEvolu } from './hooks/useEvolu';
import type { WorkLogId } from './schema';

const contexts = ['aco', 'larokinvest', 'spcom'] as const;
const contextToColors: Record<
  (typeof contexts)[number],
  TextProps['color']
> = {
  aco: 'blue',
  larokinvest: 'green',
  spcom: 'yellow',
};

type WorkLog = ReturnType<typeof getLogsForDate>['Row'];

const isVolno = (log: WorkLog) =>
  log.name.toLowerCase() === 'volno';

const calculateEntries = (logs: WorkLog[]) => {
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
      !isVolno(previous)
    ) {
      timeForContext[previous.context] += Math.abs(
        dayjs(previous.at).diff(log.at, 'second'),
      );
      contextRangeStarts[previous.context] = null;

      return;
    }

    // "Volno" ends all the context ranges
    if (logHasContext && isVolno(log)) {
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
      !isVolno(log) &&
      !isVolno(previous)
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

const formatMinutes = (minutes: number) => {
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}min`
    : `${minutes}min`;
};

const MnemonicQrCode = ({
  mnemonic,
}: {
  mnemonic: Promise<string>;
}) => {
  return (
    <img
      src={use(mnemonic)}
      alt="QR Code"
      style={{ width: '200px', height: '200px' }}
    />
  );
};

const Profile = () => {
  const evolu = useEvolu();
  const owner = use(evolu.appOwner);
  const qrCode = useMemo(
    () => QrCode.toDataURL(owner.mnemonic),
    [owner.mnemonic],
  );
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  return (
    <Flex gap="4" align="center">
      <Popover.Root>
        <Popover.Trigger>
          <Reset>
            <button>
              <Avatar fallback="A" size="3" />
            </button>
          </Reset>
        </Popover.Trigger>
        <Popover.Content>
          <Suspense
            fallback={<Skeleton width="200px" height="200px" />}
          >
            <MnemonicQrCode mnemonic={qrCode} />
          </Suspense>
        </Popover.Content>
      </Popover.Root>
      <Flex direction="column">
        <Text size="2">{owner.id}</Text>
        <Flex>
          <Dialog.Root
            onOpenChange={async (isOpen) => {
              // Release the stream when the popover is closed
              if (!isOpen && video.current.srcObject) {
                (video.current.srcObject as MediaStream)
                  .getTracks()
                  .forEach((track) => {
                    track.stop();
                  });
              }

              if (isOpen) {
                try {
                  const stream =
                    await navigator.mediaDevices.getUserMedia({
                      video: {
                        facingMode: 'environment',
                      },
                      audio: false,
                    });

                  video.current.srcObject = stream;
                } catch (err) {
                  console.error('Camera error:', err);
                }
              }
            }}
          >
            <Dialog.Trigger>
              <Link href="#" color="orange" size="1">
                Load user
              </Link>
            </Dialog.Trigger>
            <Dialog.Content size="4">
              <Dialog.Title>Choosing user</Dialog.Title>
              <Dialog.Description>
                Take a photo of QR code from other device
              </Dialog.Description>

              <Box mt={'5'} position="relative">
                <video
                  ref={video}
                  autoPlay
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
                <canvas
                  ref={canvas}
                  className="absolute inset-0 hidden"
                />
              </Box>

              <Box mt={'5'}>
                <Dialog.Close>
                  <Button
                    onClick={() => {
                      canvas.current.width =
                        video.current.videoWidth;
                      canvas.current.height =
                        video.current.videoHeight;
                      const ctx =
                        canvas.current.getContext('2d');

                      ctx.drawImage(
                        video.current,
                        0,
                        0,
                        canvas.current.width,
                        canvas.current.height,
                      );
                      const image = ctx.getImageData(
                        0,
                        0,
                        canvas.current.width,
                        canvas.current.height,
                      );

                      const code = jsQR(
                        image.data,
                        image.width,
                        image.height,
                        { inversionAttempts: 'dontInvert' },
                      );

                      if (code) {
                        alert('QR: ' + code.data);
                      } else {
                        alert('No QR code found');
                      }
                    }}
                  >
                    Capture photo
                  </Button>
                </Dialog.Close>
              </Box>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      </Flex>
    </Flex>
  );
};

function App() {
  const [today] = useState(() => dayjs());
  const evolu = useEvolu();
  const todayTimeLogs = useQuery(getLogsForDate(today));
  const thisMonth = useQuery(getLogsForMonth(today));
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteClick = (id: WorkLogId) => {
    evolu.update('workLog', {
      id,
      isDeleted: Evolu.sqliteTrue,
    });
  };

  const thisMonthForEachContext = calculateEntries([
    ...thisMonth,
  ]);
  const todayForEachContext = calculateEntries([
    ...todayTimeLogs,
  ]);

  return (
    <Container px="4" mt="2">
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
                No time logs for today. Start by adding one.
              </Text>
            )}
            {todayTimeLogs.map((item) => {
              return (
                <Flex gap="2" justify={'between'} key={item.id}>
                  <Flex direction="column">
                    <Text
                      size="1"
                      color={contextToColors[item.context]}
                      weight="bold"
                    >
                      {item.context.toUpperCase()}
                    </Text>
                    <Text size="5">{item.name}</Text>
                  </Flex>
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
        </Box>
        <Box
          width="100%"
          maxWidth={{ sm: '300px', initial: '100%' }}
        >
          <DataList.Root>
            {Object.entries(todayForEachContext).map(
              ([contextName, count]) => (
                <DataList.Item align="center" key={contextName}>
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

            <Separator
              orientation="horizontal"
              my={'4'}
              style={{
                width: '100%',
              }}
            />

            {Object.entries(thisMonthForEachContext).map(
              ([contextName, count]) => (
                <DataList.Item align="center" key={contextName}>
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
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
