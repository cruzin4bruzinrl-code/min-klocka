package se.minklocka.app

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/*
 * Gemensamt för alla stilar, så att appen är lätt att förstå oavsett utseende:
 *  - samma meny längst ner (ikon + text), i stilens färger och form
 *  - "Idag i korthet" överst på Klocka: varje värde med en enkel bild och en mening om vad det betyder
 *  - "Så läser du" överst på Hälsa: vad diagrammen visar och vad som är bra
 */

/** Stilens färger och form, för menyn och guiden. */
class Pal(
    val bg: Color, val card: Color, val ink: Color, val dim: Color, val acc: Color, val onAcc: Color,
    val good: Color, val warn: Color, val bad: Color, val font: FontFamily? = null, val r: Dp = 22.dp, val border: Dp = 0.dp, val borderCol: Color = Color.Transparent
)

@Composable
fun pal(s: Stil): Pal {
    val cs = MaterialTheme.colorScheme
    return when (s) {
        Stil.MATERIAL -> Pal(cs.surfaceContainer, cs.surfaceContainerHigh, cs.onSurface, cs.onSurfaceVariant, cs.primaryContainer, cs.onPrimaryContainer, Color(0xFF2E9E5B), Color(0xFFE0A100), cs.error, r = 24.dp)
        Stil.COCKPIT -> Pal(Color(0xFF03090D), Color(0xFF07161C), Color(0xFFCFEFF5), Color(0xFF5E8A93), Color(0xFF2EF2FF), Color(0xFF03090D), Color(0xFF2EF2FF), Color(0xFFFFB020), Color(0xFFFF5A5A), FontFamily.Monospace, 4.dp, 1.dp, Color(0xFF2B5058))
        Stil.TIDNING -> Pal(Color(0xFFF3EFE6), Color(0xFFEDE7DA), Color(0xFF1B1A17), Color(0xFF6E6A61), Color(0xFF1B1A17), Color(0xFFF3EFE6), Color(0xFF1B1A17), Color(0xFF8A6A1C), Color(0xFF8A1C1C), FontFamily.Serif, 0.dp, 1.dp, Color(0xFF1B1A17))
        Stil.BENTO -> Pal(Color(0xFF0B0D12), Color(0xFF171A22), Color(0xFFF1F2F6), Color(0xFF8C92A4), Color(0xFFFF8A3C), Color(0xFF2A1406), Color(0xFF34C77B), Color(0xFFFFB020), Color(0xFFFF5A5A), r = 26.dp)
        Stil.BRUTAL -> Pal(Color(0xFFFFF36B), Color.White, Color.Black, Color(0xFF444444), Color(0xFFFF4FD2), Color.Black, Color(0xFF2BB673), Color(0xFFFF9F1C), Color(0xFFE5383B), null, 0.dp, 3.dp, Color.Black)
        Stil.NORRSKEN -> Pal(Color(0x22FFFFFF), Color(0x1AFFFFFF), Color.White, Color(0xB3FFFFFF), Color(0xFF1DE9B6), Color(0xFF02221A), Color(0xFF1DE9B6), Color(0xFFFFD166), Color(0xFFFF6B9A), r = 28.dp, border = 1.dp, borderCol = Color(0x33FFFFFF))
        Stil.PRICK -> Pal(Color.Black, Color(0xFF111111), Color(0xFFEDEDED), Color(0xFF8A8A8A), Color(0xFFE8202A), Color.White, Color(0xFFEDEDED), Color(0xFFFFB020), Color(0xFFE8202A), FontFamily.Monospace, 12.dp)
        Stil.TERMINAL -> Pal(Color(0xFF070B07), Color(0xFF0C140C), Color(0xFF39FF14), Color(0xFF1E6B1E), Color(0xFF39FF14), Color(0xFF070B07), Color(0xFF39FF14), Color(0xFFFFB000), Color(0xFFFF4040), FontFamily.Monospace, 0.dp, 1.dp, Color(0xFF1E6B1E))
        Stil.LCD -> Pal(Color(0xFF26282B), Color(0xFFA3B38C), Color(0xFF1C2416), Color(0xFF4A5A3A), Color(0xFF1C2416), Color(0xFFA3B38C), Color(0xFF1C2416), Color(0xFF5A4A10), Color(0xFF8A1010), FontFamily.Monospace, 10.dp, 3.dp, Color(0xFF111111))
        Stil.KLADD -> Pal(Color(0xFFFFFBEA), Color(0xFFFFF4C2), Color(0xFF26304A), Color(0xFF5B6478), Color(0xFFFFE066), Color(0xFF26304A), Color(0xFF2B8A3E), Color(0xFFE8590C), Color(0xFFE03131), FontFamily.Cursive, 4.dp)
        Stil.RADAR -> Pal(Color(0xFF151A22), Color(0xFF1A1F29), Color(0xFFF2F4F8), Color(0xFF8A92A3), Color(0xFFFF6A5A), Color.White, Color(0xFF3DDC97), Color(0xFFFF8A3D), Color(0xFFFF3D7F), r = 28.dp)
        Stil.KORT -> Pal(Color.White, Color.White, Color(0xFF1F1A2E), Color(0xFF6B6480), Color(0xFF1F1A2E), Color.White, Color(0xFF00A86B), Color(0xFFFF8A3D), Color(0xFFFF3D6E), r = 26.dp)
        Stil.TIDSLINJE -> Pal(Color.White, Color.White, Color(0xFF1E293B), Color(0xFF64748B), Color(0xFF4F46E5), Color.White, Color(0xFF10B981), Color(0xFFF59E0B), Color(0xFFEF4444), r = 20.dp)
    }
}

