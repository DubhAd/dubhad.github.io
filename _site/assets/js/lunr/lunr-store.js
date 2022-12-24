var store = [{
        "title": "Back it up",
        "excerpt":"I was going to write something else for the introductory article here, but in light of a few posts on forums lately, I thought I'd start with something more important. ## Backups Lots of people run their home automation platform without giving any thought to backups until it's too late....","categories": [],
        "tags": ["backup"],
        "url": "/2017/10/21/back-it-up.html",
        "teaser": null
      },{
        "title": "Putting the cart before the horse",
        "excerpt":"You're thinking of getting into home automation, so you've gone and bought a bunch of smart devices. Now you're looking for help in doing something with it all. Sound familiar? How many posts in forums, reddit, chat rooms, etc does this sound like? Home automation is a hot topic, there's...","categories": [],
        "tags": ["home automation","platform"],
        "url": "/2017/10/22/putting-cart-before-horse.html",
        "teaser": null
      },{
        "title": "What's the point?",
        "excerpt":"So many people I come across who're exploring home automation seem to be wanting to build big complex dashboards that they can use to control things from. Clearly they're overlooking the second word - automation. The point of any home automation system should be to simplify, not complicate. Why replace...","categories": [],
        "tags": ["home automation"],
        "url": "/2017/10/23/whats-point.html",
        "teaser": null
      },{
        "title": "Home Assistant - moving logs and database off the SD card",
        "excerpt":"One problem with running [Home Assistant](https://home-assistant.io/) on a Pi is that SD cards aren't great for high write situations, and the database and logs can be very chatty. The answer is to move those to a USB thumb drive, and extend the life of your SD card. You'll want a...","categories": [],
        "tags": ["home assistant"],
        "url": "/2017/10/23/home-assistant-moving-logs-and-database.html",
        "teaser": null
      },{
        "title": "Backing up Home Assistant",
        "excerpt":"It was suggested on the [Home Assistant](https://home-assistant.io/) Discord channel that I write a simple step by step for backing up your Home Assistant configuration. Now, before I begin, I will say **RAID IS NOT BACKUP**. RAID protects you from hardware failure, at most. You'll need file systems like ZFS or...","categories": [],
        "tags": ["backup","home assistant"],
        "url": "/2017/10/23/backing-up-home-assistant.html",
        "teaser": null
      },{
        "title": "Choosing a platform",
        "excerpt":"I'll open with noting that I use [Home Assistant](https://home-assistant.io/), but that doesn't mean you should. Here are some of the things _you_ should be considering when choosing the heart of your new home automation platform. ## Investment I don't _just_ mean money but also time. Generally speaking (and it is a...","categories": [],
        "tags": ["platform","home automation","home assistant"],
        "url": "/2017/10/24/choosing-platform.html",
        "teaser": null
      },{
        "title": "Backing up Hass.io",
        "excerpt":"> Note: When originally written there was no native backup for Home Assistant OS (Hass.io as it was then). Things have come a long way since and there are built in snapshots (called backups) and many add-ons that provide functionality for copying those snapshots to a remote destination. I've already...","categories": [],
        "tags": ["backup","hass.io","home assistant os"],
        "url": "/2017/11/03/backing-up-hassio.html",
        "teaser": null
      },{
        "title": "LetsEncrypt with Home Assistant",
        "excerpt":"Many people want to have remote access to their Home Assistant system, whether for an API (eg Google Assistant), or simply to be able to check on their home while away. At the simplest you need a hostname that resolves to your external (WAN) IP address, and for those with...","categories": [],
        "tags": ["ssl","home assistant","remote access"],
        "url": "/2017/11/05/letsencrypt-with-home-assistant.html",
        "teaser": null
      },{
        "title": "Which Home Assistant install is right for me?",
        "excerpt":"There are many, many ways of installing Home Assistant, and the choice can be confusing. Here's my very short take on what you'd want to use, and why: ## Make it work Do you just want it to work without caring how? Are you happy to dedicate your Pi or...","categories": [],
        "tags": ["hass.io","home assistant os","home assistant container","home assistant core","docker","platform","home assistant"],
        "url": "/2017/11/09/which-home-assistant-install-is-right.html",
        "teaser": null
      },{
        "title": "Upgrading the Python Virtual Environment",
        "excerpt":"Unless you're running local other software directly from the venv, consider [switching to Docker]({% post_url 2020-10-10-ha-venv-to-docker %}). It'll save you from ever needing to upgrade Python and rebuild the venv again. ## Updates * **December 2022** Python 3.9 deprecation * **October 2020** for Python 3.7 deprecation, and to add libraries...","categories": [],
        "tags": ["venv","python","home assistant"],
        "url": "/2017/12/08/upgrading-python-virtual-environment.html",
        "teaser": null
      },{
        "title": "Home Assistant Cloud",
        "excerpt":"Today something rather interesting was announced - the new [cloud component for Home Assistant](https://www.home-assistant.io/integrations/cloud). There's a few things that I think make this interesting: 1. It's going to make it easier for people to set up integrations like Alexa (which they're launching with), Google Assistant, and others 2. It will...","categories": [],
        "tags": ["cloud","home assistant"],
        "url": "/2017/12/17/home-assistant-cloud.html",
        "teaser": null
      },{
        "title": "Installing Home Assistant in a virtual environment (in Linux)",
        "excerpt":"> Note: This is based off the original Home Assistant virtual environment instructions - before they were reduced to a handful of steps. There are several reasons why it makes sense to run Home Assistant in a virtual environment. A [virtualenv](https://virtualenv.pypa.io/en/latest/) encapsulates all aspect of a Python environment within a...","categories": [],
        "tags": ["venv","python","home assistant"],
        "url": "/2017/12/25/installing-home-assistant-in-virtual.html",
        "teaser": null
      },{
        "title": "NGINX and Home Assistant",
        "excerpt":"I'm going to assume that you've already got [Let's Encrypt]({% post_url 2017-11-05-letsencrypt-with-home-assistant %}) or your chosen SSL provider configured, and that you've forwarded the port your using. But now you've decided you want finer grained control of access than Home Assistant can provide, or maybe you want to make some...","categories": [],
        "tags": ["remote access","home assistant","nginx","ssl"],
        "url": "/2018/01/09/nginx-and-home-assistant.html",
        "teaser": null
      },{
        "title": "RFC1918",
        "excerpt":"[RFC 1918](https://tools.ietf.org/html/rfc1918) defines a set of 3 IP ranges that are not routed across the Internet and can only be used on local networks. You will sometimes see these used on ISP networks, where the devices can only be accessed from within the ISP's network, not from the rest of...","categories": [],
        "tags": ["remote access","rfc1918"],
        "url": "/2018/01/09/rfc1918.html",
        "teaser": null
      },{
        "title": "Remote access for Home Assistant (and other things)",
        "excerpt":"_A (quick) primer on how to access a your Home Assistant server, or other device, from outside your network, with a dynamic DNS service._ You'll use a dynamic DNS service for a few reasons: 1. You can't get an SSL certificate for an IP address, and you'll need an SSL...","categories": [],
        "tags": ["remote access","home assistant"],
        "url": "/2018/01/10/remote-access-for-home-assistant-and.html",
        "teaser": null
      },{
        "title": "Why Home Assistant?",
        "excerpt":"I said [a while back]({% post_url 2017-10-24-choosing-platform %}) that I use [Home Assistant](https://home-assistant.io/), but I didn't really say why. ## Exploring the market I spent a few months looking at a number of open source platforms, and I only found one other actively developed comparable platform ([OpenHAB](https://www.openhab.org/)). The others were...","categories": [],
        "tags": ["platform","home assistant","openhab"],
        "url": "/2018/01/11/why-home-assistant.html",
        "teaser": null
      },{
        "title": "Remote access via PiVPN",
        "excerpt":"I've already talked about [setting up remote access]({% post_url 2018-01-10-remote-access-for-home-assistant-and %}), and [configuring SSL certificates]({% post_url 2017-11-05-letsencrypt-with-home-assistant %}) for Home Assistant. What though if you're not using cloud services, and just want to be able to interact with Home Assistant (or anything else on your network) while you're away. Or maybe...","categories": [],
        "tags": ["remote access","openvpn","pivpn","home assistant","vpn"],
        "url": "/2018/01/17/remote-access-via-pivpn.html",
        "teaser": null
      },{
        "title": "How not to break manual control of devices with automations",
        "excerpt":"A common problem that comes up all the time is when people want a light or switch (or anything else Home Assistant can control) to turn off automatically, but only if it was turned on with an automation. The answer to this is to use an [input boolean](https://home-assistant.io/integrations/input_boolean/) that you...","categories": [],
        "tags": ["input boolean","automation","home assistant"],
        "url": "/2018/01/17/how-not-to-break-manual-control-of.html",
        "teaser": null
      },{
        "title": "The secret is (not) to bang the rocks together",
        "excerpt":"[^1] _So many people seem to [purchase a stack of kit]({% post_url 2017-10-22-putting-cart-before-horse %}), and want it to magically work together, or see the low cost of entry by using an open source project, [and assume]({% post_url 2017-10-24-choosing-platform %}) they don't have to learn._ _If there's one thing I've learned...","categories": [],
        "tags": ["help","vampire","learning","home assistant"],
        "url": "/2018/01/18/the-secret-is-not-to-bang-rocks-together.html",
        "teaser": null
      },{
        "title": "Home Assistant and (basic) Presence Detection",
        "excerpt":"Reliable presence detection is a challenge for many people. In part this is because modern smartphones put WiFi (and apps) to sleep when they're idle. There are many ways of approaching this (just look at the threads on the [Home Assistant forum](https://community.home-assistant.io/) to see), but here's how I've tackled it...","categories": [],
        "tags": ["home assistant","presence detection"],
        "url": "/2018/01/25/home-assistant-and-basic-presence.html",
        "teaser": null
      },{
        "title": "Home Assistant, avoiding insecurity",
        "excerpt":"So, you're running Home Assistant, you've opened it up to the Internet, and you're worried about security?  You're not alone, so read on and see what you can do, and shouldn't do. ## Keeping Secrets Home Assistant has a configuration option for [secrets](https://home-assistant.io/docs/configuration/secrets/). This is very useful for re-using values, but...","categories": [],
        "tags": ["security","remote access","home assistant","backup"],
        "url": "/2018/01/29/home-assistant-avoiding-insecurity.html",
        "teaser": null
      },{
        "title": "Home Assistant - the Hass.io menu is missing",
        "excerpt":"_NB: Since writing this a lot has changed, I'm leaving this for historical reasons, but the information here is terribly outdated._ Well, they've updated the supervisor in Hass.io (now called Home Assistant OS) and the shopping bag is gone, the functionality has been moved inside the Hass.io menu. This post...","categories": [],
        "tags": ["hass.io","home assistant","add-ons"],
        "url": "/2018/02/15/home-assistant-shopping-bag-is-missing.html",
        "teaser": null
      },{
        "title": "It's not about the brand",
        "excerpt":"A question that comes up regularly with people new to HA seems to be _what brand of kit should I buy to use with Home Assistant._ That's the wrong question to ask at the start. The question you should be asking is _what problems am I trying to solve_. Now yes,...","categories": [],
        "tags": ["learning","automation","home assistant"],
        "url": "/2018/04/15/its-not-about-brand.html",
        "teaser": null
      },{
        "title": "The XY Problem",
        "excerpt":"I talked about the people who try (and usually fail) to make things work by [banging the rocks together](/the-secret-is-not-to-bang-rocks-together/), but there's another, more common, group. These are the people who've identified what they think of as the solution, and are totally focused on making that solution work. They'll [ignore all attempts](https://meta.stackexchange.com/questions/66377/what-is-the-xy-problem) to...","categories": [],
        "tags": ["problem"],
        "url": "/2018/08/16/the-xy-problem.html",
        "teaser": null
      },{
        "title": "Triggers and conditions and actions! Oh My!",
        "excerpt":"[Automations in Home Assistant](https://www.home-assistant.io/docs/automation/) can seem a little daunting at first. You look at the documents, and it can seem overwhelming. It's not that bad, honest. It can be summarised like this: * Trigger - the things that cause an automation to be started * Condition - an optional list...","categories": [],
        "tags": ["automation","home assistant"],
        "url": "/2018/08/18/triggers-and-conditions-and-actions-oh.html",
        "teaser": null
      },{
        "title": "Lovelace - the next generation of stock UI",
        "excerpt":"_NB: In 2022 Lovelace was renamed to simply Dashboards_ It's been 4 releases of [Lovelace](https://www.home-assistant.io/dashboards/) now, and it's settling in nicely. As of 0.74 you can do anything you can do in the old UI, and more with every release. You can even easily [duplicate your current configuration](https://sharethelove.io/tools/jinja-magic-scripts) courtesy of...","categories": [],
        "tags": ["dashboards"],
        "url": "/2018/08/19/lovelace-next-generation-of-stock-ui.html",
        "teaser": null
      },{
        "title": "Sensative strips (guard) review",
        "excerpt":"I've had one Sensative [strips guard](https://sensative.com/sensors/strips-zwave/guard/) installed since January 2017, and two more since October 2017, and thought it's long past time I wrote a little about what I thought of them (if you want to skip to the end - I like them). ## Form factor Well, it's hard...","categories": [],
        "tags": ["z-wave"],
        "url": "/2018/08/21/sensative-strips-guard-review.html",
        "teaser": null
      },{
        "title": "Turbulence ahead - fasten your seatbelt",
        "excerpt":"With 0.77 it looks like the new Home Assistant authentication platform will be mandatory. For almost everybody it'll be a _meh_ moment - ensure the legacy auth is enabled, and you're done. For those of us who moved to doing authentication in a proxy server, because a single password for **everything** scared...","categories": [],
        "tags": ["security","proxy","home assistant"],
        "url": "/2018/08/24/turbulence-ahead-fasten-your-seatbelt.html",
        "teaser": null
      },{
        "title": "Presence detection updated",
        "excerpt":"A while back I covered how I [was doing presence detection](/home-assistant-and-basic-presence/), and thought that since I've changed a few things I should update. ## Little Big Changes I've ditched groups for tracking. There's a simple reason for this - the group is a blunt instrument. I still use them indirectly,...","categories": [],
        "tags": ["presence detection","home assistant"],
        "url": "/2018/09/06/a-while-back-i-covered-how-i-was-doing.html",
        "teaser": null
      },{
        "title": "Home Assistant cloud goes paid",
        "excerpt":"The Home Assistant developers have [just announced](https://www.home-assistant.io/blog/2018/09/17/thinking-big/) that the [cloud services](https://www.nabucasa.com/) will shortly require payment. If you're currently using the cloud services during the free service but can't afford the $5 a month, or live in a part of the world which makes it effectively impossible to pay, then you've...","categories": [],
        "tags": ["cloud","home assistant"],
        "url": "/2018/09/18/home-assistant-cloud-goes-paid.html",
        "teaser": null
      },{
        "title": "Accessing the inaccessible",
        "excerpt":"_Updated January 2022 to include details on Cloudflare's tunnel service, and Oracle's free VM offering._ Whether you're on a mobile broadband connection, sat behind CGNAT, or suffering from DS-Lite, a number of people want to be able to remotely access their [Home Assistant](https://www.home-assistant.io/) system, despite not having any way of...","categories": [],
        "tags": ["remote access","openvpn","cloud","pivpn","home assistant","vpn"],
        "url": "/2018/09/29/accessing-inacessible.html",
        "teaser": null
      },{
        "title": "Upgrading from 0.75 to 0.80",
        "excerpt":"Today I finally upgraded from 0.75.3 to one of the versions with the new auth, 0.80.0 in this case. I'd delayed the upgrade because I expected some challenges with the new authentication interacting with my NGINX setup. Before I began, I checked the backups, cloned the venv and took a...","categories": [],
        "tags": ["home assistant"],
        "url": "/2018/10/13/upgrading-from-075-to-080.html",
        "teaser": null
      },{
        "title": "Presence detection - update 3",
        "excerpt":"[Last time](/a-while-back-i-covered-how-i-was-doing/) I said that I was probably going to go with the [Bayesian sensor](https://www.home-assistant.io/integrations/binary_sensor.bayesian) for presence detection, but I've changed my mind. Why, because of an occasional edge case in which people get marked away when they're not really away. The Pi is in a corner of the house,...","categories": [],
        "tags": [],
        "url": "/2018/10/15/presence-detection-update-3.html",
        "teaser": null
      },{
        "title": "Product comparison - smart displays",
        "excerpt":"I bought a [Google Home Hub](https://store.google.com/product/google_home_hub) recently, and then followed that up with a 10\" [Lenovo Smart Display](https://www.lenovo.com/gb/en/smart-display/) for the living room. Having lived with both, and bought a third device based upon my experiences, I thought I'd write up a little about them. This isn't a full review, there's no...","categories": [],
        "tags": ["smart display","google home","google assistant","home assistant"],
        "url": "/2018/12/30/product-comparison-smart-displays.html",
        "teaser": null
      },{
        "title": "Presence detection - are we nearly there yet?",
        "excerpt":"Yes, yet another update. This is what comes from trying to refine things. ## Bluetooth, bluetooth, everywhere My Home Assistant system sits in the far corner of the house from the front door. As a result the Bluetooth tracker is a bit hit and miss for entry. There's also a...","categories": [],
        "tags": ["home assistant","presence detection"],
        "url": "/2019/03/16/presence-detection-are-we-nearly-there.html",
        "teaser": null
      },{
        "title": "Breaking up automations/Room activity detection",
        "excerpt":"I'm sure we've all been there, where we've written automations that have grown longer and more complicated as we've tried to make things more flexible. Then you end up with a group of automations each hundreds of lines long, and still things don't work well. That's because you've created a...","categories": [],
        "tags": ["automation","home assistant","presence detection"],
        "url": "/2019/04/28/breaking-up-automationsroom-activity.html",
        "teaser": null
      },{
        "title": "My great migration - part one",
        "excerpt":"I've been running Home Assistant on my Pi3 since I started with HA, back in January 2017. I'd chosen a [Z-Wave GPIO hat](https://z-wave.me/products/razberry/) over a USB stick (amongst other things, because it avoided the risk of it getting disconnected in error), which has tied my Z-Wave mesh to the Pi....","categories": [],
        "tags": ["zigbee","z-wave","home assistant"],
        "url": "/2019/08/15/my-great-migration-part-one.html",
        "teaser": null
      },{
        "title": "The great migration - part two",
        "excerpt":"Well, that was less exciting than I'd feared. The first stage is done. Z-Wave is running on the Pi, and everything else runs on the VM, communicating over MQTT and the REST API. This is built from: * Binary sensors - ones to track the states of the sensors, and...","categories": [],
        "tags": [],
        "url": "/2019/08/28/the-great-migration-part-two.html",
        "teaser": null
      },{
        "title": "Messing with meshing",
        "excerpt":"Back when I started with home automation, Z-Wave was the obvious choice for sensors, smart sockets. You could mix and match any brand of device, and controller, and things would work. Zigbee was more of a minefield at the time. The universe has moved on, and Zigbee is becoming more...","categories": [],
        "tags": ["zigbee","z-wave","home assistant"],
        "url": "/2019/09/06/messing-with-meshing.html",
        "teaser": null
      },{
        "title": "Presence detection, the final countdown?",
        "excerpt":"The [last time](https://blog.ceard.tech/2019/03/presence-detection-are-we-nearly-there.html) I said that I didn't think there was more I could do. I was wrong. My use of [monitor](https://github.com/andrewjfreyer/monitor) hasn't changed, and I'll leave the config for that below. ## Changed behaviour Now I've changed the automations so that the majority wins for departure, rather than requiring...","categories": [],
        "tags": ["monitor","home assistant","presence detection"],
        "url": "/2019/10/27/presence-detection-final-countdown.html",
        "teaser": null
      },{
        "title": "Zigbee (and Home Assistant)",
        "excerpt":"So, you're using Home Assistant and want to use [Zigbee](https://zigbee.org/), but Home Assistant's own documentation doesn't really explain Zigbee, so you're a bit confused. What do you need to know? ## What is Zigbee Zigbee is a wireless communication protocol designed for personal area networks and well suited to home...","categories": [],
        "tags": ["zigbee","z-wave","home assistant"],
        "url": "/2019/11/17/zigbee-and-home-assistant.html",
        "teaser": null
      },{
        "title": "Presence detection, one last time?",
        "excerpt":"Well, it's been a while, but I think that, finally, I've stopped changing things. It's been a while since I needed to account for another edge case, so here we go... Oh, you may want to grab a cuppa before you dive in, this is a long one as I...","categories": [],
        "tags": ["monitor","bluetooth","gpslogger","proximity","home assistant core","nmap","home assistant","wifi","presence detection"],
        "url": "/2020/04/14/presence-detection-one-last-time.html",
        "teaser": null
      },{
        "title": "Cameras, motion detection, and (interesting) object detection (part one)",
        "excerpt":"For some time now I've had a camera (a 4K HikVision turret camera) at the front of the house, watching our garden, path, and parking area. I started with the motion detection capabilities of the camera, but the recorded stream would have many missing frames. Then I tried a variety...","categories": [],
        "tags": ["doods","motion","home assistant core","motion detection","object detection"],
        "url": "/2020/04/28/cameras-motion-detection-and.html",
        "teaser": null
      },{
        "title": "Moving from Wink to Home Assistant?",
        "excerpt":"I suspect a number of people are looking at leaving Wink right now, in light of the recent announcement. Some of you will be looking at Home Assistant and wondering what will work (_most of it_), and what you can do. In reality, this isn't going to be a drop...","categories": [],
        "tags": ["home assistant core","home assistant","wink"],
        "url": "/2020/05/09/moving-from-wink-to-home-assistant.html",
        "teaser": null
      },{
        "title": "Cameras, motion detection, and (interesting) object detection (part two)",
        "excerpt":"Well, it didn't take long for me to tweak my setup, so before we get to the template, and other things, I'll explain what I've changed. ## Same, but different I've been using one webhook to trigger everything, and blindly assume that the interesting activity ends a minute later. This...","categories": [],
        "tags": [],
        "url": "/2020/05/10/cameras-motion-detection-and.html",
        "teaser": null
      },{
        "title": "YAML in automations and scripts",
        "excerpt":"I see many people struggle with the formatting for automations (and scripts) because the official docs are structured in a manner that assumes you're going to read them in order. So, I thought I'd pull together a little primer. If you're a YAML purist you probably want to look away...","categories": [],
        "tags": ["yaml","home assistant core","automation","home assistant"],
        "url": "/2020/05/13/yaml-in-automations-and-scripts.html",
        "teaser": null
      },{
        "title": "Home Assistant, Docker, and using SSH",
        "excerpt":"A common problem that comes up with people using one of the Supervisor based install methods, or Docker, is that when they try to use ssh it fails, yet when testing it works. **_What. The. Heck?_** Well, you've hit two problems because of Docker - all your testing was done...","categories": [],
        "tags": ["ssh","docker","home assistant"],
        "url": "/2020/05/29/home-assistant-docker-and-using-ssh.html",
        "teaser": null
      },{
        "title": "HA venv to Docker",
        "excerpt":"Another year, another Python deprecation, another flood of posts asking how to upgrade a Python venv.  While you can certainly [do that](/upgrading-python-virtual-environment/), another option would be to move to Docker (at least assuming you're running on Linux). Then you don't have to do this next year. Moving to Docker is...","categories": [],
        "tags": ["docker","venv","linux","python","home assistant"],
        "url": "/2020/10/10/ha-venv-to-docker.html",
        "teaser": null
      },{
        "title": "Presence Detection Resurrection",
        "excerpt":"Yes, another update. Until I start using Blueprints I think this'll be the last one for a while. Probably. Oh, you may want to grab a cuppa before you dive in, this is a long one as I wanted to cover _everything_ relevant in one article. ## Goal The goal here...","categories": [],
        "tags": ["bluetooth","home assistant","presence detection"],
        "url": "/2021/01/03/presence-detection-resurrection.html",
        "teaser": null
      },{
        "title": "Zigbee2MQTT - Native to Docker migration",
        "excerpt":" A long time ago I started using Zigbee2MQTT - somewhere around 1.2 or 1.3. Back then I thought that it was easiest to run Zigbee2MQTT with a manual install, which was (and still is) the default instructions you'll find. Since then I've seen the light. Docker makes upgrades, and downgrades,...","categories": [],
        "tags": ["docker","zigbee2mqtt"],
        "url": "/2021/05/02/zigbee2mqtt-native-to-docker-migration.html",
        "teaser": null
      },{
        "title": "Why didn't my automation run?",
        "excerpt":"It's a common post on the HA Discord where people are confused as to why their automation isn't running, they've got a trigger, and a few conditions, and ... nothing happens. ```yaml trigger: - platform: numeric_state above: '22' entity_id: sensor.temperature condition: - condition: time after: '22:00:00' before: '08:00:00' - condition:...","categories": [],
        "tags": ["automation","home assistant"],
        "url": "/2021/07/18/why-didnt-my-automation-run.html",
        "teaser": null
      },{
        "title": "Running an automation every time a sensor updates",
        "excerpt":"What follows is no longer needed since HA now has a new feature of the [state trigger](https://www.home-assistant.io/docs/automation/trigger/#state-trigger): ```yaml trigger: - platform: state entity_id: sensor.your_sensor to: ~ ``` I will leave this for posterity though. --- A common question on the HA Discord is how to have an automation run any...","categories": [],
        "tags": ["automation","home assistant"],
        "url": "/2021/08/05/running-automation-every-time-sensor.html",
        "teaser": null
      },{
        "title": "How should I install Home Assistant?",
        "excerpt":" I see a lot of people confused by the four install options for Home Assistant. The first, and most important, thing to realise is that Home Assistant is the same no matter how you install it. The only thing that changes is how you install other software, and how you...","categories": [],
        "tags": [],
        "url": "/2021/12/23/how-should-i-install-home-assistant.html",
        "teaser": null
      },{
        "title": "Frigate > MotionEye+Doods",
        "excerpt":"As you may remember, I use MotionEye and Doods, along [withsome crazy scripting](/cameras-motion-detection-and/), to do motion and object detection at the front of the house. Well, _used_ would be more accurate. Recently I tried out [Frigate](https://frigate.video/), initially without a Coral stick/board. The following day I turned off MotionEye and Doods. With...","categories": [],
        "tags": ["doods","frigate","home assistant","motion detection"],
        "url": "/2022/09/20/frigate-motioneyedoods.html",
        "teaser": null
      },{
        "title": "Traefik and a remote Home Assistant",
        "excerpt":"I've been playing with [Traefik](https://traefik.io/) lately, for remote access for various things in my Docker stack, and I decided to see if it was possible to also use it for Home Assistant, despite that being on a remote host. The answer is (otherwise I wouldn't havewritten this) yes - and...","categories": [],
        "tags": ["remote access","home assistant"],
        "url": "/2022/10/25/traefik-and-remote-home-assistant.html",
        "teaser": null
      },{
        "title": "Blog migration (2022)",
        "excerpt":"If you're reading this you're looking at the new home of my blog. I'm moving off of Blogger and over to Jekyll, possibly on GitHub pages possibly on Cloudflare pages. As part of the migration I'm going through and fixing broken links in old posts and adding notes where information...","categories": [],
        "tags": ["blog"],
        "url": "/2022/12/22/blog-migration.html",
        "teaser": null
      }]
