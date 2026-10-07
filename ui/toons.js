// ================= Tecknade figurer: egna, ritade här med tjocka konturer och rena färger =================
const INK='#1b1d2a';
function ol(c,fill,lw,stroke){if(fill){c.fillStyle=fill;c.fill();}c.lineWidth=lw===undefined?3:lw;c.strokeStyle=stroke||INK;c.lineJoin='round';c.lineCap='round';c.stroke();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function ell(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);}
function toonEye(c,x,y,r,dx,dy){circ(c,x,y,r);ol(c,'#ffffff',2.6);circ(c,x+(dx||0),y+(dy||0),r*.5);c.fillStyle=INK;c.fill();circ(c,x+(dx||0)-r*.17,y+(dy||0)-r*.2,r*.17);c.fillStyle='#ffffff';c.fill();}
function toonSmile(c,x,y,w,d,lw){c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x,y+d,x+w,y);ol(c,null,lw||2.6);}
function cheeks(c,x,y,dx,r,col){c.save();c.globalAlpha=.55;c.fillStyle=col||'#ff7a9a';circ(c,x-dx,y,r);c.fill();circ(c,x+dx,y,r);c.fill();c.restore();}
// En arm som visare: pekar rakt upp, med en rund hand i spetsen. Vridpunkten ligger på (bredd/2, len).
function armCanvas(len,w,col,hub,tip){
  const tr=Math.max(w*.8,6),W=Math.ceil(Math.max(w,2*tr,(hub||0)*2))+6,tail=Math.ceil(Math.max(w/2,hub||0))+3,cv=mk(W,Math.round(len+tail)),c=ctxOf(cv),cx=W/2;
  rr(c,cx-w/2,tr,w,len-tr+w/2,w/2);ol(c,col,2.4);circ(c,cx,tr+1.6,tr);ol(c,tip||col,2.4);
  if(hub){circ(c,cx,len,hub);ol(c,tip||col,2.4);}
  return cv;
}
const TOONS={
  robot(c){
    c.save();c.globalAlpha=.18;c.fillStyle='#000';ell(c,120,254,74,9);c.fill();c.restore();
    [[92,204],[128,204]].forEach(p=>{rr(c,p[0],p[1],20,36,6);ol(c,'#6f7f99');});
    [[82,236],[122,236]].forEach(p=>{rr(c,p[0],p[1],36,16,8);ol(c,'#ff5a5f');});
    rr(c,58,102,124,108,26);ol(c,'#9fb3cc');
    c.save();c.globalAlpha=.35;c.fillStyle='#ffffff';rr(c,66,108,108,12,6);c.fill();c.restore();
    rr(c,76,160,88,38,10);ol(c,'#10131c',2.6);
    [[70,150],[170,150],[70,198],[170,198]].forEach(p=>{circ(c,p[0],p[1],3);c.fillStyle='#6f7f99';c.fill();});
    rr(c,108,90,24,16,4);ol(c,'#6f7f99');
    c.beginPath();c.moveTo(120,24);c.lineTo(120,12);ol(c,null,3);circ(c,120,9,6);ol(c,'#ff5a5f');
    rr(c,56,44,13,26,5);ol(c,'#ff5a5f');rr(c,171,44,13,26,5);ol(c,'#ff5a5f');
    rr(c,66,22,108,72,22);ol(c,'#c9d6e6');
    c.save();c.globalAlpha=.5;c.fillStyle='#ffffff';rr(c,76,28,60,8,4);c.fill();c.restore();
    toonEye(c,98,54,14,2,2);toonEye(c,142,54,14,2,2);
    rr(c,100,76,40,11,5);ol(c,'#10131c',2.4);c.strokeStyle='#c9d6e6';c.lineWidth=2;[110,120,130].forEach(x=>{c.beginPath();c.moveTo(x,78);c.lineTo(x,85);c.stroke();});
    circ(c,120,143,12);ol(c,'#ff5a5f');
  },
  monster(c,d){
    const col=d.c||'#5fd068',dark='#3fa84b',cx=120,cy=172,rx=90,ry=96;
    [[88,270],[152,270]].forEach(p=>{ell(c,p[0],p[1],26,11);ol(c,dark);});
    [1,-1].forEach(s=>{const X=x=>120+s*(x-120);c.beginPath();c.moveTo(X(60),96);c.quadraticCurveTo(X(50),62,X(36),52);c.quadraticCurveTo(X(70),54,X(88),82);c.closePath();ol(c,'#fff3d6');});
    const n=22;c.beginPath();
    for(let k=0;k<=n;k++){const a=k*2*Math.PI/n-Math.PI/2,x=cx+rx*Math.cos(a),y=cy+ry*Math.sin(a);
      if(!k)c.moveTo(x,y);else{const am=a-Math.PI/n;c.quadraticCurveTo(cx+(rx+13)*Math.cos(am),cy+(ry+13)*Math.sin(am),x,y);}}
    c.closePath();ol(c,col,3.2);
    c.save();c.globalAlpha=.4;c.fillStyle=dark;[[54,156,7],[188,168,8],[176,114,5],[64,214,5],[182,222,6]].forEach(p=>{circ(c,p[0],p[1],p[2]);c.fill();});c.restore();
    c.beginPath();c.moveTo(66,212);c.quadraticCurveTo(120,272,174,212);c.quadraticCurveTo(120,236,66,212);c.closePath();ol(c,'#7a1f3d');
    c.save();c.beginPath();c.moveTo(66,212);c.quadraticCurveTo(120,272,174,212);c.quadraticCurveTo(120,236,66,212);c.clip();c.fillStyle='#ff7a9a';ell(c,120,256,26,14);c.fill();c.restore();
    [[92,221],[136,221]].forEach(p=>{c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]+13,p[1]+4);c.lineTo(p[0]+6,p[1]+17);c.closePath();ol(c,'#ffffff',2);});
    circ(c,120,143,46);ol(c,'#ffffff',3.4);
    c.save();c.globalAlpha=.1;c.fillStyle='#3a5ad8';circ(c,120,143,40);c.fill();c.restore();
  },
  cat(c,d){
    const f=d.c||'#ff9f43',dk='#d9772b',cx=120,cy=126;
    [1,-1].forEach(s=>{c.beginPath();c.moveTo(cx+s*60,cy-18);c.lineTo(cx+s*54,cy-76);c.lineTo(cx+s*14,cy-50);c.closePath();ol(c,f);
      c.beginPath();c.moveTo(cx+s*52,cy-34);c.lineTo(cx+s*49,cy-62);c.lineTo(cx+s*29,cy-49);c.closePath();c.fillStyle='#ffb3c1';c.fill();});
    ell(c,cx,cy,64,55);ol(c,f);
    c.save();ell(c,cx,cy,62,53);c.clip();c.strokeStyle=dk;c.lineWidth=6;c.lineCap='round';[-14,0,14].forEach(x=>{c.beginPath();c.moveTo(cx+x,cy-60);c.lineTo(cx+x*.8,cy-36+(x?0:5));c.stroke();});
      [1,-1].forEach(s=>[-4,10].forEach(y=>{c.beginPath();c.moveTo(cx+s*66,cy+y);c.lineTo(cx+s*48,cy+y+2);c.stroke();}));
      c.fillStyle='#ffe3c2';ell(c,cx,cy+26,30,22);c.fill();c.restore();
    toonEye(c,cx-25,cy-8,14,2,1);toonEye(c,cx+25,cy-8,14,-2,1);
    c.beginPath();c.moveTo(cx-7,cy+12);c.lineTo(cx+7,cy+12);c.lineTo(cx,cy+20);c.closePath();ol(c,'#ff6b8b',2.2);
    c.beginPath();c.moveTo(cx,cy+20);c.quadraticCurveTo(cx-3,cy+32,cx-15,cy+27);c.moveTo(cx,cy+20);c.quadraticCurveTo(cx+3,cy+32,cx+15,cy+27);ol(c,null,2.4);
    c.lineWidth=1.8;c.strokeStyle=INK;[1,-1].forEach(s=>[-6,2,10].forEach(y=>{c.beginPath();c.moveTo(cx+s*30,cy+20+y*.4);c.lineTo(cx+s*76,cy+14+y*1.4);c.stroke();}));
  },
  planet(c,d){
    const cx=120,cy=143,r=46,ring=h=>{c.save();c.translate(cx,cy);c.rotate(-.32);c.beginPath();c.ellipse(0,0,76,21,0,h?0:Math.PI,h?Math.PI:2*Math.PI);c.lineCap='round';c.lineWidth=11;c.strokeStyle=INK;c.stroke();c.lineWidth=6;c.strokeStyle='#ffd76a';c.stroke();c.restore();};
    ring(false);circ(c,cx,cy,r);ol(c,d.c||'#ff7f66',3.2);
    c.save();circ(c,cx,cy,r-1.6);c.clip();c.fillStyle='rgba(255,255,255,.22)';c.fillRect(cx-r,cy-36,2*r,9);c.fillStyle='rgba(120,30,30,.18)';c.fillRect(cx-r,cy+24,2*r,10);c.restore();
    toonEye(c,cx-16,cy-12,11,1,1);toonEye(c,cx+16,cy-12,11,1,1);toonSmile(c,cx,cy+4,12,10);cheeks(c,cx,cy+3,27,5);
    ring(true);
  },
  flower(c,d){
    const cx=120,cy=143;
    c.fillStyle='#ffffff';c.save();c.globalAlpha=.85;[[44,74,1],[196,58,.8]].forEach(p=>{[[0,0,13],[14,-6,15],[30,0,12]].forEach(q=>{circ(c,p[0]+q[0]*p[2],p[1]+q[1]*p[2],q[2]*p[2]);c.fill();});rr(c,p[0]-10*p[2],p[1]+1*p[2],50*p[2],12*p[2],6*p[2]);c.fill();});c.restore();
    c.beginPath();c.moveTo(cx,cy+30);c.quadraticCurveTo(cx-12,222,cx,266);c.lineCap='round';c.lineWidth=11;c.strokeStyle=INK;c.stroke();c.lineWidth=6;c.strokeStyle='#2e9e4f';c.stroke();
    [[1,226,-.6],[-1,240,.6]].forEach(p=>{ell(c,cx+p[0]*18,p[1],18,8,p[2]);ol(c,'#3fbf62',2.6);});
    c.beginPath();c.moveTo(0,254);c.quadraticCurveTo(60,240,120,252);c.quadraticCurveTo(180,264,240,248);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fillStyle='#58c26a';c.fill();
    for(let k=0;k<12;k++){const a=k*Math.PI/6;ell(c,cx+46*Math.sin(a),cy-46*Math.cos(a),13,23,a);ol(c,d.c||'#ffd23f',2.8);}
    circ(c,cx,cy,35);ol(c,'#8a5a2b',3.2);
    toonEye(c,cx-13,cy-7,9,1,1);toonEye(c,cx+13,cy-7,9,1,1);toonSmile(c,cx,cy+9,11,9);cheeks(c,cx,cy+8,23,4.5);
  }
  ,octopus(c,d){
    const f=d.c||'#ff6f91',dk='#d94a70',cx=120;c.save();c.translate(0,-14);
    const tent=(pts,sw)=>{[[sw+5,INK],[sw,f]].forEach(q=>{c.beginPath();c.moveTo(pts[0],pts[1]);c.bezierCurveTo(pts[2],pts[3],pts[4],pts[5],pts[6],pts[7]);c.lineWidth=q[0];c.strokeStyle=q[1];c.lineCap='round';c.stroke();});
      c.fillStyle='#ffd0dc';for(let t=.35;t<.95;t+=.2){const u=1-t,x=u*u*u*pts[0]+3*u*u*t*pts[2]+3*u*t*t*pts[4]+t*t*t*pts[6],y=u*u*u*pts[1]+3*u*u*t*pts[3]+3*u*t*t*pts[5]+t*t*t*pts[7];circ(c,x,y,2);c.fill();}};
    tent([84,170,40,190,30,240,58,262],13);tent([156,170,200,190,210,240,182,262],13);
    tent([100,176,84,220,96,250,78,276],13);tent([140,176,156,220,144,250,162,276],13);
    tent([76,160,30,160,14,196,30,214],12);tent([164,160,210,160,226,196,210,214],12);
    c.beginPath();c.moveTo(56,150);c.bezierCurveTo(40,60,200,60,184,150);c.quadraticCurveTo(184,186,120,186);c.quadraticCurveTo(56,186,56,150);c.closePath();ol(c,f,3.2);
    c.save();c.globalAlpha=.35;c.fillStyle='#ffffff';ell(c,92,92,16,9,-.5);c.fill();c.restore();
    c.save();c.globalAlpha=.45;c.fillStyle=dk;[[74,150,5],[168,146,6],[150,84,4]].forEach(p=>{circ(c,p[0],p[1],p[2]);c.fill();});c.restore();
    toonEye(c,98,112,14,2,2);toonEye(c,142,112,14,-2,2);toonSmile(c,cx,132,12,10);cheeks(c,cx,130,36,6,'#ff9db4');c.restore();
  },
  sea(c){
    c.save();c.globalAlpha=.1;c.fillStyle='#ffffff';[[40,0,34],[150,0,26]].forEach(p=>{c.beginPath();c.moveTo(p[0],0);c.lineTo(p[0]+p[2],0);c.lineTo(p[0]+p[2]+70,286);c.lineTo(p[0]+20,286);c.closePath();c.fill();});c.restore();
    c.beginPath();c.moveTo(0,262);c.quadraticCurveTo(60,248,120,260);c.quadraticCurveTo(180,272,240,256);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fillStyle='#f3d9a0';c.fill();
    [[26,264,'#2e9e4f',44],[40,266,'#3fbf62',30],[212,262,'#2e9e4f',50],[198,266,'#3fbf62',32]].forEach(p=>{c.beginPath();c.moveTo(p[0],p[1]);c.bezierCurveTo(p[0]-12,p[1]-p[3]*.35,p[0]+12,p[1]-p[3]*.7,p[0]-2,p[1]-p[3]);c.lineWidth=7;c.strokeStyle=p[2];c.lineCap='round';c.stroke();});
    [[62,268,'#ff6f91'],[176,270,'#ff9f43']].forEach(p=>{c.fillStyle=p[2];[[0,0,9],[9,-5,7],[-8,-4,6]].forEach(q=>{circ(c,p[0]+q[0],p[1]+q[1],q[2]);c.fill();});});
    c.lineWidth=1.4;c.strokeStyle='rgba(255,255,255,.6)';[[30,200,4],[36,180,2.5],[208,190,3.5],[214,168,2.2],[24,120,3],[220,110,2.6]].forEach(p=>{circ(c,p[0],p[1],p[2]);c.stroke();});
  }
  ,isle(c){
    c.lineCap='round';c.lineWidth=1.8;c.strokeStyle='rgba(255,255,255,.28)';[[34,70],[190,56],[52,214],[200,206],[24,150],[214,128],[96,34],[150,256],[70,262]].forEach(p=>{c.beginPath();c.moveTo(p[0],p[1]);c.quadraticCurveTo(p[0]+6,p[1]-5,p[0]+12,p[1]);c.quadraticCurveTo(p[0]+18,p[1]+5,p[0]+24,p[1]);c.stroke();});
    const blob=(rx,ry,k)=>{c.beginPath();for(let i=0;i<=24;i++){const a=i*Math.PI/12,w=1+k*Math.sin(a*3+1)+k*.6*Math.cos(a*5);c[i?'lineTo':'moveTo'](120+rx*w*Math.cos(a),143+ry*w*Math.sin(a));}c.closePath();};
    c.save();c.setLineDash([5,6]);blob(54,47,.05);c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.5)';c.stroke();c.restore();
    blob(46,40,.06);ol(c,'#f1dba0',2.6);blob(32,27,.08);c.fillStyle='#58c26a';c.fill();
    [[94,128,4],[150,160,3.5],[140,118,3]].forEach(p=>{circ(c,p[0],p[1],p[2]);c.fillStyle='#8a8f9c';c.fill();});
    circ(c,120,143,18);ol(c,'#ffffff',2.6);circ(c,120,143,12.5);c.fillStyle='#e8452c';c.fill();circ(c,120,143,6.5);ol(c,'#ffe27a',2);
  },
  gnomon(c){
    c.save();c.globalAlpha=.25;c.fillStyle='#000';circ(c,122,146,11);c.fill();c.restore();
    circ(c,120,143,10);ol(c,'#a8946a',2.4);c.beginPath();c.moveTo(116,146);c.lineTo(124,146);c.lineTo(120,108);c.closePath();ol(c,'#7a6846',2.2);
  },
  jungle(c){
    const leaf=(x,y,l,w,a,col)=>{c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(l*.5,-w,l,0);c.quadraticCurveTo(l*.5,w,0,0);c.closePath();c.fillStyle=col;c.fill();c.lineWidth=1.6;c.strokeStyle='rgba(0,0,0,.25)';c.stroke();c.beginPath();c.moveTo(0,0);c.lineTo(l*.9,0);c.stroke();c.restore();};
    [[0,0,.5],[0,0,1.05],[240,0,2.1],[240,0,2.65],[0,286,-.5],[0,286,-1.05],[240,286,-2.1],[240,286,-2.65]].forEach((p,i)=>leaf(p[0],p[1],58,15,p[2],i%2?'#1f7a3d':'#4fbf6a'));
    [[0,20,.15],[240,24,3.0],[0,262,-.15],[240,266,-3.0]].forEach(p=>leaf(p[0],p[1],40,11,p[2],'#2f9a4e'));
  }
  ,pizza(c){
    circ(c,120,143,114);ol(c,'#f3efe6',2.4,'#b9b2a2');circ(c,120,143,106);ol(c,'#e2a04a',2.6,'#8a5a1e');circ(c,120,143,95);c.fillStyle='#ffd45a';c.fill();
    c.save();circ(c,120,143,95);c.clip();c.fillStyle='rgba(232,69,44,.28)';[[84,96,26],[160,180,30],[150,92,20],[86,196,22]].forEach(p=>{circ(c,p[0],p[1],p[2]);c.fill();});c.restore();
    c.lineWidth=1.8;c.strokeStyle='#d98b2b';for(let k=0;k<6;k++){const a=k*Math.PI/6;c.beginPath();c.moveTo(120+104*Math.sin(a),143-104*Math.cos(a));c.lineTo(120-104*Math.sin(a),143+104*Math.cos(a));c.stroke();}
    [[120,74],[168,104],[180,160],[150,208],[92,212],[62,168],[64,110],[96,84],[150,132],[94,150]].forEach((p,i)=>{if(Math.hypot(p[0]-120,p[1]-143)<52)return;circ(c,p[0],p[1],9);ol(c,'#d8402e',1.8,'#8a1f14');c.fillStyle='rgba(0,0,0,.18)';circ(c,p[0]-2,p[1]+2,2);c.fill();circ(c,p[0]+3,p[1]-2,1.6);c.fill();});
    [[140,70],[190,132],[176,194],[120,224],[60,196],[48,138],[76,84]].forEach(p=>{circ(c,p[0],p[1],5);ol(c,'#2a2c36',1.4);circ(c,p[0],p[1],2);c.fillStyle='#ffd45a';c.fill();});
    c.fillStyle='#3fbf62';[[108,60,.4],[176,120,1.2],[70,150,-.6],[136,214,.2]].forEach(p=>{ell(c,p[0],p[1],7,3.5,p[2]);c.fill();});
    circ(c,120,143,42);ol(c,'#fff6dc',2.2,'#d98b2b');
  },
  flowers(c){
    const cols=['#ff6f91','#ffd23f','#c77dff','#ff9f43','#5cc8ff','#ffffff'];
    for(let k=0;k<12;k++){const a=k*Math.PI/6,x=120+100*Math.sin(a),y=143-100*Math.cos(a),col=cols[k%6];
      for(let i=0;i<5;i++){const b=i*2*Math.PI/5+a;circ(c,x+7*Math.cos(b),y+7*Math.sin(b),6);ol(c,col,1.6);}circ(c,x,y,4.5);ol(c,k%6===1?'#ff9f43':'#ffe14a',1.4);}
    c.save();c.globalAlpha=.25;c.strokeStyle='#ffffff';c.lineWidth=14;circ(c,120,143,76);c.stroke();c.restore();
    circ(c,120,143,43);ol(c,'#f6fbe8',2.4,'#3f8f4a');
  },
  earth(c){
    const g=c.createRadialGradient(120,143,40,120,143,70);g.addColorStop(0,'rgba(92,200,255,.45)');g.addColorStop(1,'rgba(92,200,255,0)');c.fillStyle=g;c.fillRect(0,0,240,286);
    circ(c,120,143,46);ol(c,'#2a7fd6',2.6);c.save();circ(c,120,143,44.5);c.clip();c.fillStyle='#4fbf6a';
    [[100,120,18,13,.4],[108,146,10,16,-.2],[140,128,14,10,.2],[148,156,16,12,-.5],[96,172,12,7,.3],[128,100,10,5,0]].forEach(p=>{ell(c,p[0],p[1],p[2],p[3],p[4]);c.fill();});
    c.fillStyle='rgba(255,255,255,.75)';[[92,138,13,4],[146,112,12,3.5],[130,170,15,4]].forEach(p=>{ell(c,p[0],p[1],p[2],p[3]);c.fill();});
    c.fillStyle='rgba(0,10,40,.28)';c.beginPath();c.arc(120,143,46,-.9,2.2);c.arc(104,143,50,2.0,-.75,true);c.closePath();c.fill();c.restore();
  },
  cup(c){
    c.save();c.globalAlpha=.18;c.fillStyle='#000';ell(c,124,150,96,96);c.fill();c.restore();
    circ(c,120,143,92);ol(c,'#f6f1e8',2.6,'#b9a98c');circ(c,120,143,74);c.lineWidth=1.4;c.strokeStyle='rgba(120,100,70,.35)';c.stroke();
    rr(c,170,131,34,24,10);ol(c,'#ffffff',2.6,'#b9a98c');circ(c,120,143,62);ol(c,'#ffffff',2.8,'#b9a98c');circ(c,120,143,52);ol(c,'#6b3f22',2,'#3a1f0e');
    c.save();circ(c,120,143,51);c.clip();c.strokeStyle='rgba(232,201,160,.55)';c.lineWidth=5;c.lineCap='round';c.beginPath();c.arc(120,143,40,2.2,4.4);c.stroke();c.beginPath();c.arc(120,143,44,5.4,6.6);c.stroke();c.restore();
  },
  penguin(c){
    [[92,250],[148,250]].forEach(p=>{ell(c,p[0],p[1],22,10);ol(c,'#ff9f43',2.6);});
    ell(c,120,150,72,96);ol(c,'#1f2a44',3.2);ell(c,120,166,48,72);c.fillStyle='#ffffff';c.fill();
    ell(c,96,100,20,24);c.fillStyle='#ffffff';c.fill();ell(c,144,100,20,24);c.fill();
    toonEye(c,98,98,11,2,2);toonEye(c,142,98,11,-2,2);
    c.beginPath();c.moveTo(108,112);c.lineTo(132,112);c.lineTo(120,128);c.closePath();ol(c,'#ff9f43',2.4);cheeks(c,120,118,34,6,'#ff9db4');
  },
  alien(c){
    [[104,224],[136,224]].forEach(p=>{rr(c,p[0]-8,p[1]-22,16,30,7);ol(c,'#4fbf6a',2.6);ell(c,p[0],p[1]+10,14,7);ol(c,'#3a4a7a',2.4);});
    ell(c,120,172,36,42);ol(c,'#3a4a7a',3);rr(c,88,176,64,9,4);c.fillStyle='#ffd23f';c.fill();circ(c,120,180,7);ol(c,'#ffe14a',2);
    [[-1],[1]].forEach(q=>{c.beginPath();c.moveTo(120+q[0]*26,62);c.quadraticCurveTo(120+q[0]*40,40,120+q[0]*34,30);ol(c,null,3);circ(c,120+q[0]*34,28,6);ol(c,'#ffe14a',2.2);});
    ell(c,120,96,58,46);ol(c,'#7be08a',3.2);c.save();c.globalAlpha=.35;c.fillStyle='#ffffff';ell(c,96,68,16,7,-.4);c.fill();c.restore();
    [[-1],[1]].forEach(q=>{ell(c,120+q[0]*24,96,15,21,q[0]*.35);c.fillStyle=INK;c.fill();ell(c,120+q[0]*28,88,4,6,q[0]*.35);c.fillStyle='#ffffff';c.fill();});
    toonSmile(c,120,122,10,7,2.4);
  },
  pitch(c){
    for(let i=0;i<8;i++){c.fillStyle=i%2?'#2f9a52':'#37a85c';c.fillRect(0,i*36,240,36);}
    c.lineWidth=2.2;c.strokeStyle='rgba(255,255,255,.9)';c.strokeRect(14,26,212,234);c.beginPath();c.moveTo(14,143);c.lineTo(226,143);c.stroke();circ(c,120,143,44);c.stroke();circ(c,120,143,3);c.fillStyle='#ffffff';c.fill();
    c.strokeRect(64,26,112,42);c.strokeRect(64,218,112,42);c.strokeRect(96,26,48,16);c.strokeRect(96,244,48,16);
  },
  bigheart(c,d){
    const g=c.createRadialGradient(120,140,10,120,140,120);g.addColorStop(0,'rgba(255,60,90,.45)');g.addColorStop(1,'rgba(255,60,90,0)');c.fillStyle=g;c.fillRect(0,0,240,286);
    c.save();c.translate(38,58);c.fillStyle=d.c||'#ff3c5f';ICONS.heart(c,164);c.restore();
    c.save();c.globalAlpha=.3;c.fillStyle='#ffffff';ell(c,84,104,18,10,-.6);c.fill();c.restore();
  },
  pines(c){
    const tree=(x,y,h)=>{c.fillStyle='#7a5230';c.fillRect(x-2,y,4,h*.25);[[0,1],[.3,.8],[.58,.6]].forEach(q=>{c.beginPath();c.moveTo(x,y-h+h*q[0]);c.lineTo(x+h*.42*q[1],y-h*.1+h*q[0]*.55);c.lineTo(x-h*.42*q[1],y-h*.1+h*q[0]*.55);c.closePath();ol(c,'#2e9e6a',1.6,'#1b6a46');});};
    tree(22,36,26);tree(218,40,24);tree(24,270,26);tree(216,268,28);tree(70,196,20);tree(172,96,20);
    c.fillStyle='#ffffff';[[40,120],[200,170],[120,20],[120,268],[60,60],[184,224]].forEach(p=>{circ(c,p[0],p[1],2);c.fill();});
  }
};
// Små figurer som går runt mitten. De ritas på väg åt höger, så som de ser ut högst upp i varvet.
function sprCanvas(w,h){return mk(Math.ceil(w)+2,Math.ceil(h)+2);}
const SPRITES={
  star(s,e){const cv=sprCanvas(2.2*s,2.2*s),c=ctxOf(cv),m=cv.width/2;c.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?s*.48:s;c[k?'lineTo':'moveTo'](m+r*Math.cos(a),m+r*Math.sin(a));}c.closePath();ol(c,e.c||'#ffe14a',2);return cv;},
  pupil(s,e){const cv=sprCanvas(2*s,2*s),c=ctxOf(cv),m=cv.width/2;circ(c,m,m,s-.5);c.fillStyle=e.c||INK;c.fill();circ(c,m-s*.3,m-s*.34,s*.26);c.fillStyle='#ffffff';c.fill();return cv;},
  mouse(s,e){const cv=sprCanvas(3.4*s,2.2*s),c=ctxOf(cv),x=cv.width/2+s*.2,y=cv.height/2+s*.15;
    c.beginPath();c.moveTo(x-s*.9,y+s*.2);c.quadraticCurveTo(x-s*1.5,y+s*.7,x-s*1.75,y-s*.1);ol(c,null,1.8,'#ff8aa5');
    c.beginPath();c.moveTo(x-s,y+s*.55);c.quadraticCurveTo(x-s*1.1,y-s*.7,x+s*.1,y-s*.6);c.quadraticCurveTo(x+s*.9,y-s*.5,x+s*1.35,y+s*.25);c.quadraticCurveTo(x+s*.9,y+s*.6,x-s,y+s*.55);c.closePath();ol(c,e.c||'#9aa0b4',2);
    circ(c,x+s*.15,y-s*.62,s*.36);ol(c,'#ffb3c1',1.8);circ(c,x+s*.72,y-s*.08,s*.11);c.fillStyle=INK;c.fill();circ(c,x+s*1.33,y+s*.24,s*.13);c.fillStyle='#ff6b8b';c.fill();return cv;},
  rocket(s,e){const cv=sprCanvas(3.6*s,2.2*s),c=ctxOf(cv),x=cv.width/2+s*.25,y=cv.height/2;
    c.beginPath();c.moveTo(x-s*.9,y-s*.34);c.quadraticCurveTo(x-s*1.5,y-s*.2,x-s*1.95,y);c.quadraticCurveTo(x-s*1.5,y+s*.2,x-s*.9,y+s*.34);c.closePath();ol(c,'#ffb02e',1.8,'#ff5a2e');
    [[-1],[1]].forEach(q=>{c.beginPath();c.moveTo(x-s*.35,y+q[0]*s*.42);c.lineTo(x-s*1.05,y+q[0]*s*.95);c.lineTo(x-s*.95,y+q[0]*s*.3);c.closePath();ol(c,'#ff5a5f',1.8);});
    c.beginPath();c.moveTo(x-s*.95,y-s*.45);c.quadraticCurveTo(x+s*.6,y-s*.62,x+s*1.45,y);c.quadraticCurveTo(x+s*.6,y+s*.62,x-s*.95,y+s*.45);c.closePath();ol(c,e.c||'#ffffff',2);
    c.save();c.beginPath();c.moveTo(x-s*.95,y-s*.45);c.quadraticCurveTo(x+s*.6,y-s*.62,x+s*1.45,y);c.quadraticCurveTo(x+s*.6,y+s*.62,x-s*.95,y+s*.45);c.closePath();c.clip();c.fillStyle='#ff5a5f';c.fillRect(x+s*.85,y-s,s,2*s);c.restore();
    circ(c,x+s*.25,y,s*.24);ol(c,'#5cc8ff',1.6);return cv;},
  ball(s,e){const cv=sprCanvas(e.ring?3.4*s:2*s+3,2*s+3),c=ctxOf(cv),x=cv.width/2,y=cv.height/2;
    if(e.ring){c.save();c.translate(x,y);c.rotate(-.3);c.beginPath();c.ellipse(0,0,s*1.6,s*.5,0,Math.PI,2*Math.PI);c.lineWidth=2.4;c.strokeStyle=e.c2||'#ffd76a';c.stroke();c.restore();}
    circ(c,x,y,s);ol(c,e.c||'#5cc8ff',1.8);c.save();circ(c,x,y,s-1);c.clip();c.fillStyle='rgba(255,255,255,.3)';circ(c,x-s*.35,y-s*.4,s*.5);c.fill();c.restore();
    if(e.ring){c.save();c.translate(x,y);c.rotate(-.3);c.beginPath();c.ellipse(0,0,s*1.6,s*.5,0,0,Math.PI);c.lineWidth=2.4;c.strokeStyle=e.c2||'#ffd76a';c.stroke();c.restore();}return cv;},
  bubble(s,e){const cv=sprCanvas(2*s+2,2*s+2),c=ctxOf(cv),m=cv.width/2;circ(c,m,m,s);c.fillStyle='rgba(255,255,255,.22)';c.fill();c.lineWidth=1.8;c.strokeStyle=e.c||'#e6f7ff';c.stroke();circ(c,m-s*.35,m-s*.35,s*.22);c.fillStyle='#ffffff';c.fill();return cv;},
  runner(s,e){const cv=sprCanvas(2.6*s,3.2*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2,col=e.c||'#ffd23f',
      limb=(pts,lw,cl)=>{[[lw+2.4,INK],[lw,cl]].forEach(q=>{c.beginPath();pts.forEach((p,i)=>c[i?'lineTo':'moveTo'](x+p[0]*s,y+p[1]*s));c.lineWidth=q[0];c.strokeStyle=q[1];c.lineCap='round';c.lineJoin='round';c.stroke();});};
    limb([[-.05,.2],[-.6,.55],[-.95,.2]],s*.26,'#3a4a7a');limb([[.15,-.55],[-.45,-.25],[-.6,-.6]],s*.2,'#ffd2a8');
    limb([[.2,-.7],[-.05,.2]],s*.5,col);
    limb([[-.05,.2],[.5,.5],[.35,1.15],[.7,1.2]],s*.26,'#3a4a7a');limb([[.15,-.55],[.7,-.3],[.95,-.7]],s*.2,'#ffd2a8');
    circ(c,x+s*.42,y-s*1.12,s*.34);ol(c,'#ffd2a8',1.8);return cv;},
  car(s,e){const cv=sprCanvas(3.3*s,1.9*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.1;
    c.beginPath();c.moveTo(x-s*1.5,y+s*.35);c.lineTo(x-s*1.5,y-s*.1);c.quadraticCurveTo(x-s*1.4,y-s*.3,x-s*.9,y-s*.32);c.lineTo(x-s*.55,y-s*.8);c.lineTo(x+s*.35,y-s*.8);c.lineTo(x+s*.8,y-s*.3);c.quadraticCurveTo(x+s*1.5,y-s*.25,x+s*1.55,y+s*.35);c.closePath();ol(c,e.c||'#ff4d4d',2);
    c.beginPath();c.moveTo(x-s*.42,y-s*.66);c.lineTo(x+s*.26,y-s*.66);c.lineTo(x+s*.58,y-s*.3);c.lineTo(x-s*.68,y-s*.3);c.closePath();ol(c,'#cdefff',1.4);
    [[-.85],[.85]].forEach(q=>{circ(c,x+q[0]*s,y+s*.38,s*.36);ol(c,'#2a2c36',1.8);circ(c,x+q[0]*s,y+s*.38,s*.13);c.fillStyle='#d5d8e0';c.fill();});
    circ(c,x+s*1.42,y+s*.02,s*.1);c.fillStyle='#fff3a0';c.fill();return cv;},
  loco(s,e){const cv=sprCanvas(3.6*s,2.7*s),c=ctxOf(cv),x=cv.width/2+s*.15,y=cv.height/2+s*.35;
    c.save();c.globalAlpha=.85;c.fillStyle='#ffffff';[[.2,-1.35,.3],[-.35,-1.5,.38],[-1.0,-1.45,.3]].forEach(q=>{circ(c,x+q[0]*s,y+q[1]*s,q[2]*s);c.fill();});c.restore();
    rr(c,x+s*.5,y-s*1.15,s*.34,s*.6,2);ol(c,'#2a2c36',1.8);
    rr(c,x-s*1.5,y-s*1.0,s*.95,s*1.3,3);ol(c,e.c||'#e8452c',2);rr(c,x-s*1.32,y-s*.8,s*.56,s*.45,2);ol(c,'#cdefff',1.4);
    rr(c,x-s*.6,y-s*.6,s*1.9,s*.9,s*.3);ol(c,e.c2||'#2f6fd0',2);
    c.beginPath();c.moveTo(x+s*1.3,y+s*.3);c.lineTo(x+s*1.7,y+s*.55);c.lineTo(x+s*1.3,y+s*.55);c.closePath();ol(c,'#ffc83c',1.6);
    [[-1.05],[-.2],[.7]].forEach(q=>{circ(c,x+q[0]*s,y+s*.5,s*.34);ol(c,'#2a2c36',1.8);circ(c,x+q[0]*s,y+s*.5,s*.12);c.fillStyle='#ffc83c';c.fill();});return cv;},
  fish(s,e){const cv=sprCanvas(3.1*s,1.9*s),c=ctxOf(cv),x=cv.width/2+s*.2,y=cv.height/2;
    c.beginPath();c.moveTo(x-s*.8,y);c.lineTo(x-s*1.6,y-s*.6);c.lineTo(x-s*1.4,y);c.lineTo(x-s*1.6,y+s*.6);c.closePath();ol(c,e.c2||'#ff7a3c',1.8);
    c.beginPath();c.moveTo(x-s*.2,y-s*.6);c.quadraticCurveTo(x+s*.1,y-s*1.0,x+s*.5,y-s*.5);c.closePath();ol(c,e.c2||'#ff7a3c',1.6);
    ell(c,x,y,s*1.05,s*.62);ol(c,e.c||'#ffa53c',2);
    c.save();ell(c,x,y,s*1.05-1,s*.62-1);c.clip();c.fillStyle='rgba(255,255,255,.85)';[-.35,.1].forEach(q=>c.fillRect(x+q*s,y-s,s*.2,2*s));c.restore();
    circ(c,x+s*.62,y-s*.12,s*.17);c.fillStyle='#ffffff';c.fill();circ(c,x+s*.67,y-s*.12,s*.09);c.fillStyle=INK;c.fill();return cv;},
  turtle(s,e){const cv=sprCanvas(3.2*s,2*s),c=ctxOf(cv),x=cv.width/2-s*.1,y=cv.height/2+s*.1;
    [[-.75,.5],[.55,.5]].forEach(q=>{ell(c,x+q[0]*s,y+q[1]*s,s*.3,s*.22,.3);ol(c,'#7bd389',1.6);});
    c.beginPath();c.moveTo(x-s*1.0,y+s*.2);c.lineTo(x-s*1.4,y+s*.3);ol(c,null,2.4,'#7bd389');
    ell(c,x+s*1.15,y-s*.05,s*.38,s*.3);ol(c,'#7bd389',1.8);circ(c,x+s*1.28,y-s*.12,s*.08);c.fillStyle=INK;c.fill();
    c.beginPath();c.moveTo(x-s*1.05,y+s*.3);c.quadraticCurveTo(x-s*.9,y-s*.95,x,y-s*.9);c.quadraticCurveTo(x+s*.9,y-s*.95,x+s*.95,y+s*.3);c.closePath();ol(c,e.c||'#2e9e4f',2);
    c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1.4;c.beginPath();c.moveTo(x-s*.45,y-s*.65);c.lineTo(x-s*.3,y+s*.25);c.moveTo(x+s*.4,y-s*.65);c.lineTo(x+s*.3,y+s*.25);c.stroke();return cv;},
  snail(s,e){const cv=sprCanvas(3.2*s,2.3*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.25;
    c.beginPath();c.moveTo(x-s*1.4,y+s*.7);c.quadraticCurveTo(x-s*.2,y+s*.2,x+s*.7,y+s*.3);c.quadraticCurveTo(x+s*1.2,y+s*.1,x+s*1.15,y-s*.55);c.quadraticCurveTo(x+s*1.5,y-s*.5,x+s*1.45,y+s*.2);c.quadraticCurveTo(x+s*1.3,y+s*.75,x+s*.6,y+s*.75);c.closePath();ol(c,'#ffe08a',1.8);
    c.beginPath();c.moveTo(x+s*1.2,y-s*.5);c.lineTo(x+s*1.1,y-s*1.0);c.moveTo(x+s*1.38,y-s*.48);c.lineTo(x+s*1.5,y-s*.95);ol(c,null,1.6);
    circ(c,x-s*.25,y-s*.15,s*.78);ol(c,e.c||'#c9793a',2);c.beginPath();c.arc(x-s*.25,y-s*.15,s*.45,.4,5.2);c.lineWidth=1.8;c.strokeStyle='#8a4a1e';c.stroke();c.beginPath();c.arc(x-s*.2,y-s*.12,s*.17,0,7);c.fillStyle='#8a4a1e';c.fill();return cv;},
  hare(s,e){const cv=sprCanvas(3.3*s,2.6*s),c=ctxOf(cv),x=cv.width/2-s*.1,y=cv.height/2+s*.35,f=e.c||'#f1ece4';
    [[.85,-1.25,-.35],[1.12,-1.2,.05]].forEach(q=>{ell(c,x+q[0]*s,y+q[1]*s,s*.17,s*.52,q[2]);ol(c,f,1.6);});
    ell(c,x-s*.75,y+s*.42,s*.5,s*.2,-.5);ol(c,f,1.6);ell(c,x+s*.55,y+s*.5,s*.42,s*.16,.4);ol(c,f,1.6);
    ell(c,x-s*.1,y-s*.05,s*.95,s*.55,-.12);ol(c,f,2);circ(c,x-s*1.05,y-s*.2,s*.22);ol(c,'#ffffff',1.6);
    circ(c,x+s*.95,y-s*.5,s*.42);ol(c,f,2);circ(c,x+s*1.1,y-s*.58,s*.08);c.fillStyle=INK;c.fill();circ(c,x+s*1.36,y-s*.42,s*.07);c.fillStyle='#ff6b8b';c.fill();return cv;},
  boat(s,e){const cv=sprCanvas(2.8*s,3*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.75;
    c.beginPath();c.moveTo(x-s*.05,y-s*.1);c.lineTo(x-s*.05,y-s*2.0);ol(c,null,1.8);
    c.beginPath();c.moveTo(x+s*.08,y-s*1.95);c.lineTo(x+s*1.05,y-s*.45);c.lineTo(x+s*.08,y-s*.45);c.closePath();ol(c,e.c||'#ffffff',1.6);
    c.beginPath();c.moveTo(x-s*.18,y-s*1.6);c.lineTo(x-s*.85,y-s*.45);c.lineTo(x-s*.18,y-s*.45);c.closePath();ol(c,'#ffd76a',1.6);
    c.beginPath();c.moveTo(x-s*1.25,y-s*.25);c.lineTo(x+s*1.3,y-s*.25);c.quadraticCurveTo(x+s*1.0,y+s*.55,x+s*.5,y+s*.55);c.lineTo(x-s*.7,y+s*.55);c.quadraticCurveTo(x-s*1.1,y+s*.4,x-s*1.25,y-s*.25);c.closePath();ol(c,e.c2||'#c9793a',2);return cv;},
  blip(s,e){const cv=sprCanvas(3*s,3*s),c=ctxOf(cv),m=cv.width/2,col=e.c||'#3dff7a';circ(c,m,m,s*1.3);c.lineWidth=1.6;c.strokeStyle=rgba(col,.45);c.stroke();
    c.beginPath();c.moveTo(m,m-s);c.lineTo(m+s,m);c.lineTo(m,m+s);c.lineTo(m-s,m);c.closePath();c.fillStyle=col;c.fill();return cv;},
  notch(s,e){const w=e.w||20,cv=sprCanvas(w,2*s),c=ctxOf(cv);rr(c,1,1,w,2*s,Math.min(4,w/3));c.fillStyle=e.c||'#000000';c.fill();return cv;},
  lens(s,e){const cv=sprCanvas(2*s+3,2*s+3),c=ctxOf(cv),m=cv.width/2,col=e.c||'#ff8a3c';circ(c,m,m,s);c.fillStyle=rgba(col,.24);c.fill();c.lineWidth=2.4;c.strokeStyle=col;c.stroke();return cv;},
  tomato(s,e){const cv=sprCanvas(2.4*s,2.5*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.15;ell(c,x,y,s*1.05,s*.95);ol(c,e.c||'#ff4d3a',2);
    c.save();c.globalAlpha=.4;c.fillStyle='#ffffff';ell(c,x-s*.4,y-s*.35,s*.28,s*.18,-.6);c.fill();c.restore();
    c.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?s*.2:s*.58;c[k?'lineTo':'moveTo'](x+r*Math.cos(a),y-s*.82+r*Math.sin(a)*.6);}c.closePath();ol(c,'#3fbf62',1.4);return cv;},
  butterfly(s,e){const cv=sprCanvas(2.6*s,2.6*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.35,col=e.c||'#ff9f43';
    [[-.5,-.6,.75,.55,-.5],[.5,-.6,.75,.55,.5],[-.38,.1,.5,.38,.5],[.38,.1,.5,.38,-.5]].forEach(q=>{ell(c,x+q[0]*s,y+q[1]*s,q[2]*s,q[3]*s,q[4]);ol(c,col,1.6);});
    c.fillStyle='#ffffff';[[-.55,-.65],[.55,-.65]].forEach(q=>{circ(c,x+q[0]*s,y+q[1]*s,s*.17);c.fill();});
    ell(c,x,y-s*.2,s*.14,s*.62);c.fillStyle=INK;c.fill();return cv;},
  apple(s,e){const cv=sprCanvas(2.4*s,2.7*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.25;
    c.beginPath();c.moveTo(x,y-s*.75);c.bezierCurveTo(x+s*1.3,y-s*1.25,x+s*1.25,y+s*.9,x,y+s*.85);c.bezierCurveTo(x-s*1.25,y+s*.9,x-s*1.3,y-s*1.25,x,y-s*.75);c.closePath();ol(c,e.c||'#ff4d4d',2);
    c.beginPath();c.moveTo(x,y-s*.7);c.lineTo(x+s*.1,y-s*1.2);ol(c,null,1.8,'#6b4a2e');ell(c,x+s*.45,y-s*1.08,s*.34,s*.17,-.5);ol(c,'#3fbf62',1.4);
    c.save();c.globalAlpha=.4;c.fillStyle='#ffffff';ell(c,x-s*.45,y-s*.2,s*.2,s*.32,.3);c.fill();c.restore();return cv;},
  fly(s,e){const cv=sprCanvas(2.4*s,2.2*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.2;c.save();c.globalAlpha=.85;[[-.3,-.5],[.3,-.5]].forEach(q=>{ell(c,x+q[0]*s,y+q[1]*s,s*.4,s*.55,q[0]*2);ol(c,'#eaf6ff',1.2);});c.restore();ell(c,x,y,s*.75,s*.5);c.fillStyle=e.c||INK;c.fill();circ(c,x+s*.6,y-s*.05,s*.3);c.fillStyle='#b02a2a';c.fill();return cv;},
  leaf(s,e){const cv=sprCanvas(2.6*s,1.8*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2;c.beginPath();c.moveTo(x-s*1.1,y);c.quadraticCurveTo(x,y-s*1.0,x+s*1.1,y);c.quadraticCurveTo(x,y+s*1.0,x-s*1.1,y);c.closePath();ol(c,e.c||'#3fbf62',1.8);c.beginPath();c.moveTo(x-s*.8,y);c.lineTo(x+s*.8,y);ol(c,null,1.2,'rgba(0,0,0,.35)');return cv;},
  dart(s,e){const cv=sprCanvas(1.6*s,3.4*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2,col=e.c||'#ffd23f';
    c.beginPath();c.moveTo(x,y+s*1.6);c.lineTo(x,y+s*.6);ol(c,null,1.8,'#d5d8e0');rr(c,x-s*.2,y-s*.5,s*.4,s*1.2,s*.15);ol(c,'#8a8f9c',1.6);
    [[-1],[1]].forEach(q=>{c.beginPath();c.moveTo(x,y-s*.4);c.lineTo(x+q[0]*s*.7,y-s*1.0);c.lineTo(x+q[0]*s*.7,y-s*1.6);c.lineTo(x,y-s*1.0);c.closePath();ol(c,col,1.6);});return cv;},
  ladybug(s,e){const cv=sprCanvas(2.6*s,1.9*s),c=ctxOf(cv),x=cv.width/2-s*.1,y=cv.height/2+s*.2;circ(c,x+s*.85,y,s*.42);ol(c,INK,1.4);
    c.beginPath();c.moveTo(x-s,y+s*.45);c.quadraticCurveTo(x-s*.95,y-s*.85,x,y-s*.8);c.quadraticCurveTo(x+s*.95,y-s*.85,x+s,y+s*.45);c.closePath();ol(c,e.c||'#e8452c',1.8);
    c.fillStyle=INK;[[-.45,-.2,.2],[.3,-.3,.2],[-.05,.1,.17]].forEach(q=>{circ(c,x+q[0]*s,y+q[1]*s,q[2]*s);c.fill();});circ(c,x+s*1.0,y-s*.1,s*.09);c.fillStyle='#ffffff';c.fill();return cv;},
  plane(s,e){const cv=sprCanvas(3.2*s,2.4*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2;
    c.beginPath();c.moveTo(x-s*.1,y-s*.1);c.lineTo(x-s*.7,y-s*1.05);c.lineTo(x-s*.25,y-s*1.05);c.lineTo(x+s*.5,y-s*.1);c.closePath();ol(c,'#cfd6e4',1.6);
    c.beginPath();c.moveTo(x-s*1.5,y-s*.15);c.lineTo(x+s*.9,y-s*.3);c.quadraticCurveTo(x+s*1.55,y-s*.15,x+s*1.5,y+s*.1);c.quadraticCurveTo(x+s*1.2,y+s*.35,x-s*1.3,y+s*.25);c.closePath();ol(c,e.c||'#ffffff',1.8);
    c.beginPath();c.moveTo(x-s*1.45,y-s*.1);c.lineTo(x-s*1.6,y-s*.8);c.lineTo(x-s*1.15,y-s*.8);c.lineTo(x-s*.9,y-s*.15);c.closePath();ol(c,e.c2||'#e8452c',1.6);
    c.beginPath();c.moveTo(x-s*.2,y+s*.15);c.lineTo(x-s*.8,y+s*1.0);c.lineTo(x-s*.35,y+s*1.0);c.lineTo(x+s*.45,y+s*.15);c.closePath();ol(c,'#eef2f8',1.6);
    c.fillStyle='#5cc8ff';[.1,.5,.9].forEach(q=>{circ(c,x+q*s,y-s*.06,s*.1);c.fill();});return cv;},
  sat(s,e){const cv=sprCanvas(3.2*s,1.6*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2;[[-1],[1]].forEach(q=>{rr(c,x+q[0]*s*.95-s*.5,y-s*.4,s,s*.8,2);ol(c,'#3f7fe0',1.4);c.beginPath();c.moveTo(x+q[0]*s*.95,y-s*.4);c.lineTo(x+q[0]*s*.95,y+s*.4);ol(c,null,1,'rgba(255,255,255,.6)');});
    rr(c,x-s*.42,y-s*.55,s*.84,s*1.1,3);ol(c,e.c||'#d5d8e0',1.6);circ(c,x,y,s*.18);c.fillStyle='#ffc83c';c.fill();return cv;},
  tri(s,e){const cv=sprCanvas(1.8*s,1.8*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2,d=e.up?-1:1;c.beginPath();c.moveTo(x,y+d*s*.8);c.lineTo(x+s*.8,y-d*s*.7);c.lineTo(x-s*.8,y-d*s*.7);c.closePath();c.fillStyle=e.c||'#ffffff';c.fill();return cv;},
  ghost(s,e){const cv=sprCanvas(2.2*s,2.7*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2;
    c.beginPath();c.moveTo(x-s*.9,y+s*1.1);c.lineTo(x-s*.9,y-s*.3);c.bezierCurveTo(x-s*.9,y-s*1.5,x+s*.9,y-s*1.5,x+s*.9,y-s*.3);c.lineTo(x+s*.9,y+s*1.1);c.lineTo(x+s*.45,y+s*.75);c.lineTo(x,y+s*1.1);c.lineTo(x-s*.45,y+s*.75);c.closePath();ol(c,e.c||'#ffffff',2);
    c.fillStyle=INK;[[-.25],[.45]].forEach(q=>{ell(c,x+q[0]*s,y-s*.35,s*.16,s*.24);c.fill();});ell(c,x+s*.1,y+s*.15,s*.14,s*.18);c.fill();return cv;},
  bat(s,e){const cv=sprCanvas(3.4*s,1.9*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2,col=e.c||'#7a4bd8';
    [[-1],[1]].forEach(q=>{c.beginPath();c.moveTo(x+q[0]*s*.25,y-s*.2);c.quadraticCurveTo(x+q[0]*s*1.0,y-s*1.1,x+q[0]*s*1.6,y-s*.3);c.quadraticCurveTo(x+q[0]*s*1.3,y+s*.1,x+q[0]*s*1.2,y+s*.55);c.quadraticCurveTo(x+q[0]*s*.9,y+s*.1,x+q[0]*s*.7,y+s*.55);c.quadraticCurveTo(x+q[0]*s*.5,y+s*.15,x+q[0]*s*.25,y+s*.35);c.closePath();ol(c,col,1.6);});
    ell(c,x,y,s*.38,s*.55);ol(c,col,1.6);c.fillStyle='#ffe14a';[[-.14],[.14]].forEach(q=>{circ(c,x+q[0]*s,y-s*.15,s*.08);c.fill();});return cv;},
  ufo(s,e){const cv=sprCanvas(3.2*s,1.9*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.2;c.beginPath();c.arc(x,y-s*.15,s*.62,Math.PI,0);c.closePath();ol(c,'#9fe8ff',1.6);
    ell(c,x,y,s*1.45,s*.42);ol(c,e.c||'#c9d6e6',1.8);c.fillStyle='#ffe14a';[-.9,-.3,.3,.9].forEach(q=>{circ(c,x+q*s,y+s*.05,s*.11);c.fill();});return cv;},
  soccer(s,e){const cv=sprCanvas(2*s+3,2*s+3),c=ctxOf(cv),m=cv.width/2;circ(c,m,m,s);ol(c,'#ffffff',1.6);c.fillStyle=INK;c.beginPath();for(let k=0;k<5;k++){const a=k*2*Math.PI/5-Math.PI/2;c[k?'lineTo':'moveTo'](m+s*.36*Math.cos(a),m+s*.36*Math.sin(a));}c.closePath();c.fill();
    c.lineWidth=1.2;c.strokeStyle=INK;for(let k=0;k<5;k++){const a=k*2*Math.PI/5-Math.PI/2;c.beginPath();c.moveTo(m+s*.36*Math.cos(a),m+s*.36*Math.sin(a));c.lineTo(m+s*.95*Math.cos(a),m+s*.95*Math.sin(a));c.stroke();}return cv;},
  bean(s,e){const cv=sprCanvas(2.4*s,1.8*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2;ell(c,x,y,s*1.05,s*.7,-.2);ol(c,e.c||'#6b3f22',1.8);c.beginPath();c.moveTo(x-s*.8,y+s*.15);c.quadraticCurveTo(x,y-s*.5,x+s*.8,y-s*.2);ol(c,null,1.6,'#2e1a0c');return cv;},
  skier(s,e){const cv=sprCanvas(3*s,3.1*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2,col=e.c||'#e8452c',
      limb=(pts,lw,cl)=>{[[lw+2.2,INK],[lw,cl]].forEach(q=>{c.beginPath();pts.forEach((p,i)=>c[i?'lineTo':'moveTo'](x+p[0]*s,y+p[1]*s));c.lineWidth=q[0];c.strokeStyle=q[1];c.lineCap='round';c.lineJoin='round';c.stroke();});};
    limb([[-1.3,1.3],[1.35,1.3]],s*.14,'#ffd23f');limb([[.75,-.2],[1.1,1.2]],s*.1,'#8a8f9c');
    limb([[-.15,.25],[.25,.75],[-.05,1.2]],s*.26,'#2f4f9a');limb([[.1,-.65],[-.15,.25]],s*.5,col);limb([[.1,-.5],[.75,-.2]],s*.2,col);
    circ(c,x+s*.3,y-s*1.05,s*.32);ol(c,'#ffd2a8',1.6);c.beginPath();c.arc(x+s*.3,y-s*1.1,s*.34,Math.PI*1.05,Math.PI*1.95);ol(c,null,3,'#2f4f9a');return cv;},
  heart(s,e){const cv=sprCanvas(2.2*s,2.2*s),c=ctxOf(cv);c.save();c.translate(1,1);c.fillStyle=e.c||'#ff5a7a';ICONS.heart(c,2.2*s);c.restore();return cv;},
  bee(s,e){const cv=sprCanvas(3*s,2.8*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.3;
    c.save();c.globalAlpha=.9;[[-.25,-.2],[.3,.15]].forEach(q=>{ell(c,x+q[0]*s,y-s*.85,s*.42,s*.62,q[1]*3);ol(c,'#eaf6ff',1.6);});c.restore();
    c.beginPath();c.moveTo(x-s*1.05,y);c.lineTo(x-s*1.4,y);ol(c,null,1.8);
    ell(c,x,y,s*1.05,s*.72);ol(c,e.c||'#ffd23f',2);
    c.save();ell(c,x,y,s*1.05-1,s*.72-1);c.clip();c.fillStyle=INK;[-.5,0].forEach(q=>c.fillRect(x+q*s-s*.12,y-s,s*.26,2*s));c.restore();
    circ(c,x+s*.62,y-s*.12,s*.14);c.fillStyle=INK;c.fill();return cv;}
};
