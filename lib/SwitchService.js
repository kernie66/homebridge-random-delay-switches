// homebridge-random-delay-switches/lib/SwitchService.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
const AbortController = require('abort-controller')
const RdsTypes = require('./RdsTypes')
const wait = RdsTypes.wait

class SwitchService extends homebridgeLib.ServiceDelegate {
  constructor (switchAccessory, params = {}) {
    params.name = switchAccessory.name
    params.Service = switchAccessory.Services.hap.Switch
    super(switchAccessory, params)
    this.delay = switchAccessory.delay
    this.minDelay = switchAccessory.minDelay
    this.random = switchAccessory.random
    this.repeats = switchAccessory.repeats
    this.hidden = switchAccessory.hidden
    this.repetition = switchAccessory.repetition
    this.switchOn = switchAccessory.switchOn
    this.disableSensor = switchAccessory.disableSensor
    this.rds = switchAccessory.rds

    this.addCharacteristicDelegate({
      key: 'on',
      Characteristic: this.Characteristics.hap.On,
      value: false
    }).on('didSet', (value) => {
      switchAccessory.switchOn = value
      this.debug("Calling 'setOn' with value %s", switchAccessory.switchOn) 
      this.setOn(switchAccessory)
    }).on('didTouch', (value) => {
      switchAccessory.switchOn = value
      this.debug("Repeat 'setOn' with value %s", switchAccessory.switchOn) 
      this.setOn(switchAccessory)
    })

    if (!this.hidden) {
      this.addCharacteristicDelegate({
        key: 'delay',
        value: switchAccessory.delay,
        Characteristic: this.rds.Characteristics.Delay,
      }).on('didSet', (value) => {
        switchAccessory.delay = value
      })    

      this.addCharacteristicDelegate({
        key: 'minDelay',
        value: switchAccessory.minDelay,
        Characteristic: this.rds.Characteristics.MinDelay,
      }).on('didSet', (value) => {
        switchAccessory.minDelay = value
      })    

      this.addCharacteristicDelegate({
        key: 'timeout',
        value: this.timeout,
        Characteristic: this.rds.Characteristics.TimeOut
      })    

      this.addCharacteristicDelegate({
        key: 'random',
        value: switchAccessory.random,
        Characteristic: this.rds.Characteristics.Random,
      })    
      .on('didSet', (value) => {
        switchAccessory.random = value
      })
      
      this.addCharacteristicDelegate({
        key: 'repeats',
        value: switchAccessory.repeats,
        Characteristic: this.rds.Characteristics.Repeats,
      })    
      .on('didSet', (value) => {
        switchAccessory.repeats = value
      })

      this.addCharacteristicDelegate({
        key: 'repetition',
        Characteristic: this.rds.Characteristics.Repetition,
      })    
    }
    this.addCharacteristicDelegate({
      key: 'heartrate',
      Characteristic: this.Characteristics.my.Heartrate,
      props: {
        minValue: 1,
        maxValue: 60,
        minStep: 1
      },
      value: 15
    })
    this.addCharacteristicDelegate({
      key: 'logLevel',
      Characteristic: this.Characteristics.my.LogLevel,
      value: switchAccessory.logLevel
    }).on('didSet', (value) => {
      switchAccessory.logLevel = value
    })

    this.values.on = false
    if (switchAccessory.startOnReboot) {
      this.initSwitch()
    }
  }
  
  async initSwitch() {
    await wait(5000)
    this.values.on = true
    this.log('Start the timer at reboot')
  }
  
  async setOn (switchAccessory) {
    let delayType = ''
    if (!switchAccessory.switchOn) {
      if (!switchAccessory.timeUp) {
        try {
          this.debug('Aborting the timer before time is up')    
          switchAccessory.ac.abort()
          switchAccessory.motionTriggered = false
        } catch(e) {
          this.warn('Error when aborting timer: %s', e.message)
        }
      }
    } else {
      switchAccessory.ac = new AbortController()
      switchAccessory.signal = switchAccessory.ac.signal
      if (switchAccessory.minDelay > switchAccessory.delay) {
        switchAccessory.minDelay = switchAccessory.delay
      }
      if (switchAccessory.random) {
        this.timeout = Math.floor(switchAccessory.minDelay + Math.random() * (switchAccessory.delay - switchAccessory.minDelay) + 1);
        delayType = 'random'
      } else {
        this.timeout = switchAccessory.delay;
        delayType = 'fixed'
      }
      this.log('Starting the timer with %s delay %d s', delayType, this.timeout)
      switchAccessory.switchService.updateValues(switchAccessory)
      switchAccessory.timeUp = false
      try {
        await wait(this.timeout * 1000, { signal: switchAccessory.signal})
        this.log('Time is up!')
        switchAccessory.timeUp = true
        this.values.on = false
        switchAccessory.switchOn = false
        if (!this.disableSensor) {
          switchAccessory.motionTriggered = true
          this.log('Triggering motion sensor')
          switchAccessory.emit('trigger', true)
        }
        if (switchAccessory.repetition < switchAccessory.repeats) {
          await wait(4000) // Wait for the motion to complete, 4 s
          switchAccessory.repetition += 1
          this.log('Restart, repetition number: %d of %d', switchAccessory.repetition, switchAccessory.repeats)
          this.values.on = true
        } else {
          switchAccessory.repetition = 0
        }
      } catch(err) {
        this.warn('The timer was aborted')
        switchAccessory.repetition = 0
      }
    }
  }
  updateValues (switchAccessory) {
    this.values.repetition = switchAccessory.repetition
    this.values.timeout = this.timeout || 0
    this.values.delay = switchAccessory.delay
    this.values.minDelay = switchAccessory.minDelay
    this.values.repeats = switchAccessory.repeats
  }
}

module.exports = SwitchService
