// homebridge-random-delay-switches/lib/SwitchService.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import type { ScheduledTask } from 'node-cron';

import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate';

import type RdsAccessory from './RdsAccessory.js';
import type RdsTypes from './RdsTypes.js';
import type { SwitchServiceParams } from './typings/SwitchTypes.js';

import { checkCronString, runCronJobs, setSchedule, stopCronJobs } from './utils/cronUtils.js';
import getErrorMessage from './utils/getErrorMessage.js';
import {
  getTimestamp,
  toDuration,
  timeToEveDate,
  toHumanTime,
  toSeconds,
  toTime,
  waitSeconds,
} from './utils/timeUtils.js';
// oxlint-disable-next-line import/no-unassigned-import
import 'temporal-polyfill/global';

type SwitchServiceValues = {
  on: boolean;
  delay: number;
  minDelay: number;
  minDelayPercentage: number;
  delayDays: number;
  delayHours: number;
  delayMinutes: number;
  delaySeconds: number;
  delayEnd: string;
  timeout: string;
  timestamp: number;
  random: boolean;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  repetition: number;
  infiniteRepeats: boolean;
  cron: string;
  cronString: string;
  cronSchedule: string;
  heartrate: number;
  useConfig: boolean;
  setDefault: boolean;
};

type DelayType = 'fixed' | 'random' | 'stateful' | 'continued' | 'unknown';

export default class SwitchService extends ServiceDelegate<RdsAccessory['platform'], SwitchServiceValues> {
  random: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  switchOn: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  cronString: string;
  cronJobs: ScheduledTask[];
  heartrate: number;
  useConfig: boolean;
  disableSensor: boolean;
  rds: RdsTypes;
  delay: number;
  minDelay: number;
  delayTime: Temporal.Duration;
  delayEnd: Temporal.Instant;
  timerActive: boolean;
  minDelayPercentage: number;
  ac: AbortController;
  acSignal: AbortSignal;

