var Ku=["sin_enlace","robusto","rapido"],ju=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;function cc(i){if(typeof i!="string"||!ju.test(i))return!1;let e=Date.parse(`${i}:00Z`);return!Number.isNaN(e)&&new Date(e).toISOString().slice(0,16)===i}function Dn(i){return Date.parse(`${i}:00Z`)}var Qu=["sol_el","sol_az","tierra_el","tierra_az"];function lr(i,e="sitio"){let t=[];if(!Array.isArray(i)||i.length===0)return[`${e}: no hay muestras horarias.`];let n=null;for(let s=0;s<i.length&&t.length<5;s++){let r=i[s],a=r&&cc(r.t)?Dn(r.t):NaN;if(Number.isNaN(a)){t.push(`${e}: la muestra ${s} no tiene una fecha v\xE1lida.`);continue}n!==null&&a-n!==36e5&&t.push(`${e}: hay un salto en los datos antes de ${r.t}.`),n=a;for(let o of Qu){let l=r[o],c=o.endsWith("_el")?Math.abs(l)>90:l<0||l>360;if(typeof l!="number"||!Number.isFinite(l)||c){t.push(`${e}: ${o} no es un \xE1ngulo v\xE1lido en ${r.t}.`);break}}}return t}function ac(i,e){if(!i||!Array.isArray(i.elevacion_deg))return[`${e}: falta el perfil de horizonte.`];let t=i.resolucion_deg;if(typeof t!="number"||!(t>0)||Math.abs(360/t-Math.round(360/t))>1e-9)return[`${e}: resoluci\xF3n de horizonte no v\xE1lida.`];let n=i.elevacion_deg;if(n.length!==Math.round(360/t))return[`${e}: el horizonte debe tener ${Math.round(360/t)} valores y tiene ${n.length}.`];let s=n.findIndex(r=>typeof r!="number"||!Number.isFinite(r)||Math.abs(r)>90);return s>=0?[`${e}: valor de horizonte no v\xE1lido en el azimut ${s*t}\xB0.`]:[]}function hc(i){let e=[],t=o=>typeof o=="number"&&Number.isFinite(o);if(!i||!Array.isArray(i.sitios)||i.sitios.length===0)return["El escenario no tiene sitios."];let n=new Set;for(let o of i.sitios){let l=o&&o.id?o.id:"sitio sin id";!o||!o.id?e.push("Hay un sitio sin id."):n.has(o.id)?e.push(`${l}: el id est\xE1 repetido.`):n.add(o.id),e.push(...ac(o.horizonte,l));let c=o.relevo;!c||![c.az_deg,c.el_deg,c.distancia_km].every(t)?e.push(`${l}: el punto de apoyo necesita azimut, elevaci\xF3n y distancia num\xE9ricos.`):(c.distancia_km<=0&&e.push(`${l}: la distancia al punto de apoyo debe ser mayor que 0 km.`),(c.az_deg<0||c.az_deg>=360||Math.abs(c.el_deg)>90)&&e.push(`${l}: azimut o elevaci\xF3n del punto de apoyo fuera de rango.`),e.push(...ac(c.horizonte,`${l}/punto de apoyo`)))}let s=i.enlace_local;!s||!t(s.rf?.bateria_relevo_h)||!t(s.optico?.sep_sin_enlace_deg)||!t(s.optico?.sep_robusto_deg)?e.push("Faltan umbrales num\xE9ricos del enlace local."):(s.rf.bateria_relevo_h<=0&&e.push("La bater\xEDa del punto de apoyo debe durar m\xE1s de 0 h."),(s.optico.sep_sin_enlace_deg<0||s.optico.sep_sin_enlace_deg>=s.optico.sep_robusto_deg)&&e.push('Umbrales \xF3pticos incoherentes: la separaci\xF3n "sin enlace" debe ser menor que la de "robusto".'));let r=i.fuentes;(!r||typeof r!="object"||!r.efemerides||!Object.values(r).every(o=>o&&typeof o.nombre=="string"))&&e.push("Faltan las fuentes del escenario (nombre de cada una, incluida la de efem\xE9rides).");let a=i.evento_polvo;return(!a||!cc(a.inicio)||!t(a.duracion_s)||a.duracion_s<0)&&e.push("El evento de polvo necesita inicio y duraci\xF3n v\xE1lidos."),e}function uc(i,e){let t=[];for(let n of i.sitios){let s=e&&e[n.id];s&&Number.isFinite(s.lat)&&Number.isFinite(s.lon)&&Math.abs(s.lat)<=90&&s.lon>=0&&s.lon<360?s.elev_km!==void 0&&!Number.isFinite(s.elev_km)&&t.push(`${n.id}: la elevaci\xF3n debe ser num\xE9rica.`):t.push(`${n.id}: faltan latitud o longitud v\xE1lidas.`)}return t}function ed(i){return(i%360+360)%360}function mi(i,e){if(!i)return 0;let t=i.elevacion_deg,n=t.length,s=ed(e)/i.resolucion_deg,r=Math.floor(s)%n,a=(r+1)%n,o=s-Math.floor(s);return t[r]*(1-o)+t[a]*o}function oc(i,e,t,n){let s=Math.PI/180,r=Math.sin(e*s)*Math.sin(n*s)+Math.cos(e*s)*Math.cos(n*s)*Math.cos((i-t)*s);return Math.acos(Math.min(1,Math.max(-1,r)))/s}function rn(i,e,t){return{clave:i,nivel:e,texto:t}}function td(i){let e=Math.min(...i.map(t=>t.nivel));return{estado:Ku[e],limitantes:i.filter(t=>t.nivel===e),factores:i}}function dc(i,e,t){let n=t.modoHorizonte==="plano",s=n?null:i.horizonte,r=n?null:i.relevo.horizonte,a=i.relevo,o=t.reglas,l=a.el_deg>mi(s,a.az_deg),c=t.eventoPolvo?Dn(t.eventoPolvo.inicio):NaN,u=36e5,d=0;return e.map((h,f)=>{let _=Dn(h.t),v=mi(s,h.sol_az),m=mi(s,h.tierra_az),p=h.sol_el>v,M=h.tierra_el>m,w=h.sol_el>mi(r,h.sol_az),E=h.tierra_el>mi(r,h.tierra_az);d=w?0:d+1;let A=[l?rn("geometria",2,"L\xEDnea de vista despejada hacia el punto de apoyo."):rn("geometria",0,"El terreno bloquea la l\xEDnea de vista hacia el punto de apoyo.")],b=null;if(t.tipoEnlace==="rf")w?A.push(rn("energia",2,"Punto de apoyo iluminado: transmite a tasa alta.")):d<=o.rf.bateria_relevo_h?A.push(rn("energia",1,`Punto de apoyo en sombra (${d} h): opera con bater\xEDa a tasa reducida.`)):A.push(rn("energia",0,`Punto de apoyo en sombra m\xE1s de ${o.rf.bateria_relevo_h} h: bater\xEDa agotada (supuesto).`));else{let N=[];if(p&&N.push(oc(h.sol_az,h.sol_el,a.az_deg,a.el_deg)),w&&N.push(oc(h.sol_az,h.sol_el,a.az_deg+180,-a.el_deg)),N.length===0)A.push(rn("sol",2,"Sol bajo el horizonte: no deslumbra el enlace."));else{b=Math.min(...N);let I=b.toFixed(1),R=o.optico;b<R.sep_sin_enlace_deg?A.push(rn("sol",0,`Sol a ${I}\xB0 de la l\xEDnea de vista: el receptor queda deslumbrado.`)):b<R.sep_robusto_deg?A.push(rn("sol",1,`Sol a ${I}\xB0 de la l\xEDnea de vista: m\xE1s ruido, modo de baja tasa.`)):A.push(rn("sol",2,`Sol a ${I}\xB0 de la l\xEDnea de vista: margen suficiente.`))}if(t.polvo&&t.eventoPolvo){let I=nd(t.eventoPolvo,c,_);I>=1800?A.push(rn("polvo",0,`Polvo del penacho sobre la l\xEDnea de vista durante ${Math.round(I)} s de esta hora.`)):I>0&&A.push(rn("polvo",1,`Polvo del penacho bloquea la l\xEDnea de vista unos ${Math.round(I)} s en esta hora: el enlace reintenta en baja tasa.`))}}let g=td(A),S=g.estado!=="sin_enlace"&&E;return{i:f,t:h.t,ms:_,sol:{el:h.sol_el,az:h.sol_az,horizonte:v,visible:p},tierra:{el:h.tierra_el,az:h.tierra_az,horizonte:m,visible:M},relevo:{sol:w,tierra:E,sombraH:d,lineaDeVista:l},enlace:{...g,separacionSol:b},respaldoTierra:S}})}function nd(i,e,t){let n=e+i.duracion_s*1e3,s=Math.min(n,t+36e5)-Math.max(e,t);return Math.max(0,s)/1e3}function cr(i,e){let t=Dn(e.inicio),n=t+e.duracion_s*1e3,s=i.findIndex(a=>a.ms+36e5>t);if(s<0||i[s].ms>=n)return null;let r=s;for(;r+1<i.length&&i[r+1].ms<n;)r++;return[s,r]}function lc(i,e){return i.tierra.visible||e&&i.respaldoTierra}function or(i,e,t,n){let s={horas:0,desde:null,hasta:null},r=null;for(let a=e;a<=t+1;a++){let o=a<=t&&n(i[a]);if(o&&r===null&&(r=a),!o&&r!==null){let l=a-r;l>s.horas&&(s={horas:l,desde:r,hasta:a-1}),r=null}}return s}function fc(i,e,t,n){let s=t-e+1,r=0,a=0,o=0,l=0,c=0,u=0,d={rapido:0,robusto:0,sin_enlace:0};for(let f=e;f<=t;f++){let _=i[f],v=lc(_,n);_.sol.visible&&r++,_.tierra.visible&&a++,v&&o++,v&&_.sol.visible&&l++,_.sol.visible&&_.tierra.visible&&c++,n&&_.respaldoTierra&&u++,d[_.enlace.estado]++}let h=or(i,e,t,f=>!lc(f,n));return h.acotada=h.horas>0&&(h.desde===e||h.hasta===t),{horas:s,horasSol:r,horasTierra:a,pctSol:100*r/s,pctTierra:100*a/s,horasComunicacion:o,horasAmbas:l,pctComunicacion:100*o/s,pctAmbas:100*l/s,horasSolTierra:c,pctSolTierra:100*c/s,horasRespaldo:n?u:null,pctRespaldo:n?100*u/s:null,ventanaSol:or(i,e,t,f=>f.sol.visible),ventanaTierra:or(i,e,t,f=>f.tierra.visible),sombraMax:or(i,e,t,f=>!f.sol.visible),enlace:n?d:null,brecha:h}}var id={sol:{inicio:"Inicio de sombra",fin:"Vuelve el Sol"},tierra:{inicio:"Tierra oculta",fin:"Tierra visible"},enlace:{inicio:"Enlace local sin servicio",fin:"Enlace local restablecido"}};function pc(i,e,t,n){let s=[["sol",a=>a.sol.visible],["tierra",a=>a.tierra.visible]];n&&s.push(["enlace",a=>a.enlace.estado!=="sin_enlace"]);let r=[];for(let[a,o]of s)for(let l=e+1;l<=t;l++){let c=o(i[l-1]),u=o(i[l]);if(c===u)continue;let d=c&&!u,h=null;if(d){let f=l;for(;f<=t&&!o(i[f]);)f++;h=f-l}r.push({tipo:a,indice:l,inicio:d,horas:h,titulo:id[a][d?"inicio":"fin"]})}return r.sort((a,o)=>a.indice-o.indice||a.tipo.localeCompare(o.tipo))}function mc(i,e,t,n){let s=[];for(let r=e;r<=t;r++){let a=n(i[r]),o=s[s.length-1];o&&o.valor===a?o.hasta=r:s.push({valor:a,desde:r,hasta:r})}return s}var hr=[{clave:"pctSol",corta:"iluminaci\xF3n solar",etiqueta:"Horas con iluminaci\xF3n solar",unidad:"%",mejor:"max",frase:i=>`${i} presenta m\xE1s horas de iluminaci\xF3n en el periodo seleccionado.`},{clave:"pctTierra",corta:"vista directa a la Tierra",etiqueta:"Horas con vista directa a la Tierra",unidad:"%",mejor:"max",frase:i=>`${i} mantiene m\xE1s horas de vista directa a la Tierra.`},{clave:"pctSolTierra",corta:"Sol y Tierra a la vez",etiqueta:"Horas con Sol y Tierra visibles a la vez",unidad:"%",mejor:"max",frase:i=>`${i} tiene m\xE1s horas con Sol y vista directa a la Tierra al mismo tiempo.`},{clave:"ventanaTierra",corta:"ventana continua con la Tierra",etiqueta:"Mayor ventana continua con la Tierra visible",unidad:"h",mejor:"max",frase:i=>`${i} ofrece la ventana continua m\xE1s larga con la Tierra visible.`},{clave:"sombraMax",corta:"sombra continua m\xE1s corta",etiqueta:"Mayor periodo continuo en sombra",unidad:"h",mejor:"min",frase:i=>`${i} tiene el periodo en sombra m\xE1s corto.`},{clave:"pctRespaldo",corta:"respaldo que llega a la Tierra",etiqueta:"Horas con respaldo que llega a la Tierra",unidad:"%",mejor:"max",enlace:!0,frase:i=>`${i} tiene m\xE1s horas de respaldo efectivo hacia la Tierra.`},{clave:"rapido",corta:"enlace local r\xE1pido",etiqueta:"Enlace local r\xE1pido",unidad:"h",mejor:"max",enlace:!0,frase:i=>`${i} acumula m\xE1s horas de enlace local r\xE1pido.`},{clave:"robusto",etiqueta:"Enlace local robusto",unidad:"h",mejor:null,enlace:!0},{clave:"sin_enlace",corta:"menos horas sin enlace local",etiqueta:"Sin enlace local",unidad:"h",mejor:"min",enlace:!0,frase:i=>`${i} pasa menos horas sin enlace local.`},{clave:"brecha",corta:"interrupci\xF3n m\xE1s corta",etiqueta:"Mayor intervalo sin comunicaci\xF3n",unidad:"h",mejor:"min",frase:i=>`${i} tiene la interrupci\xF3n continua m\xE1s corta.`}];function xo(i,e){return["pctSol","pctTierra","pctSolTierra","pctRespaldo"].includes(e)?i[e]:["brecha","ventanaTierra","sombraMax","ventanaSol"].includes(e)?i[e].horas:i.enlace?i.enlace[e]:null}function gc(i,e){let t={},n=[];for(let s of hr){if(!s.mejor||s.enlace&&!e)continue;let r=i.map(l=>xo(l.metricas,s.clave)),a=s.mejor==="max"?Math.max(...r):Math.min(...r),o=i.filter((l,c)=>Math.abs(r[c]-a)<1e-9);t[s.clave]=o.map(l=>l.sitio.id),o.length===i.length?n.push(`${s.etiqueta}: los tres sitios empatan.`):o.length>1?n.push(`${s.etiqueta}: empate entre ${o.map(l=>l.sitio.etiqueta).join(" y ")}.`):n.push(s.frase(o[0].sitio.etiqueta))}return{mejores:t,conclusiones:n,resumen:sd(i,t)}}function sd(i,e){let t=Object.keys(e).length;return i.map(n=>({sitio:n.sitio,metricas:hr.filter(s=>e[s.clave]&&e[s.clave].length===1&&e[s.clave][0]===n.sitio.id).map(s=>s.corta),total:t})).filter(n=>n.metricas.length>0).sort((n,s)=>s.metricas.length-n.metricas.length)}var fs={energia:.4,comunicacion:.35,respaldo:.25};function vo(i,e,t=fs){let n=i.pctSol,s=i.pctTierra;if(!e){let a=t.energia+t.comunicacion;return(t.energia*n+t.comunicacion*s)/a}let r=i.pctRespaldo;return t.energia*n+t.comunicacion*s+t.respaldo*r}function rd(i){let e=i==null?"":String(i);return/[",\n;]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function _c(i,e){let n=[["sitio","nombre","primera_hora_utc","ultima_hora_utc","horas","pct_iluminacion","pct_tierra_directa","enlace_local","tipo_enlace","evento_polvo","horas_rapido","horas_robusto","horas_sin_enlace","mayor_intervalo_sin_comunicacion_h","horizonte","indice_conveniencia","pct_sol_y_tierra","pct_respaldo_tierra","mayor_ventana_tierra_h","mayor_sombra_h"].join(",")];for(let{sitio:s,metricas:r}of i)n.push([s.etiqueta,s.nombre_corto,e.inicio,e.fin,r.horas,r.pctSol.toFixed(1),r.pctTierra.toFixed(1),e.enlaceActivo?"activado":"desactivado",e.enlaceActivo?e.tipoEnlace:"",e.enlaceActivo&&e.tipoEnlace==="optico"&&e.polvo?"si":"no",r.enlace?r.enlace.rapido:"",r.enlace?r.enlace.robusto:"",r.enlace?r.enlace.sin_enlace:"",r.brecha.horas,e.modoHorizonte,vo(r,e.enlaceActivo).toFixed(1),r.pctSolTierra.toFixed(1),r.pctRespaldo===null?"":r.pctRespaldo.toFixed(1),r.ventanaTierra.horas,r.sombraMax.horas].map(rd).join(","));return n.join(`
`)+`
`}async function vc(i="../"){let e=document.getElementById("datos-demo");if(e){let o=JSON.parse(e.textContent);return xc(o.escenario,o.efemerides,o.coordenadas,o.generado)}let t=async o=>{let l=await fetch(i+o,{cache:"no-cache"});if(!l.ok)throw new Error(`No se pudo leer ${o} (HTTP ${l.status}).`);return l.json()},n=await t("data/escenario_demo.json"),s={},r={},a={};return await Promise.all(n.sitios.map(async o=>{let l=await t(o.efemerides);s[o.id]=l.horas,r[o.id]=l.sitio,a[o.id]=l.meta?.generado_utc??null})),xc(n,s,r,a)}function xc(i,e,t,n={}){let s=hc(i);if(s.length)throw new Error(`Escenario no v\xE1lido. ${s.slice(0,5).join(" ")}`);let r=uc(i,t);if(r.length)throw new Error(`Coordenadas no v\xE1lidas. ${r.join(" ")}`);for(let c of i.sitios)Object.assign(c,{lat:t[c.id].lat,lon:t[c.id].lon,elev_km:t[c.id].elev_km??0});let a=i.sitios.map(c=>c.id),o=e[a[0]];for(let c of a){let u=e[c],d=lr(u,c);if(d.length)throw new Error(`Datos de efem\xE9rides no v\xE1lidos. ${d.join(" ")}`);if(u.length!==o.length||u[0].t!==o[0].t||u[u.length-1].t!==o[o.length-1].t)throw new Error(`Las efem\xE9rides de ${c} no cubren las mismas horas que ${a[0]}.`)}let l=Object.values(n||{}).filter(Boolean).sort();return i.generado_utc=l.length?l[0]:null,{escenario:i,efemerides:e}}var ad={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12},yc={sol:"10",tierra:"399"};function od(i){let e=/^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/.exec(String(i).trim()),t=e&&ad[e[2].toLowerCase()];if(!t)throw new Error(`Fecha de Horizons no reconocida: ${i}`);return`${e[1]}-${String(t).padStart(2,"0")}-${e[3]}T${e[4]}:${e[5]}`}function ld(i){if(typeof i!="string"||!i.includes("$$SOE")||!i.includes("$$EOE"))throw new Error("Horizons no devolvi\xF3 un bloque de datos.");let[e,t]=i.split("$$SOE"),n=t.split("$$EOE")[0].trim(),s=3,r=4,a=e.trim().split(`
`).map(l=>l.trim()).filter(l=>l&&!l.startsWith("*"));if(a.length){let l=a[a.length-1].split(",").map(d=>d.trim().toLowerCase()),c=l.findIndex(d=>d.startsWith("azi")),u=l.findIndex(d=>d.startsWith("elev"));c>=0&&u>=0&&(s=c,r=u)}let o=n.split(`
`).filter(l=>l.trim()).map(l=>{let c=l.split(",").map(h=>h.trim()),u=Number(c[s]),d=Number(c[r]);if(c[s]===""||c[r]===""||!Number.isFinite(u)||!Number.isFinite(d))throw new Error(`Fila de Horizons ilegible: ${l.trim()}`);return{t:od(c[0]),el:d,az:u}});if(!o.length)throw new Error("Horizons devolvi\xF3 un bloque vac\xEDo.");return o}function cd(i,e,t){let n=new Map(e.map(r=>[r.t,r])),s=i.map(r=>{let a=n.get(r.t);if(!a)throw new Error(`${t}: Horizons no devolvi\xF3 la Tierra para ${r.t}.`);return{t:r.t,sol_el:r.el,sol_az:r.az,tierra_el:a.el,tierra_az:a.az}});if(s.length!==n.size)throw new Error(`${t}: Sol y Tierra no cubren las mismas horas.`);return s}function hd(i,e,t,n,s){let r=new URL(i);return r.search=new URLSearchParams({cuerpo:e,lat:String(t.lat),lon:String(t.lon),inicio:n,fin:s}).toString(),r.toString()}async function Mc({proxy:i,sitios:e,inicio:t,fin:n,fetchFn:s=fetch,timeoutMs:r=45e3}){let a=async(l,c)=>{let u=new AbortController,d=setTimeout(()=>u.abort(),r),h;try{h=await s(hd(i,l,c,t,n),{signal:u.signal})}catch(_){throw new Error(_?.name==="AbortError"?"JPL Horizons tard\xF3 demasiado en responder.":"No hay conexi\xF3n con el intermediario de JPL Horizons.")}finally{clearTimeout(d)}let f=null;try{f=await h.json()}catch{}if(!h.ok)throw new Error(f?.error||`El intermediario respondi\xF3 HTTP ${h.status}.`);if(typeof f?.result!="string")throw new Error("Respuesta inesperada del intermediario.");return ld(f.result)},o={};return await Promise.all(e.map(async l=>{let[c,u]=await Promise.all([a(yc.sol,l),a(yc.tierra,l)]);o[l.id]=cd(c,u,l.id)})),o}var ud=new Intl.DateTimeFormat("es-MX",{timeZone:"UTC",day:"numeric",month:"short",year:"numeric"}),dd=new Intl.DateTimeFormat("es-MX",{timeZone:"UTC",day:"numeric",month:"short"}),fd=new Intl.DateTimeFormat("es-MX",{timeZone:"UTC",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}),Sc=i=>i.replace(".","");function Nn(i){return Sc(ud.format(i))}function gi(i){return Sc(dd.format(i))}function vn(i){return`${fd.format(i)} UTC`}function ps(i){return`${Nn(i)}, ${vn(i)}`}function ms(i){return new Date(i).toISOString().slice(0,10)}function At(i,e=1){return i.toLocaleString("es-MX",{minimumFractionDigits:e,maximumFractionDigits:e})}function Qt(i,e=1){return`${At(i,e)}\xB0`}function yo(i,e=1){return`${i>=0?"+":"\u2212"}${At(Math.abs(i),e)}\xB0`}function _i(i){return i===1?"1 h":`${i} h`}function De(i){return String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function ur(i,e,t,n){let s=n*Math.PI/180;return[i+t*Math.sin(s),e-t*Math.cos(s)]}function en(i,e){return typeof document>"u"?e:getComputedStyle(document.documentElement).getPropertyValue(i).trim()||e}var Se={fondo:en("--fondo","#111214"),superficie:en("--panel-solido","#1B1D21"),texto:en("--texto","#F2F2EF"),texto2:en("--texto-2","#B1B3B6"),texto3:en("--texto-3","#8E9196"),acento:en("--acento","#C6A86A"),acentoClaro:en("--acento-claro","#E2C990"),sol:en("--sol","#E2C990"),tierra:en("--tierra","#A9C3DD"),ok:en("--ok","#82CFA2"),aviso:en("--aviso","#E3B65A"),error:en("--error","#EC8C84"),neutro:"rgba(255,255,255,.08)",sombra:"rgba(10,11,13,.6)"},Ot={rapido:{texto:"R\xE1pido",color:Se.ok,clase:"c-ok",patron:null,ayuda:"El tramo local tiene margen: transmite a tasa alta."},robusto:{texto:"Robusto",color:Se.aviso,clase:"c-aviso",patron:"p-rayas",ayuda:"Hay degradaci\xF3n: el enlace sigue, pero en modo de baja tasa con m\xE1s protecci\xF3n."},sin_enlace:{texto:"Sin enlace",color:Se.error,clase:"c-error",patron:"p-cruces",ayuda:"El tramo local no funciona en esa hora."}},an={rf:"Radiofrecuencia",optico:"\xD3ptico"},pd={lola_skyline:"LOLA (DEM real)",sintetico:"perfil sint\xE9tico"};function dr(i,e){return i==="plano"?"plano (0\xB0)":pd[e.horizonte.fuente]||e.horizonte.fuente}function bc(i,e){return i==="plano"?"plano":e.horizonte.fuente}var Nt={sol:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M4 4l1.6 1.6M14.4 14.4 16 16M4 16l1.6-1.6M14.4 5.6 16 4"/></g></svg>',tierra:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 7.5c2 .5 3 2 2.5 3.5S9 13 10 15M12 3.5c-.5 2 1 3 3 3.5M11.5 10.5c1.5-.5 3 .5 3.5 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',enlace:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 15 10 5l7 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="10" cy="5" r="2" fill="currentColor"/><path d="M6.5 3a5 5 0 0 0 0 4M13.5 3a5 5 0 0 1 0 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',eclipse:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 4a6 6 0 0 1 0 12z" fill="currentColor"/></svg>',respaldo:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16h4l3-5 3 5h4M10 11V4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="3.5" r="1.8" fill="currentColor"/></svg>'};function fr(){return`
    <pattern id="p-rayas" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="${Se.aviso}"/><rect width="2.2" height="6" fill="rgba(0,0,0,.35)"/>
    </pattern>
    <pattern id="p-cruces" width="7" height="7" patternUnits="userSpaceOnUse">
      <rect width="7" height="7" fill="${Se.error}"/><path d="M0 0l7 7M7 0 0 7" stroke="rgba(0,0,0,.4)" stroke-width="1.4"/>
    </pattern>
    <pattern id="p-polvo" width="5" height="5" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r=".9" fill="rgba(241,245,249,.55)"/><circle cx="4" cy="3.8" r=".6" fill="rgba(241,245,249,.4)"/>
    </pattern>`}function Ec(i){let e=Ot[i];return e.patron?`url(#${e.patron})`:e.color}function pr(i,e,t,n,s,r){return`<div class="indicador">
    <span class="indicador__icono" style="color:${e}">${i}</span>
    <div>
      <div class="indicador__etq">${t}</div>
      <div class="indicador__valor">${n}${s?`<small>${s}</small>`:""}</div>
      ${r?`<div class="indicador__pie">${r}</div>`:""}
    </div>
  </div>`}function Tc(i,e){let{metricas:t,estado:n}=e,s;if(t.enlace){let r=t.enlace.rapido+t.enlace.robusto;s=pr(Nt.enlace,"var(--ok)",`Enlace local, ${an[n.tipoEnlace].toLowerCase()}`,`${At(100*r/t.horas,0)} %`,`${_i(t.horasRespaldo)} llega a la Tierra`)}else s=pr(Nt.enlace,"var(--texto-3)","Enlace local","Desactivado","");i.innerHTML=pr(Nt.sol,"var(--acento-claro)","Iluminaci\xF3n solar",`${At(t.pctSol,0)} %`,`${t.horasSol} de ${t.horas} h`)+pr(Nt.tierra,"var(--tierra)","Visibilidad de la Tierra",`${At(t.pctTierra,0)} %`,`${t.horasTierra} de ${t.horas} h`)+s}function Ac(i,e){let{metricas:t,estado:n}=e,s=n.enlaceActivo?"directa o respaldo":"solo directa";i.innerHTML=`
    <div class="meta">
      <div class="meta__valor">${At(t.pctSolTierra,0)} %</div>
      <div class="barra" aria-hidden="true"><span style="width:${t.pctSolTierra}%"></span></div>
      <div class="meta__etq">Sol y Tierra visibles<br>${t.horasSolTierra} h a la vez</div>
    </div>
    <div class="meta">
      <div class="meta__valor">${At(t.pctComunicacion,0)} %</div>
      <div class="barra barra--tierra" aria-hidden="true"><span style="width:${t.pctComunicacion}%"></span></div>
      <div class="meta__etq">Comunicaci\xF3n<br>${s}</div>
    </div>`}function wc(i,e){let{filas:t,sitio:n}=e,s=t.reduce((a,o)=>o.metricas.pctSolTierra>a.metricas.pctSolTierra?o:a),r=t.filter(a=>Math.abs(a.metricas.pctSolTierra-s.metricas.pctSolTierra)<1e-9).length>1;i.innerHTML=t.map(({sitio:a,metricas:o})=>`
    <div class="mini-fila">
      <span class="mini-fila__nombre ${a.id===n.id?"activo":""}">${De(a.etiqueta)}</span>
      <span class="mini-fila__barras" role="img" aria-label="${De(a.etiqueta)}: ${At(o.pctSol,0)} % de luz, ${At(o.pctTierra,0)} % con la Tierra visible">
        <span class="barra"><span style="width:${o.pctSol}%"></span></span>
        <span class="barra barra--tierra"><span style="width:${o.pctTierra}%"></span></span>
      </span>
      <span class="mini-fila__valor">${At(o.pctSol,0)} % luz<br>${At(o.pctTierra,0)} % Tierra</span>
    </div>`).join("")+`
    <div class="mini-pie">
      <span>${r?"Empate en horas con Sol y Tierra.":`M\xE1s horas con Sol y Tierra: ${De(s.sitio.etiqueta)}`}</span>
      <a href="#comparador">Ver comparador</a>
    </div>`}var wt={izq:40,der:14,sup:40,inf:30};function Cc(i,{alCambiarIndice:e}){let t=null,n=null,s=!1;i.setAttribute("role","slider"),i.setAttribute("tabindex","0"),i.setAttribute("aria-label","Hora seleccionada en la gr\xE1fica de evoluci\xF3n");let r=c=>{let u=i.getBoundingClientRect(),d=(c-u.left)/u.width*t.W-wt.izq,h=Math.round(d/t.ancho*(t.n-1));return t.i0+Math.max(0,Math.min(t.n-1,h))};i.addEventListener("pointerdown",c=>{!t||c.button>0||(s=!0,i.setPointerCapture(c.pointerId),i.focus({preventScroll:!0}),e(r(c.clientX)))}),i.addEventListener("pointermove",c=>{s&&e(r(c.clientX))});let a=()=>{s=!1};i.addEventListener("pointerup",a),i.addEventListener("pointercancel",a),i.addEventListener("keydown",c=>{if(!t)return;let u={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:-24,PageDown:24},d=null;c.key in u?d=n.indice+u[c.key]:c.key==="Home"?d=t.i0:c.key==="End"&&(d=t.i1),d!==null&&(c.preventDefault(),e(Math.max(t.i0,Math.min(t.i1,d))))});function o(c){n=c;let{serie:u,i0:d,i1:h}=c,f=h-d+1,_=Math.max(300,Math.round(i.clientWidth||800)),v=_<600?220:300,m=_-wt.izq-wt.der,p=v-wt.sup-wt.inf,M=0,w=0;for(let R=d;R<=h;R++){let U=u[R];M=Math.min(M,U.sol.el-U.sol.horizonte,U.tierra.el-U.tierra.horizonte),w=Math.max(w,U.sol.el-U.sol.horizonte,U.tierra.el-U.tierra.horizonte)}M=Math.floor(M)-1,w=Math.ceil(w)+1;let E=R=>wt.izq+(f===1?m/2:(R-d)/(f-1)*m),A=R=>wt.sup+(w-R)/(w-M)*p,b=[],g=w-M>12?4:2;for(let R=Math.ceil(M/g)*g;R<=w;R+=g)b.push(`<line x1="${wt.izq}" x2="${_-wt.der}" y1="${A(R)}" y2="${A(R)}" stroke="rgba(255,255,255,${R===0?0:.06})"/>`),b.push(`<text x="${wt.izq-8}" y="${A(R)+4}" text-anchor="end" class="ev-eje">${R>0?"+":R<0?"\u2212":""}${Math.abs(R)}\xB0</text>`);b.push(`<rect x="${wt.izq}" y="${wt.sup}" width="${m}" height="${A(0)-wt.sup}" fill="rgba(255,255,255,.03)"/>`),b.push(`<line x1="${wt.izq}" x2="${_-wt.der}" y1="${A(0)}" y2="${A(0)}" stroke="rgba(255,255,255,.4)" stroke-dasharray="4 5"/>`);let S=[];for(let R=d;R<=h;R++)u[R].t.endsWith("T00:00")&&S.push(R);let N=Math.max(1,Math.ceil(S.length/Math.floor(m/64)));S.forEach((R,U)=>{U%N===0&&b.push(`<text x="${E(R)}" y="${v-8}" text-anchor="middle" class="ev-eje">${gi(u[R].ms)}</text>`)});let I=R=>{let U="";for(let H=d;H<=h;H++)U+=`${H===d?"M":"L"}${E(H).toFixed(1)},${A(R(u[H])).toFixed(1)}`;return U};b.push(`<path d="${I(R=>R.tierra.el-R.tierra.horizonte)}" fill="none" stroke="${Se.tierra}" stroke-width="2" stroke-linejoin="round" opacity=".9"/>`),b.push(`<path d="${I(R=>R.sol.el-R.sol.horizonte)}" fill="none" stroke="${Se.sol}" stroke-width="2.6" stroke-linejoin="round"/>`),b.push(`<text x="${_-wt.der}" y="${A(0)+14}" text-anchor="end" class="ev-eje ev-eje--halo">0\xB0 = horizonte local</text>`),i.innerHTML=`
      <svg viewBox="0 0 ${_} ${v}" aria-hidden="true">
        <style>.ev-eje{font:400 11px var(--fuente);fill:${Se.texto3}}.ev-eje--halo{paint-order:stroke;stroke:#22242a;stroke-width:4px;stroke-linejoin:round}.ev-burbuja{font:600 11px var(--fuente);fill:${Se.texto}}</style>
        ${b.join("")}
        <g id="ev-cursor"></g>
      </svg>`,t={W:_,H:v,ancho:m,n:f,i0:d,i1:h,x:E,y:A},l(c)}function l(c){if(n=c,!t)return;let{serie:u,indice:d}=c,h=u[d],f=t.x(d),_=t.y(h.sol.el-h.sol.horizonte),v=t.y(h.tierra.el-h.tierra.horizonte),m=`${gi(h.ms)}, ${vn(h.ms)}`,p=m.length*6.4+18,M=Math.min(Math.max(f-p/2,2),t.W-p-2);i.querySelector("#ev-cursor").innerHTML=`
      <line x1="${f}" x2="${f}" y1="${wt.sup-6}" y2="${t.H-wt.inf}" stroke="rgba(255,255,255,.35)"/>
      <rect x="${M}" y="6" width="${p}" height="22" rx="11" fill="rgba(17,18,20,.85)" stroke="rgba(255,255,255,.18)"/>
      <text x="${M+p/2}" y="21" text-anchor="middle" class="ev-burbuja">${m}</text>
      <circle cx="${f}" cy="${v}" r="5" fill="${h.tierra.visible?Se.tierra:Se.fondo}" stroke="${Se.tierra}" stroke-width="2"/>
      <circle cx="${f}" cy="${_}" r="6" fill="${h.sol.visible?Se.sol:Se.fondo}" stroke="#fff" stroke-width="2"/>`,i.setAttribute("aria-valuemin",String(t.i0)),i.setAttribute("aria-valuemax",String(t.i1)),i.setAttribute("aria-valuenow",String(d)),i.setAttribute("aria-valuetext",`${ps(h.ms)}. Sol ${h.sol.visible?"visible":"en sombra"}, Tierra ${h.tierra.visible?"visible":"oculta"}.`)}return{dibujar:o,moverCursor:l}}var md='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor" opacity=".2"/><path d="M4.8 8.2 7 10.3l4.2-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',gd='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',_d='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1a7 7 0 0 1 0 14z" fill="currentColor"/></svg>',xd=i=>({si:md,no:gd,medio:_d})[i],mr=(i,e)=>`<li class="${i}">${xd(i)}${e}</li>`;function Ic(i,e,t){i.textContent=vn(t.ms),e.textContent=Nn(t.ms)}function Pc(i,e){let{sitio:t,muestra:n,estado:s}=e,r=[mr(n.sol.visible?"si":"no",n.sol.visible?"Sol visible":"Sombra"),mr(n.tierra.visible?"si":"no",n.tierra.visible?"Tierra visible":"Tierra oculta")];if(s.enlaceActivo){let o=n.enlace.estado;r.push(mr(o==="rapido"?"si":o==="robusto"?"medio":"no",`Enlace ${an[s.tipoEnlace].toLowerCase()}: ${Ot[o].texto}`))}else r.push(mr("no","Enlace local desactivado"));let a=vn(n.ms).replace(" UTC","");i.innerHTML=`
    <div class="destacada__cab">
      <span class="destacada__sitio">${De(t.etiqueta)}</span>
      <span class="destacada__etq">Condiciones ahora</span>
    </div>
    <div class="destacada__nombre">${De(t.nombre_corto)}</div>
    <div class="destacada__cuerpo">
      <ul class="destacada__estados">${r.join("")}</ul>
      <div class="destacada__hora"><small>UTC</small><b>${a}</b><small>${gi(n.ms)}</small></div>
    </div>`}var vd={sol:[Nt.eclipse,Nt.sol],tierra:[Nt.tierra,Nt.tierra],enlace:[Nt.enlace,Nt.enlace]},Rc={sol:"var(--acento-claro)",tierra:"var(--tierra)",enlace:"var(--error)"};function Lc(i,e,t,n,s,r=4){if(e.textContent=n.length===1?"1 cambio":`${n.length} cambios`,!n.length){i.innerHTML='<li class="eventos__vacio">Sin cambios de estado en este periodo.</li>';return}let a=n.findIndex(l=>l.indice>=t.indice);a<0&&(a=Math.max(0,n.length-r));let o=n.slice(a,a+r);i.innerHTML=o.map(l=>{let c=t.serie[l.indice],u=vd[l.tipo][l.inicio?0:1],d=l.inicio?Rc[l.tipo]:l.tipo==="enlace"?"var(--ok)":Rc[l.tipo],h=l.inicio?`<span class="evento__duracion">${_i(l.horas)}</span>`:'<span class="evento__duracion evento__duracion--neutro">Fin</span>';return`<li><button type="button" class="evento" data-indice="${l.indice}">
      <span class="evento__icono" style="color:${d}">${u}</span>
      <span><span class="evento__titulo">${l.titulo}</span><span class="evento__fecha">${Nn(c.ms)}, ${vn(c.ms)}</span></span>
      ${h}
    </button></li>`}).join(""),i.querySelectorAll("[data-indice]").forEach(l=>l.addEventListener("click",()=>s(Number(l.dataset.indice))))}var yd={geometria:"L\xEDnea de vista",energia:"Energ\xEDa del relevo",sol:"\xC1ngulo del Sol",polvo:"Polvo"};function Dc(i,e){let{muestra:t,estado:n,sitio:s}=e;if(!n.enlaceActivo){i.innerHTML='<h3>Enlace local desactivado</h3><p class="tarjeta__sub">Act\xEDvalo en el panel derecho para ver c\xF3mo se clasifica cada hora.</p>';return}let r=Ot[t.enlace.estado],a=["Sin enlace","Robusto","R\xE1pido"],o=["c-error","c-aviso","c-ok"];i.innerHTML=`
    <header class="tarjeta__cab" style="margin-bottom:0">
      <div>
        <h3>Por qu\xE9 el enlace est\xE1 as\xED a las ${vn(t.ms)}</h3>
        <p class="tarjeta__sub">${De(s.etiqueta)}, ${an[n.tipoEnlace].toLowerCase()}. Gana el factor m\xE1s limitante.</p>
      </div>
      <span class="pastilla ${r.clase}">${r.texto}</span>
    </header>
    <ul class="factores">
      ${t.enlace.factores.map(l=>`<li><span class="${o[l.nivel]}"><b>${yd[l.clave]}</b><br><small>${a[l.nivel]}</small></span><span>${De(l.texto)}</span></li>`).join("")}
      <li><span class="${t.respaldoTierra?"c-ok":"c-error"}"><b>Respaldo</b><br><small>${t.respaldoTierra?"Disponible":"No disponible"}</small></span><span>${t.respaldoTierra?`${De(s.relevo.nombre)} ve la Tierra y el tramo local funciona.`:t.enlace.estado==="sin_enlace"?"El tramo local no funciona en esta hora.":`${De(s.relevo.nombre)} no ve la Tierra en esta hora.`}</span></li>
    </ul>`}function gr(i,e,t,n,s,r){return`<li class="fila-estado">
    <span class="fila-estado__icono ${e}" style="background:rgba(255,255,255,.04)">${i}</span>
    <div>
      <div class="fila-estado__nombre">${t}</div>
      <div class="fila-estado__valor ${s}"><span class="pastilla">${n}</span></div>
      <div class="fila-estado__detalle">${r}</div>
    </div>
  </li>`}function Nc(i,e){let{muestra:t,sitio:n,estado:s}=e,r=t.sol,a=t.tierra,o=[gr(Nt.sol,"c-sol","Sol",r.visible?"Sol visible":"Sombra",r.visible?"c-sol":"c-neutro",`Elevaci\xF3n ${Qt(r.el,2)}, horizonte ${Qt(r.horizonte,2)} en azimut ${Qt(r.az,0)} (margen ${yo(r.el-r.horizonte,2)}).`),gr(Nt.tierra,"c-tierra","Comunicaci\xF3n directa",a.visible?"Tierra visible":"Tierra oculta",a.visible?"c-tierra":"c-neutro",`Elevaci\xF3n ${Qt(a.el,2)}, horizonte ${Qt(a.horizonte,2)} en azimut ${Qt(a.az,0)} (margen ${yo(a.el-a.horizonte,2)}).`)];if(s.enlaceActivo){let u=Ot[t.enlace.estado],d=t.enlace.limitantes.map(f=>De(f.texto)).join(" ");o.push(gr(Nt.enlace,u.clase,`Enlace local, ${an[s.tipoEnlace].toLowerCase()}`,u.texto,u.clase,d));let h;t.respaldoTierra?h=`${De(n.relevo.nombre)} ve la Tierra y el tramo local funciona.`:t.enlace.estado==="sin_enlace"?h="El tramo local no funciona en esta hora.":h=`${De(n.relevo.nombre)} tampoco ve la Tierra en esta hora.`,o.push(gr(Nt.respaldo,t.respaldoTierra?"c-ok":"c-error","Respaldo hacia la Tierra",t.respaldoTierra?"Disponible":"No disponible",t.respaldoTierra?"c-ok":"c-error",h))}let l=a.visible||s.enlaceActivo&&t.respaldoTierra,c=a.visible?"Comunicaci\xF3n por vista directa.":l?"Sin vista directa: la comunicaci\xF3n sigue por el respaldo local.":s.enlaceActivo?"Sin comunicaci\xF3n en esta hora: ni vista directa ni respaldo.":"Sin vista directa a la Tierra en esta hora.";i.innerHTML=`
    <header class="panel__cab" style="margin-bottom:var(--e-2)">
      <h3 id="t-estado">Hora seleccionada</h3>
      <span class="panel__meta">Valor instant\xE1neo</span>
    </header>
    <p class="estado__sitio"><b>${De(n.etiqueta)}</b>, ${De(n.nombre_corto)}</p>
    <p class="estado__hora">${vn(t.ms)}</p>
    <p class="estado__fecha">${Nn(t.ms)}</p>
    <ul class="estado__lista">${o.join("")}</ul>
    <p class="estado__nota ${l?"":"c-error"}">${c}</p>
    <p class="estado__nota">Los indicadores del Resumen cubren todo el periodo; este panel describe solo la hora del cursor.</p>`}var Un=Math.PI/180;function gs(i,e,t=1){let n=i*Un,s=e*Un;return[t*Math.cos(n)*Math.cos(s),t*Math.sin(n),-t*Math.cos(n)*Math.sin(s)]}function Uc(i,e,t,n){let s=n/1737.4,r=i*Un,a=e*Un,o=t*Un,l=Math.asin(Math.sin(r)*Math.cos(s)+Math.cos(r)*Math.sin(s)*Math.cos(o)),c=a+Math.atan2(Math.sin(o)*Math.sin(s)*Math.cos(r),Math.cos(s)-Math.sin(r)*Math.sin(l));return{lat:l/Un,lon:(c/Un%360+360)%360}}function Ii([i,e,t,n],[s,r,a,o]){return[n*s+i*o+e*a-t*r,n*r-i*a+e*o+t*s,n*a+i*r-e*s+t*o,n*o-i*s-e*r-t*a]}function _r(i,[e,t,n]){let[s,r,a,o]=i,l=Ii(Ii(i,[e,t,n,0]),[-s,-r,-a,o]);return[l[0],l[1],l[2]]}function Ri(i){let e=Math.hypot(...i);return i.map(t=>t/e)}function Fc(i,e){let[t,n,s]=Ri(i),[r,a,o]=Ri(e),l=t*r+n*a+s*o;if(l<-.999999)return[...Math.abs(t)<.9?Ri([0,-s,n]):Ri([-n,t,0]),0];let c=[n*o-s*a,s*r-t*o,t*a-n*r];return Ri([c[0],c[1],c[2],1+l])}function Oc(i,e,t){let[n,s,r,a]=e,o=i[0]*n+i[1]*s+i[2]*r+i[3]*a;if(o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o),o>.9995)return Ri(i.map((h,f)=>h+t*([n,s,r,a][f]-h)));let l=Math.acos(o),c=Math.sin(l),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return[i[0]*u+n*d,i[1]*u+s*d,i[2]*u+r*d,i[3]*u+a*d]}function _s(){let i=Fc([0,-1,0],[0,0,1]),e=_r(i,[1,0,0]),t=Math.atan2(e[0],e[1]),n=[0,0,Math.sin(t/2),Math.cos(t/2)];return Ii(n,i)}function xr(i,e){let t=_s(),n=_r(t,gs(i,e));return Ii(Fc(n,[0,0,1]),t)}function Bc(i){let e=Math.min(1,Math.max(0,i));return e<.5?4*e*e*e:1-(-2*e+2)**3/2}function zc({semiladoKm:i=240,kmPorGrado:e=30.32,anillos:t=96,sectores:n=192,radio:s=1}={}){let r=[],a=[],o=[];for(let c=0;c<=t;c++){let u=i*c/t,d=-(90-u/e);for(let h=0;h<=n;h++){let f=360*h/n;r.push(...gs(d,f,s));let _=u*Math.sin(f*Un),v=-u*Math.cos(f*Un);a.push((_+i)/(2*i),1-(v+i)/(2*i))}}let l=n+1;for(let c=0;c<t;c++)for(let u=0;u<n;u++){let d=c*l+u,h=d+l;o.push(d,d+1,h,d+1,h+1,h)}return{posiciones:r,uvs:a,indices:o}}var Mo=1e3,Pi=760,on=Mo/2,yn=Pi/2,So=340,xs=4.6,Md=Math.PI/180*1737.4;function vs(i,e){let t=(90+i)/xs*So,n=e*Math.PI/180;return[on+t*Math.sin(n),yn-t*Math.cos(n)]}function Sd(){let i=[];for(let t=1;t<=4;t++){let n=t/xs*So;i.push(`<circle cx="${on}" cy="${yn}" r="${n}" class="ret"/>`),i.push(`<text x="${on+8}" y="${yn+n+20}" class="ret-etq">${90-t}\xB0 S</text>`)}for(let t=0;t<360;t+=30){let[n,s]=vs(-90+xs,t);i.push(`<line x1="${on}" y1="${yn}" x2="${n}" y2="${s}" class="ret"/>`);let[r,a]=vs(-90+xs+.32,t),o=t===0?"0\xB0":t===180?"180\xB0":`${t}\xB0 E`;i.push(`<text x="${r}" y="${a+4}" text-anchor="middle" class="ret-etq">${o}</text>`)}i.push(`<circle cx="${on}" cy="${yn}" r="3" fill="${Se.texto3}"/><text x="${on}" y="${yn-10}" text-anchor="middle" class="ret-etq">Polo sur</text>`);let e=25/Md/xs*So;return i.push(`<line x1="40" y1="${Pi-40}" x2="${40+e}" y2="${Pi-40}" stroke="${Se.texto2}" stroke-width="2"/><text x="40" y="${Pi-50}" class="ret-etq">25 km</text>`),i.join("")}function bo(i,e){i.innerHTML=`
    <svg viewBox="0 0 ${Mo} ${Pi}" role="group" aria-label="Mapa polar sur con las coordenadas de los tres sitios">
      <defs>${fr()}</defs>
      <style>
        .ret { fill: none; stroke: rgba(255,255,255,.09); stroke-width: 1; }
        .ret-etq { font: 400 18px var(--fuente); fill: ${Se.texto3}; }
        .etq { font: 600 20px var(--fuente); fill: ${Se.texto}; }
        .etq2 { font: 500 22px var(--fuente); fill: ${Se.texto2}; }
      </style>
      <rect width="${Mo}" height="${Pi}" fill="rgba(10,11,13,.35)"/>
      <g>${Sd()}</g>
      <g class="mapa-dinamico"></g>
    </svg>
    <div class="mapa__lista" role="group" aria-label="Elegir sitio"></div>`,i.addEventListener("click",r=>{let a=r.target.closest("[data-sitio]");a&&e(a.dataset.sitio)}),i.addEventListener("keydown",r=>{let a=r.target.closest("[data-sitio]");a&&(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),e(a.dataset.sitio))});let t=i.querySelector(".mapa-dinamico"),n=i.querySelector(".mapa__lista");function s(r){let{sitios:a,sitio:o,muestra:l,estado:c}=r,u=[],[d,h]=vs(o.lat,o.lon);if(c.enlaceActivo){let b=Uc(o.lat,o.lon,o.relevo.az_deg,o.relevo.distancia_km),[g,S]=vs(b.lat,b.lon),N=Ot[l.enlace.estado],I=l.enlace.estado==="rapido"?"":l.enlace.estado==="robusto"?'stroke-dasharray="8 5"':'stroke-dasharray="2 6"';u.push(`<line x1="${d}" y1="${h}" x2="${g}" y2="${S}" stroke="${N.color}" stroke-width="3" stroke-linecap="round" ${I}/>`),u.push(`<path d="M${g},${S-9}l8,14h-16z" fill="${Se.superficie}" stroke="${Se.acento}" stroke-width="2"><title>${De(o.relevo.nombre)}: ${o.relevo.distancia_km} km a ${o.relevo.az_deg}\xB0 (supuesto)</title></path>`)}let f=Math.atan2(d-on,-(h-yn)),_=b=>b*Math.PI/180+f,v=46,[m,p]=ur(d,h,v,_(l.sol.az)*180/Math.PI),[M,w]=ur(d,h,v,_(l.tierra.az)*180/Math.PI),[E,A]=ur(d,h,v+14,f*180/Math.PI);u.push(`<g>
      <circle cx="${d}" cy="${h}" r="${v}" fill="none" stroke="rgba(226,201,144,.35)" stroke-dasharray="2 5"/>
      <text x="${E}" y="${A+4}" text-anchor="middle" class="ret-etq">N</text>
      <line x1="${d}" y1="${h}" x2="${m}" y2="${p}" stroke="${Se.sol}" stroke-opacity="${l.sol.visible?.8:.3}"/>
      <circle cx="${m}" cy="${p}" r="8" fill="${l.sol.visible?Se.sol:"none"}" stroke="${Se.sol}" stroke-width="2"/>
      <line x1="${d}" y1="${h}" x2="${M}" y2="${w}" stroke="${Se.tierra}" stroke-opacity="${l.tierra.visible?.8:.3}"/>
      <circle cx="${M}" cy="${w}" r="7" fill="${l.tierra.visible?Se.tierra:"none"}" stroke="${Se.tierra}" stroke-width="2"/>
    </g>`);for(let b of a){let[g,S]=vs(b.lat,b.lon),N=b.id===o.id,I=b.etiqueta.slice(-1),R=Math.atan2(g-on,-(S-yn)),U=Math.hypot(g-on,S-yn),H=U>200&&Math.abs(Math.cos(R))>.9,C=H?U:Math.max(U+70,165),O=H?g+14:on+C*Math.sin(R),X=H?S+44:yn-C*Math.cos(R),F=H||O>=on?"start":"end",ne=F==="start"?8:-8,V=g+19*Math.sin(R),ee=S-19*Math.cos(R);u.push(`<g class="marcador" data-sitio="${b.id}" tabindex="0" role="button" aria-pressed="${N}" aria-label="${De(b.etiqueta)}: ${De(b.nombre_corto)}, ${Math.abs(b.lat).toFixed(3)}\xB0 S, ${b.lon.toFixed(3)}\xB0 E">
        <circle cx="${g}" cy="${S}" r="26" fill="transparent"/>
        ${H?"":`<line class="marcador__guia" x1="${V}" y1="${ee}" x2="${O}" y2="${X}" stroke="${N?Se.acentoClaro:"rgba(255,255,255,.3)"}" stroke-width="1.2"/>`}
        <circle class="marcador__anillo" cx="${g}" cy="${S}" r="17" fill="${N?"rgba(198,168,106,.3)":"rgba(27,29,33,.9)"}" stroke="${N?Se.acentoClaro:"rgba(255,255,255,.45)"}" stroke-width="2"/>
        <text x="${g}" y="${S+5}" text-anchor="middle" class="etq etq--letra">${I}</text>
        <text x="${O+ne}" y="${X+1}" text-anchor="${F}" class="etq2 etq--nombre" ${N?`fill="${Se.texto}"`:""}>${De(b.nombre_corto)}</text>
        <text x="${O+ne}" y="${X+24}" text-anchor="${F}" class="ret-etq etq--coord">${Math.abs(b.lat).toFixed(3)}\xB0 S, ${b.lon.toFixed(3)}\xB0 E</text>
      </g>`)}t.innerHTML=u.join(""),n.innerHTML=a.map(b=>`<button type="button" class="chip-sitio${b.id===o.id?" activo":""}" data-sitio="${b.id}" aria-pressed="${b.id===o.id}"><span class="chip-sitio__letra">${De(b.etiqueta.slice(-1))}</span>${De(b.nombre_corto)}</button>`).join("")}return{render:s}}function kc(i){i.innerHTML=`
    <li>Proyecci\xF3n polar azimutal equidistante; coordenadas de sitios.json</li>
    <li><span class="muestra" style="background:${Se.sol};border-radius:50%"></span>Sol (relleno si es visible)</li>
    <li><span class="muestra" style="background:${Se.tierra};border-radius:50%"></span>Tierra (relleno si es visible)</li>
    <li><span class="muestra" style="border:2px solid ${Se.acento};border-radius:2px"></span>Punto de apoyo (ubicaci\xF3n supuesta)</li>
    <li><span class="muestra" style="background:${Se.ok}"></span>Continua: r\xE1pido</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${Se.aviso} 0 6px,transparent 6px 9px)"></span>Discontinua: robusto</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${Se.error} 0 2px,transparent 2px 6px)"></span>Punteada: sin enlace</li>`}var uh=0,Qo=1,dh=2;var $s=1,fh=2,rs=3,hi=0,Xt=1,wn=2,Si=0,as=1,el=2,tl=3,nl=4,ph=5;var bi=100,mh=101,gh=102,_h=103,xh=104,vh=200,yh=201,Mh=202,Sh=203,il=204,sl=205,bh=206,Eh=207,Th=208,Ah=209,wh=210,Ch=211,Rh=212,Ih=213,Ph=214,Vr=0,Hr=1,Wr=2,qi=3,$r=4,Xr=5,qr=6,Yr=7,rl=0,Lh=1,Dh=2,Cn=0,al=1,ol=2,ll=3,cl=4,hl=5,ul=6,dl=7;var fl=300,Ei=301,os=302,Sa=303,ba=304,Zr=1e3,Sn=1001,Jr=1002,Pt=1003,Nh=1004;var Xs=1005;var Wt=1006,Ea=1007;var Xn=1008;var qt=1009,pl=1010,ml=1011,ls=1012,Ta=1013,fn=1014,pn=1015,mn=1016,Aa=1017,wa=1018,Ti=1020,gl=35902,_l=35899,xl=1021,vl=1022,gn=1023,Hn=1026,qn=1027,yl=1028,Ca=1029,ui=1030,Ra=1031;var Ia=1033,qs=33776,Ys=33777,Zs=33778,Js=33779,Pa=35840,La=35841,Da=35842,Na=35843,Ua=36196,Fa=37492,Oa=37496,Ba=37488,za=37489,Ks=37490,ka=37491,Ga=37808,Va=37809,Ha=37810,Wa=37811,$a=37812,Xa=37813,qa=37814,Ya=37815,Za=37816,Ja=37817,Ka=37818,ja=37819,Qa=37820,eo=37821,to=36492,no=36494,io=36495,so=36283,ro=36284,js=36285,ao=36286;var Ts=2300,Kr=2301,zr=2302,Xo=2303,qo=2400,Yo=2401,Zo=2402;var Uh=3200;var oo=0,Fh=1,Yn="",Rt="srgb",As="srgb-linear",ws="linear",it="srgb";var kr=7680;var Oh=519,Bh=512,zh=513,kh=514,Ml=515,Gh=516,Vh=517,Sl=518,bl=519,Hh=35044;var El="300 es",nn=2e3,Yi=2001;function bd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ed(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Zi(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Wh(){let i=Zi("canvas");return i.style.display="block",i}var Gc={},Ji=null;function Tl(...i){let e="THREE."+i.shift();Ji?Ji("log",e,...i):console.log(e,...i)}function $h(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Oe(...i){i=$h(i);let e="THREE."+i.shift();if(Ji)Ji("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function ze(...i){i=$h(i);let e="THREE."+i.shift();if(Ji)Ji("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Es(...i){let e=i.join(" ");e in Gc||(Gc[e]=!0,Oe(...i))}function Xh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var qh={[Vr]:Vr,[Wr]:qr,[$r]:$r,[qi]:Xr,[Hr]:Hr,[qr]:Wr,[Yr]:Yr,[Xr]:qi},En=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Bt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Eo=Math.PI/180,jr=180/Math.PI;function Qs(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Bt[i&255]+Bt[i>>8&255]+Bt[i>>16&255]+Bt[i>>24&255]+"-"+Bt[e&255]+Bt[e>>8&255]+"-"+Bt[e>>16&15|64]+Bt[e>>24&255]+"-"+Bt[t&63|128]+Bt[t>>8&255]+"-"+Bt[t>>16&255]+Bt[t>>24&255]+Bt[n&255]+Bt[n>>8&255]+Bt[n>>16&255]+Bt[n>>24&255]).toLowerCase()}function Ke(i,e,t){return Math.max(e,Math.min(t,i))}function Td(i,e){return(i%e+e)%e}function To(i,e,t){return(1-t)*i+t*e}function Yh(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Al(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Ad(i,e){if(e.constructor===Float32Array)return i;let t=Al(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function wd(i,e){if(e.constructor===Float32Array)return i;let t=Al(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}var Pl=class Pl{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Pl.prototype.isVector2=!0;var je=Pl,Tn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],d=n[s+3],h=r[a+0],f=r[a+1],_=r[a+2],v=r[a+3];if(d!==v||l!==h||c!==f||u!==_){let m=l*h+c*f+u*_+d*v;m<0&&(h=-h,f=-f,_=-_,v=-v,m=-m);let p=1-o;if(m<.9995){let M=Math.acos(m),w=Math.sin(M);p=Math.sin(p*M)/w,o=Math.sin(o*M)/w,l=l*p+h*o,c=c*p+f*o,u=u*p+_*o,d=d*p+v*o}else{l=l*p+h*o,c=c*p+f*o,u=u*p+_*o,d=d*p+v*o;let M=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=M,c*=M,u*=M,d*=M}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],d=r[a],h=r[a+1],f=r[a+2],_=r[a+3];return e[t]=o*_+u*d+l*f-c*h,e[t+1]=l*_+u*h+c*d-o*f,e[t+2]=c*_+u*f+o*h-l*d,e[t+3]=u*_-o*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),d=o(r/2),h=l(n/2),f=l(s/2),_=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d-h*f*_;break;case"YXZ":this._x=h*u*d+c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d+h*f*_;break;case"ZXY":this._x=h*u*d-c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d-h*f*_;break;case"ZYX":this._x=h*u*d-c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d+h*f*_;break;case"YZX":this._x=h*u*d+c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d-h*f*_;break;case"XZY":this._x=h*u*d-c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d+h*f*_;break;default:Oe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+o+d;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>d){let f=2*Math.sqrt(1+n-o-d);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-n-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+d-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ke(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Ll=class Ll{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Vc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Vc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+l*c+a*d-o*u,this.y=n+l*u+o*c-r*d,this.z=s+l*d+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ao.copy(this).projectOnVector(e),this.sub(Ao)}reflect(e){return this.sub(Ao.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ll.prototype.isVector3=!0;var $=Ll,Ao=new $,Vc=new Tn,Dl=class Dl{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],_=n[8],v=s[0],m=s[3],p=s[6],M=s[1],w=s[4],E=s[7],A=s[2],b=s[5],g=s[8];return r[0]=a*v+o*M+l*A,r[3]=a*m+o*w+l*b,r[6]=a*p+o*E+l*g,r[1]=c*v+u*M+d*A,r[4]=c*m+u*w+d*b,r[7]=c*p+u*E+d*g,r[2]=h*v+f*M+_*A,r[5]=h*m+f*w+_*b,r[8]=h*p+f*E+_*g,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=u*a-o*c,h=o*l-u*r,f=c*r-a*l,_=t*d+n*h+s*f;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/_;return e[0]=d*v,e[1]=(s*c-u*n)*v,e[2]=(o*n-s*a)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Es("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(wo.makeScale(e,t)),this}rotate(e){return Es("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(wo.makeRotation(-e)),this}translate(e,t){return Es("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(wo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Dl.prototype.isMatrix3=!0;var ke=Dl,wo=new ke,Hc=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wc=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Cd(){let i={enabled:!0,workingColorSpace:As,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===it&&(s.r=Vn(s.r),s.g=Vn(s.g),s.b=Vn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===it&&(s.r=Xi(s.r),s.g=Xi(s.g),s.b=Xi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Yn?ws:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[As]:{primaries:e,whitePoint:n,transfer:ws,toXYZ:Hc,fromXYZ:Wc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Rt},outputColorSpaceConfig:{drawingBufferColorSpace:Rt}},[Rt]:{primaries:e,whitePoint:n,transfer:it,toXYZ:Hc,fromXYZ:Wc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Rt}}}),i}var Ye=Cd();function Vn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Xi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Li,Qr=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Li===void 0&&(Li=Zi("canvas")),Li.width=e.width,Li.height=e.height;let s=Li.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Li}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Zi("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Vn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Vn(t[n]/255)*255):t[n]=Vn(t[n]);return{data:t,width:e.width,height:e.height}}else return Oe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Rd=0,Ki=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Rd++}),this.uuid=Qs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Co(s[a].image)):r.push(Co(s[a]))}else r=Co(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Co(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Qr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Oe("Texture: Unable to serialize Texture."),{})}var Id=0,Ro=new $,kt=class i extends En{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Sn,s=Sn,r=Wt,a=Xn,o=gn,l=qt,c=i.DEFAULT_ANISOTROPY,u=Yn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Id++}),this.uuid=Qs(),this.name="",this.source=new Ki(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new je(0,0),this.repeat=new je(1,1),this.center=new je(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ro).x}get height(){return this.source.getSize(Ro).y}get depth(){return this.source.getSize(Ro).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Oe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==fl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Zr:e.x=e.x-Math.floor(e.x);break;case Sn:e.x=e.x<0?0:1;break;case Jr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Zr:e.y=e.y-Math.floor(e.y);break;case Sn:e.y=e.y<0?0:1;break;case Jr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};kt.DEFAULT_IMAGE=null;kt.DEFAULT_MAPPING=fl;kt.DEFAULT_ANISOTROPY=1;var Nl=class Nl{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],_=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-v)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+v)<.1&&Math.abs(_+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(c+1)/2,E=(f+1)/2,A=(p+1)/2,b=(u+h)/4,g=(d+v)/4,S=(_+m)/4;return w>E&&w>A?w<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(w),s=b/n,r=g/n):E>A?E<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(E),n=b/s,r=S/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=g/r,s=S/r),this.set(n,s,r,t),this}let M=Math.sqrt((m-_)*(m-_)+(d-v)*(d-v)+(h-u)*(h-u));return Math.abs(M)<.001&&(M=1),this.x=(m-_)/M,this.y=(d-v)/M,this.z=(h-u)/M,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this.w=Ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this.w=Ke(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Nl.prototype.isVector4=!0;var pt=Nl,ea=class extends En{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Wt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new pt(0,0,e,t),this.scissorTest=!1,this.viewport=new pt(0,0,e,t),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new kt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Wt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ki(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Jt=class extends ea{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Cs=class extends kt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ta=class extends kt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Ma=class Ma{constructor(e,t,n,s,r,a,o,l,c,u,d,h,f,_,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,d,h,f,_,v,m)}set(e,t,n,s,r,a,o,l,c,u,d,h,f,_,v,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=d,p[14]=h,p[3]=f,p[7]=_,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ma().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Di.setFromMatrixColumn(e,0).length(),r=1/Di.setFromMatrixColumn(e,1).length(),a=1/Di.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let h=a*u,f=a*d,_=o*u,v=o*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+_*c,t[5]=h-v*c,t[9]=-o*l,t[2]=v-h*c,t[6]=_+f*c,t[10]=a*l}else if(e.order==="YXZ"){let h=l*u,f=l*d,_=c*u,v=c*d;t[0]=h+v*o,t[4]=_*o-f,t[8]=a*c,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=f*o-_,t[6]=v+h*o,t[10]=a*l}else if(e.order==="ZXY"){let h=l*u,f=l*d,_=c*u,v=c*d;t[0]=h-v*o,t[4]=-a*d,t[8]=_+f*o,t[1]=f+_*o,t[5]=a*u,t[9]=v-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let h=a*u,f=a*d,_=o*u,v=o*d;t[0]=l*u,t[4]=_*c-f,t[8]=h*c+v,t[1]=l*d,t[5]=v*c+h,t[9]=f*c-_,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let h=a*l,f=a*c,_=o*l,v=o*c;t[0]=l*u,t[4]=v-h*d,t[8]=_*d+f,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*d+_,t[10]=h-v*d}else if(e.order==="XZY"){let h=a*l,f=a*c,_=o*l,v=o*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+v,t[5]=a*u,t[9]=f*d-_,t[2]=_*d-f,t[6]=o*u,t[10]=v*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Pd,e,Ld)}lookAt(e,t,n){let s=this.elements;return Yt.subVectors(e,t),Yt.lengthSq()===0&&(Yt.z=1),Yt.normalize(),jn.crossVectors(n,Yt),jn.lengthSq()===0&&(Math.abs(n.z)===1?Yt.x+=1e-4:Yt.z+=1e-4,Yt.normalize(),jn.crossVectors(n,Yt)),jn.normalize(),vr.crossVectors(Yt,jn),s[0]=jn.x,s[4]=vr.x,s[8]=Yt.x,s[1]=jn.y,s[5]=vr.y,s[9]=Yt.y,s[2]=jn.z,s[6]=vr.z,s[10]=Yt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],_=n[2],v=n[6],m=n[10],p=n[14],M=n[3],w=n[7],E=n[11],A=n[15],b=s[0],g=s[4],S=s[8],N=s[12],I=s[1],R=s[5],U=s[9],H=s[13],C=s[2],O=s[6],X=s[10],F=s[14],ne=s[3],V=s[7],ee=s[11],se=s[15];return r[0]=a*b+o*I+l*C+c*ne,r[4]=a*g+o*R+l*O+c*V,r[8]=a*S+o*U+l*X+c*ee,r[12]=a*N+o*H+l*F+c*se,r[1]=u*b+d*I+h*C+f*ne,r[5]=u*g+d*R+h*O+f*V,r[9]=u*S+d*U+h*X+f*ee,r[13]=u*N+d*H+h*F+f*se,r[2]=_*b+v*I+m*C+p*ne,r[6]=_*g+v*R+m*O+p*V,r[10]=_*S+v*U+m*X+p*ee,r[14]=_*N+v*H+m*F+p*se,r[3]=M*b+w*I+E*C+A*ne,r[7]=M*g+w*R+E*O+A*V,r[11]=M*S+w*U+E*X+A*ee,r[15]=M*N+w*H+E*F+A*se,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],_=e[3],v=e[7],m=e[11],p=e[15],M=l*f-c*h,w=o*f-c*d,E=o*h-l*d,A=a*f-c*u,b=a*h-l*u,g=a*d-o*u;return t*(v*M-m*w+p*E)-n*(_*M-m*A+p*b)+s*(_*w-v*A+p*g)-r*(_*E-v*b+m*g)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],_=e[12],v=e[13],m=e[14],p=e[15],M=t*o-n*a,w=t*l-s*a,E=t*c-r*a,A=n*l-s*o,b=n*c-r*o,g=s*c-r*l,S=u*v-d*_,N=u*m-h*_,I=u*p-f*_,R=d*m-h*v,U=d*p-f*v,H=h*p-f*m,C=M*H-w*U+E*R+A*I-b*N+g*S;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/C;return e[0]=(o*H-l*U+c*R)*O,e[1]=(s*U-n*H-r*R)*O,e[2]=(v*g-m*b+p*A)*O,e[3]=(h*b-d*g-f*A)*O,e[4]=(l*I-a*H-c*N)*O,e[5]=(t*H-s*I+r*N)*O,e[6]=(m*E-_*g-p*w)*O,e[7]=(u*g-h*E+f*w)*O,e[8]=(a*U-o*I+c*S)*O,e[9]=(n*I-t*U-r*S)*O,e[10]=(_*b-v*E+p*M)*O,e[11]=(d*E-u*b-f*M)*O,e[12]=(o*N-a*R-l*S)*O,e[13]=(t*R-n*N+s*S)*O,e[14]=(v*w-_*A-m*M)*O,e[15]=(u*A-d*w+h*M)*O,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,d=o+o,h=r*c,f=r*u,_=r*d,v=a*u,m=a*d,p=o*d,M=l*c,w=l*u,E=l*d,A=n.x,b=n.y,g=n.z;return s[0]=(1-(v+p))*A,s[1]=(f+E)*A,s[2]=(_-w)*A,s[3]=0,s[4]=(f-E)*b,s[5]=(1-(h+p))*b,s[6]=(m+M)*b,s[7]=0,s[8]=(_+w)*g,s[9]=(m-M)*g,s[10]=(1-(h+v))*g,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Di.set(s[0],s[1],s[2]).length(),o=Di.set(s[4],s[5],s[6]).length(),l=Di.set(s[8],s[9],s[10]).length();r<0&&(a=-a),ln.copy(this);let c=1/a,u=1/o,d=1/l;return ln.elements[0]*=c,ln.elements[1]*=c,ln.elements[2]*=c,ln.elements[4]*=u,ln.elements[5]*=u,ln.elements[6]*=u,ln.elements[8]*=d,ln.elements[9]*=d,ln.elements[10]*=d,t.setFromRotationMatrix(ln),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=nn,l=!1){let c=this.elements,u=2*r/(t-e),d=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s),_,v;if(l)_=r/(a-r),v=a*r/(a-r);else if(o===nn)_=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Yi)_=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=nn,l=!1){let c=this.elements,u=2/(t-e),d=2/(n-s),h=-(t+e)/(t-e),f=-(n+s)/(n-s),_,v;if(l)_=1/(a-r),v=a/(a-r);else if(o===nn)_=-2/(a-r),v=-(a+r)/(a-r);else if(o===Yi)_=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Ma.prototype.isMatrix4=!0;var ft=Ma,Di=new $,ln=new ft,Pd=new $(0,0,0),Ld=new $(1,1,1),jn=new $,vr=new $,Yt=new $,$c=new ft,Xc=new Tn,Wn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ke(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ke(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Oe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return $c.makeRotationFromQuaternion(e),this.setFromRotationMatrix($c,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xc.setFromEuler(this),this.setFromQuaternion(Xc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wn.DEFAULT_ORDER="XYZ";var Rs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Dd=0,qc=new $,Ni=new Tn,Fn=new ft,yr=new $,ys=new $,Nd=new $,Ud=new Tn,Yc=new $(1,0,0),Zc=new $(0,1,0),Jc=new $(0,0,1),Kc={type:"added"},Fd={type:"removed"},Ui={type:"childadded",child:null},Io={type:"childremoved",child:null},$t=class i extends En{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Dd++}),this.uuid=Qs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new $,t=new Wn,n=new Tn,s=new $(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ft},normalMatrix:{value:new ke}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Rs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ni.setFromAxisAngle(e,t),this.quaternion.multiply(Ni),this}rotateOnWorldAxis(e,t){return Ni.setFromAxisAngle(e,t),this.quaternion.premultiply(Ni),this}rotateX(e){return this.rotateOnAxis(Yc,e)}rotateY(e){return this.rotateOnAxis(Zc,e)}rotateZ(e){return this.rotateOnAxis(Jc,e)}translateOnAxis(e,t){return qc.copy(e).applyQuaternion(this.quaternion),this.position.add(qc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Yc,e)}translateY(e){return this.translateOnAxis(Zc,e)}translateZ(e){return this.translateOnAxis(Jc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Fn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?yr.copy(e):yr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Fn.lookAt(ys,yr,this.up):Fn.lookAt(yr,ys,this.up),this.quaternion.setFromRotationMatrix(Fn),s&&(Fn.extractRotation(s.matrixWorld),Ni.setFromRotationMatrix(Fn),this.quaternion.premultiply(Ni.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ze("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Kc),Ui.child=e,this.dispatchEvent(Ui),Ui.child=null):ze("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Fd),Io.child=e,this.dispatchEvent(Io),Io.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Fn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Fn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Fn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Kc),Ui.child=e,this.dispatchEvent(Ui),Ui.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,e,Nd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,Ud,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),d=a(e.shapes),h=a(e.skeletons),f=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};$t.DEFAULT_UP=new $(0,1,0);$t.DEFAULT_MATRIX_AUTO_UPDATE=!0;$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Gn=class extends $t{constructor(){super(),this.isGroup=!0,this.type="Group"}},Od={type:"move"},ji=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Gn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Gn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new $,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new $),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Gn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new $,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new $,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let v of e.hand.values()){let m=t.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,_=.005;c.inputState.pinching&&h>f+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Od)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Gn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Zh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Qn={h:0,s:0,l:0},Mr={h:0,s:0,l:0};function Po(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ze=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Rt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ye.workingColorSpace){if(e=Td(e,1),t=Ke(t,0,1),n=Ke(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Po(a,r,e+1/3),this.g=Po(a,r,e),this.b=Po(a,r,e-1/3)}return Ye.colorSpaceToWorking(this,s),this}setStyle(e,t=Rt){function n(r){r!==void 0&&parseFloat(r)<1&&Oe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Oe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Oe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Rt){let n=Zh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Oe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Vn(e.r),this.g=Vn(e.g),this.b=Vn(e.b),this}copyLinearToSRGB(e){return this.r=Xi(e.r),this.g=Xi(e.g),this.b=Xi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Rt){return Ye.workingToColorSpace(zt.copy(this),e),Math.round(Ke(zt.r*255,0,255))*65536+Math.round(Ke(zt.g*255,0,255))*256+Math.round(Ke(zt.b*255,0,255))}getHexString(e=Rt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.workingToColorSpace(zt.copy(this),t);let n=zt.r,s=zt.g,r=zt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ye.workingColorSpace){return Ye.workingToColorSpace(zt.copy(this),t),e.r=zt.r,e.g=zt.g,e.b=zt.b,e}getStyle(e=Rt){Ye.workingToColorSpace(zt.copy(this),e);let t=zt.r,n=zt.g,s=zt.b;return e!==Rt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Qn),this.setHSL(Qn.h+e,Qn.s+t,Qn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Qn),e.getHSL(Mr);let n=To(Qn.h,Mr.h,t),s=To(Qn.s,Mr.s,t),r=To(Qn.l,Mr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},zt=new Ze;Ze.NAMES=Zh;var Is=class extends $t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wn,this.environmentIntensity=1,this.environmentRotation=new Wn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},cn=new $,On=new $,Lo=new $,Bn=new $,Fi=new $,Oi=new $,jc=new $,Do=new $,No=new $,Uo=new $,Fo=new pt,Oo=new pt,Bo=new pt,ii=class i{constructor(e=new $,t=new $,n=new $){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),cn.subVectors(e,t),s.cross(cn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){cn.subVectors(s,t),On.subVectors(n,t),Lo.subVectors(e,t);let a=cn.dot(cn),o=cn.dot(On),l=cn.dot(Lo),c=On.dot(On),u=On.dot(Lo),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let h=1/d,f=(c*l-o*u)*h,_=(a*u-o*l)*h;return r.set(1-f-_,_,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Bn)===null?!1:Bn.x>=0&&Bn.y>=0&&Bn.x+Bn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Bn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Bn.x),l.addScaledVector(a,Bn.y),l.addScaledVector(o,Bn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Fo.setScalar(0),Oo.setScalar(0),Bo.setScalar(0),Fo.fromBufferAttribute(e,t),Oo.fromBufferAttribute(e,n),Bo.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Fo,r.x),a.addScaledVector(Oo,r.y),a.addScaledVector(Bo,r.z),a}static isFrontFacing(e,t,n,s){return cn.subVectors(n,t),On.subVectors(e,t),cn.cross(On).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return cn.subVectors(this.c,this.b),On.subVectors(this.a,this.b),cn.cross(On).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Fi.subVectors(s,n),Oi.subVectors(r,n),Do.subVectors(e,n);let l=Fi.dot(Do),c=Oi.dot(Do);if(l<=0&&c<=0)return t.copy(n);No.subVectors(e,s);let u=Fi.dot(No),d=Oi.dot(No);if(u>=0&&d<=u)return t.copy(s);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return a=l/(l-u),t.copy(n).addScaledVector(Fi,a);Uo.subVectors(e,r);let f=Fi.dot(Uo),_=Oi.dot(Uo);if(_>=0&&f<=_)return t.copy(r);let v=f*c-l*_;if(v<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(n).addScaledVector(Oi,o);let m=u*_-f*d;if(m<=0&&d-u>=0&&f-_>=0)return jc.subVectors(r,s),o=(d-u)/(d-u+(f-_)),t.copy(s).addScaledVector(jc,o);let p=1/(m+v+h);return a=v*p,o=h*p,t.copy(n).addScaledVector(Fi,a).addScaledVector(Oi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},si=class{constructor(e=new $(1/0,1/0,1/0),t=new $(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(hn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(hn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=hn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,hn):hn.fromBufferAttribute(r,a),hn.applyMatrix4(e.matrixWorld),this.expandByPoint(hn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Sr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Sr.copy(n.boundingBox)),Sr.applyMatrix4(e.matrixWorld),this.union(Sr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,hn),hn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ms),br.subVectors(this.max,Ms),Bi.subVectors(e.a,Ms),zi.subVectors(e.b,Ms),ki.subVectors(e.c,Ms),ei.subVectors(zi,Bi),ti.subVectors(ki,zi),xi.subVectors(Bi,ki);let t=[0,-ei.z,ei.y,0,-ti.z,ti.y,0,-xi.z,xi.y,ei.z,0,-ei.x,ti.z,0,-ti.x,xi.z,0,-xi.x,-ei.y,ei.x,0,-ti.y,ti.x,0,-xi.y,xi.x,0];return!zo(t,Bi,zi,ki,br)||(t=[1,0,0,0,1,0,0,0,1],!zo(t,Bi,zi,ki,br))?!1:(Er.crossVectors(ei,ti),t=[Er.x,Er.y,Er.z],zo(t,Bi,zi,ki,br))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,hn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(hn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(zn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),zn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),zn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),zn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),zn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),zn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),zn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),zn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(zn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},zn=[new $,new $,new $,new $,new $,new $,new $,new $],hn=new $,Sr=new si,Bi=new $,zi=new $,ki=new $,ei=new $,ti=new $,xi=new $,Ms=new $,br=new $,Er=new $,vi=new $;function zo(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){vi.fromArray(i,r);let o=s.x*Math.abs(vi.x)+s.y*Math.abs(vi.y)+s.z*Math.abs(vi.z),l=e.dot(vi),c=t.dot(vi),u=n.dot(vi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var vt=new $,Tr=new je,Bd=0,bn=class extends En{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Bd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Hh,this.updateRanges=[],this.gpuType=pn,this.version=0,this._normalizationScale=e!==void 0?Al(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Tr.fromBufferAttribute(this,t),Tr.applyMatrix3(e),this.setXY(t,Tr.x,Tr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Ad(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):wd(e,this.array)}};var Ps=class extends bn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ls=class extends bn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var It=class extends bn{constructor(e,t,n){super(new Float32Array(e),t,n)}},zd=new si,Ss=new $,ko=new $,Qi=class{constructor(e=new $,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):zd.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ss.subVectors(e,this.center);let t=Ss.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ss,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ko.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ss.copy(e.center).add(ko)),this.expandByPoint(Ss.copy(e.center).sub(ko))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},kd=0,tn=new ft,Go=new $t,Gi=new $,Zt=new si,bs=new si,Ct=new $,dn=class i extends En{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=Qs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(bd(e)?Ls:Ps)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ke().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,n){return tn.makeTranslation(e,t,n),this.applyMatrix4(tn),this}scale(e,t,n){return tn.makeScale(e,t,n),this.applyMatrix4(tn),this}lookAt(e){return Go.lookAt(e),Go.updateMatrix(),this.applyMatrix4(Go.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gi).negate(),this.translate(Gi.x,Gi.y,Gi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new It(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Oe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new si);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ze("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new $(-1/0,-1/0,-1/0),new $(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Zt.setFromBufferAttribute(r),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,Zt.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,Zt.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(Zt.min),this.boundingBox.expandByPoint(Zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ze('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ze("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new $,1/0);return}if(e){let n=this.boundingSphere.center;if(Zt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];bs.setFromBufferAttribute(o),this.morphTargetsRelative?(Ct.addVectors(Zt.min,bs.min),Zt.expandByPoint(Ct),Ct.addVectors(Zt.max,bs.max),Zt.expandByPoint(Ct)):(Zt.expandByPoint(bs.min),Zt.expandByPoint(bs.max))}Zt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Ct.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ct));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ct.fromBufferAttribute(o,c),l&&(Gi.fromBufferAttribute(e,c),Ct.add(Gi)),s=Math.max(s,n.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ze('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ze("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new bn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[],c=new Uint8Array(n.count);for(let N=0;N<n.count;N++)o[N]=new $,l[N]=new $;let u=new $,d=new $,h=new $,f=new je,_=new je,v=new je,m=new $,p=new $;function M(N,I,R){c[N]=c[I]=c[R]=1,u.fromBufferAttribute(n,N),d.fromBufferAttribute(n,I),h.fromBufferAttribute(n,R),f.fromBufferAttribute(r,N),_.fromBufferAttribute(r,I),v.fromBufferAttribute(r,R),d.sub(u),h.sub(u),_.sub(f),v.sub(f);let U=1/(_.x*v.y-v.x*_.y);isFinite(U)&&(m.copy(d).multiplyScalar(v.y).addScaledVector(h,-_.y).multiplyScalar(U),p.copy(h).multiplyScalar(_.x).addScaledVector(d,-v.x).multiplyScalar(U),o[N].add(m),o[I].add(m),o[R].add(m),l[N].add(p),l[I].add(p),l[R].add(p))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let N=0,I=w.length;N<I;++N){let R=w[N],U=R.start,H=R.count;for(let C=U,O=U+H;C<O;C+=3)M(e.getX(C+0),e.getX(C+1),e.getX(C+2))}let E=new $,A=new $,b=new $,g=new $;function S(N){b.fromBufferAttribute(s,N),g.copy(b);let I=o[N];E.copy(I),E.sub(b.multiplyScalar(b.dot(I))).normalize(),A.crossVectors(g,I);let U=A.dot(l[N])<0?-1:1;a.setXYZW(N,E.x,E.y,E.z,U)}for(let N=0,I=n.count;N<I;++N)c[N]&&S(N);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new bn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let s=new $,r=new $,a=new $,o=new $,l=new $,c=new $,u=new $,d=new $;if(e)for(let h=0,f=e.count;h<f;h+=3){let _=e.getX(h+0),v=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ct.fromBufferAttribute(e,t),Ct.normalize(),e.setXYZ(t,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u),f=0,_=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*u;for(let p=0;p<u;p++)h[_++]=c[f++]}return new bn(h,u,d)}if(this.index===null)return Oe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){let h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],d=r[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Vo=new $,Gd=new $,Vd=new ke,un=class{constructor(e=new $(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Vo.subVectors(n,t).cross(Gd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Vo),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Vd.getNormalMatrix(e),s=this.coplanarPoint(Vo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Hd=0,ri=class extends En{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Hd++}),this.uuid=Qs(),this.name="",this.type="Material",this.blending=as,this.side=hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=il,this.blendDst=sl,this.blendEquation=bi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=qi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Oh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=kr,this.stencilZFail=kr,this.stencilZPass=kr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Oe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ze().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new un().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new je().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new je().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var kn=new $,Ho=new $,Ar=new $,wr=new $,na=class{constructor(e=new $,t=new $(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,kn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=kn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(kn.copy(this.origin).addScaledVector(this.direction,t),kn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Ho.copy(e).add(t).multiplyScalar(.5),Ar.copy(t).sub(e).normalize(),wr.copy(this.origin).sub(Ho);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Ar),o=wr.dot(this.direction),l=-wr.dot(Ar),c=wr.lengthSq(),u=Math.abs(1-a*a),d,h,f,_;if(u>0)if(d=a*l-o,h=a*o-l,_=r*u,d>=0)if(h>=-_)if(h<=_){let v=1/u;d*=v,h*=v,f=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h<=-_?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c):h<=_?(d=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Ho).addScaledVector(Ar,h),f}intersectSphere(e,t){if(e.radius<0)return null;kn.subVectors(e.center,this.origin);let n=kn.dot(this.direction),s=kn.dot(kn)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(o=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,kn)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,d=e.x-a.x,h=e.y-a.y,f=e.z-a.z,_=t.x-a.x,v=t.y-a.y,m=t.z-a.z,p=n.x-a.x,M=n.y-a.y,w=n.z-a.z,E=Math.abs(l),A=Math.abs(c),b=Math.abs(u),g,S,N,I,R,U,H,C,O,X,F,ne;if(E>=A&&E>=b?(N=l,U=d,O=_,ne=p,l>=0?(g=c,S=u,I=h,R=f,H=v,C=m,X=M,F=w):(g=u,S=c,I=f,R=h,H=m,C=v,X=w,F=M)):A>=b?(N=c,U=h,O=v,ne=M,c>=0?(g=u,S=l,I=f,R=d,H=m,C=_,X=w,F=p):(g=l,S=u,I=d,R=f,H=_,C=m,X=p,F=w)):(N=u,U=f,O=m,ne=w,u>=0?(g=l,S=c,I=d,R=h,H=_,C=v,X=p,F=M):(g=c,S=l,I=h,R=d,H=v,C=_,X=M,F=p)),N===0)return null;let V=g/N,ee=S/N,se=1/N,Ee=I-V*U,Te=R-ee*U,Z=H-V*O,q=C-ee*O,Q=X-V*ne,pe=F-ee*ne,oe=Q*q-pe*Z,Pe=Ee*pe-Te*Q,tt=Z*Te-q*Ee;if(s){if(oe<0||Pe<0||tt<0)return null}else if((oe<0||Pe<0||tt<0)&&(oe>0||Pe>0||tt>0))return null;let Re=oe+Pe+tt;if(Re===0)return null;let G=se*(oe*U+Pe*O+tt*ne);return(Re>0?G<0:G>0)?null:this.at(G/Re,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ia=class extends ri{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.combine=rl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Qc=new ft,yi=new na,Cr=new Qi,eh=new $,Rr=new $,Ir=new $,Pr=new $,Wo=new $,Lr=new $,th=new $,Dr=new $,Kt=class extends $t{constructor(e=new dn,t=new ia){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Lr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],d=r[l];u!==0&&(Wo.fromBufferAttribute(d,e),a?Lr.addScaledVector(Wo,u):Lr.addScaledVector(Wo.sub(t),u))}t.add(Lr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Cr.copy(n.boundingSphere),Cr.applyMatrix4(r),yi.copy(e.ray).recast(e.near),!(Cr.containsPoint(yi.origin)===!1&&(yi.intersectSphere(Cr,eh)===null||yi.origin.distanceToSquared(eh)>(e.far-e.near)**2))&&(Qc.copy(r).invert(),yi.copy(e.ray).applyMatrix4(Qc),!(n.boundingBox!==null&&yi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,yi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,v=h.length;_<v;_++){let m=h[_],p=a[m.materialIndex],M=Math.max(m.start,f.start),w=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let E=M,A=w;E<A;E+=3){let b=o.getX(E),g=o.getX(E+1),S=o.getX(E+2);s=Nr(this,p,e,n,c,u,d,b,g,S),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let m=_,p=v;m<p;m+=3){let M=o.getX(m),w=o.getX(m+1),E=o.getX(m+2);s=Nr(this,a,e,n,c,u,d,M,w,E),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,v=h.length;_<v;_++){let m=h[_],p=a[m.materialIndex],M=Math.max(m.start,f.start),w=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let E=M,A=w;E<A;E+=3){let b=E,g=E+1,S=E+2;s=Nr(this,p,e,n,c,u,d,b,g,S),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=_,p=v;m<p;m+=3){let M=m,w=m+1,E=m+2;s=Nr(this,a,e,n,c,u,d,M,w,E),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Wd(i,e,t,n,s,r,a,o){let l;if(e.side===Xt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===hi,o),l===null)return null;Dr.copy(o),Dr.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Dr);return c<t.near||c>t.far?null:{distance:c,point:Dr.clone(),object:i}}function Nr(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Rr),i.getVertexPosition(l,Ir),i.getVertexPosition(c,Pr);let u=Wd(i,e,t,n,Rr,Ir,Pr,th);if(u){let d=new $;ii.getBarycoord(th,Rr,Ir,Pr,d),s&&(u.uv=ii.getInterpolatedAttribute(s,o,l,c,d,new je)),r&&(u.uv1=ii.getInterpolatedAttribute(r,o,l,c,d,new je)),a&&(u.normal=ii.getInterpolatedAttribute(a,o,l,c,d,new $),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new $,materialIndex:0};ii.getNormal(Rr,Ir,Pr,h.normal),u.face=h,u.barycoord=d}return u}var sa=class extends kt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Pt,u=Pt,d,h){super(null,a,o,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Mi=new Qi,$d=new je(.5,.5),Ur=new $,ai=class{constructor(e=new un,t=new un,n=new un,s=new un,r=new un,a=new un){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=nn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],f=r[7],_=r[8],v=r[9],m=r[10],p=r[11],M=r[12],w=r[13],E=r[14],A=r[15];if(s[0].setComponents(c-a,f-u,p-_,A-M).normalize(),s[1].setComponents(c+a,f+u,p+_,A+M).normalize(),s[2].setComponents(c+o,f+d,p+v,A+w).normalize(),s[3].setComponents(c-o,f-d,p-v,A-w).normalize(),n)s[4].setComponents(l,h,m,E).normalize(),s[5].setComponents(c-l,f-h,p-m,A-E).normalize();else if(s[4].setComponents(c-l,f-h,p-m,A-E).normalize(),t===nn)s[5].setComponents(c+l,f+h,p+m,A+E).normalize();else if(t===Yi)s[5].setComponents(l,h,m,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Mi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Mi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Mi)}intersectsSprite(e){Mi.center.set(0,0,0);let t=$d.distanceTo(e.center);return Mi.radius=.7071067811865476+t,Mi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Mi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Ur.x=s.normal.x>0?e.max.x:e.min.x,Ur.y=s.normal.y>0?e.max.y:e.min.y,Ur.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ur)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},nh=new ft,ra=class i{constructor(){this.coordinateSystem=nn,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];nh.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new ai),n[s].setFromProjectionMatrix(nh,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new ai),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};var Ds=class extends kt{constructor(e=[],t=Ei,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ns=class extends kt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var $n=class extends kt{constructor(e,t,n=fn,s,r,a,o=Pt,l=Pt,c,u=Hn,d=1){if(u!==Hn&&u!==qn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:d};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ki(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Us=class extends $n{constructor(e,t=fn,n=Ei,s,r,a=Pt,o=Pt,l,c=Hn){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Fs=class extends kt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},es=class i extends dn{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],d=[],h=0,f=0;_("z","y","x",-1,-1,n,t,e,a,r,0),_("z","y","x",1,-1,n,t,-e,a,r,1),_("x","z","y",1,1,e,n,t,s,a,2),_("x","z","y",1,-1,e,n,-t,s,a,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new It(c,3)),this.setAttribute("normal",new It(u,3)),this.setAttribute("uv",new It(d,2));function _(v,m,p,M,w,E,A,b,g,S,N){let I=E/g,R=A/S,U=E/2,H=A/2,C=b/2,O=g+1,X=S+1,F=0,ne=0,V=new $;for(let ee=0;ee<X;ee++){let se=ee*R-H;for(let Ee=0;Ee<O;Ee++){let Te=Ee*I-U;V[v]=Te*M,V[m]=se*w,V[p]=C,c.push(V.x,V.y,V.z),V[v]=0,V[m]=0,V[p]=b>0?1:-1,u.push(V.x,V.y,V.z),d.push(Ee/g),d.push(1-ee/S),F+=1}}for(let ee=0;ee<S;ee++)for(let se=0;se<g;se++){let Ee=h+se+O*ee,Te=h+se+O*(ee+1),Z=h+(se+1)+O*(ee+1),q=h+(se+1)+O*ee;l.push(Ee,Te,q),l.push(Te,Z,q),ne+=6}o.addGroup(f,ne,N),f+=ne,h+=F}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Os=class i extends dn{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,d=e/o,h=t/l,f=[],_=[],v=[],m=[];for(let p=0;p<u;p++){let M=p*h-a;for(let w=0;w<c;w++){let E=w*d-r;_.push(E,-M,0),v.push(0,0,1),m.push(w/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){let w=M+c*p,E=M+c*(p+1),A=M+1+c*(p+1),b=M+1+c*p;f.push(w,E,b),f.push(E,A,b)}this.setIndex(f),this.setAttribute("position",new It(_,3)),this.setAttribute("normal",new It(v,3)),this.setAttribute("uv",new It(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Bs=class i extends dn{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],d=new $,h=new $,f=[],_=[],v=[],m=[];for(let p=0;p<=n;p++){let M=[],w=p/n,E=a+w*o,A=e*Math.cos(E),b=Math.sqrt(e*e-A*A),g=0;p===0&&a===0?g=.5/t:p===n&&l===Math.PI&&(g=-.5/t);for(let S=0;S<=t;S++){let N=S/t,I=s+N*r;d.x=-b*Math.cos(I),d.y=A,d.z=b*Math.sin(I),_.push(d.x,d.y,d.z),h.copy(d).normalize(),v.push(h.x,h.y,h.z),m.push(N+g,1-w),M.push(c++)}u.push(M)}for(let p=0;p<n;p++)for(let M=0;M<t;M++){let w=u[p][M+1],E=u[p][M],A=u[p+1][M],b=u[p+1][M+1];(p!==0||a>0)&&f.push(w,E,b),(p!==n-1||l<Math.PI)&&f.push(E,A,b)}this.setIndex(f),this.setAttribute("position",new It(_,3)),this.setAttribute("normal",new It(v,3)),this.setAttribute("uv",new It(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Ai(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(ih(s))s.isRenderTargetTexture?(Oe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(ih(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Gt(i){let e={};for(let t=0;t<i.length;t++){let n=Ai(i[t]);for(let s in n)e[s]=n[s]}return e}function ih(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Xd(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function wl(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}var Jh={clone:Ai,merge:Gt},qd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,An=class extends ri{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=qd,this.fragmentShader=Yd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ai(e.uniforms),this.uniformsGroups=Xd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ze().setHex(s.value);break;case"v2":this.uniforms[n].value=new je().fromArray(s.value);break;case"v3":this.uniforms[n].value=new $().fromArray(s.value);break;case"v4":this.uniforms[n].value=new pt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ke().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ft().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},aa=class extends An{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},ts=class extends ri{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=oo,this.normalScale=new je(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var oa=class extends ri{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Uh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},la=class extends ri{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Vi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Fr(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var oi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ca=class extends oi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:qo,endingEnd:qo}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Yo:r=e,o=2*t-n;break;case Zo:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Yo:a=e,l=2*n-t;break;case Zo:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,_=(n-t)/(s-t),v=_*_,m=v*_,p=-h*m+2*h*v-h*_,M=(1+h)*m+(-1.5-2*h)*v+(-.5+h)*_+1,w=(-1-f)*m+(1.5+f)*v+.5*_,E=f*m-f*v;for(let A=0;A!==o;++A)r[A]=p*a[u+A]+M*a[c+A]+w*a[l+A]+E*a[d+A];return r}},ha=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),d=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*d+a[l+h]*u;return r}},ua=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},da=class extends oi{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,d=this.outTangents;if(!u||!d){let _=(n-t)/(s-t),v=1-_;for(let m=0;m!==o;++m)r[m]=a[c+m]*v+a[l+m]*_;return r}let h=o*2,f=e-1;for(let _=0;_!==o;++_){let v=a[c+_],m=a[l+_],p=f*h+_*2,M=d[p],w=d[p+1],E=e*h+_*2,A=u[E],b=u[E+1],g=Jd(n,t,M,A,s);r[_]=Kh(g,v,w,b,m)}return r}};function Kh(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Zd(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Jd(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=Kh(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Zd(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var jt=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Vi(t,this.TimeBufferType),this.values=Vi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Vi(e.times,Array),values:Vi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Fr(e.settings)&&(n.settings={inTangents:Vi(e.settings.inTangents,Array),outTangents:Vi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ua(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ha(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ca(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new da(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ts:t=this.InterpolantFactoryMethodDiscrete;break;case Kr:t=this.InterpolantFactoryMethodLinear;break;case zr:t=this.InterpolantFactoryMethodSmooth;break;case Xo:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Oe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ts;case this.InterpolantFactoryMethodLinear:return Kr;case this.InterpolantFactoryMethodSmooth:return zr;case this.InterpolantFactoryMethodBezier:return Xo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;Fr(this.settings)&&(sh(this.settings.inTangents,e),sh(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Fr(this.settings)&&(rh(this.settings.inTangents,e),rh(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ze("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(ze("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){ze("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){ze("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Ed(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){ze("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===zr,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let d=o*n,h=d-n,f=d+n;for(let _=0;_!==n;++_){let v=t[d+_];if(v!==t[h+_]||v!==t[f+_]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*n,h=a*n;for(let f=0;f!==n;++f)t[h+f]=t[d+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Fr(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function sh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function rh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}jt.prototype.ValueTypeName="";jt.prototype.TimeBufferType=Float32Array;jt.prototype.ValueBufferType=Float32Array;jt.prototype.DefaultInterpolation=Kr;var li=class extends jt{constructor(e,t,n){super(e,t,n)}};li.prototype.ValueTypeName="bool";li.prototype.ValueBufferType=Array;li.prototype.DefaultInterpolation=Ts;li.prototype.InterpolantFactoryMethodLinear=void 0;li.prototype.InterpolantFactoryMethodSmooth=void 0;var fa=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}};fa.prototype.ValueTypeName="color";var pa=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}};pa.prototype.ValueTypeName="number";var ma=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)Tn.slerpFlat(r,0,a,c-o,a,c,l);return r}},zs=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ma(this.times,this.values,this.getValueSize(),e)}};zs.prototype.ValueTypeName="quaternion";zs.prototype.InterpolantFactoryMethodSmooth=void 0;var ci=class extends jt{constructor(e,t,n){super(e,t,n)}};ci.prototype.ValueTypeName="string";ci.prototype.ValueBufferType=Array;ci.prototype.DefaultInterpolation=Ts;ci.prototype.InterpolantFactoryMethodLinear=void 0;ci.prototype.InterpolantFactoryMethodSmooth=void 0;var ga=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}};ga.prototype.ValueTypeName="vector";var Gr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(ah(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!ah(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function ah(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var _a=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let f=c[d],_=c[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},jh=new _a,ns=class{constructor(e){this.manager=e!==void 0?e:jh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};ns.DEFAULT_MATERIAL_NAME="__DEFAULT";var Hi=new WeakMap,xa=class extends ns{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Gr.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let d=Hi.get(a);d===void 0&&(d=[],Hi.set(a,d)),d.push({onLoad:t,onError:s})}return a}let o=Zi("img");function l(){u(),t&&t(this);let d=Hi.get(this)||[];for(let h=0;h<d.length;h++){let f=d[h];f.onLoad&&f.onLoad(this)}Hi.delete(this),r.manager.itemEnd(e)}function c(d){u(),s&&s(d),Gr.remove(`image:${e}`);let h=Hi.get(this)||[];for(let f=0;f<h.length;f++){let _=h[f];_.onError&&_.onError(d)}Hi.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Gr.add(`image:${e}`,o),r.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}};var is=class extends ns{constructor(e){super(e)}load(e,t,n,s){let r=new kt,a=new xa(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},ks=class extends $t{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}};var $o=new ft,oh=new $,lh=new $,va=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new je(512,512),this.mapType=qt,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ai,this._frameExtents=new je(1,1),this._viewportCount=1,this._viewports=[new pt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;oh.setFromMatrixPosition(e.matrixWorld),t.position.copy(oh),lh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(lh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){$o.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix($o,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Yi||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply($o)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Or=new $,Br=new Tn,Mn=new $,Gs=class extends $t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Or,Br,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Or,Br,Mn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Or,Br,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Or,Br,Mn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ni=new $,ch=new je,hh=new je,Ht=class extends Gs{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=jr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Eo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return jr*2*Math.atan(Math.tan(Eo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ni.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ni.x,ni.y).multiplyScalar(-e/ni.z),ni.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ni.x,ni.y).multiplyScalar(-e/ni.z)}getViewSize(e,t){return this.getViewBounds(e,ch,hh),t.subVectors(hh,ch)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Eo*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Vs=class extends Gs{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Jo=class extends va{constructor(){super(new Vs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Hs=class extends ks{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy($t.DEFAULT_UP),this.updateMatrix(),this.target=new $t,this.shadow=new Jo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Ws=class extends ks{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Wi=-90,$i=1,ss=class extends $t{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ht(Wi,$i,e,t);s.layers=this.layers,this.add(s);let r=new Ht(Wi,$i,e,t);r.layers=this.layers,this.add(r);let a=new Ht(Wi,$i,e,t);a.layers=this.layers,this.add(a);let o=new Ht(Wi,$i,e,t);o.layers=this.layers,this.add(o);let l=new Ht(Wi,$i,e,t);l.layers=this.layers,this.add(l);let c=new Ht(Wi,$i,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===nn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Yi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},ya=class extends Ht{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var Cl="\\[\\]\\.:\\/",Kd=new RegExp("["+Cl+"]","g"),Rl="[^"+Cl+"]",jd="[^"+Cl.replace("\\.","")+"]",Qd=/((?:WC+[\/:])*)/.source.replace("WC",Rl),ef=/(WCOD+)?/.source.replace("WCOD",jd),tf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Rl),nf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Rl),sf=new RegExp("^"+Qd+ef+tf+nf+"$"),rf=["material","materials","bones","map"],Ko=class{constructor(e,t,n){let s=n||dt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},dt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Kd,"")}static parseTrackName(e){let t=sf.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);rf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Oe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){ze("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ze("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ze("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ze("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ze("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){ze("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){ze("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;ze("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dt.Composite=Ko;dt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};dt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};dt.prototype.GetterByBindingType=[dt.prototype._getValue_direct,dt.prototype._getValue_array,dt.prototype._getValue_arrayElement,dt.prototype._getValue_toArray];dt.prototype.SetterByBindingTypeAndVersioning=[[dt.prototype._setValue_direct,dt.prototype._setValue_direct_setNeedsUpdate,dt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_array,dt.prototype._setValue_array_setNeedsUpdate,dt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_arrayElement,dt.prototype._setValue_arrayElement_setNeedsUpdate,dt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_fromArray,dt.prototype._setValue_fromArray_setNeedsUpdate,dt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var w_=new Float32Array(1);var Ul=class Ul{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};Ul.prototype.isMatrix2=!0;var jo=Ul;function Il(i,e,t,n){let s=af(n);switch(t){case xl:return i*e;case yl:return i*e/s.components*s.byteLength;case Ca:return i*e/s.components*s.byteLength;case ui:return i*e*2/s.components*s.byteLength;case Ra:return i*e*2/s.components*s.byteLength;case vl:return i*e*3/s.components*s.byteLength;case gn:return i*e*4/s.components*s.byteLength;case Ia:return i*e*4/s.components*s.byteLength;case qs:case Ys:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Zs:case Js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case La:case Na:return Math.max(i,16)*Math.max(e,8)/4;case Pa:case Da:return Math.max(i,8)*Math.max(e,8)/2;case Ua:case Fa:case Ba:case za:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Oa:case Ks:case ka:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ga:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Va:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ha:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Wa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case $a:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Xa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case qa:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Za:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ja:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ja:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Qa:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case eo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case to:case no:case io:return Math.ceil(i/4)*Math.ceil(e/4)*16;case so:case ro:return Math.ceil(i/4)*Math.ceil(e/4)*8;case js:case ao:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function af(i){switch(i){case qt:case pl:return{byteLength:1,components:1};case ls:case ml:case mn:return{byteLength:2,components:1};case Aa:case wa:return{byteLength:2,components:4};case fn:case Ta:case pn:return{byteLength:4,components:1};case gl:case _l:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Oe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function yu(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function lf(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let u=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,_)=>f.start-_.start);let h=0;for(let f=1;f<d.length;f++){let _=d[h],v=d[f];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++h,d[h]=v)}d.length=h+1;for(let f=0,_=d.length;f<_;f++){let v=d[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var cf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,uf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,df=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ff=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,pf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,mf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,gf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,_f=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,xf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,vf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,yf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Mf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Sf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ef=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Tf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Af=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,wf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Cf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Rf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,If=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Pf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Lf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Df=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Nf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Uf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ff=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Of=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Bf="gl_FragColor = linearToOutputTexel( gl_FragColor );",zf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,kf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Gf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Vf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Hf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Wf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,$f=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Xf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Yf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Zf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Jf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Kf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,ep=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,tp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,np=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ip=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,sp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,rp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,ap=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,op=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,cp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,hp=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,up=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,dp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,fp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,pp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,gp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,_p=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,xp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Mp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Sp=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,bp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ep=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Tp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ap=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,wp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Cp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Rp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ip=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Pp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Lp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Dp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Np=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Up=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Fp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Op=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Bp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,zp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,kp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Gp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Vp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Hp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Wp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,$p=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Xp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,qp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Yp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Zp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Jp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Kp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,jp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Qp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,em=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,nm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,im=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,sm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,am=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,om=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,lm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,um=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,mm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,gm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,_m=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,xm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ym=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,bm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Am=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,wm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Rm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Im=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Dm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Nm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Um=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Om=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Bm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,km=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Gm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,$e={alphahash_fragment:cf,alphahash_pars_fragment:hf,alphamap_fragment:uf,alphamap_pars_fragment:df,alphatest_fragment:ff,alphatest_pars_fragment:pf,aomap_fragment:mf,aomap_pars_fragment:gf,batching_pars_vertex:_f,batching_vertex:xf,begin_vertex:vf,beginnormal_vertex:yf,bsdfs:Mf,iridescence_fragment:Sf,bumpmap_pars_fragment:bf,clipping_planes_fragment:Ef,clipping_planes_pars_fragment:Tf,clipping_planes_pars_vertex:Af,clipping_planes_vertex:wf,color_fragment:Cf,color_pars_fragment:Rf,color_pars_vertex:If,color_vertex:Pf,common:Lf,defaultnormal_vertex:Df,displacementmap_pars_vertex:Nf,displacementmap_vertex:Uf,emissivemap_fragment:Ff,emissivemap_pars_fragment:Of,colorspace_fragment:Bf,colorspace_pars_fragment:zf,envmap_fragment:kf,envmap_common_pars_fragment:Gf,envmap_pars_fragment:Vf,envmap_pars_vertex:Hf,envmap_physical_pars_fragment:ep,envmap_vertex:Wf,fog_vertex:$f,fog_pars_vertex:Xf,fog_fragment:qf,fog_pars_fragment:Yf,gradientmap_pars_fragment:Zf,lightmap_pars_fragment:Jf,lights_lambert_fragment:Kf,lights_lambert_pars_fragment:jf,lights_pars_begin:Qf,lights_toon_fragment:tp,lights_toon_pars_fragment:np,lights_phong_fragment:ip,lights_phong_pars_fragment:sp,lights_physical_fragment:rp,lights_physical_pars_fragment:ap,lights_fragment_begin:op,lights_fragment_maps:lp,lights_fragment_end:cp,lightprobes_pars_fragment:hp,logdepthbuf_fragment:up,logdepthbuf_pars_fragment:dp,logdepthbuf_pars_vertex:fp,logdepthbuf_vertex:pp,map_fragment:mp,map_pars_fragment:gp,map_particle_fragment:_p,map_particle_pars_fragment:xp,metalnessmap_fragment:vp,metalnessmap_pars_fragment:yp,morphinstance_vertex:Mp,morphcolor_vertex:Sp,morphnormal_vertex:bp,morphtarget_pars_vertex:Ep,morphtarget_vertex:Tp,normal_fragment_begin:Ap,normal_fragment_maps:wp,normal_pars_fragment:Cp,normal_pars_vertex:Rp,normal_vertex:Ip,normalmap_pars_fragment:Pp,clearcoat_normal_fragment_begin:Lp,clearcoat_normal_fragment_maps:Dp,clearcoat_pars_fragment:Np,iridescence_pars_fragment:Up,opaque_fragment:Fp,packing:Op,premultiplied_alpha_fragment:Bp,project_vertex:zp,dithering_fragment:kp,dithering_pars_fragment:Gp,roughnessmap_fragment:Vp,roughnessmap_pars_fragment:Hp,shadowmap_pars_fragment:Wp,shadowmap_pars_vertex:$p,shadowmap_vertex:Xp,shadowmask_pars_fragment:qp,skinbase_vertex:Yp,skinning_pars_vertex:Zp,skinning_vertex:Jp,skinnormal_vertex:Kp,specularmap_fragment:jp,specularmap_pars_fragment:Qp,tonemapping_fragment:em,tonemapping_pars_fragment:tm,transmission_fragment:nm,transmission_pars_fragment:im,uv_pars_fragment:sm,uv_pars_vertex:rm,uv_vertex:am,worldpos_vertex:om,background_vert:lm,background_frag:cm,backgroundCube_vert:hm,backgroundCube_frag:um,cube_vert:dm,cube_frag:fm,depth_vert:pm,depth_frag:mm,distance_vert:gm,distance_frag:_m,equirect_vert:xm,equirect_frag:vm,linedashed_vert:ym,linedashed_frag:Mm,meshbasic_vert:Sm,meshbasic_frag:bm,meshlambert_vert:Em,meshlambert_frag:Tm,meshmatcap_vert:Am,meshmatcap_frag:wm,meshnormal_vert:Cm,meshnormal_frag:Rm,meshphong_vert:Im,meshphong_frag:Pm,meshphysical_vert:Lm,meshphysical_frag:Dm,meshtoon_vert:Nm,meshtoon_frag:Um,points_vert:Fm,points_frag:Om,shadow_vert:Bm,shadow_frag:zm,sprite_vert:km,sprite_frag:Gm},ye={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new je(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new je(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},In={basic:{uniforms:Gt([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:Gt([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new Ze(0)},envMapIntensity:{value:1}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:Gt([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:Gt([ye.common,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.roughnessmap,ye.metalnessmap,ye.fog,ye.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:Gt([ye.common,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.gradientmap,ye.fog,ye.lights,{emissive:{value:new Ze(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:Gt([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:Gt([ye.points,ye.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:Gt([ye.common,ye.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:Gt([ye.common,ye.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:Gt([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:Gt([ye.sprite,ye.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distance:{uniforms:Gt([ye.common,ye.displacementmap,{referencePosition:{value:new $},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distance_vert,fragmentShader:$e.distance_frag},shadow:{uniforms:Gt([ye.lights,ye.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};In.physical={uniforms:Gt([In.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new je(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new ke},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new je},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new je},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var lo={r:0,b:0,g:0},Vm=new ft,Mu=new ke;Mu.set(-1,0,0,0,1,0,0,0,1);function Hm(i,e,t,n,s,r){let a=new Ze(0),o=s===!0?0:1,l,c,u=null,d=0,h=null;function f(M){let w=M.isScene===!0?M.background:null;if(w&&w.isTexture){let E=M.backgroundBlurriness>0;w=e.get(w,E)}return w}function _(M){let w=!1,E=f(M);E===null?m(a,o):E&&E.isColor&&(m(E,1),w=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||w)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(M,w){let E=f(w);E&&E.isCubeTexture?(c===void 0&&(c=new Kt(new es(1,1,1),new An({name:"BackgroundCubeMaterial",uniforms:Ai(In.backgroundCube.uniforms),vertexShader:In.backgroundCube.vertexShader,fragmentShader:In.backgroundCube.fragmentShader,side:Xt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,b,g){this.matrixWorld.copyPosition(g.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=E,c.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Vm.makeRotationFromEuler(w.backgroundRotation)).transpose(),E.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Mu),c.material.toneMapped=Ye.getTransfer(E.colorSpace)!==it,(u!==E||d!==E.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=E,d=E.version,h=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):E&&E.isTexture&&(l===void 0&&(l=new Kt(new Os(2,2),new An({name:"BackgroundMaterial",uniforms:Ai(In.background.uniforms),vertexShader:In.background.vertexShader,fragmentShader:In.background.fragmentShader,side:hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=E,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=Ye.getTransfer(E.colorSpace)!==it,E.matrixAutoUpdate===!0&&E.updateMatrix(),l.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||d!==E.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=E,d=E.version,h=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function m(M,w){M.getRGB(lo,wl(i)),t.buffers.color.setClear(lo.r,lo.g,lo.b,w,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,w=1){a.set(M),o=w,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,m(a,o)},render:_,addToRenderList:v,dispose:p}}function Wm(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(R,U,H,C,O){let X=!1,F=d(R,C,H,U);r!==F&&(r=F,c(r.object)),X=f(R,C,H,O),X&&_(R,C,H,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,E(R,U,H,C),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function c(R){return i.bindVertexArray(R)}function u(R){return i.deleteVertexArray(R)}function d(R,U,H,C){let O=C.wireframe===!0,X=n[U.id];X===void 0&&(X={},n[U.id]=X);let F=R.isInstancedMesh===!0?R.id:0,ne=X[F];ne===void 0&&(ne={},X[F]=ne);let V=ne[H.id];V===void 0&&(V={},ne[H.id]=V);let ee=V[O];return ee===void 0&&(ee=h(l()),V[O]=ee),ee}function h(R){let U=[],H=[],C=[];for(let O=0;O<t;O++)U[O]=0,H[O]=0,C[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:H,attributeDivisors:C,object:R,attributes:{},index:null}}function f(R,U,H,C){let O=r.attributes,X=U.attributes,F=0,ne=H.getAttributes();for(let V in ne)if(ne[V].location>=0){let se=O[V],Ee=X[V];if(Ee===void 0&&(V==="instanceMatrix"&&R.instanceMatrix&&(Ee=R.instanceMatrix),V==="instanceColor"&&R.instanceColor&&(Ee=R.instanceColor)),se===void 0||se.attribute!==Ee||Ee&&se.data!==Ee.data)return!0;F++}return r.attributesNum!==F||r.index!==C}function _(R,U,H,C){let O={},X=U.attributes,F=0,ne=H.getAttributes();for(let V in ne)if(ne[V].location>=0){let se=X[V];se===void 0&&(V==="instanceMatrix"&&R.instanceMatrix&&(se=R.instanceMatrix),V==="instanceColor"&&R.instanceColor&&(se=R.instanceColor));let Ee={};Ee.attribute=se,se&&se.data&&(Ee.data=se.data),O[V]=Ee,F++}r.attributes=O,r.attributesNum=F,r.index=C}function v(){let R=r.newAttributes;for(let U=0,H=R.length;U<H;U++)R[U]=0}function m(R){p(R,0)}function p(R,U){let H=r.newAttributes,C=r.enabledAttributes,O=r.attributeDivisors;H[R]=1,C[R]===0&&(i.enableVertexAttribArray(R),C[R]=1),O[R]!==U&&(i.vertexAttribDivisor(R,U),O[R]=U)}function M(){let R=r.newAttributes,U=r.enabledAttributes;for(let H=0,C=U.length;H<C;H++)U[H]!==R[H]&&(i.disableVertexAttribArray(H),U[H]=0)}function w(R,U,H,C,O,X,F){F===!0?i.vertexAttribIPointer(R,U,H,O,X):i.vertexAttribPointer(R,U,H,C,O,X)}function E(R,U,H,C){v();let O=C.attributes,X=H.getAttributes(),F=U.defaultAttributeValues;for(let ne in X){let V=X[ne];if(V.location>=0){let ee=O[ne];if(ee===void 0&&(ne==="instanceMatrix"&&R.instanceMatrix&&(ee=R.instanceMatrix),ne==="instanceColor"&&R.instanceColor&&(ee=R.instanceColor)),ee!==void 0){let se=ee.normalized,Ee=ee.itemSize,Te=e.get(ee);if(Te===void 0)continue;let Z=Te.buffer,q=Te.type,Q=Te.bytesPerElement,pe=q===i.INT||q===i.UNSIGNED_INT||ee.gpuType===Ta;if(ee.isInterleavedBufferAttribute){let oe=ee.data,Pe=oe.isInterleavedBuffer===!0?oe.stride:oe.itemSize,tt=ee.offset;if(oe.isInstancedInterleavedBuffer||oe.isInstancedBufferAttribute){for(let Re=0;Re<V.locationSize;Re++)p(V.location+Re,oe.meshPerAttribute);R.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Re=0;Re<V.locationSize;Re++)m(V.location+Re);i.bindBuffer(i.ARRAY_BUFFER,Z);for(let Re=0;Re<V.locationSize;Re++)w(V.location+Re,Ee/V.locationSize,q,se,Pe*Q,(tt+Ee/V.locationSize*Re)*Q,pe)}else{if(ee.isInstancedBufferAttribute){for(let oe=0;oe<V.locationSize;oe++)p(V.location+oe,ee.meshPerAttribute);R.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let oe=0;oe<V.locationSize;oe++)m(V.location+oe);i.bindBuffer(i.ARRAY_BUFFER,Z);for(let oe=0;oe<V.locationSize;oe++)w(V.location+oe,Ee/V.locationSize,q,se,Ee*Q,Ee/V.locationSize*oe*Q,pe)}}else if(F!==void 0){let se=F[ne];if(se!==void 0)switch(se.length){case 2:i.vertexAttrib2fv(V.location,se);break;case 3:i.vertexAttrib3fv(V.location,se);break;case 4:i.vertexAttrib4fv(V.location,se);break;default:i.vertexAttrib1fv(V.location,se)}}}}M()}function A(){N();for(let R in n){let U=n[R];for(let H in U){let C=U[H];for(let O in C){let X=C[O];for(let F in X)u(X[F].object),delete X[F];delete C[O]}}delete n[R]}}function b(R){if(n[R.id]===void 0)return;let U=n[R.id];for(let H in U){let C=U[H];for(let O in C){let X=C[O];for(let F in X)u(X[F].object),delete X[F];delete C[O]}}delete n[R.id]}function g(R){for(let U in n){let H=n[U];for(let C in H){let O=H[C];if(O[R.id]===void 0)continue;let X=O[R.id];for(let F in X)u(X[F].object),delete X[F];delete O[R.id]}}}function S(R){for(let U in n){let H=n[U],C=R.isInstancedMesh===!0?R.id:0,O=H[C];if(O!==void 0){for(let X in O){let F=O[X];for(let ne in F)u(F[ne].object),delete F[ne];delete O[X]}delete H[C],Object.keys(H).length===0&&delete n[U]}}}function N(){I(),a=!0,r!==s&&(r=s,c(r.object))}function I(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:N,resetDefaultState:I,dispose:A,releaseStatesOfGeometry:b,releaseStatesOfObject:S,releaseStatesOfProgram:g,initAttributes:v,enableAttribute:m,disableUnusedAttributes:M}}function $m(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let f=0;f<u;f++)h+=c[f];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Xm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let g=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(g.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(g){return!(g!==gn&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(g){let S=g===mn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(g!==qt&&g!==pn&&!S&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(g){if(g==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";g="mediump"}return g==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(Oe("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&d===!1;t.reversedDepthBuffer===!0&&d===!1&&Oe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&d===!0&&Oe("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),b=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:w,maxFragmentUniforms:E,maxSamples:A,samples:b}}function qm(i){let e=this,t=null,n=0,s=!1,r=!1,a=new un,o=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let f=d.length!==0||h||n!==0||s;return s=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){let _=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!s||_===null||_.length===0||r&&!m)r?u(null):c();else{let M=r?0:n,w=M*4,E=p.clippingState||null;l.value=E,E=u(_,h,w,f);for(let A=0;A!==w;++A)E[A]=t[A];p.clippingState=E,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,_){let v=d!==null?d.length:0,m=null;if(v!==0){if(m=l.value,_!==!0||m===null){let p=f+v*4,M=h.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let w=0,E=f;w!==v;++w,E+=4)a.copy(d[w]).applyMatrix4(M,o),a.normal.toArray(m,E),m[E+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}var nr=class extends Jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Ds(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new es(5,5,5),r=new An({name:"CubemapFromEquirect",uniforms:Ai(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Xt,blending:Si});r.uniforms.tEquirect.value=t;let a=new Kt(s,r),o=t.minFilter;return t.minFilter===Xn&&(t.minFilter=Wt),new ss(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},Qh=256,Ym=3,Zm=20,Su=256,bu=16,Jm=3,Km=new $,jm=new Ze,ho=class i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new ss(1,10,null),this._boxMesh=new Kt(new es(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=Km}=r,l=this._renderer;this._setSize(a);let c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);let d=l.autoClear,h=l.autoClearColor,f=l.autoClearDepth,_=l.autoClearStencil,v=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,v===null&&(e.background=l.getClearColor(jm));let m=new ss(n,s,u);return m.position.copy(o),m.update(l,e),l.autoClear=d,l.autoClearColor=h,l.autoClearDepth=f,l.autoClearStencil=_,e.background=v,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=nu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=tu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Qh,Yh(e))}_fromTexture(e,t){e.mapping===Ei||e.mapping===os?this._setSize(e.image.length===0?Qh:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=eu(e,!1,!1),n=Math.log2(e)-Ym;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=eu(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Ei||e.mapping===os?(this._cubemapMaterial===null&&(this._cubemapMaterial=nu()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=tu()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=Qm(),this._integrationMaterial=eg());let t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/bu);for(let a=0;a<=n;a++){let o=i.lodToRoughness(a,n);if(a>n-Jm)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{let l=o>0?Math.log2(t)+.5*Math.log2(6/(Su*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=tg());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}};function eu(i,e,t){return new nr(i,{minFilter:Xn,generateMipmaps:e,type:mn,colorSpace:As,depthBuffer:t})}function ir(i,e,t){return new An({name:i,uniforms:e,vertexShader:$e.cube_vert,fragmentShader:t,side:Xt,blending:Si,depthTest:!1,depthWrite:!1})}function Qm(){return ir("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Su}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function eg(){return ir("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:bu}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function tg(){return ir("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Zm}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function tu(){return ir("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function nu(){return ir("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function ng(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,f=!1){return h==null?null:f?a(h):r(h)}function r(h){if(h&&h.isTexture){let f=h.mapping;if(f===Sa||f===ba)if(e.has(h)){let _=e.get(h).texture;return o(_,h.mapping)}else{let _=h.image;if(_&&_.height>0){let v=new nr(_.height);return v.fromEquirectangularTexture(i,h),e.set(h,v),h.addEventListener("dispose",c),o(v.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){let f=h.mapping,_=f===Sa||f===ba,v=f===Ei||f===os;if(_||v){let m=t.get(h),p=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==p)return n===null&&(n=new ho(i)),m=_?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{let M=h.image;return _&&M&&M.height>0||v&&M&&l(M)?(n===null&&(n=new ho(i)),m=_?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,f){return f===Sa?h.mapping=Ei:f===ba&&(h.mapping=os),h}function l(h){let f=0,_=6;for(let v=0;v<_;v++)h[v]!==void 0&&f++;return f===_}function c(h){let f=h.target;f.removeEventListener("dispose",c);let _=e.get(f);_!==void 0&&(e.delete(f),_.dispose())}function u(h){let f=h.target;f.removeEventListener("dispose",u);let _=t.get(f);_!==void 0&&(t.delete(f),_.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function ig(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Es("WebGLRenderer: "+n+" extension not supported."),s}}}function sg(i,e,t,n){let s={},r=new WeakMap,a=new FinalizationRegistry(_=>delete s[_]);function o(_){l(_.target)}function l(_){_.index!==null&&e.remove(_.index);for(let m in _.attributes)e.remove(_.attributes[m]);_.removeEventListener("dispose",o),delete s[_.id],a.unregister(_);let v=r.get(_);v&&(e.remove(v),r.delete(_)),n.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,t.memory.geometries--}function c(_,v){return s[v.id]!==void 0||(v.addEventListener("dispose",o),s[v.id]=new WeakRef(v),a.register(v,v.id,v),t.memory.geometries++),v}function u(_){let v=_.attributes;for(let m in v)e.update(v[m],i.ARRAY_BUFFER)}function d(_){let v=_.index,m=_.attributes.position,p=0;if(m===void 0)return;let M=v!==null?v.array.length:m.array.length/3-1,w=m.count>=65535?Ls:Ps,E=new w(Math.ceil(M/3)*6,1),A=E.array;if(v!==null){let g=v.array;p=v.version;for(let S=0,N=0;S<M;S+=3){let I=g[S+0],R=g[S+1],U=g[S+2];A[N++]=I,A[N++]=R,A[N++]=R,A[N++]=U,A[N++]=U,A[N++]=I}}else{p=m.version;for(let g=0,S=0;g<M;g+=3){let N=g+0,I=g+1,R=g+2;A[S++]=N,A[S++]=I,A[S++]=I,A[S++]=R,A[S++]=R,A[S++]=N}}E.version=p;let b=r.get(_);b&&e.remove(b),r.set(_,E)}function h(_){let v=r.get(_);if(v){let m=_.index;m!==null&&v.version<m.version&&d(_)}else d(_);return r.get(_)}function f(){for(let _ in s){let v=s[_].deref();v!==void 0&&l(v)}}return{get:c,update:u,getWireframeAttribute:h,dispose:f}}function rg(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,h){i.drawElements(n,h,r,d*a),t.update(h,n,1)}function c(d,h,f){f!==0&&(i.drawElementsInstanced(n,h,r,d*a,f),t.update(h,n,f))}function u(d,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,f);let v=0;for(let m=0;m<f;m++)v+=h[m];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function ag(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:ze("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function og(i,e,t){let n=new WeakMap,s=new pt;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==d){let N=function(){g.dispose(),n.delete(o),o.removeEventListener("dispose",N)};h!==void 0&&h.texture.dispose();let f=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],w=0;f===!0&&(w=1),_===!0&&(w=2),v===!0&&(w=3);let E=o.attributes.position.count*w,A=1;E>e.maxTextureSize&&(A=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);let b=new Float32Array(E*A*4*d),g=new Cs(b,E,A,d);g.type=pn,g.needsUpdate=!0;let S=w*4;for(let I=0;I<d;I++){let R=m[I],U=p[I],H=M[I],C=E*A*4*I;for(let O=0;O<R.count;O++){let X=O*S;f===!0&&(s.fromBufferAttribute(R,O),b[C+X+0]=s.x,b[C+X+1]=s.y,b[C+X+2]=s.z,b[C+X+3]=0),_===!0&&(s.fromBufferAttribute(U,O),b[C+X+4]=s.x,b[C+X+5]=s.y,b[C+X+6]=s.z,b[C+X+7]=0),v===!0&&(s.fromBufferAttribute(H,O),b[C+X+8]=s.x,b[C+X+9]=s.y,b[C+X+10]=s.z,b[C+X+11]=H.itemSize===4?s.w:1)}}h={count:d,texture:g,size:new je(E,A)},n.set(o,h),o.addEventListener("dispose",N)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let _=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function lg(i,e,t,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,d=c.geometry,h=e.get(c,d);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var cg={[al]:"LINEAR_TONE_MAPPING",[ol]:"REINHARD_TONE_MAPPING",[ll]:"CINEON_TONE_MAPPING",[cl]:"ACES_FILMIC_TONE_MAPPING",[ul]:"AGX_TONE_MAPPING",[dl]:"NEUTRAL_TONE_MAPPING",[hl]:"CUSTOM_TONE_MAPPING"};function hg(i,e,t,n,s,r){let a=new Jt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=null,u=new dn;u.setAttribute("position",new It([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new It([0,2,0,0,2,0],2));let d=new aa({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new Kt(u,d),f=new Vs(-1,1,1,-1,0,1),_=null,v=null,m=!1,p,M=null,w=[],E=!1;this.setSize=function(A,b){a.setSize(A,b),o!==null&&o.setSize(A,b),l!==null&&l.setSize(A,b);for(let g=0;g<w.length;g++){let S=w[g];S.setSize&&S.setSize(A,b)}},this.setEffects=function(A){w=A,E=w.length>0&&w[0].isRenderPass===!0;let b=a.width,g=a.height;w.length>0&&o===null&&(o=new Jt(b,g,{type:mn,depthBuffer:!1,stencilBuffer:!1}),l=new Jt(b,g,{type:mn,depthBuffer:!1,stencilBuffer:!1}));let S=s===!0&&w.some(N=>N.needsDepthTexture===!0);S!==(a.depthTexture!==null)&&(S===!0&&c===null&&(c=new $n(b,g),r===!0&&(c.format=qn,c.type=Ti)),a.dispose(),a.depthTexture=S?c:null,a.resolveDepthBuffer=S,a.storeMultisampledDepthBuffer=S);for(let N=0;N<w.length;N++){let I=w[N];I.setSize&&I.setSize(b,g),S&&I.needsDepthTexture===!0&&I.setDepthTexture&&I.setDepthTexture(c)}},this.begin=function(A,b){if(m||A.toneMapping===Cn&&w.length===0)return!1;if(M=b,b!==null){let g=b.width,S=b.height;(a.width!==g||a.height!==S)&&this.setSize(g,S)}return E===!1&&A.setRenderTarget(a),p=A.toneMapping,A.toneMapping=Cn,!0},this.hasRenderPass=function(){return E},this.end=function(A,b){A.toneMapping=p,m=!0;let g=a,S=o;for(let N=0;N<w.length;N++){let I=w[N];I.enabled!==!1&&(I.render(A,S,g,b),I.needsSwap!==!1&&(g=S,S=S===o?l:o))}if(_!==A.outputColorSpace||v!==A.toneMapping){_=A.outputColorSpace,v=A.toneMapping,d.defines={},Ye.getTransfer(_)===it&&(d.defines.SRGB_TRANSFER="");let N=cg[v];N&&(d.defines[N]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=g.texture,A.setRenderTarget(M),A.render(h,f),M=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),d.dispose()}}var Eu=new kt,Tu=new $n(1,1),Au=new Us(1),wu=new Cs,Cu=new ta,Ru=new Ds,iu=[],su=[],ru=new Float32Array(16),au=new Float32Array(9),ou=new Float32Array(4);function hs(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=iu[s];if(r===void 0&&(r=new Float32Array(s),iu[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function St(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function bt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function fo(i,e){let t=su[e];t===void 0&&(t=new Int32Array(e),su[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ug(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function dg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2fv(this.addr,e),bt(t,e)}}function fg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(St(t,e))return;i.uniform3fv(this.addr,e),bt(t,e)}}function pg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4fv(this.addr,e),bt(t,e)}}function mg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;ou.set(n),i.uniformMatrix2fv(this.addr,!1,ou),bt(t,n)}}function gg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;au.set(n),i.uniformMatrix3fv(this.addr,!1,au),bt(t,n)}}function _g(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;ru.set(n),i.uniformMatrix4fv(this.addr,!1,ru),bt(t,n)}}function xg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2iv(this.addr,e),bt(t,e)}}function yg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3iv(this.addr,e),bt(t,e)}}function Mg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4iv(this.addr,e),bt(t,e)}}function Sg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function bg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2uiv(this.addr,e),bt(t,e)}}function Eg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3uiv(this.addr,e),bt(t,e)}}function Tg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4uiv(this.addr,e),bt(t,e)}}function po(i){return i.version===0&&(i.compareFunction=bl,i.needsUpdate=!0),i}function Ag(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=po(Tu):r=Eu,t.setTexture2D(e||r,s)}function wg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Cu,s)}function Cg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=po(Au):r=Ru,t.setTextureCube(e||r,s)}function Rg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||wu,s)}function Ig(i){switch(i){case 5126:return ug;case 35664:return dg;case 35665:return fg;case 35666:return pg;case 35674:return mg;case 35675:return gg;case 35676:return _g;case 5124:case 35670:return xg;case 35667:case 35671:return vg;case 35668:case 35672:return yg;case 35669:case 35673:return Mg;case 5125:return Sg;case 36294:return bg;case 36295:return Eg;case 36296:return Tg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ag;case 35679:case 36299:case 36307:return wg;case 35680:case 36300:case 36308:case 36293:return Cg;case 36289:case 36303:case 36311:case 36292:return Rg}}function Pg(i,e){i.uniform1fv(this.addr,e)}function Lg(i,e){let t=hs(e,this.size,2);i.uniform2fv(this.addr,t)}function Dg(i,e){let t=hs(e,this.size,3);i.uniform3fv(this.addr,t)}function Ng(i,e){let t=hs(e,this.size,4);i.uniform4fv(this.addr,t)}function Ug(i,e){let t=hs(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Fg(i,e){let t=hs(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Og(i,e){let t=hs(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Bg(i,e){i.uniform1iv(this.addr,e)}function zg(i,e){i.uniform2iv(this.addr,e)}function kg(i,e){i.uniform3iv(this.addr,e)}function Gg(i,e){i.uniform4iv(this.addr,e)}function Vg(i,e){i.uniform1uiv(this.addr,e)}function Hg(i,e){i.uniform2uiv(this.addr,e)}function Wg(i,e){i.uniform3uiv(this.addr,e)}function $g(i,e){i.uniform4uiv(this.addr,e)}function Xg(i,e,t){let n=this.cache,s=e.length,r=fo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=po(Tu):a=Eu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function qg(i,e,t){let n=this.cache,s=e.length,r=fo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Cu,r[a])}function Yg(i,e,t){let n=this.cache,s=e.length,r=fo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=po(Au):a=Ru;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function Zg(i,e,t){let n=this.cache,s=e.length,r=fo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||wu,r[a])}function Jg(i){switch(i){case 5126:return Pg;case 35664:return Lg;case 35665:return Dg;case 35666:return Ng;case 35674:return Ug;case 35675:return Fg;case 35676:return Og;case 5124:case 35670:return Bg;case 35667:case 35671:return zg;case 35668:case 35672:return kg;case 35669:case 35673:return Gg;case 5125:return Vg;case 36294:return Hg;case 36295:return Wg;case 36296:return $g;case 35678:case 36198:case 36298:case 36306:case 35682:return Xg;case 35679:case 36299:case 36307:return qg;case 35680:case 36300:case 36308:case 36293:return Yg;case 36289:case 36303:case 36311:case 36292:return Zg}}var Bl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ig(t.type)}},zl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Jg(t.type)}},kl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Fl=/(\w+)(\])?(\[|\.)?/g;function lu(i,e){i.seq.push(e),i.map[e.id]=e}function Kg(i,e,t){let n=i.name,s=n.length;for(Fl.lastIndex=0;;){let r=Fl.exec(n),a=Fl.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){lu(t,c===void 0?new Bl(o,i,e):new zl(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new kl(o),lu(t,d)),t=d}}}var cs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Kg(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function cu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var jg=37297,Qg=0;function e0(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var hu=new ke;function t0(i){Ye._getMatrix(hu,Ye.workingColorSpace,i);let e=`mat3( ${hu.elements.map(t=>t.toFixed(4))} )`;switch(Ye.getTransfer(i)){case ws:return[e,"LinearTransferOETF"];case it:return[e,"sRGBTransferOETF"];default:return Oe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function uu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+e0(i.getShaderSource(e),o)}else return r}function n0(i,e){let t=t0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var i0={[al]:"Linear",[ol]:"Reinhard",[ll]:"Cineon",[cl]:"ACESFilmic",[ul]:"AgX",[dl]:"Neutral",[hl]:"Custom"};function s0(i,e){let t=i0[e];return t===void 0?(Oe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var co=new $;function r0(){Ye.getLuminanceCoefficients(co);let i=co.x.toFixed(4),e=co.y.toFixed(4),t=co.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function a0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(tr).join(`
`)}function o0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function l0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function tr(i){return i!==""}function du(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function fu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var c0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Gl(i){return i.replace(c0,h0)}function h0(i,e){let t=$e[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Gl(t)}var u0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pu(i){return i.replace(u0,d0)}function d0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function mu(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var f0={[$s]:"SHADOWMAP_TYPE_PCF",[rs]:"SHADOWMAP_TYPE_VSM"};function p0(i){return f0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var m0={[os]:"ENVMAP_MODE_REFRACTION"};function g0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":m0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var _0={[rl]:"ENVMAP_BLENDING_MULTIPLY",[Lh]:"ENVMAP_BLENDING_MIX",[Dh]:"ENVMAP_BLENDING_ADD"};function x0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":_0[i.combine]||"ENVMAP_BLENDING_NONE"}function v0(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=p0(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=g0(t),d=x0(t),h=a0(t),f=o0(r),_=s.createProgram(),v,m,p=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(tr).join(`
`),v.length>0&&(v+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(tr).join(`
`),m.length>0&&(m+=`
`)):(v=[mu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(tr).join(`
`),m=[mu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Cn?"#define TONE_MAPPING":"",t.toneMapping!==Cn?$e.tonemapping_pars_fragment:"",t.toneMapping!==Cn?s0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,n0("linearToOutputTexel",t.outputColorSpace),r0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(tr).join(`
`)),a=Gl(a),a=du(a,t),a=fu(a,t),o=Gl(o),o=du(o,t),o=fu(o,t),a=pu(a),o=pu(o),t.isRawShaderMaterial!==!0&&(p=`#version 300 es
`,v=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,m=["#define varying in",t.glslVersion===El?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===El?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let M=p+v+a,w=p+m+o,E=cu(s,s.VERTEX_SHADER,M),A=cu(s,s.FRAGMENT_SHADER,w);s.attachShader(_,E),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function b(I){if(i.debug.checkShaderErrors){let R=s.getProgramInfoLog(_)||"",U=s.getShaderInfoLog(E)||"",H=s.getShaderInfoLog(A)||"",C=R.trim(),O=U.trim(),X=H.trim(),F=!0,ne=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(F=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,E,A);else{let V=uu(s,E,"vertex"),ee=uu(s,A,"fragment");ze("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+C+`
`+V+`
`+ee)}else C!==""?Oe("WebGLProgram: Program Info Log:",C):(O===""||X==="")&&(ne=!1);ne&&(I.diagnostics={runnable:F,programLog:C,vertexShader:{log:O,prefix:v},fragmentShader:{log:X,prefix:m}})}s.deleteShader(E),s.deleteShader(A),g=new cs(s,_),S=l0(s,_)}let g;this.getUniforms=function(){return g===void 0&&b(this),g};let S;this.getAttributes=function(){return S===void 0&&b(this),S};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=s.getProgramParameter(_,jg)),N},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Qg++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=E,this.fragmentShader=A,this}var y0=0,Vl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Hl(e),t.set(e,n)),n}},Hl=class{constructor(e){this.id=y0++,this.code=e,this.usedTimes=0}};function M0(i){return i===ui||i===Ks||i===js}function S0(i,e,t,n,s,r){let a=new Rs,o=new Vl,l=new Set,c=[],u=new Map,d=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(g){return l.add(g),g===0?"uv":`uv${g}`}function _(g,S,N,I,R,U){let H=I.fog,C=R.geometry,O=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?I.environment:null,X=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,F=e.get(g.envMap||O,X),ne=h[g.type],V=n.precision;g.precision!==null&&(V=n.getMaxPrecision(g.precision),V!==g.precision&&Oe("WebGLProgram.getParameters:",g.precision,"not supported, using",V,"instead."));let ee=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,se=ee!==void 0?ee.length:0,Ee=0;C.morphAttributes.position!==void 0&&(Ee=1),C.morphAttributes.normal!==void 0&&(Ee=2),C.morphAttributes.color!==void 0&&(Ee=3);let Te,Z,q,Q;if(ne){let ve=In[ne];Te=ve.vertexShader,Z=ve.fragmentShader}else{Te=g.vertexShader,Z=g.fragmentShader;let ve=o.getVertexShaderStage(g),rt=o.getFragmentShaderStage(g);o.update(g,ve,rt),q=ve.id,Q=rt.id}let pe=i.getRenderTarget(),oe=i.state.buffers.depth.getReversed(),Pe=R.isInstancedMesh===!0,tt=R.isBatchedMesh===!0,Re=!!g.map,G=!!g.matcap,ie=!!F,me=ie&&F.isPMREMTexture===!0,Ne=!!g.aoMap,Je=!!g.lightMap,at=!!g.bumpMap&&g.wireframe===!1,Be=!!g.normalMap,mt=!!g.displacementMap,ht=!!g.emissiveMap,ut=!!g.metalnessMap,lt=!!g.roughnessMap,Lt=g.anisotropy>0,D=g.clearcoat>0,yt=g.diffuseRoughness>0,nt=g.dispersion>0,st=g.retroreflectivity>0,xe=g.iridescence>0,Mt=g.sheen>0,Fe=g.transmission>0,Ge=Lt&&!!g.anisotropyMap,T=D&&!!g.clearcoatMap,x=D&&!!g.clearcoatNormalMap,z=D&&!!g.clearcoatRoughnessMap,re=yt&&!!g.diffuseRoughnessMap,te=xe&&!!g.iridescenceMap,ce=xe&&!!g.iridescenceThicknessMap,ge=Mt&&!!g.sheenColorMap,J=Mt&&!!g.sheenRoughnessMap,K=!!g.specularMap,ue=!!g.specularColorMap,P=!!g.specularIntensityMap,j=Fe&&!!g.transmissionMap,Y=Fe&&!!g.thicknessMap,de=!!g.gradientMap,le=!!g.alphaMap,he=g.alphaTest>0,Le=!!g.alphaHash,We=!!g.extensions,ae=Cn;g.toneMapped&&(pe===null||pe.isXRRenderTarget===!0)&&(ae=i.toneMapping);let Ue=me?F.isCompressedCubeTexture?F.image[0].mipmaps:F.mipmaps:null,He={shaderID:ne,shaderType:g.type,shaderName:g.name,vertexShader:Te,fragmentShader:Z,defines:g.defines,customVertexShaderID:q,customFragmentShaderID:Q,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:V,batching:tt,batchingColor:tt&&R._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&R.instanceColor!==null,instancingMorph:Pe&&R.morphTexture!==null,outputColorSpace:pe===null?i.outputColorSpace:pe.isXRRenderTarget===!0?pe.texture.colorSpace:Ye.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:Re,matcap:G,envMap:ie,envMapMode:ie&&F.mapping,envMapPMREM:me,envMapMaxLod:me?Ue.length-1:null,envMapSize:me?Ue[0].width:null,aoMap:Ne,lightMap:Je,bumpMap:at,normalMap:Be,displacementMap:mt,emissiveMap:ht,normalMapObjectSpace:Be&&g.normalMapType===Fh,normalMapTangentSpace:Be&&g.normalMapType===oo,packedNormalMap:Be&&g.normalMapType===oo&&M0(g.normalMap.format),metalnessMap:ut,roughnessMap:lt,anisotropy:Lt,anisotropyMap:Ge,clearcoat:D,clearcoatMap:T,clearcoatNormalMap:x,clearcoatRoughnessMap:z,diffuseRoughness:yt,diffuseRoughnessMap:re,dispersion:nt,retroreflection:st,iridescence:xe,iridescenceMap:te,iridescenceThicknessMap:ce,sheen:Mt,sheenColorMap:ge,sheenRoughnessMap:J,specularMap:K,specularColorMap:ue,specularIntensityMap:P,transmission:Fe,transmissionMap:j,thicknessMap:Y,gradientMap:de,opaque:g.transparent===!1&&g.blending===as&&g.alphaToCoverage===!1,alphaMap:le,alphaTest:he,alphaHash:Le,combine:g.combine,mapUv:Re&&f(g.map.channel),aoMapUv:Ne&&f(g.aoMap.channel),lightMapUv:Je&&f(g.lightMap.channel),bumpMapUv:at&&f(g.bumpMap.channel),normalMapUv:Be&&f(g.normalMap.channel),displacementMapUv:mt&&f(g.displacementMap.channel),emissiveMapUv:ht&&f(g.emissiveMap.channel),metalnessMapUv:ut&&f(g.metalnessMap.channel),roughnessMapUv:lt&&f(g.roughnessMap.channel),anisotropyMapUv:Ge&&f(g.anisotropyMap.channel),clearcoatMapUv:T&&f(g.clearcoatMap.channel),clearcoatNormalMapUv:x&&f(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:z&&f(g.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:re&&f(g.diffuseRoughnessMap.channel),iridescenceMapUv:te&&f(g.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&f(g.iridescenceThicknessMap.channel),sheenColorMapUv:ge&&f(g.sheenColorMap.channel),sheenRoughnessMapUv:J&&f(g.sheenRoughnessMap.channel),specularMapUv:K&&f(g.specularMap.channel),specularColorMapUv:ue&&f(g.specularColorMap.channel),specularIntensityMapUv:P&&f(g.specularIntensityMap.channel),transmissionMapUv:j&&f(g.transmissionMap.channel),thicknessMapUv:Y&&f(g.thicknessMap.channel),alphaMapUv:le&&f(g.alphaMap.channel),vertexTangents:!!C.attributes.tangent&&(Be||Lt),vertexNormals:!!C.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,pointsUvs:R.isPoints===!0&&!!C.attributes.uv&&(Re||le),fog:!!H,useFog:g.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||C.attributes.normal===void 0&&Be===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:oe,skinning:R.isSkinnedMesh===!0,hasPositionAttribute:C.attributes.position!==void 0,morphTargets:C.morphAttributes.position!==void 0,morphNormals:C.morphAttributes.normal!==void 0,morphColors:C.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:Ee,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:U.filter(ve=>ve.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:ae,decodeVideoTexture:Re&&g.map.isVideoTexture===!0&&Ye.getTransfer(g.map.colorSpace)===it,decodeVideoTextureEmissive:ht&&g.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(g.emissiveMap.colorSpace)===it,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===wn,flipSided:g.side===Xt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:We&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(We&&g.extensions.multiDraw===!0||tt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return He.vertexUv1s=l.has(1),He.vertexUv2s=l.has(2),He.vertexUv3s=l.has(3),l.clear(),He}function v(g){let S=[];if(g.shaderID?S.push(g.shaderID):(S.push(g.customVertexShaderID),S.push(g.customFragmentShaderID)),g.defines!==void 0)for(let N in g.defines)S.push(N),S.push(g.defines[N]);return g.isRawShaderMaterial===!1&&(m(S,g),p(S,g),S.push(i.outputColorSpace)),S.push(g.customProgramCacheKey),S.join()}function m(g,S){g.push(S.precision),g.push(S.outputColorSpace),g.push(S.envMapMode),g.push(S.envMapPMREM),g.push(S.envMapMaxLod),g.push(S.envMapSize),g.push(S.mapUv),g.push(S.alphaMapUv),g.push(S.lightMapUv),g.push(S.aoMapUv),g.push(S.bumpMapUv),g.push(S.normalMapUv),g.push(S.displacementMapUv),g.push(S.emissiveMapUv),g.push(S.metalnessMapUv),g.push(S.roughnessMapUv),g.push(S.anisotropyMapUv),g.push(S.clearcoatMapUv),g.push(S.clearcoatNormalMapUv),g.push(S.clearcoatRoughnessMapUv),g.push(S.diffuseRoughnessMapUv),g.push(S.iridescenceMapUv),g.push(S.iridescenceThicknessMapUv),g.push(S.sheenColorMapUv),g.push(S.sheenRoughnessMapUv),g.push(S.specularMapUv),g.push(S.specularColorMapUv),g.push(S.specularIntensityMapUv),g.push(S.transmissionMapUv),g.push(S.thicknessMapUv),g.push(S.combine),g.push(S.fogExp2),g.push(S.sizeAttenuation),g.push(S.morphTargetsCount),g.push(S.numSunLights),g.push(S.numDirLights),g.push(S.numPointLights),g.push(S.numSpotLights),g.push(S.numSpotLightMaps),g.push(S.numHemiLights),g.push(S.numRectAreaLights),g.push(S.numSunLightShadows),g.push(S.numDirLightShadows),g.push(S.numPointLightShadows),g.push(S.numSpotLightShadows),g.push(S.numSpotLightShadowsWithMaps),g.push(S.numLightProbes),g.push(S.numLightProbeGrids),g.push(S.shadowMapType),g.push(S.toneMapping),g.push(S.numClippingPlanes),g.push(S.numClipIntersection),g.push(S.depthPacking)}function p(g,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.retroreflection&&a.enable(24),S.diffuseRoughness&&a.enable(25),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),g.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),g.push(a.mask)}function M(g){let S=h[g.type],N;if(S){let I=In[S];N=Jh.clone(I.uniforms)}else N=g.uniforms;return N}function w(g,S){let N=u.get(S);return N!==void 0?++N.usedTimes:(N=new v0(i,S,g,s),c.push(N),u.set(S,N)),N}function E(g){if(--g.usedTimes===0){let S=c.indexOf(g);c[S]=c[c.length-1],c.pop(),u.delete(g.cacheKey),g.destroy()}}function A(g){o.remove(g)}function b(){o.dispose()}return{getParameters:_,getProgramCacheKey:v,getUniforms:M,acquireProgram:w,releaseProgram:E,releaseShaderCache:A,programs:c,dispose:b}}function b0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function E0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function gu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function _u(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function o(h,f,_,v,m,p){let M=i[e];return M===void 0?(M={id:h.id,object:h,geometry:f,material:_,materialVariant:a(h),groupOrder:v,renderOrder:h.renderOrder,z:m,group:p},i[e]=M):(M.id=h.id,M.object=h,M.geometry=f,M.material=_,M.materialVariant=a(h),M.groupOrder=v,M.renderOrder=h.renderOrder,M.z=m,M.group=p),e++,M}function l(h,f,_,v,m,p,M){M.reversedDepth===!0&&(m=-m);let w=o(h,f,_,v,m,p);_.transmission>0?n.push(w):_.transparent===!0?s.push(w):t.push(w)}function c(h,f,_,v,m,p){let M=o(h,f,_,v,m,p);_.transmission>0?n.unshift(M):_.transparent===!0?s.unshift(M):t.unshift(M)}function u(h,f){t.length>1&&t.sort(h||E0),n.length>1&&n.sort(f||gu),s.length>1&&s.sort(f||gu)}function d(){for(let h=e,f=i.length;h<f;h++){let _=i[h];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:u}}function T0(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new _u,i.set(n,[a])):s>=r.length?(a=new _u,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function A0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new $,color:new Ze};break;case"SpotLight":t={position:new $,direction:new $,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new $,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new $,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new $,halfWidth:new $,halfHeight:new $};break}return i[e.id]=t,t}}}function w0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var C0=0;function R0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function I0(i){let e=new A0,t=w0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new $);let s=new $,r=new ft,a=new ft;function o(c){let u=0,d=0,h=0;for(let U=0;U<9;U++)n.probe[U].set(0,0,0);let f=0,_=0,v=0,m=0,p=0,M=0,w=0,E=0,A=0,b=0,g=0,S=0,N=0,I=0;c.sort(R0);for(let U=0,H=c.length;U<H;U++){let C=c[U],O=C.color,X=C.intensity,F=C.distance,ne=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===ui?ne=C.shadow.map.texture:ne=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)u+=O.r*X,d+=O.g*X,h+=O.b*X;else if(C.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(C.sh.coefficients[V],X);I++}else if(C.isSunLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let ee=C.shadow,se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize.copy(ee.mapSize).multiply(ee.getFrameExtents()),n.sunShadow[_]=se,n.sunShadowMap[_]=ne;let Ee=ee.getViewportCount();for(let Te=0;Te<Ee;Te++)n.sunShadowMatrix[v+Te]=ee.getMatrix(Te),n.sunShadowCascade[v+Te]=ee._cascadeData[Te];v+=Ee,_++}n.sun[f]=V,f++}else if(C.isDirectionalLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let ee=C.shadow,se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,n.directionalShadow[m]=se,n.directionalShadowMap[m]=ne,n.directionalShadowMatrix[m]=C.shadow.matrix,A++}n.directional[m]=V,m++}else if(C.isSpotLight){let V=e.get(C);V.position.setFromMatrixPosition(C.matrixWorld),V.color.copy(O).multiplyScalar(X),V.distance=F,V.coneCos=Math.cos(C.angle),V.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),V.decay=C.decay,n.spot[M]=V;let ee=C.shadow;if(C.map&&(n.spotLightMap[S]=C.map,S++,ee.updateMatrices(C),C.castShadow&&N++),n.spotLightMatrix[M]=ee.matrix,C.castShadow){let se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,n.spotShadow[M]=se,n.spotShadowMap[M]=ne,g++}M++}else if(C.isRectAreaLight){let V=e.get(C);V.color.copy(O).multiplyScalar(X),V.halfWidth.set(C.width*.5,0,0),V.halfHeight.set(0,C.height*.5,0),n.rectArea[w]=V,w++}else if(C.isPointLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),V.distance=C.distance,V.decay=C.decay,C.castShadow){let ee=C.shadow,se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,se.shadowCameraNear=ee.camera.near,se.shadowCameraFar=ee.camera.far,n.pointShadow[p]=se,n.pointShadowMap[p]=ne,n.pointShadowMatrix[p]=C.shadow.matrix,b++}n.point[p]=V,p++}else if(C.isHemisphereLight){let V=e.get(C);V.skyColor.copy(C.color).multiplyScalar(X),V.groundColor.copy(C.groundColor).multiplyScalar(X),n.hemi[E]=V,E++}}w>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ye.LTC_FLOAT_1,n.rectAreaLTC2=ye.LTC_FLOAT_2):(n.rectAreaLTC1=ye.LTC_HALF_1,n.rectAreaLTC2=ye.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let R=n.hash;(R.sunLength!==f||R.directionalLength!==m||R.pointLength!==p||R.spotLength!==M||R.rectAreaLength!==w||R.hemiLength!==E||R.numSunShadows!==_||R.numDirectionalShadows!==A||R.numPointShadows!==b||R.numSpotShadows!==g||R.numSpotMaps!==S||R.numLightProbes!==I)&&(n.sun.length=f,n.directional.length=m,n.spot.length=M,n.rectArea.length=w,n.point.length=p,n.hemi.length=E,n.sunShadow.length=_,n.sunShadowMap.length=_,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=A,n.directionalShadowMap.length=A,n.directionalShadowMatrix.length=A,n.pointShadow.length=b,n.pointShadowMap.length=b,n.pointShadowMatrix.length=b,n.spotShadow.length=g,n.spotShadowMap.length=g,n.spotLightMatrix.length=g+S-N,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=N,n.numLightProbes=I,R.sunLength=f,R.directionalLength=m,R.pointLength=p,R.spotLength=M,R.rectAreaLength=w,R.hemiLength=E,R.numSunShadows=_,R.numDirectionalShadows=A,R.numPointShadows=b,R.numSpotShadows=g,R.numSpotMaps=S,R.numLightProbes=I,n.version=C0++)}function l(c,u){let d=0,h=0,f=0,_=0,v=0,m=0,p=u.matrixWorldInverse;for(let M=0,w=c.length;M<w;M++){let E=c[M];if(E.isSunLight){let A=n.sun[d];A.direction.setFromMatrixPosition(E.matrixWorld),A.direction.transformDirection(p),d++}else if(E.isDirectionalLight){let A=n.directional[h];A.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(p),h++}else if(E.isSpotLight){let A=n.spot[_];A.position.setFromMatrixPosition(E.matrixWorld),A.position.applyMatrix4(p),A.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(p),_++}else if(E.isRectAreaLight){let A=n.rectArea[v];A.position.setFromMatrixPosition(E.matrixWorld),A.position.applyMatrix4(p),a.identity(),r.copy(E.matrixWorld),r.premultiply(p),a.extractRotation(r),A.halfWidth.set(E.width*.5,0,0),A.halfHeight.set(0,E.height*.5,0),A.halfWidth.applyMatrix4(a),A.halfHeight.applyMatrix4(a),v++}else if(E.isPointLight){let A=n.point[f];A.position.setFromMatrixPosition(E.matrixWorld),A.position.applyMatrix4(p),f++}else if(E.isHemisphereLight){let A=n.hemi[m];A.direction.setFromMatrixPosition(E.matrixWorld),A.direction.transformDirection(p),m++}}}return{setup:o,setupView:l,state:n}}function xu(i){let e=new I0(i),t=[],n=[],s=[];function r(d){u.camera=d,t.length=0,n.length=0,s.length=0}function a(d){d.isLightProbeGrid?s.push(d):t.push(d)}function o(d){n.push(d)}function l(){e.setup(t),s.sort((d,h)=>d.priority-h.priority||d.id-h.id)}function c(d){e.setupView(t,d)}let u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function P0(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new xu(i),e.set(s,[o])):r>=a.length?(o=new xu(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var L0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,D0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,N0=[new $(1,0,0),new $(-1,0,0),new $(0,1,0),new $(0,-1,0),new $(0,0,1),new $(0,0,-1)],U0=[new $(0,-1,0),new $(0,-1,0),new $(0,0,1),new $(0,0,-1),new $(0,-1,0),new $(0,-1,0)],vu=new ft,er=new $,Ol=new $;function F0(i,e,t){let n=new ai,s=new je,r=new je,a=new pt,o=new oa,l=new la,c={},u=t.maxTextureSize,d={[hi]:Xt,[Xt]:hi,[wn]:wn},h=new An({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new je},radius:{value:4}},vertexShader:L0,fragmentShader:D0}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let _=new dn;_.setAttribute("position",new bn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Kt(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=$s;let p=this.type;this.render=function(b,g,S){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===fh&&(Oe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=$s);let N=i.getRenderTarget(),I=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),U=i.state;U.setBlending(Si),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let H=p!==this.type;H&&g.traverse(function(C){C.material&&(Array.isArray(C.material)?C.material.forEach(O=>O.needsUpdate=!0):C.material.needsUpdate=!0)});for(let C=0,O=b.length;C<O;C++){let X=b[C],F=X.shadow;if(F===void 0){Oe("WebGLShadowMap:",X,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;s.copy(F.mapSize);let ne=F.getFrameExtents();s.multiply(ne),r.copy(F.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ne.x),s.x=r.x*ne.x,F.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ne.y),s.y=r.y*ne.y,F.mapSize.y=r.y));let V=i.state.buffers.depth.getReversed();if(F.camera._reversedDepth=V,F.map===null||H===!0){if(F.map!==null&&(F.map.depthTexture!==null&&(F.map.depthTexture.dispose(),F.map.depthTexture=null),F.map.dispose()),this.type===rs){if(X.isPointLight){Oe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}F.map=new Jt(s.x,s.y,{format:ui,type:mn,minFilter:Wt,magFilter:Wt,generateMipmaps:!1}),F.map.texture.name=X.name+".shadowMap",F.map.depthTexture=new $n(s.x,s.y,pn),F.map.depthTexture.name=X.name+".shadowMapDepth",F.map.depthTexture.format=Hn,F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Pt,F.map.depthTexture.magFilter=Pt}else X.isPointLight?(F.map=new nr(s.x),F.map.depthTexture=new Us(s.x,fn)):(F.map=new Jt(s.x,s.y),F.map.depthTexture=new $n(s.x,s.y,fn)),F.map.depthTexture.name=X.name+".shadowMap",F.map.depthTexture.format=Hn,this.type===$s?(F.map.depthTexture.compareFunction=V?Sl:Ml,F.map.depthTexture.minFilter=Wt,F.map.depthTexture.magFilter=Wt):(F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Pt,F.map.depthTexture.magFilter=Pt);F.camera.updateProjectionMatrix()}F.map.isWebGLCubeRenderTarget!==!0&&(F.map.width!==s.x||F.map.height!==s.y)&&F.map.setSize(s.x,s.y);let ee=F.map.isWebGLCubeRenderTarget?6:F.getViewportCount();X.isPointLight!==!0&&F.updateMatrices(X,S);let se=(F.camera.layers.mask&4294967294)!==0?F.camera.layers:S.layers;for(let Ee=0;Ee<ee;Ee++){let Te=F.getCamera(Ee);if(X.isPointLight){let Z=F.camera,q=F.matrix,Q=X.distance||Z.far;Q!==Z.far&&(Z.far=Q,Z.updateProjectionMatrix()),er.setFromMatrixPosition(X.matrixWorld),Z.position.copy(er),Ol.copy(Z.position),Ol.add(N0[Ee]),Z.up.copy(U0[Ee]),Z.lookAt(Ol),Z.updateMatrixWorld(),q.makeTranslation(-er.x,-er.y,-er.z),vu.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),F._frustum.setFromProjectionMatrix(vu,Z.coordinateSystem,Z.reversedDepth)}if(F.map.isWebGLCubeRenderTarget)i.setRenderTarget(F.map,Ee),i.clear();else{Ee===0&&(i.setRenderTarget(F.map),i.clear());let Z=F.getViewport(Ee);a.set(r.x*Z.x,r.y*Z.y,r.x*Z.z,r.y*Z.w),U.viewport(a)}n=F.getFrustum(Ee),E(g,S,Te,X,se,this.type)}F.isPointLightShadow!==!0&&this.type===rs&&M(F,S),F.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(N,I,R)};function M(b,g){let S=e.update(v);h.defines.VSM_SAMPLES!==b.blurSamples&&(h.defines.VSM_SAMPLES=b.blurSamples,f.defines.VSM_SAMPLES=b.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),b.mapPass===null?b.mapPass=new Jt(s.x,s.y,{format:ui,type:mn}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),h.uniforms.shadow_pass.value=b.map.depthTexture,h.uniforms.resolution.value.set(b.map.width,b.map.height),h.uniforms.radius.value=b.radius,i.setRenderTarget(b.mapPass),i.clear(),i.renderBufferDirect(g,null,S,h,v,null),f.uniforms.shadow_pass.value=b.mapPass.texture,f.uniforms.resolution.value.set(b.map.width,b.map.height),f.uniforms.radius.value=b.radius,i.setRenderTarget(b.map),i.clear(),i.renderBufferDirect(g,null,S,f,v,null)}function w(b,g,S,N){let I=null,R=S.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(R!==void 0)I=R;else if(I=S.isPointLight===!0?l:o,i.localClippingEnabled&&g.clipShadows===!0&&Array.isArray(g.clippingPlanes)&&g.clippingPlanes.length!==0||g.displacementMap&&g.displacementScale!==0||g.alphaMap&&g.alphaTest>0||g.map&&g.alphaTest>0||g.alphaToCoverage===!0){let U=I.uuid,H=g.uuid,C=c[U];C===void 0&&(C={},c[U]=C);let O=C[H];O===void 0&&(O=I.clone(),C[H]=O,g.addEventListener("dispose",A)),I=O}if(I.visible=g.visible,I.wireframe=g.wireframe,N===rs?I.side=g.shadowSide!==null?g.shadowSide:g.side:I.side=g.shadowSide!==null?g.shadowSide:d[g.side],I.alphaMap=g.alphaMap,I.alphaTest=g.alphaToCoverage===!0?.5:g.alphaTest,I.map=g.map,I.clipShadows=g.clipShadows,I.clippingPlanes=g.clippingPlanes,I.clipIntersection=g.clipIntersection,I.displacementMap=g.displacementMap,I.displacementScale=g.displacementScale,I.displacementBias=g.displacementBias,I.wireframeLinewidth=g.wireframeLinewidth,I.linewidth=g.linewidth,S.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let U=i.properties.get(I);U.light=S}return I}function E(b,g,S,N,I,R){if(b.visible===!1)return;if(b.layers.test(I)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&R===rs)&&(!b.frustumCulled||b.intersectsFrustum(n))){b.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,b.matrixWorld);let C=e.update(b),O=b.material;if(Array.isArray(O)){let X=C.groups;for(let F=0,ne=X.length;F<ne;F++){let V=X[F],ee=O[V.materialIndex];if(ee&&ee.visible){let se=w(b,ee,N,R);b.onBeforeShadow(i,b,g,S,C,se,V),i.renderBufferDirect(S,null,C,se,b,V),b.onAfterShadow(i,b,g,S,C,se,V)}}}else if(O.visible){let X=w(b,O,N,R);b.onBeforeShadow(i,b,g,S,C,X,null),i.renderBufferDirect(S,null,C,X,b,null),b.onAfterShadow(i,b,g,S,C,X,null)}}let H=b.children;for(let C=0,O=H.length;C<O;C++)E(H[C],g,S,N,I,R)}function A(b){b.target.removeEventListener("dispose",A);for(let S in c){let N=c[S],I=b.target.uuid;I in N&&(N[I].dispose(),delete N[I])}}}function O0(i,e){function t(){let P=!1,j=new pt,Y=null,de=new pt(0,0,0,0);return{setMask:function(le){Y!==le&&!P&&(i.colorMask(le,le,le,le),Y=le)},setLocked:function(le){P=le},setClear:function(le,he,Le,We,ae){ae===!0&&(le*=We,he*=We,Le*=We),j.set(le,he,Le,We),de.equals(j)===!1&&(i.clearColor(le,he,Le,We),de.copy(j))},reset:function(){P=!1,Y=null,de.set(-1,0,0,0)}}}function n(){let P=!1,j=!1,Y=null,de=null,le=null;return{setReversed:function(he){if(j!==he){let Le=e.get("EXT_clip_control");he?Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.ZERO_TO_ONE_EXT):Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.NEGATIVE_ONE_TO_ONE_EXT),j=he;let We=le;le=null,this.setClear(We)}},getReversed:function(){return j},setTest:function(he){he?oe(i.DEPTH_TEST):Pe(i.DEPTH_TEST)},setMask:function(he){Y!==he&&!P&&(i.depthMask(he),Y=he)},setFunc:function(he){if(j&&(he=qh[he]),de!==he){switch(he){case Vr:i.depthFunc(i.NEVER);break;case Hr:i.depthFunc(i.ALWAYS);break;case Wr:i.depthFunc(i.LESS);break;case qi:i.depthFunc(i.LEQUAL);break;case $r:i.depthFunc(i.EQUAL);break;case Xr:i.depthFunc(i.GEQUAL);break;case qr:i.depthFunc(i.GREATER);break;case Yr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}de=he}},setLocked:function(he){P=he},setClear:function(he){le!==he&&(le=he,j&&(he=1-he),i.clearDepth(he))},reset:function(){P=!1,Y=null,de=null,le=null,j=!1}}}function s(){let P=!1,j=null,Y=null,de=null,le=null,he=null,Le=null,We=null,ae=null;return{setTest:function(Ue){P||(Ue?oe(i.STENCIL_TEST):Pe(i.STENCIL_TEST))},setMask:function(Ue){j!==Ue&&!P&&(i.stencilMask(Ue),j=Ue)},setFunc:function(Ue,He,ve){(Y!==Ue||de!==He||le!==ve)&&(i.stencilFunc(Ue,He,ve),Y=Ue,de=He,le=ve)},setOp:function(Ue,He,ve){(he!==Ue||Le!==He||We!==ve)&&(i.stencilOp(Ue,He,ve),he=Ue,Le=He,We=ve)},setLocked:function(Ue){P=Ue},setClear:function(Ue){ae!==Ue&&(i.clearStencil(Ue),ae=Ue)},reset:function(){P=!1,j=null,Y=null,de=null,le=null,he=null,Le=null,We=null,ae=null}}}let r=new t,a=new n,o=new s,l={},c=new WeakMap,u={},d={},h={},f=new WeakMap,_=[],v=null,m=!1,p=null,M=null,w=null,E=null,A=null,b=null,g=null,S=new Ze(0,0,0),N=0,I=!1,R=null,U=null,H=null,C=null,O=null,X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),F=!1,ne=0,V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(V)[1]),F=ne>=1):V.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),F=ne>=2);let ee=null,se={},Ee=i.getParameter(i.SCISSOR_BOX),Te=i.getParameter(i.VIEWPORT),Z=new pt().fromArray(Ee),q=new pt().fromArray(Te);function Q(P,j,Y,de){let le=new Uint8Array(4),he=i.createTexture();i.bindTexture(P,he),i.texParameteri(P,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(P,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Le=0;Le<Y;Le++)P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,de,0,i.RGBA,i.UNSIGNED_BYTE,le):i.texImage2D(j+Le,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,le);return he}let pe={};pe[i.TEXTURE_2D]=Q(i.TEXTURE_2D,i.TEXTURE_2D,1),pe[i.TEXTURE_CUBE_MAP]=Q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),pe[i.TEXTURE_2D_ARRAY]=Q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),pe[i.TEXTURE_3D]=Q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),oe(i.DEPTH_TEST),a.setFunc(qi),at(!1),Be(Qo),oe(i.CULL_FACE),Ne(Si);function oe(P){u[P]!==!0&&(i.enable(P),u[P]=!0)}function Pe(P){u[P]!==!1&&(i.disable(P),u[P]=!1)}function tt(P,j){return h[P]!==j?(i.bindFramebuffer(P,j),h[P]=j,P===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=j),P===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=j),!0):!1}function Re(P,j){let Y=_,de=!1;if(P){Y=f.get(j),Y===void 0&&(Y=[],f.set(j,Y));let le=P.textures;if(Y.length!==le.length||Y[0]!==i.COLOR_ATTACHMENT0){for(let he=0,Le=le.length;he<Le;he++)Y[he]=i.COLOR_ATTACHMENT0+he;Y.length=le.length,de=!0}}else Y[0]!==i.BACK&&(Y[0]=i.BACK,de=!0);de&&i.drawBuffers(Y)}function G(P){return v!==P?(i.useProgram(P),v=P,!0):!1}let ie={[bi]:i.FUNC_ADD,[mh]:i.FUNC_SUBTRACT,[gh]:i.FUNC_REVERSE_SUBTRACT};ie[_h]=i.MIN,ie[xh]=i.MAX;let me={[vh]:i.ZERO,[yh]:i.ONE,[Mh]:i.SRC_COLOR,[il]:i.SRC_ALPHA,[wh]:i.SRC_ALPHA_SATURATE,[Th]:i.DST_COLOR,[bh]:i.DST_ALPHA,[Sh]:i.ONE_MINUS_SRC_COLOR,[sl]:i.ONE_MINUS_SRC_ALPHA,[Ah]:i.ONE_MINUS_DST_COLOR,[Eh]:i.ONE_MINUS_DST_ALPHA,[Ch]:i.CONSTANT_COLOR,[Rh]:i.ONE_MINUS_CONSTANT_COLOR,[Ih]:i.CONSTANT_ALPHA,[Ph]:i.ONE_MINUS_CONSTANT_ALPHA};function Ne(P,j,Y,de,le,he,Le,We,ae,Ue){if(P===Si){m===!0&&(Pe(i.BLEND),m=!1);return}if(m===!1&&(oe(i.BLEND),m=!0),P!==ph){if(P!==p||Ue!==I){if((M!==bi||A!==bi)&&(i.blendEquation(i.FUNC_ADD),M=bi,A=bi),Ue)switch(P){case as:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFunc(i.ONE,i.ONE);break;case tl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case nl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ze("WebGLState: Invalid blending: ",P);break}else switch(P){case as:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case tl:ze("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case nl:ze("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ze("WebGLState: Invalid blending: ",P);break}w=null,E=null,b=null,g=null,S.set(0,0,0),N=0,p=P,I=Ue}return}le=le||j,he=he||Y,Le=Le||de,(j!==M||le!==A)&&(i.blendEquationSeparate(ie[j],ie[le]),M=j,A=le),(Y!==w||de!==E||he!==b||Le!==g)&&(i.blendFuncSeparate(me[Y],me[de],me[he],me[Le]),w=Y,E=de,b=he,g=Le),(We.equals(S)===!1||ae!==N)&&(i.blendColor(We.r,We.g,We.b,ae),S.copy(We),N=ae),p=P,I=!1}function Je(P,j){P.side===wn?Pe(i.CULL_FACE):oe(i.CULL_FACE);let Y=P.side===Xt;j&&(Y=!Y),at(Y),P.blending===as&&P.transparent===!1?Ne(Si):Ne(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),a.setFunc(P.depthFunc),a.setTest(P.depthTest),a.setMask(P.depthWrite),r.setMask(P.colorWrite);let de=P.stencilWrite;o.setTest(de),de&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),ht(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?oe(i.SAMPLE_ALPHA_TO_COVERAGE):Pe(i.SAMPLE_ALPHA_TO_COVERAGE)}function at(P){R!==P&&(P?i.frontFace(i.CW):i.frontFace(i.CCW),R=P)}function Be(P){P!==uh?(oe(i.CULL_FACE),P!==U&&(P===Qo?i.cullFace(i.BACK):P===dh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Pe(i.CULL_FACE),U=P}function mt(P){P!==H&&(F&&i.lineWidth(P),H=P)}function ht(P,j,Y){P?(oe(i.POLYGON_OFFSET_FILL),(C!==j||O!==Y)&&(C=j,O=Y,a.getReversed()&&(j=-j,Y=-Y),i.polygonOffset(j,Y))):Pe(i.POLYGON_OFFSET_FILL)}function ut(P){P?oe(i.SCISSOR_TEST):Pe(i.SCISSOR_TEST)}function lt(P){P===void 0&&(P=i.TEXTURE0+X-1),ee!==P&&(i.activeTexture(P),ee=P)}function Lt(P,j,Y){Y===void 0&&(ee===null?Y=i.TEXTURE0+X-1:Y=ee);let de=se[Y];de===void 0&&(de={type:void 0,texture:void 0},se[Y]=de),(de.type!==P||de.texture!==j)&&(ee!==Y&&(i.activeTexture(Y),ee=Y),i.bindTexture(P,j||pe[P]),de.type=P,de.texture=j)}function D(){let P=se[ee];P!==void 0&&P.type!==void 0&&(i.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function yt(){try{i.compressedTexImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function nt(){try{i.compressedTexImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function st(){try{i.texSubImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function xe(){try{i.texSubImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function Mt(){try{i.compressedTexSubImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function Fe(){try{i.compressedTexSubImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function Ge(){try{i.texStorage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function T(){try{i.texStorage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function x(){try{i.texImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function z(){try{i.texImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function re(P){return d[P]!==void 0?d[P]:i.getParameter(P)}function te(P,j){d[P]!==j&&(i.pixelStorei(P,j),d[P]=j)}function ce(P){Z.equals(P)===!1&&(i.scissor(P.x,P.y,P.z,P.w),Z.copy(P))}function ge(P){q.equals(P)===!1&&(i.viewport(P.x,P.y,P.z,P.w),q.copy(P))}function J(P,j){let Y=c.get(j);Y===void 0&&(Y=new WeakMap,c.set(j,Y));let de=Y.get(P);de===void 0&&(de=i.getUniformBlockIndex(j,P.name),i.uniformBlockBinding(j,de,de),Y.set(P,de))}function K(P,j,Y){let le=c.get(j).get(P);l[le]!==Y&&(i.bindBufferBase(i.UNIFORM_BUFFER,le,Y),l[le]=Y)}function ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},d={},ee=null,se={},h={},l={},f=new WeakMap,_=[],v=null,m=!1,p=null,M=null,w=null,E=null,A=null,b=null,g=null,S=new Ze(0,0,0),N=0,I=!1,R=null,U=null,H=null,C=null,O=null,Z.set(0,0,i.canvas.width,i.canvas.height),q.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:oe,disable:Pe,bindFramebuffer:tt,drawBuffers:Re,useProgram:G,setBlending:Ne,setMaterial:Je,setFlipSided:at,setCullFace:Be,setLineWidth:mt,setPolygonOffset:ht,setScissorTest:ut,activeTexture:lt,bindTexture:Lt,unbindTexture:D,compressedTexImage2D:yt,compressedTexImage3D:nt,texImage2D:x,texImage3D:z,pixelStorei:te,getParameter:re,updateUBOMapping:J,uniformBlockBinding:K,texStorage2D:Ge,texStorage3D:T,texSubImage2D:st,texSubImage3D:xe,compressedTexSubImage2D:Mt,compressedTexSubImage3D:Fe,scissor:ce,viewport:ge,reset:ue}}function B0(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new je,u=new WeakMap,d=new Set,h,f=new WeakMap,_=new Set,v=new FinalizationRegistry(T=>_.delete(T)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(T,x){return m?new OffscreenCanvas(T,x):Zi("canvas")}function M(T,x,z){let re=1,te=Ge(T);if((te.width>z||te.height>z)&&(re=z/Math.max(te.width,te.height)),re<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let ce=Math.floor(re*te.width),ge=Math.floor(re*te.height);h===void 0&&(h=p(ce,ge));let J=x?p(ce,ge):h;return J.width=ce,J.height=ge,J.getContext("2d").drawImage(T,0,0,ce,ge),Oe("WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+ce+"x"+ge+")."),J}else return"data"in T&&Oe("WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),T;return T}function w(T){return T.generateMipmaps}function E(T){i.generateMipmap(T)}function A(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(T,x,z,re,te,ce=!1){if(T!==null){if(i[T]!==void 0)return i[T];Oe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ge;re&&(ge=e.get("EXT_texture_norm16"),ge||Oe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=x;if(x===i.RED&&(z===i.FLOAT&&(J=i.R32F),z===i.HALF_FLOAT&&(J=i.R16F),z===i.UNSIGNED_BYTE&&(J=i.R8),z===i.UNSIGNED_SHORT&&ge&&(J=ge.R16_EXT),z===i.SHORT&&ge&&(J=ge.R16_SNORM_EXT)),x===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.R8UI),z===i.UNSIGNED_SHORT&&(J=i.R16UI),z===i.UNSIGNED_INT&&(J=i.R32UI),z===i.BYTE&&(J=i.R8I),z===i.SHORT&&(J=i.R16I),z===i.INT&&(J=i.R32I)),x===i.RG&&(z===i.FLOAT&&(J=i.RG32F),z===i.HALF_FLOAT&&(J=i.RG16F),z===i.UNSIGNED_BYTE&&(J=i.RG8),z===i.UNSIGNED_SHORT&&ge&&(J=ge.RG16_EXT),z===i.SHORT&&ge&&(J=ge.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.RG8UI),z===i.UNSIGNED_SHORT&&(J=i.RG16UI),z===i.UNSIGNED_INT&&(J=i.RG32UI),z===i.BYTE&&(J=i.RG8I),z===i.SHORT&&(J=i.RG16I),z===i.INT&&(J=i.RG32I)),x===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.RGB8UI),z===i.UNSIGNED_SHORT&&(J=i.RGB16UI),z===i.UNSIGNED_INT&&(J=i.RGB32UI),z===i.BYTE&&(J=i.RGB8I),z===i.SHORT&&(J=i.RGB16I),z===i.INT&&(J=i.RGB32I)),x===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),z===i.UNSIGNED_INT&&(J=i.RGBA32UI),z===i.BYTE&&(J=i.RGBA8I),z===i.SHORT&&(J=i.RGBA16I),z===i.INT&&(J=i.RGBA32I)),x===i.RGB&&(z===i.UNSIGNED_SHORT&&ge&&(J=ge.RGB16_EXT),z===i.SHORT&&ge&&(J=ge.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),x===i.RGBA){let K=ce?ws:Ye.getTransfer(te);z===i.FLOAT&&(J=i.RGBA32F),z===i.HALF_FLOAT&&(J=i.RGBA16F),z===i.UNSIGNED_BYTE&&(J=K===it?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&ge&&(J=ge.RGBA16_EXT),z===i.SHORT&&ge&&(J=ge.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function g(T,x){let z;return T?x===null||x===fn||x===Ti?z=i.DEPTH24_STENCIL8:x===pn?z=i.DEPTH32F_STENCIL8:x===ls&&(z=i.DEPTH24_STENCIL8,Oe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===fn||x===Ti?z=i.DEPTH_COMPONENT24:x===pn?z=i.DEPTH_COMPONENT32F:x===ls&&(z=i.DEPTH_COMPONENT16),z}function S(T,x){return w(T)===!0||T.isFramebufferTexture&&T.minFilter!==Pt&&T.minFilter!==Wt?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function N(T){let x=new WeakRef(T);n.get(T).__ref=x,_.add(x),v.register(T,x,x)}function I(T){let x=n.get(T).__ref;x!==void 0&&(_.delete(x),v.unregister(x))}function R(T){H(T.target)}function U(T){C(T.target)}function H(T){T.removeEventListener("dispose",R),I(T),X(T),T.isVideoTexture&&u.delete(T),T.isHTMLTexture&&d.delete(T)}function C(T){T.removeEventListener("dispose",U),I(T),ne(T)}function O(){for(let T of _){let x=T.deref();x!==void 0&&(x.isRenderTarget===!0?C(x):H(x))}_.clear(),d.clear()}function X(T){let x=n.get(T);if(x.__webglInit===void 0)return;let z=T.source,re=f.get(z);if(re){let te=re[x.__cacheKey];te.usedTimes--,te.usedTimes===0&&F(T),Object.keys(re).length===0&&f.delete(z)}n.remove(T)}function F(T){let x=n.get(T);i.deleteTexture(x.__webglTexture);let z=T.source,re=f.get(z);delete re[x.__cacheKey],a.memory.textures--}function ne(T){let x=n.get(T);x.__depthDisposeCallback&&x.__depthDisposeCallback();let z=T.depthTexture;if(z&&z.renderTarget===T&&H(z),T.isWebGLCubeRenderTarget)for(let te=0;te<6;te++){if(Array.isArray(x.__webglFramebuffer[te]))for(let ce=0;ce<x.__webglFramebuffer[te].length;ce++)i.deleteFramebuffer(x.__webglFramebuffer[te][ce]);else i.deleteFramebuffer(x.__webglFramebuffer[te]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[te])}else{if(Array.isArray(x.__webglFramebuffer))for(let te=0;te<x.__webglFramebuffer.length;te++)i.deleteFramebuffer(x.__webglFramebuffer[te]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let te=0;te<x.__webglColorRenderbuffer.length;te++)x.__webglColorRenderbuffer[te]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[te]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let re=T.textures;for(let te=0,ce=re.length;te<ce;te++){let ge=n.get(re[te]);ge.__webglTexture&&(i.deleteTexture(ge.__webglTexture),a.memory.textures--),n.remove(re[te])}n.remove(T)}let V=0;function ee(){V=0}function se(){return V}function Ee(T){V=T}function Te(){let T=V;return T>=s.maxTextures&&Oe("WebGLTextures: Trying to use "+(T+1)+" texture units while this GPU supports only "+s.maxTextures),V+=1,T}function Z(T){let x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.mipmapsAutoUpdate),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function q(T,x){let z=n.get(T);if(T.isVideoTexture&&Mt(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&z.__version!==T.version){let re=T.image;if(re===null)Oe("WebGLRenderer: Texture marked for update but no image data found.");else if(re.complete===!1)Oe("WebGLRenderer: Texture marked for update but image is incomplete");else{Je(z,T,x);return}}else T.isExternalTexture&&(z.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+x)}function Q(T,x){let z=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&z.__version!==T.version){Je(z,T,x);return}else T.isExternalTexture&&(z.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+x)}function pe(T,x){let z=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&z.__version!==T.version){Je(z,T,x);return}t.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+x)}function oe(T,x){let z=n.get(T);if(T.version>0&&z.__version!==T.version){at(z,T,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+x)}let Pe={[Zr]:i.REPEAT,[Sn]:i.CLAMP_TO_EDGE,[Jr]:i.MIRRORED_REPEAT},tt={[Pt]:i.NEAREST,[Nh]:i.NEAREST_MIPMAP_NEAREST,[Xs]:i.NEAREST_MIPMAP_LINEAR,[Wt]:i.LINEAR,[Ea]:i.LINEAR_MIPMAP_NEAREST,[Xn]:i.LINEAR_MIPMAP_LINEAR},Re={[Bh]:i.NEVER,[bl]:i.ALWAYS,[zh]:i.LESS,[Ml]:i.LEQUAL,[kh]:i.EQUAL,[Sl]:i.GEQUAL,[Gh]:i.GREATER,[Vh]:i.NOTEQUAL};function G(T,x){if(x.type===pn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Wt||x.magFilter===Ea||x.magFilter===Xs||x.magFilter===Xn||x.minFilter===Wt||x.minFilter===Ea||x.minFilter===Xs||x.minFilter===Xn)&&Oe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,Pe[x.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,Pe[x.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,Pe[x.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,tt[x.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,tt[x.minFilter]),x.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Re[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Pt||x.minFilter!==Xs&&x.minFilter!==Xn||x.type===pn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function ie(T,x){let z=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",R),N(x));let re=x.source,te=f.get(re);te===void 0&&(te={},f.set(re,te));let ce=Z(x);if(ce!==T.__cacheKey){te[ce]===void 0&&(te[ce]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,z=!0),te[ce].usedTimes++;let ge=te[T.__cacheKey];ge!==void 0&&(te[T.__cacheKey].usedTimes--,ge.usedTimes===0&&F(x)),T.__cacheKey=ce,T.__webglTexture=te[ce].texture}return z}function me(T,x,z){return Math.floor(Math.floor(T/z)/x)}function Ne(T,x,z,re){let ce=T.updateRanges;if(ce.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,z,re,x.data);else{ce.sort((P,j)=>P.start-j.start);let ge=0;for(let P=1;P<ce.length;P++){let j=ce[ge],Y=ce[P],de=j.start+j.count,le=me(Y.start,x.width,4),he=me(j.start,x.width,4);Y.start<=de+1&&le===he&&me(Y.start+Y.count-1,x.width,4)===le?j.count=Math.max(j.count,Y.start+Y.count-j.start):(++ge,ce[ge]=Y)}ce.length=ge+1;let J=t.getParameter(i.UNPACK_ROW_LENGTH),K=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let P=0,j=ce.length;P<j;P++){let Y=ce[P],de=Math.floor(Y.start/4),le=Math.ceil(Y.count/4),he=de%x.width,Le=Math.floor(de/x.width),We=le,ae=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,he),t.pixelStorei(i.UNPACK_SKIP_ROWS,Le),t.texSubImage2D(i.TEXTURE_2D,0,he,Le,We,ae,z,re,x.data)}T.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,K),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function Je(T,x,z){let re=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(re=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(re=i.TEXTURE_3D);let te=ie(T,x),ce=x.source;t.bindTexture(re,T.__webglTexture,i.TEXTURE0+z);let ge=n.get(ce);if(ce.version!==ge.__version||te===!0){if(t.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let ae=Ye.getPrimaries(Ye.workingColorSpace),Ue=x.colorSpace===Yn?null:Ye.getPrimaries(x.colorSpace),He=x.colorSpace===Yn||ae===Ue?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,He)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let K=M(x.image,!1,s.maxTextureSize);K=Fe(x,K);let ue=r.convert(x.format,x.colorSpace),P=r.convert(x.type),j=b(x.internalFormat,ue,P,x.normalized,x.colorSpace,x.isVideoTexture);G(re,x);let Y,de=x.mipmaps,le=x.isVideoTexture!==!0,he=ge.__version===void 0||te===!0,Le=ce.dataReady,We=S(x,K);if(x.isDepthTexture)j=g(x.format===qn,x.type),he&&(le?t.texStorage2D(i.TEXTURE_2D,1,j,K.width,K.height):t.texImage2D(i.TEXTURE_2D,0,j,K.width,K.height,0,ue,P,null));else if(x.isDataTexture)if(de.length>0){le&&he&&t.texStorage2D(i.TEXTURE_2D,We,j,de[0].width,de[0].height);for(let ae=0,Ue=de.length;ae<Ue;ae++)Y=de[ae],le?Le&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Y.width,Y.height,ue,P,Y.data):t.texImage2D(i.TEXTURE_2D,ae,j,Y.width,Y.height,0,ue,P,Y.data);x.generateMipmaps=!1}else le?(he&&t.texStorage2D(i.TEXTURE_2D,We,j,K.width,K.height),Le&&Ne(x,K,ue,P)):t.texImage2D(i.TEXTURE_2D,0,j,K.width,K.height,0,ue,P,K.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){le&&he&&t.texStorage3D(i.TEXTURE_2D_ARRAY,We,j,de[0].width,de[0].height,K.depth);for(let ae=0,Ue=de.length;ae<Ue;ae++)if(Y=de[ae],x.format!==gn)if(ue!==null)if(le){if(Le)if(x.layerUpdates.size>0){let He=Il(Y.width,Y.height,x.format,x.type);for(let ve of x.layerUpdates){let rt=Y.data.subarray(ve*He/Y.data.BYTES_PER_ELEMENT,(ve+1)*He/Y.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,ve,Y.width,Y.height,1,ue,rt)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,Y.width,Y.height,K.depth,ue,Y.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,j,Y.width,Y.height,K.depth,0,Y.data,0,0);else Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else le?Le&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,Y.width,Y.height,K.depth,ue,P,Y.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,j,Y.width,Y.height,K.depth,0,ue,P,Y.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{le&&he&&t.texStorage2D(i.TEXTURE_2D,We,j,de[0].width,de[0].height);for(let ae=0,Ue=de.length;ae<Ue;ae++)Y=de[ae],x.format!==gn?ue!==null?le?Le&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,Y.width,Y.height,ue,Y.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,j,Y.width,Y.height,0,Y.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):le?Le&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Y.width,Y.height,ue,P,Y.data):t.texImage2D(i.TEXTURE_2D,ae,j,Y.width,Y.height,0,ue,P,Y.data)}else if(x.isDataArrayTexture)if(le){if(he&&t.texStorage3D(i.TEXTURE_2D_ARRAY,We,j,K.width,K.height,K.depth),Le)if(x.layerUpdates.size>0){let ae=Il(K.width,K.height,x.format,x.type);for(let Ue of x.layerUpdates){let He=K.data.subarray(Ue*ae/K.data.BYTES_PER_ELEMENT,(Ue+1)*ae/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ue,K.width,K.height,1,ue,P,He)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,ue,P,K.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,j,K.width,K.height,K.depth,0,ue,P,K.data);else if(x.isData3DTexture)le?(he&&t.texStorage3D(i.TEXTURE_3D,We,j,K.width,K.height,K.depth),Le&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,ue,P,K.data)):t.texImage3D(i.TEXTURE_3D,0,j,K.width,K.height,K.depth,0,ue,P,K.data);else if(x.isFramebufferTexture){if(he)if(le)t.texStorage2D(i.TEXTURE_2D,We,j,K.width,K.height);else{let ae=K.width,Ue=K.height;for(let He=0;He<We;He++)t.texImage2D(i.TEXTURE_2D,He,j,ae,Ue,0,ue,P,null),ae>>=1,Ue>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let ae=i.canvas;if(ae.hasAttribute("layoutsubtree")||ae.setAttribute("layoutsubtree","true"),K.parentNode!==ae){ae.appendChild(K),d.add(x),ae.onpaint=Ue=>{let He=Ue.changedElements;for(let ve of d)He.includes(ve.image)&&(ve.needsUpdate=!0)},ae.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,K);else{let He=i.RGBA,ve=i.RGBA,rt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,He,ve,rt,K)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(de.length>0){if(le&&he){let ae=Ge(de[0]);t.texStorage2D(i.TEXTURE_2D,We,j,ae.width,ae.height)}for(let ae=0,Ue=de.length;ae<Ue;ae++)Y=de[ae],le?Le&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,ue,P,Y):t.texImage2D(i.TEXTURE_2D,ae,j,ue,P,Y);x.generateMipmaps=!1}else if(le){if(he){let ae=Ge(K);t.texStorage2D(i.TEXTURE_2D,We,j,ae.width,ae.height)}Le&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,P,K)}else t.texImage2D(i.TEXTURE_2D,0,j,ue,P,K);w(x)&&x.mipmapsAutoUpdate===!0&&E(re),ge.__version=ce.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function at(T,x,z){if(x.image.length!==6)return;let re=ie(T,x),te=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+z);let ce=n.get(te);if(te.version!==ce.__version||re===!0){t.activeTexture(i.TEXTURE0+z);let ge=Ye.getPrimaries(Ye.workingColorSpace),J=x.colorSpace===Yn?null:Ye.getPrimaries(x.colorSpace),K=x.colorSpace===Yn||ge===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let ue=x.isCompressedTexture||x.image[0].isCompressedTexture,P=x.image[0]&&x.image[0].isDataTexture,j=[];for(let ve=0;ve<6;ve++)!ue&&!P?j[ve]=M(x.image[ve],!0,s.maxCubemapSize):j[ve]=P?x.image[ve].image:x.image[ve],j[ve]=Fe(x,j[ve]);let Y=j[0],de=r.convert(x.format,x.colorSpace),le=r.convert(x.type),he=b(x.internalFormat,de,le,x.normalized,x.colorSpace),Le=x.isVideoTexture!==!0,We=ce.__version===void 0||re===!0,ae=te.dataReady,Ue=S(x,Y);G(i.TEXTURE_CUBE_MAP,x);let He;if(x.isDepthTexture){if(he=g(x.format===qn,x.type),We)if(Le)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,he,Y.width,Y.height);else for(let ve=0;ve<6;ve++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,he,Y.width,Y.height,0,de,le,null)}else if(ue){Le&&We&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ue,he,Y.width,Y.height);for(let ve=0;ve<6;ve++){He=j[ve].mipmaps;for(let rt=0;rt<He.length;rt++){let Et=He[rt];x.format!==gn?de!==null?Le?ae&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt,0,0,Et.width,Et.height,de,Et.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt,he,Et.width,Et.height,0,Et.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt,0,0,Et.width,Et.height,de,le,Et.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt,he,Et.width,Et.height,0,de,le,Et.data)}}}else{if(He=x.mipmaps,Le&&We){He.length>0&&Ue++;let ve=Ge(j[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ue,he,ve.width,ve.height)}for(let ve=0;ve<6;ve++)if(P){Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,0,0,j[ve].width,j[ve].height,de,le,j[ve].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,he,j[ve].width,j[ve].height,0,de,le,j[ve].data);for(let rt=0;rt<He.length;rt++){let Jn=He[rt].image[ve].image;Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt+1,0,0,Jn.width,Jn.height,de,le,Jn.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt+1,he,Jn.width,Jn.height,0,de,le,Jn.data)}}else{Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,0,0,de,le,j[ve]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,he,de,le,j[ve]);for(let rt=0;rt<He.length;rt++){let Et=He[rt];Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt+1,0,0,de,le,Et.image[ve]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,rt+1,he,de,le,Et.image[ve])}}}w(x)&&x.mipmapsAutoUpdate===!0&&E(i.TEXTURE_CUBE_MAP),ce.__version=te.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function Be(T,x,z,re,te,ce){let ge=r.convert(z.format,z.colorSpace),J=r.convert(z.type),K=b(z.internalFormat,ge,J,z.normalized,z.colorSpace),ue=n.get(x),P=n.get(z);if(P.__renderTarget=x,!ue.__hasExternalTextures){let j=Math.max(1,x.width>>ce),Y=Math.max(1,x.height>>ce);te===i.TEXTURE_3D||te===i.TEXTURE_2D_ARRAY?t.texImage3D(te,ce,K,j,Y,x.depth,0,ge,J,null):t.texImage2D(te,ce,K,j,Y,0,ge,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),xe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,re,te,P.__webglTexture,0,st(x)):(te===i.TEXTURE_2D||te>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,re,te,P.__webglTexture,ce),t.bindFramebuffer(i.FRAMEBUFFER,null)}function mt(T,x,z){if(i.bindRenderbuffer(i.RENDERBUFFER,T),x.depthBuffer){let re=x.depthTexture,te=re&&re.isDepthTexture?re.type:null,ce=g(x.stencilBuffer,te),ge=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;xe(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,st(x),ce,x.width,x.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,st(x),ce,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ce,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ge,i.RENDERBUFFER,T)}else{let re=x.textures;for(let te=0;te<re.length;te++){let ce=re[te],ge=r.convert(ce.format,ce.colorSpace),J=r.convert(ce.type),K=b(ce.internalFormat,ge,J,ce.normalized,ce.colorSpace);xe(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,st(x),K,x.width,x.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,st(x),K,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,K,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ht(T,x,z){let re=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let te=n.get(x.depthTexture);te.__renderTarget=x;let ce=re?x.depthTexture.image[0]:x.depthTexture.image;(!te.__webglTexture||ce.width!==x.width||ce.height!==x.height)&&(ce.width=x.width,ce.height=x.height,x.depthTexture.needsUpdate=!0),re?oe(x.depthTexture,0):q(x.depthTexture,0);let ge=te.__webglTexture,J=st(x),K=re?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,ue=x.depthTexture.format===qn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Hn)xe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,K,ge,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,ue,K,ge,0);else if(x.depthTexture.format===qn)xe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,K,ge,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,ue,K,ge,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ut(T){let x=n.get(T),z=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){let re=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),re){let te=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,re.removeEventListener("dispose",te)};re.addEventListener("dispose",te),x.__depthDisposeCallback=te}x.__boundDepthTexture=re}if(T.depthTexture&&!x.__autoAllocateDepthBuffer)if(z)for(let re=0;re<6;re++)ht(x.__webglFramebuffer[re],T,re);else T.texture.mipmaps.length>0?ht(x.__webglFramebuffer[0],T,0):ht(x.__webglFramebuffer,T,0);else if(z){x.__webglDepthbuffer=[];for(let re=0;re<6;re++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[re]),x.__webglDepthbuffer[re]===void 0)x.__webglDepthbuffer[re]=i.createRenderbuffer(),mt(x.__webglDepthbuffer[re],T,!1);else{let te=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=x.__webglDepthbuffer[re];i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,te,i.RENDERBUFFER,ce)}}else if(T.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),mt(x.__webglDepthbuffer,T,!1);else{let te=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,te,i.RENDERBUFFER,ce)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function lt(T,x,z){let re=n.get(T);x!==void 0&&Be(re.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&ut(T)}function Lt(T){let x=T.texture,z=n.get(T),re=n.get(x);T.addEventListener("dispose",U),N(T);let te=T.textures,ce=T.isWebGLCubeRenderTarget===!0,ge=te.length>1;if(ge||(re.__webglTexture===void 0&&(re.__webglTexture=i.createTexture()),re.__version=x.version,a.memory.textures++),ce){z.__webglFramebuffer=[];for(let J=0;J<6;J++)if(x.mipmaps.length>0){z.__webglFramebuffer[J]=[];for(let K=0;K<x.mipmaps.length;K++)z.__webglFramebuffer[J][K]=i.createFramebuffer()}else z.__webglFramebuffer[J]=i.createFramebuffer()}else{if(x.mipmaps.length>0){z.__webglFramebuffer=[];for(let J=0;J<x.mipmaps.length;J++)z.__webglFramebuffer[J]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(ge)for(let J=0,K=te.length;J<K;J++){let ue=n.get(te[J]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&xe(T)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let J=0;J<te.length;J++){let K=te[J];z.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[J]);let ue=r.convert(K.format,K.colorSpace),P=r.convert(K.type),j=b(K.internalFormat,ue,P,K.normalized,K.colorSpace,T.isXRRenderTarget===!0),Y=st(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Y,j,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,z.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),mt(z.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ce){t.bindTexture(i.TEXTURE_CUBE_MAP,re.__webglTexture),G(i.TEXTURE_CUBE_MAP,x);for(let J=0;J<6;J++)if(x.mipmaps.length>0)for(let K=0;K<x.mipmaps.length;K++)Be(z.__webglFramebuffer[J][K],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,K);else Be(z.__webglFramebuffer[J],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);w(x)?E(i.TEXTURE_CUBE_MAP):x.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),t.unbindTexture()}else if(ge){for(let J=0,K=te.length;J<K;J++){let ue=te[J],P=n.get(ue),j=i.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(j=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(j,P.__webglTexture),G(j,ue),Be(z.__webglFramebuffer,T,ue,i.COLOR_ATTACHMENT0+J,j,0),w(ue)&&E(j)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(J=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,re.__webglTexture),G(J,x),x.mipmaps.length>0)for(let K=0;K<x.mipmaps.length;K++)Be(z.__webglFramebuffer[K],T,x,i.COLOR_ATTACHMENT0,J,K);else Be(z.__webglFramebuffer,T,x,i.COLOR_ATTACHMENT0,J,0);w(x)?E(J):x.mipmaps.length>0&&i.texParameteri(J,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),t.unbindTexture()}T.depthBuffer&&ut(T)}function D(T){let x=T.textures;for(let z=0,re=x.length;z<re;z++){let te=x[z];if(w(te)&&te.mipmapsAutoUpdate===!0){let ce=A(T),ge=n.get(te).__webglTexture;t.bindTexture(ce,ge),E(ce),t.unbindTexture()}}}let yt=[];function nt(T){if(T.samples>0){if(xe(T)===!1){let x=T.textures,z=T.width,re=T.height,te=i.COLOR_BUFFER_BIT,ce=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ge=n.get(T),J=x.length>1;if(J)for(let ue=0;ue<x.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer),T.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let ue=0;ue<x.length;ue++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(te|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(te|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ue]);let P=n.get(x[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,P,0)}i.blitFramebuffer(0,0,z,re,0,0,z,re,te,i.NEAREST),l===!0&&(yt.length=0,yt.push(i.COLOR_ATTACHMENT0+ue),T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&yt.push(ce),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,yt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let ue=0;ue<x.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ue]);let P=n.get(x[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,P,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&l){let x=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function st(T){return Math.min(s.maxSamples,T.samples)}function xe(T){let x=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Mt(T){let x=a.render.frame;u.get(T)!==x&&(u.set(T,x),T.update())}function Fe(T,x){let z=T.colorSpace,re=T.format,te=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||z!==As&&z!==Yn&&(Ye.getTransfer(z)===it?(re!==gn||te!==qt)&&Oe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ze("WebGLTextures: Unsupported texture color space:",z)),x}function Ge(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=Te,this.resetTextureUnits=ee,this.getTextureUnits=se,this.setTextureUnits=Ee,this.setTexture2D=q,this.setTexture2DArray=Q,this.setTexture3D=pe,this.setTextureCube=oe,this.rebindTextures=lt,this.setupRenderTarget=Lt,this.updateRenderTargetMipmap=D,this.updateMultisampleRenderTarget=nt,this.setupDepthRenderbuffer=ut,this.setupFrameBufferTexture=Be,this.useMultisampledRTT=xe,this.dispose=O}function z0(i,e){function t(n,s=Yn){let r,a=Ye.getTransfer(s);if(n===qt)return i.UNSIGNED_BYTE;if(n===Aa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===wa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===gl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===_l)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===pl)return i.BYTE;if(n===ml)return i.SHORT;if(n===ls)return i.UNSIGNED_SHORT;if(n===Ta)return i.INT;if(n===fn)return i.UNSIGNED_INT;if(n===pn)return i.FLOAT;if(n===mn)return i.HALF_FLOAT;if(n===xl)return i.ALPHA;if(n===vl)return i.RGB;if(n===gn)return i.RGBA;if(n===Hn)return i.DEPTH_COMPONENT;if(n===qn)return i.DEPTH_STENCIL;if(n===yl)return i.RED;if(n===Ca)return i.RED_INTEGER;if(n===ui)return i.RG;if(n===Ra)return i.RG_INTEGER;if(n===Ia)return i.RGBA_INTEGER;if(n===qs||n===Ys||n===Zs||n===Js)if(a===it)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===qs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ys)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Zs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===qs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ys)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Zs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Js)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Pa||n===La||n===Da||n===Na)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Pa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===La)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Da)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Na)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ua||n===Fa||n===Oa||n===Ba||n===za||n===Ks||n===ka)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ua||n===Fa)return a===it?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Oa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ba)return r.COMPRESSED_R11_EAC;if(n===za)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ks)return r.COMPRESSED_RG11_EAC;if(n===ka)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ga||n===Va||n===Ha||n===Wa||n===$a||n===Xa||n===qa||n===Ya||n===Za||n===Ja||n===Ka||n===ja||n===Qa||n===eo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ga)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Va)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ha)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Wa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===$a)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Xa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===qa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ya)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Za)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ja)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ka)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ja)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Qa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===eo)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===to||n===no||n===io)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===to)return a===it?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===no)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===io)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===so||n===ro||n===js||n===ao)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===so)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ro)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===js)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ao)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ti?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var k0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,G0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Wl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Fs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new An({vertexShader:k0,fragmentShader:G0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Kt(new Os(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},$l=class extends En{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,_=null,v=typeof XRWebGLBinding<"u",m=new Wl,p={},M=t.getContextAttributes(),w=null,E=null,A=[],b=[],g=new je,S=null,N=null,I=new Ht;I.viewport=new pt;let R=new Ht;R.viewport=new pt;let U=[I,R],H=new ya,C=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let q=A[Z];return q===void 0&&(q=new ji,A[Z]=q),q.getTargetRaySpace()},this.getControllerGrip=function(Z){let q=A[Z];return q===void 0&&(q=new ji,A[Z]=q),q.getGripSpace()},this.getHand=function(Z){let q=A[Z];return q===void 0&&(q=new ji,A[Z]=q),q.getHandSpace()};function X(Z){let q=b.indexOf(Z.inputSource);if(q===-1)return;let Q=A[q];Q!==void 0&&(Q.update(Z.inputSource,Z.frame,c||a),Q.dispatchEvent({type:Z.type,data:Z.inputSource}))}function F(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",F),s.removeEventListener("inputsourceschange",ne);for(let Z=0;Z<A.length;Z++){let q=b[Z];q!==null&&(b[Z]=null,A[Z].disconnect(q))}C=null,O=null,m.reset();for(let Z in p)delete p[Z];if(e.setRenderTarget(w),f=null,h=null,d=null,s=null,E=null,Te.stop(),n.isPresenting=!1,e.setPixelRatio(S),e.setSize(g.width,g.height,!1),N!==null){let Z=N.camera;Z.fov=N.fov,Z.zoom=N.zoom,Z.updateProjectionMatrix(),N=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&Oe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&Oe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(w=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",F),s.addEventListener("inputsourceschange",ne),M.xrCompatible!==!0&&await t.makeXRCompatible(),S=e.getPixelRatio(),e.getSize(g),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let Q=null,pe=null,oe=null;M.depth&&(oe=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Q=M.stencil?qn:Hn,pe=M.stencil?Ti:fn);let Pe={colorFormat:t.RGBA8,depthFormat:oe,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Pe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),E=new Jt(h.textureWidth,h.textureHeight,{format:gn,type:qt,depthTexture:new $n(h.textureWidth,h.textureHeight,pe,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let Q={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,Q),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),E=new Jt(f.framebufferWidth,f.framebufferHeight,{format:gn,type:qt,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Te.setContext(s),Te.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(Z){for(let q=0;q<Z.removed.length;q++){let Q=Z.removed[q],pe=b.indexOf(Q);pe>=0&&(b[pe]=null,A[pe].disconnect(Q))}for(let q=0;q<Z.added.length;q++){let Q=Z.added[q],pe=b.indexOf(Q);if(pe===-1){for(let Pe=0;Pe<A.length;Pe++)if(Pe>=b.length){b.push(Q),pe=Pe;break}else if(b[Pe]===null){b[Pe]=Q,pe=Pe;break}if(pe===-1)break}let oe=A[pe];oe&&oe.connect(Q)}}function V(Z,q){q===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(q.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let q=Z.near,Q=Z.far;m.texture!==null&&(m.depthNear>0&&(q=m.depthNear),m.depthFar>0&&(Q=m.depthFar)),H.near=R.near=I.near=q,H.far=R.far=I.far=Q,(C!==H.near||O!==H.far)&&(s.updateRenderState({depthNear:H.near,depthFar:H.far}),C=H.near,O=H.far),H.layers.mask=Z.layers.mask|6,I.layers.mask=H.layers.mask&-5,R.layers.mask=H.layers.mask&-3;let pe=Z.parent,oe=H.cameras;V(H,pe);for(let Pe=0;Pe<oe.length;Pe++)V(oe[Pe],pe);H.projectionMatrix.copy(I.projectionMatrix),H.projectionMatrixInverse.copy(I.projectionMatrixInverse),N===null&&Z.isPerspectiveCamera&&(N={camera:Z,fov:Z.fov,zoom:Z.zoom}),ee(Z,H,pe)};function ee(Z,q,Q){Q===null?Z.matrix.copy(q.matrixWorld):(Z.matrix.copy(Q.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(q.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(q.projectionMatrix),Z.projectionMatrixInverse.copy(q.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=jr*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Z){l=Z,h!==null&&(h.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(H)},this.getCameraTexture=function(Z){return p[Z]};let se=null;function Ee(Z,q){if(u=q.getViewerPose(c||a),_=q,u!==null){let Q=u.views;f!==null&&(e.setRenderTargetFramebuffer(E,f.framebuffer),e.setRenderTarget(E));let pe=!1;Q.length!==H.cameras.length&&(H.cameras.length=0,pe=!0);for(let Re=0;Re<Q.length;Re++){let G=Q[Re],ie=null;if(f!==null)ie=f.getViewport(G);else{let Ne=d.getViewSubImage(h,G);ie=Ne.viewport,Re===0&&(e.setRenderTargetTextures(E,Ne.colorTexture,Ne.depthStencilTexture),e.setRenderTarget(E))}let me=U[Re];me===void 0&&(me=new Ht,me.layers.enable(Re),me.viewport=new pt,U[Re]=me),me.matrix.fromArray(G.transform.matrix),me.matrix.decompose(me.position,me.quaternion,me.scale),me.projectionMatrix.fromArray(G.projectionMatrix),me.projectionMatrixInverse.copy(me.projectionMatrix).invert(),me.viewport.set(ie.x,ie.y,ie.width,ie.height),Re===0&&(H.matrix.copy(me.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),pe===!0&&H.cameras.push(me)}let oe=s.enabledFeatures;if(oe&&oe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=n.getBinding();let Re=d.getDepthInformation(Q[0]);Re&&Re.isValid&&Re.texture&&m.init(Re,s.renderState)}if(oe&&oe.includes("camera-access")&&v){e.state.unbindTexture(),d=n.getBinding();for(let Re=0;Re<Q.length;Re++){let G=Q[Re].camera;if(G){let ie=p[G];ie||(ie=new Fs,p[G]=ie);let me=d.getCameraImage(G);ie.sourceTexture=me}}}}for(let Q=0;Q<A.length;Q++){let pe=b[Q],oe=A[Q];pe!==null&&oe!==void 0&&oe.update(pe,q,c||a)}se&&se(Z,q),q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:q}),_=null}let Te=new yu;Te.setAnimationLoop(Ee),this.setAnimationLoop=function(Z){se=Z},this.dispose=function(){}}},V0=new ft,Iu=new ke;Iu.set(-1,0,0,0,1,0,0,0,1);function H0(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,wl(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,M,w,E){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,E)):p.isMeshMatcapMaterial?(r(m,p),_(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,M,w):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Xt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Xt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let M=e.get(p),w=M.envMap,E=M.envMapRotation;w&&(m.envMap.value=w,m.envMapRotation.value.setFromMatrix4(V0.makeRotationFromEuler(E)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Iu),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,w){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=w*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,M){m.ior.value=p.ior,p.diffuseRoughness>0&&(m.diffuseRoughness.value=p.diffuseRoughness,p.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=p.diffuseRoughnessMap,t(p.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Xt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=p.iridescenceThicknessMaximum,p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){let M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function W0(i,e,t,n){let s={},r={};function a(M,w){let E=w.program;n.uniformBlockBinding(M,E,s[M.id])}function o(M,w){let E=s[M.id];E===void 0&&(_(M),E=l(M),s[M.id]=E,M.addEventListener("dispose",m));let A=w.program;n.updateUBOMapping(M,A);let b=e.render.frame;r[M.id]!==b&&(c(M),r[M.id]=b)}function l(M){let w=i.createBuffer(),E=M.__size,A=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,E,A),i.bindBuffer(i.UNIFORM_BUFFER,null),w}function c(M){let w=s[M.id],E=M.uniforms,A=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let b=0,g=E.length;b<g;b++){let S=E[b];if(Array.isArray(S))for(let N=0,I=S.length;N<I;N++)u(S[N],b,N,A);else u(S,b,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(M,w,E,A){if(h(M,w,E,A)===!0){let b=M.__offset,g=M.value;if(Array.isArray(g)){let S=0;for(let N=0;N<g.length;N++){let I=g[N],R=v(I,!0);d(I,M.__data,S),S+=R.storage/Float32Array.BYTES_PER_ELEMENT}}else d(g,M.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,b,M.__data)}}function d(M,w,E){typeof M=="number"||typeof M=="boolean"?w[E]=M:M.isMatrix3?(w[E]=M.elements[0],w[E+1]=M.elements[1],w[E+2]=M.elements[2],w[E+3]=0,w[E+4]=M.elements[3],w[E+5]=M.elements[4],w[E+6]=M.elements[5],w[E+7]=0,w[E+8]=M.elements[6],w[E+9]=M.elements[7],w[E+10]=M.elements[8],w[E+11]=0):ArrayBuffer.isView(M)?w.set(M.subarray(0,w.length-E),E):M.toArray(w,E)}function h(M,w,E,A){let b=M.value,g=w+"_"+E;if(Array.isArray(b)){A[g]===void 0&&(A[g]=[]);let S=A[g],N=!1;for(let I=0;I<b.length;I++)f(b[I],S,I)===!0&&(N=!0);return N}return f(b,A,g)}function f(M,w,E){if(w[E]===void 0)return typeof M=="number"||typeof M=="boolean"?w[E]=M:ArrayBuffer.isView(M)?w[E]=M.slice():w[E]=M.clone(),!0;{let A=w[E];if(typeof M=="number"||typeof M=="boolean"){if(A!==M)return w[E]=M,!0}else{if(ArrayBuffer.isView(M))return!0;if(A.equals(M)===!1)return A.copy(M),!0}}return!1}function _(M){let w=M.uniforms,E=0,A=16;for(let g=0,S=w.length;g<S;g++){let N=Array.isArray(w[g])?w[g]:[w[g]];for(let I=0,R=N.length;I<R;I++){let U=N[I],H=Array.isArray(U.value)?U.value:[U.value],C=Array.isArray(w[g])||Array.isArray(U.value),O=E;for(let F=0,ne=H.length;F<ne;F++){let V=H[F],ee=v(V,C),se=E%A,Ee=se%ee.boundary,Te=se+Ee;E+=Ee,Te!==0&&A-Te<ee.storage&&(E+=A-Te),F===0&&(O=E),E+=ee.storage}let X=U.type==="int"?Int32Array:U.type==="uint"?Uint32Array:Float32Array;U.__data=new X((E-O)/Float32Array.BYTES_PER_ELEMENT),U.__offset=O}}let b=E%A;return b>0&&(E+=A-b),M.__size=E,M.__cache={},this}function v(M,w){let E={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(E.boundary=4,E.storage=4):M.isVector2?(E.boundary=8,E.storage=8):M.isVector3||M.isColor?(E.boundary=16,E.storage=12):M.isVector4?(E.boundary=16,E.storage=16):M.isMatrix3?(E.boundary=16,E.storage=48):M.isMatrix4?(E.boundary=16,E.storage=64):M.isTexture?Oe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(E.boundary=16,E.storage=M.byteLength):Oe("WebGLRenderer: Unsupported uniform value type.",M),w===!0&&(E.boundary=16,E.storage=Math.ceil(E.storage/16)*16),E}function m(M){let w=M.target;w.removeEventListener("dispose",m),i.deleteBuffer(s[w.id]),delete s[w.id],delete r[w.id]}function p(){for(let M in s)i.deleteBuffer(s[M]);s={},r={}}return{bind:a,update:o,dispose:p}}var $0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Rn=null;function X0(){return Rn===null&&(Rn=new sa($0,16,16,ui,mn),Rn.name="DFG_LUT",Rn.minFilter=Wt,Rn.magFilter=Wt,Rn.wrapS=Sn,Rn.wrapT=Sn,Rn.generateMipmaps=!1,Rn.needsUpdate=!0),Rn}var uo=class{constructor(e={}){let{canvas:t=Wh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:f=qt}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=a;let v=f,m=new Set([Ia,Ra,Ca]),p=new Set([qt,fn,ls,Ti,Aa,wa]),M=new Uint32Array(4),w=new Int32Array(4),E={textures:[],min:[],max:[],resolution:[]},A=null,b=null,g=[],S=[],N=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Cn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,R=!1,U=null,H=null,C=null,O=null;this._outputColorSpace=Rt;let X=0,F=0,ne=null,V=-1,ee=null,se=new pt,Ee=new pt,Te=null,Z=new Ze(0),q=0,Q=t.width,pe=t.height,oe=1,Pe=null,tt=null,Re=new pt(0,0,Q,pe),G=new pt(0,0,Q,pe),ie=!1,me=new ai,Ne=new ra,Je=!1,at=!1,Be=new ft,mt=new $,ht=new pt,ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},lt=!1;function Lt(){return ne===null?oe:1}let D=n;function yt(y,L){return t.getContext(y,L)}let nt,st,xe,Mt,Fe,Ge,T,x,z,re,te,ce,ge,J,K,ue,P,j,Y,de,le,he,Le;try{let y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Ue,!1),t.addEventListener("webglcontextrestored",He,!1),t.addEventListener("webglcontextcreationerror",ve,!1),D===null){let L="webgl2";if(D=yt(L,y),D===null)throw yt(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}We()}catch(y){throw t.removeEventListener("webglcontextlost",Ue,!1),t.removeEventListener("webglcontextrestored",He,!1),t.removeEventListener("webglcontextcreationerror",ve,!1),ze("WebGLRenderer: "+y.message),y}function We(){nt=new ig(D),nt.init(),le=new z0(D,nt),st=new Xm(D,nt,e,le),xe=new O0(D,nt),st.reversedDepthBuffer&&h&&xe.buffers.depth.setReversed(!0),H=D.createFramebuffer(),C=D.createFramebuffer(),O=D.createFramebuffer(),Mt=new ag(D),Fe=new b0,Ge=new B0(D,nt,xe,Fe,st,le,Mt),T=new ng(I),x=new lf(D),he=new Wm(D,x),z=new sg(D,x,Mt,he),re=new lg(D,z,x,he,Mt),j=new og(D,st,Ge),K=new qm(Fe),te=new S0(I,T,nt,st,he,K),ce=new H0(I,Fe),ge=new T0,J=new P0(nt),P=new Hm(I,T,xe,re,_,l),ue=new F0(I,re,st),Le=new W0(D,Mt,st,xe),Y=new $m(D,nt,Mt),de=new rg(D,nt,Mt),Mt.programs=te.programs,I.capabilities=st,I.extensions=nt,I.properties=Fe,I.renderLists=ge,I.shadowMap=ue,I.state=xe,I.info=Mt}v!==qt&&(N=new hg(v,t.width,t.height,o,s,r));let ae=new $l(I,D);this.xr=ae,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let y=nt.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){let y=nt.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return oe},this.setPixelRatio=function(y){y!==void 0&&(oe=y,this.setSize(Q,pe,!1))},this.getSize=function(y){return y.set(Q,pe)},this.setSize=function(y,L,W=!0){if(ae.isPresenting){Oe("WebGLRenderer: Can't change size while VR device is presenting.");return}Q=y,pe=L,t.width=Math.floor(y*oe),t.height=Math.floor(L*oe),W===!0&&(t.style.width=y+"px",t.style.height=L+"px"),N!==null&&N.setSize(t.width,t.height),this.setViewport(0,0,y,L)},this.getDrawingBufferSize=function(y){return y.set(Q*oe,pe*oe).floor()},this.setDrawingBufferSize=function(y,L,W){Q=y,pe=L,oe=W,t.width=Math.floor(y*W),t.height=Math.floor(L*W),this.setViewport(0,0,y,L)},this.setEffects=function(y){if(v===qt){ze("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let L=0;L<y.length;L++)if(y[L].isOutputPass===!0){Oe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}N.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(se)},this.getViewport=function(y){return y.copy(Re)},this.setViewport=function(y,L,W,B){y.isVector4?Re.set(y.x,y.y,y.z,y.w):Re.set(y,L,W,B),xe.viewport(se.copy(Re).multiplyScalar(Lt()).round())},this.getScissor=function(y){return y.copy(G)},this.setScissor=function(y,L,W,B){y.isVector4?G.set(y.x,y.y,y.z,y.w):G.set(y,L,W,B),xe.scissor(Ee.copy(G).multiplyScalar(Lt()).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(y){xe.setScissorTest(ie=y)},this.setOpaqueSort=function(y){Pe=y},this.setTransparentSort=function(y){tt=y},this.getClearColor=function(y){return y.copy(P.getClearColor())},this.setClearColor=function(){P.setClearColor(...arguments)},this.getClearAlpha=function(){return P.getClearAlpha()},this.setClearAlpha=function(){P.setClearAlpha(...arguments)},this.clear=function(y=!0,L=!0,W=!0){let B=0;if(y){let k=!1;if(ne!==null){let _e=ne.texture.format;k=m.has(_e)}if(k){let _e=ne.texture.type,Ae=p.has(_e),fe=P.getClearColor(),Me=P.getClearAlpha(),Ie=fe.r,Ve=fe.g,Xe=fe.b;Ae?(M[0]=Ie,M[1]=Ve,M[2]=Xe,M[3]=Me,D.clearBufferuiv(D.COLOR,0,M)):(w[0]=Ie,w[1]=Ve,w[2]=Xe,w[3]=Me,D.clearBufferiv(D.COLOR,0,w))}else B|=D.COLOR_BUFFER_BIT}L&&(B|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(B|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B!==0&&D.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),U=y},this.dispose=function(){t.removeEventListener("webglcontextlost",Ue,!1),t.removeEventListener("webglcontextrestored",He,!1),t.removeEventListener("webglcontextcreationerror",ve,!1),P.dispose(),ge.dispose(),J.dispose(),Ge.dispose(),Fe.dispose(),T.dispose(),re.dispose(),z.dispose(),he.dispose(),Le.dispose(),te.dispose(),ae.dispose(),ae.removeEventListener("sessionstart",Jl),ae.removeEventListener("sessionend",Kl),di.stop()};function Ue(y){y.preventDefault(),Tl("WebGLRenderer: Context Lost."),R=!0}function He(){Tl("WebGLRenderer: Context Restored."),R=!1;let y=Mt.autoReset,L=ue.enabled,W=ue.autoUpdate,B=ue.needsUpdate,k=ue.type;We(),Mt.autoReset=y,ue.enabled=L,ue.autoUpdate=W,ue.needsUpdate=B,ue.type=k}function ve(y){ze("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function rt(y){let L=y.target;L.removeEventListener("dispose",rt),Et(L)}function Et(y){Jn(y),Fe.remove(y)}function Jn(y){let L=Fe.get(y).programs;L!==void 0&&(L.forEach(function(W){te.releaseProgram(W)}),y.isShaderMaterial&&te.releaseShaderCache(y))}this.renderBufferDirect=function(y,L,W,B,k,_e){L===null&&(L=ut);let Ae=k.isMesh&&k.matrixWorld.determinantAffine()<0,fe=Yu(y,L,W,B,k);xe.setMaterial(B,Ae);let Me=W.index,Ie=1;if(B.wireframe===!0){if(Me=z.getWireframeAttribute(W),Me===void 0)return;Ie=2}let Ve=W.drawRange,Xe=W.attributes.position,we=Ve.start*Ie,qe=(Ve.start+Ve.count)*Ie;_e!==null&&(we=Math.max(we,_e.start*Ie),qe=Math.min(qe,(_e.start+_e.count)*Ie)),Me!==null?(we=Math.max(we,0),qe=Math.min(qe,Me.count)):Xe!=null&&(we=Math.max(we,0),qe=Math.min(qe,Xe.count));let xt=qe-we;if(xt<0||xt===1/0)return;he.setup(k,B,fe,W,Me);let ct,ot=Y;if(Me!==null&&(ct=x.get(Me),ot=de,ot.setIndex(ct)),k.isMesh)B.wireframe===!0?(xe.setLineWidth(B.wireframeLinewidth*Lt()),ot.setMode(D.LINES)):ot.setMode(D.TRIANGLES);else if(k.isLine){let Ut=B.linewidth;Ut===void 0&&(Ut=1),xe.setLineWidth(Ut*Lt()),k.isLineSegments?ot.setMode(D.LINES):k.isLineLoop?ot.setMode(D.LINE_LOOP):ot.setMode(D.LINE_STRIP)}else k.isPoints?ot.setMode(D.POINTS):k.isSprite&&ot.setMode(D.TRIANGLES);if(k.isBatchedMesh)if(nt.get("WEBGL_multi_draw"))ot.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{let Ut=k._multiDrawStarts,Ce=k._multiDrawCounts,Vt=k._multiDrawCount,et=Me?x.get(Me).bytesPerElement:1,fi=Fe.get(B).currentProgram.getUniforms();for(let Ft=0;Ft<Vt;Ft++)fi.setValue(D,"_gl_DrawID",Ft),ot.render(Ut[Ft]/et,Ce[Ft])}else if(k.isInstancedMesh)ot.renderInstances(we,xt,k.count);else if(W.isInstancedBufferGeometry){let Ut=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Ce=Math.min(W.instanceCount,Ut);ot.renderInstances(we,xt,Ce)}else ot.render(we,xt)};function Zl(y,L,W,B){U!==null&&y.isNodeMaterial&&U.setObject(B,y),Je===!0&&K.setState(y,W,!1),y.transparent===!0&&y.side===wn&&y.forceSinglePass===!1?(y.side=Xt,y.needsUpdate=!0,ds(y,L,B),y.side=hi,y.needsUpdate=!0,ds(y,L,B),y.side=wn):ds(y,L,B)}this.compile=function(y,L,W=null){W===null&&(W=y),U!==null&&U.renderStart(y,L,W),b=J.get(W),b.init(L),S.push(b),W.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(b.pushLight(k),k.castShadow&&b.pushShadow(k))}),y!==W&&y.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(b.pushLight(k),k.castShadow&&b.pushShadow(k))}),b.setupLights(),U!==null&&U.updateLights(b.state.lightsArray),at=this.localClippingEnabled,Je=K.init(this.clippingPlanes,at),Je===!0&&K.setGlobalState(this.clippingPlanes,L),U!==null&&ue.render(b.state.shadowsArray,W,L);let B=new Set;return y.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;let _e=k.material;if(_e)if(Array.isArray(_e))for(let Ae=0;Ae<_e.length;Ae++){let fe=_e[Ae];Zl(fe,W,L,k),B.add(fe)}else Zl(_e,W,L,k),B.add(_e)}),b=S.pop(),U!==null&&U.renderEnd(),B},this.compileAsync=function(y,L,W=null){let B=this.compile(y,L,W);return new Promise(k=>{function _e(){if(B.forEach(function(Ae){let Me=Fe.get(Ae).currentProgram;(Me===void 0||Me.isReady())&&B.delete(Ae)}),B.size===0){k(y);return}setTimeout(_e,10)}nt.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let go=null;function Xu(y){go&&go(y)}function Jl(){di.stop()}function Kl(){di.start()}let di=new yu;di.setAnimationLoop(Xu),typeof self<"u"&&di.setContext(self),this.setAnimationLoop=function(y){go=y,ae.setAnimationLoop(y),y===null?di.stop():di.start()},ae.addEventListener("sessionstart",Jl),ae.addEventListener("sessionend",Kl),this.render=function(y,L){if(L!==void 0&&L.isCamera!==!0){ze("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;U!==null&&U.renderStart(y,L);let W=ae.enabled===!0&&ae.isPresenting===!0,B=N!==null&&(ne===null||W)&&N.begin(I,ne);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),ae.enabled===!0&&ae.isPresenting===!0&&(N===null||N.isCompositing()===!1)&&(ae.cameraAutoUpdate===!0&&ae.updateCamera(L),L=ae.getCamera()),y.isScene===!0&&y.onBeforeRender(I,y,L,ne),b=J.get(y,S.length),b.init(L),b.state.textureUnits=Ge.getTextureUnits(),S.push(b),Be.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),L.isArrayCamera?Ne.setFromArrayCamera(L):me.setFromProjectionMatrix(Be,nn,L.reversedDepth),at=this.localClippingEnabled,Je=K.init(this.clippingPlanes,at),A=ge.get(y,g.length),A.init(),g.push(A),this.info.render.frame++,ae.enabled===!0&&ae.isPresenting===!0){let Ae=I.xr.getDepthSensingMesh();Ae!==null&&_o(Ae,L,-1/0,I.sortObjects)}_o(y,L,0,I.sortObjects),A.finish(),U!==null&&U.updateLights(b.state.lightsArray),I.sortObjects===!0&&A.sort(Pe,tt),lt=ae.enabled===!1||ae.isPresenting===!1||ae.hasDepthSensing()===!1,lt&&P.addToRenderList(A,y),this.info.autoReset===!0&&this.info.reset(),Je===!0&&K.beginShadows();let k=b.state.shadowsArray;if(ue.render(k,y,L),Je===!0&&K.endShadows(),(B&&N.hasRenderPass())===!1){let Ae=A.opaque,fe=A.transmissive;if(b.setupLights(),L.isArrayCamera){let Me=L.cameras;if(fe.length>0)for(let Ie=0,Ve=Me.length;Ie<Ve;Ie++){let Xe=Me[Ie];Ql(Ae,fe,y,Xe)}lt&&P.render(y);for(let Ie=0,Ve=Me.length;Ie<Ve;Ie++){let Xe=Me[Ie];jl(A,y,Xe,Xe.viewport)}}else fe.length>0&&Ql(Ae,fe,y,L),lt&&P.render(y),jl(A,y,L)}ne!==null&&F===0&&(Ge.updateMultisampleRenderTarget(ne),Ge.updateRenderTargetMipmap(ne)),B&&N.end(I),y.isScene===!0&&y.onAfterRender(I,y,L),he.resetDefaultState(),V=-1,ee=null,S.pop(),S.length>0?(b=S[S.length-1],Ge.setTextureUnits(b.state.textureUnits),Je===!0&&K.setGlobalState(I.clippingPlanes,b.state.camera)):b=null,g.pop(),g.length>0?A=g[g.length-1]:A=null,U!==null&&U.renderEnd()};function _o(y,L,W,B){if(y.visible===!1)return;if(y.layers.test(L.layers)){if(y.isGroup)W=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(L);else if(y.isLight)b.pushLight(y),y.castShadow&&b.pushShadow(y);else if(y.isSprite){let Ae=L.isArrayCamera?Ne:me;if(!y.frustumCulled||y.intersectsFrustum(Ae)){B&&ht.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Be);let fe=re.update(y),Me=y.material;Me.visible&&A.push(y,fe,Me,W,ht.z,null,L)}}else if(y.isMesh||y.isLine||y.isPoints){let Ae=L.isArrayCamera?Ne:me;if(!y.frustumCulled||y.intersectsFrustum(Ae)){let fe=re.update(y),Me=y.material;if(B&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),ht.copy(y.boundingSphere.center)):(fe.boundingSphere===null&&fe.computeBoundingSphere(),ht.copy(fe.boundingSphere.center)),ht.applyMatrix4(y.matrixWorld).applyMatrix4(Be)),Array.isArray(Me)){let Ie=fe.groups;for(let Ve=0,Xe=Ie.length;Ve<Xe;Ve++){let we=Ie[Ve],qe=Me[we.materialIndex];qe&&qe.visible&&A.push(y,fe,qe,W,ht.z,we,L)}}else Me.visible&&A.push(y,fe,Me,W,ht.z,null,L)}}}let _e=y.children;for(let Ae=0,fe=_e.length;Ae<fe;Ae++)_o(_e[Ae],L,W,B)}function jl(y,L,W,B){let{opaque:k,transmissive:_e,transparent:Ae}=y;b.setupLightsView(W),Je===!0&&K.setGlobalState(I.clippingPlanes,W),B&&xe.viewport(se.copy(B)),k.length>0&&rr(k,L,W),_e.length>0&&rr(_e,L,W),Ae.length>0&&rr(Ae,L,W),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function Ql(y,L,W,B){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[B.id]===void 0){let we=nt.has("EXT_color_buffer_half_float")||nt.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[B.id]=new Jt(1,1,{generateMipmaps:!0,type:we?mn:qt,minFilter:Xn,samples:Math.max(4,st.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ye.workingColorSpace})}let _e=b.state.transmissionRenderTarget[B.id],Ae=B.viewport||se;_e.setSize(Ae.z*I.transmissionResolutionScale,Ae.w*I.transmissionResolutionScale);let fe=I.getRenderTarget(),Me=I.getActiveCubeFace(),Ie=I.getActiveMipmapLevel();I.setRenderTarget(_e),I.getClearColor(Z),q=I.getClearAlpha(),q<1&&I.setClearColor(16777215,.5),I.clear(),lt&&P.render(W);let Ve=I.toneMapping;I.toneMapping=Cn;let Xe=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),b.setupLightsView(B),Je===!0&&K.setGlobalState(I.clippingPlanes,B),rr(y,W,B),Ge.updateMultisampleRenderTarget(_e),Ge.updateRenderTargetMipmap(_e),nt.has("WEBGL_multisampled_render_to_texture")===!1){let we=!1;for(let qe=0,xt=L.length;qe<xt;qe++){let ct=L[qe],{object:ot,geometry:Ut,material:Ce,group:Vt}=ct;if(Ce.side===wn&&ot.layers.test(B.layers)){let et=Ce.side;Ce.side=Xt,Ce.needsUpdate=!0,ec(ot,W,B,Ut,Ce,Vt),Ce.side=et,Ce.needsUpdate=!0,we=!0}}we===!0&&(Ge.updateMultisampleRenderTarget(_e),Ge.updateRenderTargetMipmap(_e))}I.setRenderTarget(fe,Me,Ie),I.setClearColor(Z,q),Xe!==void 0&&(B.viewport=Xe),I.toneMapping=Ve}function rr(y,L,W){let B=L.isScene===!0?L.overrideMaterial:null;for(let k=0,_e=y.length;k<_e;k++){let Ae=y[k],{object:fe,geometry:Me,group:Ie}=Ae,Ve=Ae.material;Ve.allowOverride===!0&&B!==null&&(Ve=B),fe.layers.test(W.layers)&&ec(fe,L,W,Me,Ve,Ie)}}function ec(y,L,W,B,k,_e){U!==null&&k.isNodeMaterial&&U.setObject(y,k),y.onBeforeRender(I,L,W,B,k,_e),y.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),k.onBeforeRender(I,L,W,B,y,_e),k.transparent===!0&&k.side===wn&&k.forceSinglePass===!1?(k.side=Xt,k.needsUpdate=!0,I.renderBufferDirect(W,L,B,k,y,_e),k.side=hi,k.needsUpdate=!0,I.renderBufferDirect(W,L,B,k,y,_e),k.side=wn):I.renderBufferDirect(W,L,B,k,y,_e),y.onAfterRender(I,L,W,B,k,_e)}function tc(y){let L=0;for(let W of y)W.texture!==null&&L++;return L}function ds(y,L,W){L.isScene!==!0&&(L=ut);let B=Fe.get(y),k=b.state.lights,_e=b.state.shadowsArray,Ae=k.state.version,fe=te.getParameters(y,k.state,_e,L,W,b.state.lightProbeGridArray),Me=te.getProgramCacheKey(fe),Ie=B.programs;B.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,B.fog=L.fog;let Ve=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;B.envMap=T.get(y.envMap||B.environment,Ve),B.envMapRotation=B.environment!==null&&y.envMap===null?L.environmentRotation:y.envMapRotation,Ie===void 0&&(y.addEventListener("dispose",rt),Ie=new Map,B.programs=Ie,B.programVariants=new Map);let Xe=Ie.get(Me);if(Xe!==void 0){if(B.currentProgram===Xe&&B.lightsStateVersion===Ae)return ic(y,fe),Xe}else fe.uniforms=te.getUniforms(y),U!==null&&y.isNodeMaterial&&U.build(y,W,fe),y.onBeforeCompile(fe,I),Xe=te.acquireProgram(fe,Me),Ie.set(Me,Xe),B.uniforms=fe.uniforms;let we=B.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(we.clippingPlanes=K.uniform),ic(y,fe),B.needsLights=Ju(y),B.lightsStateVersion=Ae,B.needsLights&&(we.ambientLightColor.value=k.state.ambient,we.lightProbe.value=k.state.probe,we.sunLights.value=k.state.sun,we.sunLightShadows.value=k.state.sunShadow,we.directionalLights.value=k.state.directional,we.directionalLightShadows.value=k.state.directionalShadow,we.spotLights.value=k.state.spot,we.spotLightShadows.value=k.state.spotShadow,we.rectAreaLights.value=k.state.rectArea,we.ltc_1.value=k.state.rectAreaLTC1,we.ltc_2.value=k.state.rectAreaLTC2,we.pointLights.value=k.state.point,we.pointLightShadows.value=k.state.pointShadow,we.hemisphereLights.value=k.state.hemi,we.sunShadowMatrix.value=k.state.sunShadowMatrix,we.sunShadowCascade.value=k.state.sunShadowCascade,we.directionalShadowMatrix.value=k.state.directionalShadowMatrix,we.spotLightMatrix.value=k.state.spotLightMatrix,we.spotLightMap.value=k.state.spotLightMap,we.pointShadowMatrix.value=k.state.pointShadowMatrix),B.numLightProbeGrids=tc(b.state.lightProbeGridArray),B.currentProgram=Xe,B.uniformsList=null,Xe}function qu(y,L,W,B,k){let _e=Fe.get(y),Ae=_e.currentProgram.id+","+B+","+k,fe=_e.programVariants.get(Ae);return fe===void 0?(fe=ds(y,L,W),_e.programVariants.set(Ae,fe)):(_e.currentProgram=fe,_e.uniformsList=null,_e.outputColorSpace=B,_e.toneMapping=k),fe}function nc(y){if(y.uniformsList===null){let L=y.currentProgram.getUniforms();y.uniformsList=cs.seqWithValue(L.seq,y.uniforms)}return y.uniformsList}function ic(y,L){let W=Fe.get(y);W.outputColorSpace=L.outputColorSpace,W.batching=L.batching,W.batchingColor=L.batchingColor,W.instancing=L.instancing,W.instancingColor=L.instancingColor,W.instancingMorph=L.instancingMorph,W.skinning=L.skinning,W.morphTargets=L.morphTargets,W.morphNormals=L.morphNormals,W.morphColors=L.morphColors,W.morphTargetsCount=L.morphTargetsCount,W.numClippingPlanes=L.numClippingPlanes,W.numIntersection=L.numClipIntersection,W.vertexAlphas=L.vertexAlphas,W.vertexTangents=L.vertexTangents,W.toneMapping=L.toneMapping}function Yu(y,L,W,B,k){L.isScene!==!0&&(L=ut),Ge.resetTextureUnits();let _e=L.fog,Ae=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?L.environment:null,fe=ne===null?I.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:Ye.workingColorSpace,Me=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap,Ie=T.get(B.envMap||Ae,Me),Ve=B.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Xe=!!W.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),we=!!W.morphAttributes.position,qe=!!W.morphAttributes.normal,xt=!!W.morphAttributes.color,ct=Cn;B.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(ct=I.toneMapping);let ot=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Ut=ot!==void 0?ot.length:0,Ce=Fe.get(B),Vt=b.state.lights;if(Je===!0&&(at===!0||y!==ee)){let gt=y===ee&&B.id===V;K.setState(B,y,gt)}let et=!1,fi=!1;B.version===Ce.__version?Ce.needsLights&&Ce.lightsStateVersion!==Vt.state.version||k.isBatchedMesh&&Ce.batching===!1||!k.isBatchedMesh&&Ce.batching===!0||k.isBatchedMesh&&Ce.batchingColor===!0&&k._colorsTexture===null||k.isBatchedMesh&&Ce.batchingColor===!1&&k._colorsTexture!==null||k.isInstancedMesh&&Ce.instancing===!1||!k.isInstancedMesh&&Ce.instancing===!0||k.isSkinnedMesh&&Ce.skinning===!1||!k.isSkinnedMesh&&Ce.skinning===!0||k.isInstancedMesh&&Ce.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Ce.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Ce.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Ce.instancingMorph===!1&&k.morphTexture!==null||Ce.envMap!==Ie||B.fog===!0&&Ce.fog!==_e||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==K.numPlanes||Ce.numIntersection!==K.numIntersection)||Ce.vertexAlphas!==Ve||Ce.vertexTangents!==Xe||Ce.morphTargets!==we||Ce.morphNormals!==qe||Ce.morphColors!==xt||Ce.morphTargetsCount!==Ut||Ce.numLightProbeGrids!==tc(b.state.lightProbeGridArray)?et=!0:(Ce.outputColorSpace!==fe||Ce.toneMapping!==ct)&&(fi=!0):(et=!0,Ce.__version=B.version);let Ft=Ce.currentProgram;(et===!0||fi===!0)&&(Ft=fi===!0?qu(B,L,k,fe,ct):ds(B,L,k),U&&B.isNodeMaterial&&U.onUpdateProgram(B,Ft,Ce));let ar=!1,Kn=!1,pi=!1,Qe=Ft.getUniforms(),Dt=Ce.uniforms;if(xe.useProgram(Ft.program)&&(ar=!0,Kn=!0,pi=!0),B.id!==V&&(V=B.id,Kn=!0),ar||ee!==y){xe.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),Qe.setValue(D,"projectionMatrix",y.projectionMatrix),Qe.setValue(D,"viewMatrix",y.matrixWorldInverse);let Tt=Qe.map.cameraPosition;Tt!==void 0&&Tt.setValue(D,mt.setFromMatrixPosition(y.matrixWorld)),st.logarithmicDepthBuffer&&Qe.setValue(D,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&Qe.setValue(D,"isOrthographic",y.isOrthographicCamera===!0),ee!==y&&(ee=y,Kn=!0,pi=!0)}if(Ce.needsLights&&(Vt.state.sunShadowMap.length>0&&Qe.setValue(D,"sunShadowMap",Vt.state.sunShadowMap,Ge),Vt.state.directionalShadowMap.length>0&&Qe.setValue(D,"directionalShadowMap",Vt.state.directionalShadowMap,Ge),Vt.state.spotShadowMap.length>0&&Qe.setValue(D,"spotShadowMap",Vt.state.spotShadowMap,Ge),Vt.state.pointShadowMap.length>0&&Qe.setValue(D,"pointShadowMap",Vt.state.pointShadowMap,Ge)),k.isSkinnedMesh){Qe.setOptional(D,k,"bindMatrix"),Qe.setOptional(D,k,"bindMatrixInverse");let gt=k.skeleton;gt&&(gt.boneTexture===null&&gt.computeBoneTexture(),Qe.setValue(D,"boneTexture",gt.boneTexture,Ge))}k.isBatchedMesh&&(Qe.setOptional(D,k,"batchingTexture"),Qe.setValue(D,"batchingTexture",k._matricesTexture,Ge),Qe.setOptional(D,k,"batchingIdTexture"),Qe.setValue(D,"batchingIdTexture",k._indirectTexture,Ge),Qe.setOptional(D,k,"batchingColorTexture"),k._colorsTexture!==null&&Qe.setValue(D,"batchingColorTexture",k._colorsTexture,Ge));let sn=W.morphAttributes;if((sn.position!==void 0||sn.normal!==void 0||sn.color!==void 0)&&j.update(k,W,Ft),(Kn||Ce.receiveShadow!==k.receiveShadow)&&(Ce.receiveShadow=k.receiveShadow,Qe.setValue(D,"receiveShadow",k.receiveShadow)),(B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial)&&B.envMap===null&&L.environment!==null&&(Dt.envMapIntensity.value=L.environmentIntensity),Dt.dfgLUT!==void 0&&(Dt.dfgLUT.value=X0()),Kn){if(Qe.setValue(D,"toneMappingExposure",I.toneMappingExposure),Ce.needsLights&&Zu(Dt,pi),_e&&B.fog===!0&&ce.refreshFogUniforms(Dt,_e),ce.refreshMaterialUniforms(Dt,B,oe,pe,b.state.transmissionRenderTarget[y.id]),Ce.needsLights&&Ce.numLightProbeGrids>0){let gt=E,Tt=0;for(let Ln of b.state.lightProbeGridArray)Ln.texture!==null&&(gt.textures[Tt]=Ln.texture,gt.min[Tt]=Ln.boundingBox.min,gt.max[Tt]=Ln.boundingBox.max,gt.resolution[Tt]=Ln.resolution,Tt++);for(let Ln in gt)gt[Ln].length=Tt;Dt.probesSH.value=gt.textures,Dt.probesMin.value=gt.min,Dt.probesMax.value=gt.max,Dt.probesResolution.value=gt.resolution}cs.upload(D,nc(Ce),Dt,Ge)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(cs.upload(D,nc(Ce),Dt,Ge),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&Qe.setValue(D,"center",k.center),Qe.setValue(D,"modelViewMatrix",k.modelViewMatrix),Qe.setValue(D,"normalMatrix",k.normalMatrix),Qe.setValue(D,"modelMatrix",k.matrixWorld),B.uniformsGroups!==void 0){let gt=B.uniformsGroups;for(let Tt=0,Ln=gt.length;Tt<Ln;Tt++){let rc=gt[Tt];Le.update(rc,Ft),Le.bind(rc,Ft)}}return Ft}function Zu(y,L){y.ambientLightColor.needsUpdate=L,y.lightProbe.needsUpdate=L,y.sunLights.needsUpdate=L,y.sunLightShadows.needsUpdate=L,y.directionalLights.needsUpdate=L,y.directionalLightShadows.needsUpdate=L,y.pointLights.needsUpdate=L,y.pointLightShadows.needsUpdate=L,y.spotLights.needsUpdate=L,y.spotLightShadows.needsUpdate=L,y.rectAreaLights.needsUpdate=L,y.hemisphereLights.needsUpdate=L}function Ju(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(y,L,W){let B=Fe.get(y);B.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1&&(B.__useRenderToTexture=!1),Fe.get(y.texture).__webglTexture=L,Fe.get(y.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:W,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,L){let W=Fe.get(y);W.__webglFramebuffer=L,W.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(y,L=0,W=0){ne=y,X=L,F=W;let B=null,k=!1,_e=!1;if(y){let fe=Fe.get(y);if(fe.__useDefaultFramebuffer!==void 0){xe.bindFramebuffer(D.FRAMEBUFFER,fe.__webglFramebuffer),se.copy(y.viewport),Ee.copy(y.scissor),Te=y.scissorTest,xe.viewport(se),xe.scissor(Ee),xe.setScissorTest(Te),V=-1;return}else if(fe.__webglFramebuffer===void 0)Ge.setupRenderTarget(y);else if(fe.__hasExternalTextures)Ge.rebindTextures(y,Fe.get(y.texture).__webglTexture,Fe.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let Ve=y.depthTexture;if(fe.__boundDepthTexture!==Ve){if(Ve!==null&&Fe.has(Ve)&&(y.width!==Ve.image.width||y.height!==Ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Ge.setupDepthRenderbuffer(y)}}let Me=y.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(_e=!0);let Ie=Fe.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Ie[L])?B=Ie[L][W]:B=Ie[L],k=!0):y.samples>0&&Ge.useMultisampledRTT(y)===!1?B=Fe.get(y).__webglMultisampledFramebuffer:Array.isArray(Ie)?B=Ie[W]:B=Ie,se.copy(y.viewport),Ee.copy(y.scissor),Te=y.scissorTest}else se.copy(Re).multiplyScalar(oe).floor(),Ee.copy(G).multiplyScalar(oe).floor(),Te=ie;if(W!==0&&(B=H),xe.bindFramebuffer(D.FRAMEBUFFER,B)&&xe.drawBuffers(y,B),xe.viewport(se),xe.scissor(Ee),xe.setScissorTest(Te),k){let fe=Fe.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+L,fe.__webglTexture,W)}else if(_e){let fe=L;for(let Me=0;Me<y.textures.length;Me++){let Ie=Fe.get(y.textures[Me]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Me,Ie.__webglTexture,W,fe)}}else if(y!==null&&W!==0){let fe=Fe.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,fe.__webglTexture,W)}V=-1};function sc(y){let L=Fe.get(y);return(L.__readFormat!==y.format||L.__readType!==y.type)&&(L.__readFormat=y.format,L.__readType=y.type,L.__formatReadable=st.textureFormatReadable(y.format),L.__typeReadable=st.textureTypeReadable(y.type)),L}this.readRenderTargetPixels=function(y,L,W,B,k,_e,Ae,fe=0){if(!(y&&y.isWebGLRenderTarget)){ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=Fe.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Ae!==void 0&&(Me=Me[Ae],Array.isArray(Me)&&(Me=Me[0])),Me){xe.bindFramebuffer(D.FRAMEBUFFER,Me);try{let Ie=y.textures[fe],Ve=Ie.format,Xe=Ie.type;y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+fe);let we=sc(Ie);if(we.__formatReadable===!1){ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(we.__typeReadable===!1){ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=y.width-B&&W>=0&&W<=y.height-k&&D.readPixels(L,W,B,k,le.convert(Ve),le.convert(Xe),_e)}finally{let Ie=ne!==null?Fe.get(ne).__webglFramebuffer:null;xe.bindFramebuffer(D.FRAMEBUFFER,Ie)}}},this.readRenderTargetPixelsAsync=async function(y,L,W,B,k,_e,Ae,fe=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=Fe.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Ae!==void 0&&(Me=Me[Ae],Array.isArray(Me)&&(Me=Me[0])),Me)if(L>=0&&L<=y.width-B&&W>=0&&W<=y.height-k){xe.bindFramebuffer(D.FRAMEBUFFER,Me);let Ie=y.textures[fe],Ve=Ie.format,Xe=Ie.type;y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+fe);let we=sc(Ie);if(we.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(we.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let qe=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,qe),D.bufferData(D.PIXEL_PACK_BUFFER,_e.byteLength,D.STREAM_READ),D.readPixels(L,W,B,k,le.convert(Ve),le.convert(Xe),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let xt=ne!==null?Fe.get(ne).__webglFramebuffer:null;xe.bindFramebuffer(D.FRAMEBUFFER,xt);let ct=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Xh(D,ct,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,qe),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,_e),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(qe),D.deleteSync(ct),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,L=null,W=0){let B=Math.pow(2,-W),k=Math.floor(y.image.width*B),_e=Math.floor(y.image.height*B),Ae=L!==null?L.x:0,fe=L!==null?L.y:0;Ge.setTexture2D(y,0),D.copyTexSubImage2D(D.TEXTURE_2D,W,0,0,Ae,fe,k,_e),xe.unbindTexture()},this.copyTextureToTexture=function(y,L,W=null,B=null,k=0,_e=0){let Ae,fe,Me,Ie,Ve,Xe,we,qe,xt,ct=y.isCompressedTexture?y.mipmaps[_e]:y.image;if(W!==null)Ae=W.max.x-W.min.x,fe=W.max.y-W.min.y,Me=W.isBox3?W.max.z-W.min.z:1,Ie=W.min.x,Ve=W.min.y,Xe=W.isBox3?W.min.z:0;else{let Qe=Math.pow(2,-k);Ae=Math.floor(ct.width*Qe),fe=Math.floor(ct.height*Qe),y.isDataArrayTexture?Me=ct.depth:y.isData3DTexture?Me=Math.floor(ct.depth*Qe):Me=1,Ie=0,Ve=0,Xe=0}B!==null?(we=B.x,qe=B.y,xt=B.z):(we=0,qe=0,xt=0);let ot=le.convert(L.format),Ut=le.convert(L.type),Ce;L.isData3DTexture?(Ge.setTexture3D(L,0),Ce=D.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(Ge.setTexture2DArray(L,0),Ce=D.TEXTURE_2D_ARRAY):(Ge.setTexture2D(L,0),Ce=D.TEXTURE_2D),xe.activeTexture(D.TEXTURE0),xe.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,L.flipY),xe.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),xe.pixelStorei(D.UNPACK_ALIGNMENT,L.unpackAlignment);let Vt=xe.getParameter(D.UNPACK_ROW_LENGTH),et=xe.getParameter(D.UNPACK_IMAGE_HEIGHT),fi=xe.getParameter(D.UNPACK_SKIP_PIXELS),Ft=xe.getParameter(D.UNPACK_SKIP_ROWS),ar=xe.getParameter(D.UNPACK_SKIP_IMAGES);xe.pixelStorei(D.UNPACK_ROW_LENGTH,ct.width),xe.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ct.height),xe.pixelStorei(D.UNPACK_SKIP_PIXELS,Ie),xe.pixelStorei(D.UNPACK_SKIP_ROWS,Ve),xe.pixelStorei(D.UNPACK_SKIP_IMAGES,Xe);let Kn=y.isDataArrayTexture||y.isData3DTexture,pi=L.isDataArrayTexture||L.isData3DTexture;if(y.isDepthTexture){let Qe=Fe.get(y),Dt=Fe.get(L),sn=Fe.get(Qe.__renderTarget),gt=Fe.get(Dt.__renderTarget);xe.bindFramebuffer(D.READ_FRAMEBUFFER,sn.__webglFramebuffer),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,gt.__webglFramebuffer);for(let Tt=0;Tt<Me;Tt++)Kn&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Fe.get(y).__webglTexture,k,Xe+Tt),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Fe.get(L).__webglTexture,_e,xt+Tt)),D.blitFramebuffer(Ie,Ve,Ie+Ae,Ve+fe,we,qe,we+Ae,qe+fe,D.DEPTH_BUFFER_BIT,D.NEAREST);xe.bindFramebuffer(D.READ_FRAMEBUFFER,null),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(k!==0||y.isRenderTargetTexture||Fe.has(y)){let Qe=Fe.get(y),Dt=Fe.get(L);xe.bindFramebuffer(D.READ_FRAMEBUFFER,C),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,O);for(let sn=0;sn<Me;sn++)Kn?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Qe.__webglTexture,k,Xe+sn):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Qe.__webglTexture,k),pi?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Dt.__webglTexture,_e,xt+sn):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Dt.__webglTexture,_e),k!==0?D.blitFramebuffer(Ie,Ve,Ie+Ae,Ve+fe,we,qe,we+Ae,qe+fe,D.COLOR_BUFFER_BIT,D.NEAREST):pi?D.copyTexSubImage3D(Ce,_e,we,qe,xt+sn,Ie,Ve,Ae,fe):D.copyTexSubImage2D(Ce,_e,we,qe,Ie,Ve,Ae,fe);xe.bindFramebuffer(D.READ_FRAMEBUFFER,null),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else pi?y.isDataTexture||y.isData3DTexture?D.texSubImage3D(Ce,_e,we,qe,xt,Ae,fe,Me,ot,Ut,ct.data):L.isCompressedArrayTexture?D.compressedTexSubImage3D(Ce,_e,we,qe,xt,Ae,fe,Me,ot,ct.data):D.texSubImage3D(Ce,_e,we,qe,xt,Ae,fe,Me,ot,Ut,ct):y.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,_e,we,qe,Ae,fe,ot,Ut,ct.data):y.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,_e,we,qe,ct.width,ct.height,ot,ct.data):D.texSubImage2D(D.TEXTURE_2D,_e,we,qe,Ae,fe,ot,Ut,ct);xe.pixelStorei(D.UNPACK_ROW_LENGTH,Vt),xe.pixelStorei(D.UNPACK_IMAGE_HEIGHT,et),xe.pixelStorei(D.UNPACK_SKIP_PIXELS,fi),xe.pixelStorei(D.UNPACK_SKIP_ROWS,Ft),xe.pixelStorei(D.UNPACK_SKIP_IMAGES,ar),_e===0&&L.generateMipmaps===!0&&L.mipmapsAutoUpdate===!0&&D.generateMipmap(Ce),xe.unbindTexture()},this.initRenderTarget=function(y){Fe.get(y).__webglFramebuffer===void 0&&Ge.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?Ge.setTextureCube(y,0):y.isData3DTexture?Ge.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Ge.setTexture2DArray(y,0):Ge.setTexture2D(y,0),xe.unbindTexture()},this.resetState=function(){X=0,F=0,ne=null,xe.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}};var Xl=4.3,q0=1.32,Pu=1.12,Y0=1.03,Z0=4.5,J0=1e3,K0=1.6;function j0(){try{let i=document.createElement("canvas");return!!(window.WebGLRenderingContext&&(i.getContext("webgl2")||i.getContext("webgl")))}catch{return!1}}function Q0(){let i=document.createElement("canvas");i.width=1024,i.height=512;let e=i.getContext("2d");e.fillStyle="#8d8d8a",e.fillRect(0,0,i.width,i.height);let t=7,n=()=>(t=t*16807%2147483647,t/2147483647);for(let r=0;r<900;r++){let a=n()*i.width,o=n()*i.height,l=2+n()**3*34,c=95+Math.floor(n()*70);e.fillStyle=`rgba(${c},${c},${c-3},${.25+n()*.35})`;let u=(.5-o/i.height)*Math.PI,d=Math.min(i.width/3,l/Math.max(.06,Math.cos(u)));e.beginPath(),e.ellipse(a,o,d,l*(.85+n()*.15),0,0,Math.PI*2),e.fill(),e.strokeStyle=`rgba(210,210,205,${.12+n()*.15})`,e.lineWidth=Math.max(1,l*.12),e.stroke()}let s=new Ns(i);return s.colorSpace=Rt,s}function Lu(i,{alElegir:e,urlTextura:t,urlPolo:n,reducirMovimiento:s}){if(!j0())return null;let r;try{r=new uo({antialias:!0,alpha:!0,powerPreference:"low-power"})}catch{return null}r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),r.outputColorSpace=Rt,i.classList.add("luna"),i.innerHTML=`
    <div class="luna__lienzo" tabindex="0" role="group" aria-roledescription="visor 3D" aria-label="Luna interactiva. Arrastra o usa las flechas para girar, + y - para acercar, 0 para volver a la vista del polo sur."></div>
    <div class="luna__marcadores"></div>
    <div class="luna__controles" role="group" aria-label="Controles del visor">
      <button type="button" class="boton-icono" data-accion="polo" aria-label="Vista del polo sur"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="2"/></svg></button>
      <button type="button" class="boton-icono" data-accion="mas" aria-label="Acercar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 5v10M5 10h10"/></svg></button>
      <button type="button" class="boton-icono" data-accion="menos" aria-label="Alejar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10"/></svg></button>
    </div>
    <p class="luna__credito"></p>`;let a=i.querySelector(".luna__lienzo"),o=i.querySelector(".luna__marcadores"),l=i.querySelector(".luna__credito");a.append(r.domElement);let c=new Is,u=new Ht(35,1,.001,50),d=new Gn,h=new ts({color:16777215,roughness:1,metalness:0});d.add(new Kt(new Bs(1,160,120),h)),c.add(d),c.add(new Ws(16777215,.55));let f=new Hs(16774368,2.2);f.position.set(-2,1.5,3),c.add(f);let _=_s(),v=Xl,m=null,p=[],M=null,w=!0,E=!1;function A(){h.map=Q0(),h.needsUpdate=!0,S(),i.classList.add("luna--lista"),O()}let b=!1,g=!1,S=()=>{let q=b?"Textura: NASA CGI Moon Kit":"Textura provisional";l.textContent=`${q}${g?" + relieve LOLA":""} (solo visual)`,l.title=l.textContent};n&&new is().load(n,q=>{q.colorSpace=Rt,q.anisotropy=Math.min(8,r.capabilities.getMaxAnisotropy());let Q=zc({radio:1.0008}),pe=new dn;pe.setAttribute("position",new It(Q.posiciones,3)),pe.setAttribute("uv",new It(Q.uvs,2)),pe.setIndex(Q.indices),pe.computeVertexNormals();let oe=new Kt(pe,new ts({map:q,color:15722200,transparent:!0,depthWrite:!1,roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));oe.renderOrder=1,d.add(oe),g=!0,S(),O()},void 0,()=>{}),t?new is().load(t,q=>{q.colorSpace=Rt,q.anisotropy=Math.min(8,r.capabilities.getMaxAnisotropy()),h.map=q,h.needsUpdate=!0,b=!0,S(),i.classList.add("luna--lista"),O()},void 0,A):A();function N(){d.quaternion.set(_[0],_[1],_[2],_[3]),u.position.set(0,0,v),u.lookAt(0,0,0)}function I(q,Q){if(s()){m=null,_=q,v=Q,O();return}m={q0:_,d0:v,q1:q,d1:Q,t0:performance.now()},O()}function R(q,Q,pe){let oe=Math.hypot(q,Q);if(!oe)return;let Pe=Math.sin(pe/2)/oe;_=Ii([q*Pe,Q*Pe,0,Math.cos(pe/2)],_);let tt=Math.hypot(..._);_=_.map(Re=>Re/tt)}function U(q){m=null,v=Math.min(Z0,Math.max(Y0,1+(v-1)*q)),O()}function H(q){let Q=_r(_,q),pe={x:Q[0],y:Q[1],z:Q[2]},oe=pe.z*(v-pe.z)-pe.x*pe.x-pe.y*pe.y>0,Pe=a.clientWidth,tt=a.clientHeight,Re={x:Q[0],y:Q[1],z:Q[2]-v},G=1/Math.tan(u.fov*Math.PI/360),ie=Pe/2*(1+G/u.aspect*(Re.x/-Re.z)),me=tt/2*(1-G*(Re.y/-Re.z));return{sx:ie,sy:me,visible:oe}}function C(){if(v>K0){let Q=H(gs(-89,60));o.innerHTML=Q.visible?`<button type="button" class="luna__grupo" data-accion="tres" style="left:${Q.sx}px;top:${Q.sy}px">${p.length} sitios del polo sur</button>`:"";return}o.innerHTML=p.map(Q=>{let pe=H(gs(Q.lat,Q.lon));if(!pe.visible)return"";let oe=Q.id===M;return`<button type="button" class="luna__sitio${oe?" activo":""}" data-sitio="${Q.id}" aria-pressed="${oe}" style="left:${pe.sx}px;top:${pe.sy}px" aria-label="${De(Q.etiqueta)}: ${De(Q.nombre_corto)}">
        <span class="luna__punto" aria-hidden="true">${De(Q.etiqueta.slice(-1))}</span><span class="luna__nombre">${De(Q.nombre_corto)}</span></button>`}).join("")}function O(){E||!w||(E=!0,requestAnimationFrame(X))}function X(q){if(E=!1,m){let Q=Bc((q-m.t0)/J0);_=Oc(m.q0,m.q1,Q),v=Math.exp(Math.log(m.d0-1)+(Math.log(m.d1-1)-Math.log(m.d0-1))*Q)+1,Q>=1&&(m=null)}N(),r.render(c,u),C(),m&&O()}function F(){let q=Math.max(1,a.clientWidth),Q=Math.max(1,a.clientHeight);r.setSize(q,Q,!1),u.aspect=q/Q,u.updateProjectionMatrix(),O()}let ne=new ResizeObserver(F);ne.observe(a);let V=new IntersectionObserver(([q])=>{w=q.isIntersecting&&!document.hidden,w&&O()});V.observe(i);let ee=()=>{w=!document.hidden,w&&O()};document.addEventListener("visibilitychange",ee);let se=new Map,Ee=null;a.addEventListener("pointerdown",q=>{a.setPointerCapture(q.pointerId),se.set(q.pointerId,{x:q.clientX,y:q.clientY}),m=null}),a.addEventListener("pointermove",q=>{let Q=se.get(q.pointerId);if(!Q)return;if(se.set(q.pointerId,{x:q.clientX,y:q.clientY}),se.size===2){let[tt,Re]=[...se.values()],G=Math.hypot(tt.x-Re.x,tt.y-Re.y);Ee&&U(Ee/G),Ee=G;return}let pe=q.clientX-Q.x,oe=q.clientY-Q.y,Pe=2.2*(v-1)/Math.max(200,a.clientHeight);R(oe,pe,Math.hypot(pe,oe)*Pe),O()});let Te=q=>{se.delete(q.pointerId),se.size<2&&(Ee=null)};a.addEventListener("pointerup",Te),a.addEventListener("pointercancel",Te),a.addEventListener("wheel",q=>{q.preventDefault(),U(Math.exp(q.deltaY*.0012))},{passive:!1}),a.addEventListener("keydown",q=>{let Q=.15*(v-1),pe={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};if(q.key in pe)R(...pe[q.key],Q),m=null,O();else if(q.key==="+"||q.key==="=")U(.8);else if(q.key==="-"||q.key==="_")U(1.25);else if(q.key==="0")I(_s(),Xl);else return;q.preventDefault()});function Z(){I(xr(-88.4,330),q0)}return i.addEventListener("click",q=>{let Q=q.target.closest("button");Q&&(Q.dataset.sitio?e(Q.dataset.sitio):Q.dataset.accion==="polo"?I(_s(),Xl):Q.dataset.accion==="mas"?U(.7):Q.dataset.accion==="menos"?U(1.4):Q.dataset.accion==="tres"&&Z())}),F(),{render(q){p=q.sitios;let Q=q.sitio.id;M!==null&&Q!==M&&I(xr(q.sitio.lat,q.sitio.lon),Pu),M=Q,O()},enfocarSitio(q){I(xr(q.lat,q.lon),Pu)},verTres:Z,destruir(){ne.disconnect(),V.disconnect(),document.removeEventListener("visibilitychange",ee),r.dispose()}}}var e_=i=>`${Math.abs(i.lat).toFixed(3)}\xB0 S, ${i.lon.toFixed(3)}\xB0 E`;function Du(i,e,t){i.innerHTML=e.sitios.map(n=>{let s=n.id===e.sitio.id;return`<button type="button" class="chip-sitio${s?" activo":""}" data-sitio="${n.id}" aria-pressed="${s}">
      <span aria-hidden="true">${De(n.etiqueta.slice(-1))}</span>${De(n.nombre_corto)}</button>`}).join("")+(t?'<button type="button" class="chip-sitio" data-accion="tres">Ver los tres</button>':"")}function Nu(i,e,t){let{sitio:n,muestra:s,estado:r}=e,a=(l,c,u,d)=>`<span class="pastilla ${l?d:"c-neutro"}">${l?c:u}</span>`,o=r.enlaceActivo?`<span class="pastilla ${Ot[s.enlace.estado].clase}">Enlace ${an[r.tipoEnlace].toLowerCase()}: ${Ot[s.enlace.estado].texto}</span>`:'<span class="pastilla c-neutro">Enlace local desactivado</span>';i.innerHTML=`
    <div>
      <p class="luna-ficha__nombre">${De(n.etiqueta)}: ${De(n.nombre_corto)}</p>
      <p class="luna-ficha__coord">${e_(n)}</p>
    </div>
    <div class="luna-ficha__estados">
      ${a(s.sol.visible,"Sol visible","Sombra","c-sol")}
      ${a(s.tierra.visible,"Tierra visible","Tierra oculta","c-tierra")}
      ${o}
    </div>
    ${t?"":'<p class="luna-ficha__aviso">Este navegador no ofrece WebGL: se muestra el mapa polar 2D con las mismas coordenadas.</p>'}`}var Zn=1e3,_n=300,_t={izq:52,der:18,sup:18,inf:46},us=-4,wi=8,xn=i=>_t.izq+i/360*(Zn-_t.izq-_t.der),Ou=i=>_t.sup+(wi-i)/(wi-us)*(_n-_t.sup-_t.inf),mo=i=>Ou(Math.max(us,Math.min(wi,i)));function Uu(i,e,t,n){let s=[],r=i-e,a=i+e,o=(l,c)=>s.push(`<rect x="${xn(l)}" y="${_t.sup}" width="${xn(c)-xn(l)}" height="${_n-_t.sup-_t.inf}" fill="${t}" opacity="${n}"/>`);return r<0?(o(0,a),o(360+r,360)):a>360?(o(r,360),o(0,a-360)):o(r,a),s.join("")}function Fu(i,e,t,n,s,r){let a=xn(i),o=mo(e),l=e>wi||e<us,c=a>Zn-140?a-14:a+14,u=a>Zn-140?"end":"start";return`
    <line x1="${a}" y1="${o}" x2="${a}" y2="${mo(r)}" stroke="${t}" stroke-dasharray="3 3" opacity=".7"/>
    <circle cx="${a}" cy="${o}" r="8" fill="${n?t:Se.fondo}" stroke="${t}" stroke-width="2"/>
    <text x="${c}" y="${o-10}" text-anchor="${u}" fill="${t}" class="g-etq">${De(s)}${l?" (fuera de escala)":""}</text>`}function Bu(i,e){let{sitio:t,muestra:n,estado:s,escenario:r}=e,o=s.modoHorizonte==="plano"?null:t.horizonte;Zn=Math.max(560,Math.round(i.clientWidth||1e3)),_n=Zn<760?260:300;let l=o?o.elevacion_deg:[0],c=e.serie.reduce((v,m)=>Math.max(v,m.sol.el,m.tierra.el),Math.max(...l)),u=e.serie.reduce((v,m)=>Math.min(v,m.sol.el,m.tierra.el),Math.min(...l));wi=Math.max(6,Math.ceil(c/2)*2+2),us=Math.min(-4,Math.floor(u/2)*2);let d=[],h=wi-us>18?4:2;for(let v=us;v<=wi;v+=h){let m=Ou(v);d.push(`<line x1="${_t.izq}" x2="${Zn-_t.der}" y1="${m}" y2="${m}" stroke="rgba(255,255,255,${v===0?.35:.08})"/>`),d.push(`<text x="${_t.izq-8}" y="${m+4}" text-anchor="end" class="g-eje">${v}\xB0</text>`)}let f={0:"N",90:"E",180:"S",270:"O",360:"N"};for(let v=0;v<=360;v+=45)d.push(`<line y1="${_t.sup}" y2="${_n-_t.inf}" x1="${xn(v)}" x2="${xn(v)}" stroke="rgba(255,255,255,.08)"/>`),d.push(`<text x="${xn(v)}" y="${_n-_t.inf+18}" text-anchor="${v===0?"start":v===360?"end":"middle"}" class="g-eje">${v}\xB0${f[v]?` ${f[v]}`:""}</text>`);if(d.push(`<text x="${(_t.izq+Zn-_t.der)/2}" y="${_n-6}" text-anchor="middle" class="g-titulo">Azimut (\xB0)</text>`),d.push(`<text transform="translate(14 ${(_t.sup+_n-_t.inf)/2}) rotate(-90)" text-anchor="middle" class="g-titulo">Elevaci\xF3n (\xB0)</text>`),s.enlaceActivo&&s.tipoEnlace==="optico"){let v=r.enlace_local.optico;for(let m of[t.relevo.az_deg,(t.relevo.az_deg+180)%360])d.push(Uu(m,v.sep_robusto_deg,Se.aviso,.08)),d.push(Uu(m,v.sep_sin_enlace_deg,Se.error,.14))}let _=[];for(let v=0;v<=360;v+=1)_.push(`${xn(v).toFixed(1)},${mo(mi(o,v)).toFixed(1)}`);if(d.push(`<path d="M${xn(0)},${_n-_t.inf} L${_.join(" L")} L${xn(360)},${_n-_t.inf} Z" fill="url(#g-terreno)"/>`),d.push(`<polyline points="${_.join(" ")}" fill="none" stroke="${Se.texto2}" stroke-width="1.5"/>`),s.enlaceActivo){let v=t.relevo,m=xn(v.az_deg),p=mo(v.el_deg);d.push(`<path d="M${m},${p-9}l8,14h-16z" fill="${Se.superficie}" stroke="${Se.acento}" stroke-width="2"/>`),d.push(`<text x="${m-12}" y="${p+22}" text-anchor="end" class="g-etq" fill="${Se.acento}">Punto de apoyo</text>`)}d.push(Fu(n.tierra.az,n.tierra.el,Se.tierra,n.tierra.visible,`Tierra ${Qt(n.tierra.el)}`,n.tierra.horizonte)),d.push(Fu(n.sol.az,n.sol.el,Se.sol,n.sol.visible,`Sol ${Qt(n.sol.el)}`,n.sol.horizonte)),i.innerHTML=`
    <svg viewBox="0 0 ${Zn} ${_n}" width="${Zn}" height="${_n}" role="img" aria-label="Horizonte de ${De(t.etiqueta)}: Sol a ${Qt(n.sol.el)} de elevaci\xF3n, ${n.sol.visible?"visible":"tapado por el terreno"}; Tierra a ${Qt(n.tierra.el)}, ${n.tierra.visible?"visible":"oculta"}.">
      <defs><linearGradient id="g-terreno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55585E" stop-opacity=".9"/><stop offset="1" stop-color="#1B1D21" stop-opacity=".9"/></linearGradient></defs>
      <style>
        .g-eje { font: 400 12px var(--fuente); fill: ${Se.texto3}; }
        .g-titulo { font: 500 12px var(--fuente); fill: ${Se.texto2}; }
        .g-etq { font: 600 13px var(--fuente); }
      </style>
      ${d.join("")}
    </svg>`}function zu(i,e){let t=e.enlaceActivo&&e.tipoEnlace==="optico";i.innerHTML=`
    <li><span class="muestra" style="background:#55585E;border-top:2px solid ${Se.texto2}"></span>Terreno (elevaci\xF3n por azimut)</li>
    <li><span class="muestra" style="background:${Se.sol};border-radius:50%"></span>Sol: relleno si supera el horizonte</li>
    <li><span class="muestra" style="background:${Se.tierra};border-radius:50%"></span>Tierra: relleno si supera el horizonte</li>
    ${e.enlaceActivo?`<li><span class="muestra" style="border:2px solid ${Se.acento}"></span>Punto de apoyo</li>`:""}
    ${t?`<li><span class="muestra" style="background:${Se.error};opacity:.6"></span><span class="muestra" style="background:${Se.aviso};opacity:.35"></span>Zonas donde el Sol deslumbra el enlace (supuesto)</li>`:""}
    <li>Unidades: grados; azimut desde el norte local</li>`}var sr=26,ql=30,Pn=28,Ci=8,ku=8;function Gu(i,e,{alCambiarIndice:t}){let n=null,s=null,r=!1;i.setAttribute("role","slider"),i.setAttribute("tabindex","0"),i.setAttribute("aria-label","Hora seleccionada en la l\xEDnea de tiempo");let a=h=>{let f=i.querySelector("svg").getBoundingClientRect(),_=n.W/f.width,v=(h-f.left)*_-Ci,m=Math.floor(v/n.ancho*n.n);return n.i0+Math.max(0,Math.min(n.n-1,m))};function o(h,f){let _=[`<li>${h.sol.visible?"Sol visible":"Sombra"}: el Sol est\xE1 ${h.sol.visible?"sobre":"bajo"} el horizonte local.</li>`,`<li>${h.tierra.visible?"Tierra visible":"Tierra oculta"}: ${h.tierra.visible?"hay":"no hay"} vista directa para comunicar.</li>`];return f.enlaceActivo&&_.push(`<li>Enlace local ${Ot[h.enlace.estado].texto.toLowerCase()}: ${De(h.enlace.limitantes[0].texto)}</li>`),`<b>${ps(h.ms)}</b><ul>${_.join("")}</ul>`}function l(h){if(!n||r)return;let f=a(h.clientX);e.innerHTML=o(s.serie[f],s.estado),e.hidden=!1;let _=e.offsetWidth,v=Math.min(window.innerWidth-_-12,Math.max(12,h.clientX+14));e.style.left=`${v}px`,e.style.top=`${h.clientY+18}px`}i.addEventListener("pointerdown",h=>{!n||h.button>0||(r=!0,e.hidden=!0,i.setPointerCapture(h.pointerId),i.focus({preventScroll:!0}),t(a(h.clientX)))}),i.addEventListener("pointermove",h=>{r?t(a(h.clientX)):h.pointerType==="mouse"&&l(h)});let c=()=>{r=!1};i.addEventListener("pointerup",c),i.addEventListener("pointercancel",c),i.addEventListener("pointerleave",()=>{e.hidden=!0}),i.addEventListener("keydown",h=>{if(!n)return;let f=s.indice,_={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:-24,PageDown:24},v=null;h.key in _?v=f+_[h.key]:h.key==="Home"?v=n.i0:h.key==="End"&&(v=n.i1),v!==null&&(h.preventDefault(),t(Math.max(n.i0,Math.min(n.i1,v))))});function u(h){s=h;let{serie:f,i0:_,i1:v,estado:m,metricas:p}=h,M=v-_+1,w=Math.max(560,Math.round(i.parentElement.clientWidth||1e3)),E=w-Ci-ku,A=C=>Ci+(C-_)/M*E,b=[{nombre:"Iluminaci\xF3n",clave:C=>C.sol.visible?"si":"no",relleno:C=>C==="si"?Se.sol:Se.sombra,texto:C=>C==="si"?"Sol visible":"Sombra"},{nombre:"Comunicaci\xF3n directa",clave:C=>C.tierra.visible?"si":"no",relleno:C=>C==="si"?Se.tierra:Se.sombra,texto:C=>C==="si"?"Tierra visible":"Tierra oculta"}];m.enlaceActivo&&b.push({nombre:`Enlace local (${m.tipoEnlace==="rf"?"radiofrecuencia":"\xF3ptico"})`,clave:C=>C.enlace.estado,relleno:Ec,texto:C=>Ot[C].texto});let g=[],S=Math.max(1,Math.ceil(M/24/(E/70))),N=0;for(let C=_;C<=v;C++){if(!f[C].t.endsWith("T00:00"))continue;let O=A(C);g.push(`<line x1="${O}" x2="${O}" y1="${Pn-8}" y2="${Pn+b.length*(sr+ql)}" stroke="rgba(255,255,255,.1)"/>`),N%S===0&&g.push(`<text x="${O+3}" y="${Pn-12}">${gi(f[C].ms)}</text>`),N++}b.forEach((C,O)=>{let X=Pn+O*(sr+ql)+14,F=X+8;g.push(`<text class="carril__nombre" x="${Ci+14}" y="${X}">${C.nombre}</text>`),g.push(`<rect x="${Ci}" y="${F}" width="${E}" height="${sr}" rx="6" fill="${Se.neutro}"/>`);for(let ne of mc(f,_,v,C.clave)){let V=A(ne.desde),ee=A(ne.hasta+1);g.push(`<rect x="${V.toFixed(2)}" y="${F}" width="${Math.max(.6,ee-V).toFixed(2)}" height="${sr}" fill="${C.relleno(ne.valor)}"><title>${C.texto(ne.valor)}, ${_i(ne.hasta-ne.desde+1)}</title></rect>`)}});let I=Pn+b.length*(sr+ql)+4,R=h.escenario.evento_polvo;if(m.enlaceActivo&&m.tipoEnlace==="optico"&&m.polvo){let C=cr(f,R);if(C&&C[1]>=_&&C[0]<=v){let O=Math.max(_,C[0]),X=Math.min(v,C[1])+1,F=A(O),ne=Math.max(6,A(X)-F);g.push(`<rect x="${F-(ne-(A(X)-F))/2}" y="${Pn+2}" width="${ne}" height="${I-Pn-2}" fill="url(#p-polvo)" opacity=".7" stroke="${Se.texto}" stroke-opacity=".5"/>`);let V=F>w-260;g.push(`<text x="${V?F-6:F+ne+4}" y="${I+14}" text-anchor="${V?"end":"start"}" fill="${Se.texto}">Evento de polvo: ${R.duracion_s} s (referencia Apollo)</text>`)}}let U=p.brecha;if(U.horas>0){let C=A(U.desde),O=A(U.hasta+1),X=I+34;g.push(`<path d="M${C},${X-6}V${X}H${O}V${X-6}" fill="none" stroke="${Se.acento}" stroke-width="1.5"/>`);let F=`${m.enlaceActivo?"Mayor intervalo sin comunicaci\xF3n":"Mayor intervalo sin vista a la Tierra"}: ${_i(U.horas)}`,ne=Math.min(Math.max((C+O)/2,Ci+150),w-ku-150);g.push(`<text x="${ne}" y="${X+16}" text-anchor="middle" fill="${Se.acento}">${F}</text>`)}let H=I+60;i.innerHTML=`
      <svg viewBox="0 0 ${w} ${H}" width="${w}" height="${H}" aria-hidden="true">
        <defs>${fr()}</defs>
        ${g.join("")}
        <g id="cursor">
          <rect class="cursor__marco" x="-7" y="${Pn-4}" width="14" height="${I-Pn+2}" rx="7" fill="rgba(198,168,106,.14)" stroke="rgba(226,201,144,.5)"/>
          <line class="cursor__linea" x1="0" x2="0" y1="${Pn-4}" y2="${I-2}" stroke="${Se.texto}" stroke-width="2"/>
        </g>
      </svg>`,n={W:w,ancho:E,n:M,i0:_,i1:v},d(h)}function d(h){if(s=h,!n)return;let{indice:f,serie:_}=h,v=Ci+(f-n.i0+.5)/n.n*n.ancho;i.querySelector("#cursor").setAttribute("transform",`translate(${v.toFixed(2)} 0)`),i.setAttribute("aria-valuemin",String(n.i0)),i.setAttribute("aria-valuemax",String(n.i1)),i.setAttribute("aria-valuenow",String(f)),i.setAttribute("aria-valuetext",ps(_[f].ms));let m=i.parentElement;if(m.scrollWidth>m.clientWidth){let p=i.querySelector("svg").getBoundingClientRect(),M=v*(p.width/n.W);(M<m.scrollLeft+24||M>m.scrollLeft+m.clientWidth-24)&&(m.scrollLeft=M-m.clientWidth/2)}}return{dibujar:u,moverCursor:d}}function Vu(i,e){let t=[`<li><span class="muestra" style="background:${Se.sol}"></span>Sol visible</li>`,`<li><span class="muestra" style="background:${Se.tierra}"></span>Tierra visible</li>`,`<li><span class="muestra" style="background:${Se.sombra};border:1px solid rgba(255,255,255,.3)"></span>Sombra / Tierra oculta</li>`];e.enlaceActivo&&t.push(`<li><span class="muestra" style="background:${Se.ok}"></span>R\xE1pido</li>`,`<li><span class="muestra" style="background:repeating-linear-gradient(45deg,${Se.aviso} 0 3px,rgba(0,0,0,.35) 3px 5px)"></span>Robusto</li>`,`<li><span class="muestra" style="background:repeating-linear-gradient(45deg,${Se.error} 0 2px,rgba(0,0,0,.4) 2px 4px)"></span>Sin enlace</li>`),t.push("<li>Cada columna es una hora UTC</li>"),i.innerHTML=t.join("")}function Hu(i,e,t,n){let{filas:s,comparacion:r,estado:a,serie:o,i0:l,i1:c}=n;e.textContent=`Periodo: ${Nn(o[l].ms)} a ${Nn(o[c].ms)} (${c-l+1} h, UTC). Enlace local: ${a.enlaceActivo?an[a.tipoEnlace].toLowerCase():"desactivado"}${a.enlaceActivo&&a.tipoEnlace==="optico"&&a.polvo?", con evento de polvo":""}. Horizonte: ${dr(a.modoHorizonte,n.sitio)}. \xCDndice de conveniencia: S = ${At(fs.energia,2)}\xB7iluminaci\xF3n + ${At(fs.comunicacion,2)}\xB7comunicaci\xF3n directa${a.enlaceActivo?` + ${At(fs.respaldo,2)}\xB7enlace local`:""} (propuesto por el equipo, no es un est\xE1ndar de NASA)${a.enlaceActivo?"; R solo cuenta horas en que el respaldo llega a la Tierra":""}. Resoluci\xF3n horaria: cada cambio se ubica con un margen de \xB11 h.`;let u=`<thead><tr><th scope="col">M\xE9trica</th>${s.map(p=>`<th scope="col"><b>${De(p.sitio.etiqueta)}</b>${De(p.sitio.nombre_corto)}</th>`).join("")}</tr></thead>`,d=s.map(p=>vo(p.metricas,a.enlaceActivo)),h=Math.max(...d),f='<tr class="fila-score"><th scope="row"><strong>\xCDndice de conveniencia (S)</strong><br><small class="c-neutro">de 0 a 100 \xB7 m\xE1s alto es mejor</small></th>'+s.map((p,M)=>{let w=Math.abs(d[M]-h)<1e-9;return`<td class="${w?"mejor":""}"><strong>${At(d[M],1)}</strong>${w?'<span class="marca-mejor">Mejor</span>':""}</td>`}).join("")+"</tr>",_=hr.map(p=>{if(p.enlace&&!a.enlaceActivo)return`<tr class="sin-datos"><th scope="row">${p.etiqueta}</th><td colspan="${s.length}">Activa el enlace local para comparar esta m\xE9trica.</td></tr>`;let M=r.mejores[p.clave]||[],w=p.mejor==="max"?"m\xE1s alto es mejor":p.mejor==="min"?"m\xE1s bajo es mejor":"informativo",E=p.clave==="brecha"&&!a.enlaceActivo?"Mayor intervalo sin vista a la Tierra":p.etiqueta,A=s.map(b=>{let g=xo(b.metricas,p.clave),S=M.includes(b.sitio.id),N=p.unidad==="%"?`${At(g,1)} %`:`${g} h`,I={pctSol:"horasSol",pctTierra:"horasTierra",pctSolTierra:"horasSolTierra",pctRespaldo:"horasRespaldo"},R=p.unidad==="%"?`<small>${b.metricas[I[p.clave]]} h</small>`:"";return`<td class="${S?"mejor":""}">${N}${R}${S?'<span class="marca-mejor">Mejor</span>':""}</td>`}).join("");return`<tr><th scope="row">${E}<br><small class="c-neutro">${w}</small></th>${A}</tr>`}).join("");i.innerHTML=`<caption class="sr">Comparaci\xF3n de los tres sitios en el periodo seleccionado</caption>${u}<tbody>${f}${_}</tbody>`;let v=r.resumen.map(p=>{let M=p.metricas.length;return`<li><strong>${De(p.sitio.etiqueta)}, ${De(p.sitio.nombre_corto)}</strong>: mejor en ${M} de ${p.total} m\xE9tricas (${De(p.metricas.join(", "))}).</li>`}),m=r.conclusiones.filter(p=>p.includes("empat"));t.innerHTML=[...v,...m.map(p=>`<li>${De(p)}</li>`)].join("")}var be=i=>document.querySelector(i),Yl=["resumen","sitios","comparador","enlace","metodologia"],t_={resumen:"Luz, comunicaci\xF3n y enlace local del sitio activo en el periodo elegido.",sitios:"Ubicaci\xF3n real y horizonte LOLA del sitio en la hora seleccionada.",comparador:"Los tres sitios sobre el mismo periodo y los mismos supuestos.",enlace:"Estado del enlace de respaldo hora por hora y por qu\xE9 cambia.",metodologia:"Qu\xE9 se calcula, con qu\xE9 datos y qu\xE9 l\xEDmites tiene la demo."};function $u(i){return{vista:"resumen",sitioId:"shackleton",desde:ms(i[0]),hasta:ms(i[i.length-1]),tipoEnlace:"rf",enlaceActivo:!0,polvo:!1,modoHorizonte:"perfil",indice:0,paso:1}}async function n_(){let i;try{i=await vc()}catch(G){be(".principal").insertAdjacentHTML("afterbegin",`<div class="tarjeta" role="alert"><h2>No se pudieron cargar los datos</h2><p>${De(G.message)} Abre la demo con un servidor local (ver README) o usa la versi\xF3n empaquetada.</p></div>`);return}let{escenario:e,efemerides:t}=i,n=e.sitios,s=t[n[0].id],r=s.map(G=>Dn(G.t)),a=$u(r),o=location.hash.slice(1);Yl.includes(o)&&(a.vista=o);let l=n.find(G=>G.id===new URLSearchParams(location.search).get("sitio"));l&&(a.sitioId=l.id);let c="",u={};function d(){let G=[a.tipoEnlace,a.polvo,a.modoHorizonte].join("|");if(G!==c){u={};for(let Be of n)u[Be.id]=dc(Be,t[Be.id],{modoHorizonte:a.modoHorizonte,tipoEnlace:a.tipoEnlace,polvo:a.polvo,reglas:e.enlace_local,eventoPolvo:e.evento_polvo});c=G}let[ie,me]=h(),Ne=n.find(Be=>Be.id===a.sitioId),Je=u[Ne.id],at=n.map(Be=>({sitio:Be,metricas:fc(u[Be.id],ie,me,a.enlaceActivo)}));return{escenario:e,sitios:n,sitio:Ne,serie:Je,i0:ie,i1:me,estado:a,indice:a.indice,muestra:Je[a.indice],metricas:at.find(Be=>Be.sitio.id===Ne.id).metricas,filas:at,comparacion:gc(at,a.enlaceActivo)}}function h(){let G=Dn(`${a.desde}T00`),ie=Dn(`${a.hasta}T23`),me=r.findIndex(Je=>Je>=G),Ne=r.length-1;for(;Ne>0&&r[Ne]>ie;)Ne--;return me<0&&(me=0),Ne<me&&(Ne=me),[me,Ne]}let f={sitio:be("#c-sitio"),rf:be("#c-rf"),optico:be("#c-optico"),enlace:be("#c-enlace"),polvo:be("#c-polvo"),polvoEnv:be("#c-polvo-envoltura"),horizonte:be("#c-horizonte")};f.sitio.innerHTML=n.map(G=>`<option value="${G.id}">${De(G.etiqueta)}: ${De(G.nombre_corto)}</option>`).join("");let _=ms(r[0]),v=ms(r[r.length-1]),m=[...document.querySelectorAll("[data-periodo]")].map((G,ie)=>{G.innerHTML=`
      <span aria-hidden="true">Periodo UTC</span>
      <label class="sr" for="p${ie}-desde">Desde</label><input type="date" id="p${ie}-desde" min="${_}" max="${v}" required>
      <span aria-hidden="true">a</span>
      <label class="sr" for="p${ie}-hasta">Hasta</label><input type="date" id="p${ie}-hasta" min="${_}" max="${v}" required>
      <p class="periodo__nota" aria-live="polite"></p>`;let me=G.querySelector(`#p${ie}-desde`),Ne=G.querySelector(`#p${ie}-hasta`),Je=G.querySelector(".periodo__nota"),at=()=>{let Be=me.value||_,mt=Ne.value||v,ht=lt=>lt<_?_:lt>v?v:lt,ut="";(Be!==ht(Be)||mt!==ht(mt))&&(ut=`Los datos disponibles van del ${_} al ${v}; ajust\xE9 el periodo.`),Be=ht(Be),mt=ht(mt),Be>mt&&([Be,mt]=[mt,Be],ut="La fecha final era anterior a la inicial; las intercambi\xE9."),m.forEach(lt=>{lt.nota.textContent=ut}),M({desde:Be,hasta:mt})};return me.addEventListener("change",at),Ne.addEventListener("change",at),{desde:me,hasta:Ne,nota:Je}});function p(){f.sitio.value=a.sitioId;for(let G of m)G.desde.value=a.desde,G.hasta.value=a.hasta;f.rf.checked=a.tipoEnlace==="rf",f.optico.checked=a.tipoEnlace==="optico",f.rf.disabled=f.optico.disabled=!a.enlaceActivo,f.enlace.checked=a.enlaceActivo,f.polvo.checked=a.polvo,f.polvoEnv.hidden=!(a.enlaceActivo&&a.tipoEnlace==="optico"),f.horizonte.options[0].textContent=dr("perfil",n.find(G=>G.id===a.sitioId)),f.horizonte.value=a.modoHorizonte,be("#t-paso").value=String(a.paso)}function M(G,{completo:ie=!0}={}){a={...a,...G};let[me,Ne]=h();a.indice=Math.max(me,Math.min(Ne,a.indice)),Pe(ie)}f.sitio.addEventListener("change",()=>M({sitioId:f.sitio.value})),f.rf.addEventListener("change",()=>M({tipoEnlace:"rf"})),f.optico.addEventListener("change",()=>M({tipoEnlace:"optico"})),f.enlace.addEventListener("change",()=>M({enlaceActivo:f.enlace.checked})),f.polvo.addEventListener("change",()=>{let G={polvo:f.polvo.checked};if(f.polvo.checked){let ie=cr(r.map(Je=>({ms:Je})),e.evento_polvo),[me,Ne]=h();ie&&ie[0]>=me&&ie[0]<=Ne&&(G.indice=ie[0])}M(G)}),f.horizonte.addEventListener("change",()=>M({modoHorizonte:f.horizonte.value})),be("#c-reset").addEventListener("click",()=>{U(),m.forEach(G=>{G.nota.textContent=""}),a={...$u(r),vista:a.vista},Pe(!0)});let w=be("#dialogo-ayuda");be("#ayuda-estados").innerHTML=`
    <dt>Sol visible / Sombra</dt><dd>El Sol est\xE1 por encima o por debajo del horizonte local en esa hora.</dd>
    <dt>Tierra visible / Tierra oculta</dt><dd>Hay o no vista directa a la Tierra para comunicar sin intermediarios.</dd>
    ${Object.values(Ot).map(G=>`<dt class="${G.clase}">${G.texto}</dt><dd>${G.ayuda}</dd>`).join("")}
    <dt>Respaldo hacia la Tierra</dt><dd>Disponible solo si el tramo local funciona y el punto de apoyo ve la Tierra.</dd>`,be("#c-ayuda").addEventListener("click",()=>w.showModal());let E={en_uso:["En uso","var(--ok)"],prevista:["Integraci\xF3n prevista","var(--acento-claro)"]};be("#fuentes").innerHTML=Object.values(e.fuentes).map(G=>{let[ie,me]=E[G.estado]||[G.estado,"var(--texto-2)"],Ne=G===e.fuentes.efemerides&&e.generado_utc?` Datos pedidos a Horizons el ${De(e.generado_utc.replace("T"," ").replace("Z"," UTC"))}.`:"";return`<div><dt>${De(G.nombre)} <span class="estado-fuente" style="color:${me}">${ie}</span></dt><dd>${De(G.detalle)}${Ne}</dd></div>`}).join("")+'<div><dt>Punto de apoyo, umbrales y momento del evento de polvo <span class="estado-fuente" style="color:var(--acento-claro)">Supuestos de demostraci\xF3n</span></dt><dd>Precedentes: concepto de relevo LunaNet / Lunar Communications Relay (RF), l\xE1ser O2O de Artemis II y \u201Chorizon glow\u201D observado desde Apollo (\xF3ptico).</dd></div>';let A=e.enlace_local;if(be("#reglas-enlace").innerHTML=`
    <li><strong>Radiofrecuencia:</strong> requiere l\xEDnea de vista al punto de apoyo. Si el punto de apoyo queda en sombra opera con bater\xEDa (robusto); tras ${A.rf.bateria_relevo_h} h en sombra se considera sin enlace.</li>
    <li><strong>\xD3ptico:</strong> si el Sol queda a menos de ${A.optico.sep_robusto_deg}\xB0 de la l\xEDnea de vista el enlace pasa a robusto; a menos de ${A.optico.sep_sin_enlace_deg}\xB0 queda sin enlace. El evento de polvo dura ${e.evento_polvo.duracion_s} s, calibrado con Apollo (10\u201312 s de polvo visible en el descenso final). Como cada muestra vale una hora, esa hora pasa a robusto; solo un evento de media hora o m\xE1s la dejar\xEDa sin enlace. El momento del aterrizaje cercano es un supuesto.</li>`,""){let G=be("#consultar-horizons"),ie=be("#estado-horizons");be("#consulta-vivo").hidden=!1;let me=(Ne,Je=!1)=>{ie.textContent=Ne,ie.classList.toggle("consulta-vivo__estado--error",Je)};G.addEventListener("click",async()=>{G.disabled=!0,G.textContent="Consultando\u2026",me(`Pidiendo a JPL Horizons el Sol y la Tierra de ${n.length} sitios\u2026`);try{let Ne=new Date(Dn(s[s.length-1].t)+864e5).toISOString().slice(0,10),Je=await Mc({proxy:"",sitios:n,inicio:s[0].t.slice(0,10),fin:Ne}),at=new Set(s.map(ut=>ut.t)),Be=Object.fromEntries(Object.entries(Je).map(([ut,lt])=>[ut,lt.filter(Lt=>at.has(Lt.t))])),mt=0;for(let ut of n){let lt=Be[ut.id],Lt=lr(lt,ut.id);if(Lt.length)throw new Error(Lt[0]);let D=t[ut.id];if(lt.length!==D.length||lt.some((yt,nt)=>yt.t!==D[nt].t))throw new Error(`Horizons devolvi\xF3 otras horas para ${ut.id}; se conservan los datos publicados.`);for(let yt=0;yt<lt.length;yt++)for(let nt of["sol_el","sol_az","tierra_el","tierra_az"]){let st=Math.abs(lt[yt][nt]-D[yt][nt]);nt.endsWith("_az")&&(st=Math.min(st,360-st)),mt=Math.max(mt,st)}}Object.assign(t,Be),c="",Pe(!0);let ht=new Date().toLocaleString("es-MX",{dateStyle:"medium",timeStyle:"short"});me(`Datos en vivo de JPL Horizons (${ht}). Diferencia m\xE1xima con los publicados: ${mt.toFixed(6)}\xB0.`)}catch(Ne){me(`${Ne.message} La demo sigue con los datos publicados.`,!0)}finally{G.disabled=!1,G.textContent="Consultar JPL Horizons ahora"}})}function b(){for(let G of Yl){let ie=be(`#vista-${G}`),me=G===a.vista;me&&ie.hidden&&(ie.classList.remove("vista--entra"),ie.offsetWidth,ie.classList.add("vista--entra")),ie.hidden=!me}document.querySelectorAll(".lateral__item").forEach(G=>{G.dataset.vista===a.vista?G.setAttribute("aria-current","page"):G.removeAttribute("aria-current")}),be("#contenido").dataset.vista=a.vista,be("#cab-sub").textContent=t_[a.vista],be("#luna-tarjeta").hidden=a.vista!=="resumen"}window.addEventListener("hashchange",()=>{let G=location.hash.slice(1);Yl.includes(G)&&(a.vista=G,Pe(!0))});let g=G=>{G!==a.indice&&M({indice:G},{completo:!1})},S=Cc(be("#evolucion"),{alCambiarIndice:g}),N=Gu(be("#tiempo"),be("#tooltip"),{alCambiarIndice:g}),I=null,R=be("#t-play");function U(){clearInterval(I),I=null,R.setAttribute("aria-pressed","false"),R.querySelector(".accion__texto").textContent="Reproducir"}function H(){let[G,ie]=h();a.indice>=ie&&M({indice:G},{completo:!1}),R.setAttribute("aria-pressed","true"),R.querySelector(".accion__texto").textContent="Pausar",I=setInterval(()=>{let[,me]=h(),Ne=a.indice+a.paso;if(Ne>me){M({indice:me},{completo:!1}),U();return}M({indice:Ne},{completo:!1})},160)}R.addEventListener("click",()=>I?U():H()),be("#t-paso").addEventListener("change",G=>{a.paso=Number(G.target.value)}),be("#t-adelante").addEventListener("click",()=>M({indice:a.indice+a.paso},{completo:!1})),be("#t-atras").addEventListener("click",()=>M({indice:a.indice-a.paso},{completo:!1})),be("#t-inicio").addEventListener("click",()=>M({indice:h()[0]},{completo:!1})),be("#ir-brecha").addEventListener("click",()=>{let G=d();G.metricas.brecha.horas>0&&M({indice:G.metricas.brecha.desde},{completo:!1})});let C=window.claude?.use?window.claude.use("downloads").catch(()=>null):Promise.resolve(null);be("#exportar-csv").addEventListener("click",async()=>{let G=d(),ie="\uFEFF"+_c(G.filas,{inicio:`${G.serie[G.i0].t}Z`,fin:`${G.serie[G.i1].t}Z`,enlaceActivo:a.enlaceActivo,tipoEnlace:a.tipoEnlace,polvo:a.polvo,modoHorizonte:bc(a.modoHorizonte,G.sitio)}),me=`comparativo-sitios_${a.desde}_${a.hasta}.csv`,Ne=await C;if(Ne){try{await Ne.save({filename:me,data:ie})}catch(Be){Be?.code!=="declined"&&(be("#comparador-meta").textContent+=" No se pudo exportar el CSV en esta vista.")}return}let Je=URL.createObjectURL(new Blob([ie],{type:"text/csv;charset=utf-8"})),at=Object.assign(document.createElement("a"),{href:Je,download:me});document.body.append(at),at.click(),at.remove(),setTimeout(()=>URL.revokeObjectURL(Je),1e3)});let O=()=>matchMedia("(prefers-reduced-motion: reduce)").matches,X=G=>{G===a.sitioId&&F?F.enfocarSitio(n.find(ie=>ie.id===G)):M({sitioId:G})},F=Lu(be("#luna"),{alElegir:X,urlTextura:document.getElementById("textura-luna")?.getAttribute("href")||null,urlPolo:document.getElementById("relieve-polo")?.getAttribute("href")||null,reducirMovimiento:O}),ne=F?null:bo(be("#luna"),X);F||be("#luna").classList.add("luna--sin-webgl");let V=bo(be("#mapa"),X),ee="../docs/mapeo-lunar-3d-ilustrativo.html?embebido=1&v=20261115e",se=location.protocol==="file:"||!!document.getElementById("datos-demo"),Ee=se?"2d":"3d",Te=null,Z="lunar";function q(G=d(),ie=!1){if(!Te||!Te.dataset.listo)return;let me=Te.contentWindow,Ne=G.muestra;me.postMessage({tipo:"sitio",id:a.sitioId},location.origin),me.postMessage({tipo:"sol",theta:G.sitio.lon+Ne.sol.az,el:Ne.sol.el,visible:Ne.sol.visible,inmediato:ie},location.origin),Te.dataset.modo!==Z&&(me.postMessage({tipo:"modo",modo:Z},location.origin),Te.dataset.modo=Z)}function Q(){let G=Te&&Te.contentDocument,ie=G?.getElementById("leyenda-min")?.textContent||"Bajo",me=G?.getElementById("leyenda-max")?.textContent||"Alto";be("#leyenda-alturas").innerHTML=`<span>${De(ie)}</span><span class="leyenda-alturas__barra" aria-hidden="true"></span><span>${De(me)}</span>`}function pe(){let G=Ee==="3d";G&&!Te&&(Te=document.createElement("iframe"),Te.className="visor3d__marco",Te.title="Vista 3D del relieve LOLA con los tres sitios",Te.src=ee,Te.addEventListener("load",()=>{Te.dataset.listo="1",delete Te.dataset.modo,q(d(),!0),Q()}),be("#terreno").append(Te)),be("#tarjeta-mapa").dataset.modo=G?"3d":"2d",be("#terreno").hidden=!G,be("#mapa").hidden=G,be("#leyenda-mapa").hidden=G,be("#relieve-visor").hidden=!G,be("#leyenda-alturas").hidden=!(G&&Z==="topo"),be("#sub-mapa").textContent=G?"Relieve real LOLA (promedio de 2 km); arrastra para girar y pulsa un sitio para elegirlo":"Proyecci\xF3n polar con coordenadas reales; pulsa un sitio para elegirlo";for(let ie of be("#modo-mapa").querySelectorAll("button"))ie.setAttribute("aria-pressed",String(ie.dataset.modo===Ee))}window.addEventListener("message",G=>{!Te||G.source!==Te.contentWindow||G.origin!==location.origin||G.data&&G.data.tipo==="sitio-visor"&&n.some(ie=>ie.id===G.data.id)&&G.data.id!==a.sitioId&&M({sitioId:G.data.id})}),be("#relieve-visor").addEventListener("click",G=>{let ie=G.target.closest("button[data-relieve]");if(ie){Z=ie.dataset.relieve;for(let me of be("#relieve-visor").querySelectorAll("button"))me.setAttribute("aria-pressed",String(me===ie));Q(),pe(),q()}}),be("#modo-mapa").addEventListener("click",G=>{let ie=G.target.closest("button[data-modo]");ie&&(Ee=ie.dataset.modo,pe(),Ee==="2d"&&V.render(d()))}),se?be("#estado-terreno").textContent="La vista 3D necesita conexi\xF3n: aqu\xED se muestra el mapa polar 2D.":(be("#modo-mapa").hidden=!1,be("#visor-completo").hidden=!1),be("#luna-sitios").addEventListener("click",G=>{let ie=G.target.closest("button");ie&&(ie.dataset.sitio?X(ie.dataset.sitio):ie.dataset.accion==="tres"&&F&&F.verTres())});let oe=[];function Pe(G){let ie=d();G&&(p(),b(),oe=pc(ie.serie,ie.i0,ie.i1,a.enlaceActivo)),Ic(be("#hora-utc"),be("#fecha-utc"),ie.muestra),Pc(be("#destacada"),ie),Lc(be("#eventos"),be("#eventos-total"),ie,oe,me=>M({indice:me},{completo:!1})),a.vista==="resumen"?(Du(be("#luna-sitios"),ie,!!F),Nu(be("#luna-ficha"),ie,!!F),F?F.render(ie):ne.render(ie),G?(Tc(be("#franja"),ie),Ac(be("#disponibilidad"),ie),wc(be("#mini-comparativo"),ie),S.dibujar(ie)):S.moverCursor(ie)):a.vista==="sitios"?(G&&zu(be("#leyenda-horizonte"),a),Nc(be("#estado"),ie),G&&!Te&&Ee==="3d"&&pe(),Ee==="3d"?q(ie):V.render(ie),Bu(be("#grafica-horizonte"),ie)):a.vista==="comparador"?G&&Hu(be("#tabla-comparador"),be("#comparador-meta"),be("#conclusiones"),ie):a.vista==="enlace"&&(G?(Vu(be("#leyenda-tiempo"),a),N.dibujar(ie)):N.moverCursor(ie),Dc(be("#porque"),ie))}let tt=window.innerWidth,Re=null;window.addEventListener("resize",()=>{window.innerWidth!==tt&&(tt=window.innerWidth,clearTimeout(Re),Re=setTimeout(()=>Pe(!0),150))}),kc(be("#leyenda-mapa")),Pe(!0),l&&F&&a.vista==="resumen"&&setTimeout(()=>F.enfocarSitio(l),450)}n_();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
