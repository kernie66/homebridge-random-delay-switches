// Types for Config.json
// This file defines the structure of the configuration JSON file for the Homebridge plugin.

import { SwitchConfigTypes } from './SwitchTypes.js';

export interface ConfigJson {
  name: string;
  delaySwitches?: Array<SwitchConfigTypes>;
  platform?: string;
}
