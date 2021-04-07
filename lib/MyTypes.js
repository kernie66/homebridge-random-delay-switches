// homebridge-random-delay-switch/lib/MyTypes.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Custom HomeKit Characteristics.

const homebridgeLib = require('homebridge-lib')
var Service, Characteristic;

//function uuid (id) {
//  return MyTypes.uuid(id, '-0000-1000-8000-656261617577')
//}

class MyTypes extends homebridgeLib.CustomHomeKitTypes {
  constructor (homebridge) {
    super(homebridge)
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;


    this.createCharacteristicClass('Delay', this.uuid('0A0'), {
      format: Characteristic.Formats.UINT16,
      unit: Characteristic.Units.SECONDS,
      minValue: 1,
      maxValue: 3600,
      minStep: 1,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE],
      adminOnlyAccess: [Characteristic.Access.WRITE]
    })
    this.createCharacteristicClass('Random', this.uuid('0A8'), {
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE]
    })
  }
}

module.exports = MyTypes