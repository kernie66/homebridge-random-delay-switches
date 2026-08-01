// homebridge-random-delay-switch/lib/utils/timeUtils.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';

export type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

// Convert seconds to HH:MM:SS format
export const toTime = (seconds: number) => {
  const time: Time = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  let secondsLeft = seconds;
  time.days = Math.trunc(seconds / (24 * 3600));
  secondsLeft -= time.days * 24 * 3600;
  time.hours = Math.trunc(secondsLeft / 3600);
  secondsLeft -= time.hours * 3600;
  time.minutes = Math.trunc(secondsLeft / 60);
  secondsLeft -= time.minutes * 60;
  time.seconds = secondsLeft;
  return time;
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
export const getTimestamp = () => Math.round(Date.now() / 1000);

/** Asynchronously wait for a specified number of seconds.
 *
 * Returns a promise that resolves after the specified number of seconds.
 * The timer can be aborted using an {@link AbortSignal}.
 */
export const wait = async (seconds: number, signal?: AbortSignal) => {
  const timeout = Math.round(seconds * 1000);
  return setTimeoutPromise(timeout, 'Timeout reached', { signal });
};

/** Synchronously wait for a specified number of seconds.
 */
export const waitSync = (seconds: number) => {
  const timeout = Math.round(seconds * 1000);
  void (async () => {
    await setTimeoutPromise(timeout);
  })();
};
