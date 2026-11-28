@file:OptIn(ExperimentalMaterial3Api::class)

package se.minklocka.app

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

/*
 * De sex stilarna som behölls. Klocka och Hälsa ryms på en skärm utan att skrolla.
 * Varje stil har egen meny, egen förhandsvisning av klockan och eget sätt att rita data,
 * men alla säger samma enkla saker: hur det går, med ett ord ett barn förstår.
 */

val SEX = listOf(Stil.MATERIAL, Stil.COCKPIT, Stil.NORRSKEN, Stil.LCD, Stil.KLADD, Stil.RADAR)

private val D = WatchState
private fun sf() = if (D.steps >= 0) (D.steps / D.stepGoal.toFloat()).coerceIn(0f, 1f) else 0f
private fun sp() = if (D.steps >= 0) D.steps * 100 / D.stepGoal.coerceAtLeast(1) else 0
private fun nr(v: Int) = if (v < 0) "–" else fmt(v)
private fun left() = maxOf(0, D.stepGoal - maxOf(0, D.steps))

/** Ett ord om hur det går, som ett barn förstår. */
fun stepWord() = when { D.steps < 0 -> "Inte hämtat"; sp() >= 100 -> "Målet klart!"; sp() >= 50 -> "Över halvvägs"; else -> "Kom igen!" }
fun pulseWord() = when { D.pulse <= 0 -> "Inte mätt"; D.pulse < 50 -> "Låg"; D.pulse <= 100 -> "Lugn"; D.pulse <= 130 -> "Hög"; else -> "Mycket hög" }
fun battWord() = when { D.battery < 0 -> "–"; D.battery >= 80 -> "Fullt"; D.battery >= 50 -> "Bra"; D.battery >= 20 -> "Okej"; else -> "Ladda!" }
private fun pulseF() = if (D.pulse > 0) ((D.pulse - 40) / 140f).coerceIn(0f, 1f) else 0f
private fun battF() = if (D.battery >= 0) D.battery / 100f else 0f
private fun topHour() = D.hours.indices.maxByOrNull { D.hours[it] }?.takeIf { D.hours[it] > 0 }
private fun plo() = D.pulseDay.filter { it > 0 }.minOrNull() ?: -1
private fun phi() = D.pulseDay.maxOrNull() ?: -1
private fun hits() = D.week.count { it >= D.stepGoal }

/** Meningen överst i varje Hälsa-läge. */
fun healthLine(mode: Int) = when (mode) {
    0 -> topHour()?.let { "Du rörde dig mest klockan %02d. ".format(it) + (if (sp() >= 100) "Målet är klart!" else "${fmt(left())} steg kvar till målet.") } ?: "Inga steg ännu i dag."
    1 -> if (plo() > 0) "Pulsen var mellan ${plo()} och ${phi()} i dag. ${if (phi() <= 100) "Lugnt och fint!" else "Den gick upp när du rörde dig."}" else "Ingen puls mätt ännu. Mät på klockan."
    else -> "Du nådde målet ${hits()} av 7 dagar. ${if (hits() >= 5) "Superbra vecka!" else "Försök nå 5 dagar."}"
}

private val MODES = listOf("Idag", "Puls", "Veckan")

@Composable
private fun grow6(t: Float, ms: Int = 1100): Float {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { on = true }
    return animateFloatAsState(if (on) t else 0f, tween(ms, easing = FastOutSlowInEasing), label = "g6").value
}

@Composable
private fun DialImg(m: Modifier) = Box(m.background(Color.Black)) { D.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) } }

/** Klockans form med armband, i valfri färg. Används som förhandsvisning. */
@Composable
private fun WatchBody(m: Modifier, case: Color, strap: Color, corner: Dp = 34.dp) {
    BoxWithConstraints(m, contentAlignment = Alignment.Center) {
        val w = minOf(maxWidth, maxHeight * (240f / 286f) * .82f)
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(Modifier.width(w * .62f).height(w * .16f).clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)).background(strap))
            Box(Modifier.width(w).aspectRatio(240f / 286f).shadow(18.dp, RoundedCornerShape(corner)).clip(RoundedCornerShape(corner)).background(case).padding(w * .05f)) {
                DialImg(Modifier.fillMaxSize().clip(RoundedCornerShape(corner * .7f)))
            }
            Box(Modifier.width(w * .62f).height(w * .16f).clip(RoundedCornerShape(bottomStart = 12.dp, bottomEnd = 12.dp)).background(strap))
        }
    }
}

// =====================================================================
// MENYER: alltid längst ner, alltid ikon + text, men i varje stils egen form
// =====================================================================

private val NAV6 = listOf("Klocka", "Hälsa", "Urtavlor", "Verktyg", "Mer")

