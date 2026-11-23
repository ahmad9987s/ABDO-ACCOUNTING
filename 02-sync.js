/* ABDO Restaurant — الحفظ المحلي والمزامنة السحابية */
const SY={db:null,live:false,hasCore:0,core:'',rec:{},docs:new Set(),rd:{core:0,sd:0,td:0},q:Promise.resolve(),go:0};
const BK={S:{col:'sd',fld:'s',arr:'sales'},T:{col:'td',fld:'t',arr:'tx'}};
const coreOf=()=>{const {sales,tx,seq,...c}=S;return c};
function fixSeq(){let m=0;[S.sales,S.tx,S.items,S.parties,S.acc].forEach(a=>(a||[]).forEach(x=>{if(+x.id>m)m=+x.id}));S.seq=Math.max(+S.seq||1,m+1)}
function save(){try{localStorage.setItem('abdo',JSON.stringify(S))}catch(x){}
 if(!SY.db){st('محفوظ على هذا الجهاز');return}
 st(SY.live?'جارٍ الحفظ…':'بانتظار الاتصال بالسحابة…');clearTimeout(timer);timer=setTimeout(push,500)}
function push(){if(!SY.live)return;SY.q=SY.q.then(doPush).then(()=>st('تم الحفظ ✓ (سحابي)')).catch(()=>{st('تعذر الحفظ السحابي — ستُعاد المحاولة');setTimeout(push,8000)})}
async function wr(ref,body,known){if(known){try{await ref.update(body);return}catch(x){}}const sn=await ref.get();if(sn.exists)await ref.update(body);else await ref.set(body)}
async function doPush(){const db=SY.db,cj=JSON.stringify(coreOf());
 if(cj!==SY.core){await db.doc('app/core').set({json:cj,by:cid,t:Date.now()});SY.core=cj}
 const plan={},seen={},P=(path,fld)=>plan[path]||(plan[path]={fld,m:{},ap:[]});
 for(const [pre,b] of Object.entries(BK))for(const r of S[b.arr]){const key=pre+r.id,j=JSON.stringify(r),path=b.col+'/'+r.d,o=SY.rec[key];seen[key]=1;
  if(o&&o.j===j&&o.b===path)continue;
  if(o&&o.b!==path)P(o.b,b.fld).m[r.id]=null;
  const q=P(path,b.fld);q.m[r.id]=r;q.ap.push(()=>{SY.rec[key]={j,b:path}})}
 for(const key of Object.keys(SY.rec))if(!seen[key]){const o=SY.rec[key],b=BK[key[0]],q=P(o.b,b.fld);q.m[key.slice(1)]=null;q.ap.push(()=>{delete SY.rec[key]})}
 for(const [path,q] of Object.entries(plan)){if(!Object.keys(q.m).length)continue;await wr(db.doc(path),{[q.fld]:q.m},SY.docs.has(path));SY.docs.add(path);q.ap.forEach(f=>f())}}
function applyDoc(pre,path,data){const b=BK[pre],o=(data&&data[b.fld])||{},arr=S[b.arr];let ch=0;
 for(const [id,rec] of Object.entries(o)){const key=pre+id,i=arr.findIndex(x=>String(x.id)===id),cur=SY.rec[key];
  if(rec===null||rec===undefined){if(i>=0&&b.col+'/'+arr[i].d===path){arr.splice(i,1);delete SY.rec[key];ch=1}continue}
  if(b.col+'/'+rec.d!==path)continue;
  const j=JSON.stringify(rec);if(cur&&cur.j===j&&i>=0)continue;
  if(i>=0&&!cur&&SY.live&&JSON.stringify(arr[i])!==j){fixSeq();arr[i].id=S.seq++;arr.push(rec);SY.rec[key]={j,b:path};ch=1;continue}
  if(i>=0&&cur&&JSON.stringify(arr[i])!==cur.j)continue;
  if(i>=0)arr[i]=rec;else arr.push(rec);SY.rec[key]={j,b:path};ch=1}
 if(ch)arr.sort((x,y)=>x.id-y.id);return ch}
function applyCore(d){if(!d||d.json===SY.core)return false;let o;try{o=JSON.parse(d.json)}catch(x){return false}
 const keep={sales:S.sales,tx:S.tx,seq:S.seq};for(const k of Object.keys(S))delete S[k];Object.assign(S,o,keep);SY.core=d.json;if(me)me=S.users.find(x=>x.u===me.u)||null;return true}
async function initCloud(){try{const db=window.claude&&await claude.use('db');if(!db)return;SY.db=db;st('جارٍ تحميل البيانات من السحابة…');
 setTimeout(()=>{if(!SY.live)st('الاتصال بالسحابة بطيء — قد تكون البيانات غير محدّثة')},10000);
 const ui=()=>{const a=document.activeElement;if(!a||!/INPUT|SELECT|TEXTAREA/.test(a.tagName))render()};
 const go=async()=>{if(SY.live||SY.go||!(SY.rd.core&&SY.rd.sd&&SY.rd.td))return;SY.go=1;
  if(!SY.hasCore){try{const l=await db.doc('app/state').get();if(l.exists){const d=l.data();try{S=JSON.parse(d.json);norm();if(me)me=S.users.find(x=>x.u===me.u)||null}catch(x){}}}catch(x){}}
  SY.live=true;fixSeq();st('متصل بالسحابة ✓');ui();push()};
 db.doc('app/core').onSnapshot(s=>{SY.rd.core=1;if(s.exists){SY.hasCore=1;if(applyCore(s.data())){norm();ui()}}go()},()=>st('السحابة غير متاحة'));
 for(const [pre,b] of Object.entries(BK))db.collection(b.col).onSnapshot(sn=>{let ch=0;sn.docChanges().forEach(c=>{const path=b.col+'/'+c.doc.id;if(c.type=='removed'){SY.docs.delete(path);return}SY.docs.add(path);if(applyDoc(pre,path,c.doc.data()))ch=1});SY.rd[b.col]=1;if(ch){fixSeq();try{localStorage.setItem('abdo',JSON.stringify(S))}catch(x){}ui();if(SY.live)st('تم التحديث ✓')}go()},()=>st('السحابة غير متاحة'))
}catch(x){}}
