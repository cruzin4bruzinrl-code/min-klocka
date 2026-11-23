package se.minklocka.app

import android.graphics.BitmapFactory
import android.util.Base64
import android.webkit.WebView
import android.view.ViewGroup
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.delay
import org.json.JSONObject

/** Allt sidan och tjänsten vet om klockan, samlat så att de inbyggda skärmarna kan visa det. */
object WatchState {
    var status by mutableStateOf("Startar")
    var ready by mutableStateOf(false)
    var battery by mutableStateOf(-1)
    var steps by mutableStateOf(-1)
    var pulse by mutableStateOf(-1)
    var stepGoal by mutableStateOf(8000)
    var hours by mutableStateOf(List(24) { 0 })
    var week by mutableStateOf(List(7) { -1 })
    var weekDays by mutableStateOf(List(7) { "" })
    var pulseDay by mutableStateOf(listOf<Int>())
    var dialName by mutableStateOf("")
    var dial by mutableStateOf<ImageBitmap?>(null)

    @JvmStatic fun putHealth(json: String) {
        try {
            val o = JSONObject(json)
            steps = o.optInt("steps", -1); pulse = o.optInt("pulse", -1); stepGoal = o.optInt("goal", 8000)
            o.optJSONArray("hours")?.let { a -> hours = List(a.length()) { a.optInt(it) } }
            o.optJSONArray("week")?.let { a -> week = List(a.length()) { a.optInt(it, -1) } }
            o.optJSONArray("days")?.let { a -> weekDays = List(a.length()) { a.optString(it) } }
            o.optJSONArray("hr")?.let { a -> pulseDay = List(a.length()) { a.optInt(it) } }
        } catch (_: Exception) { }
    }

    @JvmStatic fun putDial(name: String, png: String) {
        try {
            dialName = name
            val b = Base64.decode(png.substringAfter(","), Base64.DEFAULT)
            dial = BitmapFactory.decodeByteArray(b, 0, b.size)?.asImageBitmap()
        } catch (_: Exception) { }
    }

    @JvmStatic fun putBattery(p: Int) { battery = p }

    var picking by mutableStateOf(false)
    var tab by mutableIntStateOf(0)
    var reqStil by mutableStateOf<String?>(null)
    var reqTab by mutableIntStateOf(-1)

    @JvmStatic fun closePicker(): Boolean { if (!picking) return false; picking = false; return true }
    @JvmStatic fun webTab(): Boolean = tab >= 2

    @JvmStatic fun debug(stil: String?, t: Int, picker: Boolean, demo: Boolean) {
        if (stil != null) reqStil = stil
        if (t >= 0) reqTab = t
        if (picker) picking = true
        if (demo) {
            putBattery(76)
            putHealth("""{"steps":6843,"pulse":72,"goal":8000,"hours":[0,0,0,0,0,0,120,640,910,300,220,480,760,350,200,410,900,620,280,130,90,40,0,0],"week":[7420,9105,5230,8012,10433,4120,6843],"days":["tor","fre","lör","sön","mån","tis","Idag"],"hr":[64,62,61,66,74,88,95,79,72,70,76,84,102,91,77,72]}""")
        }
    }
}

internal val TABS = listOf("Klocka", "Hälsa", "Urtavlor", "Verktyg", "Mer")
private val WEB = listOf("home", "health", "dials", "tools", "log")

/** Bygger hela appens ram i riktig Android-kod. Webbdelen visas bara i flikarna som ännu inte är omgjorda. */
fun interface Js { fun run(code: String) }

object NativeUi {
    @JvmStatic
    fun attach(a: ComponentActivity, wv: WebView, js: Js) {
        (wv.parent as? ViewGroup)?.removeView(wv)
        a.setContent { App(wv) { js.run(it) } }
    }
}