  constructor(switchAccessory: RdsAccessory, params: SwitchServiceParams) {
    params.name = switchAccessory.name;
    params.Service = switchAccessory.Services.hap.Switch;
    super(switchAccessory, params);
    this.delayTime = switchAccessory.delay;
    this.random = switchAccessory.random;
    this.repeats = switchAccessory.repeats;
    this.infiniteRepeats = switchAccessory.infiniteRepeats;
    this.switchOn = switchAccessory.switchOn;
    this.startOnReboot = switchAccessory.startOnReboot;
    this.singleActivation = switchAccessory.singleActivation;
    this.cronString = switchAccessory.cronString;
    this.heartrate = switchAccessory.heartrate;
    this.useConfig = switchAccessory.useConfig;
    this.disableSensor = switchAccessory.disableSensor;
    this.rds = switchAccessory.rds;
    this.timerActive = false;
    this.delayEnd = getTimestamp({ asTemporal: true });
    this.ac = new AbortController();
    this.acSignal = this.ac.signal;
    this.cronJobs = [];

    this.debug('** Switch configuration **');
    // Convert delay and minDelay from Temporal.Duration to seconds
    this.delay = toSeconds(switchAccessory.delay);
    this.debug('Delay value (config): %s', this.delay);

    this.minDelay = toSeconds(switchAccessory.minDelay);
    this.debug('Min delay value (config): %s', this.minDelay);

    this.debug('Delay from config is:', switchAccessory.delay.toLocaleString());
    this.minDelayPercentage = Math.round((this.minDelay / this.delay) * 100);
    this.debug('Min delay = %d %', this.minDelayPercentage);

    this.addCharacteristicDelegate({
      Characteristic: this.Characteristics.hap.On,
      key: 'on',
      value: false,
    })
      .on('didSet', async (value: boolean) => {
        await waitSeconds(0.1);
        this.switchOn = value;
        this.debug("Calling 'setOn' with value %s", this.switchOn);
        void this.setOn(switchAccessory);
        return value;
      })
      .on('didTouch', async (value: boolean) => {
        await waitSeconds(0.1);
        if (!this.singleActivation) {
          this.switchOn = value;
          this.debug("Repeat 'setOn' with value %s", this.switchOn);
          void this.setOn(switchAccessory);
        } else {
          this.debug('Multiple activations disabled');
        }
        return value;
      });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Delay,
      key: 'delay',
      value: this.delay,
    });
    this.debug('Persisted delay:', toHumanTime(this.values.delay));

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.MinDelay,
      key: 'minDelay',
      value: this.minDelay,
    }).on('didSet', (value: number) => {
      this.values.minDelay = Math.round(value);
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.MinDelayPercentage,
      key: 'minDelayPercentage',
      value: this.minDelayPercentage,
    }).on('didSet', (value: number) => {
      this.values.minDelay = (this.values.delay * value) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelayDays,
      key: 'delayDays',
      value: this.delayTime.days,
    }).on('didSet', (value: number) => {
      this.delayTime = this.delayTime.with({ days: value });
      this.values.delay = toSeconds(this.delayTime);
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelayHours,
      key: 'delayHours',
      value: this.delayTime.hours,
    }).on('didSet', (value: number) => {
      this.delayTime = this.delayTime.with({ hours: value });
      this.values.delay = toSeconds(this.delayTime);
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelayMinutes,
      key: 'delayMinutes',
      value: this.delayTime.minutes,
    }).on('didSet', (value: number) => {
      this.delayTime = this.delayTime.with({ minutes: value });
      this.values.delay = toSeconds(this.delayTime);
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelaySeconds,
      key: 'delaySeconds',
      value: this.delayTime.seconds,
    }).on('didSet', (value: number) => {
      this.delayTime = this.delayTime.with({ seconds: value });
      this.values.delay = toSeconds(this.delayTime);
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.TimeOut,
      key: 'timeout',
      value: 'Not set',
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelayEnd,
      key: 'delayEnd',
      value: 'Not set',
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Timestamp,
      key: 'timestamp',
      silent: true,
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Random,
      key: 'random',
      value: this.random,
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Repeats,
      key: 'repeats',
      props: {
        minValue: 0,
        maxValue: 10,
      },
      value: this.repeats,
    }).on('didSet', (value: number) => {
      if (value === -1) {
        void (async () => {
          this.values.infiniteRepeats = true;
          await waitSeconds(0.1);
          this.values.repeats = 0;
          this.log('Reverted repeats = -1 to infinite repeats');
        })();
      }
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.InfiniteRepeats,
      key: 'infiniteRepeats',
      value: this.infiniteRepeats,
    });

    if (this.values.repeats === -1) {
      this.values.infiniteRepeats = true;
      this.values.repeats = 0;
      this.log('Converted repeats = -1 to infinite repeats');
    }

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Repetition,
      key: 'repetition',
      props: {
        format: this.rds.Formats.UINT32,
        minValue: 0,
        maxValue: 65535,
      },
      silent: true,
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Cron,
      key: 'cron',
      value: this.cronString,
    }).on('didSet', (value: string) => {
      const { isValid, allErrors } = checkCronString(value);
      if (!isValid) {
        this.error(`Invalid cron string: ${allErrors.join(', ')}`);
        this.values.cron = '';
      } else {
        this.startCronJobs();
      }
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.CronSchedule,
      key: 'cronSchedule',
      value: 'Schedule disabled',
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Default,
      key: 'setDefault',
      value: false,
    }).on('didSet', () => {
      this.setConfigValues();
    });

    this.addCharacteristicDelegate({
      Characteristic: this.Characteristics.my.Heartrate,
      key: 'heartrate',
      props: {
        maxValue: 300,
        minStep: 1,
        minValue: 1,
      },
      value: this.heartrate,
    });

    this.addCharacteristicDelegate({
      Characteristic: this.Characteristics.my.LogLevel,
      key: 'logLevel',
      value: switchAccessory.logLevel,
    });

    if (this.useConfig) {
      this.log('Restoring values from config file');
      this.setConfigValues();
    }

    // Start cron jobs, if defined
    this.startCronJobs();

    // Check if the switch was on before plugin started and not stateful
    if (this.values.on && this.values.timestamp > 0) {
      this.continueSwitch(switchAccessory);
    }
    // Check if switch is to be set after a start of the plugin
    else if (this.startOnReboot) {
      this.initSwitch();
    }
    // Else make sure we have a clean start, no abort controllers
    else {
      this.timerActive = false;
    }
  }

  // Start cron jobs for this switch
  /**
   * Start the cron jobs for this switch.
   */
  startCronJobs() {
    // Stop any existing cron jobs
    if (this.cronJobs) {
      this.debug('Stopping existing cron jobs');
      stopCronJobs(this.cronJobs);
    }
    this.cronJobs = [];

    // Check for persistent cron string, else use config
    let cronString = this.cronString;
    if (this.values.cron) {
      cronString = this.values.cron;
    }

    // Set schedule from cron string
    const { cronArray, schedule } = setSchedule(cronString);

    // Check if a valid schedule was set
    if (schedule !== 'Schedule disabled') {
      const { cronJobs, nextDatesArray } = runCronJobs(cronArray, () => {
        this.debug(`timerActive: ${this.timerActive}, switchOn: ${this.switchOn}`);
        if (this.timerActive || this.switchOn) {
          this.log('Triggered cron job skipped, switch delay already in progress');
        } else {
          this.log('Cron job triggered');
          this.values.on = true;
        }
      });
      this.cronJobs = cronJobs;

      // Log the next dates for the cron jobs
      let word = 'Next';
      for (const nextDate of nextDatesArray) {
        this.log('%s at %s', word, nextDate);
        word = 'Then';
      }
    }

    // Set the cron schedule string
    this.values.cronSchedule = schedule;
  }

  initSwitch() {
    void (async () => {
      await waitSeconds(1);
      this.log('Start the timer at reboot');
      this.values.on = true;
    })();
  }

  continueSwitch(switchAccessory: RdsAccessory) {
    void (async () => {
      await waitSeconds(1);
      this.log('Switch was on at reboot');
      this.log('Originally set to end at %s', timeToEveDate(this.values.timestamp));
      this.switchOn = true; // Set to enable restart of timer
      this.timerActive = false; // Clear to not try to abort the abort controller

      // Check if time left is less than 5 seconds, then use 5 seconds
      const delayValue = Math.max(this.values.timestamp - getTimestamp(), 5);
      this.log('Delay time left set to %s', toHumanTime(delayValue));
      void this.setOn(switchAccessory, delayValue);
      this.debug('Switch continued...');
    })();
  }

  setConfigValues() {
    void (async () => {
      this.delayTime = toTime(this.delay);
      this.values.delayDays = this.delayTime.days;
      this.values.delayHours = this.delayTime.hours;
      this.values.delayMinutes = this.delayTime.minutes;
      this.values.delaySeconds = this.delayTime.seconds;
      this.values.minDelay = this.minDelay;
      this.values.minDelayPercentage = Math.round((this.minDelay / this.delay) * 100);
      this.values.random = this.random;
      this.values.infiniteRepeats = this.infiniteRepeats;
      this.values.repeats = this.repeats;
      this.values.cron = this.cronString;
      this.values.heartrate = this.heartrate;
      await waitSeconds(0.5);
      this.values.setDefault = false;
    })();
  }

  async setOn(switchAccessory: RdsAccessory, continueDelayValue: number = 0) {
    // Add a delay so that values can be changed in scenes
    // before the switch is started
    await waitSeconds(0.1);
    let delayType: DelayType = 'unknown';
    let timeout = toDuration(0);

    // Check if switch is turned off
    if (!this.switchOn) {
      // Check if the timer is active
      if (this.timerActive) {
        try {
          this.debug('Aborting the timer due to switch being turned off before time is up');
          this.ac.abort();
        } catch (error) {
          const message = getErrorMessage(error);
          this.warn('Error when aborting timer: %s', message);
        }
        this.values.repetition = 0;
        this.values.delayEnd = 'Not set';
        this.values.timestamp = 0;
        this.timerActive = false;
      }
      this.debug('Switch turned off');
      return;
    }

    // **** Actions when switch is turned on ****

    // Check if timer is already active
    if (this.timerActive) {
      try {
        this.log('Restarting/extending the timer...');
        this.ac.abort();
        await waitSeconds(0.5); // Wait for the abort to complete
      } catch (error) {
        const message = getErrorMessage(error);
        this.warn('Error when restarting timer: %s', message);
      }
      this.timerActive = false;
      timeout = toDuration(0);
    }

    // Determine the type of delay and the corresponding timeout
    // If continueDelayValue is provided, use it as the timeout and set delayType to 'continued'
    if (continueDelayValue) {
      delayType = 'continued';
      timeout = toDuration(continueDelayValue);
    }
    // If delay is 0, this is a stateful switch
    else if (this.values.delay === 0) {
      delayType = 'stateful';
      timeout = toDuration(0);
    }
    // If random is set, calculate the random delay to use
    else if (this.values.random) {
      delayType = 'random';
      timeout = toDuration(
        Math.max(1, Math.round(this.values.minDelay + Math.random() * (this.values.delay - this.values.minDelay))),
      );
    }
    // Otherwise, use the fixed delay
    else {
      delayType = 'fixed';
      timeout = toDuration(this.values.delay);
    }

    // Exit early for stateful switches
    if (delayType === 'stateful') {
      this.values.timeout = 'Stateful';
      this.debug('Stateful switch turned on');
      return;
    }

    // Set the timeout value to show in Eve
    this.values.timeout = toHumanTime(timeout);

    // Determine the end of the delay
    this.delayEnd = getTimestamp({ asTemporal: true, offset: timeout });
    this.values.delayEnd = timeToEveDate(this.delayEnd);

    // Set the Unix timestamp for the end of the delay
    this.values.timestamp = toSeconds(this.delayEnd);
    this.log('Starting the timer with %s delay: %s', delayType, this.values.timeout);

    try {
      this.timerActive = true;
      await waitSeconds(timeout.total('seconds'), this.acSignal);
      this.log('Time is up for %s switch!', delayType);
      this.values.delayEnd = 'Not set';
      this.values.timestamp = 0;
      this.values.on = false;
      this.switchOn = false;
      this.timerActive = false;

      // Trigger motion sensor if enabled
      if (!this.disableSensor) {
        this.log('Triggering motion sensor');
        switchAccessory.emit('trigger', true);
      }

      // Check if the switch should repeat
      if (this.values.repetition < this.values.repeats || this.values.infiniteRepeats) {
        await waitSeconds(3); // Wait for the motion to complete, 3 s
        this.values.repetition += 1;
        this.log(
          'Restart, repetition number: %d of %s',
          this.values.repetition,
          this.values.infiniteRepeats ? 'infinite' : this.values.repeats,
        );
        this.values.on = true;
      } else {
        this.values.repetition = 0;
      }
    } catch (error) {
      const message = getErrorMessage(error);

      if (message) {
        this.log('The current timer was stopped', message);
      } else {
        this.warn('The timer was aborted! %s', message);
      }
      this.values.repetition = 0;
      this.timerActive = false;
      this.values.delayEnd = 'Not set';
      this.values.timestamp = 0;
    }
  }
}
