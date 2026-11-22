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

// ================= Naturytor: allt ritas av koden, inga foton =================
function _rng(seed){let s=seed||1;return()=>(s=(s*16807)%2147483647)/2147483647;}
function _noise(seed){const r=_rng(seed),N=64,g=[];for(let i=0;i<N*N;i++)g.push(r());
  const sm=t=>t*t*(3-2*t),at=(x,y)=>g[((y%N+N)%N)*N+((x%N+N)%N)];
  const v=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi);const a=at(xi,yi),b=at(xi+1,yi),c=at(xi,yi+1),d=at(xi+1,yi+1);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf;};
  return (x,y,o)=>{let s=0,amp=1,f=1,t=0;for(let k=0;k<(o||4);k++){s+=v(x*f,y*f)*amp;t+=amp;amp*=.5;f*=2;}return s/t;};}
function _hex(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
const _drawBg3=drawBg;
drawBg=function(ctx,bg,photo){
  bg=bg||{};
  if(bg.t==='moon'){ctx.fillStyle='#000';ctx.fillRect(0,0,DW,DH);const cx=bg.cx||120,cy=bg.cy||143,R=bg.r||104,nz=_noise(5);
    const im=ctx.getImageData(0,0,DW,DH),d=im.data;
    for(let y=0;y<DH;y++)for(let x=0;x<DW;x++){const dx=(x-cx)/R,dy=(y-cy)/R,q=dx*dx+dy*dy;if(q>1)continue;const z=Math.sqrt(1-q);
      const lit=.4+.6*Math.max(0,z*.85-dx*.3-dy*.18),m=nz(x/40,y/40,4),mt=Math.max(0,Math.min(1,(m-.38)/.16)),maria=.7+.3*mt,v=Math.min(255,(150+45*nz(x/9,y/9,3))*lit*maria*(q>.97?(1-q)*33:1));const i=(y*DW+x)*4;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}
    ctx.putImageData(im,0,0);const r=_rng(9);
    for(let k=0;k<14;k++){const a=r()*7,rr=Math.sqrt(r())*R*.85,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr,s=2+r()*7;ctx.beginPath();ctx.arc(x,y,s,0,7);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(x+.8,y+.8,s*.8,0,7);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fill();}}
  else if(bg.t==='ridges'){const g=ctx.createLinearGradient(0,0,0,DH);g.addColorStop(0,bg.c||'#d9c6aa');g.addColorStop(1,bg.c2||'#2a231c');ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);const nz=_noise(bg.seed||3),n=bg.n||6,top=_hex(bg.c||'#d9c6aa'),bot=_hex(bg.c3||'#1c1712');
    for(let k=0;k<n;k++){const f=k/(n-1),base=DH*(.32+.62*f),col=top.map((v,i)=>Math.round(v+(bot[i]-v)*(.25+.75*f)));ctx.beginPath();ctx.moveTo(0,DH);
      for(let x=0;x<=DW;x+=3)ctx.lineTo(x,base-28*(1-f*.4)*nz(x/60+k*3.1,k*1.7,4)*2+18);ctx.lineTo(DW,DH);ctx.closePath();ctx.fillStyle='rgb('+col+')';ctx.fill();
      const h=ctx.createLinearGradient(0,base-40,0,base+30);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(1,'rgba(255,255,255,'+(.08*(1-f))+')');ctx.fillStyle=h;ctx.fill();}}
  else if(bg.t==='contour'){ctx.fillStyle=bg.c2||'#000';ctx.fillRect(0,0,DW,DH);const nz=_noise(bg.seed||7),im=ctx.getImageData(0,0,DW,DH),d=im.data,lc=_hex(bg.c||'#ffffff'),k=bg.k||14;
    for(let y=0;y<DH;y++)for(let x=0;x<DW;x++){const v=nz(x/120,y/120,3)*k,fr=v-Math.floor(v),e=Math.min(fr,1-fr);if(e>.06)continue;const a=1-e/.06,i=(y*DW+x)*4;
      d[i]=d[i]+(lc[0]-d[i])*a*.9;d[i+1]=d[i+1]+(lc[1]-d[i+1])*a*.9;d[i+2]=d[i+2]+(lc[2]-d[i+2])*a*.9;}ctx.putImageData(im,0,0);}
  else if(bg.t==='smoke'){const nz=_noise(bg.seed||11),im=ctx.createImageData(DW,DH),d=im.data,a=_hex(bg.c||'#6fa8b4'),b=_hex(bg.c2||'#000000');
    for(let y=0;y<DH;y++)for(let x=0;x<DW;x++){const w=nz(x/80+nz(x/140,y/140,2)*3,y/60+x/200,5),t=Math.max(0,Math.min(1,(w-.42)*2.2)),r=Math.hypot(x-120,y-143)/170,f=t*(1-r*.6),i=(y*DW+x)*4;
      d[i]=b[0]+(a[0]-b[0])*f;d[i+1]=b[1]+(a[1]-b[1])*f;d[i+2]=b[2]+(a[2]-b[2])*f;d[i+3]=255;}ctx.putImageData(im,0,0);}
  else if(bg.t==='petals'){ctx.fillStyle=bg.c3||'#07040f';ctx.fillRect(0,0,DW,DH);const cx=120,cy=143,cols=bg.cols||['#2b56ff','#6b3bff','#2ee6ff'];
    for(let layer=0;layer<3;layer++){const n=8+layer*2,len=118-layer*30,w=34-layer*7;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+layer*.3;ctx.save();ctx.translate(cx,cy);ctx.rotate(a);
      const g=ctx.createLinearGradient(0,0,0,-len);g.addColorStop(0,'rgba(255,170,60,.9)');g.addColorStop(.25,cols[layer%cols.length]);g.addColorStop(1,cols[(layer+1)%cols.length]+'00');
      ctx.globalAlpha=.55;ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(w,-len*.35,w*.6,-len*.9,0,-len);ctx.bezierCurveTo(-w*.6,-len*.9,-w,-len*.35,0,0);ctx.fill();ctx.restore();}}
    ctx.globalAlpha=1;const c=ctx.createRadialGradient(cx,cy,0,cx,cy,26);c.addColorStop(0,'#fff3c4');c.addColorStop(.5,'#ffae3c');c.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=c;ctx.fillRect(0,0,DW,DH);}
  else if(bg.t==='satin'){const g=ctx.createLinearGradient(0,0,DW,DH);g.addColorStop(0,bg.c||'#2f63ff');g.addColorStop(1,bg.c2||'#0a1f7a');ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);
    for(let i=-4;i<10;i++){ctx.save();ctx.translate(i*46,0);ctx.transform(1,0,.55,1,0,0);const s=ctx.createLinearGradient(0,0,46,0);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.6,'rgba(255,255,255,.14)');s.addColorStop(1,'rgba(0,0,30,.22)');ctx.fillStyle=s;ctx.fillRect(0,0,46,DH);ctx.restore();}}
  else if(bg.t==='hills'){const g=ctx.createLinearGradient(0,0,0,DH);g.addColorStop(0,bg.c||'#0b2540');g.addColorStop(1,'#04101c');ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);const cols=bg.cols||['#1f6f7a','#24908f','#2fb3a3','#5fd1b8'];
    cols.forEach((c,k)=>{const base=DH*(.55+k*.1);ctx.beginPath();ctx.moveTo(0,DH);for(let x=0;x<=DW;x+=4)ctx.lineTo(x,base+Math.sin(x/38+k*1.9)*12+Math.sin(x/17+k)*4);ctx.lineTo(DW,DH);ctx.closePath();ctx.fillStyle=c;ctx.globalAlpha=.85;ctx.fill();});ctx.globalAlpha=1;}
  else if(bg.t==='streaks'){ctx.fillStyle='#050508';ctx.fillRect(0,0,DW,DH);const cols=bg.cols||['#ff3b3b','#ff9a2e','#ffe14a','#3ddc84','#2e9bff','#8a5cff'];ctx.lineCap='round';
    for(let i=0;i<30;i++){const c=cols[i%cols.length],o=i*7-40;ctx.strokeStyle=c;ctx.globalAlpha=.7;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(o,DH+10);ctx.bezierCurveTo(o+60,DH*.6,o+20,DH*.3,o+150,-20);ctx.stroke();}ctx.globalAlpha=1;
    const v=ctx.createLinearGradient(0,0,0,DH);v.addColorStop(0,'rgba(0,0,0,.85)');v.addColorStop(.45,'rgba(0,0,0,.15)');v.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=v;ctx.fillRect(0,0,DW,DH);}
  else _drawBg3(ctx,bg,photo);
};
const _drawDeco3=drawDeco;
drawDeco=function(ctx,d){
  if(d.k==='dotring'){const n=d.n||12,cols=d.cols||['#ff4d4d','#ff9a2e','#ffd84a','#5fe07a','#33c6ff','#7a7dff','#d06bff'];for(let i=0;i<n*5;i++){const a=i/(n*5)*Math.PI*2,big=i%5===0,r=d.r||104;
      ctx.beginPath();ctx.arc(120+Math.sin(a)*r,143-Math.cos(a)*r*1.12,big?4.2:1.8,0,7);ctx.fillStyle=cols[Math.floor(i/(n*5)*cols.length)];ctx.globalAlpha=big?1:.6;ctx.fill();}ctx.globalAlpha=1;return;}
  _drawDeco3(ctx,d);
};