@Composable
fun Nav6(s: Stil, tab: Int, onTab: (Int) -> Unit) {
    when (s) {
        Stil.MATERIAL -> NavigationBar {
            NAV6.forEachIndexed { i, l -> NavigationBarItem(selected = tab == i, onClick = { onTab(i) }, icon = { DockIconPub(i, LocalContentColor.current, Modifier) }, label = { Text(l) }) }
        }
        Stil.COCKPIT -> Row(Modifier.fillMaxWidth().background(Color(0xFF03090D)).padding(8.dp).border(1.dp, Color(0xFF2B5058))) {
            NAV6.forEachIndexed { i, l -> val on = i == tab
                Column(Modifier.weight(1f).background(if (on) Color(0xFF2EF2FF) else Color.Transparent).clickable { onTab(i) }.padding(vertical = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    DockIconPub(i, if (on) Color(0xFF03090D) else Color(0xFF2EF2FF), Modifier)
                    Text(l.uppercase(), color = if (on) Color(0xFF03090D) else Color(0xFFCFEFF5), fontFamily = FontFamily.Monospace, fontSize = 9.sp, letterSpacing = 1.sp, maxLines = 1)
                } }
        }
        Stil.NORRSKEN -> Row(Modifier.padding(12.dp).fillMaxWidth().clip(RoundedCornerShape(30.dp)).background(Color.White.copy(alpha = .10f)).border(1.dp, Color.White.copy(alpha = .18f), RoundedCornerShape(30.dp)).padding(6.dp)) {
            NAV6.forEachIndexed { i, l -> val on = i == tab
                val sc by animateFloatAsState(if (on) 1.18f else 1f, spring(dampingRatio = .5f, stiffness = 400f), label = "d")
                Column(Modifier.weight(1f).clip(RoundedCornerShape(24.dp)).background(if (on) Color.White.copy(alpha = .16f) else Color.Transparent).clickable { onTab(i) }.padding(vertical = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    DockIconPub(i, if (on) Color(0xFF1DE9B6) else Color.White.copy(alpha = .7f), Modifier.graphicsLayer { scaleX = sc; scaleY = sc })
                    Text(l, color = if (on) Color.White else Color.White.copy(alpha = .6f), fontSize = 10.sp, maxLines = 1)
                } }
        }
        Stil.LCD -> Row(Modifier.fillMaxWidth().background(Color(0xFF26282B)).padding(horizontal = 8.dp, vertical = 10.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
            NAV6.forEachIndexed { i, l -> val on = i == tab
                val src = remember { MutableInteractionSource() }; val pr by src.collectIsPressedAsState(); val down = pr || on
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable(src, null) { onTab(i) }) {
                    Box(Modifier.size(6.dp).clip(CircleShape).background(if (on) Color(0xFFFF3B30) else Color(0xFF3A3C40)))
                    Spacer(Modifier.height(4.dp))
                    Box(Modifier.offset(y = if (down) 2.dp else 0.dp).size(52.dp, 30.dp).shadow(if (down) 1.dp else 5.dp, RoundedCornerShape(15.dp)).clip(RoundedCornerShape(15.dp))
                        .background(Brush.verticalGradient(if (down) listOf(Color(0xFF3B3D41), Color(0xFF4A4C50)) else listOf(Color(0xFF5A5D62), Color(0xFF3D3F43)))), contentAlignment = Alignment.Center) {
                        DockIconPub(i, Color(0xFFD5D7DA), Modifier.graphicsLayer { scaleX = .8f; scaleY = .8f })
                    }
                    Text(l.uppercase(), color = Color(0xFFB8BBC0), fontFamily = FontFamily.Monospace, fontSize = 8.sp, modifier = Modifier.padding(top = 3.dp))
                } }
        }
        Stil.KLADD -> Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            val cols = listOf(Color(0xFFFFE066), Color(0xFFFFB3C7), Color(0xFFA5D8FF), Color(0xFFB2F2BB), Color(0xFFFFC078))
            NAV6.forEachIndexed { i, l -> val on = i == tab
                val dy by animateDpAsState(if (on) (-6).dp else 0.dp, spring(dampingRatio = .5f, stiffness = 400f), label = "lapp")
                Column(Modifier.weight(1f).offset(y = dy).rotate(listOf(-3f, 2f, -2f, 3f, -2f)[i]).shadow(if (on) 6.dp else 2.dp).background(cols[i]).clickable { onTab(i) }.padding(vertical = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    DockIconPub(i, Color(0xFF26304A), Modifier)
                    Text(l, color = Color(0xFF26304A), fontFamily = FontFamily.Cursive, fontSize = if (on) 15.sp else 13.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Normal, maxLines = 1)
                } }
        }
        else -> Box(Modifier.fillMaxWidth().height(92.dp).background(Color(0xFF0E1116))) {
            Canvas(Modifier.fillMaxSize()) { drawArc(Color(0xFF5B6270).copy(alpha = .35f), 200f, 140f, false, Offset(size.width * .08f, size.height * .3f), Size(size.width * .84f, size.height * 2.2f), style = Stroke(2f)) }
            Row(Modifier.fillMaxSize().padding(horizontal = 10.dp)) {
                NAV6.forEachIndexed { i, l -> val on = i == tab
                    val lift = (sin(Math.PI * i / 4) * 16).dp
                    Column(Modifier.weight(1f).offset(y = 22.dp - lift).clickable { onTab(i) }, horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(Modifier.size(if (on) 44.dp else 38.dp).clip(CircleShape).background(if (on) Brush.linearGradient(listOf(Color(0xFFFF8A3D), Color(0xFFFF3D7F))) else Brush.linearGradient(listOf(Color(0xFF1C212B), Color(0xFF1C212B)))), contentAlignment = Alignment.Center) {
                            DockIconPub(i, if (on) Color.White else Color(0xFF8A92A3), Modifier)
                        }
                        Text(l, color = if (on) Color.White else Color(0xFF8A92A3), fontSize = 9.sp, maxLines = 1, modifier = Modifier.padding(top = 2.dp))
                    } }
            }
        }
    }
}

// =====================================================================
// Gemensam uppställning (utan skrollning): rubrik, klockan, tre värden, knappar
// =====================================================================

@Composable
fun Home6(s: Stil, a: Acts) {
    Column(Modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 8.dp)) {
        when (s) {
            Stil.MATERIAL -> MatHome(a)
            Stil.COCKPIT -> CkHome(a)
            Stil.NORRSKEN -> NsHome(a)
            Stil.LCD -> LcHome(a)
            Stil.KLADD -> KlHome(a)
            else -> RdHome(a)
        }
    }
}

@Composable
fun Health6(s: Stil, a: Acts) {
    var mode by rememberSaveable { mutableIntStateOf(0) }
    Column(Modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 8.dp)) {
        when (s) {
            Stil.MATERIAL -> MatHealth(a, mode) { mode = it }
            Stil.COCKPIT -> CkHealth(a, mode) { mode = it }
            Stil.NORRSKEN -> NsHealth(a, mode) { mode = it }
            Stil.LCD -> LcHealth(a, mode) { mode = it }
            Stil.KLADD -> KlHealth(a, mode) { mode = it }
            else -> RdHealth(a, mode) { mode = it }
        }
    }
}

