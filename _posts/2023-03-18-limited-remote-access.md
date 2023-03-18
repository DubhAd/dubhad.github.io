---
title: Limited remote access for Home Assistant
date: '2023-03-18T19:41:00.000+00:00'
tags:
- mobile app
- home assistant
- android
- ios
- proxy
modified_time: '2023-03-18T19:41:00.000+00:00'
---

I mentioned [on the Home Assistant forum](https://community.home-assistant.io/t/security-serious-question-not-trolling/324077/12) about allowing access to only _the bits you need_, and that I do this for the mobile app. I didn't mention what that means in practice, or how I worked it out.

## The answer

To skip ahead to the answer, you need to allow:

```
/api/webhook
/api/websocket
/auth/token
```

Based on my poking about:

1. `webhook` seems to be required for all the sensors and location reporting
2. `websocket` is needed for notifications and maybe other things (you can possibly get away without this)
3. `auth` is needed for the periodic authentication refresh

## How did I get there?

There's two starting points, deny everything or permit everything. The first allows you to more quickly identify what you need, but things won't work while you do that. The latter allows you to have everything working while you gather the data you need. In either case, you're going to use the proxy access logs to see what URLs are being requested.

If you're wanting the least painful route, permit everything first. Then you can review a 24 hour slice of your log to see what was in it.

For instance, with Traefik to review all the logs on the 1st of April I ran:

```
grep "01\/Apr\/2022.*homeassistant" access.log|sed -e "s/.*\] \"//" -e "s/HTTP.*//"|sort|uniq -c
```

For NGINX it would be:

```
grep "01\/Apr\/2022" ha.example.net.access.log|sed -e "s/.*\] \"//" -e "s/ HTTP.*//"|sort|uniq -c
```

You'll get back results something like this (not actual IDs from my system):

```
     40 GET /api/websocket
    497 POST /api/webhook/7df6d4e8-4c8d-4fc2-8878-0ec20ceda06f
   1730 POST /api/webhook/1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
   2123 POST /api/webhook/fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321
    103 POST /api/webhook/30c69d57-cd8b-487f-8896-1b04cf53a843
     22 POST /auth/token
```

What did that command do? It found all the lines for the data in question, then it removed everything up to the first occurrence of `] "`, and after the first occurrence of `HTTP`. Then it sorts them and counts how often each unique entry was seen.

Now you can either:

1. Allow only those specific URLs
2. Take the slightly lazy approach and allow any webhook

Either way, you now know what URLs the app is using. This approach works for any proxy server, any (HTTP) backend, and any (HTTP) client.

Allowing the URLs is easy in Traefik, and I showed it in my [previous post]({% post_url 2022-10-25-traefik-and-remote-home-assistant %}). In NGINX it requires a lot more lines in your (NGINX) configuration. You can find my proxy.conf [here]({% post_url 2018-01-09-nginx-and-home-assistant %}), and then your main configuration will have the following added:

```
    # If you want to only allow specific webhooks, use this approach
	location /api/webhook/1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef {
		allow all;
		include conf.d/proxy.conf;
		proxy_pass http://127.0.0.1:8123/api/webhook/1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
		proxy_set_header Host $host;
		proxy_http_version 1.1;
		proxy_set_header X-Forwarded-For $remote_addr;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_ignore_client_abort on;
	}

    # If you're happy to allow all webhooks, use this
	location /api/webhook {
		allow all;
		include conf.d/proxy.conf;
		proxy_pass http://127.0.0.1:8123;
		proxy_set_header Host $host;
		proxy_http_version 1.1;
		proxy_set_header X-Forwarded-For $remote_addr;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_ignore_client_abort on;
	}

	location /api/websocket {
		allow all;
		include conf.d/proxy.conf;
		proxy_pass http://127.0.0.1:8123;
		proxy_set_header Host $host;
		proxy_http_version 1.1;
		proxy_set_header X-Forwarded-For $remote_addr;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_ignore_client_abort on;
	}

	location /auth/token {
		allow all;
		include conf.d/proxy.conf;
		proxy_pass http://127.0.0.1:8123;
		proxy_set_header Host $host;
		proxy_http_version 1.1;
		proxy_set_header X-Forwarded-For $remote_addr;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_ignore_client_abort on;
	}

	location / {
		satisfy any;
		deny all;
	}
```

This assumes that HA is accessible on `127.0.0.1` - adjust according to your setup.