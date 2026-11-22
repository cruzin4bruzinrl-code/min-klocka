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
,{key:'lekfull',name:'Vit och röd',desc:'Stora siffror och prickar som går från vitt till rött, visare med samma övergång, och puls, steg, batteri och datum i hörnen.',c1:'#e8202a',c2:'#050507',fresh:2,pr:1,def:{bg:{t:'p2',id:'lekfull'},
  els:[vl('pulse',34,26,14,'pb','#ffffff',''),vl('steps',206,27,11,'pb','#ffffff',''),vl('battv',34,256,14,'pb','#ffffff','',{pct:false}),vl('day',206,256,14,'pb','#ffffff',''),HN({style:'gradpill',hs:'gradpill',ms:'gradpill',hc:'#ff8a8f',mc:'#e8202a',sec:0,ml:78,hk:.62,w:9})]}}
,{key:'lcd_vit',name:'Ljus LCD',desc:'Grå LCD med rutor för dag, steg, kalorier och puls, och en liten raket.',c1:'#1c1f1a',c2:'#d9ddd6',fresh:2,pr:1,def:{bg:{t:'p2',id:'lcdvit'},
  els:[vl('day',72,36,22,'sg','#1c1f1a',''),vl('steps',176,40,20,'sg','#1c1f1a',''),tm(120,86,64,'sg','#1c1f1a'),vl('kcal',70,258,20,'sg','#1c1f1a',''),vl('pulse',176,258,20,'sg','#1c1f1a','')]}}
,{key:'panel2',exp:1,name:'Instrumentpanel',desc:'Stor tid, steg och puls, batteriet som tio staplar och dag och temperatur i brickor.',c1:'#4cc9f0',c2:'#0c0d10',fresh:2,pr:1,def:{bg:{t:'p2',id:'panel'},
  els:[vl('steps',58,86,18,'pm','#ffffff',''),vl('pulse',182,86,18,'pm','#ff4d6d',''),tm(120,112,58,'pb','#ffffff'),{k:'batt',style:'bars',x:120,y:198,w:170,h:14},vl('day',76,248,16,'pb','#ffffff',''),vl('temp',172,248,16,'pb','#ffffff','')]}}
