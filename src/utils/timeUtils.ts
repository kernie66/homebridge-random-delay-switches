// homebridge-random-delay-switch/lib/utils/timeUtils.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
// oxlint-disable-next-line import/no-unassigned-import
import 'temporal-polyfill/global';

// Regular expression to match delay in seconds (e.g., "30")
const isDelaySeconds = /^\d+$/;

/** Convert seconds string or DD:HH:MM:SS string to Temporal.Duration
 *
 * @param timeString - The time string to convert
 * @param maxDuration - Optional maximum valid value of the resulting duration
 * @returns The converted duration or throws any error that occurred
 */
export const toDuration = (timeString: string, options?: { maxDuration?: Temporal.Duration; clampToMax?: boolean }) => {
  let duration = Temporal.Duration.from({ seconds: 0 });

  // Check if the string is a delay in seconds (e.g., "30")
  if (isDelaySeconds.test(timeString)) {
    duration = Temporal.Duration.from({ seconds: Number.parseInt(timeString, 10) });
  }
  // Check if the string is in DD:HH:MM:SS format (e.g., "1:2:30:44")
  else if (timeString.includes(':')) {
    // Split the time string into an array of numbers, reverse it to get seconds first,
    // and convert each value to an integer
    const timeArray = timeString
      .split(':')
      .reverse()
      .map((value) => Number.parseInt(value, 10));
    duration = Temporal.Duration.from({
      days: timeArray[3] ?? 0,
      hours: timeArray[2] ?? 0,
      minutes: timeArray[1] ?? 0,
      seconds: timeArray[0] ?? 0,
    });
  } else {
    throw new SyntaxError(`Invalid time string: ${timeString}`);
  }
  if (options?.maxDuration && Temporal.Duration.compare(duration, options.maxDuration) > 0) {
    if (options.clampToMax) {
      duration = options.maxDuration;
    } else {
      throw new RangeError(
        `Duration exceeds maximum: ${duration.toLocaleString()} > ${options.maxDuration.toLocaleString()}`,
      );
    }
  }
  duration = duration.round({ largestUnit: 'days' });
  return duration;
};

/**
 * Converts a number of seconds to a Temporal.Duration.
 *
 * @param seconds - The number of seconds to convert.
 * @returns A Temporal.Duration object representing the input seconds in days, hours, minutes and seconds.
 */
export const toTime = (seconds: number) => {
  const time = Temporal.Duration.from({ seconds: Math.round(seconds) });
  return time.round({ largestUnit: 'days' });
};

/**
 * Converts a time representation to a human-readable format
 *
 * @param time - The time in different representations, timestamp number or Temporal object
 * @returns A string that is readable
 */
export const toHumanTime = (time: number | Temporal.Duration | Temporal.Instant) => {
  if (time === 0) return '0 sec';
  if (typeof time === 'number') {
    return toTime(time).toLocaleString();
  }
  return time.toLocaleString();
};

/**
 * Converts a time format (string or Temporal.Duration) to seconds.
 *
 * @param time - The time to convert, either as a string in the format "DD:HH:MM:SS" or a Temporal.Duration.
 * @returns The time as a Temporal.Duration in seconds.
 */
export const toSeconds = (time: string | Temporal.Duration | Temporal.Instant): number => {
  let seconds = 0;
  if (typeof time === 'string') {
    // Split the time string into an array of numbers, reverse it to get seconds first,
    // and convert each value to an integer
    const timeArray = time
      .split(':')
      .reverse()
      .map((value) => Number.parseInt(value, 10));
    const multiplier = [1, 60, 60 * 60, 24 * 60 * 60] as const; // SS, MM, HH, DD
    seconds = timeArray.reduce((acc, value, index) => {
      if (multiplier[index]) {
        return acc + value * multiplier[index];
      }
      return acc;
    });
  }
  if (time instanceof Temporal.Duration) {
    seconds = time.total({ unit: 'seconds' });
  }
  if (time instanceof Temporal.Instant) {
    seconds = Math.round(time.epochMilliseconds / 1000);
  }
  return seconds;
};

// 1. Separate interfaces
interface TimestampWithTemporal {
  asTemporal: true;
  offset?: Temporal.Duration;
}
interface TimestampWithNumber {
  asTemporal?: false;
  offset?: Temporal.Duration;
}

// 2. Define standard function overloads
export function getTimestamp(options: TimestampWithTemporal): Temporal.Instant;
export function getTimestamp(options?: TimestampWithNumber): number;

// 3. Implement the function (The return type here combines both options)
/**
 * Get the timestamp in seconds since the Unix epoch.
 *
 * @param options - Config object containing offset and asTemporal flag.
 * @returns The timestamp as a Temporal.Instant or a number.
 */
export function getTimestamp({ asTemporal = false, ...options }: TimestampWithTemporal | TimestampWithNumber = {}):
  | Temporal.Instant
  | number {
  let tempTimestamp = Temporal.Now.instant();
  let timestamp = tempTimestamp;

  if (options.offset) {
    timestamp = tempTimestamp.add(options.offset);
  }

  // TypeScript allows this narrowing automatically here!
  if (asTemporal) {
    return timestamp;
  }

  return Math.round(timestamp.epochMilliseconds / 1000);
}

/** Convert a number of seconds to a Temporal.Duration. */
export const setDuration = (time: number) => {
  return Temporal.Duration.from({ seconds: time });
};

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
 * @param time - The ISO time string, timestamp in seconds, Date object, or Temporal.Instant to convert.
 * If not provided, the current date and time will be used.
 * @returns The Eve display format string.
 */
export const timeToEveDate = (time?: string | number | Date | Temporal.Instant): string => {
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
  if (time instanceof Temporal.Instant) {
    timestamp = time;
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
