// homebridge-random-delay-switches/lib/RdsAccessory.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
const SwitchService = require('./SwitchService')
const MotionService = require('./MotionService')
const updateValues = SwitchService.updateValues

class RdsAccessory extends homebridgeLib.AccessoryDelegate {
  constructor (platform, params) {
    super(platform, params)
    this.delay = params.delay
    if (this.delay > 3600) this.delay = 3600
    this.minDelay = params.minDelay || 1
    this.random = params.random || false
    this.disableSensor = params.disableSensor || false
    this.startOnReboot = params.startOnReboot || false
    this.timeout = this.delay
    this.repeats = params.repeats || 0
    this.hidden = params.hidden || false
    this.repetition = 0
    this.timeUp = true
    this.switchOn = this.startOnReboot
    this.rds = platform.rds

    this.switchService = new SwitchService(
      this, { primaryService: true }, 
    )

    if (!this.disableSensor) {
      this.motionService = new MotionService(
        this, {
          name: this.name,
        }
      )
      this.historyService = new homebridgeLib.ServiceDelegate.History.Motion(
        this, { name: this.name },
        this.motionService.characteristicDelegate('motion'),
        this.motionService.characteristicDelegate('lastActivation')
      )
    }
    this.init()
    this.on('heartbeat', async (beat) => { await this.heartbeat(beat) })
    this.on('shutdown', async () => { return this.shutdown() })
  }

  async init () {
    this.emit('initialised')
    this.heartbeatEnabled = true
  }

  async shutdown () {
    this.debug('Nothing to do at shutdown')
  }

  async heartbeat (beat) {
    if (beat % this.switchService.values.heartrate === 0) {
      try {
        updateValues()
      } catch (error) {
        this.warn(error)
      }
    }
  }
}

module.exports = RdsAccessory
