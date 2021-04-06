// homebridge-random-delay-switches/lib/RdsAccessory.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const homebridgeLib = require('homebridge-lib')
// const MyTypes = require('./MyTypes')

//const WsService = require('./WsService')


//var version = require("./package").version;
/*
var inherits = require("util").inherits;
var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-random-delay-switch", "RandomDelaySwitch", delaySwitch);
}
*/
class RdsService extends homebridgeLib.ServiceDelegate {
/*  static get SmokeSensor () { return RpiSmokeSensor }
  static get GpioButton () { return GpioButton }
  static get GpioContact () { return GpioContact }
  static get GpioMotion () { return GpioMotion }
  static get GpioLight () { return GpioLight }
  static get GpioServo () { return GpioServo }
  static get GpioSmoke () { return GpioSmoke }
  static get GpioSwitch () { return GpioSwitch }
  static get GpioValve () { return GpioValve }
  static get GpioBlinkt () { return GpioBlinkt }
*/
  constructor (rdsAccessory, params = {}) {
    params.name = rdsAccessory.name
    params.Service = rdsAccessory.Services.hap.Switch
    super(rdsAccessory, params)
    this.delay = rdsAccessory.delay
    this.minDelay = rdsAccessory.minDelay
    this.addCharacteristicDelegate({
      key: 'on',
      Characteristic: this.Characteristics.hap.On,
      setter: async (value) => {
//        await this.update()
      }
    })

    this.addCharacteristicDelegate({
      key: 'delay',
      value: this.delay,
//      Characteristic: this.Characteristics.my.Delay,
      setter: async (value) => {
        this.delay = value
//        await this.update
      }
    })    

    this.addCharacteristicDelegate({
      key: 'minDelay',
      value: this.minDelay,
//      Characteristic: this.Characteristics.my.Delay,
      setter: async (value) => {
        this.minDelay = value
//        await this.update
      }
    })    
/*
    this.createCharacteristicClass('Delay', 'B469181F-D796-46B4-8D99-5FBE4BA9DC9C', {
      format: rdsAccessory.Formats.UINT16,
      unit: rdsAccessory.Units.SECONDS,
      minValue: 1,
      maxValue: 3600,
      minStep: 1,
      perms: [rdsAccessory.Perms.READ, rdsAccessory.Perms.NOTIFY, rdsAccessory.Perms.WRITE],
      adminOnlyAccess: [rdsAccessory.Access.WRITE]
    })

    // DelaySwitchTimeout Characteristic
    Characteristic.DelaySwitchTimeout = function () {
        Characteristic.call(this, 'Delay', 'B469181F-D796-46B4-8D99-5FBE4BA9DC9C');
        this.setProps({
            format: Characteristic.Formats.INT,
            unit: Characteristic.Units.SECONDS,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE],
            minValue: 1,
            maxValue: 3600,
        });
//        this.value = this.getDefaultValue();
    };
    inherits(Characteristic.DelaySwitchTimeout, Characteristic);
    Characteristic.DelaySwitchTimeout.UUID = 'B469181F-D796-46B4-8D99-5FBE4BA9DC9C';

    this.switchService.addCharacteristic(Characteristic.DelaySwitchTimeout);
    this.switchService.updateCharacteristic(Characteristic.DelaySwitchTimeout, this.delay);
    this.switchService.getCharacteristic(Characteristic.DelaySwitchTimeout)
//      .on('get', this.getDelay.bind(this))
//      .on('set', this.setDelay.bind(this));
*/
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
      value: rdsAccessory.logLevel
    }).on('didSet', (value) => {
      rdsAccessory.logLevel = value
    })
  }
}

module.exports = RdsService

//    params.name = rdsAccessory.name
//    params.Service = params.hidden
//      ? rpiAccessory.Services.my.Resource
//      : rpiAccessory.Services.eve.TemperatureSensor
//    super(rdsAccessory, params)
//    if (!params.hidden) {
/*      this.addCharacteristicDelegate({
        key: 'temperature',
        Characteristic: this.Characteristics.eve.CurrentTemperature,
        unit: '°C'
      })
      this.addCharacteristicDelegate({
        key: 'temperatureUnit',
        Characteristic: this.Characteristics.hap.TemperatureDisplayUnits,
        value: this.Characteristics.hap.TemperatureDisplayUnits.CELSIUS
      })
      this.addCharacteristicDelegate({
        key: 'frequency',
        Characteristic: this.Characteristics.my.CpuFrequency,
        unit: 'MHz'
      })
      this.addCharacteristicDelegate({
        key: 'throttled',
        Characteristic: this.Characteristics.my.CpuThrottled
      })
      this.addCharacteristicDelegate({
        key: 'voltage',
        Characteristic: this.Characteristics.my.CpuVoltage,
        unit: 'V'
      })
      this.addCharacteristicDelegate({
        key: 'underVoltage',
        Characteristic: this.Characteristics.my.CpuUnderVoltage
      })
      this.addCharacteristicDelegate({
        key: 'load',
        Characteristic: this.Characteristics.my.CpuLoad
      })
      this.addCharacteristicDelegate({
        key: 'lastBoot',
        Characteristic: this.Characteristics.my.LastBoot
      })
    }
    this.addCharacteristicDelegate({
      key: 'lastupdated',
      Characteristic: this.Characteristics.my.LastUpdated,
      silent: true
    })
    this.addCharacteristicDelegate({
      key: 'statusFault',
      Characteristic: this.Characteristics.hap.StatusFault,
      silent: true
    }) */

