#!/usr/bin/env bash
# Installs tealdeer, an implementation of tldr which are help pages.
# Try it out using `tldr <command>`

# debug (-e: exit on command error; -u: unset vars are errors; -x: trace mode)
# reference: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html
set -eux


# TODO Build from source
sudo apt-get update
# sudo apt-get install -y --no-install-recommends tealdeer
# tldr --update