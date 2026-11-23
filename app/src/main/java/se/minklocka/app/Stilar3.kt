@file:OptIn(ExperimentalFoundationApi::class)

package se.minklocka.app

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.PagerState
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

/*
 * Sex stilar till, var och en med egen meny, egen uppställning och eget sätt att visa data:
 *  Terminal  – kommandorad: text som skrivs fram, staplar av tecken, kommandon som knappar
 *  LCD       – klassisk digitalklocka: sjusegmentssiffror, segmentstaplar, fysiska knappar
 *  Kladdblock – handritat: streck för stegen, ett hjärta som ritas, lappar som meny
 *  Dygnsur   – cirklar: dygnets timmar som strålar, veckan som tårtbitar, meny i en båge
 *  Kortlek   – ett stort kort per sak som man bläddrar i, korten bakom lutar
 *  Tidslinje – dagen uppifrån och ner med händelser, meny till höger
 */

private val S = WatchState
private fun fr() = if (S.steps >= 0) (S.steps / S.stepGoal.toFloat()).coerceIn(0f, 1f) else 0f
private fun pc() = if (S.steps >= 0) S.steps * 100 / S.stepGoal.coerceAtLeast(1) else 0
private fun nn(v: Int) = if (v < 0) "–" else fmt(v)
private fun tops(k: Int) = S.hours.mapIndexed { h, v -> h to v }.filter { it.second > 0 }.sortedByDescending { it.second }.take(k)
private fun plo() = S.pulseDay.filter { it > 0 }.minOrNull() ?: -1
private fun phi() = S.pulseDay.maxOrNull() ?: -1
private fun nowHour(): Float { val c = Calendar.getInstance(); return c.get(Calendar.HOUR_OF_DAY) + c.get(Calendar.MINUTE) / 60f }

@Composable
private fun rise(target: Float, ms: Int = 1100, wait: Int = 0): Float {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { on = true }
    return animateFloatAsState(if (on) target else 0f, tween(ms, wait, FastOutSlowInEasing), label = "rise").value
}

@Composable
private fun clk(f: String): String {
    var s by remember { mutableStateOf(SimpleDateFormat(f, Locale("sv", "SE")).format(Date())) }
    LaunchedEffect(f) { while (true) { delay(1000); s = SimpleDateFormat(f, Locale("sv", "SE")).format(Date()) } }
    return s
}

@Composable
private fun Dial(m: Modifier) {
    Box(m.background(Color.Black)) { S.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) } }
}

private fun nc() = MutableInteractionSource()

fun isNew(s: Stil) = s in listOf(Stil.TERMINAL, Stil.LCD, Stil.KLADD, Stil.RADAR, Stil.KORT, Stil.TIDSLINJE)

fun web3(s: Stil) = when (s) {
    Stil.TERMINAL -> "mork"; Stil.LCD -> "mint"; Stil.KLADD -> "ljus"; Stil.RADAR -> "flytglas"; Stil.KORT -> "m3expr"; else -> "hav"
}

fun bars3(s: Stil): Pair<Color, Boolean> = when (s) {
    Stil.TERMINAL -> T_BG to false; Stil.LCD -> L_CASE to false; Stil.KLADD -> K_PAPER to true
    Stil.RADAR -> R_BG to false; Stil.KORT -> C_BG1 to true; else -> TL_BG to true
}

fun AnimatedContentTransitionScope<Int>.trans3(s: Stil, dir: Int): ContentTransform = when (s) {
    Stil.TERMINAL -> fadeIn(tween(60)) togetherWith fadeOut(tween(60))
    Stil.LCD -> EnterTransition.None togetherWith ExitTransition.None
    Stil.KLADD -> (fadeIn(tween(250)) + scaleIn(spring(dampingRatio = .6f, stiffness = 300f), initialScale = .94f)) togetherWith fadeOut(tween(120))
    Stil.RADAR -> (fadeIn(tween(300)) + scaleIn(tween(420, easing = FastOutSlowInEasing), initialScale = .8f)) togetherWith (fadeOut(tween(200)) + scaleOut(tween(200), targetScale = 1.1f))
    Stil.KORT -> slideInVertically(spring(dampingRatio = .8f, stiffness = 280f)) { it / 3 } + fadeIn(tween(200)) togetherWith fadeOut(tween(120))
    else -> slideInVertically(tween(320, easing = FastOutSlowInEasing)) { it / 6 * dir } + fadeIn(tween(200)) togetherWith fadeOut(tween(120))
}

@Composable
fun Backdrop3(s: Stil) {
    when (s) {
        Stil.TERMINAL -> Box(Modifier.fillMaxSize().background(T_BG))
        Stil.LCD -> Box(Modifier.fillMaxSize().background(L_CASE))
        Stil.KLADD -> Paper()
        Stil.RADAR -> Box(Modifier.fillMaxSize().background(R_BG))
        Stil.KORT -> Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(C_BG1, C_BG2))))
        else -> Box(Modifier.fillMaxSize().background(TL_BG))
    }
}

@Composable
fun Shell3(s: Stil, tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) = when (s) {
    Stil.TERMINAL -> TerminalShell(tab, onTab, body)
    Stil.LCD -> LcdShell(tab, onTab, body)
    Stil.KLADD -> KladdShell(tab, onTab, body)
    Stil.RADAR -> RadarShell(tab, onTab, body)
    Stil.KORT -> KortShell(tab, onTab, body)
    else -> TidShell(tab, onTab, body)
}

@Composable
fun Home3(s: Stil, a: Acts) = when (s) {
    Stil.TERMINAL -> TerminalHome(a); Stil.LCD -> LcdHome(a); Stil.KLADD -> KladdHome(a)
    Stil.RADAR -> RadarHome(a); Stil.KORT -> KortHome(a); else -> TidHome(a)
}

@Composable
fun Health3(s: Stil, a: Acts) = when (s) {
    Stil.TERMINAL -> TerminalHealth(a); Stil.LCD -> LcdHealth(a); Stil.KLADD -> KladdHealth(a)
    Stil.RADAR -> RadarHealth(a); Stil.KORT -> KortHealth(a); else -> TidHealth(a)
}

/** Små skisser till stilväljaren. */
fun DrawScope.mini3(s: Stil, k: Float) {
    val w = size.width; val h = size.height
    when (s) {
        Stil.TERMINAL -> { drawRect(T_BG); for (i in 0 until 9) drawRect(if (i == 3) T_AMB else T_GRN, Offset(w * .1f, h * (.12f + i * .08f)), Size(w * (.3f + ((i * 37) % 6) / 10f) * (if (i == 8) k else 1f), h * .025f)) }
        Stil.LCD -> { drawRect(L_CASE); drawRoundRect(L_LCD, Offset(w * .08f, h * .08f), Size(w * .84f, h * .66f), CornerRadius(8f))
            for (i in 0..3) drawRect(L_INK, Offset(w * (.14f + i * .18f), h * .2f), Size(w * .12f, h * .16f), style = Stroke(3f))
            for (i in 0..4) drawCircle(Color(0xFF555555), w * .07f, Offset(w * (.14f + i * .18f), h * .87f)) }
        Stil.KLADD -> { drawRect(K_PAPER); for (i in 1..12) drawLine(K_LINE, Offset(0f, h * i / 13f), Offset(w, h * i / 13f), 1f)
            listOf(K_Y, K_P, K_B).forEachIndexed { i, c -> drawRect(c, Offset(w * (.05f + i * .31f), h * .04f), Size(w * .27f, h * .1f)) }
            for (i in 0 until (12 * k).toInt()) drawLine(K_INK, Offset(w * (.12f + i * .06f), h * .35f), Offset(w * (.12f + i * .06f), h * .5f), 3f) }
        Stil.RADAR -> { drawRect(R_BG); val c = Offset(w / 2, h * .4f)
            for (i in 0 until 24) { val a = Math.toRadians(-90.0 + i * 15); val l = w * (.08f + .14f * ((i * 7 % 10) / 10f) * k)
                drawLine(R_OR, Offset(c.x + cos(a).toFloat() * w * .2f, c.y + sin(a).toFloat() * w * .2f), Offset(c.x + cos(a).toFloat() * (w * .2f + l), c.y + sin(a).toFloat() * (w * .2f + l)), 4f) }
            for (i in 0..4) drawCircle(Color.White.copy(alpha = .4f), w * .06f, Offset(w * (.14f + i * .18f), h * (.9f - sin(Math.PI * i / 4).toFloat() * .05f))) }
        Stil.KORT -> { drawRect(Brush.verticalGradient(listOf(C_BG1, C_BG2)))
            drawRoundRect(Color.White.copy(alpha = .6f), Offset(w * .2f, h * .2f), Size(w * .66f, h * .58f), CornerRadius(14f))
            drawRoundRect(Color.White, Offset(w * (.12f + .02f * k), h * .16f), Size(w * .66f, h * .6f), CornerRadius(14f)); drawRoundRect(C_ACC, Offset(w * (.12f + .02f * k), h * .16f), Size(w * .66f, h * .2f), CornerRadius(14f)) }
        else -> { drawRect(TL_BG); drawLine(TL_INK, Offset(w * .25f, h * .05f), Offset(w * .25f, h * .95f), 3f)
            for (i in 0..6) drawCircle(if (i == 4) TL_ACC else TL_INK, w * (.03f + .03f * ((i * 3) % 4)), Offset(w * .25f, h * (.1f + i * .13f)))
            drawRect(Color.White, Offset(w * .8f, 0f), Size(w * .2f, h)) }
    }
}

