---
title: It's not about the brand
date: '2018-04-15T11:59:00.000+01:00'
tags:
- learning
- automation
- home assistant
modified_time: '2018-08-16T15:17:44.491+01:00'
---

A question that comes up regularly with people new to HA seems to be _what brand of kit should I buy to use with Home Assistant._ That's the wrong question to ask at the start. The question you should be asking is _what problems am I trying to solve_.

Now yes, you'll want to stay with the [supported components](https://www.home-assistant.io/integrations/), but your choice of kit is largely secondary.

Your best starting point is to look at what you've already got that you can use, and built some initial automations around those. Learn how Home Assistant works, read [the documentation](https://www.home-assistant.io/docs/) (the section on _Core objects_ explains how it behaves internally and is well worth reading), and experiment a bit.

## Making a list

Once you've got a feel for the platform, now you want to start assembling your lists of things you want to automate, the things that frustrate you, and the little things that might make life easier. For example, here's part of my lists:

* Have some lights in the garden
* Lights that come on when the room gets dark, and off when the room gets light
* Turning on the bathroom fan when the humidity increases, and off when it's back to normal
* Reminding us about the recycling collection
* Have the light by the house number come on when it's dark
* Play music in the home office if I'm working from home

## The plan

Now pick one of those, and look at what you'll need to make it happen. The first on that list was the one I tackled first, and my list broke down as:

* LED rope light. The shape of the garden means we need either lots of individual lights, or a rope light
* Some way of controlling it such as a smart socket
* Some way of controlling the smart socket manually, ideally that looked like a wall switch
* Some form of door sensor

As you'll know if you've looked at my GitHub, you'll see that I ended up with a Z-Wave socket, and a Z-Wave remote initially. That gave me manual control of the lights, and allowed me to bypass Home Assistant by directly associating the socket with the remote.

Then I added a door sensor, so that I could turn on the lights automatically if we opened the garden door, and off when we closed it (but not if we just opened the door briefly to let the dog out). The door sensor didn't have to be Z-Wave, because it's all handled by Home Assistant.

## The Message

The key thing here is - none of this so far has been about brand of kit. Heck, it's not even been about the communication protocol. The great thing about Home Assistant is that _it doesn't matter_. You'll be using Home Assistant as the hub for all of this after all.
