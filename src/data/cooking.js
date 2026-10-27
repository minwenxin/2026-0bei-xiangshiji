export const recipes = [{
  id: 'sesame-noodles', foodId: 'noodles', guide: '阿云', fictional: true,
  steps: [
    { title: '先把面烫热', hint: '先点一下漏勺，把面在热水里烫一烫。', tools: ['漏勺', '葱花'], correct: '漏勺', result: '面烫好了，接下来拌进酱香。' },
    { title: '拌进芝麻香', hint: '面烫好了。加入芝麻酱，香味就有了底气。', tools: ['芝麻酱', '粽叶'], correct: '芝麻酱', result: '芝麻酱拌匀了，再添最后一口脆。' },
    { title: '添上最后一口脆', hint: '最后撒点萝卜丁和葱花，再拌匀。这一碗就齐了。', tools: ['萝卜丁与葱花', '面粉'], correct: '萝卜丁与葱花', result: '热干面做好了，趁热尝尝。' },
  ],
}]
export const getRecipe = id => recipes.find(recipe => recipe.id === id)
