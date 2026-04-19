#!/usr/bin/env bash
# debug (-e: exit on command error; -u: unset vars are errors; -x: trace mode)
# reference: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html
set -eux


sudo apt update
source ./.devcontainer/set-up_pnpm.sh
source ./.devcontainer/install_turbo.sh
source ./.devcontainer/set-up_electron.sh
source ./.devcontainer/install_tealdeer.sh