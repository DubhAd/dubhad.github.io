---
title: Presence detection - here we go again?
date: '2022-12-29T20:20:00.000+00:00'
toc: true
tags:
- monitor
- bluetooth
- mobile app
- proximity
- home assistant core
- nmap
- home assistant
- wifi
- presence detection
modified_time: '2022-12-29T20:20:00.000+00:00'
---

The music won't be as good, but here we go again. I've made a number of updates to this logic since I last wrote about it.

Oh, you may want to grab a cuppa before you dive in, this is a long one as I wanted to cover _everything_ relevant in one article (again).

## Goal

The goal here is to have _quick and reliable_ home/away detection. This is for a few key things:

1.  Let us know we left a door or window open when we left the house, before we've got too far
2.  Turning on lights as we get home
3.  Manage a number of automations that are based around whether we're home, or away

We can't have false aways, turning things off unexpectedly is a good way of annoying people. It can't leave people marked as being home when they're clearly not, as then people don't get told about open doors or windows soon enough.

### The problem

Grouping device trackers was the traditional approach, but it means that if _any_ tracker thinks the device is home, then you're home. The result isn't very useful if you've included GPS trackers in that group. The early stages of the [person integration](https://www.home-assistant.io/integrations/person/) had a "most recent update wins" approach which didn't help as you'd easily flip between home and away. The more recent updates to person have made it better, but it still takes a "most recent update wins" approach amongst the non-GPS trackers. That's fine if you've only got one local presence detection integration, and it's 100% reliable.

Importantly, I want to ensure that a phone running out of battery doesn't cause a false away. That means that having local device trackers report away shouldn't necessarily cause somebody to be marked away.

Finally, I need to allow for edge cases with things breaking. It's been a long time since either of the nodes responsible for Bluetooth tracking has silently failed, and the WiFi tracking hasn't let me down, but ... history has taught me that anything can fail

### GPS

GPS trackers update intermittently, more so if you're on iOS where the application has no control over update intervals. GPS also has issues when you're indoors, the deeper you go, the worse the accuracy gets. The default home zone of 100 meters occasionally resulted in the GPS tracker giving false away reports, worst case a few times a day. Departure is also slow, very slow, and we could be marked as home when we're just passing, or visiting a neighbour. This rules out GPS being a useful indicator of whether or not we're actually home.

### WiFi

WiFi is the obvious alternative, but it has one problem, most modern mobile phones put their WiFi to sleep when they're in deep sleep. This saves battery, and means that you'll often see that your WiFi tracker flips between home and away a lot. This makes it horribly unreliable for our purposes.

### Bluetooth

Phones don't put Bluetooth to sleep, and while once up on a time having Bluetooth enabled was a significant battery drain, this is no longer the case. Sure, there's _some_ drain, but compared to everything else you're burning battery life on, particularly the screen, it's irrelevant - and likely far less than many of the apps you've installed are responsible for. Besides, in this house we all use Bluetooth for fitness trackers, smart watches, or headphones so it's on anyway.

The downside (and upside) is that Bluetooth is shorter range than WiFi, so one single detection node isn't enough.

### Summary

We're juggling a few things here:

*   Arrivals and departures should be quickly _and reliably_ detected without false positives
*   People shouldn't be marked as away simply because their phone is out of battery
*   If people are clearly not home, they shouldn't be marked as home
*   Bluetooth is reliable, but short range, WiFi is longer range, but unreliable

## Ingredients

We're combining:

*   Three door sensors
*   Two external programs
*   Six integrations
*   Three scripts
*   Three automations

* * *

## Door sensors

I've installed sensors on all the external doors (and windows). These serve a range of purposes, controlling the garden lights, reminding us to close the doors/windows if it's cold outside, warning us the garage door was left open, and more.

It also means we can tell if somebody _could_ have left the house. For simplicity I'm only interested in the front door and the garage door (for the car). It would be trivial to extend this to other doors, but we never use those to leave or return, and don't go jumping out of windows.

