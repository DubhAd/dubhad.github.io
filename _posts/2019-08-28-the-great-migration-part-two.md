---
title: The great migration - part two
date: '2019-08-28T07:30:00.003+01:00'
tags:
modified_time: '2019-08-28T07:30:34.423+01:00'
---

Well, that was less exciting than I'd feared.  
  
The first stage is done. Z-Wave is running on the Pi, and everything else runs on the VM, communicating over MQTT and the REST API.  
  
This is built from:  

* Binary sensors - ones to track the states of the sensors, and ones to track the state of what we want the switches to be.
* Some MQTT switches - to consume the state published by the Z-Wave system, that publish to a topic watched by one of the binary sensors
* One script per switch entity
* A REST command to send commands to the Z-Wave system
* A set of automations to glue all this together:
  * One uses to call the right script
  * Another sends an MQTT publish command when the switch changes state
  * The last ensures that if the switch and boolean get out of sync, we update the boolean - things do sometimes get out of sync

_If I'd known about it/it had existed, I'd have used [this custom component](https://github.com/custom-components/remote_homeassistant) and saved myself a lot of pain_

### Horrible hack

Yes, it _is_ a horrible hack. 

This is purely to hold me over until I migrate to Zwave2MQTT, using the [Docker container](https://github.com/robertsLando/Zwave2Mqtt-docker). I'm going to do that on on a fresh Pi though, so that if it goes horribly wrong it'll be trivial to revert. It does sound like people have had mixed results, largely coming down to what devices they're using.
