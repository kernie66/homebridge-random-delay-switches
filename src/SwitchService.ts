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
import { getTimestamp, toSeconds, toTime, wait } from './utils/timeUtils.js';
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
  timeout: number;
  timeLeft: number;
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
  time: Temporal.Duration;
  timeUp: boolean;
  timeLeft: number;
  minDelayPercentage: number;
  ac: AbortController;
  acSignal: AbortSignal;

  constructor(switchAccessory: RdsAccessory, params: SwitchServiceParams) {
    params.name = switchAccessory.name;
    params.Service = switchAccessory.Services.hap.Switch;
    super(switchAccessory, params);
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
    this.timeUp = false;
    this.timeLeft = 0;
    this.ac = new AbortController();
    this.acSignal = this.ac.signal;
    this.cronJobs = [];

    // Convert delay and minDelay from strings to seconds
    this.delay = toSeconds(switchAccessory.delay);
    this.debug('Delay value: %s', this.delay);

    this.minDelay = toSeconds(switchAccessory.minDelay);
    this.debug('Min delay value: %s', this.minDelay);

    this.time = toTime(this.delay);
    this.debug('Delay is: ', switchAccessory.delay.toLocaleString());
    this.minDelayPercentage = Math.round((this.minDelay / this.delay) * 100);
    this.debug('Min delay = %d%', this.minDelayPercentage);

    this.addCharacteristicDelegate({
      Characteristic: this.Characteristics.hap.On,
      key: 'on',
      value: false,
    })
      .on('didSet', (value: boolean) => {
        this.switchOn = value;
        this.debug("Calling 'setOn' with value %s", this.switchOn);
        void this.setOn(switchAccessory);
      })
      .on('didTouch', (value: boolean) => {
        if (!this.singleActivation) {
          this.switchOn = value;
          this.debug("Repeat 'setOn' with value %s", this.switchOn);
          void this.setOn(switchAccessory);
        } else {
          this.debug('Multiple activations disabled');
        }
      });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.Delay,
      key: 'delay',
      value: this.delay,
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.MinDelay,
      key: 'minDelay',
      value: this.minDelay,
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
      value: this.time.days,
    }).on('didSet', (value: number) => {
      this.values.delay =
        value * 24 * 3600 + this.values.delayHours * 3600 + this.values.delayMinutes * 60 + this.values.delaySeconds;
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelayHours,
      key: 'delayHours',
      value: this.time.hours,
    }).on('didSet', (value: number) => {
      this.values.delay =
        this.values.delayDays * 24 * 3600 + value * 3600 + this.values.delayMinutes * 60 + this.values.delaySeconds;
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelayMinutes,
      key: 'delayMinutes',
      value: this.time.minutes,
    }).on('didSet', (value: number) => {
      this.values.delay =
        this.values.delayDays * 24 * 3600 + this.values.delayHours * 3600 + value * 60 + this.values.delaySeconds;
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.DelaySeconds,
      key: 'delaySeconds',
      value: this.time.seconds,
    }).on('didSet', (value: number) => {
      this.values.delay =
        this.values.delayDays * 24 * 3600 + this.values.delayHours * 3600 + this.values.delayMinutes * 60 + value;
      this.values.minDelay = (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.TimeOut,
      key: 'timeout',
      value: 0,
    });

    this.addCharacteristicDelegate({
      Characteristic: this.rds.Characteristics.TimeLeft,
      key: 'timeLeft',
      silent: true,
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
          await wait(0.1);
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
    if (this.values.on && this.values.delay) {
      this.continueSwitch(switchAccessory);
    }
    // Check if switch is to be set after a start of the plugin
    else if (this.startOnReboot) {
      this.initSwitch();
    }
    // Else make sure we have a clean start, no abort controllers
    else {
      this.timeUp = true;
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
        this.debug(`timeUp: ${this.timeUp}, switchOn: ${this.switchOn}`);
        if (!this.timeUp || this.switchOn) {
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
      await wait(100);
      this.log('Start the timer at reboot');
      this.values.on = true;
    })();
  }

  continueSwitch(switchAccessory: RdsAccessory) {
    void (async () => {
      await wait(100);
      this.log('Switch was on at reboot');
      this.switchOn = true; // Set to enable restart of timer
      this.timeUp = true; // Set to not try to abort the abort controller
      // Check if time left is less than 5 seconds, then use 5 seconds
      const delayValue = Math.max(this.values.timestamp - getTimestamp(), 5);
      this.log('Delay time left = %d', delayValue);
      void this.setOn(switchAccessory, delayValue);
    })();
  }

  setConfigValues() {
    void (async () => {
      this.time = toTime(this.delay);
      this.values.delayDays = this.time.days;
      this.values.delayHours = this.time.hours;
      this.values.delayMinutes = this.time.minutes;
      this.values.delaySeconds = this.time.seconds;
      this.values.minDelay = this.minDelay;
      this.values.minDelayPercentage = Math.round((this.minDelay / this.delay) * 100);
      this.values.random = this.random;
      this.values.infiniteRepeats = this.infiniteRepeats;
      this.values.repeats = this.repeats;
      this.values.cron = this.cronString;
      this.values.heartrate = this.heartrate;
      await wait(0.5);
      this.values.setDefault = false;
    })();
  }

  async setOn(switchAccessory: RdsAccessory, delayValue: number = 0) {
    // Add a delay so that values can be changed in scenes
    // before the switch is started
    await wait(0.1);
    let delayType = '';
    // Check if switch is turned off
    if (!this.switchOn) {
      // Check if the timer is active
      if (!this.timeUp) {
        try {
          this.debug('Aborting the timer before time is up');
          this.ac.abort();
        } catch (error) {
          const message = getErrorMessage(error);
          this.warn('Error when aborting timer: %s', message);
        }
        this.timeUp = true;
        this.timeLeft = 0;
      }
      // Actions when switch is turned on
    } else {
      // Check if timer is already active
      if (!this.timeUp) {
        try {
          this.log('Restarting/extending the timer...');
          this.ac.abort();
          await wait(0.5); // Wait for the abort to complete
        } catch (error) {
          const message = getErrorMessage(error);
          this.warn('Error when restarting timer: %s', message);
        }
        this.timeUp = true;
        this.timeLeft = 0;
      }
      // Check if this is a continued start after restart
      if (delayValue) {
        this.values.timeout = delayValue;
        delayType = 'continued';
      } else {
        if (this.values.minDelay > this.values.delay) {
          this.values.minDelay = this.values.delay;
        }
        // Set the delay time and type
        if (this.values.random) {
          this.values.timeout = Math.floor(
            this.values.minDelay + Math.random() * (this.values.delay - this.values.minDelay) + 1,
          );
          delayType = 'random';
        } else if (!this.values.delay) {
          this.values.timeout = 0;
          delayType = 'stateful';
        } else {
          this.values.timeout = this.values.delay;
          delayType = 'fixed';
        }
      }
      // Set the Unix timestamp for the end of the delay
      this.values.timestamp = getTimestamp() + this.values.timeout;
      this.log('Starting the timer with %s delay: %d s', delayType, this.values.timeout);
      this.timeUp = false;
      this.values.timeLeft = this.values.timeout;
      try {
        await wait(this.values.timeout, this.acSignal);
        this.log('Time is up!');
        this.timeUp = true;
        this.values.timeLeft = 0;
        this.values.timestamp = 0;
        // Only turn off the switch if delay > 0, else stateful switch
        if (this.values.timeout) {
          this.values.on = false;
          this.switchOn = false;
        }
        if (!this.disableSensor) {
          this.log('Triggering motion sensor');
          switchAccessory.emit('trigger', true);
        }
        if (this.values.repetition < this.values.repeats || this.values.infiniteRepeats) {
          await wait(2); // Wait for the motion to complete, 2 s
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
          this.log('The current timer was stopped');
        } else {
          this.warn('The timer was aborted! %s', message);
        }
        this.values.repetition = 0;
        this.timeUp = true;
        this.values.timeLeft = 0;
        this.values.timestamp = 0;
      }
    }
  }
}
