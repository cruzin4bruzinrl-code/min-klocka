package se.minklocka.app

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Genomgång av appen: visar varje del i tur och ordning, byter flik själv och pekar på menyn.
 * Visas första gången och när du trycker "Visa genomgång" i stilväljaren.
 */
private class Step(val tab: Int, val icon: Int, val title: String, val text: String)

private val STEPS = listOf(
    Step(0, 0, "Välkommen!", "Det här är Min klocka. Den håller kontakten med klockan hela tiden, även när appen är stängd. Här går vi igenom allt på en minut."),
    Step(0, 0, "Klocka", "Här ser du urtavlan som sitter på klockan. Under den står hur det går i dag: steg, puls och batteri, med ett enkelt ord som \"Lugn\" eller \"Ladda!\"."),
    Step(0, 3, "Knapparna", "Hitta klockan får den att surra. Ställ tiden sätter rätt tid. Stil byter utseende på hela appen."),
    Step(1, 1, "Hälsa", "Här ser du hur du rört dig. Tryck på Idag, Puls eller Veckan för att byta bild. Meningen överst berättar vad bilden betyder."),
    Step(2, 2, "Urtavlor", "Välj en urtavla och tryck Skicka till klockan. Det tar ungefär en halv minut. Håll klockan nära."),
    Step(3, 3, "Verktyg", "Här finns allt annat klockan kan: kamera, ljusstyrka, påminnelser, väder och vad klockans knappar ska göra."),
    Step(4, 4, "Mer", "Inställningar, ny version av appen och loggen. Loggen visar vad som händer mellan appen och klockan."),
    Step(0, 0, "Klart!", "Appen hämtar steg och puls från klockan var 20:e minut, även när den är stängd. Vill du se genomgången igen finns den i stilväljaren.")
)

@Composable
fun TourOverlay(s: Stil, onTab: (Int) -> Unit) {
    if (!WatchState.touring) return
    val p = pal(s)
    var i by remember { mutableIntStateOf(0) }
    val st = STEPS[i]
    LaunchedEffect(i) { onTab(st.tab) }
    val bob by rememberInfiniteTransition(label = "pil").animateFloat(0f, 1f, infiniteRepeatable(tween(700, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "b")
    Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = .55f)).clickable(remember { androidx.compose.foundation.interaction.MutableInteractionSource() }, null) {}) {
        BoxWithConstraints(Modifier.fillMaxSize()) {
            // pil som studsar ovanför menyknappen för den del som visas
            val x = maxWidth / 5 * st.tab + maxWidth / 10 - 14.dp
            Text("▼", Modifier.align(Alignment.BottomStart).offset(x = x, y = (-92).dp - (bob * 10).dp), color = Color.White, fontSize = 28.sp)
        }
        AnimatedContent(i, Modifier.align(Alignment.Center).padding(24.dp), transitionSpec = {
            (slideInHorizontally(spring(dampingRatio = .8f, stiffness = 300f)) { if (targetState > initialState) it / 3 else -it / 3 } + fadeIn()) togetherWith fadeOut(tween(120))
        }, label = "steg") { k ->
            val sk = STEPS[k]
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(maxOf(p.r, 16.dp))).background(p.card).border(p.border, p.borderCol, RoundedCornerShape(maxOf(p.r, 16.dp))).padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(64.dp).clip(CircleShape).background(p.acc), contentAlignment = Alignment.Center) { DockIconPub(sk.icon, p.onAcc, Modifier.graphicsLayer { scaleX = 1.5f; scaleY = 1.5f }) }
                Spacer(Modifier.height(14.dp))
                Text(sk.title, color = p.ink, fontFamily = p.font, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text(sk.text, color = p.ink, fontSize = 16.sp, lineHeight = 22.sp)
                Spacer(Modifier.height(14.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) { STEPS.indices.forEach { j -> Box(Modifier.size(if (j == k) 18.dp else 7.dp, 7.dp).clip(CircleShape).background(if (j == k) p.acc else p.dim.copy(alpha = .4f))) } }
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(if (k == 0) "Hoppa över" else "Tillbaka", Modifier.weight(1f).clip(CircleShape).border(1.dp, p.dim, CircleShape).clickable { if (k == 0) done() else i = k - 1 }.padding(vertical = 12.dp),
                        color = p.ink, fontSize = 15.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                    Text(if (k == STEPS.size - 1) "Klar" else "Nästa", Modifier.weight(1f).clip(CircleShape).background(p.acc).clickable { if (k == STEPS.size - 1) done() else i = k + 1 }.padding(vertical = 12.dp),
                        color = p.onAcc, fontSize = 15.sp, fontWeight = FontWeight.Bold, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                }
            }
        }
    }
}

private fun done() {
    WatchState.touring = false
    WatchState.tourDone?.invoke()
}
