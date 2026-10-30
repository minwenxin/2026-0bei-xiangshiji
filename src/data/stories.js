export const stories = [{
  id: 'breakfast-note', foodId: 'noodles', province: '湖北', character: '阿云',
  title: '巷口，还是老样子', fictional: true,
  clue: { id: 'bowl-note', label: '翻看碗边翘起的小纸条', position: 'detail-note' },
  memento: { id: 'ayun-note', name: '阿云的早餐笺', line: '下回路过，再来坐坐。', image: 'memento-breakfast-note.webp' },
  scenes: [
    { title: '天亮开张', image: 'story-1.jpg', alt: '晨光中的面摊，双手用漏勺烫面', text: '天刚亮，阿云已经支起了巷口的面摊。她说，最早来的人总爱多要一把葱花。' },
    { title: '记得你的口味', image: 'story-2.jpg', alt: '阿云把一碗热干面递给赶早班的邻居', text: '有位赶早班的邻居，总把吃完的碗摆得整整齐齐。后来，阿云也记住了他少放萝卜丁的习惯。' },
    { title: '留一张早餐笺', image: 'story-3.jpg', alt: '木桌上留下一张早餐笺和一碗热面', text: '日子一碗一碗地过去，味道留在记忆里。阿云把一张手写早餐笺递给你：下回路过，再来坐坐。' },
  ],
}]
export const getStory = id => stories.find(story => story.id === id)
