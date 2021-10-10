# Changelog

All notable changes to this project will be documented in this file.

## 1.0.2, 1.0.3

### Bugs

- Restart of switch timer did not work (missing implementation). ([#7](https://github.com/kernie66/homebridge-random-delay-switches/issues/7))

### Enhancements

- Timers are persistent through restarts, i.e. started timers will trigger after the remaining delay time after a restart.
- Configurations changed through Eve are persistent through restarts. Removed the `hidden` configuration option to not mess this up.
- Configuration changes made through Eve can be reset to the default configuration from the configuration file.
- Removed 3600 seconds delay limit (will be enhanced for Eve in the next release). ([Part of #6](https://github.com/kernie66/homebridge-random-delay-switches/issues/6))

## 1.0.1

### Bugs

- Config.schema.json changed to make it easier to navigate in the Homebridge Config-UI-X

## 1.0.0

- First public release. Rewritten from "homebridge-random-delay-switch" as a platform using 'homebridge-lib', and added some features
