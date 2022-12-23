---
title: Turbulence ahead - fasten your seatbelt
date: '2018-08-24T18:22:00.002+01:00'
tags:
- security
- proxy
- home assistant
modified_time: '2018-11-10T18:00:20.832Z'
---

With 0.77 it looks like the new Home Assistant authentication platform will be mandatory. For almost everybody it'll be a _meh_ moment - ensure the legacy auth is enabled, and you're done.

For those of us who moved to doing authentication in a proxy server, because a single password for **everything** scared us, this is going to require some change.

## Take a deep breath

You'll need to enable the legacy auth, and then configure your proxy to set the required header. This requires the addition of... _a single line_ to your proxy configuration. Ok, two lines if you're using Apache.

**NB:** I've updated this to use the new _Long Lived Access Token_ that you create in your user profile.

Yes, the change here is minor, trivial almost. If you enable the new authentication then you'll have the option of using that or the API password to log in to the front end regardless of what you do here. The header we're adding only seems to be used by the API.

I've tested the following on my development system, using NGINX. I don't run the others, but I've checked the documentation for each of them so this should be correct.

### NGINX

On NGINX you add the following to the location section(s) of your configuration:

```
proxy_set_header proxy_set_header Authorization "Bearer YOUR_LONG_LIVED_ACCESS_TOKEN";
```

## Caddy

On Caddy you add the following to the proxy section(s) of your configuration:

```
header_upstream Authorization "Bearer YOUR_LONG_LIVED_ACCESS_TOKEN"
```

Alternatively, you can do the same in the header section if you want it for every page:

```
Authorization "Bearer YOUR_LONG_LIVED_ACCESS_TOKEN";
```

## HAProxy

On HA Proxy you add the following to the backend section(s) of your configuration:

```
http-request add-header Authorization "Bearer YOUR_LONG_LIVED_ACCESS_TOKEN"
```

## Apache

On Apache Proxy you add the following to the LocationMatch section(s) of your configuration:

```
Header add Authorization "Bearer YOUR_LONG_LIVED_ACCESS_TOKEN"
RequestHeader set Authorization "Bearer YOUR_LONG_LIVED_ACCESS_TOKEN"
```

## Going forwards?

It doesn't look like Home Assistant's auth system will support Basic authentication, which would appear convenient. Instead the developers are discussing effectively embedding authentication tokens in the URLs for external services. That'll probably be even easier to adapt to though

At that point I'll probably switch from NGINX to HA Proxy. Nothing I'm doing really needs NGINX, and HA Proxy should be faster given I'm running all of this on a Pi.
