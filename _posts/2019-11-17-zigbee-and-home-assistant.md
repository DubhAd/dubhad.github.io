---
title: Zigbee (and Home Assistant)
date: '2019-11-17T19:20:00.000Z'
toc: true
tags:
- zigbee
- z-wave
- home assistant
modified_time: '2019-12-08T08:26:47.672Z'
---

So, you're using Home Assistant and want to use [Zigbee](https://zigbee.org/), but Home Assistant's own documentation doesn't really explain Zigbee, so you're a bit confused. What do you need to know?  
  
## What is Zigbee

Zigbee is a wireless communication protocol designed for personal area networks and well suited to home automation. It uses a low power, and low bandwidth, mesh network that allows devices that aren't within direct range of each other to communicate indirectly, via other nodes. Many device that are permanently powered (not battery powered) will help build the mesh (known as routers), though not all will do this (light bulbs particularly are unlikely to be a router). If you don't have enough routers, or you locate these poorly, your mesh will be unreliable.  
  
There is a hard limit of some 65 thousand devices in a single Zigbee network, however it's likely that you'll run into other limitations (including your finances) long before you reach this limit. Practically speaking, there are reports of meshes containing many hundreds of devices that perform well.  
  
The Zibgee standard was improved with Zibgee 3.0 (which is based upon Zigbee Pro), and many Zigbee 3.0 devices will work with a Zigbee 1.2 coordinator. Where possible you should use a Zigbee 3.0 coordinator.  
  
### Compared to Z-Wave

Like Zigbee, Z-Wave is a mesh network. Z-Wave has a much lower device limit (232 devices, which is still enough for a typical home), and a lower bandwidth (100 Kb/s for Z-Wave Plus vs 250 Kb/s for Zigbee, though currently Home Assistant is limited to 40 Kb/s for Z-Wave). That reduced bandwidth will make for a more sluggish, less responsive, experience. However, the frequencies used means that Z-Wave's range between devices in a typical home will be greater.

Z-Wave devices generally cost quite a bit more than similar Zigbee devices, which is because Z-Wave devices have to be certified. That means that you can rely on all Z-Wave devices working together, which historically wasn't the case with Zigbee. The arrival of Zigbee 3.0 though changed that, and getting two unrelated Zigbee devices working together is relatively straightforward (at least if they're Zigbee 3.0).

The other thing to be aware of is that generally Zigbee devices have very little you can do to control how they function. A Zigbee sensor will report based on fixed settings. A Z-Wave sensor will usually have settings you can change to make it more, or less, responsive.

As the saying goes, same, but different. Neither is universally better, but both technologies have advantages, and disadvantages, to be aware of. There's a reason I use both Zigbee and Z-Wave.

### What do you need to use Zigbee

There are 3 basic things you'll need to use Zigbee: a Zigbee integration, a coordinator supported by that integration, and one or more devices.  
  
