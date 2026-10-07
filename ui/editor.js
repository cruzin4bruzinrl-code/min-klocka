// ================= redigerare för egna digitala urtavlor =================
const SW=['#ffffff','#0a0a0a','#9aa0b4','#ff5a6a','#ff8a3c','#ffc83c','#5fe39a','#27e6ff','#4ea1ff','#7c8cff','#c77dff','#ff5aa0'];
const KINDS=[['time','Tid'],['day','Dag'],['pulse','Puls'],['steps','Steg'],['kcal','Kalorier'],['km','Distans'],['battv','Batteri %'],['batt','Batteriikon'],['weather','Väder'],['temp','Temperatur'],['text','Text'],['hands','Visare'],['orbit','Rörelse'],['ticks','Timstreck']];
const FIXED={hands:1,orbit:1,ticks:1};   // sitter alltid kring skärmens mitt och går inte att flytta
const DEFAULTS={time:{k:'time',x:120,y:96,s:62,f:'pb',c:'#ffffff'},day:{k:'day',x:120,y:40,s:24,f:'pb',c:'#ffffff',lab:'DAG'},pulse:{k:'pulse',x:60,y:190,s:24,f:'pb',c:'#ff5a6a',lab:'PULS'},
  steps:{k:'steps',x:170,y:190,s:24,f:'pb',c:'#ffffff',lab:'STEG'},kcal:{k:'kcal',x:60,y:238,s:20,f:'pb',c:'#ffc83c',lab:'KCAL'},km:{k:'km',x:170,y:238,s:20,f:'pb',c:'#ffffff',lab:'KM'},
  battv:{k:'battv',x:186,y:20,s:18,f:'pb',c:'#ffffff',lab:''},batt:{k:'batt',x:52,y:22,w:48,style:'bar',c:'#ffffff',fc:'#5fe39a'},weather:{k:'weather',x:120,y:160,s:36},
  temp:{k:'temp',x:120,y:200,s:22,f:'pb',c:'#ffffff',lab:''},text:{k:'text',x:120,y:262,s:11,f:'pm',c:'#9aa0b4',txt:'MIN KLOCKA',tr:1.5},
  hands:{k:'hands',style:'bar',hc:'#ffffff',mc:'#ffffff',sec:1,sc:'#ff8a3c',ml:92},orbit:{k:'orbit',style:'comet',c:'#27e6ff',c2:'#c77dff',r:112,s:5},ticks:{k:'ticks',n:12,r:114,len:9,c:'#ffffff'}};
const BLANK={bg:{t:'solid',c:'#000000'},els:[DEFAULTS.time,DEFAULTS.day,DEFAULTS.pulse,DEFAULTS.steps]};
let ed=null, edSel=-1, edR=null, edMode='els', edRaf=0, edDrag=null, edPrevTab='dials';
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function kindName(k){const f=KINDS.find(x=>x[0]===k);return f?f[1]:k;}

