// ================= Visare som är saker, figurer med armar, och fler batteri- och väderbilder =================
// Flera former ritas som en enda figur med en gemensam kontur: först alla konturer, sedan alla fyllningar ovanpå.
function U(c,fill,lw,shapes){
  c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=(lw||2.2)*2;
  shapes.forEach(p=>{c.beginPath();p();c.stroke();});c.fillStyle=fill;shapes.forEach(p=>{c.beginPath();p();c.fill();});
}
const R_=(c,x,y,w,h,r)=>()=>{const q=Math.min(r,w/2,h/2);c.moveTo(x+q,y);c.arcTo(x+w,y,x+w,y+h,q);c.arcTo(x+w,y+h,x,y+h,q);c.arcTo(x,y+h,x,y,q);c.arcTo(x,y,x+w,y,q);c.closePath();};
const C_=(c,x,y,r)=>()=>{c.moveTo(x+r,y);c.arc(x,y,r,0,Math.PI*2);};
const E_=(c,x,y,rx,ry,rot)=>()=>{c.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);};
const P_=(c,pts)=>()=>{pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();};
function hpCanvas(W,len,tail){const w=Math.ceil(W/2)*2,cv=mk(w,Math.round(len+Math.min(20,tail)));return {cv:cv,c:ctxOf(cv),m:w/2};}

