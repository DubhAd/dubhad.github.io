---
title: HA venv to Docker
date: '2020-10-10T09:05:00.001+01:00'
tags:
- docker
- venv
- linux
- python
- home assistant
modified_time: '2020-10-10T14:30:00.056+01:00'
---

Another year, another Python deprecation, another flood of posts asking how to upgrade a Python venv. 

While you can certainly [do that]({% post_url 2017-12-08-upgrading-python-virtual-environment %}), another option would be to move to Docker (at least assuming you're running on Linux). Then you don't have to do this next year. Moving to Docker is pretty simple, it's largely a case of [following the docs](https://www.home-assistant.io/installation/linux#install-home-assistant-container), and writing a compose file that points to your existing config.

## Summary

1.  Install Docker CE, either from your distro's package manager or following [the official docs](https://docs.docker.com/engine/install/)
2.  Write your compose file
3.  Stop your venv, and disabled the service
4.  Start your container

## Install Docker

Install Docker, I personally prefer to [use the official repositories](https://docs.docker.com/engine/install/), or if you're on a Pi use the convenience script. Those are more up to date than you'll get with your distro.

Once you've installed it, enable the service and start Docker - this is covered in the official docs so I won't cover it here.

## Write your compose file

For convenience, create `/docker` to store your compose file in - it makes it easier to find in the future.

Then, assuming your current config is in `/home/homeassistant/.homeassistant` you'll use the following `docker-compose.yml` file:

```yaml
version: '3'  
services:  
  homeassistant:  
    container_name: home-assistant  
    image: homeassistant/home-assistant:stable  
    volumes:  
      - /home/homeassistant/.homeassistant:/config  
    environment:  
      - TZ=Europe/London  
    restart: always  
    network_mode: host
```

Obviously you'll want to update the timezone to match where you live. If you have any directly connected devices (eg USB sticks), you'll need to map those [as explained here](https://www.home-assistant.io/docs/installation/docker/#exposing-devices). Once that's done you'll want to pull the image before continuing (the following assumes your user is in the docker group):

```
docker-compose pull
```

## End the venv

Exactly how you do this will depend on your setup, but it'll likely be something like:

```
sudo systemctl stop home-assistant@homeassistant  
sudo systemctl disable home-assistant@homeassistant
```

## Start your container

In `/docker`, type the following:

```
docker-compose up -d homeassistant
```

You can watch the container logs with:

```
docker-compose logs --tail -100 -f homeassistant
```

That gives you the last 100 lines, and then follows the output.

Finally, see [the Home Assistant docs](https://www.home-assistant.io/common-tasks/container/) for further information on working with HA in Docker, at least until you learn more about Docker.
