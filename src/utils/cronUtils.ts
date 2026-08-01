import type { LastRun, ScheduledTask } from 'node-cron';

import cronstrue from 'cronstrue';
import { schedule as scheduleCron, shutdown, validateDetailed } from 'node-cron';

import { isoDateTimeToEveDate } from './timeUtils.js';

export type CronArray = Array<{
  cronExpression: string;
  cronSchedule: string;
}>;

export const checkCronString = (cronString: string) => {
  let isValid = true;
  let allErrors: string[] = [];
  if (cronString) {
    const cronExpressions = cronString.split(';').map((expr) => expr.trim());
    for (const cronExpression of cronExpressions) {
      const { valid, errors } = validateDetailed(cronExpression);
      if (!valid) {
        isValid = false;
        allErrors.push(...errors.map((e) => e.message));
      }
    }
  } else {
    allErrors.push('No cronString defined');
  }
  return { isValid, allErrors };
};

export const setSchedule = (cronString: string) => {
  let cronArray: CronArray = [];
  let schedule = '';
  let prefix = '';

  // Create an array of cron expressions from the cronString,
  // validate each expression, and convert it to a human-readable schedule
  if (cronString) {
    // Split the cronString into an array of cron expressions, trimming whitespace
    const cronExpressions = cronString.split(';').map((expr) => expr.trim());
    for (const cronExpression of cronExpressions) {
      const { valid, errors } = validateDetailed(cronExpression);
      if (!valid) {
        throw new TypeError(
          `cronString must be in the format '(second) minute hour * * *': ${errors.map((e) => e.message).join(', ')}`,
        );
      }

      // Get the human-readable schedule for the cron expression
      const cronSchedule = cronstrue.toString(cronExpression, {
        use24HourTimeFormat: true,
      });
      // Append the human-readable schedule to the schedule string
      schedule = schedule + prefix + cronSchedule;
      prefix = '; ';
      // Add the expression and the human-readable schedule to the cron array
      cronArray.push({ cronExpression, cronSchedule });
    }
    // Truncate the schedule string to 64 characters if it exceeds the limit
    if (schedule.length > 64) {
      schedule = schedule.replaceAll(/second[s]?/g, 'sec');
      schedule = schedule.replaceAll(/minute[s]?/g, 'min');
      if (schedule.length > 64) {
        schedule = `${schedule.slice(0, 62)}>`;
      }
    }
  } else {
    schedule = 'Schedule disabled';
  }
  return { cronArray, schedule };
};

export const runCronJobs = (cronArray: CronArray, callback: () => void) => {
  const cronJobs: ScheduledTask[] = [];
  const nextDatesArray: string[][] = [];
  if (cronArray.length === 0) return { cronJobs, nextDatesArray };

  for (const cronStr of cronArray) {
    // Create and run a cron job for each cron string
    const cronJob = scheduleCron(cronStr.cronExpression, callback, { name: cronStr.cronSchedule });
    cronJobs.push(cronJob);
    const nextDates = cronJob.getNextRuns(5).map((date) => isoDateTimeToEveDate(date));
    nextDatesArray.push(nextDates);
  }
  return { cronJobs, nextDatesArray };
};

export const stopCronJobs = (cronJobs: ScheduledTask[] = []) => {
  const stoppedCronJobs: string[] = [];
  let lastDates: LastRun[] = [];

  try {
    if (cronJobs.length) {
      for (const cronJob of cronJobs) {
        const lastDate = cronJob.lastRun();
        if (lastDate) {
          lastDates.push(lastDate);
        }
        // Inline task is synchronous
        void cronJob.destroy();
        const stoppedCronJob = `${cronJob.name} stopped`;
        stoppedCronJobs.push(stoppedCronJob);
      }
    }
  } catch (error) {
    throw new Error(`Error stopping cron job`, { cause: error });
  }
  return { stoppedCronJobs, lastDates };
};

export const shutdownCronJobs = async () => {
  await shutdown(1000);
};
