package se.minklocka.app

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject

/** En urtavla i galleriet. Bilden ritas av sidan (samma motor som skickar till klockan). */
class DialItem(val gk: String, val name: String, val desc: String, val kind: String, val fav: Boolean, val st: String, val analog: Boolean, val img: ImageBitmap?)

class DialSel(val gk: String, val name: String, val desc: String, val canSend: Boolean, val btn: String, val prog: String, val fav: Boolean, val canEdit: Boolean)

object DialData {
    var items by mutableStateOf<List<DialItem>>(emptyList())
    var sel by mutableStateOf<DialSel?>(null)

    @JvmStatic fun put(json: String) {
        Thread {
            try {
                val a = JSONArray(json)
                val out = ArrayList<DialItem>(a.length())
                for (i in 0 until a.length()) {
                    val o = a.getJSONObject(i)
                    val th = o.optString("th")
                    val bmp = if (th.contains(",")) try { val b = Base64.decode(th.substringAfter(","), Base64.DEFAULT); BitmapFactory.decodeByteArray(b, 0, b.size)?.asImageBitmap() } catch (e: Exception) { null } else null
                    out.add(DialItem(o.optString("gk"), o.optString("name"), o.optString("desc"), o.optString("kind"), o.optBoolean("fav"), o.optString("st"), o.optBoolean("an"), bmp))
                }
                android.os.Handler(android.os.Looper.getMainLooper()).post { items = out }
            } catch (_: Exception) { }
        }.start()
    }

    @JvmStatic fun putSel(json: String) {
        try {
            val o = JSONObject(json)
            sel = DialSel(o.optString("gk"), o.optString("name"), o.optString("desc"), o.optBoolean("can"), o.optString("btn"), o.optString("prog"), o.optBoolean("fav"), o.optBoolean("edit"))
        } catch (_: Exception) { }
    }
}

private val CATS = listOf("Alla", "Favoriter", "Digitala", "Analoga", "Mina")