| Integration | Coordinators | How |
| ---- | ---- | 
| [deCONZ](https://www.home-assistant.io/integrations/deconz) | ConBee/RaspBee | Can run locally or remotely |
| [zha](https://www.home-assistant.io/integrations/zha) | [Various](https://www.home-assistant.io/integrations/zha#known-working-zigbee-radio-modules) | Part of Home Assistant |
| [Zigbee2MQTT](https://www.zigbee2mqtt.io/) | [TI](https://www.zigbee2mqtt.io/guide/adapters/#recommended) | Can run locally or remotely |

### Which to use

[deCONZ](https://www.home-assistant.io/integrations/deconz)  

*   Can run in an [add-on](https://hub.docker.com/r/marthoc/deconz/) for Home Assistant OS, in a [Docker container](https://github.com/marthoc/docker-deconz), and [natively](https://www.dresden-elektronik.de/funk/software/deconz.html)
*   It has its own UI
*   Is relatively stable and mature (but also updates slowly)
*   Known working devices [are documented](https://github.com/dresden-elektronik/deconz-rest-plugin/wiki/Supported-Devices), and how to request support for a new device is [documented too](https://github.com/dresden-elektronik/deconz-rest-plugin/wiki/Request-Device-Support) (you can't add unsupported devices yourself)

[zha](https://www.home-assistant.io/integrations/zha)  

*   Is part of Home Assistant, using the [zigpy stack](https://github.com/zigpy/zigpy). It is updated with Home Assistant
*   Uses Home Assistant for the user interface
*   Is actively developed
*   There is no list of supported devices, as any standards compliant device _should_ work. Devices that require extra support are [listed here](https://github.com/dmulcahey/zha-device-handlers), and adding unsupported devices is [documented](https://github.com/dmulcahey/zha-device-handlers/blob/dev/CONTRIBUTING.md).
  
[Zigbee2MQTT](https://www.zigbee2mqtt.io/)  

*   Can run in an [add-on](https://github.com/danielwelch/hassio-zigbee2mqtt) for Hass.io, in a [Docker container](https://www.zigbee2mqtt.io/information/docker.html), and [natively](https://www.zigbee2mqtt.io/information/virtual_environment.html)
*   It doesn't have a native UI, using MQTT for control and configuration, but there are [third party options](https://github.com/yllibed/Zigbee2MqttAssistant)
*   Is very actively developed
*   The known working devices [are well documented](https://www.zigbee2mqtt.io/information/supported_devices.html) (which usually includes how to pair them so you don't have to find the manual), and adding unsupported devices is [also documented](https://www.zigbee2mqtt.io/how_tos/how_to_support_new_devices.html).

The primary advantage of _zha_ is that it is built in to Home Assistant, and so the simplest to get running. The other integrations allow you to easily place your Zigbee coordinator centrally when your Home Assistant system is located elsewhere, or use that Zigbee system from multiple Home Assistant installs at the same time (for instance from your production and test installs).  
  
I'm using Zigbee2MQTT myself. I was already using MQTT for presence detection, and I expect to be using it for Z-Wave once the OpenZWave 1.6 migration happens. I also worked through the list of supported devices for each option, to find the one that I knew would support the devices I wanted to use. Oh, and Zigbee2MQTT supports Zigbee 3.0.  

### Frequencies

Zigbee 1.2 uses the same 2.4 GHz band as WiFi, and Zigbee 3.0 adds support for the [sub-GHz ISM bands](https://en.wikipedia.org/wiki/Zigbee#Radio_hardware) (which are also used by Z-Wave). This means that you need to consider [WiFi interference](https://www.metageek.com/training/resources/zigbee-wifi-coexistence.html), and if you're using Z-Wave there's potential interference if you're using a device that supports the ISM bands (in reality finding a Zigbee device that supports the ISM bands is incredibly hard).
  
The ISM bands are regional, and if you're buying a device that doesn't support the 2.4 GHz band you'll need to ensure that it supports your region.  

## The Zigbee Mesh

As mentioned above, Zigbee is a mesh network. There are things you can do to help the strength and stability of that mesh, and things you can do that will cause you problems.  

### Channel

Where your integration gives you a choice, ensure that you set up your Zigbee mesh on a channel clear of WiFi. You can install apps on your mobile to allow you to find what channels are in use, and [this article](https://www.metageek.com/training/resources/zigbee-wifi-coexistence.html) to avoid overlap.  

### The Coordinator

Place the coordinator as centrally as possible, avoiding basements, garages, and trying to avoid internal concrete/stone walls, large metal objects (like boilers), and away from any WiFi access point.  
  
Different coordinators behave differently too. Some have a better on board antenna, or support for an external antenna. Newer hardware also tends to perform better, and will make the experience more pleasant.  

### Routers

Most mains powered devices, other than lightbulbs, will act as routers. Add your routers before you add end devices (explained below), starting near the coordinator and working outwards. How many routers you need, and how far they can be from the coordinator, will depend on your coordinator, the total number of devices you're installing,the construction of your building, oh, and interference. [Zigbee2MQTT publishes](https://github.com/Koenkk/Z-Stack-firmware/tree/master/coordinator) how many direct connections each coordinator (and firmware) supports. I haven't seem similar information from others, but it's likely that you'll see similar numbers. Generally you can expect that you'll get about 6 to 12 meters (20 to 40 feet) between devices, but your results may vary.  

### End Devices

This is the name for all the battery powered devices you'll add. These spend much of their time in low power mode, which is why they can't route messages. Always add these where you want to use them, otherwise they'll lose communication with the mesh. Most devices will find a new connection automatically, though it can take up to 24 hours. Xiaomi devices are known to not reconnect automatically, and also don't work with all router devices.  

## Troubleshooting

If you've got connectivity problems, here are a few things to try:  

* Adding a USB extension cable will move your USB stick away from the computer you've connected it to. This can reduce interference, and improve your range.
* Keep it away from [USB 3.0](https://web.archive.org/web/20210428073944/https://www.intel.com/content/www/us/en/products/docs/io/universal-serial-bus/usb3-frequency-interference-paper.html).
* Add an external antenna to your coordinator, and position the antenna away from the computer.
* Ensure that any WiFi router/access point, WiFi USB stick, Z-Wave stick, or RF433 stick are as far away as you can get them (at least one meter if you can). This will also reduce interference.
* Check the WiFi channels in use, to see if your router/access point is now talking over your Zigbee mesh. If so change the channel of the WiFi access point and lock it. If you have to change the channel of your Zigbee mesh then you'll have to re-pair your devices.
* Add more routers between the problem devices and the next nearest router.

If you're still stuck at that point, head over the #zigbee channel on the [Home Assistant Discord server](https://discord.gg/c5DvZ4e), or the [Zigbee section of the forum](https://community.home-assistant.io/c/configuration/zigbee).

## My experiences to date

Zigbee has been generally more responsive, and significantly cheaper, than my Z-Wave setup. It's not been without problems - I bought one smart bulb to try, and it was a major pain to get paired, then fell off the mesh one day and I couldn't get it reconnected.
