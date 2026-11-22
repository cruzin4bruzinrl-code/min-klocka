// ================= Premium 2: sex urtavlor med material, djup och data som grafik =================
// Bakgrunden ritas en gång (allt som står still). Visare, datum, puls och batteri är riktiga delar som klockan själv uppdaterar.
const P2={CX:120,CY:143,AH:0,AM:0};
function p2txt(c,t,x,y,f,s,col,al,ls){c.font=FONTS[f].css(s);c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';if(ls)c.letterSpacing=ls+'px';c.fillText(t,x,y);c.letterSpacing='0px';}
function p2metal(c,x0,y0,x1,y1,base){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#ffffff');g.addColorStop(.35,base);g.addColorStop(.55,'#3a3a3a');g.addColorStop(.75,base);g.addColorStop(1,'#f5f5f5');return g;}
function p2track(c,r,col){for(let i=0;i<60;i++){const a=i/60*Math.PI*2,big=i%5===0;c.strokeStyle=col;c.globalAlpha=big?.9:.5;c.lineWidth=big?1.2:.7;c.beginPath();c.moveTo(120+Math.sin(a)*r,143-Math.cos(a)*r*1.12);c.lineTo(120+Math.sin(a)*(r-(big?5:3)),143-Math.cos(a)*(r-(big?5:3))*1.12);c.stroke();}c.globalAlpha=1;}
function p2applied(c,a,r,len,w,base){c.save();c.translate(120+Math.sin(a)*r,143-Math.cos(a)*r*1.12);c.rotate(a);c.shadowColor='rgba(0,0,0,.7)';c.shadowBlur=3;c.shadowOffsetY=1.5;c.fillStyle=base;c.beginPath();c.roundRect(-w/2,0,w,len,1.2);c.fill();c.shadowColor='transparent';
  c.fillStyle=p2metal(c,-w/2,0,w/2,0,base);c.beginPath();c.roundRect(-w/2,0,w,len,1.2);c.fill();c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-w/2+.6,.6,w*.18,len-1.2);c.restore();}
function p2glass(c){const g=c.createLinearGradient(0,0,168,172);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(.45,'rgba(255,255,255,.02)');g.addColorStop(.46,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.lineTo(240,0);c.lineTo(0,257);c.closePath();c.fill();}
function p2window(c,x,y,w,h,bg){c.fillStyle='rgba(0,0,0,.6)';c.beginPath();c.roundRect(x-1,y-1,w+2,h+2,4);c.fill();c.fillStyle=bg;c.beginPath();c.roundRect(x,y,w,h,3);c.fill();const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(0,0,0,.3)');g.addColorStop(.3,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x,y,w,h);}
function p2sun(c,c1,c2,n){const g=c.createRadialGradient(120,143,0,120,143,200);g.addColorStop(0,c1);g.addColorStop(1,c2);c.fillStyle=g;c.fillRect(0,0,240,286);
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;c.beginPath();c.moveTo(120,143);c.arc(120,143,300,a,a+Math.PI/n);c.fillStyle='rgba(255,255,255,'+(.018+.03*Math.abs(Math.sin(a*2+.7)))+')';c.fill();}
  const v=c.createRadialGradient(120,143,70,120,143,190);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=v;c.fillRect(0,0,240,286);}
const P2BG={
  noir(c){p2sun(c,'#1d1d20','#020203',180);p2track(c,112,'#b89a5a');for(let i=0;i<12;i++){if(i===3)continue;p2applied(c,i/12*Math.PI*2,104,i===0?22:16,i===0?8:5,'#d9b870');}
    p2window(c,186,133,30,20,'#f4efe4');p2txt(c,'AUTOMATIC',120,196,'cb',8,'#b89a5a','center',2);p2glass(c);},
  bla(c){const g=c.createRadialGradient(120,143,0,120,143,190);g.addColorStop(0,'#1d4a8a');g.addColorStop(1,'#061430');c.fillStyle=g;c.fillRect(0,0,240,286);
    c.lineWidth=.6;for(let k=1;k<34;k++){c.beginPath();for(let s=0;s<=360;s+=2){const t=s*Math.PI/180,r=k*4.4+Math.sin(t*36)*1.2;const x=120+Math.cos(t)*r,y=143+Math.sin(t)*r*1.12;s?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle='rgba(190,210,255,'+(.05+.05*(k%2))+')';c.stroke();}
    p2track(c,112,'#dfe8f6');[[120,92,'BATT',0],[120,198,'PULS',1]].forEach(([x,y,l,j])=>{c.fillStyle='rgba(4,14,36,.55)';c.beginPath();c.arc(x,y,30,0,7);c.fill();c.strokeStyle='rgba(220,230,250,.5)';c.lineWidth=1;c.stroke();
      for(let i=0;i<(j?12:7);i++){const a=j?i/12*Math.PI*2:-Math.PI*.75+i/6*Math.PI*1.5;c.strokeStyle='#dfe8f6';c.beginPath();c.moveTo(x+Math.sin(a)*27,y-Math.cos(a)*27);c.lineTo(x+Math.sin(a)*22,y-Math.cos(a)*22);c.stroke();}p2txt(c,l,x,y+15,'cb',7,'#9fb4d8','center',1);});
    [[0,'XII'],[3,'III'],[9,'IX']].forEach(([h,t])=>{const a=h/12*Math.PI*2;p2txt(c,t,120+Math.sin(a)*96,143-Math.cos(a)*96*1.12,'se',15,'#eef2fa');});p2glass(c);},
  pilot(c){c.fillStyle='#0e0f10';c.fillRect(0,0,240,286);let s=4;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<5000;i++){c.fillStyle='rgba(255,255,255,'+(r()*.03)+')';c.fillRect(r()*240,r()*286,1,1);}
    p2track(c,114,'#e8efe9');[12,3,6,9].forEach(h=>{const a=h/12*Math.PI*2;c.save();c.shadowColor='rgba(180,255,200,.35)';c.shadowBlur=6;p2txt(c,String(h),120+Math.sin(a)*86,143-Math.cos(a)*86*1.12,'cb',40,'#e8f4e6');c.restore();});
    c.fillStyle='#e8f4e6';c.beginPath();c.moveTo(120,22);c.lineTo(113,10);c.lineTo(127,10);c.closePath();c.fill();p2txt(c,'FUEL',64,212,'cb',9,'#8a948c');p2glass(c);},
  kalibr(c){const g=c.createLinearGradient(0,0,240,286);g.addColorStop(0,'#14161c');g.addColorStop(1,'#050608');c.fillStyle=g;c.fillRect(0,0,240,286);
    const b=c.createRadialGradient(190,40,0,190,40,180);b.addColorStop(0,'rgba(124,92,255,.35)');b.addColorStop(1,'rgba(124,92,255,0)');c.fillStyle=b;c.fillRect(0,0,240,286);
    c.fillStyle='rgba(255,255,255,.05)';c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1;c.beginPath();c.roundRect(14,58,212,112,22);c.fill();c.stroke();
    p2txt(c,'DAG',26,38,'pm',11,'#a8aec0','left',1.5);p2txt(c,'BATT',56,262,'cb',8,'#8a90a4','center',1);p2txt(c,'STEG',150,236,'cb',8,'#8a90a4','left',1);p2txt(c,'PULS',184,258,'cb',8,'#8a90a4','left',1);},
  keramik(c){const g=c.createRadialGradient(90,80,10,120,143,220);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#d8dbe0');c.fillStyle=g;c.fillRect(0,0,240,286);
    p2track(c,112,'#1f3f88');for(let h=1;h<=12;h++){if(h===6)continue;const a=h/12*Math.PI*2;p2txt(c,String(h),120+Math.sin(a)*92,143-Math.cos(a)*92*1.12,'pm',16,'#1f3f88');}
    c.fillStyle='rgba(0,0,0,.05)';c.beginPath();c.arc(120,206,26,0,7);c.fill();c.strokeStyle='#9aa4b8';c.lineWidth=.8;c.stroke();
    for(let i=0;i<7;i++){const a=-Math.PI*.7+i/6*Math.PI*1.4;c.strokeStyle='#1f3f88';c.beginPath();c.moveTo(120+Math.sin(a)*23,206-Math.cos(a)*23);c.lineTo(120+Math.sin(a)*19,206-Math.cos(a)*19);c.stroke();}p2txt(c,'BATT',120,222,'cb',6,'#6a7a9a','center',1);p2glass(c);},
  titan(c){c.fillStyle='#4a4f56';c.fillRect(0,0,240,286);let s=9;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let y=0;y<286;y++){c.fillStyle='rgba('+(r()>.5?'255,255,255':'0,0,0')+','+(r()*.08)+')';c.fillRect(0,y,240,1);}
    c.fillStyle='#1b1d21';c.beginPath();c.ellipse(120,143,104,116,0,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=1;c.stroke();
    for(let m=0;m<60;m+=5){const a=m/60*Math.PI*2;p2txt(c,String(m||60).padStart(2,'0'),120+Math.sin(a)*112,143-Math.cos(a)*126,'cb',11,m===0?'#ff7a2e':'#d8dce2');}
    for(let i=0;i<12;i++){if(i===3)continue;const a=i/12*Math.PI*2;c.save();c.translate(120+Math.sin(a)*86,143-Math.cos(a)*96);c.rotate(a);c.fillStyle='#e8ece8';c.fillRect(-3,0,6,i%3?12:18);c.restore();}
    p2window(c,170,132,34,22,'#2a2d33');p2glass(c);}
};
const _drawBgP2=drawBg;
drawBg=function(ctx,bg,photo){if(bg&&bg.t==='p2'&&P2BG[bg.id]){ctx.save();P2BG[bg.id](ctx);ctx.restore();return;}_drawBgP2(ctx,bg,photo);};

// Visare: fasetterad (ljus och mörk halva), svärd med självlysande inlägg, rundad stav. Skuggan är en jämn glöd, eftersom visaren vrids.
function p2shade(hex,k){const h=hexRgb(hex);return 'rgb('+h.map(v=>Math.max(0,Math.min(255,Math.round(k>1?v+(255-v)*(k-1):v*k)))).join(',')+')';}
function p2cap(c,m,len,r,col){const g=c.createRadialGradient(m-r*.4,len-r*.4,.5,m,len,r);g.addColorStop(0,'#fff');g.addColorStop(.5,col);g.addColorStop(1,'#222');c.fillStyle=g;c.beginPath();c.arc(m,len,r,0,7);c.fill();}
Object.assign(HANDPIC,{
  facet(len,tail,w,col,hub){const hw=Math.max(4,w*.75),W=Math.round(hw*2+8),{cv,c,m}=hpCanvas(W,len,12);
    c.save();c.shadowColor='rgba(0,0,0,.7)';c.shadowBlur=4;c.fillStyle=p2shade(col,.55);c.beginPath();c.moveTo(m,2);c.lineTo(m+hw,len*.82);c.lineTo(m,len+10);c.lineTo(m-hw,len*.82);c.closePath();c.fill();c.restore();
    c.fillStyle=p2shade(col,1.35);c.beginPath();c.moveTo(m,2);c.lineTo(m+hw,len*.82);c.lineTo(m,len+10);c.closePath();c.fill();
    c.fillStyle=p2shade(col,.62);c.beginPath();c.moveTo(m,2);c.lineTo(m-hw,len*.82);c.lineTo(m,len+10);c.closePath();c.fill();if(hub)p2cap(c,m,len,Math.max(4,hub),col);return cv;},
  sword2(len,tail,w,col,hub){const hw=Math.max(3.5,w*.62),W=Math.round(hw*2+8),{cv,c,m}=hpCanvas(W,len,16);
    c.save();c.shadowColor='rgba(0,0,0,.7)';c.shadowBlur=4;c.fillStyle=p2metal(c,m-hw,0,m+hw,0,col);c.beginPath();c.moveTo(m,1);c.lineTo(m+hw,len*.18);c.lineTo(m+hw*.7,len+14);c.lineTo(m-hw*.7,len+14);c.lineTo(m-hw,len*.18);c.closePath();c.fill();c.restore();
    c.fillStyle='#dcffe4';c.beginPath();c.moveTo(m,6);c.lineTo(m+hw*.55,len*.2);c.lineTo(m+hw*.4,len*.8);c.lineTo(m-hw*.4,len*.8);c.lineTo(m-hw*.55,len*.2);c.closePath();c.fill();if(hub)p2cap(c,m,len,Math.max(4,hub),col);return cv;},
  pill(len,tail,w,col,hub){const hw=Math.max(2.5,w/2),W=Math.round(hw*2+8),{cv,c,m}=hpCanvas(W,len,10);
    c.save();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=4;c.fillStyle=col;c.beginPath();c.roundRect(m-hw,2,hw*2,len+6,hw);c.fill();c.restore();if(hub)p2cap(c,m,len,Math.max(4,hub),col);return cv;}
});

// Batteriet som grafik i 7 lägen: nål i underurtavla, bränslebåge, segmentbåge.
Object.assign(BATTPIC,{
  needle(e){const R=e.r||30,S=R*2,out=[],a0=e.a0===undefined?-Math.PI*.75:e.a0,span=e.span||Math.PI*1.5;
    for(let lv=0;lv<7;lv++){const cv=mk(S,S),c=ctxOf(cv),a=a0+(lv/6)*span;c.strokeStyle=e.c||'#ff6a3c';c.lineWidth=1.8;c.lineCap='round';c.beginPath();c.moveTo(R,R);c.lineTo(R+Math.sin(a)*(R-6),R-Math.cos(a)*(R-6));c.stroke();
      p2cap(c,R,R,2.6,e.c||'#ff6a3c');out.push(cv);}return out;},
  fuel(e){const out=[],w=52,h=72,cx=120-(e.x-w/2),cy=143-e.y,R=58,A0=Math.PI*.62,A1=Math.PI*.98;
    for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv);c.lineCap='round';c.lineWidth=5;c.strokeStyle='#26292c';c.beginPath();c.arc(cx,cy,R,A0,A1);c.stroke();
      if(lv){c.strokeStyle=lv<=1?'#ff6a5a':'#e8f4e6';c.beginPath();c.arc(cx,cy,R,A1-(A1-A0)*lv/6,A1);c.stroke();}out.push(cv);}return out;},
  segarc(e){const out=[],S=68,R=28;for(let lv=0;lv<7;lv++){const cv=mk(S,S),c=ctxOf(cv);c.lineCap='round';c.lineWidth=6;
      for(let i=0;i<6;i++){c.strokeStyle=i<lv?(lv<=1?'#ff6a7a':'#7c5cff'):'rgba(255,255,255,.12)';const a0=Math.PI*.75+i*.27;c.beginPath();c.arc(S/2,S/2,R,a0,a0+.17);c.stroke();}out.push(cv);}return out;}
});