@Composable
private fun App(wv: WebView, js: (String) -> Unit) {
    val dark = isSystemInDarkTheme()
    val ctx = LocalContext.current
    val scheme = if (dark) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)
    val prefs = remember { ctx.getSharedPreferences(WatchService.PREFS, android.content.Context.MODE_PRIVATE) }
    var stil by remember { mutableStateOf(Stil.entries.firstOrNull { it.name == prefs.getString("ui_stil", "") } ?: Stil.MATERIAL) }
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val haptic = LocalHapticFeedback.current
    LaunchedEffect(Unit) {
        while (true) {
            WatchState.status = WatchService.status ?: ""
            WatchState.ready = WatchService.readyNow
            delay(700)
        }
    }
    LaunchedEffect(WatchState.reqTab) { val r = WatchState.reqTab; if (r in 0..4) { tab = r; WatchState.reqTab = -1 } }
    LaunchedEffect(WatchState.reqStil) { val r = WatchState.reqStil ?: return@LaunchedEffect; Stil.entries.firstOrNull { it.name == r }?.let { stil = it }; WatchState.reqStil = null }
    SideEffect { WatchState.tab = tab }
    var webVisible by remember { mutableStateOf(false) }
    LaunchedEffect(tab) {
        // Sidan byter flik medan den är dold och visas först när bytet är klart, så att den gamla fliken aldrig blinkar fram
        if (tab >= 2) {
            js("document.documentElement.classList.add('native');window.showTab&&showTab('" + WEB[tab] + "')")
            if (!webVisible) { delay(160); webVisible = true }
        } else {
            webVisible = false
            js("document.documentElement.classList.add('native')")
        }
    }
    LaunchedEffect(stil, dark) {
        prefs.edit().putString("ui_stil", stil.name).apply()
        // Flikarna som ännu är webb får samma stil
        js("window.setTheme&&setTheme('" + stil.web(dark) + "')")
    }
    val act = ctx as? android.app.Activity
    val bars = stil.bars(scheme, dark)
    SideEffect {
        act?.window?.let { w ->
            w.statusBarColor = bars.first.toArgb()
            w.navigationBarColor = bars.first.toArgb()
            androidx.core.view.WindowCompat.getInsetsController(w, w.decorView).apply {
                isAppearanceLightStatusBars = bars.second; isAppearanceLightNavigationBars = bars.second
            }
        }
    }
    val onTab: (Int) -> Unit = { i -> if (tab != i) { haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove); tab = i } }
    val acts = Acts(
        dials = { onTab(2) }, health = { onTab(1) },
        find = { js("var b=document.getElementById('btnFind');b&&b.click()") },
        time = { js("var b=document.getElementById('btnTime');b&&b.click()") },
        sync = { js("window.hlSync&&hlSync(true)") },
        stil = { WatchState.picking = true }
    )
    val body: @Composable () -> Unit = {
        Box(Modifier.fillMaxSize()) {
            // Webbvyn finns alltid kvar, så att anslutningen och sidans logik fortsätter
            AndroidView(
                factory = {
                    (wv.parent as? ViewGroup)?.removeView(wv)
                    // Måste fylla ytan. Med standardläget (anpassa efter innehåll) blev sidans höjd 0 och flikarna tomma.
                    wv.layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                    wv
                },
                update = {
                    // Webbvyn döljs aldrig på riktigt (då slutar den rita och blir tom); den görs bara genomskinlig
                    val show = webVisible && tab >= 2
                    if (it.visibility != android.view.View.VISIBLE) it.visibility = android.view.View.VISIBLE
                    it.alpha = if (show) 1f else 0f
                    it.isFocusable = show
                    if (show) it.postInvalidate()
                },
                modifier = Modifier.fillMaxSize()
            )
            AnimatedContent(targetState = tab, transitionSpec = { stilTransition(stil, initialState, targetState) }, label = "flik") { t ->
                when (t) {
                    0 -> StilHome(stil, acts)
                    1 -> StilHealth(stil, acts)
                    else -> Spacer(Modifier.fillMaxSize())
                }
            }
        }
    }
    MaterialTheme(colorScheme = scheme) {
        Box(Modifier.fillMaxSize()) {
            key(stil) { StilShell(stil, tab, onTab, body) }
            StilPicker(WatchState.picking, stil, onPick = { stil = it; WatchState.picking = false }, onClose = { WatchState.picking = false })
        }
    }
}

/** Det som knapparna på de inbyggda skärmarna gör. */
class Acts(val dials: () -> Unit, val health: () -> Unit, val find: () -> Unit, val time: () -> Unit, val sync: () -> Unit, val stil: () -> Unit)

@Composable
internal fun MaterialShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Scaffold(
        containerColor = MaterialTheme.colorScheme.surface,
        bottomBar = {
            NavigationBar {
                TABS.forEachIndexed { i, t ->
                    NavigationBarItem(selected = tab == i, onClick = { onTab(i) }, icon = { TabIcon(i, tab == i) }, label = { Text(t) })
                }
            }
        }
    ) { pad -> Box(Modifier.fillMaxSize().padding(pad)) { body() } }
}

