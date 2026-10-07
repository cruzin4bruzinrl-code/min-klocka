package se.minklocka.app;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Ett enda fönster: läget, nyckeln, starta och stoppa, och en logg. */
public class MainActivity extends Activity {
    private TextView statusView, logView, keyState;
    private EditText keyInput;
    private Button startBtn;

    private int dp(float v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }

    private GradientDrawable box(int color, float radius) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(dp(radius));
        return g;
    }

    private TextView text(String s, float size, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, size);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private Button button(String s, int bg, int fg) {
        Button b = new Button(this);
        b.setText(s);
        b.setAllCaps(false);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        b.setTextColor(fg);
        b.setTypeface(Typeface.DEFAULT_BOLD);
        b.setBackground(box(bg, 18));
        b.setStateListAnimator(null);
        b.setMinHeight(dp(54));
        return b;
    }

    private LinearLayout.LayoutParams row(int top) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        p.topMargin = dp(top);
        return p;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final int ink = Color.parseColor("#07080c"), card = Color.parseColor("#171924"), fg = Color.parseColor("#f2f3f7"), dim = Color.parseColor("#9aa0b4"), accent = Color.parseColor("#3ba0ff");
        getWindow().setStatusBarColor(ink);
        getWindow().setNavigationBarColor(ink);

        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(ink);
        scroll.setFillViewport(true);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(20), dp(28), dp(20), dp(28));
        scroll.addView(root);

        root.addView(text("Min klocka", 28, fg, true));
        root.addView(text("Klockans musikknappar styr det som spelar på telefonen.", 14, dim, false), row(4));

        statusView = text("", 18, fg, true);
        statusView.setBackground(box(card, 20));
        statusView.setPadding(dp(18), dp(18), dp(18), dp(18));
        root.addView(statusView, row(20));

        startBtn = button("Starta", accent, Color.parseColor("#08090d"));
        root.addView(startBtn, row(12));
        startBtn.setOnClickListener(v -> {
            if (WatchService.running) {
                startService(new Intent(this, WatchService.class).setAction(WatchService.ACTION_STOP));
            } else {
                start();
            }
        });

        keyState = text("", 14, dim, false);
        root.addView(keyState, row(24));
        keyInput = new EditText(this);
        keyInput.setHint("Klistra in din personliga länk här");
        keyInput.setHintTextColor(dim);
        keyInput.setTextColor(fg);
        keyInput.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        keyInput.setSingleLine(true);
        keyInput.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS | InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD);
        keyInput.setBackground(box(card, 14));
        keyInput.setPadding(dp(14), dp(14), dp(14), dp(14));
        root.addView(keyInput, row(8));
        Button save = button("Spara nyckeln", card, fg);
        root.addView(save, row(8));
        save.setOnClickListener(v -> saveKey());

        root.addView(text("Logg", 14, dim, false), row(24));
        logView = text("", 12, Color.parseColor("#b9c0d4"), false);
        logView.setTypeface(Typeface.MONOSPACE);
        logView.setBackground(box(card, 16));
        logView.setPadding(dp(14), dp(14), dp(14), dp(14));
        logView.setTextIsSelectable(true);
        logView.setGravity(Gravity.TOP);
        logView.setMinHeight(dp(160));
        root.addView(logView, row(8));

        setContentView(scroll);
    }

    @Override
    protected void onResume() {
        super.onResume();
        WatchService.listener = () -> runOnUiThread(this::refresh);
        refresh();
    }

    @Override
    protected void onPause() {
        WatchService.listener = null;
        super.onPause();
    }

    private SharedPreferences prefs() {
        return getSharedPreferences(WatchService.PREFS, Context.MODE_PRIVATE);
    }

    private void refresh() {
        statusView.setText(WatchService.status);
        startBtn.setText(WatchService.running ? "Stoppa" : "Starta");
        boolean has = prefs().getString(WatchService.KEY, "").matches("ba[0-9a-f]{50}");
        keyState.setText(has ? "Nyckeln är sparad. Den lämnar aldrig telefonen." : "Nyckeln saknas. Utan den känner klockan kanske inte igen appen.");
        StringBuilder sb = new StringBuilder();
        synchronized (WatchService.LOG) {
            for (int i = WatchService.LOG.size() - 1; i >= 0 && i >= WatchService.LOG.size() - 60; i--) sb.append(WatchService.LOG.get(i)).append('\n');
        }
        logView.setText(sb.length() == 0 ? "Inget har hänt än." : sb.toString().trim());
    }

    private void saveKey() {
        Matcher m = Pattern.compile("ba[0-9a-f]{50}").matcher(keyInput.getText().toString().toLowerCase());
        if (!m.find()) {
            Toast.makeText(this, "Hittar ingen hel nyckel i texten", Toast.LENGTH_LONG).show();
            return;
        }
        prefs().edit().putString(WatchService.KEY, m.group()).apply();
        keyInput.setText("");
        Toast.makeText(this, "Nyckeln är sparad", Toast.LENGTH_SHORT).show();
        refresh();
    }

    private void start() {
        List<String> need = new ArrayList<>();
        for (String p : new String[]{Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN}) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) need.add(p);
        }
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            need.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        if (!need.isEmpty()) {
            requestPermissions(need.toArray(new String[0]), 7);
            return;
        }
        startForegroundService(new Intent(this, WatchService.class));
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != 7) return;
        // Bluetooth krävs. Aviseringen är bara till för att visa att appen är igång.
        if (checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
                && checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED) {
            startForegroundService(new Intent(this, WatchService.class));
        } else {
            Toast.makeText(this, "Appen behöver lov att använda Bluetooth (Enheter i närheten)", Toast.LENGTH_LONG).show();
        }
    }
}
