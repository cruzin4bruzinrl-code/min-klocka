package se.minklocka.app;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

/** Läser telefonens aviseringar (när du gett lov) och skickar dem till klockan. Inget sparas och inget skickas någon annanstans. */
public class NotifyService extends NotificationListenerService {
    static volatile boolean connected = false;

    @Override
    public void onListenerConnected() {
        connected = true;
        WatchService.log("Appen får läsa aviseringar");
    }

    @Override
    public void onListenerDisconnected() {
        connected = false;
    }

    private static String lastNav = "";

    private void navigation(Notification n) {
        Bundle x = n.extras;
        if (x == null) return;
        CharSequence title = x.getCharSequence(Notification.EXTRA_TITLE);
        CharSequence text = x.getCharSequence(Notification.EXTRA_TEXT);
        String t = title == null ? "" : title.toString(), b = text == null ? "" : text.toString();
        if (t.isEmpty() && b.isEmpty()) return;
        String key = (t + "|" + b).replaceAll("[0-9.,]+\\s*(m|km|min|h)\\b", "#").replaceAll("[0-9]", "");
        if (key.equals(lastNav)) return;
        lastNav = key;
        WatchService.log("Vägbeskrivning till klockan");
        Notifier.push(this, 10, t, b);
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            if (!Notifier.enabled(this)) return;
            String pkg = sbn.getPackageName();
            if (pkg == null || pkg.equals(getPackageName()) || pkg.equals("android") || pkg.equals("com.android.systemui")) return;
            Notification n = sbn.getNotification();
            if (n == null) return;
            // Vägbeskrivning från Google Maps eller Waze: den avisering som hela tiden uppdateras under färden.
            // Klockan får nästa instruktion när den byts, inte varje gång avståndet räknas ner.
            if (sbn.isOngoing() && (pkg.equals("com.google.android.apps.maps") || pkg.equals("com.waze"))) {
                navigation(n);
                return;
            }
            if (sbn.isOngoing()) return;
            if ((n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
            String cat = n.category;
            if (Notification.CATEGORY_TRANSPORT.equals(cat) || Notification.CATEGORY_PROGRESS.equals(cat) || Notification.CATEGORY_SERVICE.equals(cat)) return;
            // Sms tas emot direkt (med numret, så att klockan kan svara). Då hoppas sms-appens avisering över.
            if (Notifier.isSmsApp(this, pkg) && Notifier.smsAllowed(this)) return;
            Bundle x = n.extras;
            if (x == null) return;
            CharSequence title = x.getCharSequence(Notification.EXTRA_TITLE);
            CharSequence text = x.getCharSequence(Notification.EXTRA_BIG_TEXT);
            if (text == null) text = x.getCharSequence(Notification.EXTRA_TEXT);
            String t = title == null ? "" : title.toString().replaceAll("\\s*\\(\\d+\\)$", "").replaceAll("\\s*\\[\\d+ [^\\]]*\\]$", "");
            int type = Notifier.typeOf(this, pkg);
            Notifier.push(this, type, t, type == 0 ? "" : (text == null ? "" : text.toString()));
        } catch (Exception e) {
            WatchService.log("Aviseringen gick inte att läsa: " + e.getMessage());
        }
    }
}