@Composable
internal fun TabIcon(i: Int, on: Boolean, tint: Color = Color.Unspecified, sz: androidx.compose.ui.unit.Dp = 24.dp) {
    val c = if (tint == Color.Unspecified) LocalContentColor.current else tint
    Canvas(Modifier.size(sz)) {
        val w = size.width
        when (i) {
            0 -> { drawRoundRect(c, Offset(w * .22f, w * .12f), Size(w * .56f, w * .76f), androidx.compose.ui.geometry.CornerRadius(w * .16f), style = if (on) androidx.compose.ui.graphics.drawscope.Fill else Stroke(w * .09f)) }
            1 -> { val p = Path().apply { moveTo(w * .5f, w * .86f); cubicTo(w * .05f, w * .55f, w * .1f, w * .12f, w * .5f, w * .3f); cubicTo(w * .9f, w * .12f, w * .95f, w * .55f, w * .5f, w * .86f); close() }
                   drawPath(p, c, style = if (on) androidx.compose.ui.graphics.drawscope.Fill else Stroke(w * .09f)) }
            2 -> for (k in 0..3) drawRoundRect(c, Offset(w * (.12f + (k % 2) * .42f), w * (.12f + (k / 2) * .42f)), Size(w * .34f, w * .34f), androidx.compose.ui.geometry.CornerRadius(w * .1f), style = if (on) androidx.compose.ui.graphics.drawscope.Fill else Stroke(w * .08f))
            3 -> { for (k in 0..1) { val y = w * (.32f + k * .36f); drawLine(c, Offset(w * .12f, y), Offset(w * .88f, y), w * .09f, StrokeCap.Round); drawCircle(c, w * .1f, Offset(w * (if (k == 0) .35f else .65f), y)) } }
            else -> for (k in 0..2) drawCircle(c, w * .08f, Offset(w * (.22f + k * .28f), w * .5f))
        }
    }
}

