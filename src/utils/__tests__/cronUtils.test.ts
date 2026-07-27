import { describe, expect, it } from 'vite-plus/test';

import { setSchedule } from '../cronUtils.ts';

const testSchedules = ['15 * * * 5 *', '5/30 * * * *; * * * * 4 *', '2 * 12-15 6 * *; * * * 4,6 *;* * 2/6 * 4'];

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
      'Every minute, every 6 days in a month, starting on day 2 of the month, and on Thursday',
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
