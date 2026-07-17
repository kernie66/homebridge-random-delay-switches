// Type definitions for Eve Homekit services and characteristics

import type { Characteristic, Service } from 'homebridge';

/** @member EveHomeKitTypes#Characteristics
 * @property {Class} AirParticulateDensity - Deprecated. use `VOCLevel`
 * instead.
 * @property {Class} AirPressure - Air pressure (in hPa).
 * <br>Used by: Eve Weather.
 * @property {Class} ClosedDuration - Duration (in seconds) that door has
 * been closed.
 * <br>Used by: Eve Door.
 * @property {Class} Clouds - Cloud coverage (in %).
 * <br>Used by: weather station.
 * @property {Class} ColorTemperature - Colour temperature in mired.
 * <br>Used by: Hue bridge, before `hap.ColorTemperature` was defined.
 * @property {Class} ColorTemperatureKelvin - Color temperature in K.
 * <br> Used by: Nanoleaf.
 * @property {Class} Condition - Weather condition (as text).
 * <br>Used by: weather station.
 * @property {Class} ConditionCategory - Weather condition
 * (as numberic code).
 * <br>Used by: weather station.
 * @property {Class} ConfigCommand - Used by Eve app to set configuration.
 * <br> Used by: `History` service.
 * @property {Class} ConfigData - Used by Eve app to read configuration.
 * <br> Used by: `History` service.
 * @property {Class} Consumption - Current electric power (in W).
 * <br>Used by: Eve Energy.
 * @property {Class} CurrentConsumption -  Deprecated. use `Consumption`
 * instead.
 * @property {Class} CurrentTemperature - Current temperature (in °C).
 * This is the same characterisic as `hap.CurrentTemperature`, but with
 * a minimum value of -40°C instead of 0°C (or -270°C).
 * @property {Class} Day - Weekday for forecast.
 * <br>Used by: weather station.
 * @property {Class} DewPoint - Dew point (in °C).
 * <br>Used by: weather station.
 * @property {Class} Duration - Duration (in s) that Motion sensor reports
 * motion.
 * <br>Used by: Eve Motion.
 * <br>Shown by Eve app in accessory _Settings_ screen.
 * @property {Class} ElectricCurrent - Electric current (in A).
 * <br>Used by: Eve Energy.
 * @property {Class} Elevation - Elevation (in m) to calibrate air
 * pressure.
 * <br>Used by: Eve Weather.
 * <br>Shown by Eve app in accessory _Settings_ screen.
 * @property {Class} HistoryEntries - Used by accessory to return history
 * entries.
 * <br> Used by: `History` service.
 * @property {Class} HistoryRequest - Used by Eve app to request history
 * entries.
 * <br> Used by: `History` service.
 * @property {Class} HistoryStatus - Used by accessory signal new history
 * entries.
 * <br> Used by: `History` service.
 * @property {Class} LastActivation - Time (in seconds since epoch) of
 * last event.
 * <br>Used by: Eve Door, Eve Motion.
 * @property {Class} MaximumWindSpeed - Maximum wind speed (in m/s).
 * <br>Used by: weather station.
 * @property {Class} MinimumTemperature - Minimum temperature (in °C).
 * <br>Used by: weather station.
 * @property {Class} ObservationTime - Time of observation.
 * <br>Used by: weather station.
 * @property {Class} OpenDuration - Duration (in seconds) that door has
 * been open.
 * <br>Used by: Eve Door.
 * @property {Class} Ozone - Ozone level (in DU).
 * <br>Used by: weather station.
 * @property {Class} ProgramCommand - Used for programming schedules -
 * details unknown.
 * <br>Used by: Eve Thermo.
 * @property {Class} ProgramData - Used for programming schedules -
 * details unknown.
 * <br>Used by: Eve Thermo.
 * @property {Class} Rain - Rain (as boolean).
 * <br>Used by: weather station.
 * @property {Class} Rain1h - Rain (in mm) during past hour.
 * <br>Used by: weather station.
 * @property {Class} Rain24h - Rain (in mm) during past 24 hours.
 * <br>Used by: weather station.
 * @property {Class} RainProbability - Probability of rain (in %).
 * <br>Used by: weather station.
 * @property {Class} ResetTotal - Time (as seconds since epoch) of
 * last reset.
 * <br> Used by: `History` service.
 * @property {Class} Sensitivity - Motion sensor sensitivity.
 * <br>Used by: Eve Motion.
 * <br>Shown by Eve app in accessory _Settings_ screen.
 * @property {Class} SetTime - Used to sync time with accessory.
 * <br> Used by: `History` service.
 * @property {Class} Snow - Snow (as boolean).
 * <br>Used by: weather station.
 * @property {Class} TimesOpened - Number of times the door was opened.
 * <br>Used by: Eve Door.
 * @property {Class} TotalConsumption - Life-time electric consumption
 * (in KWh).
 * <br>Used by: Eve Energy.
 * @property {Class} UvIndex - UV index.
 * <br>Used by: weather station.
 * @property {Class} ValvePosition - Current radiator valve position
 * (in %).
 * <br>Used by: Eve Thermo.
 * @property {Class} Visibility - Visibility (in km).
 * <br>Used by: weather station.
 * @property {Class} VOCLevel - Volatile Organic Compound level (in ppb).
 * <br>Used by: Eve Room (1st gen).
 * @property {Class} Voltage - Electric voltage (in V).
 * <br>Used by: Eve Energy.
 * @property {Class} WindDirection - Wind direction (as text).
 * <br>Used by: weather station.
 * @property {Class} WindSpeed - Wind speed (in m/s).
 * <br>Used by: weather station.
 */

