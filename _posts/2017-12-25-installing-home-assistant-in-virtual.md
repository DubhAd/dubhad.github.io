---
title: Installing Home Assistant in a virtual environment (in Linux)
date: '2017-12-25T19:17:00.000Z'
tags:
- venv
- python
- home assistant
modified_time: '2019-11-23T18:02:04.057Z'
---

> Note: This is based off the original Home Assistant virtual environment instructions - before they were reduced to a handful of steps.

There are several reasons why it makes sense to run Home Assistant in a virtual environment. A [virtualenv](https://virtualenv.pypa.io/en/latest/) encapsulates all aspect of a Python environment within a single directory tree. That means that you can install package versions without worrying whether another Python program requires a different version. It means an upgrade for something else won't break Home Assistant (or vice versa), and it means you don't need to install Python packages as root.

Virtual environments are easy to setup - I'll be using Raspbian in this example (I've got a Raspberry Pi), and the steps will be the same for any Debian/Ubuntu based distribution (and likely most Linux distributions), but all of the Python related steps should be the same on just about any platform.

## Install dependencies

The first thing to do is update all your packages, and install the required Python packages, and update the virtualenv command.

```bash
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install python3-pip python3-dev python3-virtualenv
$ sudo pip3 install --upgrade virtualenv
```

> Note: Every year HA deprecates support for older versions of Python - they support the current and previous major releases. The version numbers below were correct at the time of original writing, but are no longer correct.

Make sure that you're running Python 3.5.3 or later:

```bash
$ python3 --version
```

If you have an older version than 3.5.3, upgrade before you go any further - Home Assistant dropped support for Python 3.4 at the end of December 2017, with the minimum version at that point being Python 3.5.3. If your distro doesn't have a newer version, [see here]({% post_url 2017-12-08-upgrading-python-virtual-environment %}) for how to manually install Python. Don't install beta versions of Python unless you're a developer and you're deliberately living on the unstable, bleeding edge.

## Create a separate user

It's a really good idea to give services like Home Assistant their own user. This gives you more granular control over permissions, and reduces the exposure to the rest of your system in the event there is a security related bug in Home Assistant. If you're not running a Debian based distribution, these commands may be different.

```bash
$ sudo adduser --system homeassistant
$ sudo addgroup homeassistant
```

Home Assistant stores its configuration in `$HOME/.homeassistant` by default, so in this case, it would be in `/home/homeassistant/.homeassistant`

If you plan to use a Z-Wave controller, you will need to add this user to the `dialout` group:

```bash
$ sudo usermod -G dialout -a homeassistant
```

## Custom installation directory for Home Assistant

This can be anywhere you want. I use `/srv` as does the original All in One installer, and Hassbian. You also need to change the ownership of the directory to the user you created above.

```bash
$ sudo mkdir -p /srv/homeassistant/homeassistant_venv
$ sudo chown -R homeassistant:homeassistant /srv/homeassistant

$ sudo -u homeassistant -H -s
$ virtualenv /srv/homeassistant/homeassistant_venv
```

You can also use, for example `python3.6 -m venv /srv/homeassistant/homeassistant_venv` instead of `virtualenv /srv/homeassistant/homeassistant_venv`, if you need to use a specific version of Python 3 to build the environment.

I've created a sub-directory for the virtual environment, so that I can create other ones easily in the future. This is particularly handy if you're [upgrading Python]({% post_url 2017-12-08-upgrading-python-virtual-environment %}), but it also allows you to test out development versions easily.

## Install or upgrade Home Assistant

The steps for an install are the same as for an upgrade, except for an upgrade you need to remember to stop Home Assistant first:

```bash
$ sudo systemctl stop home-assistant
```

Be sure to switch to the homeassistant user whenever you install things in your virtualenv, otherwise you'll end up with permissions problems.

```bash
$ sudo su -s /bin/bash homeassistant
```

The `su` command means 'switch' user. You need the `-s` flag because the homeassistant user is a system user and doesn't have a default shell (this stops attackers from being able to log in with this account).

```bash
$ source /srv/homeassistant/homeassistant_venv/bin/activate
(homeassistant_venv)$ pip3 install --upgrade homeassistant
```

## Starting Home Assistant on boot

Follow the [autostart instructions](https://community.home-assistant.io/t/autostart-using-systemd/199497), just be sure to replace `/usr/bin/hass` with `/srv/homeassistant/homeassistant_venv/bin/hass` and specify the homeassistant user where appropriate.

For example, if you were using a system with systemd, you'd create `/etc/systemd/system/home-assistant.service` with the following content:

```
[Unit]
Description=Home Assistant
After=network-online.target

[Service]
Type=simple
User=homeassistant
ExecStart=/srv/homeassistant/homeassistant_venv/bin/hass -c "/home/homeassistant/.homeassistant"

[Install]
WantedBy=multi-user.target
```

Now you enable the service, and start Home Assistant:

```bash
$ sudo systemctl daemon-reload
$ sudo systemctl enable home-assistant
$ sudo systemctl start home-assistant
```

You can watch Home Assistant start (and run) with:

```bash
$ sudo journalctl -f -u home-assistant
```

You can stop watching that by pressing `<CTRL><C>` - it won't stop any service.

The first start may take some time, depending on what options you've enabled and what hardware you're running on. If you've enabled Z-Wave, that first start could take 45 minutes on a Pi2 for example.
