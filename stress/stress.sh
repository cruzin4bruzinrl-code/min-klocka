#!/bin/bash
# Stresstest: alla stilar och flikar, snabba byten, mörkt/ljust, bakgrund, minnesbrist, processdöd och slumpade tryck.
set -u
P=se.minklocka.app
A=$P/.MainActivity
OUT=stress-out
mkdir -p $OUT/shots
adb install -r -g app/build/outputs/apk/debug/app-debug.apk
adb shell pm grant $P android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell dumpsys deviceidle whitelist +$P >/dev/null 2>&1
adb logcat -c
adb logcat -v time > $OUT/logcat.txt 2>&1 &
LC=$!
start(){ adb shell am start -n $A "$@" >/dev/null 2>&1; }
shot(){ adb exec-out screencap -p > $OUT/shots/$1.png; }
alive(){ adb get-state >/dev/null 2>&1 || { echo "EMULATORN BORTA"; return; }; [ -n "$(adb shell pidof $P 2>/dev/null)" ] && echo ja || echo NEJ; }
T0=$(date +%s)
echo "== start" >> $OUT/steg.txt
start; sleep 30; shot 00_start
start --ez demo true; sleep 3
STILAR="MATERIAL COCKPIT TIDNING BENTO BRUTAL NORRSKEN PRICK"
for s in $STILAR; do
  start --es stil $s --ei tab 0; sleep 4
  adb shell dumpsys gfxinfo $P reset >/dev/null 2>&1
  shot ${s}_0
  adb shell input swipe 540 1900 540 500 400; sleep 2; shot ${s}_0b
  adb shell input swipe 540 500 540 1900 400; sleep 1
  start --ei tab 1; sleep 4; shot ${s}_1
  adb shell input swipe 540 1900 540 500 400; sleep 2; shot ${s}_1b
  if [ $s = PRICK ]; then adb shell input swipe 900 1200 150 1200 300; sleep 2; shot ${s}_1c; fi
  start --ei tab 0 --ez picker true; sleep 3; shot ${s}_val
  adb shell input keyevent KEYCODE_BACK; sleep 2; shot ${s}_val_stangd
  adb shell dumpsys gfxinfo $P > $OUT/gfx_$s.txt 2>&1
  echo "$s klar, appen lever: $(alive)" >> $OUT/steg.txt
done
echo "== webbflikarna" >> $OUT/steg.txt
for s in MATERIAL NORRSKEN TIDNING; do start --es stil $s --ei tab 0; sleep 3; for t in 2 3 4; do start --ei tab $t; sleep 6; shot web_${s}_$t; echo "$s flik $t: $(alive)" >> $OUT/steg.txt; done; done
echo "== snabba flikbyten" >> $OUT/steg.txt
for i in $(seq 1 80); do start --ei tab $((i % 5)); sleep 0.12; done; sleep 4; shot zz_snabba_flikar
echo "lever: $(alive)" >> $OUT/steg.txt
echo "== snabba stilbyten" >> $OUT/steg.txt
for i in $(seq 1 40); do s=$(echo $STILAR | cut -d' ' -f$((i % 7 + 1))); start --es stil $s --ei tab $((i % 2)); sleep 0.25; done; sleep 4; shot zz_snabba_stilar
echo "lever: $(alive)" >> $OUT/steg.txt
echo "== mörkt och ljust" >> $OUT/steg.txt
start --es stil MATERIAL --ei tab 0
adb shell cmd uimode night yes; sleep 4; shot zz_material_mork
adb shell cmd uimode night no; sleep 4; shot zz_material_ljus
echo "== bakgrund och förgrund" >> $OUT/steg.txt
for i in $(seq 1 12); do adb shell input keyevent KEYCODE_HOME; sleep 0.8; start; sleep 0.8; done; sleep 3; shot zz_efter_bakgrund
echo "lever: $(alive)" >> $OUT/steg.txt
echo "== minnesbrist" >> $OUT/steg.txt
adb shell am send-trim-memory $P RUNNING_CRITICAL; sleep 3; shot zz_minnesbrist
echo "lever: $(alive)" >> $OUT/steg.txt
echo "== processdöd" >> $OUT/steg.txt
start --es stil BENTO --ei tab 1; sleep 3
adb shell input keyevent KEYCODE_HOME; sleep 2; adb shell am kill $P; sleep 2; start; sleep 25; shot zz_efter_processdod
echo "lever: $(alive)" >> $OUT/steg.txt
echo "== slumpade tryck (5000)" >> $OUT/steg.txt
adb shell monkey -p $P --pct-syskeys 0 --pct-appswitch 0 --pct-anyevent 0 --throttle 35 -s 42 -v 5000 > $OUT/monkey.txt 2>&1
sleep 3; start; sleep 3; shot zz_efter_slump
echo "lever: $(alive)" >> $OUT/steg.txt
adb shell dumpsys meminfo $P > $OUT/meminfo.txt 2>&1
adb shell dumpsys gfxinfo $P > $OUT/gfx_slut.txt 2>&1
echo "tid: $(( $(date +%s) - T0 )) s" >> $OUT/steg.txt
kill $LC 2>/dev/null
grep -nE "FATAL EXCEPTION|ANR in|has died|Process: se.minklocka" -A 25 $OUT/logcat.txt > $OUT/krascher.txt || true
grep -E "se.minklocka|chromium|Console" $OUT/logcat.txt | grep -iE " E/| W/|error|exception" | head -400 > $OUT/fel.txt || true
true
