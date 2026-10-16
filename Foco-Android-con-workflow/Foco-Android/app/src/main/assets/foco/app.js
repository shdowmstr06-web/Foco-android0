const $=id=>document.getElementById(id), esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toLocaleDateString('sv');
const MODES={focus:'Foco',short:'Descanso',long:'Largo'};
const AT=[0,20,80,200]; // XP necesaria para cada etapa
const SUB=['Algo se mueve ahí dentro. Completa una sesión para que nazca.','Pequeño y curioso. Le encanta verte concentrado.','Ya creció. Ahora vigila tus distracciones.','Leyenda del foco. Nadie lo detiene.'];
const PETS={
 bit:{n:'Bit',b:'#7EE0C3',d:'#2FA68A',a:'#D9FFF3',egg:'#F7EBD0',gr:'#2E8F7A',amb:'○',say:['¿Eso es una pestaña nueva? Mejor sigamos aquí.','Blup. Estoy cerca de ti.','Me encantan los números del reloj.']},
 mika:{n:'Mika',b:'#FFB26B',d:'#D4802F',a:'#FFE9CC',egg:'#FFF1DC',gr:'#B97A45',amb:'✦',say:['Meh. Pero sigue, humano.','Ronroneo en 3, 2, 1...','Termina rápido y me das atención.']},
 pip:{n:'Pip',b:'#7BE06B',d:'#3FA832',a:'#E6FFD0',egg:'#E9F7DD',gr:'#3A8F3A',amb:'•',say:['Croac. Respira y avanza.','Calma. Una tarea a la vez.','Los mejores saltos empiezan quietos.']},
 draco:{n:'Draco',b:'#9A7BFF',d:'#6444D0',a:'#FFE08A',k:'#FF9FB5',egg:'#E6DEFF',gr:'#5A3FB8',amb:'✧',say:['¡Forjemos algo épico!','Mi fuego es tu concentración.','Los tesoros no se acumulan solos.']}};
PETS.kira={n:'Kira',b:'#FF9248',d:'#C85F1B',a:'#FFE9CC',egg:'#FFF1DC',gr:'#A86A3A',amb:'🍂',say:['Soy veloz, pero tú eres constante.','Zorro astuto: primero lo difícil.','Ni un pomodoro se me escapa.']};
PETS.pingo={n:'Pingo',b:'#4B6CB7',d:'#2D4482',a:'#fff',egg:'#E3ECFF',gr:'#9BC3E8',amb:'❄',say:['Calma, aquí hace fresco.','Paso a paso, como deslizarse.','Un pez por cada tarea hecha.']};
const stageOf=n=>AT.reduce((a,v,i)=>n>=v?i:a,0);

let S={tasks:[],current:null,days:{},pets:{},pet:'bit',care:{},coins:0,inv:[],eq:{},vr:{},names:{},bg:'',furniture:[],roomEq:[],goalDay:'',distract:0,own:['bit','mika','pip','draco'],sessions:0,minutes:0,set:{focus:25,short:5,long:15,notify:true,sound:true,amb:'none',vol:.5,anti:false,goal:4}};
try{const r=JSON.parse((window.focoApp&&focoApp.load&&focoApp.load())||localStorage.getItem('foco-v2')||'null');if(r)S={...S,...r,set:{...S.set,...r.set}};}catch(e){}
S.furniture=S.furniture||[];S.roomEq=S.roomEq||[];S.tasks=(S.tasks||[]).map(t=>({...t,priority:t.priority||'normal',due:t.due||'',subtasks:t.subtasks||[]}));
if(!S.v3){for(const k in S.pets)S.pets[k]*=20;S.v3=1;} // migra sesiones a XP
const save=()=>{try{const j=JSON.stringify(S);localStorage.setItem('foco-v2',j);window.focoApp&&focoApp.save&&focoApp.save(j);}catch(e){}};
const mins=m=>S.set[m];
let mode='focus',total=mins('focus')*60,remaining=total,endAt=0,timer=null;

