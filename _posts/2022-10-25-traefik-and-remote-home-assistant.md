---
title: Traefik and a remote Home Assistant
date: '2022-10-25T21:17:00.000+01:00'
tags:
- remote access
- home assistant
modified_time: '2022-10-25T21:17:39.273+01:00'
---

I've been playing with [Traefik](https://traefik.io/) lately, for remote access for various things in my Docker stack, and I decided to see if it was possible to also use it for Home Assistant, despite that being on a remote host.

The answer is (otherwise I wouldn't havewritten this) yes - and I can continue my practice of limiting access to only parts of the API I want to expose. I used [this guide](https://medium.com/@containeroo/traefik-2-0-route-external-services-through-traefik-7bf2d56b1057) to get myself going.

There's nothing special about the core of my [Traefik configuration](https://gist.github.com/DubhAd/5fffb74c683dd0d96f71d41928ca502a). I'm using [ZeroSSL](https://zerossl.com/) here, instead of [LetsEncrypt](https://letsencrypt.org/), purely becauseI'm already using LetsEncrypt for my existing proxy and didn't want to hit rate limits while experimenting.

I'm using the [file provider](https://doc.traefik.io/traefik/providers/file/) to define the connection to Home Assistant, and that configuration too is [pretty simple](https://gist.github.com/DubhAd/d6d95418ef3b57e282bd556007461fba). The key is the `loadBalancer` setting, that directs Traefik to the remote host.

### Step by step

Set up your file (or in this case folder) provider, eg:

```yaml
providers:  
  docker:  
    exposedByDefault: false  
  file:  
    directory: /config  
    watch: true
```

Any configuration files that are dropped in that folder will be automatically loaded since watch is set to true. The same goes for any changes to existing files.

Next set up the [router](https://doc.traefik.io/traefik/routing/routers/) - in this case I'm using `http.yml` in the folder mapped as `/config`:

```yaml
http:  
  routers:  
    homeassistant:  
      entryPoints:  
        - "websecure"  
      rule: "Host(\`homeassistant.example.org\`) && ( PathPrefix(\`/api/webhook\`) || PathPrefix(\`/api/telegram\_webhooks\`) || PathPrefix(\`/api/frigate/notifications\`) )"  
      tls:  
        certResolver: zerossl  
        domains:  
          - main: "homeassistant.example.org"  
      service: homeassistant
```

The key things to note here are:

* I'm limiting access to only parts of the API that I want to have remote access to. That is:
  * Webhooks for things like GPSLogger and the official Home Assistant Android app
  * Telegram bot
  * Frigate notifications 
* I've explicitly named the hostname for the certificate. This apparently isn't needed, though for some reason it wouldn't generate a certificate request until I did this.

I didn't initially appreciate that Traefik uses backticks, not normal quotes, in the config file, which did cause me a bit of wasted time.

The [service](https://doc.traefik.io/traefik/routing/services/) goes in the same file:

```yaml
  services:  
    homeassistant:  
      loadBalancer:  
        servers:  
          - url: "http://192.168.1.42:8123"  
        passHostHeader: true
```

Now all you have to do is restart Traefik to load the file provider config, whichthen loads everything else. If it all went well you'll have a new working HTTP Router and Service entry in your Traefik dashboard, with a TLS domain, it not it's time to check the logs to see what went wrong.
