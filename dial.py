"""Läser och bygger urtavlefiler för TRIARENALI1 (FunDo-galleriformat)."""
import struct, zlib
RES_MAGIC=b'\xc0\xee\xbc\xaa'; TAB_MAGIC=b'\xef\xc0\xbb\xaa'

def rle_decode(px,W,H):
    offs=struct.unpack('<%dI'%H,px[:4*H]); body=px[4*H:]; out=[]
    for y in range(H):
        o=offs[y]*2; row=[]
        while len(row)<W:
            c=body[o]|body[o+1]<<8; o+=2
            if c&0x8000:
                row+= [body[o]<<8|body[o+1]]*(c&0x7fff); o+=2
            else:
                for k in range(c): row.append(body[o]<<8|body[o+1]); o+=2
        assert len(row)==W
        out.append(row)
    return out

def rle_encode(rows):
    """rows: rader med RGB565-värden. Samma regler som originalets kodare:
    tre eller fler lika pixlar blir en serie, resten blir literaler, en ensam pixel skrivs som serie med längd 1."""
    offs=[]; body=bytearray()
    for row in rows:
        offs.append(len(body)//2); i=0; n=len(row); lit=[]
        def flush():
            if len(lit)==1:
                body.extend(struct.pack('<H',0x8001)); body.extend(struct.pack('>H',lit[0]))
            elif lit:
                body.extend(struct.pack('<H',len(lit)))
                for v in lit: body.extend(struct.pack('>H',v))
            lit.clear()
        while i<n:
            j=i
            while j<n and row[j]==row[i]: j+=1
            if j-i>=3:
                flush(); body.extend(struct.pack('<H',0x8000|(j-i))); body.extend(struct.pack('>H',row[i]))
            else: lit.extend(row[i:j])
            i=j
        flush()
    return struct.pack('<%dI'%len(offs),*offs)+bytes(body)

class Res:
    def __init__(s,hdr,data): s.hdr=hdr; s.data=data
    @property
    def cf(s): return s.hdr&0x1f
    @property
    def w(s): return (s.hdr>>10)&0x7ff
    @property
    def h(s): return s.hdr>>21
    @staticmethod
    def make_hdr(cf,w,h,base=0): return (base&~(0x1f|(0x7ff<<10)|(0x7ff<<21)))|cf|(w<<10)|(h<<21)

class Dial:
    def __init__(s,d):
        s.raw=d
        s.f0=d[0:4]; s.ver,s.hlen,s.tlen=struct.unpack('<HHI',d[4:12])
        s.tcrc=struct.unpack('<I',d[12:16])[0]
        s.sw,s.sh,s.id=struct.unpack('<HHI',d[16:24])
        s.h24=d[24:28]; s.count,s.rsize=struct.unpack('<HH',d[28:32]); s.h32=d[32:36]
        assert s.hlen==36 and s.count*s.rsize==s.tlen
        s.recs=[bytearray(d[36+i*s.rsize:36+(i+1)*s.rsize]) for i in range(s.count)]
        s.rbase=d.find(TAB_MAGIC,36+s.tlen); s.pad=d[36+s.tlen:s.rbase]
        n=struct.unpack('<I',d[s.rbase+4:s.rbase+8])[0]
        offs=struct.unpack('<%dI'%n,d[s.rbase+8:s.rbase+8+4*n])
        s.X=d[s.rbase+8+4*n:s.rbase+12+4*n]; base=s.rbase+12+4*n
        s.res=[]
        for o in offs:
            p=base+o; assert d[p:p+4]==RES_MAGIC
            hdr,size=struct.unpack('<II',d[p+4:p+12]); s.res.append(Res(hdr,d[p+12:p+12+size]))
        last=base+offs[-1]+12+len(s.res[-1].data); last+=(-last)%4; s.tail=d[last:]
    def build(s):
        table=b''.join(bytes(r) for r in s.recs)
        hdr=s.f0+struct.pack('<HHI',s.ver,36,len(table))+struct.pack('<I',zlib.crc32(table))
        hdr+=struct.pack('<HHI',s.sw,s.sh,s.id)+s.h24+struct.pack('<HH',len(s.recs),s.rsize)+s.h32
        blobs=[];offs=[];o=0
        for r in s.res:
            b=RES_MAGIC+struct.pack('<II',r.hdr,len(r.data))+r.data; b+=b'\xff'*(-len(b)%4); offs.append(o); o+=len(b); blobs.append(b)
        rt=TAB_MAGIC+struct.pack('<I',len(s.res))+struct.pack('<%dI'%len(offs),*offs)+s.X
        return hdr+table+s.pad+rt+b''.join(blobs)+s.tail

def wrap(data,ftype=100):
    """Ytterhöljet (53 byte) som appen lägger på innan filen skickas."""
    info=bytearray(b'\xff'*32); info[0:4]=b'\x6b\x6b\xb6\xb6'
    info[4:8]=struct.pack('<I',zlib.crc32(data)); info[8:12]=struct.pack('<I',len(data)); info[12:16]=b'\x01\0\0\0'; info[20]=ftype
    h=bytearray(b'\xff'*21); h[0:4]=b'\x5a\x5a\xa5\xa5'; h[4:8]=b'\x15\0\x01\x01'
    h[8:12]=struct.pack('<I',zlib.crc32(bytes(info)+data)); h[12:16]=struct.pack('<I',len(data)+53); h[16]=ftype; h[17:21]=b'\x15\0\0\0'
    return bytes(h)+bytes(info)+data

if __name__=='__main__':
    import pickle
    d=open('dial1.bin','rb').read(); D=Dial(d)
    print('rebuild identical:',D.build()==d, 'tail',len(D.tail))
    # ytterhölje mot fångad överföring
    tx,rx=pickle.load(open('fr.pkl','rb')); blob=bytearray()
    for ts,f in tx:
        if f[8]==1 and f[10]==0xC0: blob+=f[13:]
        if f[8]==1 and f[10]==0xC2: blob+=f[21:21+int.from_bytes(f[13:17],'big')]
    print('wrapper identical:',wrap(d)==bytes(blob))
    # RLE tur och retur
    r=D.res[9]; rows=rle_decode(r.data,r.w,r.h); enc=rle_encode(rows)
    print('RLE re-encode identical:',enc==r.data,len(enc),len(r.data),'decode(enc)==rows',rle_decode(enc,r.w,r.h)==rows)
