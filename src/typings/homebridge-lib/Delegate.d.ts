/** biome-ignore-all lint/style/useExportType: Export as in real file */
declare module 'homebridge-lib/Delegate' {
  import { EventEmitter } from 'node:events';

  import type TdPlatform from '../../TdPlatform.ts';
  /** Abstract superclass for {@link Platform}, {@link AccessoryDelegate},
   * {@link ServiceDelegate}, and {@link CharacteristicDelegate}.
   * <br>See {@link Delegate}.
   * @name Delegate
   * @type {Class}
   * @memberof module:homebridge-lib
   */
  /** Abstract superclass for {@link Platform}, {@link AccessoryDelegate},
   * {@link ServiceDelegate}, and {@link CharacteristicDelegate}.
   *
   * `Delegate` provides basic functions for logging and error handling,
   * for accessing HAP-NodeJS classes, and for event handling.
   * `Delegate` extends [EventEmitter](https://nodejs.org/dist/latest-v14.x/docs/api/events.html#events_class_eventemitter).
   * @abstract
   * @extends EventEmitter
   */
  class Delegate<P = unknown> extends EventEmitter {
    name: string;
    readonly platform: P;
    readonly logLevel: number;
    /** Create a new `Delegate` instance.
     * @abstract
     * @param {?Platform} platform - Reference to the corresponding platform
     * plugin instance.<br>
     * Must be non-null, except for instances of `Platform`.
     * @param {?string} name - The name used to prefix log and error messages.
     */
    constructor(platform: P, name: string);
    /** HomeKit accessory property values.
     * @type {object}
     * @property {Object<string, Accessory.Category>} Categories -
     * Valid HomeKit accessory categories.
     * @readonly
     */
    get Accessory(): unknown;
    /** HomeKit characteristic property values.
     *
     * @type {object}
     * @property {Object<string, Format>} Formats -
     * Valid HomeKit characteristic formats.
     * @property {Object<string, Perm>} Perms -
     * Valid HomeKit characteristic permissions.
     * @property {Object<string, Unit>} Units -
     * Standard HomeKit characteristic units.
     * @readonly
     */
    get Characteristic(): unknown;
    /** Subclasses of {@link Characteristic} for HomeKit characteristic types.
     * @type {object}
     * @property {Object<string, Class>} eve - Subclasses for custom HomeKit
     * characteristic types used by Eve.
     * <br>See {@link EveHomeKitTypes#Characteristics}.
     * @property {Object<string, Class>} hap - Subclasses for standard HomeKit
     * characteristic types.
     * @property {Object<string, Class>} my - Subclasses for my custom HomeKit
     * characteristic types.
     * <br>See {@link MyHomeKitTypes#Characteristics}.
     * @readonly
     */
    get Characteristics(): unknown;
    /** Subclasses of {@link Service} for HomeKit service types.
     * @type {object}
     * @property {Object<string, Class>} eve - Subclasses for custom HomeKit
     * service types used by Eve.
     * <br>See {@link EveHomeKitTypes#Services}.
     * @property {Object<string, Class>} hap - Subclasses for standard HomeKit
     * service types.
     * @property {Object<string, Class>} my - Subclasses for my custom HomeKit
     * characteristic typess.
     * <br>See {@link MyHomeKitTypes#Services}.
     * @readonly
     */
    get Services(): unknown;
    /** Current log level.
     *
     * The log level determines what type of messages are printed:
     *
     * 0. Print error and warning messages.
     * 1. Print error, warning, and log messages.
     * 2. Print error, warning, log, and debug messages.
     * 3. Print error, warning, log, debug, and verbose debug messages.
     * 3. Print error, warning, log, debug, verbose debug, and very verbose
     * debug messages.
     *
     * Note that debug messages (level 2, 3 and 4) are only printed when
     * Homebridge was started with the `-D` or `--debug` command line option.
     *
     * The log level defaults at 2.
     *
     * @type {!integer}
     * @readonly
     */
    get logLevel(): number;
    /** The name used to prefix log and error messages.
     * @type {string}
     */
    get name(): string;
    set name(name: string);
    /** The name prefix for log messages.
     *  @type {string}
     */
    get _namePrefix(): string;
    /** Reference to the corresponding platform plugin instance.
     *
     * For instances of `Platform`, it returns `this`.
     * @type {!Platform}
     * @readonly
     */
    get platform(): TdPlatform;
    /** Print a debug message to Homebridge standard output.
     * <br>The message is printed only, when the current log level >= 2 and when
     * Homebridge was started with the `-D` or `--debug` command line option.
     * @param {string|Error} format - The printf-style message or an instance of
     * [Error](https://nodejs.org/dist/latest-v14.x/docs/api/errors.html#errors_class_error).
     * @param {...string} args - Arguments to the printf-style message.
     */
    debug(format: string | Error, ...args: Array<unknown>): void;
    /** Safely emit an event, catching unknown errors.
     * @param {!string} eventName - The name of the event.
     * @param {...string} args - Arguments to the event.
     */
    emit(eventName: string, ...args: Array<unknown>): boolean;
    /** Print an error message to Homebridge standard error output.
     * @param {string|Error} format - The printf-style message or an instance of
     * [Error](https://nodejs.org/dist/latest-v14.x/docs/api/errors.html#errors_class_error).
     * @param {...string} args - Arguments to the printf-style message.
     */
    error(format: string | Error, ...args: Array<unknown>): void;
    /** Print an error message to Homebridge standard error output and shutdown
     * Homebridge.
     * @param {string|Error} format - The printf-style message or an instance of
     * [Error](https://nodejs.org/dist/latest-v14.x/docs/api/errors.html#errors_class_error).
     * @param {...string} args - Arguments to the printf-style message.
     */
    fatal(format: string | Error, ...args: Array<unknown>): void;
    /** Print a log message to Homebridge standard output.
     * <br>The message is printed only, when the current log level >= 1.
     * @param {string|Error} format - The printf-style message or an instance of
     * [Error](https://nodejs.org/dist/latest-v14.x/docs/api/errors.html#errors_class_error).
     * @param {...string} args - Arguments to the printf-style message.
     */
    log(format: string | Error, ...args: Array<unknown>): void;
    /** Print a verbose debug message to Homebridge standard output.
     * <br>The message is printed only, when the current log level >= 3 and when
     * Homebridge was started with the `-D` or `--debug` command line option.
     * @param {string|Error} format - The printf-style message or an instance of
     * [Error](https://nodejs.org/dist/latest-v14.x/docs/api/errors.html#errors_class_error).
     * @param {...string} args - Arguments to the printf-style message.
     */
    vdebug(format: string | Error, ...args: Array<unknown>): void;
    /** Print a very verbose debug message to Homebridge standard output.
     * <br>The message is printed only, when the current log level >= 4 and when
     * Homebridge was started with the `-D` or `--debug` command line option.
     * @param {string|Error} format - The printf-style message or an instance of
     * [Error](https://nodejs.org/dist/latest-v14.x/docs/api/errors.html#errors_class_error).
     * @param {...string} args - Arguments to the printf-style message.
     */
    vvdebug(format: string | Error, ...args: Array<unknown>): void;
    /** Print a warning message to Homebridge standard error output.
     * @param {string|Error} format - The printf-style message or an instance of
     * [Error](https://nodejs.org/dist/latest-v14.x/docs/api/errors.html#errors_class_error).
     * @param {...string} args - Arguments to the printf-style message.
     */
    warn(format: string | Error, ...args: Array<unknown>): void;
  }
  export { Delegate };
}
/*
  class Delegate extends EventEmitter {
    Services: {
      hap: {
        Switch: () => void;
        Lightbulb: () => void;
        HumiditySensor: () => void;
      };
      my: {
        Resource: () => void;
        DeconzGateway: () => void;
        LogLevel: () => number;
      };
      eve: {
        TemperatureSensor: () => void;
        HumiditySensor: () => void;
      };
    };

    logLevel: number;
    log: (message: string | Error, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
    fatal: (message: string, ...args: unknown[]) => void;
    debug: (message: string, ...args: unknown[]) => void;
    vdebug: (message: string, ...args: unknown[]) => void;

    constructor(platform: TdPlatform, params = {});
  }
}
*/
