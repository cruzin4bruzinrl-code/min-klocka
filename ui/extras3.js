// ================= Hela scener: en bild som fyller urtavlan, med tid och värden ovanpå =================
Object.assign(ICONS,{
  feet(c,s){[[.3,.36,-.2],[.7,.64,.2]].forEach(q=>{c.beginPath();c.ellipse(s*q[0],s*q[1]+s*.06,s*.15,s*.24,q[2],0,7);c.fill();c.beginPath();c.arc(s*q[0]-s*.02,s*q[1]-s*.27,s*.085,0,7);c.fill();});},
  batt(c,s){c.lineWidth=s*.1;c.strokeStyle=c.fillStyle;rr(c,s*.22,s*.16,s*.56,s*.78,s*.12);c.stroke();rr(c,s*.38,s*.03,s*.24,s*.12,s*.04);c.fill();rr(c,s*.32,s*.44,s*.36,s*.4,s*.05);c.fill();},
  paw(c,s){c.beginPath();c.ellipse(s*.5,s*.66,s*.25,s*.2,0,0,7);c.fill();[[.2,.4],[.4,.22],[.62,.22],[.82,.4]].forEach(q=>{c.beginPath();c.ellipse(s*q[0],s*q[1],s*.1,s*.13,0,0,7);c.fill();});}
});
function sStars(c,list,col){list.forEach(p=>{c.fillStyle=rgba(col||'#ffffff',p[3]===undefined?.8:p[3]);c.beginPath();c.arc(p[0],p[1],p[2]||1.4,0,7);c.fill();});}
function sStar(c,x,y,r,col,glow){if(glow){const g=c.createRadialGradient(x,y,0,x,y,r*3.2);g.addColorStop(0,rgba(col,.6));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(x-r*4,y-r*4,r*8,r*8);}
  const st=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;st.push([x+q*Math.cos(a),y+q*Math.sin(a)]);}U(c,col,1.6,[P_(c,st)]);}
function sCloud(c,x,y,r,col,a){c.save();c.globalAlpha=a===undefined?1:a;c.fillStyle=col||'#ffffff';[[0,0,1],[r*1.05,-r*.5,1.25],[r*2.3,-r*.1,1.05],[r*3.2,r*.12,.8]].forEach(q=>{c.beginPath();c.arc(x+q[0],y+q[1],r*q[2],0,7);c.fill();});rr(c,x-r*.2,y,r*3.7,r*.95,r*.45);c.fill();c.restore();}
function sWave(c,y,amp,len,col,ph){c.fillStyle=col;c.beginPath();c.moveTo(0,286);c.lineTo(0,y);for(let x=0;x<=240;x+=6)c.lineTo(x,y+amp*Math.sin(x/len+(ph||0)));c.lineTo(240,286);c.closePath();c.fill();}
// Pixelbild: varje rad är en textrad, varje tecken en färg ur paletten
function sPixel(c,rows,pal,x,y,k){rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const col=pal[r[i]];if(col){c.fillStyle=col;c.fillRect(x+i*k,y+j*k,k,k);}}});}

