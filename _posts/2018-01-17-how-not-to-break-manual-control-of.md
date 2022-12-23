---
title: How not to break manual control of devices with automations
date: '2018-01-17T20:30:00.000Z'
tags:
- input boolean
- automation
- home assistant
modified_time: '2018-02-07T07:17:41.482Z'
---

A common problem that comes up all the time is when people want a light or switch (or anything else Home Assistant can control) to turn off automatically, but only if it was turned on with an automation.

The answer to this is to use an [input boolean](https://home-assistant.io/integrations/input_boolean/) that you turn on when you run the "on" automation, and
you use in the "off" automation. This is your flag to indicate whether the switch was turned on by a person, or an automation.

```yaml
input_boolean:
  your_switch_auto_on:
    name: "Automatically turned on your switch"
    initial: off
```

Next you have your "on" automation. Here we're using a motion sensor turning on to trigger the turning on of the switch:

```yaml
automation:
  - alias: "Turn on the switch"
    initial_state: "on"
    trigger:
      - platform: state
        entity_id: binary_sensor.hall_motion
        to: 'on'
    condition:
      - condition: state
        entity_id: switch.your_switch
        state: 'off'
    action:
      - service: switch.turn_on
        entity_id: switch.your_switch
      - service: input_boolean.turn_on
        entity_id: input_boolean.your_switch_auto_on
```

You'll notice that we turn on the switch, and we also turn on the input boolean to say that we turned it on automatically.

Now we have our "off" automation, that says after 5 minutes of no motion, we turn off the switch if we turned it on automatically:

```yaml
  - alias: "Turn off the switch"
    initial_state: "on"
    trigger:
      - platform: state
        entity_id: binary_sensor.hall_motion
        to: 'off'
        for:
          minutes: 5
    condition:
      - condition: state
        entity_id: input_boolean.your_switch_auto_on
        state: 'on'
      - condition: state
        entity_id: switch.your_switch
        state: 'on'
    action:
      - service: switch.turn_off
        entity_id: switch.your_switch
```

You'll note that I'm only trying to turn it off if it was on, just in case somebody turned it off manually.

But wait, we haven't turned off the input boolean, and what if somebody turns the light off manually? This is where a third (and final) automation comes in:

```yaml
  - alias: "Switch turned off"
    initial_state: "on"
    trigger:
      - platform: state
        entity_id: switch.your_switch
        to: 'off'
    condition:
      - condition: state
        entity_id: input_boolean.your_switch_auto_on
        state: 'on'
    action:
      - service: input_boolean.turn_off
        entity_id: input_boolean.your_switch_auto_on
```

Now, when the switch is turned off, for any reason, it'll turn off the input boolean.
