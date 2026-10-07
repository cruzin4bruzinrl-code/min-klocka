package se.minklocka.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.media.AudioManager;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import android.view.KeyEvent;

import java.text.SimpleDateFormat;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Håller kontakten med klockan i bakgrunden och gör klockans musikknappar till telefonens medieknappar.
 * Första versionen lyssnar bara. Det enda den skickar till klockan är hälsningen och bindningen, samma som webbsidan.
 */
@SuppressWarnings({"MissingPermission", "deprecation"})
public class WatchService extends Service {
    static final UUID SVC = UUID.fromString("4cdabaa0-2cea-c0c1-b38d-a0481ae60a97");
    static final UUID CH_W = UUID.fromString("4cdabaa1-2cea-c0c1-b38d-a0481ae60a97");
    static final UUID CH_N = UUID.fromString("4cdabaa2-2cea-c0c1-b38d-a0481ae60a97");
    static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    static final String PREFS = "minklocka", KEY = "nyckel", ADDR = "adress", ACTION_STOP = "se.minklocka.app.STOPPA";
    static final String CHANNEL = "klocka";
    static final String WATCH_NAME = "TRIARENALI1";

    // Läget visas i appens fönster. Allt ligger bara i minnet.
    static volatile String status = "Inte startad";
    static volatile boolean running = false;
    static volatile Runnable listener;
    static final List<String> LOG = Collections.synchronizedList(new ArrayList<String>());

    /** Appens fönster (webbsidan) kopplar in sig här och får allt klockan skickar. Anropas alltid på huvudtråden. */
    interface Web {
        void rx(byte[] v);

        void state(boolean on);

        void line(String s);

        void done(int id, boolean ok);
    }

    static volatile WatchService instance;
    static volatile Web web;
    static volatile boolean readyNow = false;
    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    /** En bit att skriva till klockan. id är satt på sista biten av något webbsidan bett om, så att den får kvitto. */
    private static final class Part {
        final byte[] b;
        final int id;

        Part(byte[] b, int id) {
            this.b = b;
            this.id = id;
        }
    }

    private final Handler h = new Handler(Looper.getMainLooper());
    private BluetoothGatt gatt;
    private BluetoothGattCharacteristic chW, chN;
    private BluetoothLeScanner scanner;
    private boolean scanning, ready, writing, discoverStarted;
    private int mtu = 23, seq = 0x0500, generation = 0;
    private byte[] rx = new byte[0];
    private final ArrayDeque<Part> queue = new ArrayDeque<>();
    private Part flying;
    private int pumpTries = 0;

    // ---------- hjälp ----------
    static void log(String s) {
        String line = new SimpleDateFormat("HH:mm:ss", Locale.ROOT).format(new Date()) + "  " + s;
        synchronized (LOG) {
            LOG.add(line);
            while (LOG.size() > 200) LOG.remove(0);
        }
        Runnable r = listener;
        if (r != null) r.run();
        MAIN.post(() -> {
            Web w = web;
            if (w != null) w.line(s);
        });
    }

    private void setReady(boolean on) {
        ready = on;
        readyNow = on;
        Web w = web;
        if (w != null) w.state(on);
    }

    /** Tömmer kön. Det webbsidan väntade på får besked om att det inte gick. */
    private void dropQueue() {
        Web w = web;
        if (flying != null && flying.id > 0 && w != null) w.done(flying.id, false);
        flying = null;
        for (Part q : queue) if (q.id > 0 && w != null) w.done(q.id, false);
        queue.clear();
        writing = false;
        pumpTries = 0;
    }

