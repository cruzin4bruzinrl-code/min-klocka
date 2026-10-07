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
const DIGITAL=[
{key:'rutnat',name:'Rutnät',desc:'Rutor med tid, puls, väder och steg.',c1:'#3ba0ff',c2:'#ff5a6a',tested:true,def:{bg:{t:'solid',c:'#000000'},
  deco:[R(4,4,74,90,[42,14,14,14],'#28282e'),R(82,4,76,90,14,'#2e4e70'),R(162,4,74,90,[14,42,14,14],'#1e5438'),R(4,98,154,90,14,'#1a1a1e'),R(162,98,74,90,14,'#681e26'),
    R(4,192,74,90,[14,14,14,42],'#1c4a32'),R(82,192,76,90,14,'#704a14'),R(162,192,74,90,[14,14,42,14],'#3a346e'),
    IC('cal',41,11,22,'#ffffff'),{k:'ecg',x:170,y:108,w:58,h:26,c:'#ff787d',lw:2},IC('steps',41,200,20,'#8cf0aa'),IC('flame',120,198,22,'#ffbe46'),IC('pin',199,198,22,'#afaaff')],
  els:[vl('day',41,40,30,'pb','#ffffff','DAG'),{k:'weather',x:120,y:12,s:32},vl('temp',112,54,19,'pb','#ffffff',''),{k:'batt',x:199,y:16,w:56,style:'bar',c:'#ffffff',fc:'#96f5b4'},
    vl('battv',192,46,19,'pb','#ffffff','BATT'),tm(81,126,50,'pb','#ffffff'),vl('pulse',199,138,30,'pb','#ffffff','PULS'),
    vl('steps',41,226,21,'pb','#ffffff','STEG'),vl('kcal',120,226,21,'pb','#ffffff','KCAL'),vl('km',199,226,21,'pb','#ffffff','KM')]}},
{key:'stor',name:'Stor',desc:'Jättesiffror i färg.',c1:'#ffb028',c2:'#ff3080',def:{bg:{t:'solid',c:'#000000'},
  els:[tm(120,22,106,'pb','#ffffff',{lay:'stack',gap:8,knock:[['#ffffff','#c4ccdc'],['#ffb028','#ff3080','h']]}),
    vl('day',48,226,20,'pb','#ffffff','DAG'),vl('pulse',120,226,20,'pb','#ff6e78','PULS'),vl('battv',186,226,20,'pb','#ffffff','BATT')]}},
{key:'puls',name:'Puls',desc:'Pulsen i centrum.',c1:'#ff4660',c2:'#a01e5a',sport:true,def:{bg:{t:'solid',c:'#000000'},
  deco:[{k:'glow',x:120,y:146,r:120,c:'#ff2846',i:.34},{k:'ecg',x:0,y:182,w:240,h:46,c:'#ff465f',lw:2.4}],
  els:[tm(120,22,40,'pb','#ffffff'),vl('pulse',120,74,104,'pb','#ffecee','SLAG / MIN',{lg:2}),
    vl('steps',52,238,20,'pb','#ffffff','STEG'),vl('kcal',120,238,20,'pb','#ffc45a','KCAL'),vl('battv',182,238,20,'pb','#ffffff','BATT')]}},
{key:'aurora',name:'Aurora',desc:'Mjuka färger och tunna siffror.',c1:'#19c3aa',c2:'#8a50ff',def:{bg:{t:'aurora',c:'#080c1e',cs:['#00bea8','#7846ff','#ff4696','#145adc']},
  deco:[L(24,150,216,150,'#ffffff',1,.28)],
  els:[{k:'weather',x:38,y:20,s:32},vl('temp',84,28,17,'pm','#ffffff',''),vl('battv',188,28,17,'pm','#ffffff',''),
    vl('day',38,94,21,'pm','#ffffff','DAG'),vl('pulse',120,94,21,'pm','#ffffff','PULS'),vl('steps',194,94,21,'pm','#ffffff','STEG'),tm(120,172,80,'pl','#ffffff')]}},
{key:'lcd',name:'LCD',desc:'Retro med segmentsiffror.',c1:'#b4c4a4',c2:'#dc5a3c',def:{bg:{t:'solid',c:'#0e1012'},
  deco:[R(6,6,227,273,40,'#22262a'),R(14,44,211,197,10,'#aaba9e'),TX('D I G I T A L',120,17,10,'pb','#96a0aa','c',0),TX('24H',120,251,10,'pb','#dc5a3c','c',2),
    L(24,100,215,100,'#788a70',1.2),L(24,190,215,190,'#788a70',1.2),TX('DAG',66,50,9.5,'pb','#18201a','c',1),TX('BATT %',174,50,9.5,'pb','#18201a','c',1),
    TX('STEG',66,194,9.5,'pb','#18201a','c',1),TX('PULS',174,194,9.5,'pb','#18201a','c',1)],
  els:[tm(120,108,74,'sg','#18201a',{ghost:'#9aaa8f'}),vl('day',66,64,27,'sg','#18201a','',{ghost:'#9aaa8f'}),vl('battv',174,64,27,'sg','#18201a','',{pct:false}),
    vl('steps',66,208,27,'sg','#18201a','',{ghost:'#9aaa8f'}),vl('pulse',174,208,27,'sg','#18201a','')]}},
{key:'terminal',name:'Terminal',desc:'Grön text på svart, som en gammal dator.',c1:'#3dff7a',c2:'#0f7a3a',def:{bg:{t:'solid',c:'#020a05'},
  deco:[TX('> klocka',18,14,13,'mo','#35c46a','l',0),L(18,112,222,112,'#145c2e',1),TX('puls',22,123,16,'mo','#35c46a'),TX('steg',22,151,16,'mo','#35c46a'),TX('kcal',22,179,16,'mo','#35c46a'),
    TX('batt',22,207,16,'mo','#35c46a'),TX('dag',22,235,16,'mo','#35c46a'),R(22,262,8,12,0,'#3dff7a')],
  els:[tm(120,44,62,'mo','#3dff7a'),vl('pulse',176,124,18,'mo','#3dff7a',''),vl('steps',176,152,18,'mo','#3dff7a',''),vl('kcal',176,180,18,'mo','#3dff7a',''),
    vl('battv',170,208,18,'mo','#3dff7a',''),vl('day',176,236,18,'mo','#3dff7a','')]}},
{key:'solnedgang',name:'Solnedgång',desc:'Varm färgtoning med stor tid.',c1:'#ff9a3c',c2:'#6a1fd0',def:{bg:{t:'grad',c:'#ff9a3c',c2:'#5a1cc0',a:170},
  els:[tm(120,70,72,'pb','#ffffff'),vl('day',120,156,26,'pb','#ffffff','DAG'),vl('steps',56,232,19,'pm','#ffffff','STEG'),vl('pulse',128,232,19,'pm','#ffffff','PULS'),vl('battv',186,232,19,'pm','#ffffff','BATT')]}},
{key:'tidning',name:'Tidning',desc:'Ljus med serifsiffror och tunna linjer.',c1:'#c9c4b6',c2:'#5a5a66',def:{bg:{t:'solid',c:'#edebe6'},
  deco:[L(20,38,220,38,'#16161a',2.4),L(20,43,220,43,'#16161a',.8),L(20,138,220,138,'#16161a',.8),L(20,214,220,214,'#16161a',.8),L(20,270,220,270,'#16161a',2.4)],
  els:[tm(120,62,78,'se','#16161a'),vl('day',52,156,27,'se','#16161a','DAG'),vl('pulse',120,156,27,'se','#16161a','PULS'),vl('battv',182,156,27,'se','#16161a','BATT'),
    vl('steps',76,228,21,'se','#16161a','STEG'),vl('km',168,228,21,'se','#16161a','KM')]}},
{key:'kapsel',name:'Kapsel',desc:'Tiden staplad till vänster, värden i kapslar till höger.',c1:'#7c8cff',c2:'#2a3170',def:{bg:{t:'solid',c:'#0b0d12'},
  els:[tm(66,50,74,'pb','#ffffff',{lay:'stack',gap:8,c2:'#7c8cff'}),vl('day',66,222,26,'pb','#7c8cff','DAG'),
    vl('pulse',184,28,22,'pb','#ffffff','PULS',{plate:{c:'#1a1f2e',r:18,w:92}}),vl('steps',184,92,22,'pb','#ffffff','STEG',{plate:{c:'#1a1f2e',r:18,w:92}}),
    vl('kcal',184,156,22,'pb','#ffffff','KCAL',{plate:{c:'#1a1f2e',r:18,w:92}}),vl('battv',178,220,22,'pb','#ffffff','BATT',{plate:{c:'#1a1f2e',r:18,w:92,dx:6}})]}},
{key:'brutal',name:'Brutal',desc:'Svart på vitt, så stort det går.',c1:'#f4f4f0',c2:'#8a8a8a',def:{bg:{t:'solid',c:'#f4f4f0'},
  deco:[R(0,198,240,88,0,'#0a0a0a')],
  els:[tm(120,14,104,'pb','#0a0a0a',{lay:'stack',gap:6}),vl('steps',50,216,22,'pb','#ffffff','STEG'),vl('pulse',130,216,22,'pb','#ffffff','PULS'),vl('battv',190,216,22,'pb','#ffffff','BATT')]}},
{key:'hav',name:'Hav',desc:'Djupblått med tunna siffror och väder.',c1:'#3f8cff',c2:'#0d3a7a',def:{bg:{t:'grad',c:'#0f4186',c2:'#020a18',a:180},
  deco:[L(40,148,200,148,'#ffffff',1,.25)],
  els:[tm(120,64,78,'pl','#eaf4ff'),{k:'weather',x:62,y:164,s:32},vl('temp',108,172,22,'pm','#eaf4ff',''),vl('battv',182,172,22,'pm','#eaf4ff',''),
    vl('steps',76,230,20,'pm','#eaf4ff','STEG'),vl('pulse',172,230,20,'pm','#eaf4ff','PULS')]}},
{key:'rosa',name:'Rosa',desc:'Ljus och mjuk med mörk text.',c1:'#ff9eb5',c2:'#ffb28a',def:{bg:{t:'grad',c:'#ffd9e2',c2:'#ffb28a',a:160},
  els:[tm(120,52,74,'pb','#3a1530'),vl('day',48,160,25,'pb','#3a1530','DAG',{plate:{c:'#ffffff',a:.5,r:16,w:66}}),vl('pulse',120,160,25,'pb','#3a1530','PULS',{plate:{c:'#ffffff',a:.5,r:16,w:66}}),
    vl('battv',186,160,25,'pb','#3a1530','BATT',{plate:{c:'#ffffff',a:.5,r:16,w:66,dx:6}}),vl('steps',120,236,21,'pb','#3a1530','STEG')]}},
{key:'sport',name:'Sport',desc:'Gult och svart med stegen i fokus.',c1:'#f5e11b',c2:'#8a7d00',sport:true,def:{bg:{t:'solid',c:'#0a0a0a'},
  deco:[R(0,0,240,60,0,'#f5e11b'),L(20,180,220,180,'#2a2a2a',1.5)],
  els:[tm(120,12,52,'pb','#0a0a0a'),vl('steps',120,80,66,'pb','#ffffff','STEG I DAG',{lg:4}),vl('pulse',50,196,28,'pb','#f5e11b','PULS'),vl('kcal',124,196,28,'pb','#ffffff','KCAL'),vl('battv',192,196,28,'pb','#ffffff','BATT'),
    vl('km',120,250,17,'pm','#9a9a9a','KM',{lg:0})]}},
{key:'vader',name:'Väder',desc:'Stort väder med temperatur, tiden under.',c1:'#58a6ff',c2:'#172c5c',def:{bg:{t:'grad',c:'#3f86e0',c2:'#152a58',a:180},
  els:[{k:'weather',x:120,y:14,s:92},vl('temp',108,112,46,'pb','#ffffff',''),tm(120,168,48,'pm','#ffffff'),vl('day',52,240,19,'pm','#ffffff','DAG'),vl('battv',182,240,19,'pm','#ffffff','BATT')]}},
{key:'energi',name:'Energi',desc:'Kalorier, puls och steg på färgade plattor.',c1:'#ffa53c',c2:'#4be08a',sport:true,def:{bg:{t:'solid',c:'#101418'},
  els:[tm(120,14,46,'pb','#ffffff'),vl('kcal',64,96,38,'pb','#231200','KCAL',{lc:'#6a3c00',plate:{c:'#ffa53c',r:22,w:106,h:84,py:18}}),
    vl('pulse',176,96,38,'pb','#2a0008','PULS',{lc:'#7a1524',plate:{c:'#ff6478',r:22,w:106,h:84,py:18}}),
    vl('steps',120,196,46,'pb','#04200f','STEG',{lc:'#0d5a2c',plate:{c:'#4be08a',r:22,w:218,h:84,py:16}})]}},
{key:'neonsegment',name:'Neon',desc:'Lysande segmentsiffror i cyan och rosa.',c1:'#27e6ff',c2:'#ff3cc8',def:{bg:{t:'solid',c:'#0d0620'},
  els:[tm(120,44,88,'sg','#27e6ff',{ghost:'#1c1340'}),vl('day',50,166,32,'sg','#ff3cc8','DAG',{ghost:'#1c1340'}),vl('pulse',124,166,32,'sg','#ff3cc8','PULS'),vl('battv',190,166,32,'sg','#ff3cc8','BATT %',{pct:false}),
    vl('steps',120,232,26,'sg','#27e6ff','STEG',{ghost:'#1c1340'})]}},
{key:'enkel',name:'Enkel',desc:'Bara tiden och dagen.',c1:'#9aa0b4',c2:'#3a3d4a',def:{bg:{t:'solid',c:'#000000'},
  els:[tm(120,98,84,'pl','#ffffff'),vl('day',120,186,22,'pm','#8a8a92','')]}},
{key:'datum',name:'Datum',desc:'Dagens datum jättestort, tiden under.',c1:'#ff5a36',c2:'#7a2410',def:{bg:{t:'solid',c:'#14110f'},
  els:[vl('day',120,20,150,'pb','#ff5a36',''),tm(120,160,52,'pb','#f2ece4'),vl('steps',66,238,19,'pm','#a09488','STEG'),vl('battv',170,238,19,'pm','#a09488','BATT')]}},
{key:'glas',name:'Glas',desc:'Frostade plattor över norrsken.',c1:'#ff5aa0',c2:'#5a6bff',def:{bg:{t:'aurora',c:'#10081e',cs:['#ff5aa0','#5a6bff','#2ad4c0','#ffb03a']},
  deco:[R(12,212,216,56,20,'#ffffff',.14)],
  els:[tm(120,34,62,'pb','#ffffff',{plate:{c:'#ffffff',a:.14,r:24,w:216,h:76,py:16}}),vl('pulse',54,138,27,'pb','#ffffff','PULS',{plate:{c:'#ffffff',a:.14,r:20,w:84,h:62,py:12}}),
    vl('steps',164,138,27,'pb','#ffffff','STEG',{plate:{c:'#ffffff',a:.14,r:20,w:128,h:62,py:12}}),{k:'weather',x:44,y:224,s:32},vl('temp',90,230,20,'pb','#ffffff',''),vl('battv',182,230,20,'pb','#ffffff','')]}},
{key:'retro',name:'Retro',desc:'Sjuttiotalsränder under tiden.',c1:'#f08a1c',c2:'#3ba89a',def:{bg:{t:'solid',c:'#241710'},
  deco:[R(0,146,240,14,0,'#e8452c'),R(0,160,240,14,0,'#f08a1c'),R(0,174,240,14,0,'#f5c518'),R(0,188,240,14,0,'#3ba89a')],
  els:[tm(120,44,76,'pb','#f8ecd6'),vl('day',48,224,23,'pb','#f8ecd6','DAG'),vl('steps',124,224,23,'pb','#f8ecd6','STEG'),vl('battv',196,224,23,'pb','#f8ecd6','BATT')]}}
// ---------- rörliga: visare och sådant som går ett varv i minuten ----------
,{key:'hybrid',name:'Hybrid',desc:'Visare över en mörk tavla, med tiden i siffror, puls och dag.',c1:'#ff8a3c',c2:'#7c8cff',tested:true,def:{bg:{t:'solid',c:'#0b0d12'},
  els:[TK(60,117,9,'#ffffff',{nums:1,ns:15}),vl('pulse',64,130,18,'pb','#ff6e78','PULS'),vl('day',176,130,18,'pb','#ffffff','DAG'),
    tm(120,194,22,'pm','#c9cee0',{plate:{c:'#1a1f2e',r:11,px:9,py:5}}),HN({style:'bar',ml:94})]}}
,{key:'omlopp',name:'Omlopp',desc:'En komet går ett varv runt tiden varje minut.',c1:'#27e6ff',c2:'#c77dff',tested:true,def:{bg:{t:'solid',c:'#000000'},
  deco:[RG(112,'#ffffff',2,.12)],
  els:[tm(120,104,64,'pl','#ffffff'),vl('day',82,180,24,'pb','#ffffff','DAG'),vl('pulse',158,180,24,'pb','#ff6e78','PULS'),OB('comet','#27e6ff',112,5,{c2:'#c77dff'})]}}
,{key:'kronograf',name:'Kronograf',desc:'Klassisk tavla i marinblått med två små urtavlor.',c1:'#e8dcc0',c2:'#e8452c',def:{bg:{t:'grad',c:'#13204a',c2:'#050814',a:180},
  deco:[RG(27,'#e8dcc0',1.4,.4,70,143),RG(27,'#e8dcc0',1.4,.4,170,143)],
  els:[TK(60,117,9,'#e8dcc0',{nums:1,ns:17,f:'se'}),vl('pulse',70,128,17,'se','#e8dcc0','PULS'),vl('battv',170,128,17,'se','#e8dcc0','BATT',{pct:false}),
    vl('day',120,196,18,'se','#13204a','',{plate:{c:'#e8dcc0',r:6,px:7,py:4}}),HN({style:'taper',hc:'#e8dcc0',mc:'#e8dcc0',sc:'#e8452c',ml:96})]}}
,{key:'station',name:'Station',desc:'Som en stationsklocka, med en röd prick som sekundvisare.',c1:'#e8452c',c2:'#f6f6f2',def:{bg:{t:'solid',c:'#f6f6f2'},
  els:[TK(60,117,13,'#111111',{w:3.4}),HN({style:'bar',hc:'#111111',mc:'#111111',sec:0,ml:98,w:10}),OB('dot','#e8452c',84,9)]}}
,{key:'bauhaus',name:'Bauhaus',desc:'Färgade former och tunna svarta visare.',c1:'#e8452c',c2:'#1f4fa8',def:{bg:{t:'solid',c:'#f1e9d8'},
  deco:[DT(88,108,56,'#e8452c'),R(124,150,84,84,0,'#1f4fa8'),DT(162,84,22,'#f5c518'),L(30,250,210,250,'#111111',3)],
  els:[vl('day',120,256,17,'pb','#111111',''),HN({style:'bar',hc:'#111111',mc:'#111111',sc:'#111111',ml:100,w:6})]}}
,{key:'neonur',name:'Neonur',desc:'Lysande ring och tunna visare i cyan och rosa.',c1:'#27e6ff',c2:'#ff3cc8',def:{bg:{t:'solid',c:'#07040f'},
  deco:[{k:'glow',x:120,y:143,r:120,c:'#ff3cc8',i:.2},{k:'arcg',x:120,y:143,r:114,a0:0,a1:180,c:'#ff3cc8',c2:'#27e6ff',w:4},{k:'arcg',x:120,y:143,r:114,a0:180,a1:360,c:'#27e6ff',c2:'#ff3cc8',w:4}],
  els:[TK(12,103,8,'#ffffff'),tm(120,196,24,'sg','#27e6ff',{ghost:'#1c1340'}),HN({style:'thin',hc:'#27e6ff',mc:'#ffffff',sc:'#ff3cc8',ml:96,w:6})]}}
,{key:'instrument',name:'Instrument',desc:'Som ett instrument i en cockpit, med steg och batteri.',c1:'#ff8a3c',c2:'#5fe39a',def:{bg:{t:'solid',c:'#15171a'},
  deco:[RG(119,'#2a2e34',2,1)],
  els:[TK(60,116,10,'#ffffff',{nums:1,ns:18}),vl('steps',120,80,18,'pb','#ffffff','STEG'),vl('battv',114,186,18,'pb','#5fe39a','BATT'),HN({style:'baton',ml:96,w:9})]}}
,{key:'pilot',name:'Pilot',desc:'Stor tydlig tavla med fyra värden i hörnen.',c1:'#ffc83c',c2:'#4ea1ff',def:{bg:{t:'grad',c:'#1c2530',c2:'#0a0d12',a:180},
  els:[TK(60,112,11,'#ffffff',{nums:1,ns:19,w:2.6}),vl('pulse',40,8,18,'pb','#ff6e78','PULS'),vl('battv',198,8,18,'pb','#ffffff','BATT',{pct:false}),
    vl('day',40,244,18,'pb','#ffffff','DAG'),vl('kcal',196,244,18,'pb','#ffc83c','KCAL'),HN({style:'taper',sc:'#ffc83c',ml:92})]}}
,{key:'prick',name:'Prick',desc:'Nästan tom. En vit prick visar sekunderna.',c1:'#9aa0b4',c2:'#3a3d4a',tested:true,def:{bg:{t:'solid',c:'#000000'},
  els:[TK(60,110,2,'#ffffff',{w:2}),tm(120,106,66,'pl','#ffffff'),OB('dot','#ffffff',110,5)]}}
,{key:'pulsvarv',name:'Pulsvarv',desc:'Pulsen stort i mitten och en röd prick som går runt.',c1:'#ff4660',c2:'#a01e5a',sport:true,def:{bg:{t:'solid',c:'#000000'},
  deco:[{k:'glow',x:120,y:143,r:118,c:'#ff2846',i:.3},RG(110,'#ff465f',3,.25)],
  els:[tm(120,52,24,'pb','#ffffff'),vl('pulse',120,84,74,'pb','#ffecee','SLAG / MIN'),vl('steps',84,196,17,'pb','#ffffff','STEG'),vl('battv',152,196,17,'pb','#ffffff','BATT',{pct:false}),OB('dot','#ff465f',110,6)]}}
,{key:'solvarv',name:'Solvarv',desc:'En sol går runt tiden i skymningsfärger.',c1:'#ffe27a',c2:'#ff7e4a',def:{bg:{t:'grad',c:'#16235e',c2:'#ff7e4a',a:180},
  deco:[RG(108,'#ffffff',1,.2)],
  els:[tm(120,102,62,'pb','#ffffff'),vl('day',120,176,20,'pm','#ffffff','DAG'),OB('dot','#ffe27a',108,9)]}}
,{key:'rymd',name:'Rymd',desc:'Stjärnhimmel, väder och en komet i omlopp.',c1:'#7c8cff',c2:'#c77dff',def:{bg:{t:'aurora',c:'#05060f',cs:['#3b2a8c','#0a5a8c','#8c2a6a','#1a1f5c']},
  deco:[DT(30,60,1.2,'#ffffff',.9),DT(200,52,1,'#ffffff',.7),DT(66,24,.9,'#ffffff',.6),DT(176,236,1.2,'#ffffff',.8),DT(40,226,1,'#ffffff',.6),DT(214,150,.9,'#ffffff',.7),DT(22,140,1,'#ffffff',.5),DT(150,22,1.1,'#ffffff',.8),DT(96,262,.9,'#ffffff',.6)],
  els:[{k:'weather',x:96,y:60,s:30},vl('temp',132,64,20,'pm','#ffffff',''),tm(120,106,60,'pl','#ffffff'),vl('steps',120,180,20,'pm','#ffffff','STEG'),OB('comet','#ffffff',112,4,{c2:'#7c8cff'})]}}
// ---------- tecknade: egna figurer, med armar som visare eller något som springer runt ----------
,{key:'robot',name:'Robot',desc:'En robot som pekar ut tiden med armarna. En stjärna flyger runt.',c1:'#35c9c3',c2:'#ff5a5f',toon:true,def:{bg:{t:'solid',c:'#35c9c3'},
  deco:[{k:'toon',n:'robot'}],
  els:[tm(120,168,22,'sg','#5fe39a',{ghost:'#1c2a26'}),vl('pulse',32,10,17,'pb','#10131c','PULS'),vl('battv',208,10,17,'pb','#10131c','BATT',{pct:false}),
    HN({style:'arm',hc:'#c9d6e6',mc:'#c9d6e6',tc:'#ff5a5f',sec:0,ml:84,w:11}),OB('sprite','#ffe14a',109,10,{n:'star'})]}}
,{key:'monster',name:'Monster',desc:'Ett glatt monster vars öga rullar runt ett varv i minuten.',c1:'#5fd068',c2:'#6a4bd8',toon:true,def:{bg:{t:'solid',c:'#6a4bd8'},
  deco:[{k:'toon',n:'monster'}],
  els:[tm(120,6,30,'pb','#ffffff'),OB('sprite','#1b1d2a',24,16,{n:'pupil'})]}}
,{key:'kattmus',name:'Musjakt',desc:'Musen springer runt katten, ett varv i minuten.',c1:'#ff9f43',c2:'#9aa0b4',toon:true,def:{bg:{t:'solid',c:'#ffe9c7'},
  deco:[RG(106,'#e6c898',2,1),{k:'toon',n:'cat'}],
  els:[tm(120,194,30,'pb','#3a2a1a'),vl('day',38,246,18,'pb','#3a2a1a','DAG'),vl('pulse',202,246,18,'pb','#e8452c','PULS'),OB('sprite','#9aa0b4',106,11,{n:'mouse'})]}}
,{key:'raket',name:'Raket',desc:'En raket flyger runt en glad planet.',c1:'#ff7f66',c2:'#ffd76a',toon:true,def:{bg:{t:'grad',c:'#1f2766',c2:'#090c24',a:180},
  deco:[DT(30,60,1.3,'#ffffff',.9),DT(206,50,1.1,'#ffffff',.8),DT(64,22,1,'#ffffff',.7),DT(186,244,1.2,'#ffffff',.8),DT(22,150,1,'#ffffff',.6),DT(218,160,1,'#ffffff',.7),DT(160,20,1.2,'#ffffff',.8),DT(88,268,1,'#ffffff',.6),
    RG(106,'#ffffff',1,.16),{k:'toon',n:'planet'}],
  els:[tm(120,208,30,'pb','#ffffff'),vl('day',38,246,18,'pb','#ffffff','DAG'),vl('pulse',202,246,18,'pb','#ffd76a','PULS'),OB('sprite','#ffffff',106,12,{n:'rocket'})]}}
,{key:'blomma',name:'Blomma',desc:'Ett bi surrar runt en solros.',c1:'#ffd23f',c2:'#58c26a',toon:true,def:{bg:{t:'grad',c:'#6cc6ff',c2:'#d2f1ff',a:180},
  deco:[{k:'toon',n:'flower'}],
  els:[tm(120,6,30,'pb','#1b2a4a'),OB('sprite','#ffd23f',96,11,{n:'bee'})]}}
// ---------- fler rörliga: tim-, minut- och sekunddelen används till annat än vanliga visare ----------
,{key:'solsystem',name:'Solsystem',desc:'Tre planeter visar tiden: innerst timme, sedan minut, ytterst sekund.',c1:'#ffcf3a',c2:'#5cc8ff',tested:true,def:{bg:{t:'grad',c:'#161a44',c2:'#05061a',a:180},
  deco:[DT(26,40,1.2,'#ffffff',.9),DT(212,34,1,'#ffffff',.7),DT(20,250,1.1,'#ffffff',.7),DT(218,256,1.3,'#ffffff',.8),DT(60,14,.9,'#ffffff',.6),DT(180,272,1,'#ffffff',.6),
    RG(58,'#ffffff',1,.22),RG(84,'#ffffff',1,.22),RG(110,'#ffffff',1,.22),{k:'glow',x:120,y:143,r:70,c:'#ffb02e',i:.5},DT(120,143,40,'#ffcf3a')],
  els:[tm(120,133,20,'pb','#4a2a00'),OB('sprite','#5cc8ff',58,10,{n:'ball',on:'h'}),OB('sprite','#ff8a5c',84,8,{n:'ball',on:'m',ring:1,c2:'#ffd76a'}),OB('sprite','#ffffff',110,5,{n:'ball'})]}}
,{key:'snigelrace',name:'Snigelrace',desc:'Snigeln är timvisare, haren minutvisare och biet sekundvisare.',c1:'#7bd389',c2:'#c9793a',toon:true,def:{bg:{t:'grad',c:'#8fdc7a',c2:'#4fae5a',a:180},
  deco:[RG(110,'#e9cf96',19),RG(87,'#f1dcae',19),RG(64,'#e9cf96',19),L(120,24,120,88,'#ffffff',3,.9),DT(22,22,5,'#ff6f91'),DT(22,22,2,'#ffe14a'),DT(218,264,5,'#ffffff'),DT(218,264,2,'#ffe14a'),DT(222,24,4,'#ffe14a'),DT(18,262,4,'#ff9f43')],
  els:[tm(120,132,22,'pb','#1e4a22'),OB('sprite','#c9793a',64,9.5,{n:'snail',on:'h'}),OB('sprite','#f1ece4',87,9,{n:'hare',on:'m'}),OB('sprite','#ffd23f',108,8,{n:'bee'})]}}
,{key:'loparbana',name:'Löparbana',desc:'Löparen springer ett varv i minuten. Pulsen står stort i mitten.',c1:'#e0533a',c2:'#ffd23f',sport:true,def:{bg:{t:'solid',c:'#0f3d2b'},
  deco:[RG(104,'#c8452c',26),RG(96,'#ffffff',1,.6),RG(112,'#ffffff',1,.6),RG(91,'#ffffff',1.6,.9),RG(117,'#ffffff',1.6,.9),L(120,26,120,52,'#ffffff',3)],
  els:[tm(120,70,22,'pb','#ffffff'),vl('pulse',120,96,50,'pb','#ffffff','PULS'),vl('steps',92,176,18,'pb','#ffd23f',''),vl('kcal',156,176,18,'pb','#ffffff',''),OB('sprite','#ffd23f',104,8.5,{n:'runner'})]}}
,{key:'intervall',name:'Intervall',desc:'40 sekunder arbete (grönt) och 20 sekunder vila (rött), varje minut.',c1:'#5fe39a',c2:'#ff5a6a',sport:true,def:{bg:{t:'solid',c:'#000000'},
  deco:[{k:'ring',x:120,y:143,r:106,c:'#3fcf7f',w:16,a0:-89,a1:149,cap:'butt'},{k:'ring',x:120,y:143,r:106,c:'#ff4d5e',w:16,a0:151,a1:269,cap:'butt'},
    TX('KÖR 40',120,52,12,'pb','#5fe39a','c',1),TX('VILA 20',120,222,12,'pb','#ff6e78','c',1)],
  els:[tm(120,70,24,'pb','#ffffff'),vl('pulse',120,98,64,'pb','#ffffff',''),vl('kcal',120,180,24,'pb','#ffc83c','KCAL'),OB('dot','#ffffff',106,8)]}}
,{key:'tabata',name:'Tabata',desc:'20 sekunder arbete och 10 sekunder vila, två gånger per minut.',c1:'#ffc83c',c2:'#4ea1ff',sport:true,def:{bg:{t:'solid',c:'#06080f'},
  deco:[{k:'ring',x:120,y:143,r:106,c:'#ffc83c',w:16,a0:-89,a1:29,cap:'butt'},{k:'ring',x:120,y:143,r:106,c:'#4ea1ff',w:16,a0:31,a1:89,cap:'butt'},
    {k:'ring',x:120,y:143,r:106,c:'#ffc83c',w:16,a0:91,a1:209,cap:'butt'},{k:'ring',x:120,y:143,r:106,c:'#4ea1ff',w:16,a0:211,a1:269,cap:'butt'},
    TX('KÖR 20',120,52,12,'pb','#ffc83c','c',1),TX('VILA 10',120,222,12,'pb','#4ea1ff','c',1)],
  els:[tm(120,70,24,'pb','#ffffff'),vl('pulse',120,98,64,'pb','#ffffff',''),vl('steps',120,180,24,'pb','#ffffff','STEG'),OB('dot','#ffffff',106,8)]}}
,{key:'enhand',name:'Enhand',desc:'En enda visare går ett varv på tolv timmar. Varje streck är en kvart.',c1:'#d83a2e',c2:'#f3efe6',def:{bg:{t:'solid',c:'#f3efe6'},
  els:[TK(48,117,11,'#1b1d2a',{nums:12,ns:15,w:2.4}),vl('day',120,190,20,'pb','#f3efe6','',{plate:{c:'#1b1d2a',r:7,px:8,py:4}}),
    HN({style:'taper',hc:'#d83a2e',sec:0,nomin:1,ml:92,hk:1.14,w:10}),OB('dot','#1b1d2a',26,3.5)]}}
,{key:'racerbana',name:'Racerbana',desc:'Bilen kör ett varv i minuten.',c1:'#ff4d4d',c2:'#3fae5a',toon:true,def:{bg:{t:'solid',c:'#2f9a52'},
  deco:[RG(100,'#3a3d46',30),RG(116,'#ffffff',4),{k:'ring',x:120,y:143,r:116,c:'#e8452c',w:4,dash:[8,8],cap:'butt'},RG(84,'#ffffff',4),{k:'ring',x:120,y:143,r:84,c:'#e8452c',w:4,dash:[8,8],cap:'butt'},
    {k:'ring',x:120,y:143,r:100,c:'#ffffff',w:1.6,dash:[9,9],cap:'butt',a:.7},R(116,29,8,28,0,'#ffffff'),R(116,29,4,7,0,'#1b1d2a'),R(120,36,4,7,0,'#1b1d2a'),R(116,43,4,7,0,'#1b1d2a'),R(120,50,4,7,0,'#1b1d2a')],
  els:[tm(120,112,32,'pb','#ffffff'),vl('pulse',120,152,22,'pb','#ffe14a','PULS'),OB('sprite','#ff4d4d',100,11,{n:'car'})]}}
,{key:'akvarium',name:'Akvarium',desc:'Fisken simmar ett varv i minuten, sköldpaddan ett varv i timmen.',c1:'#ffa53c',c2:'#1e7fc2',toon:true,def:{bg:{t:'grad',c:'#2a98dc',c2:'#0a2a5c',a:180},
  deco:[{k:'toon',n:'sea'}],
  els:[tm(120,128,28,'pb','#ffffff'),OB('sprite','#2e9e4f',70,11,{n:'turtle',on:'m'}),OB('sprite','#ffa53c',104,11,{n:'fish'})]}}
,{key:'blackfisk',name:'Bläckfisk',desc:'Två av armarna pekar ut tiden. En bubbla stiger runt.',c1:'#ff6f91',c2:'#2a98dc',toon:true,def:{bg:{t:'grad',c:'#3fb6e8',c2:'#0f3f7a',a:180},
  deco:[{k:'toon',n:'octopus'}],
  els:[tm(120,8,30,'pb','#ffffff'),HN({style:'arm',hc:'#ff6f91',mc:'#ff6f91',tc:'#ffd0dc',sec:0,ml:86,w:12}),OB('sprite','#e6f7ff',110,7,{n:'bubble'})]}}
,{key:'taget',name:'Tåget',desc:'Ett litet tåg kör runt rälsen, ett varv i minuten.',c1:'#e8452c',c2:'#2f6fd0',toon:true,def:{bg:{t:'grad',c:'#bfe9ff',c2:'#9fdc8a',a:180},
  deco:[{k:'ticks',n:60,r:113,len:22,c:'#a57b4f',w:3.4,even:1},RG(108,'#5a5e6a',2.6),RG(96,'#5a5e6a',2.6),DT(120,143,84,'#8fd47c'),
    DT(60,196,13,'#3fa85a'),DT(72,186,10,'#4fbf6a'),R(64,200,5,12,0,'#7a5230'),DT(182,92,12,'#3fa85a'),DT(172,100,9,'#4fbf6a'),R(178,102,5,12,0,'#7a5230')],
  els:[tm(120,112,34,'pb','#1b3a2a'),vl('day',92,160,20,'pb','#1b3a2a','DAG'),vl('pulse',150,160,20,'pb','#e8452c','PULS'),OB('sprite','#e8452c',102,10,{n:'loco'})]}}
// ---------- fiffiga: rörelsen gör något mer än att bara peka ----------
,{key:'fyr',name:'Fyr',desc:'Fyrens ljus sveper runt varje minut. Segelbåten seglar ett varv i timmen.',c1:'#ffe27a',c2:'#0e5a8a',toon:true,tested:true,def:{bg:{t:'grad',c:'#1272ad',c2:'#07355e',a:180},
  deco:[{k:'toon',n:'isle'}],
  els:[tm(120,8,28,'pb','#ffffff'),vl('day',38,244,18,'pb','#ffffff','DAG'),vl('battv',202,244,18,'pb','#ffffff','BATT',{pct:false}),
    OB('sprite','#ffffff',88,12,{n:'boat',on:'m'}),OB('beam','#fff3b0',108,0)]}}
,{key:'radar',name:'Radar',desc:'Svepet går runt varje minut. Grön prick är timmen, gul prick är minuten.',c1:'#3dff7a',c2:'#ffe14a',def:{bg:{t:'solid',c:'#02100a'},
  deco:[RG(40,'#1f9c4c',1,.55),RG(70,'#1f9c4c',1,.55),RG(96,'#1f9c4c',1,.55),RG(112,'#1f9c4c',1.6,.9),L(8,143,232,143,'#1f9c4c',1,.4),L(120,31,120,255,'#1f9c4c',1,.4),{k:'ticks',n:12,r:112,len:6,c:'#3dff7a',w:2,even:1},
    DT(92,270,4,'#3dff7a'),TX('TIM',100,264,11,'pb','#3dff7a','l',1),DT(134,270,4,'#ffe14a'),TX('MIN',142,264,11,'pb','#ffe14a','l',1)],
  els:[tm(120,126,30,'mo','#3dff7a'),vl('pulse',40,8,18,'mo','#3dff7a','PULS'),vl('battv',200,8,18,'mo','#3dff7a','BATT',{pct:false}),
    OB('sprite','#3dff7a',70,6,{n:'blip',on:'h'}),OB('sprite','#ffe14a',96,5.5,{n:'blip',on:'m'}),OB('sweep','#3dff7a',110,5)]}}
,{key:'glapp',name:'Glapp',desc:'Tiden syns som hål i ringen: det breda hålet är timmen, det smala minuten.',c1:'#27e6ff',c2:'#ff3cc8',tested:true,def:{bg:{t:'solid',c:'#05060c'},
  deco:[{k:'glow',x:120,y:143,r:120,c:'#7c4dff',i:.18},{k:'arcg',x:120,y:143,r:100,a0:0,a1:180,c:'#27e6ff',c2:'#ff3cc8',w:14},{k:'arcg',x:120,y:143,r:100,a0:180,a1:360,c:'#ff3cc8',c2:'#27e6ff',w:14},
    {k:'ticks',n:12,r:86,len:5,c:'#ffffff',w:2,even:1}],
  els:[tm(120,112,26,'pb','#c9cee0'),vl('day',92,150,20,'pb','#ffffff','DAG'),vl('pulse',148,150,20,'pb','#ff6e78','PULS'),
    OB('sprite','#05060c',100,12,{n:'notch',w:32,on:'h'}),OB('sprite','#05060c',100,12,{n:'notch',w:11,on:'m'}),OB('sprite','#ffffff',100,4,{n:'ball'})]}}
,{key:'lins',name:'Lins',desc:'Två linser ringar in tiden: orange på timmen, blå på minuten.',c1:'#ff8a3c',c2:'#27e6ff',def:{bg:{t:'solid',c:'#0b0d12'},
  deco:[RG(104,'#ffffff',1,.08),RG(70,'#ffffff',1,.08),{k:'numring',r:104,s:13,f:'pb',c:'#8d93a8',list:['00','05','10','15','20','25','30','35','40','45','50','55']},
    {k:'numring',r:70,s:18,f:'pb',c:'#c9cee0',list:['12','1','2','3','4','5','6','7','8','9','10','11']}],
  els:[vl('day',120,122,24,'pb','#ffffff','DAG'),OB('sprite','#ff8a3c',70,15,{n:'lens',on:'h'}),OB('sprite','#27e6ff',104,13,{n:'lens',on:'m'}),OB('dot','#ffffff',44,3)]}}
,{key:'pomodoro',name:'Pomodoro',desc:'Tomaten visar var du är: 25 minuter fokus (rött) och 5 minuter paus (grönt).',c1:'#ff4d3a',c2:'#5fe39a',def:{bg:{t:'solid',c:'#170d0d'},
  deco:[{k:'ring',x:120,y:143,r:104,c:'#d8402e',w:13,a0:-89,a1:59,cap:'butt'},{k:'ring',x:120,y:143,r:104,c:'#4fd08a',w:13,a0:61,a1:89,cap:'butt'},
    {k:'ring',x:120,y:143,r:104,c:'#d8402e',w:13,a0:91,a1:239,cap:'butt'},{k:'ring',x:120,y:143,r:104,c:'#4fd08a',w:13,a0:241,a1:269,cap:'butt'},
    RG(86,'#ffffff',1,.14),TX('FOKUS 25',120,64,12,'pb','#ff8a7a','c',1),TX('PAUS 5',120,210,12,'pb','#5fe39a','c',1)],
  els:[tm(120,100,40,'pb','#ffffff'),vl('steps',120,152,22,'pb','#ffffff','STEG'),OB('sprite','#ff4d3a',104,10,{n:'tomato',on:'m'}),OB('dot','#ffffff',86,3)]}}
,{key:'solur',name:'Solur',desc:'En skugga visar timmen, som på ett solur. En fjäril flyger runt.',c1:'#cdb98f',c2:'#ff9f43',def:{bg:{t:'grad',c:'#efe3c8',c2:'#c9b388',a:160},
  deco:[RG(116,'#8a7550',2.4),RG(88,'#8a7550',1.2,.7),{k:'numring',r:102,s:14,f:'se',c:'#4a3c22',list:['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI']},
    {k:'ticks',n:48,r:86,len:6,c:'#8a7550',w:1.8},{k:'toon',n:'gnomon'}],
  els:[tm(120,190,22,'se','#3a2e18',{plate:{c:'#f6ecd4',a:.85,r:7,px:8,py:4}}),HN({style:'shadow',hc:'#2a1c06',sec:0,nomin:1,ml:80,hk:1.2,w:20}),OB('sprite','#ff9f43',64,8,{n:'butterfly'})]}}
,{key:'ormen',name:'Ormen',desc:'Ormen jagar äpplet runt tiden och hinner ikapp det en gång i minuten.',c1:'#ffd23f',c2:'#2f8f4e',toon:true,def:{bg:{t:'grad',c:'#2f9a52',c2:'#125228',a:180},
  deco:[{k:'toon',n:'jungle'},RG(104,'#0e3d1e',20,.35)],
  els:[tm(120,104,36,'pb','#ffffff'),vl('day',92,152,20,'pb','#ffffff','DAG'),vl('pulse',148,152,20,'pb','#ffe14a','PULS'),OB('sprite','#ff4d4d',104,8,{n:'apple',on:'m'}),OB('snake','#ffd23f',104,7,{c2:'#e8452c'})]}}
,{key:'andas',name:'Andas',desc:'Andningshjälp: andas in på ljust fält och ut på mörkt. Sex lugna andetag i minuten.',c1:'#5cd6ff',c2:'#1d4f8f',sport:true,def:{bg:{t:'solid',c:'#061425'},
  deco:[...Array.from({length:12},(_,k)=>({k:'ring',x:120,y:143,r:104,c:k%2?'#1d4f8f':'#5cd6ff',w:16,a0:-90+k*30+1,a1:-60+k*30-1,cap:'butt'})),
    TX('LJUST = IN',120,60,11,'pb','#5cd6ff','c',1),TX('MÖRKT = UT',120,214,11,'pb','#6f9fe0','c',1)],
  els:[tm(120,76,22,'pb','#ffffff'),vl('pulse',120,102,58,'pb','#ffffff','PULS'),OB('sprite','#ffffff',104,9,{n:'lens'})]}}
,{key:'nedrakning',name:'Nedräkning',desc:'Linsen visar hur många sekunder som är kvar av minuten. Bra för plankan och vilan.',c1:'#ffc83c',c2:'#ff5a36',sport:true,def:{bg:{t:'solid',c:'#0d0d0f'},
  deco:[RG(104,'#26262c',22),{k:'numring',r:104,s:13,f:'pb',c:'#ffffff',list:['60','55','50','45','40','35','30','25','20','15','10','5']},TX('SEKUNDER KVAR',120,62,11,'pb','#ffc83c','c',1)],
  els:[tm(120,80,26,'pb','#ffffff'),vl('pulse',120,112,46,'pb','#ffffff','PULS'),vl('kcal',120,188,20,'pb','#ffc83c',''),OB('sprite','#ffc83c',104,13,{n:'lens'})]}}
// ---------- tjugo till ----------
,{key:'pizza',name:'Pizza',desc:'Den uppätna biten pekar på timmen. Basilikabladet visar minuten och flugan sekunden.',c1:'#ffd45a',c2:'#d8402e',toon:true,def:{bg:{t:'solid',c:'#7a1f1f'},
  deco:[{k:'toon',n:'pizza'}],
  els:[tm(120,131,22,'pb','#5a2a0a'),OB('wedge','#f3efe6',106,0,{ang:14,r0:44,on:'h'}),OB('sprite','#3fbf62',100,8,{n:'leaf',on:'m'}),OB('sprite','#1b1d2a',112,5,{n:'fly'})]}}
,{key:'dart',name:'Dart',desc:'Gul pil sitter på timmen, röd pil på minuten.',c1:'#d8402e',c2:'#2e9e4f',sport:true,def:{bg:{t:'solid',c:'#101216'},
  deco:[DT(120,143,104,'#1b1d2a'),...RSEG(60,52,12,['#f1e6c8','#1b1d2a'],.6),...RSEG(94,12,12,['#d8402e','#2e9e4f'],.6),RG(101,'#c9cdd6',1.4),RG(87,'#c9cdd6',1.2),RG(33,'#c9cdd6',1.2),
    {k:'numring',r:111,s:11,f:'pb',c:'#ffffff',list:['12','1','2','3','4','5','6','7','8','9','10','11']},DT(120,143,32,'#2e9e4f'),DT(120,143,27,'#14161c')],
  els:[tm(120,134,18,'pb','#ffffff'),OB('sprite','#ffd23f',64,8,{n:'dart',on:'h'}),OB('sprite','#ff4d4d',94,7,{n:'dart',on:'m'}),OB('dot','#ffffff',104,2.5)]}}
,{key:'banor',name:'Banor',desc:'Tre kometer i var sin bana: orange är timme, grön minut och blå sekund.',c1:'#ff8a3c',c2:'#27e6ff',def:{bg:{t:'solid',c:'#05060c'},
  deco:[RG(60,'#ffffff',1,.12),RG(86,'#ffffff',1,.12),RG(112,'#ffffff',1,.12),{k:'ticks',n:12,r:120,len:4,c:'#ffffff',w:2,even:1}],
  els:[tm(120,131,24,'pb','#ffffff'),OB('comet','#ff8a3c',60,5,{c2:'#ff3cc8',on:'h'}),OB('comet','#5fe39a',86,5,{c2:'#ffe14a',on:'m'}),OB('comet','#27e6ff',112,4,{c2:'#7c4dff'})]}}
,{key:'svavande',name:'Svävande',desc:'Visare som svävar fritt: det vita strecket är timmen, det orange minuten.',c1:'#ff8a3c',c2:'#1a6a6a',def:{bg:{t:'grad',c:'#0f3b44',c2:'#06141a',a:180},
  deco:[{k:'ticks',n:12,r:116,len:3,c:'#ffffff',w:3,even:1}],
  els:[vl('day',120,112,42,'pl','#ffffff','DAG'),OB('sprite','#ffffff',72,20,{n:'notch',w:9,on:'h'}),OB('sprite','#ff8a3c',98,15,{n:'notch',w:6,on:'m'}),OB('sprite','#ffffff',114,3.5,{n:'ball'})]}}
,{key:'pilar',name:'Pilar',desc:'Två pilar i kanten pekar in mot tiden: den stora är timmen, den röda minuten.',c1:'#e8452c',c2:'#f3efe6',def:{bg:{t:'solid',c:'#f3efe6'},
  deco:[{k:'ticks',n:60,r:117,len:7,c:'#1b1d2a',w:2},RG(84,'#1b1d2a',1,.15)],
  els:[tm(120,112,34,'pb','#1b1d2a'),vl('day',120,156,22,'pb','#e8452c',''),OB('sprite','#1b1d2a',98,15,{n:'tri',on:'h'}),OB('sprite','#e8452c',100,10,{n:'tri',on:'m'}),OB('dot','#1b1d2a',70,3)]}}
,{key:'blomsterur',name:'Blomsterur',desc:'Fjärilen sitter på timmens blomma. Nyckelpigan visar minuten och biet sekunden.',c1:'#ff6f91',c2:'#58c26a',toon:true,def:{bg:{t:'grad',c:'#7fd47a',c2:'#3f9a52',a:180},
  deco:[{k:'toon',n:'flowers'}],
  els:[tm(120,132,24,'pb','#1e4a22'),OB('sprite','#c77dff',100,9,{n:'butterfly',on:'h'}),OB('sprite','#e8452c',76,7.5,{n:'ladybug',on:'m'}),OB('sprite','#ffd23f',56,6.5,{n:'bee'})]}}
,{key:'jorden',name:'Jorden',desc:'Planet flyger runt jorden varje minut, satelliten varje timme och månen på tolv timmar.',c1:'#2a7fd6',c2:'#4fbf6a',toon:true,def:{bg:{t:'grad',c:'#101638',c2:'#04050f',a:180},
  deco:[DT(24,56,1.2,'#ffffff',.9),DT(214,70,1,'#ffffff',.7),DT(30,236,1.1,'#ffffff',.7),DT(206,226,1.3,'#ffffff',.8),DT(60,262,.9,'#ffffff',.6),DT(186,30,1,'#ffffff',.6),{k:'toon',n:'earth'}],
  els:[tm(120,6,28,'pb','#ffffff'),vl('day',38,246,18,'pb','#ffffff','DAG'),vl('pulse',202,246,18,'pb','#ff6e78','PULS'),
    OB('sprite','#c9cdd6',80,8,{n:'ball',on:'h'}),OB('sprite','#d5d8e0',100,7,{n:'sat',on:'m'}),OB('sprite','#ffffff',62,8,{n:'plane'})]}}
,{key:'kristall',name:'Kristall',desc:'Genomskinliga visare av glas över norrsken.',c1:'#2ad4c0',c2:'#ff5aa0',def:{bg:{t:'aurora',c:'#0a0a1c',cs:['#2ad4c0','#5a6bff','#ff5aa0','#ffb03a']},
  els:[TK(12,116,10,'#ffffff',{w:2.6}),vl('day',174,131,20,'pb','#ffffff','DAG'),vl('pulse',66,131,20,'pb','#ffffff','PULS'),HN({style:'glass',hc:'#ffffff',mc:'#ffffff',sc:'#ffffff',ml:96,w:16})]}}
,{key:'prickmatris',name:'Prickmatris',desc:'Siffror av lysande prickar, som på en gammal skylt.',c1:'#ffb02e',c2:'#5a3a0e',def:{bg:{t:'solid',c:'#07090d'},
  deco:[RG(112,'#ffb02e',1,.14)],
  els:[tm(120,92,52,'dm','#ffb02e',{ghost:'#1d1606'}),vl('day',70,164,22,'dm','#ffb02e','DAG'),vl('pulse',124,164,22,'dm','#ff6e78','PULS'),vl('battv',176,164,22,'dm','#ffb02e','BATT',{pct:false}),OB('comet','#ffb02e',112,4,{c2:'#ff5a36'})]}}
,{key:'kaffe',name:'Kaffe',desc:'Två teskedar pekar ut tiden över en kopp kaffe. En kaffeböna rullar runt.',c1:'#c8a27a',c2:'#6b3f22',toon:true,def:{bg:{t:'grad',c:'#b8875a',c2:'#8a5f3a',a:140},
  deco:[{k:'toon',n:'cup'}],
  els:[tm(120,104,24,'pb','#f3dfc4'),HN({style:'arm',hc:'#d5d8e0',mc:'#d5d8e0',tc:'#f4f6fa',sec:0,ml:84,w:6}),OB('sprite','#6b3f22',106,7,{n:'bean'})]}}
,{key:'pingvin',name:'Pingvin',desc:'Pingvinen pekar ut tiden med vingarna. En fisk simmar runt.',c1:'#5cc8ff',c2:'#1f2a44',toon:true,def:{bg:{t:'grad',c:'#bfe6ff',c2:'#eaf6ff',a:180},
  deco:[{k:'toon',n:'penguin'}],
  els:[tm(120,4,28,'pb','#1f2a44'),HN({style:'arm',hc:'#1f2a44',mc:'#1f2a44',tc:'#2f3f66',sec:0,ml:82,w:13}),OB('sprite','#ffa53c',110,8,{n:'fish'})]}}
,{key:'utomjording',name:'Utomjording',desc:'En utomjording pekar ut tiden med armarna. Ett tefat flyger runt.',c1:'#7be08a',c2:'#6a4bd8',toon:true,def:{bg:{t:'grad',c:'#3a2a8a',c2:'#120a36',a:180},
  deco:[DT(22,90,1.2,'#ffffff',.9),DT(216,110,1,'#ffffff',.7),DT(30,200,1.1,'#ffffff',.7),DT(212,214,1.3,'#ffffff',.8),DT(60,262,.9,'#ffffff',.6),DT(190,262,1,'#ffffff',.6),{k:'toon',n:'alien'}],
  els:[tm(120,250,26,'pb','#ffffff'),HN({style:'arm',hc:'#7be08a',mc:'#7be08a',tc:'#b6f5bf',sec:0,ml:84,w:10}),OB('sprite','#c9d6e6',110,8,{n:'ufo'})]}}
,{key:'spoket',name:'Spöket',desc:'Ett spöke svävar runt månen varje minut. Fladdermusen tar en timme på sig.',c1:'#ffe9a8',c2:'#7a4bd8',toon:true,def:{bg:{t:'grad',c:'#2a1c5a',c2:'#0a0620',a:180},
  deco:[DT(26,40,1.2,'#ffffff',.9),DT(210,36,1,'#ffffff',.7),DT(20,250,1.1,'#ffffff',.7),DT(220,246,1.3,'#ffffff',.8),DT(70,16,.9,'#ffffff',.6),DT(170,270,1,'#ffffff',.6),
    {k:'glow',x:120,y:143,r:100,c:'#ffe9a8',i:.35},DT(120,143,54,'#ffe9a8'),DT(96,116,8,'#f1d58a'),DT(150,170,10,'#f1d58a'),DT(146,112,5,'#f1d58a'),DT(92,168,6,'#f1d58a')],
  els:[tm(120,130,28,'pb','#3a2a55'),OB('sprite','#7a4bd8',80,7.5,{n:'bat',on:'m'}),OB('sprite','#ffffff',104,10,{n:'ghost'})]}}
,{key:'fotboll',name:'Fotboll',desc:'Bollen rullar runt mittcirkeln. Röd spelare visar timmen och blå minuten.',c1:'#37a85c',c2:'#ffffff',sport:true,toon:true,def:{bg:{t:'solid',c:'#2f9a52'},
  deco:[{k:'toon',n:'pitch'}],
  els:[tm(120,32,24,'pb','#ffffff',{plate:{c:'#14161c',r:9,px:10,py:5}}),vl('pulse',120,226,22,'pb','#ffffff','',{plate:{c:'#14161c',r:9,px:10,py:4}}),
    OB('sprite','#e8452c',74,8,{n:'ball',on:'h'}),OB('sprite','#3f7fe0',98,8,{n:'ball',on:'m'}),OB('sprite','#ffffff',44,6,{n:'soccer'})]}}
,{key:'kvartett',name:'Kvartett',desc:'Fyra stora värden på en gång: puls, steg, kalorier och distans.',c1:'#ff6e78',c2:'#5fe39a',sport:true,def:{bg:{t:'solid',c:'#000000'},
  deco:[R(5,5,113,135,[40,12,12,12],'#5a1620'),R(122,5,113,135,[12,40,12,12],'#14452c'),R(5,146,113,135,[12,12,12,40],'#5a3a0e'),R(122,146,113,135,[12,12,40,12],'#2a2760')],
  els:[vl('pulse',62,44,38,'pb','#ffffff','PULS'),vl('steps',178,50,28,'pb','#ffffff','STEG'),vl('kcal',62,196,34,'pb','#ffffff','KCAL'),vl('km',184,200,28,'pb','#ffffff','KM'),
    tm(120,132,24,'pb','#ffffff',{plate:{c:'#000000',r:14,px:12,py:7}}),OB('dot','#ffffff',112,3.5)]}}
,{key:'tydlig',name:'Tydlig',desc:'Stora siffror och tjocka visare. Lätt att läsa i farten.',c1:'#ffffff',c2:'#ff8a3c',def:{bg:{t:'solid',c:'#000000'},
  deco:[{k:'numring',r:96,s:27,f:'pb',c:'#ffffff',list:['12','1','2','3','4','5','6','7','8','9','10','11']}],
  els:[HN({style:'bar',hc:'#ffffff',mc:'#ffffff',sc:'#ff8a3c',ml:84,w:12})]}}
,{key:'nattlage',name:'Nattläge',desc:'Dämpat rött som inte bländar i mörker.',c1:'#b01818',c2:'#3a0606',def:{bg:{t:'solid',c:'#000000'},
  deco:[{k:'ticks',n:12,r:116,len:5,c:'#5a0c0c',w:3,even:1}],
  els:[tm(120,104,70,'pb','#b01818'),vl('day',120,176,22,'pb','#7a1010',''),OB('dot','#8a1414',116,3)]}}
,{key:'kvartsur',name:'Kvartsur',desc:'Markören på ringen visar om det är hel, kvart över, halv eller kvart i.',c1:'#ffc83c',c2:'#4ea1ff',def:{bg:{t:'solid',c:'#0d1016'},
  deco:[...RSEG(102,24,4,['#3a2f12','#16314a','#3a1c2a','#17382a'],1),TX('HEL',120,36,12,'pb','#ffc83c','c',1.5),TX('HALV',120,238,12,'pb','#ff7aa0','c',1.5),
    {k:'rtext',txt:'KVART ÖVER',x:222,y:143,rot:90,s:12,c:'#6fb6ff',tr:1.5},{k:'rtext',txt:'KVART I',x:18,y:143,rot:-90,s:12,c:'#6fe0a0',tr:1.5}],
  els:[tm(120,108,38,'pb','#ffffff'),vl('day',120,156,22,'pb','#c9cee0','DAG'),OB('sprite','#ffffff',102,13,{n:'notch',w:5,on:'m'}),OB('dot','#ffffff',84,3)]}}
,{key:'skidsparet',name:'Skidspåret',desc:'Skidåkaren tar ett varv i spåret varje minut.',c1:'#8fc8f0',c2:'#e8452c',sport:true,toon:true,def:{bg:{t:'grad',c:'#f4faff',c2:'#cfe4f7',a:180},
  deco:[RG(104,'#b9d6ee',20),RG(100,'#8fb4d6',1.4),RG(108,'#8fb4d6',1.4),{k:'toon',n:'pines'}],
  els:[tm(120,106,36,'pb','#1b3a5c'),vl('pulse',92,154,22,'pb','#e8452c','PULS'),vl('day',150,154,22,'pb','#1b3a5c','DAG'),OB('sprite','#e8452c',104,7.5,{n:'skier'})]}}
,{key:'hjartat',name:'Hjärtat',desc:'Pulsen står i ett stort hjärta. Ett litet hjärta går runt.',c1:'#ff3c5f',c2:'#a01e5a',sport:true,def:{bg:{t:'solid',c:'#12040a'},
  deco:[{k:'toon',n:'bigheart'}],
  els:[tm(120,10,26,'pb','#ffffff'),vl('pulse',120,100,54,'pb','#ffffff','PULS'),vl('steps',44,246,18,'pb','#ffffff','STEG'),vl('kcal',200,246,18,'pb','#ffc83c','KCAL'),OB('sprite','#ff8aa5',112,6,{n:'heart'})]}}
// ---------- bildsiffror: tidens siffror är bilder ----------
,{key:'nixie',name:'Nixie',desc:'Glödande siffror i glasrör.',c1:'#ff8a3c',c2:'#5a2a10',def:{bg:{t:'solid',c:'#0c0806'},
  deco:[{k:'glow',x:120,y:126,r:130,c:'#ff5a10',i:.2},R(14,170,212,4,2,'#3a2418'),R(26,176,188,10,5,'#1a100a')],
  els:[tm(120,94,70,'nx','#ff9a4a'),vl('day',66,206,22,'pb','#ff9a4a','DAG'),vl('pulse',122,206,22,'pb','#ff9a4a','PULS'),vl('battv',178,206,22,'pb','#ff9a4a','BATT',{pct:false})]}}
,{key:'klaff',name:'Klaffskylt',desc:'Siffror på klaffar, som på en gammal tågstation.',c1:'#f4f4f0',c2:'#ffc83c',def:{bg:{t:'solid',c:'#0b0c0f'},
  deco:[R(0,0,240,44,0,'#15171c'),TX('AVGÅNG',22,14,13,'pb','#ffc83c','l',2),R(0,176,240,2,0,'#22252c')],
  els:[tm(120,74,74,'fl','#f4f4f0',{colon:false}),vl('day',60,198,26,'pb','#f4f4f0','DAG'),vl('steps',160,198,26,'pb','#ffc83c','STEG')]}}
,{key:'domino',name:'Domino',desc:'Varje siffra är en dominobricka. Räkna prickarna.',c1:'#f6f1e6',c2:'#1f6b45',def:{bg:{t:'grad',c:'#237a4e',c2:'#124a30',a:180},
  els:[tm(120,82,76,'do','#ffffff'),vl('day',70,196,26,'pb','#ffffff','DAG'),vl('battv',166,196,26,'pb','#ffffff','BATT')]}}
,{key:'krita',name:'Krita',desc:'Skrivet med krita på svarta tavlan.',c1:'#f4f4ea',c2:'#22382c',def:{bg:{t:'solid',c:'#22382c'},
  deco:[R(0,0,240,286,0,'#8a5a2e'),R(8,8,224,270,34,'#22382c'),L(40,172,200,172,'#f4f4ea',2,.5),R(84,262,72,8,3,'#f4f4ea',.85)],
  els:[tm(120,78,76,'ch','#f4f4ea'),vl('day',52,190,26,'pm','#f4f4ea','DAG'),vl('pulse',104,190,26,'pm','#ffb3c1','PULS'),vl('steps',174,192,22,'pm','#f4f4ea','STEG')]}}
// ---------- batteriet och vädret som bilder ----------
,{key:'vaxten',name:'Växten',desc:'Blommar när batteriet är fullt och vissnar när det tar slut.',c1:'#3fbf62',c2:'#d9703a',toon:true,def:{bg:{t:'grad',c:'#f6efdc',c2:'#e9dcc0',a:180},
  deco:[R(0,232,240,54,0,'#c9a27a'),R(0,232,240,4,0,'#a8845c')],
  els:[tm(120,14,40,'pb','#3a2e18'),{k:'batt',x:120,y:132,w:78,h:96,style:'plant'},vl('battv',114,246,22,'pb','#3a2e18','')]}}
,{key:'ljuset',name:'Ljuset',desc:'Ett stearinljus som brinner ner i takt med batteriet.',c1:'#ffb02e',c2:'#3a1f0e',toon:true,def:{bg:{t:'solid',c:'#120c08'},
  deco:[{k:'glow',x:120,y:120,r:120,c:'#ff9a2a',i:.22},R(0,238,240,48,0,'#2a1a10')],
  els:[tm(120,12,36,'pb','#ffe9c4'),{k:'batt',x:120,y:122,w:62,h:112,style:'candle'},vl('battv',114,248,20,'pb','#ffe9c4','')]}}
,{key:'husdjuret',name:'Husdjuret',desc:'Pigg vid fullt batteri, trött när det sjunker och sover när det är slut.',c1:'#ffb85c',c2:'#7c8cff',toon:true,def:{bg:{t:'grad',c:'#2f3a7a',c2:'#151a3c',a:180},
  deco:[],
  els:[tm(120,14,38,'pb','#ffffff'),{k:'batt',x:120,y:98,w:88,h:84,style:'pet'},vl('steps',70,214,22,'pb','#ffffff','STEG'),vl('battv',166,214,22,'pb','#ffffff','BATT')]}}
,{key:'fonstret',name:'Fönstret',desc:'Titta ut: sol, moln, regn eller snö efter vädret.',c1:'#58b7ff',c2:'#8a5a2e',toon:true,def:{bg:{t:'solid',c:'#e9dcc4'},
  deco:[...Array.from({length:8},(_,k)=>R(k*32,0,2,286,0,'#dccdb0'))],
  els:[{k:'weather',x:120,y:14,s:116,style:'window'},vl('temp',108,140,34,'pb','#3a2e18',''),tm(120,190,40,'pb','#3a2e18'),vl('day',120,240,22,'pb','#8a5a2e','')]}}
// ---------- fler fiffiga ----------
,{key:'moare',name:'Moaré',desc:'Ett randigt lager vrids över ränder, och mönstret verkar röra sig.',c1:'#ffffff',c2:'#7c8cff',def:{bg:{t:'solid',c:'#000000'},
  deco:[{k:'stripes',c:'#ffffff',per:6,r:117},DT(120,143,44,'#000000'),RG(44,'#ffffff',2)],
  els:[tm(120,131,24,'pb','#ffffff'),OB('moire','#000000',114,0,{per:6.6})]}}
,{key:'himlen',name:'Himlen',desc:'Solen visar timmen, molnet minuten och fågeln sekunden.',c1:'#ffd23f',c2:'#58b7ff',toon:true,def:{bg:{t:'grad',c:'#3f9be8',c2:'#bfe6ff',a:180},
  deco:[{k:'toon',n:'hills'}],
  els:[tm(120,122,38,'pb','#ffffff'),OB('sprite','#ffd23f',100,9,{n:'sun',on:'h'}),OB('sprite','#ffffff',74,10,{n:'cloud',on:'m'}),OB('sprite','#1b2a4a',50,7,{n:'bird'})]}}
,{key:'ordklocka',name:'Ordklocka',desc:'Ramarna visar tiden i ord. Höger halva är över, vänster halva är i.',c1:'#ff8a3c',c2:'#27e6ff',def:{bg:{t:'solid',c:'#0b0d12'},
  deco:[RG(120,'#12351f',10,1),{k:'ring',x:120,y:143,r:120,c:'#3a1c2a',w:10,a0:90,a1:270,cap:'butt'},
    {k:'numring',r:103,s:11.5,f:'pb',c:'#c9cee0',tan:1,list:['PRICK','FEM','TIO','KVART','TJUGO','FEM I','HALV','FEM Ö','TJUGO','KVART','TIO','FEM']},
    {k:'numring',r:70,s:12.5,f:'pb',c:'#ffffff',tan:1,list:['TOLV','ETT','TVÅ','TRE','FYRA','FEM','SEX','SJU','ÅTTA','NIO','TIO','ELVA']},
    TX('I',96,155,12,'pb','#ff7aa0','c',1),TX('ÖVER',138,155,12,'pb','#5fe39a','c',1)],
  els:[tm(120,126,20,'pb','#8d93a8'),OB('sprite','#ff8a3c',70,10,{n:'frame',w:40,on:'h'}),OB('sprite','#27e6ff',103,9,{n:'frame',w:46,on:'m'}),OB('dot','#ffffff',55,2.5)]}}
,{key:'vardag',name:'Vardag',desc:'Experiment: veckodagen skrivs av klockan själv, med klockans egen stil och språk.',c1:'#ffc83c',c2:'#4ea1ff',exp:true,def:{bg:{t:'solid',c:'#0d1016'},
  deco:[L(40,178,200,178,'#ffffff',1,.2)],
  els:[{k:'week',x:120,y:52,c:'#ffc83c'},tm(120,88,72,'pb','#ffffff'),vl('day',70,192,28,'pb','#ffffff','DAG'),vl('steps',160,192,28,'pb','#4ea1ff','STEG')]}}
// ---------- säsong ----------
,{key:'jul',name:'Jul',desc:'Tomten pekar ut tiden med armarna medan det snöar.',c1:'#d8302e',c2:'#12254a',toon:true,def:{bg:{t:'grad',c:'#17306a',c2:'#0a1228',a:180},
  deco:[...[[24,50],[210,40],[40,120],[204,130],[26,210],[216,214],[70,26],[176,24],[60,262],[188,266]].map(p=>DT(p[0],p[1],1.8,'#ffffff',.8)),R(0,256,240,30,0,'#eef4ff'),{k:'toon',n:'tomte'}],
  els:[tm(120,4,28,'pb','#ffffff'),HN({style:'arm',hc:'#d8302e',mc:'#d8302e',tc:'#ffffff',sec:0,ml:82,w:12}),OB('sprite','#ffffff',112,6,{n:'flake'})]}}
,{key:'midsommar',name:'Midsommar',desc:'En midsommarstång med en fjäril som flyger runt.',c1:'#3fbf62',c2:'#ffd23f',toon:true,def:{bg:{t:'grad',c:'#6cc6ff',c2:'#e4f6ff',a:180},
  deco:[{k:'toon',n:'maypole'}],
  els:[tm(60,150,28,'pb','#1e4a22'),vl('day',180,150,28,'pb','#1e4a22','DAG'),OB('sprite','#ff9f43',110,8,{n:'butterfly'})]}}
,{key:'pask',name:'Påsk',desc:'Ett påskägg med en kyckling som springer runt.',c1:'#ffe14a',c2:'#c77dff',toon:true,def:{bg:{t:'grad',c:'#fff3c4',c2:'#ffd9e6',a:160},
  deco:[{k:'toon',n:'egg'},DT(30,40,5,'#c77dff',.6),DT(210,54,4,'#5cc8ff',.6),DT(26,236,4,'#ff6f91',.6),DT(214,246,5,'#3fbf62',.6)],
  els:[tm(120,8,30,'pb','#5a3a7a'),vl('day',120,238,24,'pb','#5a3a7a',''),OB('sprite','#ffe14a',106,8.5,{n:'chick'})]}}
// ---------- experiment: sådant klockan aldrig gjort förut ----------
,{key:'kugghjul',name:'Kugghjul',desc:'Experiment: ett kugghjul som snurrar på stället.',c1:'#c9a25a',c2:'#2a2c36',exp:true,def:{bg:{t:'solid',c:'#15171a'},
  deco:[RG(60,'#2a2e34',2),{k:'ticks',n:60,r:116,len:6,c:'#5d6274',w:2}],
  els:[tm(120,10,30,'pb','#ffffff'),vl('day',70,236,22,'pb','#ffffff','DAG'),vl('pulse',170,236,22,'pb','#ff6e78','PULS'),OB('gear','#c9a25a',54,0,{c2:'#2a2c36',teeth:12})]}}
,{key:'lillsekund',name:'Lillsekund',desc:'Experiment: en liten sekundvisare i egen urtavla längst ner.',c1:'#e8dcc0',c2:'#e8452c',exp:true,def:{bg:{t:'grad',c:'#1a2030',c2:'#090c14',a:180},
  deco:[RG(26,'#e8dcc0',1.4,.5,120,208),DT(120,208,2.5,'#e8dcc0'),{k:'numring',r:19,s:7,f:'pb',c:'#e8dcc0',x:120,y:208,list:['60','15','30','45']}],
  els:[TK(60,117,9,'#e8dcc0',{nums:1,ns:17,f:'se'}),vl('day',120,84,20,'se','#e8dcc0',''),HN({style:'taper',hc:'#e8dcc0',mc:'#e8dcc0',sc:'#e8452c',ml:94,sec:1,small:{x:120,y:208,len:21}})]}}
];
DIGITAL.forEach((d,i)=>{d.kind='d';d.id=0x86B10100+i;if(d.tested===undefined)d.tested=false;d.live=d.def.els.some(e=>e.k==='orbit'||(e.k==='hands'&&e.sec));d.toon=!!d.toon;d.sport=!!d.sport;d.exp=!!d.exp;});