// =====================================================================
// TERMINAL
// =====================================================================
private val T_BG = Color(0xFF070B07); private val T_GRN = Color(0xFF39FF14); private val T_DIM = Color(0xFF1E6B1E); private val T_AMB = Color(0xFFFFB000)
private val MONO = FontFamily.Monospace

@Composable
private fun TerminalShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    val blink by rememberInfiniteTransition(label = "markör").animateFloat(0f, 1f, infiniteRepeatable(tween(1000, easing = LinearEasing)), label = "b")
    Box(Modifier.fillMaxSize().background(T_BG)) {
        Column(Modifier.fillMaxSize()) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
                Text("rob@min-klocka:~$ ", color = T_GRN, fontFamily = MONO, fontSize = 13.sp)
                Text("cd /${SHORT3[tab].lowercase()}", color = T_AMB, fontFamily = MONO, fontSize = 13.sp)
                Box(Modifier.padding(start = 2.dp).size(8.dp, 16.dp).background(if (blink < .5f) T_GRN else Color.Transparent))
            }
            Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
                SHORT3.forEachIndexed { i, l ->
                    val on = i == tab
                    Text(if (on) "[$l]" else " $l ", Modifier.weight(1f).background(if (on) T_GRN else Color.Transparent).clickable(nc(), null) { onTab(i) }.padding(vertical = 6.dp),
                        color = if (on) T_BG else T_DIM, fontFamily = MONO, fontSize = 12.sp, textAlign = TextAlign.Center, maxLines = 1)
                }
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(T_DIM))
            Box(Modifier.weight(1f)) { body() }
        }
        // svepande rader som på en gammal skärm
        Canvas(Modifier.fillMaxSize()) { var y = 0f; while (y < size.height) { drawLine(Color.Black.copy(alpha = .18f), Offset(0f, y), Offset(size.width, y), 1f); y += 4f } }
    }
}

private val SHORT3 = listOf("klocka", "hälsa", "tavlor", "verktyg", "mer")

/** Rader som skrivs fram tecken för tecken, en i taget. */
@Composable
private fun Typed(lines: List<Pair<String, Color>>, onClick: Map<Int, () -> Unit> = emptyMap()) {
    var chars by remember { mutableIntStateOf(0) }
    val total = lines.sumOf { it.first.length }
    LaunchedEffect(total) { while (chars < total) { chars = minOf(total, chars + 6); delay(16) } }
    var left = chars
    Column {
        lines.forEachIndexed { i, (t, c) ->
            val show = t.take(left.coerceAtLeast(0)); left -= t.length
            Text(show.ifEmpty { " " }, color = c, fontFamily = MONO, fontSize = 13.sp, lineHeight = 18.sp,
                modifier = Modifier.fillMaxWidth().then(onClick[i]?.let { f -> Modifier.clickable(onClick = f) } ?: Modifier).padding(vertical = 1.dp))
        }
    }
}

private fun bar(f: Float, n: Int = 20): String { val k = (f.coerceIn(0f, 1f) * n).roundToInt(); return "█".repeat(k) + "░".repeat(n - k) }
private fun spark(v: List<Int>): String { val b = "▁▂▃▄▅▆▇█"; val mx = maxOf(1, v.maxOrNull() ?: 1); return v.joinToString("") { if (it <= 0) "▁" else b[((it / mx.toFloat()) * 7).roundToInt().coerceIn(0, 7)].toString() } }

@Composable
private fun TerminalHome(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp)) {
        Row(verticalAlignment = Alignment.Top) {
            Box(Modifier.size(84.dp, 100.dp).border(1.dp, T_GRN)) { Dial(Modifier.fillMaxSize().padding(3.dp)); Canvas(Modifier.matchParentSize()) { var y = 0f; while (y < size.height) { drawLine(T_GRN.copy(alpha = .12f), Offset(0f, y), Offset(size.width, y), 1f); y += 3f } } }
            Spacer(Modifier.width(12.dp))
            Column { Text("URTAVLA", color = T_DIM, fontFamily = MONO, fontSize = 11.sp); Text(S.dialName.ifEmpty { "-" }.lowercase().replace(' ', '_') + ".bin", color = T_GRN, fontFamily = MONO, fontSize = 14.sp)
                Text("$ byt-urtavla", Modifier.clickable(onClick = a.dials).padding(top = 6.dp), color = T_AMB, fontFamily = MONO, fontSize = 13.sp) }
        }
        Spacer(Modifier.height(12.dp))
        val hr = S.hours
        Typed(listOf(
            "> status" to T_DIM,
            "  klocka  : ${if (S.ready) "ANSLUTEN" else "söker…"}" to T_GRN,
            "  batteri : ${if (S.battery >= 0) "${S.battery}%  ${bar(S.battery / 100f, 10)}" else "-"}" to T_GRN,
            "" to T_GRN,
            "> steg --idag" to T_DIM,
            "  ${nn(S.steps)} / ${fmt(S.stepGoal)}" to T_GRN,
            "  [${bar(fr())}] ${pc()}%" to T_AMB,
            "" to T_GRN,
            "> puls" to T_DIM,
            "  ${nn(S.pulse)} bpm   ${spark(S.pulseDay)}" to T_GRN,
            "" to T_GRN,
            "> timmar" to T_DIM,
            "  ${spark(hr)}" to T_GRN,
            "  00    06    12    18   23" to T_DIM,
            "" to T_GRN,
            "$ hitta-klockan" to T_AMB,
            "$ stall-tiden" to T_AMB,
            "$ stil --valj" to T_AMB
        ), mapOf(15 to a.find, 16 to a.time, 17 to a.stil))
    }
}

