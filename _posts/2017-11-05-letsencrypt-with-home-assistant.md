---
title: LetsEncrypt with Home Assistant
date: '2017-11-05T19:46:00.000Z'
tags:
- ssl
- home assistant
- remote access
modified_time: '2018-01-16T10:46:29.400Z'
---

Many people want to have remote access to their Home Assistant system, whether for an API (eg Google Assistant), or simply to be able to check on their home while away.

At the simplest you need a hostname that resolves to your external (WAN) IP address, and for those with a dynamic IP (which is most) then the [DuckDNS component](https://home-assistant.io/integrations/duckdns/) solves that. But that doesn't enable encryption (aka HTTPS). If you're on Hass.io then it already has an add-on to handle it all, but for everybody else you need to solve that bit manually.

## Setting up the certificate

Fortunately [LetsEncrypt](https://letsencrypt.org/) makes that easy through their [certbot tool](https://certbot.eff.org/about/). Unfortunately there are few guides on using it with Home Assistant, and people get stuck. With that in mind, let's begin, using the `pi` account for all the commands, **not** the `homeassistant` account

1. Forward port 80 on your router to port 80 on your Home Assistant system - you'll need to also forward another port for HTTPS access, this one is for certbot
2. [Install certbot](https://certbot.eff.org/docs/install.html)
3. Request a certificate with
   ```bash
   $ sudo certbot-auto certonly --standalone --preferred-challenges http -d example.duckdns.org
   ```
   (replace `example.duckdns.org` with your actual domain)
4. Configure Home Assistant's [http component](https://home-assistant.io/integrations/http/) with the certificate locations
5. Forward the port for HTTPS access (you can use 8123, or 443, or anything above 1024 that you're not already using)
6. Test it out from outside your network

Now, you might run into problems. Sometimes the permissions on some of the letsencrypt folders don't get set correctly - the give away is an error that includes `Invalid config for [http]: not a file for dictionary value @ data['http']['ssl_certificate']`. If that happens try the following command:

```bash
$ sudo chmod a+x /etc/letsencrypt/live /etc/letsencrypt/keys /etc/letsencrypt/archive
```

Then try again.

## Renewing the certificate

To renew your certificate, create a file called `/etc/cron.daily/certbot` and put the following in it:

```
#!/bin/sh
/usr/local/bin/certbot-auto renew
```

Home Assistant will detect the updated certificate automatically and start using it, you don't need to restart. Once you've done that, you'll need to run:

```bash
$ sudo chmod a+rx /etc/cron.daily/certbot
```

It's possible that `certbot-auto` won't be installed in `/usr/local/bin` - you can check that by running:

```bash
$ which certbot-auto
```

If that's the case use that path in the script above.
