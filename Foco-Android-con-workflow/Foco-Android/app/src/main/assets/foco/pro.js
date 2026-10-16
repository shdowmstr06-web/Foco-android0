(()=>{
const $=id=>document.getElementById(id),{toast,dlg,tab}=FocoUI;
const PRICE='2,99 US$'; // PRECIO DE EJEMPLO: el real lo define la Store
const DEV=!window.focoApp||!focoApp.isDev||focoApp.isDev();
let PROV=false;const isPro=()=>PROV; // la licencia la decide main.js, no la página
const setPro=v=>{PROV=v;if(!v)theme('');render();};
window.coinBonus=n=>isPro()?Math.round(n*1.5):n;

const TH={aurora:['🌿 Aurora','#0fa37f','#6ee7c0'],atardecer:['🌅 Atardecer','#e8505b','#ff9a6c'],neon:['🌃 Neón','#ff4fd8','#7a5cff']};
const PH={aurora:['🌌 Aurora boreal',{c:['#0B1F3A','#1FA37A','#fff'],gr:'#126B52',d:['🌌','❄️','✨'],night:1,image:'build/habitats/aurora.webp'}],
 sakura:['🌸 Jardín sakura',{c:['#FFD6E5','#FF9EC4','#3A2450'],gr:'#C86A93',d:['🌸','🏮','🦋'],image:'build/habitats/sakura.webp'}],
 nebulosa:['🪐 Nebulosa',{c:['#12002B','#7A1FD6','#fff'],gr:'#3A0C6B',d:['🌠','💜','🛸'],night:1,image:'build/habitats/nebulosa.webp'}]};
if(typeof HAB==='object')Object.assign(HAB,Object.fromEntries(Object.entries(PH).map(([k,[,v]])=>[k,v])));

const st=document.createElement('style');st.textContent=`
html[data-theme=aurora]{--bg:#eafff6;--ink:#0e3b34;--mute:#4f7f76;--line:#bdeede;--acc:#0fa37f;--acc2:#6ee7c0;--stage:#d3f7ea;--track:#c9efe1;--glow:rgba(15,163,127,.2);--panel:rgba(255,255,255,.9);--on:#fff}
html[data-theme=atardecer]{--bg:#fff1e8;--ink:#4a1d2b;--mute:#9a6070;--line:#ffd3c0;--acc:#e8505b;--acc2:#ff9a6c;--stage:#ffe2d3;--track:#ffd9c8;--glow:rgba(232,80,91,.2);--panel:rgba(255,255,255,.88);--on:#fff}
html[data-theme=neon]{color-scheme:dark;--bg:#0a0618;--panel:rgba(24,12,48,.92);--ink:#f3eaff;--mute:#b79ee6;--line:#3a2270;--acc:#ff4fd8;--acc2:#7a5cff;--on:#1a0b33;--stage:#1f1040;--track:#33205f;--glow:rgba(255,79,216,.22)}
.tabs button[data-t=pro]{border:0;color:#fff;background:linear-gradient(120deg,#ffb347,#ff5fa2,#7a5cff,#ffb347);background-size:300% 100%;animation:shine 4s linear infinite}@keyframes shine{to{background-position:300% 0}}
.hero{border-radius:20px;padding:30px 20px;text-align:center;color:#fff;background:radial-gradient(circle at 15% 0,#ff5fa2,transparent 50%),radial-gradient(circle at 90% 100%,#ffb347,transparent 45%),linear-gradient(135deg,#4b2bbf,#7a5cff)}
.hero h2{font-size:clamp(24px,5vw,36px);margin:10px 0 4px;letter-spacing:-.04em}.hero p{margin:0 0 18px;opacity:.92}
.pill{font-weight:800;font-size:12px;letter-spacing:.12em;padding:4px 12px;border-radius:99px;background:#fff3;border:1px solid #fff6}
.cta{font-size:17px;padding:14px 28px;border:0;border-radius:99px;cursor:pointer;font-weight:800;background:linear-gradient(#ffd36e,#ffa63d)!important;color:#3a2450!important;box-shadow:0 8px 26px #ffa63d88;animation:pulseb 2s ease-in-out infinite}.cta:disabled{animation:none;opacity:.85;cursor:default}@keyframes pulseb{50%{transform:scale(1.045)}
.key-access{display:block;margin:12px auto 0;padding:6px 10px;border:0;background:transparent;color:#fff;font:600 12px "Segoe UI",system-ui,sans-serif;text-decoration:underline;text-underline-offset:3px;opacity:.86;cursor:pointer}.key-access:hover{opacity:1}.key-access:focus-visible{outline:2px solid #fff;border-radius:8px}}
.perks{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:16px 0}.perk{border:1px solid var(--line);border-radius:16px;padding:14px;background:var(--bg)}.perk span{font-size:28px;display:block}.perk small{color:var(--mute)}
.propanel h3{margin:18px 0 8px}.propanel .row{display:flex;gap:8px;flex-wrap:wrap}.propanel #phab button{min-width:145px}.propanel #phab button.active{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 14%,var(--panel));box-shadow:0 0 0 2px color-mix(in srgb,var(--acc) 18%,transparent)}.sw{border:0;color:#fff;font:700 13px "Segoe UI",system-ui,sans-serif;padding:11px 16px;border-radius:12px;cursor:pointer;text-shadow:0 1px 2px #0007}
.probadge{font:800 11px "Segoe UI",system-ui,sans-serif;padding:3px 9px;border-radius:99px;background:linear-gradient(#ffd36e,#ffa63d);color:#3a2450;letter-spacing:.05em}
.pet.pro .art svg{filter:drop-shadow(0 0 14px #ffd36e)}
.gate{position:relative;overflow:hidden}.gate.locked .blur{filter:blur(7px);pointer-events:none;user-select:none}.gate .unlock{display:none;position:absolute;inset:0;place-items:center}.gate.locked .unlock{display:grid}
.rp{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.rp div{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:12px;font-size:12px;color:var(--mute)}.rp strong{display:block;font-size:22px;color:var(--ink);text-transform:capitalize}
.pro-password-dialog{width:min(420px,calc(100% - 32px));border:1px solid var(--line);border-radius:22px;padding:24px;background:var(--panel);color:var(--ink);box-shadow:0 24px 80px #0004}.pro-password-dialog::backdrop{background:#100b25a8;backdrop-filter:blur(5px)}.pro-password-dialog h2{margin:0 0 8px}.pro-password-dialog p{color:var(--mute)}.pro-password-dialog label{display:block;font-size:13px;font-weight:700;margin:16px 0 6px}.pro-password-dialog input{width:100%;font:inherit;padding:12px 13px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink)}.pro-password-dialog .pw-error{min-height:1.4em;color:#d94b68;font-size:13px;margin:8px 0}.pro-password-dialog .ctrl{margin-top:12px}`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.className='panel wide propanel';sec.dataset.tab='pro';sec.setAttribute('aria-label','Foco Pro');
sec.innerHTML=`<div class="hero"><span class="pill">✦ FOCO PRO</span><h2>Tu foco, en modo leyenda</h2><p>Un solo pago. Sin suscripción. Para siempre.</p><button class="cta" id="pcta"></button><button type="button" class="key-access" id="pkey">¿Ya tienes una clave de acceso?</button></div>
<div class="perks"><div class="perk"><span>🎨</span><b>3 temas exclusivos</b><small>Aurora, Atardecer y Neón.</small></div><div class="perk"><span>🏞️</span><b>3 hábitats Pro</b><small>Aurora boreal, sakura y nebulosa.</small></div><div class="perk"><span>📈</span><b>Informe semanal</b><small>Tu progreso real, comparado con la semana pasada.</small></div><div class="perk"><span>🪙</span><b>+50% de monedas</b><small>En cada sesión de foco.</small></div><div class="perk"><span>👑</span><b>Aura dorada</b><small>Y la insignia PRO junto a tu mascota.</small></div><div class="perk"><span>💎</span><b>Pago único</b><small>Sin suscripciones ni anuncios.</small></div></div>
<h3>Temas <small>(toca uno para verlo 8 segundos)</small></h3><div class="row" id="pth"></div><h3>Hábitats exclusivos</h3><div class="row" id="phab"></div><p class="note" id="pdev"></p>`;
document.querySelector('main').appendChild(sec);
const rep=document.createElement('section');rep.className='panel wide gate';rep.dataset.tab='tareas';
rep.innerHTML='<div class="blur"></div><div class="unlock"><button class="cta" id="punl">✦ Desbloquear informe semanal</button></div>';
document.querySelector('section[data-tab=tareas]').before(rep);

function week(o){let n=0,b=['',0];for(let i=0;i<7;i++){const d=new Date(Date.now()-(i+o*7)*864e5),v=S.days[d.toLocaleDateString('sv')]||0;n+=v;if(v>b[1])b=[d.toLocaleDateString('es',{weekday:'long'}),v];}return{n,b};}
function report(){const a=week(0),p=week(1),df=p.n?Math.round((a.n-p.n)/p.n*100):null;
 return `<h2 class="gh">📈 Informe semanal</h2><div class="rp"><div><strong>${a.n}</strong>sesiones</div><div><strong>${(a.n*S.set.focus/60).toFixed(1)} h</strong>enfocado (aprox.)</div><div><strong>${a.b[0]||'—'}</strong>tu mejor día</div><div><strong>${df===null?'—':(df>=0?'+':'')+df+'%'}</strong>vs. semana pasada</div></div>`;}

const theme=k=>{document.documentElement.dataset.theme=k||'';};
const sav=()=>isPro()?(localStorage.getItem('foco-theme')||''):'';
let pv;function pick(k){clearTimeout(pv);
 if(isPro()||!k){theme(k);try{localStorage.setItem('foco-theme',k||'');}catch(e){}return;}
 theme(k);toast('Vista previa de 8 s','Desbloquear ✦',()=>{clearTimeout(pv);theme('');tab('pro');});pv=setTimeout(()=>theme(sav()),8000);}
const upsell=()=>dlg('<h2>✦ Esto es de Foco Pro</h2><p>Desbloquéalo con un solo pago, sin suscripción.</p>','Ver Foco Pro',()=>tab('pro'),1);
window.focoProIsActive=()=>isPro();window.focoShowProUpsell=()=>upsell();
function buy(){
 if(isPro())return;
 const d=document.createElement('dialog');
 d.className='pro-password-dialog';
 d.innerHTML='<h2>✦ Activar Foco Pro</h2><p>Introduce la contraseña para desbloquear las funciones Pro.</p><label for="pro-password-input">Contraseña</label><input id="pro-password-input" type="password" autocomplete="current-password" maxlength="128" placeholder="Escribe la contraseña"><p class="pw-error" id="pro-password-error" role="alert"></p><div class="ctrl"><button type="button" class="main" id="pro-password-submit">Activar Pro</button><button type="button" class="ghost" id="pro-password-cancel">Cancelar</button></div>';
 document.body.appendChild(d);
 const input=d.querySelector('#pro-password-input'),error=d.querySelector('#pro-password-error'),submit=d.querySelector('#pro-password-submit');
 const close=()=>{if(d.open)d.close();};
 d.addEventListener('close',()=>d.remove());
 d.querySelector('#pro-password-cancel').onclick=close;
 const activate=async()=>{
   const password=input.value;
   if(!password){error.textContent='Escribe la contraseña para continuar.';input.focus();return;}
   submit.disabled=true;submit.textContent='Comprobando…';error.textContent='';
   try{
     const r=window.focoApp&&focoApp.proPasswordActivate?await focoApp.proPasswordActivate(password):{ok:false};
     input.value='';
     if(r&&r.ok){close();setPro(true);typeof burst==='function'&&burst(40);typeof say==='function'&&say('¡Foco Pro activado! ✦');}
     else{error.textContent='Contraseña incorrecta. Inténtalo de nuevo.';submit.disabled=false;submit.textContent='Activar Pro';input.focus();input.select();}
   }catch(e){error.textContent='No se pudo comprobar la contraseña. Reinicia Foco e inténtalo otra vez.';submit.disabled=false;submit.textContent='Activar Pro';}
 };
 submit.onclick=activate;
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activate();}});
 d.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 d.showModal();input.focus();
}