const CR='#FFD36E',DK='#2B2257',PK='#FF9FB5';
const eye=(x,y,r=5)=>`<g class="bl"><circle cx="${x}" cy="${y}" r="${r}" fill="${DK}"/><circle cx="${x+r*.35}" cy="${y-r*.4}" r="${r*.35}" fill="#fff"/></g>`;
const chk=(x,y)=>`<circle cx="${x}" cy="${y}" r="4.5" fill="#FF8FA3" opacity=".55"/>`;
let NOCR=false;
const crown=(x,y,w=1)=>NOCR?'':`<path d="M${x-9*w} ${y+10*w}L${x-10*w} ${y}L${x-4*w} ${y+5*w}L${x} ${y-3*w}L${x+4*w} ${y+5*w}L${x+10*w} ${y}L${x+9*w} ${y+10*w}Z" fill="${CR}" stroke="#D9A300" stroke-width="1.2" stroke-linejoin="round"/>`;
const sp=(x,y,z)=>`<g transform="translate(${x} ${y}) scale(${z})"><path class="spk" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="${CR}"/></g>`;
const AURA=`<circle class="aura" cx="50" cy="58" r="47" fill="${CR}" opacity=".2"/>`,SPK=sp(12,22,1)+sp(88,16,.8)+sp(91,60,.6);
const SC=[1,.78,.9,1];
const eggSVG=p=>`<g class="egg"><path d="M50 20C70 20 79 46 79 62C79 80 66 92 50 92C34 92 21 80 21 62C21 46 30 20 50 20Z" fill="${p.egg}" stroke="${p.d}" stroke-width="2"/><circle cx="40" cy="48" r="5" fill="${p.b}"/><circle cx="60" cy="60" r="7" fill="${p.b}"/><circle cx="44" cy="76" r="4.5" fill="${p.b}"/><circle cx="64" cy="42" r="3" fill="${p.b}"/><ellipse cx="38" cy="36" rx="4" ry="8" transform="rotate(25 38 36)" fill="#fff" opacity=".55"/></g>`;
const ART={
bit:(p,st)=>`<path d="M50 28C74 28 86 52 86 70C86 87 70 93 50 93C30 93 14 87 14 70C14 52 26 28 50 28Z" fill="${p.b}" stroke="${p.d}" stroke-width="2"/>
<ellipse cx="50" cy="83" rx="26" ry="8" fill="${p.a}" opacity=".6"/><ellipse cx="34" cy="48" rx="6" ry="10" transform="rotate(30 34 48)" fill="#fff" opacity=".5"/>
<circle cx="66" cy="80" r="4" fill="#fff" opacity=".4"/><circle cx="26" cy="78" r="3" fill="#fff" opacity=".4"/>
${eye(37,64)}${eye(63,64)}${chk(28,73)}${chk(72,73)}<path d="M44 73Q50 79 56 73" fill="none" stroke="${DK}" stroke-width="2.2" stroke-linecap="round"/>
${st==2?`<path d="M50 30V15" stroke="${p.d}" stroke-width="2.5"/><circle class="glow" cx="50" cy="12" r="5.5" fill="${CR}"/>`:''}${st==3?crown(50,16,1.2):''}`,
mika:(p,st)=>`<path class="tail" d="M72 86Q96 88 90 56" fill="none" stroke="${p.b}" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="50" cy="76" rx="25" ry="17" fill="${p.b}" stroke="${p.d}" stroke-width="2"/><ellipse cx="50" cy="80" rx="13" ry="10" fill="${p.a}"/>
<ellipse cx="38" cy="91" rx="9" ry="5" fill="${p.b}" stroke="${p.d}" stroke-width="1.5"/><ellipse cx="62" cy="91" rx="9" ry="5" fill="${p.b}" stroke="${p.d}" stroke-width="1.5"/>
<path d="M24 42L26 14L48 30Z" fill="${p.b}" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/><path d="M76 42L74 14L52 30Z" fill="${p.b}" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/>
<path d="M29 33L30 22L40 29Z" fill="${PK}"/><path d="M71 33L70 22L60 29Z" fill="${PK}"/>
<ellipse cx="50" cy="50" rx="28" ry="23" fill="${p.b}" stroke="${p.d}" stroke-width="2"/>
<path d="M50 28V36M42 30L43 37M58 30L57 37" stroke="${p.d}" stroke-width="2.5" stroke-linecap="round"/>
${eye(38,52)}${eye(62,52)}${chk(30,60)}${chk(70,60)}<path d="M47 57h6l-3 4z" fill="#FF8FA3"/>
<path d="M50 61Q46 66 42 63M50 61Q54 66 58 63" fill="none" stroke="${DK}" stroke-width="1.8" stroke-linecap="round"/>
<path d="M28 58L12 55M28 62L12 64M72 58L88 55M72 62L88 64" stroke="${DK}" stroke-width="1.2" opacity=".6"/>
${st>=2?`<path d="M34 67Q50 76 66 67" fill="none" stroke="#FF5C8A" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="73" r="3.5" fill="${CR}"/>`:''}${st==3?crown(50,22,1):''}`,
pip:(p,st)=>`<ellipse cx="30" cy="90" rx="12" ry="5.5" fill="${p.b}" stroke="${p.d}" stroke-width="1.5"/><ellipse cx="70" cy="90" rx="12" ry="5.5" fill="${p.b}" stroke="${p.d}" stroke-width="1.5"/>
<ellipse cx="50" cy="68" rx="33" ry="24" fill="${p.b}" stroke="${p.d}" stroke-width="2"/><ellipse class="thr" cx="50" cy="80" rx="20" ry="11" fill="${p.a}"/>
<circle cx="28" cy="62" r="3.5" fill="${p.d}" opacity=".5"/><circle cx="72" cy="60" r="4" fill="${p.d}" opacity=".5"/><circle cx="64" cy="52" r="2.5" fill="${p.d}" opacity=".5"/>
<circle cx="32" cy="42" r="14" fill="${p.b}" stroke="${p.d}" stroke-width="2"/><circle cx="68" cy="42" r="14" fill="${p.b}" stroke="${p.d}" stroke-width="2"/>
<circle cx="32" cy="42" r="9.5" fill="#fff"/><circle cx="68" cy="42" r="9.5" fill="#fff"/>
<g class="bl"><circle cx="33" cy="43" r="5.5" fill="${DK}"/><circle cx="35" cy="40.5" r="2" fill="#fff"/></g><g class="bl"><circle cx="67" cy="43" r="5.5" fill="${DK}"/><circle cx="69" cy="40.5" r="2" fill="#fff"/></g>
<circle cx="46" cy="60" r="1.5" fill="${p.d}"/><circle cx="54" cy="60" r="1.5" fill="${p.d}"/>${chk(22,68)}${chk(78,68)}
<path d="M26 66Q50 84 74 66" fill="none" stroke="${DK}" stroke-width="2.5" stroke-linecap="round"/>
${st==2?`<circle cx="50" cy="34" r="5" fill="#FF8FA3"/><circle cx="50" cy="34" r="2" fill="${CR}"/>`:''}${st==3?crown(50,30,.9):''}`,
draco:(p,st)=>`${st>=2?`<path class="wl" d="M32 66L4 36L10 60L2 68L18 70Z" fill="${p.k}" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/><path class="wr" d="M68 66L96 36L90 60L98 68L82 70Z" fill="${p.k}" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/>`:`<path d="M32 66L20 54L36 58Z" fill="${p.k}"/><path d="M68 66L80 54L64 58Z" fill="${p.k}"/>`}
<path class="tail" d="M70 88Q98 94 92 66" fill="none" stroke="${p.b}" stroke-width="10" stroke-linecap="round"/><path d="M92 68L86 56L98 56Z" fill="${p.k}"/>
${st==3?`<path class="fire" d="M92 55Q83 46 92 33Q101 46 92 55Z" fill="#FF8A3D"/><path class="fire" d="M92 55Q88 49 92 42Q96 49 92 55Z" fill="${CR}"/>`:''}
<ellipse cx="50" cy="74" rx="26" ry="19" fill="${p.b}" stroke="${p.d}" stroke-width="2"/><ellipse cx="50" cy="78" rx="15" ry="14" fill="${p.a}"/>
<path d="M38 72H62M37 78H63M39 84H61" stroke="${p.d}" stroke-width="1.4" opacity=".35"/>
<ellipse cx="38" cy="92" rx="9" ry="4.5" fill="${p.b}" stroke="${p.d}" stroke-width="1.5"/><ellipse cx="62" cy="92" rx="9" ry="4.5" fill="${p.b}" stroke="${p.d}" stroke-width="1.5"/>
<path d="M32 30L24 8L44 24Z" fill="${p.a}" stroke="#D9A300" stroke-width="1.5" stroke-linejoin="round"/><path d="M68 30L76 8L56 24Z" fill="${p.a}" stroke="#D9A300" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M45 24L50 12L55 24Z" fill="${p.k}"/>
<ellipse cx="50" cy="46" rx="28" ry="23" fill="${p.b}" stroke="${p.d}" stroke-width="2"/><ellipse cx="50" cy="57" rx="16" ry="11" fill="${p.a}" opacity=".85"/>
<circle cx="44" cy="55" r="1.8" fill="${p.d}"/><circle cx="56" cy="55" r="1.8" fill="${p.d}"/><path d="M43 62Q50 67 57 62" fill="none" stroke="${DK}" stroke-width="2" stroke-linecap="round"/>
<g class="bl"><circle cx="37" cy="42" r="6.5" fill="${CR}"/><ellipse cx="37" cy="42" rx="2.4" ry="5" fill="${DK}"/><circle cx="39" cy="39.5" r="1.8" fill="#fff"/></g>
<g class="bl"><circle cx="63" cy="42" r="6.5" fill="${CR}"/><ellipse cx="63" cy="42" rx="2.4" ry="5" fill="${DK}"/><circle cx="65" cy="39.5" r="1.8" fill="#fff"/></g>
<path d="M29 33L43 38M71 33L57 38" stroke="${p.d}" stroke-width="3" stroke-linecap="round"/>${chk(27,52)}${chk(73,52)}`};
ART.kira=(p,st)=>`<path class="tail" d="M70 88Q100 90 92 54Q84 70 70 74Z" fill="${p.b}" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/><path d="M92 54Q94 64 88 70Q86 62 92 54Z" fill="#fff"/>
<ellipse cx="50" cy="78" rx="23" ry="16" fill="${p.b}" stroke="${p.d}" stroke-width="2"/><ellipse cx="50" cy="82" rx="12" ry="9" fill="#fff"/>
<ellipse cx="38" cy="92" rx="8" ry="4.5" fill="${p.d}"/><ellipse cx="62" cy="92" rx="8" ry="4.5" fill="${p.d}"/>
<path d="M22 44L20 12L46 30Z" fill="${p.b}" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/><path d="M78 44L80 12L54 30Z" fill="${p.b}" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/>
<path d="M24 34L22 18L36 28Z" fill="${DK}"/><path d="M76 34L78 18L64 28Z" fill="${DK}"/>
<path d="M50 28C70 28 80 40 80 52C80 64 66 70 50 70C34 70 20 64 20 52C20 40 30 28 50 28Z" fill="${p.b}" stroke="${p.d}" stroke-width="2"/>
<path d="M20 52Q34 54 42 64Q50 70 58 64Q66 54 80 52C80 64 66 70 50 70C34 70 20 64 20 52Z" fill="#fff"/>
${eye(38,50)}${eye(62,50)}<ellipse cx="50" cy="60" rx="4" ry="3" fill="${DK}"/><path d="M50 63Q46 67 43 65M50 63Q54 67 57 65" fill="none" stroke="${DK}" stroke-width="1.6" stroke-linecap="round"/>${chk(29,58)}${chk(71,58)}
${st>=2?`<path d="M36 70Q50 78 64 70" fill="none" stroke="#3FA8E0" stroke-width="4" stroke-linecap="round"/>`:''}${st==3?crown(50,24,1):''}`;
ART.pingo=(p,st)=>`<ellipse cx="34" cy="93" rx="11" ry="4.5" fill="#FFA63D"/><ellipse cx="66" cy="93" rx="11" ry="4.5" fill="#FFA63D"/>
<path class="wl" d="M26 58Q8 70 16 84Q28 78 30 66Z" fill="${p.d}"/><path class="wr" d="M74 58Q92 70 84 84Q72 78 70 66Z" fill="${p.d}"/>
<path d="M50 20C72 20 82 44 82 66C82 86 68 94 50 94C32 94 18 86 18 66C18 44 28 20 50 20Z" fill="${p.b}" stroke="${p.d}" stroke-width="2"/>
<path d="M50 56C64 56 72 66 72 76C72 88 62 91 50 91C38 91 28 88 28 76C28 66 36 56 50 56Z" fill="#fff"/>
${eye(38,44)}${eye(62,44)}${chk(31,52)}${chk(69,52)}<path d="M44 50Q50 60 56 50Q50 48 44 50Z" fill="#FFA63D" stroke="#E88A1A" stroke-width="1.2" stroke-linejoin="round"/>
${st>=2?`<path d="M50 21Q44 12 40 14M50 21V8M50 21Q56 12 60 14" stroke="${p.d}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`:''}${st==3?crown(50,10,1):''}`;
const AN={bit:{ex:13,ey:64,hy:29,ny:84,nw:20},mika:{ex:12,ey:52,hy:27,ny:68,nw:18},pip:{ex:18,ey:43,hy:40,ny:70,nw:22,lw:20},draco:{ex:13,ey:42,hy:25,ny:67,nw:18},kira:{ex:12,ey:50,hy:28,ny:70,nw:18},pingo:{ex:12,ey:44,hy:21,ny:60,nw:16}};
function accSVG(id){
  const e=S.eq[id];if(!e)return'';const a=AN[id],lw=a.lw||16;let r='';
  if(e.neck)r+=`<path d="M${50-a.nw} ${a.ny}Q50 ${a.ny+9} ${50+a.nw} ${a.ny}" fill="none" stroke="#E5484D" stroke-width="7" stroke-linecap="round"/><path d="M${50+a.nw-7} ${a.ny+5}l3 14" stroke="#E5484D" stroke-width="6" stroke-linecap="round"/>`;
  if(e.face)r+=`<rect x="${50-a.ex-lw/2}" y="${a.ey-5}" width="${lw}" height="11" rx="3.5" fill="${DK}"/><rect x="${50+a.ex-lw/2}" y="${a.ey-5}" width="${lw}" height="11" rx="3.5" fill="${DK}"/><path d="M${50-a.ex+lw/2} ${a.ey-2}H${50+a.ex-lw/2}" stroke="${DK}" stroke-width="2"/><path d="M${50-a.ex-lw/2+3} ${a.ey-2}l4 0M${50+a.ex-lw/2+3} ${a.ey-2}l4 0" stroke="#fff" stroke-width="1.6" opacity=".6"/>`;
  if(e.head==='copa')r+=`<rect x="39" y="${a.hy-18}" width="22" height="18" rx="2" fill="${DK}"/><rect x="39" y="${a.hy-7}" width="22" height="4" fill="#E5484D"/><ellipse cx="50" cy="${a.hy}" rx="16" ry="3.5" fill="${DK}"/>`;
  if(e.head==='fiesta')r+=`<path d="M41 ${a.hy+1}L50 ${a.hy-22}L59 ${a.hy+1}Z" fill="#7B5EFF" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><circle cx="50" cy="${a.hy-23}" r="3.5" fill="${CR}"/><circle cx="48" cy="${a.hy-8}" r="1.6" fill="#fff"/><circle cx="53" cy="${a.hy-13}" r="1.6" fill="#FF8FA3"/>`;
  return r;
}
function petSVG(id,st){
  const p=PETS[id];NOCR=!!(S.eq[id]&&S.eq[id].head);const inner=st===0?eggSVG(p):ART[id](p,st)+accSVG(id);
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${p.n}">${st===3?AURA:''}<g transform="translate(50 94) scale(${SC[st]}) translate(-50 -94)"><g${vattr(id)}>${inner}</g></g>${st===3?SPK:''}</svg>`;
}
const cnt=()=>S.pets[S.pet]||0;
function renderPet(){
  const p=PETS[S.pet],N=nm(),n=cnt(),i=stageOf(n),nx=AT[i+1],v=S.vr[S.pet];
  $('art').innerHTML=petSVG(S.pet,i);$('art').classList.toggle('run',!!timer&&mode==='focus');
  $('pname').textContent=['Huevo de '+N,N+' cría',N+' joven',N+' legendario'][i];
  $('psub').textContent=SUB[i]+(v?` Variante ${v.r}.`:'');
  $('pfill').style.width=(nx?(n-AT[i])/(nx-AT[i])*100:100)+'%';
  $('pnote').textContent=nx?`${n} / ${nx} XP para evolucionar.`:'Evolución máxima.';
  renderCare();$('pick').innerHTML=Object.entries(PETS).filter(([id])=>S.own.includes(id)).map(([id,q])=>`<button data-p="${id}" aria-pressed="${id===S.pet}" title="${esc(nm(id))}">${petSVG(id,stageOf(S.pets[id]||0))}${nm(id)}</button>`).join('');
}
function renderTimer(){
  const m=String(Math.floor(remaining/60)).padStart(2,'0'),s=String(remaining%60).padStart(2,'0');
  $('time').textContent=m+':'+s;$('ring').style.strokeDashoffset=339.292*(1-remaining/total);
  document.title=timer?`${m}:${s} · Foco`:'Foco';
  $('time').classList.toggle('hot',!!timer&&remaining<=10&&remaining>0);$('go').textContent=timer?'Pausar':remaining<total?'Continuar':'Iniciar';
  const t=S.tasks.find(t=>t.id===S.current);
  $('now').innerHTML=mode==='focus'?(t?`Ahora: <b>${esc(t.text)}</b>`:'Elige una tarea abajo o enfócate sin ella.'):'Respira, estírate, toma agua.';
  window.focoApp&&focoApp.progress(timer?1-remaining/total:-1);sendMini();
}
function renderModes(){$('modes').innerHTML=Object.entries(MODES).map(([k,v])=>`<button data-m="${k}" aria-pressed="${k===mode}">${v} ${mins(k)}</button>`).join('');}
function renderStats(){$('st-t').textContent=S.days[today()]||0;$('st-a').textContent=S.sessions;$('st-m').textContent=S.minutes;$('coins').textContent='🪙 '+(S.coins||0);renderShop();renderWeek();$('streak').textContent=S.streak?`🔥 Racha: ${S.streak} ${S.streak===1?'día':'días'}`:'';}
function renderTasks(){
  $('list').innerHTML=S.tasks.length?S.tasks.map(t=>{
    const subs=t.subtasks||[],isLate=!!(t.due&&!t.done&&t.due<today()),due=t.due?`${isLate?'⚠️ Vencida · ': '📅 '}${t.due}`:'Sin fecha límite',prio=t.priority||'normal';
    return `<li class="${t.id===S.current?'cur':''} ${t.done?'done':''}" data-id="${t.id}"><input type="checkbox" ${t.done?'checked':''} aria-label="Hecha: ${esc(t.text)}"><button class="name" title="Enfocar esta tarea">${esc(t.text)}</button><span class="n">${t.pomos?t.pomos+(t.pomos===1?' sesión':' sesiones'):''}</span><button class="ghost subtasks" title="Añadir subtareas">＋ Subtareas (${subs.filter(x=>x.done).length}/${subs.length})</button><button class="x" aria-label="Eliminar">×</button><div class="meta"><span class="priority ${prio}">${prio==='high'?'🔴 Alta':prio==='low'?'🟢 Baja':'⚪ Normal'}</span><span class="${isLate?'late':''}">${esc(due)}</span></div>${subs.length?`<div class="children">${subs.map((x,i)=>`<label><input type="checkbox" data-sub="${i}" ${x.done?'checked':''}> ${esc(x.text)}</label>`).join('')}</div>`:''}</li>`;
  }).join(''):'<li class="empty" style="border:0">Aún no tienes tareas. Escribe la primera arriba.</li>';
}
function setMode(m){mode=m;total=mins(m)*60;remaining=total;clearInterval(timer);timer=null;ambStop();renderModes();renderTimer();renderPet();}
function start(){
  if(S.set.notify&&'Notification' in window&&Notification.permission==='default')Notification.requestPermission();
  endAt=Date.now()+remaining*1000;timer=setInterval(tick,250);if(mode==='focus'){say('¡A concentrarse!');tone([392,523],'triangle');ambStart();}$('msg').textContent='';renderTimer();renderPet();
}
function pause(){clearInterval(timer);timer=null;ambStop();renderTimer();renderPet();}
function tick(){remaining=Math.max(0,Math.round((endAt-Date.now())/1000));renderTimer();if(!remaining)finish();}
function beep(){
  if(!S.set.sound)return;
  try{const a=new AudioContext();[660,880,1100].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.18;
    o.type='square';o.frequency.value=f;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.start(t);o.stop(t+.17);});}catch(e){}
}
function notify(title,body){
  if(!S.set.notify||!('Notification' in window)||Notification.permission!=='granted')return;
  try{if(window.AndroidFoco&&AndroidFoco.notify){AndroidFoco.notify(String(title),String(body));}else{new Notification(title,{body,silent:true});}}catch(e){}
  window.focoApp&&focoApp.flash();
}
function finish(){ambStop();
  clearInterval(timer);timer=null;
  let next='focus',title='Descanso terminado',body='¿Listo para otra sesión?',msg=body;
  if(mode==='focus'){
    const before=stageOf(cnt());
    const g=gain(20);S.pets[S.pet]=cnt()+g;S.coins=(S.coins||0)+(window.coinBonus?coinBonus(10):10);S.sessions++;bump();setTimeout(()=>fx(stageOf(cnt())>before?'evolve':'xp',g),300);S.minutes+=mins('focus');S.days[today()]=(S.days[today()]||0)+1;
    const t=S.tasks.find(t=>t.id===S.current);if(t)t.pomos=(t.pomos||0)+1;
    next=S.sessions%4===0?'long':'short';
    const up=stageOf(cnt())>before;
    title='¡Sesión completa!';body=up?`${PETS[S.pet].n} evolucionó. Toma un descanso.`:`Toma un descanso de ${mins(next)} minutos.`;msg=title+' '+body;
    goalCheck();save();renderStats();renderTasks();
  }
  beep();notify(title,body);setMode(next);$('msg').textContent=msg;
}

