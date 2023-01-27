---
title: WiFi sensor into device tracker
date: '2023-01-27T13:42:00.000+00:00'
tags:
- mobile app
- home assistant core
- home assistant
- wifi
- presence detection
- android
modified_time: '2023-01-27T13:42:00.000+00:00'
---

Something that makes for a great home/away tracker is the Android app's connected WiFi sensor, or at least it would if it was a device tracker.

Well, you can turn it into one, and I [mentioned it before]({% post_url 2022-12-29-presence-detection-here-we-go-again %}), but it's lost in the depths of that post so I thought I'd float it out into it's own article.

You'll need a working MQTT setup for this, as well as remote access for Home Assistant (or the phone can't report that it's not connected to your WiFi).

## Android App

I use the [connected WiFi sensor](https://companion.home-assistant.io/docs/core/sensors#connection-type-sensor). This identifies the name of the WiFi network we're connected to. If you need more granularity there's also the `bssid` sensor. These only exist for the Android app, so iOS users can stop reading here.

## Automation

You can find the [automation here](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/automation/people/person1/person1_wifi_status.yaml). The example below runs any time the sensor updates.

If we're connected to our Wifi (name `Cogs-n-Gears`) then it publishes `home` to the topic, otherwise it publishes `not_home`. I retain the topics so that they're always available, for example if I reload the MQTT integration or restart HA.

{% raw %}
```yaml
automation:
  - id: 'YOU_wifi_status'
    alias: 'YOU WiFi status'
    initial_state: 'on'
    trigger:
      - platform: state
        entity_id: sensor.YOUR_PHONE_wifi_connection
        to: ~
    action:
      - choose:
        - conditions:
            - condition: template
              value_template: "{{ 'Cogs-n-Gears' in states('sensor.YOUR_PHONE_wifi_connection') }}"
          sequence:
            - service: mqtt.publish
              data:
                topic: location/YOU_wifi
                payload: 'home'
                retain: true
        default:
          - service: mqtt.publish
            data:
              topic: location/YOU_wifi
              payload: 'not_home'
              retain: true
```
{% endraw %}

I use `in` in the template for a simple reason, I have both `Cogs-n-Gears 2` for 2.4 GHz band and `Cogs-n-Gears 5` for the 5 GHz bands.

## MQTT Device Tracker

You can find that [here](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/mqtt/device_tracker/person_person1_wifi.yaml) too:

```yaml
mqtt:
  device_tracker:
    - name: "person YOU wifi"
      state_topic: 'location/YOU_wifi'
      source_type: router
      unique_id: "mqtt_person_YOU_wifi"
```

There's nothing fancy here, we set it to `router` as that's the closest match (the [other options](https://www.home-assistant.io/integrations/device_tracker.mqtt#source_type) are `gps`, `bluetooth`, and `bluetooth_le`). This matters for the [`person`](https://www.home-assistant.io/integrations/person/) you link it to. We add a `unique_id` so that you can easily customise it in the UI.

Now you can link the device tracker to your Person, and have a fast reliable home/away detection.