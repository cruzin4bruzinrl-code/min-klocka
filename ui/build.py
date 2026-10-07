import re,base64,io,json
from PIL import Image
t=open('ui/template.html',encoding='utf8').read()
R0=lambda n: open('ui/'+n,encoding='utf8').read()
A,B,C=R0('core_a.js'),R0('core_b.js'),R0('core_c.js')
assert 'function wrapDial' in A and 'function helloFrame' in A and 'function log(' in B and 'async function ask' in C
def ff(p): return Image.open(p).convert('RGB').crop((20,20,500,592)).resize((240,286),Image.LANCZOS)
items=[
 ('kontur','Kontur','Analog och mörk, med batteriring i färg.','#3ceb6e','#ff963c',True),
 ('minimal','Minimal','Analog och ljus, med lila batteriring.','#a469ff','#f05432',True),
 ('klassisk','Klassisk','Analog i marinblått och guld.','#d6ae60','#4668c8',False),
 ('racing','Racing','Analog i svart, vitt och rött.','#ec222c','#ffbe28',False),
 ('mint','Mint','Analog och ljus i grönt.','#16805c','#e26042',False),
 ('natt','Natt','Analog i dämpat rött för mörker.','#961212','#3a0606',False),
 ('koppar','Koppar','Analog i brunt och koppar.','#f6a060','#964a2c',False),
 ('is','Is','Analog i isblått och marin.','#28aaeb','#1e5ac8',False),
 ('neon','Neonring','Analog med ring i rosa till cyan.','#ff28c8','#1ee6ff',False),
 ('skog','Skog','Analog i mörkgrönt och bärnsten.','#e8aa3c','#1e4030',False),
]
arr=[]
for key,name,desc,c1,c2,tested in items:
    d=open(key+'.bin','rb').read(); assert len(d)<=409600
    # delar till den levande förhandsvisningen: tavlan utan visare, och visarna var för sig
    def du(path,fmt='PNG'):
        im=Image.open(path); b=io.BytesIO()
        if fmt=='JPEG': im.convert('RGB').save(b,'JPEG',quality=92); return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
        im.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
    m=json.load(open(key+'_live.json'))
    lv={'base':du(key+'_base.png','JPEG'),'h':[du(key+'_h.png')]+m['h'],'m':[du(key+'_m.png')]+m['m'],'s':[du(key+'_s.png')]+m['s'],'hub':[du(key+'_hub.png')]+m['hub'],'c':m['c']}
    arr.append('{key:%s,name:%s,desc:%s,c1:%s,c2:%s,tested:%s,lv:%s,b64:%s}'%(json.dumps(key),json.dumps(name,ensure_ascii=False),json.dumps(desc,ensure_ascii=False),json.dumps(c1),json.dumps(c2),'true' if tested else 'false',json.dumps(lv),json.dumps(base64.b64encode(d).decode())))
    open('wrap_%s.bin'%key,'wb').write(__import__('dial').wrap(d))
fonts=open('ui/fonts.css',encoding='utf8').read().replace("'PoppinsApp';font-weight:500","'PoppinsApp';font-weight:500")
R=lambda n: open('ui/'+n,encoding='utf8').read()
for k,v in (('/*FONTS*/',fonts),('/*CORE_A*/',A),('/*DIALS*/',',\n'.join(arr)),('/*CORE_B*/',B),('/*CORE_C*/',C),('/*ENGINE*/',R('engine.js')+R('toons.js')+R('extras.js')+R('extras2.js')+R('extras3.js')+R('qr.js')),('/*PRESETS*/',R('presets.js')),('/*GALLERY*/',R('gallery.js')),('/*EDITOR*/',R('editor.js')),('/*FEATURES*/',R('features.js'))):
    assert t.count(k)==1,k; t=t.replace(k,v)
open('index_v18.html','w',encoding='utf8').write(t); print('html',len(t),'| analoga',len(arr))
import os,shutil
ver=int(re.search(r'const APPV=(\d+);',R('features.js')).group(1))
os.makedirs('dist',exist_ok=True)
open('dist/index.html','w',encoding='utf8').write(t)
json.dump({'v':ver},open('dist/version.json','w'))
for f in os.listdir('ui/pwa'): shutil.copy('ui/pwa/'+f,'dist/'+f)
open('dist/.nojekyll','w').write('')
# privat.txt (ligger bara lokalt) räknar upp sådant som aldrig får hamna i sidan
if os.path.exists('privat.txt'):
    for bad in open('privat.txt',encoding='utf8').read().split('\n'):
        if bad.strip(): assert bad.strip().lower() not in t.lower(), 'privat uppgift i sidan'
print('dist klar, version',ver)
json.dump([it[0] for it in items],open('ui/keys.json','w'))
