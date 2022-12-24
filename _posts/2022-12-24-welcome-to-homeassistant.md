---
title: Welcome to Home Assistant
date: '2022-12-24T15:00:00.000Z'
tags:
- home assistant
modified_time: '2022-12-24T15:00:00.000Z'
published: false
---

You've installed Home Assistant, looked at the wall of documents, viewed a few (horribly out of date) YouTube videos, and are overwhelmed.  
  
Where do you begin? What do you need to know?  

## In the beginning

Home Assistant is an [event system](https://www.home-assistant.io/docs/configuration/events/) - things happen, and those generate events. If a sensor reads a new value, that's an event. The time changes, that's an event. Of course, that's all well and good for what _is happening_, not what has happened. For that, Home Assistant uses [state objects](https://www.home-assistant.io/docs/configuration/state_object/), and those state objects are associated with an entity. Those entities are unique (so there can only be one called `sensor.flood`), and are used in your automations, scripts, scenes, etc.  
  
So what?  
  
Well, when you're writing [that automation](https://www.home-assistant.io/docs/automation/), triggers fire based off of events (though you can use states to check the previous value too), and conditions use states. Triggers are for _this just happened_ and conditions for _this is currently true_.  
  
This is why triggers are _always_ or statements - only one trigger has to be true. Conditions can be either and statements or or statements, because they're checking historical information.  
  
Keep that in mind as you [write your automations]({% post_url 2018-08-18-triggers-and-conditions-and-actions-oh %}).  

## Entities

That entity (`sensor.flood`) we mentioned consists of two parts, the platform (`sensor`) and the name (`flood`). Sometimes you'll see the platform referred to as the domain.  
  
Entities are unique, and entities are lower case. If you define a sensor that you think will be `sensor.Front_door` then instead you'll find it as `sensor.front_door`. It's that entity ID that you'll use in automations, and templates, and everywhere else.  
  
You can also give entities a _friendly name_ for the UI. That's just for your convenience and you can call every entity in your system _Fred_ should you want to.

## Devices

Devices are collections of related entities. You can use them in triggers, conditions, and actions much like you would use entities. 

They are a lot simpler than entities though, and you're limited in what you can do with them. While convenient, you'll find that the real power and flexibility lies with the entities.

## Configuration file format

The [configuration](https://www.home-assistant.io/docs/configuration/) file uses [YAML](https://www.home-assistant.io/docs/configuration/yaml/). YAML can be [hard to learn](https://learnxinyminutes.com/docs/yaml/) at first, but it's basically really a really simple format:

```yaml
header: # This is a comment
  sub:
    key: value
    other: list, of, values
    another:
      - list
      - of
      - values
  sub2:
    key: value
```
or:  

```yaml
header2:
  - name: myThing
    key: value
    other: list, of, values
    another:
      - list
      - of
      - values
  - name: other_thing
    key: value2
    other: list, of, values
    word: another
```

The first is the format, called a _dictionary_, is used by [alert](https://www.home-assistant.io/integrations/alert/), [group](https://www.home-assistant.io/integrations/group/), [input\_boolean](https://www.home-assistant.io/integrations/input_boolean/), [input\_select](https://www.home-assistant.io/integrations/input_select/), [input\_text](https://www.home-assistant.io/integrations/input_text/), [input\_number](https://www.home-assistant.io/integrations/input_number/), [input\_datetime](https://www.home-assistant.io/integrations/input_datetime/), and [intents](https://www.home-assistant.io/integrations/intent_script/) (and probably a few others I've forgotten). The other, called a _list_, is used by most things, like [automations](https://www.home-assistant.io/docs/automation/), [sensors](https://www.home-assistant.io/integrations/sensor/), etc etc.  
  
Any header must only appear once. You can't have two `sensor:` lines (outside of packages). If you really want more then you have to add something to make it unique - for example the second might be `sensor two:` or `sensor front_door:`. The thing you add doesn't matter, it's not used anywhere, it just has to be unique.  
  
The only other important thing to know is how to indent. Don't use the tab key, and be consistent with the number of spaces you use per indent. Two spaces per indent level are the standard advised, but if you want to use three, or four, or one, that's up to you. The problem of course is that it makes it much harder to include other's work if you don't use two.  

The good news in all this though is that you can do a lot without ever touching YAML. You'll want to dive into YAML to unlock the full capabilities of Home Assistant (particularly [templating](https://www.home-assistant.io/docs/configuration/templating/)), but you don't need to dive into it immediately.

## Expanding the capabilities

[Integrations](https://www.home-assistant.io/integrations/) are where the flexibility, and complexity, of Home Assistant arrives. At the time I wrote this there were 61 sections, containing 2,371 integrations, plus a whole host of unofficial custom integrations.  
  
Integrations belong to a platform (or domain). Those platforms are things like `switch`, or `sensor`, or `device_tracker`. You add the component under a header for that platform, and the entities created will start with that platform. There are a few (those in the [other category](https://www.home-assistant.io/integrations/#other)) are their own platform.  
  
For example, here's the [random](https://www.home-assistant.io/integrations/sensor.random/) component for the [sensor](https://www.home-assistant.io/integrations/sensor/) platform:  

```yaml
sensor:
  - platform: random
    name: rainbow
```

Now we'll have an entity called `sensor.rainbow` that we can use in automations. If we want another random sensor, we'll need to give it another name (or let the system handle it for us).  
  
Custom integrations have one problem though. They're not always updated to account for the changes in Home Assistant, so sometimes you'll upgrade Home Assistant and then things go wrong. If that happens to you, disable any custom integrations and see if that fixes your problems.

## What next?

Read the documention. Join the forum, Discord, Reddit, or any number of other communities and read their pinned messages. Ask _good_ questions and be prepared for people to ask you a lot of questions back. Don't get stuck in the [XY problem]{% post_url 2018-08-16-the-xy-problem %} - remember to focus on your goal.