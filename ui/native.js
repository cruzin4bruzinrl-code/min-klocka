// ===== Riktig app: de inbyggda skärmarna (Klocka, Hälsa) visar det sidan vet. Sidan skickar bara siffror och en bild. =====
(function(){
  const N=window.MinKlockaNative;if(!N||!N.putHealth)return;
  document.documentElement.classList.add('native');
  // Stilen styrs av Android. Byts tyst, utan meddelande, och sparas inte som sidans egen.
  window.nativeTheme=function(t){const r=document.documentElement;if(r.dataset.theme===t)return;r.dataset.theme=t;r.style.removeProperty('--a1');r.style.removeProperty('--a2');
    try{markTheme();}catch(e){}if(typeof hlRender==='function')setTimeout(()=>hlRender(false),60);};
  try{const t=N.webTheme&&N.webTheme();if(t)nativeTheme(t);}catch(e){}
  // Exakt samma färger, typsnitt och former som Android-delen (sätts som variabler som vinner över sidans teman)
  window.nativeStyle=function(o){try{const r=document.documentElement.style;Object.keys(o).forEach(k=>r.setProperty('--'+k,o[k]));}catch(e){}};
  try{const t=N.webTokens&&N.webTokens();if(t)nativeStyle(JSON.parse(t));}catch(e){}
  // flik som visas, så att CSS kan dölja klockbilden där den inte hör hemma
  if(typeof showTab==='function'){const st=showTab;showTab=function(t){const r=st.apply(this,arguments);const c=document.documentElement.classList;['home','health','dials','tools','log'].forEach(x=>c.remove('nat-'+x));c.add('nat-'+t);return r;};}
  // ---------- Urtavlor i Android-delen: sidan ritar rutorna och skickar dem, Android visar dem ----------
  let dialsT=0;
  window.nativePushDials=function(){clearTimeout(dialsT);dialsT=setTimeout(async()=>{
    if(!N.putDials||typeof allDials!=='function')return;
    const t=nowT(),cv=document.createElement('canvas');cv.width=150;cv.height=179;const out=[],all=allDials();
    for(let i=0;i<all.length;i++){const d=all[i];let th='';
      try{if(paintFace(d,cv,t))th=cv.toDataURL('image/jpeg',.82);}catch(e){}
      out.push({gk:d.gk,name:d.name,desc:d.desc||'',kind:d.kind,fav:!!(typeof FAV!=='undefined'&&FAV[d.gk]),st:(typeof statusOf==='function'?statusOf(d):''),an:d.kind==='a'||!!(d.def&&d.def.els&&d.def.els.some(e=>e.k==='hands')),th:th});
      if(i%6===5)await new Promise(r=>setTimeout(r,0));}
    N.putDials(JSON.stringify(out));},600);};
  window.nativePick=function(gk){try{pickDial(gk);}catch(e){}};
  let lastSel='';
  setInterval(()=>{try{if(!N.putSel||typeof cur==='undefined'||!cur)return;const b=$('btnSend'),p=$('stProg');
    const st=JSON.stringify({gk:cur.gk,name:cur.name,desc:cur.desc||'',can:!b.disabled,btn:b.textContent,prog:p?p.textContent:'',fav:!!(typeof FAV!=='undefined'&&FAV[cur.gk]),edit:!$('btnEdit').disabled});
    if(st!==lastSel){lastSel=st;N.putSel(st);}}catch(e){}},500);
  // när sidan behöver visa något eget (redigeraren, ett blad, en fråga) visas den ovanpå Android-delen
  let lastOv=null;
  // (inte under skickning: då visar Android-delen förloppet själv)
  const ownUI=()=>{const t=document.getElementById('tour');return !!(document.body.classList.contains('editing')||(t&&t.offsetParent)||document.querySelector('#tsheet.on,.ob.on,.hl-sheet.on,#onb.on'));};
  setInterval(()=>{try{const ov=ownUI();if(ov!==lastOv){lastOv=ov;N.webOverlay&&N.webOverlay(ov);}}catch(e){}},300);
  // frågor ("Skicka ändå?", "Hur ser urtavlan ut?") visas som riktig Android-ruta
  if(N.putAsk){let lastAsk='';const sh=document.getElementById('shade');
    const pushAsk=()=>{try{let j='';if(sh&&!sh.hidden){const b=[...document.querySelectorAll('#shB [data-r]')].map(x=>({t:x.textContent,main:/\bcta\b/.test(x.className),bad:/\bbad\b/.test(x.className)}));
        j=JSON.stringify({t:$('shT').textContent,p:$('shP').textContent,b:b});}
      if(j!==lastAsk){lastAsk=j;N.putAsk(j);}}catch(e){}};
    if(sh){new MutationObserver(pushAsk).observe(sh,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true,characterData:true});pushAsk();}}
  if(typeof renderGrid==='function'){const rg=renderGrid;renderGrid=function(){const r=rg.apply(this,arguments);nativePushDials();return r;};}
  if(window.__galleryReady)nativePushDials();else{const w=setInterval(()=>{if(window.__galleryReady){clearInterval(w);nativePushDials();}},500);}
  // Hälsan hämtas när Hälsa öppnas, högst var tredje minut
  let lastSync=0;window.nativeHealthOpen=function(){if(Date.now()-lastSync<180000)return;lastSync=Date.now();try{hlSync(false);}catch(e){}};
  let last='';
  function health(){
    try{
      const tk=hymd(new Date()),t=HL.days[tk]||{},g=goals();
      const hours=new Array(24).fill(0);
      if(t.steps){for(let h=0;h<24;h++)hours[h]=Math.max(0,t.steps[h]-(h?t.steps[h-1]:0));}
      const week=[],days=[];
      for(let i=6;i>=0;i--){const d=hdayAgo(i),v=hlTotal(HL.days[hymd(d)]);week.push(v==null?-1:v);days.push(i===0?'Idag':HWD[d.getDay()]);}
      const hr=(t.hr||[]).map(r=>r[2]);
      const st=hlTotal(t);
      const o={steps:st==null?-1:st,pulse:hr.length?hr[hr.length-1]:-1,goal:g.steps||8000,hours:hours,week:week,days:days,hr:hr};
      const s=JSON.stringify(o);if(s!==last){last=s;N.putHealth(s);}
    }catch(e){}
  }
  let lastDial='';
  function dial(){
    try{
      if(!cur)return;
      const c=$('faceA'),d=$('faceB');const v=faceFlip?d:c;   // den som just tonades in
      const url=v.toDataURL('image/png');
      const key=cur.gk+url.length;if(key===lastDial)return;lastDial=key;
      N.putDial(cur.name||'',url);
    }catch(e){}
  }
  if(typeof showFace==='function'){const sf=showFace;showFace=function(){const r=sf.apply(this,arguments);setTimeout(dial,700);return r;};}
  if(typeof hlRender==='function'){const hr=hlRender;hlRender=function(){const r=hr.apply(this,arguments);health();return r;};}
  setInterval(()=>{health();dial();},5000);
  setTimeout(()=>{health();dial();},1500);
})();
