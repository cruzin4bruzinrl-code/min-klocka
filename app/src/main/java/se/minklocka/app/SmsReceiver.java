package se.minklocka.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;

import java.util.LinkedHashMap;
import java.util.Map;

/** Tar emot sms (när du gett lov) och skickar dem till klockan med avsändarens nummer, så att klockan kan svara. */
public class SmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        if (!Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(i.getAction())) return;
        try {
            SmsMessage[] msgs = Telephony.Sms.Intents.getMessagesFromIntent(i);
            if (msgs == null) return;
            Map<String, StringBuilder> by = new LinkedHashMap<>();
            for (SmsMessage m : msgs) {
                if (m == null || m.getOriginatingAddress() == null) continue;
                StringBuilder sb = by.get(m.getOriginatingAddress());
                if (sb == null) by.put(m.getOriginatingAddress(), sb = new StringBuilder());
                sb.append(m.getMessageBody() == null ? "" : m.getMessageBody());
            }
            for (Map.Entry<String, StringBuilder> e : by.entrySet()) Notifier.sms(c, e.getKey(), e.getValue().toString());
        } catch (Exception e) {
            WatchService.log("Sms gick inte att läsa: " + e.getMessage());
        }
    }
}
