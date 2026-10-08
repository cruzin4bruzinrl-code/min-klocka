package se.minklocka.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.provider.Telephony;
import android.telephony.SmsManager;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Aviseringar och sms till klockan, och sms-svar från klockan.
 * Formen kommer ur originalappens kod (inte provad på klockan än):
 * 06/60 [typ, text i UTF-16LE], text = "rubrik : innehåll", högst 95 tecken. Sms har typ 1 och rubriken "Namn:nummer".
 * Svar från klockan kommer som 06/61 med nummer och text. Ett svar skickas bara till ett nummer som nyss skickat sms hit.
 */
final class Notifier {
    static final String PREF_ON = "aviseringar", CH_SMS = "sms";
    private static final Map<String, Long> recent = new HashMap<>();      // dubbletter
    private static final Map<String, Long> smsFrom = new HashMap<>();     // nummer som nyss skickat sms (för svar)

    private Notifier() {
    }

    static boolean enabled(Context c) {
        return c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE).getBoolean(PREF_ON, true);
    }

    static boolean smsAllowed(Context c) {
        return c.checkSelfPermission(Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED;
    }

    /** Sms-appar. Deras aviseringar hoppas över när sms tas emot direkt, annars kommer allt två gånger. */
    static boolean isSmsApp(Context c, String pkg) {
        if (pkg == null) return false;
        if (pkg.equals("com.samsung.android.messaging") || pkg.equals("com.google.android.apps.messaging") || pkg.equals("com.android.mms")) return true;
        try {
            return pkg.equals(Telephony.Sms.getDefaultSmsPackage(c));
        } catch (Exception e) {
            return false;
        }
    }

    /** Typen enligt originalappens tabell. 10 betyder "övrigt". */
    static int typeOf(Context c, String pkg) {
        if (pkg == null) return 10;
        if (isSmsApp(c, pkg)) return 1;
        switch (pkg) {
            case "com.samsung.android.dialer":
            case "com.google.android.dialer":
            case "com.android.server.telecom":
                return 0;
            case "com.tencent.mobileqq": return 2;
            case "com.tencent.mm": return 3;
            case "com.facebook.katana": return 4;
            case "com.facebook.orca": return 5;
            case "com.twitter.android": return 6;
            case "com.whatsapp":
            case "com.whatsapp.w4b": return 7;
            case "com.instagram.android": return 8;
            case "com.linkedin.android": return 9;
            case "com.microsoft.office.outlook": return 12;
            case "com.viber.voip": return 17;
            case "jp.naver.line.android": return 18;
            case "com.skype.raider": return 19;
            case "com.snapchat.android": return 20;
            case "com.kakao.talk": return 21;
            case "org.telegram.messenger": return 22;
            case "com.discord": return 23;
            case "com.zhiliaoapp.musically":
            case "com.ss.android.ugc.trill": return 24;
            case "com.google.android.youtube": return 25;
            case "com.reddit.frontpage": return 27;
            case "com.tumblr": return 28;
            case "com.google.android.gm": return 29;
            default: return 10;
        }
    }

    static String clean(String s) {
        if (s == null) return "";
        return s.replaceAll("[\\p{Cntrl}]", " ").replaceAll("\\s+", " ").trim();
    }

    /** Skickar en avisering till klockan. Samma text inom 30 sekunder skickas inte igen. */
    static void push(Context c, int type, String title, String body) {
        String t = clean(title), b = clean(body);
        // Som originalappen: alltid "rubrik : innehåll" (samtal bara rubriken). Klockan verkar behöva " : ".
        if (t.isEmpty()) t = "Min klocka";
        String text = type == 0 ? t : t + " : " + b;
        if (text.isEmpty()) return;
        if (text.length() > 95) text = text.substring(0, 92) + "...";
        long now = System.currentTimeMillis();
        synchronized (recent) {
            Iterator<Map.Entry<String, Long>> it = recent.entrySet().iterator();
            while (it.hasNext()) if (now - it.next().getValue() > 30000) it.remove();
            String k = type + "|" + text;
            if (recent.containsKey(k)) return;
            recent.put(k, now);
        }
        // Klockan visar bara sorterna 0–17 och 25 (den svarar 02 03 ff ff på 02/2A). Övriga skickas som "övrigt" (10).
        if (type > 17 && type != 25) type = 10;
        WatchService s = WatchService.instance;
        if (s == null || !WatchService.readyNow) {
            WatchService.log("Avisering kom men klockan är inte ansluten");
            return;
        }
        byte[] u = text.getBytes(StandardCharsets.UTF_16LE);
        byte[] d = new byte[1 + u.length];
        d[0] = (byte) type;
        System.arraycopy(u, 0, d, 1, u.length);
        s.send(0x06, 0x60, d);
        WatchService.log("Avisering till klockan (typ " + type + ", " + text.length() + " tecken)");
    }

    static String digits(String n) {
        return n == null ? "" : n.replaceAll("[^0-9]", "");
    }

    static String contactName(Context c, String number) {
        if (c.checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) return null;
        try (Cursor cur = c.getContentResolver().query(Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(number)),
                new String[]{ContactsContract.PhoneLookup.DISPLAY_NAME}, null, null, null)) {
            if (cur != null && cur.moveToFirst()) return cur.getString(0);
        } catch (Exception ignored) {
        }
        return null;
    }

    /** Ett sms har kommit till telefonen. */
    static void sms(Context c, String number, String body) {
        if (!enabled(c) || number == null) return;
        synchronized (smsFrom) {
            smsFrom.put(digits(number), System.currentTimeMillis());
            c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE).edit().putString("sms_senast", number).apply();
        }
        String name = contactName(c, number);
        push(c, 1, (name != null ? name : number) + ":" + number, body);
    }

    /** Hittar det riktiga numret bland nyliga avsändare (sista 8 siffrorna räcker). Inget träff ger null. */
    static String knownSender(Context c, String raw) {
        String d = digits(raw);
        if (d.length() < 5) return null;
        String tail = d.length() > 8 ? d.substring(d.length() - 8) : d;
        long now = System.currentTimeMillis();
        synchronized (smsFrom) {
            for (Map.Entry<String, Long> e : smsFrom.entrySet()) {
                if (now - e.getValue() > 48L * 3600 * 1000) continue;
                if (e.getKey().endsWith(tail)) return raw;
            }
            String last = c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE).getString("sms_senast", null);
            if (last != null && digits(last).endsWith(tail)) return last;
        }
        return null;
    }

    private static boolean phoneish(byte[] d, int from, int n) {
        if (n < 3 || n > 24 || from + n > d.length) return false;
        for (int i = from; i < from + n; i++) {
            int b = d[i] & 255;
            if (!(b >= '0' && b <= '9') && b != '+' && b != ' ' && b != '-') return false;
        }
        return true;
    }

    /**
     * Svar från klockan (06/61). Enligt originalappen: [?, längd, nummer, ?, längd, text], nummer och text i UTF-8.
     * Exakt läge är osäkert, så flera lägen provas och bara ett där längderna går jämnt ut godtas.
     */
    static void reply(Context c, byte[] d) {
        WatchService.log("Svar från klockan (06/61): " + WatchService.hex(d.length > 40 ? java.util.Arrays.copyOf(d, 40) : d) + (d.length > 40 ? " …" : ""));
        String number = null, msg = null;
        outer:
        for (int a = 0; a <= 2 && a < d.length; a++) {
            int n = d[a] & 255;
            if (!phoneish(d, a + 1, n)) continue;
            for (int b = 0; b <= 2; b++) {
                int mi = a + 1 + n + b;
                if (mi >= d.length) break;
                int m = d[mi] & 255;
                if (m > 0 && mi + 1 + m == d.length) {
                    number = new String(d, a + 1, n, StandardCharsets.UTF_8).trim();
                    msg = new String(d, mi + 1, m, StandardCharsets.UTF_8).trim();
                    break outer;
                }
            }
        }
        if (number == null || msg == null || msg.isEmpty()) {
            WatchService.log("Kunde inte läsa svaret säkert. Inget sms skickades");
            tell(c, "Svaret från klockan kunde inte läsas", "Inget sms skickades. Visa loggen i Min klocka.");
            return;
        }
        String to = knownSender(c, number);
        if (to == null) {
            WatchService.log("Svaret gällde " + number + ", som inte nyss skickat sms hit. Inget sms skickades");
            tell(c, "Sms skickades inte", "Numret " + number + " har inte nyss skickat sms till dig.");
            return;
        }
        if (c.checkSelfPermission(Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            WatchService.log("Appen saknar lov att skicka sms");
            tell(c, "Sms skickades inte", "Ge Min klocka lov att skicka sms under Verktyg.");
            return;
        }
        try {
            SmsManager sm = c.getSystemService(SmsManager.class);
            if (sm == null) sm = SmsManager.getDefault();
            sm.sendMultipartTextMessage(to, null, sm.divideMessage(msg), null, null);
            WatchService.log("Sms skickat till " + to + ": " + msg);
            tell(c, "Sms skickat från klockan", to + ": " + msg);
        } catch (Exception e) {
            WatchService.log("Sms gick inte att skicka: " + e.getMessage());
            tell(c, "Sms gick inte att skicka", e.getMessage() == null ? "" : e.getMessage());
        }
    }

    /** En vanlig avisering i telefonen, så att du ser vad som hände. */
    static void tell(Context c, String title, String text) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        nm.createNotificationChannel(new NotificationChannel(CH_SMS, "Sms från klockan", NotificationManager.IMPORTANCE_DEFAULT));
        nm.notify((int) (System.currentTimeMillis() & 0xFFFFFF) + 10,
                new Notification.Builder(c, CH_SMS).setSmallIcon(android.R.drawable.stat_notify_chat).setContentTitle(title).setContentText(text)
                        .setStyle(new Notification.BigTextStyle().bigText(text)).setAutoCancel(true).build());
    }

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
    }
}
