import { CronJob, validateCronExpression } from 'cron';
import cronstrue from 'cronstrue';

export const setSchedule = (cronString: string) => {
  let cronArray: string[] = [];
  let schedule = '';
  let prefix = '';
  const scheduleArray: string[] = [];

  // Create an array of cron expressions from the cronString,
  // validate each expression, and convert it to a human-readable schedule
  if (cronString) {
    // Split the cronString into an array of cron expressions, trimming whitespace
    cronArray = cronString.split(';').map((expr) => expr.trim());
    for (const cronExpr of cronArray) {
      const cronValidation = validateCronExpression(cronExpr);
      if (cronValidation.error) {
        throw new TypeError(`cronString must be in the format '(second) minute hour * * *': ${cronValidation.error}`);
      }

      // Get the human-readable schedule for the cron expression
      const nextSchedule = cronstrue.toString(cronExpr, {
        use24HourTimeFormat: true,
      });
      // Append the human-readable schedule to the schedule string
      schedule = schedule + prefix + nextSchedule;
      prefix = '; ';
      // Add the human-readable schedule to the schedule array
      scheduleArray.push(nextSchedule);
    }
    // Truncate the schedule string to 64 characters if it exceeds the limit
    if (schedule.length > 64) {
      schedule = schedule.replaceAll(/second[s]?/g, 'sec');
      schedule = schedule.replaceAll(/minute[s]?/g, 'min');
      if (schedule.length > 64) {
        schedule = schedule.slice(0, 62) + '>';
      }
    }
  } else {
    schedule = 'Schedule disabled';
  }
  return { schedule, cronArray, scheduleArray };
};

export const parseCronString = (cronString: string | undefined) => {
  const cronArray: string[] = [];

  if (cronString) {
    const cronStrings = cronString.split(';');
    if (cronStrings.length) {
      for (const cronString of cronStrings) {
        const cronValidation = validateCronExpression(cronString);
        if (!cronValidation.valid) {
          throw new TypeError(`cronString must be in the format '(second) minute hour * * *'`);
        }
        cronArray.push(cronString);
      }
    }
  }
  return cronArray;
};

export const runCronJobs = (cronArray: string[], callback: () => void) => {
  for (const cronString of cronArray) {
    const cronJob = new CronJob(cronString, callback);
    cronJob.start();
    this.log('Starting cron job');
    const nextDates = cronJob.nextDates(5);
    let word = 'Next';
    for (const i in nextDates) {
      this.log('%s at %s', word, nextDates[i].toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS));
      word = 'Then';
    }
  }
};
