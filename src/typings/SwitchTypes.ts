// Types for Switches

import type { Service } from 'homebridge';

export type SwitchConfigType = {
  name: string;
  delay: string;
  random: boolean;
  minDelay: string;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  cronString?: string;
  heartrate: number;
  useConfig: boolean;
};

export type SwitchSettingType = {
  cronArray: string[];
  prefix: string;
  uuid: string;
} & Required<SwitchConfigType>;

export type SwitchAccessoryParams = {
  delay: string;
  random: boolean;
  minDelay: string;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  cronArray: string[];
  heartrate: number;
  useConfig: boolean;
} & AccessoryParams;

export type SwitchServiceParams = {
  name?: string;
  primaryService?: boolean;
  Service?: Service;
  // {
  //   eve: {
  //     TemperatureSensor: object;
  //     HumiditySensor: object;
  //     AirQualitySensor: object;
  //   };
  //   hap: HapServices;
  //   //Service;
  //   // {
  //   //   Lightbulb: object;
  //   //   Switch: object;
  //   //   OccupancySensor: object;
  //   //   TemperatureSensor: object;
  //   //   HumiditySensor: object;
  //   //   AirQualitySensor: object;
  //   // };
  //   my: {
  //     DeconzGateway: object;
  //     Resource: object;
  //   };
  // };
};
