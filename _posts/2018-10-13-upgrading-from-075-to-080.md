---
title: Upgrading from 0.75 to 0.80
date: '2018-10-13T18:10:00.000+01:00'
tags:
- home assistant
modified_time: '2018-10-13T18:10:18.766+01:00'
---

Today I finally upgraded from 0.75.3 to one of the versions with the new auth, 0.80.0 in this case. I'd delayed the upgrade because I expected some challenges with the new authentication interacting with my NGINX setup. Before I began, I checked the backups, cloned the venv and took a snapshot of the config directory. That way if anything went wrong I could be back up and running in a few minutes.  

### Timeline (minutes)

00:00 - Stop Home Assistant  
00:02 - Home Assistant finally stops  
00:03 - Upgrade command issued  
00:14 - Upgrade command finishes  
  
00:14 - Start Home Assistant  
00:17 - Database upgrade starts  
00:17 - Database upgrade completes, the advantage of only keeping a few days of data (135 MB)  
00:20 - Upgrade of OZW starts, long compile delay ahead  
00:30 - Upgrade of OZW completes, but numpy starts now  
00:44 - Upgrade of numpy completes  
00:47 - Home Assistant finishes the first nmap scan and takes a nap  
00:49 - Home Assistant wakes up from the nap and finishes startup, just OZW to go  
00:50 - It comes as no shock that OZW crashes Home Assistant on startup, a problem with the cache file it created  
  
00:52 - Having restored a known good backup of the cache, Home Assistant is started again  
00:52 - After the nmap scan, Home Assistant naps again  
00:54 - Home Assistant wakes and finishes the startup, just OZW to go again  
00:56 - OZW behaved this time, the mesh is set up  
00:58 - Set up a user for the proxy server  
00:59 - NGINX updated to insert the Bearer token and restarted  
01:00 - And we're done  

### Why the long time

What took so long? Well, there's two things at the heart of this (three if you include OpenZWave crashing Home Assistant):  

1.  I'm running Python 3.6, not Python 3.5 that Home Assistant is developed on and is supported by PiWheels. That means I need to compile packages, which on a Pi is sloooooooow.
2.  The I/O bandwidth on the Pi for the SD card is low

If I'd been on Python 3.5 then we'd have saved at least 24 minutes out of that, likely more. If I'd been running on a USB connected SSD then more time would have been saved. This though is pretty much a worst case upgrade time, so a useful benchmark for others.
