---
title: Presence detection, the final countdown?
date: '2019-10-27T06:30:00.000Z'
toc: true
tags:
- monitor
- home assistant
- presence detection
modified_time: '2019-11-03T08:29:40.514Z'
---

The [last time](https://blog.ceard.tech/2019/03/presence-detection-are-we-nearly-there.html) I said that I didn't think there was more I could do. I was wrong. My use of [monitor](https://github.com/andrewjfreyer/monitor) hasn't changed, and I'll leave the config for that below.  

## Changed behaviour

Now I've changed the automations so that the majority wins for departure, rather than requiring everything to show `not_home`. This makes for faster departures, and avoids problems when something goes wrong with one of the device trackers - one of the monitor nodes sometimes freezes.

These work by the magic of a wonderful template somebody else wrote on the Discord server:

{% raw %}
```yaml
{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person1', 'entity_id'))|list)|groupby('state'))['home']|count }}
```
{% endraw %}

This returns the number of entities in that group that are in the state home.

I'm now using the individual devices in the triggers, so that the automation is run for the change of state on each device, rather than only when the group changes state. This has made things more responsive.

The MQTT device tracker is used purely for the [person](https://www.home-assistant.io/integrations/person) integration. It serves no other purpose.

As always, these can be found [on my GitHub](https://github.com/DubhAd/Home-AssistantConfig).  

## Automations and scripts

### Departure automation

{% raw %}
```yaml
alias: 'person1 away'  
initial_state: 'on'  
trigger:  
  - platform: state  
    entity_id:   
      - device_tracker.person1_phone_wifi  
      - device_tracker.person1_bt_mobile  
      - device_tracker.person1_bt_front_mobile  
    to: 'not_home'  
  - platform: homeassistant  
    event: start  
condition:  
  # As long as at least two trackers mark as away, they're away  
  - condition: numeric_state  
    entity_id: group.person_person1  
    below: 2  
    value_template: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person1', 'entity_id'))|list)|groupby('state'))['home']|count }}"  
  # An exit door recently opened or closed - I can likely drop this to 300 (5 minutes)  
  - condition: template  
    value_template: "{{ (as_timestamp(now()) - as_timestamp(states.binary_sensor.pi3_front_door_sensor.last_updated)) | int < 600 }}"  
action:  
  - service: script.person1_away
```
{% endraw %}

### Departure script

```yaml
alias: person1 away  
sequence:  
  - service: input_boolean.turn_off  
    entity_id: input_boolean.person1_home  
  - service: mqtt.publish  
    data:  
      topic: location/person1  
      payload: 'not_home'  
```
  
### Arrival automation

{% raw %}
```yaml
initial_state: 'on'  
alias: 'person1 home'  
trigger:  
  - platform: state  
    entity_id:   
      - device_tracker.person1_phone_wifi  
      - device_tracker.person1_bt_mobile  
      - device_tracker.person1_bt_front_mobile  
    to: 'home'  
  - platform: homeassistant  
    event: start  
condition:  
  - condition: numeric_state  
    entity_id: group.person_person1  
    above: 0  
    value_template: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person1', 'entity_id'))|list)|groupby('state'))['home']|count }}"  
action:  
  - service: script.person1_home
```
{% endraw %}

### Arrival script

```yaml
alias: person1 home  
sequence:  
  - service: input_boolean.turn_on  
    entity_id: input_boolean.person1_home  
  - service: mqtt.publish  
    data:  
      topic: location/person1  
      payload: 'home'
```

## Monitor

### Behaviour preferences

```
#MAX RETRY ATTEMPTS FOR ARRIVAL  
PREF_ARRIVAL_SCAN_ATTEMPTS=2  
  
#MAX RETRY ATTEMPTS FOR DEPART  
PREF_DEPART_SCAN_ATTEMPTS=2  
  
#SECONDS UNTIL A BEACON IS CONSIDERED EXPIRED  
PREF_BEACON_EXPIRATION=240  
  
#MINIMUM TIME BEWTEEN THE SAME TYPE OF SCAN (ARRIVE SCAN, DEPART SCAN)  
PREF_MINIMUM_TIME_BETWEEN_SCANS=15  
  
#ARRIVE TRIGGER FILTER(S)  
PREF_PASS_FILTER_ADV_FLAGS_ARRIVE=".*"  
PREF_PASS_FILTER_MANUFACTURER_ARRIVE="Google|HTC Corporation|LG Electronics|Chipolo"  
  
PREF_FAIL_FILTER_ADV_FLAGS_ARRIVE="NONE"  
PREF_FAIL_FILTER_MANUFACTURER_ARRIVE="NONE"  
  
PREF_RSSI_IGNORE_BELOW=-95  
PREF_DEVICE_TRACKER_REPORT=true  
```

### Command line flags

I'm using `-x -b -tdr` as the flags, and these mean:  

* `-x` - retain mqtt status messages
* `-b` - report bluetooth beacons
* `-tdr` - only performs a _departure_ scan when a message is published to the MQTT topic, and notifies other instances when it does a scan
