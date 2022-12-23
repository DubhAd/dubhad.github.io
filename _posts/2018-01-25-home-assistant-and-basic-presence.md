---
title: Home Assistant and (basic) Presence Detection
date: '2018-01-25T00:00:00.000Z'
tags:
- home assistant
- presence detection
modified_time: '2018-02-24T09:26:16.086Z'
---

Reliable presence detection is a challenge for many people. In part this is because modern smartphones put WiFi (and apps) to sleep when they're idle.

There are many ways of approaching this (just look at the threads on the [Home Assistant forum](https://community.home-assistant.io/) to see), but here's how I've tackled it with a range of Android device tracker.

## At home tracking

For on network detection I use [nmap](https://home-assistant.io/integrations/nmap_tracker/). My router isn't directly supported, and since I allocate a small range for mobile devices, nmap works well. I also use it for detecting whether some of the media players (and other devices) are on.

The problem (as mentioned above) is that modern smartphones turn off WiFi when they're idle, at which point the device ends up marked as away. Fortunately they don't turn off Bluetooth, so I also use the [Bluetooth tracker](https://home-assistant.io/integrations/bluetooth_tracker/). I did make the mistake of putting my Home Assistant system in one corner of the house, so Bluetooth doesn't _quite_ reach the opposite corner of the house reliably. The dead zone however is barely 0.5M², so it's not a big deal.

## General location tracking

I use [GPSLogger](https://code.mendhak.com/gpslogger/) on Android for location tracking. This allows me to detect if people enter or leave [a zone](https://home-assistant.io/integrations/zone/), and see how long it would [take them to get home](https://home-assistant.io/integrations/google_travel_time/) - no point in putting the dinner on for 6 PM if nobody will be home before 7 after all.

The settings are default, other than:

* Start on boot and app launch
* Hide the notification buttons and from the status bar
* Location providers of GPS and Passive. One one device I've disabled _Network_ as a test of the impact. So far, it appears to be insignificant.
* Logging interval of 900 seconds (15 minutes) on my tablet, and 600 seconds (10 minutes) on everything else
* Accuracy filter of 200
* Logging to URL

The battery impact is irrelevant - 1% usage at the end of a typical day.

Geo-location like this I find useful for various automations, like letting whichever of us is at home know the other is on their way (handy for asking them to detour by the shops to grab something). It's also used in an automation when I'm in the office, to let me know the state of the trains for the commute home.

## Bringing it together

Now I can group these trackers (nmap, Bluetooth, and GPSLogger). When any one of them shows as home, I am then at home. This is largely where I have things now, and it's proven very reliable.

```yaml
group:
  person_tinkerer:
    name: Tinkerer
    view: false
    entities:
    - device_tracker.tinkerer_mobile_nmap
    - device_tracker.tinkerer_mobile_bt
    - device_tracker.tinkerer_mobile

customize:
  group.person_tinkerer:
    entity_picture: /local/tinkerer.jpg
```

## Wait! There's more

Having home/away is slightly useful, but I like to display where people are, and if not in a zone how long it would take them to get home (really useful for planning dinner). For that I have a template sensor for each person which displays the zone (home or other) if we're in one, otherwise how long it'll take to get home:

{% raw %}
```yaml
sensor:
  - platform: template
    sensors:
      tinkerer_travel:
        friendly_name: "Tinkerer's location"
        value_template: >-
          {%- if is_state("group.person_tinkerer", "home") -%}
            At home
          {%- elif is_state("device_tracker.tinkerer_mobile", "not_home") -%}
            {{ states.sensor.tinkerers_time_to_home.attributes.duration }} to home
          {%- else -%}
            At {{ states("device_tracker.tinkerer_mobile") }}
          {%- endif %}
```
{% endraw %}

And then, for display, I'll add my picture:

```yaml
customize:
  sensor.tinkerer_travel:
    entity_picture: /local/tinkerer.jpg
```

## Moving further

However, there's more to it than just where people's mobile devices are. If somebody's at home, the chances are there's a TV, or a media player, or a PC on. Some of us have other devices (like smart watches) that can also be used. Then there's whether or not external doors have been opened, after all if no door has opened, we can't have left home.

I also could go a step further and use a [bayesian sensor](https://home-assistant.io/integrations/bayesian/), or a [template sensor](https://home-assistant.io/integrations/template/), such that I need at least two out of the three showing at home before I'm considered at home, but any one is enough to keep me at home.

I haven't done any of this yet, as what I'm doing currently works really well, but I'm likely to explore this over time. I'm also exploring Phil Hawthorne's work on [making detection less binary](https://philhawthorne.com/making-home-assistants-presence-detection-not-so-binary/).


**_Footnotes_**

1.  _I was using OwnTracks, but there's a [known issue](https://github.com/owntracks/android/issues/508) where it'll randomly turn off reporting. It doesn't help that the Android app was abandoned due to the lack of a maintainer, though it looks like a replacement is now in hand._
