// homebridge-random-delay-switches/lib/RdsPlatform.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import type { API, Logging } from 'homebridge';

import { validateCronExpression } from 'cron';
import { OptionParser } from 'homebridge-lib/OptionParser';
import { Platform } from 'homebridge-lib/Platform';
import { once } from 'node:events';
import { assert, is } from 'tsafe';

import type { ConfigJson } from './typings/ConfigJsonTypes.js';
import type { SwitchAccessoryParams, SwitchConfigType, SwitchSettingType } from './typings/SwitchTypes.js';

import RdsAccessory from './RdsAccessory.js';
import RdsTypes from './RdsTypes.js';
import { parseCronString } from './utils/cronUtils.js';
import { handleError, handleErrorSync } from './utils/handleError.js';

let hap: API['hap'];

class RdsPlatform extends Platform<RdsPlatform> {
  config: Partial<ConfigJson>;
  rds: RdsTypes;
  switchAccessories!: Record<string, RdsAccessory>;
  handleError: typeof handleError<RdsPlatform>;
  handleErrorSync: typeof handleErrorSync<RdsPlatform>;
  validSwitches: Array<Partial<SwitchConfigType>>;

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
      assert(is<SwitchConfigType[]>(this.config.delaySwitches));
      this.validSwitches = this.config.delaySwitches.map((switchConfig, index) => {
        const config: Partial<SwitchConfigType> = { cronString: '' };
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
        const switchSettings: SwitchSettingType = config as SwitchSettingType;
        // Backwards compatibility: 'repeats' = -1 meant infinite repeats
        if (config.repeats === -1) {
          switchSettings.infiniteRepeats = true;
          switchSettings.repeats = 0;
          this.log('Converting repeats = -1 to infiniteRepeats = true for', switchSettings.name);
        }
        // Check if the cronString is valid and split it into an array of cron strings
        switchSettings.cronArray = [];
        try {
          switchSettings.cronArray = parseCronString(switchSettings.cronString);
        } catch (error) {
          this.log('Error parsing cronString for', switchSettings.name, error);
        }
        if (switchSettings.cronString) {
          const cronStrings = switchSettings.cronString.split(';');
          if (cronStrings.length > 0) {
            for (const cronString of cronStrings) {
              const cronValidation = validateCronExpression(cronString);
              if (!cronValidation.valid) {
                throw new TypeError(
                  `config.json: delaySwitches[${index}]: cronString must be in the format '(second) minute hour * * *'`,
                );
              }
              switchSettings.cronArray.push(cronString);
            }
          }
        }
        switchSettings.prefix = switchSettings.random ? 'Random ' : 'Fixed ';
        switchSettings.uuid = UUIDGen.generate(switchSettings.name);
        this.debug('Found switch: %s', switchSettings.name);
        return switchSettings;
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
      assert(is<SwitchSettingType>(delaySwitch));
      const switchParams: SwitchAccessoryParams = {
        category: this.Accessory.Categories.SWITCH,
        firmware: '1.0.0',
        cronArray: delaySwitch.cronArray || [],
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
      this.switchAccessories[switchAccessory.name] = switchAccessory;
    }
    for (const job of jobs) {
      await job;
    }
    this.debug('initialised');
    this.emit('initialised');
  }
}

export default RdsPlatform;
