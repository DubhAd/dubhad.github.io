---
title: Lovelace - the next generation of stock UI
date: '2018-08-19T15:38:00.000+01:00'
tags:
- dashboards
modified_time: '2018-08-19T15:38:22.255+01:00'
---

_NB: In 2022 Lovelace was renamed to simply Dashboards_

It's been 4 releases of [Lovelace](https://www.home-assistant.io/dashboards/) now, and it's settling in nicely. As of 0.74 you can do anything you can do in the old UI, and more with every release. You can even easily [duplicate your current configuration](https://sharethelove.io/tools/jinja-magic-scripts) courtesy of a community member.

Lovelace is going to replace the current UI. The reason for this is that currently the back end of Home Assistant has to know lots of display things to make the UI work. This adds complexity, and overhead, in the development of Home Assistant.

## Initial thoughts

For those of you who love having a UI to poke and prod, the built in capabilities of Lovelace are pretty good compared to the stock UI. There's a better range of display options (I do like the [glance card](https://www.home-assistant.io/dashboards/glance/) for compact views) and you don't need to keep reloading or restarting to change things. The [entity filter](https://www.home-assistant.io/lovelace/entity-filter/) card is particularly useful for conditional displaying of entities, making for a much cleaner front end.

Then you get to the various picture cards allowing you to create more visually attractive interfaces, and the map card to give you more fine grained views than the default map view.

## Community support

The real power though is coming from the community. [One developer](https://github.com/ciotlosm/custom-lovelace) in particular has produced a number of useful cards, including the massively powerful [monster card](https://github.com/ciotlosm/custom-lovelace/tree/master/monster-card). There's also a [community repository](https://sharethelove.io/) of custom cards.

Building your own custom cards using _just_ the default cards is relatively simple, only when you get into creating totally new card types do you need to know JavaScript.

## My take

If you're new to Home Assistant, don't waste your time learning the current UI. Dive right into Lovelace and save yourself time and pain.

I was able to remove almost all my groups by switching to Lovelace. I went from about 120, to 15. That's some 1,000 lines removed, all of which were just to build the display. Now sure, those 1,000 lines ended up in my Lovelace config instead, but it's no longer bogging down the back end.
