package se.minklocka.app

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONObject

/** En fråga från sidan ("Skicka ändå?", "Hur ser urtavlan ut?"). Visas som riktig ruta ovanpå allt. */
class AskBtn(val label: String, val main: Boolean, val bad: Boolean)
class Ask(val title: String, val text: String, val btns: List<AskBtn>)

object AskData {
    var ask by mutableStateOf<Ask?>(null)

    @JvmStatic fun put(json: String) {
        if (json.isBlank()) { ask = null; return }
        try {
            val o = JSONObject(json)
            val a = o.getJSONArray("b")
            val b = (0 until a.length()).map { val x = a.getJSONObject(it); AskBtn(x.optString("t"), x.optBoolean("main"), x.optBoolean("bad")) }
            ask = Ask(o.optString("t"), o.optString("p"), b)
        } catch (_: Exception) { ask = null }
    }

    /** Tillbaka-knappen: väljer det första "Avbryt"-liknande svaret. */
    @JvmStatic fun back(js: (String) -> Unit): Boolean {
        val a = ask ?: return false
        val i = a.btns.indexOfFirst { it.label.startsWith("Avbryt") || it.label.startsWith("Svara senare") || it.label.startsWith("Vet inte") }
        if (i < 0) return true
        answer(i, js); return true
    }

    fun answer(i: Int, js: (String) -> Unit) {
        ask = null
        js("(function(){var b=document.querySelectorAll('#shB [data-r]')[$i];if(b)b.click();})()")
    }
}

@Composable
fun AskOverlay(s: Stil, js: (String) -> Unit) {
    val a = AskData.ask
    AnimatedVisibility(a != null, enter = fadeIn(), exit = fadeOut()) {
        val q = a ?: return@AnimatedVisibility
        val p = pal(s)
        val card = if (p.card.alpha < .9f) Color(0xFF141A2E) else p.card
        val shape = RoundedCornerShape(maxOf(p.r, 16.dp))
        Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = .6f)).clickable(remember { androidx.compose.foundation.interaction.MutableInteractionSource() }, null) {}, contentAlignment = Alignment.Center) {
            Column(Modifier.padding(24.dp).fillMaxWidth().clip(shape).background(card).border(p.border, p.borderCol, shape).padding(22.dp)) {
                Text(q.title, color = p.ink, fontFamily = p.font, fontSize = 21.sp, fontWeight = FontWeight.Bold, lineHeight = 26.sp)
                if (q.text.isNotBlank()) { Spacer(Modifier.height(10.dp)); Text(q.text, color = p.ink, fontSize = 15.sp, lineHeight = 21.sp) }
                Spacer(Modifier.height(18.dp))
                q.btns.forEachIndexed { i, b ->
                    val bg = when { b.bad -> p.bad; b.main -> p.acc; else -> Color.Transparent }
                    val fg = when { b.bad -> Color.White; b.main -> p.onAcc; else -> p.ink }
                    Text(b.label, Modifier.padding(top = if (i > 0) 8.dp else 0.dp).fillMaxWidth().clip(CircleShape).background(bg)
                        .then(if (!b.main && !b.bad) Modifier.border(1.dp, p.dim, CircleShape) else Modifier)
                        .clickable { AskData.answer(i, js) }.padding(vertical = 13.dp),
                        color = fg, fontFamily = p.font, fontSize = 16.sp, fontWeight = if (b.main || b.bad) FontWeight.Bold else FontWeight.Medium, textAlign = TextAlign.Center)
                }
            }
        }
    }
}
