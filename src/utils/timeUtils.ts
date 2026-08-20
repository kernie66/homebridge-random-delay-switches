// homebridge-random-delay-switch/lib/utils/timeUtils.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
// oxlint-disable-next-line import/no-unassigned-import
import 'temporal-polyfill/global';

export type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Convert seconds to DD:HH:MM:SS object format */
export const toTime = (seconds: number): Temporal.Duration => {
  const time = Temporal.Duration.from({ seconds });
  return time.round({ largestUnit: 'days' });
};

// Convert DD:HH:MM:SS format to seconds, allowing for missing leading values (e.g., MM:SS or only seconds)
export const toSeconds = (timeString: string) => {
  // Split the time string into an array of numbers, reverse it to get seconds first,
  // and convert each value to an integer
  const timeArray = timeString
    .split(':')
    .reverse()
    .map((value) => Number.parseInt(value, 10));
  const multiplier = [1, 60, 60 * 60, 24 * 60 * 60] as const; // SS, MM, HH, DD
  const seconds = timeArray.reduce((acc, value, index) => {
    if (multiplier[index]) {
      return acc + value * multiplier[index];
    }
    return acc;
  });
  return seconds;
};

/** Get the current timestamp in seconds since the Unix epoch. */
export const getTimestamp = () => Math.round(Temporal.Now.instant().epochMilliseconds / 1000);

/** Format options for Eve display date/time. */
const eveDateFormat: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

/** Format a Temporal.Instant to an Eve display date/time string. */
const formatEveDate = (date: Temporal.Instant): string => {
  return date.toLocaleString(undefined, eveDateFormat).replace(/,/g, '').slice(0, 24);
};

/** Convert different time formats to Eve display format
 *
 * @param time - The ISO time string, timestamp in seconds or Date object to convert.
 * If not provided, the current date and time will be used.
 * @returns The Eve display format string.
 */
export const timeToEveDate = (time?: string | number | Date): string => {
  let timestamp = Temporal.Now.instant();

  if (time instanceof Date) {
    timestamp = time.toTemporalInstant();
  }
  if (typeof time === 'string') {
    if (!time.includes('Z')) {
      time = `${time}Z`;
    }
    timestamp = Temporal.Instant.from(time);
  }
  if (typeof time === 'number') {
    timestamp = Temporal.Instant.fromEpochMilliseconds(time * 1000);
  }
  return formatEveDate(timestamp);
};

/** Asynchronously wait for a specified number of seconds.
 *
 * Returns a promise that resolves after the specified number of seconds.
 * The timer can be aborted using an {@link AbortSignal}.
 */
export const wait = async (seconds: number, signal?: AbortSignal) => {
  const timeout = Math.round(seconds * 1000);
  return setTimeoutPromise(timeout, 'Timeout reached', { signal });
};

/** Synchronously wait for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait.
 *
 * Note: This function will block the execution of the calling thread.
 */
export const syncWait = (ms: number) => {
  const end = Date.now() + ms;
  while (Date.now() < end) continue;
};
