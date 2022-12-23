---
title: Why didn't my automation run?
date: '2021-07-18T22:07:00.003+01:00'
tags:
- automation
- home assistant
modified_time: '2021-11-18T12:01:01.982Z'
---

It's a common post on the HA Discord where people are confused as to why their automation isn't running, they've got a trigger, and a few conditions, and ... nothing happens.

```yaml
trigger:  
  - platform: numeric_state  
    above: '22'  
    entity_id: sensor.temperature  
condition:  
  - condition: time  
    after: '22:00:00'  
    before: '08:00:00'  
  - condition: state  
    entity_id: climate.environment  
    state: cool  
```

This is typically because people assume that the triggers are continually checked. They're not, they're checked _when they become true_, and that's the point the conditions are checked.

The problem here is that if the temperature rises above 22 before 22:00, or when the climate device isn't set to `cool`, the automation won't run.

## How to solve this?

"Simple" - duplicate the conditions and triggers:

```yaml
trigger:  
  - platform: numeric_state  
    above: '22'  
    entity_id: sensor.temperature  
  - platform: time  
    at: '22:00:01'  
  - platform: state  
    entity_id: climate.environment  
    to: cool  
condition:  
  - condition: numeric_state  
    above: '22'  
    entity_id: sensor.temperature  
  - condition: time  
    after: '22:00:00'  
    before: '08:00:00'  
  - condition: state  
    entity_id: climate.environment  
    state: cool  
```

Now it doesn't matter what order things happen in, once the last thing becomes true the automation's actions will run.
