---
title: Which Home Assistant install is right for me?
date: '2017-11-09T19:10:00.005Z'
tags:
- hass.io
- home assistant os
- home assistant container
- home assistant core
- docker
- platform
- home assistant
modified_time: '2020-10-10T14:32:07.327+01:00'
---

There are many, many ways of installing Home Assistant, and the choice can be confusing. Here's my very short take on what you'd want to use, and why:  

## Make it work

Do you just want it to work without caring how? Are you happy to dedicate your Pi or NUC (or a VM) to home automation? Are you uninterested in fiddling with how it works, or extending it yourself?

Then Home Assistant OS is for you.

## I know Docker

If you're already at home on Docker, and running on Linux, then using the Container install is for you. For most people I believe this to be a better choice than the next option (yes, I run the next option).

## Use my (Linux or BSD) computer

Do you know Linux (or BSD), but you also want to fiddle with the system? Are you planning to use your computer with Home Assistant (Core), but you might want to run a few other things along side it? Do you know how to troubleshoot and solve problems with installing Python packages and other software from source?

Then a manual venv install (aka Home Assistant Core) is an option for you.

## But what about...

There are other options, and you can install in a virtual environment on other operating systems, but they're unofficial and you may find some (or many) components don't work. If you take one of those and run into problems, you may find that nobody is able to help - if you're not deeply technical, I'd advise that you stick with one of the first two above.