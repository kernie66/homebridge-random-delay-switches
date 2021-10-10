// homebridge-random-delay-switches/lib/RdsAccessory.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
const SwitchService = require('./SwitchService')
const MotionService = require('./MotionService')

class RdsAccessory extends homebridgeLib.AccessoryDelegate {
  constructor (platform, params) {
    super(platform, params)
    this.delay = params.delay
//    if (this.delay > 3600) this.delay = 3600
    this.minDelay = params.minDelay || 1
    this.random = params.random || false
    this.disableSensor = params.disableSensor || false
    this.startOnReboot = params.startOnReboot || false
//    this.timeout = this.delay
    this.repeats = params.repeats || 0
    this.hidden = params.hidden || false
    this.repetition = 0
    this.switchOn = this.startOnReboot
    this.rds = platform.rds

    this.switchService = new SwitchService(
      this, { primaryService: true }, 
    )
    
    // Restore persistent values
//    this.switchService.timeout = this.switchService.values.timeout
//    this.switchService.timeLeft = this.switchService.values.timeLeft
//    this.log('Restored timeout = %d, timeLeft = %d', this.switchService.timeout, this.switchService.timeLeft)

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
    this.debug('Accessory initialised')
    this.heartbeatEnabled = true
    setImmediate(() => {
      this.emit('initialised')
    })
    this.on('heartbeat', async (beat) => { await this.heartbeat(beat) })
    this.on('shutdown', async () => { return this.shutdown() })
  }

  async shutdown () {
    this.debug('Nothing to do at shutdown')
  }

  async heartbeat (beat) {
    if (beat % this.switchService.values.heartrate === 0) {
//      try {
//        this.switchService.updateValues()
//      } catch (error) {
//        this.warn('Error when updating values: %s', error.message)
//      }
      if ((this.switchService.values.timeLeft > 0) && this.switchService.switchOn) {
        this.switchService.values.timeLeft -= this.switchService.values.heartrate
      }
    }
  }
}

module.exports = RdsAccessory
