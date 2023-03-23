// homebridge-random-delay-switches/lib/RdsAccessory.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict';

const homebridgeLib = require('homebridge-lib');
const SwitchService = require('./SwitchService');
const MotionService = require('./MotionService');
const { History } = require('homebridge-lib/lib/ServiceDelegate');
const getTimestamp = require('./RdsTypes').getTimestamp;

class RdsAccessory extends homebridgeLib.AccessoryDelegate {
  constructor(platform, params) {
    super(platform, params);
    this.delay = params.delay;
    this.random = params.random || false;
    this.minDelay = this.random ? params.minDelay : 0;
    this.disableSensor = params.disableSensor || false;
    this.startOnReboot = params.startOnReboot || false;
    this.singleActivation = params.singleActivation || false;
    this.repeats = params.repeats || 0;
    this.infiniteRepeats = params.infiniteRepeats;
    this.cronString = params.cronString;
    this.switchOn = this.startOnReboot;
    this.heartrate = params.heartrate || 15;
    this.useConfig = params.useConfig;
    this.rds = platform.rds;

    this.switchService = new SwitchService(this, {
      primaryService: true,
    });
    this.manageLogLevel(
      this.switchService.characteristicDelegate('logLevel')
    );

    if (!this.disableSensor) {
      this.motionService = new MotionService(this, {
        name: this.name,
      });
      params.motionDelegate =
        this.switchService.characteristicDelegate('motion');
      params.lastMotionDelegate =
        this.switchService.characteristicDelegate('lastActivation');
      this.historyService = new History(this, params);
    }
    this.debug('Accessory initialised');
    this.heartbeatEnabled = true;
    setImmediate(() => {
      this.emit('initialised');
    });
    this.on('heartbeat', async (beat) => {
      await this.heartbeat(beat);
    });
    this.on('shutdown', async () => {
      return this.shutdown();
    });
  }

  async shutdown() {
    this.debug('Nothing to do at shutdown');
  }

  async heartbeat(beat) {
    if (beat % this.switchService.values.heartrate === 0) {
      if (
        this.switchService.values.timestamp > 0 &&
        this.switchService.switchOn
      ) {
        this.switchService.values.timeLeft =
          this.switchService.values.timestamp - getTimestamp();
      }
    }
  }
}

module.exports = RdsAccessory;