// Varje visare pekar rakt upp. Vridpunkten ligger på (bredd/2, len), och bilden slutar högst 20 bildpunkter under den.
const HANDPIC={
  fork(len,tail,w,col){const {cv,c,m}=hpCanvas(26,len,12);
    U(c,col||'#dfe4ec',2,[R_(c,m-3.5,len*.5,7,len*.5+9,3.5),R_(c,m-2.6,len*.33,5.2,len*.2,2),R_(c,m-9.5,len*.19,19,len*.17,6),R_(c,m-9.5,3,4.6,len*.25,2.2),R_(c,m-2.3,3,4.6,len*.25,2.2),R_(c,m+4.9,3,4.6,len*.25,2.2)]);
    c.fillStyle='rgba(255,255,255,.55)';c.fillRect(m-1.6,len*.56,1.6,len*.36);return cv;},
  knife(len,tail,w,col,hub,tip){const {cv,c,m}=hpCanvas(24,len,12);
    U(c,col||'#dfe4ec',2,[()=>{c.moveTo(m-4.5,len*.58);c.lineTo(m-4.5,16);c.quadraticCurveTo(m-4.5,3,m+5,3);c.lineTo(m+5,len*.58);c.closePath();}]);
    U(c,tip||'#3a2a20',2,[R_(c,m-4.5,len*.56,9,len*.44+9,4.5)]);
    c.fillStyle='rgba(255,255,255,.6)';c.fillRect(m+1.2,10,1.8,len*.44);c.fillStyle='#c9a25a';[.66,.8,.94].forEach(t=>{c.beginPath();c.arc(m,len*t,1.4,0,7);c.fill();});return cv;},
  blade(len,tail,w,col,hub,tip){const {cv,c,m}=hpCanvas(30,len,20);
    c.lineWidth=8.4;c.strokeStyle=INK;c.beginPath();c.arc(m,len+11,6,0,7);c.stroke();c.lineWidth=4.2;c.strokeStyle=tip||'#ff5a5f';c.stroke();
    U(c,col||'#dfe4ec',2,[()=>{c.moveTo(m-6,len+3);c.lineTo(m-4.5,len*.3);c.quadraticCurveTo(m-3,6,m+1,2);c.lineTo(m+6.5,len+3);c.closePath();}]);
    c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.moveTo(m+3,len-6);c.lineTo(m+1.5,12);c.lineTo(m+4.6,len*.5);c.closePath();c.fill();
    c.beginPath();c.arc(m,len,3.2,0,7);c.fillStyle='#8892a4';c.fill();c.lineWidth=1.4;c.strokeStyle=INK;c.stroke();return cv;},
  mustache(len,tail,w,col){const {cv,c,m}=hpCanvas(60,len,10);
    U(c,col||'#3a2416',2.2,[()=>{c.moveTo(m-7,len+7);c.bezierCurveTo(m-12,len*.72,m-22,len*.5,m-17,len*.26);c.bezierCurveTo(m-14,len*.1,m-2,4,m+8,10);
      c.bezierCurveTo(m+15,15,m+13,26,m+6,25);c.bezierCurveTo(m+9,19,m+2,15,m-3,22);c.bezierCurveTo(m-9,32,m+3,len*.6,m+8,len+7);c.closePath();}]);
    c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(m-9,len*.7);c.quadraticCurveTo(m-15,len*.45,m-9,len*.24);c.stroke();return cv;},
  katana(len,tail,w,col,hub,tip){const {cv,c,m}=hpCanvas(26,len,14);
    U(c,col||'#e6ebf2',2,[()=>{c.moveTo(m-3.2,len*.76);c.quadraticCurveTo(m-5,len*.3,m+5,3);c.quadraticCurveTo(m+4,len*.36,m+3.4,len*.76);c.closePath();}]);
    c.strokeStyle='rgba(120,140,170,.7)';c.lineWidth=1.2;c.beginPath();c.moveTo(m,len*.72);c.quadraticCurveTo(m-1,len*.32,m+3.6,10);c.stroke();
    U(c,tip||'#20222c',2,[R_(c,m-3.4,len*.8,6.8,len*.2+11,3)]);U(c,'#d6ae60',1.8,[E_(c,m,len*.78,8,3.2)]);
    c.strokeStyle='#d6ae60';c.lineWidth=1.3;for(let y=len*.86;y<len+8;y+=5){c.beginPath();c.moveTo(m-3,y);c.lineTo(m+3,y+3);c.stroke();}return cv;},
  wand(len,tail,w,col,hub,tip){const {cv,c,m}=hpCanvas(30,len,10);
    U(c,col||'#5a3a22',2,[R_(c,m-2.4,14,4.8,len-14+8,2.4)]);c.fillStyle='#f4f4f0';c.fillRect(m-2.4,16,4.8,7);
    const st=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?5:11.5;st.push([m+r*Math.cos(a),13+r*Math.sin(a)]);}
    U(c,tip||'#ffd23f',1.8,[P_(c,st)]);c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.arc(m-2.5,10,1.8,0,7);c.fill();return cv;},
  taktpinne(len,tail,w,col){const {cv,c,m}=hpCanvas(18,len,10);
    U(c,col||'#fbfbf6',1.8,[R_(c,m-1.6,2,3.2,len-8,1.6)]);U(c,'#d9b38c',2,[E_(c,m,len-3,4.6,10)]);return cv;},
  finger(len,tail,w,col,hub,tip){const ww=w||12,{cv,c,m}=hpCanvas(ww+12,len,ww/2+4);
    U(c,col||'#20222c',2.2,[R_(c,m-ww/2,len*.3,ww,len*.7+ww/2,ww/2)]);
    U(c,tip||'#ffffff',2,[R_(c,m-ww*.62,len*.13,ww*1.24,len*.2,ww*.5),R_(c,m-2.7,2,5.4,len*.2,2.7),E_(c,m+ww*.62,len*.25,3.2,5.4,-.5)]);
    c.fillStyle='rgba(0,0,0,.14)';c.fillRect(m-ww/2,len*.31,ww,3);return cv;},
  glove(len,tail,w,col,hub,tip){const ww=w||13,{cv,c,m}=hpCanvas(34,len,ww/2+4);
    U(c,col||'#ffd23f',2.2,[R_(c,m-ww/2,len*.3,ww,len*.7+ww/2,ww/2)]);
    U(c,tip||'#ffffff',2.2,[R_(c,m-12,3,24,len*.3,9),E_(c,m+13,len*.2,4.4,8,-.3)]);
    c.strokeStyle=INK;c.lineWidth=1.6;c.lineCap='round';[-5.5,0,5.5].forEach(d=>{c.beginPath();c.moveTo(m+d,6);c.lineTo(m+d,len*.14);c.stroke();});
    c.fillStyle='#ff5a5f';c.fillRect(m-11,len*.25,22,4);return cv;},
  cactus(len,tail,w,col,hub,tip){const {cv,c,m}=hpCanvas(34,len,10);
    U(c,col||'#3fae5a',2.4,[R_(c,m-8.5,9,17,len-9+9,8.5)]);
    c.strokeStyle='rgba(20,80,40,.55)';c.lineWidth=1.4;c.beginPath();c.moveTo(m,16);c.lineTo(m,len+4);c.stroke();
    c.strokeStyle='#f4f4e0';c.lineWidth=1.3;c.lineCap='round';for(let y=22;y<len;y+=13){[-1,1].forEach(sd=>{c.beginPath();c.moveTo(m+sd*8,y);c.lineTo(m+sd*12.5,y-3);c.stroke();});}
    for(let i=0;i<5;i++){const a=i*2*Math.PI/5-Math.PI/2;c.beginPath();c.arc(m+5*Math.cos(a),8+5*Math.sin(a),3.6,0,7);c.fillStyle=tip||'#ff6f91';c.fill();c.lineWidth=1.2;c.strokeStyle=INK;c.stroke();}
    c.beginPath();c.arc(m,8,2.6,0,7);c.fillStyle='#ffe14a';c.fill();return cv;},
  twig(len,tail,w,col){const {cv,c,m}=hpCanvas(30,len,10);
    const draw=()=>{c.beginPath();c.moveTo(m,len+7);c.lineTo(m,10);c.moveTo(m,len*.34);c.lineTo(m-10,6);c.moveTo(m,len*.24);c.lineTo(m+10,4);c.moveTo(m,len*.6);c.lineTo(m+7,len*.47);};
    c.lineCap='round';c.lineJoin='round';draw();c.lineWidth=8;c.strokeStyle=INK;c.stroke();draw();c.lineWidth=4;c.strokeStyle=col||'#7a4e2a';c.stroke();return cv;},
  drumstick(len,tail,w,col){const {cv,c,m}=hpCanvas(18,len,12);
    U(c,col||'#e8c48a',2,[R_(c,m-2.6,12,5.2,len-12+10,2.6),E_(c,m,8,4.6,6.4)]);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(m-1.6,18,1.4,len*.6);return cv;},
  wrench(len,tail,w,col){const {cv,c,m}=hpCanvas(30,len,12);
    U(c,col||'#c2cad6',2.2,[R_(c,m-4.6,len*.28,9.2,len*.72+9,4.6),R_(c,m-12.5,len*.1,25,len*.2,8),R_(c,m-12.5,2,8,len*.2,3),R_(c,m+4.5,2,8,len*.2,3)]);
    c.fillStyle='rgba(255,255,255,.5)';c.fillRect(m-2,len*.36,1.8,len*.5);c.beginPath();c.arc(m,len+2,1.8,0,7);c.fillStyle=INK;c.fill();return cv;},
  screwdriver(len,tail,w,col,hub,tip){const {cv,c,m}=hpCanvas(22,len,12);
    U(c,'#c2cad6',2,[R_(c,m-2,11,4,len*.46,1.5),P_(c,[[m-3.6,2],[m+3.6,2],[m+2,13],[m-2,13]]),R_(c,m-4.2,len*.44,8.4,8,2)]);
    U(c,col||'#ff5a5f',2.2,[R_(c,m-7,len*.5,14,len*.5+9,6.5)]);c.fillStyle=tip||'#ffd23f';c.fillRect(m-7,len*.62,14,6);
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.4;[-3,0,3].forEach(d=>{c.beginPath();c.moveTo(m+d,len*.74);c.lineTo(m+d,len+3);c.stroke();});return cv;}
};

