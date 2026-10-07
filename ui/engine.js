// ================= Urtavlemotor: ritar och bygger urtavlor i klockans eget format (JKDZ) =================
// Formatet är avkodat ur filer som originalappen skickade, och varje elementtyp här har setts fungera på klockan.
const DW=240, DH=286, MAXBYTES=409600;
const PX=120,PY=143;   // vridpunkt för visare: skärmens mitt
const TY={ROTH:25,ROTM:26,ROTS:27,BAR:1,DAY:5,KCAL:7,KM:9,UNIT:11,HRS:13,STEP:17,HH:19,HL:20,MH:21,ML:22,WICON:33,TEMP:42,BARV:48};
const ORDER=[TY.HH,TY.HL,TY.MH,TY.ML,TY.HRS,TY.KCAL,TY.WICON,TY.UNIT,TY.TEMP,TY.BAR,TY.BARV,TY.STEP,TY.DAY,TY.KM];
const VALS={
  pulse:{t:TY.HRS,sample:'68',lab:'PULS',max:3,name:'Puls'},
  steps:{t:TY.STEP,sample:'10100',lab:'STEG',max:5,name:'Steg'},
  kcal:{t:TY.KCAL,sample:'412',lab:'KCAL',max:4,name:'Kalorier'},
  km:{t:TY.KM,sample:'06.21',lab:'KM',max:5,dot:true,name:'Distans'},
  day:{t:TY.DAY,sample:'05',lab:'DAG',max:2,name:'Dag'},
  battv:{t:TY.BARV,sample:'85',lab:'BATT',max:3,pct:true,name:'Batteri %'},
  temp:{t:TY.TEMP,sample:'16',lab:'',max:2,unit:true,name:'Temperatur'}
};
const FONTS={pb:{n:'Fet',css:s=>'700 '+s+'px PoppinsApp'},pm:{n:'Normal',css:s=>'500 '+s+'px PoppinsApp'},pl:{n:'Tunn',css:s=>'300 '+s+'px PoppinsLight'},
  se:{n:'Serif',css:s=>'700 '+s+'px LoraBold'},dm:{n:'Prickar',css:null},nx:{n:'Nixie',css:null,pic:.64},fl:{n:'Klaff',css:null,pic:.7},do:{n:'Domino',css:null,pic:.62},ch:{n:'Krita',css:null,pic:.64},mo:{n:'Mono',css:s=>'700 '+Math.round(s*.9)+'px MonoBold'},sg:{n:'Segment',css:null}};

// ---------- rena hjälpfunktioner (går att prova utan webbläsare) ----------
function put16(a,o,v){a[o]=v&255;a[o+1]=(v>>8)&255;}
function put32(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;a[o+2]=(v>>>16)&255;a[o+3]=(v>>>24)&255;}
function c565(r,g,b){return ((r>>3)<<11)|((g>>2)<<5)|(b>>3);}
function hexRgb(h){h=String(h||'#ffffff').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
function rgbHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function hex565(h){const c=hexRgb(h);return c565(c[0],c[1],c[2]);}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// bakgrund och förhandsbild: 16-bitars färg, hög byte först. Lätt brus gör att mjuka övergångar inte blir randiga.
function encBE565(px,n,noise){
  const o=new Uint8Array(n*2);const rnd=noise?mulberry(7):null;
  for(let i=0;i<n;i++){let r=px[4*i],g=px[4*i+1],b=px[4*i+2];
    if(rnd&&(r|g|b)){const d=(rnd()-.5)*2*noise;r=Math.max(0,Math.min(255,r+d));g=Math.max(0,Math.min(255,g+d*.6));b=Math.max(0,Math.min(255,b+d));}
    const v=c565(r|0,g|0,b|0);o[2*i]=v>>8;o[2*i+1]=v&255;}
  return o;
}
// färgbild med genomskinlighet: först alla färger (låg byte först), sedan alla alfavärden
function encPlanar(px,n){const o=new Uint8Array(n*3);for(let i=0;i<n;i++){const v=c565(px[4*i],px[4*i+1],px[4*i+2]);o[2*i]=v&255;o[2*i+1]=v>>8;o[2*n+i]=px[4*i+3];}return o;}
function encAlpha(px,n){const o=new Uint8Array(n);for(let i=0;i<n;i++)o[i]=px[4*i+3];return o;}
class JKFile{
  constructor(id,prev,bg){this.id=id>>>0;this.chunks=[prev,bg];this.len=64+prev.length+bg.length;this.psize=prev.length;this.recs=[];
    const r=new Uint8Array(48).fill(255);r[0]=0;r[1]=0;put16(r,2,0);put16(r,4,0);put16(r,6,0);put16(r,28,DW);put16(r,30,DH);put32(r,32,64+prev.length);this.recs.push(r);}
  group(images,slots){const ents=[];for(const im of images){ents.push([im.w,im.h,this.len]);this.chunks.push(im.data);this.len+=im.data.length;}
    const toff=this.len,t=new Uint8Array(8*slots).fill(255);ents.forEach((e,i)=>{put16(t,i*8,e[0]);put16(t,i*8+2,e[1]);put32(t,i*8+4,e[2]);});this.chunks.push(t);this.len+=t.length;return toff;}
  element(typ,x,y,style,count,toff,color){const r=new Uint8Array(48).fill(255);r[0]=1;r[1]=this.recs.length;put16(r,2,typ);put16(r,4,x);put16(r,6,y);r[26]=style;r[27]=count;put32(r,28,toff);
    if(color!==null&&color!==undefined)put16(r,32,color);this.recs.push(r);}
  // Roterande bild. x,y = bildens övre vänstra hörn när den pekar på klockan 12, px,py = punkten den vrids kring (skärmens mitt i appen).
  // Text som klockan ritar med sitt eget typsnitt. Appen använder det för veckodagen: mitten i sidled, överkant, färg.
  text5(typ,x,y,color){const r=new Uint8Array(48).fill(255);r[0]=5;r[1]=this.recs.length;put16(r,2,typ);put16(r,4,x);put16(r,6,y);r[24]=0;r[26]=1;r[28]=0;put16(r,36,color);this.recs.push(r);}
  pointer(typ,x,y,img,px,py){const off=this.len;this.chunks.push(img.data);this.len+=img.data.length;const r=new Uint8Array(48).fill(255);
    r[0]=2;r[1]=this.recs.length;put16(r,2,typ);put16(r,4,x);put16(r,6,y);r[26]=1;put16(r,28,img.w);put16(r,30,img.h);put32(r,32,off);put16(r,36,px);put16(r,38,py);this.recs.push(r);}
  finish(){const toff=this.len,total=toff+48*this.recs.length,out=new Uint8Array(total);let o=64;
    for(const c of this.chunks){out.set(c,o);o+=c.length;}for(const r of this.recs){out.set(r,o);o+=48;}
    const h=new Uint8Array(64).fill(255);h.set([0x4a,0x4b,0x44,0x5a],4);put32(h,8,total);h.set([64,0,1,0],12);put16(h,16,DW);put16(h,18,DH);put32(h,20,this.id);
    put16(h,24,160);put16(h,26,189);put32(h,28,64);put32(h,32,this.psize);put32(h,36,toff);put32(h,40,0);put16(h,44,this.recs.length);h.set([0,0,0,0],46);
    h[48]=this.recs.some(r=>r[0]===2)?1:0;   // appen sätter 1 här när urtavlan har visare, 0 när den bara har siffror
    put32(h,0,crc32([out.subarray(64)]));out.set(h,0);return out;}
}

// ---------- ritning ----------
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c;}
function ctxOf(c){return c.getContext('2d',{willReadFrequently:true});}
function rgba(hex,a){const c=hexRgb(hex);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+(a===undefined?1:a)+')';}
function rr(ctx,x,y,w,h,r){const R=Array.isArray(r)?r:[r,r,r,r];const m=Math.min(w,h)/2;const [a,b,c,d]=R.map(v=>Math.min(v||0,m));
  ctx.beginPath();ctx.moveTo(x+a,y);ctx.lineTo(x+w-b,y);ctx.arcTo(x+w,y,x+w,y+b,b);ctx.lineTo(x+w,y+h-c);ctx.arcTo(x+w,y+h,x+w-c,y+h,c);ctx.lineTo(x+d,y+h);ctx.arcTo(x,y+h,x,y+h-d,d);ctx.lineTo(x,y+a);ctx.arcTo(x,y,x+a,y,a);ctx.closePath();}