$('go').onclick=()=>timer?pause():start();
$('reset').onclick=()=>{setMode(mode);$('msg').textContent='';};
$('modes').onclick=e=>{const b=e.target.closest('button');if(b)setMode(b.dataset.m);};
$('pick').onclick=e=>{const b=e.target.closest('button');if(b){S.pet=b.dataset.p;save();renderPet();ambient();sky();voice();}};
$('f').onsubmit=e=>{e.preventDefault();const v=$('in').value.trim();if(!v)return;const id=Date.now();S.tasks.unshift({id,text:v,done:false,pomos:0,priority:$('task-priority').value,due:$('task-due').value||'',subtasks:[]});if(!S.current)S.current=id;$('task-priority').value='normal';$('task-due').value='';$('in').value='';save();renderTasks();renderTimer();};
$('list').onclick=e=>{
  const li=e.target.closest('li[data-id]');if(!li)return;const id=+li.dataset.id,t=S.tasks.find(t=>t.id===id);
  if(e.target.matches('.subtasks')){const raw=prompt('Escribe una subtarea nueva (deja vacío para cancelar):');if(raw&&raw.trim()){t.subtasks=t.subtasks||[];t.subtasks.push({text:raw.trim().slice(0,80),done:false});}}
  else if(e.target.matches('input[data-sub]')){const si=+e.target.dataset.sub;if(t.subtasks&&t.subtasks[si])t.subtasks[si].done=e.target.checked;}
  else if(e.target.matches('.x')){S.tasks=S.tasks.filter(t=>t.id!==id);if(S.current===id)S.current=null;}
  else if(e.target.matches('input')){t.done=e.target.checked;if(t.done&&S.current===id)S.current=null;}
  else if(e.target.matches('.name'))S.current=S.current===id?null:id;
  else return;
  save();renderTasks();renderTimer();
};
['focus','short','long'].forEach(k=>{const el=$('s-'+k);el.value=S.set[k];el.onchange=()=>{S.set[k]=Math.min(+el.max,Math.max(1,+el.value||S.set[k]));el.value=S.set[k];save();if(!timer&&k===mode)setMode(mode);else renderModes();};});
['notify','sound'].forEach(k=>{const el=$('s-'+k);el.checked=S.set[k];el.onchange=()=>{S.set[k]=el.checked;save();};});
document.addEventListener('keydown',e=>{if(document.querySelector('#foco-ai-overlay.open'))return;if(e.code==='Space'&&!/INPUT|TEXTAREA|BUTTON|SUMMARY|SELECT/.test(e.target.tagName)&&!e.target.isContentEditable){e.preventDefault();$('go').click();}});


