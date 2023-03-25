// homebridge-random-delay-switches/lib/SwitchService.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict';

const homebridgeLib = require('homebridge-lib');
const AbortController = require('abort-controller');
const CronJob = require('cron').CronJob;
const cronstrue = require('cronstrue');
const DateTime = require('luxon').DateTime;
const RdsTypes = require('./RdsTypes');
const getTimestamp = RdsTypes.getTimestamp;
const wait = RdsTypes.wait;
const toTime = RdsTypes.toTime;
const toSeconds = RdsTypes.toSeconds;

class SwitchService extends homebridgeLib.ServiceDelegate {
  constructor(switchAccessory, params = {}) {
    params.name = switchAccessory.name;
    params.Service = switchAccessory.Services.hap.Switch;
    super(switchAccessory, params);
    // this.delay = switchAccessory.delay
    // this.minDelay = switchAccessory.minDelay
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
    this.timeout = params.timeout;

    let newDelay = switchAccessory.delay.split(':');
    let delayValue = toSeconds(newDelay.reverse());
    if (delayValue > 863999) {
      delayValue = 863999;
      this.warn('Too large delay time, reset to maximum allowed');
    }
    this.debug('Delay value: %s', delayValue);
    this.delay = delayValue < 0 ? 0 : delayValue;

    let minDelayValue = 1;
    this.debug('Min delay config: %s', switchAccessory.minDelay);
    if (switchAccessory.minDelay) {
      let newMinDelay = switchAccessory.minDelay.split(':');
      minDelayValue = toSeconds(newMinDelay.reverse());
      if (minDelayValue > 863999) {
        minDelayValue = 863999;
        this.warn(
          'Too large min delay time, reset to maximum allowed'
        );
      }
    }
    this.debug('Min delay value: %s', minDelayValue);
    this.minDelay = minDelayValue < 0 ? 0 : minDelayValue;

    this.time = toTime(this.delay);
    this.debug(
      'Seconds to time: %s = %s days and %s:%s:%s',
      this.delay,
      this.time.days,
      this.time.hours,
      this.time.minutes,
      this.time.seconds
    );
    this.minDelayPercentage = (
      (this.minDelay / this.delay) *
      100
    ).toFixed();
    this.debug('Min delay = %d%', this.minDelayPercentage);

    this.addCharacteristicDelegate({
      key: 'on',
      Characteristic: this.Characteristics.hap.On,
      value: false,
    })
      .on('didSet', (value) => {
        this.switchOn = value;
        this.debug("Calling 'setOn' with value %s", this.switchOn);
        this.setOn(switchAccessory);
      })
      .on('didTouch', (value) => {
        if (!this.singleActivation) {
          this.switchOn = value;
          this.debug("Repeat 'setOn' with value %s", this.switchOn);
          this.setOn(switchAccessory);
        } else {
          this.debug('Multiple activations disabled');
        }
      });

    this.addCharacteristicDelegate({
      key: 'delay',
      value: this.delay,
      Characteristic: this.rds.Characteristics.Delay,
    });

    this.addCharacteristicDelegate({
      key: 'minDelay',
      value: this.minDelay,
      Characteristic: this.rds.Characteristics.MinDelay,
    });

    this.addCharacteristicDelegate({
      key: 'minDelayPercentage',
      value: this.minDelayPercentage,
      Characteristic: this.rds.Characteristics.MinDelayPercentage,
    }).on('didSet', (value) => {
      this.values.minDelay = (this.values.delay * value) / 100;
    });

    this.addCharacteristicDelegate({
      key: 'delayDays',
      value: this.time.days,
      Characteristic: this.rds.Characteristics.DelayDays,
    }).on('didSet', (value) => {
      this.values.delay =
        value * 24 * 3600 +
        this.values.delayHours * 3600 +
        this.values.delayMinutes * 60 +
        this.values.delaySeconds;
      this.values.minDelay =
        (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      key: 'delayHours',
      value: this.time.hours,
      Characteristic: this.rds.Characteristics.DelayHours,
    }).on('didSet', (value) => {
      this.values.delay =
        this.values.delayDays * 24 * 3600 +
        value * 3600 +
        this.values.delayMinutes * 60 +
        this.values.delaySeconds;
      this.values.minDelay =
        (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      key: 'delayMinutes',
      value: this.time.minutes,
      Characteristic: this.rds.Characteristics.DelayMinutes,
    }).on('didSet', (value) => {
      this.values.delay =
        this.values.delayDays * 24 * 3600 +
        this.values.delayHours * 3600 +
        value * 60 +
        this.values.delaySeconds;
      this.values.minDelay =
        (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      key: 'delaySeconds',
      value: this.time.seconds,
      Characteristic: this.rds.Characteristics.DelaySeconds,
    }).on('didSet', (value) => {
      this.values.delay =
        this.values.delayDays * 24 * 3600 +
        this.values.delayHours * 3600 +
        this.values.delayMinutes * 60 +
        value;
      this.values.minDelay =
        (this.values.delay * this.values.minDelayPercentage) / 100;
    });

    this.addCharacteristicDelegate({
      key: 'timeout',
      value: 0,
      Characteristic: this.rds.Characteristics.TimeOut,
    });

    this.addCharacteristicDelegate({
      key: 'timeLeft',
      silent: true,
      Characteristic: this.rds.Characteristics.TimeLeft,
    });

    this.addCharacteristicDelegate({
      key: 'timestamp',
      silent: true,
      Characteristic: this.rds.Characteristics.Timestamp,
    });

    this.addCharacteristicDelegate({
      key: 'random',
      value: this.random,
      Characteristic: this.rds.Characteristics.Random,
    });

    this.addCharacteristicDelegate({
      key: 'repeats',
      value: this.repeats,
      Characteristic: this.rds.Characteristics.Repeats,
    }).on('didSet', (value) => {
      if (value === -1) {
        this.values.infiniteRepeats = true;
        wait(500);
        this.values.repeats = 0;
        this.log('Reverted repeats = -1 to infinite repeats');
      }
    });

    this.addCharacteristicDelegate({
      key: 'infiniteRepeats',
      value: this.infiniteRepeats,
      Characteristic: this.rds.Characteristics.InfiniteRepeats,
    });

    if (this.values.repeats === -1) {
      this.values.infiniteRepeats = true;
      this.values.repeats = 0;
      this.log('Converted repeats = -1 to infinite repeats');
    }

    this.addCharacteristicDelegate({
      key: 'repetition',
      props: {
        minValue: 0,
        maxValue: 65535,
      },
      silent: true,
      Characteristic: this.rds.Characteristics.Repetition,
    });

    this.addCharacteristicDelegate({
      key: 'cron',
      value: this.cronString,
      Characteristic: this.rds.Characteristics.Cron,
    }).on('didSet', (value) => {
      this.stopCronJobs(this.cronJobs);
      let schedule = this.getSchedule(value);
      if (schedule != 'Schedule disabled') {
        this.cronJobs = this.parseCron(value);
      }
      this.values.cronSchedule = schedule;
    });

    this.addCharacteristicDelegate({
      key: 'cronSchedule',
      value: this.cronSchedule,
      Characteristic: this.rds.Characteristics.CronSchedule,
    });

    this.addCharacteristicDelegate({
      key: 'setDefault',
      value: false,
      Characteristic: this.rds.Characteristics.Default,
    }).on('didSet', () => {
      this.setConfigValues();
    });

    this.addCharacteristicDelegate({
      key: 'heartrate',
      Characteristic: this.Characteristics.my.Heartrate,
      props: {
        minValue: 1,
        maxValue: 300,
        minStep: 1,
      },
      value: this.heartrate,
    });

    this.addCharacteristicDelegate({
      key: 'logLevel',
      Characteristic: this.Characteristics.my.LogLevel,
      value: switchAccessory.logLevel,
    });

    if (this.useConfig) {
      this.log('Restoring values from config file');
      this.setConfigValues();
    }

    // Start cron jobs, if defined
    this.cronJobs = [];
    // Check for persistent cron string, else use config
    let cronString = '';
    if (this.values.cron) {
      cronString = this.values.cron;
    } else if (this.cronString) {
      cronString = this.cronString;
    }
    let schedule = this.getSchedule(cronString);
    if (schedule != 'Schedule disabled') {
      this.cronJobs = this.parseCron(cronString);
    }
    this.values.cronSchedule = schedule;

    // Check if the switch was on before plugin started and not stateful
    if (this.values.on && this.values.delay) {
      this.continueSwitch(switchAccessory);
    }
    // Check if switch is to be set after a start of the plugin
    else if (this.values.startOnReboot) {
      this.initSwitch();
    }
    // Else make sure we have a clean start, no abort controllers
    else {
      this.timeUp = true;
    }
  }

  async initSwitch() {
    await wait(1000);
    this.log('Start the timer at reboot');
    this.values.on = true;
  }

  async continueSwitch(switchAccessory) {
    await wait(1000);
    this.log('Switch was on at reboot');
    this.switchOn = true; // Set to enable restart of timer
    this.timeUp = true; // Set to not try to abort the abort controller
    // Check if time left is less than 5 seconds, then use 5 seconds
    let delayValue = Math.max(
      this.values.timestamp - getTimestamp(),
      5
    );
    this.log('Delay time left = %d', delayValue);
    this.setOn(switchAccessory, delayValue);
  }

  async setConfigValues() {
    this.time = toTime(this.delay);
    this.values.delayDays = this.time.days;
    this.values.delayHours = this.time.hours;
    this.values.delayMinutes = this.time.minutes;
    this.values.delaySeconds = this.time.seconds;
    this.values.minDelay = this.minDelay;
    this.values.minDelayPercentage = (
      (this.minDelay / this.delay) *
      100
    ).toFixed();
    this.values.random = this.random;
    this.values.infiniteRepeats = this.infiniteRepeats;
    this.values.repeats = this.repeats;
    this.values.cron = this.cronString;
    this.values.heartrate = this.heartrate;
    await wait(500);
    this.values.setDefault = false;
  }

  getSchedule(cronString) {
    // Check if it is a string with at least 5 values, 4 spaces
    if (cronString) {
      if (cronString.length >= 9) {
        try {
          let scheduleArray = cronString.split(';');
          let schedule = '';
          let prefix = '';
          for (let i in scheduleArray) {
            let nextSchedule = cronstrue.toString(scheduleArray[i], {
              use24HourTimeFormat: true,
            });
            this.log('Schedule: %s', nextSchedule);
            schedule = schedule + prefix + nextSchedule;
            prefix = '; ';
          }
          if (schedule.length > 64) {
            schedule = schedule.replace(/second[s]?/g, 'sec');
            schedule = schedule.replace(/minute[s]?/g, 'min');
            if (schedule.length > 64) {
              schedule = schedule.substring(0, 62) + '>';
            }
          }
          return schedule;
        } catch (err) {
          this.warn('Error while parsing cron string: %s', err);
        }
      }
    }
    return 'Schedule disabled';
  }

  parseCron(cronString) {
    let cronArray = cronString.split(';');
    let cronJob;
    let cronJobs = [];
    for (let i in cronArray) {
      this.log('Cron job: %s', cronArray[i]);
      cronJob = this.runCronJob(cronArray[i]);
      cronJobs.push(cronJob);
    }
    this.log('CronJobs started: %d', cronJobs.length);
    return cronJobs;
  }

  stopCronJobs(cronJobs) {
    if (cronJobs.length) {
      this.log('CronJobs to stop: %d', cronJobs.length);
      for (let i in cronJobs) {
        try {
          cronJobs[i].stop();
          if (cronJobs[i].lastDate()) {
            this.log(
              'Stop cron job, last at %s',
              cronJobs[i].lastDate()
            );
          }
        } catch (err) {
          this.warn('Error stopping cron job: %s', err);
        }
      }
    } else {
      this.log('No active cron job to stop');
    }
  }

  runCronJob(cronString) {
    let cronJob;
    try {
      cronJob = new CronJob(cronString, () => {
        this.log('Running cron task');
        this.values.on = true;
      });
      cronJob.start();
      this.log('Starting cron job');
      let nextDates = cronJob.nextDates(5);
      let word = 'Next';
      for (let i in nextDates) {
        this.log(
          '%s at %s',
          word,
          nextDates[i].toLocaleString(
            DateTime.DATETIME_MED_WITH_SECONDS
          )
        );
        word = 'Then';
      }
    } catch (err) {
      this.warn('Error staring cron job: %s', err);
    }
    return cronJob;
  }

  async setOn(switchAccessory, delayValue) {
    // Add a delay so that values can be changed in scenes
    // before the switch is started
    await wait(100);
    let delayType = '';
    // Check if switch is turned off
    if (!this.switchOn) {
      // Check if the timer is active
      if (!this.timeUp) {
        try {
          this.debug('Aborting the timer before time is up');
          this.ac.abort();
        } catch (e) {
          this.warn('Error when aborting timer: %s', e.message);
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
          await wait(500); // Wait for the abort to complete
        } catch (e) {
          this.warn('Error when restarting timer: %s', e.message);
        }
        this.timeUp = true;
        this.timeLeft = 0;
      }
      this.ac = new AbortController();
      this.signal = this.ac.signal;
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
            this.values.minDelay +
              Math.random() *
                (this.values.delay - this.values.minDelay) +
              1
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
      this.log(
        'Starting the timer with %s delay: %d s',
        delayType,
        this.values.timeout
      );
      this.timeUp = false;
      this.values.timeLeft = this.values.timeout;
      try {
        await wait(this.values.timeout * 1000, {
          signal: this.signal,
        });
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
        if (
          this.values.repetition < this.values.repeats ||
          this.values.infiniteRepeats
        ) {
          await wait(2000); // Wait for the motion to complete, 2 s
          this.values.repetition += 1;
          this.log(
            'Restart, repetition number: %d of %s',
            this.values.repetition,
            this.values.infiniteRepeats
              ? 'infinite'
              : this.values.repeats
          );
          this.values.on = true;
        } else {
          this.values.repetition = 0;
        }
      } catch (err) {
        if (!err.message) {
          this.log('The current timer was stopped');
        } else {
          this.warn('The timer was aborted! %s', err.message);
        }
        this.values.repetition = 0;
        this.timeUp = true;
        this.values.timeLeft = 0;
        this.values.timestamp = 0;
      }
    }
  }
}

module.exports = SwitchService;
