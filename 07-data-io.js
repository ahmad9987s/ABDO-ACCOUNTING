/* ABDO Restaurant — تصدير واستيراد Excel والنسخ الاحتياطي */
const xbar=sc=>`<span class=f><button onclick="xl('${sc}')">⬇ Excel</button><label class=fb>⬆ رفع Excel<input type=file accept=".xlsx,.xls" style="display:none" onchange="imp(this)"></label></span>`;
const R={items:()=>S.items.map(i=>({'الصنف':i.n,'السعر':i.p,'التكلفة':i.c||0,'التصنيف':i.g||''})),
 parties:()=>S.parties.map(q=>({'الاسم':q.n,'النوع':KN[q.k],'هاتف':q.ph||'','ملاحظات':q.nt||'','الحساب':(S.acc.find(a=>a.id==q.ac)||{}).code||''})),
 acc:()=>S.acc.map(a=>({'الرمز':a.code,'الاسم':a.n,'النوع':AT[a.t],'الأب':(S.acc.find(x=>x.id==a.pa)||{}).code||''})),
 pm:()=>S.pm.map(x=>({'الاسم':x.n,'الخصم %':x.f,'المنصة':x.g||'','الاستلام':x.k?'نقداً':'بنكي'})),
 tx:ty=>S.tx.filter(x=>!x.del&&(!ty||ty.includes(x.t))).map(x=>({'التاريخ':x.d,'النوع':TT[x.t][0],'الطرف':pn(x.p),'إلى حساب':x.p2?pn(x.p2):'','المبلغ':x.a,'ملاحظة':x.note||''})),
 sales:()=>S.sales.filter(s=>!s.del).map(s=>({'التاريخ':s.d,'الدفع':(M[s.m]||[s.m])[0],'الإجمالي':s.tot,'الخصم':s.fee,'الصافي':s.net,'خصم الطلب':s.disc||0,'التوصيل':s.dlv||0,'الأصناف':s.L.map(l=>l.n+'×'+l.q).join('، ')}))};
function xl(sc){const X=XLSX,wb=X.utils.book_new(),A=(n,r)=>X.utils.book_append_sheet(wb,X.utils.json_to_sheet(r),n),all=!sc||sc=='all';
 if(all||sc=='items')A('الأصناف',R.items());if(all||sc=='parties')A('الأطراف',R.parties());if(all||sc=='acc')A('شجرة الحسابات',R.acc());if(all||sc=='pm')A('طرق الدفع',R.pm());
 if(all)A('الحركات',R.tx());else if(PG[sc])A('الحركات',R.tx(PG[sc].t));if(all||sc=='sales')A('المبيعات',R.sales());
 dl('ABDO-'+(all?'data':sc)+'.xlsx',new Blob([X.write(wb,{type:'array',bookType:'xlsx'})]))}
function imp(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const wb=XLSX.read(r.result,{type:'array'}),J=n=>wb.Sheets[n]?XLSX.utils.sheet_to_json(wb.Sheets[n]):[],D=v=>typeof v=='number'?new Date(Math.round((v-25569)*864e5)).toISOString().slice(0,10):String(v||today()),
 kn=Object.fromEntries(Object.entries(KN).map(([k,v])=>[v,k])),tn=Object.fromEntries(Object.entries(TT).map(([k,v])=>[v[0],k])),at=Object.fromEntries(Object.entries(AT).map(([k,v])=>[v,k]));let c=0;
 J('شجرة الحسابات').forEach(r=>{const cd=String(r['الرمز']||'').trim();if(cd&&!S.acc.some(a=>a.code==cd)){S.acc.push({id:S.seq++,code:cd,n:r['الاسم']||cd,t:at[r['النوع']]||'asset',pa:0,_p:String(r['الأب']||'')});c++}});
 S.acc.forEach(a=>{if(a._p!==undefined){const q=S.acc.find(x=>x.code==a._p);a.pa=q?q.id:0;delete a._p}});
 J('طرق الدفع').forEach(r=>{if(r['الاسم']&&!S.pm.some(x=>x.n==r['الاسم'])){S.pm.push({id:'m'+S.seq++,n:r['الاسم'],f:+r['الخصم %']||0,g:r['المنصة']||'',k:/نقد/.test(r['الاستلام'])?1:0});c++}});
 J('الأصناف').forEach(r=>{if(!r['الصنف'])return;let i=S.items.find(x=>x.n==r['الصنف']);if(!i){i={id:S.seq++,n:r['الصنف']};S.items.push(i);c++}Object.assign(i,{p:+r['السعر']||0,c:+r['التكلفة']||0,g:r['التصنيف']||''})});
 J('الأطراف').forEach(r=>{const k=kn[r['النوع']]||'sup',ac=(S.acc.find(a=>a.code==String(r['الحساب']||''))||{}).id||0;if(r['الاسم']&&!S.parties.some(p=>p.n==r['الاسم']&&p.k==k)){S.parties.push({id:S.seq++,n:r['الاسم'],k,ph:r['هاتف']||'',nt:r['ملاحظات']||'',ac});c++}});
 J('الحركات').forEach(r=>{const ty=tn[r['النوع']],q=S.parties.find(x=>x.n==r['الطرف']),q2=S.parties.find(x=>x.n==r['إلى حساب']),d=D(r['التاريخ']),a=+r['المبلغ'];if(ty&&q&&a>0&&!S.tx.some(y=>y.d==d&&y.t==ty&&y.p==q.id&&y.a==a)){S.tx.push({id:S.seq++,t:ty,p:q.id,a,d,note:r['ملاحظة']||'',...(ty=='jv'&&q2?{p2:q2.id}:{})});c++}});
 const mn=Object.fromEntries(S.pm.map(x=>[x.n,x.id]));
 J('المبيعات').forEach(r=>{const tot=+r['الإجمالي'],d=D(r['التاريخ']),m=mn[r['الدفع']]||'cash',fee=+r['الخصم']||0;if(tot>0&&!S.sales.some(y=>y.d==d&&y.m==m&&y.tot==tot&&y.fee==fee)){S.sales.push({id:S.seq++,d,L:[{n:'مستورد',p:tot,q:1,c:0}],tot,fee,net:tot-fee,m,by:me.u,disc:+r['خصم الطلب']||0,dlv:+r['التوصيل']||0});c++}});
 save();render();toast('تم استيراد '+c+' سجلاً')}catch(x){toast('ملف غير صالح')}};r.readAsArrayBuffer(f)}
function bk(){dl('ABDO-backup-'+today()+'.json',new Blob([JSON.stringify(S)],{type:'application/json'}))}
function rs(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o.users||!o.items)throw 0;ask('استبدال كل البيانات الحالية بالنسخة الاحتياطية؟',()=>{S=o;me=S.users.find(x=>x.u===(me||{}).u)||S.users[0];save();render();toast('تمت الاستعادة')})}catch(x){toast('ملف غير صالح')}};r.readAsText(f)}
