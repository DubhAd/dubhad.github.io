---
title: Messing with meshing
date: '2019-09-06T11:42:00.001+01:00'
tags:
- zigbee
- z-wave
- home assistant
modified_time: '2019-09-06T11:42:43.476+01:00'
---

Back when I started with home automation, Z-Wave was the obvious choice for sensors, smart sockets. You could mix and match any brand of device, and controller, and things would work. Zigbee was more of a minefield at the time.  
  
The universe has moved on, and Zigbee is becoming more of a standard. Home Assistant now has two core Zigbee integrations with a wide range of supported devices ([zha](https://www.home-assistant.io/integrations/zha) and [deconz](https://www.home-assistant.io/integrations/deconz/)), and then there's [zigbee2mqtt](https://www.zigbee2mqtt.io/).  
  
I'd already stepped into Zigbee when I bought a Hue hub and compatible light strip controller, but hadn't intended to do much more than use the hub as a gateway for some lights. I had nothing but trouble with the hub though. It would regularly go _unavailable_ for tens of minutes, so I accepted the prompt for a firmware upgrade, at the end of which the hub wouldn't respond to the Hue app. Nothing I did would bring it back to life, and given the previous trouble I'd had with it I decided it was time to jump fully in.  

### Which path?

There's no right answer here, they each have advantages, disadvantages, and slightly different device support. Of course, with all of them you can add unsupported devices and help create support for them.  
  
I went with Zigbee2MQTT for two main reasons  

1.  I'm now using MQTT anyway for [monitor](https://github.com/andrewjfreyer/monitor)
2.  I want something that I can upgrade and change separately from HA, to cut down on restarts

All I needed to get started was to ditch that Hue hub, and buy all the parts needed to build a stick and a router. That takes too long to ship from the other side of the world, so while I did order the parts for flashing firmware, I ordered a [pre-assembled controller and router](http://zigbee2mqtt.discourse.group/t/ad-buy-ready2use-zigbee2mqtt-stick-flashed-antenna-mod-and-printed-case/22). Those came with antenna soldered on, and a nice case.

***NB: I wouldn't recommend this stick any more, the CC253x chips have significant limitations, buy something CC2652 based***

### And so, it begins

Getting the Gledopto reset was a pain, but after a few dozen attempts, it worked. Because I worked on that over a few evenings, I had the time to order a small stack of Xiaomi devices - a bunch of door/window sensors, a _human body sensor_ (motion and light levels), and a temperature and humidity sensor. Those almost all worked as I hoped. The door/window sensors are fantastic, and the temperature and humidity sensor works well. The motion and light sensor... is a good motion sensor, but it only reports light levels when there's motion (and it's not terribly sensitive at lower light levels). I've clearly been spoiled by the Z-Wave multi-sensors. Still, they have their uses.

Still, I ordered a batch more of the door/window sensors, a couple more temperature and humidity sensors, and one of the _wireless switch_ units - a little battery powered button.

I've also started replacing some of the accent lighting with adjustable colour temperature units, which makes a rather pleasant change.  

### Going forwards

I'm likely to stay with both, at least for the next few years. Neither of these are without issues - Z-Wave is relatively expensive, and Zigbee has (for me at least) been slightly less reliable - one device for instance left the mesh when it was power cycled, and refuses to re-join.
