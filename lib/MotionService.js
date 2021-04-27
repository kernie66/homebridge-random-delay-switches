// homebridge-random-delay-switches/lib/MotionService.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
const RdsTypes = require('./RdsTypes')
const wait = RdsTypes.wait
  
class MotionService extends homebridgeLib.ServiceDelegate {
  constructor (motionAccessory, params = {}) {
    params.Service = motionAccessory.Services.hap.MotionSensor
    super(motionAccessory, params)
    this.addCharacteristicDelegate({
      key: 'motion',
      Characteristic: this.Characteristics.hap.MotionDetected,
    })
    this.addCharacteristicDelegate({
      key: 'lastActivation',
      Characteristic: this.Characteristics.eve.LastActivation
      // silent: true
    })
    this.addCharacteristicDelegate({
      key: 'statusFault',
      Characteristic: this.Characteristics.hap.StatusFault,
      silent: true
    })
    motionAccessory.on('trigger', (value) => {
      this.doMotion(value)
    })
  }

  async doMotion (value) {
      this.debug('Motion sensor got trigger with value: %s', value)
      this.values.motion = value
      await wait(3000)
      this.values.motion = false
      this.log('End motion')
  }
}

module.exports = MotionService
