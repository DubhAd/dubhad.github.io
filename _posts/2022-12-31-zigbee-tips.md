---
title: Zigbee tips
date: '2022-12-31T14:00:00.000Z'
tags:
- zigbee
- home assistant
toc: true
modified_time: '2022-12-31T14:00:00.000Z'
---

There's a number of things that come up regularly that folks new to Zigbee may not know, so here's a handy set of notes and links.

## TL/DR

*   USB extension cable
*   Avoid WiFi channels (which are numbered differently)
*   Use enough (Zigbee) routers
*   Replace batteries in end devices
*   Pair in place 

## Signal quality

There are a number of things you need to take into account to ensure a usable signal. Don't worry too much about the LQI value, which is a scale of 0 to 255 with higher values being better, different brands calculate it differently. The main thing it's useful to work out if moving a device has improved the connection to the mesh or not, at least as long as the value is relatively stable.

### Interference from the computer

USB 3.0 chipsets are known to [generate interference](https://web.archive.org/web/20210428073944/https://www.intel.com/content/www/us/en/products/docs/io/universal-serial-bus/usb3-frequency-interference-paper.html) with Zigbee. On board WiFi and Bluetooth will also generate interference, indeed the whole computer is a source of RF noise.

The solution here is pretty simple, put the USB stick on an extension cable. It doesn't need to be a long one, but the longer it is the more quality matters. I've used both one meter and 2 meter cables without problems. If you go past 3 meters (with USB 3.0, 5 with USB 2.0) those need to be _active_ cables.

If you're using a USB 3.0 hub ensure you use an extension cable between the hub and the coordinator.

### Interference from WiFi (and Bluetooth)

WiFi, Bluetooth, and Zigbee share the same frequency band. You can, and should, manage this by keeping your WiFi and Zigbee on separate channels - being aware that the channel numbers mean different things. [This article](https://www.metageek.com/training/resources/zigbee-wifi-coexistence.html) explains it well, and you can scan for the WiFi channels in use to help work out what to use:

*   [TI chipset](https://github.com/zigpy/zigpy-znp/blob/dev/TOOLS.md#energy-scan) coordinators
*   [EZSP coordinators](https://pastebin.com/bk1hN0Et)

The TL/DR version is that you're likely best using channels 15, 20, or 25 (or 26 in Europe if all your devices support it). Be aware that some software, like Zigbee2MQTT, default to other channels.

There's not much you can do about Bluetooth, other than physical separation.

Oh, Zigbee Pro and Zigbee 3.0 support sub-GHz ISM bands, but it's almost impossible to find devices that support it so you can largely forget about that.

### Signal strength

The 2.4 GHz band is absorbed by different materials differently. Generally speaking, you can expect the signal to be weakened more by brick, concrete, metal, and water than by, say, plasterboard (aka drywall). This means that you'll have more trouble getting a signal through two concrete walls than two plasterboard walls.

It also means that your house suffers from mobile signal blocking units, known as _people_ and may also suffer the problem known as _pets_. If possible place your coordinator (and any dedicated routers) as high as possible, above head height.

Either way, when you plan where the routers will go you need to account for how the signal will be weakened by the various materials.

Pragmatically you can expect an effective range of about 6 to 8 meters with obstructions - as long as those aren't solid walls (brick/concrete). If they are, then range of one wall is possibly all you'll get.

You may also need to replace the battery in end devices - a dying battery will have a weaker signal. Don't forget that your new device may have come with a battery that's towards the end of its life. If you're having pairing problems, try a fresh battery.

## The Mesh

I [talked about this before]({% post_url 2019-11-17-zigbee-and-home-assistant %}) in much more detail, but your mesh consists of:

*   One (and only one) coordinator (the brains)
*   A number of devices that route traffic (routers)
*   A number of non-router devices, typically battery powered (end devices)

Once you expand beyond a handful of devices in one room you'll need routers. You can buy dedicated devices for that or _most_ mains powered devices will route. The main exceptions are Sengled bulbs and no-neutral switches or dimmers.

## Zigbee 3.0

Before Zigbee 3.0 compliance with the Zigbee specifications was often quite ... relaxed. This resulted in situations where brand X won't route through brand Y. Xiaomi are well know for being [one of those](https://community.hubitat.com/t/xiaomi-aqara-devices-pairing-keeping-them-connected/623) problem brands (at least in their non 3.0 devices), but they're far from alone.

This does mean that you'll want to do a little research to ensure that your potential new device won't have problems with your existing devices, or that the thing you're thinking of buying isn't generally badly behaved.

With Zigbee 3.0 this _should_ have no longer been a problem, but of course that's not entirely the case. While the situation is better, there are still too many problem devices.

## Pairing

Always pair a device in the final location you'll be using it. This serves two purposes. First is that many pre-Zigbee 3.0 end devices won't try to reconnect if they can't reach their parent, or will take many hours to start looking for a new route. The second is that by pairing in place you ensure that you have mesh coverage in that location.

Pair your devices starting with the the routers near the coordinator, spiralling out. This will build the core of your mesh for when you pair your end devices. Once all your mains powered devices are paired, that's when you want to pair your end devices.

### Pairing Xiaomi Zigbee 1.2 devices

Xiaomi's Zigbee 1.2 devices have a slightly odd behaviour - when pairing they connect to the first device they hear from. That may be the device with the worst signal, but they don't care. The best thing to do with these is to use the option to pair via a specific router (or the coordinator).

These devices are also "sticky" - they'll _almost_ never change their route to the network. It does happen, but you can't rely on it.

## Matter and Thread

Yes, there's new technology on the market. No, Zigbee isn't dead, and neither is Z-Wave. Sure, when Matter and Thread do deliver on their promises then it'll make more sense to buy Thread devices than Zigbee devices. That still looks to be somewhere in the future though, and Zigbee devices will still work when that happens.