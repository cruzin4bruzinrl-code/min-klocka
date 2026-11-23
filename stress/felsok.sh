#!/bin/bash
# Bilder av stilarna (Klocka och Hälsa) för att visa dem
set -u
P=se.minklocka.app; A=$P/.MainActivity; OUT=stress-out; mkdir -p $OUT/shots
adb install -r -g app/build/outputs/apk/debug/app-debug.apk
adb shell dumpsys deviceidle whitelist +$P >/dev/null 2>&1
adb logcat -c; adb logcat -v time > $OUT/logcat.txt 2>&1 & LC=$!
start(){ adb shell am start -n $A "$@" >/dev/null 2>&1; }
shot(){ adb exec-out screencap -p > $OUT/shots/$1.png; }
start; sleep 30; start --ez demo true; sleep 2
for s in MATERIAL COCKPIT TIDNING BENTO BRUTAL NORRSKEN PRICK TERMINAL LCD KLADD RADAR KORT TIDSLINJE; do
  start --es stil $s --ei tab 0; sleep 6; shot ${s}_0
  start --ei tab 1; sleep 6; shot ${s}_1
  start --ei tab 2; sleep 5; shot ${s}_2
  adb shell input swipe 540 1700 540 700 400; sleep 2; shot ${s}_1b
  echo "$s: $(adb shell pidof $P)" >> $OUT/steg.txt
done
start --ei tab 0 --ez picker true; sleep 4; adb shell input swipe 540 1900 540 400 400; sleep 2; shot valjare
kill $LC 2>/dev/null; grep -A12 "FATAL EXCEPTION" $OUT/logcat.txt > $OUT/krascher.txt; true
