// ================= Premiumserien: metallvisare, ytor med struktur, glas och infattning =================
// Visarna roterar runt vridpunkten, så skuggan är en jämn glans runt hela visaren, inte en förskjuten skugga.
function mGrad(c,x0,x1,col){   // borstad metall: ljus kant, mörk mitt, ljus kant
  const g=c.createLinearGradient(x0,0,x1,0),h=hexRgb(col||'#d8dde6'),L=k=>'rgb('+h.map(v=>Math.max(0,Math.min(255,Math.round(v*k+(k>1?(255-v)*(k-1)*.6:0))))).join(',')+')';
  g.addColorStop(0,L(.55));g.addColorStop(.38,L(1.25));g.addColorStop(.55,L(.9));g.addColorStop(1,L(.5));return g;}
function halo(c,path,col,r){c.save();c.shadowColor=col||'rgba(0,0,0,.55)';c.shadowBlur=r||5;c.fillStyle='rgba(0,0,0,.01)';path();c.fill();c.restore();}
function hubDot(c,m,len,r,col){const g=c.createRadialGradient(m-r*.3,len-r*.3,.5,m,len,r);g.addColorStop(0,'#fff');g.addColorStop(.45,col||'#d8dde6');g.addColorStop(1,'#3a3f4a');c.beginPath();c.arc(m,len,r,0,7);c.fillStyle=g;c.fill();c.lineWidth=.8;c.strokeStyle='rgba(0,0,0,.6)';c.stroke();}
Object.assign(HANDPIC,{
  dauphine(len,tail,w,col,hub){const W=Math.max(16,Math.round(w)+10),{cv,c,m}=hpCanvas(W,len,14),hw=Math.max(3.2,w/2);
    const P=()=>{c.beginPath();c.moveTo(m,2);c.lineTo(m+hw,len*.62);c.lineTo(m+hw*.55,len+13);c.lineTo(m-hw*.55,len+13);c.lineTo(m-hw,len*.62);c.closePath();};
    halo(c,P,'rgba(0,0,0,.7)',4);P();c.fillStyle=mGrad(c,m-hw,m+hw,col);c.fill();
    c.beginPath();c.moveTo(m,2);c.lineTo(m,len+13);c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=.9;c.stroke();   // fasad: mittveck
    P();c.lineWidth=.8;c.strokeStyle='rgba(255,255,255,.55)';c.stroke();
    if(hub)hubDot(c,m,len,Math.max(3.6,hub),col);return cv;},
  sword(len,tail,w,col,hub){const W=Math.max(16,Math.round(w)+10),{cv,c,m}=hpCanvas(W,len,16),hw=Math.max(2.6,w/2.2);
    const P=()=>{c.beginPath();c.moveTo(m,1);c.lineTo(m+hw,len*.18);c.lineTo(m+hw*.7,len+14);c.lineTo(m-hw*.7,len+14);c.lineTo(m-hw,len*.18);c.closePath();};
    halo(c,P,'rgba(0,0,0,.7)',4);P();c.fillStyle=mGrad(c,m-hw,m+hw,col);c.fill();
    c.fillStyle='rgba(0,0,0,.55)';c.fillRect(m-hw*.34,len*.2,hw*.68,len*.5);   // lumeinlägg
    c.fillStyle='#c8ffd8';c.fillRect(m-hw*.22,len*.22,hw*.44,len*.46);
    P();c.lineWidth=.8;c.strokeStyle='rgba(255,255,255,.5)';c.stroke();
    if(hub)hubDot(c,m,len,Math.max(3.6,hub),col);return cv;},
  lumed(len,tail,w,col,hub){const W=Math.max(16,Math.round(w)+10),{cv,c,m}=hpCanvas(W,len,14),hw=Math.max(3,w/2);
    const R=()=>{const q=hw*.8;c.beginPath();c.moveTo(m-hw+q,2);c.arcTo(m+hw,2,m+hw,len+13,q);c.lineTo(m+hw*.8,len+13);c.lineTo(m-hw*.8,len+13);c.arcTo(m-hw,2,m+hw,2,q);c.closePath();};
    halo(c,R,'rgba(0,0,0,.7)',4);R();c.fillStyle=mGrad(c,m-hw,m+hw,col);c.fill();
    c.save();R();c.clip();const g=c.createLinearGradient(0,len*.1,0,len*.8);g.addColorStop(0,'#eaffd0');g.addColorStop(1,'#9fe8b0');c.fillStyle=g;c.fillRect(m-hw*.5,len*.1,hw,len*.62);c.restore();
    R();c.lineWidth=.8;c.strokeStyle='rgba(255,255,255,.55)';c.stroke();
    if(hub)hubDot(c,m,len,Math.max(3.6,hub),col);return cv;}
});
// Ytor: solstrålar, guilloché, borstad metall och Côtes de Genève. Allt ritas på förhand, så klockan får en färdig bild.
const _drawBg=drawBg;
drawBg=function(ctx,bg,photo){
  bg=bg||{};const cx=bg.cx===undefined?120:bg.cx,cy=bg.cy===undefined?143:bg.cy;
  if(bg.t==='sunburst'){const a=ctx.createRadialGradient(cx,cy,0,cx,cy,190);a.addColorStop(0,bg.c);a.addColorStop(1,bg.c2||'#000');ctx.fillStyle=a;ctx.fillRect(0,0,DW,DH);
    const n=bg.n||90;for(let i=0;i<n;i++){const t=i/n*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,260,t,t+Math.PI*2/n*.5);ctx.closePath();ctx.fillStyle='rgba(255,255,255,'+(.035+.05*Math.abs(Math.sin(t*2+.6)))+')';ctx.fill();}
    const v=ctx.createRadialGradient(cx,cy,60,cx,cy,200);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=v;ctx.fillRect(0,0,DW,DH);}
  else if(bg.t==='guilloche'){_drawBg(ctx,{t:'grad',c:bg.c,c2:bg.c2||bg.c,a:160},photo);ctx.lineWidth=.6;
    const rings=bg.rings||26;for(let k=1;k<=rings;k++){const r=k*(bg.step||5.4);ctx.beginPath();for(let s=0;s<=360;s+=2){const t=s*Math.PI/180,rr=r+Math.sin(t*(bg.lobes||24))*(bg.amp||1.6);const x=cx+Math.cos(t)*rr,y=cy+Math.sin(t)*rr;s?ctx.lineTo(x,y):ctx.moveTo(x,y);}
      ctx.strokeStyle='rgba('+(bg.lc||'255,255,255')+','+(.05+.07*(k%2))+')';ctx.stroke();}
    const v=ctx.createRadialGradient(cx,cy,40,cx,cy,210);v.addColorStop(0,'rgba(255,255,255,.06)');v.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=v;ctx.fillRect(0,0,DW,DH);}
  else if(bg.t==='brushed'){_drawBg(ctx,{t:'grad',c:bg.c,c2:bg.c2||bg.c,a:bg.a===undefined?135:bg.a},photo);let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let y=0;y<DH;y+=1){ctx.fillStyle='rgba('+(rnd()>.5?'255,255,255':'0,0,0')+','+(rnd()*.07).toFixed(3)+')';ctx.fillRect(0,y,DW,1);}
    const g=ctx.createLinearGradient(0,0,DW,DH);g.addColorStop(0,'rgba(255,255,255,.14)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.3)');ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);}
  else if(bg.t==='geneva'){_drawBg(ctx,{t:'grad',c:bg.c,c2:bg.c2||bg.c,a:90},photo);const w=bg.sw||14;
    for(let x=-20,i=0;x<DW+30;x+=w,i++){const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.13)');g.addColorStop(1,'rgba(0,0,0,.18)');
      ctx.save();ctx.translate(DW/2,DH/2);ctx.rotate((bg.rot===undefined?-.5:bg.rot));ctx.translate(-DW/2,-DH/2);ctx.fillStyle=g;ctx.fillRect(x,-80,w,DH+160);ctx.restore();}}
  else _drawBg(ctx,bg,photo);
};
// Deco: infattning (metallring med skuggkanter) och glasreflex
const _drawDeco=drawDeco;
drawDeco=function(ctx,d){
  if(d.k==='bezel'){ctx.save();const x=d.x===undefined?120:d.x,y=d.y===undefined?143:d.y,r=d.r||118,w=d.w||7,col=d.c||'#c8ced8';
    const g=ctx.createLinearGradient(x-r,y-r,x+r,y+r);g.addColorStop(0,'#fff');g.addColorStop(.25,col);g.addColorStop(.5,'#5a606c');g.addColorStop(.75,col);g.addColorStop(1,'#fff');
    ctx.lineWidth=w;ctx.strokeStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();
    ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(x,y,r-w/2-.5,0,7);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.arc(x,y,r+w/2,0,7);ctx.stroke();ctx.restore();return;}
  if(d.k==='glassref'){ctx.save();ctx.beginPath();ctx.arc(120,143,d.r||116,0,7);ctx.clip();const g=ctx.createLinearGradient(0,0,DW*.8,DH*.8);g.addColorStop(0,'rgba(255,255,255,'+(d.a||.2)+')');g.addColorStop(.42,'rgba(255,255,255,.03)');g.addColorStop(.43,'rgba(255,255,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(DW,0);ctx.lineTo(0,DH);ctx.closePath();ctx.fill();ctx.restore();return;}
  _drawDeco(ctx,d);
};

// ================= Rörelse som drivs av stegen, utan att något roterar =================
// Varje siffra i stegräknaren är en bild. Med tio lägen per bild går rörelsen ett läge framåt per steg,
// och läge 9 går över i läge 0 utan hopp. Klockan färgar bilderna med en färg, så allt ritas i vitt med genomskinlighet.
Object.assign(PICFONT,{
  eq(c,ch,x,y,w,h){   // equalizer: en stapel av tio lysdioder, den högsta lyser starkast
    const d=+ch;if(!(d>=0))return;const n=10,gap=Math.max(1,h*.025),sh=(h-gap*(n-1))/n,bw=w*.72,bx=x+(w-bw)/2,on=d+1;
    for(let k=0;k<n;k++){const yy=y+h-(k+1)*sh-k*gap;c.globalAlpha=k<on?(k===on-1?1:.62+.03*k):.12;c.fillStyle='#fff';
      c.beginPath();c.roundRect(bx,yy,bw,sh,Math.min(2.5,sh/2.5));c.fill();}
    c.globalAlpha=1;},
  lava(c,ch,x,y,w,h){   // lavalampa: två klotter som stiger, tonar in nertill och ut upptill
    const d=+ch;if(!(d>=0))return;c.save();c.beginPath();c.roundRect(x+w*.08,y,w*.84,h,w*.4);c.clip();
    c.globalAlpha=.1;c.fillStyle='#fff';c.fillRect(x,y,w,h);
    [d/10,((d+5)%10)/10].forEach((p,i)=>{const a=Math.sin(Math.PI*(p*.9+.05)),r=w*(.26+.08*Math.sin(p*Math.PI*2+i)),cy=y+h-r-(h-2*r)*p,cx=x+w/2+Math.sin(p*Math.PI*2+i*2)*w*.08;
      const g=c.createRadialGradient(cx-r*.3,cy-r*.3,1,cx,cy,r*1.15);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.7,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');
      c.globalAlpha=Math.max(0,a);c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,r*1.05,r*(1.15-.2*Math.abs(Math.cos(p*Math.PI))),0,0,7);c.fill();});
    c.restore();c.globalAlpha=1;},
  ekg(c,ch,x,y,w,h){   // en hjärtmonitor: ett slag vandrar över rutan och lämnar ett svans som bleknar
    const d=+ch;if(!(d>=0))return;const mid=y+h*.6,head=x+w*(d+.5)/10,lw=Math.max(1.6,w*.07);
    const Y=t=>{const u=t-(head-w*.22);if(u<0||u>w*.22)return mid;const q=u/(w*.22);return q<.25?mid-h*.06*Math.sin(q/.25*Math.PI):q<.45?mid+h*.08*(q-.25)/.2:q<.6?mid-h*.5*(1-Math.abs(q-.55)/.06>0?1-Math.abs(q-.55)/.06:0)+h*.08*(1-(q-.45)/.15):q<.75?mid+h*.12*Math.sin((q-.6)/.15*Math.PI):mid;};
    c.lineWidth=lw;c.lineCap=c.lineJoin='round';c.strokeStyle='#fff';
    for(let s=0;s<w;s+=1){const t0=x+s,age=(head-t0+w)%w;c.globalAlpha=Math.max(.06,1-age/w);c.beginPath();c.moveTo(t0,Y(t0));c.lineTo(t0+1.2,Y(t0+1.2));c.stroke();}
    c.globalAlpha=1;c.beginPath();c.arc(head,Y(head),lw*1.1,0,7);c.fillStyle='#fff';c.fill();}
});
FONTS.eq={n:'Equalizer',css:null,pic:.5};FONTS.lava={n:'Lavalampa',css:null,pic:.42};FONTS.ekg={n:'Monitor',css:null,pic:.62};

// ================= Fler ytor för stillbildsurtavlor =================
const _drawBg2=drawBg;
drawBg=function(ctx,bg,photo){
  bg=bg||{};
  if(bg.t==='carbon'){ctx.fillStyle=bg.c2||'#0a0b0d';ctx.fillRect(0,0,DW,DH);const s=bg.s||8;   // vävd kolfiber: små rutor som växlar riktning
    for(let y=0;y<DH;y+=s)for(let x=0;x<DW;x+=s){const k=((x/s)+(y/s))%2,g=k?ctx.createLinearGradient(x,y,x+s,y):ctx.createLinearGradient(x,y,x,y+s);
      g.addColorStop(0,bg.c||'#24272d');g.addColorStop(.5,'#2a2e35');g.addColorStop(1,bg.c||'#24272d');ctx.fillStyle=g;ctx.fillRect(x+.5,y+.5,s-1,s-1);}
    const v=ctx.createRadialGradient(120,110,30,120,143,220);v.addColorStop(0,'rgba(255,255,255,.06)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,DW,DH);}
  else if(bg.t==='paper'){ctx.fillStyle=bg.c||'#efe9dc';ctx.fillRect(0,0,DW,DH);let s=11;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;   // papper: fint korn och mjuk skugga i kanten
    for(let i=0;i<5200;i++){ctx.fillStyle='rgba(0,0,0,'+(rnd()*.05).toFixed(3)+')';ctx.fillRect(rnd()*DW,rnd()*DH,1,1);}
    const v=ctx.createRadialGradient(120,143,90,120,143,200);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(60,40,10,.18)');ctx.fillStyle=v;ctx.fillRect(0,0,DW,DH);}
  else if(bg.t==='bloom'){ctx.fillStyle=bg.c3||'#05060b';ctx.fillRect(0,0,DW,DH);   // mörkt med två mjuka ljuskällor
    [[bg.x1||60,bg.y1||70,bg.c||'#7b5cff',170],[bg.x2||200,bg.y2||240,bg.c2||'#2ee6ff',150]].forEach(q=>{const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],q[3]);g.addColorStop(0,q[2]+'aa');g.addColorStop(1,q[2]+'00');ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);});}
  else _drawBg2(ctx,bg,photo);
};
