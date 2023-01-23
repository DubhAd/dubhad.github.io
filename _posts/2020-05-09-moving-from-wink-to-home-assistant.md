---
title: Moving from Wink to Home Assistant?
date: '2020-05-09T09:42:00.002+01:00'
tags:
- home assistant core
- home assistant
- wink
modified_time: '2020-05-09T17:29:31.195+01:00'
---

I suspect a number of people are looking at leaving Wink right now, in light of the recent announcement. Some of you will be looking at Home Assistant and wondering what will work (_most of it_), and what you can do.

In reality, this isn't going to be a drop in replacement for the non-technical. You can't buy a piece of hardware to replace your hub and call it done. There's no off the shelf appliance, but there is a tool chest that allows you to build something that does what you want. Yes, you'll have to want to learn to use this, but if you're willing to do that it can be very rewarding.

## Home Assistant itself

Your biggest choice will come down to whether to run Supervised (aka Home Assistant, the install method previously known as Hass.io), or Core (previously known as Home assistant, Docker or native). If your hardware is supported by the [official images](https://www.home-assistant.io/hassio/installation/) then you can use that. Supervised gives you point and click software installs (add-ons) and snapshots (local backups), with Core you have to manage those yourself. There's no differences to the actual automation platform. Supervised is the closest it gets to an "appliance" for the less technical.

I will just say that installing Core directly on Windows has limitations, and if you're doing that you need to be more than just an experienced user of Windows.

Do take the time to [read the documentation](https://home-assistant.io/docs/). There is a lot there, and you don't have to read all of it, but if you read the two _Configuration_ sections, the _Core Objects_, _Automation_, and the _Scripts_ sections you'll be well placed to make use of Home Assistant. If you need help there's a [forum](https://community.home-assistant.io/) and a very active [Discord server](https://discord.gg/c5DvZ4e), both of which are good places to get help.

### Automating

There's now four options for automating your home, assuming that you're doing that and not "just" going for a smart home:

*   [Node Red](https://www.blogger.com/#) is basically a visual editor for automations (flows in Node Red language). You don't need to be technical, you don't need to worry about how to construct service calls, format YAML, or code.
*   Native [automations](https://www.home-assistant.io/docs/automation/) are formatted in YAML, nothing else is required for these to work.
*   If you're a Python programmer, have a look at [AppDaemon](https://appdaemon.readthedocs.io/).
*   If you're a C# programmer, have a look at [NetDaemon](https://netdaemon.xyz/).

The only thing I'd recommend is that you pick one, and be careful if you want to use more than one that you don't create automations that interfere with each other.

### User interfaces

There's a rather nice built in user interface, called [Lovelace](https://www.home-assistant.io/lovelace/), a range of third party interfaces

## Hardware

### Host

You have to [run Home Assistant somewhere](https://www.home-assistant.io/installation/), if you've already got a NAS or home server you can run Home Assistant (Supervised or other) there. Failing that a Raspberry Pi (ideally a 4, but the 3 works fine) or similar will do.

### Zigbee

There are [three Zigbee options]({% post_url 2019-11-17-zigbee-and-home-assistant %}) available, so this is the easiest. Pick one (I'd suggest either zha or Zigbee2MQTT), pick a supported stick (the best one you can afford), and away you go.

### Z-Wave

Z-Wave is almost as easy. There's the existing integration, [Zwave2MQTT](https://github.com/OpenZWave/Zwave2Mqtt), and a new official integration coming soon (quite possibly in 0.110). The existing integration uses the outdated OpenZWave 1.4, the others use the current OZW 1.6. The bright side is that the device pairings are stored on the stick, so you can migrate between integrations.

### Bluetooth

Home Assistant's support for Bluetooth is less complete, there's support for some plant sensors, climate devices, and a few other devices.

### WiFi

This is a large bucket of _maybe_. WiFi is just a signal carrier, some searching of the [integrations list](https://www.home-assistant.io/integrations), or with Google.

### Lutron Clear Connect

If you've got the [Caséta](https://www.home-assistant.io/integrations/lutron_caseta/) hub (or the Pro version) you can connect these to Home Assistant.

## Need help?

There's an official [forum](https://community.home-assistant.io/) and a very active [Discord server](https://discord.gg/c5DvZ4e) where a wide range of people can provide advice and help you understand what's possible, and what isn't.
