import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';

import { getTimestamp, isoDateTimeToEveDate, toEveDate } from '../dateTimeHelpers.js';

process.env.TZ = 'Sweden/Stockholm';

const testDateTime = 'Sun, May 4, 2025, 2:04:25 PM';
const testEveDate = 'Sun May 04 2025 14:04:25';
const isoString = '2026-06-12T15:16:17.180Z';
const testIsoEveDate = 'Fri Jun 12 2026 15:16:17';

function getTestTimestamp() {
  const now = new Date();
  const testTimestampInSeconds = now.getTime() / 1000;
  return testTimestampInSeconds;
}

describe('Test the DateTime helper functions', () => {
  beforeAll(() => {
    // Mock the Date object/system time
    const mockDate = new Date(testDateTime);
    vi.setSystemTime(mockDate);
  });

  afterAll(() => {
    // reset mocked time
    vi.useRealTimers();
  });

  it('gets the current timestamp', () => {
    const testTimestampInSeconds = getTestTimestamp();
    const timestamp = getTimestamp();
    expect(timestamp).toBe(testTimestampInSeconds);
  });

  it('gets the timestamp in Eve display format', () => {
    const testTimestampInSeconds = getTestTimestamp();
    const eveDate = toEveDate(testTimestampInSeconds);
    // console.log('eveDate', eveDate);
    expect(eveDate).toBe(testEveDate);
  });

  it('gets the ISO date time in Eve display format', () => {
    // Test without param, should default to current time
    const defaultEveDate = isoDateTimeToEveDate();
    expect(defaultEveDate).toBe(testEveDate);
    // console.log('isoDateTime', defaultEveDate);

    // Test with correct ISO string
    const isoEveDate = isoDateTimeToEveDate(isoString);
    // console.log('isoEveDate', isoEveDate);
    expect(isoEveDate).toBe(testIsoEveDate);

    // Test with ISO string without time zone
    const isoEveDateNoTZ = isoDateTimeToEveDate(isoString.slice(0, -1));
    // console.log('isoEveDate', isoEveDateNoTZ);
    expect(isoEveDateNoTZ).toBe(testIsoEveDate);
  });
});
