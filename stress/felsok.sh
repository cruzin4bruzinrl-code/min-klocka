#!/bin/bash
# Felsökning av webbdelen i appen: läser sidans tillstånd via WebView-felsökning (bara provbyggen)
set -u
P=se.minklocka.app; A=$P/.MainActivity; OUT=stress-out; mkdir -p $OUT/shots
adb install -r -g app/build/outputs/apk/debug/app-debug.apk
adb shell dumpsys deviceidle whitelist +$P >/dev/null 2>&1
adb logcat -c; adb logcat -v time > $OUT/logcat.txt 2>&1 & LC=$!
start(){ adb shell am start -n $A "$@" >/dev/null 2>&1; }
shot(){ adb exec-out screencap -p > $OUT/shots/$1.png; }
start; sleep 30; start --ez demo true --es stil MATERIAL --ei tab 2; sleep 8; shot dials
PID=$(adb shell pidof $P | tr -d '\r')
adb forward tcp:9222 localabstract:webview_devtools_remote_$PID
curl -s http://127.0.0.1:9222/json > $OUT/cdp_list.json
python3 stress/cdp.py > $OUT/dom.txt 2>&1
start --ei tab 3; sleep 6; shot tools
python3 stress/cdp.py tools > $OUT/dom_tools.txt 2>&1
kill $LC 2>/dev/null; true
