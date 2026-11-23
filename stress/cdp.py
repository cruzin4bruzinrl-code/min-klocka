import json,sys,urllib.request,websocket,base64
lst=json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
pg=[x for x in lst if x.get('type')=='page'][0]
ws=websocket.create_connection(pg['webSocketDebuggerUrl'],timeout=20,suppress_origin=True)
n=[0]
def call(m,**p):
    n[0]+=1; ws.send(json.dumps({'id':n[0],'method':m,'params':p}))
    while True:
        r=json.loads(ws.recv())
        if r.get('id')==n[0]: return r
JS=r'''(()=>{const o={};o.inner=[innerWidth,innerHeight,devicePixelRatio];o.cls=document.documentElement.className;o.theme=document.documentElement.dataset.theme;
const v=document.querySelector('.view.on')||document.querySelector('[id^=view-]:not([hidden])');
const R=e=>{const r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]};
o.views=[...document.querySelectorAll('[id^=view-]')].map(e=>{const c=getComputedStyle(e);return [e.id,e.className,R(e),c.display,c.visibility,c.position,c.overflow,c.height,c.maxHeight,c.top,c.bottom,c.transform,c.opacity,c.clipPath,c.contain,e.scrollHeight]});
const s=document.querySelector('.view.on');if(s){o.kids=[...s.children].slice(0,8).map(e=>[e.tagName,e.id,e.className,R(e),getComputedStyle(e).display]);}
o.app=['.app','body','html','#stage','.stage'].map(q=>{const e=document.querySelector(q);if(!e)return q+':-';const c=getComputedStyle(e);return [q,R(e),c.height,c.overflow,c.position,c.transform,c.contain]});
const pts=[[200,300],[200,500],[200,650]];o.at=pts.map(([x,y])=>{const e=document.elementFromPoint(x,y);return e?[x,y,e.tagName,e.id,(e.className||'').toString().slice(0,60)]:[x,y,null]});
return JSON.stringify(o,null,1)})()'''
r=call('Runtime.evaluate',expression=JS,returnByValue=True)
print(r.get('result',{}).get('result',{}).get('value',r))
r=call('Page.captureScreenshot',format='png')
d=r.get('result',{}).get('data')
if d: open('stress-out/shots/cdp_'+(sys.argv[1] if len(sys.argv)>1 else 'dials')+'.png','wb').write(base64.b64decode(d))
