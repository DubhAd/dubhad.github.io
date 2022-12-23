---
title: My great migration - part one
date: '2019-08-15T10:45:00.002+01:00'
tags:
- zigbee
- z-wave
- home assistant
modified_time: '2019-08-15T10:45:50.305+01:00'
---

I've been running Home Assistant on my Pi3 since I started with HA, back in January 2017. I'd chosen a [Z-Wave GPIO hat](https://z-wave.me/products/razberry/) over a USB stick (amongst other things, because it avoided the risk of it getting disconnected in error), which has tied my Z-Wave mesh to the Pi.  
  
The Pi works, but disk I/O is always a challenge and startup times are long. Upgrades of the venv can take up to an hour if things have to be compiled. As such, it's time to plan a migration.  
  
I've got two sensible long term options:  

1.  Buy the same manufacturer's [Z-Wave USB stick](https://z-wave.me/uzb/), back up the hat, restore it to the stick
2.  Migrate to [Zwave2MQTT](https://github.com/OpenZWave/Zwave2Mqtt)

The first has the advantage that I don't have to change anything else, but the downside that every time I restart HA I get to see if the Python OpenZWave cache file will be corrupted and crash HA on startup again. This is an odd edge case that most people seem to avoid, but quite a few of us have been randomly hit by.

The second means I can place my Z-Wave controller where it's central, rather than the current location, and also that restarts of HA don't impact the mesh. I'm also already using MQTT for [Zigbee2MQTT](https://www.zigbee2mqtt.io/) and [monitor](https://github.com/andrewjfreyer/monitor).

### Initial attempts with Zwave2MQTT

My first attempt to compile the NodeJS package worked, but didn't create the required bundle for some reason. The next attempt to compile caused the Pi to busy out for 5 minutes, with load values passing 50. As that's my Home Assistant server, that was a problem, and it got killed. I haven't tackled that since.

I've put this on hold until a future date. I'll buy another Pi (may as well buy a Pi4, but I'll wait to see if they're going to fix the USB-C charger issue) and possibly install Home Assistant OS there so I can use [Frenck's Zwave2MQTT add-on](https://github.com/hassio-addons/addon-zwave2mqtt).

### What to do until then?

The answer was easy - hack it!

1.  Configure the Pi instance to use [MQTT statestream](https://www.home-assistant.io/integrations/mqtt_statestream) and send the states and attributes of the Z-Wave related entities
2.  Manually configure MQTT sensors and switches on the VM instance
3.  Test!

MQTT Statestream is only one way, so I was getting the information I needed in the VM, but couldn't control anything. Some quick hackery with some MQTT binary sensors (to read the state of a fake command topic) and automations (one for publishing the state of the switch to the command topic if the switch changes state and the command topic isn't the same; one for calling the API of the Pi instance to control the switch) and it lives!

### Next steps

Now is the gentle grind of migrating, well, pretty much everything. The biggest challenge was sorting out the remote webhooks, for GPS Logger and Tasker, such that they would update both instances while I transition, without changing anything on the mobile devices. As I'm using NGINX I could pull together a quick CGI script to act as a splitter, receiving the payloads and sending them to both instances.

Since then, it's just been a case of migrating blocks of automations at a time, as I get time. I'm expecting that this may drag on a bit, life over the last 6 months or so has left me little free time to tackle anything of note, but there's no rush.
