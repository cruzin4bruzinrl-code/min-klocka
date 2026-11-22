// ================= Färdiga digitala urtavlor (ritas av motorn i telefonen) =================
const tm=(x,y,s,f,c,o)=>Object.assign({k:'time',x:x,y:y,s:s,f:f,c:c},o||{});
const vl=(k,x,y,s,f,c,lab,o)=>Object.assign({k:k,x:x,y:y,s:s,f:f,c:c,lab:lab===undefined?VALS[k].lab:lab},o||{});
const R=(x,y,w,h,r,c,a)=>({k:'rect',x:x,y:y,w:w,h:h,r:r,c:c,a:a});
const L=(x,y,x2,y2,c,w,a)=>({k:'line',x:x,y:y,x2:x2,y2:y2,c:c,w:w,a:a});
const TX=(txt,x,y,s,f,c,al,tr)=>({k:'text',txt:txt,x:x,y:y,s:s,f:f,c:c,al:al,tr:tr});
const IC=(n,x,y,s,c)=>({k:'icon',n:n,x:x,y:y,s:s,c:c});
const HN=o=>Object.assign({k:'hands',style:'bar',hc:'#ffffff',mc:'#ffffff',sec:1,sc:'#ff8a3c',ml:92},o||{});
const OB=(style,c,r,s,o)=>Object.assign({k:'orbit',style:style,c:c,r:r,s:s},o||{});
const TK=(n,r,len,c,o)=>Object.assign({k:'ticks',n:n,r:r,len:len,c:c},o||{});
const RG=(r,c,w,a,x,y)=>({k:'ring',x:x===undefined?120:x,y:y===undefined?143:y,r:r,c:c,w:w,a:a});
const DT=(x,y,r,c,a)=>({k:'dot',x:x,y:y,r:r,c:c,a:a});
// n lika stora bitar av en ring, med färgerna i tur och ordning
const RSEG=(r,w,n,cols,gap)=>Array.from({length:n},(_,k)=>({k:'ring',x:120,y:143,r:r,c:cols[k%cols.length],w:w,a0:-90+k*360/n-180/n+(gap||0),a1:-90+k*360/n+180/n-(gap||0),cap:'butt'}));
// Bitar som återkommer i scenerna: en ruta med puls, steg och batteri, runda brickor, en list och datum
const STATS=(x,y,o)=>{o=o||{};const c=o.c||'#ffffff',dy=o.dy||32;x-=6;return {deco:[R(x,y,98,dy*3+8,18,o.bg||'#0b1020',o.a===undefined?.55:o.a),IC('heart',x+17,y+12,17,o.hc||'#ff5a6a'),IC('feet',x+17,y+12+dy,17,o.sc||'#5cf0ff'),IC('batt',x+17,y+12+dy*2,17,o.bc||'#5fe39a')],
  els:[vl('pulse',x+62,y+10,18,'pb',c,''),vl('steps',x+63,y+12+dy,15,'pb',c,''),vl('battv',x+62,y+10+dy*2,18,'pb',c,'',{pct:false})]};};
const BADGES=(y,o)=>{o=o||{};const c=o.c||'#ffffff',X=[44,120,196],cols=[o.hc||'#ff5a6a',o.sc||'#5cf0ff',o.bc||'#5fe39a'];return {deco:[...X.map(x=>DT(x,y+22,31,o.bg||'#0b1020',o.a===undefined?.7:o.a)),...X.map((x,i)=>RG(31,cols[i],2.6,.95,x,y+22)),IC('heart',44,y+2,16,cols[0]),IC('feet',120,y+2,16,cols[1]),IC('batt',196,y+2,16,cols[2])],
  els:[vl('pulse',44,y+20,18,'pb',c,''),vl('steps',120,y+21,15,'pb',c,''),vl('battv',196,y+20,18,'pb',c,'',{pct:false})]};};
const BAR=(y,o)=>{o=o||{};const c=o.c||'#ffffff';return {deco:[R(8,y,224,36,18,o.bg||'#0b1020',o.a===undefined?.65:o.a),IC('heart',26,y+10,17,o.hc||'#ff5a6a'),IC('feet',94,y+10,17,o.sc||'#5cf0ff'),IC('batt',176,y+10,17,o.bc||'#5fe39a')],
  els:[vl('pulse',54,y+8,18,'pb',c,''),vl('steps',134,y+9,16,'pb',c,''),vl('battv',206,y+8,18,'pb',c,'',{pct:false})]};};