,{key:'pastell',name:'Pastell',desc:'Mjuka vågor i rosa, lila och blått med tunna vita visare.',c1:'#c9a7ff',c2:'#ffd1dc',fresh:2,pr:1,def:{bg:{t:'p2',id:'pastell'},
  els:[HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffffff',mc:'#ffffff',sec:0,ml:96,hk:.62,w:5})]}}
,{key:'kakel',name:'Kakel',desc:'Ljusgröna upphöjda brickor: stor tid, dag, puls och steg.',c1:'#3a4236',c2:'#c9cfc4',fresh:2,pr:1,def:{bg:{t:'p2',id:'kakel'},
  els:[tm(120,30,72,'mo','#2a3026'),vl('day',64,166,22,'mo','#2a3026',''),vl('pulse',176,166,22,'mo','#2a3026',''),vl('steps',120,240,26,'mo','#2a3026','')]}}

// ---- Från din bild: urtavlorna ChatGPT skapade åt dig, så nära upplägget det går ----
,{key:'tre_cirklar',name:'Tre cirklar',secs:1,desc:'Vit minutskala, tre färgade cirklar med puls, sträcka och kalorier, veckodag och röd sekundvisare.',c1:'#ff3b5c',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'p2',id:'trecirklar'},
  els:[{k:'week',x:110,y:84,c:'#ffffff'},vl('day',150,84,14,'pb','#ffffff',''),vl('pulse',66,122,15,'pb','#ffffff',''),vl('km',160,178,13,'pb','#ffffff',''),vl('kcal',86,198,13,'pb','#ffffff',''),
    HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffffff',mc:'#ffffff',sec:1,sc:'#ff3b30',ml:96,hk:.62,w:6})]}}
,{key:'vagor_rosa',name:'Rosa vågor',secs:1,desc:'Vågor i persika, rosa och lila med vita visare och tunn sekundvisare.',c1:'#ff7eb3',c2:'#7a5cff',fresh:2,pr:1,def:{bg:{t:'p2',id:'vagor2'},
  els:[HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffffff',mc:'#ffffff',sec:1,sc:'#ffffff',ml:96,hk:.62,w:6})]}}
,{key:'bla_bagar',name:'Blå bågar',desc:'Svart med tunna blå bågar och stor tid staplad, med datum.',c1:'#3c6eff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'p2',id:'blabagar'},
  els:[tm(110,40,92,'pl','#ffffff',{lay:'stack',gap:0}),vl('day',196,64,16,'pm','#8fb0ff','')]}}
,{key:'neon_cyan',name:'Neon cyan',secs:1,desc:'Lysande cyan ram och index, ihåliga cyan visare och veckodag.',c1:'#2ef2ff',c2:'#020608',fresh:2,pr:1,def:{bg:{t:'p2',id:'neoncyan'},
  els:[{k:'week',x:72,y:176,c:'#2ef2ff'},HN({style:'hollow',hs:'hollow',ms:'hollow',hc:'#2ef2ff',mc:'#2ef2ff',sec:1,sc:'#2ef2ff',ml:92,hk:.62,w:9})]}}
,{key:'fargsiffror',name:'Färgsiffror',desc:'Stora siffror och prickar i många färger, gul och orange visare och data i hörnen.',c1:'#ffd23f',c2:'#050507',fresh:2,pr:1,def:{bg:{t:'p2',id:'fargsiffror'},
  els:[vl('pulse',46,22,13,'pb','#ffffff',''),vl('kcal',190,22,13,'pb','#ffffff',''),vl('km',48,262,13,'pb','#ffffff',''),vl('steps',182,262,12,'pb','#ffffff',''),HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffd23f',mc:'#ff9f1c',sec:0,ml:84,hk:.62,w:10})]}}
,{key:'lcd_astro',name:'LCD med rymdfarare',desc:'Ljus LCD: datum, steg, stor tid, veckodag, puls, kalorier och sträcka, och en egen liten rymdfarare.',c1:'#15170f',c2:'#eceee6',fresh:2,pr:1,def:{bg:{t:'p2',id:'lcdastro'},
  els:[vl('day',54,28,22,'sg','#15170f',''),vl('steps',166,28,20,'sg','#15170f',''),tm(120,62,58,'sg','#15170f'),{k:'week',x:42,y:132,c:'#15170f'},vl('pulse',80,172,34,'sg','#15170f',''),vl('kcal',70,262,18,'sg','#15170f',''),vl('km',180,262,18,'sg','#15170f','')]}}
,{key:'minimal_tal',name:'Fin skala',secs:1,desc:'Svart med fin minutskala, små siffror, röd sekundvisare, kalorier och puls.',c1:'#ff3b30',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'p2',id:'minimaltal'},
  els:[vl('day',176,136,12,'pb','#ff6a5a',''),vl('kcal',46,244,12,'pb','#ff6a5a',''),vl('pulse',218,244,12,'pb','#ff6a5a',''),HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffffff',mc:'#ffffff',sec:1,sc:'#ff3b30',ml:96,hk:.62,w:5})]}}
,{key:'korsbar2',name:'Körsbär',desc:'Blommande körsbärsgren och vita fåglar. Puls, datum och veckodag, stor rosa tid.',c1:'#ff8fab',c2:'#050405',fresh:2,pr:1,def:{bg:{t:'p2',id:'korsbar2'},
  els:[vl('pulse',46,186,13,'pm','#ffffff',''),vl('day',28,208,13,'pm','#ffffff',''),{k:'week',x:30,y:230,c:'#ffffff'},tm(176,150,56,'pm','#ff8fab',{lay:'stack',gap:0})]}}
,{key:'dashboard',name:'Instrument',desc:'Steg i en båge, puls, stor tid, batteriet som staplar, sträcka och kalorier.',c1:'#ff4d6d',c2:'#0b0c0f',fresh:2,pr:1,def:{bg:{t:'p2',id:'dashboard'},
  els:[vl('steps',40,54,11,'pb','#ffffff',''),vl('pulse',178,62,22,'pb','#ffffff',''),tm(120,116,60,'pb','#ffffff'),vl('day',202,170,14,'pb','#8a90a4',''),{k:'batt',style:'bars',x:120,y:214,w:190,h:12},vl('km',60,262,16,'pb','#ffffff',''),vl('kcal',168,262,16,'pb','#ffffff','')]}}
,{key:'svep',name:'Svep',secs:1,desc:'Ett band i orange och blått, små urtavlor med puls och kalorier, steg och datum. Guldvisare.',c1:'#ff8a3c',c2:'#0a0a0c',fresh:2,pr:1,def:{bg:{t:'p2',id:'svep'},
  els:[vl('pulse',60,150,15,'pl','#ffffff',''),vl('kcal',120,232,14,'pl','#ffffff',''),vl('steps',196,58,13,'pm','#ffffff',''),vl('day',196,136,13,'pb','#ffffff',''),HN({style:'facet',hs:'facet',ms:'facet',hc:'#f2c46a',mc:'#f2c46a',sec:1,sc:'#ff8a3c',ml:96,hk:.62,w:7})]}}
,{key:'lutande',name:'Lutande tal',desc:'Stora lutande siffror runt vänsterkanten, gula visare.',c1:'#ffd23f',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'p2',id:'lutande'},
  els:[HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffd23f',mc:'#ffd23f',sec:0,ml:96,hk:.6,w:7})]}}
,{key:'ringdig',name:'Färgringar',desc:'Stor tid överst, veckodag och datum, färgade ringar och sträcka, puls och kalorier.',c1:'#ff9f1c',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'p2',id:'ringdig'},
  els:[tm(126,48,62,'pb','#ffffff'),{k:'week',x:176,y:110,c:'#ffffff'},vl('day',214,110,15,'pb','#ffffff',''),vl('km',176,170,18,'pb','#ffffff',''),vl('pulse',176,206,18,'pb','#ffffff',''),vl('kcal',176,242,18,'pb','#ffffff','')]}}
,{key:'konturspar',name:'Konturspår',desc:'Dubbel ram med prickar, liten digital tid och veckodag, och visare ovanpå.',c1:'#e8e8e8',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'p2',id:'konturspar'},
  els:[tm(120,44,30,'pb','#e8e8e8'),{k:'week',x:104,y:226,c:'#e8e8e8'},vl('day',146,226,14,'pb','#e8e8e8',''),HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffffff',mc:'#ffffff',sec:0,ml:90,hk:.62,w:5})]}}
,{key:'sportgra',name:'Sport grå',desc:'Ljus panel med steg och stor tid. Puls i en cirkel, kalorier, sträcka och batteri.',c1:'#3ddc84',c2:'#0b0c0f',fresh:2,pr:1,def:{bg:{t:'p2',id:'sportgra'},
  els:[vl('steps',96,28,18,'pb','#1a1c20',''),{k:'week',x:196,y:28,c:'#1a1c20'},tm(120,62,62,'pb','#1a1c20'),vl('pulse',48,208,20,'pb','#ffffff',''),vl('kcal',160,186,16,'pb','#ffffff',''),vl('km',160,218,16,'pb','#ffffff',''),{k:'batt',style:'dotcell',x:96,y:254}]}}
,{key:'racing',name:'Racing',desc:'Röd ring med steg, sträcka och puls, stor kursiv tid och veckodag med datum.',c1:'#e8202a',c2:'#050505',fresh:2,pr:1,def:{bg:{t:'p2',id:'racing2'},
  els:[vl('steps',120,60,12,'pb','#ffffff',''),vl('km',28,56,13,'pb','#ffffff',''),vl('pulse',212,56,13,'pb','#e8202a',''),tm(120,122,66,'ital','#ffffff'),{k:'week',x:70,y:240,c:'#e8202a'},vl('day',130,240,16,'pb','#e8202a','')]}}

// ---- Från dina ChatGPT-bilder: bilden är bakgrunden, och tid och värden är klockans egna ----
,{key:'g01',name:'Blomma',desc:'Rosa blomma, tid och datum överst, steg, puls och kalorier.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g01},els:[tm(120,26,54,'pm','#ffffff'),{k:'week',x:54,y:92,c:'#ffffff'},vl('day',100,92,17,'pm','#ffffff',''),vl('steps',72,208,16,'pm','#ffffff',''),vl('pulse',56,238,16,'pm','#ffffff',''),vl('kcal',60,266,16,'pm','#ffffff','')]}}
,{key:'g02',name:'Guldring',desc:'Svart och guld, guldvisare och datum.',secs:1,c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g02},els:[{k:'week',x:98,y:92,c:'#e8c87a'},vl('day',144,92,17,'pm','#e8c87a',''),HN({style:'facet',hs:'facet',ms:'facet',hc:'#e8c87a',mc:'#e8c87a',sec:1,sc:'#e8c87a',ml:94,hk:.62,w:7})]}}
,{key:'g03',name:'Aktivitet',desc:'Stor tid, färgringar och steg, puls och kalorier.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g03},els:[tm(112,20,58,'pm','#ffffff'),{k:'week',x:42,y:94,c:'#ffffff'},vl('day',88,94,17,'pm','#ffffff',''),vl('steps',86,184,16,'pm','#ffffff',''),vl('pulse',64,214,16,'pm','#ffffff',''),vl('kcal',68,242,16,'pm','#ffffff','')]}}
,{key:'g04',name:'Bergstopp',desc:'Bergstopp i solnedgång, tid och datum.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g04},els:[tm(120,30,56,'pm','#ffffff'),{k:'week',x:98,y:100,c:'#ffffff'},vl('day',144,100,17,'pm','#ffffff','')]}}
,{key:'g05',name:'Glastal',desc:'Stora siffror i blått och lila, datum till höger.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g05},els:[tm(104,22,112,'pb',['#5ac8fa','#8a5cff'],{lay:'stack',gap:0}),{k:'week',x:198,y:192,c:'#ffffff'},vl('day',198,216,17,'pm','#ffffff','')]}}
,{key:'g06',name:'Pulslinje',desc:'Röd pulslinje, puls överst och tid nertill.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g06},els:[vl('pulse',70,22,17,'pm','#ffffff',''),tm(110,192,62,'pm','#ffffff'),{k:'week',x:42,y:262,c:'#ffffff'},vl('day',88,262,17,'pm','#ffffff','')]}}
,{key:'g07',name:'Våg',desc:'Blå och lila våg, tid, datum och väder.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g07},els:[tm(120,34,56,'pm','#ffffff'),{k:'week',x:98,y:104,c:'#ffffff'},vl('day',144,104,17,'pm','#ffffff',''),{k:'weather',x:42,y:250,s:26},vl('temp',84,254,18,'pm','#ffffff','')]}}
,{key:'g08',name:'Lila blomma',desc:'Lila blomma med romerska tal och gräddvita visare.',secs:1,c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g08},els:[HN({style:'pill',hs:'pill',ms:'pill',hc:'#f2e6c8',mc:'#f2e6c8',sec:1,sc:'#e8c87a',ml:94,hk:.62,w:6})]}}
,{key:'g09',name:'Tre ringar',desc:'Stor tid, tre ringar med steg, puls och kalorier, och staplar.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g09},els:[{k:'week',x:98,y:22,c:'#ffffff'},vl('day',144,22,17,'pm','#ffffff',''),tm(120,48,64,'pb','#ffffff'),vl('steps',40,188,13,'pm','#ffffff',''),vl('pulse',120,188,15,'pm','#ffffff',''),vl('kcal',200,188,15,'pm','#ffffff','')]}}
,{key:'g10',name:'Jorden',desc:'Jorden i soluppgång, tid och datum.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g10},els:[tm(150,30,56,'pm','#ffffff'),{k:'week',x:154,y:102,c:'#ffffff'},vl('day',200,102,17,'pm','#ffffff','')]}}
,{key:'g11',name:'Ljusringar',desc:'Ringar av ljus i färg, tid och datum.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g11},els:[tm(154,20,56,'pm','#ffffff'),{k:'week',x:150,y:90,c:'#ffffff'},vl('day',196,90,17,'pm','#ffffff','')]}}
,{key:'g12',name:'Blad',desc:'Grönt blad, tid, datum och steg, puls och kalorier.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g12},els:[{k:'week',x:40,y:26,c:'#ffffff'},vl('day',40,52,17,'pm','#ffffff',''),tm(166,22,48,'pm','#ffffff'),vl('steps',84,122,17,'pm','#ffffff',''),vl('pulse',66,168,17,'pm','#ffffff',''),vl('kcal',70,212,17,'pm','#ffffff','')]}}
,{key:'g13',name:'Bryggan',desc:'Brygga vid en sjö i skymning, tid och datum.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g13},els:[tm(120,26,56,'pm','#ffffff'),{k:'week',x:98,y:96,c:'#ffffff'},vl('day',144,96,17,'pm','#ffffff','')]}}
,{key:'g14',name:'Svart klassisk',desc:'Svart med vita index, väder, steg och puls, orange sekundvisare.',secs:1,c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g14},els:[{k:'weather',x:104,y:46,s:24},vl('temp',140,50,17,'pm','#ffffff',''),vl('steps',72,256,16,'pm','#ffffff',''),vl('pulse',196,256,16,'pm','#ffffff',''),HN({style:'pill',hs:'pill',ms:'pill',hc:'#ffffff',mc:'#ffffff',sec:1,sc:'#ff8a1c',ml:94,hk:.62,w:6})]}}
,{key:'g15',name:'Kryss',desc:'Korsande ljus i blått och lila, tid och datum.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g15},els:[tm(150,26,56,'pm','#ffffff'),{k:'week',x:150,y:96,c:'#ffffff'},vl('day',196,96,17,'pm','#ffffff','')]}}
,{key:'g16',name:'Skymning',desc:'Väder, stor tid och datum över en skymning.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g16},els:[{k:'weather',x:50,y:22,s:28},vl('temp',98,28,20,'pm','#ffffff',''),tm(120,82,62,'pm','#ffffff'),{k:'week',x:98,y:152,c:'#ffffff'},vl('day',144,152,17,'pm','#ffffff','')]}}
,{key:'g17',name:'Stora tal',desc:'Stora silverfärgade siffror och lysande staplar.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g17},els:[tm(100,24,110,'pb',['#f2ecff','#a8a2c8'],{lay:'stack',gap:0}),{k:'week',x:78,y:262,c:'#ffffff'},vl('day',124,262,17,'pm','#ffffff','')]}}
,{key:'g18',name:'Ringar',desc:'Tid, datum, ringar och steg, puls och kalorier.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g18},els:[tm(120,20,54,'pm','#ffffff'),{k:'week',x:98,y:88,c:'#ffffff'},vl('day',144,88,17,'pm','#ffffff',''),vl('steps',202,136,16,'pm','#ffffff',''),vl('pulse',196,178,16,'pm','#ffffff',''),vl('kcal',200,218,16,'pm','#ffffff','')]}}
,{key:'g19',name:'Guldvågor',desc:'Gyllene vågor och tid med datum.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g19},els:[tm(152,92,60,'pm','#ffffff'),{k:'week',x:140,y:166,c:'#ffffff'},vl('day',186,166,17,'pm','#ffffff','')]}}
,{key:'g20',name:'Pion',desc:'Rosa pion, tid, datum och väder.',c1:'#ffffff',c2:'#000000',fresh:2,pr:1,def:{bg:{t:'photo',src:PH.g20},els:[tm(166,12,48,'pm','#ffffff'),{k:'week',x:154,y:72,c:'#ffffff'},vl('day',200,72,17,'pm','#ffffff',''),{k:'weather',x:162,y:252,s:24},vl('temp',204,256,17,'pm','#ffffff','')]}}

];
DIGITAL.forEach((d,i)=>{d.def.els=d.def.els.filter(e=>e.k!=='orbit');d.def.els.forEach(e=>{if(e.k==='hands'&&!d.secs)e.sec=0;});   // inget som snurrar runt, inte heller sekundvisare   // inga små snurrande saker: klockan stegar dem, så de rycker
  d.kind='d';d.id=0x86B10100+i;if(d.tested===undefined)d.tested=false;d.live=d.def.els.some(e=>e.k==='orbit'||(e.k==='hands'&&e.sec));d.toon=!!d.toon;d.sport=!!d.sport;d.ren=!!d.ren||/^p_/.test(d.key);d.exp=!!d.exp||d.def.els.some(e=>e.k==='week');   // veckodagen är inte provad på klockan, så den räknas som experiment
  d.fresh=d.fresh===2?2:(d.fresh?1:0);});
