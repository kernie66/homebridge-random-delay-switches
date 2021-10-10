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
    this.repetition = switchAccessory.repetition
    this.switchOn = switchAccessory.switchOn
    this.startOnReboot = switchAccessory.startOnReboot
    this.disableSensor = switchAccessory.disableSensor
    this.rds = switchAccessory.rds
    this.timeout = params.timeout

    this.addCharacteristicDelegate({
      key: 'on',
      Characteristic: this.Characteristics.hap.On,
      value: false
    }).on('didSet', (value) => {
      this.switchOn = value
      this.debug("Calling 'setOn' with value %s", this.switchOn) 
      this.setOn(switchAccessory)
    }).on('didTouch', (value) => {
      this.switchOn = value
      this.debug("Repeat 'setOn' with value %s", this.switchOn) 
      this.setOn(switchAccessory)
    })

    this.addCharacteristicDelegate({
      key: 'delay',
      value: this.delay,
      Characteristic: this.rds.Characteristics.Delay,
    })    

    this.addCharacteristicDelegate({
      key: 'minDelay',
      value: this.minDelay,
      Characteristic: this.rds.Characteristics.MinDelay,
    })    

    this.addCharacteristicDelegate({
      key: 'timeout',
      value: 0,
      Characteristic: this.rds.Characteristics.TimeOut
    })    

    this.addCharacteristicDelegate({
      key: 'timeLeft',
      Characteristic: this.rds.Characteristics.TimeLeft
    })    

    this.addCharacteristicDelegate({
      key: 'random',
      value: this.random,
      Characteristic: this.rds.Characteristics.Random,
    })
    
    this.addCharacteristicDelegate({
      key: 'repeats',
      value: this.repeats,
      Characteristic: this.rds.Characteristics.Repeats,
    })

    this.addCharacteristicDelegate({
      key: 'repetition',
      Characteristic: this.rds.Characteristics.Repetition,
    })    

    this.addCharacteristicDelegate({
      key: 'default',
      value: false,
      Characteristic: this.rds.Characteristics.Default,
    }) .on('didSet', (value) => {
      this.values.delay = this.delay
      this.values.minDelay = this.minDelay
      this.values.random = this.random
      this.values.repeats = this.repeats
      this.values.default = false
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
    })

    if (this.values.on) {
      this.continueSwitch(switchAccessory)
    } 
    else if (this.values.startOnReboot) {
      this.initSwitch()
    }
    else {
      this.timeUp = true
    }
  }
  
  async initSwitch() {
    await wait(1000)
    this.log('Start the timer at reboot')
    this.values.on = true
  }

  async continueSwitch(switchAccessory) {
    await wait(1000)
    this.log('Switch was on at reboot')
    this.switchOn = true  // Set to enable restart of timer
    this.timeUp = true  // Set to not try to abort the abort controller
    // Check that time left is above 0 seconds
    let delayValue = this.values.timeLeft
    if (delayValue < 5) {
      delayValue = this.values.heartrate
    }
    this.log('Delay time left = %d', delayValue)
    this.setOn(switchAccessory, delayValue)
  }
  
  async setOn (switchAccessory, delayValue) {
    let delayType = ''
    
    // Check if switch is turned off
    if (!this.switchOn) {
      // Check if the timer is active
      if (!this.timeUp) {
        try {
          this.debug('Aborting the timer before time is up')    
          this.ac.abort()
        } catch(e) {
          this.warn('Error when aborting timer: %s', e.message)
        }
        this.timeUp = true
        this.timeLeft = 0
      }
    // Actions when switch is turned on
    } else {
      // Check if timer is already active
      if (!this.timeUp) {
        try {
          this.log('Restarting/extending the timer...')    
          this.ac.abort()
          await wait(500)  // Wait for the abort to complete
        } catch(e) {
          this.warn('Error when restarting timer: %s', e.message)
        }
        this.timeUp = true
        this.timeLeft = 0
      }
      this.ac = new AbortController()
      this.signal = this.ac.signal
      if (delayValue) {
        this.values.timeout = delayValue
        delayType = 'continued'
      } else {
        if (this.values.minDelay > this.values.delay) {
          this.values.minDelay = this.values.delay
        }
        // Set the delay time and type
        if (this.values.random) {
          this.values.timeout = Math.floor(this.values.minDelay + Math.random() * (this.values.delay - this.values.minDelay) + 1);
          delayType = 'random'
        } else {
          this.values.timeout = this.values.delay;
          delayType = 'fixed'
        }
      }
      this.log('Starting the timer with %s delay: %d s', delayType, this.values.timeout)
      await wait(500)
      this.timeUp = false
      this.values.timeLeft = this.values.timeout
      try {
        await wait(this.values.timeout * 1000, { signal: this.signal })
        this.log('Time is up!')
        this.timeUp = true
        this.values.timeLeft = 0
        this.values.on = false
        this.switchOn = false
        if (!this.disableSensor) {
          this.log('Triggering motion sensor')
          switchAccessory.emit('trigger', true)
        }
        if (this.values.repetition < this.values.repeats) {
          await wait(2000) // Wait for the motion to complete, 2 s
          this.values.repetition += 1
          this.log('Restart, repetition number: %d of %d', this.values.repetition, this.values.repeats)
          this.values.on = true
        } else {
          this.values.repetition = 0
        }
      } catch(err) {
        if (!err.message) {
          this.log('The current timer was stopped')
        } else {
          this.warn('The timer was aborted! %s', err.message)
        }
        this.values.repetition = 0
        this.timeUp = true
        this.values.timeLeft = 0
      }
    }
  }
}

module.exports = SwitchService
