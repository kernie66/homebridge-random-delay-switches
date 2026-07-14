/** biome-ignore-all lint/correctness/noUnusedVariables: Global types for homebridge-lib */

// Global type declarations for homebridge-lib modules, to allow importing without TypeScript errors.
// These declarations are necessary because homebridge-lib does not provide its own TypeScript type definitions.
// Those commented out below are defined separately with more specific types in the src/typings directory, and are not
// included here to avoid conflicts with the more detailed type definitions provided there.

declare module 'homebridge-lib/Accessory';
declare module 'homebridge-lib/Characteristic';
// declare module 'homebridge-lib/HttpClient';
// declare module 'homebridge-lib/AccessoryDelegate';
// declare module 'homebridge-lib/ServiceDelegate';
// declare module 'homebridge-lib/ServiceDelegate/History';
declare module 'homebridge-lib/CharacteristicDelegate';
// declare module 'homebridge-lib/Platform';
declare module 'homebridge-lib/OptionParser';
// declare module 'homebridge-lib/CustomHomeKitTypes';
declare module 'homebridge-lib/MyHomeKitTypes';

// declare class AccessoryDelegate extends EventEmitter {}
