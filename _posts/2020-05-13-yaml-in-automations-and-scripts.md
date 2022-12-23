---
title: YAML in automations and scripts
date: '2020-05-13T16:46:00.000+01:00'
tags:
- yaml
- home assistant core
- automation
- home assistant
modified_time: '2020-05-13T16:46:01.614+01:00'
---

I see many people struggle with the formatting for automations (and scripts) because the official docs are structured in a manner that assumes you're going to read them in order. So, I thought I'd pull together a little primer. If you're a YAML purist you probably want to look away now, I'm aiming to make this accessible not 100% technically correct.

## YAML (very) basics

YAML largely consists of two things, dictionaries and lists. Dictionaries are the really important piece here, because they hold everything (ultimately). For example:

```yaml
homeassistant:
```

Yup, that's a dictionary. In this case it's empty, but it's a dictionary. Dictionaries can hold other dictionaries, or lists. What's a list? Here's a list example from [the documentation](https://www.home-assistant.io/docs/configuration/basic/):

```yaml
whitelist_external_dirs:  
  - /usr/var/dumping-ground  
  - /tmp
```

That's a list, with two entries (values). Each entry is marked by the hyphen (`-`).

You can also separate list items with commas, like this, but I find that it's often less readable:

```yaml
whitelist_external_dirs: [ /usr/var/dumping-ground, /tmp ]
```

The question that always comes up is when you use a dictionary and when you use a list. The unfortunate answer is that you have to check the documentation. Even more unfortunately, a single entry list doesn't _need_ that - so you'll sometimes see a list written like:

```yaml
whitelist_external_dirs:  
  /usr/var/dumping-ground
```

That is perfectly valid, but you can see why it causes confusion.

Here's a little more from that page:

```yaml
homeassistant:  
  latitude: 32.87336  
  longitude: 117.22743  
  whitelist_external_dirs:  
    - /usr/var/dumping-ground  
    - /tmp
```

That's a dictionary (`homeassistant`) holding:

*   Two dictionaries (`latitude` and `longitude`)
*   One list (`whitelist_external_dirs`)

