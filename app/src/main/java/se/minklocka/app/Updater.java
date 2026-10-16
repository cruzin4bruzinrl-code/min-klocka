package se.minklocka.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInstaller;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Uppdaterar appen själv från utgåvan "app" på GitHub.
 * Första gången frågar Android en gång. Efter det står appen själv som installatör, och då brukar Android
 * (12 och senare) låta den uppdatera sig utan att fråga.
 */
public class Updater extends BroadcastReceiver {
    static final String API = "https://api.github.com/repos/cruzin4bruzinrl-code/min-klocka/releases/tags/app";
    static final String CH = "uppdatering", LAST = "upd_koll";
    static volatile boolean busy = false;
    static volatile boolean appVisible = false;

    static int myBuild(Context c) {
        try {
            return (int) c.getPackageManager().getPackageInfo(c.getPackageName(), 0).getLongVersionCode();
        } catch (Exception e) {
            return 0;
        }
    }

    /** manual=true när du trycker Sök ny version. Annars högst var tredje timme. */
    static void check(final Context ctx, final boolean manual) {
        final Context c = ctx.getApplicationContext();
        SharedPreferences p = c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
        long now = System.currentTimeMillis();
        if (busy) return;
        if (!manual && now - p.getLong(LAST, 0) < 3 * 3600 * 1000L) return;
        p.edit().putLong(LAST, now).apply();
        busy = true;
        new Thread(() -> {
            try {
                run(c, manual);
            } catch (Exception e) {
                WatchService.log("Uppdatering: " + e.getMessage());
            }
            busy = false;
        }).start();
    }

    private static HttpURLConnection open(String u) throws Exception {
        HttpURLConnection h = (HttpURLConnection) new URL(u).openConnection();
        h.setRequestProperty("User-Agent", "min-klocka");
        h.setConnectTimeout(15000);
        h.setReadTimeout(30000);
        h.setInstanceFollowRedirects(true);
        return h;
    }

    private static void run(Context c, boolean manual) throws Exception {
        HttpURLConnection h = open(API);
        h.setRequestProperty("Accept", "application/vnd.github+json");
        if (h.getResponseCode() != 200) throw new Exception("GitHub svarade " + h.getResponseCode());
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        try (InputStream in = h.getInputStream()) {
            byte[] b = new byte[8192];
            int n;
            while ((n = in.read(b)) > 0) bo.write(b, 0, n);
        }
        JSONObject j = new JSONObject(bo.toString("UTF-8"));
        Matcher m = Pattern.compile("bygge (\\d+)").matcher(j.optString("name", ""));
        if (!m.find()) throw new Exception("hittar inte byggnumret");
        int remote = Integer.parseInt(m.group(1)), mine = myBuild(c);
        if (remote <= mine) {
            if (manual) WatchService.log("Appen är senaste versionen (bygge " + mine + ")");
            return;
        }
        String url = null;
        JSONArray a = j.optJSONArray("assets");
        for (int i = 0; a != null && i < a.length(); i++) {
            JSONObject o = a.getJSONObject(i);
            if ("min-klocka.apk".equals(o.optString("name"))) url = o.optString("browser_download_url");
        }
        if (url == null) throw new Exception("filen saknas i utgåvan");
        WatchService.log("Ny app finns (bygge " + remote + "). Hämtar…");
        File f = new File(c.getCacheDir(), "uppdatering.apk");
        HttpURLConnection d = open(url);
        if (d.getResponseCode() != 200) throw new Exception("nedladdningen svarade " + d.getResponseCode());
        try (InputStream in = d.getInputStream(); OutputStream out = new FileOutputStream(f)) {
            byte[] b = new byte[65536];
            int n;
            while ((n = in.read(b)) > 0) out.write(b, 0, n);
        }
        install(c, f, remote);
    }

    private static void install(Context c, File f, int remote) throws Exception {
        PackageInstaller pi = c.getPackageManager().getPackageInstaller();
        PackageInstaller.SessionParams sp = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
        sp.setAppPackageName(c.getPackageName());
        sp.setSize(f.length());
        if (Build.VERSION.SDK_INT >= 31) sp.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
        int id = pi.createSession(sp);
        try (PackageInstaller.Session s = pi.openSession(id)) {
            try (InputStream in = new FileInputStream(f); OutputStream out = s.openWrite("app.apk", 0, f.length())) {
                byte[] b = new byte[65536];
                int n;
                while ((n = in.read(b)) > 0) out.write(b, 0, n);
                s.fsync(out);
            }
            Intent i = new Intent(c, Updater.class).setAction("se.minklocka.app.INSTALLERAD").putExtra("bygge", remote);
            PendingIntent pend = PendingIntent.getBroadcast(c, 7, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
            WatchService.log("Installerar bygge " + remote + ". Appen startar om av sig själv");
            s.commit(pend.getIntentSender());
        }
    }

    private static void tell(Context c, String text, PendingIntent tap) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        nm.createNotificationChannel(new NotificationChannel(CH, "Uppdateringar", NotificationManager.IMPORTANCE_DEFAULT));
        Notification.Builder b = new Notification.Builder(c, CH)
                .setSmallIcon(android.R.drawable.stat_sys_download_done)
                .setContentTitle("Min klocka")
                .setContentText(text)
                .setAutoCancel(true);
        if (tap != null) b.setContentIntent(tap);
        try {
            nm.notify(7301, b.build());
        } catch (SecurityException ignored) {
        }
    }

    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        if ("android.intent.action.MY_PACKAGE_REPLACED".equals(a)) {
            // Uppdaterad: starta kontakten med klockan igen direkt
            try {
                c.startForegroundService(new Intent(c, WatchService.class));
            } catch (Exception ignored) {
            }
            WatchService.log("Appen är uppdaterad till bygge " + myBuild(c));
            return;
        }
        int st = i.getIntExtra(PackageInstaller.EXTRA_STATUS, -999);
        if (st == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Intent confirm = i.getParcelableExtra(Intent.EXTRA_INTENT);
            if (confirm == null) return;
            confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (appVisible) {
                try {
                    c.startActivity(confirm);
                    WatchService.log("Android frågar en gång om lov. Tryck Installera (och Tillåt om den frågar om källan)");
                    return;
                } catch (Exception ignored) {
                }
            }
            PendingIntent tap = PendingIntent.getActivity(c, 8, confirm, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            tell(c, "Ny version är hämtad. Tryck för att installera", tap);
            WatchService.log("Ny version hämtad. Tryck på aviseringen för att installera");
        } else if (st != PackageInstaller.STATUS_SUCCESS && st != -999) {
            WatchService.log("Uppdateringen gick inte: " + i.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE));
            // Försök igen vid nästa koll
            c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE).edit().putLong(LAST, 0).apply();
        }
    }
}
