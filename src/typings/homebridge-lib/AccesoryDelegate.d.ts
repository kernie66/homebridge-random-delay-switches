declare module 'homebridge-lib/AccessoryDelegate' {
  import type { Access, Categories, Characteristic, Formats, Perms, Service, Units } from 'homebridge';

  import { Delegate } from 'homebridge-lib/Delegate';

  import type { HapCharacteristics, HapServices } from './HapTypes.ts';

  import { EveCharacteristics, EveServices } from './EveTypes.ts';
  import 'homebridge-lib/ServiceDelegate/AccessoryInformation';

  /** Delegate of a HomeKit accessory.
   * <br>See {@link AccessoryDelegate}.
   * @name AccessoryDelegate
   * @type {Class}
   * @memberof module:homebridge-lib
   */
  /** Delegate of a HomeKit accessory.
   *
   * @abstract
   * @extends Delegate
   */

  class AccessoryDelegate<P, T> extends Delegate<P> implements AccessoryParams {
    // id: string;
    // name: string;
    values: T;
    platform: P;
    readonly logLevel: number;

    readonly Accessory: {
      Categories: Categories;
    };
    readonly Characteristic: {
      Access: Access;
      Formats: Formats;
      Perms: Perms;
      Units: Units;
    };
    readonly Characteristics: {
      eve: EveCharacteristics;
      hap: HapCharacteristics;
      my: object;
    };
    readonly Services: {
      eve: EveServices;
      hap: HapServices;
      my: {
        DeconzGateway: object;
        Resource: object;
      };
    };
    /** Create a new instance of a HomeKit accessory delegate.
     *
     * When the corresponding HomeKit accessory was restored from persistent
     * storage: object; it is linked to the delegate. Otherwise a new accessory
     * will be created, using the values from `params`.
     * @param {!Platform} platform - Reference to the corresponding platform
     * plugin instance.
     * @param {!object} params - Properties of the HomeKit accessory.
     * @param {!string} params.id - The unique ID of the accessory, used to
     * derive the HomeKit accessory UUID.<br>
     * Must be unchangeable, preferably a serial number or mac address.
     * @param {!string} params.name - The accessory name.<br>
     * Also used to prefix log and error messages.
     * @param {?string} params.category - The accessory category.
     * @param {!string} params.manufacturer - The accessory manufacturer.
     * @param {!string} params.model - The accessory model.
     * @param {!string} params.firmware - The accessory firmware revision.
     * @param {?string} params.hardware - The accessory hardware revision.
     * @param {?string} params.software - The accessory software revision.
     * @param {?integer} params.logLevel - The log level for the accessory
     */
    constructor(platform: P, params?: AccessoryParams);
    /** Destroy accessory delegate and associated HomeKit accessory.
     * @params {boolean} [delegateOnly=false] - Destroy the delegate, but keep the
     * associated HomeKit accessory (including context).
     */
    destroy(delegateOnly?: boolean): void;
    _linkServiceDelegate(serviceDelegate: unknown): unknown;
    _unlinkServiceDelegate(serviceDelegate: unknown, delegateOnly: unknown): void;
    /** Creates a new {@link PropertyDelegate} instance, for a property of the
      * associated HomeKit accessory.
      *
      * The property value is accessed through
      * {@link AccessoryDelegate#values values}.
      * The delegate is returned, but can also be accessed through
      * {@link AccessoryDelegate#propertyDelegate propertyDelegate()}.
      * @param {!object} params - Parameters of the property delegate.
      * @param {!string} params.key - The key for the property delegate.<br>
      * Needs to be unique with parent delegate.
      // * @param {!type} params.type - The type of the property value.
      * @param {?*} params.value - The initial value of the property.<br>
      * Only used when the property delegate is created for the first time.
      * Otherwise, the value is restored from persistent storage.
      * @param {?boolean} params.logLevel - Level for homebridge log messages
      * when property was set or has been changed.
      * @param {?string} params.unit - The unit of the value of the property.
      * @returns {PropertyDelegate}
      * @throws {TypeError} When a parameter has an invalid type.
      * @throws {RangeError} When a parameter has an invalid value.
      * @throws {SyntaxError} When a mandatory parameter is missing or an
      * optional parameter is not applicable.
      */
    addPropertyDelegate(params?: {
      key: string;
      logLevel?: number;
      silent?: boolean;
      unit?: string;
      value?: string | number | boolean;
    }): unknown;
    removePropertyDelegate(key: unknown): void;
    /** Returns the property delegate corresponding to the property key.
     * @param {!string} key - The key for the property.
     * @returns {PropertyDelegate}
     */
    propertyDelegate(key: string): string | number | boolean;
    /** Values of the HomeKit characteristics for the `AccessoryInformation` service.
     *
     * Contains the key of each property and of each characteristic in
     * {@link ServiceDelegate.AccessoryInformation AccessoryInformation}.
     * When the value is written, the value of the corresponding HomeKit
     * characteristic is updated.
     * @type {object}
     */
    // get values(): T;
    // set values(values: {
    //   [key: string]: string | number | boolean;
    // });
    /** Enable `heartbeat` events for this accessory delegate.
     * @type {boolean}
     */
    get heartbeatEnabled(): boolean;
    set heartbeatEnabled(value: boolean);
    setAlive(): void;
    /** Plugin-specific context to be persisted across Homebridge restarts.
     *
     * After restart, this object is passed back to the plugin through the
     * {@link Platform#event:accessoryRestored accessoryRestored} event.
     * The plugin should store enough information to re-create the accessory
     * delegate, after Homebridge has restored the accessory.
     * @type {object}
     */
    get context(): unknown;
    /** Current log level.
     *
     * The log level determines what type of messages are printed:
     *
     * 0. Print error and warning messages.
     * 1. Print error, warning, and log messages.
     * 2. Print error, warning, log, and debug messages.
     * 3. Print error, warning, log, debug, and verbose debug messages.
     *
     * Note that debug messages (level 2 and 3) are only printed when
     * Homebridge was started with the `-D` or `--debug` command line option.
     *
     * The log level is initialised at 2 when the accessory is newly created.
     * It can be changed programmatically.
     * The log level is persisted across Homebridge restarts.
     * @type {!integer}
     */
    get logLevel(): number;
    /** Inherit `logLevel` from another accessory delegate.
     * @param {AccessoryDelegate} delegate - The delegate to inherit `logLevel`
     * from.
     */
    inheritLogLevel(delegate: unknown): void;
    /** Manage `logLevel` from characteristic delegate.
     * @param {CharacteristicDelegate|PropertyDelegate} delegate - The delegate
     * of the `logLevel` characteristic.
     * @param {Boolean} [forPlatform=false] - Manage the Platform `logLevel` as
     * well.
     */
    manageLogLevel(delegate: unknown, forPlatform?: boolean): void;
    _identify(): void;
  }
  export { AccessoryDelegate };
}

interface AccessoryParams {
  category: Categories;
  firmware: string;
  hardware?: string;
  id: string;
  logLevel?: number;
  manufacturer: string;
  model: string;
  name: string;
  software?: string;
}
