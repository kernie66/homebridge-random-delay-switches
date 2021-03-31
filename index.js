// homebridge-random-delay-switches/index.js
// Copyright © 2021 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

'use strict'

const RdsPlatform = require('./lib/RdsPlatform')
const packageJson = require('./package.json')

module.exports = function (homebridge) {
  RdsPlatform.loadPlatform(homebridge, packageJson, 'RandomDelaySwitches', RdsPlatform)
}