// ---------------------------------------------------------------------
// MATERIAL
// ---------------------------------------------------------------------

@Composable
private fun ColumnScope.MatHome(a: Acts) {
    val cs = MaterialTheme.colorScheme; val ty = MaterialTheme.typography
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { Text("Min klocka", style = ty.headlineMedium); Text(if (D.ready) "Ansluten" else "Söker klockan …", style = ty.bodyMedium, color = if (D.ready) cs.primary else cs.error) }
        FilledTonalButton(onClick = a.stil) { Text("Stil") }
    }
    Row(Modifier.weight(1f).fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        WatchBody(Modifier.weight(1f).fillMaxHeight().clickable(onClick = a.dials), Color(0xFF1C1B1F), cs.surfaceVariant)
        Column(Modifier.weight(1f).padding(start = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Urtavla", style = ty.labelLarge, color = cs.primary); Text(D.dialName.ifEmpty { "–" }, style = ty.titleLarge, maxLines = 2)
            Button(onClick = a.dials) { Text("Byt urtavla") }
        }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        MatTile(Modifier.weight(1f), "Steg", nr(D.steps), stepWord(), sf(), cs.primary, cs.primaryContainer, cs.onPrimaryContainer, a.health)
        MatTile(Modifier.weight(1f), "Puls", nr(D.pulse), pulseWord(), pulseF(), cs.error, cs.errorContainer, cs.onErrorContainer, a.health)
        MatTile(Modifier.weight(1f), "Batteri", if (D.battery >= 0) "${D.battery}%" else "–", battWord(), battF(), cs.tertiary, cs.tertiaryContainer, cs.onTertiaryContainer, {})
    }
    Spacer(Modifier.height(10.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        FilledTonalButton(onClick = a.find, modifier = Modifier.weight(1f)) { Text("Hitta klockan") }
        FilledTonalButton(onClick = a.time, modifier = Modifier.weight(1f)) { Text("Ställ tiden") }
    }
}

@Composable
private fun MatTile(m: Modifier, label: String, value: String, word: String, f: Float, col: Color, bg: Color, on: Color, click: () -> Unit) {
    Card(m.clickable(onClick = click), shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = bg)) {
        Column(Modifier.fillMaxWidth().padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, style = MaterialTheme.typography.labelLarge, color = on)
            Box(Modifier.padding(vertical = 6.dp).size(64.dp), contentAlignment = Alignment.Center) {
                val g = grow6(f)
                CircularProgressIndicator(progress = { g }, modifier = Modifier.fillMaxSize(), color = col, trackColor = on.copy(alpha = .15f), strokeWidth = 7.dp, strokeCap = StrokeCap.Round)
                Text(value, style = MaterialTheme.typography.titleSmall, color = on, maxLines = 1)
            }
            Text(word, style = MaterialTheme.typography.bodyMedium, color = on, fontWeight = FontWeight.SemiBold, maxLines = 1)
        }
    }
}

