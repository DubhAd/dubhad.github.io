---
title: Remote access for Home Assistant (and other things)
date: '2018-01-10T09:00:00.000Z'
toc: true
tags:
- remote access
- home assistant
modified_time: '2018-01-10T14:42:40.087Z'
---

_A (quick) primer on how to access a your Home Assistant server, or other device, from outside your network, with a dynamic DNS service._  
You'll use a dynamic DNS service for a few reasons:  

1.  You can't get an SSL certificate for an IP address, and you'll need an SSL certificate if you're wanting to connect any cloud services to Home Assistant (be warned though, Amazon [explicitly don't support Let's Encrypt](https://developer.amazon.com/docs/custom-skills/security-testing-for-an-alexa-skill.html#22-skills-hosted-as-web-services-on-your-own-endpoint) for Alexa endpoints).
2.  Unless your ISP allocates static IP address, it'll change at some point (and even if they do, it may still change). By using a hostname then when that happens you don't have to reconfigure all your connected services.
3.  For remote access, a hostname is much easier to remember than an IP address.

## Terminology

*   _Device_: This may be a computer (running Home Assistant for example), a DVR, a web-cam, anything on your network that you can access from your network, but want to be able to access from outside it.
*   _LAN_: Your network
*   _WAN_: Your connection to your ISP's network (and from there, the Internet)

## Before You Begin

**Check the WAN IP address of your router** - if it looks like `10.x.x.x`, `192.168.x.x` or `172.16.x.x` to `172.31.x.x` then you have what is known as an [RFC1918 IP address](/rfc1918/) (often referred to as private addresses). You will need to contact your ISP to find out how to get a public IP address, or have traffic routed to you. **Until that is done you won't be able to get anything else working**.  

The only way to be certain of the WAN address is to look at your router, or if you have one your ADSL modem. You can use one of the many web pages that will tell you what your WAN IP address appears to be. Be warned however that if you are behind a proxy server, or you have one of the RFC1918 IP addresses referred to above, they will report the wrong IP address and you will waste time trying to get this working.  
  
### ADSL or multiple routers

