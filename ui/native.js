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
