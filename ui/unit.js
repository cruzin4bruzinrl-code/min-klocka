// Jämför motorns kodare och filbyggare med Python-facit, byte för byte.
const fs=require('fs');const P=require('./../proto.js');global.crc32=P.crc32||null;
const src=fs.readFileSync('ui/engine.js','utf8');const pure=src.slice(0,src.indexOf('// ---------- ritning'));
if(!global.crc32){const core=fs.readFileSync('page.js','utf8');const m=core.match(/const CRCT=[\s\S]*?function crc32\(parts\)\{[\s\S]*?\n/);eval(m[0]+';global.crc32=crc32;');}
eval(pure+';global.E={encBE565,encPlanar,encAlpha,JKFile,c565,hex565};');
let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed&255;};
const mkpx=n=>{const a=new Uint8ClampedArray(n*4);for(let i=0;i<a.length;i++)a[i]=rnd();return a;};
const out={};
const prev=mkpx(160*189),bg=mkpx(240*286);
out.prev=Buffer.from(prev).toString('base64');out.bg=Buffer.from(bg).toString('base64');
const g1=[];for(let i=0;i<10;i++){const w=7+i%3,h=9;const px=mkpx(w*h);g1.push({w,h,px:Buffer.from(px).toString('base64'),data:E.encPlanar(px,w*h)});}
const g2=[];for(let i=0;i<11;i++){const w=5,h=8;const px=mkpx(w*h);g2.push({w,h,px:Buffer.from(px).toString('base64'),data:E.encAlpha(px,w*h)});}
out.g1=g1.map(g=>({w:g.w,h:g.h,px:g.px}));out.g2=g2.map(g=>({w:g.w,h:g.h,px:g.px}));
const jf=new E.JKFile(0x86B10042,E.encBE565(prev,160*189,0),E.encBE565(bg,240*286,0));
const t1=jf.group(g1,17),t2=jf.group(g2,17);
jf.element(19,7,73,1,17,t1,null);jf.element(20,39,73,1,17,t1,null);jf.element(13,29,42,2,17,t2,E.hex565('#ffffff'));jf.element(5,214,193,2,17,t2,0x057f);jf.element(9,35,160,2,17,t2,E.hex565('#ff6e78'));
const hp=[];for(let i=0;i<3;i++){const w=11+i*2,h=70+i*20;const px=mkpx(w*h);hp.push({w,h,px:Buffer.from(px).toString('base64'),data:E.encPlanar(px,w*h)});}
out.hp=hp.map(g=>({w:g.w,h:g.h,px:g.px}));
jf.pointer(25,114,84,hp[0],120,143);jf.pointer(26,113,51,hp[1],120,143);jf.pointer(27,112,25,hp[2],120,143);
const file=jf.finish();fs.writeFileSync('ui/unit_js.bin',file);fs.writeFileSync('ui/unit_in.json',JSON.stringify(out));
console.log('js-fil',file.length,'| färg #ff6e78 ->',E.hex565('#ff6e78').toString(16));