If you have a separate ADSL modem (that's really a router) and router, or you have multiple routers, what follows isn't enough. You'll also need to forward the same ports from the external network device (ADSL modem or router) to the internal router before forwarding those ports from the internal router to the device you're trying to access. It is advisable if you're in this situation to put your modem into bridge mode if possible - your ISP will be able to advise on this.  
  

* * *

## Summary

There are 6 general steps:

1.  Create your dynamic DNS hostname with a provider of your choice.
2.  If you have a dynamic IP address (if you don't know - you have one), configure a device on your network (that is always on) to update your hostname with your IP address. Your choice of software will depend on what provider you use - they'll have a list. If you're running Home Assistant then Hass.io has an [add-on for DuckDNS](https://home-assistant.io/addons/duckdns/).
3.  Configure the device you want to forward traffic to with either a static IP address, or a static DHCP lease. This ensures that the time spent configuring the router (in a moment) isn't wasted if/when the IP on your device changes.
4.  Test the device from your network.
5.  Configure your router to forward traffic to your device. How you do this depends on your router, and what you want to access. Fortunately there is a web site that publishes guides.
6.  Test your setup from outside your network.

### Step 1 - Create your hostname

Create your dynamic DNS hostname with your provider of choice ([DuckDNS](https://www.duckdns.org/), [No-IP](https://www.noip.com/free), etc), or if you have your own domain and a DNS provider that supports dynamic updates, create the hostname there. If asked for an IP address when creating the hostname use the auto-detected value or enter `192.0.2.1` - the IP address will be replaced by your update client later.

### Step 2 - Configure Updating

If you have a dynamic IP address from your ISP, you have to make one basic decision - are you going to do your updating from your router, or from a PC? Running it from a PC (Windows, Linux or other) can mean that you get better logging and more control, but may result in more network traffic and greater delays in updating changed IP addresses (10 minutes rather than 1 minute). Using a router should be easier, if your router supports your chosen provider. If you are running your updater on Linux/\*BSD or any other non-Windows platform it is generally best to install from a package (whether that be an RPM, a DEB or from ports/pkg). That way you should get the required startup scripts and a sample configuration file.  

If you're running the Hass.io install of Home Assistant then it has an [add-on for DuckDNS](https://home-assistant.io/addons/duckdns/)  

### Step 3 - Configuring the Device

You need to ensure that the device you forward traffic to has a static (aka fixed) IP address. If you don't do this then at some point the IP could change, and you'll be wondering why it's suddenly broken.  
There are 2 ways of doing this.  

1.  On the device itself - how you do this depends on the device or underlying operating system
2.  On the DHCP server (usually on the router) - many offer the option of assigning a fixed IP address to any given device (usually by MAC address)

If you go with option (1) make sure that you use an IP address outside of the range your DHCP server is allocating from. If you don't do this you'll end up with a duplicate IP on your network, and things won't work. In the rest of this document I'll use `192.168.0.1` to refer to this IP address.  

### Step 4 - Initial Testing

At this point you should be able to connect to the device, using the chosen IP address, from another computer on the LAN (it is important not to test from the device running the service). Until you get this to work there's no point in going further.  

### Step 5 - Before Configuring the Router

Your first step here is identifying what port(s) you need to forward.  

If you access the device with a web browser and a URL that looks like `https://192.168.0.1/` then you'll want to forward port 443/TCP. If it looks like `https://192.168.0.1:8123/` then you'll want to forward the number after the colon (:) - in this case port 8123/TCP.  

Other ports can usually be found easily by visiting Google, or consulting the appropriate guide (more in a moment).  

Now, before you configure your port forwarding there may be a problem. Some routers will not actually forward traffic on the same port as their administrative interface uses, even though they'll happily let you set that up. If this applies to your router it'll be easy to spot - instead of getting the device you expected to see you'll get your router's admin page (or a login prompt for the router).  

At this point you have 3 choices:  

1.  If supported, move the admin page to a different port
2.  Forward a different port
3.  Try a firmware upgrade, or alternative firmware (DD-WRT, OpenWRT etc) where supported

### Step 6 - Configuring the Router to Forward Traffic

Now it's time to configure the port forwarding. The manual that came with the router will detail how to do this, but if you've lost it (or don't want to look for it) there's a [handy website with guides](https://portforward.com/), and they even provide a program called PFConfig to do it for you.  

All you have to do is pick your router, pick the program you want to forward traffic to (or the protocol) and follow the instructions - complete with pictures.  

Be aware of problems with a small number of routers - on these if you configure the port forwarding using the hostname of the device to forward to then you may have problems. You have to use the IP address at all times.  

### Step 7 - Testing

You now need to test from outside your LAN with the dynamic DNS hostname. The reason for testing from outside your LAN is that not all routers support loopback connections. There are several ways to test this:  

1.  Via a suitable online page. For web servers (or anything which uses a browser interface) there are various (limited functionality) online browsers. For email servers you can use the [MX Toolbox service](https://www.mxtoolbox.com/), which allows you to run some basic checks.
2.  From an external PC, mobile phone, online proxy or a VPN to a remote location. This will give you a proper test, allowing you to see what others would see. If you are using a computer ensure that you do your testing from another home user connection. Many public connections and work networks block ports and may make it look like it's not working, when it really is.
3.  The [Open Port Tool](https://www.yougetsignal.com/tools/open-ports/) allows you to check if portforwarding on your router is correctly configured, and your application is listening on the related port(s).

## It doesn't work!

Before you panic, take a few minutes to go through the steps above again, checking that you've got it all right. It could be that you've made a typing error in the IP or port, selected UDP when you should have selected TCP, or just forgot to hit save on the router's configuration page.  

Now, if you are using a web browser and a port other than port 80, are you remembering to specify the port. For example, if you are using port 8080 then you would enter `http://dynamic.example.org:8080/` in the URL bar of your web browser. Many problems are caused by not specifying the port.  

Next, check that the IP address your hostname resolves to is the same as the WAN IP address of your router. If it doesn't, wait 10 minutes and check again. If it still doesn't then check that your update client is working and has updated your hostname with the current WAN IP. If it has you may need to change your DNS servers (OpenDNS, Google, and others all run free DNS servers) or flush your DNS cache.  

If your router has a WAN IP address that looks like `10.x.x.x`, `192.168.x.x` or `172.16.x.x` to `172.31.x.x` then you have what is known as an RFC1918 IP address. You will need to contact your ISP to find out how to get a public IP address, or have traffic routed to you.  

Another thing to consider is that some ISPs block incoming traffic on common server ports (or just anything below port 1024). If you're trying to access a web based service (that is, with a web browser), then try forwarding a different port (say 10080) to your device. If that works then your ISP is blocking traffic on that port.