// ---------- figurer och bakgrunder, ritade här ----------
function tnote(c,x,y,s,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,s*.62,s*.46,-.4,0,7);c.fill();c.fillRect(x+s*.42,y-s*2,s*.22,s*2);c.beginPath();c.moveTo(x+s*.42,y-s*2);c.quadraticCurveTo(x+s*1.5,y-s*1.7,x+s*1.2,y-s*.9);c.quadraticCurveTo(x+s*1.1,y-s*1.4,x+s*.64,y-s*1.5);c.closePath();c.fill();}
Object.assign(TOONS,{
  conductor(c){   // dirigent i frack
    [[34,60,7],[202,84,6],[26,196,6],[212,208,7]].forEach(q=>tnote(c,q[0],q[1],q[2],'rgba(255,255,255,.5)'));
    c.save();c.globalAlpha=.2;c.fillStyle='#000';ell(c,120,264,62,8);c.fill();c.restore();
    U(c,'#20222c',2.8,[R_(c,96,222,20,40,7),R_(c,124,222,20,40,7)]);U(c,'#0f1016',2.4,[E_(c,104,262,15,6),E_(c,136,262,15,6)]);
    U(c,'#20222c',3,[()=>{c.moveTo(76,146);c.quadraticCurveTo(120,112,164,146);c.lineTo(172,232);c.lineTo(140,246);c.lineTo(120,226);c.lineTo(100,246);c.lineTo(68,232);c.closePath();}]);
    U(c,'#ffffff',2,[P_(c,[[104,128],[136,128],[124,196],[116,196]])]);U(c,'#d8302e',2,[P_(c,[[120,134],[106,126],[106,142]]),P_(c,[[120,134],[134,126],[134,142]]),C_(c,120,134,3.6)]);
    [158,172,186].forEach(y=>{c.beginPath();c.arc(120,y,2,0,7);c.fillStyle=INK;c.fill();});
    U(c,'#c9c9d2',2.6,[C_(c,90,74,13),C_(c,150,74,13),C_(c,100,56,13),C_(c,140,56,13),C_(c,120,50,14)]);
    U(c,'#ffd2a8',3,[E_(c,120,88,29,28)]);
    c.strokeStyle=INK;c.lineWidth=2.6;c.lineCap='round';[[108,86],[132,86]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],6,Math.PI*1.1,Math.PI*1.9);c.stroke();});
    toonSmile(c,120,100,9,8,2.6);cheeks(c,120,98,19,4.5);
  },
  plate(c){   // rutig duk och en tallrik
    c.fillStyle='#f6f1e6';c.fillRect(0,0,240,286);for(let y=-6;y<286;y+=44)for(let x=-6;x<240;x+=44){c.fillStyle='rgba(216,48,46,.28)';c.fillRect(x,y,22,286);}
    for(let y=-6;y<286;y+=44){c.fillStyle='rgba(216,48,46,.28)';c.fillRect(0,y,240,22);}
    c.save();c.globalAlpha=.22;c.fillStyle='#000';circ(c,123,149,100);c.fill();c.restore();
    circ(c,120,143,98);ol(c,'#ffffff',3);circ(c,120,143,72);c.lineWidth=2;c.strokeStyle='#d8dbe2';c.stroke();
    circ(c,120,143,96);c.lineWidth=3;c.strokeStyle='#4ea1ff';c.setLineDash([2,9]);c.stroke();c.setLineDash([]);
  },
  cutmat(c){   // skärmatta med rutnät och en streckad linje att klippa efter
    c.fillStyle='#1f7a5a';c.fillRect(0,0,240,286);c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=1;
    for(let x=0;x<=240;x+=20){c.beginPath();c.moveTo(x+.5,0);c.lineTo(x+.5,286);c.stroke();}for(let y=3;y<=286;y+=20){c.beginPath();c.moveTo(0,y+.5);c.lineTo(240,y+.5);c.stroke();}
    c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1.4;[[120,0,120,286],[0,143,240,143]].forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[2],q[3]);c.stroke();});
    circ(c,120,143,104);c.lineWidth=2.2;c.strokeStyle='#ffffff';c.setLineDash([9,7]);c.stroke();c.setLineDash([]);
    for(let k=0;k<12;k++){const a=k*Math.PI/6-Math.PI/2;c.beginPath();c.moveTo(120+98*Math.cos(a),143+98*Math.sin(a));c.lineTo(120+110*Math.cos(a),143+110*Math.sin(a));c.lineWidth=3;c.strokeStyle='#ffe14a';c.setLineDash([]);c.stroke();}
  },
  gent(c){   // herre med hatt och monokel. Mustaschen är visarna.
    U(c,'#ffd2a8',2.6,[E_(c,48,136,10,15),E_(c,192,136,10,15)]);U(c,'#ffd2a8',3.2,[E_(c,120,138,72,80)]);
    U(c,'#20222c',3,[R_(c,36,62,168,18,9)]);U(c,'#20222c',3,[()=>{c.moveTo(64,66);c.quadraticCurveTo(62,8,120,8);c.quadraticCurveTo(178,8,176,66);c.closePath();}]);c.fillStyle='#d8302e';c.fillRect(65,52,110,10);
    toonEye(c,94,112,11,1,1);toonEye(c,146,112,11,-1,1);
    circ(c,146,112,18);c.lineWidth=6.5;c.strokeStyle=INK;c.stroke();c.lineWidth=3;c.strokeStyle='#d6ae60';c.stroke();
    c.beginPath();c.moveTo(162,122);c.quadraticCurveTo(196,160,180,206);c.lineWidth=2;c.strokeStyle='#d6ae60';c.setLineDash([3,3]);c.stroke();c.setLineDash([]);
    c.strokeStyle=INK;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(80,94);c.lineTo(106,90);c.moveTo(134,88);c.lineTo(160,90);c.stroke();
    U(c,'#ffbf94',2.4,[E_(c,120,134,9,12)]);cheeks(c,120,150,50,8);
    c.beginPath();c.arc(120,176,13,.15*Math.PI,.85*Math.PI);c.lineWidth=2.8;c.strokeStyle=INK;c.stroke();
    U(c,'#d8302e',2.6,[P_(c,[[120,244],[88,228],[88,260]]),P_(c,[[120,244],[152,228],[152,260]]),C_(c,120,244,7)]);
  },
  ninja(c){   // ninja i natten
    c.fillStyle='#fff3c4';circ(c,188,62,34);c.fill();c.fillStyle='rgba(0,0,0,.08)';[[176,52,7],[198,72,5],[196,46,4]].forEach(q=>{circ(c,q[0],q[1],q[2]);c.fill();});
    c.save();c.globalAlpha=.25;c.fillStyle='#000';ell(c,120,266,60,8);c.fill();c.restore();
    U(c,'#1a1c28',2.8,[R_(c,94,224,22,40,8),R_(c,124,224,22,40,8)]);
    U(c,'#23263a',3,[()=>{c.moveTo(72,150);c.quadraticCurveTo(120,112,168,150);c.lineTo(162,234);c.quadraticCurveTo(120,250,78,234);c.closePath();}]);
    c.fillStyle='#d8302e';c.fillRect(76,206,88,11);U(c,'#d8302e',2,[P_(c,[[112,206],[100,236],[112,232],[118,217]])]);
    c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=2;c.beginPath();c.moveTo(120,132);c.lineTo(100,200);c.moveTo(120,132);c.lineTo(140,200);c.stroke();
    U(c,'#d8302e',2.2,[P_(c,[[150,74],[186,60],[182,72],[196,78],[152,86]])]);
    U(c,'#1a1c28',3,[E_(c,120,88,36,33)]);U(c,'#ffd2a8',2.2,[R_(c,90,78,60,20,10)]);c.fillStyle='#d8302e';c.fillRect(85,64,70,9);
    [[106,88],[134,88]].forEach(p=>{c.beginPath();c.ellipse(p[0],p[1],5,6.5,0,0,7);c.fillStyle=INK;c.fill();c.beginPath();c.arc(p[0]-1.5,p[1]-2,1.6,0,7);c.fillStyle='#fff';c.fill();});
    c.strokeStyle=INK;c.lineWidth=2.6;c.lineCap='round';c.beginPath();c.moveTo(97,80);c.lineTo(113,84);c.moveTo(143,80);c.lineTo(127,84);c.stroke();
  },
  wizard(c){   // trollkarl med hatt och skägg
    [[30,44],[206,36],[24,150],[214,160],[44,236],[200,246],[70,20],[168,16]].forEach((p,i)=>{c.fillStyle='rgba(255,236,160,'+(.5+(i%3)*.2)+')';circ(c,p[0],p[1],1.6+(i%3)*.7);c.fill();});
    c.save();c.globalAlpha=.25;c.fillStyle='#000';ell(c,120,268,70,8);c.fill();c.restore();
    U(c,'#5b3fc4',3,[()=>{c.moveTo(86,140);c.quadraticCurveTo(120,118,154,140);c.lineTo(176,262);c.quadraticCurveTo(120,276,64,262);c.closePath();}]);
    [[94,214],[146,228],[112,250],[138,188]].forEach(p=>{const st=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?2.6:6;st.push([p[0]+r*Math.cos(a),p[1]+r*Math.sin(a)]);}c.beginPath();P_(c,st)();c.fillStyle='#ffd23f';c.fill();});
    U(c,'#ffd2a8',2.8,[E_(c,120,100,26,24)]);toonEye(c,110,96,7,1,0);toonEye(c,130,96,7,-1,0);U(c,'#ffbf94',2,[E_(c,120,106,5,6)]);
    U(c,'#f4f4f0',2.8,[()=>{c.moveTo(94,104);c.quadraticCurveTo(92,150,120,196);c.quadraticCurveTo(148,150,146,104);c.quadraticCurveTo(134,122,120,112);c.quadraticCurveTo(106,122,94,104);c.closePath();}]);
    U(c,'#5b3fc4',3,[()=>{c.moveTo(82,84);c.quadraticCurveTo(108,50,132,6);c.quadraticCurveTo(150,50,158,84);c.closePath();},E_(c,120,84,48,10)]);
    c.fillStyle='#ffd23f';c.fillRect(92,70,58,7);const st=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3:7;st.push([128+r*Math.cos(a),44+r*Math.sin(a)]);}c.beginPath();P_(c,st)();c.fill();
  },
  keeper(c){   // målvakt framför nätet
    c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=1.4;for(let x=14;x<240;x+=22){c.beginPath();c.moveTo(x,36);c.lineTo(x,226);c.stroke();}for(let y=36;y<=226;y+=21){c.beginPath();c.moveTo(8,y);c.lineTo(232,y);c.stroke();}
    c.lineWidth=7;c.strokeStyle='#ffffff';c.lineJoin='round';c.beginPath();c.moveTo(8,230);c.lineTo(8,36);c.lineTo(232,36);c.lineTo(232,230);c.stroke();
    c.fillStyle='#3fae5a';c.fillRect(0,228,240,58);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(0,228,240,3);
    U(c,'#ffd2a8',2.6,[R_(c,98,232,16,30,6),R_(c,126,232,16,30,6)]);U(c,'#20222c',2.4,[E_(c,104,264,15,6.5),E_(c,136,264,15,6.5)]);
    U(c,'#20222c',2.8,[R_(c,88,208,64,34,10)]);
    U(c,'#ff8a3c',3,[()=>{c.moveTo(76,148);c.quadraticCurveTo(120,116,164,148);c.lineTo(158,220);c.lineTo(82,220);c.closePath();}]);
    text(c,'1',120,166,34,'pb','#ffffff','c',0);
    U(c,'#ffd2a8',3,[E_(c,120,92,29,27)]);U(c,'#7a4e2a',2.6,[()=>{c.moveTo(91,90);c.quadraticCurveTo(90,58,120,60);c.quadraticCurveTo(150,58,149,90);c.quadraticCurveTo(136,74,120,76);c.quadraticCurveTo(104,74,91,90);c.closePath();}]);
    toonEye(c,109,94,7,0,-1);toonEye(c,131,94,7,0,-1);toonSmile(c,120,106,8,6,2.4);
  },
  cactus(c){   // kaktus i kruka. Armarna är visarna.
    c.fillStyle='#ffd23f';circ(c,198,52,26);c.fill();c.fillStyle='#e8c98a';c.beginPath();c.moveTo(0,232);c.quadraticCurveTo(70,214,140,230);c.quadraticCurveTo(200,244,240,226);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fill();
    U(c,'#3fae5a',3.2,[R_(c,86,56,68,196,34)]);
    c.strokeStyle='rgba(20,80,40,.5)';c.lineWidth=2;[104,120,136].forEach(x=>{c.beginPath();c.moveTo(x,70);c.lineTo(x,236);c.stroke();});
    c.strokeStyle='#f4f4e0';c.lineWidth=1.6;c.lineCap='round';for(let y=76;y<230;y+=22){[[88,-1],[152,1]].forEach(q=>{c.beginPath();c.moveTo(q[0],y);c.lineTo(q[0]+q[1]*7,y-4);c.stroke();});}
    toonEye(c,107,98,9,0,1);toonEye(c,133,98,9,0,1);toonSmile(c,120,116,10,8,2.6);cheeks(c,120,112,24,5);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;circ(c,120+9*Math.cos(a),50+9*Math.sin(a),7);ol(c,'#ff6f91',2);}circ(c,120,50,6);ol(c,'#ffe14a',2);
    U(c,'#d9703a',3,[P_(c,[[76,236],[164,236],[154,280],[86,280]])]);U(c,'#e8854a',2.6,[R_(c,70,226,100,16,6)]);
  },
  snowman(c){   // snögubbe med pinnar som armar
    c.fillStyle='#eef4ff';c.beginPath();c.moveTo(0,250);c.quadraticCurveTo(120,232,240,250);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fill();
    U(c,'#ffffff',3.2,[E_(c,120,224,62,48)]);U(c,'#ffffff',3.2,[E_(c,120,150,46,42)]);U(c,'#ffffff',3.2,[E_(c,120,86,33,31)]);
    c.fillStyle='rgba(120,160,220,.18)';ell(c,138,236,34,30);c.fill();ell(c,134,158,24,24);c.fill();
    [176,200,224].forEach(y=>{circ(c,120,y,4.4);c.fillStyle=INK;c.fill();});
    U(c,'#d8302e',2.6,[R_(c,90,108,60,14,7),P_(c,[[138,116],[156,150],[142,154],[130,120]])]);
    circ(c,108,80,4.4);c.fillStyle=INK;c.fill();circ(c,132,80,4.4);c.fill();[[104,98],[112,103],[120,105],[128,103],[136,98]].forEach(p=>{circ(c,p[0],p[1],2.4);c.fill();});
    U(c,'#ff8a3c',2,[P_(c,[[120,86],[120,95],[150,92]])]);
    U(c,'#20222c',3,[R_(c,98,22,44,38,5),R_(c,84,56,72,10,5)]);c.fillStyle='#d8302e';c.fillRect(99,46,42,8);
  },
  drum(c){   // trumma sedd uppifrån
    c.save();c.globalAlpha=.28;c.fillStyle='#000';circ(c,124,150,108);c.fill();c.restore();
    circ(c,120,143,108);ol(c,'#c62f3a',3.2);for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;c.save();c.translate(120+103*Math.cos(a),143+103*Math.sin(a));c.rotate(a);rr(c,-7,-6,14,12,3);ol(c,'#c2cad6',2);c.restore();}
    circ(c,120,143,95);ol(c,'#dfe4ec',2.6);circ(c,120,143,87);ol(c,'#fbf6e8',2.2);
    c.save();c.globalAlpha=.5;c.fillStyle='#e4dcc4';circ(c,120,143,30);c.fill();c.restore();
  },
  pegboard(c){   // verktygstavla
    c.fillStyle='#c9a878';c.fillRect(0,0,240,286);c.fillStyle='rgba(60,36,14,.45)';for(let y=13;y<286;y+=20)for(let x=10;x<240;x+=20){circ(c,x,y,2.2);c.fill();}
    c.strokeStyle='rgba(60,36,14,.35)';c.lineWidth=2;c.setLineDash([6,5]);circ(c,120,143,106);c.stroke();c.setLineDash([]);
    for(let k=0;k<12;k++){const a=k*Math.PI/6-Math.PI/2;c.save();c.translate(120+106*Math.cos(a),143+106*Math.sin(a));c.rotate(a+Math.PI/2);rr(c,-3,-7,6,14,2);ol(c,k%3?'#f4f4f0':'#ff5a5f',1.6);c.restore();}
    const hex=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;hex.push([120+15*Math.cos(a),143+15*Math.sin(a)]);}U(c,'#8892a4',2.4,[P_(c,hex)]);circ(c,120,143,6);ol(c,'#c2cad6',2);
  }
});