// ---------------------------------------------------------------------
// Meny: samma för alla stilar
// ---------------------------------------------------------------------

private val NAV = listOf("Klocka", "Hälsa", "Urtavlor", "Verktyg", "Mer")

@Composable
fun StyledNav(s: Stil, tab: Int, onTab: (Int) -> Unit) {
    val p = pal(s)
    val shape = RoundedCornerShape(p.r + 4.dp)
    BoxWithConstraints(
        Modifier.padding(horizontal = 12.dp, vertical = 10.dp).fillMaxWidth().height(64.dp)
            .clip(shape).background(p.bg).border(maxOf(p.border, 0.dp), p.borderCol, shape).padding(5.dp)
    ) {
        val w = maxWidth / 5
        val x by animateDpAsState(w * tab, spring(dampingRatio = .65f, stiffness = 380f), label = "meny")
        Box(Modifier.offset(x = x).width(w).fillMaxHeight().clip(RoundedCornerShape(p.r)).background(p.acc))
        Row(Modifier.fillMaxSize()) {
            NAV.forEachIndexed { i, l ->
                val on = i == tab
                val col by animateColorAsState(if (on) p.onAcc else p.dim, tween(220), label = "färg")
                val sc by animateFloatAsState(if (on) 1.1f else 1f, spring(dampingRatio = .45f, stiffness = 420f), label = "ikon")
                Column(
                    Modifier.weight(1f).fillMaxHeight().clickable(remember { androidx.compose.foundation.interaction.MutableInteractionSource() }, null) { onTab(i) },
                    horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center
                ) {
                    DockIconPub(i, col, Modifier.graphicsLayer { scaleX = sc; scaleY = sc })
                    Text(l, color = col, fontSize = 11.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Medium, fontFamily = p.font, maxLines = 1, modifier = Modifier.padding(top = 2.dp))
                }
            }
        }
    }
}

/** Gemensam ram: stilens bakgrund, en liten stilrubrik, innehållet och menyn längst ner. */
@Composable
fun UnifiedShell(s: Stil, tab: Int, onTab: (Int) -> Unit, body: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize()) {
        StilBackdrop(s)
        Column(Modifier.fillMaxSize()) {
            StilHeader(s)
            Box(Modifier.weight(1f).fillMaxWidth()) { body() }
            StyledNav(s, tab, onTab)
        }
    }
}

// ---------------------------------------------------------------------
// Guide
// ---------------------------------------------------------------------

private val G = WatchState

private class Row3(val label: String, val value: String, val text: String, val level: Int, val frac: Float?, val kind: Int)

private fun todayRows(): List<Row3> {
    val out = mutableListOf<Row3>()
    if (!G.ready) out.add(Row3("Klockan", "Inte ansluten", "Håll klockan nära telefonen med Bluetooth på. Appen försöker igen av sig själv.", 1, null, 0))
    if (G.steps >= 0) {
        val left = G.stepGoal - G.steps
        out.add(
            if (left <= 0) Row3("Steg", fmt(G.steps), "Dagens mål på ${fmt(G.stepGoal)} är nått. Bra jobbat!", 0, 1f, 1)
            else Row3("Steg", "${fmt(G.steps)} av ${fmt(G.stepGoal)}", "${fmt(left)} steg kvar, ungefär ${maxOf(1, left / 100)} minuters promenad.", if (G.steps * 2 >= G.stepGoal) 0 else 1, G.steps / G.stepGoal.toFloat(), 1)
        )
    } else out.add(Row3("Steg", "–", "Inga steg hämtade ännu. Öppna Hälsa så hämtas de från klockan.", 1, null, 1))
    if (G.pulse > 0) {
        val (lv, t) = when {
            G.pulse < 50 -> 1 to "Låg puls. Vanligt i vila eller hos vältränade."
            G.pulse <= 100 -> 0 to "Normal vilopuls (60–100 slag i minuten)."
            G.pulse <= 130 -> 1 to "Förhöjd. Normalt under rörelse, annars vila och mät igen."
            else -> 2 to "Hög puls. Om du är i vila: sätt dig ner och mät igen om en stund."
        }
        out.add(Row3("Puls", "${G.pulse} slag/min", t, lv, ((G.pulse - 40) / 140f).coerceIn(0f, 1f), 2))
    }
    if (G.battery >= 0) out.add(
        Row3("Batteri", "${G.battery} %", when { G.battery >= 50 -> "Räcker gott."; G.battery >= 20 -> "Ladda gärna i kväll."; else -> "Ladda klockan snart." },
            if (G.battery >= 50) 0 else if (G.battery >= 20) 1 else 2, G.battery / 100f, 3)
    )
    return out
}