    private void setStatus(String s) {
        status = s;
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null && running) nm.notify(1, notification(s));
        Runnable r = listener;
        if (r != null) r.run();
    }

    private SharedPreferences prefs() {
        return getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static byte[] hexToBytes(String s) {
        byte[] b = new byte[s.length() / 2];
        for (int i = 0; i < b.length; i++) b[i] = (byte) Integer.parseInt(s.substring(i * 2, i * 2 + 2), 16);
        return b;
    }

    static String hex(byte[] b) {
        StringBuilder sb = new StringBuilder();
        for (byte x : b) sb.append(String.format(Locale.ROOT, "%02x ", x & 255));
        return sb.toString().trim();
    }

    static int crc16(byte[] p) {
        int c = 0xFFFF;
        for (byte b : p) {
            c ^= (b & 255) << 8;
            for (int i = 0; i < 8; i++) c = (c & 0x8000) != 0 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF;
        }
        return c;
    }

    /** Samma ram som webbsidan bygger: BA 21, längd, CRC16 över innehållet, löpnummer, och sedan innehållet. */
    static byte[] frame(int cmd, int key, byte[] data, int seq) {
        int n = data == null ? 0 : data.length;
        byte[] p = new byte[5 + n];
        p[0] = (byte) cmd;
        p[1] = (byte) (n > 0 ? 1 : 0);
        p[2] = (byte) key;
        p[3] = (byte) (n >> 8);
        p[4] = (byte) n;
        if (n > 0) System.arraycopy(data, 0, p, 5, n);
        int c = crc16(p);
        byte[] f = new byte[8 + p.length];
        f[0] = (byte) 0xBA;
        f[1] = 0x21;
        f[2] = (byte) (p.length >> 8);
        f[3] = (byte) p.length;
        f[4] = (byte) (c >> 8);
        f[5] = (byte) c;
        f[6] = (byte) seq;
        f[7] = (byte) (seq >> 8);
        System.arraycopy(p, 0, f, 8, p.length);
        return f;
    }

    // ---------- tjänstens liv ----------
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }
        NotificationManager nm = getSystemService(NotificationManager.class);
        NotificationChannel ch = new NotificationChannel(CHANNEL, "Kontakt med klockan", NotificationManager.IMPORTANCE_LOW);
        ch.setShowBadge(false);
        nm.createNotificationChannel(ch);
        try {
            startForeground(1, notification("Startar…"), ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE);
        } catch (Exception e) {
            log("Kunde inte starta i bakgrunden: " + e.getMessage());
            status = "Kunde inte starta. Ge appen lov att använda Bluetooth";
            stopSelf();
            return START_NOT_STICKY;
        }
        instance = this;
        if (!running) {
            running = true;
            log("Startar");
            begin();
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        running = false;
        instance = null;
        generation++;
        h.removeCallbacksAndMessages(null);
        stopScan();
        closeGatt();
        status = "Stoppad";
        log("Stoppad");
        super.onDestroy();
    }

    private Notification notification(String text) {
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1, new Intent(this, WatchService.class).setAction(ACTION_STOP), PendingIntent.FLAG_IMMUTABLE);
        return new Notification.Builder(this, CHANNEL)
                .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
                .setContentTitle("Min klocka")
                .setContentText(text)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(open)
                .addAction(new Notification.Action.Builder((android.graphics.drawable.Icon) null, "Stoppa", stop).build())
                .build();
    }

    // ---------- hitta och ansluta ----------
    private boolean isWatch(BluetoothDevice d) {
        try {
            String n = d.getName();
            return n != null && n.startsWith("TRIARENA");
        } catch (SecurityException e) {
            return false;
        }
    }

    private void later(long ms) {
        final int gen = generation;
        h.postDelayed(() -> {
            if (running && gen == generation) begin();
        }, ms);
    }

    private void begin() {
        if (!running) return;
        generation++;
        if (checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            setStatus("Appen saknar lov att använda Bluetooth");
            return;
        }
        BluetoothManager bm = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter ad = bm == null ? null : bm.getAdapter();
        if (ad == null || !ad.isEnabled()) {
            setStatus("Slå på Bluetooth");
            later(10000);
            return;
        }
        BluetoothDevice dev = null;
        // Är klockan redan ansluten till telefonen (till exempel av webbsidan i Chrome) går det att dela den kontakten.
        for (BluetoothDevice d : bm.getConnectedDevices(BluetoothProfile.GATT)) if (isWatch(d)) dev = d;
        if (dev == null) for (BluetoothDevice d : ad.getBondedDevices()) if (isWatch(d)) dev = d;
        String saved = prefs().getString(ADDR, null);
        if (dev == null && saved != null && BluetoothAdapter.checkBluetoothAddress(saved)) dev = ad.getRemoteDevice(saved);
        if (dev != null) {
            open(dev, true);
            return;
        }
        startScan(ad);
    }

    private void startScan(BluetoothAdapter ad) {
        if (checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
            setStatus("Appen saknar lov att söka efter klockan");
            return;
        }
        scanner = ad.getBluetoothLeScanner();
        if (scanner == null) {
            setStatus("Slå på Bluetooth");
            later(10000);
            return;
        }
        List<ScanFilter> filters = new ArrayList<>();
        filters.add(new ScanFilter.Builder().setDeviceName(WATCH_NAME).build());
        try {
            scanner.startScan(filters, new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build(), scanCb);
        } catch (Exception e) {
            log("Sökningen gick inte att starta: " + e.getMessage());
            later(15000);
            return;
        }
        scanning = true;
        setStatus("Söker efter klockan…");
        log("Söker efter " + WATCH_NAME);
        final int gen = generation;
        h.postDelayed(() -> {
            if (!running || gen != generation || !scanning) return;
            stopScan();
            setStatus("Hittar inte klockan. Försöker igen snart");
            log("Hittade inte klockan på 30 sekunder");
            later(30000);
        }, 30000);
    }

    private void stopScan() {
        if (scanning && scanner != null) {
            try {
                scanner.stopScan(scanCb);
            } catch (Exception ignored) {
            }
        }
        scanning = false;
    }

    private final ScanCallback scanCb = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            final BluetoothDevice d = result.getDevice();
            h.post(() -> {
                if (running && scanning) {
                    log("Hittade klockan");
                    open(d, false);
                }
            });
        }

        @Override
        public void onScanFailed(int errorCode) {
            h.post(() -> {
                scanning = false;
                log("Sökningen misslyckades (" + errorCode + ")");
                later(15000);
            });
        }
    };

    private void open(BluetoothDevice dev, boolean auto) {
        stopScan();
        closeGatt();
        generation++;
        prefs().edit().putString(ADDR, dev.getAddress()).apply();
        setStatus("Ansluter till klockan…");
        log("Ansluter" + (auto ? " (väntar tills klockan är nära)" : ""));
        gatt = dev.connectGatt(this, auto, cb, BluetoothDevice.TRANSPORT_LE);
        if (gatt == null) {
            log("Telefonen ville inte ansluta");
            later(10000);
        }
    }

    private void closeGatt() {
        setReady(false);
        dropQueue();
        chW = null;
        chN = null;
        if (gatt != null) {
            try {
                gatt.disconnect();
                gatt.close();
            } catch (Exception ignored) {
            }
            gatt = null;
        }
    }

    private final BluetoothGattCallback cb = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(final BluetoothGatt g, final int st, final int newState) {
            h.post(() -> {
                if (g != gatt || !running) return;
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    log("Kontakt med klockan, förbereder");
                    setReady(false);
                    dropQueue();
                    discoverStarted = false;
                    rx = new byte[0];
                    mtu = 23;
                    h.postDelayed(() -> {
                        if (g != gatt) return;
                        if (!g.requestMtu(517)) discover(g);
                    }, 300);
                    // Svarar telefonen aldrig om paketstorleken går vi vidare ändå
                    h.postDelayed(() -> {
                        if (g == gatt) discover(g);
                    }, 3000);
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    setReady(false);
                    dropQueue();
                    log("Frånkopplad (" + st + ")");
                    setStatus("Väntar på klockan");
                    // connect() på samma kontakt väntar tills klockan är nära igen
                    boolean again = false;
                    try {
                        again = g.connect();
                    } catch (Exception ignored) {
                    }
                    if (!again) {
                        closeGatt();
                        later(5000);
                    }
                }
            });
        }

        @Override
        public void onMtuChanged(final BluetoothGatt g, final int m, final int st) {
            h.post(() -> {
                if (g != gatt) return;
                if (st == BluetoothGatt.GATT_SUCCESS) mtu = m;
                discover(g);
            });
        }

        @Override
        public void onServicesDiscovered(final BluetoothGatt g, final int st) {
            h.post(() -> {
                if (g != gatt) return;
                BluetoothGattService s = g.getService(SVC);
                if (s == null) {
                    log("Hittar inte klockans tjänst (" + st + ")");
                    setStatus("Det här verkar inte vara klockan");
                    return;
                }
                chW = s.getCharacteristic(CH_W);
                chN = s.getCharacteristic(CH_N);
                if (chW == null || chN == null) {
                    log("Klockans kanaler saknas");
                    return;
                }
                g.setCharacteristicNotification(chN, true);
                BluetoothGattDescriptor d = chN.getDescriptor(CCCD);
                if (d == null) {
                    onReady();
                    return;
                }
                boolean indicate = (chN.getProperties() & BluetoothGattCharacteristic.PROPERTY_NOTIFY) == 0;
                d.setValue(indicate ? BluetoothGattDescriptor.ENABLE_INDICATION_VALUE : BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                if (!g.writeDescriptor(d)) {
                    log("Kunde inte börja lyssna på klockan");
                    onReady();
                }
            });
        }

        @Override
        public void onDescriptorWrite(final BluetoothGatt g, BluetoothGattDescriptor d, int st) {
            h.post(() -> {
                if (g == gatt) onReady();
            });
        }

        @Override
        public void onCharacteristicWrite(final BluetoothGatt g, BluetoothGattCharacteristic c, int st) {
            h.post(() -> {
                if (g != gatt) return;
                wrote();
            });
        }

        // Äldre Android anropar den här
        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c) {
            byte[] v = c.getValue();
            if (v == null) return;
            final byte[] copy = v.clone();
            h.post(() -> feed(copy));
        }

        // Android 13 och senare anropar den här
        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c, byte[] v) {
            final byte[] copy = v.clone();
            h.post(() -> feed(copy));
        }
    };

    private void discover(BluetoothGatt g) {
        if (discoverStarted) return;
        discoverStarted = true;
        if (!g.discoverServices()) log("Kunde inte läsa klockans tjänster");
    }

    private void onReady() {
        if (ready) return;
        String k = prefs().getString(KEY, "");
        if (k.matches("ba[0-9a-f]{50}")) {
            // Hälsning och bindning, samma som webbsidan skickar
            sendRaw(hexToBytes(k));
            byte[] bind = new byte[13];
            System.arraycopy(hexToBytes(k.substring(26, 50)), 0, bind, 0, 12);
            bind[12] = 1;
            sendRaw(frame(0x04, 0x44, bind, seq++));
        } else {
            log("Nyckeln saknas. Klistra in din personliga länk i appen");
        }
        // Samma start som webbsidan gör, och som klockan setts svara på: fråga efter urtavlan, ställ tiden, läs batteriet
        sendRaw(frame(0x16, 0x01, new byte[]{0, 0}, seq++));
        java.util.Calendar c = java.util.Calendar.getInstance();
        int tz = (c.get(java.util.Calendar.ZONE_OFFSET) + c.get(java.util.Calendar.DST_OFFSET)) / 3600000 * 10;
        sendRaw(frame(0x02, 0x20, new byte[]{(byte) (c.get(java.util.Calendar.YEAR) - 2000), (byte) (c.get(java.util.Calendar.MONTH) + 1), (byte) c.get(java.util.Calendar.DAY_OF_MONTH),
                (byte) c.get(java.util.Calendar.HOUR_OF_DAY), (byte) c.get(java.util.Calendar.MINUTE), (byte) c.get(java.util.Calendar.SECOND), 0, (byte) tz}, seq++));
        sendRaw(frame(0x04, 0x40, new byte[0], seq++));
        setStatus("Ansluten till klockan");
        log("Ansluten. Musikknapparna på klockan styr nu telefonen");
        setReady(true);
    }

    // ---------- skicka ----------
    private void sendRaw(byte[] data) {
        enqueue(data, 0);
    }

    /** Webbsidan vill skriva till klockan. Kvittot (done) kommer när sista biten har gått iväg. */
    void webWrite(int id, byte[] data) {
        if (!ready || gatt == null || chW == null || data.length == 0) {
            Web w = web;
            if (w != null) w.done(id, false);
            return;
        }
        enqueue(data, id);
    }

    private void enqueue(byte[] data, int id) {
        int size = Math.max(20, Math.min(512, mtu - 3));
        for (int off = 0; off < data.length; off += size) {
            byte[] part = new byte[Math.min(size, data.length - off)];
            System.arraycopy(data, off, part, 0, part.length);
            queue.add(new Part(part, off + size >= data.length ? id : 0));
        }
        pump();
    }

    private void wrote() {
        Part p = flying;
        flying = null;
        writing = false;
        Web w = web;
        if (p != null && p.id > 0 && w != null) w.done(p.id, true);
        pump();
    }

    private void pump() {
        if (writing || queue.isEmpty() || gatt == null || chW == null) return;
        Part part = queue.peek();
        chW.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
        chW.setValue(part.b);
        if (gatt.writeCharacteristic(chW)) {
            queue.poll();
            flying = part;
            writing = true;
            pumpTries = 0;
            // Skulle kvittot utebli fortsätter kön ändå
            final BluetoothGatt g = gatt;
            final long t = SystemClock.uptimeMillis();
            lastWrite = t;
            h.postDelayed(() -> {
                if (g == gatt && writing && lastWrite == t) wrote();
            }, 1500);
        } else if (++pumpTries > 60) {
            log("Telefonen tar inte emot mer att skicka. Kön töms");
            dropQueue();
        } else {
            h.postDelayed(this::pump, 80);
        }
    }

    private long lastWrite;

    // ---------- ta emot ----------
    private void feed(byte[] v) {
        Web w = web;
        if (w != null) w.rx(v);
        byte[] n = new byte[rx.length + v.length];
        System.arraycopy(rx, 0, n, 0, rx.length);
        System.arraycopy(v, 0, n, rx.length, v.length);
        rx = n;
        while (rx.length >= 8) {
            if ((rx[0] & 255) != 0xBA) {
                int i = 1;
                while (i < rx.length && (rx[i] & 255) != 0xBA) i++;
                rx = java.util.Arrays.copyOfRange(rx, i, rx.length);
                continue;
            }
            int len = ((rx[2] & 255) << 8) | (rx[3] & 255);
            if (rx.length < 8 + len) break;
            byte[] f = java.util.Arrays.copyOfRange(rx, 0, 8 + len);
            rx = java.util.Arrays.copyOfRange(rx, 8 + len, rx.length);
            if (f.length >= 13) handle(f[8] & 255, f[10] & 255, java.util.Arrays.copyOfRange(f, 13, f.length));
        }
        if (rx.length > 8192) rx = new byte[0];
    }

    private final java.util.HashMap<Integer, Long> seen = new java.util.HashMap<>();

    private void handle(int cmd, int key, byte[] d) {
        if (cmd == 0x83) {
            log("Klockan känner igen appen");
        } else if (cmd == 0x0D) {
            media(key, d);
        } else if (cmd == 0x04 && key == 0x41 && d.length >= 1) {
            log("Klockans batteri: " + (d[0] & 255) + " %");
        } else if (cmd == 0x02 && key == 0x20) {
            log("Klockans tid är ställd");
        } else {
            // Allt annat skrivs ut, högst en gång var femte sekund per sort, så att det går att se vad klockan skickar
            int id = (cmd << 8) | key;
            long now = SystemClock.uptimeMillis();
            Long last = seen.get(id);
            if (last == null || now - last > 5000) {
                seen.put(id, now);
                byte[] head = d.length > 10 ? java.util.Arrays.copyOf(d, 10) : d;
                log("Från klockan: " + Integer.toHexString(cmd) + "/" + Integer.toHexString(key) + (d.length > 0 ? " " + hex(head) + (d.length > 10 ? " …" : "") : ""));
            }
        }
    }

    /**
     * Klockans musiksida. Provat på klockan: 4 spela eller pausa, 6 föregående, 7 nästa.
     * 0x0A kommer när volymreglaget på klockan ändras.
     */
    private void media(int key, byte[] d) {
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am == null) return;
        switch (key) {
            case 4:
            case 5:
                press(am, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE);
                log("Klockan: spela eller pausa");
                break;
            case 6:
                press(am, KeyEvent.KEYCODE_MEDIA_PREVIOUS);
                log("Klockan: föregående låt");
                break;
            case 7:
                press(am, KeyEvent.KEYCODE_MEDIA_NEXT);
                log("Klockan: nästa låt");
                break;
            case 8:
                am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, AudioManager.FLAG_SHOW_UI);
                log("Klockan: volym upp");
                break;
            case 9:
                am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, AudioManager.FLAG_SHOW_UI);
                log("Klockan: volym ner");
                break;
            case 10:
                // Klockans volymreglage. Provat: värdet är klockans läge mellan 0 och 100.
                if (d.length >= 2 && (d[0] & 255) == 1 && (d[1] & 255) <= 100) {
                    volume(am, d[1] & 255);
                    break;
                }
                log("Klockan: okänt volymvärde (" + hex(d) + ")");
                break;
            default:
                log("Klockan: okänd musikknapp " + Integer.toHexString(key) + (d.length > 0 ? " (" + hex(d) + ")" : ""));
        }
    }

    private int volumeTarget = -1, lastPercent = -1;

    /**
     * Telefonens medievolym följer klockans reglage: läget på klockan (0 till 100) blir samma läge på telefonen.
     * Neråt går det direkt. Uppåt glider volymen dit, ett steg var åttonde sekund, i stället för att hoppa.
     * Spelas ljudet i klockans egen högtalare skickar klockan ingenting, och då rörs inte telefonen.
     */
    private void volume(AudioManager am, int percent) {
        int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        volumeTarget = Math.round(percent * max / 100f);
        if (percent != lastPercent) {
            lastPercent = percent;
            log("Klockan: volym " + percent + ", telefonen går mot " + volumeTarget + " av " + max);
        }
        h.removeCallbacks(volumeStep);
        volumeStep.run();
    }

    private final Runnable volumeStep = new Runnable() {
        @Override
        public void run() {
            AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (am == null || volumeTarget < 0) return;
            int cur = am.getStreamVolume(AudioManager.STREAM_MUSIC);
            if (cur == volumeTarget) return;
            int next = volumeTarget < cur ? volumeTarget : cur + 1;
            try {
                am.setStreamVolume(AudioManager.STREAM_MUSIC, next, AudioManager.FLAG_SHOW_UI);
            } catch (Exception e) {
                log("Kunde inte ändra volymen: " + e.getMessage());
                return;
            }
            // Tog telefonen inte emot steget (till exempel en spärr mot högt ljud) slutar vi försöka
            if (am.getStreamVolume(AudioManager.STREAM_MUSIC) == cur) return;
            if (next < volumeTarget) h.postDelayed(this, 125);
        }
    };

    private void press(AudioManager am, int code) {
        long t = SystemClock.uptimeMillis();
        am.dispatchMediaKeyEvent(new KeyEvent(t, t, KeyEvent.ACTION_DOWN, code, 0));
        am.dispatchMediaKeyEvent(new KeyEvent(t, t, KeyEvent.ACTION_UP, code, 0));
    }
}
