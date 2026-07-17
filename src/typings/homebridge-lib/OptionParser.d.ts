declare module 'homebridge-lib/OptionParser' {
  import { EventEmitter } from 'node:events';
  /** User input error.
   * @hideconstructor
   * @extends Error
   * @memberof OptionParser
   */
  class UserInputError extends Error {}
  /** Parser and validator for options and other parameters.
   * <br>See {@link OptionParser}.
   * @name OptionParser
   * @type {Class}
   * @memberof module:hb-lib-tools
   */
  /** Parser and validator for options and other parameters.
   *
   * @extends EventEmitter
   * @emits userInputError
   * @emits warning
   */
  class OptionParser<T> extends EventEmitter {
    /** Commonly used regular expressions.
     * @type {object}
     * @property {RegExp} hostname - Internet hostname.
     * @property {RegExp} int - Decimal integer.
     * @property {RegExp} intBin - Binary integer, optionally prefixed with `0b`.
     * @property {RegExp} intOct - Octal integer, optionally prefixed with `0o`.
     * @property {RegExp} intHex - Hexadecimal integer, optionally prefixed with `0x`.
     * @property {RegExp} ipv4 - IPv4 address in dot notation.
     * @property {RegExp} number - Number.
     * @property {RegExp} mac - Mac address (EUI-48).
     * @property {RegExp} mac64 - 64-bit mac address (EUI-64).
     * @property {RegExp} uuid - UUID.
     */
    static get patterns(): Readonly<{
      _host: RegExp;
      hostname: RegExp;
      int: RegExp;
      intBin: RegExp;
      intOct: RegExp;
      intHex: RegExp;
      ipv4: RegExp;
      number: RegExp;
      mac: RegExp;
      mac64: RegExp;
      uuid: RegExp;
    }>;
    static get UserInputError(): typeof UserInputError;
    /** Casts input value to boolean.
     *
     * Valid input values are:
     * - A boolean;
     * - A number with value 0 (false) or 1 (true);
     * - A string with value 'false', 'no', 'off', or '0' (false); or
     * with value 'true', 'yes', 'on', or '1' (true).
     * @param {!string} key - The key of the input value (for error messages).
     * @param {*} value - The input value.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {boolean} The value as boolean.
     * @throws {TypeError} On invalid input value.
     * @throws {UserError} On error, when value was input by user.
     */
    static toBool(key: string, value: boolean | number | string, userInput: boolean = false): boolean;
    /** Casts input value to integer, optionally clamped between min and max.
     *
     * Valid input values are:
     * - A boolean: false (0) or true (1);
     * - A number with an integer value;
     * - A string holding an integer value in decimal, binary, octal or
     * hexadecimal notation.
     * @param {!string} key - The key of the input value (for error messages).
     * @param {*} value - The input value.
     * @param {?integer} min - Minimum value returned.
     * @param {?integer} max - Maximum value returned.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {integer} The value as integer.
     * @throws {TypeError} On invalid input value.
     * @throws {UserError} On error, when value was input by user.
     */
    static toInt(
      key: string,
      value: boolean | number | string,
      min?: number,
      max?: number,
      userInput: boolean = false,
    ): number;
    /** Converts an integer value to a formatted string.
     *
     * The integer value is converted to a string in the specified radix.
     * The string is prepended with spaces (radix 10) or zeroes (other radix
     * values) to match the minimum length.
     *
     * @param {!string} key - The key of the value (for error messages).
     * @param {integer} value - The input value.
     * @param {integer} [radix=10] - The radix.
     * @param {integer} [length=0] - The minimum length of the formatted string.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {string} The formatted string.
     * @throws {TypeError} On invalid input value.
     */
    static toIntString(
      key: string,
      value: number,
      radix: number = 10,
      length: number = 0,
      userInput: boolean = false,
    ): string;
    /** Casts input value to number, optionally clamped between min and max.
     *
     * Valid input values are:
     * - A boolean: false (0) or true (1);
     * - A real number (not: NaN, -Infinity, Infinity);
     * - A string holding a number value.
     * @param {!string} key - The key of the input value (for error messages).
     * @param {*} value - The input value.
     * @param {?number} min - Minimum value returned.
     * @param {?number} max - Maximum value returned.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {number} The value as number.
     * @throws {TypeError} On invalid input value.
     * @throws {UserError} On error, when value was input by user.
     */
    static toNumber(
      key: string,
      value: boolean | number | string,
      min?: number,
      max?: number,
      userInput: boolean = false,
    ): number;
    /** Converts an integer value to a formatted string.
     *
     * The integer value is converted to a string, optionally with a fixed
     * number of decimals.
     * The string is prepended with `0`s to match the minimum length.
     *
     * @param {!string} key - The key of the value (for error messages).
     * @param {integer} value - The input value.
     * @param {integer} [length=0] - The minimum length of the formatted string.
     * @param {?integer} decimals - The fixed number of decimals
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {string} The formatted string.
     * @throws {TypeError} On invalid input value.
     */
    static toNumberString(
      key: string,
      value: number,
      length: number = 0,
      decimals?: null,
      userInput: boolean = false,
    ): string;
    /** Casts input value to string, optionally non-empty.
     *
     * Valid values are:
     * - A string.
     * - A boolean.
     * - A number.
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @param {boolean} [nonEmpty=false] - Empty string is invalid value.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {string} The value as string.
     * @throws {TypeError} On invalid input value.
     * @throws {RangeError} On empty string, when noEmptyString has been set.
     * @throws {UserError} On error, when value was input by user.
     */
    static toString(
      key: string,
      value: boolean | string | number,
      nonEmpty: boolean = false,
      userInput: boolean = false,
    ): string;
    /** Casts input value to hostname[:port].
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @param {boolean} [asString=false] - Return path as string instead of object.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {object|string} The value as { hostname: hostname, port: port }.
     * @throws {TypeError} On invalid input value.
     * @throws {RangeError} On empty string, when noEmptyString has been set.
     * @throws {UserError} On error, when value was input by user.
     */
    static toHost(key: string, value: string, asString: boolean = false, userInput: boolean = false): object | string;
    /** Casts input value to path.
     *
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {string} The value as normalised resource path.
     * @throws {TypeError} On invalid input value.
     * @throws {RangeError} On empty string, on string not starting with '/'.
     * @throws {UserError} On error, when value was input by user.
     */
    static toPath(key: string, value: string, userInput: boolean = false): string;
    /** Casts input value to array.
     *
     * Valid values are:
     * - Null (empty array);
     * - A boolean, number, or string (singleton array);
     * - An array.
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {string} The value as array.
     * @throws {TypeError} On invalid input value.
     * @throws {UserError} On error, when value was input by user.
     */
    static toArray(
      key: string,
      value: null | string | boolean | number | Array<boolean | number | string>,
      userInput: boolean = false,
    ): Array<boolean | number | string>;
    /** Casts input value to object.
     *
     * Valid values are:
     * - Null (empty object);
     * - A proper object (i.e. not a class instance).
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @param {boolean} [userInput=false] - Value was input by user.
     * @returns {Object} The value.
     * @throws {TypeError} On invalid input value.
     * @throws {UserError} On error, when value was input by user.
     */
    static toObject(key: string, value: null | object, userInput: boolean = false): object;
    /** Casts input value to function.
     *
     * Valid values are:
     * - A proper function (i.e. not a class).
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @returns {function} The value.
     * @throws {TypeError} On invalid input value.
     */
    static toFunction(key: string, value: unknown): unknown;
    /** Casts input value to function.
     *
     * Valid values are:
     * - A proper async function.
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @returns {function} The value.
     * @throws {TypeError} On invalid input value.
     */
    static toAsyncFunction(key: string, value: unknown): unknown;
    /** Casts input value to class.
     *
     * Valid values are:
     * - A proper Class or function with a prototype.
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @param {?Class} SuperClass - Check for subclass of SuperClass.
     * @returns {*} The value.
     * @throws {TypeError} On invalid input value.
     */
    static toClass(key: string, value: unknown, SuperClass?: unknown): unknown;
    /** Casts input value to class instance.
     *
     * Valid values are:
     * - A class instance or a proper function.
     * @param {!string} key - The key of the value (for error messages).
     * @param {*} value - The input value.
     * @param {!Class} Class - Check for instance of Class.
     * @returns {Class} The value.
     * @throws {TypeError} On invalid input value.
     */
    static toInstance(key: string, value: unknown, Class: unknown): unknown;

    /** Creates a new OptionParser instance
     *
     * @param {boolean} [userInput=false] - Options were input by user.
     */
    constructor(object?: T, userInput: boolean = false);
    /** Checks that key is valid and not yet in use.
     *
     * @param {!string} key - The key.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    _toKey(key: string): string;
    /** Defines a key that takes an array as value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    arrayKey(key: string): this;
    /** Defines a key that takes an async function as value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    asyncFunctionKey(key: string): this;
    /** Defines a key that takes a boolean value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    boolKey(key: string): this;
    /** Defines a key that takes an enum value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    enumKey(key: string): this;
    /** Defines a value for an enum key.
     *
     * @param {!string} key - The key.
     * @param {!string} value - The key.
     * @param {?function} callback - Function to call when enum value is present.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    enumKeyValue(key: string, value: string, callback?: () => void): this;
    /** Defines a key that takes a function as value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    functionKey(key: string): this;
    /** Defines a key that takes a hostname[:port] as value.
     *
     * @param {!string} key - The key.
     * @param {string} [hostnameKey=hostname] - The key for the hostname.
     * @param {string} [portKey=port] - The key for the port.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    hostKey(key?: string, hostnameKey?: string, portKey?: string): this;
    /** Defines a key that takes an integer value,
     * optionally clamped between min and max.
     *
     * @param {!string} key - The key.
     * @param {!Class} Class - Check for instance of Class.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    instanceKey(key: string, Class: unknown): this;
    /** Defines a key that takes an integer value,
     * optionally clamped between min and max.
     *
     * @param {!string} key - The key.
     * @param {?integer} min - Minimum value returned.
     * @param {?integer} max - Maximum value returned.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    intKey(key: string, min?: number, max?: number): this;
    /** Defines a key that takes a list of strings as value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    listKey(key: string): this;
    /** Defines a key that takes an number value,
     * optionally clamped between min and max.
     *
     * @param {!string} key - The key.
     * @param {?number} min - Minimum value returned.
     * @param {?number} max - Maximum value returned.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    numberKey(key: string, min?: number, max?: number): this;
    /** Defines a key that takes an object as value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    objectKey(key: string): this;
    /** Defines a key that takes a resource path as value.
     *
     * @param {!string} key - The key.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    pathKey(key: string): this;
    /** Defines a key that takes a string value.
     *
     * @param {!string} key - The key.
     * @param {boolean} [nonEmpty=false] - Reject empty string.
     * @return {OptionParser} this - For chaining.
     * @throws {TypeError} When key is not a string.
     * @throws {RangeError} When key is empty string.
     * @throws {SyntaxError} On duplicate key.
     */
    stringKey(key: string, nonEmpty?: boolean): this;
    /** Parse options.
     *
     * @param {object} options - The input options.
     * @param {?object} defaults - The default values, to be overwritten by
     * the corresponding values in `options`.
     * @returns {object} The
     * @throws {TypeError} When option has wrong type.
     * @throws {RangeError} When option has wrong value.
     * @throws {SyntaxError} Unknown option.
     * @throws {UserInputError} On error, when value was input by user.
     */
    parse(options: T): T;
  }
  export { OptionParser };
}