/* ---------- XP y efectos ---------- */
function addXP(n){const b=stageOf(cnt());n=gain(n);S.pets[S.pet]=cnt()+n;S.coins=(S.coins||0)+Math.ceil(n/2);const c=care();c.j=Math.min(100,c.j+15);bump();save();renderStats();renderPet();fx(stageOf(cnt())>b?'evolve':'xp',n);}
function jump(){const a=$('art');a.classList.remove('jump');void a.offsetWidth;a.classList.add('jump');}
function burst(n,ch){
  const b=document.querySelector('.pet'),r=$('art').getBoundingClientRect(),br=b.getBoundingClientRect();
  for(let i=0;i<n;i++){
    const s=document.createElement('span'),a=Math.random()*6.283,d=70+Math.random()*90;
    s.className='pt';
    s.style.cssText=`left:${r.left-br.left+r.width/2}px;top:${r.top-br.top+r.height/2}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-40}px;`+(ch?'width:auto;height:auto;color:#FF8FA3;font-size:16px':'background:'+['#FFD36E','#7EE0C3','#FF8FA3','#8FB8FF'][i%4]);
    if(ch)s.textContent=ch;b.appendChild(s);setTimeout(()=>s.remove(),1000);
  }
}
function float(t){const s=document.createElement('span');s.className='fl';s.textContent=t;document.querySelector('.pet').appendChild(s);setTimeout(()=>s.remove(),1400);}
function fx(type,n){
  jump();float('+'+n+' XP');tone(type==='evolve'?[523,659,784,1046,1318]:[523,659,784],'triangle',.07,type==='evolve'?.11:.08,.18);if(type==='evolve')say('¡Mira cómo he crecido!');
  if(type==='evolve'){const a=$('art');a.classList.remove('evolve');void a.offsetWidth;a.classList.add('evolve');setTimeout(()=>a.classList.remove('evolve'),850);const p=document.querySelector('.pet');p.classList.add('flash');setTimeout(()=>p.classList.remove('flash'),900);burst(40);setTimeout(()=>float('¡Evolucionó!'),450);}
  else burst(10);
}
$('art').onclick=()=>{jump();burst(5,'♥');voice();care().j=Math.min(100,care().j+2);renderCare();const l=PETS[S.pet].say;say(l[Math.random()*l.length|0]);};

