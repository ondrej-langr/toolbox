import { formatMinutes } from './formatMinutes';

export const formatSeconds = (seconds: number) => {
  if (seconds > 60) {
    return formatMinutes(Math.floor(seconds / 60));
  }

  return `${seconds}s`;
};