private fun healthRows(): List<Row3> {
    val top = G.hours.mapIndexed { h, v -> h to v }.maxByOrNull { it.second }
    val lo = G.pulseDay.filter { it > 0 }.minOrNull(); val hi = G.pulseDay.maxOrNull()
    val hit = G.week.count { it >= G.stepGoal }
    return listOf(
        Row3("Steg per timme", if (top != null && top.second > 0) "Mest aktiv kl %02d".format(top.first) else "–", "Varje stapel är en timme. Ju högre, desto mer rörde du dig då.", 0, null, 1),
        Row3("Puls under dagen", if (lo != null && hi != null) "$lo–$hi slag/min" else "–", "Kurvan går upp när du rör dig och ner i vila. 60–100 i vila är normalt.", if (hi != null && hi > 130) 1 else 0, null, 2),
        Row3("Veckan", "Målet nått $hit av 7 dagar", if (hit >= 5) "Riktigt bra vecka. Fortsätt så!" else "Sikta på minst 5 dagar med ${fmt(G.stepGoal)} steg.", if (hit >= 5) 0 else 1, hit / 7f, 4)
    )
}

/** Liten bild per värde: förloppsstapel för steg och batteri, zonstapel för pulsen. */
@Composable
private fun Graphic(r: Row3, p: Pal, lc: Color) {
    val f = r.frac ?: return
    var on by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { on = true }
    val g by animateFloatAsState(if (on) f.coerceIn(0f, 1f) else 0f, tween(1000, easing = FastOutSlowInEasing), label = "bild")
    Canvas(Modifier.fillMaxWidth().height(12.dp).padding(top = 2.dp)) {
        val h = size.height; val rr = CornerRadius(h / 2)
        if (r.kind == 2) {
            // pulszoner: låg, normal, förhöjd, hög
            val zones = listOf(0f to .07f, .07f to .43f, .43f to .64f, .64f to 1f)
            val zc = listOf(p.warn, p.good, p.warn, p.bad)
            zones.forEachIndexed { i, (a, b) -> drawRoundRect(zc[i].copy(alpha = .45f), Offset(size.width * a + 1, 0f), Size(size.width * (b - a) - 2, h), rr) }
            val x = size.width * g
            drawCircle(Color.White, h * .85f, Offset(x, h / 2)); drawCircle(lc, h * .6f, Offset(x, h / 2))
        } else {
            drawRoundRect(p.dim.copy(alpha = .25f), size = size, cornerRadius = rr)
            drawRoundRect(lc, size = Size(size.width * g, h), cornerRadius = rr)
        }
    }
}

/** "Idag i korthet" eller "Så läser du", i stilens färger. */
@Composable
fun GuideCard(s: Stil, health: Boolean) {
    val p = pal(s)
    val rows = if (health) healthRows() else todayRows()
    var open by remember { mutableStateOf(true) }
    val shape = RoundedCornerShape(p.r)
    Column(
        Modifier.padding(vertical = 8.dp).fillMaxWidth().clip(shape).background(p.card).border(p.border, p.borderCol, shape)
            .clickable { open = !open }.animateContentSize(spring(dampingRatio = .85f, stiffness = 320f)).padding(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(if (health) "Så läser du" else "Idag i korthet", color = p.ink, fontFamily = p.font, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            Text(if (open) "Dölj" else "Visa", color = p.dim, fontFamily = p.font, fontSize = 12.sp)
        }
        if (open) rows.forEachIndexed { i, r ->
            val lc = when (r.level) { 0 -> p.good; 1 -> p.warn; else -> p.bad }
            var shown by remember { mutableStateOf(false) }
            LaunchedEffect(Unit) { kotlinx.coroutines.delay(90L * i); shown = true }
            val a by animateFloatAsState(if (shown) 1f else 0f, tween(300), label = "rad")
            Row(Modifier.padding(top = 12.dp).graphicsLayer { alpha = a; translationY = (1 - a) * 16f }, verticalAlignment = Alignment.Top) {
                Box(Modifier.size(34.dp).clip(if (p.r == 0.dp) RoundedCornerShape(0.dp) else CircleShape).background(lc.copy(alpha = .18f)), contentAlignment = Alignment.Center) {
                    DockIconPub(when (r.kind) { 0 -> 0; 1 -> 3; 2 -> 1; 3 -> 0; else -> 4 }, lc, Modifier)
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(r.label, color = p.dim, fontFamily = p.font, fontSize = 13.sp, modifier = Modifier.weight(1f))
                        Text(r.value, color = p.ink, fontFamily = p.font, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                    Graphic(r, p, lc)
                    Text(r.text, color = p.ink, fontFamily = p.font, fontSize = 13.sp, lineHeight = 18.sp, modifier = Modifier.padding(top = 4.dp))
                }
            }
        }
    }
}
