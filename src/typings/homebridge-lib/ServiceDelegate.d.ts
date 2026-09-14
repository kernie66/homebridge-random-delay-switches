declare module 'homebridge-lib/ServiceDelegate' {
  import type { Access, Characteristic, CharacteristicProps } from 'homebridge';
  import type { Delegate } from 'homebridge-lib/Delegate';
  import type { History } from 'homebridge-lib/ServiceDelegate/History';

  import type { HbLibCharacteristicType } from './HbLibTypes.js';

  class ServiceDelegate<P, T> extends Delegate<P> {
    name: string;
    silent?: boolean;
    hidden?: boolean;
    values: T;

    static History: typeof History;

    addCharacteristicDelegate(params: {
      Characteristic: Characteristic;
      key: string;
      props?: Partial<CharacteristicProps>;
      silent?: boolean;
      value?: number | string | boolean;
      getter?: () => Promise<number | string | boolean>;
      setter?: (value: number | string | boolean) => Promise<typeof value>;
    }): CharacteristicDelegate;

    characteristicDelegate(key: string): CharacteristicDelegate;

    constructor(accessoryDelegate: unknown, params = {});
  }

  //ServiceDelegate.History = History;
  export { ServiceDelegate };
}
