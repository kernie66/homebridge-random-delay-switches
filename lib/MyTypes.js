// homebridge-random-delay-switch/lib/MyTypes.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Custom HomeKit Characteristics.

const homebridgeLib = require('homebridge-lib')

const regExps = {
  uuid: /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
  uuidPrefix: /^[0-9A-F]{1,8}$/,
  uuidSuffix: /^-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/
}

function uuid (id, suffix = '-0000-1000-8000-0026BB765291') {
  if (typeof id !== 'string') {
    throw new TypeError('id: not a string')
  }
  if (!regExps.uuidPrefix.test(id)) {
    throw new RangeError(`id: ${id}: invalid id`)
  }
  if (typeof suffix !== 'string') {
    throw new TypeError('suffix: not a string')
  }
  if (!regExps.uuidSuffix.test(suffix)) {
    throw new RangeError(`suffix: ${suffix}: invalid suffix`)
  }
  return ('00000000' + id).slice(-8) + suffix
}
  
//  return MyTypes.uuid(id, '-0000-1000-8000-656261617577')
//}

class MyTypes extends homebridgeLib.CustomHomeKitTypes {
  constructor (homebridge) {
    super(homebridge)
    const Service = homebridge.hap.Service;
    const Characteristic = homebridge.hap.Characteristic;


    this.createCharacteristicClass('Delay', uuid('0A0'), {
      format: Characteristic.Formats.UINT16,
      unit: Characteristic.Units.SECONDS,
      minValue: 1,
      maxValue: 3600,
      minStep: 1,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE],
//      adminOnlyAccess: [Characteristic.Access.WRITE]
    })
    this.createCharacteristicClass('Counter', uuid('0A1'), {
      format: Characteristic.Formats.UINT16,
//      unit: Characteristic.Units.SECONDS,
      minValue: 0,
      maxValue: 10,
      minStep: 1,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE],
//      adminOnlyAccess: [Characteristic.Access.WRITE]
    })
    this.createCharacteristicClass('Boolean', uuid('0A8'), {
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE]
    })
  }

}

module.exports = MyTypes