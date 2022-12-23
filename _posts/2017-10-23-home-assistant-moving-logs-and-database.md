---
title: Home Assistant - moving logs and database off the SD card
date: '2017-10-23T20:42:00.000+01:00'
tags:
- home assistant
modified_time: '2018-03-28T08:35:28.435+01:00'
---

One problem with running [Home Assistant](https://home-assistant.io/) on a Pi is that SD cards aren't great for high write situations, and the database and logs can be very chatty. The answer is to move those to a USB thumb drive, and extend the life of your SD card.

You'll want a USB thumb drive of at least 16 GB, and I'd suggest a good quality one.

## Prepare the drive

First, connect the thumb drive to your Pi, then SSH to your Pi. There run the following command:

```sh
$ sudo dmesg|tail -n 20|grep sd
```

you should see something like:

```
[    3.773637] sd 0:0:0:0: [sda] 62333952 512-byte logical blocks: (31.9 GB/29.7 GiB)
[    3.783125] sd 0:0:0:0: [sda] Write Protect is off
[    3.791694] sd 0:0:0:0: [sda] Mode Sense: 0b 00 00 08
[    3.792618] sd 0:0:0:0: [sda] No Caching mode page found
[    3.801020] sd 0:0:0:0: [sda] Assuming drive cache: write through
[    3.817186]  sda: sda1 sda2
```

The size should roughly agree with the size of the thumb drive you bought. In this case, my device is `sda` (the first USB drive that's attached).

Now you'll partition the disk into two. One partition will hold the system logs, the other will hold your Home Assistant database. We'll do that with the following command (if your disk isn't `sda`, replace `sda` with your device):

```sh
$ sudo parted /dev/sda
```

Now you list the existing partitions with the command `p`, and then remove them with `rm 1`, `rm 2` and so on for each partition.

Go back and have a look at the output of p, it'll give you the size of the disk:

```
Model: SanDisk Cruzer Fit (scsi)
Disk /dev/sdb: 31.5GB
```

We'll allocate half of this for the logs, and half of it for the database with the following commands:

```
mkpart primary 2048s 50%
mkpart primary 50% 100%
```

Then type `quit` to exit.

## Add file systems

Now you'll have 2 partitions `/dev/sda1` and `/dev/sda2`, but they need a file system:

```sh
$ sudo mkfs -t ext4 /dev/sda1
$ sudo mkfs -t ext4 /dev/sda2
```

This will generate a number of lines out output, but the important one at the top is where it says `Filesystem UUID`, we'll be using that next.

To use these file systems, edit `/etc/fstab` with your favourite editor (eg `sudo vi /etc/fstab`) and add the following lines. Replace the parts starting `deadbeef-cafe` (the UUIDs) with the UUID, a different one on each line.

```
UUID=deadbeef-cafe-dead-beef-cafef00f1234    /var/log    ext4    defaults,noatime,nofail    0    0
UUID=deadbeef-cafe-dead-beef-cafef00f5678    /data       ext4    defaults,noatime,nofail    0    0
```

You can separate those with tabs or spaces. Unlike YAML, it doesn't matter here. The `noatime` option says not to record the access (read) time of the files, which will save a lot of writes. The `nofail` option says that if the disk isn't found on boot to continue anyway.

## Moving the Home Assistant database

Making use of `/data` is easy:

```sh
$ sudo mkdir /data
$ sudo mount /data
$ sudo chown homeassistant:homeassistant /data
```

Then update `configuration.yaml` with:

```yaml
recorder:
  db_url: sqlite:///data/home-assistant_v2.db
```

Now you can shut Home Assistant down, and move your existing database, then the logfile (and create a link for the logfile):

```sh
$ sudo mv ~homeassistant/.homeassistant/home-assistant_v2.db /data/
$ sudo mv ~homeassistant/.homeassistant/home-assistant.log /data/
$ sudo ln -s /data/home-assistant.log ~homeassistant/.homeassistant/home-assistant.log
```

If you're using Z-Wave then you can move that log too:

```sh
$ sudo mv ~homeassistant/.homeassistant/OZW_Log.txt /data
$ sudo ln -s /data/OZW_Log.txt ~homeassistant/.homeassistant/OZW_Log.txt
```

When you start Home Assistant up, it'll now use the new location

## Moving the log files

Now we're going to make use of the way Linux handles files and do some fancy footwork:

```sh
$ sudo mv /var/log /var/log-old
$ sudo mkdir /var/log
$ sudo mount /var/log
```

Now you've got some choices. The simplest solution is to simply reboot. This will cause everything currently using `/var/log` to use the partition you just mounted on `/var/log`. Your old log files will still exist in `/var/log-old`.

If you don't want to reboot, you can identify the programs with a file open on `/var/log` with

```sh
$ sudo lsof -n | grep "/var/log" | awk '{ print $1, $2 }'| uniq
```

This will give you a list of services you need to restart (and their process ID). Some names may not be obvious, so you might need to look at the output of

```sh
$ sudo ps axu | grep " 1234 "
```

replacing `1234` with the process ID in question.

## Also see

Brian Cribbs has [written this article](http://www.cribbstechnologies.com/index.php/home-automation/moving-home-assistant-logs/) on achieving the same goal, with a slightly different approach, and Carlo Costanzo's [experiences doing this](http://www.vmwareinfo.com/2017/10/moving-home-assistant-dbs-to-external.html).