// ================= Egna tolkningar av genrerna i din bild =================
Object.assign(P2BG,{
  lekfull(c){c.fillStyle='#050507';c.fillRect(0,0,240,286);const cols=['#ff4d6d','#ffb703','#3ddc84','#4cc9f0','#b388ff','#ff8fab'];
    for(let i=0;i<60;i++){if(i%5===0)continue;const a=i/60*Math.PI*2;c.fillStyle=cols[Math.floor(i/10)%cols.length];c.beginPath();c.arc(120+Math.sin(a)*108,143-Math.cos(a)*124,3.4,0,7);c.fill();}
    [[12,'#ff4d6d'],[3,'#4cc9f0'],[6,'#3ddc84'],[9,'#ffb703']].forEach(([h,col])=>{const a=h/12*Math.PI*2;c.save();c.translate(120+Math.sin(a)*78,143-Math.cos(a)*92);c.rotate(-.12);p2txt(c,String(h),0,0,'pb',h===12?54:58,col);c.restore();});},
  lcdvit(c){c.fillStyle='#d9ddd6';c.fillRect(0,0,240,286);c.strokeStyle='#1c1f1a';c.lineWidth=2;[[60,'h'],[176,'h'],[226,'h']].forEach(([y])=>{c.beginPath();c.moveTo(10,y);c.lineTo(230,y);c.stroke();});
    c.beginPath();c.moveTo(120,10);c.lineTo(120,60);c.moveTo(120,226);c.lineTo(120,276);c.stroke();
    p2txt(c,'DAG',22,36,'mo',11,'#1c1f1a','left');p2txt(c,'STEG',132,24,'mo',9,'#1c1f1a','left');p2txt(c,'KCAL',22,240,'mo',9,'#1c1f1a','left');p2txt(c,'PULS',132,240,'mo',9,'#1c1f1a','left');
    c.save();c.translate(186,198);c.rotate(-.5);c.fillStyle='#1c1f1a';c.beginPath();c.moveTo(0,-20);c.quadraticCurveTo(9,-8,8,10);c.lineTo(-8,10);c.quadraticCurveTo(-9,-8,0,-20);c.fill();c.fillStyle='#d9ddd6';c.beginPath();c.arc(0,-4,3.5,0,7);c.fill();
    c.fillStyle='#1c1f1a';c.beginPath();c.moveTo(-8,4);c.lineTo(-14,14);c.lineTo(-8,11);c.fill();c.beginPath();c.moveTo(8,4);c.lineTo(14,14);c.lineTo(8,11);c.fill();c.fillStyle='#e0603a';c.beginPath();c.moveTo(-4,12);c.lineTo(0,22);c.lineTo(4,12);c.fill();c.restore();
    c.fillStyle='rgba(0,0,0,.05)';for(let y=0;y<286;y+=3)c.fillRect(0,y,240,1);},
  panel(c){c.fillStyle='#0c0d10';c.fillRect(0,0,240,286);c.strokeStyle='#2a2d33';c.lineWidth=1.5;c.beginPath();c.roundRect(10,12,220,262,22);c.stroke();
    c.strokeStyle='#ff4d6d';c.lineWidth=3;c.lineCap='round';c.beginPath();c.arc(120,330,300,Math.PI*1.34,Math.PI*1.5);c.stroke();c.strokeStyle='#4cc9f0';c.beginPath();c.arc(120,330,300,Math.PI*1.5,Math.PI*1.66);c.stroke();
    p2txt(c,'STEG',58,70,'cb',10,'#8a90a4');p2txt(c,'PULS',182,70,'cb',10,'#8a90a4');p2txt(c,'BATTERI',120,186,'cb',9,'#8a90a4','center',1.5);
    c.fillStyle='#16181d';c.beginPath();c.roundRect(20,232,96,32,10);c.fill();c.beginPath();c.roundRect(124,232,96,32,10);c.fill();p2txt(c,'DAG',34,248,'cb',9,'#8a90a4','left');},
  racing(c){c.fillStyle='#050505';c.fillRect(0,0,240,286);c.strokeStyle='#ffffff';c.lineCap='round';
    [[30,214,210,214,4],[20,226,170,226,2.5],[60,238,220,238,2.5]].forEach(([x0,y0,x1,y1,w])=>{c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();});
    c.strokeStyle='#e8202a';c.lineWidth=4;c.beginPath();c.arc(150,62,38,0,7);c.stroke();c.strokeStyle='rgba(232,32,42,.35)';c.lineWidth=10;c.beginPath();c.arc(150,62,38,-Math.PI*.6,Math.PI*.2);c.stroke();
    p2txt(c,'STEG',150,44,'cb',8,'#e8202a','center',1);c.strokeStyle='#e8202a';c.lineWidth=2;c.beginPath();c.roundRect(28,244,90,28,14);c.stroke();p2txt(c,'DAG',50,258,'cb',11,'#e8202a');},
  korsbar(c){c.fillStyle='#050405';c.fillRect(0,0,240,286);let s=31;const r=()=>(s=(s*16807)%2147483647)/2147483647;c.strokeStyle='#3a2a2a';c.lineCap='round';
    const br=(x,y,a,len,w,d)=>{if(d>5||len<8)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
      for(let k=0;k<3;k++){const t=r();const px=x+(x2-x)*t,py=y+(y2-y)*t;for(let f=0;f<(d>2?3:1);f++){const fx=px+(r()-.5)*16,fy=py+(r()-.5)*16,fr=3+r()*3;
        for(let p=0;p<5;p++){const pa=p/5*Math.PI*2+r();c.fillStyle=r()>.5?'#ffb3c6':'#ff8fab';c.beginPath();c.ellipse(fx+Math.cos(pa)*fr,fy+Math.sin(pa)*fr,fr*.8,fr*.55,pa,0,7);c.fill();}c.fillStyle='#ffe066';c.beginPath();c.arc(fx,fy,1.4,0,7);c.fill();}}
      br(x2,y2,a+(r()-.3)*.9,len*.72,w*.7,d+1);br(x2,y2,a-(r()-.2)*.9,len*.6,w*.65,d+1);};
    br(-10,40,.35,70,7,0);for(let k=0;k<5;k++){c.fillStyle='rgba(255,179,198,.8)';c.beginPath();c.ellipse(150+r()*80,110+r()*60,3,1.8,r()*3,0,7);c.fill();}},
  pastell(c){const g=c.createLinearGradient(0,0,240,286);g.addColorStop(0,'#ffd1dc');g.addColorStop(.5,'#c9a7ff');g.addColorStop(1,'#7fb8ff');c.fillStyle=g;c.fillRect(0,0,240,286);
    [['rgba(255,160,180,.55)',90],['rgba(190,140,255,.5)',150],['rgba(110,170,255,.55)',210]].forEach(([col,y],k)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,286);c.lineTo(0,y);
      for(let x=0;x<=240;x+=4)c.lineTo(x,y+Math.sin(x/34+k*1.6)*16+Math.sin(x/13+k)*4);c.lineTo(240,286);c.closePath();c.fill();});},
  kakel(c){c.fillStyle='#c9cfc4';c.fillRect(0,0,240,286);const tile=(x,y,w,h)=>{c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.roundRect(x+1,y+2,w,h,14);c.fill();c.fillStyle='#e4e8df';c.beginPath();c.roundRect(x,y,w,h,14);c.fill();
      c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1;c.stroke();};tile(14,16,212,104);tile(14,132,100,58);tile(126,132,100,58);tile(14,202,212,68);
    p2txt(c,'DAG',30,148,'mo',9,'#5a6256','left');p2txt(c,'PULS',142,148,'mo',9,'#5a6256','left');p2txt(c,'STEG',30,218,'mo',9,'#5a6256','left');}
});
Object.assign(PICFONT,{
  ital(c,ch,x,y,w,h){const col=c.fillStyle;c.save();c.translate(x+w/2,y+h/2);c.transform(1,0,-.2,1,0,0);c.font='700 '+Math.round(h*1.05)+'px PoppinsApp';c.textAlign='center';c.textBaseline='middle';c.fillStyle=col;c.fillText(ch,0,h*.04);c.restore();}
});
FONTS.ital={n:'Kursiv',css:null,pic:.66};
BATTPIC.bars=function(e){const out=[],n=10,w=e.w||150,h=e.h||14,gap=3,bw=(w-gap*(n-1))/n;for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),on=Math.round(lv/6*n);
  for(let i=0;i<n;i++){c.fillStyle=i<on?(i<3?'#ff4d6d':i<6?'#ffb703':'#3ddc84'):'#22252b';c.beginPath();c.roundRect(i*(bw+gap),0,bw,h,3);c.fill();}out.push(cv);}return out;};
