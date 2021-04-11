// homebridge-random-delay-switches/lib/RdsAccessory.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
const SwitchService = require('./SwitchService')
const MotionService = require('./MotionService')

class MotionAccessory extends homebridgeLib.AccessoryDelegate {
  constructor (rdsAccessory) {
    const params = {
      name: rdsAccessory.name + ' Trigger',
      id: 'Motion Sensor-' + rdsAccessory.delay + 's',
      manufacturer: 'Homebridge',
      model: 'Random Delay Switch',
      category: rdsAccessory.Accessory.Categories.MotionSensor
    }
    super(rdsAccessory.platform, params)
    this.rdsAccessory = rdsAccessory
    this.motionTriggered = false
    this.inheritLogLevel(rdsAccessory)
  }

  async init () {
    return this.service.init()
  }

  setFault (fault) {
    this.service.values.statusFault = fault
      ? this.Characteristics.hap.StatusFault.GENERAL_FAULT
      : this.Characteristics.hap.StatusFault.NO_FAULT
  }

  async shutdown () {
    return this.service.shutdown()
  }
}

/*
  async addMotion (device) {
    this.map |= (1 << device.gpio)
    const gpioAccessory = this.createGpioAccessory(device)
    gpioAccessory.service = new RpiService.GpioMotion(gpioAccessory, {
      name: gpioAccessory.name,
      gpio: device.gpio,
      reversed: device.reversed
    })
    gpioAccessory.historyService = new homebridgeLib.ServiceDelegate.History.Motion(
      gpioAccessory, { name: gpioAccessory.name },
      gpioAccessory.service.characteristicDelegate('motion'),
      gpioAccessory.service.characteristicDelegate('lastActivation')
    )
    setImmediate(() => {
      gpioAccessory.emit('initialised')
    })
  }
*/

  async heartbeat (beat) {
    const heartrate = this.wsServices.weather.values.heartrate * 60
    if (beat % heartrate === 1) {
      try {
        if (this.context.lon == null || this.context.lat == null) {
          const { body } = await this.platform.weather(this.context.location)
          this.context.lon = body.coord.lon
          this.context.lat = body.coord.lat
        }
        const result = await this.platform.onecall(
          this.context.lon, this.context.lat
        )
        for (const id in this.wsServices) {
          if (typeof this.wsServices[id].checkObservation === 'function') {
            this.wsServices[id].checkObservation(result.body)
          }
        }
      } catch (error) {
        if (error.request == null) {
          this.error(error)
        }
      }
    }
  }
}

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
//    this.timer
    this.switchOn = this.startOnReboot
    this.motionTriggered = false

    this.switchService = new SwitchService(this)
//    if (!this.disableSensor) {
//      this.rdsMotion = new RdsMotion(this)
//    }
/*
    this.heartbeatEnabled = true
    this.on('heartbeat', this.heartbeat.bind(this))
*/
    setImmediate(() => {
      this.emit('initialised')
    })
  }

  async addMotionSensor () {
    const motionAccessory = new MotionAccessory(this)
    motionAccessory.service = new MotionService.MotionService(motionAccessory, {
      name: motionAccessory.name,
      motionTriggered: motionAccessory.motionTriggered
    })
    motionAccessory.historyService = new homebridgeLib.ServiceDelegate.History.Motion(
      motionAccessory, { name: motionAccessory.name },
      motionAccessory.service.characteristicDelegate('motion'),
      motionAccessory.service.characteristicDelegate('lastActivation')
    )
    setImmediate(() => {
      motionAccessory.emit('initialised')
    })
  }

  async heartbeat (beat) {
    const heartrate = this.wsServices.weather.values.heartrate * 60
    if (beat % heartrate === 1) {
      try {
        if (this.context.lon == null || this.context.lat == null) {
          const { body } = await this.platform.weather(this.context.location)
          this.context.lon = body.coord.lon
          this.context.lat = body.coord.lat
        }
        const result = await this.platform.onecall(
          this.context.lon, this.context.lat
        )
        for (const id in this.wsServices) {
          if (typeof this.wsServices[id].checkObservation === 'function') {
            this.wsServices[id].checkObservation(result.body)
          }
        }
      } catch (error) {
        if (error.request == null) {
          this.error(error)
        }
      }
    }
  }
}


module.exports = RdsAccessory