// ================= Kollektionen: några ytor till =================
const _drawBg4=drawBg;
drawBg=function(ctx,bg,photo){
  bg=bg||{};
  if(bg.t==='marble'){const nz=_noise(bg.seed||31),im=ctx.createImageData(DW,DH),d=im.data,a=_hex(bg.c||'#f2efea'),v=_hex(bg.c2||'#8a8580');   // marmor: ljus sten med mörka ådror
    for(let y=0;y<DH;y++)for(let x=0;x<DW;x++){const t=Math.abs(Math.sin((x*.02+y*.035+nz(x/60,y/60,5)*7)));const f=Math.pow(1-t,6)*.85+nz(x/12,y/12,2)*.08,i=(y*DW+x)*4;
      d[i]=a[0]+(v[0]-a[0])*f;d[i+1]=a[1]+(v[1]-a[1])*f;d[i+2]=a[2]+(v[2]-a[2])*f;d[i+3]=255;}ctx.putImageData(im,0,0);}
  else if(bg.t==='velvet'){const nz=_noise(bg.seed||41),im=ctx.createImageData(DW,DH),d=im.data,a=_hex(bg.c||'#5a0f22'),b=_hex(bg.c2||'#12020a');   // sammet: mjukt ljus och fint flor
    for(let y=0;y<DH;y++)for(let x=0;x<DW;x++){const r=Math.hypot(x-(bg.lx||90),y-(bg.ly||90))/230,f=Math.max(0,Math.min(1,1-r+nz(x/30,y/30,3)*.25-.1)),i=(y*DW+x)*4;
      d[i]=b[0]+(a[0]-b[0])*f;d[i+1]=b[1]+(a[1]-b[1])*f;d[i+2]=b[2]+(a[2]-b[2])*f;d[i+3]=255;}ctx.putImageData(im,0,0);}
  else if(bg.t==='stars'){const g=ctx.createRadialGradient(150,100,10,120,143,240);g.addColorStop(0,bg.c||'#2a1a5a');g.addColorStop(1,bg.c2||'#02020a');ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);const r=_rng(bg.seed||5);   // stjärnhimmel med en svag nebulosa
    if(bg.neb){const n=ctx.createRadialGradient(80,200,0,80,200,140);n.addColorStop(0,bg.neb+'88');n.addColorStop(1,bg.neb+'00');ctx.fillStyle=n;ctx.fillRect(0,0,DW,DH);}
    for(let i=0;i<(bg.n||180);i++){const s=r()<.08?1.6:r()*.9+.3;ctx.globalAlpha=.3+r()*.7;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(r()*DW,r()*DH,s,0,7);ctx.fill();}ctx.globalAlpha=1;}
  else if(bg.t==='pixels'){ctx.fillStyle=bg.c2||'#05060a';ctx.fillRect(0,0,DW,DH);const r=_rng(bg.seed||13),s=bg.s||12,cols=bg.cols||['#ff3b6b','#ffb02e','#3ddc84','#2e9bff','#a35cff'];   // pixlar som tonar uppåt
    for(let y=0;y<DH;y+=s)for(let x=0;x<DW;x+=s){if(r()>(y/DH)*.9)continue;ctx.globalAlpha=.25+.6*(y/DH)*r();ctx.fillStyle=cols[Math.floor(r()*cols.length)];ctx.fillRect(x+1,y+1,s-2,s-2);}ctx.globalAlpha=1;}
  else if(bg.t==='rain'){ctx.fillStyle='#000';ctx.fillRect(0,0,DW,DH);const r=_rng(bg.seed||17),c=bg.c||'#3dff7a';ctx.font='bold 11px monospace';ctx.textAlign='center';   // stillastående teckenregn
    for(let x=6;x<DW;x+=12){const len=6+Math.floor(r()*18),top=Math.floor(r()*24)*12-60;for(let k=0;k<len;k++){ctx.globalAlpha=k===len-1?1:.12+.6*(k/len);ctx.fillStyle=k===len-1?'#eafff0':c;ctx.fillText(String.fromCharCode(0x30+Math.floor(r()*10)),x,top+k*12);}}ctx.globalAlpha=1;}
  else if(bg.t==='halo'){ctx.fillStyle=bg.c2||'#000';ctx.fillRect(0,0,DW,DH);const c=bg.c||'#2ee6ff',R=bg.r||92;   // en ring av ljus
    for(let k=6;k>=0;k--){ctx.beginPath();ctx.arc(120,143,R,0,7);ctx.strokeStyle=c;ctx.globalAlpha=k?.06:1;ctx.lineWidth=k?k*6:2.5;ctx.stroke();}ctx.globalAlpha=1;}
  else if(bg.t==='prism'){const n=bg.n||14,cols=bg.cols||['#ff5f6d','#ffc371','#7bf1a8','#4facfe','#a18cd1'];   // kilar i glasfärger runt mitten
    ctx.fillStyle='#000';ctx.fillRect(0,0,DW,DH);for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2;ctx.beginPath();ctx.moveTo(120,143);ctx.arc(120,143,260,a0,a1);ctx.closePath();
      const g=ctx.createLinearGradient(120,143,120+Math.cos(a0)*200,143+Math.sin(a0)*200);g.addColorStop(0,'#000');g.addColorStop(1,cols[i%cols.length]);ctx.fillStyle=g;ctx.globalAlpha=.85;ctx.fill();}ctx.globalAlpha=1;}
  else if(bg.t==='silk'){const g=ctx.createLinearGradient(0,0,DW,DH);g.addColorStop(0,bg.c||'#f3e3c3');g.addColorStop(1,bg.c2||'#b48a52');ctx.fillStyle=g;ctx.fillRect(0,0,DW,DH);   // veckat siden
    for(let k=0;k<7;k++){ctx.beginPath();ctx.moveTo(-20,40+k*40);ctx.bezierCurveTo(80,k*40-30,150,120+k*30,260,60+k*38);ctx.lineTo(260,DH+40);ctx.lineTo(-20,DH+40);ctx.closePath();ctx.fillStyle=k%2?'rgba(255,255,255,.07)':'rgba(0,0,0,.08)';ctx.fill();}}
  else _drawBg4(ctx,bg,photo);
};

