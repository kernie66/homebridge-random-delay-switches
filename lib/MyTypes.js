// homebridge-random-delay-switch/lib/MyTypes.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Custom HomeKit Characteristics.

class MyTypes extends homebridgeLib.CustomHomeKitTypes {
  constructor (homebridge) {
    super(homebridge)

    this.createCharacteristicClass('Delay', 'B469181F-D796-46B4-8D99-5FBE4BA9DC9C', {
      format: this.Formats.UINT16,
      unit: this.Units.SECONDS,
      minValue: 1,
      maxValue: 3600,
      minStep: 1,
      perms: [this.Perms.READ, this.Perms.NOTIFY, this.Perms.WRITE],
      adminOnlyAccess: [this.Access.WRITE]
    })
    this.createCharacteristicClass('Random', '75df946e-9615-11eb-9e04-9f55c0c0686d', {
      format: this.Formats.BOOL,
      perms: [this.Perms.READ, this.Perms.NOTIFY, this.Perms.WRITE]
    })
  }
}

module.exports = MyTypes