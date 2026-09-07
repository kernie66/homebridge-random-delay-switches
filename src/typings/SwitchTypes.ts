// Types for Switches

import type { Service } from 'homebridge';

// oxlint-disable-next-line import/no-unassigned-import
import 'temporal-polyfill';

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

export const maxDelayDuration = Temporal.Duration.from({ days: 10 });

export type SwitchSettingType = {
  prefix: string;
  uuid: string;
  delayDuration: Temporal.Duration;
  minDelayDuration: Temporal.Duration;
} & Required<SwitchConfigType>;

export type SwitchAccessoryParams = {
  delay: Temporal.Duration;
  minDelay: Temporal.Duration;
  random: boolean;
  disableSensor: boolean;
  startOnReboot: boolean;
  singleActivation: boolean;
  repeats: number;
  infiniteRepeats: boolean;
  cronString: string;
  heartrate: number;
  useConfig: boolean;
} & AccessoryParams;

export type SwitchServiceParams = {
  name?: string;
  primaryService?: boolean;
  hidden?: boolean;
  Service?: Service;
};