const _mc={};
function cell(f,s){
  const k=f+'/'+s;if(_mc[k])return _mc[k];let o;
  if(f==='sg'){o={w:Math.max(6,Math.round(s*.58)),h:Math.max(8,Math.round(s)),base:0};}
  else if(f==='dm'){const h=Math.max(8,Math.round(s));o={w:Math.ceil(h*6/7),h:h,base:0};}
  else if(FONTS[f]&&FONTS[f].pic){const h=Math.max(10,Math.round(s));o={w:Math.round(h*FONTS[f].pic),h:h,base:0};}
  else{const c=ctxOf(mk(4,4));c.font=FONTS[f].css(s);let mw=0;for(let i=0;i<10;i++)mw=Math.max(mw,c.measureText(String(i)).width);
    const m=c.measureText('0');const asc=Math.ceil(m.actualBoundingBoxAscent||s*.72),desc=Math.ceil(m.actualBoundingBoxDescent||0);
    o={w:Math.ceil(mw*(f==='mo'?1:.94))+1,h:asc+desc+2,base:asc+1};}
  return _mc[k]=o;
}
const DM={0:['01110','10001','10011','10101','11001','10001','01110'],1:['00100','01100','00100','00100','00100','00100','01110'],2:['01110','10001','00001','00010','00100','01000','11111'],3:['11110','00001','00001','01110','00001','00001','11110'],4:['00010','00110','01010','10010','11111','00010','00010'],
  5:['11111','10000','11110','00001','00001','10001','01110'],6:['00110','01000','10000','11110','10001','10001','01110'],7:['11111','00001','00010','00100','01000','01000','01000'],8:['01110','10001','10001','01110','10001','10001','01110'],9:['01110','10001','10001','01111','00001','00010','01100']};
const vecFont=f=>!FONTS[f]||!FONTS[f].css;
const SEG={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgedc',7:'abc',8:'abcdefg',9:'abcdfg'};
function segPath(ctx,segs,x,y,w,h){
  const t=Math.max(1.6,h*.115),m=.8,g=Math.max(.5,t*.11);
  const hs=yy=>{const a=m+t/2+g,b=w-m-t/2-g;return [[a,yy],[a+t/2,yy-t/2],[b-t/2,yy-t/2],[b,yy],[b-t/2,yy+t/2],[a+t/2,yy+t/2]];};
  const vs=(xx,a,b)=>{a+=g;b-=g;return [[xx,a],[xx+t/2,a+t/2],[xx+t/2,b-t/2],[xx,b],[xx-t/2,b-t/2],[xx-t/2,a+t/2]];};
  const yT=m+t/2,yM=h/2,yB=h-m-t/2,xL=m+t/2,xR=w-m-t/2;
  const P={a:hs(yT),g:hs(yM),d:hs(yB),f:vs(xL,yT,yM),b:vs(xR,yT,yM),e:vs(xL,yM,yB),c:vs(xR,yM,yB)};
  ctx.beginPath();for(const k of segs){const p=P[k];ctx.moveTo(x+p[0][0],y+p[0][1]);for(let i=1;i<p.length;i++)ctx.lineTo(x+p[i][0],y+p[i][1]);ctx.closePath();}
}
function fillOf(ctx,c,x,y,w,h){if(Array.isArray(c)){const g=ctx.createLinearGradient(x,y,x+(c[2]==='h'?w:0),y+(c[2]==='h'?0:h));g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);return g;}return c;}
function drawChar(ctx,f,s,ch,x,y,cw,chh,base,col){
  ctx.fillStyle=fillOf(ctx,col,x,y,cw,chh);
  if(FONTS[f]&&FONTS[f].pic){ctx.save();PICFONT[f](ctx,ch,x,y,cw,chh,col);ctx.restore();return;}
  if(f==='dm'){const p=chh/7,r=p*.42,x0=x+(cw-5*p)/2;if(DM[ch]){DM[ch].forEach((row,j)=>{for(let i=0;i<5;i++)if(row[i]==='1'){ctx.beginPath();ctx.arc(x0+(i+.5)*p,y+(j+.5)*p,r,0,7);ctx.fill();}});}else if(ch==='.'){ctx.beginPath();ctx.arc(x+cw/2,y+6.5*p,r,0,7);ctx.fill();}return;}
  if(f==='sg'){if(SEG[ch]!==undefined){segPath(ctx,SEG[ch],x,y,cw,chh);ctx.fill();}
    else if(ch==='.'){const t=Math.max(1.6,chh*.115);ctx.fillRect(x+cw/2-t/2,y+chh-.8-t,t,t);}return;}
  ctx.font=FONTS[f].css(s);ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(ch,x+cw/2,y+base);
}
function glyph(f,s,ch,col,w){const c=cell(f,s);const cv=mk(w||c.w,c.h);drawChar(ctxOf(cv),f,s,ch,0,0,cv.width,c.h,c.base,col);return cv;}
function digitSet(f,s,col,dot){const a=[];for(let i=0;i<10;i++)a.push(glyph(f,s,String(i),col));if(dot)a.push(glyph(f,s,'.',col,Math.max(4,Math.round(cell(f,s).w*.5))));return a;}
function knock(cv,bg){const o=mk(cv.width,cv.height),x=ctxOf(o);x.fillStyle=bg;x.fillRect(0,0,o.width,o.height);x.globalCompositeOperation='destination-out';x.drawImage(cv,0,0);return o;}
function text(ctx,t,x,y,s,f,col,align,track){
  ctx.font=FONTS[vecFont(f)?'pb':(f||'pm')].css(s);ctx.textBaseline='top';ctx.fillStyle=col;track=track||0;
  let w=0;for(const ch of t)w+=ctx.measureText(ch).width+track;w-=track;let cx=align==='c'?x-w/2:(align==='r'?x-w:x);
  ctx.textAlign='left';for(const ch of t){ctx.fillText(ch,cx,y);cx+=ctx.measureText(ch).width+track;}return w;
}
const ICONS={
  heart(c,s){c.beginPath();c.moveTo(s*.5,s*.9);c.bezierCurveTo(s*.05,s*.58,s*.02,s*.2,s*.28,s*.14);c.bezierCurveTo(s*.42,s*.11,s*.5,s*.24,s*.5,s*.3);c.bezierCurveTo(s*.5,s*.24,s*.58,s*.11,s*.72,s*.14);c.bezierCurveTo(s*.98,s*.2,s*.95,s*.58,s*.5,s*.9);c.fill();},
  steps(c,s){[[.08,.3],[.39,.56],[.7,.82]].forEach(a=>{rr(c,s*a[0],s*(.92-a[1]),s*.22,s*a[1],s*.07);c.fill();});},
  flame(c,s){c.beginPath();c.moveTo(s*.5,s*.04);c.bezierCurveTo(s*.62,s*.3,s*.9,s*.42,s*.86,s*.66);c.bezierCurveTo(s*.82,s*.86,s*.66,s*.96,s*.5,s*.96);c.bezierCurveTo(s*.34,s*.96,s*.18,s*.86,s*.14,s*.66);c.bezierCurveTo(s*.1,s*.42,s*.4,s*.32,s*.5,s*.04);c.fill();},
  pin(c,s){c.beginPath();c.arc(s*.5,s*.38,s*.3,Math.PI*.83,Math.PI*.17);c.lineTo(s*.5,s*.96);c.closePath();c.fill();c.save();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(s*.5,s*.38,s*.11,0,7);c.fill();c.restore();},
  cal(c,s){c.lineWidth=s*.085;c.strokeStyle=c.fillStyle;rr(c,s*.12,s*.2,s*.76,s*.68,s*.14);c.stroke();c.fillRect(s*.12,s*.38,s*.76,s*.07);rr(c,s*.29,s*.08,s*.08,s*.2,s*.04);c.fill();rr(c,s*.63,s*.08,s*.08,s*.2,s*.04);c.fill();},
  bolt(c,s){c.beginPath();c.moveTo(s*.58,s*.04);c.lineTo(s*.2,s*.56);c.lineTo(s*.46,s*.56);c.lineTo(s*.4,s*.96);c.lineTo(s*.8,s*.42);c.lineTo(s*.54,s*.42);c.closePath();c.fill();},
  drop(c,s){c.beginPath();c.moveTo(s*.5,s*.06);c.bezierCurveTo(s*.72,s*.36,s*.84,s*.52,s*.84,s*.66);c.arc(s*.5,s*.66,s*.34,0,Math.PI);c.bezierCurveTo(s*.16,s*.52,s*.28,s*.36,s*.5,s*.06);c.fill();}
};
function ecg(ctx,x,y,w,h,col,lw){const p=[[0,.5],[.3,.5],[.36,.36],[.41,.62],[.48,.02],[.56,.98],[.62,.4],[.68,.5],[1,.5]];
  ctx.strokeStyle=col;ctx.lineWidth=lw||2;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();p.forEach((q,i)=>ctx[i?'lineTo':'moveTo'](x+q[0]*w,y+q[1]*h));ctx.stroke();}
