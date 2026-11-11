#!/bin/bash
# Renders both 15-second videos into out/.
set -e
cd "$(dirname "$0")"
node render.mjs
