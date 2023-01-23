---
title: YAML sections
date: '2023-01-23T13:00:00.000Z'
tags:
- yaml
- devices
- platform
- home assistant
modified_time: '2023-01-23T13:30:00.000Z'
---

_NB: I've added this here as the knowledge has [been removed](https://github.com/home-assistant/home-assistant.io/pull/25527) from the official documentation._

For some integrations every entity needs its own entry in the `configuration.yaml` file. There are two styles for multiple entity entries, and these apply regardless of the domain (`sensor`, `binary_sensor`, `switch`, etc) - that my examples only use `sensor` doesn't mean they only apply there.

## Style 1: Collect every entity under the parent

This is the method I personally recommend:

```yaml
sensor:
  - platform: command_line
    command: ping orbital.ceard.tech
  - platform: command_line
    command: /sbin/reboot
```

## Style 2: List each entity separately

```yaml
sensor ping:
  - platform: command_line
    command: ping orbital.ceard.tech

sensor reboot:
  - platform: command_line
    command: /sbin/reboot
```

## Elsewhere

These rules also apply to things like [MQTT sensors](https://www.home-assistant.io/integrations/sensor.mqtt):

```yaml
mqtt:
  sensor:
    - state_topic: "home/whale/temperature"
      name: "How cold is the whale"
    - state_topic: "home/petunia/temperature"
      name: "How hot is the petunia"
```

If you duplicate that `sensor:` line you'll get errors when you run a configuration check.