function weatherFrames(s,style){
  if(style&&WEATHERPIC[style])return WEATHERPIC[style](s);
  const out=[];const u=s/32;
  const cloud=(c,ox,oy,col)=>{c.fillStyle=col;c.beginPath();c.arc((ox+8)*u,(oy+14)*u,6*u,0,7);c.arc((ox+15)*u,(oy+9)*u,7*u,0,7);c.arc((ox+21)*u,(oy+14)*u,6*u,0,7);c.fill();c.fillRect((ox+8)*u,(oy+12)*u,13*u,8*u);};
  const sun=(c,cx,cy,r,rays)=>{c.fillStyle=c.strokeStyle='#ffcd3c';if(rays){c.lineWidth=2.2*u;c.lineCap='round';for(let k=0;k<8;k++){const a=k*Math.PI/4;c.beginPath();c.moveTo((cx+(r+3)*Math.cos(a))*u,(cy+(r+3)*Math.sin(a))*u);c.lineTo((cx+(r+7)*Math.cos(a))*u,(cy+(r+7)*Math.sin(a))*u);c.stroke();}}c.beginPath();c.arc(cx*u,cy*u,r*u,0,7);c.fill();};
  let cv=mk(s,s),c=ctxOf(cv);sun(c,16,16,7,true);out.push(cv);
  cv=mk(s,s);c=ctxOf(cv);sun(c,21,10,6,false);cloud(c,1,8,'#f0f4fa');out.push(cv);
  cv=mk(s,s);c=ctxOf(cv);cloud(c,2,2,'#e1e8f2');c.strokeStyle='#78beff';c.lineWidth=2.2*u;c.lineCap='round';for(let k=0;k<3;k++){c.beginPath();c.moveTo((9+k*7)*u,24*u);c.lineTo((7+k*7)*u,30*u);c.stroke();}out.push(cv);
  cv=mk(s,s);c=ctxOf(cv);cloud(c,2,2,'#e1e8f2');c.fillStyle='#fff';for(let k=0;k<3;k++){c.beginPath();c.arc((7+k*7)*u,27*u,1.9*u,0,7);c.fill();}out.push(cv);
  return out;
}
function battFrames(e){
  if(BATTPIC[e.style])return BATTPIC[e.style](e);
  const w=Math.round(e.w||56),h=Math.round(e.h||(e.style==='dots'?w/6:w*.4)),col=e.c||'#ffffff',low=e.low||'#ff6e64',fillc=e.fc||col,out=[];
  for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),edge=lv<=1?low:col;
    if(e.style==='dots'){const r=Math.min(h/2-1,w/12-1.5);for(let k=0;k<6;k++){c.beginPath();c.arc(w/12+k*w/6,h/2,r,0,7);c.fillStyle=k<lv?(lv<=1?low:fillc):rgba(col,.22);c.fill();}}
    else if(e.style==='line'){rr(c,0,h/2-h*.3,w,h*.6,h*.3);c.fillStyle=rgba(col,.2);c.fill();if(lv){rr(c,0,h/2-h*.3,Math.max(h*.6,w*lv/6),h*.6,h*.3);c.fillStyle=lv<=1?low:fillc;c.fill();}}
    else{const lw=Math.max(1.4,h*.085),nub=Math.max(3,w*.07);c.lineWidth=lw;c.strokeStyle=edge;rr(c,lw/2,lw/2,w-nub-lw,h-lw,h*.28);c.stroke();c.fillStyle=edge;rr(c,w-nub+1,h*.3,nub-1.5,h*.4,1.4);c.fill();
      const pad=lw+2,iw=w-nub-lw-2*pad+lw,seg=iw/6;for(let k=0;k<lv;k++){c.fillStyle=lv<=1?low:fillc;rr(c,pad+k*seg,pad,seg-1.6,h-2*pad,1.6);c.fill();}}
    out.push(cv);}
  return out;
}
function lerpHex(a,b,t){const x=hexRgb(a),y=hexRgb(b);return rgbHex(x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t);}
// En visare som pekar rakt upp. Vridpunkten ligger på (bredd/2, len) i bilden.
function handCanvas(style,len,tail,w,col,hub,tip){
  if(typeof HANDPIC!=='undefined'&&HANDPIC[style])return HANDPIC[style](len,tail,w,col,hub,tip);   // visare som är en sak: gaffel, saxblad, trollspö
  if(style==='arm')return armCanvas(len,w,col,hub,tip);
  if(style==='glass'){const Wg=(Math.ceil(w)+4)|1,cg=mk(Wg+1,Math.round(len+tail)),x=ctxOf(cg),m=(Wg+1)/2;rr(x,m-w/2,1,w,len+Math.min(tail,w/2)-2,w/2);x.fillStyle=rgba(col,.36);x.fill();x.lineWidth=1.6;x.strokeStyle=rgba(col,.92);x.stroke();
    if(hub){x.beginPath();x.arc(m,len,Math.min(hub,w/2-1),0,7);x.fillStyle=rgba(col,.95);x.fill();}return cg;}
  if(style==='shadow'){   // en skugga som på ett solur: smal vid mitten, bredare och svagare utåt
    const Ws=(Math.ceil(w)+4)|1,cs=mk(Ws+1,Math.round(len+4)),x=ctxOf(cs),m=(Ws+1)/2,g=x.createLinearGradient(0,len,0,0);g.addColorStop(0,rgba(col,.5));g.addColorStop(1,rgba(col,.2));
    x.fillStyle=g;x.beginPath();x.moveTo(m-2,len);x.lineTo(m-w/2,6);x.quadraticCurveTo(m,-2,m+w/2,6);x.lineTo(m+2,len);x.closePath();x.fill();return cs;}
  const W=Math.max(Math.ceil(w)+2,Math.ceil((hub||0)*2)+2)|1,H=Math.round(len+tail),cv=mk(W+1,H),c=ctxOf(cv),cx=(W+1)/2;c.fillStyle=col;c.strokeStyle=col;
  if(style==='taper'){c.beginPath();c.moveTo(cx,0);c.lineTo(cx+w/2,len-12);c.lineTo(cx+1.4,len+Math.min(tail-1,6));c.lineTo(cx-1.4,len+Math.min(tail-1,6));c.lineTo(cx-w/2,len-12);c.closePath();c.fill();}
  else if(style==='thin'){c.lineWidth=Math.max(1.6,w*.3);c.lineCap='round';c.beginPath();c.moveTo(cx,1.5);c.lineTo(cx,len+tail-2);c.stroke();}
  else if(style==='baton'){c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(cx,len*.72);c.lineTo(cx,len+Math.min(tail-1,4));c.stroke();rr(c,cx-w/2,0,w,len*.74,w/2);c.fill();}
  else{rr(c,cx-w/2,0,w,len+Math.min(tail,w/2),w/2);c.fill();}
  if(hub){c.beginPath();c.arc(cx,len,hub,0,7);c.fill();}
  return cv;
}
// Något som går ett varv i minuten kring mitten: prick, komet, svep, ring eller skiva.
function orbitCanvas(e){
  const R=Math.max(20,Math.min(118,e.r||110)),sz=Math.max(1.5,e.s||5),col=e.c||'#27e6ff',c2=e.c2||col,st=e.style||'dot';
  if(st==='sprite'){const sp=(SPRITES[e.n]||SPRITES.star)(Math.max(4,sz),e),w=sp.width,top=Math.ceil(sp.height/2),cv=mk(w,R+top+1);ctxOf(cv).drawImage(sp,0,0);
    return {cv:cv,x:Math.round(PX-w/2),y:Math.round(PY-R-top)};}
  if(st==='moire'){   // randigt lager i en solfjäderform; över en randig bakgrund ger det ett mönster som rör sig
    const hw=57,H=Math.round(Math.min(116,R))+2,cm=mk(2*hw,H),m=ctxOf(cm),an=26*Math.PI/180,per=e.per||6.6;m.beginPath();m.moveTo(hw,H-1);m.arc(hw,H-1,H-2,-Math.PI/2-an,-Math.PI/2+an);m.closePath();m.clip();
    m.fillStyle=col;for(let x=-per;x<2*hw+per;x+=per)m.fillRect(x,0,per/2,H);return {cv:cm,x:PX-hw,y:PY-(H-1)};}
  if(st==='gear'){   // experiment: en bild som vrids kring sin egen mitt
    const Rg=Math.min(55,R),D=2*Math.round(Rg)+2,cg=mk(D,D),g=ctxOf(cg),m=D/2,nt=e.teeth||12;g.beginPath();
    for(let k=0;k<nt*2;k++){const a0=k*Math.PI/nt,a1=(k+1)*Math.PI/nt,rr0=k%2?Rg-9:Rg-1;g.lineTo(m+rr0*Math.cos(a0+.06),m+rr0*Math.sin(a0+.06));g.lineTo(m+rr0*Math.cos(a1-.06),m+rr0*Math.sin(a1-.06));}
    g.closePath();g.fillStyle=col;g.fill();g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.55)';g.stroke();g.globalCompositeOperation='destination-out';
    for(let k=0;k<5;k++){const a=k*2*Math.PI/5;g.beginPath();g.arc(m+Rg*.5*Math.cos(a),m+Rg*.5*Math.sin(a),Rg*.17,0,7);g.fill();}g.globalCompositeOperation='source-over';
    g.beginPath();g.arc(m,m,Rg*.2,0,7);g.fillStyle=c2;g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(m,m-Rg*.72,2.4,0,7);g.fill();return {cv:cg,x:Math.round(PX-m),y:Math.round(PY-m)};}
  if(st==='wedge'){const an=(e.ang||15)*Math.PI/180,hw=Math.ceil(R*Math.sin(an))+2,cw2=mk(2*hw,R+2),w2=ctxOf(cw2),r0=e.r0||0;
    w2.fillStyle=col;w2.beginPath();w2.arc(hw,R+1,R,-Math.PI/2-an,-Math.PI/2+an);w2.arc(hw,R+1,r0,-Math.PI/2+an,-Math.PI/2-an,true);w2.closePath();w2.fill();return {cv:cw2,x:Math.round(PX-hw),y:PY-R-1};}
  if(st==='beam'){   // ljuskägla från mitten, som från en fyr
    const hb=Math.ceil(R*Math.tan(12*Math.PI/180))+2,cb=mk(2*hb,R+2),b=ctxOf(cb),g=b.createLinearGradient(0,R,0,0);g.addColorStop(0,rgba(col,.62));g.addColorStop(.6,rgba(col,.3));g.addColorStop(1,rgba(col,.04));
    b.fillStyle=g;b.beginPath();b.moveTo(hb-2,R);b.lineTo(2,8);b.quadraticCurveTo(hb,-6,2*hb-2,8);b.lineTo(hb+2,R);b.closePath();b.fill();return {cv:cb,x:Math.round(PX-hb),y:PY-R};}
  if(st==='ring'||st==='disc'){const D=Math.round(2*R+(st==='ring'?sz:0))+2,cv=mk(D,D),c=ctxOf(cv),m=D/2;
    if(st==='disc'){c.fillStyle=col;c.beginPath();c.arc(m,m,R,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;for(let r=R-4;r>R*.42;r-=4){c.beginPath();c.arc(m,m,r,0,7);c.stroke();}
      const g=c.createConicGradient(0,m,m);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.06,'rgba(255,255,255,.34)');g.addColorStop(.12,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(.56,'rgba(255,255,255,.22)');g.addColorStop(.62,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=g;c.beginPath();c.arc(m,m,R,0,7);c.arc(m,m,R*.42,0,7,true);c.fill();c.fillStyle=c2;c.beginPath();c.arc(m,m,R*.4,0,7);c.fill();}
    else{const g=c.createConicGradient(-Math.PI/2,m,m);g.addColorStop(0,col);g.addColorStop(.5,c2);g.addColorStop(.92,rgba(c2,.05));g.addColorStop(1,col);c.strokeStyle=g;c.lineWidth=sz;c.beginPath();c.arc(m,m,R,0,7);c.stroke();}
    return {cv:cv,x:Math.round(PX-m),y:Math.round(PY-m)};}
  // Provat på klockan: bilden vrids kring sin egen mittlinje i sidled. Därför görs bilden lika bred på båda sidor om vridpunkten,
  // och svansen hålls kort så att bredden stannar nära det som setts fungera (ca 110 bildpunkter).
  const span=st==='dot'?0:26*Math.PI/180,half=Math.ceil(R*Math.sin(span)+sz+2),top=Math.ceil(R+sz+1);
  const cv=mk(2*half,top+2),c=ctxOf(cv),ox=half,oy=top;   // (ox,oy) = vridpunkten i bilden
  if(st==='sweep'){const n=46;for(let k=0;k<n;k++){const a0=-Math.PI/2-span*(k+1)/n,a1=-Math.PI/2-span*k/n;c.fillStyle=rgba(col,.5*Math.pow(1-k/n,1.6));c.beginPath();c.moveTo(ox,oy);c.arc(ox,oy,R,a0,a1+.004);c.closePath();c.fill();}
    c.strokeStyle=col;c.lineWidth=Math.max(1.2,sz*.3);c.lineCap='round';c.beginPath();c.moveTo(ox,oy-6);c.lineTo(ox,oy-R);c.stroke();}
  else if(st==='snake'){const n=30,seg=k=>[-Math.PI/2-span*(k+1)/n,-Math.PI/2-span*k/n+.03],lw=k=>Math.max(2,sz*1.7*(1-k/n*.72));c.lineCap='round';
    for(let k=n-1;k>=0;k--){const q=seg(k);c.strokeStyle=INK;c.lineWidth=lw(k)+3;c.beginPath();c.arc(ox,oy,R,q[0],q[1]);c.stroke();}
    for(let k=n-1;k>=0;k--){const q=seg(k);c.strokeStyle=(k%8<4)?col:c2;c.lineWidth=lw(k);c.beginPath();c.arc(ox,oy,R,q[0],q[1]);c.stroke();}
    c.beginPath();c.moveTo(ox+sz,oy-R);c.lineTo(ox+sz+5,oy-R-2);c.moveTo(ox+sz,oy-R);c.lineTo(ox+sz+5,oy-R+2);c.strokeStyle='#ff4d5e';c.lineWidth=1.6;c.stroke();
    c.beginPath();c.ellipse(ox+1,oy-R,sz+1.5,sz,0,0,7);c.fillStyle=col;c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();
    c.beginPath();c.arc(ox+sz*.35,oy-R-sz*.3,sz*.36,0,7);c.fillStyle='#ffffff';c.fill();c.beginPath();c.arc(ox+sz*.45,oy-R-sz*.3,sz*.18,0,7);c.fillStyle=INK;c.fill();}
  else{if(st==='comet'){const n=40;c.lineCap='round';for(let k=n-1;k>=0;k--){const a0=-Math.PI/2-span*(k+1)/n,a1=-Math.PI/2-span*k/n;c.strokeStyle=rgba(lerpHex(col,c2,k/n),.9*Math.pow(1-k/n,1.5));c.lineWidth=Math.max(1,sz*2*(1-k/n*.8));c.beginPath();c.arc(ox,oy,R,a0,a1+.02);c.stroke();}}
    c.fillStyle=col;c.beginPath();c.arc(ox,oy-R,sz,0,7);c.fill();if(st==='comet'){c.fillStyle='#ffffff';c.beginPath();c.arc(ox,oy-R,sz*.5,0,7);c.fill();}}
  return {cv:cv,x:Math.round(PX-ox),y:Math.round(PY-oy)};
}
function drawTicks(ctx,e){
  const n=e.n||12,R=e.r||112,len=e.len||9,col=e.c||'#ffffff';ctx.save();ctx.lineCap='round';
  for(let k=0;k<n;k++){const major=e.even?true:(n===60?k%5===0:(n===48?k%4===0:(n===12?k%3===0:true))),a=k*2*Math.PI/n-Math.PI/2,L=major?len:len*.55;
    ctx.strokeStyle=major?col:rgba(col,.5);ctx.lineWidth=(e.w||2.2)*(major?1:.7);ctx.beginPath();ctx.moveTo(PX+R*Math.cos(a),PY+R*Math.sin(a));ctx.lineTo(PX+(R-L)*Math.cos(a),PY+(R-L)*Math.sin(a));ctx.stroke();}
  if(e.nums){(e.nums===12?[12,1,2,3,4,5,6,7,8,9,10,11].map((v,k)=>[String(v),k*30]):[['12',0],['3',90],['6',180],['9',270]]).forEach(q=>{const a=(q[1]-90)*Math.PI/180,rn=R-len-(e.ns||16)*.78;ctx.font=FONTS[e.f&&!vecFont(e.f)?e.f:'pb'].css(e.ns||16);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(q[0],PX+rn*Math.cos(a),PY+rn*Math.sin(a)+1);});}
  ctx.restore();
}
function drawBg(ctx,bg,photo){
  bg=bg||{t:'solid',c:'#000000'};
  if(bg.t==='grad'){const a=(bg.a===undefined?180:bg.a)*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),L=Math.abs(DW*dx)+Math.abs(DH*dy);
    const g=ctx.createLinearGradient(DW/2-dx*L/2,DH/2-dy*L/2,DW/2+dx*L/2,DH/2+dy*L/2);g.addColorStop(0,bg.c);g.addColorStop(1,bg.c2||bg.c);ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);}
  else if(bg.t==='aurora'){ctx.fillStyle=bg.c||'#080c1e';ctx.fillRect(0,0,DW,DH);const cs=bg.cs||['#00bea8','#7846ff','#ff4696'];
    [[40,60,150],[210,40,140],[200,236,170],[30,250,150]].forEach((p,i)=>{const g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],p[2]);g.addColorStop(0,rgba(cs[i%cs.length],.78));g.addColorStop(1,rgba(cs[i%cs.length],0));ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);});}
  else if(bg.t==='photo'&&photo){const k=Math.max(DW/photo.width,DH/photo.height),w=photo.width*k,h=photo.height*k;ctx.fillStyle='#000';ctx.fillRect(0,0,DW,DH);ctx.drawImage(photo,(DW-w)/2,(DH-h)/2,w,h);
    if(bg.dim){ctx.fillStyle='rgba(0,0,0,'+bg.dim+')';ctx.fillRect(0,0,DW,DH);}}
  else{ctx.fillStyle=bg.c||'#000000';ctx.fillRect(0,0,DW,DH);}
}
function drawDeco(ctx,d){
  ctx.save();ctx.globalAlpha=d.a===undefined?1:d.a;
  if(d.k==='rect'){rr(ctx,d.x,d.y,d.w,d.h,d.r||0);ctx.fillStyle=fillOf(ctx,d.c,d.x,d.y,d.w,d.h);ctx.fill();}
  else if(d.k==='line'){ctx.strokeStyle=d.c;ctx.lineWidth=d.w||1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x2,d.y2);ctx.stroke();}
  else if(d.k==='ring'){ctx.strokeStyle=d.c;ctx.lineWidth=d.w||2;ctx.lineCap=d.cap||'round';if(d.dash)ctx.setLineDash(d.dash);ctx.beginPath();ctx.arc(d.x,d.y,d.r,(d.a0===undefined?0:d.a0)*Math.PI/180,(d.a1===undefined?360:d.a1)*Math.PI/180);ctx.stroke();}
  else if(d.k==='dot'){ctx.fillStyle=d.c;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,7);ctx.fill();}
  else if(d.k==='text'){text(ctx,d.txt,d.x,d.y,d.s||8,d.f||'pm',d.c,d.al||'l',d.tr||0);}
  else if(d.k==='ecg'){ecg(ctx,d.x,d.y,d.w,d.h,d.c,d.lw);}
  else if(d.k==='icon'&&ICONS[d.n]){const cv=mk(d.s,d.s),c=ctxOf(cv);c.fillStyle=d.c;ICONS[d.n](c,d.s);ctx.drawImage(cv,Math.round(d.x-d.s/2),Math.round(d.y));}
  else if(d.k==='ticks'){drawTicks(ctx,d);}
  else if(d.k==='rtext'){ctx.translate(d.x,d.y);ctx.rotate((d.rot||0)*Math.PI/180);text(ctx,d.txt,0,-(d.s||10)*.6,d.s||10,d.f||'pb',d.c,'c',d.tr||0);}
  else if(d.k==='numring'){const L=d.list,n=L.length;ctx.font=FONTS[d.f||'pb'].css(d.s||12);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=d.c;L.forEach((t,k)=>{const an=k*2*Math.PI/n-Math.PI/2,x=(d.x||PX)+d.r*Math.cos(an),y=(d.y||PY)+d.r*Math.sin(an);
      if(d.tan){const deg=k*360/n;ctx.save();ctx.translate(x,y);ctx.rotate((deg>90&&deg<270?deg+180:deg)*Math.PI/180);ctx.fillText(t,0,1);ctx.restore();}else ctx.fillText(t,x,y+1);});}
  else if(d.k==='stripes'){ctx.beginPath();ctx.arc(PX,PY,d.r||116,0,7);ctx.clip();ctx.fillStyle=d.c;const per=d.per||6;for(let x=PX-120;x<PX+120;x+=per)ctx.fillRect(x,0,per/2,DH);}
  else if(d.k==='qr'){drawQR(ctx,d.txt||'',d.x,d.y,d.size);}
  else if(d.k==='note'){const L=(d.lines||[]).filter(t=>t!==undefined).slice(0,9),W=d.w||208,H=d.h||180;let s=d.s||34;ctx.textBaseline='top';
    const wid=q=>{ctx.font=FONTS[d.f||'pb'].css(q);return Math.max(1,...L.map(t=>ctx.measureText(t).width));};while(s>9&&(wid(s)>W||L.length*s*1.22>H))s-=1;
    const y0=(d.y||40)+(H-L.length*s*1.22)/2;L.forEach((t,k)=>text(ctx,t,d.x||120,y0+k*s*1.22,s,d.f||'pb',d.c||'#ffffff','c',0));}
  else if(d.k==='toon'&&TOONS[d.n]){ctx.globalAlpha=1;TOONS[d.n](ctx,d);}
  else if(d.k==='arcg'){const n=48;ctx.lineWidth=d.w||6;ctx.lineCap='round';for(let k=0;k<n;k++){const a0=(d.a0+(d.a1-d.a0)*k/n-90)*Math.PI/180,a1=(d.a0+(d.a1-d.a0)*(k+1)/n-90)*Math.PI/180;ctx.strokeStyle=lerpHex(d.c,d.c2||d.c,k/(n-1));ctx.beginPath();ctx.arc(d.x,d.y,d.r,a0,a1+.01);ctx.stroke();}}
  else if(d.k==='glow'){const g=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.r);g.addColorStop(0,rgba(d.c,d.i||.5));g.addColorStop(1,rgba(d.c,0));ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);}
  ctx.restore();
}
function solidBg(def){return (def.bg&&def.bg.t&&def.bg.t!=='solid')?null:((def.bg&&def.bg.c)||'#000000');}

