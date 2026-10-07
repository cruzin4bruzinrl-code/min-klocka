from dial import *
from PIL import Image, ImageDraw, ImageFont
import math, struct, sys, warnings
warnings.simplefilter('ignore')
THEME=sys.argv[1]
# Teman för analoga urtavlor. Kontur, Minimal och Klassisk är oförändrade.
K_GRAD=[(0.00,(255,60,50)),(0.22,(255,150,30)),(0.48,(225,240,40)),(0.76,(60,235,110)),(1.00,(40,225,190))]
THEMES={
 'kontur':  dict(bg=(0,0,0),track=(30,34,42),ring=K_GRAD,low=(255,60,50),tq=(235,238,243),tm=(120,128,140),num=None,lab=(140,150,165),dig=(255,255,255),week=(255,160,40),font='poppins',hands='orig',hc=None,mc=None,sc=(255,150,30),hub=(255,150,30),split=False,thresh=True,edge=8,tiny=(0,0,0)),
 'minimal': dict(bg=(244,243,238),track=(226,217,246),ring=(151,81,242),low=(230,50,40),tq=(28,30,34),tm=(165,165,160),num=None,lab=(130,130,126),dig=(28,30,34),week=(120,120,116),font='poppins',hands='bar',hc=(240,84,50),mc=(28,30,34),sc=(120,120,116),hub=(28,30,34),split=True,thresh=False,edge=7,tiny=(28,30,34)),
 'klassisk':dict(bg=(10,20,46),track=(28,42,78),ring=(214,174,96),low=(225,70,60),tq=(214,174,96),tm=(96,112,150),num=(242,234,214),lab=(150,165,200),dig=(242,234,214),week=(214,174,96),font='lora',hands='taper',hc=(242,234,214),mc=(242,234,214),sc=(214,174,96),hub=(214,174,96),split=False,thresh=False,edge=8,tiny=(60,50,30)),
 'racing':  dict(bg=(8,8,10),track=(40,12,14),ring=(236,34,44),low=(255,190,40),tq=(255,255,255),tm=(110,110,118),num=(255,255,255),lab=(150,150,158),dig=(255,255,255),week=(236,34,44),font='poppins',hands='bar',hc=(255,255,255),mc=(255,255,255),sc=(236,34,44),hub=(236,34,44),split=False,thresh=False,edge=8,tiny=(8,8,10)),
 'mint':    dict(bg=(226,244,234),track=(196,226,208),ring=(22,128,92),low=(226,66,56),tq=(14,58,44),tm=(132,172,152),num=None,lab=(86,128,108),dig=(14,58,44),week=(22,128,92),font='poppins',hands='bar',hc=(22,128,92),mc=(14,58,44),sc=(226,96,66),hub=(14,58,44),split=True,thresh=False,edge=7,tiny=(14,58,44)),
 'natt':    dict(bg=(0,0,0),track=(38,6,6),ring=(150,18,18),low=(255,120,40),tq=(190,30,30),tm=(84,14,14),num=None,lab=(120,22,22),dig=(200,34,34),week=(140,24,24),font='poppins',hands='bar',hc=(190,30,30),mc=(190,30,30),sc=(110,18,18),hub=(190,30,30),split=False,thresh=False,edge=5,tiny=(0,0,0)),
 'koppar':  dict(bg=(30,24,22),track=(58,44,38),ring=[(0.0,(246,160,96)),(0.5,(206,110,62)),(1.0,(150,72,44))],low=(240,70,60),tq=(232,150,98),tm=(120,96,86),num=(240,224,210),lab=(170,140,124),dig=(240,224,210),week=(232,150,98),font='lora',hands='taper',hc=(240,224,210),mc=(240,224,210),sc=(232,150,98),hub=(232,150,98),split=False,thresh=False,edge=8,tiny=(30,24,22)),
 'is':      dict(bg=(232,242,250),track=(204,222,238),ring=[(0.0,(40,170,235)),(1.0,(30,90,200))],low=(226,66,56),tq=(18,40,84),tm=(140,164,192),num=(18,40,84),lab=(96,124,160),dig=(18,40,84),week=(40,130,220),font='poppins',hands='taper',hc=(18,40,84),mc=(18,40,84),sc=(40,150,230),hub=(18,40,84),split=False,thresh=False,edge=7,tiny=(18,40,84)),
 'neon':    dict(bg=(6,4,14),track=(30,22,52),ring=[(0.0,(255,40,200)),(0.5,(150,80,255)),(1.0,(30,230,255))],low=(255,220,40),tq=(30,230,255),tm=(88,70,140),num=None,lab=(150,130,210),dig=(240,240,255),week=(255,60,210),font='mono',hands='bar',hc=(30,230,255),mc=(240,240,255),sc=(255,60,210),hub=(255,60,210),split=False,thresh=False,edge=8,tiny=(6,4,14)),
 'skog':    dict(bg=(16,40,30),track=(30,64,48),ring=(232,170,60),low=(236,84,60),tq=(240,232,208),tm=(92,128,108),num=(240,232,208),lab=(140,172,152),dig=(240,232,208),week=(232,170,60),font='lora',hands='bar',hc=(232,170,60),mc=(240,232,208),sc=(160,190,170),hub=(240,232,208),split=True,thresh=False,edge=8,tiny=(16,40,30)),
}
T=THEMES[THEME]; LIGHT=T['split']
BG=T['bg']