@Composable
private fun ColumnScope.MatHealth(a: Acts, mode: Int, set: (Int) -> Unit) {
    val cs = MaterialTheme.colorScheme; val ty = MaterialTheme.typography
    Row(verticalAlignment = Alignment.CenterVertically) { Text("Hälsa", style = ty.headlineMedium, modifier = Modifier.weight(1f)); Button(onClick = a.sync) { Text("Hämta nu") } }
    Spacer(Modifier.height(10.dp))
    SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) { MODES.forEachIndexed { i, t -> SegmentedButton(selected = mode == i, onClick = { set(i) }, shape = SegmentedButtonDefaults.itemShape(i, 3)) { Text(t) } } }
    Spacer(Modifier.height(12.dp))
    Card(Modifier.fillMaxWidth().weight(1f), shape = RoundedCornerShape(28.dp)) {
        AnimatedContent(mode, label = "läge") { m ->
            Column(Modifier.fillMaxSize().padding(18.dp)) {
                Text(healthLine(m), style = ty.titleMedium)
                Spacer(Modifier.height(12.dp))
                when (m) {
                    0 -> { M3Bars(D.hours, List(24) { "Kl %02d".format(it) }, Modifier.fillMaxWidth().weight(1f)); Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { listOf("00", "06", "12", "18", "24").forEach { Text(it, style = ty.labelSmall, color = cs.onSurfaceVariant) } } }
                    1 -> { Spark(D.pulseDay, cs.error, Modifier.fillMaxWidth().weight(1f))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { listOf("Nu" to D.pulse, "Lägst" to plo(), "Högst" to phi()).forEach { (k, v) -> Surface(Modifier.weight(1f), shape = RoundedCornerShape(16.dp), color = cs.surfaceContainerHighest) { Column(Modifier.padding(10.dp)) { Text(k, style = ty.labelMedium); Text(nr(v), style = ty.titleLarge) } } } } }
                    else -> { M3Bars(D.week.map { maxOf(0, it) }, D.weekDays, Modifier.fillMaxWidth().weight(1f)); Row(Modifier.fillMaxWidth()) { D.week.forEachIndexed { i, v -> Text((if (v >= D.stepGoal) "✓ " else "") + D.weekDays.getOrElse(i) { "" }, Modifier.weight(1f), style = ty.labelSmall, textAlign = TextAlign.Center, color = if (v >= D.stepGoal) cs.primary else cs.onSurfaceVariant) } } }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------
// COCKPIT
// ---------------------------------------------------------------------
private val CY = Color(0xFF2EF2FF); private val AMB = Color(0xFFFFB020); private val CTX = Color(0xFFCFEFF5); private val CDIM = Color(0xFF2B5058); private val CPANEL = Color(0xFF07161C)
private val MONO6 = FontFamily.Monospace

@Composable
private fun CkLabel(t: String, c: Color = CY) = Text(t, color = c, fontFamily = MONO6, fontSize = 11.sp, letterSpacing = 2.sp)

@Composable
private fun ColumnScope.CkHome(a: Acts) {
    // förhandsvisning i ett sikte med hörn
    Box(Modifier.weight(1f).fillMaxWidth().padding(vertical = 6.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val l = 28f
            listOf(Offset(0f, 0f) to Offset(1f, 1f), Offset(size.width, 0f) to Offset(-1f, 1f), Offset(0f, size.height) to Offset(1f, -1f), Offset(size.width, size.height) to Offset(-1f, -1f)).forEach { (p, d) ->
                drawLine(CY, p, Offset(p.x + l * d.x, p.y), 3f); drawLine(CY, p, Offset(p.x, p.y + l * d.y), 3f) }
            drawLine(CDIM, Offset(0f, size.height / 2), Offset(size.width, size.height / 2), 1f)
        }
        WatchBody(Modifier.fillMaxHeight(.92f).clickable(onClick = a.dials), Color(0xFF0A1418), Color(0xFF0F2A30), 28.dp)
        Column(Modifier.align(Alignment.TopStart).padding(8.dp)) { CkLabel("▸ TAVLA"); Text(D.dialName.uppercase(), color = CTX, fontFamily = MONO6, fontSize = 12.sp) }
        Box(Modifier.align(Alignment.TopEnd).padding(8.dp)) { CkLabel(if (D.ready) "● LÄNK OK" else "○ SÖKER", if (D.ready) CY else AMB) }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(Triple("STEG", nr(D.steps), sf()) to stepWord(), Triple("PULS", nr(D.pulse), pulseF()) to pulseWord(), Triple("BATT", if (D.battery >= 0) "${D.battery}%" else "–", battF()) to battWord()).forEachIndexed { i, (t, w) ->
            Column(Modifier.weight(1f).background(CPANEL).border(1.dp, CDIM).clickable(onClick = a.health).padding(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Gauge(t.third, t.first, t.second, Modifier.fillMaxWidth().aspectRatio(1f), if (i == 1) AMB else CY)
                Text(w.uppercase(), color = if (i == 1 && D.pulse > 100) AMB else CTX, fontFamily = MONO6, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
    Spacer(Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("URTAVLA" to a.dials, "HITTA" to a.find, "TID" to a.time, "STIL" to a.stil).forEach { (t, f) ->
            Box(Modifier.weight(1f).height(42.dp).border(1.dp, CY).clickable(onClick = f), contentAlignment = Alignment.Center) { Text("[$t]", color = CY, fontFamily = MONO6, fontSize = 11.sp) }
        }
    }
}

@Composable
private fun ColumnScope.CkHealth(a: Acts, mode: Int, set: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) { CkLabel("▸ HÄLSA"); Spacer(Modifier.weight(1f)); Text("[HÄMTA]", Modifier.border(1.dp, CY).clickable(onClick = a.sync).padding(8.dp), color = CY, fontFamily = MONO6, fontSize = 11.sp) }
    Spacer(Modifier.height(8.dp))
    Row(Modifier.fillMaxWidth().border(1.dp, CDIM)) { MODES.forEachIndexed { i, t -> Text(t.uppercase(), Modifier.weight(1f).background(if (mode == i) CY else Color.Transparent).clickable { set(i) }.padding(vertical = 10.dp), color = if (mode == i) Color(0xFF03090D) else CTX, fontFamily = MONO6, fontSize = 12.sp, textAlign = TextAlign.Center) } }
    Spacer(Modifier.height(10.dp))
    Column(Modifier.weight(1f).fillMaxWidth().background(CPANEL).border(1.dp, CDIM).padding(12.dp)) {
        Text(healthLine(mode), color = CTX, fontFamily = MONO6, fontSize = 13.sp, lineHeight = 18.sp)
        Spacer(Modifier.height(10.dp))
        when (mode) {
            0 -> { Row(Modifier.fillMaxWidth().weight(1f)) { Gauge(sf(), "${sp()}%", nr(D.steps), Modifier.weight(1f).fillMaxHeight(), big = true) }; Led(D.hours, Modifier.fillMaxWidth().height(90.dp), 10) }
            1 -> { Scope(D.pulseDay, Modifier.fillMaxWidth().weight(1f), AMB); Row { listOf("NU" to D.pulse, "LÅG" to plo(), "HÖG" to phi()).forEach { (k, v) -> Column(Modifier.weight(1f)) { CkLabel(k); Text(nr(v), color = CTX, fontFamily = MONO6, fontSize = 22.sp) } } } }
            else -> { Led(D.week.map { maxOf(0, it) }, Modifier.fillMaxWidth().weight(1f), 14); Row(Modifier.fillMaxWidth()) { D.week.forEachIndexed { i, v -> Text(D.weekDays.getOrElse(i) { "" }.uppercase().take(3), Modifier.weight(1f), color = if (v >= D.stepGoal) AMB else CTX, fontFamily = MONO6, fontSize = 10.sp, textAlign = TextAlign.Center) } } }
        }
    }
}

// ---------------------------------------------------------------------
// NORRSKEN
// ---------------------------------------------------------------------
private val NT = Color(0xFF1DE9B6); private val NP = Color(0xFFFF6B9A); private val NB = Color(0xFF2979FF)

@Composable
private fun ColumnScope.NsHome(a: Acts) {
    // klockan svävar, med en spegling under sig
    val y by rememberInfiniteTransition(label = "sväv").animateFloat(-6f, 6f, infiniteRepeatable(tween(3200, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "y")
    Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) { drawCircle(Brush.radialGradient(listOf(NT.copy(alpha = .35f), Color.Transparent), center, size.minDimension * .5f), size.minDimension * .5f, center) }
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.graphicsLayer { translationY = y * density }) {
            Box(Modifier.fillMaxHeight(.7f).aspectRatio(240f / 286f).clip(RoundedCornerShape(40.dp)).border(2.dp, Color.White.copy(alpha = .3f), RoundedCornerShape(40.dp)).clickable(onClick = a.dials)) { DialImg(Modifier.fillMaxSize()) }
            Box(Modifier.fillMaxHeight(.22f).aspectRatio(240f / 80f).graphicsLayer { scaleY = -1f; alpha = .18f }.clip(RoundedCornerShape(40.dp))) { DialImg(Modifier.fillMaxSize()) }
        }
        Text(D.dialName, Modifier.align(Alignment.BottomCenter), color = Color.White, fontSize = 14.sp)
    }
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        NGlass(Modifier.weight(1f).clickable(onClick = a.health)) { Orb(sf(), NT, Modifier.fillMaxWidth().aspectRatio(1f)) { Text(nr(D.steps), color = Color(0xFF02221A), fontSize = 14.sp, fontWeight = FontWeight.Bold) }; NsWord("Steg", stepWord()) }
        NGlass(Modifier.weight(1f).clickable(onClick = a.health)) { Box(Modifier.fillMaxWidth().aspectRatio(1f), contentAlignment = Alignment.Center) { Ripples(D.pulse, NP, Modifier.matchParentSize()); Text(nr(D.pulse), color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold) }; NsWord("Puls", pulseWord()) }
        NGlass(Modifier.weight(1f)) {
            Box(Modifier.fillMaxWidth().aspectRatio(1f), contentAlignment = Alignment.Center) {
                val g = grow6(battF())
                Canvas(Modifier.fillMaxSize()) { val st = size.width * .1f; drawArc(Color.White.copy(alpha = .12f), 135f, 270f, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round))
                    drawArc(Brush.sweepGradient(listOf(NB, NT, NB)), 135f, 270f * g, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round)) }
                Text(if (D.battery >= 0) "${D.battery}%" else "–", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
            NsWord("Batteri", battWord())
        }
    }
    Spacer(Modifier.height(10.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("Hitta" to a.find, "Ställ tid" to a.time, "Stil" to a.stil).forEach { (t, f) ->
            Box(Modifier.weight(1f).clip(CircleShape).background(Color.White.copy(alpha = .12f)).border(1.dp, Color.White.copy(alpha = .2f), CircleShape).clickable(onClick = f).padding(vertical = 11.dp), contentAlignment = Alignment.Center) { Text(t, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
        }
    }
}

@Composable
private fun ColumnScope.NsWord(k: String, w: String) {
    Text(k, color = Color.White.copy(alpha = .6f), fontSize = 11.sp, modifier = Modifier.align(Alignment.CenterHorizontally))
    Text(w, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.align(Alignment.CenterHorizontally), maxLines = 1)
}

@Composable
private fun ColumnScope.NsHealth(a: Acts, mode: Int, set: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("Hälsa", color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
        Box(Modifier.clip(CircleShape).background(Color.White.copy(alpha = .14f)).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 9.dp)) { Text("Hämta", color = Color.White) }
    }
    Spacer(Modifier.height(10.dp))
    Row(Modifier.fillMaxWidth().clip(CircleShape).background(Color.White.copy(alpha = .08f)).padding(4.dp)) {
        MODES.forEachIndexed { i, t -> Text(t, Modifier.weight(1f).clip(CircleShape).background(if (mode == i) Color.White.copy(alpha = .2f) else Color.Transparent).clickable { set(i) }.padding(vertical = 9.dp), color = Color.White, textAlign = TextAlign.Center, fontWeight = if (mode == i) FontWeight.SemiBold else FontWeight.Normal) }
    }
    Spacer(Modifier.height(10.dp))
    NGlass(Modifier.fillMaxWidth().weight(1f)) {
        Text(healthLine(mode), color = Color.White, fontSize = 15.sp, lineHeight = 21.sp)
        Spacer(Modifier.height(10.dp))
        when (mode) {
            0 -> { Orb(sf(), NT, Modifier.fillMaxWidth().weight(1f)) { Text(nr(D.steps), color = Color(0xFF02221A), fontSize = 24.sp, fontWeight = FontWeight.Bold) }; Ribbon(D.hours, Modifier.fillMaxWidth().height(70.dp)) }
            1 -> { Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) { Ripples(D.pulse, NP, Modifier.fillMaxHeight().aspectRatio(1f)); Text(nr(D.pulse), color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.Bold) }; Ribbon(D.pulseDay, Modifier.fillMaxWidth().height(70.dp)) }
            else -> Constellation(D.week, D.weekDays, D.stepGoal, Modifier.fillMaxWidth().weight(1f))
        }
    }
}

// ---------------------------------------------------------------------
// LCD
// ---------------------------------------------------------------------
private val LI = Color(0xFF1C2416)

@Composable
private fun ColumnScope.LcHome(a: Acts) {
    // klockans skärm sitter i ett hölje med skruvar, som en riktig LCD-pryl
    Box(Modifier.weight(1f).fillMaxWidth().padding(vertical = 4.dp).clip(RoundedCornerShape(18.dp)).background(Brush.verticalGradient(listOf(Color(0xFF3A3D42), Color(0xFF2A2C30)))).padding(14.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) { listOf(Offset(10f, 10f), Offset(size.width - 10f, 10f), Offset(10f, size.height - 10f), Offset(size.width - 10f, size.height - 10f)).forEach { drawCircle(Color(0xFF55585E), 6f, it); drawLine(Color(0xFF222428), Offset(it.x - 4, it.y), Offset(it.x + 4, it.y), 2f) } }
        Box(Modifier.fillMaxHeight(.94f).aspectRatio(240f / 286f).clip(RoundedCornerShape(10.dp)).border(4.dp, Color(0xFF111111), RoundedCornerShape(10.dp)).clickable(onClick = a.dials)) { DialImg(Modifier.fillMaxSize()) }
        Text(D.dialName.uppercase(), Modifier.align(Alignment.BottomCenter), color = Color(0xFFB8BBC0), fontFamily = MONO6, fontSize = 10.sp, letterSpacing = 2.sp)
    }
    LcdPanel(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) { LT("STEG", 12); Spacer(Modifier.weight(1f)); Seg7(if (D.steps >= 0) D.steps.toString().padStart(5) else "-----", 32.dp) }
        SegBar(sf(), 20, Modifier.fillMaxWidth().padding(vertical = 4.dp))
        Row { LT(stepWord().uppercase(), 12); Spacer(Modifier.weight(1f)); LT("MÅL ${D.stepGoal}") }
    }
    Spacer(Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        LcdPanel(Modifier.weight(1f)) { LT("PULS ♥", 12); Seg7(if (D.pulse > 0) D.pulse.toString().padStart(3) else "---", 34.dp); LT(pulseWord().uppercase(), 12) }
        LcdPanel(Modifier.weight(1f)) { LT("BATTERI", 12); Seg7(if (D.battery >= 0) D.battery.toString().padStart(3) else "---", 34.dp); LT(battWord().uppercase(), 12) }
    }
    Spacer(Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("HITTA" to a.find, "TID" to a.time, "STIL" to a.stil).forEach { (t, f) -> Box(Modifier.weight(1f).height(40.dp).clip(RoundedCornerShape(20.dp)).background(Color(0xFF45474B)).clickable(onClick = f), contentAlignment = Alignment.Center) { Text(t, color = Color(0xFFD5D7DA), fontFamily = MONO6, fontSize = 12.sp, letterSpacing = 2.sp) } }
    }
}

@Composable
private fun ColumnScope.LcHealth(a: Acts, mode: Int, set: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        MODES.forEachIndexed { i, t -> Box(Modifier.weight(1f).height(40.dp).clip(RoundedCornerShape(20.dp)).background(if (mode == i) Color(0xFF6B6E73) else Color(0xFF45474B)).clickable { set(i) }, contentAlignment = Alignment.Center) { Text(t.uppercase(), color = Color(0xFFE5E7EA), fontFamily = MONO6, fontSize = 12.sp, letterSpacing = 2.sp) } }
        Box(Modifier.height(40.dp).clip(RoundedCornerShape(20.dp)).background(Color(0xFF8A1010)).clickable(onClick = a.sync).padding(horizontal = 12.dp), contentAlignment = Alignment.Center) { Text("HÄMTA", color = Color.White, fontFamily = MONO6, fontSize = 11.sp) }
    }
    Spacer(Modifier.height(10.dp))
    LcdPanel(Modifier.fillMaxWidth().weight(1f)) {
        LT(healthLine(mode).uppercase(), 11)
        Spacer(Modifier.height(8.dp))
        when (mode) {
            0 -> { Seg7(if (D.steps >= 0) D.steps.toString().padStart(5) else "-----", 54.dp); Spacer(Modifier.height(8.dp)); LcCols(D.hours, Modifier.fillMaxWidth().weight(1f), 12) }
            1 -> { Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) { listOf("NU" to D.pulse, "LÅG" to plo(), "HÖG" to phi()).forEach { (k, v) -> Column { LT(k); Seg7(if (v > 0) v.toString().padStart(3) else "---", 36.dp) } } }; Spacer(Modifier.height(8.dp)); LcCols(D.pulseDay.takeLast(24), Modifier.fillMaxWidth().weight(1f), 12) }
            else -> { LcCols(D.week.map { maxOf(0, it) }, Modifier.fillMaxWidth().weight(1f), 14); Row(Modifier.fillMaxWidth()) { D.weekDays.forEach { LT(it.take(1).uppercase()); Spacer(Modifier.weight(1f)) } } }
        }
    }
}

/** Staplar av LCD-segment. */
@Composable
private fun LcCols(v: List<Int>, m: Modifier, segs: Int) {
    val g = grow6(1f, 900)
    Canvas(m) {
        if (v.isEmpty()) return@Canvas
        val mx = maxOf(1, v.max()).toFloat(); val cw = size.width / v.size; val sh = size.height / segs
        v.forEachIndexed { i, x -> val lit = (x / mx * segs * g).roundToInt()
            for (k in 0 until segs) drawRect(if (k < lit) LI else LI.copy(alpha = .07f), Offset(i * cw + cw * .12f, size.height - (k + 1) * sh + sh * .15f), Size(cw * .76f, sh * .7f)) }
    }
}

// ---------------------------------------------------------------------
// KLADDBLOCK
// ---------------------------------------------------------------------
private val KI = Color(0xFF26304A); private val KR = Color(0xFFE03131)
private val HAND6 = FontFamily.Cursive

@Composable
private fun Note(c: Color, rot: Float, m: Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) =
    Column(m.rotate(rot).shadow(4.dp).background(c).then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally, content = content)

@Composable
private fun ColumnScope.KlHome(a: Acts) {
    Text("Idag, ${java.text.SimpleDateFormat("d MMMM", java.util.Locale("sv")).format(java.util.Date())}", color = KI, fontFamily = HAND6, fontSize = 28.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 30.dp))
    // polaroid med tejp
    Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
        Box(Modifier.fillMaxHeight(.92f).aspectRatio(.8f).rotate(-3f).shadow(8.dp).background(Color.White).clickable(onClick = a.dials).padding(start = 10.dp, end = 10.dp, top = 10.dp, bottom = 34.dp)) {
            DialImg(Modifier.fillMaxSize())
            Text(D.dialName, Modifier.align(Alignment.BottomCenter).offset(y = 28.dp), color = KI, fontFamily = HAND6, fontSize = 18.sp)
        }
        Box(Modifier.align(Alignment.TopCenter).offset(y = 4.dp).size(80.dp, 24.dp).rotate(-8f).background(Color(0xCCF1E3B0)))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(vertical = 8.dp)) {
        Note(Color(0xFFFFE066), -3f, Modifier.weight(1f), a.health) {
            Text("Steg", color = KI, fontFamily = HAND6, fontSize = 15.sp); Hi(nr(D.steps), 24)
            val g = grow6(sf()); Canvas(Modifier.fillMaxWidth().height(14.dp)) { drawRect(KI, style = Stroke(2.5f)); for (k in 0 until (size.width * g / 6).toInt()) drawLine(KI, Offset(k * 6f, size.height), Offset(k * 6f + 6, 0f), 2f) }
            Text(stepWord(), color = KI, fontFamily = HAND6, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }
        Note(Color(0xFFFFB3C7), 2f, Modifier.weight(1f), a.health) { Text("Puls", color = KI, fontFamily = HAND6, fontSize = 15.sp); DrawnHeart(Modifier.size(52.dp, 44.dp)); Text(nr(D.pulse), color = KR, fontFamily = HAND6, fontSize = 22.sp, fontWeight = FontWeight.Bold); Text(pulseWord(), color = KI, fontFamily = HAND6, fontSize = 15.sp) }
        Note(Color(0xFFA5D8FF), -2f, Modifier.weight(1f)) {
            Text("Batteri", color = KI, fontFamily = HAND6, fontSize = 15.sp)
            val g = grow6(battF())
            Canvas(Modifier.size(60.dp, 30.dp)) { drawRect(KI, Offset(0f, 0f), Size(size.width * .9f, size.height), style = Stroke(3f)); drawRect(KI, Offset(size.width * .9f, size.height * .3f), Size(size.width * .1f, size.height * .4f))
                for (k in 0 until ((size.width * .9f - 6) * g / 5).toInt()) drawLine(if (D.battery < 20) KR else KI, Offset(4f + k * 5f, size.height - 4), Offset(4f + k * 5f + 5, 4f), 2f) }
            Text(if (D.battery >= 0) "${D.battery} %" else "?", color = KI, fontFamily = HAND6, fontSize = 18.sp, fontWeight = FontWeight.Bold); Text(battWord(), color = KI, fontFamily = HAND6, fontSize = 15.sp)
        }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        listOf(Triple("Hitta klockan", a.find, Color(0xFFB2F2BB)), Triple("Ställ tiden", a.time, Color(0xFFFFC078)), Triple("Stil", a.stil, Color(0xFFE5DBFF))).forEachIndexed { i, (t, f, c) ->
            Note(c, if (i % 2 == 0) -2f else 2f, Modifier.weight(1f), f) { Text(t, color = KI, fontFamily = HAND6, fontSize = 15.sp, maxLines = 1) }
        }
    }
}

@Composable
private fun ColumnScope.KlHealth(a: Acts, mode: Int, set: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 30.dp)) {
        Text("Hälsa", color = KI, fontFamily = HAND6, fontSize = 32.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        Note(Color(0xFFFFC078), 3f, Modifier, a.sync) { Text("Hämta!", color = KI, fontFamily = HAND6, fontSize = 16.sp) }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(vertical = 8.dp)) {
        MODES.forEachIndexed { i, t -> Note(if (mode == i) Color(0xFFFFE066) else Color(0xFFFFF9DB), if (i == 1) 2f else -2f, Modifier.weight(1f), { set(i) }) { Text(t, color = KI, fontFamily = HAND6, fontSize = if (mode == i) 18.sp else 15.sp, fontWeight = if (mode == i) FontWeight.Bold else FontWeight.Normal) } }
    }
    Column(Modifier.weight(1f).fillMaxWidth().padding(start = 30.dp)) {
        Text(healthLine(mode), color = KI, fontFamily = HAND6, fontSize = 19.sp, lineHeight = 24.sp)
        Spacer(Modifier.height(8.dp))
        when (mode) {
            0 -> { Tally(D.steps, Modifier.fillMaxWidth().height(110.dp)); HandBars(D.hours, Modifier.fillMaxWidth().weight(1f), Color(0xFFFFC078)) }
            1 -> { DrawnHeart(Modifier.size(80.dp, 70.dp).align(Alignment.CenterHorizontally)); HandBars(D.pulseDay.takeLast(24), Modifier.fillMaxWidth().weight(1f), Color(0xFFFFB3C7)) }
            else -> Column(Modifier.weight(1f), verticalArrangement = Arrangement.SpaceEvenly) {
                D.week.forEachIndexed { i, v -> Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(24.dp).border(2.dp, KI), contentAlignment = Alignment.Center) { if (v >= D.stepGoal) Text("✓", color = KR, fontSize = 18.sp, fontWeight = FontWeight.Bold) }
                    Spacer(Modifier.width(10.dp)); Text(D.weekDays.getOrElse(i) { "" }, color = KI, fontFamily = HAND6, fontSize = 18.sp, modifier = Modifier.width(64.dp)); Text(nr(v), color = KI, fontFamily = HAND6, fontSize = 18.sp)
                } }
            }
        }
    }
}

