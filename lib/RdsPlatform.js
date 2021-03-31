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
    optionParser.intKey('timeout', 1, 60)
    optionParser.stringKey('apikey', true)
    optionParser.intKey('dailyForecasts', 0, 7)
    optionParser.intKey('hourlyForecasts', 0, 47)
    optionParser.listKey('locations')
    optionParser.boolKey('noLeak')
    optionParser.on('userInputError', (message) => {
      this.warn('config.json: %s', message)
    })
    try {
      optionParser.parse(configJson)
      if (this.config.locations.length === 0) {
        this.warn('config.json: no locations')
      }
      this.rdsAccessories = {}
    } catch (error) {
      this.fatal(error)
    }
  }

  async init (beat) {
    const jobs = []
    for (const location of this.config.locations) {
      const params = {
        location: location,
        dailyForecasts: this.config.dailyForecasts,
        hourlyForecasts: this.config.hourlyForecasts,
        noLeak: this.config.noLeak
      }
      // TODO: only create accessory when location can be converted into
      // long/lat coordinates
      const rdsAccessory = new RdsAccessory(this, params)
      jobs.push(events.once(rdsAccessory, 'initialised'))
      this.rdsAccessories[location] = rdsAccessory
    }
    for (const job of jobs) {
      await job
    }
    this.debug('initialised')
    this.emit('initialised')
  }


module.exports = RdsPlatform