// ---------- batteriet som bild: glas, måne och isglass ----------
Object.assign(BATTPIC,{
  glass(e){const w=Math.round(e.w||74),h=Math.round(e.h||104),out=[];
    for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),t=lv/6,x0=w*.14,x1=w*.86,b0=w*.24,b1=w*.76,top=h*.2,bot=h-5;
      const edge=y=>{const u=(y-top)/(bot-top);return [x0+(b0-x0)*u,x1+(b1-x1)*u];};
      const shape=()=>{c.beginPath();c.moveTo(x0,top);c.lineTo(b0,bot-5);c.quadraticCurveTo(b0,bot,b0+6,bot);c.lineTo(b1-6,bot);c.quadraticCurveTo(b1,bot,b1,bot-5);c.lineTo(x1,top);c.closePath();};
      shape();c.fillStyle='rgba(255,255,255,.2)';c.fill();
      if(lv){const ly=bot-(bot-top-8)*t,ee=edge(ly);c.save();shape();c.clip();const g=c.createLinearGradient(0,ly,0,bot);g.addColorStop(0,'#ffb02e');g.addColorStop(1,'#ff7a1a');c.fillStyle=g;c.fillRect(0,ly,w,bot-ly);
        c.fillStyle='rgba(255,255,255,.6)';[[.38,.3],[.6,.55],[.46,.8]].forEach(q=>{const y=ly+(bot-ly)*q[1];if(y<bot-4){c.beginPath();c.arc(w*q[0],y,2.2,0,7);c.fill();}});
        if(lv>=4){c.fillStyle='rgba(255,255,255,.7)';c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=1.4;[[.32,-.08],[.56,.02]].forEach(q=>{c.save();c.translate(w*q[0],ly+10);c.rotate(q[1]*6);c.fillRect(-7,-7,14,14);c.strokeRect(-7,-7,14,14);c.restore();});}
        c.restore();c.fillStyle='rgba(255,236,170,.9)';c.fillRect(ee[0],ly-1.5,ee[1]-ee[0],3);}
      else{c.fillStyle='#ffb02e';c.beginPath();c.ellipse(w/2,bot-5,8,2.6,0,0,7);c.fill();}
      c.lineCap='round';c.beginPath();c.moveTo(w*.74,2);c.lineTo(w*.5,bot-8);c.lineWidth=7;c.strokeStyle=INK;c.stroke();c.lineWidth=4;c.strokeStyle='#ff5a5f';c.stroke();
      c.setLineDash([4,6]);c.strokeStyle='#ffffff';c.lineWidth=4;c.stroke();c.setLineDash([]);
      shape();c.lineWidth=2.8;c.strokeStyle=INK;c.lineJoin='round';c.stroke();
      c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2.2;c.beginPath();c.moveTo(w*.25,top+10);c.lineTo(w*.3,bot-18);c.stroke();
      out.push(cv);}
    return out;},
  moon(e){const s=Math.round(e.w||96),out=[];
    for(let lv=0;lv<7;lv++){const cv=mk(s,s),c=ctxOf(cv),m=s/2,R=s*.44,t=lv/6;
      const g=c.createRadialGradient(m,m,R*.7,m,m,s*.5);g.addColorStop(0,'rgba(255,244,200,'+(.08+.3*t)+')');g.addColorStop(1,'rgba(255,244,200,0)');c.fillStyle=g;c.fillRect(0,0,s,s);
      c.save();circ(c,m,m,R);c.clip();c.fillStyle='#2a3152';c.fillRect(0,0,s,s);
      if(lv){c.fillStyle='#f6f0d4';c.beginPath();c.arc(m,m,R,-Math.PI/2,Math.PI/2);c.closePath();c.fill();
        if(t<.5){c.fillStyle='#2a3152';c.beginPath();c.ellipse(m,m,R*(1-2*t),R,0,0,7);c.fill();}else if(t>.5){c.fillStyle='#f6f0d4';c.beginPath();c.ellipse(m,m,R*(2*t-1),R,0,0,7);c.fill();}
        c.globalCompositeOperation='source-atop';c.fillStyle='rgba(120,110,80,.22)';[[.3,-.3,.14],[-.25,.2,.18],[.4,.35,.1],[-.4,-.35,.09],[.05,.05,.07]].forEach(q=>{c.beginPath();c.arc(m+R*q[0],m+R*q[1],R*q[2],0,7);c.fill();});}
      c.restore();circ(c,m,m,R);c.lineWidth=2;c.strokeStyle=lv?'rgba(246,240,212,.9)':'rgba(246,240,212,.35)';c.stroke();
      out.push(cv);}
    return out;},
  popsicle(e){const w=Math.round(e.w||62),h=Math.round(e.h||112),out=[];
    for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),cx=w/2,bodyTop=6,bodyBot=h*.68,full=bodyBot-bodyTop,top=bodyBot-full*(lv/6);
      U(c,'#e8c48a',2.2,[R_(c,cx-5,bodyBot-10,10,h-bodyBot+6,5)]);
      if(lv){const path=()=>{c.beginPath();if(lv===6){c.moveTo(cx-w*.36,bodyBot);c.lineTo(cx-w*.36,bodyTop+w*.3);c.quadraticCurveTo(cx-w*.36,bodyTop,cx,bodyTop);c.quadraticCurveTo(cx+w*.36,bodyTop,cx+w*.36,bodyTop+w*.3);c.lineTo(cx+w*.36,bodyBot);}
            else{c.moveTo(cx-w*.36,bodyBot);c.lineTo(cx-w*.36,top+5);c.quadraticCurveTo(cx-w*.22,top-7,cx-w*.1,top+3);c.quadraticCurveTo(cx+w*.04,top+11,cx+w*.16,top);c.quadraticCurveTo(cx+w*.3,top-7,cx+w*.36,top+6);c.lineTo(cx+w*.36,bodyBot);}
            c.quadraticCurveTo(cx+w*.36,bodyBot+7,cx+w*.28,bodyBot+7);c.lineTo(cx-w*.28,bodyBot+7);c.quadraticCurveTo(cx-w*.36,bodyBot+7,cx-w*.36,bodyBot);c.closePath();};
        path();c.fillStyle='#ff6f91';c.fill();c.save();path();c.clip();c.fillStyle='#ffd23f';c.fillRect(0,bodyTop+full*.36,w,full);c.fillStyle='#5cc8ff';c.fillRect(0,bodyTop+full*.7,w,full);
        c.fillStyle='rgba(255,255,255,.45)';rr(c,cx-w*.26,Math.max(top+10,bodyTop+8),5,full*.4,2.5);c.fill();c.restore();path();c.lineWidth=2.8;c.strokeStyle=INK;c.lineJoin='round';c.stroke();}
      else{c.fillStyle='#5cc8ff';c.beginPath();c.ellipse(cx,bodyBot-12,7,3,0,0,7);c.fill();c.beginPath();c.ellipse(cx+9,h-6,9,3,0,0,7);c.fill();}
      out.push(cv);}
    return out;}
});

