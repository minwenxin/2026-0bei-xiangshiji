import { ref,onMounted,onBeforeUnmount } from 'vue'
import { communityService } from '../services/community.js'
export function useCommunity() {
 const data=ref(null),loading=ref(true),error=ref('')
 let generation=0,alive=true,timer=0
 async function reload(){
  const request=++generation;loading.value=true;error.value='';clearTimeout(timer)
  try{
   const result=await communityService.load()
   if(!alive||request!==generation)return
   data.value=result
   timer=window.setTimeout(reload,Math.max(1,Math.min(2147483647,result.week.end-Date.now()+20)))
  }catch(e){if(alive&&request===generation){data.value=null;error.value='这页手记暂时没取回来，请稍后再试。'}}
  finally{if(alive&&request===generation)loading.value=false}
 }
 onMounted(reload)
 onBeforeUnmount(()=>{alive=false;generation++;clearTimeout(timer)})
 return {data,loading,error,reload}
}
