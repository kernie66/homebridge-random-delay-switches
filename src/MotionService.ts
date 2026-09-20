// homebridge-random-delay-switches/lib/MotionService.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate';

import type RdsAccessory from './RdsAccessory.js';
import type { SwitchServiceParams } from './typings/SwitchTypes.js';

import { waitSeconds } from './utils/timeUtils.js';

type MotionServiceValues = {
  motion: boolean;
  lastActivation: Date;
  statusFault: number;
};

export default class MotionService extends ServiceDelegate<RdsAccessory['platform'], MotionServiceValues> {
  constructor(motionAccessory: RdsAccessory, params: SwitchServiceParams) {
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
    motionAccessory.on('trigger', (value: boolean) => {
      this.doMotion(value);
    });
  }

  doMotion(value: boolean) {
    void (async () => {
      this.debug('Motion sensor got trigger with value: %s', value);
      this.values.motion = value;
      await waitSeconds(3);
      this.values.motion = false;
      this.log('End motion');
    })();
  }
}