/** Urtavlor i riktig Android-kod, i vald stils färger, typsnitt och former. */
@Composable
fun DialsScreen(s: Stil, js: (String) -> Unit) {
    val p = pal(s)
    val sel = DialData.sel
    var cat by rememberSaveable { mutableIntStateOf(0) }
    val all = DialData.items
    val list = when (cat) {
        1 -> all.filter { it.fav }
        2 -> all.filter { !it.analog && it.kind != "m" }
        3 -> all.filter { it.analog }
        4 -> all.filter { it.kind == "m" }
        else -> all
    }
    val shape = RoundedCornerShape(maxOf(p.r, 8.dp))
    val bodyBg = when (s) { Stil.NORRSKEN -> Color(0xFF050814); Stil.MATERIAL -> androidx.compose.material3.MaterialTheme.colorScheme.surface; Stil.KLADD -> Color(0xFFFBF8EF); Stil.LCD -> Color(0xFF26282B); Stil.COCKPIT -> Color(0xFF03090D); else -> Color(0xFF0E1116) }
    val solidCard = if (p.card.alpha < .9f) Color(0xFF141A2E) else p.card
    Column(Modifier.fillMaxSize().background(bodyBg).padding(horizontal = 14.dp)) {
        // vald urtavla: bild, namn, skicka
        Row(Modifier.padding(top = 10.dp).fillMaxWidth().clip(shape).background(solidCard).border(p.border, p.borderCol, shape).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(96.dp, 114.dp).clip(RoundedCornerShape(maxOf(p.r * .7f, 6.dp))).background(Color.Black)) {
                WatchState.dial?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(sel?.name ?: "Välj en urtavla", color = p.ink, fontFamily = p.font, fontSize = 18.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(sel?.desc ?: "", color = p.dim, fontSize = 12.sp, maxLines = 2, overflow = TextOverflow.Ellipsis, lineHeight = 15.sp)
                Spacer(Modifier.height(8.dp))
                val can = sel?.canSend == true
                Text(if (sel?.btn.isNullOrBlank()) "Skicka till klockan" else sel!!.btn, Modifier.fillMaxWidth().clip(CircleShape).background(if (can) p.acc else p.dim.copy(alpha = .3f)).clickable(enabled = can) { js("document.getElementById('btnSend').click()") }.padding(vertical = 11.dp),
                    color = if (can) p.onAcc else p.ink.copy(alpha = .6f), fontFamily = p.font, fontWeight = FontWeight.Bold, fontSize = 15.sp, textAlign = TextAlign.Center)
                if (!sel?.prog.isNullOrBlank()) Text(sel!!.prog, color = p.dim, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 4.dp))
            }
        }
        // snabbknappar för vald urtavla
        Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Chip(p, if (sel?.fav == true) "★ Favorit" else "☆ Favorit", sel?.fav == true) { js("document.getElementById('btnFav').click()") }
            if (sel?.canEdit == true) Chip(p, "Ändra", false) { js("document.getElementById('btnEdit').click()") }
            Chip(p, "Slumpa", false) { js("document.getElementById('btnRand').click()") }
        }
        // sorter
        Row(Modifier.padding(vertical = 8.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            CATS.forEachIndexed { i, t -> Chip(p, t, cat == i) { cat = i } }
        }
        if (all.isEmpty()) Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Ritar urtavlorna …", color = p.dim, fontFamily = p.font) }
        else LazyVerticalGrid(GridCells.Fixed(3), Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(12.dp), contentPadding = PaddingValues(bottom = 16.dp)) {
            if (cat == 0 || cat == 4) {
                item { NewTile(p, "+", "Skapa egen") { js("openEditor(null)") } }
                item { NewTile(p, "✦", "Skapa med AI") { js("window.openAI&&openAI()") } }
            }
            items(list, key = { it.gk }) { d ->
                val on = d.gk == sel?.gk
                val sc by animateFloatAsState(if (on) 1.04f else 1f, spring(dampingRatio = .6f, stiffness = 400f), label = "vald")
                Column(Modifier.graphicsLayer { scaleX = sc; scaleY = sc }.clickable { js("nativePick('" + d.gk.replace("'", "\\'") + "')") }, horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.fillMaxWidth().aspectRatio(240f / 286f).clip(RoundedCornerShape(maxOf(p.r * .8f, 6.dp))).background(Color.Black)
                        .border(if (on) 3.dp else 0.dp, if (on) p.acc else Color.Transparent, RoundedCornerShape(maxOf(p.r * .8f, 6.dp)))) {
                        d.img?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
                        if (d.fav) Text("★", Modifier.align(Alignment.TopEnd).padding(6.dp), color = Color(0xFFFFD43B), fontSize = 14.sp)
                        if (d.st == "ny") Text("ny", Modifier.align(Alignment.TopStart).padding(6.dp).clip(CircleShape).background(p.acc).padding(horizontal = 6.dp, vertical = 1.dp), color = p.onAcc, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(d.name, color = if (on) p.ink else p.dim, fontFamily = p.font, fontSize = 12.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Normal, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 4.dp))
                }
            }
        }
    }
}

@Composable
private fun Chip(p: Pal, t: String, on: Boolean, click: () -> Unit) {
    Text(t, Modifier.clip(CircleShape).background(if (on) p.acc else p.dim.copy(alpha = .14f)).clickable(onClick = click).padding(horizontal = 14.dp, vertical = 8.dp),
        color = if (on) p.onAcc else p.ink, fontFamily = p.font, fontSize = 13.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Medium, maxLines = 1)
}

@Composable
private fun NewTile(p: Pal, sym: String, label: String, click: () -> Unit) {
    Column(Modifier.clickable(onClick = click), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.fillMaxWidth().aspectRatio(240f / 286f).clip(RoundedCornerShape(maxOf(p.r * .8f, 6.dp))).border(2.dp, p.dim.copy(alpha = .5f), RoundedCornerShape(maxOf(p.r * .8f, 6.dp))), contentAlignment = Alignment.Center) {
            Text(sym, color = p.ink, fontSize = 36.sp)
        }
        Text(label, color = p.dim, fontFamily = p.font, fontSize = 12.sp, maxLines = 1, modifier = Modifier.padding(top = 4.dp))
    }
}
