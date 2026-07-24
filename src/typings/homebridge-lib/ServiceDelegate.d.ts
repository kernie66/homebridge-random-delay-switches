/** biome-ignore-all lint/style/useExportType: Don't export type in module declaration */
/** biome-ignore-all lint/correctness/noUnusedVariables: Global types for homebridge-lib */

declare module 'homebridge-lib/ServiceDelegate' {
  import type { Access, Characteristic, CharacteristicProps } from 'homebridge';
  import type { Delegate } from 'homebridge-lib/Delegate';
  import type { History } from 'homebridge-lib/ServiceDelegate/History';

  import type { HbLibCharacteristicType } from './HbLibTypes.js';

  class ServiceDelegate<P, T> extends Delegate<P> {
    name: string;
    silent?: boolean;
    values: T;

    static History: typeof History;

    addCharacteristicDelegate(params: {
      Characteristic: Characteristic;
      key: string;
      props?: Partial<CharacteristicProps>;
      silent?: boolean;
      value?: unknown;
    }): CharacteristicDelegate;

    characteristicDelegate(key: string): CharacteristicDelegate;

    constructor(accessoryDelegate: unknown, params = {});
  }

  //ServiceDelegate.History = History;
  export { ServiceDelegate };
}
