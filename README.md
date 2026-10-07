# Min klocka – källkod

Här ligger källkoden till sidan som finns på grenen `gh-pages`.

- `ui/template.html` är sidans skal. `ui/build.py` sätter ihop skalet med skripten i `ui/` och de färdiga analoga urtavlorna till `dist/index.html`.
- `ui/engine.js` ritar och bygger urtavlor, `ui/presets.js` innehåller de färdiga, `ui/toons.js` och `ui/extras.js` teckningarna.
- `ui/gallery.js`, `ui/editor.js` och `ui/features.js` är galleriet, redigeraren och verktygen.
- `ui/e2e*.js` kör sidan mot en låtsasklocka. `ui/verify.py` läser tillbaka de skickade filerna och kontrollerar dem.
- `faces.py` ritar de analoga urtavlorna, `jkdz.py` läser och skriver urtavlefiler.

Bygg: `PYTHONPATH=. python3 ui/build.py`. Prov: `node ui/e2e4.js`.

Nyckeln som klockan känner igen finns inte här. Den sparas i webbläsaren första gången sidan öppnas med den personliga länken.
