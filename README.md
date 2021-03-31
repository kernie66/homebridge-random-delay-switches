
# Homebridge-Random-Delay-Switch

With this plugin, you can create any number of fake switches that will start a timer, which can be a random duration too (between two configured values), when turned ON. When the delay time is reached the switch will automatically turn OFF and trigger a dedicated motion sensor for 3 seconds. This can be very useful for advanced automation with HomeKit scenes - when delayed actions are required.

The random duration is very useful if you want an automation which simulates your precense at home by switch lights at a random time. This looks more realisitic than a statically configured on/off-time. By using the minimum delay, you can make sure that the switch is turned on for at least the minimum time.

## How to install

 * ```sudo npm install -g homebridge-random-delay-switch```
* Create an accessory in your config.json file, or use the Homebridge UI
* Restart homebridge

## Example config.json:

 ```
    "accessories": [
        {
          "accessory": "RandomDelaySwitch",
          "name": "MyDelaySwitchName",
          "disableSensor": false,
          "startOnReboot": false,
          "delay": 60,
          "random": false
        }
    ]

```
This gives you a switch which will trigger the motion sensor after 60 seconds.

```
    "accessories": [
        {
          "accessory": "RandomDelaySwitch",
          "name": "MyRandomDelaySwitchName",
          "disableSensor": false,
          "startOnReboot": true
          "delay": 1800,
          "minDelay": 150,
          "random": true
        }   
    ]

```
This gives you a switch which will trigger the motion sensor after a random delay between 150 to 1800 seconds.
The switch will be turned ON and start the timer when HomeBridge restarts  

## Why Adding Motion Sensor?

A Motion sensor is created for each accessory in order to be able to cancel the timer and the attached automations.
How it works? you can set the automation to be triggered from the motion sensor instead of the switch OFF command and therefore
you can turn OFF the switch and prevent the motion sensor from being triggered or any attached automations.
If you have no use of the sensor you can remove it by adding `"disableSensor": true` to your config.

## How it works

Basically, all you need to do is:
1. Set the desired delay time in the config file (in seconds).
2. If you want to have a random delay, you can also set the minimum delay.
3. The plugin will create one switch and one motion sensor for this accessory.
4. Use this switch in any scene or automation.
5. Set an automation to trigger when this switch is turned ON or the motion sensor is triggered - The "EVE" app is very recommended to set
these kind of automations.

## Why do we need this plugin?

The main purpose is to use it with the random feature. This way you can simulate your presence at home by switching lights on and off at
a random time around a configured starting time, e.g. set an automation to start at 7:00 PM, a delay of 1800 seconds and set random to true.
Now the motion switch will be triggered between 7:00 PM and 7:30 PM at a random time.

Other examples are, when using smart wall switch (to turn ON) and RGB light bulb (to switch color) together on the same scene can cause
no action on the bulb since the bulb might not even be ON when the command has been sent from homebridge.
For that, we need to set an automation to change the bulb color a few seconds after the wall switch ON command.
Another example is using this plugin to turn ON/OFF lights based on a motion/door sensor. This can be achieved by setting an automation
to turn ON a light when the delay swich is turned ON and turn OFF the light when the dedicated delay motion sensor is triggered. Use the minimum delay to make sure that the light is turned on long enough, e.g. to have time to unlock the door.
Also it can be use with any device that require a certain delay time from other devices (TV + RPi-Kodi  /  PC + SSH / etc...)

## Good to know

* **When manually turning OFF the switch, the timer will stop and the motion sensor will NOT be triggered.**

* **When the delay switch is getting ON command while it's already ON, the timer will restart and the motion sensor trigger will be delayed.**

## Thanks
This plugin is forked from [Homebridge-Random-Delay-Switch](http://github.com/kernie66/homebridge-random-delay-switch)
This switch is based on [Homebridge-Delay-Switch](https://github.com/nitaybz/homebridge-delay-switch) and [Homebridge-Automation-Switches](https://github.com/grover/homebridge-automation-switches).
Many Thanks to @nitaybz and @grover for their good work, without that, this plugin would have never been realized so easily.
