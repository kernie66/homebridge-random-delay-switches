import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';

import { runCronJobs, setSchedule, stopCronJobs } from '../cronUtils.js';

process.env.TZ = 'Sweden/Stockholm';

const testDateTime = 'Sun, May 4, 2025, 2:04:25 PM';

const testSchedules = [
  '15 * * * 5 *',
  '5/30 * * * *; * * * * 4 *',
  '2 * 12-15 6 * *; * * * 4,6 *;0 */12 2/6 * 4',
] as const;

const testNextDates = [
  [
    'May 6, 2025, 12:00:02 PM',
    'May 6, 2025, 12:01:02 PM',
    'May 6, 2025, 12:02:02 PM',
    'May 6, 2025, 12:03:02 PM',
    'May 6, 2025, 12:04:02 PM',
  ],
  [
    'Jun 1, 2025, 12:00:00 AM',
    'Jun 1, 2025, 12:01:00 AM',
    'Jun 1, 2025, 12:02:00 AM',
    'Jun 1, 2025, 12:03:00 AM',
    'Jun 1, 2025, 12:04:00 AM',
  ],
  [
    'May 8, 2025, 12:00:00 AM',
    'May 8, 2025, 12:00:00 PM',
    'May 14, 2025, 12:00:00 AM',
    'May 14, 2025, 12:00:00 PM',
    'May 15, 2025, 12:00:00 AM',
  ],
] as const;

describe('Test the cron scheduling functions', () => {
  it('sets a simple schedule', () => {
    const { schedule, cronArray, scheduleArray } = setSchedule(testSchedules[0]);
    console.log(schedule, cronArray, scheduleArray);
    expect(schedule).toBe('At 15 seconds past the minute, only in May');
    expect(cronArray.length).toEqual(testSchedules[0].split(';').length);
    expect(scheduleArray[0]).toBe('At 15 seconds past the minute, only in May');
  });

  it('sets two simple schedules', () => {
    const { schedule, cronArray, scheduleArray } = setSchedule(testSchedules[1]);
    console.log(schedule, cronArray, scheduleArray);
    expect(schedule).toBe('Every 30 min, starting at 5 min past the hour; Every sec, only>');
    expect(cronArray.length).toEqual(testSchedules[1].split(';').length);
    expect(cronArray).toEqual(testSchedules[1].split(';').map((s) => s.trim()));
    expect(scheduleArray[0]).toBe('Every 30 minutes, starting at 5 minutes past the hour');
    expect(scheduleArray[1]).toBe('Every second, only in April');
  });

  it('sets three complex schedules', () => {
    const { schedule, cronArray, scheduleArray } = setSchedule(testSchedules[2]);
    console.log(schedule, cronArray, scheduleArray);
    expect(schedule).toBe('At 2 sec past the min, between 12:00 and 15:59, on day 6 of th>');
    expect(cronArray.length).toEqual(testSchedules[2].split(';').length);
    expect(cronArray).toEqual(testSchedules[2].split(';').map((s) => s.trim()));
    expect(scheduleArray[0]).toBe('At 2 seconds past the minute, between 12:00 and 15:59, on day 6 of the month');
    expect(scheduleArray[1]).toBe('Every minute, only in April and June');
    expect(scheduleArray[2]).toBe(
      'On the hour, every 12 hours, every 6 days in a month, starting on day 2 of the month, and on Thursday',
    );
  });

  it('sets empty schedule', () => {
    const { schedule, cronArray } = setSchedule('');
    console.log(schedule, cronArray);
    expect(schedule).toBe('Schedule disabled');
    expect(cronArray.length).toEqual(0);
  });

  it('sets illegal schedule', () => {
    expect(() => setSchedule('* * * *')).toThrow(TypeError);
  });
});

describe('Test running the cron jobs', () => {
  beforeAll(() => {
    // Mock the Date object/system time
    const mockDate = new Date(testDateTime);
    vi.setSystemTime(mockDate);
  });

  afterAll(() => {
    // reset mocked time
    vi.useRealTimers();
  });
  it('runs a cron job', () => {
    const { cronArray } = setSchedule(testSchedules[2]);
    const { cronJobs, nextDatesArray } = runCronJobs(cronArray, () => {
      console.log('Cron job running');
    });
    console.log(nextDatesArray);
    expect(cronJobs).toBeDefined();
    expect(cronJobs.length).toEqual(cronArray.length);
    expect(nextDatesArray).toBeDefined();
    expect(nextDatesArray.length).toEqual(cronArray.length);
    expect(nextDatesArray[0]).toBeDefined();
    expect(nextDatesArray[0].length).toEqual(5);
    expect(nextDatesArray).toEqual(testNextDates);
  });
});

describe('Test stopping the cron jobs', () => {
  it('stops the cron jobs', async () => {
    const { cronArray } = setSchedule(testSchedules[2]);
    const { cronJobs } = runCronJobs(cronArray, () => {
      console.log('Cron job running');
    });

    const { stoppedCronJobs, lastDates } = await stopCronJobs(cronJobs);
    console.log(lastDates);
    expect(stoppedCronJobs).toBeDefined();
    expect(stoppedCronJobs).toEqual(cronArray.length);
    expect(lastDates).toBeDefined();
    expect(lastDates.length).toEqual(0);
  });
});
