import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';

import { checkCronString, runCronJobs, setSchedule, stopCronJobs } from '../cronUtils.js';

process.env.TZ = 'Sweden/Stockholm';

const testDateTime = 'Sun, May 4, 2025, 2:04:25 PM';

const testSchedules = [
  '15 * * * 5 *',
  '5-35/30 * * * *; * * * * 4 *',
  '2 * 12-15 6 * *; * * * Apr,Jun *;0 */12 2-30/6 * 4',
] as const;

const testNextDates = [
  [
    'Tue May 06 2025 12:00:02',
    'Tue May 06 2025 12:01:02',
    'Tue May 06 2025 12:02:02',
    'Tue May 06 2025 12:03:02',
    'Tue May 06 2025 12:04:02',
  ],
  [
    'Sun Jun 01 2025 00:00:00',
    'Sun Jun 01 2025 00:01:00',
    'Sun Jun 01 2025 00:02:00',
    'Sun Jun 01 2025 00:03:00',
    'Sun Jun 01 2025 00:04:00',
  ],
  [
    'Thu May 08 2025 00:00:00',
    'Thu May 08 2025 12:00:00',
    'Thu Jun 26 2025 00:00:00',
    'Thu Jun 26 2025 12:00:00',
    'Thu Aug 14 2025 00:00:00',
  ],
] as const;

describe('Test the cronString checker', () => {
  it('returns an error for an invalid cronString', () => {
    const { isValid, allErrors } = checkCronString('* /5 * ? *');
    expect(isValid).toBe(false);
    expect(allErrors).toEqual(['/5 is a invalid expression for hour', '? is a invalid expression for month']);
  });

  it('returns no error for a valid cronString', () => {
    const { isValid, allErrors } = checkCronString(testSchedules[0]);
    expect(isValid).toBe(true);
    expect(allErrors).toEqual([]);
  });

  it('returns no error for an empty cronString', () => {
    const { isValid, allErrors } = checkCronString('');
    expect(isValid).toBe(true);
    expect(allErrors).toEqual(['No cronString defined']);
  });
});

describe('Test the cron scheduling functions', () => {
  it('sets a simple schedule', () => {
    const { schedule, cronArray } = setSchedule(testSchedules[0]);

    expect(schedule).toBe('At 15 seconds past the minute, only in May');
    expect(cronArray.length).toEqual(testSchedules[0].split(';').length);
    expect(cronArray[0].cronSchedule).toBe('At 15 seconds past the minute, only in May');
  });

  it('sets two simple schedules', () => {
    const { schedule, cronArray } = setSchedule(testSchedules[1]);

    expect(schedule).toBe('Every 30 min, min 5 through 35 past the hour; Every sec, only >');
    expect(cronArray.length).toEqual(testSchedules[1].split(';').length);
    expect(cronArray[0].cronExpression).toEqual(testSchedules[1].split(';').map((s) => s.trim())[0]);
    expect(cronArray[1].cronExpression).toEqual(testSchedules[1].split(';').map((s) => s.trim())[1]);
    expect(cronArray[0].cronSchedule).toBe('Every 30 minutes, minutes 5 through 35 past the hour');
    expect(cronArray[1].cronSchedule).toBe('Every second, only in April');
  });

  it('sets three complex schedules', () => {
    const { schedule, cronArray } = setSchedule(testSchedules[2]);

    expect(schedule).toBe('At 2 sec past the min, between 12:00 and 15:59, on day 6 of th>');
    expect(cronArray.length).toEqual(testSchedules[2].split(';').length);
    expect(cronArray[0].cronExpression).toEqual(testSchedules[2].split(';').map((s) => s.trim())[0]);
    expect(cronArray[1].cronExpression).toEqual(testSchedules[2].split(';').map((s) => s.trim())[1]);
    expect(cronArray[2].cronExpression).toEqual(testSchedules[2].split(';').map((s) => s.trim())[2]);
    expect(cronArray[0].cronSchedule).toBe(
      'At 2 seconds past the minute, between 12:00 and 15:59, on day 6 of the month',
    );
    expect(cronArray[1].cronSchedule).toBe('Every minute, only in April and June');
    expect(cronArray[2].cronSchedule).toBe(
      'On the hour, every 12 hours, every 6 days in a month, between day 2 and 30 of the month, and on Thursday',
    );
  });

  it('sets empty schedule', () => {
    const { schedule, cronArray } = setSchedule('');

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
  it('runs a compound cron job', () => {
    const { cronArray } = setSchedule(testSchedules[2]);
    const { cronJobs, nextDatesArray } = runCronJobs(cronArray, () => {
      console.log('Cron job running');
    });

    expect(cronJobs).toBeDefined();
    expect(cronJobs.length).toEqual(cronArray.length);
    expect(nextDatesArray).toBeDefined();
    expect(nextDatesArray.length).toEqual(cronArray.length);
    expect(nextDatesArray[0]).toBeDefined();
    expect(nextDatesArray[0].length).toEqual(5);
    expect(nextDatesArray).toEqual(testNextDates);
  });

  it('runs an empty cron job', () => {
    const { cronArray } = setSchedule('');
    const { cronJobs, nextDatesArray } = runCronJobs(cronArray, () => {
      console.log('Cron job running');
    });

    expect(cronJobs).toBeDefined();
    expect(cronJobs.length).toEqual(0);
    expect(nextDatesArray).toBeDefined();
    expect(nextDatesArray.length).toEqual(cronArray.length);
    expect(nextDatesArray[0]).toBeUndefined();
  });
});

describe('Test stopping the cron jobs', () => {
  it('stops the cron jobs', () => {
    const { cronArray } = setSchedule(testSchedules[2]);
    const { cronJobs } = runCronJobs(cronArray, () => {
      console.log('Cron job running');
    });
    const spy = vi.spyOn(cronJobs[0], 'destroy');

    const { stoppedCronJobs, lastDates } = stopCronJobs(cronJobs);
    expect(stoppedCronJobs).toBeDefined();
    expect(stoppedCronJobs.length).toEqual(cronArray.length);
    expect(lastDates).toBeDefined();
    expect(lastDates.length).toEqual(0);
    expect(spy).toHaveBeenCalled();
  });
});
