---
title: Backing up Hass.io
date: '2017-11-03T22:01:00.000Z'
tags:
- backup
- hass.io
- home assistant os
modified_time: '2018-01-10T10:04:25.833Z'
---

> Note: When originally written there was no native backup for Home Assistant OS (Hass.io as it was then). Things have come a long way since and there are built in snapshots (called backups) and many add-ons that provide functionality for copying those snapshots to a remote destination.

I've already talked in general about [backing up Home Assistant]({% post_url 2017-10-23-backing-up-home-assistant %}), but for Hass.io the process is slightly different.  
  
The problem is that there's no easy access to local USB drives, and the stock SSH add-on doesn't have rsync. The solution comes in the form of an [upgraded SSH add-on](https://github.com/hassio-addons/repository) from Frenck.  
  
If you've installed the stock add-on, remove it before installing Frenck's - or install Frenck's and configure it to use a different port. Having done that, follow the original guide to [using a remote computer](/backup-up-home-assistant/).  
  
Unfortunately, yes, you'll need to use a remote system to back it up. At this point there's no way around that, but I'm fairly confident that if you watch [Frenck's repository](https://github.com/hassio-addons/repository) that'll change.
