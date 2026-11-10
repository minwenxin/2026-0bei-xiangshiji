import { asset } from '../data/foods.js'
import { weeklyContributions, beijingWeek } from '../domain/community-ranking.js'

// 新页面统一通过服务读取；固定演示互动不混入本机真实记录。
export function createCommunityService(loadSnapshot) {
 return {async load(now=new Date()) {
  const raw=await loadSnapshot()
  if(raw.version!==1||!Array.isArray(raw.people)||!Array.isArray(raw.entries))throw new Error('演示数据格式暂时无法读取')
  const people=raw.people.filter(p=>p.id&&p.name),peopleById=new Map(people.map(p=>[p.id,p]))
  const week=beijingWeek(now),at=new Date(week.start).toISOString(),posts=[],events=[]
  for(const e of raw.entries){
   const person=peopleById.get(e.authorId)
   if(!person||e.deleted||!e.postId||typeof e.title!=='string'||typeof e.body!=='string')continue
   posts.push({
    id:e.postId, title:e.title, body:e.body, region:e.region, foodName:e.foodName, foodId:e.foodId,
    image:e.image?asset(e.image):'', imageLabel:e.imageLabel, example:true,
    authorId:person.id, author:person.name, authorColor:person.color,
    contentKind:e.kind==='editorial'?'editorial':'share', visibility:'public-demo', createdAt:at,
   })
   for(const [kind,count] of [['like',e.likes],['favorite',e.favorites]])for(let i=0;i<Math.min(100,Math.max(0,Math.floor(count||0)));i++)events.push({actorId:'demo-reader-'+i,postId:e.postId,kind,active:true,at})
  }
  const ranked=weeklyContributions({people:people.filter(person=>!person.editorial),posts,events},now)
  const enriched=posts.map(p=>({...p,demoStats:ranked.stats[p.id]||{likes:0,favorites:0}}))
  const recommended=enriched.slice().sort((a,b)=>b.demoStats.likes-a.demoStats.likes||b.demoStats.favorites-a.demoStats.favorites||a.id.localeCompare(b.id))
  return {...ranked,people,posts:enriched,recommended,mode:'demo'}
 }}
}
export const communityService=createCommunityService(async()=>{
 const response=await fetch(`${import.meta.env.BASE_URL}data/community-demo.json`,{cache:'no-store'})
 if(!response.ok)throw new Error('暂时没能取回演示手记')
 return response.json()
})
