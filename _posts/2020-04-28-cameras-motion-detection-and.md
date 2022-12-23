---
title: Cameras, motion detection, and (interesting) object detection (part one)
date: '2020-04-28T21:09:00.000+01:00'
toc: true
tags:
- doods
- motion
- home assistant core
- motion detection
- object detection
modified_time: '2020-04-28T21:09:47.067+01:00'
---

For some time now I've had a camera (a 4K HikVision turret camera) at the front of the house, watching our garden, path, and parking area. I started with the motion detection capabilities of the camera, but the recorded stream would have many missing frames. Then I tried a variety of motion detection options. Kerberos.io looked good, but I couldn't get it working reliably. ZoneMinder was good, but performance was a problem.  
  
I've run [Motion](https://motion-project.github.io/) before, using a couple of webcams, so I decided to try out [MotionEye](https://github.com/ccrisan/motioneye/wiki). The UI is rather nice, and it makes it easy to configure advanced options not exposed in the UI.  
  
My goal here is simple. I want motion detection when _interesting_ things happen out the front of the house. The means I don't really care about passing birds, cats, or dogs. I'm also not really that interested about people on the access road. What I want to know about are vehicles coming and going, or people on the path (or in the garden). That is where I was hoping Doods would help.  

## Motion(Eye)

I'm running MotionEye in a VM, on an old i5 laptop, installed following [their install guide](https://github.com/ccrisan/motioneye/wiki/Install-On-Debian). The first thing I did was the obvious thing - pointed it at my camera, picked an area, and enabled motion detection.

Then I got to watch the recorded video stream consist of a couple of frames with the CPU maxed out. That... wasn't terribly useful. It turns out trying to do motion detection on 4MP at 20 FPS requires a bit more CPU power, but then my experimentation with ZoneMinder did point that out.

Fortunately I'm familiar with Motion, and I knew there were relevant settings, so a quick dive into the docs found me options for a [high resolution stream](https://motion-project.github.io/motion_config.html#netcam_highres), and [passthrough saving](https://motion-project.github.io/motion_config.html#movie_passthrough). What that means is that I can have Motion do detection using the lower resolution stream (a whole 0.23MP), and when it detects motion it saves the 4MP stream. Performance problem solved!  
  
Well, mostly. When I pointed Home Assistant at the camera there was quite a large delay. This prompted me to look at the camera settings further. There's a mass of tune-able options, and Skalavala has done a great job in [documenting these](https://github.com/skalavala/mysmarthome/tree/master/hik-vision%20camera). I've set the I Frame interval to match the frame rate, which dropped the delay apparent in Home Assistant. I also set the region of interest (ROI) to the area I'm doing detection in. This gets prioritised by the camera when encoding the images, so there's more detail here. That's particularly apparent at night.

Now it's time to set up Motion properly.  

### Timelapse

The first thing I've set up is timelapse. It's often interesting to watch the day at high speed, particularly on days with rapidly changing weather.

```
timelapse_mode daily  
timelapse_filename timelapse/%Y%m/Front-%d-timelapse  
timelapse_codec mpeg4  
timelapse_interval 60
```

### Motion detection

I've left noise detection on auto, and then set everything else manually as I'd rather slightly over detect than under detect. The settings I'm using are based on my environment, so while I'll cover them here you'll need to tune them to suit you.

I've set a mask to only include the area of interest. In the past I've made use of the fact that Motion supports more than just binary detect/ignore, with a greyscale mask. Here however I've just stuck with the UI option.

#### Text overlays

I've enabled _Show frame changes_ to make tuning easier, and just left it on. I've also got the timestamp added. The camera does this too, but it's handy to indicate the delay in processing (or the fact that the devices are time sync'd differently).

#### Change thresholds

I've got the frame change threshold, the minimum change, to 0.1%, I'll probably up that at some point to 0.2%. The maximum is currently set at 17K pixels. I may increase that slightly too, now that I've got object detection included. The minimum number of frames with motion is set to two, to reduce false detections. I may reduce that to one later.

Light switch detection is set at 15%, that works _fairly_ well, but if I set it any lower I risk missing motion.

#### Recording options

I've set the pre-capture to 25 frames (a little over one second), and the post-capture to 100 frames, which is roughly 5 seconds. The motion gap is set to 20 seconds. That means once motion detection stops, it records 10 seconds of activity, and then waits another 20 seconds. Motion during that 30 seconds then extends the current event.

### Motion detection hook

I've also, unsurprisingly, configured it to make a POST with a JSON payload when detecting motion, so that HA gets notified.  

## Home Assistant

In Home Assistant I've got a [webhook automation](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/motion_hook.yaml) triggered by that POST from motion. That turns on a boolean, and another [automation that turns it off](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/front_camera_motion_off.yaml) ten seconds later. The boolean triggers [another automation](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/automation/camera/front_camera_motion_detected.yaml) which calls a script, and yes, I could simplify this to have the webhook trigger call that script. I'll do that at some point, probably.

[That script](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/scripts/camera/snapshot_front_camera.yaml) has gone through a _lot_ of changes, initially it did everything, it now only does two things. The first is call another script to run [object detection](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/scripts/camera/process_front_camera.yaml) on the camera. Then, if it finds nothing, it runs [one script](https://github.com/DubhAd/Home-AssistantConfig/blob/0bf10f25cc6d191310ff0e8f64f6994c0eb839ea/scripts/camera/front_camera_notify_nothing.yaml), and if it finds something it [runs another](https://github.com/DubhAd/Home-AssistantConfig/blob/656cad692fe310fd0143790f1d9f06e1c5a349f6/scripts/camera/front_camera_notify.yaml).

That script is "somewhat" scary looking, but what it basically does is simple:

1.  Run [another script](https://github.com/DubhAd/Home-AssistantConfig/blob/656cad692fe310fd0143790f1d9f06e1c5a349f6/scripts/camera/front_camera_interesting_things.yaml) to note the number of "interesting" things
2.  If we found nothing interesting:
    1.  Pause for three seconds
    2.  Process the camera again
    3.  Check again for interesting things
3.  If we found anything interesting, turn on the boolean to indicate we found something interesting
4.  If we found anything interesting, and we've enabled the option to stream motion detection for the front camera, turn on the boolean to indicate that we should stream the camera to a smart display
5.  Prepare a notification
    1.  Split out the interesting things - people in the garden/in the path, and moving vehicles
    2.  Send the notification to one Discord channel if there were interesting things, and to another if there weren't (one channel is muted, the other isn't)
    3.  Include both the raw image, and the marked up image from Doods

Point two there is because it's quite possible for the motion detection to happen while the object of interest is only just in the frame, and not enough to identify. This gives us a second chance to detect anything interesting. Three seconds is enough time for a person or vehicle to fully enter the frame.

I'll explain that massive template, and the camera streaming logic, when I explain my Doods setup in the next update.
