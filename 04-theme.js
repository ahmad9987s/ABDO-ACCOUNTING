/* ABDO Restaurant — الألوان والمظهر */
const DT={r:'#d71920',k:'#111111',bg:'#f3f3f3',c:'#ffffff',t:'#111111',b:'#dddddd'};
const PRE=[{n:'أحمر وأسود (الأصلي)',...DT},{n:'داكن',r:'#d71920',k:'#000000',bg:'#0b0b0b',c:'#1a1a1a',t:'#f2f2f2',b:'#333333'},{n:'أزرق',r:'#1565c0',k:'#0d1b2a',bg:'#eef3f8',c:'#ffffff',t:'#0d1b2a',b:'#cfd8e3'},{n:'أخضر',r:'#1b8a3a',k:'#10231a',bg:'#eef6f0',c:'#ffffff',t:'#10231a',b:'#cfe3d5'},{n:'ذهبي وأسود',r:'#c99a2e',k:'#111111',bg:'#f6f2e8',c:'#ffffff',t:'#111111',b:'#e3dcc8'},{n:'برتقالي',r:'#ef6c00',k:'#222222',bg:'#f8f1ea',c:'#ffffff',t:'#222222',b:'#e6d9cc'}];
function applyTheme(){const T={...DT,...S.theme},s=document.documentElement.style;['r','k','bg','c','t','b'].forEach(k=>s.setProperty('--'+k,T[k]));s.setProperty('--m','color-mix(in srgb,'+T.t+' 60%,'+T.c+')')}
function th(k,v){S.theme=S.theme||{};S.theme[k]=v;applyTheme();save()}
function preset(i){const {n,...c}=PRE[i];S.theme=c;save();render()}
function thr(){S.theme={};save();render()}
SV.th=()=>{const T={...DT,...S.theme};return `<section class=card><h3>أنماط جاهزة</h3><div class=f>${PRE.map((p,i)=>`<button onclick="preset(${i})" style="border-bottom:4px solid ${p.r}">${p.n}</button>`).join('')}</div></section>
 <section class=card><h3>تخصيص الألوان</h3><div class=fm>${[['r','لون التمييز (الأزرار والعناوين)'],['k','لون الرأس والأزرار الداكنة'],['bg','خلفية الصفحة'],['c','خلفية البطاقات'],['t','لون النص'],['b','لون الحدود']].map(([k,l])=>`<label>${l}<input type=color value="${T[k]}" oninput="th('${k}',this.value)"></label>`).join('')}</div><p><button onclick=thr()>استعادة الألوان الأصلية</button></p><p class=m>تُحفظ الألوان وتظهر على كل الأجهزة. الفاتورة وPDF يبقيان أبيض وأسود دائماً.</p></section>`};
