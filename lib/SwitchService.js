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
    this.startOnReboot = switchAccessory.startOnReboot
    this.disableSensor = switchAccessory.disableSensor
    this.rds = switchAccessory.rds

    this.addCharacteristicDelegate({
      key: 'on',
      Characteristic: this.Characteristics.hap.On,
      value: false
    }).on('didSet', (value) => {
      this.switchOn = value
      this.debug("Calling 'setOn' with value %s", this.switchOn) 
      this.setOn()
    }).on('didTouch', (value) => {
      this.switchOn = value
      this.debug("Repeat 'setOn' with value %s", this.switchOn) 
      this.setOn()
    })

    if (!this.hidden) {
      this.addCharacteristicDelegate({
        key: 'delay',
        value: this.delay,
        Characteristic: this.rds.Characteristics.Delay,
      }).on('didSet', (value) => {
        this.delay = value
      })    

      this.addCharacteristicDelegate({
        key: 'minDelay',
        value: this.minDelay,
        Characteristic: this.rds.Characteristics.MinDelay,
      }).on('didSet', (value) => {
        this.minDelay = value
      })    

      this.addCharacteristicDelegate({
        key: 'timeout',
        value: this.timeout,
        Characteristic: this.rds.Characteristics.TimeOut
      })    

      this.addCharacteristicDelegate({
        key: 'random',
        value: this.random,
        Characteristic: this.rds.Characteristics.Random,
      })    
      .on('didSet', (value) => {
        this.random = value
      })
      
      this.addCharacteristicDelegate({
        key: 'repeats',
        value: this.repeats,
        Characteristic: this.rds.Characteristics.Repeats,
      })    
      .on('didSet', (value) => {
        this.repeats = value
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
      value: this.logLevel
    }).on('didSet', (value) => {
      this.logLevel = value
    })

    this.values.on = false
    if (this.startOnReboot) {
      this.initSwitch()
    }
  }
  
  async initSwitch() {
    await wait(5000)
    this.log('Start the timer at reboot')
    this.values.on = true
  }
  
  async setOn () {
    let delayType = ''
    
    if (!this.switchOn) {
      if (!this.timeUp) {
        try {
          this.debug('Aborting the timer before time is up')    
          this.ac.abort()
          this.motionTriggered = false
        } catch(e) {
          this.warn('Error when aborting timer: %s', e.message)
        }
      }
    } else {
      this.ac = new AbortController()
      this.signal = this.ac.signal
      if (this.minDelay > this.delay) {
        this.minDelay = this.delay
      }
      if (this.random) {
        this.timeout = Math.floor(this.minDelay + Math.random() * (this.delay - this.minDelay) + 1);
        delayType = 'random'
      } else {
        this.timeout = this.delay;
        delayType = 'fixed'
      }
      this.log('Starting the timer with %s delay: %d s', delayType, this.timeout)
      this.updateValues()
      this.timeUp = false
      try {
        await wait(this.timeout * 1000, { signal: this.signal })
        this.log('Time is up!')
        this.timeUp = true
        this.values.on = false
        this.switchOn = false
        if (!this.disableSensor) {
          this.log('Triggering motion sensor')
          switchAccessory.emit('trigger', true)
        }
        if (this.repetition < this.repeats) {
          await wait(4000) // Wait for the motion to complete, 4 s
          this.repetition += 1
          this.log('Restart, repetition number: %d of %d', this.repetition, this.repeats)
          this.values.on = true
        } else {
          this.repetition = 0
        }
      } catch(err) {
        this.warn('The timer was aborted: %s', err)
        this.repetition = 0
      }
    }
  }
  updateValues () {
    this.values.repetition = this.repetition
    this.values.timeout = this.timeout || 0
    this.values.delay = this.delay
    this.values.minDelay = this.minDelay
    this.values.repeats = this.repeats
  }
}

module.exports = SwitchService
