// Types for Config.json
// This file defines the structure of the configuration JSON file for the Homebridge plugin.

import type { SwitchConfigType } from './SwitchTypes.js';

export type ConfigJson = {
  name: string;
  delaySwitches: SwitchConfigType[];
  platform: string;
};
