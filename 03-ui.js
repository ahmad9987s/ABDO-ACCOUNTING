/* ABDO Restaurant — النوافذ والرسائل والطباعة وPDF */
function toast(m){const d=document.createElement('div');d.textContent=m;d.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 16px;border-radius:10px;border-bottom:3px solid #d71920;z-index:99;max-width:90%';document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}
const TW=g=>+IC().pw||(g.mm==58?48:72);
const PGM=w=>w<=250?{mm:58,s:'58mm auto',m:0}:w<=400?{mm:80,s:'80mm auto',m:0}:w==560?{mm:148,s:'A5',m:'8mm'}:{mm:210,s:'A4',m:'8mm'};
function pr(h,w){w=w||700;pvw=w;const g=PGM(w),th=g.mm<100;$('#mod').innerHTML=`<style>@media print{@page{size:${th?'auto':g.s};margin:${g.m}}#pv{width:${th?TW(g)+'mm':'100%'}!important;padding:0!important;margin:0!important}#mod .box{max-width:${th?'none':'780px'};margin:0}}</style><div class=box><div class="f noprint" style="margin-bottom:10px"><button class=pr onclick=doPrint()>🖨 طباعة</button><button onclick=savePdf(${w})>⬇ حفظ PDF</button><button onclick=cl()>إغلاق</button></div><div id=pv style="width:${w}px;max-width:100%">${h}</div></div>`;$('#mod').className='on'}
function cl(){$('#mod').className='';$('#mod').innerHTML=''}
async function dl(n,b){try{const d=window.claude&&await claude.use('downloads');if(d){await d.save({filename:n,data:b});return}const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click()}catch(x){toast('تعذر التنزيل')}}
async function savePdf(w){try{const g=PGM(w),mm=g.mm,th=mm<100,pw=th?TW(g):mm,cw=th?Math.round(pw*3.78):w,c=$('#pv').cloneNode(true);c.style.cssText='position:absolute;left:-9999px;top:0;width:'+cw+'px;background:#fff;color:#000;padding:0 4px';c.querySelectorAll('.noprint').forEach(x=>x.remove());document.body.appendChild(c);const cv=await html2canvas(c,{scale:2,backgroundColor:'#fff'});c.remove();
 const {jsPDF}=window.jspdf,ph=cv.height*pw/cv.width,H=mm==148?210:297,doc=new jsPDF({unit:'mm',format:th?[mm,ph+4]:(mm==148?'a5':'a4')}),im=cv.toDataURL('image/jpeg',.92);
 if(th)doc.addImage(im,'JPEG',(mm-pw)/2,2,pw,ph);else for(let y=0;y<ph;y+=H){if(y)doc.addPage();doc.addImage(im,'JPEG',0,-y,mm,ph)}
 dl('ABDO-'+Date.now()+'.pdf',doc.output('blob'))}catch(x){toast('تعذر إنشاء PDF')}}
function dlg(h){$('#dlg').innerHTML=`<div class=box style="max-width:420px;margin-top:10vh">${h}</div>`;$('#dlg').className='on'}
function dc(){$('#dlg').className='';$('#dlg').innerHTML=''}
let _cb=null,_fm=null;function ask(m,f){_cb=f;dlg(`<p>${e(m)}</p><div class=f><button class=pr onclick="dc();_cb()">نعم</button><button onclick=dc()>إلغاء</button></div>`)}
function form(t,F,v,f){_fm={F,f};dlg(`<h3>${e(t)}</h3><div class=fm>${F.map(x=>`<label>${x.l}${x.o?`<select id="f_${x.k}">${x.o.map(([a,b])=>`<option value="${e(a)}" ${a==v[x.k]?'selected':''}>${e(b)}</option>`).join('')}</select>`:`<input id="f_${x.k}" type="${x.t||'text'}" ${x.t=='number'?'step=any':''} value="${e(v[x.k]??'')}">`}</label>`).join('')}</div><div class=f style="margin-top:10px"><button class=pr onclick=fs()>حفظ</button><button onclick=dc()>إلغاء</button></div>`)}
function fs(){const o={};_fm.F.forEach(x=>{o[x.k]=$('#f_'+x.k).value});const f=_fm.f;dc();f(o)}
const pmo=()=>S.pm.map(x=>[x.id,x.n]);
