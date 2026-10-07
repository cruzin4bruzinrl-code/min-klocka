# Bygger provsidan: ritar alla digitala urtavlor, bygger filerna och ger tillbaka dem.
fonts=open('ui/fonts.css',encoding='utf8').read()
R=lambda n: open('ui/'+n,encoding='utf8').read()
crc="""const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
function crc32(parts){let c=0xFFFFFFFF;for(const a of parts){for(let i=0;i<a.length;i++)c=CRCT[(c^a[i])&255]^(c>>>8);}return (c^0xFFFFFFFF)>>>0;}
"""
run="""
const FONTLOAD=['500 20px PoppinsApp','700 20px PoppinsApp','300 20px PoppinsLight','700 20px LoraBold','700 20px MonoBold'];
window.run=async(from,times)=>{await Promise.all(FONTLOAD.map(f=>document.fonts.load(f,'0123456789')));
  const list=DIGITAL.slice(from||0),T=times||[{h:10,m:9,s:37}];
  const cols=5,rows=Math.ceil(list.length*T.length/cols),sh=document.getElementById('sheet');sh.width=cols*250+10;sh.height=rows*296+10;const c=sh.getContext('2d');c.fillStyle='#141518';c.fillRect(0,0,sh.width,sh.height);
  const out=[];let n=0;
  list.forEach(d=>{const r=renderDial(d.def);
    T.forEach(t=>{const x=10+(n%cols)*250,y=10+Math.floor(n/cols)*296;n++;c.save();rr(c,x,y,240,286,46);c.clip();c.drawImage(composeDial(r,t),x,y);c.restore();});
    const b=buildDial(d.def,d.id,null,r);let s='';for(let k=0;k<b.length;k+=8192)s+=String.fromCharCode.apply(null,b.subarray(k,k+8192));out.push({key:d.key,size:b.length,est:dialSize(r),live:isLive(r),b64:btoa(s)});});
  return out;};
"""
open('ui/harness.html','w',encoding='utf8').write('<!doctype html><meta charset=utf-8><style>'+fonts+'body{margin:0;background:#141518}</style><canvas id=sheet></canvas><script>'+crc+R('engine.js')+R('toons.js')+R('extras.js')+R('qr.js')+R('presets.js')+run+'</script>')
