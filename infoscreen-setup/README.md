# Setup for infoscreens

This part of the project contains information on how to setup an infoscreen and how to maintain it.

- [Basic setup](#basic-setup)
- [Install Notiwall CLI for more control](#install-notiwall-cli-for-more-control)
  - [Remote screenshots](#remote-screenshots)
  - [Change layout from remote](#change-layout-from-remote)

## Basic setup

1. You will need:

   - Screen
   - Machine (Raspberry PI, NUC, Desktop, ...)
   - A working cable (HDML, VGA, ...) from machine to screen
   - Mouse & keyboard attached to the machine

   Setting up the OS (Operating System) is not a part of this README. Please search the Internet if help is needed.

   _If you are using a Raspberry PI, anything with a GUI (NOOBS, Raspian) would be sufficient._

2. **Next**, you will need to connect to the Internet through WiFi or cable. This is a really important step.

3. Now, go to https://notiwall.online.ntnu.no in any browser (Chrome and Firefox is preferred) and choose which infoscreen to display.

4. At last, set the browser tab to fullscreen mode. `F11` is usually the button for making the browser tab go in fullscreen mode.

The basic setup process is now complete.

## Install Notiwall CLI for more control

_Skip this section if you do not want / need to control the infoscreen from remote (SSH), or if you do not use a UNIX system (as we only support bash commands)._

You can choose to install or not, either run:

```bash
$ bash <(curl -s https://notiwall.online.ntnu.no/api/v1/notiwall.sh) install # To get the cli
# OR
$ bash <(curl -s https://notiwall.online.ntnu.no/api/v1/notiwall.sh) [command] # Just run commands like this
```

The Notiwall CLI is built for both the admins and the infoscreens themselves. It has a set of commands you can run at the infoscreen, and a set of commands to run from remote.

Just write:

```bash
$ notiwall --help
# OR
$ bash <(curl -s https://notiwall.online.ntnu.no/api/v1/notiwall.sh) --help
```

to list all the commands.

### Remote screenshots

Screenshots can tell a lot about the state of the infoscreen. Some things can not be detected through plain SSH, like: alerts, propmts, browser crash and infoscreen logic failures.

We have made it easy to get a screenshot. Just run this script from your computer (you may be promted with a password):

```bash
$ notiwall remote screenshot {user}@{ipadress} # Does not require that the infoscreen has Notiwall CLI installed. It installs on the fly
```

The screenshot will open in an image viewer, and is also saved in the `/tmp` folder of your UNIX system.

_If the IP of the infoscreen starts with 10 or 192, it is probably hidden behind a LAN (Locale Area Network). VPN is the easiest solution, if that is available. Else, you can setup an SSH tunnel from the infoscreen to a public server outside the LAN that you can use as a proxy._

### Change layout from remote

This part is actually automated as a part of the https://notiwall.online.ntnu.no. Each time a layout is changed, each infoscreen will detect and download the latest change. If the whole notiwall is changed, the whole browser window will refresh and fetch the latest version. Forever green <3. No need for manual operations.

Send a PR (Pull Request) to [this repository](https://github.com/dotkom/the-notifier-awakens) on GitHub and request a change.
