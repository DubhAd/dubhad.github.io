---
title: Running an automation every time a sensor updates
date: '2021-08-05T21:33:00.000+01:00'
tags:
- automation
- home assistant
modified_time: '2021-08-05T21:33:44.669+01:00'
---

What follows is no longer needed since HA now has a new feature of the [state trigger](https://www.home-assistant.io/docs/automation/trigger/#state-trigger):

```yaml
trigger:
- platform: state
  entity_id: sensor.your_sensor
  to: ~
```

I will leave this for posterity though.

---

A common question on the HA Discord is how to have an automation run any time a sensor updates. The answer is both simple (it's covered in the official documentation), and not (because there's traps).

Here I'll quickly cover how to have that work the way you expect it.

## Trigger

A simple [state trigger](https://www.home-assistant.io/docs/automation/trigger/#state-trigger) is what you need. You don't need a to or a from, just two lines:

```yaml
trigger:  
- platform: state  
  entity_id: sensor.your_sensor  
```

As explained in the documentation, this will trigger when the state _or any attribute_ changes. If your sensor/switch/light/whatever has attributes that update, like say the battery level, or the signal strength, or something else then the automation will run, despite the state not having changed.

This causes a lot of surprises and confusion.  

That's ok though, we can fix that with a...

## Condition

We can use a [template condition](https://www.home-assistant.io/docs/scripts/conditions/#template-condition), using the [state objects](https://www.home-assistant.io/docs/configuration/state_object/) from the [state trigger template](https://www.home-assistant.io/docs/automation/templating/#state). This allows us to compare the previous and new state and see if they're different:

{% raw %}
```yaml
condition:  
- condition: template  
  value_template: "{{ trigger.from_state.state != trigger.to_state.state }}"  
```
{% endraw %}

Now the automation won't continue if the current and previous state are the same.

## Together

Now we can bring that together:

{% raw %}
```yaml
trigger:  
- platform: state  
  entity_id: sensor.your_sensor  
condition:  
- condition: template  
  value_template: "{{ trigger.from_state.state != trigger.to_state.state }}"  
```
{% endraw %}

Just add your action and anything else handy, like and alias, and an id so you can use the trace feature.
