// Types for Switches

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
  lightbulb?: boolean;
  name?: string;
  primaryService?: boolean;
  Service?: unknown;
};
