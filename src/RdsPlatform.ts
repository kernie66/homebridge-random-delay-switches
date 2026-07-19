// homebridge-random-delay-switches/lib/RdsPlatform.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import type { API, Logging } from 'homebridge';

import { OptionParser } from 'homebridge-lib/OptionParser';
import { Platform } from 'homebridge-lib/Platform';
import { once } from 'node:events';
import { assert, is } from 'tsafe';

import type { ConfigJson } from './typings/ConfigJsonTypes.js';

import RdsAccessory from './RdsAccessory.js';
import RdsTypes from './RdsTypes.js';
import { SwitchAccessoryParams, SwitchConfigTypes } from './typings/SwitchTypes.js';
import { handleError, handleErrorSync } from './utils/handleError.js';

let hap: API['hap'];

class RdsPlatform extends Platform<RdsPlatform> {
  config: Partial<ConfigJson>;
  rds: RdsTypes;
  switchAccessories!: {
    [key: string]: RdsAccessory;
  };
  handleError: typeof handleError;
  handleErrorSync: typeof handleErrorSync;
  validSwitches: Array<Partial<SwitchConfigTypes>>;

  constructor(log: Logging, configJson: ConfigJson, homebridge: API) {
    super(log, configJson, homebridge);
    hap = homebridge.hap;

    this.once('heartbeat', this.init);
    this.config = {
      name: 'RandomDelaySwitches',
    };
    const UUIDGen = hap.uuid;
    this.rds = new RdsTypes(homebridge);
    this.handleError = handleError;
    this.handleErrorSync = handleErrorSync;
    this.debug('Characteristics: %s', this.rds.Characteristics);
    this.validSwitches = [];

    // Set up config parser for platform entries, store result in this.config
    const mainOptionParser = new OptionParser(this.config, true);
    mainOptionParser
      .stringKey('name')
      .stringKey('platform')
      .arrayKey('delaySwitches')
      .on('userInputError', (error: string) => {
        throw new TypeError(`config.json: ${error}`);
      });
    try {
      // Parse the platform config and validate required fields
      mainOptionParser.parse(configJson);

      this.switchAccessories = {};
      assert(is<Array<SwitchConfigTypes>>(this.config.delaySwitches));
      this.validSwitches = this.config.delaySwitches.map((switchConfig, index) => {
        const config: Partial<SwitchConfigTypes> = {};
        const switchOptionParser = new OptionParser(config, true);
        switchOptionParser
          .stringKey('name', true)
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
            throw new TypeError(`config.json: delaySwitches[${index}]: ${error}`);
          });
        switchOptionParser.parse(switchConfig);
        assert(is<string>(config.name));
        // Backwards compatibility: 'repeats' = -1 meant infinite repeats
        if (config.repeats === -1) {
          config.infiniteRepeats = true;
          config.repeats = 0;
          this.log('Converting repeats = -1 to infiniteRepeats = true for', config.name);
        }
        config.prefix = config.random ? 'Random ' : 'Fixed ';
        config.uuid = UUIDGen.generate(config.name);
        this.debug('Found switch: %s', config.name);
        return config;
      });
    } catch (error) {
      this.handleErrorSync({
        header: 'Config Error',
        error,
        reason: 'Check the config file and restart Homebridge, the plugin aborts the initialization',
      });
      return;
    }
    this.debug('config: %j', this.config);
  }

  async init() {
    const jobs = [];
    for (const delaySwitch of this.validSwitches) {
      const switchParams: SwitchAccessoryParams = {
        category: hap.Categories.SWITCH,
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
