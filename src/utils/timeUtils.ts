// homebridge-random-delay-switch/lib/utils/timeUtils.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.

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

export const getTimestamp = () => Date.now();

export const sleep = async (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

export const wait = async (ms: number, opts: { signal?: AbortSignal } = {}) => {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(resolve, ms);
    if (opts.signal) {
      // implement aborting logic for our async operation
      opts.signal.addEventListener('abort', (event) => {
        clearTimeout(timerId);
        reject(event);
      });
    }
  });
};