I've got two different types of door sensors, the doors have the [Xiaomi Aqara E1 sensor](https://www.zigbee2mqtt.io/devices/MCCGQ14LM.html) and all the windows use the previous generation [Xiaomi Aqara sensors](https://www.zigbee2mqtt.io/devices/MCCGQ11LM.html). The Sensative strips and Fibaro sensors have gone.

The door sensors are also used to start departure and arrival scans in _monitor_ (which we'll get to shortly)

* * *

## Mosquitto

I use [Mosquitto](https://mosquitto.org/) as my MQTT broker, as most people will. You can run this as an add-on, a Docker container, or natively. I run it on the same host I run my MariaDB server, but it can run anywhere.

Mosquitto is required for _monitor_ to communicate with Home Assistant.

* * *

## Monitor

[Monitor](https://github.com/andrewjfreyer/monitor) is a _passive Bluetooth presence detection of beacons, cell phones, and other Bluetooth devices. Useful for mqtt-based home automation, especially when the script runs on multiple devices, distributed throughout a property._ You run it on one or more systems in your house, and it reports on the presence, or absence, of your chosen devices.

Why do I use this instead of the built in [Bluetooth tracker](https://www.home-assistant.io/integrations/bluetooth_tracker/)? Three main reasons:

1.  At one point the Bluetooth tracker was literally adding about 5 minutes to the start of my instance. I've no idea why, but others saw similar things, if nothing quite so extreme.
2.  It reports on _every device it ever sees_. This is ... noisy if you live near a public road, with neighbours nearby, etc.
3.  It works really well for one small part of the house - near the system running Home Assistant - and not at all for the rest of the house.

For those of you running Supervised, there's a [convenient add-on](https://github.com/Limych/addon-presence-monitor) - if your HA system is located somewhere suitable. Regardless, some low-ish end system is enough. I'm running one instance on an [Orange Pi Zero LTS](http://www.orangepi.org/orangepizerolts/), and another on a Pi3B. I had a couple of Pi Zero units, but they would randomly stop responding. The Orange Pi locked up a couple of times while I was testing, but has been reliable in production.

Basically, set up one or more installs of _monitor_ around your house, as you need. I've got one running in the front corner of the house (the Orange Pi), where it can easily detect us arriving, and the other in the opposite corner of the house (the Pi3B). That provides full coverage of the house, the garage, and the approach.

I have both installs configured to do arrival scans automatically, but departure scans only on demand.

### systemd unit file

```
[Unit]
Description=Monitor Service
After=network.target

[Service]
User=root
ExecStart=/bin/bash /local/bin/monitor/monitor.sh -x -b -tdr &
WorkingDirectory=/local/bin/monitor
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target network.target
```

The flags there are:

| `-x` | Sets the MQTT retain flag, so that if HA restarts it gets the last status message. |
| `-b` | Listens for beacons, as I use a (Chipolo) beacon for the car. |
| `-tdr` | Only does departure scans when told, and tells other devices to do arrival (or departure) scans when it does a scan. Arrival scans are automatic, based on the filters below. |

### `behaviour_preferences`

Except where specified these are all at the defaults

```
MAX RETRY ATTEMPTS FOR ARRIVAL (default is one)
PREF_ARRIVAL_SCAN_ATTEMPTS=2

MAX RETRY ATTEMPTS FOR DEPART
PREF_DEPART_SCAN_ATTEMPTS=2

SECONDS UNTIL A BEACON IS CONSIDERED EXPIRED
PREF_BEACON_EXPIRATION=240

MINIMUM TIME BEWTEEN THE SAME TYPE OF SCAN (ARRIVE SCAN, DEPART SCAN)
PREF_MINIMUM_TIME_BETWEEN_SCANS=15

ARRIVE TRIGGER FILTER(S)
PREF_PASS_FILTER_ADV_FLAGS_ARRIVE=".*"
PREF_PASS_FILTER_MANUFACTURER_ARRIVE=".*"
 Limit to just the devices I care about
PREF_PASS_FILTER_MANUFACTURER_ARRIVE="Google|Intel|Hon Hai|HUAWEI|HTC Corporation|Apple|LG Electronics|Chipolo|Doro"

ARRIVE TRIGGER NEGATIVE FILTER(S)
PREF_FAIL_FILTER_ADV_FLAGS_ARRIVE="NONE"
PREF_FAIL_FILTER_MANUFACTURER_ARRIVE="NONE"

 Default is -75, which doesn't pick up my Chipolo beacon well enough
PREF_RSSI_IGNORE_BELOW=-95
 Default is false, but we want device tracker entires
PREF_DEVICE_TRACKER_REPORT=true
```

### `mqtt_preferences`

```
 IP ADDRESS OR HOSTNAME OF MQTT BROKER
mqtt_address=192.168.0.30

 MQTT BROKER USERNAME (OR BLANK FOR NONE)
mqtt_user='monitorfff'

 MQTT BROKER PASSWORD (OR BLANK FOR NONE)
mqtt_password='super$ecretPa55word'

 MQTT PUBLISH TOPIC ROOT
mqtt_topicpath=monitor

 PUBLISHER IDENTITY
mqtt_publisher_identity='first floor front'

 The rest of this is default
 MQTT PORT
mqtt_port='1883'

 MQTT CERTIFICATE FILE (LEAVE BLANK IF NONE)
mqtt_certificate_path=''

MQTT VERSION (LEAVE BLANK FOR DEFAULT; EXAMPLE: 'mqttv311')
mqtt_version=''
```

This as you can guess is from the unit at the front, on the first floor. The other has a different identity (first floor rear - creative or what).

The only thing left to do is to populate `known_static_addresses` with the Bluetooth addresses of the things I care about, and what I want them known as. For example

```
58:cb:52:24:53:15 person1 mobile
3C:28:6D:DA:EB:A1 person2 mobile
```

Now when I start _monitor_ it'll update the topics `monitor/first floor front/person1_mobile/device_tracker` and `monitor/first floor front/person2_mobile/device_tracker` with `home` or `not_home` accordingly. There will be other things it does, but that's all I'm caring about.


* * *

## Integrations

The integrations we're using are for:

* WiFi tracking - the [nmap tracker](https://www.home-assistant.io/integrations/nmap_tracker)
* [MQTT](https://www.home-assistant.io/docs/mqtt/broker#run-your-own) - for the Bluetooth tracker
* [MQTT device tracker](https://www.home-assistant.io/integrations/device_tracker.mqtt) - for the Bluetooth tracker
* GPS and connected WiFi - the [official Android app](https://companion.home-assistant.io/) - for the WiFi sensor
* [Proximity](https://www.home-assistant.io/integrations/proximity) - for how near home the phone is
* [Group](https://www.home-assistant.io/integrations/group) - to merge things together

### NMAP

The configuration here for the [nmap tracker](https://home-assistant.io/integrations/nmap_tracker) is pretty simple, scan everything except the HA host.

### MQTT

I use the [MQTT broker](https://www.home-assistant.io/docs/mqtt/broker#run-your-own) with my local MQTT broker. None of the options I've got set, for birth/will and MQTT Discovery, are needed for _monitor_.

### MQTT Device Tracker

These [MQTT device trackers](https://www.home-assistant.io/integrations/device_tracker.mqtt) link the topics created by _monitor_, explained above, to [device tracker entities](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/mqtt/device_tracker/monitor_person1_bt_front_mobile.yaml):

```yaml
mqtt:
  device_tracker:
    - name: "person1 bt front mobile"
      state_topic: 'monitor/first floor front/person1_mobile/device_tracker'
      source_type: bluetooth
```

I have two instances of _monitor_, so each device has two device trackers.

### Android App

As well as being used for GPS I use the [connected WiFi sensor](https://companion.home-assistant.io/docs/core/sensors#connection-type-sensor), with [an automation](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/automation/people/person1/person1_wifi_status.yaml) and a [MQTT device tracker](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/mqtt/device_tracker/person_person1_wifi.yaml):

{% raw %}
```yaml
automation:
  - id: 'person1_wifi_status'
    alias: 'person1 WiFi status'
    initial_state: 'on'
    trigger:
      - platform: state
        entity_id: sensor.person1_pixel_3_wifi_connection
      - platform: homeassistant
        event: start
      - platform: event
        event_type: automation_reloaded
    action:
      - choose:
        - conditions:
            - condition: template
              value_template: "{{ 'Cogs-n-Gears' in states('sensor.person1_pixel_3_wifi_connection') }}"
          sequence:
            - service: mqtt.publish
              data:
                topic: location/person1_wifi
                payload: 'home'
                retain: true
        default:
          - service: mqtt.publish
            data:
              topic: location/person1_wifi
              payload: 'not_home'
              retain: true
```
{% endraw %}

```yaml
mqtt:
  device_tracker:
    - name: "person person1 wifi"
      state_topic: 'location/person1_wifi'
      source_type: router
      unique_id: "mqtt_person_person1_wifi"
```

This gives me a `device_tracker` that's `home` or `not_home` based on the connected wifi network name.

Why do I mention GPS tracking, when I said at the start it can be too slow? I use it for a number of other things, but here I want it for ...

### Proximity

The [proximity integration](https://www.home-assistant.io/integrations/proximity) provides me with a [distance from home](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/proximity/person1_home.yaml) in meters. This is used in the automations to account for a couple of edge cases that I'll explain when we get to that.

```yaml
proximity:
- person1_home:
    zone: home
    devices:
    - device_tracker.person1_mobile
    unit_of_measurement: m
```

### Group

I use [groups](https://www.home-assistant.io/integrations/group) for a bunch of things, but here what I do is [group all the non-GPS trackers](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/groups/person_person1.yaml) for each person, to make my automations "easier".

```yaml
group:
  person_person1:
    name: person1
    entities:
      - device_tracker.person1_mobile_wifi
      - device_tracker.person1_bt_mobile
      - device_tracker.person1_bt_front_mobile
      - device_tracker.person1_wifi
```

These are used in the automations, not in triggers, but in the conditions.

* * *

## Scripts

Yes, we're done with all the foundation work. Finally.

There's a [home](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/scripts/people/person1/person1_home.yaml), and an [away](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/scripts/people/person1/person1_away.yaml), [script](https://www.home-assistant.io/integrations/script) for each person. The full scripts are linked, but I've posted the key parts that are relevant here:

```yaml
script:
  person1_home:
    alias: person1 home
    sequence:
    # Everybody has a boolean that defines if they're home or away. They're home,
    #  so turn it on
    - service: input_boolean.turn_on
      entity_id: input_boolean.person1_home

  person1_away:
    alias: person1 away
    sequence:
    # Turn off the boolean showing they're home
    - service: input_boolean.turn_off
      entity_id: input_boolean.person1_home
```

Yes, pretty much all those scripts are doing for presence detection is turning a boolean on and off to indicate home/away. At least for the purposes here, the full scripts do more things, for other purposes. I use those booleans for home/away logic, not any group, person, or device tracker entity.

There's also scripts for [departure](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/scripts/scan_bt_depart.yaml) and [arrival](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/scripts/scan_bt_arrive.yaml) scans. We only _really_ need the departure scan script, since we told _monitor_ to only do departure scans on demand, not automatically. The arrival scans however speed up detection.

{% raw %}
```yaml
script:
  scan_bt_depart:
    sequence:
    - wait_template: "{{ is_state('script.scan_bt_arrive', 'off') }}"
    - delay: '00:00:30'
    - service: mqtt.publish
      data:
        topic: monitor/scan/depart
        payload: ''
    - delay: '00:00:35'
    - service: mqtt.publish
      data:
        topic: monitor/scan/depart
        payload: ''
    - delay: '00:01:05'
    - service: mqtt.publish
      data:
        topic: monitor/scan/depart
        payload: ''
    - delay: '00:02:05'
    - service: mqtt.publish
      data:
        topic: monitor/scan/depart
        payload: ''
    - delay: '00:01:05'
    - service: mqtt.publish
      data:
        topic: monitor/scan/depart
        payload: ''

  scan_bt_arrive:
    sequence:
    - wait_template: "{{ is_state('script.scan_bt_depart', 'off') }}"
    - service: mqtt.publish
      data:
        topic: monitor/scan/arrive
        payload: ''
    - delay: '00:00:15'
    - service: mqtt.publish
      data:
        topic: monitor/scan/arrive
        payload: ''
```
{% endraw %}

The departure scan waits to ensure that we're not doing an arrival scan, and then runs four departure scans, one after 30 seconds, another after (a total of) 65 seconds, the next at 1:10, and the next at 3:15. Then a minute later, at 4:20, it does a final scan. This allows plenty of time to ensure that we've left. The arrival scan does two arrival scans, 15 seconds apart. This just speeds up the arrival detection.


* * *

## Automations

Now we bring it all together into one simple, and one not quite so simple, [automation](https://www.home-assistant.io/docs/automation/) for presence detection.

### Home

The [home automation](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/automation/people/person1/person1_home.yaml) is relatively simple:

{% raw %}
```yaml
automation:
  - id: 'person1_home'
    initial_state: 'on'
    alias: 'person1 home'
    trigger:
      - platform: state
        entity_id: 
          - device_tracker.person1_mobile_wifi
          - device_tracker.person1_bt_mobile
          - device_tracker.person1_bt_front_mobile
          - device_tracker.person1_wifi
        to: 'home'
      - platform: state
        entity_id: binary_sensor.front_door_contact
        to: 
        - 'off'
        - 'on'
      - platform: event
        event_type: automation_reloaded
      - platform: homeassistant
        event: start
    condition:
      - condition: state
        entity_id: group.person_person1
        state: 'home'
      # Either the door just opened/closed, or multiple trackers show home
      - condition: or
        conditions:
        - condition: numeric_state
          entity_id: group.person_person1
          above: 1
          value_template: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person1', 'entity_id'))|list)|groupby('state'))['home']|count }}"
        - condition: and
          conditions:
          - condition: template
            value_template: >-
              {{ ((now() - states.binary_sensor.front_door_contact.last_changed).seconds < 120 ) }}
          - condition: numeric_state
            entity_id: group.person_person1
            above: 0
            value_template: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person1', 'entity_id'))|list)|groupby('state'))['home']|count }}"
    action:
      - service: script.turn_on
        entity_id: script.person1_home
    
```
{% endraw %}

Now, this looks _slightly_ more complicated than it needs to be, but the logic is basically that we trigger on:

* Any device tracker becoming `home`
* The front door opening or closing
* HA reloading or starting

We then require:

* At least one tracker showing `home` (the state of the `group`)
* Either:
  * More than one tracker shows as `home`
  * The door opened in the last 2 minutes (120 seconds) and at least one tracker shows `home`

## Away

The [away automation](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/automation/people/person1/person1_away.yaml) is the strangely complicated one. I'll break this one down rather than posting it as a one.

The first trigger statement is for when the GPS tracker says we're away:

```yaml
  trigger:
      - platform: state
        entity_id: proximity.person1_home
```

The next two are the typical ones, devices being away, and HA starting:

```yaml
      - platform: state
        entity_id: 
          - device_tracker.person1_mobile_wifi
          - device_tracker.person1_bt_mobile
          - device_tracker.person1_bt_front_mobile
          - device_tracker.person1_wifi
        to: 'not_home'
      - platform: event
        event_type: automation_reloaded
      - platform: homeassistant
        event: start
```

The first condition check is that we've been home for at least 2 minutes, this avoids being marked away when we come home then immediately head out to the garage to put food in the outside freezer:

```yaml
      - condition: state
        entity_id: input_boolean.person1_home
        state: 'on'
        for: '00:02:00'
```

Now we have three blocks any one of which has to be true.

First off, an exit door has to have opened/closed in the last 5 minutes and at least half of the WiFi and half of the Bluetooth trackers show away:

{% raw %}
```yaml
        - condition: and
          conditions:
          # More than one tracker shows away
          - condition: template
            value_template: >-
              {{ 
                (expand('group.person_person1')|selectattr('attributes.source_type','eq','router')|selectattr('state','eq','home')|list|count / expand('group.person_person1')|selectattr('attributes.source_type','eq','router')|list|count <= 0.5)
                  and
                (expand('group.person_person1')|selectattr('attributes.source_type','eq','bluetooth')|selectattr('state','eq','home')|list|count / expand('group.person_person1')|selectattr('attributes.source_type','eq','bluetooth')|list|count <= 0.5)
              }}
            #value_template: "{{ (expand('group.person_person1')|selectattr('state','eq','not_home')|list|count / expand('group.person_person1')|list|count) >= 0.5 }}"
          # An exit door recently opened or closed
          - condition: template
            value_template: >
              {{ (now() - states.binary_sensor.front_door_contact.last_changed < timedelta(minutes=5)) or (now() - states.binary_sensor.garage_door_car_contact.last_changed < timedelta(minutes=5)) }}

```
{% endraw %}

Yes, I could simplify that to just half of the trackers.

Alternatively some trackers are showing away and we're at least 300 meters away. This handles when (for instance) both _monitor_ nodes have hung, or when we left we ended up stood at the front door chatting until after all the departure scans ran.

{% raw %}
```yaml
        - condition: and
          conditions:
          - condition: template
            value_template: "{{ (expand('group.person_person1')|selectattr('state','eq','home')|list|count / expand('group.person_person1')|list|count) < 1}}"
          - condition: template
            value_template: "{{ states('proximity.person1_home')|float > 300 }}"
```
{% endraw %}

Finally, to account for something else going wrong, we'll accept that it may also be that we're just far away and somehow never got marked away:

{% raw %}
```yaml
        - condition: template
          value_template: "{{ states('proximity.person1_home')|float > 600 }}"
```
{% endraw %}

Finally, we call the script:

```yaml
  action:
  - service: script.person1_away
```

If you're still with me, what this means is that we're marked away when:

*   At least two trackers show away if an exit door closed in the last 5 minutes
*   All trackers show away, and we're at least 300 meters away (remember GPSLogger won't report if it doesn't have an accuracy of at least 200 meters)
*   At least two trackers show away, and we're at least 600 meters away

The other automation runs the arrival and departure scans based on the door [opening](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/automation/front_of_house/front_door_open.yaml).

```yaml
automation:
  - id: 'front_door_open'
    alias: 'Front door open'
    initial_state: 'on'
    trigger:
      - platform: state
        entity_id: binary_sensor.front_door_contact
        to: 'on'
    action:
      - service: script.turn_on
        entity_id: script.scan_bt
```

There's also a matching automation for the garage door.

[That script](https://github.com/DubhAd/Home-AssistantConfig/blob/4ba4287720fb71ce34acad7761519d09acda58a7/scripts/scan_bt.yaml) has a lot of logic to decide whether to do an arrival or departure scan:

* If everybody is currently away, do an arrival scan
* Or if the far garage door is open do nothing as we're probably going to the freezer
* Or if we detected somebody on the path (using Frigate) or there's no motion inside the front door, do an arrival scan
* Or if somebody else just arrived, do an arrival scan
* Or if there was motion in the vestibule, do a departure scan
* Or if the garage door is already open, do an arrival scan
* Or if everybody is home, do a departure scan
* Finally, if we get to the end, do an arrival then departure scan

* * *

## But why?

I know, you're looking at this and thinking _this is horribly complicated_. Well, it is, and it isn't. If the behaviour of person works for you, great. It didn't work for me though, which is why I created this.

This gives me a presence detection method that is always quick to detect arrival. Importantly it never produces any false away, and at worst will have a short delay before marking people away.

### Room presence

It's been asked a few times if I do any room level presence detection, and the answer is _not by tracking phones_. It's of little value to me to know where somebody may have left a phone, or a tablet. I much prefer to track the people and their behaviours.