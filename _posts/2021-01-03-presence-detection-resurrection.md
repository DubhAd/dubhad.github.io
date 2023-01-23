---
title: Presence Detection Resurrection
date: '2021-01-03T01:00:00.001Z'
toc: true
tags:
- bluetooth
- home assistant
- presence detection
modified_time: '2021-01-03T01:00:00.518Z'
---

Yes, another update. Until I start using Blueprints I think this'll be the last one for a while. Probably.  
  
Oh, you may want to grab a cuppa before you dive in, this is a long one as I wanted to cover _everything_ relevant in one article.  

## Goal

The goal here is to have _quick and reliable_ home/away detection. This is for a few key things:  

1.  Let us know we left a door or window open when we left the house, before we've got too far
2.  Turning on lights as we get home
3.  Manage a number of automations that are based around whether we're home, or away

We can't have false aways, turning things off unexpectedly is a good way of annoying people. It can't leave people marked as being home when they're clearly not, as then people don't get told about open doors or windows soon enough.

### The problem

Grouping device trackers was the traditional approach, but it means that if _any_ tracker thinks the device is home, then you're home. The result isn't very useful if you've included GPS trackers in that group. The early stages of the [person integration](https://www.home-assistant.io/integrations/person/) had a "most recent update wins" approach which didn't help as you'd easily flip between home and away. The more recent updates to person have made it better, but it still takes a "most recent update wins" approach amongst the non-GPS trackers. That's fine if you've only got one local presence detection integration, and it's 100% reliable.  
  
Importantly, I want to ensure that a phone running out of battery doesn't cause a false away. That means that having local device trackers report away shouldn't necessarily cause somebody to be marked away.  
  
Finally, I need to allow for edge cases with things breaking. It's not going to be the first time that one of the nodes responsible for Bluetooth tracking has silently failed. Back when I was using a different WiFi based detection integration I also had that fail (actually, it caused the router to run out of memory). The results of those failures were that some devices were locked home, and some were locked away.  

### GPS

GPS trackers update intermittently, more so if you're on iOS where the application has no control over update intervals. GPS also has issues when you're indoors, the deeper you go, the worse it gets. The default home zone of 100 meters occasionally resulted in the GPS tracker giving false away reports, worst case a few times a day. Departure is also slow, very slow, and we could be marked as home when we're just passing, or visiting a neighbour. This rules out GPS being a _timely or accurate_ indicator of whether or not we're actually home.

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

*   One template sensor
*   One motion sensor
*   Two door sensors
*   Two external programs
*   Four automations
*   Five scripts
*   Six integrations  
    
* * *

## Template sensor

I use a template sensor to provide an indicator of how many people are home.

{% raw %}
```yaml
sensor:  
- platform: template  
  sensors:  
    home_count:  
      friendly_name: 'Home count'  
      unique_id: 'home_count'  
      value_template: >-  
        {{ ((expand('group.my_people')|selectattr('state', 'eq', 'on')|map(attribute='name')|list|count)/(expand('group.my_people')|map(attribute='name')|list|count))|round(2) }}  
```
{% endraw %}

This gives me a value of between zero (nobody home) and one (everybody home).

* * *

## Motion sensors

I have motion sensors in various places around the house, but here the key one is the one in the vestibule. That sensor covers the area just inside the front door, so you can't exit the house without tripping it.

I'm using a Xiaomi Aqara Human Body Movement sensor there, but any motion sensor will do. I connect these to Home Assistant using [Zigbee2MQTT](https://www.zigbee2mqtt.io/).  

* * *

## Door sensors

I've installed sensors on all the external doors (and windows). These serve a range of purposes, controlling the garden lights, reminding us to close the doors/windows if it's cold outside, warning us the garage door was left open, and more.  
  
It also means we can tell if somebody _could_ have left the house. For simplicity I'm only interested in the front door and the garage door (for the car). It would be trivial to extend this to other doors, but we never use those to leave or return, and don't go jumping out of windows.  
  