// Ritar hela urtavlan. Ger bakgrunden (allt som inte ändras), delarna som klockan ritar, och en förhandsbild med exempelvärden.
function renderDial(def,photo){
  const bg=mk(DW,DH),b=ctxOf(bg);drawBg(b,def.bg,photo);(def.deco||[]).forEach(d=>drawDeco(b,d));
  const parts=[],boxes=[],statics=[],els=def.els||[];
  els.forEach((e,i)=>{
    const f=e.f||'pb',s=e.s||20,c=e.c||'#ffffff';let box=null;
    if(e.k==='time'){
      const m=cell(f,s),w=m.w,h=m.h,stack=e.lay==='stack',cw=stack?0:Math.max(4,Math.round(w*.44)),gap=e.gap===undefined?Math.round(s*.05):e.gap;
      const W=stack?2*w+2:4*w+cw,x0=Math.round(e.x-W/2),y=Math.round(e.y);
      const pos=stack?[[x0,y],[x0+w+2,y],[x0,y+h+gap],[x0+w+2,y+h+gap]]:[[x0,y],[x0+w,y],[x0+2*w+cw,y],[x0+3*w+cw,y]];
      box={x:x0,y:y,w:W,h:stack?2*h+gap:h};
      let fh,fm;
      if(e.knock&&solidBg(def)){ // siffrorna blir hål i bakgrundsfärgen, och en färgtoning bakom lyser igenom
        const base=digitSet(f,s,'#ffffff');fh=fm=base.map(g=>knock(g,solidBg(def)));
        statics.push(()=>{[[0,1,e.knock[0]],[2,3,e.knock[1]||e.knock[0]]].forEach(r=>{const xa=pos[r[0]][0],ya=pos[r[0]][1];
          [pos[r[0]],pos[r[1]]].forEach(p=>{b.save();b.beginPath();b.rect(p[0],p[1],w,h);b.clip();b.fillStyle=fillOf(b,r[2],xa,ya,stack?2*w+2:(4*w+cw),h);b.fillRect(xa,ya,4*w+cw,h);b.restore();});});});
      }else{fh=digitSet(f,s,c);fm=e.c2?digitSet(f,s,e.c2):fh;
        if(e.ghost)statics.push(()=>pos.forEach(p=>drawChar(b,f,s,'8',p[0],p[1],w,h,m.base,e.ghost)));
        if(!stack&&e.colon!==false)statics.push(()=>{const cx=x0+2*w+cw/2,r=Math.max(1.4,s*.055);b.fillStyle=Array.isArray(c)?c[0]:c;
          [.34,.68].forEach(k=>{b.beginPath();if(f==='sg')b.rect(cx-r,y+h*k-r,2*r,2*r);else b.arc(cx,y+h*k,r,0,7);b.fill();});});}
      [TY.HH,TY.HL,TY.MH,TY.ML].forEach((t,k)=>parts.push({typ:t,x:pos[k][0],y:pos[k][1],style:1,slots:17,frames:k<2?fh:fm,sample:[1,6,0,4][k],el:i}));
    }else if(VALS[e.k]){
      const V=VALS[e.k],m=cell(f,s),w=m.w,h=m.h,x=Math.round(e.x),y=Math.round(e.y),frames=digitSet(f,s,'#ffffff',!!V.dot);
      const pct=V.pct&&e.pct!==false;const bw=V.max*w+(V.dot?-Math.round(w*.5):0);
      box={x:Math.round(x-V.max*w/2),y:y,w:bw,h:h};
      if(e.ghost&&vecFont(f)&&(e.k==='steps'||e.k==='day'))statics.push(()=>{for(let k=0;k<V.max;k++)drawChar(b,f,s,'8',Math.round(x-V.max*w/2)+k*w,y,w,h,m.base,e.ghost);});
      parts.push({typ:V.t,x:x,y:y,style:2,slots:17,frames:frames,color:Array.isArray(c)?c[0]:c,sample:V.sample,el:i,unit:V.unit,key:e.k,max:V.max});
      if(pct)statics.push(()=>{const ps=Math.max(7,s*.62);b.font=FONTS[vecFont(f)?'pb':f].css(ps);b.textAlign='left';b.textBaseline='alphabetic';b.fillStyle=Array.isArray(c)?c[0]:c;b.fillText('%',x+w*1.38,y+(m.base||h-1));});
      if(V.unit){const uw=Math.max(8,Math.round(s*.74)),uf=['C','F'].map(u=>{const cv=mk(uw,h),g=ctxOf(cv);g.fillStyle=g.strokeStyle=Array.isArray(c)?c[0]:c;const us=s*.66;g.font=FONTS[vecFont(f)?'pb':f].css(us);g.textAlign='left';g.textBaseline='alphabetic';
          const by=(m.base||h-1);g.lineWidth=Math.max(1,s*.06);g.beginPath();g.arc(us*.2+1,by-us*.56,us*.13,0,7);g.stroke();g.fillText(u,us*.36+1,by);return cv;});
        parts.push({typ:TY.UNIT,x:x,y:y,style:1,slots:2,frames:uf,sample:null,el:i});}
      if(e.lab){const ls=e.ls||Math.max(11,Math.min(13,s*.45));statics.push(()=>text(b,e.lab,x,y+h+(e.lg===undefined?2:e.lg),ls,'pb',e.lc||rgba(Array.isArray(c)?c[0]:c,.82),'c',1));box.h+=ls+4;}   // små etiketter gick inte att läsa på klockans skärm
    }else if(e.k==='batt'){const fr=battFrames(e),w=fr[0].width,h=fr[0].height;box={x:Math.round(e.x-w/2),y:Math.round(e.y),w:w,h:h};parts.push({typ:TY.BAR,x:box.x,y:box.y,style:1,slots:7,frames:fr,sample:5,el:i,key:'batt'});}
    else if(e.k==='weather'){const sz=Math.round(e.s||32),fr=weatherFrames(sz,e.style);box={x:Math.round(e.x-sz/2),y:Math.round(e.y),w:sz,h:sz};parts.push({typ:TY.WICON,x:box.x,y:box.y,style:1,slots:4,frames:fr,sample:1,el:i});}
    else if(e.k==='week'){const x=Math.round(e.x),y=Math.round(e.y);box={x:x-24,y:y,w:48,h:19};parts.push({t5:1,typ:3,x:x,y:y,color:Array.isArray(c)?c[0]:c,el:i});}
    else if(e.k==='ticks'){box={x:PX-20,y:PY-(e.r||112)-4,w:40,h:(e.len||9)+10};statics.unshift(()=>drawTicks(b,e));}
    else if(e.k==='hands'){
      const ml=Math.max(40,Math.min(116,e.ml||92)),hl=Math.round(ml*(e.hk||.64)),st=e.style||'bar',w=e.w||(st==='thin'?5:(st==='taper'?13:(st==='arm'?11:8)));
      const hubR=st==='thin'?3.4:Math.max(4,w*.62),hh=handCanvas(e.hs||st,hl,10,w+1,e.hc||'#ffffff',e.nomin?hubR:0,e.htc||e.tc),mh=e.nomin?null:handCanvas(e.ms||st,ml,10,w,e.mc||'#ffffff',hubR,e.mtc||e.tc);
      parts.push({ptr:1,typ:TY.ROTH,x:Math.round(PX-hh.width/2),y:PY-hl,img:hh,el:i});if(mh)parts.push({ptr:1,typ:TY.ROTM,x:Math.round(PX-mh.width/2),y:PY-ml,img:mh,el:i});   // nomin: bara en visare, som på en enhandsklocka
      if(e.sec&&e.small&&!els.some(z=>z.k==='orbit')){const sx=e.small.x,sy=e.small.y,sl=e.small.len||22,sh=handCanvas('thin',sl,6,4,e.sc||'#ff8a3c',2.6);parts.push({ptr:1,typ:TY.ROTS,x:Math.round(sx-sh.width/2),y:sy-sl,img:sh,el:i,px:sx,py:sy,exp:1});}
      else if(e.sec&&!els.some(z=>z.k==='orbit')){const sl=Math.min(118,ml+8),sh=handCanvas('thin',sl,Math.max(6,Math.min(20,122-sl)),4.6,e.sc||'#ff8a3c',3);parts.push({ptr:1,typ:TY.ROTS,x:Math.round(PX-sh.width/2),y:PY-sl,img:sh,el:i});}
      box={x:PX-22,y:PY-22,w:44,h:44};
    }
    else if(e.k==='orbit'){const ty=els.some(z=>z.k==='hands')?TY.ROTS:({h:TY.ROTH,m:TY.ROTM}[e.on]||TY.ROTS);
      if(!parts.some(q=>q.ptr&&q.typ===ty)){const o=orbitCanvas(e);parts.push({ptr:1,typ:ty,x:o.x,y:o.y,img:o.cv,el:i,under:0,exp:e.style==='gear'?1:0});const R=e.r||110;box={x:PX-16,y:Math.max(0,PY-R-12),w:32,h:24};}}
    else if(e.k==='text'){const ts=e.s||10;b.save();const w=text(b,e.txt||'',-9999,-9999,ts,f,'#000','l',e.tr||0);b.restore();box={x:Math.round(e.x-w/2),y:Math.round(e.y),w:Math.ceil(w),h:Math.ceil(ts*1.25)};
      statics.push(()=>text(b,e.txt||'',e.x,e.y,ts,f,Array.isArray(c)?c[0]:c,'c',e.tr||0));}
    boxes[i]=box;
  });
  // Provat på klockan: en ensam sekunddel ritas inte, men tim-, minut- och sekundvisare tillsammans ritas.
  // Därför får urtavlor med bara en sekunddel två osynliga visare (4x4 genomskinliga bildpunkter i mitten).
  if(parts.some(q=>q.ptr))[TY.ROTH,TY.ROTM,TY.ROTS].forEach(ty=>{if(!parts.some(q=>q.ptr&&q.typ===ty))parts.push({ptr:1,typ:ty,x:PX-2,y:PY-2,img:mk(4,4),el:-1});});
  // plattor bakom delar, sedan allt statiskt ovanpå
  els.forEach((e,i)=>{const p=e.plate,bx=boxes[i];if(!p||!bx)return;const px=p.px===undefined?8:p.px,py=p.py===undefined?6:p.py,w=p.w||bx.w+2*px,h=p.h||bx.h+2*py,cx=bx.x+bx.w/2+(p.dx||0);
    b.save();b.globalAlpha=p.a===undefined?1:p.a;rr(b,Math.round(cx-w/2),bx.y-py+(p.dy||0),w,h,p.r===undefined?12:p.r);b.fillStyle=p.c||'#ffffff';b.fill();b.restore();});
  statics.forEach(fn=>fn());
  const R={bg:bg,parts:parts,boxes:boxes};R.preview=composeDial(R,{h:16,m:4,s:37});return R;
}
// Sätter ihop en bild av urtavlan för ett visst klockslag: bakgrund, siffror och allt som vrids.
// Värdena (puls, steg och så vidare) ändras inte mellan sekunderna, så de ritas en gång till ett eget lager.
const TIMETY=new Set([19,20,21,22]);
function liveText(q,vals){   // riktigt värde om det finns och går att visa, annars exempelvärdet
  const v=vals&&q.key?vals[q.key]:undefined;if(v===undefined||v===null||!/^\d+$/.test(String(v)))return q.sample;
  let t=String(v);if(q.key==='steps')t=t.padStart(5,'0');else if(q.key==='day')t=t.padStart(2,'0');return t.length>q.max?q.sample:t;}
