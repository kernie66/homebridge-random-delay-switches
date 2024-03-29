// homebridge-random-delay-switches/lib/RdsPlatform.js
// Copyright © 2021-2022 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict';

const events = require('events');
const homebridgeLib = require('homebridge-lib');
const RdsAccessory = require('./RdsAccessory');
const RT = require('./RdsTypes');
const RdsTypes = RT.RdsTypes;

class RdsPlatform extends homebridgeLib.Platform {
  constructor(log, configJson, homebridge) {
    super(log, configJson, homebridge);
    this.once('heartbeat', this.init);
    this.config = {
      name: 'RandomDelaySwitches',
    };
    let UUIDGen = homebridge.hap.uuid;
    this.rds = new RdsTypes(homebridge);
    this.debug('Characteristics: %s', this.rds.Characteristics);

    const optionParser = new homebridgeLib.OptionParser(
      this.config,
      true
    );
    optionParser
      .stringKey('name')
      .stringKey('platform')
      .arrayKey('delaySwitches')
      .on('userInputError', (message) => {
        this.warn('config.json: %s', message);
      });
    try {
      optionParser.parse(configJson);
      if (this.config.delaySwitches.length === 0) {
        this.warn('config.json: no delay switches');
      }
      this.switchAccessories = {};
      const validSwitches = [];
      for (const i in this.config.delaySwitches) {
        const delaySwitch = this.config.delaySwitches[i];
        const config = {};
        const optionParser = new homebridgeLib.OptionParser(
          config,
          true
        );
        optionParser
          .stringKey('name')
          // .intKey('delay', 0, 863999)
          .stringKey('delay')
          // .intKey('minDelay', 0)
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
          .on('userInputError', (error) => {
            this.warn('config.json: delaySwitches[%d]: %s', i, error);
          });
        optionParser.parse(delaySwitch);
        if (config.name === null) {
          config.name = 'RndDly-' + config.delay + 's';
        }
        // Backwards compatibility: 'repeats' = -1 meant infinite repeats
        if (config.repeats === -1) {
          config.infiniteRepeats = true;
          config.repeats = 0;
          this.log(
            'Converting repeats = -1 to infiniteRepeats = true for',
            config.name
          );
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
        name: delaySwitch.name,
        id: delaySwitch.uuid,
        manufacturer: 'Homebridge',
        model:
          delaySwitch.prefix + 'Delay-' + delaySwitch.delay + 's',
        category: this.Accessory.Categories.Switch,
        delay: delaySwitch.delay,
        minDelay: delaySwitch.minDelay,
        random: delaySwitch.random,
        disableSensor: delaySwitch.disableSensor,
        startOnReboot: delaySwitch.startOnReboot,
        singleActivation: delaySwitch.singleActivation,
        repeats: delaySwitch.repeats,
        infiniteRepeats: delaySwitch.infiniteRepeats,
        cronString: delaySwitch.cronString,
        heartrate: delaySwitch.heartrate,
        useConfig: delaySwitch.useConfig,
      };
      const switchAccessory = new RdsAccessory(this, switchParams);
      jobs.push(events.once(switchAccessory, 'initialised'));
      this.switchAccessories[delaySwitch] = switchAccessory;
    }
    for (const job of jobs) {
      await job;
    }
    this.debug('initialised');
    this.emit('initialised');
  }
}

module.exports = RdsPlatform;
