declare module 'homebridge-lib/Delegate' {
  import type { Access, Categories, Formats, Perms, Units } from 'homebridge';
  import type { EventEmitter } from 'node:events';

  import type TdPlatform from '../../TdPlatform.ts';
  import type { HbLibCharacteristicsType, HbLibCharacteristicType, HbLibServicesType } from './HbLibTypes.ts';

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
  class Delegate<P> extends EventEmitter {
    /** The name used to prefix log and error messages.
     * @type {string}
     */
    name: string;

    /** The name prefix for log messages.
     *  @type {string}
     */
    readonly _namePrefix: string;

    /** Reference to the corresponding platform plugin instance.
     *
     * For instances of `Platform`, it returns `this`.
     * @type {!Platform}
     * @readonly
     */
    readonly platform: P;

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
    readonly logLevel: number;

    /** HomeKit accessory property values.
     * @type {object}
     * @property {Object<string, Accessory.Category>} Categories -
     * Valid HomeKit accessory categories.
     * @readonly
     */
    readonly Accessory: {
      Categories: typeof Categories;
    };

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
    readonly Characteristic: HbLibCharacteristicType;

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
    readonly Characteristics: HbLibCharacteristicsType;

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
    readonly Services: HbLibServicesType;

    /** Create a new `Delegate` instance.
     * @abstract
     * @param {?Platform} platform - Reference to the corresponding platform
     * plugin instance.<br>
     * Must be non-null, except for instances of `Platform`.
     * @param {?string} name - The name used to prefix log and error messages.
     */
    constructor(platform: P, name: string);

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