function valueLayer(r,vals){
  const cv=mk(DW,DH),p=ctxOf(cv);
  r.parts.forEach(q=>{if(q.t5){text(p,(vals&&vals.wd)||'ONS',q.x,q.y,15,'pb',q.color,'c',1);return;}if(q.ptr||q.sample===null||TIMETY.has(q.typ))return;
    if(q.style===1){let k=q.sample;if(q.key==='batt'&&vals&&/^\d+$/.test(String(vals.battv)))k=Math.max(0,Math.min(6,Math.round(+vals.battv*6/100)));p.drawImage(q.frames[k],q.x,q.y);return;}
    const gl=[...liveText(q,vals)].map(ch=>ch==='.'?q.frames[10]:q.frames[+ch]),tw=gl.reduce((a,g)=>a+g.width,0);let x=Math.round(q.x-tw/2);
    gl.forEach(g=>{const tc=mk(g.width,g.height),c=ctxOf(tc);c.drawImage(g,0,0);c.globalCompositeOperation='source-in';c.fillStyle=q.color;c.fillRect(0,0,tc.width,tc.height);p.drawImage(tc,x,q.y);x+=g.width;});
    if(q.unit){const u=r.parts.find(z=>z.typ===TY.UNIT&&z.el===q.el);if(u)p.drawImage(u.frames[0],x,q.y);}
  });
  return cv;
}
function composeDial(r,t,target){
  const pv=target||mk(DW,DH),p=ctxOf(pv);p.setTransform(1,0,0,1,0,0);p.globalAlpha=1;p.globalCompositeOperation='source-over';p.drawImage(r.bg,0,0);
  const ang={};ang[TY.ROTH]=((t.h%12)+t.m/60)*30;ang[TY.ROTM]=(t.m+t.s/60)*6;ang[TY.ROTS]=t.s*6;
  const dig={};dig[TY.HH]=Math.floor(t.h/10);dig[TY.HL]=t.h%10;dig[TY.MH]=Math.floor(t.m/10);dig[TY.ML]=t.m%10;
  const rot=q=>{const cx=q.px===undefined?PX:q.px,cy=q.py===undefined?PY:q.py;p.save();p.translate(cx,cy);p.rotate(ang[q.typ]*Math.PI/180);p.drawImage(q.img,q.x-cx,q.y-cy);p.restore();};
  r.parts.filter(q=>q.ptr&&q.under).forEach(rot);
  if(!r.vl||r.vlv!==(t.ver||0)){r.vl=valueLayer(r,t.vals);r.vlv=t.ver||0;}p.drawImage(r.vl,0,0);
  r.parts.forEach(q=>{if(!q.ptr&&!q.t5&&TIMETY.has(q.typ))p.drawImage(q.frames[dig[q.typ]],q.x,q.y);});
  [TY.ROTH,TY.ROTM,TY.ROTS].forEach(ty=>r.parts.filter(q=>q.ptr&&!q.under&&q.typ===ty).forEach(rot));
  return pv;
}
function isLive(r){return r.parts.some(q=>q.ptr&&q.typ===TY.ROTS&&q.el!==-1);}
function dialSize(r){let n=64+160*189*2+DW*DH*2;const seen=new Set();
  r.parts.forEach(q=>{if(q.t5){n+=48;return;}if(q.ptr){n+=q.img.width*q.img.height*3+48;return;}if(!seen.has(q.frames)){seen.add(q.frames);n+=8*q.slots;q.frames.forEach(f=>n+=f.width*f.height*(q.style===1?3:1));}n+=48;});return n+48;}
