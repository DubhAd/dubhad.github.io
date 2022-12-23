---
title: Zigbee2MQTT - Native to Docker migration
date: '2021-05-02T03:30:00.001+01:00'
tags:
- docker
- zigbee2mqtt
modified_time: '2021-05-02T03:30:00.208+01:00'
---

 A long time ago I started using Zigbee2MQTT - somewhere around 1.2 or 1.3. Back then I thought that it was easiest to run Zigbee2MQTT with a manual install, which was (and still is) the default instructions you'll find.

Since then I've seen the light. Docker makes upgrades, and downgrades, so much easier. Installing a new version is no longer a nightmare with compiling and installing packages - it's two commands and a short wait.

But, if you've started with a manual install, how do you migrate without having to re-pair everything? 

The answer is that it's pretty much the same as for when you migrate Home Assistant from a [venv to Docker](/ha-venv-to-docker/):

1.  Install Docker and Docker Compose
2.  Configure your container to use the existing config folder
3.  Done (well, mostly)

## Install

Install [Docker CE](https://docs.docker.com/engine/install/) which these days comes with Compose saving us a few steps.

Next you'll want to pick a folder to keep all your Docker configs in. I like to use `/data` for the top level, and `/data/docker for my compose file(s). Other people use `/docker` for their compose files and folders under there for the container's config folders.

Now you can follow the official Zigbee2MQTT docs, though you will already know where your USB stick is (just look in the existing config).

## Configure

Next step is to write your `docker-compose.yml` file, which will look something like this:

```yaml
version: '3'  
services:  
  zigbee2mqtt:  
    container_name: zigbee2mqtt  
    image: koenkk/zigbee2mqtt  
    restart: unless-stopped  
    network_mode: host  
    volumes:  
      - /opt/zigbee2mqtt/data:/app/data  
    devices:  
      - /dev/serial/by-id/usb-Texas_Instruments_TI_CC2531_USB_CDC___0X00124B0018E1F2ED-if00:/dev/ttyACM0  
    environment:  
      - TZ=Europe/London  
    healthcheck:
      test: ["CMD", "/usr/bin/wget", "-q", "-O -", "http://127.0.0.1:8080"]
      interval: 60s
      timeout: 5s
      retries: 3

```

Change the device path to suit your USB stick, and the [timezone to suit you](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Finish

Now it's time to disable and stop the old install, and then start your new container.

```bash
cd /data/docker  
sudo docker-compose pull  
sudo systemctl disable zigbee2mqtt  
sudo systemctl stop zigbee2mqtt  
sudo docker-compose up -d  
```

You can check the logs now either by looking in the config folder, as before, or by using `docker compose logs -f zigbee2mqtt` when in the folder with your compose file.

When it comes time to update Zigbee2MQTT you just repeat the pull and up steps:

```bash
docker-compose pull  
docker-compose up -d  
```

If you need to revert to the manual install for any reason then you can easily do that.
