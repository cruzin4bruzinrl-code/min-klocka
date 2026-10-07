import json,base64,sys
sys.path.insert(0,'.')
import jkdz
from PIL import Image
j=json.load(open('ui/unit_in.json'))
def im(px,w,h): return Image.frombytes('RGBA',(w,h),base64.b64decode(px))
B=jkdz.Builder(240,286,0x86B10042,jkdz.enc_be565(im(j['prev'],160,189)),160,189,jkdz.enc_be565(im(j['bg'],240,286)))
t1=B.group([(g['w'],g['h'],jkdz.enc_planar(im(g['px'],g['w'],g['h']))) for g in j['g1']],17)
t2=B.group([(g['w'],g['h'],jkdz.enc_alpha(Image.frombytes('RGBA',(g['w'],g['h']),base64.b64decode(g['px'])).getchannel('A'))) for g in j['g2']],17)
B.element(19,7,73,1,17,t1); B.element(20,39,73,1,17,t1); B.element(13,29,42,2,17,t2,0xffff); B.element(5,214,193,2,17,t2,0x057f); B.element(9,35,160,2,17,t2,jkdz.to565((0xff,0x6e,0x78)))
for (typ,x,y),g in zip(((25,114,84),(26,113,51),(27,112,25)),j['hp']): B.pointer(typ,x,y,g['w'],g['h'],jkdz.enc_planar(im(g['px'],g['w'],g['h'])),120,143)
py=B.finish(); js=open('ui/unit_js.bin','rb').read()
print('python',len(py),'js',len(js),'IDENTISKA' if py==js else 'OLIKA')
H,recs=jkdz.parse(js)
for r in recs: print(r.kind,r.idx,r.type,r.x,r.y,r.style,getattr(r,'w',''),getattr(r,'h',''),r.off,getattr(r,'px',''),getattr(r,'py',''))
