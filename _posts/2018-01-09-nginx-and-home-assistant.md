---
title: NGINX and Home Assistant
date: '2018-01-09T19:44:00.001Z'
tags:
- remote access
- home assistant
- nginx
modified_time: '2018-04-29T21:38:28.266+01:00'
---

I'm going to assume that you've already got [Let's Encrypt](https://www.blogger.com/2017/11/letsencrypt-with-home-assistant.html) or your chosen SSL provider configured, and that you've forwarded the port your using.

But now you've decided you want finer grained control of access than Home Assistant can provide, or maybe you want to make some use of NGINX's other features. You've read the [official guide](https://home-assistant.io/docs/ecosystem/nginx/) and [the forum](https://community.home-assistant.io/t/homeassistant-nginx-ssl-proxy-setup/53) and they've left you scratching your head in confusion. What follows is a condensed version of those, based upon my own more complicated [configuration](https://github.com/DubhAd/Home-AssistantConfig/tree/master/etc/nginx/conf.d), but you can start simpler.

## Installation

First, install NGINX. On any Debian based distribution (such as Raspbian) you do that with:

```bash
$ sudo aptitude update
$ sudo aptitude install nginx
```

If you get an error about `aptitude` not being found then:

```bash
$ sudo apt-get install aptitude
```

then try again.

## Configuration

Then there are two files you need. **`/etc/nginx/conf.d/proxy.conf`**

```
proxy_redirect off;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
client_max_body_size 10m;
client_body_buffer_size 128k;
proxy_connect_timeout 90;
proxy_send_timeout 90;
proxy_read_timeout 90;
proxy_buffers 32 4k;
```

In the following, change `yourhost.example.org` for your hostname **`/etc/nginx/conf.d/yourhost.example.org.conf`**


```
server {
 listen 8443; # Must be different from your Home Assistant port
 server_name yourhost.example.org;
 access_log /var/log/nginx/yourhost.example.org.access.log;
 error_log /var/log/nginx/yourhost.example.org.error.log;

 ssl on;
 ssl_certificate /etc/letsencrypt/live/yourhost.example.org/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/yourhost.example.org/privkey.pem;

 proxy_buffering off;

 location / {
  satisfy any; # Means that I can connect either from an allowed IP range, or with authentication
  allow 192.168.0.0/24; # My home network range
  allow 203.0.114.42/32; # My static IP from the ISP (remove if you don't have a static IP)

  auth_basic "Restricted"; #For Basic Auth
  auth_basic_user_file /etc/nginx/.htpasswd; # For basic authentication, managed by htpasswd
  include conf.d/proxy.conf;
  proxy_pass http://127.0.0.1:8123; # Assumes you're running this on the same host as Home Assistant
  proxy_set_header Host $host;
  proxy_http_version 1.1;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection $connection_upgrade;
  proxy_set_header Authorization $http_authorization;
  proxy_pass_header Authorization;
 }

 location /api/notify.html5/callback {
  if ($http_authorization = "") { return 403; }
  allow all;
  proxy_pass http://127.0.0.1:8123;
  proxy_set_header Host $host;
 }
}
```

## Authentication

You'll notice that I'm using authentication. You create this with the `htpasswd` command:

```bash
$ htpasswd -c /etc/nginx/.htpasswd myusergoeshere
```

After you create the file, you add users with:

```bash
$ htpasswd /etc/nginx/.htpasswd myotheruser
```

If you don't want to do authentication in NGINX, remove the lines that start `satisfy`, `allow`, and `auth_basic`.

Now (re)start NGINX. Then update your port forwarding on your router, so that instead of going directly to your Home Assistant port, it goes to your NGINX port.

## Home Assistant configuration

As mentioned, I'm doing authentication in NGINX. That means that in Home Assistant you can update the [`http:` component](https://home-assistant.io/integrations/http/) and comment out the `api_password:` line (then restart Home Assistant) if you want to (I have). Do be aware though that if you're using `trusted_networks:` then it's likely that your NGINX server is within that if it includes your home IP range. Similarly, if you use `ip_ban_enabled:` then that will block your proxy, not the originating IP. If you want to do IP based blocking, then you'll want to install and configure [fail2ban](https://www.fail2ban.org/wiki/index.php/Main_Page) with NGINX.