const DATE=(x,y,c)=>({deco:[IC('cal',x,y,17,c||'#ffffff')],els:[vl('day',x+25,y-1,18,'pb',c||'#ffffff','')]});
const SC=(bg,scene,els,parts,more)=>({bg:bg,deco:[{k:'toon',n:scene},...(more||[]),...parts.flatMap(p=>p.deco)],els:[...els,...parts.flatMap(p=>p.els)]});
const DIGITAL=[
// ---- Premium: sex urtavlor med material, djup och data som grafik. Inga sekundvisare, inget som snurrar. ----
{key:'atelier_noir',name:'Atelier Noir',desc:'Svart solstråle, pålagda guldindex, fasetterade guldvisare och datumfönster.',c1:'#d9b870',c2:'#020203',fresh:2,pr:1,def:{bg:{t:'p2',id:'noir'},
  els:[vl('day',201,134,13,'pb','#1a1a1a',''),HN({style:'facet',hs:'facet',ms:'facet',hc:'#d9b870',mc:'#d9b870',sec:0,ml:94,hk:.66,w:7})]}}
,{key:'chrono_bla',exp:1,name:'Chronometer Blå',desc:'Blå gravyr. Batteriet som nål i övre urtavlan och pulsen i den nedre.',c1:'#dfe8f6',c2:'#061430',fresh:2,pr:1,def:{bg:{t:'p2',id:'bla'},
  els:[{k:'batt',style:'needle',x:120,y:62,r:30,c:'#ff6a3c'},vl('pulse',120,188,15,'pm','#ffffff',''),HN({style:'sword2',hs:'sword2',ms:'sword2',hc:'#e6ecf6',mc:'#e6ecf6',sec:0,ml:92,hk:.65,w:7})]}}
,{key:'pilot',exp:1,name:'Pilot',desc:'Matt svart som ett flyginstrument. Stora självlysande siffror och batteriet som bränslemätare.',c1:'#e8f4e6',c2:'#0e0f10',fresh:2,pr:1,def:{bg:{t:'p2',id:'pilot'},
  els:[{k:'batt',style:'fuel',x:84,y:140},HN({style:'sword2',hs:'sword2',ms:'sword2',hc:'#c8ccc8',mc:'#c8ccc8',sec:0,ml:90,hk:.64,w:8})]}}
,{key:'kalibr',exp:1,name:'Kalibr',desc:'Tunn stor tid på glaspanel. Batteriet som segmentbåge, steg och puls i fin typografi.',c1:'#c9b8ff',c2:'#050608',fresh:2,pr:1,def:{bg:{t:'p2',id:'kalibr'},
  els:[vl('day',72,38,13,'pm','#ffffff',''),tm(120,76,72,'pl','#ffffff'),{k:'batt',style:'segarc',x:56,y:202},vl('pulse',160,256,16,'pm','#ff8aa8',''),vl('steps',182,214,20,'pm','#ffffff','')]}}
,{key:'keramik_vit',exp:1,name:'Keramik Vit',desc:'Glansig vit keramik, blå siffror, röd minutvisare och batteriet i en liten urtavla.',c1:'#1f3f88',c2:'#e8eaee',fresh:2,pr:1,def:{bg:{t:'p2',id:'keramik'},
  els:[{k:'batt',style:'needle',x:120,y:180,r:26,c:'#1f3f88',a0:-Math.PI*.7,span:Math.PI*1.4},HN({style:'pill',hs:'pill',ms:'pill',hc:'#1a2a4a',mc:'#d8382c',sec:0,ml:96,hk:.62,w:6})]}}
,{key:'titan_sport',name:'Titan Sport',desc:'Borstat titan, graverad minutring och datum i fönster. Orange detaljer.',c1:'#ff7a2e',c2:'#4a4f56',fresh:2,pr:1,def:{bg:{t:'p2',id:'titan'},
  els:[vl('day',187,134,15,'cb','#ffffff',''),HN({style:'sword2',hs:'sword2',ms:'sword2',hc:'#d8dce2',mc:'#d8dce2',sec:0,ml:86,hk:.65,w:8})]}}

// ---- Egna tolkningar av genrerna i din bild ----
,{key:'lekfull',name:'Lekfull',desc:'Stora siffror i fyra färger, en ring av färgprickar och tjocka färgade visare.',c1:'#ffb703',c2:'#050507',fresh:2,pr:1,def:{bg:{t:'p2',id:'lekfull'},
  els:[HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffb703',mc:'#ff6b35',sec:0,ml:86,hk:.62,w:10})]}}
,{key:'lcd_vit',name:'Ljus LCD',desc:'Grå LCD med rutor för dag, steg, kalorier och puls, och en liten raket.',c1:'#1c1f1a',c2:'#d9ddd6',fresh:2,pr:1,def:{bg:{t:'p2',id:'lcdvit'},
  els:[vl('day',72,36,22,'sg','#1c1f1a',''),vl('steps',176,40,20,'sg','#1c1f1a',''),tm(120,86,64,'sg','#1c1f1a'),vl('kcal',70,258,20,'sg','#1c1f1a',''),vl('pulse',176,258,20,'sg','#1c1f1a','')]}}
,{key:'panel2',exp:1,name:'Instrumentpanel',desc:'Stor tid, steg och puls, batteriet som tio staplar och dag och temperatur i brickor.',c1:'#4cc9f0',c2:'#0c0d10',fresh:2,pr:1,def:{bg:{t:'p2',id:'panel'},
  els:[vl('steps',58,86,18,'pm','#ffffff',''),vl('pulse',182,86,18,'pm','#ff4d6d',''),tm(120,112,58,'pb','#ffffff'),{k:'batt',style:'bars',x:120,y:198,w:170,h:14},vl('day',76,248,16,'pb','#ffffff',''),vl('temp',172,248,16,'pb','#ffffff','')]}}
,{key:'racing',name:'Racing',desc:'Svart, vitt och rött. Stor kursiv tid, röd ring med steg och fartlinjer.',c1:'#e8202a',c2:'#050505',fresh:2,pr:1,def:{bg:{t:'p2',id:'racing'},
  els:[vl('steps',150,58,13,'pb','#ffffff',''),tm(120,120,68,'ital','#ffffff'),vl('day',90,258,15,'pb','#ffffff','')]}}
,{key:'korsbar',name:'Körsbär',desc:'En blommande körsbärsgren på svart. Tid i rosa, puls och datum.',c1:'#ff8fab',c2:'#050405',fresh:2,pr:1,def:{bg:{t:'p2',id:'korsbar'},
  els:[tm(176,150,56,'pl','#ff8fab',{lay:'stack',gap:0}),vl('pulse',40,214,15,'pm','#ffffff','PULS'),vl('day',40,244,15,'pm','#ffffff','DAG')]}}
,{key:'pastell',name:'Pastell',desc:'Mjuka vågor i rosa, lila och blått med tunna vita visare.',c1:'#c9a7ff',c2:'#ffd1dc',fresh:2,pr:1,def:{bg:{t:'p2',id:'pastell'},
  els:[HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffffff',mc:'#ffffff',sec:0,ml:96,hk:.62,w:5})]}}
,{key:'kakel',name:'Kakel',desc:'Ljusgröna upphöjda brickor: stor tid, dag, puls och steg.',c1:'#3a4236',c2:'#c9cfc4',fresh:2,pr:1,def:{bg:{t:'p2',id:'kakel'},
  els:[tm(120,30,72,'mo','#2a3026'),vl('day',64,166,22,'mo','#2a3026',''),vl('pulse',176,166,22,'mo','#2a3026',''),vl('steps',120,240,26,'mo','#2a3026','')]}}

];
DIGITAL.forEach((d,i)=>{d.def.els=d.def.els.filter(e=>e.k!=='orbit');d.def.els.forEach(e=>{if(e.k==='hands')e.sec=0;});   // inget som snurrar runt, inte heller sekundvisare   // inga små snurrande saker: klockan stegar dem, så de rycker
  d.kind='d';d.id=0x86B10100+i;if(d.tested===undefined)d.tested=false;d.live=d.def.els.some(e=>e.k==='orbit'||(e.k==='hands'&&e.sec));d.toon=!!d.toon;d.sport=!!d.sport;d.ren=!!d.ren||/^p_/.test(d.key);d.exp=!!d.exp||d.def.els.some(e=>e.k==='week');   // veckodagen är inte provad på klockan, så den räknas som experiment
  d.fresh=d.fresh===2?2:(d.fresh?1:0);});