@Composable
private fun TerminalHealth(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp)) {
        val mx = maxOf(1, S.week.maxOrNull() ?: 1)
        val lines = mutableListOf(
            "$ halsa --hamta" to T_AMB,
            "" to T_GRN,
            "> halsa --idag" to T_DIM,
            "  steg   ${nn(S.steps).padStart(7)}  [${bar(fr(), 16)}]" to T_GRN,
            "  puls   ${nn(S.pulse).padStart(7)}  min ${nn(plo())} max ${nn(phi())}" to T_GRN,
            "" to T_GRN,
            "> halsa --timmar" to T_DIM
        )
        val hmx = maxOf(1, S.hours.maxOrNull() ?: 1)
        S.hours.forEachIndexed { h, v -> if (v > 0) lines.add("  %02d ".format(h) + "█".repeat((v * 20 / hmx).coerceAtLeast(1)) + " $v" to if (v == hmx) T_AMB else T_GRN) }
        lines.add("" to T_GRN); lines.add("> halsa --vecka" to T_DIM)
        S.week.forEachIndexed { i, v -> lines.add("  ${S.weekDays.getOrElse(i) { "" }.take(3).padEnd(4)}" + "█".repeat((maxOf(0, v) * 18 / mx)) + " ${nn(v)}${if (v >= S.stepGoal) " ✓" else ""}" to if (v >= S.stepGoal) T_AMB else T_GRN) }
        Typed(lines, mapOf(0 to a.sync))
    }
}

// =====================================================================
// LCD
// =====================================================================
private val L_CASE = Color(0xFF26282B); private val L_LCD = Color(0xFFA3B38C); private val L_INK = Color(0xFF1C2416); private val L_RED = Color(0xFFFF3B30)

private val SEG = mapOf('0' to "abcdef", '1' to "bc", '2' to "abged", '3' to "abgcd", '4' to "fgbc", '5' to "afgcd", '6' to "afgedc", '7' to "abc", '8' to "abcdefg", '9' to "abcdfg", '-' to "g", ' ' to "")

/** Sjusegmentssiffror med svaga "spöksegment" som på en riktig LCD. */
@Composable
private fun Seg7(text: String, h: Dp, col: Color = L_INK) {
    val wd = h * .56f
    val total = text.sumOf { if (it == ':') 1 else 0 } * (h * .3f).value + text.count { it != ':' } * (wd + h * .12f).value
    Canvas(Modifier.size(total.dp, h)) {
        var x = 0f; val H = size.height; val Wd = H * .56f; val t = H * .11f
        for (ch in text) {
            if (ch == ':') { drawCircle(col, t * .6f, Offset(x + H * .15f, H * .3f)); drawCircle(col, t * .6f, Offset(x + H * .15f, H * .7f)); x += H * .3f; continue }
            val on = SEG[ch] ?: ""
            fun seg(n: Char, ox: Float, oy: Float, w: Float, hh: Float) = drawRoundRect(if (n in on) col else col.copy(alpha = .07f), Offset(x + ox, oy), Size(w, hh), CornerRadius(t / 2))
            seg('a', t, 0f, Wd - 2 * t, t); seg('g', t, H / 2 - t / 2, Wd - 2 * t, t); seg('d', t, H - t, Wd - 2 * t, t)
            seg('f', 0f, t * .6f, t, H / 2 - t); seg('b', Wd - t, t * .6f, t, H / 2 - t)
            seg('e', 0f, H / 2 + t * .4f, t, H / 2 - t); seg('c', Wd - t, H / 2 + t * .4f, t, H / 2 - t)
            x += Wd + H * .12f
        }
    }
}

@Composable
private fun LcdPanel(m: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(m.clip(RoundedCornerShape(10.dp)).background(Brush.verticalGradient(listOf(L_LCD, Color(0xFF94A47E)))).border(3.dp, Color(0xFF111111), RoundedCornerShape(10.dp)).padding(14.dp), content = content)
}

@Composable private fun LT(t: String, sz: Int = 11) = Text(t, color = L_INK, fontFamily = MONO, fontSize = sz.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)

/** Segmentstapel: ett antal rutor som tänds. */
@Composable
private fun SegBar(f: Float, n: Int, m: Modifier) {
    val g = rise(f, 900)
    Row(m, horizontalArrangement = Arrangement.spacedBy(3.dp)) { repeat(n) { i -> Box(Modifier.weight(1f).height(14.dp).background(if (i < (g * n).roundToInt()) L_INK else L_INK.copy(alpha = .08f))) } }
}

@Composable
private fun LcdShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(L_CASE)) {
        Text("TRIACLE · LITE ONE", Modifier.fillMaxWidth().padding(top = 8.dp), color = Color(0xFF8A8D91), fontFamily = MONO, fontSize = 10.sp, letterSpacing = 3.sp, textAlign = TextAlign.Center)
        Box(Modifier.weight(1f)) { body() }
        Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 10.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
            listOf("KLOCKA", "HÄLSA", "TAVLOR", "VERKTYG", "MER").forEachIndexed { i, l ->
                val src = remember { MutableInteractionSource() }
                val pressed by src.collectIsPressedAsState()
                val down = pressed || i == tab
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.size(6.dp).clip(CircleShape).background(if (i == tab) L_RED else Color(0xFF3A3C40)))
                    Spacer(Modifier.height(4.dp))
                    Box(Modifier.offset(y = if (down) 2.dp else 0.dp).size(54.dp, 30.dp).shadow(if (down) 1.dp else 5.dp, RoundedCornerShape(15.dp))
                        .clip(RoundedCornerShape(15.dp)).background(Brush.verticalGradient(if (down) listOf(Color(0xFF3B3D41), Color(0xFF4A4C50)) else listOf(Color(0xFF5A5D62), Color(0xFF3D3F43))))
                        .clickable(src, null) { onTab(i) })
                    Spacer(Modifier.height(4.dp))
                    Text(l, color = Color(0xFFB8BBC0), fontFamily = MONO, fontSize = 9.sp, letterSpacing = 1.sp)
                }
            }
        }
    }
}

@Composable
private fun LcdHome(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        LcdPanel(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                LT(clk("EEE").uppercase().take(3), 13); Spacer(Modifier.weight(1f)); LT(if (S.ready) "◉ BT" else "○ BT", 13); Spacer(Modifier.width(10.dp)); LT(if (S.battery >= 0) "${S.battery}%" else "--%", 13)
            }
            Spacer(Modifier.height(6.dp))
            val t = clk("HH:mm")
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) { Seg7(t, 76.dp) }
            Spacer(Modifier.height(6.dp))
            Row { LT("STEG", 12); Spacer(Modifier.weight(1f)); Seg7(if (S.steps >= 0) S.steps.toString().padStart(5) else "-----", 30.dp) }
            Spacer(Modifier.height(6.dp))
            SegBar(fr(), 20, Modifier.fillMaxWidth())
            Row { LT("0"); Spacer(Modifier.weight(1f)); LT("MÅL ${S.stepGoal}") }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            LcdPanel(Modifier.weight(1f)) {
                val beat by rememberInfiniteTransition(label = "hj").animateFloat(0f, 1f, infiniteRepeatable(tween(if (S.pulse > 30) 60000 / S.pulse else 1000, easing = LinearEasing)), label = "b")
                Row(verticalAlignment = Alignment.CenterVertically) { LT("PULS", 12); Spacer(Modifier.width(6.dp)); Text("♥", color = if (beat < .2f) L_INK else L_INK.copy(alpha = .15f), fontSize = 14.sp) }
                Seg7(if (S.pulse > 0) S.pulse.toString().padStart(3) else "---", 40.dp)
            }
            LcdPanel(Modifier.weight(1f).clickable(onClick = a.dials)) {
                LT("TAVLA", 12)
                Box(Modifier.fillMaxWidth().height(58.dp).border(2.dp, L_INK)) { Dial(Modifier.fillMaxSize().padding(2.dp)) }
            }
        }
        LcdPanel(Modifier.fillMaxWidth()) {
            LT("STEG / TIMME  06-23", 12)
            Spacer(Modifier.height(6.dp))
            val mx = maxOf(1, S.hours.maxOrNull() ?: 1); val g = rise(1f, 900)
            Row(Modifier.fillMaxWidth().height(60.dp), horizontalArrangement = Arrangement.spacedBy(2.dp), verticalAlignment = Alignment.Bottom) {
                S.hours.drop(6).forEach { v -> Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) { val lit = (v * 8f / mx * g).roundToInt(); for (k in 7 downTo 0) Box(Modifier.fillMaxWidth().height(5.dp).background(if (k < lit) L_INK else L_INK.copy(alpha = .07f))) } }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("HITTA" to a.find, "TID" to a.time, "STIL" to a.stil).forEach { (t, f) ->
                Box(Modifier.weight(1f).height(40.dp).clip(RoundedCornerShape(20.dp)).background(Color(0xFF45474B)).clickable(onClick = f), contentAlignment = Alignment.Center) { Text(t, color = Color(0xFFD5D7DA), fontFamily = MONO, fontSize = 12.sp, letterSpacing = 2.sp) }
            }
        }
    }
}

