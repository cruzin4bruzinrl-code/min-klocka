package se.minklocka.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Appens enda fönster. Det visar sidan Min klocka (urtavlor och verktyg), och låter sidan prata med klockan
 * genom tjänsten som redan håller kontakten i bakgrunden. Då räcker en app och en anslutning.
 */
public class MainActivity extends Activity implements WatchService.Web {
    static final String HOME = "https://cruzin4bruzinrl-code.github.io/min-klocka/";
    private final Handler ui = new Handler(Looper.getMainLooper());
    private WebView wv;
    private ValueCallback<Uri[]> picking;
    private volatile boolean trusted = false;   // bara vår egen sida får använda bron till klockan
    private boolean loaded = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final int ink = Color.parseColor("#07080c");
        getWindow().setStatusBarColor(ink);
        getWindow().setNavigationBarColor(ink);
        // Skärmen hålls tänd medan appen visas, så att en överföring till klockan inte avbryts
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        wv = new WebView(this);
        wv.setBackgroundColor(ink);
        WebSettings st = wv.getSettings();
        st.setJavaScriptEnabled(true);
        st.setDomStorageEnabled(true);
        st.setMediaPlaybackRequiresUserGesture(false);
        st.setTextZoom(100);
        wv.addJavascriptInterface(new Bridge(), "MinKlockaNative");
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                trusted = url != null && url.startsWith(HOME);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                js("window.__mk&&__mk.state(" + WatchService.readyNow + ")");
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith(HOME)) return false;
                // Allt annat öppnas i den vanliga webbläsaren
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl()));
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }
        });
        wv.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (picking != null) picking.onReceiveValue(null);
                picking = cb;
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                    startActivityForResult(Intent.createChooser(i, "Välj fil"), 9);
                } catch (Exception e) {
                    picking = null;
                    return false;
                }
                return true;
            }
        });
        setContentView(wv);
        WatchService.web = this;
        begin();
    }

    /** Frågar om lov första gången, startar sedan tjänsten och visar sidan. */
    private void begin() {
        List<String> need = new ArrayList<>();
        for (String p : new String[]{Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN}) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) need.add(p);
        }
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            need.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        if (!need.isEmpty() && !asked) {
            asked = true;
            requestPermissions(need.toArray(new String[0]), 7);
            return;
        }
        startWatch();
        if (!loaded) {
            loaded = true;
            trusted = true;
            wv.loadUrl(HOME);
        }
    }

    private boolean asked = false;

    private void startWatch() {
        if (checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Appen behöver lov att använda Bluetooth (Enheter i närheten)", Toast.LENGTH_LONG).show();
            return;
        }
        if (!WatchService.running) {
            try {
                startForegroundService(new Intent(this, WatchService.class));
            } catch (Exception e) {
                Toast.makeText(this, "Kunde inte starta kontakten med klockan", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 7) begin();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != 9 || picking == null) return;
        Uri[] out = null;
        if (resultCode == RESULT_OK && data != null && data.getData() != null) out = new Uri[]{data.getData()};
        picking.onReceiveValue(out);
        picking = null;
    }

    @Override
    protected void onResume() {
        super.onResume();
        WatchService.web = this;
        js("window.__mk&&__mk.state(" + WatchService.readyNow + ")");
    }

    @Override
    protected void onDestroy() {
        if (WatchService.web == this) WatchService.web = null;
        try {
            wv.destroy();
        } catch (Exception ignored) {
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        // Tillbaka lägger appen i bakgrunden. Kontakten med klockan fortsätter.
        moveTaskToBack(true);
    }

    private void showOffline() {
        trusted = false;
        String html = "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
                + "<body style='margin:0;background:#07080c;color:#f2f3f7;font:17px/1.5 system-ui;padding:48px 24px'>"
                + "<h1 style='font-size:26px;margin:0 0 12px'>Min klocka</h1>"
                + "<p style='color:#9aa0b4'>Sidan kunde inte hämtas. Första gången behövs internet. Musikknapparna på klockan fungerar ändå.</p>"
                + "<p><a href='" + HOME + "' style='display:block;text-align:center;padding:16px;border-radius:20px;background:#3ba0ff;color:#08090d;font-weight:700;text-decoration:none'>Försök igen</a></p></body>";
        wv.loadDataWithBaseURL("about:blank", html, "text/html", "utf-8", null);
    }

    private SharedPreferences prefs() {
        return getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
    }

    private void js(final String code) {
        ui.post(() -> {
            try {
                if (trusted) wv.evaluateJavascript(code, null);
            } catch (Exception ignored) {
            }
        });
    }

    private static String quote(String s) {
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").replace("\r", " ") + "'";
    }

    // ---------- från tjänsten till sidan ----------
    @Override
    public void rx(byte[] v) {
        js("window.__mk&&__mk.rx('" + Base64.encodeToString(v, Base64.NO_WRAP) + "')");
    }

    @Override
    public void state(boolean on) {
        js("window.__mk&&__mk.state(" + on + ")");
    }

    @Override
    public void line(String s) {
        js("window.__mk&&__mk.line(" + quote(s) + ")");
    }

    @Override
    public void done(int id, boolean ok) {
        js("window.__mk&&__mk.done(" + id + "," + ok + ")");
    }

    // ---------- från sidan till tjänsten ----------
    private final class Bridge {
        @JavascriptInterface
        public boolean isReady() {
            return trusted && WatchService.readyNow;
        }

        @JavascriptInterface
        public void start() {
            if (!trusted) return;
            ui.post(MainActivity.this::startWatch);
        }

        @JavascriptInterface
        public void write(final int id, String b64) {
            if (!trusted) return;
            final byte[] data;
            try {
                data = Base64.decode(b64, Base64.DEFAULT);
            } catch (Exception e) {
                done(id, false);
                return;
            }
            ui.post(() -> {
                WatchService s = WatchService.instance;
                if (s == null) done(id, false);
                else s.webWrite(id, data);
            });
        }

        @JavascriptInterface
        public String getKey() {
            return trusted ? prefs().getString(WatchService.KEY, "") : "";
        }

        @JavascriptInterface
        public void setKey(String k) {
            if (!trusted || k == null) return;
            Matcher m = Pattern.compile("ba[0-9a-f]{50}").matcher(k.toLowerCase());
            if (m.find()) prefs().edit().putString(WatchService.KEY, m.group()).apply();
        }

        /** Sparar en fil i Nedladdningar, till exempel dina egna urtavlor. */
        @JavascriptInterface
        public boolean saveFile(String name, String b64) {
            if (!trusted || name == null) return false;
            try {
                byte[] data = Base64.decode(b64, Base64.DEFAULT);
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.Downloads.DISPLAY_NAME, name.replaceAll("[^A-Za-z0-9._-]", "_"));
                cv.put(MediaStore.Downloads.MIME_TYPE, name.endsWith(".json") ? "application/json" : "application/octet-stream");
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                if (uri == null) return false;
                try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                    if (out == null) return false;
                    out.write(data);
                }
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public void share(final String text) {
            if (!trusted || text == null) return;
            ui.post(() -> {
                try {
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("text/plain");
                    i.putExtra(Intent.EXTRA_TEXT, text);
                    startActivity(Intent.createChooser(i, "Dela"));
                } catch (Exception ignored) {
                }
            });
        }
    }
}