function render(){const p=isPro(),h=document.querySelector('.top h1');let b=document.querySelector('.probadge');
 document.querySelector('.pet').classList.toggle('pro',p);
 if(p&&!b){b=document.createElement('span');b.className='probadge';b.textContent='✦ PRO';h.appendChild(b);}else if(!p&&b)b.remove();
 $('pcta').textContent=p?'✓ Foco Pro activo':'Desbloquear por '+PRICE;$('pcta').disabled=p;
 $('pth').innerHTML=Object.entries(TH).map(([k,[n,a,c]])=>`<button class="sw" data-k="${k}" style="background:linear-gradient(135deg,${a},${c})">${n}${p?'':' 🔒'}</button>`).join('')+'<button class="ghost" data-k="">Predeterminado</button>';
 $('phab').innerHTML=Object.entries(PH).map(([k,[n]])=>`<button type="button" class="ghost pro-habitat exclusive ${S.bg===k?'active':''}" data-k="${k}" aria-pressed="${S.bg===k}"><span class="hab-name">${S.bg===k?'✓ En uso · ':''}${n}</span><span class="pro-neon">✦ FOCO PRO</span><span class="hab-state">${p?(S.bg===k?'Equipado':'Pulsa para equipar'):'Requiere Pro 🔒'}</span></button>`).join('');
 $('pdev').innerHTML=DEV?(p?'<button class="ghost" id="poff">Quitar Pro (solo pruebas)</button>':'Prototipo: puedes activar Foco Pro con contraseña; no se realiza ningún cobro.'):'';
 if($('poff'))$('poff').onclick=()=>{window.focoApp&&focoApp.proDevOff&&focoApp.proDevOff();setPro(false);};
 rep.classList.toggle('locked',!p);rep.querySelector('.blur').innerHTML=report();}
