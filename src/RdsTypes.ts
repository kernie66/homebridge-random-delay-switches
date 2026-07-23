// homebridge-random-delay-switch/lib/RdsTypes.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Custom HomeKit Characteristics.

import type { API, Characteristic } from 'homebridge';

import { CustomHomeKitTypes } from 'homebridge-lib/CustomHomeKitTypes';

const regExps = {
  uuid: /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
  uuidPrefix: /^[0-9A-F]{1,8}$/,
  uuidSuffix: /^-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
};

function uuid(id: string, suffix = '-0000-1000-8000-656261617577') {
  //'-0000-1000-8000-0026BB765291') {
  if (typeof id !== 'string') {
    throw new TypeError('id: not a string');
  }
  if (!regExps.uuidPrefix.test(id)) {
    throw new RangeError(`id: ${id}: invalid id`);
  }
  if (typeof suffix !== 'string') {
    throw new TypeError('suffix: not a string');
  }
  if (!regExps.uuidSuffix.test(suffix)) {
    throw new RangeError(`suffix: ${suffix}: invalid suffix`);
  }
  return ('00000000' + id).slice(-8) + suffix;
}

let hap: API['hap'];

type RdsCharacteristics = {
  Delay: Characteristic;
  MinDelay: Characteristic;
  TimeOut: Characteristic;
  Repeats: Characteristic;
  Repetition: Characteristic;
  TimeLeft: Characteristic;
  Timestamp: Characteristic;
  Random: Characteristic;
  InfiniteRepeats: Characteristic;
  DelayDays: Characteristic;
  DelayHours: Characteristic;
  DelayMinutes: Characteristic;
  DelaySeconds: Characteristic;
  MinDelayPercentage: Characteristic;
  CronSchedule: Characteristic;
  Cron: Characteristic;
  Default: Characteristic;
};

export default class RdsTypes extends CustomHomeKitTypes<RdsCharacteristics> {
  constructor(homebridge: API) {
    super(homebridge);
    hap = homebridge.hap;

    this.createCharacteristicClass(
      'Delay',
      uuid('0A0'),
      {
        format: hap.Formats.UINT32,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE, hap.Perms.HIDDEN],
        unit: hap.Units.SECONDS,
      },
      'Delay time',
    );

    this.createCharacteristicClass(
      'MinDelay',
      uuid('0A1'),
      {
        format: hap.Formats.UINT32,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE, hap.Perms.HIDDEN],
        unit: hap.Units.SECONDS,
      },
      'Delay time (minimum)',
    );

    this.createCharacteristicClass(
      'TimeOut',
      uuid('0A2'),
      {
        format: hap.Formats.UINT32,
        minValue: 0,
        unit: hap.Units.SECONDS,
        //      maxValue: 3600,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY],
      },
      'Current timeout value',
    );

    this.createCharacteristicClass(
      'Repeats',
      uuid('0A3'),
      {
        format: hap.Formats.UINT8,
        maxValue: 10,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Repetitions (total)',
    );

    this.createCharacteristicClass(
      'Repetition',
      uuid('0A4'),
      {
        format: hap.Formats.UINT16,
        maxValue: 65_535,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY],
      },
      'Repetition (current)',
    );

    this.createCharacteristicClass(
      'TimeLeft',
      uuid('0A5'),
      {
        format: hap.Formats.UINT32,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY],
        unit: hap.Units.SECONDS,
      },
      'Time left of timer',
    );

    this.createCharacteristicClass(
      'Timestamp',
      uuid('0A6'),
      {
        format: hap.Formats.UINT32,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.HIDDEN],
        unit: hap.Units.SECONDS,
      },
      'Unix timestamp',
    );

    this.createCharacteristicClass(
      'Random',
      uuid('0A9'),
      {
        format: hap.Formats.BOOL,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Random enabled',
    );

    this.createCharacteristicClass(
      'InfiniteRepeats',
      uuid('0B2'),
      {
        format: hap.Formats.BOOL,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Infinite repeats',
    );

    this.createCharacteristicClass(
      'DelayDays',
      uuid('0AE'),
      {
        format: hap.Formats.UINT8,
        maxValue: 9,
        minStep: 1,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Delay time (Days)',
    );

    this.createCharacteristicClass(
      'DelayHours',
      uuid('0AA'),
      {
        format: hap.Formats.UINT8,
        maxValue: 23,
        minStep: 1,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Delay time (Hours)',
    );

    this.createCharacteristicClass(
      'DelayMinutes',
      uuid('0AB'),
      {
        format: hap.Formats.UINT8,
        maxValue: 59,
        minStep: 1,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Delay time (Minutes)',
    );

    this.createCharacteristicClass(
      'DelaySeconds',
      uuid('0AC'),
      {
        format: hap.Formats.UINT8,
        maxValue: 59,
        minStep: 1,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Delay time (Seconds)',
    );

    this.createCharacteristicClass(
      'MinDelayPercentage',
      uuid('0AD'),
      {
        format: hap.Formats.UINT8,
        maxValue: 100,
        minValue: 0,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
        unit: hap.Units.PERCENTAGE,
      },
      'Delay time minimum (%)',
    );

    this.createCharacteristicClass(
      'CronSchedule',
      uuid('0B0'),
      {
        format: hap.Formats.STRING,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY],
      },
      'Cron schedule',
    );

    this.createCharacteristicClass(
      'Cron',
      uuid('0B1'),
      {
        format: hap.Formats.STRING,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Cron',
    );

    this.createCharacteristicClass(
      'Default',
      uuid('0AF'),
      {
        format: hap.Formats.BOOL,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY, hap.Perms.PAIRED_WRITE],
      },
      'Restore default',
    );
  }
}
