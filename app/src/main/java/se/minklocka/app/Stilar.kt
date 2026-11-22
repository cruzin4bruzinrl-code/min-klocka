@file:OptIn(ExperimentalFoundationApi::class)

package se.minklocka.app

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * Sju helt olika sätt att visa appen. Varje stil har egen meny, egen uppställning, egna typsnitt och egna rörelser,
 * inte bara egna färger. Inget snurrar runt i cirklar.
 */
enum class Stil(val title: String, val blurb: String) {
    MATERIAL("Material", "Googles egen stil. Mjuka kort, menyn längst ner, färger från telefonen."),
    COCKPIT("Cockpit", "Instrumentpanel. Mätare vars visare slår ut, LED-staplar och en svepande avläsning."),
    TIDNING("Tidning", "Som en morgontidning. Stora rubriker, siffror som rullar fram, tunna linjer, menyn som text överst."),
    BENTO("Bento", "Rutor i olika storlek. Tryck på en ruta så växer den och visar mer. Svävande meny."),
    BRUTAL("Brutal", "Tjocka kanter, hårda skuggor och klara färger. Menyn på sidan, rutorna trycks ner när du rör dem."),
    NORRSKEN("Norrsken", "Glas som svävar över ett norrsken i rörelse. Urtavlan står i mitten, siffrorna guppar."),
    PRICK("Prickmatris", "Allt ritat med lysande prickar som tänds en i taget. Svep mellan sidorna i Hälsa.");

    fun web(dark: Boolean) = when (this) {
        MATERIAL -> if (dark) "m3pixel" else "m3ljus"
        COCKPIT -> "cockpit"; TIDNING -> "tidning"; BENTO -> "bento"; BRUTAL -> "brutal"; NORRSKEN -> "norrsken"; PRICK -> "prick"
    }

    /** Färgen på statusraden och om ikonerna där ska vara mörka. */
    fun bars(cs: ColorScheme, dark: Boolean): Pair<Color, Boolean> = when (this) {
        MATERIAL -> cs.surface to !dark
        COCKPIT -> CK_BG to false
        TIDNING -> TD_PAPER to true
        BENTO -> BT_BG to false
        BRUTAL -> BR_YEL to true
        NORRSKEN -> NS_BG to false
        PRICK -> Color.Black to false
    }
}

// ---------- färger ----------
private val CK_BG = Color(0xFF03090D); private val CK_PANEL = Color(0xFF07161C); private val CK_CY = Color(0xFF2EF2FF)
private val CK_AMB = Color(0xFFFFB020); private val CK_TXT = Color(0xFFCFEFF5); private val CK_DIM = Color(0xFF2B5058)
private val TD_PAPER = Color(0xFFF3EFE6); private val TD_INK = Color(0xFF1B1A17); private val TD_RED = Color(0xFF8A1C1C); private val TD_GREY = Color(0xFF6E6A61)
private val BT_BG = Color(0xFF0B0D12); private val BT_CARD = Color(0xFF171A22); private val BT_GREEN = Color(0xFF1F8A5B)
private val BT_ORANGE = Color(0xFFFF8A3C); private val BT_LILAC = Color(0xFFB9A7FF); private val BT_TXT = Color(0xFFF1F2F6)
private val BR_YEL = Color(0xFFFFF36B); private val BR_PINK = Color(0xFFFF4FD2); private val BR_BLUE = Color(0xFF4DD2FF); private val BR_GREEN = Color(0xFFB6FF6B)
private val NS_BG = Color(0xFF050814); private val NS_TEAL = Color(0xFF1DE9B6); private val NS_VIO = Color(0xFF7C4DFF); private val NS_BLUE = Color(0xFF2979FF)
private val PR_RED = Color(0xFFE8202A); private val PR_OFF = Color(0xFF1A1A1A); private val PR_TXT = Color(0xFFEDEDED)

private val MONO = FontFamily.Monospace
private val SERIF = FontFamily.Serif
private val SHORT = listOf("Klocka", "Hälsa", "Tavlor", "Verktyg", "Mer")

private fun frac() = WatchState.let { if (it.steps >= 0) it.steps / it.stepGoal.toFloat() else 0f }
private fun pct() = WatchState.let { if (it.steps >= 0) (it.steps * 100 / it.stepGoal.coerceAtLeast(1)) else 0 }
private fun num(v: Int) = if (v < 0) "–" else fmt(v)

@Composable
private fun clock(fmtS: String = "HH:mm"): String {
    var s by remember { mutableStateOf("") }
    LaunchedEffect(fmtS) { while (true) { s = SimpleDateFormat(fmtS, Locale("sv", "SE")).format(Date()); delay(1000) } }
    return s
}

/** Går från 0 till 1 en gång när skärmen visas. */
@Composable
private fun reveal(ms: Int = 900, wait: Int = 0): Float {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { on = true }
    return animateFloatAsState(if (on) 1f else 0f, tween(ms, wait, FastOutSlowInEasing), label = "fram").value
}

private fun noClick() = MutableInteractionSource()

// =====================================================================
// Väljare
// =====================================================================

@Composable
fun StilShell(stil: Stil, tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) = when (stil) {
    Stil.MATERIAL -> MaterialShell(tab, onTab, body)
    Stil.COCKPIT -> CockpitShell(tab, onTab, body)
    Stil.TIDNING -> TidningShell(tab, onTab, body)
    Stil.BENTO -> BentoShell(tab, onTab, body)
    Stil.BRUTAL -> BrutalShell(tab, onTab, body)
    Stil.NORRSKEN -> NorrskenShell(tab, onTab, body)
    Stil.PRICK -> PrickShell(tab, onTab, body)
}

@Composable
fun StilHome(stil: Stil, a: Acts) = when (stil) {
    Stil.MATERIAL -> HomeScreen(a)
    Stil.COCKPIT -> CockpitHome(a)
    Stil.TIDNING -> TidningHome(a)
    Stil.BENTO -> BentoHome(a)
    Stil.BRUTAL -> BrutalHome(a)
    Stil.NORRSKEN -> NorrskenHome(a)
    Stil.PRICK -> PrickHome(a)
}

@Composable
fun StilHealth(stil: Stil, a: Acts) = when (stil) {
    Stil.MATERIAL -> HealthScreen(a)
    Stil.COCKPIT -> CockpitHealth(a)
    Stil.TIDNING -> TidningHealth(a)
    Stil.BENTO -> BentoHealth(a)
    Stil.BRUTAL -> BrutalHealth(a)
    Stil.NORRSKEN -> NorrskenHealth(a)
    Stil.PRICK -> PrickHealth(a)
}

fun AnimatedContentTransitionScope<Int>.stilTransition(stil: Stil, from: Int, to: Int): ContentTransform {
    val dir = if (to > from) 1 else -1
    return when (stil) {
        Stil.MATERIAL -> (slideInHorizontally(tween(320, easing = FastOutSlowInEasing)) { it / 6 * dir } + fadeIn(tween(220))) togetherWith
            (slideOutHorizontally(tween(260)) { -it / 8 * dir } + fadeOut(tween(160)))
        Stil.COCKPIT -> (fadeIn(tween(90)) + scaleIn(tween(260), initialScale = .97f)) togetherWith fadeOut(tween(90))
        Stil.TIDNING -> fadeIn(tween(420, 120)) togetherWith fadeOut(tween(200))
        Stil.BENTO -> (scaleIn(spring(dampingRatio = .7f, stiffness = 300f), initialScale = .9f) + fadeIn(tween(200))) togetherWith fadeOut(tween(150))
        Stil.BRUTAL -> slideInVertically(tween(240, easing = LinearOutSlowInEasing)) { it * dir } togetherWith slideOutVertically(tween(240)) { -it * dir }
        Stil.NORRSKEN -> (fadeIn(tween(600)) + slideInVertically(tween(600, easing = FastOutSlowInEasing)) { it / 12 }) togetherWith fadeOut(tween(260))
        Stil.PRICK -> fadeIn(tween(160)) togetherWith fadeOut(tween(160))
    }
}

/** Menyrad där markeringen glider mellan flikarna. */
@Composable
private fun SlideTabs(
    tab: Int, onTab: (Int) -> Unit, modifier: Modifier, labels: List<String>, style: TextStyle,
    sel: Color, unsel: Color, ind: Color, pill: Boolean, shape: androidx.compose.ui.graphics.Shape = CircleShape, line: Dp = 2.dp
) {
    BoxWithConstraints(modifier) {
        val w = maxWidth / labels.size
        val x by animateDpAsState(w * tab, spring(dampingRatio = .72f, stiffness = 380f), label = "markör")
        if (pill) Box(Modifier.offset(x = x).width(w).fillMaxHeight().padding(5.dp).background(ind, shape))
        else Box(Modifier.align(Alignment.BottomStart).offset(x = x + w * .18f).width(w * .64f).height(line).background(ind))
        Row(Modifier.fillMaxSize()) {
            labels.forEachIndexed { i, l ->
                val c by animateColorAsState(if (i == tab) sel else unsel, tween(250), label = "färg")
                Box(Modifier.weight(1f).fillMaxHeight().clickable(noClick(), null) { onTab(i) }, contentAlignment = Alignment.Center) {
                    Text(l, style = style, color = c, maxLines = 1)
                }
            }
        }
    }
}