$('pcta').onclick=buy;$('pkey').onclick=buy;$('punl').onclick=()=>tab('pro');
$('pth').onclick=e=>{const b=e.target.closest('button');if(b)pick(b.dataset.k);};
$('phab').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(!isPro())return upsell();S.bg=S.bg===b.dataset.k?'':b.dataset.k;sky();save();render();if(S.bg)toast('Hábitat aplicado: '+(PH[S.bg]?.[0]||S.bg));else toast('Hábitat predeterminado restaurado');};

// Aviso suave (1 vez al día) tras una sesión de foco completada
const f0=finish;finish=function(){const m=mode;f0();let n='';try{n=localStorage.getItem('foco-nudge');}catch(e){}
 if(m==='focus'&&!isPro()&&n!==today()){try{localStorage.setItem('foco-nudge',today());}catch(e){}setTimeout(()=>toast('✦ Con Foco Pro habrías ganado +5 🪙 en esta sesión','Ver Pro',()=>tab('pro')),2500);}};

(async()=>{try{PROV=!!(window.focoApp&&focoApp.proStatus&&await focoApp.proStatus());}catch(e){}
 if(PROV){const t=localStorage.getItem('foco-theme');if(TH[t])theme(t);}render();})();
render();const t0=localStorage.getItem('foco-tab');tab(['foco','tareas','mascota','pro'].includes(t0)?t0:'foco');

})();
