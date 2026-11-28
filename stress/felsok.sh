#!/bin/bash
# Skicka-knappen för en experiment-urtavla: syns frågan "Skicka ändå?" som Android-ruta?
set -u
P=se.minklocka.app; A=$P/.MainActivity; OUT=stress-out; mkdir -p $OUT/shots
adb install -r -g app/build/outputs/apk/debug/app-debug.apk
adb logcat -c; adb logcat -v time > $OUT/logcat.txt 2>&1 & LC=$!
start(){ adb shell am start -n $A "$@" >/dev/null 2>&1; }
shot(){ adb exec-out screencap -p > $OUT/shots/$1.png; }
tapt(){ adb shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; adb pull /sdcard/u.xml $OUT/u_$2.xml >/dev/null 2>&1
  b=$(grep -o "text=\"$1\"[^>]*bounds=\"[^\"]*\"" $OUT/u_$2.xml | head -1 | grep -o '[0-9]\+' | tr '\n' ' ')
  set -- $b; echo "tryck $2: $*" >> $OUT/steg.txt
  if [ $# -ge 4 ]; then adb shell input tap $(( ($1+$3)/2 )) $(( ($2+$4)/2 )); return 0; fi; return 1; }
start; sleep 30; start --ez demo true --ez notour true; sleep 2
for k in 1 2 3; do start --es jsb64 Zm9yKGxldCBrPTA7azw2O2srKyl7Y29uc3QgYj1bLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyldLmZpbmQoeD0+L0hvcHBhIMO2dmVyfFNlbmFyZXxTdMOkbmcvLnRlc3QoeC50ZXh0Q29udGVudCkmJngub2Zmc2V0UGFyZW50KTtpZihiKWIuY2xpY2soKTt9; sleep 2; done
for s in MATERIAL KLADD; do
  start --es stil $s --ei tab 2; sleep 10
  start --es jsb64 bmF0aXZlUGljaygnZDpjaHJvbm9fYmxhJyk7Y29ubmVjdGVkPXRydWU7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blNlbmQnKS5kaXNhYmxlZD1mYWxzZTs=; sleep 3; shot ${s}_1vald
  tapt "Skicka till klockan" ${s}a || { echo "ingen knapp hittad, klickar via sidan" >> $OUT/steg.txt; start --es jsb64 ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blNlbmQnKS5jbGljaygpOw==; }
  sleep 3; shot ${s}_2fraga
  tapt "Avbryt" ${s}b; sleep 2; shot ${s}_3avbrutet
  tapt "Skicka till klockan" ${s}c; sleep 3; tapt "Skicka ändå" ${s}d; sleep 2; shot ${s}_4skickar; sleep 12; shot ${s}_5efter
done
kill $LC 2>/dev/null; grep -A12 "FATAL EXCEPTION" $OUT/logcat.txt > $OUT/krascher.txt; grep -i "chromium\|console" $OUT/logcat.txt | tail -40 > $OUT/sida.txt; true