I've got two different types of door sensors, the house doors have the [Sensative Strips Guard](https://sensative.com/sensors/strips-zwave/guard/) (there's now a 700 series version, and a LoRA version), and the garage doors have a previous generation [Fibaro door/window sensor](https://www.fibaro.com/en/products/door-window-sensor/). All the windows use the [Xiaomi Aqara sensors](https://www.aqara.com/en/door_and_window_sensor.html), which are significantly cheaper than the Fibaro (and the Sensative, but the Sensative are invisible once fitted).  
  
The door sensors are also used to start departure and arrival scans in _monitor_ (which we'll get to shortly)  

* * *

## Mosquitto

I use [Mosquitto](https://mosquitto.org/) as my MQTT broker, as most people will. You can run this as an add-on, a Docker container, or natively. I run it on the same host I run my MariaDB server, but it can run anywhere.  
  
Mosquitto is required for _monitor_ to communicate with Home Assistant, and also Zigbee2MQTT for my Zigbee devices.

* * *

## Monitor

[Monitor](https://github.com/andrewjfreyer/monitor) is a _passive Bluetooth presence detection of beacons, cell phones, and other Bluetooth devices. Useful for mqtt-based home automation, especially when the script runs on multiple devices, distributed throughout a property._ You run it on one or more systems in your house, and it reports on the presence, or absence, of your chosen devices.

Why do I use this instead of the built in [Bluetooth tracker](https://www.home-assistant.io/integrations/bluetooth_tracker/)? Three main reasons:

1.  At one point the Bluetooth tracker was literally adding about 5 minutes to the start of my instance. I've no idea why, but others saw similar things, if nothing quite so extreme.
2.  It reports on _every device it ever sees_. This is _noisy_ if you live near a public road, with neighbours nearby, etc. Of course, if you want to track your neighbours coming and going...
3.  It works really well for one small part of the house - near the system running Home Assistant - and not at all for the rest of the house.

For those of you running Home Assistant OS or Supervised, there's a [convenient add-on](https://github.com/Limych/addon-presence-monitor) - if your HA system is located somewhere suitable. Regardless, some low-ish end system is enough. I'm running one instance on an [Orange Pi Zero LTS](http://www.orangepi.org/orangepizerolts/), and another on a Pi3B. I had a couple of Pi Zero units, but they would randomly stop responding. The Orange Pi locked up a couple of times while I was testing, but has been reliable in production.

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
#MAX RETRY ATTEMPTS FOR ARRIVAL (default is one)  
PREF_ARRIVAL_SCAN_ATTEMPTS=2  
  
#MAX RETRY ATTEMPTS FOR DEPART  
PREF_DEPART_SCAN_ATTEMPTS=2  
  
#SECONDS UNTIL A BEACON IS CONSIDERED EXPIRED  
PREF_BEACON_EXPIRATION=240  
  
#MINIMUM TIME BEWTEEN THE SAME TYPE OF SCAN (ARRIVE SCAN, DEPART SCAN)  
PREF_MINIMUM_TIME_BETWEEN_SCANS=15  
  
#ARRIVE TRIGGER FILTER(S)  
PREF_PASS_FILTER_ADV_FLAGS_ARRIVE=".*"  
#PREF_PASS_FILTER_MANUFACTURER_ARRIVE=".*"  
# Limit to just the devices I care about  
PREF_PASS_FILTER_MANUFACTURER_ARRIVE="Google|Intel|Hon Hai|HUAWEI|HTC Corporation|Apple|LG Electronics|Chipolo|Doro"  
  
#ARRIVE TRIGGER NEGATIVE FILTER(S)  
PREF_FAIL_FILTER_ADV_FLAGS_ARRIVE="NONE"  
PREF_FAIL_FILTER_MANUFACTURER_ARRIVE="NONE"  
  
# Default is -75, which doesn't pick up my Chipolo beacon well enough  
PREF_RSSI_IGNORE_BELOW=-95  
# Default is false, but we want device tracker entires  
PREF_DEVICE_TRACKER_REPORT=true
```

### `mqtt_preferences`

```
# IP ADDRESS OR HOSTNAME OF MQTT BROKER  
mqtt_address=192.168.0.30  
  
# MQTT BROKER USERNAME (OR BLANK FOR NONE)  
mqtt_user='monitorfff'  
  
# MQTT BROKER PASSWORD (OR BLANK FOR NONE)  
mqtt_password='super$ecretPa55word'  
  
# MQTT PUBLISH TOPIC ROOT  
mqtt_topicpath=monitor  
  
# PUBLISHER IDENTITY  
mqtt_publisher_identity='first floor front'  
  
# The rest of this is default  
# MQTT PORT  
mqtt_port='1883'  
  
# MQTT CERTIFICATE FILE (LEAVE BLANK IF NONE)  
mqtt_certificate_path=''  
  
#MQTT VERSION (LEAVE BLANK FOR DEFAULT; EXAMPLE: 'mqttv311')  
mqtt_version=''  
```

This as you can guess is from the unit at the front, on the first floor. The other has a different identity (`first floor rear` - creative or what).  
  
The only thing left to do is to populate `known_static_addresses` with the Bluetooth addresses of the things I care about, and what I want them known as. For example  

```
58:cb:52:24:53:15 person1 mobile  
3C:28:6D:DA:EB:A1 person2 mobile
```

Now when I start _monitor_ it'll update the topics `monitor/first floor front/person1_mobile/device_tracker` and `monitor/first floor front/person2_mobile/device_tracker` with `home` or `not_home` accordingly. There will be other things it does, but that's all I'm caring about.  
  

* * *

## Integrations

The integrations we're using are for:

*   WiFi tracking - the [nmap tracker](https://www.home-assistant.io/integrations/nmap_tracker)
*   [MQTT](https://www.home-assistant.io/docs/mqtt/broker#run-your-own) - for the Bluetooth tracker
*   [MQTT device tracker](https://www.home-assistant.io/integrations/device_tracker.mqtt) - for the Bluetooth tracker
*   GPS - I'm using [GPSLogger](https://www.home-assistant.io/integrations/gpslogger), but any will do
*   [Proximity](https://www.home-assistant.io/integrations/proximity) - for how near home the phone is
*   [Group](https://www.home-assistant.io/integrations/group) - to merge things together
*   [Template sensor](https://www.home-assistant.io/integrations/template) - to track the percentage of people home

### NMAP

The configuration here for the [nmap tracker](https://home-assistant.io/integrations/nmap_tracker) is [pretty simple](https://github.com/DubhAd/Home-AssistantConfig/blob/live/device_tracker/nmap_tracker.yaml), scan everything except the HA host:

```yaml
device_tracker:  
- platform: nmap_tracker  
  interval_seconds: 20  
  consider_home: 50  
  track_new_devices: yes  
  scan_options: " --privileged -F -n --host-timeout 10s --exclude 192.168.0.10 "  
  hosts:  
  - 192.168.0.0/24
```

This scans every 20 seconds, and once something responds it's assumed to be there for the next 50 seconds. The HA developers have been discussing removing `consider_home`, at which point I'll revisit the settings I use.  

### MQTT

I used the manual (YAML) definition for the [MQTT broker](https://www.home-assistant.io/docs/mqtt/broker#run-your-own) so [I can define](https://github.com/DubhAd/Home-AssistantConfig/blob/master/mqtt.yaml) the birth and will messages - though the UI integration now finally enables these by default. It uses my local MQTT broker (Mosquitto):  

```yaml
mqtt:  
  broker: !secret mqtt_host  
  username: !secret mqtt_user  
  password: !secret mqtt_pass  
  discovery: true  
  discovery_prefix: homeassistant  
  birth_message:  
    topic: 'hass/status'  
    payload: 'online'  
  will_message:  
    topic: 'hass/status'  
    payload: 'offline'
```

Beyond the basics, none of this is needed here. MQTT discovery, and the birth/will part, are required for Zigbee2MQTT, not _monitor_. We just want it set up so we can use the ...  

### MQTT Device Tracker

These [MQTT device trackers](https://www.home-assistant.io/integrations/device_tracker.mqtt) link the topics created by _monitor_, explained above, to [device tracker entities](https://github.com/DubhAd/Home-AssistantConfig/blob/live/device_tracker/mqtt.yaml):  

```yaml
device_tracker:  
- platform: mqtt  
  source_type: 'bluetooth'  
  devices:  
    person1_bt_mobile: 'monitor/first floor rear/person1_mobile/device_tracker'  
    person1_bt_front_mobile: 'monitor/first floor front/person1_mobile/device_tracker'  
  ...
```

I have two instances of _monitor_, so each device has two device trackers.  

### GPSLogger

Any GPS tracker will do here. I use [GPSLogger](https://www.home-assistant.io/integrations/gpslogger) over others for two main reasons:  

1.  I'm an Android user, and I use [Tasker](https://tasker.joaoapps.com/), allowing me to automate my phone. GPSLogger has support for _intents_, allowing me to control it from Tasker. This means I can change the settings to, say, disable GPS and increase the intervals if I'm in the office (which right now is not relevant admittedly).
2.  It's _very_ configurable. I can have it update at the speed I want, with the accuracy that interests me, etc. Typically I have it updating every 5 to 10 minutes, with a desired accuracy of 200 meters - it won't report if it can't provide an accuracy of at least that. When I'm in the office I have Tasker change the interval to 30 minutes, and the accuracy to 800.

Why do I mention GPS tracking, when I said at the start it can be too slow? I use it for a number of other things, but here I want it for ...

### Proximity

The [proximity integration](https://www.home-assistant.io/integrations/proximity) provides me with a [distance from home](https://github.com/DubhAd/Home-AssistantConfig/blob/live/proximity/person1_home.yaml) in meters (amongst other places). This is used in the automations to account for a couple of edge cases that I'll explain when we get to that.

```yaml
proximity:  
- person1_home:  
    zone: home  
    devices:  
    - device_tracker.person1_mobile  
    unit_of_measurement: m  
```

### Group

I use [groups](https://www.home-assistant.io/integrations/group) for a bunch of things, but here what I do is [group all the non-GPS trackers](https://github.com/DubhAd/Home-AssistantConfig/blob/live/groups/person_person1.yaml) for each person, to make my automations "easier".  

```yaml
group:  
  person_person1:  
    name: person1  
    entities:  
    - device_tracker.3c_28_6d_da_eb_a1  
    - device_tracker.person1_bt_mobile  
    - device_tracker.person1_bt_front_mobile
```

These are used in the automations, not in triggers, but in the conditions.  

* * *

## Scripts

Yes, we're done with all the foundation work. Finally.  
  
There's a [home](https://github.com/DubhAd/Home-AssistantConfig/blob/live/scripts/people/person1/person1_home.yaml), and an [away](https://github.com/DubhAd/Home-AssistantConfig/blob/live/scripts/people/person1/person1_away.yaml), [script](https://www.home-assistant.io/integrations/script) for each person. The full scripts are linked, but I've posted the key parts that are relevant here:

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

Yes, pretty much all those scripts are doing for presence detection is turning a boolean on and off to indicate home/away. At least for the purposes here, the full scripts do more things for other purposes. I use those booleans for home/away logic, not any group, person, or device tracker entity.

The main script now is one for [doing the scans]({% post_url 2020-04-14-presence-detection-one-last-time %}). This uses a bunch of logic to work out whether we can do just a departure scan, or just an arrival scan, or whether we should do both. At 116 lines I won't put it in here, but the basic logic is:

*   If nobody is home, do an away scan
*   If everybody is home, do a departure scan
*   If the far garage door, for the freezer, is already open do nothing (since it's likely we're just going out to the freezer)
*   There was motion in the vestibule, do a departure scan, then an arrival scan (it's possible somebody forgot their key)
*   There was no motion in the vestibule, do an arrival scan
*   None of these (fall through), do an arrival scan, then a departure scan

There's also scripts for [departure](https://github.com/DubhAd/Home-AssistantConfig/blob/live/scripts/scan_bt_depart.yaml) and [arrival](https://github.com/DubhAd/Home-AssistantConfig/blob/master/scripts/scan_bt_arrive.yaml) scans. We only _really_ need the departure scan script, since we told _monitor_ to only do departure scans on demand, not automatically. The arrival scans however speed up detection, probably by 20 to 30 seconds.

The departure scan waits to ensure that we're not doing an arrival scan, and then runs five departure scans, with various delays, stopping if everybody is away. This allows for the many times we stand just outside the house chatting with the neighbours. The arrival scan does three arrival scans, 30 seconds apart, stopping if everybody is home.  

* * *

## Automations

Now we bring it all together into one relatively simple, and one not quite so simple, [automation](https://www.home-assistant.io/docs/automation/) for presence detection.

### Home

The [home automation](https://github.com/DubhAd/Home-AssistantConfig/blob/live/automation/people/person1/person1_home.yaml) was relatively simple, but has become a bit more complicated:

**Triggers**: Any device tracker shows home, the front door opens/closes, HA starts

**Conditions**: Multiple trackers show home, or the door just opened/closed and at least one shows home

{% raw %}
```yaml
automation:  
- initial_state: 'on'  
  alias: 'person1 home'  
  trigger:  
  # Trigger when any of their local trackers show home  
  - platform: state  
    entity_id:   
      - device_tracker.3c_28_6d_da_eb_a1  
      - device_tracker.person1_bt_mobile  
      - device_tracker.person1_bt_front_mobile  
    to: 'home'  
  # When the front door opens or closes  
  - platform: state  
    entity_id: binary_sensor.pi3_front_door_sensor  
    to: 'off'  
  - platform: state  
    entity_id: binary_sensor.pi3_front_door_sensor  
    to: 'on'  
  # Trigger when HA starts  
  - platform: homeassistant  
    event: start  
  condition:  
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
          {{ ((now() - states.binary_sensor.pi3_front_door_sensor.last_changed).seconds < 60 ) }}  
      - condition: numeric_state  
        entity_id: group.person_person1  
        above: 0  
        value_template: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person1', 'entity_id'))|list)|groupby('state'))['home']|count }}"  
  action:  
  # Call the script we wrote above  
  - service: script.person1_home
```
{% endraw %}

We're just looking for any sign they're home. I don't use the group in the trigger because it's possible we marked somebody as away despite not every group member being away. That means that the status of the group will remain home, so not change when another tracker marks them as home.

## Away

The [away automation](https://github.com/DubhAd/Home-AssistantConfig/blob/live/automation/people/person1/person1_away.yaml) is the strangely complicated one. I'll break this one down rather than posting it as a one.  
  
The first two trigger statements are for when the GPS tracker says we're away, and far away. These catch the edge cases:  

```yaml
  trigger:  
  - platform: numeric_state  
    entity_id: proximity.person1_home  
    above: 300  
  - platform: numeric_state  
    entity_id: proximity.person1_home  
    above: 600
```

The next two are the typical ones, devices being away, and HA starting:  

```yaml
  - platform: state  
    entity_id:   
      - device_tracker.3c_28_6d_da_eb_a1  
      - device_tracker.person1_bt_mobile  
      - device_tracker.person1_bt_front_mobile  
    to: 'not_home'  
  - platform: homeassistant  
    event: start
```

Next up, we define a bunch of variables

{% raw %}
```yaml
variables:  
  away_count: "{{ dict((states|selectattr('entity_id', 'in', state_attr('group.person_person1', 'entity_id'))|list)|groupby('state'))['not_home']|count }}"  
  door_recent: "{{ ((now() - states.binary_sensor.pi3_front_door_sensor.last_changed).seconds < 300) or ((now() - states.binary_sensor.pi3_garage_closed_car_sensor.last_changed).seconds < 300) }}"  
  is_home: "{{ is_state('input_boolean.person1_home','on') }}"  
  proximity_home: "{{ states('proximity.person1_home') }}"  
  away_script: script.person1_away
```
{% endraw %}

These are the first step towards using [Blueprints](https://www.home-assistant.io/docs/automation/using_blueprints/). We're defining some standard values that we can use in the conditions and actions later. The first condition check is that we're home, if we're not home there's no point in doing this all over again:  

{% raw %}
```yaml
  condition:  
  - condition: template  
    value_template: "{{ is_home == 'True' }}"
```
{% endraw %}

Now we have three blocks any one of which has to be true.  
  
First off, an exit door has to have opened/closed in the last 5 minutes, and at least two trackers show away. Why two? Well it's quite normal for one tracker to be showing away at any given time, due to the layout of the house, or the phone being in deep sleep.  

{% raw %}
```yaml
    - condition: and  
      conditions:  
      # More than one tracker shows away  
      - condition: template  
        value_template: "{{ away_count|int > 1 }}"  
      # An exit door recently opened or closed  
      - condition: template  
        value_template: "{{ door_recent == 'True' }}"  
```
{% endraw %}

Alternatively at least one devices are showing away, and we're not that close. This exists because it wouldn't be the first time we've stood just outside chatting with a neighbour for more than 5 minutes. Three hundred meters is far enough beyond the accuracy level set for GPSLogger that there's no chance of getting a false away with this.  

{% raw %}
```yaml
    - condition: and  
      conditions:  
      - condition: template  
        value_template: "{{ away_count|int > 0 }}"  
      - condition: template  
        value_template: "{{ proximity_home|int > 300 }}"  
```
{% endraw %}

Finally, to account for all of the trackers locking up (and/or us spending an age chatting with the neighbours), we'll accept that it may also be that we're just far away:  

{% raw %}
```yaml
    - condition: template  
      value_template: "{{ proximity_home|int > 600 }}"  
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

The other automation runs the scan script when the door [opens](https://github.com/DubhAd/Home-AssistantConfig/blob/live/automation/front_of_house/front_door_open.yaml).

```yaml
automation:  
- alias: 'Front door open'  
  initial_state: 'on'  
  trigger:  
  - platform: state  
    entity_id: binary_sensor.pi3_front_door_sensor  
    to: 'on'  
  action:  
  - service: automation.turn_off  
    data:  
      entity_id: automation.garage_open_nobody_home  
  - service: script.turn_on  
    entity_id: script.scan_bt
```

There are also automations for the garage door.  

* * *

## But why?

I know, you're looking at this and thinking _this is horribly complicated_. Well, it is, and it isn't. If the behaviour of person works for you, great. It didn't work for me though, which is why I created this.  
  
This gives me a presence detection method that is always quick to detect arrival. Importantly it never produces any false away, and at worst will have a short delay before marking people away.  

### Room presence

It's been asked a few times if I do any room level presence detection, and the answer is _not by tracking phones_. It's of little value to me to know where somebody may have left a phone, or a tablet. I much prefer to track the people and their behaviours.

* * *

## Next?

The obvious thing is to use [Blueprints](https://www.home-assistant.io/docs/automation/using_blueprints/). I just need to upgrade HA first. At the time of writing this I'm still a couple of releases too old for those.

The other thing I should do is if one of the distance conditions is tripped is run a departure scan again, and if that still shows the person is home force a restart of the _monitor_ instances. That'll handle the odd case of _monitor_ hanging.
