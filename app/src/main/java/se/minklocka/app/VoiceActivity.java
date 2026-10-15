package se.minklocka.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

/**
 * Röstassistenten på klockan: telefonen startar sin röstassistent över Bluetooth. Väljer du Min klocka för det
 * öppnas Gemini i stället för Bixby.
 */
public class VoiceActivity extends Activity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        openGemini(this);
        finish();
    }

    static void openGemini(Activity a) {
        Intent[] tries = new Intent[]{
                new Intent(Intent.ACTION_VOICE_COMMAND).setPackage("com.google.android.googlequicksearchbox"),
                new Intent("android.intent.action.VOICE_ASSIST").setPackage("com.google.android.googlequicksearchbox"),
                a.getPackageManager().getLaunchIntentForPackage("com.google.android.apps.bard"),
                new Intent(Intent.ACTION_ASSIST).setPackage("com.google.android.googlequicksearchbox")
        };
        for (Intent i : tries) {
            if (i == null) continue;
            try {
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                a.startActivity(i);
                WatchService.log("Röstassistent: Gemini öppnad");
                return;
            } catch (Exception ignored) {
            }
        }
        WatchService.log("Röstassistent: Gemini hittades inte");
    }
}
