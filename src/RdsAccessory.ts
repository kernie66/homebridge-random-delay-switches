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

// oxlint-disable-next-line import/no-unassigned-import
import 'homebridge-lib/ServiceDelegate/History';
// oxlint-disable-next-line import/no-unassigned-import
import 'temporal-polyfill';

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
  delay: Temporal.Duration;
  minDelay: Temporal.Duration;
  random: boolean;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  cronString: string;
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
    this.random = params.random ?? false;
    this.minDelay = this.random ? params.minDelay : Temporal.Duration.from({ seconds: 1 });
    this.disableSensor = params.disableSensor ?? false;
    this.startOnReboot = params.startOnReboot ?? false;
    this.singleActivation = params.singleActivation ?? false;
    this.repeats = params.repeats ?? 0;
    this.infiniteRepeats = params.infiniteRepeats ?? false;
    this.cronString = params.cronString;
    this.switchOn = this.startOnReboot;
    this.heartrate = params.heartrate ?? 15;
    this.useConfig = params.useConfig;
    this.rds = platform.rds;

    this.switchService = new SwitchService(this, {
      primaryService: true,
    });
    this.manageLogLevel(this.switchService.characteristicDelegate('logLevel'));

    if (!this.disableSensor) {
      this.motionService = new MotionService(this, {
        name: this.name, // + ' Motion',
        hidden: true,
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
    this.on('identify', () => {
      this.log('Identify OK, current delay:', this.delay.toLocaleString());
    });
    this.on('shutdown', async () => {
      await this.shutdown();
      return;
    });
  }

  async shutdown() {
    this.debug('Nothing to do at shutdown');
  }

  async heartbeat(beat: number) {
    if (beat % this.switchService.values.heartrate === 0) {
      if (this.switchService.values.timestamp > 0 && this.switchService.switchOn) {
        //   this.switchService.timeLeft = this.switchService.values.timestamp - getTimestamp();
        //   this.switchService.values.timeLeft = setTimeString(this.switchService.timeLeft);
      }
    }
  }
}
