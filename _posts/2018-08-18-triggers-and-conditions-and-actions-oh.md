---
title: Triggers and conditions and actions! Oh My!
date: '2018-08-18T15:19:00.000+01:00'
toc: true
tags:
- automation
- home assistant
modified_time: '2018-09-05T21:24:38.258+01:00'
---

[Automations in Home Assistant](https://www.home-assistant.io/docs/automation/) can seem a little daunting at first. You look at the documents, and it can seem overwhelming.

It's not that bad, honest. It can be summarised like this:

* Trigger - the things that cause an automation to be started
* Condition - an optional list of things that must be true for the actions to run
* Action - what to do

## [Trigger](https://home-assistant.io/docs/automation/trigger/)

You need at least one trigger, and you can have many if you need them. Once _any_ of them becomes true, then the automation will run. These always use an or logic - this or that or that or...

For example:

```yaml
trigger:
- platform: state
  entity_id: sensor.dice_d20_green
  state: 1
- platform: state
  entity_id: sensor.dice_d20_blue
  state: 1
```

Here the automation will run if either our green or blue D20 dice rolls a one.

## [Condition](https://www.home-assistant.io/docs/automation/condition/)

Here's where we can optionally perform a number of checks before we run those actions. Maybe you only care if that green dice rolls a one during the day, and the blue one at night, or it's Sunday. Conditions are all and by default - they all have to be true, but as we'll show here, you can use both and and or logic as you need.

{% raw %}
```yaml
condition:
- condition: or
  conditions:
  # Sunday
  - condition: time
    weekday:
      - sun
  - condition: and
    conditions:
    # Green D20 rolled one at night
    - condition: state
      entity_id: sensor.dice_d20_green
      state: 1
    - condition: numeric_state
      entity_id: sun.sun
      attribute: elevation
      below: 0
  - condition: and
    conditions:
    # Blue D20 rolled one during the day
    - condition: state
      entity_id: sensor.dice_d20_blue
      state: 1
    - condition: numeric_state
      entity_id: sun.sun
      attribute: elevation
      above: -0.1
```
{% endraw %}

## [Action](https://www.home-assistant.io/docs/automation/action/)

Finally, we're at the "go do" part. These are [scripts](https://www.home-assistant.io/docs/scripts/), just embedded in your automation. There are four different things you can do here, and the actions are processed in the order you write them.

### [Delay](https://www.home-assistant.io/docs/scripts/#wait-for-time-to-pass-delay)

You can pause before the actions run, or between actions, using a delay. This can be fixed for every run of the automation, or you can use templates to give you some flexibility.

### [Wait](https://www.home-assistant.io/docs/scripts/#wait)

Sometimes you want a pause, while you wait for something to happen. This is useful if you want an automation to run when a particular series of events happen, like maybe the front door to open, then the hall door to open within the next few minutes.

### [Check a condition](https://www.home-assistant.io/docs/scripts/#test-a-condition)

Sometimes you always want to do some of the actions, but only do the rest some of the time. If the condition is true, then the automation will continue. If it isn't, then the automation stops here.

### Do something

Mostly you'll be [calling a service](https://www.home-assistant.io/docs/scripts/#call-a-service), to do something like turn on a light, or a switch, or send a notification, and so on. You can also [fire events](https://www.home-assistant.io/docs/scripts/#fire-an-event) and do other things.

We'll continue our dice rolling example:

```yaml
action:
  # Turn the lights red
  - service: light.turn_on
    data:
      entity_id: light.game_room
      color_name: "red"
  # Take a deep breath
  - delay: '00:00:05'
  # Did the character not die?
  - condition: state
    entity_id: sensor.character_health
    state: 'alive'
  # We're alive! Turn it white again
  - service: light.turn_on
    data:
      entity_id: light.game_room
      color_name: "white"
```
