---
title: Upgrading the Python Virtual Environment
date: '2017-12-08T11:45:00.034Z'
toc: true
tags:
- venv
- python
- home assistant
modified_time: '2023-07-15T20:48:58.013+01:00'
---

Unless you're running local other software directly from the venv, consider [switching to Docker]({% post_url 2020-10-10-ha-venv-to-docker %}). It'll save you from ever needing to upgrade Python and rebuild the venv again.

## Updates

* **July 2023** Python 3.10 deprecation
* **December 2022** Python 3.9 deprecation
* **October 2020** for Python 3.7 deprecation, and to add libraries for Pillow 
* **July 2020** based on [this change](https://github.com/home-assistant/docker-base/pull/82) to the official HA Docker container
* **December 2019** to account for the deprecation of Python 3.6 support

I would highly recommend the use of [pyenv-installer](https://github.com/pyenv/pyenv-installer) as a way of installing and using Python virtual environments, with multiple versions of Python. If you do that then all you need to do is follow the _Prepare the system_ section before using `pyenv`.

## Prepare the system

First, prepare the system - this now includes support for jemalloc and cargo (required for the latest version of the cryptography package):

```bash
$ sudo apt install build-essential tk-dev libncurses5-dev libncursesw5-dev libreadline-dev \
  libdb5.3-dev libgdbm-dev libsqlite3-dev libssl-dev libbz2-dev libexpat1-dev liblzma-dev \
  zlib1g-dev libudev-dev unixodbc-dev libpq-dev libwebp-dev libopenjp2-7-dev libjpeg-dev \
  libtiff5-dev libfreetype6-dev libc6-dev libffi-dev libbluetooth-dev libtirpc-dev libjemalloc-dev cargo
$ sudo ldconfig
```

If you use MariaDB you'll also need `libmariadb-dev`, and if you use PostgreSQL you'll also need `libpq-dev`.

## Install Python 3.x

**Do not** install Beta or Alpha versions of Python. These are marked by the letter `a` or `b` in the version number, for example `3.12.0a4`. These are unfinished versions, and using them will cause you problems.

~~If you want to take a shortcut, I've a [script](https://github.com/DubhAd/Home-AssistantConfig/blob/live/local/bin/build_python) that you can use to install all the pre-requisites, compile and install Python, and create and prepare the venv. Download the script, make it executable, and then run it with the version of Python you want to use. For example: `./build_python 3.11.4`~~ Just use `pyenv`.

We're going to cover Python 3.11.4 now that Python 3.11 is supported by HA Core and I've updated this article accordingly since I know it works as expected.

Download and install Python 3.11.4 (if a later version is out, you can use that, just change 3.11.4 to your version number). Note that `make install`` will replace your python3 link with one for this version of python (your old version of python will still be accessible). You likely don't want that, so here we use make altinstall instead.

```bash
$ cd /data
$ wget https://www.python.org/ftp/python/3.11.4/Python-3.11.4.tgz
$ tar -zxvf Python-3.11.4.tgz
$ cd Python-3.11.4
$ ./configure --enable-optimizations --enable-shared --with-lto --with-system-expat \
    --with-system-ffi --without-ensurepip
$ make -j$(cat /proc/cpuinfo|egrep -c "^processor") \
    LDFLAGS="-Wl,--strip-all" \
    CFLAGS="-fno-semantic-interposition -fno-builtin-malloc -fno-builtin-calloc -fno-builtin-realloc -fno-builtin-free -ljemalloc" \
    EXTRA_CFLAGS="-DTHREAD_STACK_SIZE=0x100000"
$ sudo make altinstall
```

The `make` command will take a little over an hour on a Pi3, and considerably less on more capable systems.

### Crashes

Somebody has reported that on older Debian installs the make step fails with segmentation faults, and the needed to run the following commands first. I haven't seen that, but if it happens, try it.

```bash
$ sudo apt-get install libtcmalloc-minimal4
$ export LD_PRELOAD="/usr/lib/libtcmalloc_minimal.so.4"
```

I've seen the same on Raspbian Buster, where I needed to do:

```bash
$ sudo apt-get install libtcmalloc-minimal4
$ export LD_PRELOAD="/usr/lib/arm-linux-gnueabihf/libtcmalloc_minimal.so.4.5.3"
```

In both cases, that means removing `CFLAGS` line above from your make.

## Create the new virtual environment

Make the new environment using the user you run Home Assistant as (this assumes you're using homeassistant. I put mine in separate folders so I can do upgrades without impacting my live install. My venvs all live under `/data/homeassistant/venv`. 

```bash
$ sudo mkdir /data/homeassistant/venv
$ sudo chown homeassistant:homeassistant /data/homeassistant/venv
$ sudo -u homeassistant -H -s
$ python3.10 -m venv /data/homeassistant/venv/venv_3.11.4
```

## Prepare the new virtual environment (optional)

We can make the first startup slightly faster by getting a list of the installed packages, and then installing them in the new environment.

Using the user you run Home Assistant as, activate the old environment (here I assume it was `/data/homeassistant/venv/venv_3.10.1/`) and extract the list of packages (this'll speed up the first start):

```bash
$ source /data/homeassistant/venv/venv_3.10.1/bin/activate
$ pip3 freeze —local > ~/requirements.txt
$ deactivate
```

Switch to the new environment, and install the requirements:

```bash
$ source /data/homeassistant/venv/venv_3.11.4/bin/activate
$ pip3.10 install -r ~/requirements.txt
```

If you run into any issues, remove the line in question from `requirements.txt` - this is just about speeding up the initial startup (we're almost there)

## Install Home Assistant

Prepare the environment by installing `wheel`` and installing/upgrading `setuptools``, then do an install/upgrade of Home Assistant in the new environment, before finally installing some prerequisites:

```bash
$ source /data/homeassistant/venv/venv_3.11.4/bin/activate
$ python3 -m pip install wheel
$ pip3 install --upgrade setuptools
$ pip3 install --upgrade homeassistant
$ wget --quiet https://raw.githubusercontent.com/home-assistant/docker/master/requirements.txt -O - | while read LINE
  do
    pip3 install --upgrade ${LINE}
  done
$ hass --script check_config
```

If you have issues with pillow, run the following command inside the venv

```bash
$ pip3 install pillow --global-option="build_ext" --global-option="--enable-zlib" \
  --global-option="--enable-jpeg" --global-option="--enable-tiff" \
  --global-option="--enable-freetype" --global-option="--enable-webp" \
  --global-option="--enable-webpmux" --global-option="--enable-jpeg2000"
```

## Switch the virtual environments

Now we're ready to switch. To do this we need to shut down HA, rename a few things, change the startup script, and start HA back up.

```bash
$ sudo systemctl stop home-assistant
# Edit the path for the venv to be /data/homeassistant/venv/venv_3.11.4
$ sudo nano /etc/systemd/system/home-assistant@homeassistant.service
$ sudo systemctl daemon-reload
$ sudo systemctl start home-assistant
$ sudo journalctl -f -u home-assistant
```

Here's my systemd script for this system:

```
[Unit]
Description=Home Assistant
After=network-online.target

[Service]
Type=simple
User=homeassistant
ExecStart=/data/homeassistant/venv/venv_3.11.4/bin/hass -c "/data/homeassistant/.homeassistant"  --log-rotate-days 1

[Install]
WantedBy=multi-user.target
```

For `pyenv` my ExecStart line looks like:

```
ExecStart=/data/homeassistant/.pyenv/versions/venv-3.11.4/bin/hass -c "/data/homeassistant/.homeassistant" --log-rotate-days 1
```

Now you can watch it install various packages as it starts.

## Why this way?

This makes it pretty easy to switch between versions of Python, or even versions of Home Assistant.
