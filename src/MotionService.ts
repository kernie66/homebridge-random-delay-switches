// homebridge-random-delay-switches/lib/MotionService.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate';

import { wait } from './utils/timeUtils.js';

export default class MotionService extends ServiceDelegate {
  constructor(motionAccessory, params = {}) {
    params.Service = motionAccessory.Services.hap.MotionSensor;
    super(motionAccessory, params);
    this.addCharacteristicDelegate({
      Characteristic: this.Characteristics.hap.MotionDetected,
      key: 'motion',
    });
    this.addCharacteristicDelegate({
      Characteristic: this.Characteristics.eve.LastActivation,
      key: 'lastActivation',
      silent: true,
    });
    this.addCharacteristicDelegate({
      Characteristic: this.Characteristics.hap.StatusFault,
      key: 'statusFault',
      silent: true,
    });
    motionAccessory.on('trigger', (value) => {
      this.doMotion(value);
    });
  }

  async doMotion(value) {
    this.debug('Motion sensor got trigger with value: %s', value);
    this.values.motion = value;
    await wait(3000);
    this.values.motion = false;
    this.log('End motion');
  }
}
