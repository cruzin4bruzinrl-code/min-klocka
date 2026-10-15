package se.minklocka.app;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.Camera;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.Gravity;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.TextView;

import java.io.OutputStream;

/**
 * Kamerafjärren: klockans kamera skickar 04/46 (öppna), 04/47 (ta bild) och 04/48 (stäng), enligt loggen och originalappen.
 * Bilderna sparas i Bilder/Min klocka.
 */
@SuppressWarnings("deprecation")
public class CameraActivity extends Activity implements SurfaceHolder.Callback {
    static volatile CameraActivity instance;
    private Camera cam;
    private SurfaceView sv;
    private View flash;
    private TextView hint;
    private boolean busy;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        sv = new SurfaceView(this);
        root.addView(sv, new FrameLayout.LayoutParams(-1, -1));
        flash = new View(this);
        flash.setBackgroundColor(Color.WHITE);
        flash.setAlpha(0f);
        root.addView(flash, new FrameLayout.LayoutParams(-1, -1));
        hint = new TextView(this);
        hint.setText("Tryck på klockan för att ta en bild");
        hint.setTextColor(Color.WHITE);
        hint.setTextSize(16);
        hint.setPadding(30, 20, 30, 20);
        hint.setBackgroundColor(0x88000000);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(-2, -2, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL);
        lp.bottomMargin = 120;
        root.addView(hint, lp);
        root.setOnClickListener(v -> shoot());
        setContentView(root);
        sv.getHolder().addCallback(this);
        instance = this;
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.CAMERA}, 5);
    }

    @Override
    public void onRequestPermissionsResult(int rc, String[] p, int[] g) {
        super.onRequestPermissionsResult(rc, p, g);
        if (g.length > 0 && g[0] == PackageManager.PERMISSION_GRANTED) open(sv.getHolder());
        else {
            hint.setText("Appen behöver lov att använda kameran");
        }
    }

    private void open(SurfaceHolder h) {
        if (cam != null || checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) return;
        try {
            cam = Camera.open();
            cam.setDisplayOrientation(90);
            Camera.Parameters ps = cam.getParameters();
            ps.setRotation(90);
            if (ps.getSupportedFocusModes().contains(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE))
                ps.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
            Camera.Size best = null;
            for (Camera.Size s : ps.getSupportedPictureSizes()) if (best == null || s.width * s.height > best.width * best.height) best = s;
            if (best != null) ps.setPictureSize(best.width, best.height);
            cam.setParameters(ps);
            cam.setPreviewDisplay(h);
            cam.startPreview();
        } catch (Exception e) {
            hint.setText("Kameran gick inte att öppna: " + e.getMessage());
            WatchService.log("Kameran gick inte att öppna: " + e.getMessage());
        }
    }

    void shoot() {
        if (cam == null || busy) return;
        busy = true;
        try {
            cam.takePicture(() -> new ToneGenerator(AudioManager.STREAM_SYSTEM, 80).startTone(ToneGenerator.TONE_PROP_BEEP, 120), null, (data, c) -> {
                save(data);
                flash.setAlpha(1f);
                flash.animate().alpha(0f).setDuration(350).start();
                try {
                    c.startPreview();
                } catch (Exception ignored) {
                }
                busy = false;
            });
        } catch (Exception e) {
            busy = false;
            WatchService.log("Bilden gick inte att ta: " + e.getMessage());
        }
    }

    private void save(byte[] data) {
        try {
            ContentValues cv = new ContentValues();
            cv.put(MediaStore.Images.Media.DISPLAY_NAME, "klocka_" + System.currentTimeMillis() + ".jpg");
            cv.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
            cv.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/Min klocka");
            Uri u = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
            if (u == null) return;
            try (OutputStream o = getContentResolver().openOutputStream(u)) {
                if (o != null) o.write(data);
            }
            hint.setText("Bilden är sparad i Bilder/Min klocka");
            WatchService.log("Bild tagen från klockan");
        } catch (Exception e) {
            WatchService.log("Bilden gick inte att spara: " + e.getMessage());
        }
    }

    @Override
    public void surfaceCreated(SurfaceHolder h) {
        open(h);
    }

    @Override
    public void surfaceChanged(SurfaceHolder h, int f, int w, int hh) {
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder h) {
        release();
    }

    private void release() {
        if (cam != null) {
            try {
                cam.stopPreview();
                cam.release();
            } catch (Exception ignored) {
            }
            cam = null;
        }
    }

    @Override
    protected void onDestroy() {
        release();
        if (instance == this) instance = null;
        super.onDestroy();
    }
}