// ================= Kontursiffror, ihåliga visare, prickfält och virvel =================
Object.assign(PICFONT,{
  outline(c,ch,x,y,w,h){const col=c.fillStyle;c.save();c.font='700 '+Math.round(h*1.02)+'px PoppinsApp';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(1.6,h*.05);c.strokeStyle=col;c.strokeText(ch,x+w/2,y+h*.56);c.restore();}
});
FONTS.outline={n:'Kontur',css:null,pic:.7};
Object.assign(HANDPIC,{
  hollow(len,tail,w,col,hub){const W=Math.max(14,Math.round(w)+8),{cv,c,m}=hpCanvas(W,len,8),hw=Math.max(2.6,w/2);   // ihålig visare: bara konturen, och ett glapp mot mitten
    c.lineWidth=1.8;c.strokeStyle=col;c.beginPath();c.roundRect(m-hw,4,hw*2,len-22,hw);c.stroke();c.beginPath();c.moveTo(m,len-18);c.lineTo(m,len-4);c.stroke();
    c.beginPath();c.arc(m,len,3.4,0,7);c.stroke();return cv;}
});
const _drawBg5=drawBg;
drawBg=function(ctx,bg,photo){
  bg=bg||{};
  if(bg.t==='dotfield'){ctx.fillStyle=bg.c2||'#050505';ctx.fillRect(0,0,DW,DH);const cols=bg.cols||['#2ee6c0','#ffd84a','#ff6a6a','#2ee6c0'],rings=bg.rings||8,r0=bg.r0||90;   // ringar av prickar som blir mindre utåt
    for(let k=0;k<rings;k++){const r=r0+k*9,n=Math.round(r*.62),s=Math.max(.8,3.4-k*.36);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(k%2)*Math.PI/n;
      ctx.beginPath();ctx.arc(120+Math.cos(a)*r,143+Math.sin(a)*r*1.08,s,0,7);ctx.fillStyle=cols[k%cols.length];ctx.globalAlpha=(bg.dim||1)*(1-k/(rings+1.5));ctx.fill();}}ctx.globalAlpha=1;}
  else if(bg.t==='spiral'){ctx.fillStyle='#000';ctx.fillRect(0,0,DW,DH);const a=_hex(bg.c||'#2ee6a0'),b=_hex(bg.c2||'#2e6bff'),arms=bg.arms||34,steps=bg.steps||16;   // prickar i en virvel från ett tomt centrum
    for(let j=0;j<arms;j++)for(let k=0;k<steps;k++){const t=k/(steps-1),r=56+t*58,ang=j/arms*Math.PI*2+t*1.4,x=120+Math.cos(ang)*r,y=143+Math.sin(ang)*r*1.12,f=(Math.sin(ang)+1)/2;
      ctx.beginPath();ctx.arc(x,y,1.2+t*3.3,0,7);ctx.fillStyle='rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*f))+')';ctx.globalAlpha=.35+.65*t;ctx.fill();}ctx.globalAlpha=1;}
  else _drawBg5(ctx,bg,photo);
};

