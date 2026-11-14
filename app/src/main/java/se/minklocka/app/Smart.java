package se.minklocka.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.os.BatteryManager;

import java.util.Calendar;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Smarta funktioner som bara bygger på det klockan redan kan:
 * klockans knappar styr telefonen, tysta timmar, viktiga personer, koder ur sms och batterivarningar.
 */
final class Smart {
    private Smart() {
    }

    /** Inställningar som sidan får ändra. Allt annat nekas. */
    static final String[] KEYS = {"knapp_kamera", "knapp_hitta", "tyst_pa", "tyst_fran", "tyst_till", "viktiga", "koder", "batt_klocka", "batt_telefon"};

    static SharedPreferences p(Context c) {
        return c.getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
    }

    static boolean allowedKey(String k) {
        for (String s : KEYS) if (s.equals(k)) return true;
        return false;
    }

    static String all(Context c) {
        StringBuilder b = new StringBuilder("{");
        SharedPreferences q = p(c);
        for (String k : KEYS) {
            String v = q.getString("s_" + k, null);
            if (v == null) continue;
            if (b.length() > 1) b.append(',');
            b.append('"').append(k).append("\":\"").append(v.replace("\\", "\\\\").replace("\"", "\\\"")).append('"');
        }
        return b.append('}').toString();
    }

    static String get(Context c, String k, String def) {
        return p(c).getString("s_" + k, def);
    }

    static boolean on(Context c, String k, boolean def) {
        String v = get(c, k, null);
        return v == null ? def : v.equals("1");
    }

    // ---------- klockans knappar ----------

    /** Vad knappen ska göra. "standard" betyder som vanligt (kameran eller ringa). */
    static String action(Context c, String which) {
        return get(c, "knapp_" + which, "standard");
    }

    private static boolean torch = false;

    /** Gör åtgärden. Ger en kort text att visa på klockan, eller null. */
    static String run(WatchService s, String act) {
        AudioManager am = (AudioManager) s.getSystemService(Context.AUDIO_SERVICE);
        switch (act) {
            case "spela":
                s.mediaKey(android.view.KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE);
                return null;
            case "nasta":
                s.mediaKey(android.view.KeyEvent.KEYCODE_MEDIA_NEXT);
                return null;
            case "gemini":
                s.openVoice();
                return null;
            case "tyst":
                if (am == null) return null;
                try {
                    boolean quiet = am.getRingerMode() != AudioManager.RINGER_MODE_NORMAL;
                    am.setRingerMode(quiet ? AudioManager.RINGER_MODE_NORMAL : AudioManager.RINGER_MODE_VIBRATE);
                    return quiet ? "Ljud på" : "Telefonen på vibration";
                } catch (Exception e) {
                    WatchService.log("Kunde inte ändra ljudet: " + e.getMessage());
                    return "Gick inte (Stör ej är på)";
                }
            case "ficklampa":
                try {
                    CameraManager cm = s.getSystemService(CameraManager.class);
                    for (String id : cm.getCameraIdList()) {
                        Boolean f = cm.getCameraCharacteristics(id).get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                        if (f != null && f) {
                            torch = !torch;
                            cm.setTorchMode(id, torch);
                            return torch ? "Ficklampa på" : "Ficklampa av";
                        }
                    }
                } catch (Exception e) {
                    WatchService.log("Ficklampan gick inte: " + e.getMessage());
                }
                return null;
            default:
                return null;
        }
    }

    // ---------- aviseringar ----------

    private static final Pattern CODE = Pattern.compile("(?i)(kod|code|verifi|engångs|lösen|otp|pin|bankid|inlogg)[^0-9]{0,40}?(\\d{4,8})(?!\\d)");
    private static final Pattern CODE2 = Pattern.compile("(?<!\\d)(\\d{4,8})(?!\\d)[^0-9]{0,40}?(kod|code|verifi|engångs|otp)", Pattern.CASE_INSENSITIVE);

    /** En kod i texten (för inloggning, paket och liknande), eller null. */
    static String code(String title, String body) {
        String s = (title == null ? "" : title) + " " + (body == null ? "" : body);
        Matcher m = CODE.matcher(s);
        if (m.find()) return m.group(2);
        m = CODE2.matcher(s);
        if (m.find()) return m.group(1);
        return null;
    }

    static boolean important(Context c, String title, String body) {
        String list = get(c, "viktiga", "");
        if (list.trim().isEmpty()) return false;
        String s = ((title == null ? "" : title) + " " + (body == null ? "" : body)).toLowerCase(Locale.ROOT);
        for (String n : list.split(",")) {
            String k = n.trim().toLowerCase(Locale.ROOT);
            if (k.length() >= 2 && s.contains(k)) return true;
        }
        return false;
    }

    static boolean quietNow(Context c) {
        if (!on(c, "tyst_pa", false)) return false;
        int from = mins(get(c, "tyst_fran", "22:00")), to = mins(get(c, "tyst_till", "07:00"));
        if (from < 0 || to < 0 || from == to) return false;
        Calendar k = Calendar.getInstance();
        int now = k.get(Calendar.HOUR_OF_DAY) * 60 + k.get(Calendar.MINUTE);
        return from < to ? (now >= from && now < to) : (now >= from || now < to);
    }

    private static int mins(String hm) {
        try {
            String[] a = hm.split(":");
            return Integer.parseInt(a[0]) * 60 + Integer.parseInt(a[1]);
        } catch (Exception e) {
            return -1;
        }
    }

    /**
     * Bestämmer om en avisering ska till klockan, och hur. Ger {rubrik, text} eller null för att hoppa över.
     * Samtal och koder går alltid fram. Under tysta timmar går bara viktiga personer fram.
     */
    static String[] shape(Context c, int type, String title, String body) {
        String cd = on(c, "koder", true) ? code(title, body) : null;
        if (cd != null) return new String[]{"Kod " + cd, title == null ? "" : title};
        if (type == 0) return new String[]{title, body};
        if (quietNow(c) && !important(c, title, body)) {
            WatchService.log("Tyst timme: avisering hölls tillbaka");
            return null;
        }
        return new String[]{title, body};
    }

    // ---------- batteri ----------

    private static boolean watchWarned = false;

    static void watchBattery(Context c, int pct) {
        if (pct >= 25) watchWarned = false;
        if (pct > 15 || watchWarned || !on(c, "batt_klocka", true)) return;
        watchWarned = true;
        Notifier.tell(c, "Klockans batteri är lågt", pct + " % kvar. Dags att ladda klockan.");
        WatchService.log("Varnade för klockans batteri (" + pct + " %)");
    }

    static void phoneBatteryLow(Context c) {
        if (!on(c, "batt_telefon", true)) return;
        int pct = -1;
        try {
            BatteryManager bm = c.getSystemService(BatteryManager.class);
            pct = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
        } catch (Exception ignored) {
        }
        Notifier.push(c, 10, "Telefonen", "Batteriet är lågt" + (pct > 0 ? ", " + pct + " %" : ""));
    }
}
