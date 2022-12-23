---
title: Presence detection - are we nearly there yet?
date: '2019-03-16T16:32:00.000Z'
toc: true
tags:
- home assistant
- presence detection
modified_time: '2019-03-16T16:32:28.657Z'
---

Yes, yet another update. This is what comes from trying to refine things.  

## Bluetooth, bluetooth, everywhere

My Home Assistant system sits in the far corner of the house from the front door. As a result the Bluetooth tracker is a bit hit and miss for entry. There's also a challenge that I've been finding that the Bluetooth devices seem to flip between home and away.

I'd already been pointed towards [monitor](https://github.com/andrewjfreyer/monitor) by others, so I sat down and read the rather long [thread on the forum](https://community.home-assistant.io/t/monitor-reliable-multi-user-distributed-bt-occupancy-presence-detection/68505). The only downside would be that I'd need to set up MQTT again, which took all of a couple of minutes.

### Trying it out

I installed monitor on one of the other Pi's, and tested it out. After a few false starts, both with the config for monitor and the config for HA, I got it working as I wanted and proceeded to deploy it.

### Behaviour preferences

The key changes for me here were increasing the arrival scans, dropping the minimum time between scans, setting an arrival filter, dropping the RSSI level to -95 (I'll explain that in the beacon section), and enabling the device tracker topic

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

### MQTT preferences

Here I've set the identity to be the location of the scanner, in this case they are first floor front and first floor rear.

### Static addresses

A list of all the devices I want tracked

### Beacon addresses

I bought a Chipolo classic beacon to track the presence of the car. Initially I was rather disappointed - I could trigger a beacon event by pushing the button, but then silence. However, having added it to their app, and then removing it, it beacons as expected.  
  
The only downside is that in the garage the signal level is below the default RSSI threshold of -75. Watching the log I could see it normally floated around -80 to -90, so set it to -95.  

### Aliases

This ensures that the MQTT topics are human friendly.

### Command line flags

I'm using `-x -b -tdr` as the flags, and these mean:  

* `-x` - retain mqtt status messages
* `-b` - report bluetooth beacons
* `-tdr` - only performs a _departure_ scan when a message is published to the MQTT topic, and notifies other instances when it does a scan

## How I'm using monitor

I've got two Pi Zeros set up, one upstairs at the front of the house, and one upstairs at the back of the house. These conduct arrival scans automatically, or when triggered by the front door opening. Their positioning provides complete coverage through the entire house.

Exit scans are run when the front door closes. And yes, scans plural - it waits half a minute, runs a scan. That's just long enough that if we closed and walked away, we'll be out of range. It then runs further scans at one minute, two minutes, and four minutes. This, should, cover it when we leave but stop for a brief chat. I'll probably add another automation that is triggered when we're over 100 meters away, the WiFi tracker shows us away, and yet monitor thinks we're home. That should take care of when we end up chatting with the neighbours for some time.

With the two systems, things have proven totally reliable. I've had no false away, and so far no missed departures either. This means that I've been able to turn off the Bluetooth trackers built into Home Assistant.

## Unexpected benefits

There's been one unexpected benefit - my Home Assistant system starts faster. Disabling the Bluetooth trackers has cut five minutes off the startup time, which accounted for most of the startup time.

## Changes to presence tracking

I know I've said _don't use groups_, but I'm using groups again. All I'm putting in those groups though are the WiFi and Bluetooth trackers. I'm not using the GPS device tracker at all for home/away logic. This makes the groups safe here. Everything that follows is, of course, on [my GitHub](https://github.com/DubhAd/Home-AssistantConfig).

## Home

There is now an automation, and a script, for each person.

### Automation

```yaml
initial_state: 'on'  
alias: 'person1 home'  
trigger:  
  - platform: state  
    entity_id:  
    - group.person_person1  
    to: 'home'  
  - platform: homeassistant  
    event: start  
condition:  
  - condition: state  
    entity_id: input_boolean.person1_home  
    state: 'off'  
  - condition: state  
    entity_id: group.person_person1  
    state: 'home'  
action:  
  - service: script.person1_home  
```

### Script

```yaml
alias: person1 home  
sequence:  
  - service: input_boolean.turn_off  
    entity_id: input_boolean.person1_travelling  
  - service: input_boolean.turn_on  
    entity_id: input_boolean.person1_home  
  - service: mqtt.publish  
    data:  
      topic: location/person1  
      payload: 'home'  
  - service: automation.turn_on  
    entity_id: automation.person1_at_work  
  - service: script.person1_traveltime  
```

That MQTT publish is for the new [person component](https://www.home-assistant.io/integrations/person). Right now the logic of that component is purely that the most recent update wins, which is a step backwards. So I cheat.  
  
The last script updates the Google and Waze travel time sensors. Those are both configured to update only a few times a day, and I update on demand from automations. The result is that on a typical day I'm using less than 10% of the daily quota, rather than hitting the quota limit before the day is over.  

## Away

### Automation  

```yaml
alias: 'person1 away'  
initial_state: 'on'  
trigger:  
  - platform: state  
    entity_id:  
    - group.person_person1  
    to: 'not_home'  
  - platform: homeassistant  
    event: start  
condition:  
  - condition: state  
    entity_id: input_boolean.person1_home  
    state: 'on'  
  # Both BT and WiFi are away  
  - condition: state  
    entity_id: group.person_person1  
    state: 'not_home'  
action:  
  - service: script.person1_away  
```

Now that's much simpler than before. Before I had to track if the front door had been opened recently. With monitor only scanning for departure if a door opens, that's handled externally.  
  
### Script

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

Again, updating the fake device tracker to keep the person component happy.  

## What's next?

I don't _think_ there's a lot more to do now to the logic. I can probably drop the use of the input boolean and start using the person component, but I'll wait to see how that component shapes out first.

I may also deploy another Pi Zero W in or above the garage, to improve coverage there.
