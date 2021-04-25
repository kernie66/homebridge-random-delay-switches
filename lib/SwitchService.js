// homebridge-random-delay-switches/lib/SwitchService.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
const AbortController = require('abort-controller')
const myTypes = require('./MyTypes')
const wait = myTypes.wait

class SwitchService extends homebridgeLib.ServiceDelegate {
  constructor (switchAccessory, params = {}) {
    params.name = switchAccessory.name
    params.Service = switchAccessory.Services.hap.Switch
    super(switchAccessory, params)
    this.delay = switchAccessory.delay
    this.minDelay = switchAccessory.minDelay
    this.random = switchAccessory.random
    this.repeats = switchAccessory.repeats
    this.repetition = switchAccessory.repetition
    this.switchOn = switchAccessory.switchOn
    this.disableSensor = switchAccessory.disableSensor

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

    this.addCharacteristicDelegate({
      key: 'delay',
      value: this.delay,
      Characteristic: this.Characteristics.Delay,
      setter: async (value) => {
        switchAccessory.delay = value
//        await this.update
      },
      getter: async () => {
        return switchAccessory.delay
      }
    })    

    this.addCharacteristicDelegate({
      key: 'minDelay',
      value: this.minDelay,
      Characteristic: this.Characteristics.Delay,
      setter: async (value) => {
        switchAccessory.minDelay = value
//        await this.update
      },
      getter: async () => {
        return switchAccessory.minDelay
      }
    })    

    this.addCharacteristicDelegate({
      key: 'random',
      value: this.random,
      Characteristic: this.Characteristics.myTypes.Random,
    })    
    .on('didSet', (value) => {
      switchAccessory.random <= value
    })
    this.addCharacteristicDelegate({
      key: 'random2',
      value: this.random,
      Characteristic: this.Characteristics.my.Enabled,
    })    
    .on('didSet', (value) => {
      switchAccessory.random <= value
    })
    
    this.addCharacteristicDelegate({
      key: 'repeats',
      value: this.repeats,
      Characteristic: this.Characteristics.Counter,
      setter: async (value) => {
        switchAccessory.repeats = value
//        await this.update
      },
      getter: async () => {
        return switchAccessory.repeats
      }
    })    
    this.addCharacteristicDelegate({
      key: 'repetition',
      Characteristic: this.Characteristics.Counter,
    })    
    this.addCharacteristicDelegate({
      key: 'timeout',
      Characteristic: this.Characteristics.Delay,
    })    
    this.addCharacteristicDelegate({
      key: 'throttled',
      Characteristic: this.Characteristics.my.CpuThrottled,
      displayName: 'Random'
    })

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

    if (switchAccessory.startOnReboot) {
      this.initSwitch()
      this.log('Start the timer at reboot')
    }
  }
  
  async initSwitch() {
    await wait(5000)
    this.values.on = true
  }
  
  async setOn (switchAccessory) {
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
      if (this.minDelay > this.delay) this.minDelay = this.delay;    
      if (this.random) {
        this.timeout = Math.floor(this.minDelay + Math.random() * (this.delay - this.minDelay) + 1);
      } else {
        this.timeout = this.delay;
      }
      this.log('Starting the timer with delay %d s', this.timeout)
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
        if (switchAccessory.repetition < this.repeats) {
          await wait(4000) // Wait for the motion to complete, 4 s
          switchAccessory.repetition += 1
          this.log('Restart, repetition number: %d of %d', switchAccessory.repetition, this.repeats)
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
    this.values.timeout = this.timeout
    this.values.throttled = switchAccessory.random
    this.values.random = switchAccessory.random    
  }
}

module.exports = SwitchService
