[![npm](https://badgen.net/npm/v/homebridge-random-delay-switches)](https://www.npmjs.com/package/homebridge-random-delay-switches)
[![npm](https://badgen.net/npm/dw/homebridge-random-delay-switches)](https://www.npmjs.com/package/homebridge-random-delay-switches)
[![npm](https://badgen.net/npm/dt/homebridge-random-delay-switches)](https://www.npmjs.com/package/homebridge-random-delay-switches)

# Homebridge-Random-Delay-Switches

With this plugin, you can create any number of fake switches that will start a timer, which can be a random duration too (between two configured values), when turned ON. When the delay time is reached the switch will automatically turn OFF and trigger a dedicated motion sensor for 3 seconds. This can be very useful for advanced automation with HomeKit scenes - when delayed actions are required.

The random duration is very useful if you want an automation which simulates your presence at home by switching the lights at a random time. This looks more realisitic than a statically configured on/off-time. 

By using the minimum delay, you can make sure that there is a delay for at least the minimum time. This is useful for temporary switching on a light, e.g. when a camera or sensor detects motion.

## How to install

 * ```sudo npm install -g homebridge-random-delay-switches```
* Create a platform and a delay switch in your config.json file, or use the Homebridge UI
* Restart homebridge

## Example config.json:

 ```
    "platforms": [
      {
        "platform": "RandomDelaySwitches"
        "name": "Randomly",
        "delaySwitches": [
          {
            "name": "RDS-Test",
            "delay": 60,
            "minDelay": 30,
            "random": true,
            "disableSensor": false,
            "startOnReboot": false,
            "repeats": 0,
            "hidden": false
          }
        ]
       }
     ]
```
This gives you a switch which will trigger the motion sensor after a random delay of 30 to 60 seconds.

## Why Adding Motion Sensor?

A motion sensor is created for each accessory in order to be able to cancel the timer and the attached automations.
How it works? you can set the automation to be triggered from the motion sensor instead of the switch OFF command and therefore
you can turn OFF the switch and prevent the motion sensor from being triggered or any attached automations.
If you have no use of the sensor you can remove it by adding `"disableSensor": true` to your config.

## How it works

Basically, all you need to do is:
1. Set the desired delay time in the config file (in seconds).
2. If you want to have a random delay, you can also set the minimum delay.
3. The plugin will create one switch and one motion sensor for this accessory.
4. Use this switch in any scene or automation.
5. Set an automation to trigger when this switch is turned ON or the motion sensor is triggered - The "EVE" app is very recommended to set these kind of automations.

The characteristics of the switch are visible in the "EVE" app, unless 'hidden' is set. These characteristics can be updated and used in automation conditions. The updates will be valid until the `Restore default` control is activated. The "Controller for Homekit" app is also a good way of controlling your automations.

## Configuration options

The possible configuration parameters are shown in the table below. I find them useful, but maybe I am a control freak :-). The parameters can be changed dynamically in "EVE" and Controller for HomeKit, but will revert to the set configuration when the plugin is restarted.

Parameter | Default | Description
----------|---------|----------------
`delay`   | 60      | (Maximum) delay in seconds.
`minDelay` | 1      | Minimum delay in seconds. Only valid when `random` is `true`. Will be set to `delay` if greater than `delay`.
`random`  | `false` | Enables random delays between `minDelay` and `delay` seconds (boolean).
`disableSensor`| `false` | Disables the motion sensor, i.e. only the switch will be available in HomeKit (boolean).
`startOnReboot` | `false` | Enables the delay switch when the plugin is restarted. Can be used e.g. to turn things on after power outage. Combine with a time of day condition, so your lights don't turn on while you sleep (boolean).
`repeats`   | 0      | The number of additional activations of the switch. Can be used to control different lights with several consecutive delays, see below (0 - 10, where 0 gives one activation of the switch, 1 gives two activations and so on).
`hidden`   | `false` | Hides the configuration parameters and control values from showing up in "EVE" and Controller for HomeKit (boolean). (Not tested in 1.0.2, may break the function if set to `true`)

## Control values

The plugin provides some control values that can be viewed and used in Eve and Controller for HomeKit. The control values can be used in conditions for automations.

Value | Description
------|-------------
Last Motion | The time that the motion sensor was last triggered by the delay switch. Includes a history graph when viewed in Eve.
Current timeout value | The actual delay value used by the switch. Only valid when the switch is On. Shows the calculated random delay.
Delay time | Corresponds to the `delay` parameter.
Delay time (minimum) | Corresponds to the `minDelay` parameter.
Random enabled | Corresponds to the `random` parameter.
Repetition (current) | The current repetition count, only valid when the switch is active. The initial activation of the switch is 0. Can be used in automations to control different lights at different repetition cycles.
Repetitions (total) | Corresponds to the `repeats` parameter. The switch will be turned Off during the motion activation, then turned On again for the number of repetition times.
Restore default | Updates the configuration parameters to the default values from the configuration file.
Time left of timer | The time left before the delay time is up. Decremented by the heartbeat value. Used to continue the delay after a restart, if the delay was active.

## Why do we need this plugin?

The main purpose is to use it with the random feature. This way you can simulate your presence at home by switching lights on and off at
a random time around a configured starting time, e.g. set an automation to start at 7:00 PM, a delay of 1800 seconds and set random to true.
Now the motion switch will be triggered between 7:00 PM and 7:30 PM at a random time.

Other examples are, when using smart wall switch (to turn ON) and RGB light bulb (to switch color) together on the same scene can cause
no action on the bulb since the bulb might not even be ON when the command has been sent from homebridge.
For that, we need to set an automation to change the bulb color a few seconds after the wall switch ON command.

Another example is using this plugin to turn ON/OFF lights based on a motion/door sensor. This can be achieved by setting an automation
to turn ON a light when the delay swich is turned ON and turn OFF the light when the dedicated delay motion sensor is triggered. Use the minimum delay to make sure that the light is turned on long enough, e.g. to have time to unlock the door.

Also it can be use with any device that require a certain delay time from other devices (TV + RPi-Kodi / PC + SSH / etc...)

## Good to know

* **When manually turning OFF the switch, the timer will stop and the motion sensor will NOT be triggered.**

* **When the delay switch is getting ON command while it's already ON, the timer will restart and the motion sensor trigger will be delayed.**

* **If Homebridge or the plugin is restarted while a switch is active, the switch will continue the delay after the restart. This will override the `startOnReboot` configuration.

## Thanks
This plugin is based on [homebridge-random-delay-switch](https://github.com/lisanet/homebridge-random-delay-switch), which in turn is based on [homebridge-delay-switch](https://github.com/nitaybz/homebridge-delay-switch) and [homebridge-automation-switches](https://github.com/grover/homebridge-automation-switches).

My purpose with this plugin was to turn it into a platform plugin by using [Homebridge-Lib](https://github.com/ebaauw/homebridge-lib) by Eric Baauw, and to learn how to write a plugin with a configuration schema.