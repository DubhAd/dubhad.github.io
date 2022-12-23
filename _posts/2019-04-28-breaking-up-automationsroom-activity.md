---
title: Breaking up automations/Room activity detection
date: '2019-04-28T19:00:00.000+01:00'
tags:
- automation
- home assistant
- presence detection
modified_time: '2019-04-28T19:00:08.764+01:00'
---

I'm sure we've all been there, where we've written automations that have grown longer and more complicated as we've tried to make things more flexible. Then you end up with a group of automations each hundreds of lines long, and still things don't work well.  
  
That's because you've created a family of monsters.  

### Is the room in use

The starting point for me is to create a pair of automations to determine if the room is in use or not, and manage an [input boolean](https://www.home-assistant.io/integrations/input_boolean/). I do this by looking at the devices in the room and their state. For example, in my living room I can see if the TV is on, or if music is playing. If either of those things is happening then the room is in use. Motion detection isn't much of an indicator since it'll trip as the dog walks around the house. Obviously I can also manually toggle whether the room is occupied, but so far I've never had to.  
  
Other rooms have similar indicators of one of us being in there, including using calendar events. I use the calendar events for things like when friends are round for a board game. In that situation there's nothing detectable.  
  
It's not perfect, if I'm sat quietly in a room reading a book, then there's (currently) nothing to indicate I'm there. However, if I'd a smart light that I'd turned on, I could track the state of that, or a seat sensor, or ... well, you get the idea.  
  
Track the behaviours, not the people.  

### Room mode

Now I've determined if the room is in use or not, the next thing is _what state should the room have_. Here I'll look at things like the light level, is there a specific calendar entry currently active, and more. Those will then set an [input select](https://www.home-assistant.io/integrations/input_select/) to tell other automations what mode the room is currently in. We currently have 5 [modes for the living room](https://github.com/DubhAd/Home-AssistantConfig/blob/master/input_select/rooms/living_room.yaml) - Away, Day off, Day on, Night on, and Dim. This is what those mean:

*   Away - the room is unoccupied
*   Dim - the room is unoccupied, dark, and we've just woken up, or just arrived home
*   Day off - the room is occupied, and bright
*   Day on - the room is occupied, and dull
*   Night on - the room is occupied, and dark

These automations are individually simple and small, and there's little chance of things falling between the gaps.

### Make it so

Now you use the state of that input select to set the room accordingly. Here's how it works for my living room:

*   Away - the room is unoccupied, turn all the lights off
*   Dim - turn on a single light, this provides enough light to navigate the room by
*   Day off - turn all the lights off
*   Day on - turn some lights on (in this case, the one behind the TV, and one in the opposite corner), and turn the others off if they're on
*   Night on - turn on all the background lighting

### The end?

Yes, I now have more automations than before, I've at least doubled them. However, each automation is much simpler, and so easier to understand, and there's less chance of things falling between the cracks and lights turning on (or off) when they shouldn't.

Overall the family have been happier with this approach, or more accurately they've stopped complaining that the lights are misbehaving, which suggests I've got it right this time.