// ---------------------------------------------------------------------
// DYGNSUR
// ---------------------------------------------------------------------
private val RO = Color(0xFFFF8A3D); private val RP = Color(0xFFFF3D7F); private val RT = Color(0xFFF2F4F8); private val RD = Color(0xFF8A92A3)

/** Förhandsvisning: urtavlan i mitten av dygnets strålar (en stråle per timme, längre ju fler steg). */
@Composable
private fun RayFrame(m: Modifier, onClick: () -> Unit) {
    val g = grow6(1f, 1500)
    Box(m, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val c = center; val R = size.minDimension / 2; val r0 = R * .62f; val len = R * .34f; val mx = maxOf(1, D.hours.maxOrNull() ?: 1)
            val cal = java.util.Calendar.getInstance(); val now = cal.get(java.util.Calendar.HOUR_OF_DAY)
            drawArc(Brush.sweepGradient(listOf(RO, RP, RO), c), -90f, 360f * sf() * g, false, Offset(c.x - r0, c.y - r0), Size(2 * r0, 2 * r0), style = Stroke(R * .035f, cap = StrokeCap.Round))
            for (h in 0 until 24) {
                val an = Math.toRadians(-90.0 + h * 15); val ca = cos(an).toFloat(); val sa = sin(an).toFloat()
                val v = D.hours.getOrElse(h) { 0 }; val l = len * v / mx * ((g * 1.6f) - h / 24f).coerceIn(0f, 1f)
                drawLine(Color(0xFF242A35), Offset(c.x + ca * (r0 + 10), c.y + sa * (r0 + 10)), Offset(c.x + ca * (r0 + 10 + len), c.y + sa * (r0 + 10 + len)), R * .04f, StrokeCap.Round)
                if (v > 0) drawLine(if (h == now) RP else RO, Offset(c.x + ca * (r0 + 10), c.y + sa * (r0 + 10)), Offset(c.x + ca * (r0 + 10 + l), c.y + sa * (r0 + 10 + l)), R * .04f, StrokeCap.Round)
            }
        }
        Box(Modifier.fillMaxHeight(.52f).aspectRatio(240f / 286f).clip(RoundedCornerShape(26.dp)).clickable(onClick = onClick)) { DialImg(Modifier.fillMaxSize()) }
    }
}

