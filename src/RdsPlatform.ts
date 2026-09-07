// homebridge-random-delay-switches/lib/RdsPlatform.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import type { API, Logging } from 'homebridge';

import { OptionParser } from 'homebridge-lib/OptionParser';
import { Platform } from 'homebridge-lib/Platform';
import { setLogger, shutdown } from 'node-cron';
import { once } from 'node:events';
import valid from 'semver/functions/valid.js';
import { assert, is } from 'tsafe';

import type { ConfigJson } from './typings/ConfigJsonTypes.js';

import RdsAccessory from './RdsAccessory.js';
import RdsTypes from './RdsTypes.js';
import {
  maxDelayDuration,
  type SwitchAccessoryParams,
  type SwitchConfigType,
  type SwitchSettingType,
} from './typings/SwitchTypes.js';
import { checkCronString } from './utils/cronUtils.js';
import { handleError, handleErrorSync } from './utils/handleError.js';
import { toDuration } from './utils/timeUtils.js';

let hap: API['hap'];

class RdsPlatform extends Platform<RdsPlatform> {
  config: Partial<ConfigJson>;
  firmwareVersion: string;
  rds: RdsTypes;
  switchAccessories!: Record<string, RdsAccessory>;
  handleError: typeof handleError<RdsPlatform>;
  handleErrorSync: typeof handleErrorSync<RdsPlatform>;
  validSwitches: Array<Partial<SwitchConfigType>>;

  constructor(log: Logging, configJson: ConfigJson, homebridge: API) {
    super(log, configJson, homebridge);
    hap = homebridge.hap;

    this.config = {
      name: 'RandomDelaySwitches',
    };
    const UUIDGen = hap.uuid;
    this.firmwareVersion = valid(this.packageJson.version) ?? '1.0.0';
    this.rds = new RdsTypes(homebridge);
    this.handleError = handleError;
    this.handleErrorSync = handleErrorSync;
    this.validSwitches = [];

    // Set up general error handlers
    // 1. Intercept Unhandled Promise Rejections (Operational Errors)
    process.on('unhandledRejection', async (reason: string | Error) => {
      this.error('UNHANDLED REJECTION! 💥 Shutting down...');
      this.log('Sorry for the inconvenience, please file an issue on GitHub with the details below');
      this.error(reason);
      // Trigger graceful shutdown
      await this.rdsShutdown();
      return;
    });

    // 2. Intercept Uncaught Exceptions (Programmer Errors)
    process.on('uncaughtException', async (error) => {
      this.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      this.log('Sorry for the inconvenience, please file an issue on GitHub with the details below');
      this.error(error);
      // Trigger graceful shutdown immediately
      await this.rdsShutdown();
      return;
    });

    // Set up config parser for platform entries, store result in this.config
    const mainOptionParser = new OptionParser(this.config, true);
    mainOptionParser
      .stringKey('name')
      .stringKey('platform')
      .arrayKey('delaySwitches')
      .on('userInputError', (error: string) => {
        throw new TypeError(`config.json: ${error}`);
      });

    // Ensure that any thrown errors are caught and handled gracefully
    // If the config is invalid, the parser and following checks will throw an error,
    // which we catch here
    try {
      // Parse the platform config and validate required fields
      mainOptionParser.parse(configJson);

      this.switchAccessories = {};
      assert(is<SwitchConfigType[]>(this.config.delaySwitches));

      // Validate and parse each switch config using the OptionParser
      this.validSwitches = this.config.delaySwitches.map((switchConfig, index) => {
        // Initialize the config with default values where needed
        const config: Partial<SwitchConfigType> = { delay: '60', minDelay: '1', cronString: '' };

        // Set up the OptionParser for each delay-switch config
        // The result is available in the `config` variable after parsing
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
        // Parse the delay-switch config using the OptionParser
        switchOptionParser.parse(switchConfig);
        // Here we know that 'config' is fully defined
        assert(is<Required<SwitchConfigType>>(config));
        const switchSettings: SwitchSettingType = {
          ...config,
          delayDuration: Temporal.Duration.from({ seconds: 60 }),
          minDelayDuration: Temporal.Duration.from({ seconds: 1 }),
          prefix: config.random ? 'Random ' : 'Fixed ',
          uuid: UUIDGen.generate(config.name),
        };
        this.debug('Found switch: %s', switchSettings.name);
        // Convert 'delay' and 'minDelay' to Temporal.Duration
        switchSettings.delayDuration = toDuration(config.delay, { maxDuration: maxDelayDuration });
        switchSettings.minDelayDuration = toDuration(config.minDelay, {
          maxDuration: switchSettings.delayDuration,
          clampToMax: true,
        });

        // Backwards compatibility: 'repeats' = -1 meant infinite repeats
        if (config.repeats === -1) {
          switchSettings.infiniteRepeats = true;
          switchSettings.repeats = 0;
          this.log('Converting repeats = -1 to infiniteRepeats = true for', switchSettings.name);
        }
        // Check if the cronString is valid
        const { isValid, allErrors } = checkCronString(switchSettings.cronString);
        if (!isValid) {
          this.warn('Error parsing cronString for', switchSettings.name);
          for (const error of allErrors) {
            this.error('cronString error:', error);
          }
        } else if (allErrors[0] !== undefined) {
          this.debug(`${switchSettings.name}: ${allErrors[0]}`);
        } else {
          this.debug(`${switchSettings.name}: Found valid cronString`);
        }
        return switchSettings;
      });

      // Configure the cron job logger to log to the Homebridge log file
      setLogger({
        info: (message) => this.log(message),
        warn: (message) => this.warn(message),
        error: (message, err) => this.error(err ?? message),
        debug: (message, err) => this.error(err ?? message),
      });

      this.once('heartbeat', async () => {
        await this.init();
      });

      // Error handler for any configuration errors
    } catch (error) {
      this.handleErrorSync({
        header: 'Config Error',
        error,
        reason: 'Check the config file and restart Homebridge, the plugin aborts the initialization',
      });
      return;
    }
    this.on('shutdown', async () => {
      await this.rdsShutdown();
      return;
    });
  }

  // Initialize the accessories
  async init() {
    const jobs = [];

    for (const delaySwitch of this.validSwitches) {
      assert(is<SwitchSettingType>(delaySwitch));
      const switchParams: SwitchAccessoryParams = {
        category: this.Accessory.Categories.SWITCH,
        firmware: this.firmwareVersion,
        cronString: delaySwitch.cronString,
        delay: delaySwitch.delayDuration,
        disableSensor: delaySwitch.disableSensor,
        heartrate: delaySwitch.heartrate,
        id: delaySwitch.uuid,
        infiniteRepeats: delaySwitch.infiniteRepeats,
        manufacturer: 'Homebridge',
        minDelay: delaySwitch.minDelayDuration,
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

  async rdsShutdown() {
    // Clean up cron jobs
    await shutdown(1000);
    this.log('Cleaned up cron jobs');
    // Abort any active delay timers
    for (const accessory of Object.values(this.switchAccessories)) {
      accessory.switchService.ac.abort();
    }
    this.log('Aborted active delay timers');
    this.log('Shutdown complete');
  }
}

export default RdsPlatform;
