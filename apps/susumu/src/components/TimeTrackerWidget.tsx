import {
  EyeClosedIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';
import {
  Callout,
  Kbd,
  Link,
  Strong,
  Tooltip,
} from '@radix-ui/themes';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { formatSeconds } from '../utils/formatSeconds';
import type { WorkLog } from '../utils/getAllWorkLogs';
import { isWorkLogBreak } from '../utils/isWorkLogBreak';

export const TimeTrackerWidget = ({
  lastItem,
  takeBreak,
}: {
  lastItem: WorkLog;
  takeBreak: () => void;
}) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(() =>
    dayjs(),
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Callout.Root color="gray" variant="soft">
      <Callout.Icon>
        {isWorkLogBreak(lastItem) ? (
          <EyeClosedIcon />
        ) : (
          <EyeOpenIcon className="animate-pulse" />
        )}
      </Callout.Icon>
      <Callout.Text>
        {isWorkLogBreak(lastItem) ? (
          'You are on a break'
        ) : (
          <>
            Working on <Strong>{lastItem.context}</Strong> for{' '}
            <Strong>
              {formatSeconds(
                currentTime.diff(lastItem.at, 'seconds'),
              )}
            </Strong>{' '}
            <br />
            <Tooltip
              side="right"
              content={
                <>
                  Click or press{' '}
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
                Take a break
              </Link>
            </Tooltip>
          </>
        )}
      </Callout.Text>
    </Callout.Root>
  );
};
