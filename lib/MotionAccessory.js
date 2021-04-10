// homebridge-random-delay-switches/lib/MotionAccessory.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
const RdsService = require('./RdsServices')
//const RdsSwitch = require('./RdsSwitch')
const RdsMotion = require('./RdsMotion')

class MotionAccessory extends homebridgeLib.AccessoryDelegate {
  constructor (platform, params) {
    super(platform, params)
    this.motionTriggered = false

    this.rdsMotion = new RdsMotion(this)
/*
    this.RdsServices = {
      temperature: new RdsService.Temperature(this),
      humidity: new WsService.Humidity(this),
      pressure: new WsService.AirPressure(this),
      weather: new WsService.Weather(this, { noLeak: context.noLeak })
    }
    this.wsServices.history = new homebridgeLib.ServiceDelegate.History.Weather(
      this, params,
      this.wsServices.temperature.characteristicDelegate('temperature'),
      this.wsServices.humidity.characteristicDelegate('humidity'),
      this.wsServices.pressure.characteristicDelegate('pressure')
    )
    if (context.hourlyForecasts > 0 || context.dailyForecasts > 0) {
      this.forecasts = new Forecasts(this, context)
      for (let h = 1; h <= context.hourlyForecasts; h++) {
        this.wsServices['h' + h] = new WsService.HourlyForecast(
          this.forecasts, { hour: h, noLeak: context.noLeak }
        )
      }
      for (let d = 1; d <= context.dailyForecasts; d++) {
        this.wsServices['d' + d] = new WsService.DailyForecast(
          this.forecasts, { day: d, noLeak: context.noLeak }
        )
      }
    }
    this.heartbeatEnabled = true
    this.on('heartbeat', this.heartbeat.bind(this))
*/
    setImmediate(() => {
      this.emit('initialised')
    })
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


module.exports = MotionAccessory
