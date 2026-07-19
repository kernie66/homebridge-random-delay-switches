/** biome-ignore-all lint/style/useExportType: Typings for homebridge-lib */

/** biome-ignore-all lint/suspicious/noExplicitAny: Use any initially */
declare module 'homebridge-lib/Platform' {
  import type { Access, API, Characteristic, Formats, HAP, Logging, Perms, Units } from 'homebridge';
  import type { PackageJson } from 'type-fest';

  import { Delegate } from 'homebridge-lib/Delegate';

  import type TdPlatform from '../../TdPlatform.ts';
  import type { ConfigJson } from '../ConfigJsonTypes.ts';

  import { EveCharacteristics, EveServices } from './EveTypes.ts';
  import { HapCharacteristics, HapServices } from './HapTypes.ts';

  /** Homebridge dynamic platform plugin.
   * <br>See {@link Platform}.
   * @name Platform
   * @type {Class}
   * @memberof module:homebridge-lib
   */
  /** Homebridge dynamic platform plugin.
   *
   * `Platform` provides the following features to a platform plugin:
   * - Check the versions of NodeJS and Homebridge;
   * - Check whether a newer version of the plugin has been published to the NPM
   * registry;
   * - Handle the administration of the HomeKit accessories exposed by
   * the plugin through Homebridge;
   * - Persist HomeKit accessories across Homebridge restarts;
   * - Support for device polling by providing a heartbeat;
   * - Support for UPnP device discovery;
   * - Support dynamic configuration through the Homebridge UI.
   * @abstract
   * @extends Delegate
   */

  class Platform<P> extends Delegate<P> {
    readonly logLevel: number;

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

    /** Load the platform plugin.
     *
     * Called by Homebridge, through the plugin's `index.js`, when loading the
     * plugin from the plugin directory, typically `/usr/lib/node_modules`.
     * @static
     * @param {!API} homebridge - Homebridge
     * [API](https://github.com/nfarina/homebridge/blob/master/lib/api.js).
     * @param {!object} packageJson - The contents of the plugin's `package.json`.
     * @param {!string} platformName - The name of the platform plugin, as used
     * in Homebridge's `config.json`.
     * @param {!Platform} Platform - The constructor of the platform plugin.
     */
    static loadPlatform(homebridge: API, packageJson: PackageJson, platformName: string, Platform: TdPlatform): void;

    get Accessory(): {
      Categories: Characteristic;
    };
    get Services(): {
      eve: EveServices;
      hap: HapServices;
      my: {
        DeconzGateway: object;
        Resource: object;
      };
    };
    get Characteristic(): {
      Formats: Formats;
      Perms: Perms;
      Units: Units;
    };
    get Characteristics(): {
      eve: EveCharacteristics;
      hap: HapCharacteristics;
      my: object;
    };
    /** Content of the plugin's package.json file.
     * @type {object}
     * @readonly
     */
    get packageJson(): unknown;
    /** Create a new instance of the platform plugin.
     *
     * Called by Homebridge when initialising the plugin from `config.json`.
     * Note that only one instance of a dynamic platform plugin can be created.
     * @param {!logger} log - Instance of Homebridge
     * [logger](https://github.com/nfarina/homebridge/blob/master/lib/logger.js)
     * for the plugin.
     * @param {?object} configJson - The contents of the platform object from
     * Homebridge's `config.json`, or `null` when the plugin isn't included
     * in config.json.
     * @param {!API} homebridge - Homebridge
     * [API](https://github.com/nfarina/homebridge/blob/master/lib/api.js).
     */
    constructor(log: Logging, configJson: ConfigJson, homebridge: API);
    _main(): Promise<void>;
    /** Create a debug dump file.
     *
     * The dump file is a gzipped json file containing
     * - The hardware and software environment of the server running Homebridge;
     * - The versions of the plugin and of homebridge-lib;
     * - The contents of config.json;
     * - Any plugin-specific information.
     *
     * The file is created in the Homebridge user directory, and named after
     * the plugin.
     * @param {*} dumpInfo - Plugin-specific information.
     */
    createDumpFile(dumpInfo?: unknown): Promise<void>;
    _flushCachedAccessories(): void;
    _beat(beat: number): void;
    _shutdown(): void;
    _exit(): void;
    _identify(): void;
    _checkLatest(name: string, version: string): Promise<void>;
    /** Configure an accessory, after it has been restored from peristent
     * storage.
     *
     * Called by homebridge when restoring peristed accessories, typically from
     * `~/.homebridge/accessories/cachedAccessories`.
     * @method
     * @param {!PlatformAccessory} accessory - The restored Homebridge
     * [PlatformAccessory](https://github.com/nfarina/homebridge/blob/master/lib/platformAccessory.js).
     */
    configureAccessory(accessory: object): void;
    _getAccessory(delegate: object, params: object): object;
    _removeAccessory(accessory: object): void;
    /** Configure UPnP discovery.
     *
     * @param {!object} config - ...
     * @param {?string} config.class - Filter on UPnP device class.
     * Default `upnp:rootdevice`.  Use `ssdp:all` for all device classes.
     * @param {?string} config.host - UPnP address and port.
     * Default: `239.255.255.250:1900`.
     * @param {function} config.filter - Filter on UPnP message content.
     * The function takes the message as argument and returns a boolean.
     * Default: `(message) => { return true }`, return all messages.
     * @param {integer} config.timeout - Timeout (in seconds) for UPnP search.
     * Default: `5`.
     */
    upnpConfig(config: object): void;
    /** Handler for requests from the Homebridge Plugin UI Server.
     * @function Platform#onUiRequest
     * @async
     * @abstract
     * @param {string} method - The request method.
     * @param {string} resource - The request resource.
     * @param {*} body - The request body.
     * @returns {*} - The response body.
     */
    _createUiServer(): Promise<void>;
    _message(level: string, logLevel: number, namePrefix: string, ...args: Array<string | Error>): void;
  }
  export { Platform };
}
