const fs=require('fs');eval(fs.readFileSync('ui/qr.js','utf8')+';global.qrMatrix=qrMatrix;');
const texts=['A','12345678','GYM-0042-ROB','https://exempel.se/kort/1234567890','Räksmörgås på klockan åäö','x'.repeat(40),'y'.repeat(60),'z'.repeat(84),'w'.repeat(106),'0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'];
fs.mkdirSync('ui/qrout',{recursive:true});const meta=[];
texts.forEach((t,i)=>{const M=qrMatrix(t),n=M.length,mod=3,q=4,W=(n+2*q)*mod;const px=Buffer.alloc(W*W,255);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(M[y][x])for(let dy=0;dy<mod;dy++)for(let dx=0;dx<mod;dx++)px[((y+q)*mod+dy)*W+(x+q)*mod+dx]=0;
  fs.writeFileSync('ui/qrout/q'+i+'.pgm',Buffer.concat([Buffer.from('P5\n'+W+' '+W+'\n255\n'),px]));meta.push({i,t,n});});
fs.writeFileSync('ui/qrout/meta.json',JSON.stringify(meta));console.log(meta.map(m=>m.n).join(' '));
