(()=>{
const $=id=>document.getElementById(id);
/* ---- Toast y diálogos (reemplazan prompt/confirm) ---- */
let tt;function toast(m,a,f){clearTimeout(tt);let t=$('toast');if(t)t.remove();t=document.createElement('div');t.id='toast';t.setAttribute('role','status');t.textContent=m+' ';
 if(a){const b=document.createElement('button');b.textContent=a;b.onclick=()=>{f();t.remove();};t.appendChild(b);}document.body.appendChild(t);tt=setTimeout(()=>t.remove(),6000);}
function dlg(h,ok,f,cancel){const d=document.createElement('dialog');d.innerHTML=h+`<div class="ctrl"><button class="main">${ok}</button>${cancel?'<button class="ghost">Cancelar</button>':''}</div>`;document.body.appendChild(d);
 d.querySelector('.main').onclick=()=>{d.close();f&&f();};const c=d.querySelector('.ghost');if(c)c.onclick=()=>d.close();d.onclose=()=>d.remove();d.showModal();}

/* ---- Pestañas ---- */
const TB=[['foco','🎯 Foco'],['tareas','✅ Tareas y stats'],['mascota','🐾 Mascota'],['pro','✦ Foco Pro']];
const nav=document.createElement('nav');nav.className='tabs wide';nav.setAttribute('role','tablist');
nav.innerHTML=TB.map(([k,l])=>`<button role="tab" data-t="${k}">${l}</button>`).join('');document.querySelector('header.top').after(nav);
function tab(t){try{localStorage.setItem('foco-tab',t);}catch(e){}
 document.querySelectorAll('main>[data-tab]').forEach(s=>s.hidden=s.dataset.tab!==t);
 nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));}
nav.onclick=e=>{const b=e.target.closest('button');if(b)tab(b.dataset.t);};

/* ---- Fase actual y tarea rápida junto al reloj ---- */
const ph=document.createElement('p');ph.className='phase';ph.id='phase';$('now').before(ph);
const qk=document.createElement('div');qk.className='quick';
qk.innerHTML='<select id="qsel" aria-label="Tarea actual"></select><input id="qnew" maxlength="80" placeholder="Nueva tarea y Enter" aria-label="Nueva tarea rápida">';$('now').before(qk);
function rq(){const s=$('qsel');s.innerHTML='<option value="">Sin tarea</option>'+S.tasks.filter(t=>!t.done).map(t=>`<option value="${t.id}">${esc(t.text)}</option>`).join('');s.value=S.current||'';}
function rp(){ph.dataset.m=mode;ph.textContent=(mode==='focus'?`🎯 Foco · sesión ${S.sessions%4+1} de 4`:mode==='short'?'☕ Descanso corto':'🌴 Descanso largo')+(!timer&&remaining<total?' · en pausa':'');}
const r1=renderTasks,r2=renderTimer,r3=renderShop;
renderTasks=()=>{r1();rq();};renderTimer=()=>{r2();rp();};
renderShop=()=>{r3();[...$('shopgrid').children].forEach(b=>b.classList.toggle('own',!/🪙/.test(b.textContent)));};
$('qsel').onchange=e=>{S.current=+e.target.value||null;save();renderTasks();renderTimer();};
$('qnew').onkeydown=e=>{if(e.key!=='Enter')return;const v=e.target.value.trim();if(!v)return;const id=Date.now();
 S.tasks.unshift({id,text:v,done:false,pomos:0,priority:'normal',due:'',subtasks:[]});S.current=id;e.target.value='';save();renderTasks();renderTimer();};

/* ---- Subtareas en línea y deshacer al eliminar ---- */
$('list').addEventListener('click',e=>{
 if(e.target.matches('.subtasks')){e.stopPropagation();const li=e.target.closest('li');if(li.querySelector('.subin'))return;
  const i=document.createElement('input');i.className='subin';i.placeholder='Subtarea y Enter (Esc cancela)';i.maxLength=80;li.appendChild(i);i.focus();
  i.onkeydown=k=>{if(k.key==='Escape')i.remove();if(k.key==='Enter'){const t=S.tasks.find(t=>t.id===+li.dataset.id),v=i.value.trim();
   if(t&&v){(t.subtasks=t.subtasks||[]).push({text:v,done:false});save();renderTasks();}else i.remove();}};}
 else if(e.target.matches('.x')){const id=+e.target.closest('li').dataset.id,i=S.tasks.findIndex(t=>t.id===id),t=S.tasks[i];
  setTimeout(()=>toast('Tarea eliminada.','Deshacer',()=>{S.tasks.splice(i,0,t);save();renderTasks();renderTimer();}),0);}
},true);
$('rst').onclick=()=>dlg('<h2>¿Borrar todo tu progreso?</h2><p>No se puede deshacer.</p>','Borrar',()=>{try{localStorage.removeItem('foco-v2');}catch(x){}window.focoApp&&focoApp.save&&focoApp.save('');location.reload();},1);

/* ---- Ayuda, bienvenida y atajos ---- */
const HELP='<ol><li>Elige o escribe una tarea.</li><li>Pulsa <b>Iniciar</b> para comenzar el temporizador.</li><li>Cada sesión completa da XP a tu mascota y 10 🪙.</li></ol><p>En el teléfono, toca los controles para iniciar, pausar y cambiar de modo. Puedes crear tareas, jugar minijuegos y decorar la habitación de tu mascota.</p><p>Cada 4 sesiones llega un descanso largo. Tu progreso se guarda en este dispositivo.</p>';
const hb=document.createElement('button');hb.className='ghost';hb.id='help';hb.textContent='?';hb.title='Ayuda (?)';hb.setAttribute('aria-label','Ayuda');document.querySelector('.hud').appendChild(hb);
hb.onclick=()=>dlg('<h2>Cómo funciona Foco</h2>'+HELP,'Entendido');
try{if(!localStorage.getItem('foco-ob')){localStorage.setItem('foco-ob','1');dlg('<h2>¡Bienvenido a Foco! 🐣</h2>'+HELP,'Empezar');}}catch(e){}
$('go').title='Iniciar o pausar';$('reset').title='Reiniciar (R)';
document.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||document.querySelector('dialog[open]'))return;
 const k=e.key.toLowerCase();
 if(k==='r')$('reset').click();
 else if(k.length===1&&'123'.includes(k)){const b=document.querySelector(`#modes [data-m=${['focus','short','long'][+k-1]}]`);b&&b.click();}
 else if(k==='n'){e.preventDefault();tab('foco');$('qnew').focus();}
 else if(k==='?')hb.click();});

try{['foco-sp','foco-music'].forEach(k=>localStorage.removeItem(k));}catch(e){}

const t0=localStorage.getItem('foco-tab');tab(TB.some(x=>x[0]===t0)?t0:'foco');
window.FocoUI={toast,dlg,tab};renderTasks();renderTimer();renderShop();
})();
