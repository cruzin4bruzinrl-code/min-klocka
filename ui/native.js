// ===== Riktig app: de inbyggda skärmarna (Klocka, Hälsa) visar det sidan vet. Sidan skickar bara siffror och en bild. =====
(function(){
  const N=window.MinKlockaNative;if(!N||!N.putHealth)return;
  document.documentElement.classList.add('native');
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
