---
title: Cameras, motion detection, and (interesting) object detection (part two)
date: '2020-05-10T11:20:00.001+01:00'
tags:
- doods
- motion
- motion detection
- object detection
modified_time: '2020-05-10T11:20:30.278+01:00'
---
Well, it didn't take long for me to tweak my setup, so before we get to the template, and other things, I'll explain what I've changed.  

## Same, but different

I've been using one webhook to trigger everything, and blindly assume that the interesting activity ends a minute later. This is done with the _Call a Web Hook_ option in MotionEye. That simply adds to the `on_event_start` option. There's also an `on_event_end` command, that can be used for this, with a little work. I ended up writing a really simple shell script to make the required call, identifying whether this is the start or end of an event, and which camera it's on. I'm not using the camera information yet, but I'll add that eventually.  
  
Now I'm using the same webhook for the start and end, I'm [firing an event](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/motion_hook.yaml) from that webhook, with the information, that's consumed by the [event start](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/motion_start.yaml) and [event stop](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/motion_stopped.yaml) automations. This simply makes it easier to ensure that when I'm streaming the video it doesn't cut off until all the activity has finished.  

## Streaming logic

When streaming is enabled, I want it to "follow us". I've built [some simple logic](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/start_camera_stream.yaml) that uses the fact that I already track which rooms are occupied. This sets an input select to match the target media player.

{% raw %}
```yaml
        {%- if is_state('input_boolean.office_occupied','on') -%}  
          media_player.office_smart_display  
        {%- elif is_state('input_boolean.living_room_occupied','on') -%}  
          media_player.living_room_display  
        {%- elif is_state('input_boolean.master_bedroom_occupied','on') -%}  
          media_player.master_bedroom_display  
        {%- else -%}  
          media_player.family_room_display  
        {%- endif -%}
```
{% endraw %}

The logic is simple, the rooms are listed in the priority order, and if nothing else is occupied it "falls through" to the family room.  
  
I set an input select so that when the [stream is stopped](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/stop_camera_stream.yaml), it stops the right media player. This avoids the situation where a room becomes unoccupied between the camera stream starting and stopping.  

## Doods

The configuration for Doods itself is as follows:  

{% raw %}
```yaml
    - name: default  
      type: tensorflow  
      modelFile: /share/doods/models/faster_rcnn_inception_v2_coco_2018_01_28.pb  
      labelFile: /share/doods/models/coco_labels1.txt  
      numThreads: 4  
      numConcurrent: 2  
      hwAccel: false  
      timeout: 30s
```
{% endraw %}

Given that it's typically taking about 0.8 seconds, that 30 second timeout is quite excessive.  

### Tensorflow

As you probably noticed I'm using the `faster_rcnn_inception_v2_coco_2018_01_28` models, on the full Tensorflow. I found the lite models horribly inaccurate, where it was detecting rocks as people, yet not detecting the (larger) people in the same image. On my hardware this still takes under a second, but the accuracy is good.  

## Doods Integration

The integration's [configuration is here](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/image_processing/doods.yaml), I've had the confidence set down at 60%, but I've turned it up to 70%, and I suspect I'll move that to 75%. As my notifications include details on the detections I've got a log I'm using for tuning.  
  
I've excluded the top 50% of the image, and the right 40% since all the things I'm interested in will be in that area. This basically matches the detection area for Motion. I've said that I'm interested in matches that go outside the area, because sometimes the objects that cause detection, which I'm still interested in, go outside that area.  
  
The objects I've said I'm interested in are person, car, truck, motorcycle, bicycle, cat, dog, bird. I'm not really interested in the last three, but they cause enough motion detections I'm curious to see how Doods does at identifying them. So far, it hasn't identified any  

## Finding the relevant things

So, there's that [60 line template-of-doom](https://github.com/DubhAd/Home-AssistantConfig/blob/07ba039cbdddde089b7b3adb1d77a6fa5a154ce1/scripts/camera/front_camera_interesting_things.yaml). What does it do exactly?

First off, we extract the count of things we're interested in:

{% raw %}
```yaml
        {%- set totalPeople = state_attr('image_processing.doods_front_camera_snapshot','summary').person|default(0) -%}  
        {%- set totalCars = state_attr('image_processing.doods_front_camera_snapshot','summary').car|default(0) -%}  
        {%- set totalTrucks = state_attr('image_processing.doods_front_camera_snapshot','summary').truck|default(0) -%}  
        {%- set totalMotorcycles = state_attr('image_processing.doods_front_camera_snapshot','summary').motorcycle|default(0) -%}  
        {%- set totalBicycles = state_attr('image_processing.doods_front_camera_snapshot','summary').bicycle|default(0) -%}  
```
{% endraw %}

