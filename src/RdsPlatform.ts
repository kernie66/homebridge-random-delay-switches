// homebridge-random-delay-switches/lib/RdsPlatform.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import type { API, Logging } from 'homebridge';

import { OptionParser } from 'homebridge-lib/OptionParser';
import { Platform } from 'homebridge-lib/Platform';
import { once } from 'node:events';

import type { ConfigJson } from './typings/ConfigJsonTypes.js';

import RdsAccessory from './RdsAccessory.js';

// const events = require('events');
// const homebridgeLib = require('homebridge-lib');
// const RdsAccessory = require('./RdsAccessory');
// const RT = require('./RdsTypes');
// const RdsTypes = RT.RdsTypes;

class RdsPlatform extends Platform<RdsPlatform> {
  config: ConfigJson;

  constructor(log: Logging, configJson: ConfigJson, homebridge: API) {
    super(log, configJson, homebridge);
    this.once('heartbeat', this.init);
    this.config = {
      name: 'RandomDelaySwitches',
    };
    const UUIDGen = homebridge.hap.uuid;
    this.rds = new RdsTypes(homebridge);
    this.debug('Characteristics: %s', this.rds.Characteristics);

    const mainOptionParser = new OptionParser(this.config, true);
    mainOptionParser
      .stringKey('name')
      .stringKey('platform')
      .arrayKey('delaySwitches')
      .on('userInputError', (error: string) => {
        throw new TypeError(`config.json: ${error}`);
      });
    try {
      mainOptionParser.parse(configJson);
      if (this.config.delaySwitches.length === 0) {
        this.warn('config.json: no delay switches');
      }
      this.switchAccessories = {};
      const validSwitches = [];
      for (const i in this.config.delaySwitches) {
        const delaySwitch = this.config.delaySwitches[i];
        const config = {};
        const switchOptionParser = new OptionParser(config, true);
        switchOptionParser
          .stringKey('name')
          .stringKey('delay')
          .stringKey('minDelay')
          .boolKey('random')
          .boolKey('disableSensor')
          .boolKey('startOnReboot')
          .boolKey('singleActivation')
          .intKey('repeats', -1, 10)
          .boolKey('infiniteRepeats')
          .stringKey('cronString')
          .intKey('heartrate', 1, 300)
          .boolKey('useConfig')
          .on('userInputError', (error: string) => {
            throw new TypeError(`config.json: delaySwitches[${i}]: ${error}`);
          });
        switchOptionParser.parse(delaySwitch);
        if (config.name === null) {
          config.name = `RndDly-${config.delay}s`;
        }
        // Backwards compatibility: 'repeats' = -1 meant infinite repeats
        if (config.repeats === -1) {
          config.infiniteRepeats = true;
          config.repeats = 0;
          this.log('Converting repeats = -1 to infiniteRepeats = true for', config.name);
        }
        config.prefix = config.random ? 'Random ' : 'Fixed ';
        config.uuid = UUIDGen.generate(config.name);
        this.debug('Found switch: %s', config.name);
        validSwitches.push(config);
      }
      this.config.delaySwitches = validSwitches;
    } catch (error) {
      this.fatal(error);
    }
    this.debug('config: %j', this.config);
  }

  async init() {
    const jobs = [];
    for (const delaySwitch of this.config.delaySwitches) {
      const switchParams = {
        category: this.Accessory.Categories.Switch,
        cronString: delaySwitch.cronString,
        delay: delaySwitch.delay,
        disableSensor: delaySwitch.disableSensor,
        heartrate: delaySwitch.heartrate,
        id: delaySwitch.uuid,
        infiniteRepeats: delaySwitch.infiniteRepeats,
        manufacturer: 'Homebridge',
        minDelay: delaySwitch.minDelay,
        model: `${delaySwitch.prefix}Delay-${delaySwitch.delay}s`,
        name: delaySwitch.name,
        random: delaySwitch.random,
        repeats: delaySwitch.repeats,
        singleActivation: delaySwitch.singleActivation,
        startOnReboot: delaySwitch.startOnReboot,
        useConfig: delaySwitch.useConfig,
      };
      const switchAccessory = new RdsAccessory(this, switchParams);
      jobs.push(once(switchAccessory, 'initialised'));
      this.switchAccessories[delaySwitch] = switchAccessory;
    }
    for (const job of jobs) {
      await job;
    }
    this.debug('initialised');
    this.emit('initialised');
  }
}

export default RdsPlatform;
