(()=>{
// Sustituye al preload de Electron: la licencia Pro la guarda y decide la parte nativa de Android.
const A=window.AndroidFoco;
const parse=s=>{try{return JSON.parse(s);}catch(e){return {ok:false};}};
window.focoApp={
  isDev:()=>false,
  proStatus:async()=>!!(A&&A.proStatus&&A.proStatus()),
  proPasswordActivate:async(pw)=>A&&A.proActivate?parse(A.proActivate(String(pw||''))):{ok:false},
  proDevOff:async()=>false
};
})();
