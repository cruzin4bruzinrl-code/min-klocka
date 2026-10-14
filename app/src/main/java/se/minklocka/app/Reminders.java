package se.minklocka.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Påminnelser för lappens rader. Sidan lämnar en lista [{t, at}]; här läggs ett larm i telefonen för varje.
 * När tiden kommer skickas texten till klockan (som sms-sort, den som klockan visar) och visas i telefonen.
 * Är klockan inte ansluten just då skickas påminnelsen så snart den ansluter.
 */
public class Reminders extends BroadcastReceiver {
    static final String PREF = "paminnelser", PREF_N = "paminnelser_antal", PREF_WAIT = "paminnelser_vantar";

    static void set(Context c, String json) {
        SharedPreferences p = c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
        p.edit().putString(PREF, json == null ? "[]" : json).apply();
        schedule(c);
    }

    static void schedule(Context c) {
        SharedPreferences p = c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
        AlarmManager am = c.getSystemService(AlarmManager.class);
        if (am == null) return;
        int old = p.getInt(PREF_N, 0);
        for (int i = 0; i < Math.max(old, 64); i++) {
            PendingIntent pi = PendingIntent.getBroadcast(c, 1000 + i, new Intent(c, Reminders.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_NO_CREATE);
            if (pi != null) {
                am.cancel(pi);
                pi.cancel();
            }
        }
        int n = 0;
        try {
            JSONArray a = new JSONArray(p.getString(PREF, "[]"));
            long now = System.currentTimeMillis();
            for (int i = 0; i < a.length() && n < 64; i++) {
                JSONObject o = a.getJSONObject(i);
                long at = o.optLong("at", 0);
                String t = o.optString("t", "");
                if (at <= now || t.isEmpty()) continue;
                Intent in = new Intent(c, Reminders.class).putExtra("t", t).putExtra("at", at);
                PendingIntent pi = PendingIntent.getBroadcast(c, 1000 + n, in, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
                if (am.canScheduleExactAlarms()) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                n++;
            }
        } catch (Exception e) {
            WatchService.log("Påminnelserna gick inte att läsa: " + e.getMessage());
        }
        p.edit().putInt(PREF_N, n).apply();
        WatchService.log("Påminnelser inlagda: " + n);
    }

    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(a) || "android.intent.action.MY_PACKAGE_REPLACED".equals(a)) {
            schedule(c);
            return;
        }
        String t = i.getStringExtra("t");
        if (t == null || t.isEmpty()) return;
        Notifier.tell(c, "Påminnelse", t);
        if (WatchService.instance != null && WatchService.readyNow) {
            Notifier.push(c, 1, "Påminnelse", t);
        } else {
            SharedPreferences p = c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
            p.edit().putString(PREF_WAIT, t).apply();
            WatchService.log("Påminnelse väntar tills klockan ansluter: " + t);
            try {
                c.startForegroundService(new Intent(c, WatchService.class));
            } catch (Exception ignored) {
            }
        }
    }

    /** Anropas när klockan ansluter. */
    static void flush(Context c) {
        SharedPreferences p = c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
        String t = p.getString(PREF_WAIT, null);
        if (t == null) return;
        p.edit().remove(PREF_WAIT).apply();
        Notifier.push(c, 1, "Påminnelse", t);
    }
}