@Composable
private fun DialImage(m: Modifier, corner: Dp) {
    Box(m.clip(RoundedCornerShape(corner)).background(Color.Black)) {
        WatchState.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
    }
}

// =====================================================================
// Stilväljaren
// =====================================================================

@Composable
fun StilPicker(open: Boolean, cur: Stil, onPick: (Stil) -> Unit, onClose: () -> Unit) {
    AnimatedVisibility(open, enter = fadeIn(tween(200)), exit = fadeOut(tween(200))) {
        Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = .6f)).clickable(noClick(), null) { onClose() })
    }
    AnimatedVisibility(open, enter = slideInVertically(spring(dampingRatio = .82f, stiffness = 320f)) { it }, exit = slideOutVertically(tween(220)) { it }) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.BottomCenter) {
            Column(
                Modifier.fillMaxWidth().fillMaxHeight(.86f).clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                    .background(Color(0xFF14161C)).clickable(noClick(), null) {}.verticalScroll(rememberScrollState()).padding(18.dp)
            ) {
                Box(Modifier.align(Alignment.CenterHorizontally).size(40.dp, 4.dp).background(Color(0xFF3A3E48), CircleShape))
                Spacer(Modifier.height(14.dp))
                Text("Välj stil", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.SemiBold)
                Text("Hela appen byter uppställning, meny och rörelser.", color = Color(0xFF9AA0B4), fontSize = 14.sp)
                Spacer(Modifier.height(14.dp))
                Stil.entries.forEachIndexed { i, s ->
                    val shown = reveal(380, 50 * i)
                    val on = s == cur
                    Row(
                        Modifier.graphicsLayer { alpha = shown; translationY = (1 - shown) * 40f }.fillMaxWidth().padding(vertical = 5.dp)
                            .clip(RoundedCornerShape(20.dp)).background(if (on) Color(0xFF262B38) else Color(0xFF1B1E26))
                            .border(if (on) 2.dp else 0.dp, if (on) Color(0xFF8AB4FF) else Color.Transparent, RoundedCornerShape(20.dp))
                            .clickable { onPick(s) }.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        MiniPreview(s, Modifier.size(64.dp, 112.dp).clip(RoundedCornerShape(12.dp)))
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Text(s.title, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                            Text(s.blurb, color = Color(0xFFAEB3C2), fontSize = 13.sp, lineHeight = 17.sp)
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

/** En liten skiss av hur stilen ser ut. */
@Composable
private fun MiniPreview(s: Stil, m: Modifier) {
    val t = rememberInfiniteTransition(label = "skiss")
    val k by t.animateFloat(0f, 1f, infiniteRepeatable(tween(2400, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "k")
    Canvas(m) {
        val w = size.width; val h = size.height
        fun rr(c: Color, x: Float, y: Float, ww: Float, hh: Float, r: Float = 6f) = drawRoundRect(c, Offset(x * w, y * h), Size(ww * w, hh * h), CornerRadius(r))
        when (s) {
            Stil.MATERIAL -> { drawRect(Color(0xFF1D1B20)); rr(Color(0xFF4F378B), .08f, .1f, .84f, .3f, 14f); rr(Color(0xFF2B2930), .08f, .44f, .84f, .2f, 14f); rr(Color(0xFF2B2930), .08f, .68f, .84f, .12f, 14f); drawRect(Color(0xFF211F26), Offset(0f, h * .86f), Size(w, h * .14f)); rr(Color(0xFF4A4458), .06f + k * .6f, .88f, .28f, .08f, 20f) }
            Stil.COCKPIT -> { drawRect(CK_BG); drawArc(CK_DIM, 150f, 240f, false, Offset(w * .15f, h * .12f), Size(w * .7f, w * .7f), style = Stroke(4f)); drawArc(CK_CY, 150f, 240f * (.3f + .5f * k), false, Offset(w * .15f, h * .12f), Size(w * .7f, w * .7f), style = Stroke(4f))
                for (i in 0 until 8) { val hh = (.1f + .25f * ((i * 37 % 10) / 10f)) * h; drawRect(CK_CY, Offset(w * (.1f + i * .1f), h * .8f - hh), Size(w * .06f, hh)) }
                drawLine(CK_CY.copy(alpha = .4f), Offset(0f, h * k), Offset(w, h * k), 2f) }
            Stil.TIDNING -> { drawRect(TD_PAPER); rr(TD_INK, .1f, .06f, .8f, .05f, 0f); drawLine(TD_INK, Offset(w * .08f, h * .15f), Offset(w * .92f, h * .15f), 2f); rr(TD_RED, .1f, .22f, .3f, .03f, 0f); rr(TD_INK, .1f, .28f, .8f * (.5f + .5f * k), .1f, 0f)
                for (i in 0..4) rr(TD_GREY, .1f, .45f + i * .06f, .38f, .02f, 0f); rr(Color(0xFF555555), .55f, .45f, .35f, .28f, 0f) }
            Stil.BENTO -> { drawRect(BT_BG); rr(BT_CARD, .06f, .05f, .5f, .38f, 10f); rr(BT_ORANGE, .6f, .05f, .34f, .18f, 10f); rr(BT_LILAC, .6f, .25f, .34f, .18f, 10f); rr(BT_GREEN, .06f, .46f, .88f, .2f + .1f * k, 10f); drawRoundRect(Color(0xFF1C2029), Offset(w * .1f, h * .86f), Size(w * .8f, h * .09f), CornerRadius(40f)) }
            Stil.BRUTAL -> { drawRect(BR_YEL); drawRect(Color.Black, Offset(0f, 0f), Size(w * .22f, h)); rr(BR_PINK, .02f, .1f + .3f * k, .18f, .1f, 0f)
                drawRect(Color.Black, Offset(w * .34f, h * .14f), Size(w * .58f, h * .2f)); drawRect(BR_BLUE, Offset(w * .3f, h * .1f), Size(w * .58f, h * .2f)); drawRect(Color.Black, Offset(w * .34f, h * .44f), Size(w * .58f, h * .2f)); drawRect(BR_GREEN, Offset(w * .3f, h * .4f), Size(w * .58f, h * .2f)) }
            Stil.NORRSKEN -> { drawRect(NS_BG); drawCircle(Brush.radialGradient(listOf(NS_TEAL.copy(alpha = .7f), Color.Transparent), Offset(w * (.2f + .6f * k), h * .2f), w * .7f), w * .7f, Offset(w * (.2f + .6f * k), h * .2f)); drawCircle(Brush.radialGradient(listOf(NS_VIO.copy(alpha = .7f), Color.Transparent), Offset(w * (.8f - .5f * k), h * .6f), w * .8f), w * .8f, Offset(w * (.8f - .5f * k), h * .6f))
                rr(Color.Black, .22f, .18f, .56f, .32f, 16f); rr(Color.White.copy(alpha = .14f), .1f, .58f, .8f, .12f, 14f); rr(Color.White.copy(alpha = .14f), .2f, .86f, .6f, .08f, 30f) }
            Stil.PRICK -> { drawRect(Color.Black); val d = w / 12f
                for (r in 0 until 20) for (c in 0 until 11) { val on = ((r * 7 + c * 13) % 10) / 10f < k * .6f && r in 4..12; drawCircle(if (on) PR_RED else PR_OFF, d * .32f, Offset(d * (c + .5f), d * (r + 2f))) } }
        }
    }
}

// =====================================================================
// COCKPIT
// =====================================================================

@Composable
private fun CockpitShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(CK_BG)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            val blink = rememberInfiniteTransition(label = "lampa").animateFloat(1f, .25f, infiniteRepeatable(tween(900), RepeatMode.Reverse), label = "b").value
            Box(Modifier.size(8.dp).background((if (WatchState.ready) CK_CY else CK_AMB).copy(alpha = if (WatchState.ready) 1f else blink), CircleShape))
            Spacer(Modifier.width(8.dp))
            Text(if (WatchState.ready) "LÄNK OK" else "SÖKER", color = CK_TXT, fontFamily = MONO, fontSize = 12.sp, letterSpacing = 2.sp)
            Spacer(Modifier.weight(1f))
            Text(clock("HH:mm:ss").ifEmpty { "--:--" }, color = CK_CY, fontFamily = MONO, fontSize = 12.sp, letterSpacing = 2.sp)
        }
        SlideTabs(tab, onTab, Modifier.fillMaxWidth().height(40.dp).padding(horizontal = 8.dp).border(1.dp, CK_DIM, RoundedCornerShape(4.dp)),
            SHORT.map { it.uppercase() }, TextStyle(fontFamily = MONO, fontSize = 11.sp, letterSpacing = 1.sp), CK_BG, CK_TXT, CK_CY, true, RoundedCornerShape(2.dp))
        Box(Modifier.weight(1f).padding(top = 6.dp)) {
            body()
            ScanLine()
        }
    }
}

@Composable
private fun ScanLine() {
    val y by rememberInfiniteTransition(label = "svep").animateFloat(0f, 1f, infiniteRepeatable(tween(5200, easing = LinearEasing)), label = "y")
    Canvas(Modifier.fillMaxSize()) {
        val yy = size.height * y
        drawRect(Brush.verticalGradient(listOf(Color.Transparent, CK_CY.copy(alpha = .10f), Color.Transparent), yy - 60f, yy + 4f), Offset(0f, yy - 60f), Size(size.width, 64f))
    }
}

/** Mätare med visare som slår ut till värdet och gungar till rätta. */
@Composable
private fun Gauge(f: Float, label: String, value: String, m: Modifier, col: Color = CK_CY, big: Boolean = false) {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(120); on = true }
    val a by animateFloatAsState(if (on) f.coerceIn(0f, 1f) else 0f, spring(dampingRatio = .42f, stiffness = 28f), label = "visare")
    Box(m, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val r = size.minDimension / 2; val c = center
            val tl = Offset(c.x - r * .86f, c.y - r * .86f); val sz = Size(r * 1.72f, r * 1.72f)
            drawArc(CK_DIM, 150f, 240f, false, tl, sz, style = Stroke(r * .05f))
            drawArc(col.copy(alpha = .9f), 150f, 240f * a, false, tl, sz, style = Stroke(r * .05f))
            for (i in 0..30) {
                val ang = Math.toRadians(150.0 + 240.0 * i / 30); val long = i % 5 == 0
                val r1 = r * .98f; val r2 = if (long) r * .74f else r * .82f
                val lit = i / 30f <= a
                drawLine(if (lit) col else CK_DIM, Offset(c.x + cos(ang).toFloat() * r1, c.y + sin(ang).toFloat() * r1), Offset(c.x + cos(ang).toFloat() * r2, c.y + sin(ang).toFloat() * r2), if (long) 3.5f else 1.6f)
            }
            val ang = Math.toRadians(150.0 + 240.0 * a)
            drawLine(CK_AMB, c, Offset(c.x + cos(ang).toFloat() * r * .7f, c.y + sin(ang).toFloat() * r * .7f), r * .035f, StrokeCap.Round)
            drawCircle(CK_AMB, r * .06f, c)
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(top = if (big) 70.dp else 34.dp)) {
            Text(value, color = CK_TXT, fontFamily = MONO, fontSize = if (big) 26.sp else 15.sp, fontWeight = FontWeight.Bold)
            Text(label, color = CK_CY.copy(alpha = .7f), fontFamily = MONO, fontSize = if (big) 11.sp else 9.sp, letterSpacing = 2.sp)
        }
    }
}

/** Staplar av LED-segment som tänds nedifrån. */
@Composable
private fun Led(v: List<Int>, m: Modifier, segs: Int = 10, on: Color = CK_CY) {
    val p = reveal(1200)
    Canvas(m) {
        if (v.isEmpty()) return@Canvas
        val mx = maxOf(1, v.max()).toFloat(); val bw = size.width / v.size; val sh = size.height / segs
        v.forEachIndexed { i, x ->
            val lit = (x / mx * segs * p).roundToInt()
            for (s in 0 until segs) {
                val top = s >= segs - 2
                drawRect(if (s < lit) (if (top) CK_AMB else on) else CK_DIM.copy(alpha = .35f), Offset(i * bw + bw * .15f, size.height - (s + 1) * sh + sh * .18f), Size(bw * .7f, sh * .64f))
            }
        }
    }
}

@Composable
private fun CkPanel(title: String, m: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(m.fillMaxWidth().background(CK_PANEL).border(1.dp, CK_DIM, RoundedCornerShape(4.dp)).padding(12.dp)) {
        Text("▸ $title", color = CK_CY, fontFamily = MONO, fontSize = 11.sp, letterSpacing = 2.sp)
        Spacer(Modifier.height(8.dp))
        content()
    }
}

@Composable
private fun CkButton(t: String, m: Modifier, onClick: () -> Unit) {
    val src = remember { MutableInteractionSource() }
    val pressed by src.collectIsPressedAsState()
    Box(m.height(44.dp).background(if (pressed) CK_CY else CK_PANEL).border(1.dp, CK_CY, RoundedCornerShape(3.dp)).clickable(src, null, onClick = onClick), contentAlignment = Alignment.Center) {
        Text("[ $t ]", color = if (pressed) CK_BG else CK_CY, fontFamily = MONO, fontSize = 12.sp, letterSpacing = 1.sp)
    }
}

@Composable
private fun CockpitHome(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CkPanel("URTAVLA", Modifier.weight(.9f)) {
                Box(Modifier.fillMaxWidth().aspectRatio(240f / 286f).border(1.dp, CK_DIM).padding(5.dp)) { DialImage(Modifier.fillMaxSize(), 14.dp) }
                Spacer(Modifier.height(6.dp))
                Text(s.dialName.ifEmpty { "—" }.uppercase(), color = CK_TXT, fontFamily = MONO, fontSize = 11.sp, maxLines = 1)
            }
            CkPanel("STEG / MÅL", Modifier.weight(1.1f)) {
                Gauge(frac(), "${pct()} %", num(s.steps), Modifier.fillMaxWidth().aspectRatio(1f), big = true)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CkPanel("PULS", Modifier.weight(1f)) { Gauge(if (s.pulse > 0) (s.pulse - 40) / 140f else 0f, "BPM", num(s.pulse), Modifier.fillMaxWidth().aspectRatio(1.3f), CK_AMB) }
            CkPanel("BATTERI", Modifier.weight(1f)) { Gauge(if (s.battery >= 0) s.battery / 100f else 0f, "%", num(s.battery), Modifier.fillMaxWidth().aspectRatio(1.3f)) }
        }
        CkPanel("STEG PER TIMME  06–23") { Led(s.hours.drop(6), Modifier.fillMaxWidth().height(90.dp)) }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            CkButton("HITTA", Modifier.weight(1f), a.find); CkButton("TID", Modifier.weight(1f), a.time)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            CkButton("URTAVLOR", Modifier.weight(1f), a.dials); CkButton("STIL", Modifier.weight(1f), a.stil)
        }
        Spacer(Modifier.height(12.dp))
    }
}