Then we set some default values (zero):

{% raw %}
```yaml
        {%- set parkedCars = 0 -%}  
        {%- set otherCars = 0 -%}  
        {%- set parkedTrucks = 0 -%}  
        {%- set otherTrucks = 0 -%}  
        {%- set relevantPeople = 0 -%}  
        {%- set otherPeople = 0 -%}  
```
{% endraw %}

Next we define a macro to see if the vehicle detected is in one of the parking spaces:  

{% raw %}
```yaml
        {%- macro isParked(box) -%}  
        {{- True if (  
            ((0.715 < box[0] < 0.754) and (0.340 < box[1] < 0.482) and (0.820 < box[2] < 0.852) and (0.500 < box[3] < 0.580))  
             or  
            ((0.740 < box[0] < 0.766) and (0.318 < box[1] < 0.400) and (0.830 < box[2] < 0.854) and (0.380 < box[3] < 0.550))  
          ) else X -}}  
        {%- endmacro -%}
```
{% endraw %}

I could probably simplify this to check the two spaces as a whole. All this does is check to see if the corners of the detected object are inside what's normal for detections in that space.  
  
Next up we check to see if the cars (or trucks, since sometimes the larger car is picked up as a truck) we see are in a parking space (boring) or not (interesting):  

{% raw %}
```yaml
        {%- if totalCars > 0 -%}  
          {%- macro getParkedCars() -%}  
          {%- for state in state_attr('image_processing.doods_front_camera_snapshot','matches').car -%}{{- "X" if isParked(state.box) -}}{%- endfor -%}  
          {%- endmacro -%}  
          {%- set parkedCars = getParkedCars()|length -%}  
          {%- set otherCars = state_attr('image_processing.doods_front_camera_snapshot','summary').car - parkedCars -%}  
        {%- endif -%}
```
{% endraw %}

We do the same for the trucks then total up the vehicles into parked and other:  

{% raw %}
```yaml
        {%- set parkedVehicles = parkedCars+parkedTrucks -%}  
        {%- set otherVehicles = otherCars+otherTrucks -%}
```
{% endraw %}

Now it's time to look at the people. Here were mainly interested in people on the path or in the garden, rather than those on the access road. Yes, this means I'll miss out on notifications of people walking to the parking spaces, but that's not something I'm concerned about.  

{% raw %}
```yaml
        {%- if totalPeople > 0 -%}  
          {%- macro personOnPath(box) -%}  
          {{- True if (  
              ( 0.885 < box[2] )  
            ) else X -}}  
          {%- endmacro -%}  
          {%- macro getPeopleOnPath() -%}  
          {%- for state in state_attr('image_processing.doods_front_camera_snapshot','matches').person -%}{{- "X" if personOnPath(state.box) -}}{%- endfor -%}  
          {%- endmacro -%}  
          {%- set relevantPeople = getPeopleOnPath()|length -%}  
          {%- set otherPeople = state_attr('image_processing.doods_front_camera_snapshot','summary').person - relevantPeople -%}  
        {%- endif -%}

Finally we total up the things that are interesting, and report that.  

        {#- total up the things into different categories -#}  
        {%- set importantThings = otherCars + otherTrucks + totalMotorcycles + totalBicycles + relevantPeople -%}  
        {{ importantThings }}
```
{% endraw %}

In short, I'm interested in vehicles not in the parking spaces, any bikes, and people in the garden/path. We use this information in the notification script to decide which channel it goes to, and whether the camera will be streamed to a smart display.

## Notification time

Notification logic is "simple":

1.  Doods found _nothing_ then the notification goes to a muted Discord channel
2.  Doods found something, but nothing interesting, the notification goes to that same channel
3.  Doods found something interesting, the notification goes to a different channel

All notifications include the confidence and bounding box of what was found, so that I can tune the template logic and Doods configuration. The muted channel gives me a history I can review too, in case I filtered out interesting things.

## What's next?

I've noticed that when I cast to my Home Hub Max the image is rotated 90 degrees. I need to investigate and see if that's a problem at the HA end (seems pretty unlikely) or at the Google end (seems more likely).

I'm thinking of getting one of the Google Coral sticks. There's some interesting examples out there using the stick to do near real time object detection, separate from motion detection. That has interesting possibilities for making this even smarter, rather than just checking for interesting objects at two fixed points, continually check for interesting objects during a motion detection.
