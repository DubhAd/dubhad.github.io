---
title: Why Home Assistant?
date: '2018-01-11T15:00:00.000Z'
tags:
- platform
- home assistant
- openhab
modified_time: '2018-01-14T22:03:12.347Z'
---

I said [a while back](/choosing-platform/) that I use [Home Assistant](https://home-assistant.io/), but I didn't really say why.  

## Exploring the market

I spent a few months looking at a number of open source platforms, and I only found one other actively developed comparable platform ([OpenHAB](https://www.openhab.org/)). The others were either abandoned, atrophying, or all the documentation was in something other than English (sadly, my language skills are terrible).  
  
I'd also been looking at commercial offerings (primarily Vera, Zipabox, Fibaro, and HomeSeer). There were various reasons I ruled those out, from platform cost, to the challenge getting them to work with other manufacturer's devices, to stability and reliability issues.  
  
Which after 6 or so months of reading brought me, at the beginning of 2017, back to Home Assistant and OpenHAB.  
  
At the time OpenHAB were about to launch of 2.0, and it looked like "interesting times". What I saw, and was being promised, looked good, but 1.x looked like the more reliable bet at the time.  
  
Home Assistant was on the clearly still very early 0.36, a version number that just screamed _pre alpha_.  

## Making a choice

A year later and it'd have been a much harder choice, there are things that OpenHAB does better than Home Assistant (and vice versa obviously). OpenHAB's persistence component for example is a thing that Home Assistant badly needs.  
  
Then though it was a choice between a platform that was pushing updates fortnightly (_move fast and break things_, but without much breaking) and one that was slow moving but about to go through a major step change.  
  
This is where my background played a key role - I've been working in IT in a wide range of fields for years, including many years as a system administrator. I'm at home on the command line, wading through logs to diagnose issues. The rapidly moving nature Home Assistant wasn't off putting, and the community was vibrant.  
  
Also, I was quite happy to try out Home Assistant and if I decide I'd made a mistake to start again with OpenHAB.  

## Looking back

I still think I made the right decision overall. Home Assistant is moving fast, new features turn up all the time. When things break, the fix is usually pretty quick in arriving. OpenHAB 2.0 is on a much slower rate of change - it looks to have a smaller developer community. Not all of what I can do (and integrate with) would be possible in OpenHAB.

Home Assistant isn't perfect, no platform (no anything) is. However, it is more than good enough. My biggest gripe would be about OpenZWave, it's too long between releases (and it does sometimes crash on startup, apparently having issues with it's own cache file). That's not Home Assistant's fault though.