/** Pulskurva som ritas fram som på ett oscilloskop, på ett rutnät. */
@Composable
private fun Scope(v: List<Int>, m: Modifier, col: Color) {
    val p = reveal(1600)
    Canvas(m) {
        for (i in 1 until 8) drawLine(CK_DIM.copy(alpha = .4f), Offset(size.width * i / 8, 0f), Offset(size.width * i / 8, size.height), 1f)
        for (i in 1 until 4) drawLine(CK_DIM.copy(alpha = .4f), Offset(0f, size.height * i / 4), Offset(size.width, size.height * i / 4), 1f)
        if (v.size < 2) return@Canvas
        val lo = v.min().toFloat(); val hi = maxOf(v.max().toFloat(), lo + 1)
        val n = (v.size * p).toInt().coerceIn(2, v.size); val path = Path()
        for (i in 0 until n) { val x = i / (v.size - 1f) * size.width; val y = size.height - (v[i] - lo) / (hi - lo) * size.height * .8f - size.height * .1f; if (i == 0) path.moveTo(x, y) else path.lineTo(x, y) }
        drawPath(path, col.copy(alpha = .3f), style = Stroke(9f, cap = StrokeCap.Round, join = StrokeJoin.Round))
        drawPath(path, col, style = Stroke(3f, cap = StrokeCap.Round, join = StrokeJoin.Round))
    }
}