function openEditor(src){
  if(busy)return;
  const own=src&&src.kind==='m';
  ed={id:own?src.id:(0x86B20000+Math.floor(Math.random()*0xFFFF)),name:own?src.name:(src?'Min '+src.name:'Min urtavla'),def:clone(src&&src.def?src.def:BLANK),isNew:!own};
  edSel=ed.def.els.length?0:-1;edMode='els';$('edName').value=ed.name;
  edPrevTab='dials';document.body.classList.add('editing');showTab('editor');
  ensurePhoto(ed.def).then(()=>{edRenderUI();edDraw();});
}
function closeEditor(){document.body.classList.remove('editing');ed=null;edR=null;showTab(edPrevTab);if(cur)showFace(cur);}
function edDraw(){
  if(!ed)return;cancelAnimationFrame(edRaf);
  edRaf=requestAnimationFrame(()=>{if(!ed)return;
    try{edR=renderDial(ed.def,photoOf(ed.def));}catch(e){log('Kunde inte rita: '+e.message,'bad');return;}
    edPaint(nowT());
    const n=dialSize(edR),prob=dialProblem(edR),over=n>MAXBYTES||!!prob;
    $('edSize').textContent=prob?prob:over?'För stor: '+Math.round(n/1024)+' av '+Math.round(MAXBYTES/1024)+' kB. Minska de stora siffrorna'+(edR.parts.some(q=>q.ptr&&q.img.width>150)?' eller ringen.':'.'):'Storlek '+Math.round(n/1024)+' av '+Math.round(MAXBYTES/1024)+' kB';
    $('edSize').classList.toggle('over',over);$('edSend').disabled=over||!connected;$('edSave').disabled=over;
  });
}
// Ritar om förhandsvisningen med rätt tid. Körs också varje sekund, så att visare och rörelse syns gå.
function edPaint(t){
    if(!ed||!edR)return;const cv=$('faceC'),c=cv.getContext('2d');composeDial(edR,t,cv);
    const b=edMode==='els'?edR.boxes[edSel]:null;
    if(b){c.save();c.strokeStyle='#ffffff';c.lineWidth=1;c.setLineDash([4,3]);c.strokeRect(b.x-3.5,b.y-3.5,b.w+7,b.h+7);c.strokeStyle='rgba(0,0,0,.6)';c.lineDashOffset=3.5;c.strokeRect(b.x-3.5,b.y-3.5,b.w+7,b.h+7);c.restore();}
    if(edDrag&&edDrag.snap){c.save();c.strokeStyle='rgba(255,90,160,.9)';c.lineWidth=1;c.beginPath();c.moveTo(120.5,0);c.lineTo(120.5,DH);c.stroke();c.restore();}
}
function sw(key,curc,extra){return '<div class="sw">'+SW.map(c=>'<button type="button" data-set="'+key+'" data-v="'+c+'" class="'+(String(curc).toLowerCase()===c?'on':'')+'" style="background:'+c+'" aria-label="'+c+'"></button>').join('')+
  '<label class="pickc" style="background:'+esc(/^#[0-9a-f]{6}$/i.test(curc)?curc:'#888888')+'"><input type="color" data-set="'+key+'" value="'+esc(/^#[0-9a-f]{6}$/i.test(curc)?curc:'#888888')+'"></label>'+(extra||'')+'</div>';}
function segm(key,opts,curv){return '<div class="seg">'+opts.map(o=>'<button type="button" data-set="'+key+'" data-v="'+o[0]+'" class="'+(String(curv)===String(o[0])?'on':'')+'">'+o[1]+'</button>').join('')+'</div>';}
function slider(key,min,max,step,val,unit){return '<div class="sl"><input type="range" data-set="'+key+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"><output>'+val+(unit||'')+'</output></div>';}
function blockH(lab,inner,first){return '<div class="block"'+(first?' style="border-top:0"':'')+'><span class="lab">'+lab+'</span>'+inner+'</div>';}
function edRenderUI(){
  if(!ed)return;
  qsa('#edMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===edMode));$('edEls').hidden=edMode!=='els';$('edBg').hidden=edMode!=='bg';
  const els=ed.def.els;
  $('edChips').innerHTML=KINDS.map(k=>{const idx=els.findIndex(e=>e.k===k[0]);const sel=idx>=0&&idx===edSel;
    return '<button type="button" data-kind="'+k[0]+'" class="'+(idx>=0?'has':'')+(sel?' on':'')+'">'+(idx>=0?'':'+ ')+k[1]+'</button>';}).join('');
  const e=els[edSel];let h='';
  if(!e){h='<p class="empty">Tryck på en del här ovanför för att lägga till den, eller tryck på en del på klockan för att ändra den.</p>';}
  else{
    if(FIXED[e.k])h+=blockH(kindName(e.k)+'<small>'+(e.k==='hands'?'Visarna sitter i skärmens mitt och visar tiden':e.k==='orbit'?'Går ett varv runt mitten varje minut, ett steg i sekunden':'Streck runt mitten, som på en vanlig urtavla')+'</small>','',true);
    else h+=blockH(kindName(e.k)+'<small>Dra delen på klockan, eller flytta den med pilarna</small>','<div class="nudge"><button type="button" data-act="l" aria-label="Vänster">←</button><button type="button" data-act="u" aria-label="Upp">↑</button><button type="button" data-act="d" aria-label="Ner">↓</button><button type="button" data-act="r" aria-label="Höger">→</button><button type="button" data-act="center">Centrera</button></div>',true);
    if(e.k==='batt'){h+=blockH('Bredd',slider('w',24,160,2,e.w||56,' px'));h+=blockH('Utseende',segm('style',[['bar','Batteri'],['dots','Prickar'],['line','Linje']],e.style||'bar'));h+=blockH('Färg',sw('c',e.c||'#ffffff'));h+=blockH('Fyllning',sw('fc',e.fc||e.c||'#ffffff'));}
    else if(e.k==='weather'){h+=blockH('Storlek',slider('s',20,120,2,e.s||36,' px'));}
    else if(e.k==='hands'){const orb=els.some(z=>z.k==='orbit');
      h+=blockH('Utseende',segm('style',[['bar','Raka'],['taper','Spetsiga'],['thin','Tunna'],['baton','Stavar'],['arm','Armar']],e.style||'bar'));h+=blockH('Längd',slider('ml',50,116,1,e.ml||92,' px'));
      h+=blockH('Timvisare',sw('hc',e.hc||'#ffffff'));h+=blockH('Minutvisare',sw('mc',e.mc||'#ffffff'));if(e.style==='arm')h+=blockH('Händer',sw('tc',e.tc||e.mc||'#ffffff'));
      h+=blockH('Sekundvisare'+(orb?'<small>Klockan har en rörlig del per urtavla. Just nu används den av Rörelse.</small>':''),orb?'':segm('sec',[['0','Av'],['1','På']],e.sec?'1':'0')+(e.sec?sw('sc',e.sc||'#ff8a3c'):''));}
    else if(e.k==='orbit'){const st=e.style||'dot';
      h+=blockH('Utseende',segm('style',[['dot','Prick'],['comet','Komet'],['sprite','Figur'],['snake','Orm'],['sweep','Svep'],['beam','Ljuskägla']],st));
      if(st==='sprite')h+=blockH('Figur','<div class="seg wrap">'+[['star','Stjärna'],['ball','Planet'],['bubble','Bubbla'],['runner','Löpare'],['car','Bil'],['loco','Tåg'],['fish','Fisk'],['turtle','Sköldpadda'],['snail','Snigel'],['hare','Hare'],['mouse','Mus'],['rocket','Raket'],['bee','Bi'],['pupil','Öga'],['boat','Båt'],['tomato','Tomat'],['apple','Äpple'],['butterfly','Fjäril'],['lens','Lins'],['blip','Radarprick']].map(o=>'<button type="button" data-set="n" data-v="'+o[0]+'" class="'+((e.n||'star')===o[0]?'on':'')+'">'+o[1]+'</button>').join('')+'</div>');
      if(!els.some(z=>z.k==='hands'))h+=blockH('Går ett varv per',segm('on',[['s','Minut'],['m','Timme'],['h','Halvdygn']],e.on||'s'));
      h+=blockH('Avstånd från mitten',slider('r',30,118,1,e.r||110,' px'));if(st!=='disc')h+=blockH(st==='ring'?'Tjocklek':'Storlek',slider('s',st==='sprite'?5:2,st==='sprite'?20:16,1,e.s||5,' px'));
      h+=blockH('Färg',sw('c',e.c||'#27e6ff'));if(st!=='dot'&&st!=='sweep'&&st!=='sprite')h+=blockH(st==='disc'?'Etikett i mitten':'Andra färgen',sw('c2',e.c2||e.c||'#c77dff'));}
    else if(e.k==='ticks'){h+=blockH('Antal',segm('n',[['12','12'],['60','60']],e.n||12));h+=blockH('Avstånd från mitten',slider('r',50,118,1,e.r||114,' px'));h+=blockH('Längd',slider('len',2,20,1,e.len||9,' px'));
      h+=blockH('Färg',sw('c',e.c||'#ffffff'));h+=blockH('Siffror vid 12, 3, 6 och 9',segm('nums',[['0','Av'],['1','På']],e.nums?'1':'0'));}
    else{
      const big=e.k==='time'?130:(e.k==='text'?40:160);
      h+=blockH('Storlek',slider('s',e.k==='text'?7:12,big,1,e.s||20,' px'));
      if(e.k==='text')h+=blockH('Text','<input type="text" class="tin" data-set="txt" maxlength="24" value="'+esc(e.txt||'')+'">');
      h+=blockH('Typsnitt',segm('f',Object.keys(FONTS).filter(k=>(e.k!=='text'||!vecFont(k))&&(!FONTS[k].pic||e.k==='time')).map(k=>[k,FONTS[k].n]),e.f||'pb'));
      h+=blockH('Färg',sw('c',Array.isArray(e.c)?e.c[0]:(e.c||'#ffffff')));
      if(e.k==='time'){h+=blockH('Uppställning',segm('lay',[['row','På rad'],['stack','Staplad']],e.lay||'row'));
        h+=blockH('Minuterna i egen färg<small>Tar mer plats i klockans minne</small>',segm('c2on',[['0','Nej'],['1','Ja']],e.c2?'1':'0')+(e.c2?sw('c2',e.c2):''));}
      else if(e.k!=='text'){h+=blockH('Etikett<small>Liten text under siffrorna, lämna tom för ingen</small>','<input type="text" class="tin" data-set="lab" maxlength="14" value="'+esc(e.lab||'')+'">');}
    }
    if(e.k!=='text'&&!FIXED[e.k]){const p=e.plate;h+=blockH('Platta bakom',segm('plate.on',[['0','Av'],['1','På']],p?'1':'0')+(p?sw('plate.c',p.c||'#ffffff')+slider('plate.a',10,100,5,Math.round((p.a===undefined?1:p.a)*100),' %')+slider('plate.r',0,40,1,p.r===undefined?12:p.r,' px rundning'):''));}
    h+='<div class="block"><button type="button" class="soft danger" data-act="del">Ta bort '+kindName(e.k).toLowerCase()+'</button></div>';
  }
  $('edProps').innerHTML=h;
  const bg=ed.def.bg||{t:'solid',c:'#000000'};let g='';
  g+=blockH('Bakgrund',segm('bg.t',[['solid','Färg'],['grad','Toning'],['aurora','Norrsken'],['photo','Foto']],bg.t||'solid'),true);
  if(bg.t==='grad'){g+=blockH('Första färgen',sw('bg.c',bg.c||'#000000'))+blockH('Andra färgen',sw('bg.c2',bg.c2||'#4ea1ff'))+blockH('Riktning',slider('bg.a',0,360,5,bg.a===undefined?180:bg.a,'°'));}
  else if(bg.t==='aurora'){const cs=bg.cs||['#00bea8','#7846ff','#ff4696'];g+=blockH('Grund',sw('bg.c',bg.c||'#080c1e'))+blockH('Ljus 1',sw('bg.cs.0',cs[0]))+blockH('Ljus 2',sw('bg.cs.1',cs[1]))+blockH('Ljus 3',sw('bg.cs.2',cs[2]));}
  else if(bg.t==='photo'){g+=blockH('Bild<small>Bilden beskärs så att den fyller skärmen</small>','<label class="soft glass own2">Välj bild<input type="file" id="edPhoto" accept="image/*"></label>')+blockH('Mörkare bild<small>Gör siffrorna lättare att läsa</small>',slider('bg.dim',0,80,5,Math.round((bg.dim||0)*100),' %'));}
  else{g+=blockH('Färg',sw('bg.c',bg.c||'#000000'));}
  if((ed.def.deco||[]).length)g+='<div class="block"><button type="button" class="soft danger" data-act="nodeco">Ta bort mönster och linjer</button></div>';
  $('edBgProps').innerHTML=g;
}
function edSet(key,val,fromClick){
  const d=ed.def,e=d.els[edSel];
  if(key.startsWith('bg.')){const k=key.slice(3);d.bg=d.bg||{t:'solid',c:'#000000'};
    if(k==='t'){const o=d.bg;d.bg=val==='grad'?{t:'grad',c:o.c||'#1a2a6c',c2:o.c2||'#b21f1f',a:o.a===undefined?180:o.a}:val==='aurora'?{t:'aurora',c:'#080c1e',cs:o.cs||['#00bea8','#7846ff','#ff4696']}:val==='photo'?{t:'photo',src:o.src||'',dim:o.dim===undefined?.25:o.dim}:{t:'solid',c:(o.c&&o.t!=='aurora')?o.c:'#000000'};
      d.els.forEach(x=>{if(x.knock)delete x.knock;});}
    else if(k==='a')d.bg.a=+val;else if(k==='dim')d.bg.dim=+val/100;
    else if(k.startsWith('cs.')){d.bg.cs=(d.bg.cs||['#00bea8','#7846ff','#ff4696']).slice();d.bg.cs[+k.slice(3)]=val;}
    else d.bg[k]=val;
  }else if(e){
    if(key==='plate.on'){if(val==='1')e.plate=e.plate||{c:'#ffffff',a:.14,r:14};else delete e.plate;}
    else if(key.startsWith('plate.')){e.plate=e.plate||{c:'#ffffff',a:.14,r:14};const k=key.slice(6);e.plate[k]=k==='a'?+val/100:(k==='r'?+val:val);}
    else if(key==='c2on'){if(val==='1')e.c2=e.c2||'#7c8cff';else delete e.c2;}
    else if(key==='s'||key==='w'||key==='r'||key==='len'||key==='ml'||(key==='n'&&e.k==='ticks')||key==='sec'||key==='nums')e[key]=+val;
    else if(key==='lay'){e.lay=val;delete e.knock;if(val==='stack'){e.s=Math.min(e.s,104);e.y=Math.min(e.y,90);}}
    else if(key==='c'){e.c=val;delete e.knock;}
    else e[key]=val;
  }
  if(fromClick)edRenderUI();edDraw();
}
function edAct(a){
  const d=ed.def,e=d.els[edSel];
  if(a==='nodeco'){delete d.deco;edRenderUI();edDraw();return;}
  if(!e)return;
  if(a==='del'){d.els.splice(edSel,1);edSel=Math.min(edSel,d.els.length-1);edRenderUI();edDraw();return;}
  if(FIXED[e.k])return;
  if(a==='center'){e.x=120;}else if(a==='l')e.x-=1;else if(a==='r')e.x+=1;else if(a==='u')e.y-=1;else if(a==='d')e.y+=1;
  e.x=Math.max(0,Math.min(DW,e.x));e.y=Math.max(0,Math.min(DH-4,e.y));edDraw();
}
$('edMode').addEventListener('click',ev=>{const b=ev.target.closest('[data-m]');if(!b)return;edMode=b.dataset.m;edRenderUI();edDraw();});
$('edChips').addEventListener('click',ev=>{const b=ev.target.closest('[data-kind]');if(!b||!ed)return;const k=b.dataset.kind,els=ed.def.els;let i=els.findIndex(e=>e.k===k);
  if(i<0||(k==='text'&&i===edSel&&els.filter(e=>e.k==='text').length<4)){const n=clone(DEFAULTS[k]);if(k==='text'&&i>=0)n.y=Math.max(8,els[i].y-18);els.push(n);i=els.length-1;}
  edSel=i;edRenderUI();edDraw();});
['edProps','edBgProps'].forEach(id=>{
  $(id).addEventListener('click',ev=>{if(!ed)return;const a=ev.target.closest('[data-act]');if(a){edAct(a.dataset.act);return;}const b=ev.target.closest('button[data-set]');if(b)edSet(b.dataset.set,b.dataset.v,true);});
  $(id).addEventListener('input',ev=>{if(!ed)return;const t=ev.target;if(t.id==='edPhoto')return;if(!t.dataset||!t.dataset.set)return;
    if(t.type==='range'){const o=t.parentNode.querySelector('output');if(o)o.textContent=t.value+(o.textContent.replace(/^[\d.]+/,''));}
    if(t.type==='color'&&t.parentNode.classList.contains('pickc'))t.parentNode.style.background=t.value;
    edSet(t.dataset.set,t.value,false);});
  $(id).addEventListener('change',async ev=>{const t=ev.target;if(!ed||t.id!=='edPhoto'||!t.files[0])return;
    try{const url=URL.createObjectURL(t.files[0]);const im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Bilden gick inte att läsa'));i.src=url;});
      const cv=mk(DW,DH),c=ctxOf(cv),k=Math.max(DW/im.width,DH/im.height),w=im.width*k,h=im.height*k;c.imageSmoothingQuality='high';c.drawImage(im,(DW-w)/2,(DH-h)/2,w,h);URL.revokeObjectURL(url);
      const src=cv.toDataURL('image/jpeg',.88);ed.def.bg=Object.assign({t:'photo',dim:.25},ed.def.bg,{t:'photo',src:src});await ensurePhoto(ed.def);edRenderUI();edDraw();toast('Bilden är inlagd');
    }catch(e){toast('Bilden gick inte att läsa',true);log('Foto: '+e.message,'bad');}});
});
// dra delar direkt på klockan
(function(){const cv=$('faceC');
  const pos=ev=>{const r=cv.getBoundingClientRect();return {x:(ev.clientX-r.left)*DW/r.width,y:(ev.clientY-r.top)*DH/r.height};};
  cv.addEventListener('pointerdown',ev=>{if(!ed||!edR)return;const p=pos(ev);let hit=-1;
    for(const fixed of [0,1]){for(let i=edR.boxes.length-1;i>=0&&hit<0;i--){const b=edR.boxes[i],e=ed.def.els[i];if(b&&e&&!!FIXED[e.k]===!!fixed&&p.x>=b.x-8&&p.x<=b.x+b.w+8&&p.y>=b.y-8&&p.y<=b.y+b.h+8)hit=i;}}
    if(hit<0)return;ev.preventDefault();try{cv.setPointerCapture(ev.pointerId);}catch(e){}
    if(edMode!=='els'){edMode='els';}const changed=hit!==edSel;edSel=hit;if(changed||$('edEls').hidden)edRenderUI();
    const e=ed.def.els[hit];if(FIXED[e.k]){edDraw();return;}edDrag={i:hit,px:p.x,py:p.y,ex:e.x,ey:e.y,snap:false};edDraw();});
  cv.addEventListener('pointermove',ev=>{if(!edDrag||!ed)return;const p=pos(ev),e=ed.def.els[edDrag.i];if(!e)return;
    let x=Math.round(edDrag.ex+p.x-edDrag.px),y=Math.round(edDrag.ey+p.y-edDrag.py);edDrag.snap=Math.abs(x-120)<=3;if(edDrag.snap)x=120;
    e.x=Math.max(0,Math.min(DW,x));e.y=Math.max(0,Math.min(DH-4,y));edDraw();});
  const up=()=>{if(edDrag){edDrag=null;edDraw();}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
})();
function edAccent(def){const cs=[];(def.els||[]).forEach(e=>{const c=Array.isArray(e.c)?e.c[0]:e.c;if(c&&!/^#(fff|ffffff|000|000000|0a0a0a)$/i.test(c))cs.push(c);if(e.c2)cs.push(e.c2);if(e.k==='hands'&&e.sec&&e.sc)cs.push(e.sc);});
  const b=def.bg||{};if(b.t==='grad'){cs.push(b.c,b.c2);}if(b.t==='aurora')(b.cs||[]).forEach(c=>cs.push(c));if(b.t==='solid'&&b.c&&!/^#(000|000000)$/i.test(b.c))cs.push(b.c);
  return [cs[0]||'#7c8cff',cs[1]||cs[0]||'#ff5aa0'];}
function edStore(){
  ed.name=($('edName').value||'').trim().slice(0,18)||'Min urtavla';const acc=edAccent(ed.def);
  const rec={id:ed.id,name:ed.name,def:clone(ed.def),c1:acc[0],c2:acc[1]};const i=MINE.findIndex(m=>m.id===ed.id);
  if(i>=0)MINE[i]=rec;else MINE.unshift(rec);const ok=saveMine();RC.delete('m:'+rec.id);thumbOf(rec);return ok?rec:null;
}
$('edSave').addEventListener('click',()=>{if(!ed)return;const rec=edStore();if(!rec){toast('Det gick inte att spara',true);return;}
  log('Egen urtavla sparad: '+rec.name);toast(rec.name+' är sparad');cat='m';closeEditor();renderGrid();pickDial('m:'+rec.id,true);});
$('edCancel').addEventListener('click',()=>{if(ed)closeEditor();});
$('edSend').addEventListener('click',async()=>{if(!ed||busy)return;const rec=edStore();if(!rec){toast('Det gick inte att spara',true);return;}
  cat='m';closeEditor();renderGrid();pickDial('m:'+rec.id,true);$('btnSend').click();});