@Composable
private fun LcdHealth(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        LcdPanel(Modifier.fillMaxWidth().clickable(onClick = a.sync)) { Row { LT("HÄLSA", 14); Spacer(Modifier.weight(1f)); LT("[ HÄMTA ]", 12) } }
        LcdPanel(Modifier.fillMaxWidth()) {
            LT("STEG IDAG", 12); Seg7(if (S.steps >= 0) S.steps.toString().padStart(5) else "-----", 56.dp)
            Spacer(Modifier.height(6.dp)); SegBar(fr(), 16, Modifier.fillMaxWidth()); LT("${pc()}% AV ${S.stepGoal}")
        }
        LcdPanel(Modifier.fillMaxWidth()) {
            LT("PULS  NU · LÅG · HÖG", 12); Spacer(Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) { listOf(S.pulse, plo(), phi()).forEach { v -> Seg7(if (v > 0) v.toString().padStart(3) else "---", 34.dp) } }
        }
        LcdPanel(Modifier.fillMaxWidth()) {
            LT("VECKAN", 12); Spacer(Modifier.height(6.dp))
            val mx = maxOf(1, S.week.maxOrNull() ?: 1); val g = rise(1f, 900)
            Row(Modifier.fillMaxWidth().height(100.dp), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.Bottom) {
                S.week.forEachIndexed { i, v -> Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    val lit = (maxOf(0, v) * 10f / mx * g).roundToInt()
                    for (k in 9 downTo 0) Box(Modifier.fillMaxWidth().padding(vertical = 1.dp).height(6.dp).background(if (k < lit) L_INK else L_INK.copy(alpha = .07f)))
                    LT(S.weekDays.getOrElse(i) { "" }.take(1).uppercase(), 11)
                } }
            }
        }
    }
}

// =====================================================================
// KLADDBLOCK
// =====================================================================
private val K_PAPER = Color(0xFFFBF8EF); private val K_LINE = Color(0xFFBFD7EA); private val K_MARG = Color(0xFFF2A0A0); private val K_INK = Color(0xFF26304A)
private val K_Y = Color(0xFFFFE066); private val K_P = Color(0xFFFFB3C7); private val K_B = Color(0xFFA5D8FF); private val K_G = Color(0xFFB2F2BB); private val K_O = Color(0xFFFFC078); private val K_RED = Color(0xFFE03131)
private val HAND = FontFamily.Cursive

@Composable
private fun Paper() = Canvas(Modifier.fillMaxSize()) {
    drawRect(K_PAPER); var y = 40f; while (y < size.height) { drawLine(K_LINE, Offset(0f, y), Offset(size.width, y), 1.5f); y += 34f }
    drawLine(K_MARG, Offset(size.width * .1f, 0f), Offset(size.width * .1f, size.height), 2f)
}

private fun wob(seed: Int, i: Int): Float { val x = sin((seed * 12.9898 + i * 78.233)) * 43758.5453; return ((x - Math.floor(x)).toFloat() - .5f) }

/** Handritad linje: lite darrig, som med penna. */
private fun Path.handLine(x1: Float, y1: Float, x2: Float, y2: Float, seed: Int, amp: Float = 2.2f) {
    moveTo(x1 + wob(seed, 0) * amp, y1 + wob(seed, 1) * amp)
    val n = 6
    for (k in 1..n) { val t = k / n.toFloat(); lineTo(x1 + (x2 - x1) * t + wob(seed, k * 2) * amp, y1 + (y2 - y1) * t + wob(seed, k * 2 + 1) * amp) }
}

@Composable
private fun KladdShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize()) {
        Paper()
        Column(Modifier.fillMaxSize()) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                val cols = listOf(K_Y, K_P, K_B, K_G, K_O)
                listOf("Klocka", "Hälsa", "Tavlor", "Verktyg", "Mer").forEachIndexed { i, l ->
                    val on = i == tab
                    val dy by animateDpAsState(if (on) 6.dp else 0.dp, spring(dampingRatio = .5f, stiffness = 400f), label = "lapp")
                    Box(Modifier.weight(1f).offset(y = dy).rotate(listOf(-4f, 3f, -2f, 4f, -3f)[i]).shadow(if (on) 6.dp else 2.dp).background(cols[i])
                        .clickable(nc(), null) { onTab(i) }.padding(vertical = 10.dp), contentAlignment = Alignment.Center) {
                        Text(l, color = K_INK, fontFamily = HAND, fontSize = if (on) 17.sp else 14.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Normal, maxLines = 1)
                    }
                }
            }
            Box(Modifier.weight(1f)) { body() }
        }
    }
}

/** Streck: ett per 500 steg, i grupper om fem med ett snedstreck. Ritas fram ett i taget. */
@Composable
private fun Tally(steps: Int, m: Modifier) {
    val marks = (maxOf(0, steps) / 500).coerceAtMost(40)
    val p = rise(1f, 1800)
    Canvas(m) {
        val gw = 56f; val mh = 46f; var x = 6f; var y = 6f
        val shown = (marks * p).toInt()
        for (i in 0 until shown) {
            val inG = i % 5
            if (inG == 4) { val path = Path(); path.handLine(x - 4 * 10f - 6, y + mh * .75f, x + 4, y + mh * .2f, i); drawPath(path, K_RED, style = Stroke(3.5f, cap = StrokeCap.Round)) }
            else { val path = Path(); path.handLine(x, y, x + 1, y + mh, i); drawPath(path, K_INK, style = Stroke(3.5f, cap = StrokeCap.Round)); x += 10f }
            if (inG == 4) { x += gw - 40f; if (x > size.width - 50f) { x = 6f; y += mh + 14f } }
        }
    }
}

