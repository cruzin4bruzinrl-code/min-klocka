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
  lekfull(c){c.fillStyle='#050507';c.fillRect(0,0,240,286);
    // vit till röd: prickarna går runt från vitt vid tolv till rött vid sex och tillbaka
    const mix=t=>{const a=[255,255,255],b=[232,32,42];return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')';};
    for(let i=0;i<60;i++){if(i%5===0)continue;const a=i/60*Math.PI*2,t=(1-Math.cos(a))/2;c.fillStyle=mix(t);c.beginPath();c.arc(120+Math.sin(a)*96,143-Math.cos(a)*110,3.2,0,7);c.fill();}
    [[12,0],[3,.5],[6,1],[9,.5]].forEach(([h,t])=>{const a=h/12*Math.PI*2,x=120+Math.sin(a)*68,y=143-Math.cos(a)*80;c.save();c.translate(x,y);c.rotate(-.12);
      const g=c.createLinearGradient(0,-30,0,30);g.addColorStop(0,mix(Math.max(0,t-.35)));g.addColorStop(1,mix(Math.min(1,t+.35)));c.font=FONTS.pb.css(h===12?46:50);c.textAlign='center';c.textBaseline='middle';c.fillStyle=g;c.fillText(String(h),0,0);c.restore();});
    p2txt(c,'PULS',34,18,'cb',8,'#ffb3b8');p2txt(c,'STEG',206,18,'cb',8,'#ffb3b8');p2txt(c,'BATT',34,248,'cb',8,'#ffb3b8');p2txt(c,'DAG',206,248,'cb',8,'#ffb3b8');},
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

// Visare som går från vitt vid mitten till rött i spetsen
HANDPIC.gradpill=function(len,tail,w,col,hub){const hw=Math.max(3,w/2),W=Math.round(hw*2+8),{cv,c,m}=hpCanvas(W,len,10);const g=c.createLinearGradient(0,len,0,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,col);
  c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=4;c.fillStyle=g;c.beginPath();c.roundRect(m-hw,2,hw*2,len+6,hw);c.fill();c.restore();if(hub)p2cap(c,m,len,Math.max(4,hub),'#e8202a');return cv;};

