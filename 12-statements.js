/* ABDO Restaurant — كشف الحساب */
const BL={sup:'المستحق للمورد',cust:'المستحق على الزبون',own:'المستحق على الشريك',exp:'إجمالي المدفوع',emp:'إجمالي المدفوع',plat:'الرصيد',bank:'الرصيد',cash:'الرصيد',oth:'الرصيد',dlv:'الرصيد'};
const sg=(x,id,k)=>x.t=='jv'?(x.p==id?-1:1):(k=='exp'||k=='emp')?1:TT[x.t][1];
V.st=()=>{const P=S.parties,p=P.find(x=>x.id==stp);let bal=0;
 const rows=p?S.tx.filter(x=>!x.del&&(x.p==p.id||x.p2==p.id)).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:a.id-b.id).map(x=>{bal+=sg(x,p.id,p.k)*x.a;return `<tr><td>${x.d}</td><td>${TT[x.t][0]}</td><td>${x.t=='jv'?(x.p==p.id?'إلى ':'من ')+e(pn(x.p==p.id?x.p2:x.p))+' ':''}${e(x.note||'')}</td><td>${n(x.a)}</td><td>${n(bal)}</td></tr>`}).join(''):'';
 return `<section class=card><h3>كشف حساب</h3><div class=f><select onchange="stp=+this.value;render()"><option value=0>— اختر حساباً —</option>${P.map(x=>`<option value=${x.id} ${x.id==stp?'selected':''}>${e(x.n)} (${KN[x.k]})</option>`).join('')}</select>${p?'<button class=pr onclick="ps()">طباعة الكشف</button>':''}</div></section>
 ${p?`<section class=card id=stb><h3>${e(p.n)}</h3><table><tr><th>التاريخ</th><th>البيان</th><th>ملاحظة</th><th>المبلغ</th><th>الرصيد</th></tr>${rows}</table><p class=tot>${BL[p.k]}: ${n(bal)}</p></section>`:''}`};
