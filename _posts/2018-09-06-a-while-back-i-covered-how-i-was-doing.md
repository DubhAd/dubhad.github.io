---
title: Presence detection updated
date: '2018-09-06T21:00:00.000+01:00'
tags:
- presence detection
- home assistant
modified_time: '2018-09-07T10:00:50.120+01:00'
---

A while back I covered how I [was doing presence detection](/home-assistant-and-basic-presence/), and thought that since I've changed a few things I should update.  

## Little Big Changes

I've ditched groups for tracking. There's a simple reason for this - the group is a blunt instrument. I still use them indirectly, and I'll explain how below. When I say blunt instrument, I mean that if any device tracker reports me as home, I'm home. Which is fine, until one misbehaves. Then I flip flop between home and away as each group member updates.

## Bayesian

This is nice because I can weight individual things that indicate whether we may be home.

```yaml
- platform: 'bayesian'  
  prior: 0.6  
  name: 'person2 Home'  
  probability_threshold: 0.95  
  observations:  
    - entity_id: 'device_tracker.person2_mobile'  
      prob_given_true: 0.9  
      platform: 'state'  
      to_state: 'home'  
    - entity_id: 'device_tracker.person2_mobile_bt'  
      prob_given_true: 0.9  
      platform: 'state'  
      to_state: 'home'  
    - entity_id: 'device_tracker.person2_mobile_gps'  
      prob_given_true: 0.8  
      platform: 'state'  
      to_state: 'home'
```

Basically, it requires that at least two out of the three trackers (WiFi, Bluetooth, GPS) report me as home, before I'm home. Initial testing is looking positive.  
  
Why am I weighting the GPS down a bit? Well, it doesn't change things here, but I've found it less reliable in terms of home/away. This is just my way of noting that.  

## Automation

Until I'm comfortable that's working as intended, I'm using the following automation:

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

This triggers when any of the individual trackers comes home, and then checks to see if at least two members of the group are home. Then if they are turns on an input boolean. Obviously there's a matching away automation that turns it off.  

## Going forwards

I'll be comparing the results of these over the next few weeks. In theory I should find a perfect match, at which point I can switch to using the bayesian sensor.