/** Ett hjärta som ritas med pennan och sedan slår i pulsens takt. */
@Composable
private fun DrawnHeart(m: Modifier) {
    val p = rise(1f, 1400)
    val beat by rememberInfiniteTransition(label = "slag").animateFloat(1f, 1f, infiniteRepeatable(keyframes { durationMillis = if (S.pulse > 30) 60000 / S.pulse else 900; 1f at 0; 1.12f at 120; 1f at 300 }), label = "s")
    Canvas(m.graphicsLayer { scaleX = beat; scaleY = beat }) {
        val w = size.width; val h = size.height
        val heart = Path().apply { moveTo(w * .5f, h * .9f); cubicTo(w * .02f, h * .55f, w * .1f, h * .05f, w * .5f, h * .3f); cubicTo(w * .9f, h * .05f, w * .98f, h * .55f, w * .5f, h * .9f) }
        val pm = PathMeasure(); pm.setPath(heart, false); val seg = Path(); pm.getSegment(0f, pm.length * p, seg, true)
        drawPath(seg, K_RED, style = Stroke(5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
        if (p > .98f) for (k in 0 until 6) { val yy = h * (.35f + k * .08f); drawLine(K_RED.copy(alpha = .35f), Offset(w * .25f + k * 4, yy), Offset(w * .75f - k * 4, yy - 10f), 3f) }
    }
}

/** Överstrykningspenna som drar över texten. */
@Composable
private fun Hi(text: String, fs: Int, col: Color = K_Y) {
    val p = rise(1f, 700, 300)
    Box {
        Canvas(Modifier.matchParentSize()) { drawRoundRect(col.copy(alpha = .85f), Offset(-4f, size.height * .45f), Size((size.width + 8f) * p, size.height * .45f), CornerRadius(6f)) }
        Text(text, color = K_INK, fontFamily = HAND, fontSize = fs.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Polaroid(m: Modifier, rot: Float, onClick: () -> Unit) {
    Box(m.rotate(rot).shadow(6.dp).background(Color.White).clickable(onClick = onClick).padding(start = 8.dp, end = 8.dp, top = 8.dp, bottom = 26.dp)) {
        Dial(Modifier.fillMaxSize())
        Box(Modifier.align(Alignment.TopCenter).offset(y = (-16).dp).size(56.dp, 18.dp).rotate(-6f).background(Color(0xCCF1E3B0)))
    }
}

@Composable
private fun HandBars(v: List<Int>, m: Modifier, col: Color = K_B) {
    val g = rise(1f, 1100)
    Canvas(m) {
        val mx = maxOf(1, v.maxOrNull() ?: 1).toFloat(); val bw = size.width / v.size.coerceAtLeast(1)
        val base = Path(); base.handLine(0f, size.height, size.width, size.height, 99); drawPath(base, K_INK, style = Stroke(3f))
        v.forEachIndexed { i, x -> if (x > 0) {
            val hh = x / mx * size.height * .95f * g; val l = i * bw + bw * .18f; val r = l + bw * .64f; val t = size.height - hh
            for (k in 0 until (hh / 7).toInt()) drawLine(col, Offset(l, size.height - k * 7f), Offset(r, size.height - k * 7f - 5f), 2.5f)
            val o = Path(); o.handLine(l, size.height, l, t, i); o.handLine(l, t, r, t, i + 50); o.handLine(r, t, r, size.height, i + 90)
            drawPath(o, K_INK, style = Stroke(2.5f, cap = StrokeCap.Round))
        } }
    }
}

@Composable
private fun KladdHome(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(start = 48.dp, end = 16.dp, top = 6.dp)) {
        Text("Idag, ${clk("d MMMM")}", color = K_INK, fontFamily = HAND, fontSize = 30.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.Top) {
            Polaroid(Modifier.size(110.dp, 150.dp), -4f, a.dials)
            Spacer(Modifier.width(18.dp))
            Column {
                Text("Urtavla:", color = K_INK, fontFamily = HAND, fontSize = 16.sp)
                Text(S.dialName.ifEmpty { "?" }, color = K_INK, fontFamily = HAND, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(10.dp))
                Text(if (S.ready) "Klockan är med ✓" else "Letar efter klockan…", color = if (S.ready) K_INK else K_RED, fontFamily = HAND, fontSize = 16.sp)
                Text("Batteri: ${if (S.battery >= 0) "${S.battery} %" else "?"}", color = K_INK, fontFamily = HAND, fontSize = 16.sp)
            }
        }
        Spacer(Modifier.height(18.dp))
        Row(verticalAlignment = Alignment.Bottom) { Hi(nn(S.steps), 40); Text("  steg  (${pc()} %)", color = K_INK, fontFamily = HAND, fontSize = 18.sp) }
        Text("ett streck = 500 steg", color = K_INK.copy(alpha = .6f), fontFamily = HAND, fontSize = 14.sp)
        Tally(S.steps, Modifier.fillMaxWidth().height(130.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            DrawnHeart(Modifier.size(70.dp, 62.dp))
            Spacer(Modifier.width(12.dp))
            Column { Text("Puls", color = K_INK, fontFamily = HAND, fontSize = 16.sp); Text(nn(S.pulse), color = K_RED, fontFamily = HAND, fontSize = 36.sp, fontWeight = FontWeight.Bold) }
        }
        Spacer(Modifier.height(8.dp))
        Text("Dagen timme för timme", color = K_INK, fontFamily = HAND, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        HandBars(S.hours.drop(6), Modifier.fillMaxWidth().height(90.dp))
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            listOf(Triple("Hitta klockan", a.find, K_Y), Triple("Ställ tiden", a.time, K_G), Triple("Stil", a.stil, K_P)).forEachIndexed { i, (t, f, c) ->
                Box(Modifier.rotate(if (i % 2 == 0) -2f else 2f).shadow(3.dp).background(c).clickable(onClick = f).padding(horizontal = 12.dp, vertical = 8.dp)) { Text(t, color = K_INK, fontFamily = HAND, fontSize = 15.sp) }
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun KladdHealth(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(start = 48.dp, end = 16.dp, top = 6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", color = K_INK, fontFamily = HAND, fontSize = 34.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            Box(Modifier.rotate(3f).shadow(3.dp).background(K_O).clickable(onClick = a.sync).padding(horizontal = 12.dp, vertical = 8.dp)) { Text("Hämta!", color = K_INK, fontFamily = HAND, fontSize = 16.sp) }
        }
        Row(verticalAlignment = Alignment.Bottom) { Hi(nn(S.steps), 44, K_G); Text("  av ${fmt(S.stepGoal)}", color = K_INK, fontFamily = HAND, fontSize = 18.sp) }
        Tally(S.steps, Modifier.fillMaxWidth().height(130.dp))
        Text("Pulsen idag", color = K_INK, fontFamily = HAND, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        val p = rise(1f, 1600)
        Canvas(Modifier.fillMaxWidth().height(90.dp)) {
            val v = S.pulseDay; if (v.size < 2) return@Canvas
            val lo = v.min().toFloat(); val hi = maxOf(v.max().toFloat(), lo + 1); val path = Path()
            v.forEachIndexed { i, x -> val px = i / (v.size - 1f) * size.width; val py = size.height - (x - lo) / (hi - lo) * size.height * .85f - 4f + wob(i, 3) * 3f; if (i == 0) path.moveTo(px, py) else path.lineTo(px, py) }
            val pm = PathMeasure(); pm.setPath(path, false); val seg = Path(); pm.getSegment(0f, pm.length * p, seg, true)
            drawPath(seg, K_RED, style = Stroke(3.5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
        }
        Text("lägst ${nn(plo())}, högst ${nn(phi())}", color = K_INK.copy(alpha = .7f), fontFamily = HAND, fontSize = 15.sp)
        Spacer(Modifier.height(10.dp))
        Text("Timmarna", color = K_INK, fontFamily = HAND, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        HandBars(S.hours, Modifier.fillMaxWidth().height(100.dp), K_O)
        Spacer(Modifier.height(12.dp))
        Text("Veckan", color = K_INK, fontFamily = HAND, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        S.week.forEachIndexed { i, v ->
            Row(Modifier.padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(22.dp).border(2.dp, K_INK), contentAlignment = Alignment.Center) { if (v >= S.stepGoal) Text("✓", color = K_RED, fontSize = 18.sp, fontWeight = FontWeight.Bold) }
                Spacer(Modifier.width(10.dp))
                Text(S.weekDays.getOrElse(i) { "" }, color = K_INK, fontFamily = HAND, fontSize = 18.sp, modifier = Modifier.width(60.dp))
                Text(nn(v), color = K_INK, fontFamily = HAND, fontSize = 18.sp)
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

// =====================================================================
// DYGNSUR (radar)
// =====================================================================
private val R_BG = Color(0xFF0E1116); private val R_OR = Color(0xFFFF8A3D); private val R_PK = Color(0xFFFF3D7F); private val R_TXT = Color(0xFFF2F4F8); private val R_DIM = Color(0xFF5B6270)

@Composable
private fun RadarShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(R_BG)) {
        Box(Modifier.weight(1f)) { body() }
        // knappar i en båge
        Box(Modifier.fillMaxWidth().height(96.dp)) {
            Canvas(Modifier.fillMaxSize()) { drawArc(R_DIM.copy(alpha = .35f), 200f, 140f, false, Offset(size.width * .08f, size.height * .25f), Size(size.width * .84f, size.height * 2.2f), style = Stroke(2f)) }
            Row(Modifier.fillMaxSize().padding(horizontal = 12.dp)) {
                SHORT3.forEachIndexed { i, l ->
                    val on = i == tab
                    val sc by animateFloatAsState(if (on) 1.2f else 1f, spring(dampingRatio = .5f, stiffness = 400f), label = "knapp")
                    val lift = (sin(Math.PI * i / 4) * 22).dp
                    Column(Modifier.weight(1f).offset(y = 30.dp - lift).clickable(nc(), null) { onTab(i) }, horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(Modifier.size(42.dp).graphicsLayer { scaleX = sc; scaleY = sc }.clip(CircleShape)
                            .background(if (on) Brush.linearGradient(listOf(R_OR, R_PK)) else Brush.linearGradient(listOf(Color(0xFF1C212B), Color(0xFF1C212B)))), contentAlignment = Alignment.Center) {
                            DockIconPub(i, if (on) Color.White else R_DIM, Modifier)
                        }
                        if (on) Text(l, color = R_TXT, fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}

/** Dygnet som en urtavla: varje timme är en stråle ut från ringen, längre ju fler steg. Inget snurrar. */
@Composable
private fun DayDial(m: Modifier) {
    val g = rise(1f, 1500)
    val now = nowHour()
    Box(m, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val c = center; val R = size.minDimension / 2; val r0 = R * .46f; val len = R * .44f
            val mx = maxOf(1, S.hours.maxOrNull() ?: 1)
            drawCircle(Color(0xFF1A1F29), r0, c)
            drawArc(Color(0xFF262C38), -90f, 360f, false, Offset(c.x - r0 * .86f, c.y - r0 * .86f), Size(r0 * 1.72f, r0 * 1.72f), style = Stroke(R * .05f))
            drawArc(Brush.sweepGradient(listOf(R_OR, R_PK, R_OR), c), -90f, 360f * fr() * g, false, Offset(c.x - r0 * .86f, c.y - r0 * .86f), Size(r0 * 1.72f, r0 * 1.72f), style = Stroke(R * .05f, cap = StrokeCap.Round))
            for (h in 0 until 24) {
                val a = Math.toRadians(-90.0 + h * 15); val ca = cos(a).toFloat(); val sa = sin(a).toFloat()
                val pp = ((g * 1.6f) - h / 24f).coerceIn(0f, 1f)
                val v = S.hours.getOrElse(h) { 0 }; val l = len * v / mx * pp
                drawLine(Color(0xFF242A35), Offset(c.x + ca * (r0 + 6), c.y + sa * (r0 + 6)), Offset(c.x + ca * (r0 + len), c.y + sa * (r0 + len)), R * .045f, StrokeCap.Round)
                if (v > 0) drawLine(if (h.toFloat() <= now && now < h + 1) R_PK else R_OR, Offset(c.x + ca * (r0 + 6), c.y + sa * (r0 + 6)), Offset(c.x + ca * (r0 + 6 + l), c.y + sa * (r0 + 6 + l)), R * .045f, StrokeCap.Round)
            }
            val an = Math.toRadians(-90.0 + now * 15)
            val tip = Offset(c.x + cos(an).toFloat() * (R * .99f), c.y + sin(an).toFloat() * (R * .99f))
            drawCircle(Color.White, R * .03f, tip)
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(nn(S.steps), color = R_TXT, fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Text("steg · ${pc()} %", color = R_DIM, fontSize = 12.sp)
        }
        Text("00", Modifier.align(Alignment.TopCenter), color = R_DIM, fontSize = 10.sp)
        Text("12", Modifier.align(Alignment.BottomCenter), color = R_DIM, fontSize = 10.sp)
        Text("06", Modifier.align(Alignment.CenterEnd), color = R_DIM, fontSize = 10.sp)
        Text("18", Modifier.align(Alignment.CenterStart), color = R_DIM, fontSize = 10.sp)
    }
}

/** Pulsmätningarna som strålar runt en liten cirkel. */
@Composable
private fun PulseRing(m: Modifier) {
    val g = rise(1f, 1200)
    Box(m, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val v = S.pulseDay; val c = center; val R = size.minDimension / 2; val r0 = R * .5f
            if (v.isNotEmpty()) { val lo = (v.minOrNull() ?: 0) - 5; val hi = maxOf((v.maxOrNull() ?: 1), lo + 1)
                v.forEachIndexed { i, x -> val a = Math.toRadians(-90.0 + i * 360.0 / v.size); val l = (R * .45f) * (x - lo) / (hi - lo) * g
                    drawLine(R_PK, Offset(c.x + cos(a).toFloat() * r0, c.y + sin(a).toFloat() * r0), Offset(c.x + cos(a).toFloat() * (r0 + l), c.y + sin(a).toFloat() * (r0 + l)), R * .06f, StrokeCap.Round) } }
            drawCircle(Color(0xFF1A1F29), r0 * .9f, c)
        }
        Text(nn(S.pulse), color = R_TXT, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    }
}

/** Veckan som tårtbitar: varje dag en bit, större radie ju fler steg. */
@Composable
private fun WeekPie(m: Modifier) {
    val g = rise(1f, 1200)
    Box(m, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val c = center; val R = size.minDimension / 2 * .95f; val mx = maxOf(1, S.week.maxOrNull() ?: 1)
            S.week.forEachIndexed { i, v -> val r = R * sqrt(maxOf(0, v) / mx.toFloat()) * g; val st = -90f + i * 360f / 7
                drawArc(if (v >= S.stepGoal) R_OR else R_DIM, st + 1.5f, 360f / 7 - 3f, true, Offset(c.x - r, c.y - r), Size(2 * r, 2 * r)) }
            drawCircle(R_BG, R * .22f, c)
        }
        Text("v.", color = R_DIM, fontSize = 11.sp)
    }
}

@Composable
private fun RadarHome(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(56.dp).clip(CircleShape).border(2.dp, R_OR, CircleShape).clickable(onClick = a.dials)) { Dial(Modifier.fillMaxSize()) }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) { Text(S.dialName.ifEmpty { "Urtavla" }, color = R_TXT, fontSize = 16.sp, fontWeight = FontWeight.SemiBold); Text(if (S.ready) "Ansluten" else "Söker klockan", color = R_DIM, fontSize = 12.sp) }
            Text(clk("HH:mm"), color = R_TXT, fontSize = 22.sp, fontWeight = FontWeight.Light)
        }
        Spacer(Modifier.height(8.dp))
        DayDial(Modifier.fillMaxWidth().aspectRatio(1f))
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) { PulseRing(Modifier.size(110.dp)); Text("Puls", color = R_DIM, fontSize = 12.sp) }
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(110.dp), contentAlignment = Alignment.Center) {
                    val g = rise(if (S.battery >= 0) S.battery / 100f else 0f)
                    Canvas(Modifier.fillMaxSize()) { val st = size.width * .09f; drawArc(Color(0xFF242A35), 135f, 270f, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round))
                        drawArc(Brush.sweepGradient(listOf(R_OR, R_PK, R_OR)), 135f, 270f * g, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round)) }
                    Text(if (S.battery >= 0) "${S.battery}%" else "–", color = R_TXT, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
                Text("Batteri", color = R_DIM, fontSize = 12.sp)
            }
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf("Hitta" to a.find, "Tiden" to a.time, "Stil" to a.stil).forEach { (t, f) ->
                Box(Modifier.weight(1f).clip(CircleShape).border(1.dp, R_DIM, CircleShape).clickable(onClick = f).padding(vertical = 11.dp), contentAlignment = Alignment.Center) { Text(t, color = R_TXT, fontSize = 13.sp) }
            }
        }
        Spacer(Modifier.height(10.dp))
    }
}

@Composable
private fun RadarHealth(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", color = R_TXT, fontSize = 30.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
            Box(Modifier.clip(CircleShape).background(Brush.linearGradient(listOf(R_OR, R_PK))).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 9.dp)) { Text("Hämta", color = Color.White) }
        }
        DayDial(Modifier.fillMaxWidth().aspectRatio(1f))
        Text("Varje stråle är en timme. Rosa = just nu.", color = R_DIM, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth()) {
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) { PulseRing(Modifier.size(140.dp)); Text("Puls ${nn(plo())}–${nn(phi())}", color = R_DIM, fontSize = 12.sp) }
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) { WeekPie(Modifier.size(140.dp)); Text("Veckan · orange = målet nått", color = R_DIM, fontSize = 12.sp, textAlign = TextAlign.Center) }
        }
        Spacer(Modifier.height(10.dp))
    }
}

// =====================================================================
// KORTLEK
// =====================================================================
private val C_BG1 = Color(0xFFFFE9E3); private val C_BG2 = Color(0xFFEDE4FF); private val C_ACC = Color(0xFF6D4AFF); private val C_INK = Color(0xFF1F1A2E)

@Composable
private fun KortShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(C_BG1, C_BG2)))) {
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp, vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Klocka", "Hälsa", "Urtavlor", "Verktyg", "Mer").forEachIndexed { i, l ->
                val on = i == tab
                val bg by animateColorAsState(if (on) C_INK else Color.White.copy(alpha = .7f), label = "piller")
                Text(l, Modifier.clip(CircleShape).background(bg).clickable(nc(), null) { onTab(i) }.padding(horizontal = 18.dp, vertical = 10.dp), color = if (on) Color.White else C_INK, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            }
        }
        Box(Modifier.weight(1f)) { body() }
    }
}

/** Kortlek: korten bredvid lutar, krymper och bleknar; det aktiva ligger överst. */
@Composable
class Card3(val t: String, val c: Color, val body: @Composable () -> Unit)

@Composable
private fun Deck(cards: List<Card3>, m: Modifier) {
    val st = rememberPagerState { cards.size }
    Column(m) {
        HorizontalPager(st, Modifier.weight(1f).fillMaxWidth(), contentPadding = PaddingValues(horizontal = 36.dp), pageSpacing = 4.dp) { p ->
            val off = (st.currentPage - p) + st.currentPageOffsetFraction
            Box(Modifier.fillMaxSize().padding(vertical = 10.dp).graphicsLayer {
                val k = abs(off).coerceIn(0f, 1f); scaleX = 1f - .1f * k; scaleY = 1f - .1f * k; rotationZ = off * -7f; alpha = 1f - .35f * k
            }.shadow(12.dp, RoundedCornerShape(30.dp)).clip(RoundedCornerShape(30.dp)).background(Color.White)) {
                Column {
                    Box(Modifier.fillMaxWidth().background(cards[p].c).padding(18.dp)) { Text(cards[p].t, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold) }
                    Box(Modifier.fillMaxSize().padding(18.dp)) { cards[p].body() }
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(8.dp), horizontalArrangement = Arrangement.Center) {
            repeat(cards.size) { i -> val on = st.currentPage == i; val w by animateDpAsState(if (on) 22.dp else 8.dp, label = "prick"); Box(Modifier.padding(3.dp).size(w, 8.dp).clip(CircleShape).background(if (on) C_INK else C_INK.copy(alpha = .25f))) }
        }
    }
}

@Composable private fun Big(t: String, c: Color = C_INK) = Text(t, color = c, fontSize = 56.sp, fontWeight = FontWeight.Black, lineHeight = 58.sp)
@Composable private fun Sub(t: String) = Text(t, color = C_INK.copy(alpha = .6f), fontSize = 15.sp)

@Composable
private fun KortHome(a: Acts) {
    Column(Modifier.fillMaxSize()) {
        Deck(listOf(
            Card3("Urtavla", C_ACC) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Box(Modifier.size(170.dp, 202.dp).clip(RoundedCornerShape(36.dp)).clickable(onClick = a.dials)) { Dial(Modifier.fillMaxSize()) }
                    Spacer(Modifier.height(10.dp)); Text(S.dialName.ifEmpty { "–" }, color = C_INK, fontSize = 20.sp, fontWeight = FontWeight.Bold); Sub("Tryck på bilden för att byta")
                }
            },
            Card3("Steg", Color(0xFF00A86B)) {
                Column { Big(nn(S.steps)); Sub("av ${fmt(S.stepGoal)} · ${pc()} %"); Spacer(Modifier.height(16.dp))
                    val g = rise(fr(), 1200)
                    Box(Modifier.fillMaxWidth().height(28.dp).clip(CircleShape).background(Color(0xFFE6F6EF))) { Box(Modifier.fillMaxHeight().fillMaxWidth(g).clip(CircleShape).background(Color(0xFF00A86B))) }
                    Spacer(Modifier.height(16.dp)); Sub(tops(1).firstOrNull()?.let { "Mest aktiv kl ${"%02d".format(it.first)}" } ?: "") }
            },
            Card3("Puls", Color(0xFFFF3D6E)) {
                Column { Big(nn(S.pulse), Color(0xFFFF3D6E)); Sub("slag per minut"); Spacer(Modifier.height(12.dp)); Sub("Idag ${nn(plo())}–${nn(phi())}")
                    Spark(S.pulseDay, Color(0xFFFF3D6E), Modifier.fillMaxWidth().height(80.dp).padding(top = 10.dp)) }
            },
            Card3("Klockan", Color(0xFF1F1A2E)) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Big(if (S.battery >= 0) "${S.battery}%" else "–"); Sub(if (S.ready) "Ansluten" else "Söker klockan")
                    listOf("Hitta klockan" to a.find, "Ställ tiden" to a.time, "Byt stil" to a.stil).forEach { (t, f) ->
                        Box(Modifier.fillMaxWidth().clip(CircleShape).background(C_BG2).clickable(onClick = f).padding(12.dp), contentAlignment = Alignment.Center) { Text(t, color = C_INK, fontWeight = FontWeight.SemiBold) }
                    }
                }
            }
        ), Modifier.fillMaxSize())
    }
}

