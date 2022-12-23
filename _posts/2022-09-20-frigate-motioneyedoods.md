---
title: Frigate > MotionEye+Doods
date: '2022-09-20T21:02:00.000+01:00'
tags:
- doods
- frigate
- home assistant
- motion detection
modified_time: '2022-09-20T21:02:09.015+01:00'
---

As you may remember, I use MotionEye and Doods, along [withsome crazy scripting](/cameras-motion-detection-and/), to do motion and object detection at the front of the house.

Well, _used_ would be more accurate.

Recently I tried out [Frigate](https://frigate.video/), initially without a Coral stick/board. The following day I turned off MotionEye and Doods. With very little effort I was getting 100% reliable object detection, and no false positives. I then managed to source a (only slightly overpriced) Coral stick, which improved object detection speed. Honestly though, it was ok without the Coral. Then again the camera is covering an area that's pretty low traffic, there's rarely more than a handful of events an hour.

Alongside the Coral stick I'm using the hardware decoding feature of my CPU since I'm using the full resolution stream for detection. This stream has improved object detection over the low resolution stream (since a car is no longer a half dozen pixels high), at the downside of slightly higher CPU usage. Still, it's only about 30% of a single core, which is no big deal.

Now, it's not perfect. I do miss MotionEye's timelapse recordings, and I would like a faster fast forward than 8 times. Somewhat ironically given how much I like YAML for Home Assistant, I miss not having a UI to configure Frigate with. Finally, it'd be nice to be able to do motion detection on the low resolution stream, and object detection on the higher resolution stream, as I was doing with MotionEye+Doods. These are pretty minor complaints though.

The promised features of Frigate+ look interesting too, particularly the custom models.

So, if you're currently using Doods along with any motion detection software, I'd suggest you take a look at Frigate instead. You're likely to find it an upgrade over your current solution.