@Composable
private fun ColumnScope.RdHome(a: Acts) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { Text(D.dialName.ifEmpty { "Urtavla" }, color = RT, fontSize = 18.sp, fontWeight = FontWeight.SemiBold); Text(if (D.ready) "Ansluten" else "Söker klockan", color = RD, fontSize = 12.sp) }
        Text("${sp()} %", color = RO, fontSize = 22.sp, fontWeight = FontWeight.Bold)
    }
    RayFrame(Modifier.weight(1f).fillMaxWidth(), a.dials)
    Text("Strålarna runt klockan är dina steg varje timme. Ringen fylls när du närmar dig målet.", color = RD, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    Spacer(Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        RdCircle(Modifier.weight(1f), "Steg", nr(D.steps), stepWord(), sf(), a.health)
        Column(Modifier.weight(1f).clickable(onClick = a.health), horizontalAlignment = Alignment.CenterHorizontally) { PulseRing(Modifier.fillMaxWidth().aspectRatio(1f)); Text(pulseWord(), color = RT, fontSize = 13.sp, fontWeight = FontWeight.SemiBold); Text("Puls", color = RD, fontSize = 11.sp) }
        RdCircle(Modifier.weight(1f), "Batteri", if (D.battery >= 0) "${D.battery}%" else "–", battWord(), battF()) {}
    }
    Spacer(Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        listOf("Hitta" to a.find, "Tiden" to a.time, "Stil" to a.stil).forEach { (t, f) -> Box(Modifier.weight(1f).clip(CircleShape).border(1.dp, RD, CircleShape).clickable(onClick = f).padding(vertical = 10.dp), contentAlignment = Alignment.Center) { Text(t, color = RT, fontSize = 13.sp) } }
    }
}

