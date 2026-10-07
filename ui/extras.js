// ================= Bildsiffror, batteri- och väderserier, fler figurer =================
// Tidssiffrorna är fria bilder, så de kan se ut som vad som helst.
const PICFONT={
  nx(c,ch,x,y,w,h){   // nixie-rör: glödande siffra i ett glasrör
    rr(c,x+1.5,y+1.5,w-3,h-3,w*.3);const g=c.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'rgba(74,42,28,.66)');g.addColorStop(.5,'rgba(28,15,10,.52)');g.addColorStop(1,'rgba(62,36,24,.7)');c.fillStyle=g;c.fill();c.lineWidth=1.4;c.strokeStyle='rgba(255,210,170,.45)';c.stroke();
    c.save();rr(c,x+1.5,y+1.5,w-3,h-3,w*.3);c.clip();c.strokeStyle='rgba(255,180,120,.08)';c.lineWidth=1;for(let yy=y+4;yy<y+h;yy+=4){c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();}
    c.font='300 '+(h*.74)+'px PoppinsLight';c.textAlign='center';c.textBaseline='alphabetic';c.shadowColor='#ff5a10';c.shadowBlur=h*.16;c.fillStyle='#ff9a4a';c.fillText(ch,x+w/2,y+h*.77);c.shadowBlur=h*.05;c.fillStyle='#ffdcae';c.fillText(ch,x+w/2,y+h*.77);c.restore();
    c.strokeStyle='rgba(255,255,255,.24)';c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(x+w*.2,y+h*.16);c.lineTo(x+w*.2,y+h*.5);c.stroke();},
  fl(c,ch,x,y,w,h){   // klaffskylt: vit siffra på ett kort som är delat på mitten
    rr(c,x+1,y+1,w-2,h-2,h*.09);const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#363944');g.addColorStop(.5,'#24262e');g.addColorStop(.501,'#1b1d24');g.addColorStop(1,'#111217');c.fillStyle=g;c.fill();
    c.save();rr(c,x+1,y+1,w-2,h-2,h*.09);c.clip();c.font='700 '+(h*.8)+'px PoppinsApp';c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle='#f4f4f0';c.fillText(ch,x+w/2,y+h*.79);
    c.fillStyle='rgba(0,0,0,.82)';c.fillRect(x,y+h/2-1,w,2);c.fillStyle='rgba(255,255,255,.07)';c.fillRect(x,y+h/2+1,w,1);c.restore();
    c.fillStyle='#08080a';c.fillRect(x,y+h/2-h*.05,2.5,h*.1);c.fillRect(x+w-2.5,y+h/2-h*.05,2.5,h*.1);},
  do(c,ch,x,y,w,h){   // dominobricka: prickarna är siffran
    rr(c,x+1.5,y+1.5,w-3,h-3,w*.14);c.fillStyle='#f6f1e6';c.fill();c.lineWidth=1.8;c.strokeStyle=INK;c.stroke();
    const P=[[],[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8],[0,2,3,4,5,6,8],[0,1,2,3,5,6,7,8],[0,1,2,3,4,5,6,7,8]][+ch]||[];
    const px=w*.22,py=h*.17,gw=(w-2*px)/2,gh=(h-2*py)/2,r=Math.min(w,h)*.09;c.fillStyle=INK;P.forEach(k=>{circ(c,x+px+(k%3)*gw,y+py+Math.floor(k/3)*gh,r);c.fill();});},
  ch(c,ch,x,y,w,h,col){   // krita: lite ojämn, som på en svart tavla
    const t=mk(Math.ceil(w),Math.ceil(h)),g=ctxOf(t);g.font='500 '+(h*.86)+'px PoppinsApp';g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle=Array.isArray(col)?col[0]:(col||'#ffffff');g.globalAlpha=.94;g.fillText(ch,w/2,h*.82);
    g.globalCompositeOperation='destination-out';const rnd=mulberry(String(ch).charCodeAt(0)*977+Math.round(h));for(let i=0;i<w*h*.12;i++){g.globalAlpha=.25+rnd()*.6;g.fillRect(rnd()*w,rnd()*h,1+rnd()*1.8,1);}
    c.drawImage(t,Math.round(x),Math.round(y));}
};
// Batteriikonen är sju fria bilder, från tomt (0) till fullt (6).
const BATTPIC={
  plant(e){const w=Math.round(e.w||72),h=Math.round(e.h||88),out=[];
    for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),t=lv/6,cx=w/2,potH=h*.26,potY=h-potH;
      const col=lerpHex('#9a7a3a','#3fbf62',Math.min(1,t*1.3)),sh=h*(.28+.36*t),bend=(1-t)*w*.4,tipx=cx+bend,tipy=potY-sh+(1-t)*h*.2;
      c.beginPath();c.moveTo(cx,potY+2);c.quadraticCurveTo(cx,potY-sh*.7,tipx,tipy);c.lineCap='round';c.lineWidth=6.5;c.strokeStyle=INK;c.stroke();c.lineWidth=3.6;c.strokeStyle=col;c.stroke();
      const nl=Math.round(t*4);for(let k=0;k<nl;k++){const u=(k+1)/(nl+1),bx=cx+(tipx-cx)*u*u,by=potY-(potY-tipy)*u,sd=k%2?1:-1;ell(c,bx+sd*w*.13,by-2,w*.13,h*.05,sd*(-.5-(1-t)*.8));ol(c,col,1.8);}
      if(lv>=5){for(let i=0;i<5;i++){const a=i*2*Math.PI/5;circ(c,tipx+5.5*Math.cos(a),tipy+5.5*Math.sin(a),4.4);ol(c,'#ff6f91',1.4);}circ(c,tipx,tipy,3.4);ol(c,'#ffe14a',1.2);}
      else if(lv===4){circ(c,tipx,tipy,4.2);ol(c,'#ff9db4',1.4);}
      if(lv===0){ell(c,w*.2,h-4,w*.1,h*.035,.3);ol(c,'#9a7a3a',1.4);}
      c.beginPath();c.moveTo(cx-w*.24,potY);c.lineTo(cx+w*.24,potY);c.lineTo(cx+w*.17,h-2);c.lineTo(cx-w*.17,h-2);c.closePath();ol(c,'#d9703a',2.4);rr(c,cx-w*.28,potY-5,w*.56,8,3);ol(c,'#e8854a',2.2);
      out.push(cv);}
    return out;},
  candle(e){const w=Math.round(e.w||56),h=Math.round(e.h||96),out=[];
    for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),cx=w/2,by=h-12,ch=lv?h*(.14+.42*lv/6):h*.06,top=by-ch;
      if(lv){const g=c.createRadialGradient(cx,top-12,1,cx,top-12,w*.5);g.addColorStop(0,'rgba(255,200,90,.5)');g.addColorStop(1,'rgba(255,200,90,0)');c.fillStyle=g;c.fillRect(0,0,w,h);}
      ell(c,cx,by+3,w*.42,6);ol(c,'#c9a25a',2.2);rr(c,cx-11,top,22,ch+2,4);ol(c,'#fff6dc',2.4);
      c.fillStyle='#fff6dc';[[-9,6],[7,10]].forEach(q=>{if(ch>q[1]+4){ell(c,cx+q[0],top+q[1],3,5);c.fill();}});
      c.beginPath();c.moveTo(cx,top);c.lineTo(cx,top-5);ol(c,null,1.8);
      if(lv){c.beginPath();c.moveTo(cx,top-24);c.bezierCurveTo(cx+9,top-12,cx+6,top-4,cx,top-4);c.bezierCurveTo(cx-6,top-4,cx-9,top-12,cx,top-24);c.closePath();ol(c,'#ffb02e',1.8,'#e8612a');
        c.beginPath();c.moveTo(cx,top-15);c.bezierCurveTo(cx+4,top-9,cx+3,top-5,cx,top-5);c.bezierCurveTo(cx-3,top-5,cx-4,top-9,cx,top-15);c.closePath();c.fillStyle='#fff3a0';c.fill();}
      else{c.beginPath();c.moveTo(cx,top-6);c.bezierCurveTo(cx+8,top-16,cx-8,top-24,cx+2,top-36);c.lineWidth=2;c.strokeStyle='rgba(200,200,210,.6)';c.lineCap='round';c.stroke();}
      out.push(cv);}
    return out;},
  pet(e){const w=Math.round(e.w||78),h=Math.round(e.h||76),col=e.c||'#ffb85c',out=[];
    for(let lv=0;lv<7;lv++){const cv=mk(w,h),c=ctxOf(cv),cx=w/2,cy=h*.56,R=Math.min(w,h)*.4;
      [1,-1].forEach(sd=>{c.beginPath();c.moveTo(cx+sd*R*.95,cy-R*.35);c.lineTo(cx+sd*R*.8,cy-R*1.25);c.lineTo(cx+sd*R*.25,cy-R*.85);c.closePath();ol(c,col,2.4);});
      ell(c,cx,cy,R*1.08,R*.95);ol(c,col,2.6);c.fillStyle='rgba(255,255,255,.55)';ell(c,cx,cy+R*.38,R*.55,R*.38);c.fill();
      const ex=R*.42,ey=cy-R*.15,er=R*.24;
      [1,-1].forEach(sd=>{const x=cx+sd*ex;
        if(lv>=4){toonEye(c,x,ey,er,0,1);}
        else if(lv>=2){toonEye(c,x,ey,er,0,2);c.fillStyle=col;c.beginPath();c.rect(x-er-2,ey-er-2,2*er+4,er*(lv===3?.8:1.15)+2);c.fill();c.beginPath();c.moveTo(x-er,ey-er*(lv===3?.2:-.15));c.lineTo(x+er,ey-er*(lv===3?.2:-.15));ol(c,null,2.2);}
        else{c.beginPath();c.arc(x,ey-er*.2,er*.8,.15*Math.PI,.85*Math.PI);ol(c,null,2.4);}});
      c.beginPath();c.moveTo(cx-3,cy+R*.2);c.lineTo(cx+3,cy+R*.2);c.lineTo(cx,cy+R*.3);c.closePath();c.fillStyle='#ff6b8b';c.fill();
      if(lv>=4)toonSmile(c,cx,cy+R*.38,R*.26,R*.24,2.2);else if(lv>=2){c.beginPath();c.moveTo(cx-R*.18,cy+R*.5);c.lineTo(cx+R*.18,cy+R*.5);ol(c,null,2.2);}
      else if(lv===1){ell(c,cx,cy+R*.55,R*.16,R*.2);ol(c,'#7a1f3d',2);}else{c.beginPath();c.arc(cx,cy+R*.45,R*.1,0,Math.PI);ol(c,null,2);text(c,'z',cx+R*.75,cy-R*1.15,R*.42,'pb','#ffffff','l',0);text(c,'z',cx+R*1.05,cy-R*1.45,R*.3,'pb','#ffffff','l',0);}
      if(lv>=5)cheeks(c,cx,cy+R*.25,R*.72,R*.14);
      out.push(cv);}
    return out;}
};
// Väderikonen är fyra fria bilder: sol, moln, regn, snö.
const WEATHERPIC={
  window(s){const out=[],sky=['#58b7ff','#9fb4c8','#5f6f86','#c9d6e6'];
    for(let k=0;k<4;k++){const cv=mk(s,s),c=ctxOf(cv),p=s*.08,iw=s-2*p;
      rr(c,p,p,iw,iw,s*.06);c.fillStyle=sky[k];c.fill();c.save();rr(c,p,p,iw,iw,s*.06);c.clip();
      const cloud=(x,y,r,col)=>{c.fillStyle=col;[[0,0,1],[r*.9,-r*.35,1.15],[r*1.9,0,.95]].forEach(q=>{circ(c,x+q[0],y+q[1],r*q[2]);c.fill();});c.fillRect(x,y-r*.1,r*1.9,r*1.05);};
      if(k===0){c.fillStyle='#ffd23f';circ(c,s*.68,s*.32,s*.15);c.fill();c.strokeStyle='#ffd23f';c.lineWidth=s*.03;c.lineCap='round';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(s*.68+s*.2*Math.cos(a),s*.32+s*.2*Math.sin(a));c.lineTo(s*.68+s*.26*Math.cos(a),s*.32+s*.26*Math.sin(a));c.stroke();}c.fillStyle='#58c26a';c.fillRect(0,s*.74,s,s*.3);}
      else if(k===1){cloud(s*.18,s*.38,s*.1,'#ffffff');cloud(s*.45,s*.56,s*.12,'#eef2f8');c.fillStyle='#6aa36e';c.fillRect(0,s*.76,s,s*.3);}
      else if(k===2){cloud(s*.2,s*.34,s*.12,'#c9d2de');c.strokeStyle='#bfe1ff';c.lineWidth=s*.022;c.lineCap='round';for(let i=0;i<9;i++){const x=s*(.14+i*.09),y=s*(.5+(i%3)*.1);c.beginPath();c.moveTo(x,y);c.lineTo(x-s*.03,y+s*.09);c.stroke();}c.fillStyle='#4f7f5a';c.fillRect(0,s*.8,s,s*.3);}
      else{cloud(s*.2,s*.32,s*.12,'#ffffff');c.fillStyle='#ffffff';for(let i=0;i<10;i++){circ(c,s*(.14+i*.08),s*(.5+((i*7)%4)*.08),s*.022);c.fill();}c.fillRect(0,s*.78,s,s*.3);}
      c.restore();rr(c,p,p,iw,iw,s*.06);c.lineWidth=s*.07;c.strokeStyle='#8a5a2e';c.stroke();c.lineWidth=s*.03;c.beginPath();c.moveTo(s/2,p);c.lineTo(s/2,s-p);c.moveTo(p,s/2);c.lineTo(s-p,s/2);c.stroke();
      rr(c,p*.3,s-p*1.5,s-p*.6,p*1.2,p*.4);c.fillStyle='#a8713c';c.fill();if(k===3){c.fillStyle='#ffffff';rr(c,p*.5,s-p*1.9,s-p,p*.7,p*.3);c.fill();}
      out.push(cv);}
    return out;}
};
Object.assign(SPRITES,{
  frame(s,e){const w=e.w||40,cv=sprCanvas(w+2,2*s+2),c=ctxOf(cv),col=e.c||'#ff8a3c';rr(c,2,2,w,2*s,Math.min(7,s*.6));c.fillStyle=rgba(col,.2);c.fill();c.lineWidth=2.2;c.strokeStyle=col;c.stroke();return cv;},
  sun(s,e){const cv=sprCanvas(2.9*s,2.9*s),c=ctxOf(cv),m=cv.width/2;c.strokeStyle=e.c||'#ffd23f';c.lineWidth=Math.max(1.6,s*.2);c.lineCap='round';for(let k=0;k<8;k++){const a=k*Math.PI/4;c.beginPath();c.moveTo(m+s*1.05*Math.cos(a),m+s*1.05*Math.sin(a));c.lineTo(m+s*1.38*Math.cos(a),m+s*1.38*Math.sin(a));c.stroke();}
    circ(c,m,m,s*.82);ol(c,e.c||'#ffd23f',1.8,'#e89a1a');return cv;},
  cloud(s,e){const cv=sprCanvas(3.4*s,2*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.2;c.fillStyle=e.c||'#ffffff';[[-.85,.05,.55],[-.2,-.3,.72],[.6,-.05,.6]].forEach(q=>{circ(c,x+q[0]*s,y+q[1]*s,q[2]*s);c.fill();});rr(c,x-s*1.2,y,s*2.3,s*.6,s*.3);c.fill();return cv;},
  bird(s,e){const cv=sprCanvas(3*s,1.9*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.2;c.beginPath();c.moveTo(x-s*1.3,y-s*.5);c.quadraticCurveTo(x-s*.6,y-s*1.0,x,y);c.quadraticCurveTo(x+s*.6,y-s*1.0,x+s*1.3,y-s*.5);c.lineWidth=Math.max(2,s*.3);c.strokeStyle=e.c||INK;c.lineCap='round';c.lineJoin='round';c.stroke();return cv;},
  flake(s,e){const cv=sprCanvas(2.2*s,2.2*s),c=ctxOf(cv),m=cv.width/2;c.strokeStyle=e.c||'#ffffff';c.lineWidth=Math.max(1.4,s*.18);c.lineCap='round';for(let k=0;k<3;k++){const a=k*Math.PI/3;c.beginPath();c.moveTo(m-s*Math.cos(a),m-s*Math.sin(a));c.lineTo(m+s*Math.cos(a),m+s*Math.sin(a));c.stroke();}return cv;},
  chick(s,e){const cv=sprCanvas(2.6*s,2.4*s),c=ctxOf(cv),x=cv.width/2,y=cv.height/2+s*.15;c.beginPath();c.moveTo(x-s*.2,y+s*.6);c.lineTo(x-s*.3,y+s*1.0);c.moveTo(x+s*.25,y+s*.6);c.lineTo(x+s*.3,y+s*1.0);ol(c,null,1.8,'#ff9f43');
    ell(c,x-s*.1,y+s*.1,s*.85,s*.7);ol(c,e.c||'#ffe14a',2);circ(c,x+s*.6,y-s*.5,s*.5);ol(c,e.c||'#ffe14a',2);c.beginPath();c.moveTo(x+s*1.05,y-s*.55);c.lineTo(x+s*1.4,y-s*.42);c.lineTo(x+s*1.05,y-s*.3);c.closePath();ol(c,'#ff9f43',1.4);circ(c,x+s*.72,y-s*.6,s*.09);c.fillStyle=INK;c.fill();return cv;}
});
Object.assign(TOONS,{
  hills(c){c.fillStyle='#7fd47a';c.beginPath();c.moveTo(0,236);c.quadraticCurveTo(70,196,140,232);c.quadraticCurveTo(200,256,240,222);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fill();
    c.fillStyle='#58c26a';c.beginPath();c.moveTo(0,262);c.quadraticCurveTo(90,232,170,262);c.quadraticCurveTo(210,274,240,256);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fill();},
  tomte(c){   // en jultomte ritad här: röd luva, vitt skägg
    [[98,238],[142,238]].forEach(p=>{ell(c,p[0],p[1],20,10);ol(c,'#2a2c36',2.6);});
    ell(c,120,176,58,62);ol(c,'#d8302e',3.2);c.fillStyle='#ffffff';c.fillRect(64,198,112,10);rr(c,108,194,24,18,4);ol(c,'#ffd23f',2.2);
    c.beginPath();c.moveTo(74,150);c.quadraticCurveTo(120,214,166,150);c.quadraticCurveTo(166,112,120,112);c.quadraticCurveTo(74,112,74,150);c.closePath();ol(c,'#ffffff',3);
    ell(c,120,106,34,26);ol(c,'#ffd2a8',3);toonEye(c,107,102,8,1,1);toonEye(c,133,102,8,-1,1);circ(c,120,114,7);ol(c,'#ff9a8a',2.2);cheeks(c,120,112,22,5);
    c.beginPath();c.moveTo(84,96);c.quadraticCurveTo(110,30,170,58);c.quadraticCurveTo(140,62,156,96);c.closePath();ol(c,'#d8302e',3);rr(c,80,88,80,13,6);ol(c,'#ffffff',2.6);circ(c,172,58,10);ol(c,'#ffffff',2.6);
  },
  maypole(c){   // midsommarstång
    c.fillStyle='#58c26a';c.beginPath();c.moveTo(0,246);c.quadraticCurveTo(120,222,240,246);c.lineTo(240,286);c.lineTo(0,286);c.closePath();c.fill();
    const leafy=(x0,y0,x1,y1,lw)=>{c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineCap='round';c.lineWidth=lw+4;c.strokeStyle=INK;c.stroke();c.lineWidth=lw;c.strokeStyle='#2e9e4f';c.stroke();};
    leafy(120,36,120,250,9);leafy(72,84,168,84,8);
    [[72,84],[168,84]].forEach(p=>{c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0],p[1]+16);ol(c,null,2);circ(c,p[0],p[1]+34,18);c.lineWidth=11;c.strokeStyle=INK;c.stroke();c.lineWidth=7;c.strokeStyle='#3fbf62';c.stroke();
      ['#ff6f91','#ffd23f','#5cc8ff','#ffffff'].forEach((col,i)=>{const a=i*Math.PI/2+.6;circ(c,p[0]+18*Math.cos(a),p[1]+34+18*Math.sin(a),3.6);c.fillStyle=col;c.fill();});});
    ['#ff6f91','#ffd23f','#5cc8ff','#ffffff','#c77dff'].forEach((col,i)=>{circ(c,120,56+i*40,4);c.fillStyle=col;c.fill();});
    c.beginPath();c.moveTo(120,36);c.lineTo(112,22);c.lineTo(128,22);c.closePath();ol(c,'#ffd23f',2);
    [[30,250,'#ff6f91'],[60,262,'#ffffff'],[186,258,'#ffd23f'],[214,250,'#c77dff']].forEach(p=>{for(let i=0;i<5;i++){const a=i*2*Math.PI/5;circ(c,p[0]+4*Math.cos(a),p[1]+4*Math.sin(a),3);c.fillStyle=p[2];c.fill();}circ(c,p[0],p[1],2.4);c.fillStyle='#ffe14a';c.fill();});
  },
  egg(c){   // påskägg
    c.save();c.globalAlpha=.18;c.fillStyle='#000';ell(c,120,214,52,9);c.fill();c.restore();
    const path=()=>{c.beginPath();c.moveTo(120,76);c.bezierCurveTo(172,84,186,212,120,212);c.bezierCurveTo(54,212,68,84,120,76);c.closePath();};
    path();ol(c,'#ffe14a',3.2);c.save();path();c.clip();
    [['#ff6f91',104,12],['#5cc8ff',146,14],['#c77dff',186,12]].forEach(q=>{c.beginPath();for(let x=50;x<=190;x+=14){c.lineTo(x,q[1]+((x/14)%2?-7:7));}c.lineWidth=q[2];c.strokeStyle=q[0];c.lineJoin='round';c.stroke();});
    c.fillStyle='#ffffff';[[100,126],[120,126],[140,126],[110,166],[130,166]].forEach(p=>{circ(c,p[0],p[1],4);c.fill();});c.restore();path();c.lineWidth=3.2;c.strokeStyle=INK;c.stroke();
    c.save();c.globalAlpha=.35;c.fillStyle='#ffffff';ell(c,100,104,9,16,.4);c.fill();c.restore();
  }
});
