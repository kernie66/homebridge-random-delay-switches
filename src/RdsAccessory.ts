// homebridge-random-delay-switches/lib/RdsAccessory.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import type { History } from 'homebridge-lib/ServiceDelegate/History';

import { AccessoryDelegate } from 'homebridge-lib/AccessoryDelegate';
import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate';

import type RdsPlatform from './RdsPlatform.js';
import type RdsTypes from './RdsTypes.js';
import type { SwitchAccessoryParams } from './typings/SwitchTypes.js';

import MotionService from './MotionService.js';
import SwitchService from './SwitchService.js';
import { getTimestamp } from './utils/timeUtils.js';

type RdsAccessoryValues = {
  delay: number;
  random: boolean;
  minDelay: number;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  cronString?: string;
  heartrate: number;
  useConfig: boolean;
};

export default class RdsAccessory extends AccessoryDelegate<RdsPlatform, RdsAccessoryValues> {
  delay: string;
  random: boolean;
  minDelay: string;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  cronString?: string;
  switchOn: boolean;
  heartrate: number;
  useConfig: boolean;
  rds: RdsTypes;
  switchService: SwitchService;
  motionService?: MotionService;
  historyService?: History;

  constructor(platform: RdsPlatform, params: SwitchAccessoryParams) {
    super(platform, params);
    this.delay = params.delay;
    this.random = params.random || false;
    this.minDelay = this.random ? params.minDelay : '0';
    this.disableSensor = params.disableSensor || false;
    this.startOnReboot = params.startOnReboot || false;
    this.singleActivation = params.singleActivation || false;
    this.repeats = params.repeats || 0;
    this.infiniteRepeats = params.infiniteRepeats || false;
    this.cronString = params.cronString;
    this.switchOn = this.startOnReboot;
    this.heartrate = params.heartrate || 15;
    this.useConfig = params.useConfig;
    this.rds = platform.rds;

    this.switchService = new SwitchService(this, {
      primaryService: true,
    });
    this.manageLogLevel(this.switchService.characteristicDelegate('logLevel'));

    if (!this.disableSensor) {
      this.motionService = new MotionService(this, {
        name: this.name,
      });
      this.historyService = new ServiceDelegate.History(this, {
        motionDelegate: this.motionService.characteristicDelegate('motion'),
        lastMotionDelegate: this.motionService.characteristicDelegate('lastActivation'),
      });
    }
    this.debug('Accessory initialised');
    this.heartbeatEnabled = true;
    setImmediate(() => {
      this.emit('initialised');
    });
    this.on('heartbeat', async (beat: number): Promise<void> => {
      await this.heartbeat(beat);
    });
    this.on('shutdown', async () => {
      return this.shutdown();
    });
  }

  async shutdown() {
    this.debug('Nothing to do at shutdown');
  }

  async heartbeat(beat: number) {
    if (beat % this.switchService.values.heartrate === 0) {
      if (this.switchService.values.timestamp > 0 && this.switchService.switchOn) {
        this.switchService.values.timeLeft = this.switchService.values.timestamp - getTimestamp();
      }
    }
  }
}
