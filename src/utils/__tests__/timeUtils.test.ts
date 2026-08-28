import { Temporal } from 'temporal-polyfill';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';

import { getTimestamp, timeToEveDate, wait, syncWait, toTime, toDuration, toSeconds } from '../timeUtils.js';

// Use Date() in tests to verify that the Temporal API and polyfill
// gives the same results as Date()
const testDateTime = 'Sun, May 4, 2025, 2:04:25 PM';
const testEveDate = 'Sun May 04 2025 14:04:25';
const isoString = '2026-06-12T15:16:17.180Z';
const testIsoEveDate = 'Fri Jun 12 2026 15:16:17';

function getTestTimestamp() {
  const now = new Date();
  const testTimestampInSeconds = now.getTime() / 1000;
  return testTimestampInSeconds;
}

describe('Test the duration conversion functions', () => {
  it('converts delay string in seconds to temporal duration', () => {
    const duration = toDuration('123456');

    // console.log('Duration:', duration?.toLocaleString());
    expect(duration).toBeDefined();
    expect(duration.days).toEqual(1);
    expect(duration.hours).toEqual(10);
    expect(duration.minutes).toEqual(17);
    expect(duration.seconds).toEqual(36);
  });

  it('converts delay string in DD:HH:MM:SS format to temporal duration', () => {
    const duration = toDuration('1:10:15:0');

    // console.log('Duration:', duration?.toLocaleString());
    expect(duration).toBeDefined();
    expect(duration.days).toEqual(1);
    expect(duration.hours).toEqual(10);
    expect(duration.minutes).toEqual(15);
    expect(duration.seconds).toEqual(0);
  });

  it('converts delay string in partial DD:HH:MM:SS format to temporal duration', () => {
    const duration = toDuration('33:44', { maxDuration: Temporal.Duration.from({ hours: 1 }) });

    // console.log('Duration:', duration?.toLocaleString());
    expect(duration).toBeDefined();
    expect(duration.days).toEqual(0);
    expect(duration.hours).toEqual(0);
    expect(duration.minutes).toEqual(33);
    expect(duration.seconds).toEqual(44);
  });

  it('converts delay string in unnatural DD:HH:MM:SS format to temporal duration', () => {
    const duration = toDuration('40:90:444');

    // console.log('Duration:', duration?.toLocaleString());
    expect(duration).toBeDefined();
    expect(duration.days).toEqual(1);
    expect(duration.hours).toEqual(17);
    expect(duration.minutes).toEqual(37);
    expect(duration.seconds).toEqual(24);
  });

  it('clamps duration to max duration if clampToMax is true', () => {
    const duration = toDuration('3:30:01', { maxDuration: Temporal.Duration.from({ minutes: 30 }), clampToMax: true });

    expect(duration).toBeDefined();
    expect(duration.days).toEqual(0);
    expect(duration.hours).toEqual(0);
    expect(duration.minutes).toEqual(30);
    expect(duration.seconds).toEqual(0);
  });

  it('generates error if duration is larger than max duration without clamping', () => {
    expect(() => toDuration('30:01', { maxDuration: Temporal.Duration.from({ minutes: 30 }) })).toThrowError(
      'Duration exceeds maximum: 30 min, 1 sec > 30 min',
    );
  });

  it('generates error if duration string is invalid formats', () => {
    expect(() => toDuration('A30:01')).toThrow(RangeError);
    expect(() => toDuration('A30:01')).toThrow('Non-finite minutes: NaN');
    expect(() => toDuration('::')).toThrow('Non-finite hours: NaN');
    expect(() => toDuration('30.01')).toThrow(SyntaxError);
    expect(() => toDuration('30.01')).toThrow('Invalid time string: 30.01');
    expect(() => toDuration('')).toThrow('Invalid time string: ');
    expect(() => toDuration('kalle')).toThrow('Invalid time string: kalle');
  });

  it('converts seconds to temporal duration', () => {
    const time = toTime(3 * 24 * 3600 + 4 * 3600 + 15 * 60);

    expect(time.days).toEqual(3);
    expect(time.hours).toEqual(4);
    expect(time.minutes).toEqual(15);
    expect(time.seconds).toEqual(0);
  });

  it('converts temporal duration to seconds', () => {
    const duration = Temporal.Duration.from({ days: 3, hours: 4, minutes: 15 });
    const seconds = toSeconds(duration);
    expect(seconds).toEqual(3 * 24 * 3600 + 4 * 3600 + 15 * 60);
  });

  it('converts DD:HH:MM:SS to seconds', () => {
    const seconds = toSeconds('03:04:15:30');
    expect(seconds).toEqual(3 * 24 * 3600 + 4 * 3600 + 15 * 60 + 30);
  });
});

describe('Test the time utility functions', () => {
  beforeAll(() => {
    // Define the TZ environment variable to use a fixed time zone for tests
    vi.stubEnv('TZ', 'Sweden/Stockholm');
    // Mock the Date object/system time
    const mockDate = new Date(testDateTime);
    vi.setSystemTime(mockDate);
  });

  afterAll(() => {
    // reset mocked time
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('gets the current timestamp', () => {
    const testTimestampInSeconds = getTestTimestamp();
    const timestamp = getTimestamp();
    expect(timestamp).toBe(testTimestampInSeconds);
  });

  it('gets the timestamp in Eve display format', () => {
    const testTimestampInSeconds = getTestTimestamp();
    const eveDate = timeToEveDate(testTimestampInSeconds);
    // console.log('eveDate', eveDate);
    expect(eveDate).toBe(testEveDate);
  });

  it('gets the ISO date time in Eve display format', () => {
    // Test without param, should default to current time
    const defaultEveDate = timeToEveDate();
    expect(defaultEveDate).toBe(testEveDate);
    // console.log('isoDateTime', defaultEveDate);

    // Test with correct ISO string
    const isoEveDate = timeToEveDate(isoString);
    // console.log('isoEveDate', isoEveDate);
    expect(isoEveDate).toBe(testIsoEveDate);

    // Test with ISO string without time zone
    const isoEveDateNoTZ = timeToEveDate(isoString.slice(0, -1));
    // console.log('isoEveDate', isoEveDateNoTZ);
    expect(isoEveDateNoTZ).toBe(testIsoEveDate);
  });

  it('waits for a specified time (asynchronous)', async () => {
    vi.useRealTimers();
    const startTime = Date.now();
    await wait(0.5);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(500);
  });

  it('waits for a specified time with abort controller', async () => {
    vi.useRealTimers();
    const controller = new AbortController();
    const startTime = Date.now();
    const result = await wait(0.1, controller.signal);
    const endTime = Date.now();
    expect(result).toBe('Timeout reached');
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });

  it('waits synchronously for a specified time', async () => {
    vi.useRealTimers();
    const startTime = Date.now();
    syncWait(100);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });
});