@Composable
private fun KortHealth(a: Acts) {
    Deck(listOf(
        Card3("Steg idag", Color(0xFF00A86B)) {
            Column { Big(nn(S.steps)); Sub("${pc()} % av målet"); Spacer(Modifier.height(18.dp))
                Box(Modifier.fillMaxWidth().clip(CircleShape).background(Color(0xFF00A86B)).clickable(onClick = a.sync).padding(12.dp), contentAlignment = Alignment.Center) { Text("Hämta från klockan", color = Color.White, fontWeight = FontWeight.SemiBold) } }
        },
        Card3("Timmarna", Color(0xFFFF8A3D)) {
            Column { Sub("Mest aktiv: ${tops(3).joinToString(", ") { "kl %02d".format(it.first) }}"); Bars(S.hours, Color(0xFFFF8A3D), Modifier.fillMaxWidth().height(160.dp).padding(top = 12.dp)) }
        },
        Card3("Pulsen", Color(0xFFFF3D6E)) {
            Column { Big(nn(S.pulse), Color(0xFFFF3D6E)); Sub("Lägst ${nn(plo())} · högst ${nn(phi())}"); Spark(S.pulseDay, Color(0xFFFF3D6E), Modifier.fillMaxWidth().height(110.dp).padding(top = 12.dp)) }
        },
        Card3("Veckan", C_ACC) {
            Column { Sub("Målet nått ${S.week.count { it >= S.stepGoal }} av 7 dagar"); Bars(S.week.map { maxOf(0, it) }, C_ACC, Modifier.fillMaxWidth().height(150.dp).padding(top = 12.dp))
                Row(Modifier.fillMaxWidth()) { S.weekDays.forEach { Text(it, Modifier.weight(1f), color = C_INK.copy(alpha = .6f), fontSize = 11.sp, textAlign = TextAlign.Center) } } }
        }
    ), Modifier.fillMaxSize())
}