/* ---------- Minijuegos ---------- */
let G=0;
const gbtn=on=>document.querySelectorAll('#gbtns button').forEach(b=>b.disabled=!on);
function gameEnd(score,xp,label){G=0;gbtn(true);$('garea').innerHTML='';$('garea').onclick=null;$('gtip').textContent=`${label}: ${score}. +${xp} XP para ${PETS[S.pet].n}.`;if(xp>0){addXP(xp);say('¡Buen juego! +'+xp+' XP');}}
$('gbtns').onclick=e=>{const b=e.target.closest('button');if(!b||G)return;G=1;gbtn(false);$('gtip').textContent='';(b.dataset.g==='stars'?stars:mole)();};

function stars(){
  const W=480,H=270,P=96;
  $('garea').innerHTML=`<canvas id="cv" width="${W}" height="${H}" aria-label="Atrapa las estrellas"></canvas>`;
  const cv=$('cv'),c=cv.getContext('2d'),ink=getComputedStyle(document.body).color;c.imageSmoothingEnabled=false;
  const img=new Image();
  img.src='data:image/svg+xml;utf8,'+encodeURIComponent(petSVG(S.pet,stageOf(cnt())).replace('<svg ',`<svg xmlns="http://www.w3.org/2000/svg" width="${P}" height="${P}" `));
  let x=W/2,keys={},items=[],score=0,sp=0;const t0=performance.now();let last=t0;
  const kd=e=>{keys[e.key]=1;if(e.key.startsWith('Arrow'))e.preventDefault();},ku=e=>{keys[e.key]=0;};
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  cv.onpointermove=e=>{const r=cv.getBoundingClientRect();x=(e.clientX-r.left)/r.width*W;};
  (function loop(now){
    const dt=Math.min(.05,(now-last)/1000),el=(now-t0)/1000;last=now;
    if(el>=15){removeEventListener('keydown',kd);removeEventListener('keyup',ku);return gameEnd(score,Math.min(40,score*2),'Estrellas atrapadas');}
    if(keys.ArrowLeft||keys.a)x-=320*dt;if(keys.ArrowRight||keys.d)x+=320*dt;
    x=Math.max(P/2,Math.min(W-P/2,x));
    sp-=dt;if(sp<=0){sp=Math.max(.25,.55-el*.02);items.push({x:20+Math.random()*(W-40),y:-20,bad:Math.random()<.25,v:130+el*10+Math.random()*60});}
    c.clearRect(0,0,W,H);c.textAlign='center';c.font='28px serif';
    items=items.filter(it=>{
      it.y+=it.v*dt;c.fillText(it.bad?'☄️':'⭐',it.x,it.y);
      if(it.y>H-P+14&&it.y<H-10&&Math.abs(it.x-x)<P/2-6){score=it.bad?Math.max(0,score-1):score+1;return false;}
      return it.y<H+20;
    });
    c.drawImage(img,x-P/2,H-P);
    c.fillStyle=ink;c.font='bold 16px "Segoe UI",sans-serif';c.textAlign='left';c.fillText(`⭐ ${score}`,12,24);c.textAlign='right';c.fillText(`${Math.ceil(15-el)} s`,W-12,24);
    requestAnimationFrame(loop);
  })(last);
}

function mole(){
  let score=0,cur=-1;const end=performance.now()+15000,svg=petSVG(S.pet,stageOf(cnt()));
  $('garea').innerHTML=`<p class="note" id="mh" style="text-align:center"></p><div class="holes">${[...Array(9)].map((_,i)=>`<button class="hole" data-i="${i}" aria-label="Agujero ${i+1}"></button>`).join('')}</div>`;
  const hs=[...document.querySelectorAll('.hole')];
  const show=i=>{hs.forEach(h=>h.innerHTML='');cur=i;if(i>=0)hs[i].innerHTML=svg;};
  $('garea').onclick=e=>{const h=e.target.closest('.hole');if(h&&+h.dataset.i===cur){score++;show(-1);h.classList.add('hit');setTimeout(()=>h.classList.remove('hit'),200);}};
  (function step(){
    const left=Math.ceil((end-performance.now())/1000);
    if(left<=0)return gameEnd(score,Math.min(40,score*3),'Topos atrapados');
    $('mh').textContent=`Tiempo: ${left} s · Puntos: ${score}`;
    show((cur+1+Math.floor(Math.random()*8))%9);
    setTimeout(step,Math.max(450,800-score*15));
  })();
}

