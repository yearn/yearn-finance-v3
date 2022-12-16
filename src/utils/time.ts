import { Milliseconds, Seconds, Weeks } from '@types';

export const SECOND: Milliseconds = 1000;
export const DAY: Milliseconds = SECOND * 3600 * 24;
export const WEEK: Milliseconds = DAY * 7;
export const YEAR: Milliseconds = DAY * 365;

export function toTime(time: number | string | undefined): Milliseconds {
  return Number(time || 0);
}

export function toMilliseconds(time?: Seconds): Milliseconds {
  return toTime(time) * 1000;
}

export function toSeconds(time?: Milliseconds): Seconds {
  return Math.floor(toTime(time) / 1000);
}

export function toWeeks(time?: Milliseconds): Weeks {
  return Math.floor(toTime(time) / WEEK);
}

export function fromWeeks(time?: Weeks): Milliseconds {
  return toTime(time) * WEEK;
}

export function getTimeUntil(time?: Milliseconds): Milliseconds {
  const duration = toTime(time) - Date.now();
  return duration < 0 ? 0 : duration;
}

export function roundToWeek(time?: Milliseconds): Milliseconds {
  return Math.floor(toTime(time) / WEEK) * WEEK;
}