These are the basic building blocks. If you want more on the subject see [this blog post](http://thomasloven.com/blog/2018/08/YAML-For-Nonprogrammers/).

## Spaces

With YAML, spaces (indenting) are critical. You need to keep your indenting consistent (the advice is generally to use _two spaces_ per level. Oh, and don't use tabs, unless your editor converts them to spaces. Tabs cause Home Assistant to spit out errors too. Here's an example with broken indenting that I've seen people try to use:

```yaml
automation:  
  - alias: "My test automation"  
      id: "unique_value_42"  
      initial_state: "on"
    trigger:  
      - platform: state  
        entity_id:   
         - switch.furnace
          - switch.extractor
```

Here is how it should look:

```yaml
automation:  
  - alias: "My test automation"  
    id: "unique_value_42"  
    initial_state: "on"  
    trigger:  
      - platform: state  
        entity_id:   
          - switch.furnace  
          - switch.extractor
```

Running a configuration check will warn you when the YAML is invalid, and it's something you should do any time you write any YAML. 

## Quoting

You don't _have_ to quote things in YAML, but for strings (text) you should or the result may be unexpected. What do I mean? Well `"On"` is a string, but `On` is a boolean value. These things to humans look the same, but to the computer they're different. Similarly if you have a number, like `42`, that's a number, but if you put it in quotes, like `"42"`, then that's a string. 

When you need to use multiple quotes on a line, then you need to use different ones for the outer quotes than the inner quotes, like:

```yaml
automation:  
  - alias: "Tom's alarm is ringing"
```

This becomes particularly important if you're using templates.

## Case sensitivity

You also need to keep in mind that computers don't treat capital letters the same as lower case letters. The string `"home"` is different to the computer from `"Home"`, so you need to be sure which it is you're looking for.

## States

The state you see in Home Assistant's user interface may not be the actual state. You need to look at the entity in _Developer Tools_ and then [_States_](https://my.home-assistant.io/redirect/developer_states/) to see the actual state of the entity. For example, a door/window sensor will show as _Open_ or _Closed_ in the user interface, but is actually `'on'` and `'off'`.

# Automation Structure

An automation has four parts

1.  Information about the automation
2.  Trigger
3.  Condition (optional)
4.  Action

## About the automation

There are up to three things you'll have here. 

1.  The first is the alias, the human readable name. This will typically be used to form the entity_id of the automation.
2.  Optionally there's an id. This is used by the automation editor and if present is used to form the entity_id (instead of the alias).
3.  Finally there's an optional initial_state. This is used to force the automation to be enabled or disabled at startup.

```yaml
automation:  
  - alias: "My test automation"  
    id: "unique_value_42"  
    initial_state: "on"
```

The automation is a list entry, in the automation dictionary.

## Trigger

This is the bit that kicks it all off, your list of triggers. When _any_ trigger statement _becomes true_ then the processing begins. You have to have at least one trigger, and you can have as many as you need. It's worth taking the time now to [read the triggers page](https://www.home-assistant.io/docs/automation/trigger/), and see what's possible (and what causes a trigger to become true). Here's a simple one:

```yaml
    trigger:  
      - platform: state  
        entity_id: device_tracker.tinkerer  
        to: 'home'
```

I've used the list indicator here, even though I only have one trigger. This is to make it clearer that triggers are a list. This will trigger when `device_tracker.tinkerer` becomes `'home'`. Here is a more complex one:

```yaml
    trigger:  
      - platform: state  
        entity_id: device_tracker.tinkerer  
        to: 'home'  
      - platform: state  
        entity_id: device_tracker.better_half  
        to: 'home'
```

Two triggers - here the automation will start processing if either `device_tracker.tinkerer` or `device_tracker.better_half` become `'home'`. Since both are looking for the same target state, I could have written the more compact version: 

```yaml
    trigger:  
      - platform: state  
        entity_id:   
          - device_tracker.tinkerer  
          - device_tracker.better_half  
        to: 'home'
```

I prefer this, partly because it's more compact, but also because it's much easier to read.

## Conditions

Conditions are optional - you don't need any if your automation doesn't call for one.

All the conditions in the list have to be _currently_ true for the automation to run. There are [many available conditions](https://www.home-assistant.io/docs/scripts/conditions/), including some that allow you to say that _this or that_ must be true. Conditions are particularly useful when you have multiple triggers, and want them all to be true for the automation to run. With conditions however you have to list each separately, you can't combine them like we did for triggers:

```yaml
    condition:  
      - condition: state  
        entity_id: device_tracker.tinkerer  
        state: 'home'  
      - condition: state  
        entity_id: device_tracker.better_half  
        state: 'home'
```

Here we require that both device trackers are _currently_ in the state `'home'`. If the automation is triggered by me arriving home, while the wife is still away, then one condition will be false, and the automation won't run.

## Actions

This is where things happen. Actions are [basically scripts](https://www.home-assistant.io/docs/scripts/) - a list of actions to take in sequence. That means you can call services (do things), check conditions, pause for a fixed time (`delay`) or until a [template](https://www.home-assistant.io/docs/configuration/templating/) becomes true (`wait_template`), or send events. You have at least one, and potentially _many_ actions. If any step fails (or returns false) then the automation stops at that point. This is handy for condition checks, and not so handy at other times.

With a service call you can generally give one, or many, entities, for example:

```yaml
    action:  
      - service: switch.turn_on  
        entity_id:   
          - switch.furnace  
          - switch.extractor  
      - condition: state  
        entity_id: sun.sun  
        state: 'below_horizon'  
      - service: light.turn_on  
        data:  
          entity_id: light.basement, light.stairwell
```

Here I've shown the two different ways of listing multiple entities - I prefer the first method. You'll see that one of these has a data block, and one doesn't. Generally speaking, you need a data block where you're providing more than just an `entity_id`, but it's best to simply follow what's in the documentation.

This particular action block will turn on two switches, and then only if the state of `sun.sun` is `'below_horizon'` will it turn on the two lights.