export type EveCharacteristics = {
  AirParticulateDensity: Characteristic;
  AirPressure: Characteristic;
  ClosedDuration: Characteristic;
  Clouds: Characteristic;
  ColorTemperature: Characteristic;
  ColorTemperatureKelvin: Characteristic;
  Condition: Characteristic;
  ConditionCategory: Characteristic;
  ConfigCommand: Characteristic;
  ConfigData: Characteristic;
  Consumption: Characteristic;
  CurrentConsumption: Characteristic;
  CurrentTemperature: Characteristic;
  Day: Characteristic;
  DewPoint: Characteristic;
  Duration: Characteristic;
  ElectricCurrent: Characteristic;
  Elevation: Characteristic;
  HistoryEntries: Characteristic;
  HistoryRequest: Characteristic;
  HistoryStatus: Characteristic;
  LastActivation: Characteristic;
  MaximumWindSpeed: Characteristic;
  MinimumTemperature: Characteristic;
  ObservationTime: Characteristic;
  OpenDuration: Characteristic;
  Ozone: Characteristic;
  ProgramCommand: Characteristic;
  ProgramData: Characteristic;
  Rain: Characteristic;
  Rain1h: Characteristic;
  Rain24h: Characteristic;
  RainProbability: Characteristic;
  ResetTotal: Characteristic;
  Sensitivity: Characteristic;
  SetTime: Characteristic;
  Snow: Characteristic;
  TimesOpened: Characteristic;
  TotalConsumption: Characteristic;
  UvIndex: Characteristic;
  ValvePosition: Characteristic;
  Visibility: Characteristic;
  VOCLevel: Characteristic;
  Voltage: Characteristic;
  WindDirection: Characteristic;
  WindSpeed: Characteristic;
};
// =========================================================================

// The following custom services are defined by Eve.
// These are listed in order of UUID.

/** @member EveHomeKitTypes#Services
 * @property {Service} AirPressureSensor - Used by: Eve Degree.
 * @property {Service} ContactSensor - Used by: Eve Door.
 * @property {Service} History - Used for displaying history.
 * @property {Service} MotionSensor - Used by: Eve Motion.
 * @property {Service} Outlet - Used by: Eve Energy.
 * @property {Service} TemperatureSensor - Used by: Eve Degree, Eve Room.
 * @property {Service} Thermostat - Used by: Eve Thermo.
 * @property {Service} Weather - Used by: Eve Weather.
 */

export type EveServices = {
  AirPressureSensor: Service;
  ContactSensor: Service;
  History: Service;
  MotionSensor: Service;
  Outlet: Service;
  TemperatureSensor: Service;
  Thermostat: Service;
  Weather: Service;
};
