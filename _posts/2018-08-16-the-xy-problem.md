---
title: The XY Problem
date: '2018-08-16T15:15:00.002+01:00'
tags:
- problem
modified_time: '2018-08-16T15:15:49.570+01:00'
---

I talked about the people who try (and usually fail) to make things work by [banging the rocks together](/the-secret-is-not-to-bang-rocks-together/), but there's another, more common, group. These are the people who've identified what they think of as the solution, and are totally focused on making that solution work. They'll [ignore all attempts](https://meta.stackexchange.com/questions/66377/what-is-the-xy-problem) to solve the problem that don't involve their solution.

## Don't lose your head

The problem is when people get solution focused they don't describe the whole thing they're trying to solve, they focus on just a tiny piece. It's like when trying to solve a jigsaw you focus on a single piece, to the exclusion to all else.

Some examples have included the person who was asking if Home Assistant would probe SSH and RDP ports, and the person who wanted to know how to close blinds at 4 in the afternoon every day.

These people suffered from the trap that is [the XY problem](https://meta.stackexchange.com/questions/66377/what-is-the-xy-problem), or tunnel vision.

The first problem above was actually about a UTM generating warnings (the person was using the nmap device tracker). It took a lot of questions and a lot of time to get to that point though. The second person had a problem where the sun was shining on their TV.

## When a solution comes

The challenge here is that here there's a high risk of not solving the underlying problem. Taking the second issue in particular, the position of the sun at any time of day changes through the year. Its elevation at 4 PM today won't be the same in 2 months, it'll be higher (or lower), and having the blinds close then won't be the right solution. Also, what if the TV is off because you're wanting to watch the sun set?

If only they'd taken the time to explain what the problem is (_as the sun sets it shines on the TV, making it hard to see_), what they had to work with (_I've got some automated blinds that I can control_) and what the goal was (_stop the sun disrupting my TV viewing_). 

In this example, instead the suggestion would be to use the sun's elevation, the angle of the sun (azimuth), the state of the TV (on or off) and optionally the cloud cover (so you don't close it when the sun is hidden by clouds anyway). That'll work all year, and only close the blinds when they need to close.

## The next time

When you're next stuck with a problem, take a little time to explain the _whole_ problem. Take the time too when answering questions to actually answer them, don't blow them off with one or two word answers. If you do this, it'll be easier on everybody, and your actual problem will be solved more quickly.

### _Footnotes_

*   _Most of us have been guilty of this at one point or another_
*   _Yes, if the sun elevation was checked a month before or after the longest or shortest day, it will be the same elevation - no points for pointing that one out &#x1F609;
