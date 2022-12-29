---
title: Home Assistant - the Hass.io menu is missing
date: '2018-02-15T15:16:00.000Z'
tags:
- hass.io
- home assistant
- add-ons
modified_time: '2018-03-03T11:34:27.560Z'
---

_NB: Since writing this a lot has changed, I'm leaving this for historical reasons, but the information here is terribly outdated._

Well, they've updated the supervisor in Hass.io (now called Home Assistant OS) and the shopping bag is gone, the functionality has been moved inside the Hass.io menu. This post has been updated accordingly.

So, you've installed Home Assistant and are working through the [getting started](https://home-assistant.io/getting-started/) guide, when you run into a problem.

The Hass.io menu is missing, there's no way of getting to the add-on store. You can't install any add-ons, but the guide says you should be able to.

Well, the answer is that the getting started guide is **very heavily focused** on Hass.io as an install method, and you used another install method for Home Assistant.

## Hass.io

Hass.io is just a way of [installing Home Assistant](https://home-assistant.io/installation/), one that is based on ResinOS. It brings some extra features (I'll touch on those in a moment) and it also introduces some challenges.

Not all components work as expected on Hass.io, since the _container_ that Home Assistant runs in (which is not the container you connect to when you SSH to the host) is stripped down. Almost everything works, but some wont - and most of those are marked in the documentation.

## Don't panic!

You're missing two things:

* Snapshots
* Add-ons

Snapshots are just local backups. I've [previously covered backups]({% post_url 2017-10-23-backing-up-home-assistant %}) - and off host backups are _far_ better than on-host backups. Add-ons are intended as an easy way of installing a package, designed to make it less complicated. They do nothing you can't do manually yourself, though you may need to read some fine documentation.

## Remember where we parked you are

Any time you're looking at Home Assistant documentation under `/hassio` or `/addons`, or see a reference to the three dots menu, or the add-ons - these are Hass.io specific. If you didn't install Hass.io then those things won't work for you.

That's not a problem, it's just a thing to keep in mind. There's no right, or wrong, way to install Home Assistant - just choices to make that then shape how you'll approach things.
