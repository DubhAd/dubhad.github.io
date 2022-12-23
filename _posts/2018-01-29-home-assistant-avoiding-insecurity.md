---
title: Home Assistant, avoiding insecurity
date: '2018-01-29T08:30:00.000Z'
tags:
- security
- remote access
- home assistant
- backup
modified_time: '2018-02-05T21:34:21.013Z'
---

So, you're running Home Assistant, you've opened it up to the Internet, and you're worried about security?  You're not alone, so read on and see what you can do, and shouldn't do.

## Keeping Secrets

Home Assistant has a configuration option for [secrets](https://home-assistant.io/docs/configuration/secrets/). This is very useful for re-using values, but most importantly it makes it safer to share your configuration. For example, here's a snippet from [my configuration.yaml](https://github.com/DubhAd/Home-AssistantConfig/blob/master/configuration.yaml):

```yaml
  latitude: !secret latitude
  longitude: !secret longitude
  elevation: !secret elevation
```

Now I can share the configuration without you being able to see where I live. The same goes with passwords, usernames, and other sensitive information. I can share my configuration ([and I do](https://github.com/DubhAd/Home-AssistantConfig/)) without worrying that I might accidentally give away something sensitive.

Many people new to Home Assistant pass this by, but even if you're not exposing your system to the Internet, you should be using secrets.

## The Home Assistant account

_NB: This section is outdated and only really applies if you use the Core install method_

First off, run Home Assistant as a user other than your daily driver. Set up a dedicated account just for Home Assistant, one without a password. This is exactly how the old AIO installer, and Hassbian, do it, and if you read the manual install guide for the Raspberry Pi, exactly how that does it too.

There's a constant stream of bad advice on Discord and the forum about setting a password for the user you run Home Assistant as, and adding it to sudoers, so that it can use sudo without a password.

**Don't do it!**

Doing this reduces the security of your system, particularly enabling it to run any command without a password. If your API password turns out to be weak, or is in a leak, any malicious individual know has the easy potential of full access to your system, and from there the rest of your network.

## Home Assistant API Password

_NB: This section is outdated. The API password is deprecated and you have to go out of your way to enable it, don't do that_

Home Assistant does have password support, and if you're not doing authentication anywhere else, you absolutely must use it. The downside is that there is a single password (and no username associated with it), so make _very sure_ you've picked a strong password. Given that it's used in URLs you'll need to ensure it's URL safe, which for simplicity means letters and numbers only. Make it random, and make it long (at least a dozen characters, more is better). Use a password manager to generate one for you (I like [LastPass](https://www.lastpass.com/), but there's also [KeePass](https://keepass.info/) and many others).

There is a long running [feature request on the forum](https://community.home-assistant.io/t/multiple-users-accounts/396) for support for multiple accounts. It's long running because replacing the authentication is non-trivial, so we'll all just have to wait for some developer to pick this up.

This limitation is [why I use NGINX](/nginx-and-home-assistant/) and perform authentication through it. I also use it for SSL support, and on that point...

## Use SSL

Seriously, use it. If you're running Hass.io they even provide a combined [Duck DNS and Let's Encrypt add-on](https://community.home-assistant.io/t/multiple-users-accounts/396), and a separate [Let's Encrypt add-on](https://home-assistant.io/addons/lets_encrypt/) for those who're using another DNS provider. For everybody else, it's not terribly hard, and I [covered it here](/letsencrypt-with-home-assistant/).

SSL ensures that your password isn't sent unencrypted, which given that you've only got a single password for Home Assistant, is a really good thing.

## Consider a proxy

The advantage of a proxy is that you can provide finer grained access control. In addition to being able to do more robust authentication here (as mentioned above), you can limit access to parts of the API by IP range, user agent, and more.

## Use fail2ban

Whether you're using a proxy or not, [fail2ban](https://www.fail2ban.org/wiki/index.php/Main_Page) and the [associated sensor](https://home-assistant.io/integrations/sensor.fail2ban/). Is a great way of cutting off people who're trying to to brute force your password. Whether you're using a proxy, or Home Assistant directly, it's a worthwhile addition.

## Updates

Keep your Home Assistant system up to date. Ensure you update the underlying operating system updated regularly, ideally automatically. On Debian based systems like the Raspberry Pi there's an [unattended upgrades package](https://wiki.debian.org/UnattendedUpgrades) to handle that for you.

Similarly, keep Home Assistant upgraded. Not only does that make it easier to track the breaking changes, but it ensures you don't end up with an outdated, and insecure, system.

## Obscurity

Obscurity isn't security, but if you're running services on a default or common port, you'll get more probes, and more chances for others to find any mistakes you made. If you chose to run on a random high numbered port, the volume of those will reduce significantly.

## Backups

Backups aren't security. They are however what you'll need if your security has failed you. Backups kept on the system itself, or easily accessible from it, can be wiped by a malicious attacker. A VPS provider I once used had this happen when their security failed them. This is why I [pull my backups](/backing-up-home-assistant/) from a remote computer, as well as pushing them to an online repository.

_Footnotes_

* _As well as secrets, before I upload to GitHub I do an automatic re-write of my configuration, replacing people's names with place holders, and place names with other place holders. This is done with a script that does a simple search and replace for a list of key terms._
