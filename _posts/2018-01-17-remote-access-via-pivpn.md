---
title: Remote access via PiVPN
date: '2018-01-17T08:00:00.000Z'
tags:
- remote access
- openvpn
- pivpn
- home assistant
- vpn
modified_time: '2018-01-17T08:00:24.776Z'
---

I've already talked about [setting up remote access](/remote-access-for-home-assistant-and/), and [configuring SSL certificates](/letsencrypt-with-home-assistant/) for Home Assistant. What though if you're not using cloud services, and just want to be able to interact with Home Assistant (or anything else on your network) while you're away. Or maybe just avoid having the owner of the coffee shop being able to see your traffic?

The answer is a VPN, but traditionally they've been a bit of pain to set up. Thankfully [PiVPN](http://www.pivpn.io/) has provided a simple, free, option (and you don't even need to have a Pi to use it).

## Before you begin

You need four things

1.  A dynamic DNS hostname that you update automatically (see [this guide](/remote-access-for-home-assistant-and/) if you've not got one)
2.  A (UDP) port forwarded to your new VPN server
3.  A computer running some type of Linux to run PiVPN on
4.  Devices that can run the OpenVPN client

I'm going to assume that you can read the other guide to sort out the first two

## Install PiVPN

If you're running Docker, take the simple step and [use this](https://github.com/InnovativeInventor/docker-pivpn). Otherwise follow the instructions at the [PiVPN site](http://www.pivpn.io/).

## Set up PiVPN

The defaults are mostly sensible, and the most complicated step will be ensuring that your system has a fixed IP on your network.

Change:

* The port number - pick something higher, up to 65535. It doesn't add real security, but it makes it less likely that somebody who's scanning the Internet for OpenVPN servers finds yours.
* The address clients use to your dynamic DNS hostname.
* If you run your own DNS servers, select these here, otherwise pick whichever works for you.

Reboot, and you're done with the server set up.

## Client configuration

Install your choice of OpenVPN client on your device. I like the official clients, but there are other choices for most platforms.

Every device you're using should have it's own certificate and configuration file. Setting these up requires that you run

```bash
pivpn add
```

Then answer some two questions:

* Give it a unique name that allows you to identify it
* Provide a pass phrase. Optional - you can just hit enter, and then the device can connect automatically with just the certificate and configuration. If you do that though, do secure the device with encryption and an automatic lock (and something other than face or pattern to unlock).

It'll then tell you what it called the configuration file, and where it is.

Copy this configuration to your device. How you do this depends on whether you're using Windows, Linux, Android, iOS etc. On Android for instance you can copy the file to your phone and then use the option in the client to _Import Profile from SD card_. If you're using iOS then you have to use iTunes to sync the configuration across.

Now, if you're using a mobile device, disconnect from WiFi and test it out. It should connect in a few seconds, at which point you're now up and running.

If you're on Android, and a Tasker user, see [this blog post](https://collinmbarrett.com/android-tasker-openvpn/) on having Tasker manage the VPN connection. If you're on Android 8 (Oreo) then the official OpenVPN client registers in the system VPN panel, and you can configure it to be always on there.
