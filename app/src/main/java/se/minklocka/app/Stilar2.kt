@file:OptIn(ExperimentalMaterial3Api::class)

package se.minklocka.app

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.PI
import kotlin.math.roundToInt
import kotlin.math.sin

/*
 * Varje stil visar samma data på sitt eget sätt:
 *  Material  – Googles egna komponenter: cirkel- och linjeförlopp, listrader, segmentknappar, stapel man kan trycka på
 *  Tidning   – med ord och tabeller: rangordnade timmar, siffror i meningar
 *  Bento     – rutor som fylls som ett glas, värmekarta för timmar och vecka, EKG-linje som löper
 *  Brutal    – staplade block (ett block = 1 000 steg), kvitto över timmarna, tjocka liggande staplar
 *  Norrsken  – glödande klot som växer med stegen, ringar som sprids i pulsens takt, stjärnbild för veckan
 */

private val W = WatchState
private fun f2() = if (W.steps >= 0) (W.steps / W.stepGoal.toFloat()).coerceIn(0f, 1f) else 0f
private fun p2() = if (W.steps >= 0) W.steps * 100 / W.stepGoal.coerceAtLeast(1) else 0
private fun n2(v: Int) = if (v < 0) "–" else fmt(v)
private fun topHours(k: Int) = W.hours.mapIndexed { h, v -> h to v }.filter { it.second > 0 }.sortedByDescending { it.second }.take(k)
private fun pulseLo() = W.pulseDay.filter { it > 0 }.minOrNull() ?: -1
private fun pulseHi() = W.pulseDay.maxOrNull() ?: -1

@Composable
private fun grow(target: Float, ms: Int = 1100, wait: Int = 0): Float {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { on = true }
    return animateFloatAsState(if (on) target else 0f, tween(ms, wait, FastOutSlowInEasing), label = "väx").value
}

// =====================================================================
// MATERIAL – riktiga Material 3-komponenter
// =====================================================================

@Composable
private fun MIcon(i: Int, bg: Color, fg: Color) {
    Box(Modifier.size(40.dp).clip(CircleShape).background(bg), contentAlignment = Alignment.Center) { DockIconPub(i, fg, Modifier) }
}

@Composable
fun M3Home(a: Acts) {
    val cs = MaterialTheme.colorScheme
    val ty = MaterialTheme.typography
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
        Row(Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Min klocka", style = ty.headlineLarge)
                Text(if (W.ready) "Ansluten" else W.status.ifEmpty { "Söker klockan" }, style = ty.bodyMedium, color = cs.onSurfaceVariant, maxLines = 1)
            }
            FilledTonalButton(onClick = a.stil) { Text("Stil") }
        }
        // Urtavla
        ElevatedCard(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp), colors = CardDefaults.elevatedCardColors(containerColor = cs.surfaceContainerLow)) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(96.dp, 114.dp).clip(RoundedCornerShape(24.dp)).background(Color.Black)) {
                    W.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
                }
                Spacer(Modifier.width(16.dp))
                Column(Modifier.weight(1f)) {
                    Text("Urtavla", style = ty.labelLarge, color = cs.primary)
                    Text(W.dialName.ifEmpty { "–" }, style = ty.titleLarge, maxLines = 2)
                    Spacer(Modifier.height(10.dp))
                    ExtendedFloatingActionButton(onClick = a.dials, containerColor = cs.primaryContainer, contentColor = cs.onPrimaryContainer, modifier = Modifier.height(44.dp)) { Text("Byt urtavla") }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        // Dagens mål: officiellt cirkelförlopp
        Card(Modifier.fillMaxWidth().clickable(onClick = a.health), shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = cs.primaryContainer)) {
            Row(Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(contentAlignment = Alignment.Center) {
                    val g = grow(f2(), 1400)
                    CircularProgressIndicator(progress = { g }, modifier = Modifier.size(112.dp), color = cs.primary, trackColor = cs.onPrimaryContainer.copy(alpha = .12f), strokeWidth = 12.dp, strokeCap = StrokeCap.Round)
                    Text("${p2()}%", style = ty.titleLarge, color = cs.onPrimaryContainer)
                }
                Spacer(Modifier.width(20.dp))
                Column {
                    Text("Steg idag", style = ty.labelLarge, color = cs.onPrimaryContainer)
                    Text(n2(W.steps), style = ty.displaySmall, color = cs.onPrimaryContainer)
                    Text("Mål ${fmt(W.stepGoal)}", style = ty.bodyMedium, color = cs.onPrimaryContainer.copy(alpha = .8f))
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        // Listrader
        OutlinedCard(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
            ListItem(
                headlineContent = { Text("Puls") }, supportingContent = { Text(if (pulseLo() > 0) "Idag ${pulseLo()}–${pulseHi()} slag/min" else "Mät på klockan") },
                leadingContent = { MIcon(1, cs.errorContainer, cs.onErrorContainer) },
                trailingContent = { Text(n2(W.pulse), style = ty.titleLarge) }
            )
            HorizontalDivider(Modifier.padding(horizontal = 16.dp))
            ListItem(
                headlineContent = { Text("Batteri") },
                supportingContent = { val b = grow(if (W.battery >= 0) W.battery / 100f else 0f); LinearProgressIndicator(progress = { b }, modifier = Modifier.padding(top = 6.dp).fillMaxWidth().height(6.dp), strokeCap = StrokeCap.Round) },
                leadingContent = { MIcon(0, cs.tertiaryContainer, cs.onTertiaryContainer) },
                trailingContent = { Text(if (W.battery >= 0) "${W.battery} %" else "–", style = ty.titleLarge) }
            )
            HorizontalDivider(Modifier.padding(horizontal = 16.dp))
            ListItem(
                headlineContent = { Text("Mest aktiv") },
                supportingContent = { Text(topHours(1).firstOrNull()?.let { "Kl ${"%02d".format(it.first)} med ${fmt(it.second)} steg" } ?: "Inga steg ännu idag") },
                leadingContent = { MIcon(3, cs.secondaryContainer, cs.onSecondaryContainer) }
            )
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AssistChip(onClick = a.find, label = { Text("Hitta klockan") })
            AssistChip(onClick = a.time, label = { Text("Ställ tiden") })
            AssistChip(onClick = a.sync, label = { Text("Hämta hälsa") })
        }
        Spacer(Modifier.height(20.dp))
    }
}

/** Staplar i Material-stil; tryck på en stapel så visas dess värde i en etikett. */
@Composable
private fun M3Bars(v: List<Int>, labels: List<String>, m: Modifier) {
    val cs = MaterialTheme.colorScheme
    var sel by remember(v) { mutableIntStateOf(v.indices.maxByOrNull { v[it] } ?: -1) }
    val g = grow(1f, 900)
    Column(m) {
        Box(Modifier.fillMaxWidth().height(28.dp)) {
            if (sel in v.indices && v[sel] > 0) {
                Box(Modifier.align(Alignment.Center).clip(RoundedCornerShape(8.dp)).background(cs.inverseSurface).padding(horizontal = 10.dp, vertical = 4.dp)) {
                    Text("${labels.getOrElse(sel) { "" }}  ·  ${fmt(v[sel])} steg", color = cs.inverseOnSurface, style = MaterialTheme.typography.labelMedium)
                }
            }
        }
        Row(Modifier.fillMaxWidth().height(120.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
            val mx = maxOf(1, v.maxOrNull() ?: 1)
            v.forEachIndexed { i, x ->
                val h = (x / mx.toFloat() * g).coerceAtLeast(.03f)
                Box(Modifier.weight(1f).fillMaxHeight(h).clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp, bottomStart = 2.dp, bottomEnd = 2.dp))
                    .background(if (i == sel) cs.primary else cs.primary.copy(alpha = .35f)).clickable { sel = i })
            }
        }
    }
}

