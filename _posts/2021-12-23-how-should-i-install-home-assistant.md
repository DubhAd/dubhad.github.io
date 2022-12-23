---
title: How should I install Home Assistant?
date: '2021-12-23T16:24:00.000Z'
tags:
modified_time: '2021-12-23T16:24:00.506Z'
---

 I see a lot of people confused by the four install options for Home Assistant.

The first, and most important, thing to realise is that Home Assistant is the same no matter how you install it. The only thing that changes is how you install other software, and how you do backups.

That said, here's my summary of the options:

## Home Assistant OS

The "easy" install option. You don't need any real experience or knowledge of Linux, or Docker. Add-ons allow you to install and configure other software through the UI. There's a built in facility for snapshotting the system (called backups, but IMO they're not backups until they're off the host).

You can run it in a virtual machine or install it directly on supported hardware.

TL/DR: _Easy button_

## Home Assistant Container

Native Docker installs, though only on Linux since neither Windows or Mac support the required host networking.

If you want to install other software then it's up to you to do that yourself and you're also responsible for your own backups.

You need to know (or learn) a little Docker to run this method effectively, but you don't need to be an expert.

TL/DR: _You want more control_

## Home Assistant Core

Yes, an install method named the same as the underlying software. This is the simplest install method, where you run pip install on Linux, BSD, Windows, Mac, and probably other things.

The downside is that you'll be installing Python from source every other year (assuming your OS upgrades bring you every other major Python version). You need to be comfortable doing that and troubleshooting problems that come from build issues.

TL/DR: _You and Unix/Linux have been deep friends for a long time, installing from source is easy_

## Home Assistant Supervised

This is basically the same as Home Assistant OS, but you bring (and manage) your own OS - specifically the current version of Debian to [very specific requirements](https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md). You'll have to keep the OS updated, and apply any changes or updates specified by the requirements, which change from time to time.

Those requirements also include _not_ installing any other containers or software beyond those specified. If you don't follow the requirements then the Supervisor will throw an _Unsupported_ warning and may disable functionality.

To use this method safely the developers recommend that you're an expert in both Linux and Docker.

TL/DR: _You don't want to do things the easy way and like to make life harder for yourself_

## Summary

As you probably guessed, I really don't recommend Supervised. There's very few situations where it makes sense. You're either going to be better off running OS in a virtual machine or native Docker with the Container method.

Similarly if Container is an option I'd recommend that over Core. There's very few cases where running Core instead of Container (at least on Linux) makes sense.
