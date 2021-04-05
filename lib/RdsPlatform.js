// homebridge-random-delay-switches/lib/RdsPlatform.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const events = require('events')
const homebridgeLib = require('homebridge-lib')
const RdsAccessory = require('./RdsAccessory')
const MyTypes = require('./MyTypes')

class RdsPlatform extends homebridgeLib.Platform {
  constructor (log, configJson, homebridge) {
    super(log, configJson, homebridge)
    this.once('heartbeat', this.init)
    this.config = {
      name: 'RandomDelaySwitches',
      delaySwitches: []
    }
    const myTypes = new MyTypes(homebridge)
    const optionParser = new homebridgeLib.OptionParser(this.config, true)
    optionParser.stringKey('name')
    optionParser.stringKey('platform')
    optionParser.arrayKey('delaySwitches')
    optionParser.on('userInputError', (message) => {
      this.warn('config.json: %s', message)
    })
    try {
      optionParser.parse(configJson)
      if (this.config.delaySwitches.length === 0) {
        this.warn('config.json: no delay switches')
      }
      this.rdsAccessories = {}
      const validSwitches = []
      for (const i in this.config.delaySwitches) {
        const delaySwitch = this.config.delaySwitches[i]
        const config = {}
        const optionParser = new homebridgeLib.OptionParser(config, true)
        optionParser.stringKey('name')
        optionParser.intKey('delay', 1, 3600)
        optionParser.intKey('minDelay', 1, 3600)
        optionParser.boolKey('random')
        optionParser.boolKey('disableSensor')
        optionParser.boolKey('startOnReboot')
        optionParser.intKey('repeat', 0, 10)
        optionParser.on('userInputError', (error) => {
          this.warn('config.json: delaySwitches[%d]: %s', i, error)
        })
        optionParser.parse(delaySwitch)
        if (config.delay == null) {
          continue
        }
        if (config.name == null) {
          config.name = 'RndDly-${config.delay}s'
        }
        log('Found switch: %s', config.name)
        validSwitches.push(config)
      }
    } catch (error) {
      this.fatal(error)
    }
    this.debug('config: %j', this.config)
  }

  async init (beat) {
    const jobs = []
    for (const delaySwitch of this.config.delaySwitches) {
      const params = {
//        delaySwitch: delaySwitch,
        name: delaySwitch.name,
        id: 'Random Delay-' + delaySwitch.delay + 's',
        manufacturer: 'Homebridge',
        model: 'Random Delay Switch',
        category: this.Accessory.Categories.Switch,
        delay: delaySwitch.delay,
        minDelay: delaySwitch.minDelay,
        random: delaySwitch.random,
        disableSensor: delaySwitch.disableSensor,
        startOnReboot: delaySwitch.startOnReboot,
        repeat: delaySwitch.repeat
      }
      const rdsAccessory = new RdsAccessory(this, params)
      jobs.push(events.once(rdsAccessory, 'initialised'))
      this.rdsAccessories[delaySwitch] = rdsAccessory
    }
    for (const job of jobs) {
      await job
    }
    this.debug('initialised')
    this.emit('initialised')
  }
}

module.exports = RdsPlatform
