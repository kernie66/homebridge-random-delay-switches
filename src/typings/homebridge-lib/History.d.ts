/** biome-ignore-all lint/suspicious/noExplicitAny: Converted from Typescript Playground */
/** biome-ignore-all lint/complexity/noBannedTypes: Converted from Typescript Playground */

declare module 'homebridge-lib/ServiceDelegate/History' {
  import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate';
  class History extends ServiceDelegate<null> {
    constructor(accessoryDelegate: unknown, params = {});
    addLastOnDelegate(onDelegate: CharacteristicDelegate, lastOnDelegate: CharacteristicDelegate): void;
    /** Return current time as # seconds since NodeJS epoch.
     * @returns {integer} # seconds since NodeJS epoch.
     */
    static now(): number;
    /** Convert date intp `Characteristics.eve.LastActivation` characteristic value.
     * @param {integer} date - Seconds since NodeJS epoch.
     * @returns {integer} Value for last activation.
     */
    lastActivationValue(date: number): number;
    /** Convert a history entry to a buffer.
     * @abstract
     * @param {object} entry - The entry.
     * @returns {Buffer} A Buffer with the values from the entry.
     */
    entryToBuffer(entry: Record<string, unknown>): Buffer;
    /** Add an entry to the history.
     * @param {object} entry - The entry.
     */
    addEntry(entry: Record<string, unknown>): void;
  }

  // declare class History extends ServiceDelegate {
  //   constructor(accessoryDelegate: any, params?: {});
  //   addLastOnDelegate(onDelegate: any, lastOnDelegate: any): void;
  //   /** Return current time as # seconds since NodeJS epoch.
  //    * @returns {integer} # seconds since NodeJS epoch.
  //    */
  //   static now(): number;
  //   /** Convert date intp `Characteristics.eve.LastActivation` characteristic value.
  //    * @param {integer} date - Seconds since NodeJS epoch.
  //    * @returns {integer} Value for last activation.
  //    */
  //   lastActivationValue(date?: any): number;
  //   /** Convert a history entry to a buffer.
  //    * @abstract
  //    * @param {object} entry - The entry.
  //    * @returns {Buffer} A Buffer with the values from the entry.
  //    */
  //   entryToBuffer(entry: any): any;
  //   /** Add an entry to the history.
  //    * @param {object} entry - The entry.
  //    */
  //   addEntry(entry: any): void;
  //   _onSetHistoryRequest(value: any): Promise<void>;
  //   _onGetEntries(): Promise<any>;
  //   _onSetConfig(value: any): Promise<void>;
  //   _onGetConfig(): Promise<any>;
  // }
  // ServiceDelegate.History = History;
  export type { History };
}
