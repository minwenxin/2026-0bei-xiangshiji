import { stories } from './stories.js'
import { materialFoods } from './material-foods.js'
// 保留已确认的三道样板与稳定路由，补入团队素材文档的其余36道。
export const foods = [
  {
    id: 'noodles', name: '武汉热干面', province: '湖北', city: '武汉', category: '面食',
    region: '湖北 · 武汉', description: '芝麻酱的醇厚，裹住一座城的清晨。',
    intro: '一碗碱水面，拌进芝麻酱、萝卜丁与葱花。趁热拌匀，是武汉街头熟悉的过早滋味。',
    ingredients: ['碱水面', '芝麻酱', '萝卜丁', '葱花'], flavor: '酱香浓郁 · 面条筋道',
    subtitle: '一碗过早，一城烟火',
    method: '碱水面先煮、沥水拌油抖散；吃前再烫热，调入芝麻酱，撒上萝卜丁与葱花，趁热拌匀。',
    tips: '先拌，再吃。让芝麻酱均匀裹住每一根面，才是这一碗的好滋味。',
    verbs: ['烫面', '拌酱', '添香'], image: 'noodles-sticker.webp', cookingId: 'sesame-noodles', storyId: 'breakfast-note',
    catalogSource: true, documentName: '热干面', imageKind: 'illustration',
    sourceStatus: '团队素材文档整理，保留已确认的原创热干面插画',
  },
  {
    id: 'dumplings', name: '江南小笼包', province: '江苏', city: '江南', category: '点心',
    region: '江苏 · 江南', description: '轻轻提起，尝一口蒸笼里的鲜。',
    intro: '薄皮裹住肉馅，蒸汽带出鲜香。吃时先小口尝汤，再慢慢品味；不同地方的小笼各有自己的做法。',
    ingredients: ['面粉', '猪肉馅', '肉皮冻', '姜'], flavor: '皮薄馅鲜 · 汤汁丰盈',
    subtitle: '一笼热气，几分江南',
    method: '将面团擀成薄皮，包入肉馅与皮冻，收拢褶口后上笼蒸制。皮冻遇热化成汤汁，留在薄薄的面皮里。',
    tips: '轻轻提，慢慢移。先咬一个小口，稍待汤汁降温，再品尝鲜香。',
    verbs: ['擀皮', '包馅', '蒸制'], image: 'dumplings-sticker.webp', cookingId: 'jiangnan-xiaolongbao',
    sourceStatus: '区域与菜名为样板占位，正式收录前待细化并核验',
  },
  {
    id: 'zongzi', name: '嘉兴粽子', province: '浙江', city: '嘉兴', category: '米食',
    region: '浙江 · 嘉兴', description: '一片粽叶，包住慢慢等待的好滋味。',
    intro: '粽叶清香与软糯的米粒相遇，咸甜各有风味。一只小小的粽子，也装着节令与家常。',
    ingredients: ['糯米', '粽叶', '猪肉', '酱油'], flavor: '米香软糯 · 叶香清雅',
    subtitle: '粽叶一折，日子飘香',
    method: '粽叶洗净浸软，糯米与馅料分别调味。把粽叶折成漏斗状，填米包馅、裹紧扎牢，再加水充分煮熟。',
    tips: '解开棉线，慢慢剥去粽叶。咸香的米与叶子的清香，是这份风味的两面。',
    verbs: ['折叶', '裹米', '慢煮'], image: 'zongzi-sticker.webp', cookingId: 'jiaxing-zongzi',
    sourceStatus: '演示文案，正式收录前待核验',
  },
  ...materialFoods.filter(food => food.id !== 'jiaozi'),
]
for (const story of stories) { const food = foods.find(item => item.id === story.foodId); if (food) food.storyId = story.id }
export const featuredFoods = foods.slice(0, 3)
export const foodRegions = [...new Set(foods.map(food => food.province))]
export const foodCategories = [...new Set(foods.map(food => food.category))]
export const getFood = id => foods.find(food => food.id === id)
export const asset = filename => `${import.meta.env.BASE_URL}assets/${filename}`