@Composable
private fun RdCircle(m: Modifier, label: String, value: String, word: String, f: Float, click: () -> Unit) {
    Column(m.clickable(onClick = click), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.fillMaxWidth().aspectRatio(1f), contentAlignment = Alignment.Center) {
            val g = grow6(f)
            Canvas(Modifier.fillMaxSize()) { val st = size.width * .09f; drawArc(Color(0xFF242A35), 135f, 270f, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round))
                drawArc(Brush.sweepGradient(listOf(RO, RP, RO)), 135f, 270f * g, false, Offset(st, st), Size(size.width - 2 * st, size.height - 2 * st), style = Stroke(st, cap = StrokeCap.Round)) }
            Text(value, color = RT, fontSize = 15.sp, fontWeight = FontWeight.Bold, maxLines = 1)
        }
        Text(word, color = RT, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 1); Text(label, color = RD, fontSize = 11.sp)
    }
}

@Composable
private fun ColumnScope.RdHealth(a: Acts, mode: Int, set: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("Hälsa", color = RT, fontSize = 28.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
        Box(Modifier.clip(CircleShape).background(Brush.linearGradient(listOf(RO, RP))).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 9.dp)) { Text("Hämta", color = Color.White) }
    }
    Spacer(Modifier.height(8.dp))
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        MODES.forEachIndexed { i, t -> val on = mode == i
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable { set(i) }) {
                Box(Modifier.size(if (on) 46.dp else 38.dp).clip(CircleShape).background(if (on) Brush.linearGradient(listOf(RO, RP)) else Brush.linearGradient(listOf(Color(0xFF1C212B), Color(0xFF1C212B)))), contentAlignment = Alignment.Center) { DockIconPub(listOf(3, 1, 4)[i], if (on) Color.White else RD, Modifier) }
                Text(t, color = if (on) RT else RD, fontSize = 12.sp)
            } }
    }
    Spacer(Modifier.height(8.dp))
    Text(healthLine(mode), color = RT, fontSize = 15.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
        when (mode) {
            0 -> DayDial(Modifier.fillMaxHeight().aspectRatio(1f))
            1 -> PulseRing(Modifier.fillMaxHeight(.8f).aspectRatio(1f))
            else -> WeekPie(Modifier.fillMaxHeight(.8f).aspectRatio(1f))
        }
    }
}