GOLD=(214,174,96); CREAM=(242,234,214)
INK=(28,30,34)
ACC=(240,84,50)
RING=(151,81,242)   # mätarens färg på den ljusa urtavlan
F='/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
LORA='/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf'
MONO='/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
def FONT(size):
    if T['font']=='lora':
        f=ImageFont.truetype(LORA,int(size)); f.set_variation_by_axes([700]); return f
    if T['font']=='mono': return ImageFont.truetype(MONO,int(size*0.9))
    return ImageFont.truetype(F,int(size))
S=4
SW,SH=240,286; BW,BH=240,280; BY=3; CX,CY=120,143
def to565(c): return ((c[0]>>3)<<11)|((c[1]>>2)<<5)|(c[2]>>3)
def img_be565(im):
    out=bytearray()
    for p in im.convert('RGB').getdata(): out+=struct.pack('>H',to565(p))
    return bytes(out)
def from_planar(r):
    n=r.w*r.h; im=Image.new('RGBA',(r.w,r.h)); px=im.load()
    for i in range(n):
        v=r.data[2*i]|r.data[2*i+1]<<8; px[i%r.w,i//r.w]=((v>>11)*255//31,((v>>5)&63)*255//63,(v&31)*255//31,r.data[2*n+i])
    return im
def img_planar_le(im):
    col=bytearray(); al=bytearray()
    for p in im.convert('RGBA').getdata(): col+=struct.pack('<H',to565(p)); al.append(p[3])
    return bytes(col)+bytes(al)
def lerp(a,b,t): return tuple(int(round(a[i]+(b[i]-a[i])*t)) for i in range(3))

# ---------- konturbana: rundad rektangel som följer skärmens form ----------
EDGE=T['edge']   # ringens synliga bredd, ända ut i skärmkanten
INS,RAD,WID=0,46,2*EDGE
def path_points(ins,rad,n):
    """n punkter längs banan, start klockan 12, medurs. Skärmkoordinater."""
    x0,y0,x1,y1=ins,ins,SW-1-ins,SH-1-ins
    segs=[]  # (typ, data, längd)
    segs.append(('l',(CX,y0,x1-rad,y0)))
    segs.append(('a',(x1-rad,y0+rad,-90,0)))
    segs.append(('l',(x1,y0+rad,x1,y1-rad)))
    segs.append(('a',(x1-rad,y1-rad,0,90)))
    segs.append(('l',(x1-rad,y1,x0+rad,y1)))
    segs.append(('a',(x0+rad,y1-rad,90,180)))
    segs.append(('l',(x0,y1-rad,x0,y0+rad)))
    segs.append(('a',(x0+rad,y0+rad,180,270)))
    segs.append(('l',(x0+rad,y0,CX,y0)))
    def ln(s):
        if s[0]=='l': a=s[1]; return math.hypot(a[2]-a[0],a[3]-a[1])
        return math.radians(90)*rad
    L=[ln(s) for s in segs]; tot=sum(L); pts=[]
    for k in range(n):
        d=tot*k/(n-1); i=0
        while i<len(segs)-1 and d>L[i]: d-=L[i]; i+=1
        u=min(1,d/L[i]); s=segs[i]
        if s[0]=='l': a=s[1]; pts.append((a[0]+(a[2]-a[0])*u,a[1]+(a[3]-a[1])*u))
        else:
            cx,cy,d0,d1=s[1]; an=math.radians(d0+(d1-d0)*u); pts.append((cx+rad*math.cos(an),cy+rad*math.sin(an)))
    return pts
GRAD=T['ring'] if isinstance(T['ring'],list) else K_GRAD
def grad(t):
    for (t0,c0),(t1,c1) in zip(GRAD,GRAD[1:]):
        if t<=t1: return lerp(c0,c1,(t-t0)/(t1-t0))
    return GRAD[-1][1]
TRACK=T['track']
N=1400; PTS=path_points(INS,RAD,N)
def inside_rr(x,y,ins,rad):
    x0,y0,x1,y1=ins,ins,SW-1-ins,SH-1-ins
    if x<x0 or x>x1 or y<y0 or y>y1: return False
    cx=min(max(x,x0+rad),x1-rad); cy=min(max(y,y0+rad),y1-rad)
    return math.hypot(x-cx,y-cy)<=rad
def ray_hit(deg,ins,rad):
    a=math.radians(deg-90); r=0
    while inside_rr(CX+r*math.cos(a),CY+r*math.sin(a),ins,rad): r+=0.25
    return r
def text_im(txt,size,fill,track=0):
    f=FONT(size); w=int(sum(f.getlength(c) for c in txt)+track*(len(txt)-1))+4; asc,desc=f.getmetrics()
    im=Image.new('RGBA',(w,asc+desc),(0,0,0,0)); d=ImageDraw.Draw(im); x=2
    for c in txt: d.text((x,0),c,font=f,fill=fill); x+=f.getlength(c)+track
    return im
def art(level):
    """Hela bakgrundsbilden i skärmkoordinater för en batterinivå 0..6."""
    big=Image.new('RGB',(SW*S,SH*S),BG); d=ImageDraw.Draw(big)
    def stamp(p,w,c): d.ellipse([p[0]*S-w*S/2,p[1]*S-w*S/2,p[0]*S+w*S/2,p[1]*S+w*S/2],fill=c)
    for p in PTS: stamp(p,WID,TRACK)
    if level>0:
        frac=level/6; n=int((N-1)*frac)
        for k in range(n+1):
            c=T['low'] if level==1 else (grad(k/(N-1)) if isinstance(T['ring'],list) else T['ring'])
            stamp(PTS[k],WID,c)
    else:
        stamp(PTS[0],WID,(255,60,50))
    # timmarkeringar innanför banan
    for k in range(12):
        deg=k*30; q=(k%3==0); r1=ray_hit(deg,EDGE+10,RAD-EDGE-10); L=13 if q else 7
        a=math.radians(deg-90); ca,sa=math.cos(a),math.sin(a)
        col=T['tq'] if q else T['tm']; w=(3.2 if q else 2.2)*S
        if T['num'] and q:
            num={0:'12',3:'3',6:'6',9:'9'}[k]; f=FONT(21*S); bb=d.textbbox((0,0),num,font=f); rr_=r1-10
            d.text(((CX+rr_*ca)*S-(bb[2]+bb[0])/2,(CY+rr_*sa)*S-(bb[3]+bb[1])/2),num,font=f,fill=T['num'])
        elif k==0:
            for off in (-3.2,3.2):
                d.line([((CX+r1*ca-sa*off)*S,(CY+r1*sa+ca*off)*S),((CX+(r1-L)*ca-sa*off)*S,(CY+(r1-L)*sa+ca*off)*S)],fill=col,width=int(2.6*S))
        else:
            d.line([((CX+r1*ca)*S,(CY+r1*sa)*S),((CX+(r1-L)*ca)*S,(CY+(r1-L)*sa)*S)],fill=col,width=int(w))
    ov=Image.new('RGBA',big.size,(0,0,0,0))
    t=text_im('STEG',7.5*S,T['lab']+(255,),track=2.4*S); ov.alpha_composite(t,(int(CX*S-t.width/2),int((97 if LIGHT else 205)*S)))
    big=Image.alpha_composite(big.convert('RGBA'),ov).convert('RGB')
    im=big.resize((SW,SH),Image.LANCZOS)
    return im.point(lambda v:0 if v<10 else v) if T['thresh'] else im
def rle_of(im):
    w,h=im.size; px=list(im.getdata())
    rows=[[to565(p) for p in px[y*w:(y+1)*w]] for y in range(h)]
    data=rle_encode(rows); assert rle_decode(data,w,h)==rows
    return data
# ---------- siffror och veckodagar ----------
DW,DH=16,22; WW,WH=54,18
def small_text(txt,w,h,size,fill=None,dy=0):
    fill=fill or T['dig']
    im=Image.new('RGB',(w*S,h*S),BG); d=ImageDraw.Draw(im); f=FONT(size*S); bb=d.textbbox((0,0),txt,font=f)
    d.text(((w*S-(bb[2]-bb[0]))/2-bb[0],(h*S-(bb[3]-bb[1]))/2-bb[1]+dy*S),txt,font=f,fill=fill)
    return im.resize((w,h),Image.LANCZOS)
digits=[small_text(str(i),DW,DH,22) for i in range(10)]
days=[small_text(t,WW,WH,14,fill=T['week'],dy=0.5) for t in ('MÅN','TIS','ONS','TOR','FRE','LÖR','SÖN')]
POS_DAY,POS_WEEK,POS_STEPS=(((130,194),(74,196),(CX-(5*DW)//2,70)) if LIGHT else ((CX-DW,90),(CX-WW//2,68),(CX-(5*DW)//2,178)))

# ---------- sätt in i filen ----------
D=Dial(open('dial1.bin','rb').read())
BGHDR=D.res[9].hdr
def put(n,im,cf=4):
    r=D.res[n]
    if cf==4: r.hdr=Res.make_hdr(4,im.size[0],im.size[1],D.res[10].hdr); r.data=img_be565(im)
    else:     r.hdr=Res.make_hdr(20,im.size[0],im.size[1],BGHDR);       r.data=rle_of(im)
arts=[art(i) for i in range(7)]
put(9,arts[0].crop((0,BY,BW,BY+BH)),cf=20)                       # bakgrund: banan släckt (reserv om ringen inte ritas)
for i in range(7): put(2+i,arts[i],cf=20)  # batteriet: sju helbilder av ringen
for i in range(10): put(17+i,digits[i])
for i in range(7): put(28+i,days[i])
tiny=Image.new('RGB',(4,4),T['tiny'])
for n in (10,15,16,27): put(n,tiny)
def bar_hand(w,h,col):
    """Rak visare med runda ändar. Vridpunkten ligger 7 rader från nederkanten, som i originalet."""
    big=Image.new('L',(w*S,h*S),0); d=ImageDraw.Draw(big); r=(w-2)/2; cx=w/2; py=h-1-7+0.5
    d.rounded_rectangle([(cx-r)*S,1*S,(cx+r)*S,(py+r)*S],radius=r*S,fill=255)
    a=big.resize((w,h),Image.LANCZOS); im=Image.new('RGBA',(w,h),col+(0,)); im.putalpha(a); return im
def put15(n,im):
    r=D.res[n]; r.hdr=Res.make_hdr(15,im.size[0],im.size[1],r.hdr); r.data=img_planar_le(im)
def recolor(n,col):
    r=D.res[n]; im=from_planar(r); px=im.load()
    for y in range(r.h):
        for x in range(r.w): px[x,y]=col+(px[x,y][3],)
    r.data=img_planar_le(im)
def taper_hand(w,h,col):
    """Spetsig visare, bredast en bit ovanför vridpunkten."""
    big=Image.new('L',(w*S,h*S),0); d=ImageDraw.Draw(big); cx=w/2; py=h-1-7+0.5; r=(w-2)/2
    d.polygon([(cx*S,1*S),((cx+r)*S,(py-9)*S),((cx+1.6)*S,(py+5)*S),((cx-1.6)*S,(py+5)*S),((cx-r)*S,(py-9)*S)],fill=255)
    a=big.resize((w,h),Image.LANCZOS); im=Image.new('RGBA',(w,h),col+(0,)); im.putalpha(a); return im
if T['hands']=='taper':
    put15(11,taper_hand(14,63,T['hc'])); put15(12,taper_hand(12,94,T['mc'])); recolor(13,T['sc']); recolor(14,T['hub'])
elif T['hands']=='bar':
    put15(11,bar_hand(14,63,T['hc'])); put15(12,bar_hand(12,94,T['mc'])); recolor(13,T['sc']); recolor(14,T['hub'])
else:
    recolor(13,T['sc']); recolor(14,T['hub'])
# ---------- elementtabell ----------
def setpos(rec,x,y): rec[18]=1; rec[19:21]=struct.pack('<H',x); rec[21:23]=struct.pack('<H',y)
R=D.recs
for i in (3,4,5,6,7): setpos(R[i],118,141)           # gamla ikoner: 4x4 svart under mittpunkten
setpos(R[8],*POS_DAY); setpos(R[9],*POS_STEPS); setpos(R[10],*POS_WEEK)
setpos(R[11],0,0)
D.recs=[R[0],R[1],R[2],R[11]]+R[3:11]+R[12:]        # batteriringen ritas direkt efter bakgrunden
assert len(D.recs)==15
# ---------- förhandsbild ----------
def hand(n,pivot_from_bottom,deg):
    r=D.res[n]; im=from_planar(r); P=260
    c=Image.new('RGBA',(P,P),(0,0,0,0)); c.alpha_composite(im,(P//2-r.w//2,P//2-(r.h-1-pivot_from_bottom)))
    return c.rotate(-deg,resample=Image.BICUBIC),P
def face_for(level,hh,mm,ss,day,wd,steps,hands=True):
    face=Image.new('RGBA',(SW,SH),BG+(255,)); face.paste(arts[level],(0,0))
    def digs(txt,x,y):
        for i,ch in enumerate(txt): face.paste(digits[int(ch)],(x+i*DW,y))
    digs(day,*POS_DAY); face.paste(days[wd],POS_WEEK); digs(steps,*POS_STEPS)
    if not hands: return face.convert('RGB')
    for n,pv,deg in ((11,7,(hh%12+mm/60)*30),(12,7,mm*6),(13,20,ss*6)):
        h,P=hand(n,pv,deg); face.alpha_composite(h,(CX-P//2,CY-P//2))
    face.alpha_composite(from_planar(D.res[14]),(114,137))
    return face.convert('RGB')
face=face_for(5,10,9,30,'04',6,'09012')
prev=face.resize((160,187),Image.LANCZOS)
for n in (0,1): put(n,prev)
out=D.build(); open(THEME+'.bin','wb').write(out)
print('filstorlek',len(out),'| under gränsen 409600:',len(out)<=409600)
print('ringbilder (byte):',[len(D.res[2+i].data) for i in range(7)],'| bakgrund',len(D.res[9].data))
D2=Dial(out); print('läser tillbaka:',len(D2.res),'bilder,',D2.count,'element; ombyggnad identisk:',D2.build()==out)
for i,r in enumerate(D2.recs): print(i,bytes(r)[0:2].hex(),'pos',r[18],struct.unpack('<HH',bytes(r[19:23])),'res',struct.unpack('<I',bytes(r[28:32]))[0],'typ',hex(r[37]),'bilder',r[40])
def framed(im,name):
    b=im.resize((480,572),Image.LANCZOS); m=Image.new('L',(480,572),0); ImageDraw.Draw(m).rounded_rectangle([0,0,479,571],radius=96,fill=255)
    fr=Image.new('RGB',(520,612),(20,21,24)); ImageDraw.Draw(fr).rounded_rectangle([8,8,511,603],radius=108,fill=(0,0,0)); fr.paste(b,(20,20),m); fr.save(name); return fr
a=framed(face,THEME+'_preview.png')
b=framed(face_for(1,3,40,10,'04',6,'00090'),THEME+'_low.png')
both=Image.new('RGB',(1060,612),(20,21,24)); both.paste(a,(0,0)); both.paste(b,(540,0)); both.save(THEME+'_both.png')

# ---------- delar till appens levande förhandsvisning: tavlan utan visare, och visarna var för sig ----------
import json
face_for(5,10,9,30,'04',6,'09012',hands=False).save(THEME+'_base.png')
meta={}
for n,nm,pv in ((11,'h',7),(12,'m',7),(13,'s',20)):
    r=D.res[n]; from_planar(r).save('%s_%s.png'%(THEME,nm)); meta[nm]=[r.w//2,r.h-1-pv]
from_planar(D.res[14]).save(THEME+'_hub.png'); meta['hub']=[114,137]; meta['c']=[CX,CY]
json.dump(meta,open(THEME+'_live.json','w'))
