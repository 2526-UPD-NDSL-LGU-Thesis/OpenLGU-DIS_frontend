#!/usr/bin/env bash
# Need to set-up some ubuntu os packages that electron relies on

# debug (-e: exit on command error; -u: unset vars are errors; -x: trace mode)
# reference: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html
set -eux


sudo apt install libgtk-3-dev libasound2t64