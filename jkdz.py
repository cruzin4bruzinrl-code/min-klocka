"""Formatet för appens egna urtavlor ("JKDZ"): läsa, rita och bygga."""
import struct, zlib
from PIL import Image
def be565_img(b,w,h):
    im=Image.new('RGB',(w,h)); px=im.load()
    for i in range(w*h):
        v=b[2*i]<<8|b[2*i+1]; px[i%w,i//w]=((v>>11)*255//31,((v>>5)&63)*255//63,(v&31)*255//31)
    return im
def planar_img(b,w,h,le=True):
    n=w*h; im=Image.new('RGBA',(w,h)); px=im.load()
    for i in range(n):
        v=(b[2*i]|b[2*i+1]<<8) if le else (b[2*i]<<8|b[2*i+1])
        px[i%w,i//w]=((v>>11)*255//31,((v>>5)&63)*255//63,(v&31)*255//31,b[2*n+i])
    return im
def alpha_img(b,w,h,col=(255,255,255)):
    im=Image.new('RGBA',(w,h)); px=im.load()
    for i in range(w*h): px[i%w,i//w]=col+(b[i],)
    return im
def c565(v): return ((v>>11)*255//31,((v>>5)&63)*255//63,(v&31)*255//31)
class Rec:
    def __init__(s,r):
        s.raw=r; s.kind=r[0]; s.idx=r[1]; s.type,s.x,s.y=struct.unpack('<HHH',r[2:8]); s.style=r[26]; s.count=r[27]
        if s.kind in (0,2): s.w,s.h,s.off=struct.unpack('<HHI',r[28:36])
        else: s.off=struct.unpack('<I',r[28:32])[0]; s.color=struct.unpack('<H',r[32:34])[0]
        if s.kind==2: s.px,s.py=struct.unpack('<HH',r[36:40])
def parse(d):
    assert d[4:8]==b'JKDZ' and zlib.crc32(d[64:])==struct.unpack('<I',d[:4])[0]
    H=dict(total=struct.unpack('<I',d[8:12])[0],w=struct.unpack('<H',d[16:18])[0],h=struct.unpack('<H',d[18:20])[0],id=struct.unpack('<I',d[20:24])[0],
           pw=struct.unpack('<H',d[24:26])[0],ph=struct.unpack('<H',d[26:28])[0],poff=struct.unpack('<I',d[28:32])[0],psize=struct.unpack('<I',d[32:36])[0],
           toff=struct.unpack('<I',d[36:40])[0],font=struct.unpack('<I',d[40:44])[0],count=struct.unpack('<H',d[44:46])[0],rest=d[46:64])
    recs=[Rec(d[H['toff']+i*48:H['toff']+(i+1)*48]) for i in range(H['count'])]
    return H,recs
def table(d,off,count):
    out=[]
    for i in range(count):
        e=d[off+i*8:off+i*8+8]
        if e==b'\xff'*8: out.append(None); continue
        w,h,o=struct.unpack('<HHI',e); out.append((w,h,o))
    return out

# ---------------- bygga ----------------
def to565(c): return ((c[0]>>3)<<11)|((c[1]>>2)<<5)|(c[2]>>3)
def enc_be565(im):
    out=bytearray()
    for p in im.convert('RGB').getdata(): out+=struct.pack('>H',to565(p))
    return bytes(out)
def enc_planar(im):
    col=bytearray(); al=bytearray()
    for p in im.convert('RGBA').getdata(): col+=struct.pack('<H',to565(p)); al.append(p[3])
    return bytes(col)+bytes(al)
def enc_alpha(im): return bytes(im.convert('L').getdata())
class Builder:
    """Bygger en JKDZ-fil i samma ordning som appen: förhandsbild, bakgrund, bildgrupper, elementtabell."""
    def __init__(s,w,h,dial_id,preview_raw,pw,ph,bg_raw):
        s.w,s.h,s.id,s.pw,s.ph=w,h,dial_id,pw,ph
        s.buf=bytearray(64)+bytearray(preview_raw); s.psize=len(preview_raw)
        s.recs=[]; bgoff=len(s.buf); s.buf+=bg_raw
        r=bytearray(b'\xff'*48); r[0]=0; r[1]=0; r[2:8]=struct.pack('<HHH',0,0,0); r[28:36]=struct.pack('<HHI',w,h,bgoff); s.recs.append(r)
    def group(s,images,slots):
        """images: lista av (w,h,råbyte). Returnerar tabellens läge."""
        ents=[]
        for w,h,raw in images: ents.append((w,h,len(s.buf))); s.buf+=raw
        toff=len(s.buf); t=bytearray(b'\xff'*(8*slots))
        for i,(w,h,o) in enumerate(ents): t[i*8:i*8+8]=struct.pack('<HHI',w,h,o)
        s.buf+=t; return toff
    def element(s,typ,x,y,style,count,toff,color=None):
        r=bytearray(b'\xff'*48); r[0]=1; r[1]=len(s.recs); r[2:8]=struct.pack('<HHH',typ,x,y); r[26]=style; r[27]=count; r[28:32]=struct.pack('<I',toff)
        if color is not None: r[32:34]=struct.pack('<H',color)
        s.recs.append(r)
    def pointer(s,typ,x,y,w,h,raw,px,py):
        """Roterande bild, som appens i(): slag 2, läge = övre vänstra hörnet vid klockan 12, bilden direkt (ingen tabell), vridpunkt i 36..39."""
        off=len(s.buf); s.buf+=raw
        r=bytearray(b'\xff'*48); r[0]=2; r[1]=len(s.recs); r[2:8]=struct.pack('<HHH',typ,x,y); r[26]=1
        r[28:36]=struct.pack('<HHI',w,h,off); r[36:40]=struct.pack('<HH',px,py); s.recs.append(r)
    def finish(s):
        toff=len(s.buf); s.buf+=b''.join(bytes(r) for r in s.recs)
        h=bytearray(b'\xff'*64); h[4:8]=b'JKDZ'; h[8:12]=struct.pack('<I',len(s.buf)); h[12:16]=bytes([64,0,1,0])
        h[16:24]=struct.pack('<HHI',s.w,s.h,s.id); h[24:28]=struct.pack('<HH',s.pw,s.ph); h[28:36]=struct.pack('<II',64,s.psize)
        h[36:44]=struct.pack('<II',toff,0); h[44:46]=struct.pack('<H',len(s.recs)); h[46:50]=bytes(4)
        h[48]=1 if any(r[0]==2 for r in s.recs) else 0   # appens fält d: 1 med visare, 0 med bara siffror
        h[0:4]=struct.pack('<I',zlib.crc32(bytes(s.buf[64:]))); s.buf[0:64]=h; return bytes(s.buf)
