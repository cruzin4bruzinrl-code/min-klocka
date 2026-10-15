package se.minklocka.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;

/**
 * Hitta telefonen: klockan skickar 05/51 01 (sett i loggen när knappen trycks). Telefonen ringer då med larmljud
 * på full volym, även på ljudlöst, och vibrerar i högst 45 sekunder eller tills du stoppar.
 */
public class FindPhone extends BroadcastReceiver {
    static final String STOP = "se.minklocka.app.HITTAD", CH = "hitta";
    private static MediaPlayer mp;
    private static Vibrator vib;
    private static int oldVol = -1;
    private static final Handler H = new Handler(Looper.getMainLooper());
    private static final Runnable AUTO = () -> stop(null);

    static synchronized void start(Context c) {
        if (mp != null) return;
        WatchService.log("Klockan letar efter telefonen. Telefonen ringer");
        AudioManager am = c.getSystemService(AudioManager.class);
        try {
            if (am != null) {
                oldVol = am.getStreamVolume(AudioManager.STREAM_ALARM);
                am.setStreamVolume(AudioManager.STREAM_ALARM, am.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
            }
            Uri u = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (u == null) u = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            if (u == null) u = Settings.System.DEFAULT_RINGTONE_URI;
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            mp.setDataSource(c, u);
            mp.setLooping(true);
            mp.prepare();
            mp.start();
        } catch (Exception e) {
            WatchService.log("Ljudet gick inte att spela: " + e.getMessage());
        }
        vib = c.getSystemService(Vibrator.class);
        if (vib != null) vib.vibrate(VibrationEffect.createWaveform(new long[]{0, 600, 400}, 0));
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel(CH, "Hitta telefonen", NotificationManager.IMPORTANCE_HIGH));
        PendingIntent stop = PendingIntent.getBroadcast(c, 77, new Intent(c, FindPhone.class).setAction(STOP), PendingIntent.FLAG_IMMUTABLE);
        nm.notify(77, new Notification.Builder(c, CH).setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle("Här är jag!")
                .setContentText("Klockan letar efter telefonen. Tryck för att sluta ringa").setContentIntent(stop).setDeleteIntent(stop)
                .addAction(new Notification.Action.Builder((android.graphics.drawable.Icon) null, "Hittad", stop).build()).setOngoing(true).build());
        H.postDelayed(AUTO, 45000);
    }

    static synchronized void stop(Context c) {
        H.removeCallbacks(AUTO);
        if (mp != null) {
            try {
                mp.stop();
                mp.release();
            } catch (Exception ignored) {
            }
            mp = null;
            WatchService.log("Telefonen slutade ringa");
        }
        if (vib != null) {
            vib.cancel();
            vib = null;
        }
        Context ctx = c != null ? c : WatchService.instance;
        if (ctx != null) {
            AudioManager am = ctx.getSystemService(AudioManager.class);
            if (am != null && oldVol >= 0) am.setStreamVolume(AudioManager.STREAM_ALARM, oldVol, 0);
            NotificationManager nm = ctx.getSystemService(NotificationManager.class);
            if (nm != null) nm.cancel(77);
        }
        oldVol = -1;
    }

    @Override
    public void onReceive(Context c, Intent i) {
        if (STOP.equals(i.getAction())) stop(c);
    }
}
