---
title: Cloudflare tunnels with authentication
date: '2023-04-28T07:00:00.000+00:00'
tags:
- remote access
- cloudflare tunnel
- authentication
- traefik
modified_time: '2023-04-28T11:34:00.000+00:00'
toc: true
---

I mentioned before that I was [using Traefik]({% post_url 2022-10-25-traefik-and-remote-home-assistant %}), what I didn't say is that I was also using [Authentik](https://goauthentik.io/) for authentication. Sometimes as [forward auth](https://goauthentik.io/docs/providers/proxy/forward_auth) (providing authentication for services that don't support it, like [Frigate](https://frigate.video/)), other times as a provider for apps that support it.

I'd also been messing about with [Cloudflare tunnels](https://www.cloudflare.com/en-gb/products/tunnel/), and yesterday I discovered that it also supports [authentication](https://developers.cloudflare.com/cloudflare-one/identity/).

So... I thought _I wonder if I can use Cloudflare tunnels with authentication, and still route traffic through Traefik_?

The answer is obviously _yes_ or you wouldn't be reading this. So... _how_?

## Big picture

There's a few pieces to this

1. Configure authentication (_identity_) in Cloudflare Zero trust
2. Create a default access group so you don't have duplicate the access logic manually
3. Create a self hosted application that uses the default access group
4. Set up your Tunnel
5. Route hostnames (applications) through the tunnel to Traefik
6. Have Traefik handle the connection to the application

## Authentication

The first thing to do is to head over to your Cloudflare dashboard, head to _Zero trust_, and under _Settings_ pick _Authentication_.

Here we can add a new login method. As I use Authentik one option here would be to use SAML and hook into Authentik, but I took the lazy approach and used _Google Workspace_ as my domain uses Google Workspace. There are however [plenty of other options](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/), including GitHub and OpenID.

Pick the option (or options) that suit you best and set them up. If you pick a single option then the user experience is going to be smoother, but it's only one more click ad screen for the user. 

## Application configuration

Next under the _Zero trust_ section head to _Access_ and then [_Access groups_](https://developers.cloudflare.com/cloudflare-one/identity/users/groups/). Here you can define a group (or groups) for access. I'm creating a default group for everybody in the domain:

![group](/assets/images/2023-04-28/cloudflare-groups.png)

Now under _Access_ and _Applications_ we can create a new [_self hosted_ application](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/).

* I keep the name and the sub-domain the same, just to make it easier to know what's what - you'll use this sub-domain again later for the tunnel configuration
* Session Duration I leave at the default
* I don't use the launcher, but I've left it enabled in case I change my mind
* I enable only the relevant identity providers, disabling the One Time Pin option
* If you only have a single provider it makes sense to enable the skip option

![application](/assets/images/2023-04-28/cloudflare-application.png)

Having created a default access group already the next step is easy. Give the policy a name and leave everything else at the defaults.

![policy](/assets/images/2023-04-28/cloudflare-policy.png)

## Setting up the tunnel

Then, still in _Zero trust_, go to _Access_ and pick _Tunnels_.

Here you can create a tunnel, giving it a name, and then install the tunnel software. As I run everything in Docker all I had to do to install the tunnel software was add the following lines to my compose file:

```yaml
  cloudflared:
    container_name: cloudflared
    image: cloudflare/cloudflared
    restart: unless-stopped
    command: tunnel run
    env_file: cloudflared.env
```

You can see the token you'll need on the _Install connector_ page, in the box for step 4:

```sh
cloudflared.exe service install ZILXRhZqTvJcirar68yyqOyfoKSUZoE9mE0oj6jFFyf6VXYzzHlDHD1deadbeefcafe6wuKRzuqHNJRcSibGdJTor1fvZa4WRRikdxKdwan1Atwi2z1Yfe2d4NIK7RXzmPApqs4PkcTu298DXvVs4W0JaFSI46y82WfkjxdrZ8Qxv5DN7ruQaxh2
```

(no, that's not my token, I generated a nice long random string)

That goes in `cloudflared.env`:

```
TUNNEL_TOKEN=ZILXRhZqTvJcirar68yyqOyfoKSUZoE9mE0oj6jFFyf6VXYzzHlDHD1deadbeefcafe6wuKRzuqHNJRcSibGdJTor1fvZa4WRRikdxKdwan1Atwi2z1Yfe2d4NIK7RXzmPApqs4PkcTu298DXvVs4W0JaFSI46y82WfkjxdrZ8Qxv5DN7ruQaxh2
```

Now it's just a matter of bringing the tunnel up:

```sh
docker compose pull cloudflared
docker compose up -d cloudflared
```

If you check your tunnel on the tunnel page you should see it now says _healthy_. If it doesn't check the container logs (I do like [Dozzle](https://dozzle.dev/) for that).

Next we route the traffic, using the same subdomain as for the application configuration. The tunnel's _Additional application settings_ is also where you can find _Access_ where you can enable [_Protect with Access_](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/#5-validate-the-access-token) for the application. When you enable _Protect with Access_ remember to pick the application name from above - if you don't then access will be denied.

![public hostname](/assets/images/2023-04-28/cloudflare-tunnels-public-hostname.png)

This is where Traefik comes into play. ![but why?](/assets/images/2023-04-28/butwhy.jpg){: width="400" .align-right style="clear: right"}
Yes, I've configured the tunnel to point to Traefik, using the name of the container (as it's in the same stack). 

<del>Two</del> Three reasons:

1. I can have Traefik do any further [filtering I want]({% post_url 2023-03-18-limited-remote-access %})
2. Traefik's middleware support (authentication, compression, etc)
3. I don't have to build out the logic of what runs where in Cloudflare, that can stay in my local network

## HTTPS redirect

Before we leave Cloudflare, [set up _Always use HTTPS_](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/#encrypt-all-visitor-traffic) under _SSL/TLS -> Edge Certificates_ for your domain.

![always use HTTPS](/assets/images/2023-04-28/cloudflare-https.png)

## Traefik

The first thing to do in Traefik is to remove any blanket HTTP -> HTTPS redirect you set up since Cloudflare is handling SSL for you now. If you don't then you're going to be wondering why you're getting a _too many redirects_ error and nothing is working.

The container labels become much simpler:

```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.homeassistant.rule=Host(`homeassistant.ceard.tech`)"
      - "traefik.http.routers.homeassistant.entrypoints=web"
```

We're simply enabling Traefik, telling it the hostname, and telling it to use the (insecure) entrypoint. Rebuilding the container makes the required changes:

```sh
docker compose pull homeassistant
docker compose up -d homeassistant
```

## All done now

Now I can remotely access `https://homeassistant.ceard.tech/` through Cloudflare without any port forwarding, and have it require external authentication before I can connect.

Clearly actually doing that for Home Assistant will break the mobile app, the use of any voice assistant, or any other non-UI remote access. If you're going to need any of those then doing this is a _Bad Idea_&#8482;. On the other hand, for separate remote UI access (in a browser) it works well, and it'll work for many other applications too. I plan on using this for most of the remote access I use, for things like Photoprism, Paperless-NGX, WikiJS, and maybe even Frigate now that it's no longer against the T&Cs to stream video over a tunnel.