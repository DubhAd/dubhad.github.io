---
title: Home Assistant Voice Preview Edition - First thoughts
date: '2025-01-06T10:07:00.000+00:00'
tags:
- voice
- home-assistant
modified_time: '2025-01-06T10:07:00.000+00:00'
toc: true
---

I ordered a Voice PE unit from [EverythingSmart](https://shop.everythingsmart.io/products/home-assistant-voice-preview-edition) when they announced the release and got it set up over the holidays. I didn't get an early access unit, and I wasn't part of the pre-release testing, so this is all based on the released hardware and firmware.

I'm going to be quite picky. I know this is a preview, but that doesn't mean people should be unaware of the rough edges - particularly as many will tout this as a replacement for Google/Alexa.

TL/DR: It has issues, but it really shows the potential for a voice assistant with privacy.

## Initial thoughts

I love this little touch in the box design:

![box](/assets/images/2025-01/voice_pe_box.png)

Having the cut-out match the HA logo is such a wonderful hint that the rest of the design will be similarly well thought out. My only minor complaint is that they didn't use the HA blue, but an orange. I'm sure getting the blue right on cardboard would have been a nightmare though.

I do appreciate the environmental considerations. The package is all cardboard, and so easily recyclable, and there's no cables or power supplies included, which would only get tossed in a drawer.

Having taken it out of the box, it feels a bit light. I know weight isn't a correlator for quality, but at the same time a certain heft does feel better, and it can stop things sliding across the desk when touched. Couple that with the lack of grip on the four small feet and theres a good chance this will slide around a bit when people interact with it physically.
 
I don't know why, but I'd also expected it to be smaller, not nearly the same size as a Google Home Mini:

![comparison](/assets/images/2025-01/voice_pe_size.png)

That's not a negative (or a positive), just an observation.

## Setup

Setup was exactly [as documented](https://voice-pe.home-assistant.io/getting-started/). It only took a few minutes and I was up and running.

## In use

I run HA in Docker, on an AMD Ryzen 5 5560U. That's a [fairly beefy](https://www.cpubenchmark.net/cpu.php?cpu=AMD+Ryzen+5+5560U&id=4883) processor so I'd been quite hopeful about how this would perform.

Unfortunately in reality it's not really beefy enough, even for the simple things. Trying to do this locally on any model of Pi is likely to be painful.

Ask it to turn on or off the lights and it takes about 4 seconds from the end of my spoken request to the light turning on/off. That's just over twice what Google Home takes. Still relatively acceptable, but not exactly snappy.

Most other simple commands take about the same time (when they work). A timer will take about 4 seconds too. Complex commands, like asking the time, take a more random amount of time. It might respond within 5 seconds, or it might be (literally) 25 seconds. Sometimes though a query will get a failure response (eg _I couldn't check the status of the Master bedroom door_) only to respond with the correct status if you ask again.

There's also the problem that others have reported - it doesn't always hear you. I'm currently sat directly in front of it, unobstructed, about 75cm (30 inches) from it with no background noise of note (the laptop's fans are audible, but pretty quiet and they're 50cm off to the side). It'll always always catch me if I'm clear about my wake word, but sometimes even when clearly spoken directly at it it'll still miss.

The built in speaker is underwhelming, below the capabilities of a Google Home Mini. Having it on the front face is not ideal as on a cluttered desk it risks being obstructed. That said, with the control dial and button on top it's not like there's any better options. You can wire it to another speaker, though it's a shame I can't have the audio output sent to my Sonos speaker instead.

I do like the side mounted microphone switch, though it takes quite a firm action to use it. This does mean that it won't get switched by accident, but at the same time with such a light unit it makes it a less than simple action to do with one hand. I did notice that when I mute the microphone the red light nearest the switch flickers occasionally, which is weird (and distracting). What's really nice though is that I can control the microphone mute from HA, so I can turn off detection when I'm (say) in a meeting (automations [here](https://github.com/DubhAd/Home-AssistantConfig/blob/live/automation/office/office_meeting_started.yaml) and [here](https://github.com/DubhAd/Home-AssistantConfig/blob/live/automation/office/office_meeting_ended.yaml)).

Timers, and stopping them, works well enough - though I'm amused that HA's [own docs](https://www.home-assistant.io/voice_control/builtin_sentences/#timers) refers to _63 minutes_ as "a technical term" and to be avoided. Given how often something like _90 minutes_ will be used by native speakers that's a bit of an oversight, though despite the docs it seems to work fine. I do agree with people who said that it's a shame the timers don't show up in Home Assistant.

Asking it where people are is very hit and miss. I asked it where I was, and I got told _Tinkerer is at_. That's it, I'm at ... silence. The next time it admitted I was at home. Asking about others who're away simply results in _away_ rather than _where_ they are. Thankfully I already have some `input_text` entities that say where people are (the name of the zone, or where they're near if not in a zone - courtesy of the custom [places](https://github.com/custom-components/places) integration), and it's happy to supply those states when those are exposed rather than the `person` entities. 

It also doesn't (yet?) support things like room temperatures (though it will if there's a `climate` device), and while it can tell me if any specific door is open or closed, asking it which doors are open (or closed) results in _not any_ (update 2025-01-07: it turns out this is [deliberate behaviour](https://github.com/home-assistant/intents/pull/2835) and unlikely to change). It's also annoying that HA knows if a `binary_sensor` is a door or a window, but we've got to name things with `door` and `window` for Assist to know.

## Closing thoughts

Ok, I've bashed it a fair bit above. It's living up (or down) to the _preview_ tag. That said, this shows the potential that's there. Sure, the hardware isn't perfect, but it's not _that_ far off of being good enough and it doesn't need to be perfect (it's not like the commercial competition is). The software needs some work, and decent hardware to back it, but I've got complete confidence that the team behind this will continue to improve Assist. Just look at how far Home Assistant itself has come, and all the "little" performance improvements they squeeze out of the system.

I don't think I'll be replacing my Google Home devices in a hurry. I also think that in another 6 months that position may well change - partly down to improvements to Assist, and partly because of new hardware (like the [Satellite1 from Future Proof Homes](https://futureproofhomes.net/)).
