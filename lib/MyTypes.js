// homebridge-random-delay-switch/lib/MyTypes.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Custom HomeKit Characteristics.

const homebridgeLib = require('homebridge-lib')

const sleep = (seconds) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, seconds * 1000)
  })
}

function wait(ms, opts = {}) {
  return new Promise((resolve, reject) => {
    let timerId = setTimeout(resolve, ms);
    if (opts.signal) {
      // implement aborting logic for our async operation
      opts.signal.addEventListener('abort', event => {
        clearTimeout(timerId);
        reject(event);
      })
    }
  })
}

const regExps = {
  uuid: /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
  uuidPrefix: /^[0-9A-F]{1,8}$/,
  uuidSuffix: /^-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/
}

function uuid (id, suffix = '-0000-1000-8000-656261617577') {
//'-0000-1000-8000-0026BB765291') {
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
      format: this.Formats.UINT16,
      unit: this.Units.SECONDS,
      minValue: 1,
      maxValue: 3600,
      perms: [this.Perms.READ, this.Perms.NOTIFY, this.Perms.WRITE],
    }, 'Delay time')
    this.createCharacteristicClass('Counter', uuid('0A1'), {
      format: Characteristic.Formats.UINT8,
//      unit: Characteristic.Units.SECONDS,
      minValue: 0,
      maxValue: 10,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE],
      displayName: 'Counter'
//      adminOnlyAccess: [Characteristic.Access.WRITE]
    })
    this.createCharacteristicClass('Boolean', uuid('0A8'), {
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE],
      displayName: 'Logic true/false'
    })

    this.createCharacteristicClass('Random', uuid('0A9'), {
      format: this.Formats.BOOL,
      perms: [this.Perms.READ, this.Perms.NOTIFY, this.Perms.WRITE],
    }, 'Random enabled')

  }
}

module.exports.MyTypes = MyTypes
module.exports.sleep = sleep
module.exports.wait = wait