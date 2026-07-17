/** biome-ignore-all lint/style/useExportType: Don't export type in module declaration */
/** biome-ignore-all lint/correctness/noUnusedVariables: Global types for homebridge-lib */

declare module 'homebridge-lib/ServiceDelegate' {
  import type { Formats, Perms, Units } from 'homebridge';
  import type { History } from 'homebridge-lib/ServiceDelegate/History';

  // import { History } from './History.js';
  import { Delegate } from 'homebridge-lib/Delegate';

  import type { EveCharacteristics } from './EveTypes.ts';
  import type { HapCharacteristics } from './HapTypes.ts';

  type CharacteristicType = {
    // [key: string]: {
    Formats: Formats;
    Perms: Perms;
    Units: Units;
    // };
  };

  type CharacteristicsType = {
    eve: EveCharacteristics;
    // {
    //   [key: string]: unknown;
    // };
    hap: HapCharacteristics;
    // {
    //   [key: string]: unknown;
    //   TemperatureDisplayUnits: {
    //     CELSIUS: number;
    //     FAHRENHEIT: number;
    //   };
    // };
    my: {
      [key: string]: unknown;
    };
  };

  class ServiceDelegate<T> extends Delegate {
    name: string;
    silent?: boolean;
    values: T; // Record<string, boolean | number | string | Date | windDirection>;
    Characteristic: CharacteristicType;
    Characteristics: CharacteristicsType;

    static History: typeof History;
    // History: History;

    addCharacteristicDelegate(params: {
      Characteristic: unknown;
      key: string;
      props?: Record<string, unknown>;
      silent?: boolean;
      unit?: string;
      value?: unknown;
    }): CharacteristicDelegate;

    characteristicDelegate(key: string): CharacteristicDelegate;

    constructor(accessoryDelegate: unknown, params = {});
  }

  //ServiceDelegate.History = History;
  export { ServiceDelegate };
}
