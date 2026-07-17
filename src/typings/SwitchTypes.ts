// Types for Switches

import { Service } from 'homebridge';

export interface SwitchConfigTypes {
  name: string;
  delay: number;
  random: boolean;
  minDelay: number;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  cronString?: string;
  heartrate: number;
  useConfig: boolean;
}

export interface SwitchAccessoryParams extends AccessoryParams {
  delay: number;
  random: boolean;
  minDelay: number;
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
