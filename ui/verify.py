"""Läser tillbaka filerna appen skickade till låtsasklockan och ritar dem enbart utifrån filens innehåll."""
import sys,glob,os,struct
sys.path.insert(0,'.')
import jkdz
from PIL import Image, ImageDraw
EXP={'kugghjul','lillsekund','vardag'}   # experiment: får avvika från det som setts fungera, och bara de
exp_seen=set()
T=(10,9,37)
names=sys.argv[1:] or sorted(os.path.basename(f)[:-4] for f in glob.glob('ui/sent/*.bin'))
tiles=[]; bad=0
for nm in names:
    d=open('ui/sent/%s.bin'%nm,'rb').read(); H,recs=jkdz.parse(d)
    assert H['total']==len(d)<=409600 and (H['w'],H['h'])==(240,286) and H['toff']+48*H['count']==len(d),nm
    assert [r.idx for r in recs]==list(range(len(recs))),nm
    face=jkdz.be565_img(d[recs[0].off:recs[0].off+240*286*2],240,286).convert('RGBA')
    kinds=[]; rot=[]
    for r in recs[1:]:
        if r.kind==5:
            # text som klockan ritar själv (veckodag): typ 3, mitt-x, y, färg på 36..37
            assert r.type==3 and r.raw[24]==0 and r.raw[26]==1 and r.raw[28]==0 and r.raw[8:24]==b'\xff'*16 and r.raw[29:36]==b'\xff'*7 and r.raw[38:]==b'\xff'*10 and r.raw[25]==255 and r.raw[27]==255,(nm,'kind5')
            assert nm in EXP,(nm,'veckodag utanför experiment'); exp_seen.add(nm)
            col=jkdz.c565(struct.unpack('<H',r.raw[36:38])[0]); ImageDraw.Draw(face).text((r.x-14,r.y),'WED',fill=col+(255,) if len(col)==3 else col)
            kinds.append('T3'); continue
        if r.kind==2:
            assert r.type in (25,26,27) and r.style==1,(nm,r.type)
            safe=(r.px,r.py)==(120,143) and r.w<=116 and r.h<=124 and abs(r.x+r.w/2-r.px)<=1 and r.y+r.h-r.py<=22 and r.y<=r.py
            if not safe:
                assert nm in EXP,(nm,'rörlig del utanför det provade',r.type,r.x,r.y,r.w,r.h,r.px,r.py); exp_seen.add(nm)
            assert r.w<=116 and r.h<=124,(nm,'för stor rörlig bild')
            assert 64<r.off and r.off+r.w*r.h*3<=H['toff'] and r.x<240 and r.y<286,(nm,'läge')
            assert r.raw[8:26]==b'\xff'*18 and r.raw[27]==255 and r.raw[40:]==b'\xff'*8,nm
            rot.append(r.type)
            im=jkdz.planar_img(d[r.off:r.off+r.w*r.h*3],r.w,r.h)
            deg={25:(T[0]%12+T[1]/60)*30,26:(T[1]+T[2]/60)*6,27:T[2]*6}[r.type]
            P=600; c=Image.new('RGBA',(P,P),(0,0,0,0)); c.alpha_composite(im,(P//2+r.x-r.px,P//2+r.y-r.py))
            c=c.rotate(-deg,resample=Image.BICUBIC); face.alpha_composite(c.crop((P//2-r.px,P//2-r.py,P//2-r.px+240,P//2-r.py+286)))
            kinds.append('R%d'%r.type)
        else:
            tab=jkdz.table(d,r.off,r.count)
            for e in tab:
                if e: assert e[2]+e[0]*e[1]*(3 if r.style==1 else 1)<=H['toff'],(nm,'tabell')
            if r.style==1:
                idx={19:T[0]//10,20:T[0]%10,21:T[1]//10,22:T[1]%10,1:5,33:1,11:0}.get(r.type,0); w,h,o=tab[idx]
                if r.type==11: continue
                face.alpha_composite(jkdz.planar_img(d[o:o+w*h*3],w,h),(r.x,r.y))
            else:
                txt={13:'68',17:'10100',7:'412',9:'06.21',5:'07',48:'85',42:'16'}[r.type]; col=jkdz.c565(r.color)
                gl=[tab[10 if ch=='.' else int(ch)] for ch in txt]; x=r.x-sum(g[0] for g in gl)//2
                for w,h,o in gl: face.alpha_composite(jkdz.alpha_img(d[o:o+w*h],w,h,col),(x,r.y)); x+=w
            kinds.append(str(r.type))
    assert len(rot)==len(set(rot)),(nm,'dubbla visare')
    if rot: assert rot==[25,26,27] and [r.kind for r in recs[-3:]]==[2,2,2],(nm,'visare ska vara tre och ligga sist',rot)
    assert d[46:50]==bytes([0,0,1 if rot else 0,0]),(nm,'lägesflagga')
    if rot: print('%-11s %6d byte  ordning: %s'%(nm,len(d),' '.join(kinds)))
    tiles.append(face.convert('RGB'))
if tiles:
    cols=5; rows=(len(tiles)+cols-1)//cols; sh=Image.new('RGB',(cols*250+10,rows*296+10),(20,21,24))
    for i,t in enumerate(tiles): sh.paste(t,(10+(i%cols)*250,10+(i//cols)*296))
    sh.save('ui/verify_sheet.png'); print('kontrollerade',len(tiles),'filer utan fel | avviker från det provade (experiment):',sorted(exp_seen))