// =====================================================================
// TIDSLINJE
// =====================================================================
private val TL_BG = Color(0xFFF4F6FB); private val TL_INK = Color(0xFF1E293B); private val TL_ACC = Color(0xFF4F46E5); private val TL_DIM = Color(0xFF94A3B8); private val TL_GRN = Color(0xFF10B981)

@Composable
private fun TidShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Row(Modifier.fillMaxSize().background(TL_BG)) {
        Box(Modifier.weight(1f).fillMaxHeight()) { body() }
        BoxWithConstraints(Modifier.width(74.dp).fillMaxHeight().background(Color.White).padding(vertical = 16.dp)) {
            val h = maxHeight / 5
            val y by animateDpAsState(h * tab, spring(dampingRatio = .7f, stiffness = 300f), label = "y")
            Box(Modifier.offset(y = y).padding(horizontal = 10.dp, vertical = 14.dp).fillMaxWidth().height(h - 28.dp).clip(RoundedCornerShape(18.dp)).background(TL_ACC.copy(alpha = .12f)))
            Box(Modifier.offset(y = y + h / 2 - 16.dp).width(4.dp).height(32.dp).clip(CircleShape).background(TL_ACC))
            Column(Modifier.fillMaxSize()) {
                SHORT3.forEachIndexed { i, l ->
                    val on = i == tab
                    Column(Modifier.weight(1f).fillMaxWidth().clickable(nc(), null) { onTab(i) }, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                        DockIconPub(i, if (on) TL_ACC else TL_DIM, Modifier)
                        Text(l.replaceFirstChar { it.uppercase() }, color = if (on) TL_ACC else TL_DIM, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 3.dp))
                    }
                }
            }
        }
    }
}