@Composable
private fun CockpitHealth(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CkPanel("STEG", Modifier.weight(1f)) { Gauge(frac(), "MÅL ${fmt(s.stepGoal)}", num(s.steps), Modifier.fillMaxWidth().aspectRatio(1f)) }
            CkPanel("PULS", Modifier.weight(1f)) { Gauge(if (s.pulse > 0) (s.pulse - 40) / 140f else 0f, "BPM", num(s.pulse), Modifier.fillMaxWidth().aspectRatio(1f), CK_AMB) }
        }
        CkPanel("STEG PER TIMME  00–23") { Led(s.hours, Modifier.fillMaxWidth().height(110.dp), 12) }
        CkPanel("PULS UNDER DAGEN") { Scope(s.pulseDay, Modifier.fillMaxWidth().height(110.dp), CK_AMB) }
        CkPanel("VECKAN") {
            Led(s.week.map { maxOf(0, it) }, Modifier.fillMaxWidth().height(100.dp), 14, CK_CY)
            Row(Modifier.fillMaxWidth()) { s.weekDays.forEach { Text(it.uppercase().take(3), Modifier.weight(1f), color = CK_TXT, fontFamily = MONO, fontSize = 10.sp, textAlign = TextAlign.Center) } }
        }
        CkButton("HÄMTA FRÅN KLOCKAN", Modifier.fillMaxWidth(), a.sync)
        Spacer(Modifier.height(12.dp))
    }
}

// =====================================================================
// TIDNING
// =====================================================================

@Composable
private fun TidningShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(TD_PAPER)) {
        Spacer(Modifier.height(10.dp))
        Text("Min Klocka", Modifier.fillMaxWidth(), color = TD_INK, fontFamily = SERIF, fontSize = 34.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)) {
            Text(clock("EEEE d MMMM").uppercase(), color = TD_GREY, fontFamily = SERIF, fontSize = 10.sp, letterSpacing = 1.5.sp, modifier = Modifier.weight(1f))
            Text(if (WatchState.ready) "KLOCKAN ANSLUTEN" else "EJ ANSLUTEN", color = if (WatchState.ready) TD_INK else TD_RED, fontFamily = SERIF, fontSize = 10.sp, letterSpacing = 1.5.sp)
        }
        Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(3.dp).background(TD_INK))
        Spacer(Modifier.height(2.dp))
        Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(1.dp).background(TD_INK))
        SlideTabs(tab, onTab, Modifier.fillMaxWidth().height(40.dp).padding(horizontal = 10.dp), SHORT,
            TextStyle(fontFamily = SERIF, fontSize = 14.sp, fontStyle = FontStyle.Italic), TD_INK, TD_GREY, TD_RED, false, line = 2.dp)
        Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(1.dp).background(TD_INK.copy(alpha = .3f)))
        Box(Modifier.weight(1f)) { body() }
    }
}

/** Siffror som rullar fram som på en gammal räkneverkstavla. */
@Composable
private fun Roll(value: Int, style: TextStyle, color: Color) {
    var shown by remember { mutableIntStateOf(0) }
    LaunchedEffect(value) { delay(200); shown = maxOf(0, value) }
    val txt = if (value < 0) "–" else fmt(shown)
    Row {
        txt.forEachIndexed { i, ch ->
            key(txt.length - i) {
                AnimatedContent(ch, transitionSpec = {
                    (slideInVertically(tween(420 + 60 * (txt.length - i), easing = FastOutSlowInEasing)) { it } + fadeIn()) togetherWith
                        (slideOutVertically(tween(300)) { -it } + fadeOut()) using SizeTransform(clip = true)
                }, label = "siffra") { c -> Text(c.toString(), style = style, color = color) }
            }
        }
    }
}

@Composable
private fun TdRule() = Box(Modifier.fillMaxWidth().padding(vertical = 10.dp).height(1.dp).background(TD_INK.copy(alpha = .35f)))

@Composable
private fun TdLink(t: String, onClick: () -> Unit) {
    Text(t, Modifier.clickable(onClick = onClick).padding(vertical = 6.dp), color = TD_RED, fontFamily = SERIF, fontSize = 16.sp, textDecoration = TextDecoration.Underline)
}

@Composable
private fun InkBars(v: List<Int>, m: Modifier) {
    val p = reveal(1100)
    Canvas(m) {
        val mx = maxOf(1, v.maxOrNull() ?: 1).toFloat(); val bw = size.width / v.size.coerceAtLeast(1)
        drawLine(TD_INK, Offset(0f, size.height), Offset(size.width, size.height), 1.5f)
        v.forEachIndexed { i, x -> val hh = x / mx * size.height * p; drawRect(if (x == v.max() && x > 0) TD_RED else TD_INK, Offset(i * bw + bw * .3f, size.height - hh), Size(bw * .4f, hh)) }
    }
}