// ---------------- Klocka ----------------
@Composable
internal fun HomeScreen(a: Acts) {
    val onDials = a.dials; val onHealth = a.health
    val s = WatchState
    val cs = MaterialTheme.colorScheme
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }
    Column(Modifier.fillMaxSize().background(cs.surface).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Min klocka", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f).padding(start = 4.dp))
            FilledTonalButton(onClick = a.stil) { Text("Stil") }
        }
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(start = 4.dp)) {
            StatusChip(s.ready, s.status)
            if (s.battery >= 0) AssistChip(onClick = {}, label = { Text("${s.battery} % batteri") }, leadingIcon = { BatteryIcon(s.battery / 100f) })
        }
        Spacer(Modifier.height(14.dp))
        Appear(shown, 0) {
            ElevatedCard(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(32.dp), colors = CardDefaults.elevatedCardColors(containerColor = cs.primaryContainer)) {
                Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                    WatchPreview(s.dial, 120.dp, cs.onPrimaryContainer)
                    Spacer(Modifier.width(18.dp))
                    Column {
                        Text("Aktiv urtavla", style = MaterialTheme.typography.labelLarge, color = cs.onPrimaryContainer.copy(alpha = .75f))
                        Text(s.dialName.ifEmpty { "Hämtas …" }, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold, color = cs.onPrimaryContainer)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = onDials) { Text("Byt urtavla") }
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Appear(shown, 1) {
            Card(modifier = Modifier.fillMaxWidth(), onClick = onHealth, shape = RoundedCornerShape(28.dp)) {
                Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                    StepRing(if (s.steps >= 0) s.steps / s.stepGoal.toFloat() else 0f, 92.dp)
                    Spacer(Modifier.width(18.dp))
                    Column {
                        Text("Steg idag", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant)
                        CountText(s.steps, MaterialTheme.typography.displaySmall.fontSize)
                        Text(if (s.steps >= 0) "${(s.steps * 100 / s.stepGoal)} % av målet ${fmt(s.stepGoal)}" else "Hämta hälsan i fliken Hälsa", style = MaterialTheme.typography.bodyMedium, color = cs.onSurfaceVariant)
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Appear(shown, 2) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Card(Modifier.weight(1f), shape = RoundedCornerShape(28.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) { BeatingHeart(cs.error); Spacer(Modifier.width(6.dp)); Text("Puls", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant) }
                        CountText(s.pulse, 34.sp)
                        Spark(s.pulseDay, cs.error, Modifier.fillMaxWidth().height(34.dp))
                    }
                }
                Card(Modifier.weight(1f), shape = RoundedCornerShape(28.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Steg per timme", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant)
                        Spacer(Modifier.height(8.dp))
                        Bars(s.hours.drop(6).take(18), cs.primary, Modifier.fillMaxWidth().height(62.dp))
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Appear(shown, 3) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FilledTonalButton(onClick = a.find, modifier = Modifier.weight(1f)) { Text("Hitta klockan") }
                FilledTonalButton(onClick = a.time, modifier = Modifier.weight(1f)) { Text("Ställ tiden") }
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
internal fun StatusChip(ready: Boolean, status: String) {
    val inf = rememberInfiniteTransition(label = "puls")
    val a by inf.animateFloat(1f, 0f, infiniteRepeatable(tween(1400), RepeatMode.Restart), label = "ring")
    val col = if (ready) Color(0xFF3DDC84) else MaterialTheme.colorScheme.outline
    FilterChip(selected = ready, onClick = {}, label = { Text(if (ready) "Ansluten" else status.take(28)) }, leadingIcon = {
        Canvas(Modifier.size(14.dp)) {
            if (ready) drawCircle(col.copy(alpha = a * .5f), size.minDimension / 2 * (1.6f - a * .6f))
            drawCircle(col, size.minDimension / 3.2f)
        }
    })
}

@Composable
internal fun BatteryIcon(f: Float) {
    val c = LocalContentColor.current
    val anim by animateFloatAsState(f, tween(1200, easing = FastOutSlowInEasing), label = "batt")
    Canvas(Modifier.size(22.dp, 12.dp)) {
        drawRoundRect(c, size = Size(size.width * .88f, size.height), cornerRadius = androidx.compose.ui.geometry.CornerRadius(4f), style = Stroke(2.5f))
        drawRect(c, Offset(size.width * .9f, size.height * .3f), Size(size.width * .1f, size.height * .4f))
        val col = if (f < .2f) Color(0xFFE5484D) else Color(0xFF3DDC84)
        drawRoundRect(col, Offset(3f, 3f), Size((size.width * .88f - 6f) * anim, size.height - 6f), androidx.compose.ui.geometry.CornerRadius(2f))
    }
}

@Composable
internal fun WatchPreview(img: ImageBitmap?, w: androidx.compose.ui.unit.Dp, ink: Color) {
    val inf = rememberInfiniteTransition(label = "andas")
    val glow by inf.animateFloat(.35f, .8f, infiniteRepeatable(tween(2600, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "glow")
    Box(Modifier.size(w, w * 1.19f), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) { drawRoundRect(ink.copy(alpha = glow * .25f), cornerRadius = androidx.compose.ui.geometry.CornerRadius(size.width * .3f)) }
        Box(Modifier.padding(5.dp).fillMaxSize().clip(RoundedCornerShape(w * .26f)).background(Color.Black)) {
            if (img != null) Image(img, null, Modifier.fillMaxSize(), contentScale = androidx.compose.ui.layout.ContentScale.Crop)
        }
    }
}

@Composable
internal fun StepRing(f: Float, d: androidx.compose.ui.unit.Dp) {
    val cs = MaterialTheme.colorScheme
    val anim by animateFloatAsState(f.coerceIn(0f, 1f), tween(1400, easing = FastOutSlowInEasing), label = "ring")
    Canvas(Modifier.size(d)) {
        val st = size.width * .12f
        drawArc(cs.surfaceVariant, 0f, 360f, false, Offset(st / 2, st / 2), Size(size.width - st, size.height - st), style = Stroke(st))
        drawArc(Brush.sweepGradient(listOf(cs.tertiary, cs.primary, cs.tertiary)), -90f, 360f * anim, false, Offset(st / 2, st / 2), Size(size.width - st, size.height - st), style = Stroke(st, cap = StrokeCap.Round))
    }
}

@Composable
internal fun CountText(v: Int, size: androidx.compose.ui.unit.TextUnit, color: Color = Color.Unspecified) {
    val anim by animateIntAsState(maxOf(0, v), tween(1300, easing = FastOutSlowInEasing), label = "tal")
    Text(if (v < 0) "–" else fmt(anim), fontSize = size, fontWeight = FontWeight.SemiBold, color = color)
}

@Composable
internal fun BeatingHeart(c: Color) {
    val inf = rememberInfiniteTransition(label = "hjärta")
    val s by inf.animateFloat(1f, 1f, infiniteRepeatable(keyframes { durationMillis = 1100; 1f at 0; 1.28f at 160; 1.02f at 300; 1f at 1100 }), label = "slag")
    Canvas(Modifier.size(16.dp).scale(s)) {
        val w = size.width
        drawPath(Path().apply { moveTo(w * .5f, w * .9f); cubicTo(w * 0f, w * .55f, w * .1f, w * .05f, w * .5f, w * .28f); cubicTo(w * .9f, w * .05f, w * 1f, w * .55f, w * .5f, w * .9f); close() }, c)
    }
}

@Composable
internal fun Spark(v: List<Int>, c: Color, m: Modifier) {
    val p by animateFloatAsState(if (v.isEmpty()) 0f else 1f, tween(1500), label = "kurva")
    Canvas(m) {
        if (v.size < 2) { drawLine(c.copy(alpha = .3f), Offset(0f, size.height / 2), Offset(size.width, size.height / 2), 3f); return@Canvas }
        val lo = v.min().toFloat(); val hi = maxOf(v.max().toFloat(), lo + 1)
        val path = Path(); val n = (v.size * p).toInt().coerceAtLeast(2)
        for (i in 0 until n) { val x = i / (v.size - 1f) * size.width; val y = size.height - (v[i] - lo) / (hi - lo) * size.height * .85f - 2f; if (i == 0) path.moveTo(x, y) else path.lineTo(x, y) }
        drawPath(path, c, style = Stroke(5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
    }
}

@Composable
internal fun Bars(v: List<Int>, c: Color, m: Modifier) {
    val p by animateFloatAsState(if (v.any { it > 0 }) 1f else 0f, tween(1100, easing = FastOutSlowInEasing), label = "staplar")
    Canvas(m) {
        val mx = maxOf(1, v.maxOrNull() ?: 1).toFloat(); val bw = size.width / v.size.coerceAtLeast(1)
        v.forEachIndexed { i, x ->
            val h = maxOf(3f, x / mx * size.height * p)
            drawRoundRect(c.copy(alpha = if (x > 0) 1f else .2f), Offset(i * bw + bw * .15f, size.height - h), Size(bw * .7f, h), androidx.compose.ui.geometry.CornerRadius(bw * .35f))
        }
    }
}

@Composable
internal fun Appear(on: Boolean, i: Int, content: @Composable () -> Unit) {
    AnimatedVisibility(on, enter = fadeIn(tween(400, delayMillis = 70 * i)) + slideInVertically(spring(dampingRatio = .8f, stiffness = 300f)) { it / 5 }) { content() }
}

internal fun fmt(n: Int) = "%,d".format(java.util.Locale.ROOT, n).replace(',', ' ')

// ---------------- Hälsa ----------------
@Composable
internal fun HealthScreen(a: Acts) {
    val s = WatchState
    val cs = MaterialTheme.colorScheme
    var busy by remember { mutableStateOf(false) }
    LaunchedEffect(busy) { if (busy) { delay(6000); busy = false } }
    Column(Modifier.fillMaxSize().background(cs.surface).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f).padding(start = 4.dp))
            Button(onClick = { busy = true; a.sync() }, enabled = !busy) {
                if (busy) { CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp); Spacer(Modifier.width(8.dp)) }
                Text(if (busy) "Hämtar" else "Hämta nu")
            }
        }
        Spacer(Modifier.height(14.dp))
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(32.dp), colors = CardDefaults.cardColors(containerColor = cs.secondaryContainer)) {
            Row(Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                StepRing(if (s.steps >= 0) s.steps / s.stepGoal.toFloat() else 0f, 112.dp)
                Spacer(Modifier.width(20.dp))
                Column {
                    Text("Steg idag", style = MaterialTheme.typography.labelLarge)
                    CountText(s.steps, 40.sp)
                    Text("Mål ${fmt(s.stepGoal)}", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
            Column(Modifier.padding(18.dp)) {
                Text("Steg per timme", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(10.dp))
                Bars(s.hours, cs.primary, Modifier.fillMaxWidth().height(110.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { listOf("00", "06", "12", "18", "24").forEach { Text(it, style = MaterialTheme.typography.labelSmall, color = cs.onSurfaceVariant) } }
            }
        }
        Spacer(Modifier.height(12.dp))
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
            Column(Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) { BeatingHeart(cs.error); Spacer(Modifier.width(8.dp)); Text("Puls under dagen", style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f)); CountText(s.pulse, 22.sp) }
                Spacer(Modifier.height(10.dp))
                Spark(s.pulseDay, cs.error, Modifier.fillMaxWidth().height(90.dp))
            }
        }
        Spacer(Modifier.height(12.dp))
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
            Column(Modifier.padding(18.dp)) {
                Text("Veckan", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(10.dp))
                val wk = s.week.map { maxOf(0, it) }
                Bars(wk, cs.tertiary, Modifier.fillMaxWidth().height(100.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) { s.weekDays.forEach { Text(it, style = MaterialTheme.typography.labelSmall, color = cs.onSurfaceVariant) } }
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}