// ================= Urtavlorna från din bild (skapade åt dig av ChatGPT) =================
function p2icon(c,n,x,y,s,col){if(!ICONS[n])return;const cv=mk(s,s),k=ctxOf(cv);k.fillStyle=col;k.strokeStyle=col;ICONS[n](k,s);c.drawImage(cv,Math.round(x-s/2),Math.round(y-s/2));}
function p2ring(c,x,y,r,col,w,a0,a1){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.arc(x,y,r,a0===undefined?0:a0,a1===undefined?Math.PI*2:a1);c.stroke();}
function p2ticks(c,r,ry,col,big,small){for(let i=0;i<60;i++){const a=i/60*Math.PI*2,b=i%5===0,L=b?big:small;c.strokeStyle=col;c.globalAlpha=b?1:.6;c.lineWidth=b?2:1;c.beginPath();c.moveTo(120+Math.sin(a)*r,143-Math.cos(a)*r*ry);c.lineTo(120+Math.sin(a)*(r-L),143-Math.cos(a)*(r-L)*ry);c.stroke();}c.globalAlpha=1;}
Object.assign(P2BG,{
  trecirklar(c){c.fillStyle='#000';c.fillRect(0,0,240,286);p2ticks(c,114,1.16,'#ffffff',9,4);
    [[12,'12'],[3,'3'],[9,'9']].forEach(([h,t])=>{const a=h/12*Math.PI*2;p2txt(c,t,120+Math.sin(a)*94,143-Math.cos(a)*108,'pb',22,'#ffffff');});
    [[66,120,'#ff3b5c','heart'],[160,176,'#2e7bff','pin'],[86,196,'#ffb020','flame']].forEach(([x,y,col,ic])=>{c.fillStyle=col;c.globalAlpha=.9;c.beginPath();c.arc(x,y,25,0,7);c.fill();c.globalAlpha=1;p2icon(c,ic,x,y-14,12,'#ffffff');});},
  vagor2(c){const g=c.createLinearGradient(0,0,0,286);g.addColorStop(0,'#ffb88c');g.addColorStop(.5,'#ff7eb3');g.addColorStop(1,'#7a5cff');c.fillStyle=g;c.fillRect(0,0,240,286);
    [['#ffd3a5',80,0],['#ff9ec4',130,1],['#d38cff',180,2],['#8f6bff',230,3]].forEach(([col,y,k])=>{const gg=c.createLinearGradient(0,y-30,0,y+40);gg.addColorStop(0,col);gg.addColorStop(1,'rgba(255,255,255,.15)');c.fillStyle=gg;c.beginPath();c.moveTo(0,286);c.lineTo(0,y);
      for(let x=0;x<=240;x+=4)c.lineTo(x,y+Math.sin(x/30+k*1.3)*18+Math.cos(x/11+k)*3);c.lineTo(240,286);c.closePath();c.fill();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.stroke();});},
  blabagar(c){c.fillStyle='#000';c.fillRect(0,0,240,286);c.lineWidth=1.2;for(let k=0;k<9;k++){c.strokeStyle='rgba(60,110,255,'+(.25+.06*k)+')';c.beginPath();c.ellipse(220,300,90+k*16,60+k*12,-.5,Math.PI*1.0,Math.PI*1.7);c.stroke();}
    for(let k=0;k<5;k++){c.strokeStyle='rgba(60,110,255,'+(.2+.08*k)+')';c.beginPath();c.ellipse(10,-10,60+k*16,40+k*12,.4,0,Math.PI*.6);c.stroke();}},
  neoncyan(c){c.fillStyle='#020608';c.fillRect(0,0,240,286);c.save();c.shadowColor='#2ef2ff';c.shadowBlur=8;c.strokeStyle='#2ef2ff';c.lineWidth=3;c.beginPath();c.roundRect(14,14,212,258,50);c.stroke();
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r0=i%3?92:84;c.lineWidth=i%3?3:5;c.beginPath();c.moveTo(120+Math.sin(a)*r0,143-Math.cos(a)*r0*1.18);c.lineTo(120+Math.sin(a)*104,143-Math.cos(a)*104*1.18);c.stroke();}
    c.beginPath();c.arc(120,40,8,0,7);c.stroke();c.restore();},
  fargsiffror(c){c.fillStyle='#050507';c.fillRect(0,0,240,286);const cols=['#ff4d6d','#ffd23f','#3ddc84','#4cc9f0','#b388ff','#ff8fab','#ff9f1c'];
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2;if(i%6===0)continue;c.fillStyle=cols[i%cols.length];c.beginPath();c.arc(120+Math.sin(a)*96,143-Math.cos(a)*112,6,0,7);c.fill();}
    [[12,'#ff4d6d'],[3,'#4cc9f0'],[6,'#3ddc84'],[9,'#ff9f1c']].forEach(([h,col])=>{const a=h/12*Math.PI*2;c.save();c.translate(120+Math.sin(a)*70,143-Math.cos(a)*84);c.rotate(-.12);p2txt(c,String(h),0,0,'pb',h===12?46:50,col);c.restore();});
    p2icon(c,'heart',24,22,12,'#ff4d6d');p2icon(c,'flame',214,22,12,'#ffd23f');p2icon(c,'pin',24,262,12,'#4cc9f0');p2icon(c,'steps',214,262,12,'#3ddc84');},
  lcdastro(c){c.fillStyle='#eceee6';c.fillRect(0,0,240,286);c.strokeStyle='#15170f';c.lineWidth=2;[[48],[204],[244]].forEach(([y])=>{c.beginPath();c.moveTo(8,y);c.lineTo(232,y);c.stroke();});
    c.beginPath();c.moveTo(92,8);c.lineTo(92,48);c.moveTo(120,244);c.lineTo(120,280);c.stroke();p2icon(c,'cal',22,28,16,'#15170f');p2icon(c,'steps',108,28,16,'#15170f');p2icon(c,'heart',24,172,18,'#15170f');p2icon(c,'flame',22,262,14,'#15170f');p2icon(c,'pin',134,262,14,'#15170f');
    // en egen liten rymdfarare som svavar
    c.save();c.translate(184,160);c.rotate(-.25);c.strokeStyle='#15170f';c.fillStyle='#ffffff';c.lineWidth=2;c.beginPath();c.roundRect(-12,-4,24,30,8);c.fill();c.stroke();c.beginPath();c.arc(0,-14,13,0,7);c.fill();c.stroke();
    c.fillStyle='#15170f';c.beginPath();c.roundRect(-8,-20,16,10,5);c.fill();c.fillStyle='#ffffff';c.fillRect(-4,-18,4,3);c.strokeStyle='#15170f';c.beginPath();c.moveTo(-12,4);c.lineTo(-22,14);c.moveTo(12,4);c.lineTo(20,-4);c.moveTo(-6,26);c.lineTo(-8,40);c.moveTo(6,26);c.lineTo(10,38);c.stroke();c.restore();
    c.fillStyle='#15170f';[[150,120],[214,110],[160,206-20],[226,180]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.6,0,7);c.fill();});},
  minimaltal(c){c.fillStyle='#000';c.fillRect(0,0,240,286);for(let i=0;i<120;i++){const a=i/120*Math.PI*2,b=i%10===0;c.strokeStyle='#ffffff';c.globalAlpha=b?1:.55;c.lineWidth=b?2:1;const r=112,L=b?10:6;c.beginPath();c.moveTo(120+Math.sin(a)*r,143-Math.cos(a)*r*1.18);c.lineTo(120+Math.sin(a)*(r-L),143-Math.cos(a)*(r-L)*1.18);c.stroke();}c.globalAlpha=1;
    for(let h=1;h<=12;h++){const a=h/12*Math.PI*2;p2txt(c,String(h),120+Math.sin(a)*90,143-Math.cos(a)*104,'pm',11,'#ffffff');}p2icon(c,'flame',22,244,11,'#ff5a3c');p2icon(c,'heart',200,244,11,'#ff3b5c');},
  korsbar2(c){P2BG.korsbar(c);c.fillStyle='#ffffff';[[150,60],[188,92],[170,40]].forEach(([x,y],k)=>{c.save();c.translate(x,y);c.scale(1-k*.15,1-k*.15);c.beginPath();c.moveTo(-10,0);c.quadraticCurveTo(-4,-6,0,0);c.quadraticCurveTo(4,-8,12,-4);c.quadraticCurveTo(4,-2,2,4);c.quadraticCurveTo(-2,2,-10,0);c.fill();c.restore();});
    p2icon(c,'heart',22,186,11,'#ff8fab');},
  dashboard(c){c.fillStyle='#0b0c0f';c.fillRect(0,0,240,286);p2ring(c,40,62,26,'#2a2d33',5,Math.PI*.8,Math.PI*2.2);p2ring(c,40,62,26,'#ff4d6d',5,Math.PI*.8,Math.PI*1.7);
    p2txt(c,'STEG',94,64,'cb',9,'#8a90a4','left',1);p2txt(c,'BPM',212,64,'cb',9,'#ff4d6d','right',1);p2ring(c,120,40,0,'#000',0);
    c.strokeStyle='#2a2d33';c.lineWidth=1;[[100],[196],[236]].forEach(([y])=>{c.beginPath();c.moveTo(14,y);c.lineTo(226,y);c.stroke();});p2txt(c,'BATTERI',120,206,'cb',8,'#8a90a4','center',2);
    p2txt(c,'KM',100,262,'cb',9,'#8a90a4','left',1);p2txt(c,'KCAL',220,262,'cb',9,'#8a90a4','right',1);},
  svep(c){c.fillStyle='#0a0a0c';c.fillRect(0,0,240,286);const g=c.createLinearGradient(0,286,240,0);g.addColorStop(0,'#c8501a');g.addColorStop(.5,'#ff8a3c');g.addColorStop(1,'#1d3a8a');c.fillStyle=g;
    c.beginPath();c.moveTo(0,250);c.bezierCurveTo(60,240,100,190,120,143);c.bezierCurveTo(140,100,150,40,170,0);c.lineTo(200,0);c.bezierCurveTo(176,50,160,110,140,160);c.bezierCurveTo(118,210,70,262,0,286);c.closePath();c.fill();
    c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(0,250);c.bezierCurveTo(60,240,100,190,120,143);c.lineTo(126,148);c.bezierCurveTo(100,200,60,250,0,262);c.closePath();c.fill();
    [[60,148,'heart','#ff3b5c'],[120,230,'flame','#ffb020']].forEach(([x,y,ic,col])=>{c.fillStyle='rgba(20,22,28,.9)';c.beginPath();c.arc(x,y,28,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.stroke();
      for(let i=0;i<30;i++){const a=i/30*Math.PI*2;c.strokeStyle='rgba(255,255,255,.4)';c.beginPath();c.moveTo(x+Math.sin(a)*26,y-Math.cos(a)*26);c.lineTo(x+Math.sin(a)*23,y-Math.cos(a)*23);c.stroke();}p2icon(c,ic,x,y-14,11,col);});
    p2icon(c,'steps',176,58,14,'#ffffff');p2txt(c,'12',120,26,'pl',20,'#ffffff');c.strokeStyle='#ffffff';c.lineWidth=2;c.beginPath();c.arc(196,143,13,0,7);c.stroke();},
  lutande(c){c.fillStyle='#000';c.fillRect(0,0,240,286);[[11,62,34],[10,44,82],[9,40,138],[8,48,194],[7,74,244],[6,124,262],[5,180,248]].forEach(([n,x,y],k)=>{c.save();c.translate(x,y);c.rotate(-.18);c.lineWidth=2;c.strokeStyle='#ffffff';c.font=FONTS.pb.css(56);c.textAlign='center';c.textBaseline='middle';
      if(k%2){c.strokeText(String(n),0,0);}else{c.fillStyle='#ffffff';c.fillText(String(n),0,0);}c.restore();});},
  ringdig(c){c.fillStyle='#000';c.fillRect(0,0,240,286);[[56,214,32,'#ff3b5c'],[56,214,24,'#ff9f1c'],[56,214,16,'#3ddc84'],[56,214,8,'#4cc9f0']].forEach(([x,y,r,col])=>p2ring(c,x,y,r,col,6,-Math.PI/2,Math.PI*1.2));
    p2icon(c,'pin',128,170,14,'#4cc9f0');p2icon(c,'heart',128,206,14,'#ff3b5c');p2icon(c,'flame',128,242,14,'#ff9f1c');},
  konturspar(c){c.fillStyle='#000';c.fillRect(0,0,240,286);c.strokeStyle='#e8e8e8';c.lineWidth=1.4;c.beginPath();c.roundRect(10,10,220,266,46);c.stroke();c.beginPath();c.roundRect(24,24,192,238,34);c.stroke();
    for(let i=0;i<40;i++){const t=i/40;const per=2*(192+238);let d=t*per,x,y;if(d<192){x=24+d;y=24;}else if(d<192+238){x=216;y=24+d-192;}else if(d<384+238){x=216-(d-430);y=262;}else{x=24;y=262-(d-622);}c.fillStyle='#e8e8e8';c.fillRect(x-2,y-2,4,4);}},
  sportgra(c){c.fillStyle='#0b0c0f';c.fillRect(0,0,240,286);c.fillStyle='#c9ccd2';c.beginPath();c.roundRect(8,8,224,150,30);c.fill();c.fillStyle='#e6e8ec';c.beginPath();c.roundRect(8,8,224,40,20);c.fill();
    p2icon(c,'steps',28,28,14,'#1a1c20');c.fillStyle='#1a1c20';c.beginPath();c.arc(48,206,32,0,7);c.fill();c.strokeStyle='#3a3d44';c.lineWidth=2;c.stroke();p2icon(c,'heart',48,186,12,'#ff3b5c');
    p2icon(c,'flame',104,186,12,'#ffb020');p2icon(c,'pin',104,218,12,'#4cc9f0');p2icon(c,'bolt',24,262,12,'#3ddc84');},
  racing2(c){c.fillStyle='#050505';c.fillRect(0,0,240,286);c.strokeStyle='#e8202a';c.lineWidth=4;c.beginPath();c.arc(120,58,34,0,7);c.stroke();c.strokeStyle='rgba(232,32,42,.3)';c.lineWidth=9;c.beginPath();c.arc(120,58,34,-Math.PI*.5,Math.PI*.7);c.stroke();
    p2icon(c,'steps',120,40,12,'#ffffff');p2icon(c,'heart',212,40,11,'#e8202a');p2txt(c,'KM',28,40,'cb',9,'#e8202a');
    c.strokeStyle='#ffffff';c.lineCap='round';[[20,112,220,112,3],[30,196,200,196,4],[10,208,150,208,2]].forEach(([a,b,x,y,w])=>{c.lineWidth=w;c.beginPath();c.moveTo(a,b);c.lineTo(x,y);c.stroke();});
    c.strokeStyle='#e8202a';c.lineWidth=2;c.beginPath();c.roundRect(26,232,140,34,17);c.stroke();}
});
