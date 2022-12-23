---
title: Backing up Home Assistant
date: '2017-10-23T22:49:00.002+01:00'
tags:
- backup
- home assistant
modified_time: '2022-04-09T21:30:45.839+01:00'
---

It was suggested on the [Home Assistant](https://home-assistant.io/) Discord channel that I write a simple step by step for backing up your Home Assistant configuration.

Now, before I begin, I will say **RAID IS NOT BACKUP**. RAID protects you from hardware failure, at most. You'll need file systems like ZFS or BTRFS to protect you against corrupt files though.

My suggestion is to use a bootable backup (courtesy of [rpi-clone](https://github.com/billw2/rpi-clone)), a local backup, and an online backup. Nobody has ever regretted having too many backups (well, outside of situations when they find themselves in court).

## Software summary

For those referred here, this is a summary of the backup software I recommend. You can read further for how I use them (not all are documented here since this is an older article):

* [rpi-clone](https://github.com/billw2/rpi-clone) - Live SD card images for Pi's running something other than HAOS
* [rsnapshot](https://rsnapshot.org/) - Local network backups using rsync (third party Docker images [are available](https://hub.docker.com/search?q=rsnapshot&type=image))
* [rclone](https://rclone.org/) - Local or remote backups, which can be encrypted ([official Docker image](https://hub.docker.com/r/rclone/rclone))
* [kopia](https://kopia.io/) - Encrypted local or remote backups ([official Docker image](https://kopia.io/docs/installation/#docker-images)) 

## Local backups

As well as [rpi-clone](https://github.com/billw2/rpi-clone) for bootable snapshots, there's 2 different approaches you can use to back up Home Assistant within your home network: directly on the computer running Home Assistant, or from another computer. The second is a better option, but I'll also document the first for completeness. In both cases, I'll be using [rsnapshot](http://rsnapshot.org/), a fantastic utility that uses `rsync`. If you haven't already installed, it, do so now (`sudo apt-get install rsnapshot`) and then come back.

Why do I think the second option is better? If something bad happens to your Pi (whether a catastrophic failure, by typing `rm -fr /` in error, or a hack) then the odds of it impacting the second system are lower.

### On the same computer

Connect a USB disk, whether a thumb drive, an SDD, or a traditional hard disk. I'd suggest mounting it on `/backup`, that makes it very clear what the purpose is. Follow the same process as [explained here]({% post_url 2017-10-23-home-assistant-moving-logs-and-database %}), except you create a single partition from `2048s` to `100%`.

Now create a sub-folder called snapshots:

```sh
$ sudo mkdir /backup/snapshots
```

Some key things for your `/etc/rsnapshot.conf` (use `TAB`, not spaces to separate the fields):

```
snapshot_root    /backup/snapshots
no_create_root   1
one_fs           1

exclude   home-assistant_v2.db
exclude   OZW_Log.txt
exclude   home-assistant.log

backup    /home/homeassistant          localhost/
```

If your Home Assistant install is elsewhere, replace `/home/homeassistant` accordingly. Now you just need to update `/etc/cron.d/rsnapshot`, remove the `#` characters from the last 4 lines, so that it reads

```
0 */4    * * *    root    /usr/bin/rsnapshot alpha
30 3     * * *    root    /usr/bin/rsnapshot beta
0 3      * * 1    root    /usr/bin/rsnapshot gamma
30 2     1 * *    root    /usr/bin/rsnapshot delta
```

If you're using `sync_first 1` then instead it must look like:

```
0 */4    * * *    root    /usr/bin/rsnapshot sync && /usr/bin/rsnapshot alpha
30 3     * * *    root    /usr/bin/rsnapshot beta
0 3      * * 1    root    /usr/bin/rsnapshot gamma
30 2     1 * *    root    /usr/bin/rsnapshot delta
```

The names at the end of those lines should match up with the retain lines in your `/etc/rsnapshot.conf` (you may have to uncomment the fourth line). Older versions of the default configuration file may use `hourly`, `daily`, `weekly`, etc.

### On a remote computer

It's very similar to the above, the only difference is that the backup line will read:

```
backup  root@192.168.0.10:/home/homeassistant          192.168.0.10/
```

Replace `192.168.0.10` with the LAN IP of your Home Assistant server. You'll also need to create an SSH key, with no passphrase, for rsnapshot to use, then copy it over. On the remote computer, the one running rsnapshot, run:

```sh
$ sudo ssh-keygen -t ed25519
```

When asked for a passphrase, hit enter. This will create two files `/root/.ssh/id_ed25519` and `/root/.ssh/id_ed25519.pub`. The second of those you'll need to copy across to your Home Assistant server, and place in `/root/.ssh/authorized_keys`:

```sh
$ sudo scp /root/.ssh/id_ed25519.pub pi@192.168.0.10:
```

Now ssh to the Home Assistant server and run:

```sh
$ sudo cp ~pi/id_ed25519.pub /root/.ssh/authorized_keys
```

Finally, back to the other system, and run:

```sh
$ sudo ssh root@192.168.0.10
```

You should be prompted accept the SSH key for the remote system, and then you'll be all set.

If that doesn't work, it's because the settings of `PermitRootLogin` isn't right. Edit `/etc/ssh/sshd_config` with your favourite editor (you'll likely need to use `sudo`) and update that line to read:

```
PermitRootLogin without-password
```

Then tell it to re-read the configuration with:

```sh
$ sudo pkill -HUP sshd
```

## Online backups

Local backups are all very good, but online backups allow you to recover even if you suffer a catastrophic failure (theft, fire, falling bows of petunias...).

### rclone

[rclone](https://rclone.org/) describes itself as a program to sync files and directories (with a long list of providers), but a number of those support versioning (including Backblaze B2 and Google Drive), giving you a true backup solution. It even supports [encrypting](https://rclone.org/crypt/) your files before uploading, and I would _highly recommend_ that you use that. Your Home Assistant configuration likely contains many [secrets](https://home-assistant.io/docs/configuration/secrets/) after all.

The rclone documentation does a great job of covering how to set it up, so I won't bother covering that in detail. I created an encrypted Backblaze B2 service called `BB2`, and I'm using a bucket called `HA`. Remember to keep a separate note of the passwords you set if you use encryption, somewhere not on the Pi you're backing up.

I've also created a file in a directory `/local`, called `b2-excludes`. This has a number of things I don't want backed up online:

```
.bash_history/
.lesshst
.ssh/
.cache/
tmp/
*.core
home-assistant_v2.db
OZW_Log.txt
home-assistant.log
.google.token
```

I run the following from cron every 2 hours:

```sh
$ /usr/local/bin/rclone --transfers 2 --bwlimit 5M --exclude-from /local/b2-excludes sync /home/homeassistant BB2:HA
```

I limit it to 2 parallel operations, and 5 Mb/s as this is sufficient, and avoids making my upload too busy (if it interferes with online gaming, I get to hear about in _very_ short order). You should test different values to find what works for you.

### Github

Github also gives you versioning, but you absolutely must ensure you don't back up any secrets.

## Before you go

Remember, a backup you can't recover from is worthless. Test that you can recover from _all_ the locations you back up to periodically.
