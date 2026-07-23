// Types for Switches

import type { Service } from 'homebridge';

export interface SwitchConfigTypes {
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
  prefix: string;
  uuid: string;
}

export interface SwitchAccessoryParams extends AccessoryParams {
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
}

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