// ---------- vädret som bild: en gubbe klädd efter vädret, en rund skylt, och krita ----------
Object.assign(WEATHERPIC,{
  gubbe(s){const out=[],u=s/116;
    for(let k=0;k<4;k++){const cv=mk(s,s),c=ctxOf(cv);c.save();c.scale(u,u);
      const cloud=(x,y,r,col)=>{U(c,col,2,[C_(c,x,y,r),C_(c,x+r*1.1,y-r*.45,r*1.2),C_(c,x+r*2.3,y,r),R_(c,x,y-r*.1,r*2.3,r*1.1,r*.4)]);};
      // bakom gubben
      if(k===0){c.strokeStyle='#ffb02e';c.lineWidth=3.4;c.lineCap='round';for(let i=0;i<10;i++){const a=i*Math.PI/5;c.beginPath();c.moveTo(88+21*Math.cos(a),26+21*Math.sin(a));c.lineTo(88+28*Math.cos(a),26+28*Math.sin(a));c.stroke();}circ(c,88,26,16);ol(c,'#ffd23f',2.2,'#e89a1a');}
      if(k===1){cloud(60,24,10,'#ffffff');cloud(10,36,7,'#e6ebf2');}
      if(k===3){cloud(58,20,9,'#ffffff');}
      // kropp
      const coat=['#ff8a3c','#4ea1ff','#ffd23f','#7fd0e8'][k];
      U(c,coat,2.6,[()=>{c.moveTo(26,116);c.quadraticCurveTo(24,84,44,78);c.lineTo(72,78);c.quadraticCurveTo(92,84,90,116);c.closePath();}]);
      if(k===0){c.fillStyle='#ffffff';c.beginPath();c.moveTo(48,79);c.lineTo(58,92);c.lineTo(68,79);c.closePath();c.fill();}
      if(k===1){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=3;[90,100,110].forEach(y=>{c.beginPath();c.moveTo(30,y);c.lineTo(86,y);c.stroke();});}
      if(k===2){c.fillStyle=INK;[92,104].forEach(y=>{c.beginPath();c.arc(58,y,2.2,0,7);c.fill();});}
      // huvud
      if(k===2)U(c,'#ffd23f',2.6,[C_(c,58,56,25)]);
      U(c,'#ffd2a8',2.6,[C_(c,58,58,20)]);
      if(k===0){U(c,'#7a4e2a',2.2,[()=>{c.moveTo(38,54);c.quadraticCurveTo(40,34,58,36);c.quadraticCurveTo(76,34,78,54);c.quadraticCurveTo(66,44,58,46);c.quadraticCurveTo(50,44,38,54);c.closePath();}]);
        U(c,'#20222c',1.8,[R_(c,41,53,15,10,4),R_(c,60,53,15,10,4)]);c.fillStyle=INK;c.fillRect(55,56,6,2.4);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(44,55,4,2);c.fillRect(63,55,4,2);toonSmile(c,58,69,7,6,2.2);}
      else{toonEye(c,51,57,5,0,k===2?1:0);toonEye(c,65,57,5,0,k===2?1:0);
        if(k===1){U(c,'#7a4e2a',2.2,[()=>{c.moveTo(38,54);c.quadraticCurveTo(40,34,58,36);c.quadraticCurveTo(76,34,78,54);c.quadraticCurveTo(66,44,58,46);c.quadraticCurveTo(50,44,38,54);c.closePath();}]);toonSmile(c,58,68,6,4,2.2);}
        if(k===2){c.beginPath();c.moveTo(52,70);c.lineTo(64,70);ol(c,null,2.2);}
        if(k===3){U(c,'#d8302e',2.4,[()=>{c.moveTo(37,52);c.quadraticCurveTo(38,30,58,30);c.quadraticCurveTo(78,30,79,52);c.closePath();}]);U(c,'#ffffff',2,[R_(c,35,47,46,9,4.5),C_(c,58,27,6)]);
          U(c,'#3fbf62',2.4,[R_(c,36,74,44,11,5.5),R_(c,66,78,11,26,5)]);cheeks(c,58,64,13,3.6,'#ff6f6f');toonSmile(c,58,67,5,4,2);}}
      // framför gubben
      if(k===2){c.lineCap='round';c.beginPath();c.moveTo(86,112);c.lineTo(86,28);c.lineWidth=5.5;c.strokeStyle=INK;c.stroke();c.lineWidth=2.6;c.strokeStyle='#8892a4';c.stroke();
        U(c,'#ff5a5f',2.4,[()=>{c.moveTo(46,32);c.quadraticCurveTo(86,-12,114,36);c.quadraticCurveTo(104,28,96,36);c.quadraticCurveTo(86,26,76,36);c.quadraticCurveTo(66,28,58,36);c.quadraticCurveTo(52,28,46,32);c.closePath();}]);
        U(c,'#ffd2a8',2,[C_(c,86,96,5.5)]);c.strokeStyle='#58b7ff';c.lineWidth=2.6;[[8,30],[18,56],[6,82],[28,14],[108,60],[100,88],[112,104]].forEach(p=>{c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]-3,p[1]+9);c.stroke();});}
      if(k===3){c.fillStyle='#ffffff';[[10,20],[24,50],[8,84],[100,48],[108,84],[96,14],[18,108],[104,110]].forEach((p,i)=>{c.beginPath();c.arc(p[0],p[1],2.6+(i%2),0,7);c.fill();c.lineWidth=1;c.strokeStyle='rgba(27,29,42,.5)';c.stroke();});}
      c.restore();out.push(cv);}
    return out;},
  badge(s){const out=[],u=s/100,grad=[['#ffb02e','#ff7a1a'],['#8fa3bd','#5b6f8c'],['#3f7fd8','#274a9a'],['#9fd6ee','#5fa7cc']];
    for(let k=0;k<4;k++){const cv=mk(s,s),c=ctxOf(cv);c.save();c.scale(u,u);
      const g=c.createLinearGradient(0,4,0,96);g.addColorStop(0,grad[k][0]);g.addColorStop(1,grad[k][1]);circ(c,50,50,46);c.fillStyle=g;c.fill();c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.35)';c.stroke();
      const cloud=(x,y,r)=>{c.fillStyle='#ffffff';[[0,0,1],[r*1.05,-r*.5,1.25],[r*2.3,0,1]].forEach(q=>{c.beginPath();c.arc(x+q[0],y+q[1],r*q[2],0,7);c.fill();});c.fillRect(x,y-r*.1,r*2.3,r*1.1);};
      if(k===0){c.fillStyle='#fff7d6';c.beginPath();c.arc(50,50,17,0,7);c.fill();c.strokeStyle='#fff7d6';c.lineWidth=5;c.lineCap='round';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(50+25*Math.cos(a),50+25*Math.sin(a));c.lineTo(50+33*Math.cos(a),50+33*Math.sin(a));c.stroke();}}
      else if(k===1){c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(66,36,13,0,7);c.fill();cloud(24,56,12);}
      else if(k===2){cloud(24,44,12);c.strokeStyle='#bfe1ff';c.lineWidth=4.5;c.lineCap='round';[32,48,64].forEach(x=>{c.beginPath();c.moveTo(x,64);c.lineTo(x-5,77);c.stroke();});}
      else{cloud(24,42,12);c.fillStyle='#ffffff';[[32,68],[50,74],[68,68]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],4.2,0,7);c.fill();});}
      c.restore();out.push(cv);}
    return out;},
  chalk(s){const out=[],u=s/100;
    for(let k=0;k<4;k++){const cv=mk(s,s),c=ctxOf(cv);c.save();c.scale(u,u);c.strokeStyle='#f4f4ea';c.fillStyle='#f4f4ea';c.lineWidth=4.5;c.lineCap='round';c.lineJoin='round';
      const cloud=(x,y)=>{c.beginPath();c.moveTo(x,y+18);c.lineTo(x+46,y+18);c.bezierCurveTo(x+62,y+18,x+62,y-2,x+46,y);c.bezierCurveTo(x+44,y-18,x+18,y-20,x+16,y-2);c.bezierCurveTo(x-2,y-6,x-8,y+16,x,y+18);c.closePath();c.stroke();};
      if(k===0){c.beginPath();c.arc(50,50,17,0,7);c.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(50+26*Math.cos(a),50+26*Math.sin(a));c.lineTo(50+36*Math.cos(a),50+36*Math.sin(a));c.stroke();}}
      else if(k===1){cloud(22,46);}
      else if(k===2){cloud(22,34);[30,48,66].forEach(x=>{c.beginPath();c.moveTo(x,64);c.lineTo(x-6,80);c.stroke();});}
      else{cloud(22,34);[[30,70],[48,78],[66,70]].forEach(p=>{c.beginPath();c.moveTo(p[0]-5,p[1]);c.lineTo(p[0]+5,p[1]);c.moveTo(p[0],p[1]-5);c.lineTo(p[0],p[1]+5);c.stroke();});}
      // lite ojämnt, som krita
      c.globalCompositeOperation='destination-out';const rnd=mulberry(k*91+7);for(let i=0;i<900;i++){c.globalAlpha=.2+rnd()*.5;c.fillRect(rnd()*100,rnd()*100,1+rnd()*1.6,1);}
      c.restore();out.push(cv);}
    return out;}
});
