---
title: Accessing the inaccessible
date: '2018-09-29T22:00:00.001+01:00'
tags:
- remote access
- openvpn
- cloud
- pivpn
- home assistant
- vpn
modified_time: '2022-02-01T11:23:45.213Z'
---

_Updated January 2022 to include details on Cloudflare's tunnel service, and Oracle's free VM offering._

Whether you're on a mobile broadband connection, sat behind CGNAT, or suffering from DS-Lite, a number of people want to be able to remotely access their [Home Assistant](https://www.home-assistant.io/) system, despite not having any way of getting inbound connections.

The Home Assistant [cloud service](https://www.nabucasa.com/) addresses this, for a monthy fee, but there's ways of doing it yourself.

One of the simplest solutions is [Cloudflare's tunnel service](https://developers.cloudflare.com/cloudflare-one/tutorials/share-new-site). It's a pretty simple process, as long as you can run their relay software you can be up and running in about 15 minutes. There's even an [add-on](https://github.com/brenner-tobias/addon-cloudflared) for those of you on Home Assistant OS.

Building your own relay service takes a bit of work, and you'll need a virtual machine somewhere on the cloud. That doesn't have to be expensive, it's (just) possible to run what you need on the free tier of Google Cloud Computing or AWS. If you can afford around $5 USD a month you can get a more powerful system on any of the cloud hosting providers (including Digital Ocean, or Azure). In 2021 Oracle introduced a [free tier](https://www.oracle.com/uk/cloud/free/) too that's more than enough here.

## Set up a VPN server (cloud)

I've already talked about [setting up PiVPN](/remote-access-via-pivpn/). You install this on your cloud hosted virtual machine, and the (OpenVPN) client on your Home Assistant server (yes, I'm afraid this largely rules out Home Assistant OS at this time). Use the default TUN (tunnel) connection.

You'll need to add firewall rules on the cloud environment to allow access to your VPN software. On Google Cloud Platform that's through the [Firewall rules](https://cloud.google.com/vpc/docs/firewalls) section, on AWS it's with [Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html). Azure and Digital Ocean have similar settings, if in doubt search for _your hosting provider_ and _firewall rules_.

## Set up the VPN client (home)

My instructions here assume you're using the official OpenVPN client on a Debian (eg Ubuntu, Raspbian, Hassbian, etc) based system. First you install OpenVPN:

```
sudo apt install openvpn
```

Copy the configuration file from the VPN server to `/etc/openvpn/`, but before you go any further you'll need to make some changes. The default configuration will route _all_ the traffic for your Home Assistant system through that system, which isn't likely to be what you want. You can solve that by editing the configuration file, and adding the following line before the `<ca>` line:

```
route-nopull
```

Now when the VPN starts the _only_ thing that will be reachable over it is that cloud system.

Next, add the following line to `/etc/default/openvpn`

```
AUTOSTART="all"
```

Finally, enable the client, reload the configuration and start the OpenVPN client:

```
sudo systemctl enable openvpn
sudo systemctl daemon-reload
sudo systemctl restart openvpn
```

At this point you'll want to check that the VPN is established. Assuming you're using the default PiVPN configuration type:

```
ping -c 2 10.0.8.1
```

You should see something similar to this:

```
PING 10.8.0.1 (10.8.0.1) 56(84) bytes of data.
64 bytes from 10.8.0.1: icmp_seq=1 ttl=64 time=39.7 ms
64 bytes from 10.8.0.1: icmp_seq=2 ttl=64 time=148 ms

--- 10.8.0.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 39.724/94.045/148.366/54.321 ms
```

Your numbers in the time and rtt values will be different, but the key thing is you get two response lines like that. If you don't then the VPN didn't start. Check on your cloud server that the VPN software is running, and check on the Home Assistant system for any errors in the logs (`/var/log/openvpn.log`)

## Set up a reverse proxy (cloud)

You can test that connectivity is working from this side by running this on the cloud server:

```
ping -c 2 10.0.8.2
```

You should see something similar to this:

```
PING 10.8.0.2 (10.8.0.2) 56(84) bytes of data.
64 bytes from 10.8.0.2: icmp_seq=1 ttl=64 time=49.7 ms
64 bytes from 10.8.0.2: icmp_seq=2 ttl=64 time=48.1 ms
```

With that working, install your choice of [NGINX](https://www.home-assistant.io/docs/ecosystem/nginx/), [Caddy](https://www.home-assistant.io/docs/ecosystem/caddy/), HA Proxy, [Apache](https://www.home-assistant.io/docs/ecosystem/apache/) or whatever. I've got a guide for configuring an [older version of NGINX](/nginx-and-home-assistant/), but it won't work on a current version without changes.

When you configure your reverse proxy, you configure it to forward the traffic to the VPN IP of your Home Assistant system. That's easy enough to find:

```
ip addr show tun0
```

That will spit out something like the following:

```
34: tun0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN group default qlen 100
    link/none
    inet 10.8.0.2/24 brd 10.8.0.255 scope global tun0
        valid_lft forever preferred_lft forever
    inet6 fe80::dead:beef:1234:cafe/64 scope link flags 800
        valid_lft forever preferred_lft forever
```

The key thing you're looking for is that third line, **`10.8.0.2`**. That's the IP address you need to use in your proxy configuration. The odds are good that it will be the same IP as I've got here though, because that's from my own system, with a VPN connection to a PiVPN system.

On NGINX your config line will be:

```
proxy_pass http://10.8.0.2:8123;
```

## DNS (cloud)

Assuming you've not paid for a static IP, install your chosen DDNS update client on your VM, and configure it to update your IP as it changes. There are many clients to chose from, but [inadyn](https://github.com/troglobit/inadyn) and [ddclient](https://sourceforge.net/p/ddclient/wiki/Home/) are worth a look. You could also pay your VM provider for a static IP if you want to.

## HTTPS (cloud)

Now you need to get SSL certificates for your proxy. If you're using Let's Encrypt then you've got [certbot](https://certbot.eff.org/docs/install.html), and also [dehydrated](https://github.com/lukas2511/dehydrated). Once you've sorted that you'll need to configure your proxy to use them, and restart the proxy when the certificate updates.

On NGINX for example you'll have something similar to:

```
ssl on;
ssl_certificate /etc/letsencrypt/live/yourhost.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourhost.example.com/privkey.pem;
```

## All done now

It's been a long journey to this point, but it should be done. You can now try connecting to your proxy server, and it'll connect you through to your Home Assistant server. This works because your Home Assistant server is connecting _out_ to your cloud based server.

Don't forget to keep your cloud server updated. Most distributions can help you there by automatically applying at least security patches.
