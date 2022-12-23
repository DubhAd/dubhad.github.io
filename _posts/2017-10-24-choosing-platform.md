---
title: Choosing a platform
date: '2017-10-24T19:00:00.000+01:00'
tags:
- platform
modified_time: '2018-01-10T10:04:03.252Z'
---

I'll open with noting that I use [Home Assistant](https://home-assistant.io/), but that doesn't mean you should. Here are some of the things _you_ should be considering when choosing the heart of your new home automation platform.

## Investment

I don't _just_ mean money but also time. Generally speaking (and it is a sweeping generalisation) you'll find that established commercial solutions are likely to require less of your time to set them up and learn how to use them. You'll just have to put more of your money in to get there.

Open source platforms obviously are free, and you'll often find that you can use something as cheap as a Raspberry Pi3 to run them. You're likely to find however that they require more of your time to get them set up and doing what you want.

## Integration

What hardware, and services, do you want to integrate with? Look at the voice control platforms (from commercial solutions, to build your own), the online services, the local hardware, everything. Does it support Zigbee, Z-Wave, RF 433, MQTT, etc etc.

The more it can integrate with, the more flexibility you've got. If all it supports is the manufacturer's own devices, you've got the least flexibility. Generally (again, sweeping generalisation) you're likely to find that open source platforms have the most flexibility, though you'll likely find that commercial solutions have better integration where they support something.

## Flexibility

Beyond what it comes with, what can you to do extend it if there isn't official support. For example, I bought a [LaMetric Time](https://lametric.com/) unit before Home Assistant had any support. Because Home Assistant supports command line scripts for delivering notifications, all I had to do was write a short script that used the [lmnotify](https://libraries.io/pypi/lmnotify) python library.

Does it give you the ability to roll back? If an update breaks things, can you revert to the previous version, or are you now stuck?

Can you take a backup from one system and restore it to a fresh one, or does it require manufacturer intervention? Once you start relying on your home automation system, this is likely to become a critical point.

## Rate of change

Is this a live platform, or abandoned? A slow rate of change is fine on a mature platform, but no change is a bad sign. You need to judge your personal tolerances, is a fortnightly update that requires you to read the release notes carefully fine, or annoying?

## Documentation and community

Good documentation helps you get started, but once you've started, it's the community that helps you do more. If they're active and supportive you'll get further - spend a little time reading their forums and chat rooms, get a feel for it. These are the people you'll be reaching out to if you have problems, so you have to feel comfortable with them.

## Mix together and bake

Now you've got enough information to at least eliminate some options, and prioritise others. Hopefully you'll have multiple options that will meet your needs, and won't leave you stuck in a dead end.