Object.assign(TOONS,{
  astro(c){   // astronaut som metar en stjärna från månen
    sStars(c,[[150,40,1.6],[214,74,1.2],[178,236,1.4],[226,214,1.8],[104,22,1.2],[20,40,1.4],[226,262,1.2],[194,20,1],[60,18,1]]);sStar(c,36,84,6,'#ffe14a');sStar(c,206,258,5,'#ffe14a');
    const g=c.createRadialGradient(30,330,60,30,330,190);g.addColorStop(0,'#6a60c4');g.addColorStop(1,'#a79df0');c.beginPath();c.arc(30,330,186,0,7);c.fillStyle=g;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
    [[40,216,15,7],[112,236,12,5.5],[70,262,18,8],[150,272,11,5],[18,250,9,4]].forEach(q=>{c.beginPath();c.ellipse(q[0],q[1],q[2],q[3],-.25,0,7);c.fillStyle='#7d73d0';c.fill();c.lineWidth=2;c.strokeStyle='#5d54ae';c.stroke();});
    // metspö och lina
    c.lineCap='round';c.beginPath();c.moveTo(84,172);c.lineTo(132,112);c.lineWidth=5;c.strokeStyle=INK;c.stroke();c.lineWidth=2.4;c.strokeStyle='#d9b38c';c.stroke();
    c.beginPath();c.moveTo(132,112);c.lineTo(132,222);c.lineWidth=1.4;c.strokeStyle='rgba(255,255,255,.75)';c.stroke();sStar(c,132,232,11,'#ffe14a',true);
    // astronauten sitter på kanten
    U(c,'#c9cee0',2.6,[R_(c,30,150,22,40,8)]);U(c,'#f4f6fb',2.8,[R_(c,40,146,44,50,16),R_(c,48,184,17,34,8),R_(c,68,186,17,32,8)]);
    U(c,'#c9cee0',2.4,[R_(c,45,212,23,12,6),R_(c,65,212,23,12,6)]);U(c,'#f4f6fb',2.6,[R_(c,70,160,26,14,7)]);U(c,'#c9cee0',2.2,[C_(c,96,168,7)]);
    c.fillStyle='#ff5a5f';c.fillRect(52,168,10,5);c.fillStyle='#4ea1ff';c.fillRect(52,176,10,5);
    U(c,'#f4f6fb',3,[C_(c,62,122,29)]);const v=c.createLinearGradient(44,104,84,140);v.addColorStop(0,'#2a2f6a');v.addColorStop(1,'#0b0d26');c.beginPath();c.ellipse(66,124,20,18,0,0,7);c.fillStyle=v;c.fill();c.lineWidth=2.4;c.strokeStyle=INK;c.stroke();
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2.6;c.beginPath();c.arc(66,124,13,Math.PI*1.1,Math.PI*1.5);c.stroke();sStars(c,[[74,130,1.6,.9],[60,120,1,.7]]);
  },
  sleepcat(c){   // katt som sover ovanpå tiden
    U(c,'#ff9f43',3,[()=>{c.moveTo(196,70);c.bezierCurveTo(238,64,236,16,206,22);c.bezierCurveTo(222,30,216,52,194,54);c.closePath();}]);
    U(c,'#ff9f43',3.2,[E_(c,128,62,84,38)]);c.save();c.beginPath();c.ellipse(128,62,84,38,0,0,7);c.clip();c.fillStyle='#e8842a';[[150,20,10,60],[176,24,10,56],[124,22,9,40]].forEach(q=>{c.beginPath();c.ellipse(q[0],q[1]+q[3]/2,q[2]/2,q[3]/2,.1,0,7);c.fill();});c.fillStyle='#fff3e0';c.beginPath();c.ellipse(120,98,70,16,0,0,7);c.fill();c.restore();
    U(c,'#ff9f43',3,[P_(c,[[30,46],[36,14],[62,34]]),P_(c,[[74,30],[98,12],[104,44]])]);c.fillStyle='#ffc9b0';c.beginPath();P_(c,[[38,40],[40,24],[54,36]])();c.fill();c.beginPath();P_(c,[[82,32],[95,22],[97,40]])();c.fill();
    U(c,'#ff9f43',3.2,[E_(c,66,62,40,34)]);c.fillStyle='#fff3e0';c.beginPath();c.ellipse(64,76,24,16,0,0,7);c.fill();
    c.strokeStyle=INK;c.lineWidth=2.8;c.lineCap='round';[[50,60],[82,60]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],7,Math.PI*.1,Math.PI*.9);c.stroke();});
    c.fillStyle='#ff7a9a';c.beginPath();P_(c,[[62,70],[70,70],[66,75]])();c.fill();c.beginPath();c.moveTo(66,75);c.quadraticCurveTo(60,84,54,78);c.moveTo(66,75);c.quadraticCurveTo(72,84,78,78);c.lineWidth=2.2;c.stroke();cheeks(c,66,72,26,5);
    c.fillStyle='#e8842a';[[60,34],[68,32],[76,35]].forEach(p=>{c.beginPath();c.ellipse(p[0],p[1],2.4,6,0,0,7);c.fill();});
    U(c,'#fff3e0',2.8,[E_(c,44,98,13,17),E_(c,104,100,13,17)]);c.strokeStyle=INK;c.lineWidth=1.8;[[40,106],[48,106],[100,108],[108,108]].forEach(p=>{c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0],p[1]+7);c.stroke();});
    text(c,'z',112,10,13,'pb','rgba(255,255,255,.7)','l',0);text(c,'z',124,0,10,'pb','rgba(255,255,255,.5)','l',0);
  },
  sunflower(c){   // solros med tiden i mitten
    sCloud(c,150,40,10,'#ffffff',.85);sCloud(c,6,70,8,'#ffffff',.7);
    c.lineCap='round';c.beginPath();c.moveTo(120,200);c.quadraticCurveTo(112,250,120,290);c.lineWidth=16;c.strokeStyle=INK;c.stroke();c.lineWidth=10;c.strokeStyle='#3fae5a';c.stroke();
    [[-1,74,246],[1,166,252]].forEach(q=>{U(c,'#3fae5a',2.8,[()=>{c.moveTo(118,262);c.quadraticCurveTo(q[1],214,q[1]+q[0]*-52,236);c.quadraticCurveTo(q[1]+q[0]*-10,286,118,270);c.closePath();}]);c.strokeStyle='rgba(20,80,40,.5)';c.lineWidth=2;c.beginPath();c.moveTo(118,266);c.quadraticCurveTo(q[1],240,q[1]+q[0]*-44,240);c.stroke();});
    for(let k=0;k<16;k++){const a=k*Math.PI/8+.2;c.save();c.translate(120,143);c.rotate(a);c.beginPath();c.ellipse(0,-72,15,30,0,0,7);c.fillStyle='#f5a623';c.fill();c.lineWidth=2.6;c.strokeStyle=INK;c.stroke();c.restore();}
    for(let k=0;k<16;k++){const a=k*Math.PI/8;c.save();c.translate(120,143);c.rotate(a);c.beginPath();c.ellipse(0,-68,16,32,0,0,7);const g=c.createLinearGradient(0,-100,0,-40);g.addColorStop(0,'#ffe14a');g.addColorStop(1,'#ffb02e');c.fillStyle=g;c.fill();c.lineWidth=2.6;c.strokeStyle=INK;c.stroke();c.restore();}
    const g=c.createRadialGradient(112,134,6,120,143,54);g.addColorStop(0,'#3b6b2a');g.addColorStop(1,'#1c3a16');c.beginPath();c.arc(120,143,52,0,7);c.fillStyle=g;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
    c.strokeStyle='rgba(255,225,74,.35)';c.lineWidth=2;c.setLineDash([2,6]);c.beginPath();c.arc(120,143,45,0,7);c.stroke();c.setLineDash([]);
  },
  whale(c){   // val i vågorna
    sCloud(c,20,30,9,'#ffffff',.35);sStars(c,[[30,90,1.4,.5],[214,110,1.2,.5]]);
    sWave(c,176,6,18,'#2f7fe8',0);
    U(c,'#2f66d8',3,[()=>{c.moveTo(182,146);c.bezierCurveTo(214,132,222,104,206,84);c.bezierCurveTo(226,82,238,98,234,116);c.bezierCurveTo(240,110,246,120,238,132);c.bezierCurveTo(226,152,206,164,186,168);c.closePath();}]);
    const g=c.createLinearGradient(0,96,0,214);g.addColorStop(0,'#3f7fee');g.addColorStop(1,'#2450b8');U(c,g,3.2,[()=>{c.moveTo(18,160);c.bezierCurveTo(14,112,70,92,116,98);c.bezierCurveTo(164,104,196,132,196,160);c.bezierCurveTo(196,192,150,212,100,208);c.bezierCurveTo(54,206,22,196,18,160);c.closePath();}]);
    c.save();c.beginPath();c.moveTo(18,160);c.bezierCurveTo(14,112,70,92,116,98);c.bezierCurveTo(164,104,196,132,196,160);c.bezierCurveTo(196,192,150,212,100,208);c.bezierCurveTo(54,206,22,196,18,160);c.closePath();c.clip();
    c.fillStyle='#e9f3ff';c.beginPath();c.ellipse(86,204,84,36,-.06,0,7);c.fill();c.strokeStyle='rgba(60,110,200,.45)';c.lineWidth=2;[176,186,196].forEach((y,i)=>{c.beginPath();c.moveTo(22+i*6,y);c.quadraticCurveTo(86,y+12,150-i*8,y);c.stroke();});c.restore();
    U(c,'#2450b8',2.6,[()=>{c.moveTo(108,176);c.quadraticCurveTo(132,196,120,214);c.quadraticCurveTo(100,206,96,184);c.closePath();}]);
    c.beginPath();c.arc(58,148,6.5,0,7);c.fillStyle=INK;c.fill();c.beginPath();c.arc(56,146,2.2,0,7);c.fillStyle='#fff';c.fill();c.beginPath();c.arc(40,164,16,.1*Math.PI,.6*Math.PI);c.lineWidth=2.6;c.strokeStyle=INK;c.stroke();cheeks(c,62,164,0,6);
    // fontän
    c.lineCap='round';[[78,96,60,62],[86,96,104,58],[82,96,82,48]].forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.quadraticCurveTo((q[0]+q[2])/2,q[3]-8,q[2],q[3]+12);c.lineWidth=6.5;c.strokeStyle=INK;c.stroke();c.lineWidth=3.5;c.strokeStyle='#bfe6ff';c.stroke();});
    [[54,80,5],[110,74,5],[82,40,5.5],[66,56,3.5],[100,52,3.5]].forEach(q=>{U(c,'#bfe6ff',1.6,[C_(c,q[0],q[1],q[2])]);});
    sWave(c,204,7,16,'#58a6ff',1.4);sWave(c,222,6,20,'#2f7fe8',.4);sWave(c,242,5,22,'#1f58c8',2.2);
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2.4;[[30,214,14],[150,210,16],[204,224,12],[96,232,14]].forEach(q=>{c.beginPath();c.arc(q[0],q[1],q[2],Math.PI*1.15,Math.PI*1.85);c.stroke();});
  },
  launch(c){   // raket på väg upp över jorden
    sStars(c,[[30,24,1.3],[210,30,1.6],[224,110,1.2],[16,112,1.2],[150,16,1]]);
    const e=c.createRadialGradient(210,360,40,210,360,170);e.addColorStop(0,'#2f9e52');e.addColorStop(1,'#1f6fd8');c.beginPath();c.arc(210,372,160,0,7);c.fillStyle=e;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
    c.fillStyle='#3fbf62';[[150,246,34,14],[214,236,30,12],[236,268,26,12]].forEach(q=>{c.beginPath();c.ellipse(q[0],q[1],q[2],q[3],-.3,0,7);c.fill();});
    // rökpelare
    const g=c.createLinearGradient(20,286,104,186);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,236,170,.9)');c.beginPath();c.moveTo(-10,300);c.lineTo(74,196);c.lineTo(98,214);c.lineTo(60,300);c.closePath();c.fillStyle=g;c.fill();
    sCloud(c,-6,262,15,'#ffffff');sCloud(c,34,274,13,'#f2f6ff');sCloud(c,-12,238,11,'#ffffff');
    c.save();c.translate(96,180);c.rotate(.62);
    U(c,'#ff8a3c',2.6,[()=>{c.moveTo(-9,34);c.quadraticCurveTo(0,74,9,34);c.closePath();}]);c.fillStyle='#ffe14a';c.beginPath();c.moveTo(-5,34);c.quadraticCurveTo(0,58,5,34);c.closePath();c.fill();
    U(c,'#ff5a5f',2.8,[P_(c,[[-17,14],[-33,40],[-15,34]]),P_(c,[[17,14],[33,40],[15,34]])]);
    U(c,'#f4f6fb',3,[()=>{c.moveTo(0,-56);c.bezierCurveTo(26,-30,22,12,15,36);c.lineTo(-15,36);c.bezierCurveTo(-22,12,-26,-30,0,-56);c.closePath();}]);
    c.save();c.beginPath();c.moveTo(0,-56);c.bezierCurveTo(26,-30,22,12,15,36);c.lineTo(-15,36);c.bezierCurveTo(-22,12,-26,-30,0,-56);c.closePath();c.clip();c.fillStyle='#ff5a5f';c.fillRect(-30,-60,60,24);c.fillRect(-30,26,60,12);c.restore();
    U(c,'#58b7ff',2.4,[C_(c,0,-8,10)]);c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(-3,-11,3,0,7);c.fill();c.restore();
  },
  peekcat(c){   // svart katt som tittar upp nerifrån
    c.strokeStyle='rgba(255,200,60,.9)';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(14,34);c.lineTo(44,34);c.stroke();c.beginPath();c.moveTo(14,34);c.lineTo(14,52);c.stroke();
    const body=()=>{c.moveTo(-10,296);c.lineTo(-10,236);c.lineTo(8,170);c.lineTo(50,214);c.quadraticCurveTo(92,196,134,214);c.lineTo(178,170);c.lineTo(194,240);c.quadraticCurveTo(198,270,190,296);c.closePath();};
    c.beginPath();body();c.fillStyle='#14161f';c.fill();c.lineWidth=3;c.strokeStyle='#3d425c';c.lineJoin='round';c.stroke();
    c.fillStyle='#2a2d40';c.beginPath();P_(c,[[18,196],[22,184],[38,208]])();c.fill();c.beginPath();P_(c,[[168,196],[164,184],[148,208]])();c.fill();
    [[56,250],[130,250]].forEach(p=>{const g=c.createRadialGradient(p[0],p[1],2,p[0],p[1],22);g.addColorStop(0,'#ffe14a');g.addColorStop(1,'#f5a623');c.beginPath();c.ellipse(p[0],p[1],21,23,0,0,7);c.fillStyle=g;c.fill();c.lineWidth=2.6;c.strokeStyle='#0a0b10';c.stroke();
      c.beginPath();c.ellipse(p[0],p[1],6,17,0,0,7);c.fillStyle='#0a0b10';c.fill();c.beginPath();c.arc(p[0]-6,p[1]-9,3.4,0,7);c.fillStyle='rgba(255,255,255,.85)';c.fill();});
    c.fillStyle='#ff7a9a';c.beginPath();P_(c,[[87,274],[99,274],[93,282]])();c.fill();
    c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.6;[[70,278,20,272],[70,284,22,288],[116,278,170,272],[116,284,168,288]].forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[2],q[3]);c.stroke();});
    c.fillStyle='rgba(255,255,255,.16)';[[206,236,14],[224,258,11]].forEach(q=>{c.save();c.translate(q[0]-q[2]/2,q[1]-q[2]/2);ICONS.paw(c,q[2]);c.restore();});
  },
  rainbow(c){   // glatt moln med regnbåge
    ['#ff5a5f','#ff9f43','#ffe14a','#5fe39a','#4ea1ff','#a37bff'].forEach((col,i)=>{c.beginPath();c.arc(70,196,150-i*11,Math.PI*1.02,Math.PI*1.72);c.lineWidth=11.5;c.strokeStyle=col;c.stroke();});
    sCloud(c,150,238,14,'#ffffff',.9);sCloud(c,-14,56,10,'#ffffff',.8);
    U(c,'#ffffff',3,[C_(c,52,176,30),C_(c,92,156,38),C_(c,134,172,31),C_(c,110,190,30),C_(c,72,194,26),R_(c,40,176,106,38,18)]);
    c.fillStyle='rgba(160,190,235,.35)';c.beginPath();c.ellipse(100,206,56,10,0,0,7);c.fill();
    toonEye(c,80,170,7,0,1);toonEye(c,112,170,7,0,1);toonSmile(c,96,184,9,8,2.6);cheeks(c,96,182,30,6.5);
    [[58,232],[86,244],[114,234],[138,246]].forEach(p=>{U(c,'#7fc8ff',1.8,[()=>{c.moveTo(p[0],p[1]-9);c.quadraticCurveTo(p[0]+7,p[1]+2,p[0],p[1]+6);c.quadraticCurveTo(p[0]-7,p[1]+2,p[0],p[1]-9);c.closePath();}]);});
  },
  pixelrun(c){   // pixelvärld med en egen figur: en orange katt på äventyr
    const k=4;c.fillStyle='#ffffff';[[16,96,9],[28,92,6],[150,116,8],[160,112,5],[196,150,7]].forEach(q=>{c.fillRect(q[0],q[1],q[2]*k,k*2);c.fillRect(q[0]+k,q[1]-k,(q[2]-2)*k,k);});
    // mark: gräs överst, jord under
    const ground=(x,y,w)=>{c.fillStyle='#8a5a2e';c.fillRect(x,y+8,w,286-y);c.fillStyle='#6f4520';for(let yy=y+16;yy<286;yy+=12)for(let xx=x+((yy/12)%2?4:10);xx<x+w-4;xx+=16)c.fillRect(xx,yy,6,4);c.fillStyle='#3fae5a';c.fillRect(x,y,w,10);c.fillStyle='#58c26a';c.fillRect(x,y,w,4);c.fillStyle='#2e8a45';for(let xx=x;xx<x+w;xx+=8)c.fillRect(xx,y+10,4,4);};
    ground(0,238,112);ground(136,214,104);
    // mynt och flagga
    [[84,196],[108,182],[132,170]].forEach(p=>{c.fillStyle='#b8860b';c.fillRect(p[0]-2,p[1]-2,12,16);c.fillStyle='#ffd23f';c.fillRect(p[0],p[1],8,12);c.fillStyle='#fff3a0';c.fillRect(p[0]+2,p[1]+2,2,6);});
    c.fillStyle='#e6ebf2';c.fillRect(214,162,4,52);c.fillStyle='#ff5a5f';c.fillRect(194,162,20,16);c.fillStyle='#ffffff';c.fillRect(200,168,6,4);
    sPixel(c,['..o....o....','.ooo..ooo...','.oooooooo...','.owkoowko...','.oooooooo...','.oowppwoo...','..oooooo....','.bbbbbbbb.o.','obbbbbbbbo.o','.bbbbbbbb.o.','..oo..oo..o.','..ww..ww....'],{o:'#ff9f43',w:'#fff3e0',k:'#1b1d2a',p:'#ff7a9a',b:'#4ea1ff'},28,190,4);
    sPixel(c,['.kk..','kyyk.','kyyko','.kk..'],{k:'#1b1d2a',y:'#ffe14a',o:'#ff9f43'},166,196,4);
  },
  reef(c){   // korallrev med två randiga fiskar
    c.save();c.globalAlpha=.1;c.fillStyle='#ffffff';[[40,0,26],[110,0,34],[180,0,22]].forEach(q=>{c.beginPath();c.moveTo(q[0],0);c.lineTo(q[0]+q[2],0);c.lineTo(q[0]+q[2]-60,286);c.lineTo(q[0]-90,286);c.closePath();c.fill();});c.restore();
    c.fillStyle='#0e2f86';c.beginPath();c.moveTo(0,250);c.quadraticCurveTo(60,228,120,248);c.quadraticCurveTo(190,268,240,240);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fill();
    const coral=(x,y,h,col,n)=>{for(let i=0;i<n;i++){const xx=x+(i-(n-1)/2)*13,hh=h*(.6+.4*Math.sin(i*2.1+1));U(c,col,2.4,[R_(c,xx-5,y-hh,10,hh+6,5)]);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(xx-2,y-hh+5,2,hh*.5);}};
    coral(28,286,62,'#ff6f91',4);coral(214,286,54,'#a37bff',3);coral(80,286,34,'#ff9f43',3);
    c.lineCap='round';[[124,286,112,222,130,200],[140,286,152,236,142,214],[172,286,164,244,176,226]].forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.quadraticCurveTo(q[2],q[3],q[4],q[5]);c.lineWidth=9;c.strokeStyle=INK;c.stroke();c.lineWidth=5;c.strokeStyle='#3fbf8a';c.stroke();});
    const fish=(x,y,s,flip)=>{c.save();c.translate(x,y);c.scale(flip?-s:s,s);
      U(c,'#ff7a1a',2.6/s,[P_(c,[[-24,0],[-42,-14],[-40,14]]),P_(c,[[-6,-14],[8,-26],[14,-12]]),P_(c,[[-4,13],[6,24],[12,12]])]);
      U(c,'#ff8a2a',3/s,[E_(c,0,0,28,17)]);c.save();c.beginPath();c.ellipse(0,0,28,17,0,0,7);c.clip();[[-14,7],[6,8]].forEach(q=>{c.fillStyle=INK;c.fillRect(q[0]-1.5,-20,q[1]+3,40);c.fillStyle='#ffffff';c.fillRect(q[0],-20,q[1],40);});c.restore();
      c.beginPath();c.arc(17,-4,4.4,0,7);c.fillStyle='#fff';c.fill();c.beginPath();c.arc(18,-4,2.4,0,7);c.fillStyle=INK;c.fill();c.restore();};
    fish(64,96,1.05,false);fish(92,172,1.3,true);
    [[20,60,5],[34,36,3],[150,140,4],[128,116,6],[196,92,3],[110,58,4],[70,224,4],[186,196,5]].forEach(q=>{c.beginPath();c.arc(q[0],q[1],q[2],0,7);c.fillStyle='rgba(190,230,255,.22)';c.fill();c.lineWidth=1.6;c.strokeStyle='rgba(210,240,255,.8)';c.stroke();});
  },
  ufo(c){   // rymdvarelse i tefat
    sStars(c,[[24,30,1.4],[70,60,1],[210,96,1.4],[20,130,1.2],[226,30,1],[110,20,1.2],[186,250,1]]);sStar(c,34,88,5,'#ffe14a');sStar(c,214,150,4,'#ffffff');
    const g=c.createRadialGradient(214,330,20,214,330,150);g.addColorStop(0,'#ff8ac0');g.addColorStop(1,'#d8468f');c.beginPath();c.arc(214,330,130,0,7);c.fillStyle=g;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
    [[170,246,12,5],[226,238,10,4.5],[198,268,15,6]].forEach(q=>{c.beginPath();c.ellipse(q[0],q[1],q[2],q[3],-.2,0,7);c.fillStyle='#c23a7e';c.fill();});
    const b=c.createLinearGradient(84,210,84,268);b.addColorStop(0,'rgba(190,255,200,.5)');b.addColorStop(1,'rgba(190,255,200,0)');c.beginPath();c.moveTo(60,208);c.lineTo(108,208);c.lineTo(132,278);c.lineTo(36,278);c.closePath();c.fillStyle=b;c.fill();
    U(c,'rgba(190,235,255,.9)',2.8,[()=>{c.moveTo(44,180);c.quadraticCurveTo(44,122,84,122);c.quadraticCurveTo(124,122,124,180);c.closePath();}]);
    U(c,'#7ddc5a',2.6,[E_(c,84,164,24,22)]);c.strokeStyle=INK;c.lineWidth=2.4;c.lineCap='round';[[72,146,66,132],[96,146,102,132]].forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[2],q[3]);c.stroke();U(c,'#7ddc5a',1.8,[C_(c,q[2],q[3],3.6)]);});
    [[74,162],[94,162]].forEach(p=>{c.beginPath();c.ellipse(p[0],p[1],6.5,8.5,0,0,7);c.fillStyle=INK;c.fill();c.beginPath();c.arc(p[0]-2,p[1]-3,2.2,0,7);c.fillStyle='#fff';c.fill();});toonSmile(c,84,175,6,5,2.2);
    c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2.6;c.beginPath();c.arc(84,168,34,Math.PI*1.15,Math.PI*1.42);c.stroke();
    const s=c.createLinearGradient(0,170,0,214);s.addColorStop(0,'#c77dff');s.addColorStop(1,'#7c3fd0');U(c,s,3,[E_(c,84,192,66,20)]);U(c,'#ff7ac0',2.4,[E_(c,84,184,44,9)]);
    [[36,196],[60,204],[84,207],[108,204],[132,196]].forEach((p,i)=>{U(c,i%2?'#ffe14a':'#5cf0ff',1.6,[C_(c,p[0],p[1],4)]);});
  },
  puppy(c){   // valp som springer i parken
    sCloud(c,18,34,10,'#ffffff',.9);
    U(c,'#2f8f4a',2.8,[C_(c,150,40,34),C_(c,198,30,40),C_(c,236,62,34),C_(c,176,74,30),C_(c,220,96,30)]);U(c,'#3fae5a',0.01,[C_(c,160,36,22),C_(c,204,24,24)]);
    c.fillStyle='#7a4e2a';c.fillRect(204,96,14,60);
    c.fillStyle='#6cc66f';c.fillRect(0,196,240,90);c.fillStyle='#58b85f';c.beginPath();c.moveTo(0,196);c.quadraticCurveTo(120,176,240,200);c.lineTo(240,214);c.quadraticCurveTo(120,196,0,214);c.closePath();c.fill();
    c.fillStyle='#e8d2a6';c.beginPath();c.moveTo(30,286);c.quadraticCurveTo(70,236,150,214);c.quadraticCurveTo(190,204,240,206);c.lineTo(240,226);c.quadraticCurveTo(160,232,120,286);c.closePath();c.fill();
    c.save();c.globalAlpha=.2;c.fillStyle='#000';c.beginPath();c.ellipse(84,244,48,7,0,0,7);c.fill();c.restore();
    U(c,'#c9843a',2.6,[()=>{c.moveTo(128,170);c.quadraticCurveTo(156,150,150,128);c.quadraticCurveTo(140,150,122,160);c.closePath();}]);
    U(c,'#f4e4c8',2.8,[R_(c,104,196,13,34,6),R_(c,56,198,13,30,6)]);U(c,'#e0a45a',3,[E_(c,96,186,42,26)]);c.fillStyle='#fff3e0';c.beginPath();c.ellipse(86,200,26,11,0,0,7);c.fill();
    U(c,'#f4e4c8',2.8,[R_(c,116,194,13,40,6),R_(c,70,196,13,38,6)]);
    U(c,'#c9843a',2.8,[E_(c,34,146,12,24,.5)]);U(c,'#e0a45a',3,[E_(c,60,152,30,28)]);U(c,'#c9843a',2.8,[E_(c,84,138,12,24,-.6)]);
    c.fillStyle='#fff3e0';c.beginPath();c.ellipse(54,164,18,14,0,0,7);c.fill();toonEye(c,50,146,6.5,0,1);toonEye(c,70,146,6.5,0,1);
    U(c,INK,1,[E_(c,54,158,5,3.6)]);c.beginPath();c.moveTo(44,166);c.quadraticCurveTo(54,176,64,166);c.lineWidth=2.4;c.strokeStyle=INK;c.stroke();U(c,'#ff7a9a',2,[R_(c,50,168,9,13,4.5)]);
    U(c,'#ff5a5f',2,[R_(c,72,170,22,7,3.5)]);
  },
  citynight(c){   // stad i skymning med en cyklist
    const sun=c.createRadialGradient(150,206,10,150,206,150);sun.addColorStop(0,'rgba(255,170,90,.9)');sun.addColorStop(1,'rgba(255,170,90,0)');c.fillStyle=sun;c.fillRect(0,60,240,226);
    sStars(c,[[30,24,1.2],[70,44,1],[20,80,1.2],[104,20,1],[214,118,1],[40,128,1]]);
    const tower=(x,w,h,col)=>{c.fillStyle=col;c.fillRect(x,206-h,w,h);c.fillStyle='rgba(255,214,120,.9)';for(let yy=206-h+8;yy<198;yy+=11)for(let xx=x+4;xx<x+w-4;xx+=8)if(((xx*7+yy*3)%5)<3)c.fillRect(xx,yy,3.5,5);};
    tower(96,22,60,'#2a1f55');tower(120,18,84,'#231a4a');tower(140,26,52,'#2a1f55');tower(168,20,96,'#1c153d');tower(190,24,66,'#231a4a');tower(216,30,44,'#2a1f55');
    c.fillStyle='#1c153d';c.fillRect(176,104,4,10);
    // bro
    c.strokeStyle='#150f30';c.lineWidth=5;c.beginPath();c.moveTo(-6,206);c.lineTo(110,206);c.stroke();c.lineWidth=7;[[26,150],[74,150]].forEach(p=>{c.beginPath();c.moveTo(p[0],208);c.lineTo(p[0],p[1]);c.stroke();});
    c.lineWidth=2;c.beginPath();c.moveTo(-10,176);c.quadraticCurveTo(10,206,26,152);c.quadraticCurveTo(50,214,74,152);c.quadraticCurveTo(92,204,112,196);c.stroke();c.lineWidth=1;for(let x=2;x<106;x+=8){c.beginPath();c.moveTo(x,206);c.lineTo(x,190-10*Math.abs(Math.sin((x-26)/15)));c.stroke();}
    c.fillStyle='#12365e';c.fillRect(0,206,240,16);c.fillStyle='rgba(255,190,120,.35)';[[120,210,40],[168,214,30],[60,212,24]].forEach(q=>c.fillRect(q[0],q[1],q[2],2));
    // väg
    c.fillStyle='#1b1830';c.beginPath();c.moveTo(0,222);c.lineTo(240,222);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fill();
    c.strokeStyle='#ff9f43';c.lineWidth=3;c.lineCap='round';c.setLineDash([14,10]);c.beginPath();c.moveTo(250,236);c.quadraticCurveTo(120,236,-10,276);c.stroke();c.setLineDash([]);
    // cyklist i motljus
    c.strokeStyle='#0a0814';c.fillStyle='#0a0814';c.lineWidth=3.4;[[44,256],[84,256]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],13,0,7);c.stroke();});
    c.lineWidth=3;c.lineJoin='round';c.beginPath();c.moveTo(44,256);c.lineTo(58,236);c.lineTo(78,236);c.lineTo(84,256);c.moveTo(58,236);c.lineTo(66,256);c.lineTo(78,236);c.moveTo(76,230);c.lineTo(86,226);c.stroke();
    c.lineWidth=7;c.beginPath();c.moveTo(56,234);c.lineTo(66,214);c.lineTo(82,226);c.stroke();c.lineWidth=5;c.beginPath();c.moveTo(58,236);c.lineTo(70,244);c.lineTo(66,256);c.stroke();c.beginPath();c.arc(70,204,8,0,7);c.fill();
    c.fillStyle='#ffe9a8';c.beginPath();c.moveTo(88,226);c.lineTo(128,214);c.lineTo(128,238);c.closePath();c.globalAlpha=.3;c.fill();c.globalAlpha=1;
  },
  island(c){   // svävande ö med hus och vattenfall
    sCloud(c,6,150,10,'#ffffff',.9);sCloud(c,166,236,12,'#ffffff',.85);sCloud(c,150,60,8,'#ffffff',.7);
    U(c,'#8a93b8',2.6,[P_(c,[[40,150],[76,84],[112,150]])]);c.fillStyle='#ffffff';c.beginPath();P_(c,[[76,84],[64,106],[72,102],[78,110],[86,102],[90,108]])();c.fill();
    U(c,'#7a5a3a',3,[()=>{c.moveTo(14,168);c.quadraticCurveTo(40,236,78,262);c.quadraticCurveTo(96,274,104,250);c.quadraticCurveTo(128,236,138,206);c.quadraticCurveTo(150,186,160,168);c.closePath();}]);
    c.strokeStyle='rgba(40,24,10,.4)';c.lineWidth=2;[[40,186,60,226],[78,186,84,244],[116,184,108,228]].forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[2],q[3]);c.stroke();});
    U(c,'#58c26a',3,[E_(c,87,164,76,20)]);c.fillStyle='#6fd47a';c.beginPath();c.ellipse(80,160,56,11,0,0,7);c.fill();
    // vattenfall
    c.fillStyle='#7fd0ff';c.fillRect(120,160,16,96);c.fillStyle='rgba(255,255,255,.7)';[124,130].forEach(x=>c.fillRect(x,164,2.5,88));c.fillStyle='#4ea1ff';c.beginPath();c.ellipse(112,160,22,6,0,0,7);c.fill();sCloud(c,108,262,8,'#ffffff',.85);
    // hus och träd
    U(c,'#fff3e0',2.6,[R_(c,56,132,34,28,2)]);U(c,'#d8402e',2.6,[P_(c,[[50,134],[73,112],[96,134]])]);c.fillStyle='#7a4e2a';c.fillRect(68,144,10,16);c.fillStyle='#58b7ff';c.fillRect(81,140,6,7);
    [[30,150,13],[42,138,11],[140,148,12]].forEach(q=>{c.fillStyle='#7a4e2a';c.fillRect(q[0]-2,q[1],4,14);U(c,'#2f8f4a',2.4,[C_(c,q[0],q[1]-4,q[2])]);});
  }
});

