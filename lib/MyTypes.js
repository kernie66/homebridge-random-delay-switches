// homebridge-random-delay-switch/lib/MyTypes.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Custom HomeKit Characteristics.

const homebridgeLib = require('homebridge-lib')

function uuid (id) {
  return MyTypes.uuid(id, '-0000-1000-8000-656261617577')
}

class MyTypes extends homebridgeLib.CustomHomeKitTypes {
  constructor (homebridge) {
    super(homebridge)

    this.createCharacteristicClass('Delay', uuid('0A0'), {
      format: this.Formats.UINT16,
      unit: this.Units.SECONDS,
      minValue: 1,
      maxValue: 3600,
      minStep: 1,
      perms: [this.Perms.READ, this.Perms.NOTIFY, this.Perms.WRITE],
      adminOnlyAccess: [this.Access.WRITE]
    })
    this.createCharacteristicClass('Random', uuid('0A8'), {
      format: this.Formats.BOOL,
      perms: [this.Perms.READ, this.Perms.NOTIFY, this.Perms.WRITE]
    })
  }
}

module.exports = MyTypes