// 北京时间无夏令时。周区间为 [周一00:00, 下周一00:00)。
const DAY=86400000, OFFSET=8*3600000
export function beijingWeek(now=new Date()) {
 const time=+new Date(now)
 if(!Number.isFinite(time))throw new Error('无法识别统计时间')
 const local=new Date(time+OFFSET), weekday=(local.getUTCDay()+6)%7
 const start=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate())-OFFSET-weekday*DAY
 const date=value=>new Date(value+OFFSET).toISOString().slice(0,10)
 return {start,end:start+7*DAY,key:date(start),label:`${date(start)} — ${date(start+6*DAY)}（北京时间）`}
}
export function validNote(post) {
 return !!post && typeof post.id==='string' && !!post.id.trim() && typeof post.authorId==='string' && !!post.authorId.trim() && !post.deleted && post.visibility==='public-demo' && !!post.foodName?.trim() && !!post.region?.trim() && !!post.title?.trim() && (post.body?.trim().length||0)>=20
}
export function weeklyContributions({people,posts,events},now=new Date()) {
 const week=beijingWeek(now),cutoff=+new Date(now)
 const valid=[...new Map(posts.map(p=>[p.id,p])).values()].filter(p=>validNote(p)&&Number.isFinite(Date.parse(p.createdAt))&&Date.parse(p.createdAt)<=cutoff),byId=new Map(valid.map(p=>[p.id,p]))
 const stats=new Map(valid.map(p=>[p.id,{likes:0,favorites:0}]))
 // 先按事件时间排序，再保留用户/帖子/动作的最终状态，取消自然扣回。
 const latest=new Map()
 for(const e of events.slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))){
  const time=Date.parse(e.at),post=byId.get(e.postId)
  if(!post||time<week.start||time>=week.end||time>cutoff||!Number.isFinite(time)||!e.actorId||e.actorId===post.authorId||!['like','favorite'].includes(e.kind))continue
  latest.set(JSON.stringify([e.actorId,e.postId,e.kind]),e)
 }
 for(const e of latest.values())if(e.active===true)stats.get(e.postId)[e.kind==='like'?'likes':'favorites']++
 const rows=[]
 for(const person of people){
  const own=valid.filter(p=>p.authorId===person.id)
  const published=own.filter(p=>Date.parse(p.createdAt)>=week.start&&Date.parse(p.createdAt)<week.end&&Date.parse(p.createdAt)<=cutoff)
  const likes=own.reduce((n,p)=>n+stats.get(p.id).likes,0),favorites=own.reduce((n,p)=>n+stats.get(p.id).favorites,0)
  const breakdown={published:Math.min(3,published.length)*10,likes,favorites:favorites*3}
  const score=breakdown.published+breakdown.likes+breakdown.favorites
  if(!score)continue
  const representative=own.slice().sort((a,b)=>{
   const aa=stats.get(a.id),bb=stats.get(b.id)
   return (bb.likes+bb.favorites*3)-(aa.likes+aa.favorites*3)||a.id.localeCompare(b.id)
  })[0]
  rows.push({...person,score,breakdown,representative,postCount:own.length})
 }
 rows.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))
 let rank=0
 const ranked=rows.map((r,i)=>{if(!i||rows[i-1].score!==r.score)rank=i+1;return {...r,rank,tied:rows.some(other=>other.id!==r.id&&other.score===r.score)}})
 return {week,rows:ranked,stats:Object.fromEntries(stats)}
}