// Batteriet som en droppe som fylls
Object.assign(BATTPIC,{
  drop(e){const w=Math.round(e.w||78),h=Math.round(e.h||94),out=[];
    for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),cx=w/2,R=w*.42,cy=h-R-4;
      const path=()=>{c.beginPath();c.moveTo(cx,4);c.bezierCurveTo(cx+R*.5,cy-R*1.1,cx+R,cy-R*.5,cx+R,cy);c.arc(cx,cy,R,0,Math.PI);c.bezierCurveTo(cx-R,cy-R*.5,cx-R*.5,cy-R*1.1,cx,4);c.closePath();};
      path();c.fillStyle='rgba(120,190,255,.16)';c.fill();
      c.save();path();c.clip();const ly=h-4-(h-12)*(lv/6);const g=c.createLinearGradient(0,ly,0,h);g.addColorStop(0,'#7fd6ff');g.addColorStop(1,'#2f8fe6');c.fillStyle=g;c.fillRect(0,ly,w,h);
      if(lv&&lv<6){c.fillStyle='rgba(255,255,255,.5)';c.beginPath();for(let x=0;x<=w;x+=4)c.lineTo(x,ly+2*Math.sin(x/5));c.lineTo(w,ly+4);c.lineTo(0,ly+4);c.closePath();c.fill();}
      c.restore();path();c.lineWidth=3;c.strokeStyle='#bfe6ff';c.lineJoin='round';c.stroke();
      c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2.6;c.lineCap='round';c.beginPath();c.arc(cx,cy,R*.7,Math.PI*1.05,Math.PI*1.35);c.stroke();
      const ey=cy-2;[[-1],[1]].forEach(q=>{const x=cx+q[0]*R*.36;if(lv>=2){c.beginPath();c.ellipse(x,ey,3.2,4.4,0,0,7);c.fillStyle='#12305a';c.fill();c.beginPath();c.arc(x-1,ey-1.4,1.2,0,7);c.fillStyle='#fff';c.fill();}else{c.beginPath();c.moveTo(x-4,ey);c.lineTo(x+4,ey);c.lineWidth=2.2;c.strokeStyle='#12305a';c.stroke();}});
      c.lineWidth=2.2;c.strokeStyle='#12305a';c.beginPath();if(lv>=3)c.arc(cx,ey+7,5,.15*Math.PI,.85*Math.PI);else if(lv>=1){c.moveTo(cx-4,ey+11);c.lineTo(cx+4,ey+11);}else c.arc(cx,ey+14,5,1.15*Math.PI,1.85*Math.PI);c.stroke();
      if(lv>=4){c.save();c.globalAlpha=.5;c.fillStyle='#ff9ab8';[[-1],[1]].forEach(q=>{c.beginPath();c.arc(cx+q[0]*R*.58,ey+7,3.4,0,7);c.fill();});c.restore();}
      out.push(cv);}
    return out;}
});
