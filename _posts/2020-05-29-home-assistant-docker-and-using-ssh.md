---
title: Home Assistant, Docker, and using SSH
date: '2020-05-29T21:20:00.003+01:00'
tags:
- ssh
- docker
- home assistant
modified_time: '2023-01-08T21:21:59.016Z'
---

A common problem that comes up with people using one of the Supervisor based install methods, or Docker, is that when they try to use ssh it fails, yet when testing it works.

**_What. The. Heck?_**

Well, you've hit two problems because of Docker - all your testing was done in a different container.

1.  You need to accept the remote host's key. The default is to prompt the human, and you don't see that.
2.  You need to provide the location private key, since it's not where SSH is looking for it.

Solving this is simple enough.

## Copy the key(s)

First thing to do is to copy the private key into your config folder. I'd recommend that you put it in a sub-folder, and exclude that from any git push. For example, create `/config/ssh` and copy your private key (typically `id_ed25519` or `id_rsa`) there.

Oh, and that private key, it needs to have no passphrase since you won't be able to enter it.

If you created a fresh key, don't forget to add the _public key_ to the `authorized_keys` file on server you're connecting to. One way of doing that is to use the `ssh-copy-id` command, eg:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub tinkerer@ceard.orbital.tech
```

## Tell SSH to accept new host keys

This is easy, there's an option to tell the SSH client to accept _new_ keys. This is safer than the old option to just blindly accept all keys. To do this you add `StrictHostKeyChecking=accept-new` to your SSH options.

## All together now
What does this mean? It means where you currently have `ssh` you'd instead have:

```bash
ssh -i /config/ssh/id_ed25519 -o StrictHostKeyChecking=accept-new
```

For example your full command may be:

```bash
ssh -i /config/ssh/id_ed25519 -o StrictHostKeyChecking=accept-new tinkerer@orbital.ceard.tech /usr/sbin/meltdown
```

Now it'll use that key, and accept new keys without prompting. It won't accept keys that change, which is a good security feature.
