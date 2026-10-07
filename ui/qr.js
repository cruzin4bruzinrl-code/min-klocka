// ================= QR-kod (egen kodare: bytedata, felrättning M, version 1–6) =================
const QRV=[null,[16,10,1],[28,16,1],[44,26,1],[64,18,2],[86,24,2],[108,16,4]];   // [databyte, felrättningsbyte per block, antal block]
function qrCapacity(){return QRV[6][0]-2;}
function qrMatrix(text){
  const bytes=Array.from(new TextEncoder().encode(String(text)));
  let v=1;while(v<=6&&bytes.length>QRV[v][0]-2)v++;if(v>6)throw new Error('Texten är för lång för en QR-kod här (högst '+qrCapacity()+' tecken)');
  const [nd,ne,nb]=QRV[v],n=17+4*v;
  // databitar: läge 0100, längd 8 bitar, data, avslut, utfyllnad
  const bits=[];const put=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>>i)&1);};
  put(4,4);put(bytes.length,8);bytes.forEach(b=>put(b,8));for(let i=0;i<4&&bits.length<nd*8;i++)bits.push(0);while(bits.length%8)bits.push(0);
  const data=[];for(let i=0;i<bits.length;i+=8)data.push(bits.slice(i,i+8).reduce((a,b)=>a*2+b,0));for(let p=0;data.length<nd;p++)data.push(p%2?0x11:0xec);
  // Reed–Solomon över GF(256)
  const EXP=new Uint8Array(512),LOG=new Uint8Array(256);let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d;}for(let i=255;i<512;i++)EXP[i]=EXP[i-255];
  const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
  let gen=[1];for(let i=0;i<ne;i++){const g=new Array(gen.length+1).fill(0);gen.forEach((c,k)=>{g[k]^=c;g[k+1]^=mul(c,EXP[i]);});gen=g;}
  const rs=blk=>{const r=new Array(ne).fill(0);blk.forEach(b=>{const f=b^r.shift();r.push(0);if(f)for(let k=0;k<ne;k++)r[k]^=mul(gen[k+1],f);});return r;};
  const per=nd/nb,blocks=[],ecs=[];for(let b=0;b<nb;b++){const blk=data.slice(b*per,(b+1)*per);blocks.push(blk);ecs.push(rs(blk));}
  const all=[];for(let i=0;i<per;i++)blocks.forEach(b=>all.push(b[i]));for(let i=0;i<ne;i++)ecs.forEach(e=>all.push(e[i]));
  // rutnät med fasta mönster
  const M=Array.from({length:n},()=>new Array(n).fill(false)),F=Array.from({length:n},()=>new Array(n).fill(false));
  const set=(xx,yy,d)=>{if(xx>=0&&xx<n&&yy>=0&&yy<n){M[yy][xx]=!!d;F[yy][xx]=true;}};
  const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));set(cx+dx,cy+dy,d!==2&&d!==4);}};
  finder(3,3);finder(n-4,3);finder(3,n-4);
  for(let i=0;i<n;i++){if(!F[6][i])set(i,6,i%2===0);if(!F[i][6])set(6,i,i%2===0);}
  if(v>=2){const c=n-7;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(c+dx,c+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);}
  const fmt=mask=>{const d=mask;let rem=d;for(let i=0;i<10;i++)rem=(rem<<1)^((rem>>>9)*0x537);const b=((d<<10)|rem)^0x5412,g=i=>(b>>>i)&1;
    for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
    for(let i=0;i<8;i++)set(n-1-i,8,g(i));for(let i=8;i<15;i++)set(8,n-15+i,g(i));set(8,n-8,1);};
  fmt(0);
  // lägg ut databitarna i sicksack
  let bi=0;for(let right=n-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<n;vert++)for(let j=0;j<2;j++){const xx=right-j,up=((right+1)&2)===0,yy=up?n-1-vert:vert;
    if(!F[yy][xx]&&bi<all.length*8){M[yy][xx]=((all[bi>>>3]>>>(7-(bi&7)))&1)===1;bi++;}}}
  const MASK=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>(x*y)%2+(x*y)%3===0,(x,y)=>((x*y)%2+(x*y)%3)%2===0,(x,y)=>((x+y)%2+(x*y)%3)%2===0];
  const apply=m=>{for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++)if(!F[yy][xx]&&MASK[m](xx,yy))M[yy][xx]=!M[yy][xx];};
  const penalty=()=>{let p=0,dark=0;
    for(let a=0;a<n;a++){for(const row of [0,1]){let run=1;for(let b=1;b<n;b++){const c=row?M[a][b]:M[b][a],q=row?M[a][b-1]:M[b-1][a];if(c===q){run++;if(run===5)p+=3;else if(run>5)p++;}else run=1;}}}
    for(let yy=0;yy<n-1;yy++)for(let xx=0;xx<n-1;xx++){const c=M[yy][xx];if(c===M[yy][xx+1]&&c===M[yy+1][xx]&&c===M[yy+1][xx+1])p+=3;}
    const pat=[1,0,1,1,1,0,1,0,0,0,0],rev=pat.slice().reverse();
    for(let a=0;a<n;a++)for(let b=0;b<=n-11;b++){for(const row of [0,1]){let m1=true,m2=true;for(let k=0;k<11;k++){const c=(row?M[a][b+k]:M[b+k][a])?1:0;if(c!==pat[k])m1=false;if(c!==rev[k])m2=false;}if(m1)p+=40;if(m2)p+=40;}}
    for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++)if(M[yy][xx])dark++;p+=Math.floor(Math.abs(dark*20-n*n*10)/(n*n))*10;return p;};
  let best=0,bp=Infinity;for(let m=0;m<8;m++){apply(m);fmt(m);const p=penalty();if(p<bp){bp=p;best=m;}apply(m);}
  apply(best);fmt(best);return M;
}
// Ritar koden svart på vitt med tyst zon runt om, så stor som får plats i rutan.
function drawQR(ctx,text,x,y,size){
  let M;try{M=qrMatrix(text);}catch(e){ctx.fillStyle='#ffffff';ctx.fillRect(x,y,size,size);return 0;}
  const n=M.length,q=4,mod=Math.max(1,Math.floor(size/(n+2*q))),tot=mod*(n+2*q),ox=Math.round(x+(size-tot)/2),oy=Math.round(y+(size-tot)/2);
  ctx.fillStyle='#ffffff';ctx.fillRect(ox,oy,tot,tot);ctx.fillStyle='#000000';
  for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++)if(M[yy][xx])ctx.fillRect(ox+(xx+q)*mod,oy+(yy+q)*mod,mod,mod);
  return mod;
}
