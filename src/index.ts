// homebridge-random-delay-switches/index.ts
// Copyright © 2021-2026 Kenneth Jagenheim. All rights reserved.
//
// Homebridge plugin for random delay switches.

import type { API } from 'homebridge';
import type { PackageJson } from 'type-fest';

import { createRequire } from 'node:module';

import RdsPlatform from './RdsPlatform.js';

const require = createRequire(import.meta.url);
const packageJson: PackageJson = require('../package.json');

function main(homebridge: API) {
  RdsPlatform.loadPlatform(homebridge, packageJson, 'RandomDelaySwitches', RdsPlatform);
}

export { main as default };