@Composable
private fun TidningHome(a: Acts) {
    val s = WatchState
    val fade = reveal(700)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp).graphicsLayer { alpha = fade }) {
        Spacer(Modifier.height(14.dp))
        Text("DAGENS SIFFRA", color = TD_RED, fontFamily = SERIF, fontSize = 11.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
        Row(verticalAlignment = Alignment.Bottom) {
            Roll(s.steps, TextStyle(fontFamily = SERIF, fontSize = 64.sp, fontWeight = FontWeight.Black, lineHeight = 64.sp), TD_INK)
            Text(" steg", color = TD_INK, fontFamily = SERIF, fontSize = 26.sp, fontStyle = FontStyle.Italic, modifier = Modifier.padding(bottom = 10.dp))
        }
        Text(
            if (s.steps >= 0) "Det är ${pct()} procent av dagens mål på ${fmt(s.stepGoal)} steg." + (if (s.pulse > 0) " Pulsen låg senast på ${s.pulse} slag i minuten." else "")
            else "Inga siffror ännu. Öppna Hälsa och hämta från klockan.",
            color = TD_INK, fontFamily = SERIF, fontSize = 17.sp, lineHeight = 24.sp
        )
        TdRule()
        Row {
            Column(Modifier.weight(1f)) {
                Box(Modifier.fillMaxWidth().aspectRatio(240f / 286f).border(1.dp, TD_INK).padding(4.dp)) { DialImage(Modifier.fillMaxSize(), 0.dp) }
                Text("Urtavlan: ${s.dialName.ifEmpty { "–" }}", color = TD_GREY, fontFamily = SERIF, fontSize = 12.sp, fontStyle = FontStyle.Italic, modifier = Modifier.padding(top = 4.dp))
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text("I korthet", color = TD_INK, fontFamily = SERIF, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(6.dp))
                listOf("Batteri" to (if (s.battery >= 0) "${s.battery} %" else "–"), "Puls" to (if (s.pulse > 0) "${s.pulse}" else "–"), "Klockan" to (if (s.ready) "ansluten" else "söker")).forEach { (k, v) ->
                    Row(Modifier.fillMaxWidth().padding(vertical = 5.dp)) { Text(k, color = TD_GREY, fontFamily = SERIF, fontSize = 14.sp, modifier = Modifier.weight(1f)); Text(v, color = TD_INK, fontFamily = SERIF, fontSize = 14.sp, fontWeight = FontWeight.Bold) }
                    Box(Modifier.fillMaxWidth().height(1.dp).background(TD_INK.copy(alpha = .15f)))
                }
                Spacer(Modifier.height(8.dp))
                TdLink("Byt urtavla →", a.dials); TdLink("Hitta klockan →", a.find); TdLink("Ställ tiden →", a.time); TdLink("Byt stil →", a.stil)
            }
        }
        TdRule()
        Text("Timme för timme", color = TD_INK, fontFamily = SERIF, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Den röda stapeln är dagens mest aktiva timme.", color = TD_GREY, fontFamily = SERIF, fontSize = 13.sp, fontStyle = FontStyle.Italic)
        Spacer(Modifier.height(8.dp))
        InkBars(s.hours, Modifier.fillMaxWidth().height(90.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { listOf("00", "06", "12", "18", "24").forEach { Text(it, color = TD_GREY, fontFamily = SERIF, fontSize = 10.sp) } }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun TidningHealth(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
        Spacer(Modifier.height(14.dp))
        Text("HÄLSA", color = TD_RED, fontFamily = SERIF, fontSize = 11.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
        Text(if (s.steps >= s.stepGoal) "Målet är nått" else if (s.steps >= 0) "${fmt(maxOf(0, s.stepGoal - s.steps))} steg kvar till målet" else "Väntar på klockan",
            color = TD_INK, fontFamily = SERIF, fontSize = 32.sp, fontWeight = FontWeight.Black, lineHeight = 36.sp)
        TdLink("Hämta från klockan nu", a.sync)
        TdRule()
        Row {
            Column(Modifier.weight(1f)) { Text("Steg", color = TD_GREY, fontFamily = SERIF, fontSize = 13.sp); Roll(s.steps, TextStyle(fontFamily = SERIF, fontSize = 30.sp, fontWeight = FontWeight.Bold), TD_INK) }
            Box(Modifier.width(1.dp).height(56.dp).background(TD_INK.copy(alpha = .3f)))
            Column(Modifier.weight(1f).padding(start = 14.dp)) { Text("Puls", color = TD_GREY, fontFamily = SERIF, fontSize = 13.sp); Roll(s.pulse, TextStyle(fontFamily = SERIF, fontSize = 30.sp, fontWeight = FontWeight.Bold), TD_RED) }
        }
        TdRule()
        Text("Pulsen under dagen", color = TD_INK, fontFamily = SERIF, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spark(s.pulseDay, TD_RED, Modifier.fillMaxWidth().height(80.dp).padding(vertical = 8.dp))
        TdRule()
        Text("Steg timme för timme", color = TD_INK, fontFamily = SERIF, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        InkBars(s.hours, Modifier.fillMaxWidth().height(90.dp).padding(top = 8.dp))
        TdRule()
        Text("Veckan i siffror", color = TD_INK, fontFamily = SERIF, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(6.dp))
        val mx = maxOf(1, s.week.maxOrNull() ?: 1)
        val p = reveal(1000)
        s.week.forEachIndexed { i, v ->
            Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(s.weekDays.getOrElse(i) { "" }, Modifier.width(52.dp), color = TD_GREY, fontFamily = SERIF, fontSize = 14.sp)
                Box(Modifier.weight(1f).height(10.dp)) { Box(Modifier.fillMaxHeight().fillMaxWidth((maxOf(0, v) / mx.toFloat() * p).coerceIn(0f, 1f)).background(if (v >= s.stepGoal) TD_RED else TD_INK)) }
                Text(num(v), Modifier.width(70.dp), color = TD_INK, fontFamily = SERIF, fontSize = 14.sp, textAlign = TextAlign.End)
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

// =====================================================================
// BENTO
// =====================================================================

@Composable
private fun BentoShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(BT_BG)) {
        Box(Modifier.weight(1f)) { body() }
        SlideTabs(tab, onTab, Modifier.padding(horizontal = 16.dp, vertical = 10.dp).fillMaxWidth().height(58.dp).background(Color(0xFF1C2029), CircleShape),
            SHORT, TextStyle(fontSize = 12.sp, fontWeight = FontWeight.SemiBold), Color(0xFF14100C), Color(0xFF9AA0B4), BT_ORANGE, true)
    }
}

/** En ruta som hoppar fram och växer när man trycker på den. */
@Composable
private fun Tile(i: Int, color: Color, m: Modifier, onClick: (() -> Unit)? = null, more: (@Composable () -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(60L * i); on = true }
    val sc by animateFloatAsState(if (on) 1f else .82f, spring(dampingRatio = .55f, stiffness = 260f), label = "ruta")
    val al by animateFloatAsState(if (on) 1f else 0f, tween(260), label = "a")
    var open by remember { mutableStateOf(false) }
    Column(
        m.graphicsLayer { scaleX = sc; scaleY = sc; alpha = al }.clip(RoundedCornerShape(26.dp)).background(color)
            .clickable { if (more != null) open = !open else onClick?.invoke() }.animateContentSize(spring(dampingRatio = .8f, stiffness = 300f)).padding(16.dp)
    ) {
        content()
        if (open && more != null) { Spacer(Modifier.height(10.dp)); more() }
    }
}

@Composable
private fun BentoHome(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Idag", color = BT_TXT, fontSize = 30.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 4.dp, top = 4.dp))
        Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Tile(0, BT_CARD, Modifier.weight(1.1f).fillMaxHeight(), a.dials) {
                DialImage(Modifier.fillMaxWidth().aspectRatio(240f / 286f), 22.dp)
                Spacer(Modifier.height(8.dp))
                Text(s.dialName.ifEmpty { "Urtavla" }, color = BT_TXT, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                Text("Tryck för att byta", color = Color(0xFF8C92A4), fontSize = 12.sp)
            }
            Column(Modifier.weight(.9f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Tile(1, BT_ORANGE, Modifier.fillMaxWidth().weight(1f)) {
                    Text("Batteri", color = Color(0xFF2A1406), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.weight(1f))
                    Text(if (s.battery >= 0) "${s.battery}%" else "–", color = Color(0xFF2A1406), fontSize = 40.sp, fontWeight = FontWeight.Black)
                    val f = animateFloatAsState(if (s.battery >= 0) s.battery / 100f else 0f, tween(1200), label = "b").value
                    Box(Modifier.fillMaxWidth().height(8.dp).clip(CircleShape).background(Color(0x33000000))) { Box(Modifier.fillMaxHeight().fillMaxWidth(f).background(Color(0xFF2A1406))) }
                }
                Tile(2, BT_LILAC, Modifier.fillMaxWidth().weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) { BeatingHeart(Color(0xFF1B1240)); Spacer(Modifier.width(6.dp)); Text("Puls", color = Color(0xFF1B1240), fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                    Spacer(Modifier.weight(1f))
                    Text(num(s.pulse), color = Color(0xFF1B1240), fontSize = 40.sp, fontWeight = FontWeight.Black)
                }
            }
        }
        Tile(3, BT_GREEN, Modifier.fillMaxWidth(), more = {
            Text("Steg per timme", color = Color(0xCCFFFFFF), fontSize = 12.sp)
            Bars(s.hours.drop(6), Color.White, Modifier.fillMaxWidth().height(70.dp))
        }) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Steg idag", color = Color(0xCCFFFFFF), fontSize = 13.sp)
                    CountText(s.steps, 40.sp, Color.White)
                    Text("${pct()} % av ${fmt(s.stepGoal)}  ·  tryck för mer", color = Color(0xCCFFFFFF), fontSize = 12.sp)
                }
                StepRing(frac(), 76.dp)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf(Triple("Hitta", a.find, 0), Triple("Tiden", a.time, 1), Triple("Stil", a.stil, 2)).forEach { (t, f, k) ->
                Tile(4 + k, BT_CARD, Modifier.weight(1f).aspectRatio(1f), f) {
                    TabIcon(if (k == 0) 0 else if (k == 1) 3 else 2, false, BT_ORANGE, 26.dp)
                    Spacer(Modifier.weight(1f))
                    Text(t, color = BT_TXT, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun BentoHealth(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", color = BT_TXT, fontSize = 30.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f).padding(start = 4.dp))
            Box(Modifier.clip(CircleShape).background(BT_ORANGE).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 10.dp)) { Text("Hämta", color = Color(0xFF2A1406), fontWeight = FontWeight.Bold) }
        }
        Tile(0, BT_GREEN, Modifier.fillMaxWidth(), more = { Text("Målet räknas ut från din ålder i profilen. 7 000–8 000 steg om dagen räcker långt för hälsan.", color = Color(0xDDFFFFFF), fontSize = 13.sp) }) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                StepRing(frac(), 110.dp); Spacer(Modifier.width(16.dp))
                Column { Text("Steg idag", color = Color(0xCCFFFFFF), fontSize = 13.sp); CountText(s.steps, 38.sp, Color.White); Text("Mål ${fmt(s.stepGoal)}", color = Color(0xCCFFFFFF), fontSize = 12.sp) }
            }
        }
        Tile(1, BT_CARD, Modifier.fillMaxWidth(), more = { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { listOf("00", "06", "12", "18", "24").forEach { Text(it, color = Color(0xFF8C92A4), fontSize = 10.sp) } } }) {
            Text("Steg per timme", color = BT_TXT, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp)); Bars(s.hours, BT_ORANGE, Modifier.fillMaxWidth().height(100.dp))
        }
        Tile(2, BT_LILAC, Modifier.fillMaxWidth(), more = { Text("Vilopuls brukar ligga mellan 60 och 100 slag i minuten.", color = Color(0xFF1B1240), fontSize = 13.sp) }) {
            Row(verticalAlignment = Alignment.CenterVertically) { BeatingHeart(Color(0xFF1B1240)); Spacer(Modifier.width(8.dp)); Text("Puls  ${num(s.pulse)}", color = Color(0xFF1B1240), fontSize = 15.sp, fontWeight = FontWeight.Bold) }
            Spark(s.pulseDay, Color(0xFF1B1240), Modifier.fillMaxWidth().height(70.dp).padding(top = 8.dp))
        }
        Tile(3, BT_CARD, Modifier.fillMaxWidth()) {
            Text("Veckan", color = BT_TXT, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp)); Bars(s.week.map { maxOf(0, it) }, BT_GREEN, Modifier.fillMaxWidth().height(90.dp))
            Row(Modifier.fillMaxWidth()) { s.weekDays.forEach { Text(it, Modifier.weight(1f), color = Color(0xFF8C92A4), fontSize = 10.sp, textAlign = TextAlign.Center) } }
        }
        Spacer(Modifier.height(8.dp))
    }
}

// =====================================================================
// BRUTAL
// =====================================================================

@Composable
private fun BrutalShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    val s = WatchState
    Column(Modifier.fillMaxSize().background(BR_YEL)) {
        Marquee("${if (s.ready) "ANSLUTEN" else "SÖKER KLOCKAN"}  ★  ${num(s.steps)} STEG  ★  PULS ${num(s.pulse)}  ★  BATTERI ${num(s.battery)} %  ★  ${s.dialName.uppercase()}  ★  ")
        Row(Modifier.weight(1f)) {
            Column(Modifier.width(78.dp).fillMaxHeight().background(Color.Black).padding(vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                SHORT.forEachIndexed { i, l ->
                    val on = i == tab
                    val dx by animateDpAsState(if (on) 8.dp else 0.dp, spring(dampingRatio = .45f, stiffness = 500f), label = "ut")
                    Column(
                        Modifier.offset(x = dx).size(62.dp).background(if (on) BR_PINK else Color.White).border(3.dp, Color.Black).clickable(noClick(), null) { onTab(i) },
                        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center
                    ) {
                        TabIcon(i, on, Color.Black, 22.dp)
                        Text(l.uppercase(), color = Color.Black, fontSize = 8.sp, fontWeight = FontWeight.Black, maxLines = 1)
                    }
                }
            }
            Box(Modifier.weight(1f)) { body() }
        }
    }
}

@Composable
private fun Marquee(text: String) {
    var w by remember { mutableIntStateOf(1) }
    val x by rememberInfiniteTransition(label = "rad").animateFloat(0f, 1f, infiniteRepeatable(tween(14000, easing = LinearEasing)), label = "x")
    Box(Modifier.fillMaxWidth().height(32.dp).background(Color.Black).clipToBounds(), contentAlignment = Alignment.CenterStart) {
        Row(Modifier.wrapContentWidth(Alignment.Start, unbounded = true).graphicsLayer { translationX = -x * w }) {
            Text(text, color = BR_YEL, fontWeight = FontWeight.Black, fontSize = 14.sp, maxLines = 1, softWrap = false, modifier = Modifier.onSizeChanged { w = it.width })
            Text(text, color = BR_YEL, fontWeight = FontWeight.Black, fontSize = 14.sp, maxLines = 1, softWrap = false)
            Text(text, color = BR_YEL, fontWeight = FontWeight.Black, fontSize = 14.sp, maxLines = 1, softWrap = false)
        }
    }
}

/** Block med hård skugga som trycks ner på skuggan när man rör det. */
@Composable
private fun Block(i: Int, color: Color, m: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    val src = remember { MutableInteractionSource() }
    val pressed by src.collectIsPressedAsState()
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(70L * i); on = true }
    val slide by animateFloatAsState(if (on) 0f else 1f, spring(dampingRatio = .5f, stiffness = 320f), label = "in")
    val sh by animateDpAsState(if (pressed) 0.dp else 7.dp, spring(stiffness = 900f), label = "skugga")
    Box(m.graphicsLayer { translationX = slide * 500f * (if (i % 2 == 0) 1 else -1) }.padding(end = 7.dp, bottom = 7.dp)) {
        Box(Modifier.matchParentSize().offset(7.dp, 7.dp).background(Color.Black))
        Column(
            Modifier.fillMaxWidth().offset(7.dp - sh, 7.dp - sh).background(color).border(3.dp, Color.Black)
                .then(if (onClick != null) Modifier.clickable(src, null, onClick = onClick) else Modifier).padding(14.dp), content = content
        )
    }
}

@Composable
private fun BrLabel(t: String) = Text(t, color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)

@Composable
private fun BrutalHome(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Roll(s.steps, TextStyle(fontSize = 62.sp, fontWeight = FontWeight.Black, lineHeight = 62.sp, letterSpacing = (-2).sp), Color.Black)
        Text("STEG IDAG", color = Color.Black, fontSize = 18.sp, fontWeight = FontWeight.Black)
        val f = animateFloatAsState(frac().coerceIn(0f, 1f), tween(1300, easing = FastOutSlowInEasing), label = "mål").value
        Box(Modifier.fillMaxWidth().height(26.dp).background(Color.White).border(3.dp, Color.Black)) {
            Box(Modifier.fillMaxHeight().fillMaxWidth(f).background(BR_PINK).border(3.dp, Color.Black))
            Text("${pct()} % AV ${fmt(s.stepGoal)}", Modifier.align(Alignment.Center), color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Black)
        }
        Spacer(Modifier.height(4.dp))
        Block(0, BR_BLUE, Modifier.fillMaxWidth(), a.dials) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                DialImage(Modifier.width(96.dp).aspectRatio(240f / 286f).border(3.dp, Color.Black), 0.dp)
                Spacer(Modifier.width(12.dp))
                Column { BrLabel("URTAVLA"); Text(s.dialName.ifEmpty { "–" }.uppercase(), color = Color.Black, fontSize = 20.sp, fontWeight = FontWeight.Black); Text("TRYCK = BYT", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
            }
        }
        Row {
            Block(1, BR_GREEN, Modifier.weight(1f)) { BrLabel("PULS"); Text(num(s.pulse), color = Color.Black, fontSize = 40.sp, fontWeight = FontWeight.Black) }
            Block(2, BR_PINK, Modifier.weight(1f)) { BrLabel("BATTERI"); Text(if (s.battery >= 0) "${s.battery}%" else "–", color = Color.Black, fontSize = 40.sp, fontWeight = FontWeight.Black) }
        }
        Block(3, Color.White, Modifier.fillMaxWidth()) { BrLabel("STEG PER TIMME"); Spacer(Modifier.height(6.dp)); BrBars(s.hours.drop(6), Modifier.fillMaxWidth().height(80.dp)) }
        Row {
            Block(4, Color.White, Modifier.weight(1f), a.find) { BrLabel("HITTA") }
            Block(5, Color.White, Modifier.weight(1f), a.time) { BrLabel("TIDEN") }
            Block(6, Color.Black, Modifier.weight(1f), a.stil) { Text("STIL", color = BR_YEL, fontSize = 12.sp, fontWeight = FontWeight.Black) }
        }
        Spacer(Modifier.height(10.dp))
    }
}

@Composable
private fun BrBars(v: List<Int>, m: Modifier, col: Color = BR_PINK) {
    val p = reveal(900)
    Canvas(m) {
        if (v.isEmpty()) return@Canvas
        val mx = maxOf(1, v.max()).toFloat(); val bw = size.width / v.size
        v.forEachIndexed { i, x ->
            val hh = maxOf(4f, x / mx * size.height * p)
            drawRect(col, Offset(i * bw + 2f, size.height - hh), Size(bw - 4f, hh))
            drawRect(Color.Black, Offset(i * bw + 2f, size.height - hh), Size(bw - 4f, hh), style = Stroke(4f))
        }
    }
}

@Composable
private fun BrutalHealth(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("HÄLSA", color = Color.Black, fontSize = 48.sp, fontWeight = FontWeight.Black, letterSpacing = (-2).sp)
        Block(0, BR_PINK, Modifier.fillMaxWidth(), a.sync) { BrLabel("TRYCK = HÄMTA FRÅN KLOCKAN") }
        Row {
            Block(1, BR_GREEN, Modifier.weight(1f)) { BrLabel("STEG"); Roll(s.steps, TextStyle(fontSize = 30.sp, fontWeight = FontWeight.Black), Color.Black) }
            Block(2, BR_BLUE, Modifier.weight(1f)) { BrLabel("PULS"); Roll(s.pulse, TextStyle(fontSize = 30.sp, fontWeight = FontWeight.Black), Color.Black) }
        }
        Block(3, Color.White, Modifier.fillMaxWidth()) { BrLabel("STEG PER TIMME"); Spacer(Modifier.height(6.dp)); BrBars(s.hours, Modifier.fillMaxWidth().height(100.dp)) }
        Block(4, Color.White, Modifier.fillMaxWidth()) { BrLabel("PULS UNDER DAGEN"); Spark(s.pulseDay, Color.Black, Modifier.fillMaxWidth().height(80.dp).padding(top = 6.dp)) }
        Block(5, Color.White, Modifier.fillMaxWidth()) {
            BrLabel("VECKAN"); Spacer(Modifier.height(6.dp)); BrBars(s.week.map { maxOf(0, it) }, Modifier.fillMaxWidth().height(90.dp), BR_BLUE)
            Row(Modifier.fillMaxWidth()) { s.weekDays.forEach { Text(it.uppercase(), Modifier.weight(1f), color = Color.Black, fontSize = 10.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center) } }
        }
        Spacer(Modifier.height(10.dp))
    }
}

// =====================================================================
// NORRSKEN
// =====================================================================

@Composable
private fun NorrskenShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize()) {
        Aurora()
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.weight(1f)) { body() }
            Row(
                Modifier.align(Alignment.CenterHorizontally).padding(12.dp).clip(RoundedCornerShape(30.dp)).background(Color.White.copy(alpha = .10f))
                    .border(1.dp, Color.White.copy(alpha = .18f), RoundedCornerShape(30.dp)).padding(horizontal = 8.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                SHORT.forEachIndexed { i, l ->
                    val on = i == tab
                    val sc by animateFloatAsState(if (on) 1.25f else 1f, spring(dampingRatio = .5f, stiffness = 400f), label = "dock")
                    Row(
                        Modifier.clip(CircleShape).background(if (on) Color.White.copy(alpha = .16f) else Color.Transparent).clickable(noClick(), null) { onTab(i) }
                            .animateContentSize(spring(dampingRatio = .75f, stiffness = 380f)).padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(Modifier.graphicsLayer { scaleX = sc; scaleY = sc }) { TabIcon(i, on, if (on) NS_TEAL else Color.White.copy(alpha = .7f), 20.dp) }
                        if (on) { Spacer(Modifier.width(8.dp)); Text(l, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                    }
                }
            }
        }
    }
}

/** Norrsken som sakta driver fram och tillbaka. */
@Composable
private fun Aurora() {
    val t = rememberInfiniteTransition(label = "norrsken")
    val a by t.animateFloat(0f, 1f, infiniteRepeatable(tween(14000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "a")
    val b by t.animateFloat(0f, 1f, infiniteRepeatable(tween(19000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "b")
    Canvas(Modifier.fillMaxSize()) {
        drawRect(NS_BG)
        fun blob(c: Color, o: Offset, r: Float) = drawCircle(Brush.radialGradient(listOf(c.copy(alpha = .42f), Color.Transparent), o, r), r, o)
        blob(NS_TEAL, Offset(size.width * (.1f + .7f * a), size.height * (.12f + .08f * b)), size.width * .85f)
        blob(NS_VIO, Offset(size.width * (.95f - .6f * b), size.height * (.45f + .1f * a)), size.width * .95f)
        blob(NS_BLUE, Offset(size.width * (.25f + .4f * b), size.height * .9f), size.width * .75f)
    }
}

@Composable
private fun Glass(m: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(m.clip(RoundedCornerShape(26.dp)).background(Color.White.copy(alpha = .09f)).border(1.dp, Color.White.copy(alpha = .16f), RoundedCornerShape(26.dp)).padding(16.dp), content = content)
}

/** Ett litet glasmärke som guppar upp och ner i egen takt. */
@Composable
private fun Bob(phase: Int, m: Modifier = Modifier, content: @Composable () -> Unit) {
    val y by rememberInfiniteTransition(label = "gupp").animateFloat(-5f, 5f, infiniteRepeatable(tween(2600 + phase * 500, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "y")
    Box(m.graphicsLayer { translationY = y * density }) { content() }
}

@Composable
private fun NorrskenHome(a: Acts) {
    val s = WatchState
    val glow by rememberInfiniteTransition(label = "sken").animateFloat(.35f, .85f, infiniteRepeatable(tween(3000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "g")
    val enter = reveal(900)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(clock("HH:mm"), color = Color.White, fontSize = 52.sp, fontWeight = FontWeight.Light, letterSpacing = 2.sp)
        Text(if (s.ready) "Klockan är ansluten" else "Söker klockan …", color = Color.White.copy(alpha = .7f), fontSize = 14.sp)
        Spacer(Modifier.height(18.dp))
        Box(Modifier.graphicsLayer { scaleX = .85f + .15f * enter; scaleY = .85f + .15f * enter; alpha = enter }.clickable(onClick = a.dials), contentAlignment = Alignment.Center) {
            Canvas(Modifier.size(250.dp, 290.dp)) { drawRoundRect(Brush.radialGradient(listOf(NS_TEAL.copy(alpha = glow * .55f), Color.Transparent)), cornerRadius = CornerRadius(90f)) }
            DialImage(Modifier.size(200.dp, 238.dp).border(2.dp, Color.White.copy(alpha = .25f), RoundedCornerShape(52.dp)), 52.dp)
        }
        Text(s.dialName.ifEmpty { "Urtavla" }, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 10.dp))
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf(Triple("Steg", num(s.steps), NS_TEAL), Triple("Puls", num(s.pulse), Color(0xFFFF6B9A)), Triple("Batteri", if (s.battery >= 0) "${s.battery}%" else "–", NS_BLUE)).forEachIndexed { i, (k, v, c) ->
                Bob(i, Modifier.weight(1f)) {
                    Glass(Modifier.fillMaxWidth()) {
                        Box(Modifier.size(8.dp).background(c, CircleShape)); Spacer(Modifier.height(6.dp))
                        Text(v, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                        Text(k, color = Color.White.copy(alpha = .65f), fontSize = 12.sp)
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Glass(Modifier.fillMaxWidth()) {
            Text("Steg under dagen", color = Color.White.copy(alpha = .8f), fontSize = 13.sp)
            GlowLine(s.hours.runningFold(0) { x, y -> x + y }.drop(1), NS_TEAL, Modifier.fillMaxWidth().height(80.dp).padding(top = 8.dp))
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf("Hitta" to a.find, "Ställ tiden" to a.time, "Stil" to a.stil).forEach { (t, f) ->
                Box(Modifier.weight(1f).clip(CircleShape).background(Color.White.copy(alpha = .12f)).border(1.dp, Color.White.copy(alpha = .2f), CircleShape).clickable(onClick = f).padding(vertical = 12.dp), contentAlignment = Alignment.Center) {
                    Text(t, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
        Spacer(Modifier.height(16.dp))
    }
}

/** Linje som lyser och ritas fram. */
@Composable
private fun GlowLine(v: List<Int>, c: Color, m: Modifier) {
    val p = reveal(1600)
    Canvas(m) {
        if (v.size < 2 || v.max() == v.min()) { drawLine(c.copy(alpha = .3f), Offset(0f, size.height * .8f), Offset(size.width, size.height * .8f), 3f); return@Canvas }
        val lo = v.min().toFloat(); val hi = v.max().toFloat()
        val n = (v.size * p).toInt().coerceIn(2, v.size); val path = Path(); val fill = Path()
        for (i in 0 until n) { val x = i / (v.size - 1f) * size.width; val y = size.height - (v[i] - lo) / (hi - lo) * size.height * .9f - 2f
            if (i == 0) { path.moveTo(x, y); fill.moveTo(x, size.height); fill.lineTo(x, y) } else { path.lineTo(x, y); fill.lineTo(x, y) }
            if (i == n - 1) { fill.lineTo(x, size.height); fill.close() } }
        drawPath(fill, Brush.verticalGradient(listOf(c.copy(alpha = .35f), Color.Transparent)))
        drawPath(path, c.copy(alpha = .35f), style = Stroke(12f, cap = StrokeCap.Round, join = StrokeJoin.Round))
        drawPath(path, c, style = Stroke(4f, cap = StrokeCap.Round, join = StrokeJoin.Round))
    }
}

@Composable
private fun NorrskenHealth(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
            Box(Modifier.clip(CircleShape).background(Color.White.copy(alpha = .14f)).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 10.dp)) { Text("Hämta", color = Color.White) }
        }
        Glass(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(contentAlignment = Alignment.Center) {
                    val f = animateFloatAsState(frac().coerceIn(0f, 1f), tween(1500, easing = FastOutSlowInEasing), label = "båge").value
                    Canvas(Modifier.size(120.dp)) {
                        val st = 14f
                        drawArc(Color.White.copy(alpha = .12f), 135f, 270f, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round))
                        drawArc(NS_TEAL.copy(alpha = .35f), 135f, 270f * f, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st * 2.2f, cap = StrokeCap.Round))
                        drawArc(Brush.sweepGradient(listOf(NS_BLUE, NS_TEAL, NS_VIO, NS_BLUE)), 135f, 270f * f, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round))
                    }
                    Text("${pct()}%", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
                }
                Spacer(Modifier.width(16.dp))
                Column { Text("Steg idag", color = Color.White.copy(alpha = .7f), fontSize = 13.sp); Text(num(s.steps), color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.Light); Text("Mål ${fmt(s.stepGoal)}", color = Color.White.copy(alpha = .6f), fontSize = 12.sp) }
            }
        }
        Glass(Modifier.fillMaxWidth()) { Text("Puls  ${num(s.pulse)}", color = Color.White, fontSize = 15.sp); GlowLine(s.pulseDay, Color(0xFFFF6B9A), Modifier.fillMaxWidth().height(90.dp).padding(top = 8.dp)) }
        Glass(Modifier.fillMaxWidth()) { Text("Steg per timme", color = Color.White, fontSize = 15.sp); Spacer(Modifier.height(8.dp)); Bars(s.hours, NS_TEAL, Modifier.fillMaxWidth().height(90.dp)) }
        Glass(Modifier.fillMaxWidth()) {
            Text("Veckan", color = Color.White, fontSize = 15.sp); Spacer(Modifier.height(8.dp)); Bars(s.week.map { maxOf(0, it) }, NS_VIO, Modifier.fillMaxWidth().height(80.dp))
            Row(Modifier.fillMaxWidth()) { s.weekDays.forEach { Text(it, Modifier.weight(1f), color = Color.White.copy(alpha = .6f), fontSize = 10.sp, textAlign = TextAlign.Center) } }
        }
        Spacer(Modifier.height(8.dp))
    }
}

// =====================================================================
// PRICKMATRIS
// =====================================================================

private val DM = mapOf(
    '0' to "01110100011001110101110011000101110", '1' to "00100011000010000100001000010001110", '2' to "01110100010000100010001000100011111",
    '3' to "11111000100010000010000011000101110", '4' to "00010001100101010010111110001000010", '5' to "11111100001111000001000011000101110",
    '6' to "00110010001000011110100011000101110", '7' to "11111000010001000100010000100001000", '8' to "01110100011000101110100011000101110",
    '9' to "01110100011000101111000010001001100", '-' to "00000000000000011111000000000000000", ':' to "00000011000110000000011000110000000",
    '%' to "11000110010001000100010000100110011", ' ' to "00000000000000000000000000000000000"
)

/** Text av prickar som tänds i slumpad ordning varje gång värdet ändras. */
@Composable
private fun DotText(text: String, dot: Dp, on: Color = PR_RED, off: Color = PR_OFF) {
    val anim = remember(text) { Animatable(0f) }
    LaunchedEffect(text) { anim.animateTo(1f, tween(900, easing = LinearEasing)) }
    val cols = maxOf(1, text.length * 6 - 1)
    Canvas(Modifier.size(dot * cols, dot * 7)) {
        val d = size.height / 7
        text.forEachIndexed { ci, ch ->
            val g = DM[ch] ?: DM[' ']!!
            for (r in 0 until 7) for (c in 0 until 5) {
                val lit = g[r * 5 + c] == '1'
                val seed = (((ci * 35 + r * 5 + c) * 2654435761L) % 1000) / 1000f
                drawCircle(if (lit && seed < anim.value) on else off, d * .4f, Offset(d * (ci * 6 + c + .5f), d * (r + .5f)))
            }
        }
    }
}

/** Stapeldiagram av prickar. */
@Composable
private fun DotBars(v: List<Int>, m: Modifier, rows: Int = 10, on: Color = PR_RED) {
    val p = reveal(1200)
    Canvas(m) {
        if (v.isEmpty()) return@Canvas
        val mx = maxOf(1, v.max()).toFloat(); val cw = size.width / v.size; val rh = size.height / rows; val r = minOf(cw, rh) * .36f
        v.forEachIndexed { i, x ->
            val lit = (x / mx * rows * p).roundToInt()
            for (k in 0 until rows) drawCircle(if (k < lit) on else PR_OFF, r, Offset(cw * (i + .5f), size.height - rh * (k + .5f)))
        }
    }
}

@Composable
private fun PrickShell(tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(Color.Black)) {
        Box(Modifier.weight(1f)) { body() }
        Row(Modifier.fillMaxWidth().padding(vertical = 10.dp)) {
            SHORT.forEachIndexed { i, l ->
                val on = i == tab
                val sz by animateDpAsState(if (on) 10.dp else 5.dp, spring(dampingRatio = .4f, stiffness = 500f), label = "prick")
                Column(Modifier.weight(1f).clickable(noClick(), null) { onTab(i) }.padding(vertical = 6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.height(12.dp), contentAlignment = Alignment.Center) { Box(Modifier.size(sz).background(if (on) PR_RED else Color(0xFF3A3A3A), CircleShape)) }
                    Spacer(Modifier.height(4.dp))
                    Text(l.uppercase(), color = if (on) PR_TXT else Color(0xFF6A6A6A), fontFamily = MONO, fontSize = 10.sp, letterSpacing = 1.sp)
                }
            }
        }
    }
}

@Composable
private fun PrLabel(t: String) = Text(t, color = Color(0xFF8A8A8A), fontFamily = MONO, fontSize = 11.sp, letterSpacing = 3.sp)

@Composable
private fun PrickHome(a: Acts) {
    val s = WatchState
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp)) {
        DotText(clock("HH:mm").ifEmpty { "--:--" }, 9.dp, PR_TXT)
        Spacer(Modifier.height(18.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            DialImage(Modifier.width(110.dp).aspectRatio(240f / 286f).clickable(onClick = a.dials), 26.dp)
            Spacer(Modifier.width(16.dp))
            Column {
                PrLabel("STEG"); Spacer(Modifier.height(6.dp)); DotText(if (s.steps >= 0) s.steps.toString() else "-", 5.dp)
                Spacer(Modifier.height(12.dp))
                PrLabel("PULS"); Spacer(Modifier.height(6.dp)); DotText(if (s.pulse > 0) s.pulse.toString() else "-", 5.dp, PR_TXT)
            }
        }
        Spacer(Modifier.height(18.dp))
        PrLabel("BATTERI")
        Spacer(Modifier.height(6.dp))
        val lit = if (s.battery >= 0) (s.battery / 5f).roundToInt() else 0
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) { repeat(20) { i -> Box(Modifier.size(10.dp).background(if (i < lit) (if (s.battery < 20) PR_RED else PR_TXT) else PR_OFF, CircleShape)) } }
        Spacer(Modifier.height(18.dp))
        PrLabel("STEG PER TIMME")
        Spacer(Modifier.height(8.dp))
        DotBars(s.hours.drop(6), Modifier.fillMaxWidth().height(100.dp))
        Spacer(Modifier.height(18.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("HITTA" to a.find, "TID" to a.time, "TAVLOR" to a.dials, "STIL" to a.stil).forEach { (t, f) ->
                Box(Modifier.weight(1f).border(1.dp, Color(0xFF3A3A3A), RoundedCornerShape(8.dp)).clickable(onClick = f).padding(vertical = 12.dp), contentAlignment = Alignment.Center) {
                    Text(t, color = PR_TXT, fontFamily = MONO, fontSize = 11.sp, letterSpacing = 1.sp)
                }
            }
        }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun PrickHealth(a: Acts) {
    val s = WatchState
    val pages = rememberPagerState { 4 }
    Column(Modifier.fillMaxSize().padding(top = 16.dp)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
            PrLabel("HÄLSA  ${pages.currentPage + 1}/4")
            Spacer(Modifier.weight(1f))
            Text("HÄMTA", Modifier.border(1.dp, PR_RED, RoundedCornerShape(6.dp)).clickable(onClick = a.sync).padding(horizontal = 12.dp, vertical = 6.dp), color = PR_RED, fontFamily = MONO, fontSize = 11.sp)
        }
        HorizontalPager(pages, Modifier.weight(1f).fillMaxWidth()) { p ->
            Column(Modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.Center) {
                when (p) {
                    0 -> { PrLabel("STEG IDAG"); Spacer(Modifier.height(12.dp)); DotText(if (s.steps >= 0) s.steps.toString() else "-", 9.dp); Spacer(Modifier.height(16.dp)); PrLabel("${pct()}% AV MÅLET ${s.stepGoal}")
                        Spacer(Modifier.height(10.dp)); val lit = (frac().coerceIn(0f, 1f) * 20).roundToInt()
                        Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) { repeat(20) { i -> Box(Modifier.size(11.dp).background(if (i < lit) PR_RED else PR_OFF, CircleShape)) } } }
                    1 -> { PrLabel("PULS"); Spacer(Modifier.height(12.dp)); DotText(if (s.pulse > 0) s.pulse.toString() else "-", 12.dp, PR_TXT); Spacer(Modifier.height(20.dp)); PrLabel("UNDER DAGEN"); Spacer(Modifier.height(8.dp))
                        DotBars(s.pulseDay.takeLast(24), Modifier.fillMaxWidth().height(120.dp), 12, PR_TXT) }
                    2 -> { PrLabel("STEG PER TIMME"); Spacer(Modifier.height(12.dp)); DotBars(s.hours, Modifier.fillMaxWidth().height(220.dp), 16)
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { listOf("00", "06", "12", "18", "23").forEach { Text(it, color = Color(0xFF6A6A6A), fontFamily = MONO, fontSize = 10.sp) } } }
                    else -> { PrLabel("VECKAN"); Spacer(Modifier.height(12.dp)); DotBars(s.week.map { maxOf(0, it) }, Modifier.fillMaxWidth().height(220.dp), 16)
                        Row(Modifier.fillMaxWidth()) { s.weekDays.forEach { Text(it.uppercase().take(3), Modifier.weight(1f), color = Color(0xFF6A6A6A), fontFamily = MONO, fontSize = 10.sp, textAlign = TextAlign.Center) } } }
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(bottom = 8.dp), horizontalArrangement = Arrangement.Center) {
            repeat(4) { i -> val on = pages.currentPage == i; Box(Modifier.padding(4.dp).size(if (on) 9.dp else 6.dp).background(if (on) PR_RED else Color(0xFF3A3A3A), CircleShape)) }
        }
    }
}
