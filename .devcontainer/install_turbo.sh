#!/usr/bin/env bash
# Installs turbo, the monorepo manager of this repository.
# Having it installed globally is recommended by turbo

# debug (-e: exit on command error; -u: unset vars are errors; -x: trace mode)
# reference: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html
set -eux


pnpm add turbo --global
# sudo apt-get install -y --no-install-recommends tealdeer
# tldr --update