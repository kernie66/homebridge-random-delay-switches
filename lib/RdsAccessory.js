
var version = require("./package").version;
var inherits = require("util").inherits;
var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-random-delay-switch", "RandomDelaySwitch", delaySwitch);
}


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
