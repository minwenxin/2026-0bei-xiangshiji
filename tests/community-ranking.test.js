import {test} from 'node:test'
import assert from 'node:assert/strict'
import {beijingWeek,weeklyContributions,validNote} from '../src/domain/community-ranking.js'
const now=new Date('2026-11-05T04:00:00Z'),at='2026-11-03T04:00:00Z'
const people=[{id:'a',name:'甲'},{id:'b',name:'乙'},{id:'c',name:'丙'}]
const note=(id,authorId='a',more={})=>({id,authorId,title:'热干面的早晨',foodName:'热干面',region:'湖北',body:'一碗热干面趁热拌匀，芝麻香浓，萝卜丁爽脆，记得街巷里熟悉的早晨。',visibility:'public-demo',createdAt:at,...more})
const event=(actorId,postId,kind='like',more={})=>({actorId,postId,kind,active:true,at,...more})
const rank=(posts,events=[])=>weeklyContributions({people,posts,events},now)
test('北京时间周一00:00切换周期，周日仍属于上一期',()=>{
 assert.equal(beijingWeek('2026-11-01T15:59:59Z').key,'2026-10-26')
 const week=beijingWeek('2026-11-01T16:00:00Z');assert.equal(week.key,'2026-11-02');assert.equal(new Date(week.end).toISOString(),'2026-11-08T16:00:00.000Z')
})
test('有效发布每周最多计三篇；空白、缺食物和删除小记不计分',()=>{
 const result=rank([1,2,3,4].map(i=>note('p'+i)).concat([note('blank','a',{body:'   '}),note('no-food','a',{foodName:''}),note('gone','a',{deleted:true})]))
 assert.equal(rank([note('same'),note('same')]).rows[0].score,10);assert.deepEqual(rank([note('future','a',{createdAt:'2026-11-06T00:00:00Z'})],[event('x','future')]).rows,[]);assert.equal(result.rows[0].score,30);assert.equal(validNote(note('bad','a',{visibility:'local'})),false)
})
test('同一用户对同篇重复互动只计一次，自赞自藏与其他行为不计分',()=>{
 const result=rank([note('p')],[event('a','p'),event('a','p','favorite'),event('x','p'),event('x','p'),event('x','p','favorite'),event('x','p','comment')])
 assert.deepEqual(result.rows[0].breakdown,{published:10,likes:1,favorites:3});assert.equal(result.rows[0].score,14)
})
test('取消互动扣回，删除内容移除整篇得分，恢复互动不重复累加',()=>{
 let events=[event('x','p'),event('x','p','favorite'),event('x','p','like',{active:false,at:'2026-11-04T04:00:00Z'}),event('x','p','favorite',{active:false,at:'2026-11-04T04:00:00Z'})]
 assert.equal(rank([note('p')],events).rows[0].score,10)
 events.push(event('x','p','favorite',{at:'2026-11-05T01:00:00Z'}));assert.equal(rank([note('p')],events).rows[0].score,13)
 assert.deepEqual(rank([note('p','a',{deleted:true})],events).rows,[])
})
test('旧帖本周收到的有效互动计入当周，过期、未来事件和未知帖子不计分',()=>{
 const result=rank([note('old','a',{createdAt:'2026-10-25T00:00:00Z'})],[event('x','old'),event('y','old','favorite',{at:'2026-11-01T15:59:59Z'}),event('z','old','favorite',{at:'2026-11-06T00:00:00Z'}),event('u','missing')])
 assert.equal(result.rows[0].score,1);assert.equal(result.rows[0].breakdown.published,0)
})
test('同分使用并列名次1、2、2，不虚构升降；无分者不入榜',()=>{
 const result=rank([note('a','a'),note('b','b'),note('c','c')],[event('u','a')])
 assert.deepEqual(result.rows.map(r=>r.rank),[1,2,2]);assert.equal(result.rows[1].tied,true)
 assert.deepEqual(rank([]).rows,[])
})
