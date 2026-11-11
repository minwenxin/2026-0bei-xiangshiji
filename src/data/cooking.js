export const recipes = [{
  id:'sesame-noodles', foodId:'noodles', name:'武汉热干面', kind:'noodles', guide:'阿云', fictional:true,
  completionTitle:'这一碗，拌好了。', completion:'香喷喷的一碗，做好啦！巷口的故事，还要另外去寻找。', serveLabel:'盛出这一碗', retryLabel:'再做一碗',
  steps:[{title:'先把面烫热'},{title:'拌进芝麻香'},{title:'添上最后一口脆'}],
  items:[
    {label:'碱水面',art:'15 155 640 430'}, {label:'萝卜丁与葱花',art:'1170 225 420 345'},
    {label:'葱花',art:'1660 205 500 375'}, {label:'面粉',image:'cook-flour.webp'},
    {label:'漏勺',image:'cook-skimmer.webp'}, {label:'筷子',image:'cook-chopsticks.webp'},
    {label:'粽叶',image:'cook-leaf.webp'},
  ],seasonings:['芝麻酱','酱油','香醋','香油','盐','辣椒油'],
}, {
 id:'jiaxing-zongzi',foodId:'zongzi',name:'嘉兴粽子',kind:'zongzi',guide:'阿云',fictional:true,
 completionTitle:'这一只，煮好啦。',completion:'粽叶清香，软糯的一只做好啦！制作已记下，巷口故事还要另外寻找。',serveLabel:'端出这只粽子',retryLabel:'再包一只',
 steps:[{title:'折叶成小漏斗'},{title:'铺米添馅'},{title:'包扎与煮制'}],
 items:[{label:'粽叶',image:'cook-leaf.webp'},{label:'糯米',image:'cook-rice.webp'},{label:'肉馅',image:'cook-pork.webp'},{label:'棉线',image:'cook-cotton.webp'},{label:'面粉',image:'cook-flour.webp'}],
 seasonings:['酱油','盐','香醋','香油','糖','辣椒油'],
}, {
 id:'jiangnan-xiaolongbao',foodId:'dumplings',name:'江南小笼包',kind:'xiaolongbao',guide:'阿云',fictional:true,
 kitchenImage:'cook-bun-station.webp',returnLabel:'回到小笼包',
 completionTitle:'小笼包，出笼啦。',completion:'这一只，亲手做好啦！整笼是成品展示。',serveLabel:'出笼啦',retryLabel:'再做一笼',
 servingNote:'整笼成品展示 · 本轮亲手制作一只',
 experienceNote:'简化制作体验；三次捏合仅为游戏操作，不代表工艺标准。实际制作与蒸熟时间以可靠食谱为准。',
 steps:[{title:'擀出一张面皮'},{title:'包馅捏褶'},{title:'入笼蒸制'}],
 items:[{label:'面团',image:'cook-bun-dough.webp'},{label:'擀面杖',image:'cook-bun-rolling.webp'},{label:'馅料碗',image:'cook-bun-filling-bowl.webp'},{label:'面粉',image:'cook-flour.webp'}],seasonings:[],
}]
export const getRecipe = id => recipes.find(recipe=>recipe.id===id)
