---
title: What's the point?
date: '2017-10-23T12:30:00.000+01:00'
tags:
- home automation
modified_time: '2017-10-23T12:30:14.906+01:00'
---

So many people I come across who're exploring home automation seem to be wanting to build big complex dashboards that they can use to control things from. Clearly they're overlooking the second word - automation.  
  
The point of any home automation system should be to simplify, not complicate. Why replace a simple action like flicking a light switch with having to open an app or web page and then push a button? Sure, it's handy to be able to turn the light on or off from your device, but it shouldn't replace it.  

## Simplify, and don't surprise.

The goal of home automation should be to make life simpler. Taking one action that then results in many actions, or have the system take actions automatically so that you don't have to. If you _have_ to reach for a computer, or a tablet, or a phone, to make something happen, then think about it. How would a guest do that?  
  
That's not to say that such interfaces don't have their place. Home Assistant has [Floorplan](https://github.com/pkozul/ha-floorplan), and [HA Dashboard](http://appdaemon.readthedocs.io/en/latest/DASHBOARD_INSTALL.html). HA Dashboard was designed as a simple finger friendly interface, ideal for wall mounted tablets or similar, and it serves that role rather nicely. Floorplan was designed more for providing an overview of the state of your home, but people have also used it to create those finger friendly interfaces - a testament to its flexibility.  
  
Voice control also has its place, but it's still early for voice control, and you have to know what works, and how to use it, so far from intuitive.  
  
Most importantly, follow [POLA](https://en.wikipedia.org/wiki/Principle_of_least_astonishment). For example, lights switches should look like light switches, and turn lights on and off. If you're relying on people knowing to not turn off that light switch, because the bulb is a smart bulb, well, that's not going to work.