/*
  checkState (state) {
    if (state == null) {
      this.values.lastupdated = String(new Date()).slice(0, 24)
      return
    }
    this.values.temperature = state.temp
    this.values.frequency = Math.round(state.freq / 1000000)
    this.values.voltage = state.volt
    this.values.throttled = (state.throttled & 0x000e) !== 0
    this.values.underVoltage = (state.throttled & 0x0001) !== 0
    this.values.load = state.load
    this.values.lastupdated = String(new Date(state.date)).slice(0, 24)
    this.values.lastBoot = String(new Date(state.boot)).slice(0, 24)
  } 
*/

/* 
class GpioLight extends homebridgeLib.ServiceDelegate {
  constructor (gpioAccessory, params = {}) {
    params.Service = gpioAccessory.Services.hap.Lightbulb
    super(gpioAccessory, params)
    this.pi = gpioAccessory.pi
    this.gpio = params.gpio
    this.reversed = params.reversed
    this.addCharacteristicDelegate({
      key: 'on',
      Characteristic: this.Characteristics.hap.On,
      setter: async (value) => {
        const dutyCycle = value ? Math.round(this.values.brightness * 2.55) : 0
        this.values.dutyCycle = this.reversed ? 255 - dutyCycle : dutyCycle
        await this.update()
      }
    })


function delaySwitch(log, config) {
    this.log = log;
    this.name = config.name;
    this.delay = config.delay;
    if (this.delay > 3600) this.delay = 3600;
    this.timeout = this.delay;
    this.minDelay = config.minDelay || 1;
    if (this.minDelay > this.delay) this.minDelay = this.delay;
    this.isRandom = config.random || false;
    this.disableSensor = config.disableSensor || false;
    this.startOnReboot = config.startOnReboot || false;
    this.repeat = config.repeat || 0;
    this.timer;
    this.switchOn = false;
    this.motionTriggered = false;

}

delaySwitch.prototype.getServices = function () {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Random Delay Manufacturer")
        .setCharacteristic(Characteristic.Model, "Random Delay-${this.delay}s")
        .setCharacteristic(Characteristic.SerialNumber, "47.11")
        .setCharacteristic(Characteristic.FirmwareRevision, version);


    this.switchService = new Service.Switch(this.name);


    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));

    if (this.startOnReboot)
        this.switchService.setCharacteristic(Characteristic.On, true)
 
    // DelaySwitchTimeout Characteristic
    Characteristic.DelaySwitchTimeout = function () {
        Characteristic.call(this, 'Delay', 'B469181F-D796-46B4-8D99-5FBE4BA9DC9C');
        this.setProps({
            format: Characteristic.Formats.INT,
            unit: Characteristic.Units.SECONDS,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE],
            minValue: 1,
            maxValue: 3600,
        });
        this.value = this.getDefaultValue();
    };
    inherits(Characteristic.DelaySwitchTimeout, Characteristic);
    Characteristic.DelaySwitchTimeout.UUID = 'B469181F-D796-46B4-8D99-5FBE4BA9DC9C';

    this.switchService.addCharacteristic(Characteristic.DelaySwitchTimeout);
    this.switchService.updateCharacteristic(Characteristic.DelaySwitchTimeout, this.delay);
    this.switchService.getCharacteristic(Characteristic.DelaySwitchTimeout)
      .on('get', this.getDelay.bind(this))
      .on('set', this.setDelay.bind(this));

    Characteristic.MinDelaySwitchTimeout = function () {
        Characteristic.call(this, 'Minimum Delay', '23377804-794F-11EB-A7E2-B827EBA3E606');
        this.setProps({
            format: Characteristic.Formats.INT,
            unit: Characteristic.Units.SECONDS,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE],
            minValue: 1,
            maxValue: 3600,
        });
        this.value = this.getDefaultValue();
    };
    inherits(Characteristic.MinDelaySwitchTimeout, Characteristic);
    Characteristic.MinDelaySwitchTimeout.UUID = '23377804-794F-11EB-A7E2-B827EBA3E606';

    this.switchService.addCharacteristic(Characteristic.MinDelaySwitchTimeout);
    this.switchService.updateCharacteristic(Characteristic.MinDelaySwitchTimeout, this.minDelay);
    this.switchService.getCharacteristic(Characteristic.MinDelaySwitchTimeout)
      .on('get', this.getMinDelay.bind(this))
      .on('set', this.setMinDelay.bind(this));

    Characteristic.RandomDelay = function () {
        Characteristic.call(this, 'Random Delay', '72227266-CA42-4442-AB84-0A7D55A0F08D');
        this.setProps({
            format: Characteristic.Formats.BOOL,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE],
        });
        this.value = this.getDefaultValue();
    };
    inherits(Characteristic.RandomDelay, Characteristic);
    Characteristic.RandomDelay.UUID = '72227266-CA42-4442-AB84-0A7D55A0F08D';

    this.switchService.addCharacteristic(Characteristic.RandomDelay);
    this.switchService.updateCharacteristic(Characteristic.RandomDelay, this.isRandom);
    this.switchService.getCharacteristic(Characteristic.RandomDelay)
      .on("get", this.getRandom.bind(this))
      .on("set", this.setRandom.bind(this));

    var services = [informationService, this.switchService]
    
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
