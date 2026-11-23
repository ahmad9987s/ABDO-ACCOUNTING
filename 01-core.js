/* ABDO Restaurant — الثوابت والحالة العامة والدوال المساعدة */
const V={},SV={};let sub='items';
const DPM=[['cash','نقدي',0,'',1],['bank','بنكي',1,'',0],['wc','WHEELS نقدي',0,'WHEELS',1],['wv','WHEELS فيزا',1,'WHEELS',0],['sc','SHINI GO نقدي',0,'SHINI GO',1],['sv','SHINI GO فيزا',1,'SHINI GO',0]];
let M={};function norm(){if(!S.pm)S.pm=DPM.map(([id,n,f,g,k])=>({id,n,f,g,k}));if(!S.cfg)S.cfg={ph:'',ad:'',ft:'شكراً لزيارتكم'};if(!S.acc)S.acc=[];S.users.forEach(u=>{if(!u.a&&!u.perms)u.perms={pos:1,pur:1,exp:1,pay:1,rec:1,jv:1,st:1,rp:1,edit:1}});applyTheme();S.pm.forEach(x=>{if(x.k===undefined){const d=DPM.find(y=>y[0]==x.id);x.g=d?d[3]:'';x.k=d?d[4]:(/نقد|كاش/.test(x.n)?1:0)}});M={};S.pm.forEach(x=>M[x.id]=[x.n,+x.f||0])}
const TT={purchase:['مشتريات',1],pay:['سند صرف',-1],cred:['بيع آجل لزبون',1],rec:['سند قبض',-1],expense:['مصروف',0],salary:['راتب',0],xfer:['تحويل لشريك',1],ret:['إرجاع للصندوق',-1],plat:['تحويل بنكي من منصة',-1],jv:['سند قيد',0]};
const KP={purchase:'sup',pay:'sup',cred:'cust',rec:'cust',expense:'exp',salary:'emp',xfer:'own',ret:'own',plat:'plat'},KN={sup:'مورد',cust:'زبون',exp:'نوع مصروف',emp:'موظف',own:'شريك',plat:'منصة',bank:'حساب بنكي',cash:'صندوق / خزينة',oth:'حساب آخر',dlv:'شركة توصيل'};
const TABS={pos:'🧾 المبيعات',pur:'🛒 المشتريات',exp:'💸 المصاريف',pay:'📤 سندات الصرف',rec:'📥 سندات القبض والتحويلات',jv:'🔁 سندات القيد',st:'📒 كشف حساب',rp:'📊 التقارير',cfg:'⚙ الإعدادات'};
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>(+x||0).toFixed(2),z2=x=>String(x).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+z2(d.getMonth()+1)+'-'+z2(d.getDate()),today=()=>{const d=new Date();d.setHours(d.getHours()-(+((typeof S!=='undefined'&&S&&S.cfg&&S.cfg.bh)||0)));return ymd(d)},r2=x=>Math.round((+x||0)*100)/100,$=s=>document.querySelector(s),sum=(a,f)=>a.reduce((x,y)=>x+f(y),0);
let S={seq:1,users:[{u:'ADMIN',p:'ADMIN',a:1}],items:[],sales:[],parties:[],tx:[]};
try{const l=localStorage.getItem('abdo');if(l)S=JSON.parse(l)}catch(x){}
let cat='',edId=0,me=null,tab='pos',cart=[],es=0,sdt='',oq='',dsc=0,dty='a',dlv=0,dco=0,pvw=700,IV=null,pmv='cash',rpm='day',rpd=today(),stp=0,ref=null,timer;const cid=Math.random().toString(36).slice(2);
try{const u=sessionStorage.getItem('abdoU');if(u)me=S.users.find(x=>x.u===u)||null}catch(x){}
let status='';function st(t){status=t;const el=$('#stt');if(el)el.textContent=t}
