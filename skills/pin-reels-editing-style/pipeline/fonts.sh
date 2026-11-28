#!/bin/bash
# downloads the free Google fonts the pipeline uses into ./fonts (run from the work folder)
mkdir -p fonts && cd fonts
B=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -sL -o PJS.ttf        "$B/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf"
curl -sL -o PJS-Italic.ttf "$B/plusjakartasans/PlusJakartaSans-Italic%5Bwght%5D.ttf"
curl -sL -o Unbounded.ttf  "$B/unbounded/Unbounded%5Bwght%5D.ttf"
curl -sL -o Inter.ttf      "$B/inter/Inter%5Bopsz,wght%5D.ttf"
curl -sL -o InstrumentSerif-Italic.ttf "$B/instrumentserif/InstrumentSerif-Italic.ttf"
ls -la