/* ---------- Ambiente, voz y racha ---------- */
function bump(){const t=today();if(S.last===t)return;const y=new Date(Date.now()-864e5).toLocaleDateString('sv');S.streak=S.last===y?(S.streak||0)+1:1;S.last=t;}
let AC;
function tone(seq,type,v=.06,gap=.09,dur=.12){
  if(!S.set.sound)return;
  try{AC=AC||new AudioContext();seq.forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*gap;
    o.type=type;o.frequency.setValueAtTime(f,t);o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.start(t);o.stop(t+dur+.01);});}catch(e){}
}
const VOICE={bit:[[520,700,640],'sine'],mika:[[880,700,820,600],'triangle'],pip:[[150,110,150,110],'square'],draco:[[120,95,80],'sawtooth']};
VOICE.kira=[[700,900,700],'triangle'];VOICE.pingo=[[300,380,300,380],'square'];
/* ---------- Cuidados y tienda ---------- */
function care(){return S.care[S.pet]||(S.care[S.pet]={h:80,j:80,t:Date.now()});}
function decay(){care();for(const id in S.care){const c=S.care[id],m=Math.min(480,(Date.now()-c.t)/6e4);c.h=Math.max(10,c.h-m/6);c.j=Math.max(10,c.j-m/8);c.t=Date.now();}}
const mood=()=>(care().h+care().j)/2,gain=n=>Math.round(n*(mood()>=60?1.25:1));
function renderCare(){const c=care();$('hfill').style.width=c.h+'%';$('jfill').style.width=c.j+'%';$('art').classList.toggle('sad',mood()<30);}
/* ---------- Nombres, comidas y huevos ---------- */
const nm=(id=S.pet)=>S.names[id]||PETS[id].n;
$('ren').onclick=()=>{
  const i=document.createElement('input');i.type='text';i.maxLength=14;i.className='rn';i.value=nm();i.setAttribute('aria-label','Nombre de la mascota');
  $('pname').replaceChildren(i);i.focus();i.select();
  i.onblur=()=>{const v=i.value.trim();if(v)S.names[S.pet]=v;save();renderPet();sendMini();};
  i.onkeydown=e=>{if(e.key==='Enter')i.blur();if(e.key==='Escape'){i.value=nm();i.blur();}};
};
const FOODS=[
 {id:'manzana',ic:'🍎',n:'Manzana',p:3,h:25,j:0,say:'¡Ñam!'},
 {id:'pastel',ic:'🍰',n:'Pastel',p:8,h:15,j:25,say:'¡Delicioso! 💛'},
 {id:'estrella',ic:'⭐',n:'Estrella dulce',p:15,h:20,j:40,say:'¡Brillo de felicidad!'},
 {id:'galleta-xp',ic:'🍪',n:'Galleta energética',p:12,h:15,j:8,xp:12,say:'¡Energía extra! +12 XP'}];
$('foods').innerHTML=FOODS.map(f=>`<button class="ghost" data-f="${f.id}" title="${f.n}: hambre +${f.h}, ánimo +${f.j}">${f.ic} ${f.p}🪙</button>`).join('');
$('foods').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const f=FOODS.find(x=>x.id===b.dataset.f);
  if((S.coins||0)<f.p){say(`Necesitamos ${f.p} monedas. ¡Juega un minijuego!`);return;}
  S.coins-=f.p;const c=care();c.h=Math.min(100,c.h+f.h);c.j=Math.min(100,c.j+f.j);
  if(f.xp){const before=stageOf(cnt());S.pets[S.pet]=cnt()+f.xp;S.coins+=(f.xp/2|0);setTimeout(()=>fx(stageOf(cnt())>before?'evolve':'xp',f.xp),80);}
  save();renderStats();renderCare();renderPet();jump();burst(8,f.ic);tone([440,554,659],'triangle');say(f.say);
};
const vattr=id=>{const v=S.vr[id];if(!v)return'';return v.r==='mítico'?' class="myth"':v.r==='épico'?` style="filter:hue-rotate(${v.h}deg) drop-shadow(0 0 3px #FFD36E)"`:` style="filter:hue-rotate(${v.h}deg)"`;};
function hatch(){
  const r=Math.random(),rar=r<.04?'mítico':r<.18?'épico':r<.52?'raro':'común';
  // Los huevos pueden descubrir cualquier especie; las rarezas se conservan por mascota.
  const pool=Object.keys(PETS),id=pool[Math.random()*pool.length|0];
  if(!S.own.includes(id))S.own.push(id);
  S.vr[id]={r:rar,h:30+Math.floor(Math.random()*300),at:Date.now()};
  S.pet=id;care();ambient();sky();voice();burst(30);renderPet();renderStats();save();
  // Ancla el aviso al arte del huevo/mascota para que nunca quede debajo del panel.
  hatchNotice(`¡Eclosionó ${nm(id)}! Rareza: ${rar.toUpperCase()}.`);
}
const HAB={
 bosque:{c:['#BDE8B0','#E8F7D8','#1E3A1E'],gr:'#3E8E41',d:['🌲','🍄','🌳'],image:'build/habitats/bosque.webp'},
 playa:{c:['#8FD3F4','#FFF1C9','#1E1946'],gr:'#E6C27A',d:['🌴','🐚','🌊'],image:'build/habitats/playa.webp'},
 espacio:{c:['#0B0724','#2A1B5E','#fff'],gr:'#5B4A9E',d:['🪐','🌙','✨'],night:1,image:'build/habitats/espacio.webp'},
 volcan:{c:['#4A1F1F','#FF7A45','#fff'],gr:'#2B1A1A',d:['🌋','🔥','🪨'],night:1,image:'build/habitats/volcan.webp'}};
function sky(){
  const h=new Date().getHours(),p=document.querySelector('.pet'),H=HAB[S.bg];
  let t=h>=6&&h<9?['#FFD9B8','#FFB3C7','#3A2450',0]:h>=9&&h<17?['#BFE3FF','#EAF6FF','#1E1946',0]:h>=17&&h<20?['#FF9E7A','#7B5EA7','#fff',0]:['#14122B','#2B2763','#fff',1];
  if(H)t=[H.c[0],H.c[1],H.c[2],H.night?1:0];
  p.style.setProperty('--sk1',t[0]);p.style.setProperty('--sk2',t[1]);p.style.setProperty('--pc',t[2]);p.style.setProperty('--gr',H?H.gr:PETS[S.pet].gr);
  p.classList.toggle('night',!!t[3]);
  let scene=p.querySelector('.habitat-scene');
  if(!scene){scene=document.createElement('div');scene.className='habitat-scene';scene.setAttribute('aria-hidden','true');p.insertBefore(scene,p.firstChild);}
  const hasScene=!!(H&&H.image);
  p.classList.toggle('habitat-active',hasScene);
  scene.style.backgroundImage=hasScene?`linear-gradient(180deg,rgba(15,10,34,.12) 0%,rgba(15,10,34,.20) 42%,rgba(15,10,34,.78) 100%),url("${H.image}")`:'';
  p.querySelectorAll('.deco').forEach(e=>e.remove());
  if(H&&!hasScene)H.d.forEach((ch,i)=>{const e=document.createElement('i');e.className='deco';e.textContent=ch;e.style.cssText=`left:${[4,80,68][i]}%;top:${[38,41,45][i]}%;font-size:${[40,30,26][i]}px`;p.appendChild(e);});
}