/** En rad på tidslinjen: tid, en nod på linjen (större ju fler steg) och text. */
@Composable
private fun TRow(time: String, node: Float, col: Color, title: String, sub: String?, i: Int, first: Boolean = false, last: Boolean = false, extra: (@Composable () -> Unit)? = null) {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(40L * i); on = true }
    val a by animateFloatAsState(if (on) 1f else 0f, tween(300), label = "in")
    Row(Modifier.fillMaxWidth().graphicsLayer { alpha = a; translationX = (1 - a) * 40f }.drawBehind {
        val cx = 44.dp.toPx() + 15.dp.toPx(); val cy = 20.dp.toPx()
        drawLine(TL_DIM.copy(alpha = .4f), Offset(cx, if (first) cy else 0f), Offset(cx, if (last) cy else size.height), 2.dp.toPx())
    }) {
        Text(time, Modifier.width(44.dp).padding(top = 10.dp), color = TL_DIM, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        Canvas(Modifier.size(30.dp, 40.dp)) {
            val cx = size.width / 2; val cy = 20.dp.toPx()
            val r = (4.dp.toPx() + 9.dp.toPx() * node)
            drawCircle(TL_BG, r + 2.dp.toPx(), Offset(cx, cy)); drawCircle(col, r, Offset(cx, cy))
        }
        Column(Modifier.weight(1f).padding(start = 6.dp, top = 8.dp, bottom = 12.dp)) {
            Text(title, color = TL_INK, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            if (sub != null) Text(sub, color = TL_DIM, fontSize = 13.sp)
            extra?.invoke()
        }
    }
}

@Composable
private fun TidHome(a: Acts) {
    val now = nowHour().toInt()
    val mx = maxOf(1, S.hours.maxOrNull() ?: 1)
    val top = tops(1).firstOrNull()?.first
    var acc = 0; var goalAt = -1
    S.hours.forEachIndexed { h, v -> acc += v; if (goalAt < 0 && acc >= S.stepGoal) goalAt = h }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(start = 14.dp, end = 10.dp, top = 16.dp)) {
        Text("Din dag", color = TL_INK, fontSize = 30.sp, fontWeight = FontWeight.Bold)
        Text("${nn(S.steps)} steg · puls ${nn(S.pulse)} · batteri ${if (S.battery >= 0) "${S.battery} %" else "–"}", color = TL_DIM, fontSize = 13.sp)
        Spacer(Modifier.height(14.dp))
        TRow("Nu", 1f, TL_ACC, "Urtavla: ${S.dialName.ifEmpty { "–" }}", if (S.ready) "Klockan är ansluten" else "Söker klockan", 0, first = true) {
            Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(64.dp, 76.dp).clip(RoundedCornerShape(16.dp)).clickable(onClick = a.dials)) { Dial(Modifier.fillMaxSize()) }
                Spacer(Modifier.width(10.dp))
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Hitta klockan" to a.find, "Ställ tiden" to a.time, "Byt stil" to a.stil).forEach { (t, f) -> Text(t, Modifier.clip(CircleShape).background(Color.White).clickable(onClick = f).padding(horizontal = 12.dp, vertical = 5.dp), color = TL_ACC, fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                }
            }
        }
        var i = 1
        for (h in now downTo 0) {
            val v = S.hours.getOrElse(h) { 0 }
            val title = when { h == goalAt -> "Målet nått"; h == top -> "Mest aktiv timme"; v > 0 -> "${fmt(v)} steg"; else -> "Lugnt" }
            val sub = when { h == goalAt || h == top -> "${fmt(v)} steg"; else -> null }
            if (v > 0 || h == now || h % 3 == 0)
                TRow("%02d:00".format(h), v / mx.toFloat(), when { h == goalAt -> TL_GRN; h == top -> TL_ACC; v > 0 -> TL_INK; else -> TL_DIM.copy(alpha = .5f) }, title, sub, i++, last = h == 0)
        }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun TidHealth(a: Acts) {
    val mx = maxOf(1, S.week.maxOrNull() ?: 1)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(start = 14.dp, end = 10.dp, top = 16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Veckan", color = TL_INK, fontSize = 30.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            Text("Hämta", Modifier.clip(CircleShape).background(TL_ACC).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 8.dp), color = Color.White, fontWeight = FontWeight.SemiBold)
        }
        Text("Målet nått ${S.week.count { it >= S.stepGoal }} av 7 dagar", color = TL_DIM, fontSize = 13.sp)
        Spacer(Modifier.height(14.dp))
        val n = S.week.size
        for (k in n - 1 downTo 0) {
            val v = S.week[k]; val hit = v >= S.stepGoal
            TRow(S.weekDays.getOrElse(k) { "" }.take(4), maxOf(0, v) / mx.toFloat(), if (hit) TL_GRN else TL_ACC, "${nn(v)} steg", if (hit) "Målet nått" else if (v >= 0) "${v * 100 / S.stepGoal.coerceAtLeast(1)} % av målet" else null, n - k, first = k == n - 1, last = k == 0) {
                val g = rise((maxOf(0, v) / S.stepGoal.toFloat()).coerceIn(0f, 1f), 800, 50 * (n - k))
                Box(Modifier.padding(top = 6.dp).fillMaxWidth().height(8.dp).clip(CircleShape).background(TL_DIM.copy(alpha = .2f))) { Box(Modifier.fillMaxHeight().fillMaxWidth(g).clip(CircleShape).background(if (hit) TL_GRN else TL_ACC)) }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text("Pulsen under dagen", color = TL_INK, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        Text("Lägst ${nn(plo())} · högst ${nn(phi())} · senast ${nn(S.pulse)}", color = TL_DIM, fontSize = 13.sp)
        Spark(S.pulseDay, TL_ACC, Modifier.fillMaxWidth().height(90.dp).padding(vertical = 10.dp))
        Spacer(Modifier.height(16.dp))
    }
}
