// homebridge-random-delay-switches/lib/MotionService.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')

class MotionService extends homebridgeLib.ServiceDelegate {
  constructor (motionAccessory, params = {}) {
    params.name = motionAccessory.name
    params.Service = motionAccessory.Services.hap.MotionSensor
    super(motionAccessory, params)
    this.addCharacteristicDelegate({
      key: 'motion',
      Characteristic: this.Characteristics.hap.MotionDetected,
      getter: async () => {
        return motionAccessory.motionTriggered
      }
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
    this.on('trigger', (value) => {
      this.values.motion = value
    })

  }
}

module.exports = MotionService

/*
    if (!this.disableSensor){
        this.motionService = new Service.MotionSensor(this.name + ' Trigger');

        this.motionService
            .getCharacteristic(Characteristic.MotionDetected)
            .on('get', this.getMotion.bind(this));
        services.push(this.motionService)
    }

    return services;

}


delaySwitch.prototype.setOn = function (on, callback) {

    if (!on) {
        this.log('Stopping the Timer');
    
        this.switchOn = false;
        clearTimeout(this.timer);
        this.motionTriggered = false;
        if (!this.disableSensor) this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);

        
      } else {
        this.log('Starting the Timer');
        this.switchOn = true;

        if (this.minDelay > this.delay) this.minDelay = this.delay;
    
        if (this.isRandom) {
            this.timeout = Math.floor(this.minDelay + Math.random() * (this.delay - this.minDelay) + 1);
        } else {
            this.timeout = this.delay;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
          this.log('Time is Up!');
          this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
          this.switchOn = false;
            
          if (!this.disableSensor) {
              this.motionTriggered = true;
              this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(true);
              this.log('Triggering Motion Sensor');
              setTimeout(function() {
                  this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);
                  this.motionTriggered = false;
              }.bind(this), 3000);
          }
          
        }.bind(this), this.timeout * 1000);
      }
    
      callback();
}

delaySwitch.prototype.getOn = function (callback) {
    callback(null, this.switchOn);
}

delaySwitch.prototype.getMotion = function(callback) {
    callback(null, this.motionTriggered);
}

delaySwitch.prototype.getDelay = function(callback) {
    callback(this.delay);
}

delaySwitch.prototype.setDelay = function(value, callback) {
    this.delay = value;
    callback();
}

delaySwitch.prototype.getMinDelay = function(callback) {
    callback(this.minDelay);
}

delaySwitch.prototype.setMinDelay = function(value, callback) {
    this.minDelay = value;
    callback();
}

delaySwitch.prototype.getRandom = function(callback) {
    callback(this.isRandom);
}

delaySwitch.prototype.setRandom = function(value, callback) {
    this.isRandom = value;
    callback();
}
*/