/* ---------- Sonido de fondo ---------- */
let AMB=null;
function noiseBuf(type){const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;d[i]=type==='brown'?(l=(l+.02*w)/1.02)*3.5:w;}return b;}
function ambStop(){if(AMB){AMB.forEach(n=>{try{n.stop&&n.stop();n.disconnect&&n.disconnect();}catch(e){}});AMB=null;}}
function ambStart(){
  ambStop();const k=S.set.amb;if(!k||k==='none'||!S.set.sound)return;
  try{
    AC=AC||new AudioContext();AC.resume&&AC.resume();
    const g=AC.createGain();g.gain.value=S.set.vol*.25;g.connect(AC.destination);const nodes=[g];
    const src=t=>{const s=AC.createBufferSource();s.buffer=noiseBuf(t);s.loop=true;nodes.push(s);return s;};
    if(k==='rain'){const s=src('white'),f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=1200;s.connect(f);f.connect(g);s.start();}
    else if(k==='brown'){const s=src('brown');s.connect(g);s.start();}
    else if(k==='waves'){const s=src('brown'),f=AC.createBiquadFilter(),m=AC.createGain(),o=AC.createOscillator(),og=AC.createGain();f.type='lowpass';f.frequency.value=700;m.gain.value=.5;o.frequency.value=.12;og.gain.value=.45;o.connect(og);og.connect(m.gain);s.connect(f);f.connect(m);m.connect(g);s.start();o.start();nodes.push(o);}
    else if(k==='lofi'){[220,261.63,329.63,392].forEach((f,i)=>{const o=AC.createOscillator(),og=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();o.type='sine';o.frequency.value=f;og.gain.value=.12;l.frequency.value=.07+i*.03;lg.gain.value=.1;l.connect(lg);lg.connect(og.gain);o.connect(og);og.connect(g);o.start();l.start();nodes.push(o,l);});}
    AMB=nodes;
  }catch(e){}
}
$('s-amb').value=S.set.amb;$('s-amb').onchange=e=>{S.set.amb=e.target.value;save();if(timer&&mode==='focus')ambStart();else ambStop();};
$('s-vol').value=S.set.vol;$('s-vol').oninput=e=>{S.set.vol=+e.target.value;save();if(AMB)AMB[0].gain.value=S.set.vol*.25;};
$('s-sound').addEventListener('change',()=>{if(!S.set.sound)ambStop();});

/* ---------- Modo anti-distracción ---------- */
let away=0,awayT=null;
function lost(){
  if(!S.set.anti||!timer||mode!=='focus'||away)return;
  away=Date.now();awayT=setTimeout(()=>notify('¡Vuelve al foco!',nm()+' te está esperando.'),20000);
}
function back(){
  clearTimeout(awayT);if(!away)return;
  const sec=Math.round((Date.now()-away)/1000);away=0;
  if(sec>=10){const c=care();c.j=Math.max(10,c.j-Math.min(25,Math.ceil(sec/6)));S.distract=(S.distract||0)+1;save();renderCare();renderWeek();say(`Te fuiste ${sec} s... me sentí solo.`);tone([300,220],'sawtooth');}
}
addEventListener('blur',lost);addEventListener('focus',back);
$('s-anti').checked=S.set.anti;$('s-anti').onchange=e=>{S.set.anti=e.target.checked;save();};

/* ---------- Meta diaria y estadísticas ---------- */
function goalCheck(){
  if(S.days[today()]>=S.set.goal&&S.goalDay!==today()){S.goalDay=today();S.coins=(S.coins||0)+20;setTimeout(()=>{say('¡Meta diaria cumplida! +20 🪙');tone([523,659,784,1046],'triangle',.07,.1,.2);},1500);}
}
function renderWeek(){
  const g=S.set.goal,t=S.days[today()]||0;
  $('goaltx').textContent=`Meta de hoy: ${t} / ${g} sesiones`+(t>=g?' ✓':'')+(S.distract?` · Distracciones: ${S.distract}`:'');
  const pct=Math.min(100,Math.round(t/g*100));$('goalfill').style.width=pct+'%';$('goalring').style.setProperty('--progress',pct+'%');$('goalpct').textContent=pct+'%';
  const ds=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*864e5);return[d.toLocaleDateString('sv'),d.toLocaleDateString('es',{weekday:'short'})];});
  const mx=Math.max(1,...ds.map(([k])=>S.days[k]||0));
  $('week').innerHTML=ds.map(([k,l])=>`<div><span>${l}</span><b style="height:calc((100% - 44px)*${(S.days[k]||0)/mx})"></b><em>${S.days[k]||0}</em></div>`.replace(/(<span>.*?<\/span>)(<b.*?<\/b>)(<em>.*?<\/em>)/,'$3$2$1')).join('');renderHeatmap();
}
function renderHeatmap(){
  const days=Array.from({length:35},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(34-i));const key=d.toLocaleDateString('sv'),n=S.days[key]||0;return {key,n,label:d.toLocaleDateString('es',{day:'2-digit',month:'short'})};});
  $('heatmap').innerHTML=days.map(d=>{const level=d.n===0?0:d.n===1?1:d.n<=3?2:d.n<=5?3:4;return `<div class="heatcell" data-level="${level}" title="${d.label}: ${d.n} sesiones" aria-label="${d.label}: ${d.n} sesiones"></div>`;}).join('');
}
$('s-goal').value=S.set.goal;$('s-goal').onchange=e=>{S.set.goal=Math.min(20,Math.max(1,+e.target.value||4));e.target.value=S.set.goal;save();renderStats();};

/* ---------- Mini ventana ---------- */
let lastKey='';
function sendMini(){
  if(!window.focoApp||!focoApp.mini)return;
  const label=mode==='focus'?((S.tasks.find(t=>t.id===S.current)||{}).text||'Foco'):'Descanso',key=$('time').textContent+'|'+label+'|'+S.pet;
  if(key===lastKey)return;lastKey=key;
  focoApp.mini({time:$('time').textContent,label,svg:petSVG(S.pet,stageOf(cnt())).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" ')});
}
if(window.focoApp&&focoApp.toggleMini)$('mini').onclick=()=>{focoApp.toggleMini();setTimeout(()=>{lastKey='';sendMini();},500);};else $('mini').style.display='none';

/* ---------- Datos: exportar, importar, reiniciar ---------- */
$('exp').onclick=()=>{const json=JSON.stringify(S);if(window.AndroidFoco&&AndroidFoco.exportProgress){AndroidFoco.exportProgress(json);return;}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download='foco-progreso.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('imp').onclick=()=>$('impf').click();
$('impf').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||typeof d!=='object'||!d.pets)throw 0;localStorage.setItem('foco-v2',JSON.stringify(d));window.focoApp&&focoApp.save&&focoApp.save(JSON.stringify(d));location.reload();}catch(x){$('msg').textContent='Ese archivo no es un progreso válido.';}};
  r.readAsText(f);
};
$('rst').onclick=()=>{if(confirm('¿Borrar todo tu progreso? No se puede deshacer.')){try{localStorage.removeItem('foco-v2');}catch(x){}location.reload();}};
const SHOP=[
 {id:'gafas',t:'acc',slot:'face',n:'Gafas de sol',p:40,ic:'😎'},{id:'copa',t:'acc',slot:'head',n:'Sombrero de copa',p:60,ic:'🎩'},
 {id:'fiesta',t:'acc',slot:'head',n:'Gorro de fiesta',p:40,ic:'🥳'},{id:'bufanda',t:'acc',slot:'neck',n:'Bufanda',p:50,ic:'🧣'},
 {id:'planta',t:'furn',n:'Planta de interior',p:35,ic:'🪴'},{id:'lampara',t:'furn',n:'Lámpara cálida',p:55,ic:'🛋️'},{id:'librero',t:'furn',n:'Librero',p:70,ic:'📚'},{id:'cama',t:'furn',n:'Cama acogedora',p:90,ic:'🛏️'},{id:'acuario',t:'furn',n:'Acuario',p:110,ic:'🐠'},
 {id:'kira',t:'pet',n:'Kira, el zorro',p:150,ic:'🦊'},{id:'pingo',t:'pet',n:'Pingo, el pingüino',p:150,ic:'🐧'}];