// ================= Ikoner av prickar, i samma språk som prickfältet =================
// Ikonen ritas först som vanligt i en liten bild, sedan läses den av i ett rutnät och ritas om som prickar.
const _drawDeco4=drawDeco;
drawDeco=function(ctx,d){
  if(d.k==='doticon'&&ICONS[d.n]){const S=d.s||20,g=d.g||7,cv=mk(S,S),c=ctxOf(cv);c.fillStyle='#fff';ICONS[d.n](c,S);const px=c.getImageData(0,0,S,S).data,step=S/g;
    for(let j=0;j<g;j++)for(let i=0;i<g;i++){const x=Math.floor((i+.5)*step),y=Math.floor((j+.5)*step),a=px[(y*S+x)*4+3];if(a<90)continue;
      ctx.beginPath();ctx.arc(d.x-S/2+(i+.5)*step,d.y+(j+.5)*step,step*.4,0,7);ctx.fillStyle=Array.isArray(d.c)?d.c[(i+j)%d.c.length]:d.c;ctx.fill();}return;}
  _drawDeco4(ctx,d);
};
// Ett batteri av prickar: fylls kolumn för kolumn och går från rött via gult till grönt. Klockan väljer bild efter nivån.
BATTPIC.dotcell=function(e){const cols=8,rows=4,d=e.d||5,w=cols*d+d+2,h=rows*d+2,out=[];
  for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),fill=Math.round(lv/6*cols),col=lv<=1?'#ff5a5a':lv<=3?'#ffc83a':'#3ddc84';
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){c.beginPath();c.arc(1+d/2+i*d,1+d/2+j*d,d*.38,0,7);c.fillStyle=i<fill?col:'rgba(255,255,255,.16)';c.fill();}
    c.fillStyle='rgba(255,255,255,.4)';c.fillRect(w-d+1,1+d,d*.5,d*2);out.push(cv);}
  return out;};

// ================= Klippta färgformer: egen konst bakom visarna =================
const _drawBg6=drawBg;
drawBg=function(ctx,bg,photo){
  bg=bg||{};
  if(bg.t==='cutout'){ctx.fillStyle=bg.c||'#1a1a2e';ctx.fillRect(0,0,DW,DH);const cols=bg.cols||['#ff6b4a','#ffd23f','#3a86ff','#8338ec','#06d6a0'],r=_rng(bg.seed||3);
    ctx.save();ctx.beginPath();ctx.roundRect(14,18,212,250,40);ctx.clip();
    for(let i=0;i<9;i++){ctx.fillStyle=cols[i%cols.length];ctx.globalAlpha=.92;ctx.beginPath();const x=r()*240,y=r()*286,w=60+r()*110,a=r()*Math.PI;
      if(i%3===0){ctx.arc(x,y,w*.5,0,7);}else if(i%3===1){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.roundRect(-w/2,-w*.22,w,w*.44,w*.22);ctx.restore();}
      else{ctx.moveTo(x,y);ctx.arc(x,y,w*.7,a,a+Math.PI*.5);ctx.closePath();}ctx.fill();}
    ctx.restore();ctx.globalAlpha=1;}
  else _drawBg6(ctx,bg,photo);
};
