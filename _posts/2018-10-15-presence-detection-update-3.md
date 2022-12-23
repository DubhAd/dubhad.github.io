---
title: Presence detection - update 3
date: '2018-10-15T20:31:00.000+01:00'
tags:
modified_time: '2018-10-15T20:31:10.072+01:00'
---

[Last time](/a-while-back-i-covered-how-i-was-doing/) I said that I was probably going to go with the [Bayesian sensor](https://www.home-assistant.io/integrations/binary_sensor.bayesian) for presence detection, but I've changed my mind.  
  
Why, because of an occasional edge case in which people get marked away when they're not really away. The Pi is in a corner of the house, as is the primary WiFi access point. If somebody is standing in exactly the right spot, they can drop off both Bluetooth and WiFi for just long enough to be marked as away. The quick answer to this is to extend the original home/away automations:  

## Home

{% raw %}
```yaml
- initial_state: 'on'  
  alias: 'person2 home'  
  trigger:  
    - platform: state  
      entity_id:   
      - device_tracker.person2_mobile  
      - device_tracker.person2_mobile_bt  
      - device_tracker.person2_mobile_gps  
      to: 'home'  
    - platform: homeassistant  
      event: start  
  condition:  
    - condition: numeric_state  
      entity_id: group.person_person2  
      above: 1  
      value_template: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person2', 'entity_id'))|list)|groupby('state'))['home']|count }}"  
  action:  
    - service: input_boolean.turn_on  
      entity_id: input_boolean.person2_home  
```
{% endraw %}

## Away

{% raw %}
```yaml
alias: 'person2 away'  
initial_state: 'on'  
trigger:  
  - platform: state  
    entity_id:   
    - device_tracker.person2_mobile  
    - device_tracker.person2_mobile_bt  
    - device_tracker.person2_mobile_gps  
    to: 'not_home'  
  - platform: state  
    entity_id:   
    - device_tracker.person2_mobile  
    - device_tracker.person2_mobile_bt  
    - device_tracker.person2_mobile_gps  
    to: 'not_home'  
    for:  
      minutes: 5  
  - platform: homeassistant  
    event: start  
condition:  
  - condition: state  
    entity_id: input_boolean.person2_home  
    state: 'on'  
  - condition: numeric_state  
    entity_id: group.person_person2  
    below: 2  
    value_template: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person2', 'entity_id'))|list)|groupby('state'))['home']|count }}"  
  - condition: or  
    conditions:  
    # A door was opened in the last 10 minutes  
    - condition: template  
      value_template: "{{ (as_timestamp(now()) - as_timestamp(states.sensor.last_opened.last_updated)) | int < 600 }}"  
    # A door is currently open  
    - condition: state  
      entity_id: group.my_exterior_doors  
      state: 'on'  
    # All away for at least 4 minutes  
    - condition: state  
      entity_id: group.person_person2  
      state: 'not_home'  
      for:  
        minutes: 4  
action:  
  - service: input_boolean.turn_off  
    entity_id: input_boolean.person2_home  
  - service: input_boolean.turn_on  
    entity_id: input_boolean.person2_is_awake  
```
{% endraw %}

## Now

This is quite a bit more complicated than the simple Bayesian sensor, but it's given me zero false away detections. It's also cheaper than fixing the coverage problem for an area about 30 cm across.
