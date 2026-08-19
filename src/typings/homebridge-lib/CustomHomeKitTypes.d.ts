declare module 'homebridge-lib/CustomHomeKitTypes' {
  import type { Access, API, Characteristic, CharacteristicProps, Formats, Perms, Service, Units } from 'homebridge';

  class CustomHomeKitTypes<C = object, S = object> {
    /** Valid HomeKit admin-only access.
     * @type {Object<string, Characteristic.Access>}
     * @readonly
     */
    readonly Access: typeof Access;

    /** Valid HomeKit characteristic formats.
     * @type {Object<string, Format>}
     * @readonly
     */
    readonly Formats: typeof Formats;

    /** Valid HomeKit characteristic permissions.
     * @type {Object<string, Perm>}
     * @readonly
     */
    readonly Perms: typeof Perms;

    /** Standard HomeKit characteristic units.
     * @type {Object<string, Unit>}
     * @readonly
     */
    readonly Units: typeof Units;

    /** {@link Characteristic} subclasses for custom HomeKit characteristics.
     * @abstract
     * @type {Object.<string, Class>}
     * @readonly
     */
    readonly Characteristics: C;

    /** {@link Service} subclasses for custom HomeKit services.
     * @abstract
     * @type {Object.<string, Class>}
     * @readonly
     */
    readonly Services: S;

    /** @link Characteristic} subclasses for standard HomeKit characteristics.
     * @type {Object<string, Class>}
     * @readonly
     */
    readonly hapCharacteristics: Characteristic;

    /** {@link Service} subclasses for custom HomeKit services.
     * @type {Object<string, Class>}
     * @readonly
     */
    readonly hapServices: Service;

    /** Creates a new instance of `CustomHomeKitTypes`.
     * @param {!API} homebridge - Homebridge API.
     */
    constructor(homebridge: API);
    /** Creates a new subclass of {@link Characteristic}
     * for a custom HomeKit characteristic.
     *
     * The newly created subclass is stored under `key` in
     * {@link CustomHomeKitTypes#Characteristics}.
     *
     * @final
     * @param {!string} key - Key for the Characteristic subclass.
     * @param {!string} uuid - Custom characteristic UUID.
     * @param {Props} props - Custom characteristic properties.
     * @param {string} [displayName=key] - Name displayed in HomeKit.
     * @returns {Class} The new {@link Characteristic} subclass.
     * @throws {TypeError} When a parameter has an invalid type.
     * @throws {RangeError} When a parameter has an invalid value.
     * @throws {SyntaxError} On duplicate key.
     */
    createCharacteristicClass(
      key: string,
      uuid: string,
      props: CharacteristicProps,
      displayName?: string,
    ): Record<
      string,
      {
        UUID: string;
      }
    >;
    /** Creates a new subclass of {@link Service}
     * for a custom HomeKit service.
     *
     * The newly created subclass is stored under
     * {@link CustomHomeKitTypes#Services}.
     *
     * @final
     * @param {!string} key - Key for the Service.
     * @param {!string} uuid - UUID for the Service.
     * @param {Class[]} Characteristics - {@link Characteristic}
     * subclasses for pre-defined characteristics.
     * @param {Class[]} [OptionalCharacteristics=[]] -
     * {@link Characteristic} subclasses for optional characteristics.
     * @returns {Class} The new {@link Service} subclass.
     * @throws {TypeError} When a parameter has an invalid type.
     * @throws {RangeError} When a parameter has an invalid value.
     * @throws {SyntaxError} On duplicate key.
     */
    createServiceClass(
      key: string,
      uuid: string,
      Characteristics: Array<{
        key: string;
        characteristic: string | number;
      }>,
      OptionalCharacteristics?: never[],
    ): Record<
      string,
      {
        UUID: string;
      }
    >;
    /** Return the full HAP UUID.
     * @final
     * @param {!string} id - The short HAP UUID.
     * @param {?string} [suffix='-0000-1000-8000-0026BB765291'] - The suffix for
     * the long UUID.<br>
     * The default value is used by the standard HomeKit services and
     * characteristics, as defined by Apple.
     * @returns {!string} The full HAP UUID.
     * @throws {TypeError} When a parameter has an invalid type.
     * @throws {RangeError} When a parameter has an invalid value.
     */
    static uuid(id: string, suffix?: string): string;
  }
  export { CustomHomeKitTypes };
}
