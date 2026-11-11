import sys,json,hashlib
from pathlib import Path
sys.path.insert(0,str(Path('.local/font-tools').resolve()))
from fontTools.ttLib import TTFont
from fontTools import subset
from PIL import Image
original=Path('public/fonts/bulin-kuaixiekai.ttf')
cmap=TTFont(original).getBestCmap()
text=''.join(p.read_text(encoding='utf8',errors='ignore') for p in Path('src').rglob('*') if p.suffix in ['.vue','.js','.json','.css','.svg'])
text+=Path('index.html').read_text(encoding='utf8')
core=({ord(c) for c in text}|set(range(32,127)))&set(cmap)
rest=set(cmap)-core
def ranges(values):
 result=[];start=last=None
 for n in sorted(values):
  if last is not None and n==last+1:last=n;continue
  if start is not None:result.append(f'U+{start:X}'+(f'-{last:X}' if start!=last else ''))
  start=last=n
 if start is not None:result.append(f'U+{start:X}'+(f'-{last:X}' if start!=last else ''))
 return ','.join(result)
rules=[];stats=[]
for name,codes in [('site',core),('extra',rest)]:
 font=TTFont(original);options=subset.Options();options.flavor='woff2'
 engine=subset.Subsetter(options=options);engine.populate(unicodes=codes);engine.subset(font);font.flavor='woff2'
 temp=Path('.local')/f'{name}.woff2';font.save(temp);data=temp.read_bytes();digest=hashlib.sha256(data).hexdigest()[:10]
 target=Path(f'public/fonts/bulin-{name}-{digest}.woff2');target.write_bytes(data)
 rules.append('@font-face{font-family:"Bulin Kuaixiekai";src:url("/fonts/'+target.name+'") format("woff2");font-display:swap;unicode-range:'+ranges(codes)+';}')
 stats.append({'file':target.name,'bytes':len(data),'characters':len(codes)})
Path('src/styles/optimized-fonts.css').write_text('/* Same source font, split by existing site characters; extra characters load on demand. */\n'+'\n'.join(rules)+'\n',encoding='utf8')
for source,width,target,quality in [
 ('home-hero-ivory.webp',768,'home-hero-ivory-768.webp',85),
 ('home-hero-ivory.webp',1200,'home-hero-ivory-1200.webp',88),
 ('home-breakfast-cutout.webp',512,'home-breakfast-cutout-512.webp',84),
 ('memento-breakfast-note.webp',400,'memento-breakfast-note-400.webp',85),
 ('catalog/noodles-photo.webp',480,'catalog/noodles-photo-480.webp',84),
 ('catalog/zongzi-photo-v2.webp',480,'catalog/zongzi-photo-v2-480.webp',84)]:
 img=Image.open(Path('public/assets')/source);img.thumbnail((width,10000),Image.Resampling.LANCZOS);out=Path('public/assets')/target;img.save(out,'WEBP',quality=quality,method=6);stats.append({'file':target,'bytes':out.stat().st_size,'size':img.size})
Path('.local/mobile-asset-sizes.json').write_text(json.dumps(stats,indent=2),encoding='utf8')
print(json.dumps(stats))

