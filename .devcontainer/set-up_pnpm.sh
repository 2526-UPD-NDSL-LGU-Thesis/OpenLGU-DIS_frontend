#!/usr/bin/env bash
# Performs some post install set-up for pnpm

# debug (-e: exit on command error; -u: unset vars are errors; -x: trace mode)
# reference: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html
set -eux


pnpm setup
source /home/vscode/.bashrc