@Composable
fun M3Health(a: Acts) {
    val cs = MaterialTheme.colorScheme
    val ty = MaterialTheme.typography
    var week by remember { mutableIntStateOf(0) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
        Row(Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", style = ty.headlineLarge, modifier = Modifier.weight(1f))
            Button(onClick = a.sync) { Text("Hämta nu") }
        }
        SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
            listOf("Idag", "Veckan").forEachIndexed { i, t ->
                SegmentedButton(selected = week == i, onClick = { week = i }, shape = SegmentedButtonDefaults.itemShape(i, 2)) { Text(t) }
            }
        }
        Spacer(Modifier.height(12.dp))
        AnimatedContent(week, label = "period") { wk ->
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (wk == 0) {
                    Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
                        Column(Modifier.padding(20.dp)) {
                            Text("Steg", style = ty.titleMedium)
                            Row(verticalAlignment = Alignment.Bottom) { Text(n2(W.steps), style = ty.displayMedium); Text("  av ${fmt(W.stepGoal)}", style = ty.bodyLarge, color = cs.onSurfaceVariant, modifier = Modifier.padding(bottom = 10.dp)) }
                            val g = grow(f2(), 1300)
                            LinearProgressIndicator(progress = { g }, modifier = Modifier.fillMaxWidth().height(10.dp), strokeCap = StrokeCap.Round)
                        }
                    }
                    Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
                        Column(Modifier.padding(20.dp)) {
                            Text("Timme för timme", style = ty.titleMedium)
                            Text("Tryck på en stapel", style = ty.bodySmall, color = cs.onSurfaceVariant)
                            M3Bars(W.hours, List(24) { "Kl %02d".format(it) }, Modifier.fillMaxWidth().padding(top = 6.dp))
                        }
                    }
                    Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
                        Column(Modifier.padding(20.dp)) {
                            Text("Puls", style = ty.titleMedium)
                            Spacer(Modifier.height(10.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf("Senast" to W.pulse, "Lägst" to pulseLo(), "Högst" to pulseHi()).forEach { (k, v) ->
                                    Surface(Modifier.weight(1f), shape = RoundedCornerShape(20.dp), color = if (k == "Senast") cs.errorContainer else cs.surfaceContainerHighest) {
                                        Column(Modifier.padding(12.dp)) { Text(k, style = ty.labelMedium); Text(n2(v), style = ty.headlineSmall) }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp)) {
                        Column(Modifier.padding(20.dp)) {
                            val tot = W.week.filter { it > 0 }.sum(); val hit = W.week.count { it >= W.stepGoal }
                            Text("Veckan", style = ty.titleMedium)
                            Text("${fmt(tot)} steg · målet nått $hit av 7 dagar", style = ty.bodyMedium, color = cs.onSurfaceVariant)
                            M3Bars(W.week.map { maxOf(0, it) }, W.weekDays, Modifier.fillMaxWidth().padding(top = 6.dp))
                            Row(Modifier.fillMaxWidth()) { W.weekDays.forEach { Text(it, Modifier.weight(1f), style = ty.labelSmall, textAlign = TextAlign.Center, color = cs.onSurfaceVariant) } }
                        }
                    }
                    W.week.forEachIndexed { i, v ->
                        if (v >= 0) ListItem(
                            headlineContent = { Text(W.weekDays.getOrElse(i) { "" }) },
                            trailingContent = { Text(fmt(v), style = ty.titleMedium) },
                            supportingContent = { LinearProgressIndicator(progress = { (v / W.stepGoal.toFloat()).coerceIn(0f, 1f) }, modifier = Modifier.fillMaxWidth().padding(top = 4.dp), strokeCap = StrokeCap.Round) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent)
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(20.dp))
    }
}

// =====================================================================
// TIDNING – med ord och tabeller
// =====================================================================

private val PAPER = Color(0xFFF3EFE6); private val INK = Color(0xFF1B1A17); private val RED = Color(0xFF8A1C1C); private val GREY = Color(0xFF6E6A61)
private val SER = FontFamily.Serif

@Composable private fun TRule(th: Dp = 1.dp) = Box(Modifier.fillMaxWidth().padding(vertical = 10.dp).height(th).background(INK.copy(alpha = if (th > 1.dp) 1f else .3f)))

/** Rad med prickad ledare mellan text och värde, som i en tidningstabell. */
@Composable
private fun Leader(k: String, v: String, bold: Boolean = false, col: Color = INK) {
    Row(Modifier.fillMaxWidth().padding(vertical = 5.dp), verticalAlignment = Alignment.Bottom) {
        Text(k, color = col, fontFamily = SER, fontSize = 16.sp)
        Text(" " + ".".repeat(80), color = GREY.copy(alpha = .5f), fontFamily = SER, fontSize = 14.sp, maxLines = 1, softWrap = false, modifier = Modifier.weight(1f))
        Text(v, color = col, fontFamily = SER, fontSize = 16.sp, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
    }
}

@Composable
fun TidningHome2(a: Acts) {
    val fade = grow(1f, 700)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 18.dp).graphicsLayer { alpha = fade }) {
        Spacer(Modifier.height(14.dp))
        Text("LEDARE", color = RED, fontFamily = SER, fontSize = 11.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
        Text(
            when {
                W.steps < 0 -> "Klockan har ännu inte rapporterat"
                W.steps >= W.stepGoal -> "Dagens mål är nått"
                else -> "${fmt(W.stepGoal - W.steps)} steg kvar till målet"
            }, color = INK, fontFamily = SER, fontSize = 34.sp, fontWeight = FontWeight.Black, lineHeight = 38.sp
        )
        Spacer(Modifier.height(6.dp))
        Text(
            buildString {
                if (W.steps >= 0) append("Hittills ${fmt(W.steps)} steg, ${p2()} procent av målet. ")
                topHours(1).firstOrNull()?.let { append("Mest rörelse blev det klockan ${"%02d".format(it.first)}. ") }
                if (W.pulse > 0) append("Pulsen låg senast på ${W.pulse}.")
            }.ifEmpty { "Hämta från klockan under Hälsa." },
            color = INK, fontFamily = SER, fontSize = 17.sp, lineHeight = 25.sp
        )
        TRule(2.dp)
        Row {
            Column(Modifier.weight(1f)) {
                Box(Modifier.fillMaxWidth().aspectRatio(240f / 286f).border(1.dp, INK).padding(4.dp).background(Color.Black)) {
                    W.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
                }
                Text("Bild: ${W.dialName.ifEmpty { "urtavlan" }} på handleden i dag.", color = GREY, fontFamily = SER, fontSize = 12.sp, fontStyle = FontStyle.Italic, modifier = Modifier.padding(top = 4.dp))
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1.1f)) {
                Text("Dagens tabell", color = INK, fontFamily = SER, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Leader("Steg", n2(W.steps), true)
                Leader("Puls", n2(W.pulse))
                Leader("Batteri", if (W.battery >= 0) "${W.battery} %" else "–")
                Leader("Klockan", if (W.ready) "ansluten" else "söker", col = if (W.ready) INK else RED)
            }
        }
        TRule()
        Text("Mest aktiva timmar", color = INK, fontFamily = SER, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        val top = topHours(5)
        if (top.isEmpty()) Text("Inga steg registrerade ännu.", color = GREY, fontFamily = SER, fontSize = 15.sp, fontStyle = FontStyle.Italic)
        top.forEachIndexed { i, (h, v) -> Leader("${i + 1}.  Klockan ${"%02d".format(h)}–${"%02d".format((h + 1) % 24)}", "${fmt(v)} steg", i == 0, if (i == 0) RED else INK) }
        TRule()
        Row(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
            listOf("Byt urtavla" to a.dials, "Hitta klockan" to a.find, "Ställ tiden" to a.time, "Stil" to a.stil).forEach { (t, f) ->
                Text(t, Modifier.clickable(onClick = f).padding(vertical = 6.dp), color = RED, fontFamily = SER, fontSize = 15.sp, fontStyle = FontStyle.Italic)
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
fun TidningHealth2(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 18.dp)) {
        Spacer(Modifier.height(14.dp))
        Text("HÄLSA · RAPPORT", color = RED, fontFamily = SER, fontSize = 11.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
        Text("Så rörde du dig", color = INK, fontFamily = SER, fontSize = 34.sp, fontWeight = FontWeight.Black)
        Text("Hämta nya siffror från klockan", Modifier.clickable(onClick = a.sync).padding(vertical = 6.dp), color = RED, fontFamily = SER, fontSize = 15.sp, fontStyle = FontStyle.Italic)
        TRule(2.dp)
        Row {
            listOf("Steg" to n2(W.steps), "Av målet" to "${p2()} %", "Puls" to n2(W.pulse)).forEachIndexed { i, (k, v) ->
                if (i > 0) Box(Modifier.width(1.dp).height(58.dp).background(INK.copy(alpha = .3f)))
                Column(Modifier.weight(1f).padding(start = if (i > 0) 12.dp else 0.dp)) {
                    Text(k, color = GREY, fontFamily = SER, fontSize = 13.sp)
                    Text(v, color = if (i == 2) RED else INK, fontFamily = SER, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        TRule()
        Text("Pulsen i siffror", color = INK, fontFamily = SER, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text(if (pulseLo() > 0) "Under dagen pendlade pulsen mellan ${pulseLo()} och ${pulseHi()} slag i minuten. Den senaste mätningen visade ${n2(W.pulse)}." else "Inga pulsmätningar ännu.",
            color = INK, fontFamily = SER, fontSize = 16.sp, lineHeight = 23.sp)
        TRule()
        Text("Timtabell", color = INK, fontFamily = SER, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        val act = W.hours.mapIndexed { h, v -> h to v }.filter { it.second > 0 }
        if (act.isEmpty()) Text("Inga steg ännu.", color = GREY, fontFamily = SER, fontStyle = FontStyle.Italic)
        val mx = act.maxOfOrNull { it.second } ?: 1
        act.chunked(2).forEach { row ->
            Row(Modifier.fillMaxWidth()) {
                row.forEach { (h, v) ->
                    Row(Modifier.weight(1f).padding(vertical = 3.dp, horizontal = 2.dp)) {
                        Text("%02d".format(h), color = GREY, fontFamily = SER, fontSize = 14.sp, modifier = Modifier.width(28.dp))
                        Text(fmt(v), color = if (v == mx) RED else INK, fontFamily = SER, fontSize = 14.sp, fontWeight = if (v == mx) FontWeight.Bold else FontWeight.Normal)
                    }
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
        TRule()
        Text("Veckan", color = INK, fontFamily = SER, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        W.week.forEachIndexed { i, v -> Leader(W.weekDays.getOrElse(i) { "" }.replaceFirstChar { it.uppercase() }, if (v >= W.stepGoal) "${n2(v)}  ✓" else n2(v), v >= W.stepGoal, if (v >= W.stepGoal) RED else INK) }
        Spacer(Modifier.height(24.dp))
    }
}

// =====================================================================
// BENTO – rutor som fylls, värmekartor, löpande EKG
// =====================================================================

private val BG = Color(0xFF0B0D12); private val CARD = Color(0xFF171A22); private val GREEN = Color(0xFF1F8A5B)
private val ORANGE = Color(0xFFFF8A3C); private val LILAC = Color(0xFFB9A7FF); private val TXT = Color(0xFFF1F2F6); private val MUTED = Color(0xFF8C92A4)

/** Ruta som fylls nedifrån som ett glas, med en vågig yta som rör sig i sidled. */
@Composable
private fun FillTile(f: Float, fill: Color, empty: Color, m: Modifier, content: @Composable BoxScope.() -> Unit) {
    val g = grow(f, 1600)
    val ph by rememberInfiniteTransition(label = "våg").animateFloat(0f, (2 * PI).toFloat(), infiniteRepeatable(tween(3200, easing = LinearEasing)), label = "fas")
    Box(m.clip(RoundedCornerShape(26.dp)).background(empty)) {
        Canvas(Modifier.matchParentSize()) {
            val top = size.height * (1f - g)
            val p = Path().apply {
                moveTo(0f, size.height); lineTo(0f, top)
                var x = 0f
                while (x <= size.width) { lineTo(x, top + sin(x / size.width * 2 * PI.toFloat() * 1.5f + ph) * 7f); x += 8f }
                lineTo(size.width, size.height); close()
            }
            drawPath(p, fill)
        }
        content()
    }
}

/** Värmekarta: en ruta per värde, starkare färg ju större värde. */
@Composable
private fun Heat(v: List<Int>, cols: Int, col: Color, m: Modifier, labels: List<String>? = null) {
    val mx = maxOf(1, v.maxOrNull() ?: 1)
    Column(m, verticalArrangement = Arrangement.spacedBy(5.dp)) {
        v.chunked(cols).forEachIndexed { r, row ->
            Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                row.forEachIndexed { c, x ->
                    val i = r * cols + c
                    val a = grow(if (x > 0) .18f + .82f * x / mx else .06f, 500, 25 * i)
                    Box(Modifier.weight(1f).aspectRatio(1f).clip(RoundedCornerShape(7.dp)).background(col.copy(alpha = a)), contentAlignment = Alignment.Center) {
                        labels?.getOrNull(i)?.let { Text(it, color = if (a > .5f) BG else MUTED, fontSize = 9.sp, fontWeight = FontWeight.Bold) }
                    }
                }
            }
        }
    }
}

/** EKG-linje som löper åt vänster i pulsens takt. */
@Composable
private fun Ecg(bpm: Int, col: Color, m: Modifier) {
    val period = if (bpm > 30) (60000 / bpm) else 1000
    val x by rememberInfiniteTransition(label = "ekg").animateFloat(0f, 1f, infiniteRepeatable(tween(period * 3, easing = LinearEasing)), label = "x")
    Canvas(m) {
        val beatW = size.width / 3; val mid = size.height * .6f; val p = Path()
        var started = false
        for (k in -1..4) {
            val ox = k * beatW - ((x * 3f) % 1f) * beatW
            val pts = listOf(0f to 0f, .30f to 0f, .36f to -.15f, .42f to 0f, .48f to .12f, .52f to -1f, .57f to .35f, .62f to 0f, .78f to -.2f, .88f to 0f, 1f to 0f)
            for ((fx, fy) in pts) { val px = ox + fx * beatW; val py = mid + fy * size.height * .5f; if (!started) { p.moveTo(px, py); started = true } else p.lineTo(px, py) }
        }
        drawPath(p, col, style = Stroke(4f, cap = StrokeCap.Round, join = StrokeJoin.Round))
    }
}

@Composable
private fun pop(i: Int): Modifier {
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(60L * i); on = true }
    val s by animateFloatAsState(if (on) 1f else .85f, spring(dampingRatio = .55f, stiffness = 260f), label = "pop")
    val a by animateFloatAsState(if (on) 1f else 0f, tween(250), label = "a")
    return Modifier.graphicsLayer { scaleX = s; scaleY = s; alpha = a }
}

@Composable
fun BentoHome2(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Idag", color = TXT, fontSize = 30.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 4.dp, top = 4.dp))
        Row(Modifier.height(230.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            // stegen fyller rutan
            FillTile(f2(), GREEN, CARD, pop(0).weight(1f).fillMaxHeight().clickable(onClick = a.health)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Steg", color = TXT.copy(alpha = .8f), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Text(n2(W.steps), color = TXT, fontSize = 34.sp, fontWeight = FontWeight.Black)
                }
                Text("${p2()} %", Modifier.align(Alignment.BottomStart).padding(16.dp), color = TXT, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(pop(1).fillMaxWidth().weight(1f).clip(RoundedCornerShape(26.dp)).background(CARD).clickable(onClick = a.dials)) {
                    W.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop, alpha = .9f) }
                    Text(W.dialName.ifEmpty { "Urtavla" }, Modifier.align(Alignment.BottomStart).background(Color.Black.copy(alpha = .55f), RoundedCornerShape(topEnd = 12.dp)).padding(8.dp), color = TXT, fontSize = 12.sp, maxLines = 1)
                }
                // batteriet som en stående cell
                FillTile(if (W.battery >= 0) W.battery / 100f else 0f, ORANGE, CARD, pop(2).fillMaxWidth().height(80.dp)) {
                    Row(Modifier.fillMaxSize().padding(horizontal = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("Batteri", color = TXT, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text(if (W.battery >= 0) "${W.battery}%" else "–", color = TXT, fontSize = 24.sp, fontWeight = FontWeight.Black)
                    }
                }
            }
        }
        // pulsen som löpande EKG
        Column(pop(3).fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(LILAC).padding(16.dp)) {
            Row(verticalAlignment = Alignment.Bottom) {
                Text(n2(W.pulse), color = Color(0xFF1B1240), fontSize = 40.sp, fontWeight = FontWeight.Black)
                Text(" slag/min", color = Color(0xFF1B1240), fontSize = 14.sp, modifier = Modifier.padding(bottom = 8.dp))
            }
            Ecg(W.pulse, Color(0xFF1B1240), Modifier.fillMaxWidth().height(54.dp))
        }
        // timmarna som värmekarta
        Column(pop(4).fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(CARD).padding(16.dp)) {
            Text("Dygnet, timme för timme", color = TXT, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(10.dp))
            Heat(W.hours, 8, ORANGE, Modifier.fillMaxWidth(), List(24) { "%02d".format(it) })
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf("Hitta" to a.find, "Tiden" to a.time, "Stil" to a.stil).forEachIndexed { k, (t, f) ->
                Box(pop(5 + k).weight(1f).height(64.dp).clip(RoundedCornerShape(22.dp)).background(CARD).clickable(onClick = f), contentAlignment = Alignment.Center) {
                    Text(t, color = TXT, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
fun BentoHealth2(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", color = TXT, fontSize = 30.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f).padding(start = 4.dp))
            Box(Modifier.clip(CircleShape).background(ORANGE).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 10.dp)) { Text("Hämta", color = Color(0xFF2A1406), fontWeight = FontWeight.Bold) }
        }
        FillTile(f2(), GREEN, CARD, pop(0).fillMaxWidth().height(170.dp)) {
            Column(Modifier.padding(18.dp)) {
                Text("Steg idag", color = TXT.copy(alpha = .8f), fontSize = 13.sp)
                Text(n2(W.steps), color = TXT, fontSize = 44.sp, fontWeight = FontWeight.Black)
                Text("Rutan är full vid ${fmt(W.stepGoal)}", color = TXT.copy(alpha = .8f), fontSize = 12.sp)
            }
        }
        Column(pop(1).fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(CARD).padding(16.dp)) {
            Text("Dygnet", color = TXT, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Text("Starkare färg = fler steg den timmen", color = MUTED, fontSize = 12.sp)
            Spacer(Modifier.height(10.dp))
            Heat(W.hours, 6, ORANGE, Modifier.fillMaxWidth(), List(24) { "%02d".format(it) })
        }
        Column(pop(2).fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(LILAC).padding(16.dp)) {
            Row { listOf("Senast" to W.pulse, "Lägst" to pulseLo(), "Högst" to pulseHi()).forEach { (k, v) ->
                Column(Modifier.weight(1f)) { Text(k, color = Color(0xFF1B1240), fontSize = 12.sp); Text(n2(v), color = Color(0xFF1B1240), fontSize = 28.sp, fontWeight = FontWeight.Black) } } }
            Ecg(W.pulse, Color(0xFF1B1240), Modifier.fillMaxWidth().height(60.dp))
        }
        Column(pop(3).fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(CARD).padding(16.dp)) {
            Text("Veckan", color = TXT, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(10.dp))
            Heat(W.week.map { maxOf(0, it) }, 7, GREEN, Modifier.fillMaxWidth(), W.weekDays.map { it.take(3) })
            Spacer(Modifier.height(6.dp))
            Text("Målet nått ${W.week.count { it >= W.stepGoal }} av 7 dagar", color = MUTED, fontSize = 12.sp)
        }
        Spacer(Modifier.height(8.dp))
    }
}

// =====================================================================
// BRUTAL – staplade block, kvitton, tjocka liggande staplar
// =====================================================================

private val YEL = Color(0xFFFFF36B); private val PINK = Color(0xFFFF4FD2); private val BLUE = Color(0xFF4DD2FF); private val LIME = Color(0xFFB6FF6B)

/** Ett block per 1 000 steg. Målets block ritas som tomma rutor; fyllda block slås in ett i taget. */
@Composable
private fun StepBlocks(m: Modifier) {
    val goalB = (W.stepGoal / 1000).coerceIn(1, 20)
    val got = if (W.steps >= 0) W.steps / 1000f else 0f
    val total = maxOf(goalB, kotlin.math.ceil(got.toDouble()).toInt()).coerceAtMost(30)
    Row(m, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        for (i in 0 until total) {
            val part = (got - i).coerceIn(0f, 1f)
            var on by remember { mutableStateOf(false) }
            LaunchedEffect(Unit) { delay(90L * i); on = true }
            val dy by animateFloatAsState(if (on) 0f else -60f, spring(dampingRatio = .4f, stiffness = 500f), label = "slag")
            Box(Modifier.weight(1f).height(46.dp).graphicsLayer { translationY = if (part > 0f) dy else 0f }.background(Color.White).border(3.dp, Color.Black)) {
                if (part > 0f) Box(Modifier.fillMaxHeight().fillMaxWidth(part).background(if (i >= goalB) LIME else PINK).border(3.dp, Color.Black))
            }
        }
    }
}

@Composable
private fun Thick(label: String, v: Int, mx: Int, col: Color, i: Int) {
    val g = grow(if (mx > 0) v / mx.toFloat() else 0f, 700, 70 * i)
    Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label.uppercase(), Modifier.width(48.dp), color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Black)
        Box(Modifier.weight(1f).height(28.dp)) {
            Box(Modifier.fillMaxHeight().fillMaxWidth(g.coerceIn(.02f, 1f)).background(col).border(3.dp, Color.Black))
        }
        Text(n2(v), Modifier.width(64.dp), color = Color.Black, fontSize = 13.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.End)
    }
}

@Composable
private fun BrBox(col: Color, m: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    Box(m.padding(end = 6.dp, bottom = 6.dp)) {
        Box(Modifier.matchParentSize().offset(6.dp, 6.dp).background(Color.Black))
        Column(Modifier.fillMaxWidth().background(col).border(3.dp, Color.Black).then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(14.dp), content = content)
    }
}

@Composable private fun BL(t: String) = Text(t, color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)

@Composable
fun BrutalHome2(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(n2(W.steps), color = Color.Black, fontSize = 64.sp, fontWeight = FontWeight.Black, letterSpacing = (-3).sp, lineHeight = 64.sp)
        BL("STEG · ETT BLOCK = 1 000")
        StepBlocks(Modifier.fillMaxWidth())
        Spacer(Modifier.height(4.dp))
        Row {
            BrBox(LIME, Modifier.weight(1f)) { BL("PULS"); Text(n2(W.pulse), color = Color.Black, fontSize = 52.sp, fontWeight = FontWeight.Black) }
            BrBox(BLUE, Modifier.weight(1f), a.dials) {
                BL("URTAVLA")
                Box(Modifier.fillMaxWidth().aspectRatio(1.2f).border(3.dp, Color.Black).background(Color.Black)) { W.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) } }
            }
        }
        BrBox(Color.White, Modifier.fillMaxWidth()) {
            BL("BATTERI")
            Spacer(Modifier.height(6.dp))
            val lit = if (W.battery >= 0) (W.battery / 10f).roundToInt() else 0
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) { repeat(10) { i -> Box(Modifier.weight(1f).height(26.dp).background(if (i < lit) (if (W.battery < 20) Color.Red else Color.Black) else Color.White).border(3.dp, Color.Black)) } }
        }
        BrBox(PINK, Modifier.fillMaxWidth()) {
            BL("KVITTO · MEST AKTIVA TIMMAR")
            Spacer(Modifier.height(6.dp))
            val top = topHours(3)
            if (top.isEmpty()) BL("INGA STEG ÄN")
            top.forEach { (h, v) -> Row(Modifier.fillMaxWidth()) { Text("KL %02d".format(h), color = Color.Black, fontSize = 18.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(1f)); Text(fmt(v), color = Color.Black, fontSize = 18.sp, fontWeight = FontWeight.Black) } }
        }
        Row {
            BrBox(Color.White, Modifier.weight(1f), a.find) { BL("HITTA") }
            BrBox(Color.White, Modifier.weight(1f), a.time) { BL("TID") }
            BrBox(Color.Black, Modifier.weight(1f), a.stil) { Text("STIL", color = YEL, fontSize = 12.sp, fontWeight = FontWeight.Black) }
        }
        Spacer(Modifier.height(10.dp))
    }
}

@Composable
fun BrutalHealth2(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("HÄLSA", color = Color.Black, fontSize = 48.sp, fontWeight = FontWeight.Black, letterSpacing = (-2).sp)
        BrBox(PINK, Modifier.fillMaxWidth(), a.sync) { BL("TRYCK = HÄMTA FRÅN KLOCKAN") }
        BrBox(Color.White, Modifier.fillMaxWidth()) { BL("STEG · ${n2(W.steps)} AV ${fmt(W.stepGoal)}"); Spacer(Modifier.height(6.dp)); StepBlocks(Modifier.fillMaxWidth()) }
        BrBox(LIME, Modifier.fillMaxWidth()) {
            BL("PULS")
            Row { listOf("NU" to W.pulse, "LÅG" to pulseLo(), "HÖG" to pulseHi()).forEach { (k, v) -> Column(Modifier.weight(1f)) { BL(k); Text(n2(v), color = Color.Black, fontSize = 34.sp, fontWeight = FontWeight.Black) } } }
        }
        BrBox(Color.White, Modifier.fillMaxWidth()) {
            BL("VECKAN")
            Spacer(Modifier.height(6.dp))
            val mx = maxOf(W.stepGoal, W.week.maxOrNull() ?: 0)
            W.week.forEachIndexed { i, v -> Thick(W.weekDays.getOrElse(i) { "" }.take(3), maxOf(0, v), mx, if (v >= W.stepGoal) PINK else BLUE, i) }
        }
        BrBox(YEL, Modifier.fillMaxWidth()) {
            BL("KVITTO · TIMMAR MED STEG")
            Spacer(Modifier.height(6.dp))
            val act = W.hours.mapIndexed { h, v -> h to v }.filter { it.second > 0 }
            val mx = act.maxOfOrNull { it.second } ?: 1
            act.forEachIndexed { i, (h, v) -> Thick("%02d".format(h), v, mx, if (v == mx) PINK else Color.White, i) }
            if (act.isEmpty()) BL("INGA STEG ÄN")
        }
        Spacer(Modifier.height(10.dp))
    }
}

// =====================================================================
// NORRSKEN – klot, ringar och stjärnbild
// =====================================================================

private val NTEAL = Color(0xFF1DE9B6); private val NVIO = Color(0xFF7C4DFF); private val NBLUE = Color(0xFF2979FF); private val NPINK = Color(0xFFFF6B9A)

/** Glödande klot vars storlek och ljus växer med andelen av målet. Andas sakta. */
@Composable
private fun Orb(f: Float, col: Color, m: Modifier, content: @Composable BoxScope.() -> Unit) {
    val g = grow(f, 1800)
    val br by rememberInfiniteTransition(label = "andas").animateFloat(.92f, 1.04f, infiniteRepeatable(tween(2800, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "b")
    Box(m, contentAlignment = Alignment.Center) {
        Canvas(Modifier.matchParentSize()) {
            val r = size.minDimension / 2 * (.35f + .65f * g) * br
            drawCircle(Brush.radialGradient(listOf(col.copy(alpha = .55f), col.copy(alpha = .12f), Color.Transparent), center, r * 1.5f), r * 1.5f, center)
            drawCircle(Brush.radialGradient(listOf(Color.White.copy(alpha = .9f), col, col.copy(alpha = .2f)), center, r), r, center)
            drawCircle(Color.White.copy(alpha = .25f), size.minDimension / 2 * .98f, center, style = Stroke(1.5f))
        }
        content()
    }
}

/** Ringar som sprids utåt i pulsens takt, som vågor på vatten. */
@Composable
private fun Ripples(bpm: Int, col: Color, m: Modifier) {
    val period = if (bpm > 30) 60000 / bpm else 1000
    val t by rememberInfiniteTransition(label = "vågor").animateFloat(0f, 1f, infiniteRepeatable(tween(period, easing = LinearEasing)), label = "t")
    Canvas(m) {
        val R = size.minDimension / 2
        for (k in 0..2) {
            val p = ((t + k / 3f) % 1f)
            drawCircle(col.copy(alpha = (1f - p) * .7f), R * (.25f + .75f * p), center, style = Stroke(3f + 4f * (1 - p)))
        }
        drawCircle(col, R * .2f, center)
    }
}

/** Veckan som stjärnbild: en stjärna per dag, större ju fler steg, förbundna med linjer. */
@Composable
private fun Constellation(v: List<Int>, days: List<String>, goal: Int, m: Modifier) {
    val g = grow(1f, 1600)
    val tw by rememberInfiniteTransition(label = "blink").animateFloat(.6f, 1f, infiniteRepeatable(tween(1700), RepeatMode.Reverse), label = "tw")
    Box(m) {
        Canvas(Modifier.matchParentSize()) {
            val mx = maxOf(1, v.maxOrNull() ?: 1)
            val pts = v.mapIndexed { i, x -> Offset(size.width * (i + .5f) / v.size, size.height * (.85f - .7f * maxOf(0, x) / mx.toFloat())) }
            val n = (pts.size * g).toInt().coerceIn(1, pts.size)
            for (i in 0 until n - 1) drawLine(Color.White.copy(alpha = .35f), pts[i], pts[i + 1], 2f)
            pts.take(n).forEachIndexed { i, p ->
                val big = v[i] >= goal
                val r = 4f + 10f * maxOf(0, v[i]) / mx
                drawCircle(Brush.radialGradient(listOf((if (big) NTEAL else Color.White).copy(alpha = .6f * tw), Color.Transparent), p, r * 3), r * 3, p)
                drawCircle(if (big) NTEAL else Color.White, r * .55f, p)
            }
        }
        Row(Modifier.align(Alignment.BottomCenter).fillMaxWidth()) { days.forEach { Text(it, Modifier.weight(1f), color = Color.White.copy(alpha = .55f), fontSize = 10.sp, textAlign = TextAlign.Center) } }
    }
}

/** Dygnet som ett band av norrsken: höjd = steg, färgen skimrar. */
@Composable
private fun Ribbon(v: List<Int>, m: Modifier) {
    val g = grow(1f, 1500)
    val sh by rememberInfiniteTransition(label = "skimmer").animateFloat(0f, 1f, infiniteRepeatable(tween(5000, easing = LinearEasing), RepeatMode.Reverse), label = "s")
    Canvas(m) {
        if (v.isEmpty()) return@Canvas
        val mx = maxOf(1, v.max()).toFloat(); val w = size.width / (v.size - 1).coerceAtLeast(1)
        val top = Path(); val area = Path()
        v.forEachIndexed { i, x -> val px = i * w; val py = size.height - x / mx * size.height * .9f * g - 4f
            if (i == 0) { top.moveTo(px, py); area.moveTo(px, size.height); area.lineTo(px, py) } else { top.lineTo(px, py); area.lineTo(px, py) } }
        area.lineTo(size.width, size.height); area.close()
        drawPath(area, Brush.horizontalGradient(listOf(NTEAL.copy(alpha = .55f), NVIO.copy(alpha = .55f), NBLUE.copy(alpha = .55f)), startX = -size.width * sh, endX = size.width * (2 - sh)))
        drawPath(top, Color.White.copy(alpha = .8f), style = Stroke(2.5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
    }
}

@Composable
private fun NGlass(m: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) =
    Column(m.clip(RoundedCornerShape(28.dp)).background(Color.White.copy(alpha = .08f)).border(1.dp, Color.White.copy(alpha = .16f), RoundedCornerShape(28.dp)).padding(16.dp), content = content)

@Composable
fun NorrskenHome2(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(180.dp, 214.dp).clip(RoundedCornerShape(48.dp)).background(Color.Black).border(2.dp, Color.White.copy(alpha = .22f), RoundedCornerShape(48.dp)).clickable(onClick = a.dials)) {
            W.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
        }
        Text(W.dialName.ifEmpty { "Urtavla" }, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 8.dp))
        Text(if (W.ready) "Ansluten" else "Söker klockan …", color = Color.White.copy(alpha = .6f), fontSize = 13.sp)
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            NGlass(Modifier.weight(1f)) {
                Orb(f2(), NTEAL, Modifier.fillMaxWidth().aspectRatio(1f)) { Text(n2(W.steps), color = Color(0xFF02221A), fontSize = 18.sp, fontWeight = FontWeight.Bold) }
                Text("Steg · ${p2()} %", color = Color.White.copy(alpha = .75f), fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterHorizontally))
            }
            NGlass(Modifier.weight(1f)) {
                Box(Modifier.fillMaxWidth().aspectRatio(1f), contentAlignment = Alignment.Center) {
                    Ripples(W.pulse, NPINK, Modifier.matchParentSize())
                    Text(n2(W.pulse), color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                }
                Text("Puls, i sin takt", color = Color.White.copy(alpha = .75f), fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterHorizontally))
            }
        }
        Spacer(Modifier.height(12.dp))
        NGlass(Modifier.fillMaxWidth()) {
            Text("Dygnet som norrsken", color = Color.White.copy(alpha = .85f), fontSize = 13.sp)
            Ribbon(W.hours, Modifier.fillMaxWidth().height(80.dp).padding(top = 8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { listOf("00", "06", "12", "18", "24").forEach { Text(it, color = Color.White.copy(alpha = .5f), fontSize = 10.sp) } }
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

@Composable
fun NorrskenHealth2(a: Acts) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Hälsa", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
            Box(Modifier.clip(CircleShape).background(Color.White.copy(alpha = .14f)).clickable(onClick = a.sync).padding(horizontal = 16.dp, vertical = 10.dp)) { Text("Hämta", color = Color.White) }
        }
        NGlass(Modifier.fillMaxWidth()) {
            Orb(f2(), NTEAL, Modifier.fillMaxWidth().height(200.dp)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(n2(W.steps), color = Color(0xFF02221A), fontSize = 30.sp, fontWeight = FontWeight.Bold)
                    Text("${p2()} % av ${fmt(W.stepGoal)}", color = Color(0xFF02221A), fontSize = 12.sp)
                }
            }
            Text("Klotet växer och lyser starkare ju närmare målet du är", color = Color.White.copy(alpha = .6f), fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
        }
        NGlass(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(110.dp), contentAlignment = Alignment.Center) { Ripples(W.pulse, NPINK, Modifier.matchParentSize()); Text(n2(W.pulse), color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold) }
                Spacer(Modifier.width(16.dp))
                Column {
                    Text("Puls", color = Color.White, fontSize = 16.sp)
                    Text(if (pulseLo() > 0) "Lägst ${pulseLo()} · högst ${pulseHi()}" else "Inga mätningar ännu", color = Color.White.copy(alpha = .65f), fontSize = 13.sp)
                    Text("Ringarna slår i din senaste takt", color = Color.White.copy(alpha = .45f), fontSize = 12.sp)
                }
            }
        }
        NGlass(Modifier.fillMaxWidth()) {
            Text("Dygnet som norrsken", color = Color.White, fontSize = 15.sp)
            Ribbon(W.hours, Modifier.fillMaxWidth().height(100.dp).padding(top = 8.dp))
        }
        NGlass(Modifier.fillMaxWidth()) {
            Text("Veckan som stjärnbild", color = Color.White, fontSize = 15.sp)
            Text("Gröna stjärnor = målet nått", color = Color.White.copy(alpha = .55f), fontSize = 12.sp)
            Constellation(W.week, W.weekDays, W.stepGoal, Modifier.fillMaxWidth().height(150.dp).padding(top = 6.dp))
        }
        Spacer(Modifier.height(8.dp))
    }
}
