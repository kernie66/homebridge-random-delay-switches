// homebridge-random-delay-switches/lib/RdsPlatform.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const events = require('events')
const homebridgeLib = require('homebridge-lib')
const RdsAccessory = require('./RdsAccessory')

class RdsPlatform extends homebridgeLib.Platform {
  constructor (log, configJson, homebridge) {
    super(log, configJson, homebridge)
    this.once('heartbeat', this.init)
    this.config = {
      name: 'RandomDelaySwitches',
      timeout: 15,
      delaySwitches: []
    }
    const optionParser = new homebridgeLib.OptionParser(this.config, true)
    optionParser.stringKey('name')
    optionParser.stringKey('platform')
    optionParser.intKey('delay', 1, 3600)
    optionParser.intKey('minDelay', 1, 3600)
    optionParser.intKey('random', 0, 3600)
    optionParser.listKey('switches')
    optionParser.boolKey('disableSensor')
    optionParser.boolKey('startOnReboot')
    optionParser.on('userInputError', (message) => {
      this.warn('config.json: %s', message)
    })
    try {
      optionParser.parse(configJson)
      if (this.config.switches.length === 0) {
        this.warn('config.json: no switches')
      }
      this.rdsAccessories = {}
    } catch (error) {
      this.fatal(error)
    }
  }

  async init (beat) {
    const jobs = []
    for (const rndSwitch of this.config.switches) {
      const params = {
        rndSwitch: rndSwitch,
        delay: this.config.delay,
      }
      // TODO: only create accessory when location can be converted into
      // long/lat coordinates
      const rdsAccessory = new RdsAccessory(this, params)
      jobs.push(events.once(rdsAccessory, 'initialised'))
      this.rdsAccessories[switch] = rdsAccessory
    }
    for (const job of jobs) {
      await job
    }
    this.debug('initialised')
    this.emit('initialised')
  }
}

module.exports = RdsPlatform