SHOP.push({id:'bosque',t:'hab',n:'Hábitat: Bosque',p:80,ic:'🌲'},{id:'playa',t:'hab',n:'Hábitat: Playa',p:80,ic:'🏖️'},{id:'espacio',t:'hab',n:'Hábitat: Espacio',p:100,ic:'🪐'},{id:'volcan',t:'hab',n:'Hábitat: Volcán',p:100,ic:'🌋'},{id:'huevo',t:'egg',n:'Huevo sorpresa',p:90,ic:'🥚'},
 {id:'aurora',t:'prohab',n:'Aurora boreal',ic:'🌌',image:'build/habitats/aurora.webp'},{id:'sakura',t:'prohab',n:'Jardín Sakura',ic:'🌸',image:'build/habitats/sakura.webp'},{id:'nebulosa',t:'prohab',n:'Nebulosa',ic:'🪐',image:'build/habitats/nebulosa.webp'});
function renderShop(){
  $('shopgrid').innerHTML=SHOP.map(i=>{
    if(i.t==='prohab'){
      const active=S.bg===i.id;
      return `<button type="button" class="ghost it pro-shop-hab ${active?'equipped':''}" data-i="${i.id}" aria-pressed="${active}" style="--hab-img:url('${i.image}')"><span class="pro-shop-art" aria-hidden="true"></span><span class="pro-shop-title">${i.ic} ${i.n}</span><span class="pro-shop-badge">✦ FOCO PRO</span><small>${active?'✓ Equipado':'Ver / equipar'}</small></button>`;
    }
    const has=i.t==='pet'?S.own.includes(i.id):i.t==='egg'?false:i.t==='furn'?(S.furniture||[]).includes(i.id):S.inv.includes(i.id);
    let lab=!has?`${i.p} 🪙`:i.t==='pet'?(S.pet===i.id?'Activa':'Elegir'):i.t==='hab'?(S.bg===i.id?'Quitar':'Usar'):i.t==='furn'?((S.roomEq||[]).includes(i.id)?'En habitación':'Colocar'):(S.eq[S.pet]||{})[i.slot]===i.id?'Quitar':'Equipar';
    return `<button class="ghost it" data-i="${i.id}" ${!has&&(S.coins||0)<i.p?'style="opacity:.55"':''}><span class="ic">${i.ic}</span>${i.n}<small>${lab}</small></button>`;
  }).join('');
  renderRoom();
}
function renderRoom(){
  const ids=S.roomEq||[];
  const icons={planta:'🪴',lampara:'🪔',librero:'📚',cama:'🛏️',acuario:'🐠'};
  const names={planta:'Planta',lampara:'Lámpara',librero:'Librero',cama:'Cama',acuario:'Acuario'};
  const furniture=ids.map(id=>`<span class="room-item ${id}" title="${names[id]||id}" aria-label="${names[id]||id}">${icons[id]||'✨'}</span>`).join('');
  $('room').innerHTML=`<div class="room-scene" aria-label="Tu habitación acogedora">
    <div class="room-windowline"></div><div class="room-windowcross"></div><div class="room-shelf"></div>
    <div class="room-floor"></div><div class="room-rug"></div>${furniture}
    <div class="room-pet" title="${esc(nm(S.pet))}">${petSVG(S.pet,stageOf(cnt()))}</div>
    <span class="room-label">✦ HOGAR DE ${esc(nm(S.pet)).toLocaleUpperCase()} · NIVEL ${stageOf(cnt())+1}</span>
  </div>`;
}
$('shopgrid').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const it=SHOP.find(i=>i.id===b.dataset.i);if(!it)return;
  if(it.t==='prohab'){
    if(!(window.focoProIsActive&&window.focoProIsActive())){
      if(window.focoShowProUpsell)window.focoShowProUpsell();else say('Este hábitat es exclusivo de Foco Pro.');
      return;
    }
    S.bg=S.bg===it.id?'':it.id;sky();save();renderStats();renderPet();
    if(S.bg)say('¡Hábitat equipado: '+it.n+'! ✦');else say('Has vuelto al hábitat predeterminado.');
    return;
  }
  const has=it.t==='pet'?S.own.includes(it.id):it.t==='egg'?false:it.t==='furn'?(S.furniture||[]).includes(it.id):S.inv.includes(it.id);
  let fresh=false;
  if(!has){if((S.coins||0)<it.p){say('Aún no alcanzan las monedas.');return;}S.coins-=it.p;fresh=true;tone([659,784,988,1319],'triangle',.07,.1,.16);if(it.t==='pet')S.own.push(it.id);else if(it.t==='furn'){S.furniture=S.furniture||[];S.furniture.push(it.id);S.roomEq=S.roomEq||[];S.roomEq.push(it.id);}else if(it.t!=='egg')S.inv.push(it.id);}
  if(it.t==='egg')hatch();
  else if(it.t==='pet'){S.pet=it.id;care();ambient();sky();voice();}
  else if(it.t==='hab'){S.bg=(!fresh&&S.bg===it.id)?'':it.id;sky();}
  else if(it.t==='furn'){S.roomEq=S.roomEq||[];if(!fresh){S.roomEq=S.roomEq.includes(it.id)?S.roomEq.filter(x=>x!==it.id):[...S.roomEq,it.id];}renderRoom();}
  else{const q=S.eq[S.pet]||(S.eq[S.pet]={});q[it.slot]=(!fresh&&q[it.slot]===it.id)?null:it.id;}
  save();renderStats();renderPet();jump();
};
function voice(){const[v,t]=VOICE[S.pet];tone(v,t,.07,.08,.14);}
function say(t){const p=document.querySelector('.pet');p.querySelectorAll('.say').forEach(e=>e.remove());const b=document.createElement('div');b.className='say';b.textContent=t;p.appendChild(b);setTimeout(()=>b.remove(),3200);}
function hatchNotice(t){const pet=document.querySelector('.pet');if(!pet){say(t);return;}document.querySelectorAll('.hatch-say').forEach(e=>e.remove());pet.classList.add('hatch-notice-active');const b=document.createElement('div');b.className='say hatch-say';b.setAttribute('role','status');b.textContent=t;pet.appendChild(b);const clear=()=>{b.remove();pet.classList.remove('hatch-notice-active');};setTimeout(clear,4200);}
function ambient(){
  const p=document.querySelector('.pet');p.querySelectorAll('.amb').forEach(e=>e.remove());
  for(let i=0;i<9;i++){const e=document.createElement('i');e.className='amb';e.textContent=PETS[S.pet].amb;
    e.style.cssText=`left:${Math.random()*96}%;animation-delay:${-Math.random()*9}s;animation-duration:${6+Math.random()*6}s;font-size:${8+Math.random()*10}px`;p.appendChild(e);}
}
decay();setMode('focus');renderStats();renderTasks();renderRoom();renderHeatmap();ambient();sky();setInterval(()=>{decay();renderCare();save();},60000);setInterval(sky,60000);
setInterval(()=>{if(!timer&&!G){const l=PETS[S.pet].say,c=care();say(c.h<30?'Tengo hambre... 🍎':c.j<30?'Estoy aburrido. ¿Jugamos?':l[Math.random()*l.length|0]);}},50000);
