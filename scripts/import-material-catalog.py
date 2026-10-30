"""将团队整理表与已提取图片转为前端菜品数据；图片仅缩放、编码，不作创意修改。"""
from pathlib import Path
import json
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
extract = root.parent / '文档/素材参考提取/网页素材_20261028'
rows = json.loads((root / '素材/菜品整理.json').read_text(encoding='utf-8-sig'))
images = json.loads((extract / 'index.json').read_text(encoding='utf-8'))
out = root / 'public/assets/catalog'
out.mkdir(parents=True, exist_ok=True)
catalog, manifest = [], []
for row in rows:
    ident, name, province, city, category, photo, description, intro, ingredients, flavor, steps, tips = row
    parsed = [dict(zip(['title', 'text'], step.split('~', 1))) for step in steps.split('|')]
    image = f'catalog/{ident}.webp' if photo else 'jiaozi-sticker.webp'
    if photo:
        source = extract / images[photo - 1]['file']
        with Image.open(source) as picture:
            picture = ImageOps.exif_transpose(picture)
            picture.thumbnail((960, 960))
            picture.convert('RGB').save(root / 'public/assets' / image, 'WEBP', quality=83, method=6)
    record = dict(id=ident, name=name, province=province, city=city, category=category,
        region=f'{province} · {city}' if province != '跨地域' else '南北家常 · 多地',
        description=description, intro=intro, ingredients=ingredients.split(','), flavor=flavor,
        subtitle=description, method=''.join(step['text'] for step in parsed), steps=parsed,
        verbs=[step['title'] for step in parsed], tips=tips, image=image,
        imageKind='photo' if photo else 'illustration', catalogSource=True,
        sourceStatus='团队素材文档整理；做法为工艺简述，配图来源待核验')
    catalog.append(record)
    manifest.append(dict(id=ident, name=name, province=province, documentImage=images[photo-1]['file'] if photo else None,
        webAsset=image, origin='团队素材文档配图，原作者与授权待核验' if photo else '内置 imagegen 原创临时插画'))

(root / 'src/data/material-foods.js').write_text('// 来源：素材/网页素材.doc，整理表与来源映射见素材目录。\nexport const materialFoods = '+json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(root / '素材/菜品配图映射.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Imported {len(catalog)} additional foods; optimized {sum(bool(row[5]) for row in rows)} document images.')