// Spärr: rörliga bilder får inte vara större än det som setts fungera på klockan. En för stor bild har fått klockan att hänga sig.
const PTR_MAXW=116,PTR_MAXH=124;
function dialProblem(r){return r.parts.some(q=>q.ptr&&(q.img.width>PTR_MAXW||q.img.height>PTR_MAXH))?'Den rörliga delen är för stor för klockan. Minska storleken eller avståndet från mitten.':'';}
// Bygger filen som skickas till klockan.
function buildDial(def,id,photo,rendered){
  const r=rendered||renderDial(def,photo);const prob=dialProblem(r);if(prob)throw new Error(prob);
  const noise=(def.bg&&def.bg.t&&def.bg.t!=='solid')?2.5:0;
  const bgB=encBE565(ctxOf(r.bg).getImageData(0,0,DW,DH).data,DW*DH,noise);
  const pc=mk(160,189),pcx=ctxOf(pc);pcx.imageSmoothingQuality='high';pcx.drawImage(r.preview,0,0,160,189);
  const jf=new JKFile(id,encBE565(pcx.getImageData(0,0,160,189).data,160*189,0),bgB),cache=new Map();
  const ptr=q=>{const d=ctxOf(q.img).getImageData(0,0,q.img.width,q.img.height).data;jf.pointer(q.typ,Math.max(0,q.x),Math.max(0,q.y),{w:q.img.width,h:q.img.height,data:encPlanar(d,q.img.width*q.img.height)},q.px===undefined?PX:q.px,q.py===undefined?PY:q.py);};
  // Rörliga delar läggs alltid sist i filen, i ordningen tim, minut, sekund. Det är det enda som setts fungera på klockan.
  r.parts.filter(q=>!q.ptr&&!q.t5).sort((a,b)=>ORDER.indexOf(a.typ)-ORDER.indexOf(b.typ)).forEach(q=>{
    if(!cache.has(q.frames))cache.set(q.frames,jf.group(q.frames.map(f=>{const d=ctxOf(f).getImageData(0,0,f.width,f.height).data,n=f.width*f.height;return {w:f.width,h:f.height,data:q.style===1?encPlanar(d,n):encAlpha(d,n)};}),q.slots));
    jf.element(q.typ,Math.max(0,q.x),Math.max(0,q.y),q.style,q.slots,cache.get(q.frames),q.style===2?hex565(q.color):null);});
  r.parts.filter(q=>q.t5).forEach(q=>jf.text5(q.typ,q.x,q.y,hex565(q.color)));
  [TY.ROTH,TY.ROTM,TY.ROTS].forEach(ty=>r.parts.filter(q=>q.ptr&&q.typ===ty).forEach(ptr));   // visare överst: tim, minut, sekund
  return jf.finish();
}
