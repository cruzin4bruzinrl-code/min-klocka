package se.minklocka.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;

/**
 * Hämtar vädret och skickar det till klockan en gång i timmen, även när appen är stängd.
 * Samma två meddelanden som sidan skickar: dagens väder (03/30) och ort plus sju dagar (03/37).
 * Platsen sparas av sidan när du väljer ort i Väder.
 */
final class Weather {
    private Weather() {
    }

    private static volatile boolean running = false;

    static void maybe(WatchService s) {
        SharedPreferences p = Smart.p(s);
        if (running || !Smart.on(s, "wx_auto", true)) return;
        String place = Smart.get(s, "wx_plats", null);
        if (place == null) return;
        long last = p.getLong("wx_senast", 0);
        if (System.currentTimeMillis() - last < 60 * 60 * 1000L) return;
        running = true;
        new Thread(() -> {
            try {
                JSONObject pl = new JSONObject(place);
                double lat = pl.getDouble("lat"), lon = pl.getDouble("lon");
                String name = pl.optString("name", "");
                if ("Här".equals(name)) name = "";
                JSONObject j = new JSONObject(get("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon
                        + "&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7"));
                JSONObject cur = j.getJSONObject("current"), d = j.getJSONObject("daily");
                int now = (int) Math.round(cur.getDouble("temperature_2m"));
                JSONArray mn = d.getJSONArray("temperature_2m_min"), mx = d.getJSONArray("temperature_2m_max"), wc = d.getJSONArray("weather_code");
                int n = Math.min(7, mn.length());
                byte[][] days = new byte[7][];
                for (int i = 0; i < 7; i++) {
                    int k = Math.min(i, n - 1);
                    int lo = (int) Math.round(mn.getDouble(k)), hi = (int) Math.round(mx.getDouble(k));
                    int code = wmo(i == 0 ? cur.getInt("weather_code") : wc.getInt(k));
                    days[i] = new byte[]{s8(lo >= hi ? hi - 1 : lo), s8(hi), (byte) (code & 3), s8(now)};
                }
                s.send(0x03, 0x30, days[0]);
                Calendar c = Calendar.getInstance();
                byte[] cb = (name.length() > 20 ? name.substring(0, 20) : name).getBytes(StandardCharsets.UTF_16LE);
                ByteArrayOutputStream b = new ByteArrayOutputStream();
                b.write(c.get(Calendar.YEAR) % 100);
                b.write(c.get(Calendar.MONTH) + 1);
                b.write(c.get(Calendar.DAY_OF_MONTH));
                b.write(c.get(Calendar.HOUR_OF_DAY));
                b.write(cb.length);
                b.write(cb, 0, cb.length);
                for (byte[] x : days) b.write(x, 0, 4);
                Thread.sleep(800);
                s.send(0x03, 0x37, b.toByteArray());
                p.edit().putLong("wx_senast", System.currentTimeMillis()).apply();
                WatchService.log("Väder skickat av appen: " + now + " grader");
            } catch (Exception e) {
                WatchService.log("Vädret gick inte att hämta: " + e.getMessage());
                p.edit().putLong("wx_senast", System.currentTimeMillis() - 45 * 60 * 1000L).apply();   // försök igen om en kvart
            } finally {
                running = false;
            }
        }).start();
    }

    private static byte s8(int v) {
        return (byte) (Math.max(-99, Math.min(99, v)) & 255);
    }

    /** 0 klart, 1 moln eller dimma, 2 regn eller åska, 3 snö. Samma som sidan. */
    private static int wmo(int c) {
        if (c <= 1) return 0;
        if (c <= 48) return 1;
        if ((c >= 71 && c <= 77) || c == 85 || c == 86) return 3;
        return 2;
    }

    private static String get(String u) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
        c.setConnectTimeout(10000);
        c.setReadTimeout(10000);
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int r;
            while ((r = in.read(buf)) > 0) o.write(buf, 0, r);
            return o.toString("UTF-8");
        } finally {
            c.disconnect();
        }
    }
}
