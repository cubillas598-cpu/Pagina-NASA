var td=["sin_enlace","robusto","rapido"],nd=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;function uc(i){if(typeof i!="string"||!nd.test(i))return!1;let e=Date.parse(`${i}:00Z`);return!Number.isNaN(e)&&new Date(e).toISOString().slice(0,16)===i}function Dn(i){return Date.parse(`${i}:00Z`)}var id=["sol_el","sol_az","tierra_el","tierra_az"];function hr(i,e="sitio"){let t=[];if(!Array.isArray(i)||i.length===0)return[`${e}: no hay muestras horarias.`];let n=null;for(let s=0;s<i.length&&t.length<5;s++){let r=i[s],a=r&&uc(r.t)?Dn(r.t):NaN;if(Number.isNaN(a)){t.push(`${e}: la muestra ${s} no tiene una fecha v\xE1lida.`);continue}n!==null&&a-n!==36e5&&t.push(`${e}: hay un salto en los datos antes de ${r.t}.`),n=a;for(let o of id){let l=r[o],c=o.endsWith("_el")?Math.abs(l)>90:l<0||l>360;if(typeof l!="number"||!Number.isFinite(l)||c){t.push(`${e}: ${o} no es un \xE1ngulo v\xE1lido en ${r.t}.`);break}}}return t}function lc(i,e){if(!i||!Array.isArray(i.elevacion_deg))return[`${e}: falta el perfil de horizonte.`];let t=i.resolucion_deg;if(typeof t!="number"||!(t>0)||Math.abs(360/t-Math.round(360/t))>1e-9)return[`${e}: resoluci\xF3n de horizonte no v\xE1lida.`];let n=i.elevacion_deg;if(n.length!==Math.round(360/t))return[`${e}: el horizonte debe tener ${Math.round(360/t)} valores y tiene ${n.length}.`];let s=n.findIndex(r=>typeof r!="number"||!Number.isFinite(r)||Math.abs(r)>90);return s>=0?[`${e}: valor de horizonte no v\xE1lido en el azimut ${s*t}\xB0.`]:[]}function dc(i){let e=[],t=o=>typeof o=="number"&&Number.isFinite(o);if(!i||!Array.isArray(i.sitios)||i.sitios.length===0)return["El escenario no tiene sitios."];let n=new Set;for(let o of i.sitios){let l=o&&o.id?o.id:"sitio sin id";!o||!o.id?e.push("Hay un sitio sin id."):n.has(o.id)?e.push(`${l}: el id est\xE1 repetido.`):n.add(o.id),e.push(...lc(o.horizonte,l));let c=o.relevo;!c||![c.az_deg,c.el_deg,c.distancia_km].every(t)?e.push(`${l}: el punto de apoyo necesita azimut, elevaci\xF3n y distancia num\xE9ricos.`):(c.distancia_km<=0&&e.push(`${l}: la distancia al punto de apoyo debe ser mayor que 0 km.`),(c.az_deg<0||c.az_deg>=360||Math.abs(c.el_deg)>90)&&e.push(`${l}: azimut o elevaci\xF3n del punto de apoyo fuera de rango.`),e.push(...lc(c.horizonte,`${l}/punto de apoyo`)))}let s=i.enlace_local;!s||!t(s.rf?.bateria_relevo_h)||!t(s.optico?.sep_sin_enlace_deg)||!t(s.optico?.sep_robusto_deg)?e.push("Faltan umbrales num\xE9ricos del enlace local."):(s.rf.bateria_relevo_h<=0&&e.push("La bater\xEDa del punto de apoyo debe durar m\xE1s de 0 h."),(s.optico.sep_sin_enlace_deg<0||s.optico.sep_sin_enlace_deg>=s.optico.sep_robusto_deg)&&e.push('Umbrales \xF3pticos incoherentes: la separaci\xF3n "sin enlace" debe ser menor que la de "robusto".'));let r=i.fuentes;(!r||typeof r!="object"||!r.efemerides||!Object.values(r).every(o=>o&&typeof o.nombre=="string"))&&e.push("Faltan las fuentes del escenario (nombre de cada una, incluida la de efem\xE9rides).");let a=i.evento_polvo;return(!a||!uc(a.inicio)||!t(a.duracion_s)||a.duracion_s<0)&&e.push("El evento de polvo necesita inicio y duraci\xF3n v\xE1lidos."),e}function fc(i,e){if(!i)return[];if(typeof i!="object"||!i.sitios||typeof i.sitios!="object")return["El archivo de terreno no tiene sitios."];let t=[],n=(s,r,a)=>typeof s=="number"&&Number.isFinite(s)&&s>=r&&s<=a;for(let s of e.sitios){let r=i.sitios[s.id];if(!r){t.push(`${s.id}: faltan sus variables de terreno.`);continue}(!n(r.pendiente_media_deg,0,90)||!n(r.pendiente_max_deg,0,90)||r.pendiente_max_deg<r.pendiente_media_deg)&&t.push(`${s.id}: pendiente fuera de rango.`),n(r.pct_llano_500m,0,100)||t.push(`${s.id}: % de \xE1rea llana fuera de rango.`),r.rugosidad_100m_m!==null&&!n(r.rugosidad_100m_m,0,1e3)&&t.push(`${s.id}: rugosidad no v\xE1lida.`),(!r.aproximacion||!n(r.aproximacion.mejor_obstaculo_deg,-90,90))&&t.push(`${s.id}: ruta de aproximaci\xF3n no v\xE1lida.`),"dist_psr_km"in r&&r.dist_psr_km!==null&&!n(r.dist_psr_km,0,1e3)&&t.push(`${s.id}: distancia a sombra permanente no v\xE1lida.`)}return t}function pc(i,e){let t=[];for(let n of i.sitios){let s=e&&e[n.id];s&&Number.isFinite(s.lat)&&Number.isFinite(s.lon)&&Math.abs(s.lat)<=90&&s.lon>=0&&s.lon<360?s.elev_km!==void 0&&!Number.isFinite(s.elev_km)&&t.push(`${n.id}: la elevaci\xF3n debe ser num\xE9rica.`):t.push(`${n.id}: faltan latitud o longitud v\xE1lidas.`)}return t}function sd(i){return(i%360+360)%360}function gi(i,e){if(!i)return 0;let t=i.elevacion_deg,n=t.length,s=sd(e)/i.resolucion_deg,r=Math.floor(s)%n,a=(r+1)%n,o=s-Math.floor(s);return t[r]*(1-o)+t[a]*o}function cc(i,e,t,n){let s=Math.PI/180,r=Math.sin(e*s)*Math.sin(n*s)+Math.cos(e*s)*Math.cos(n*s)*Math.cos((i-t)*s);return Math.acos(Math.min(1,Math.max(-1,r)))/s}function rn(i,e,t){return{clave:i,nivel:e,texto:t}}function rd(i){let e=Math.min(...i.map(t=>t.nivel));return{estado:td[e],limitantes:i.filter(t=>t.nivel===e),factores:i}}function mc(i,e,t){let n=t.modoHorizonte==="plano",s=n?null:i.horizonte,r=n?null:i.relevo.horizonte,a=i.relevo,o=t.reglas,l=a.el_deg>gi(s,a.az_deg),c=t.eventoPolvo?Dn(t.eventoPolvo.inicio):NaN,u=36e5,d=0;return e.map((h,f)=>{let _=Dn(h.t),v=gi(s,h.sol_az),p=gi(s,h.tierra_az),m=h.sol_el>v,S=h.tierra_el>p,w=h.sol_el>gi(r,h.sol_az),M=h.tierra_el>gi(r,h.tierra_az);d=w?0:d+1;let A=[l?rn("geometria",2,"L\xEDnea de vista despejada hacia el punto de apoyo."):rn("geometria",0,"El terreno bloquea la l\xEDnea de vista hacia el punto de apoyo.")],E=null;if(t.tipoEnlace==="rf")w?A.push(rn("energia",2,"Punto de apoyo iluminado: transmite a tasa alta.")):d<=o.rf.bateria_relevo_h?A.push(rn("energia",1,`Punto de apoyo en sombra (${d} h): opera con bater\xEDa a tasa reducida.`)):A.push(rn("energia",0,`Punto de apoyo en sombra m\xE1s de ${o.rf.bateria_relevo_h} h: bater\xEDa agotada (supuesto).`));else{let N=[];if(m&&N.push(cc(h.sol_az,h.sol_el,a.az_deg,a.el_deg)),w&&N.push(cc(h.sol_az,h.sol_el,a.az_deg+180,-a.el_deg)),N.length===0)A.push(rn("sol",2,"Sol bajo el horizonte: no deslumbra el enlace."));else{E=Math.min(...N);let R=E.toFixed(1),I=o.optico;E<I.sep_sin_enlace_deg?A.push(rn("sol",0,`Sol a ${R}\xB0 de la l\xEDnea de vista: el receptor queda deslumbrado.`)):E<I.sep_robusto_deg?A.push(rn("sol",1,`Sol a ${R}\xB0 de la l\xEDnea de vista: m\xE1s ruido, modo de baja tasa.`)):A.push(rn("sol",2,`Sol a ${R}\xB0 de la l\xEDnea de vista: margen suficiente.`))}if(t.polvo&&t.eventoPolvo){let R=ad(t.eventoPolvo,c,_);R>=1800?A.push(rn("polvo",0,`Polvo del penacho sobre la l\xEDnea de vista durante ${Math.round(R)} s de esta hora.`)):R>0&&A.push(rn("polvo",1,`Polvo del penacho bloquea la l\xEDnea de vista unos ${Math.round(R)} s en esta hora: el enlace reintenta en baja tasa.`))}}let g=rd(A),b=g.estado!=="sin_enlace"&&M;return{i:f,t:h.t,ms:_,sol:{el:h.sol_el,az:h.sol_az,horizonte:v,visible:m},tierra:{el:h.tierra_el,az:h.tierra_az,horizonte:p,visible:S},relevo:{sol:w,tierra:M,sombraH:d,lineaDeVista:l},enlace:{...g,separacionSol:E},respaldoTierra:b}})}function ad(i,e,t){let n=e+i.duracion_s*1e3,s=Math.min(n,t+36e5)-Math.max(e,t);return Math.max(0,s)/1e3}function ur(i,e){let t=Dn(e.inicio),n=t+e.duracion_s*1e3,s=i.findIndex(a=>a.ms+36e5>t);if(s<0||i[s].ms>=n)return null;let r=s;for(;r+1<i.length&&i[r+1].ms<n;)r++;return[s,r]}function hc(i,e){return i.tierra.visible||e&&i.respaldoTierra}function cr(i,e,t,n){let s={horas:0,desde:null,hasta:null},r=null;for(let a=e;a<=t+1;a++){let o=a<=t&&n(i[a]);if(o&&r===null&&(r=a),!o&&r!==null){let l=a-r;l>s.horas&&(s={horas:l,desde:r,hasta:a-1}),r=null}}return s}function gc(i,e,t,n){let s=t-e+1,r=0,a=0,o=0,l=0,c=0,u=0,d={rapido:0,robusto:0,sin_enlace:0};for(let f=e;f<=t;f++){let _=i[f],v=hc(_,n);_.sol.visible&&r++,_.tierra.visible&&a++,v&&o++,v&&_.sol.visible&&l++,_.sol.visible&&_.tierra.visible&&c++,n&&_.respaldoTierra&&u++,d[_.enlace.estado]++}let h=cr(i,e,t,f=>!hc(f,n));return h.acotada=h.horas>0&&(h.desde===e||h.hasta===t),{horas:s,horasSol:r,horasTierra:a,pctSol:100*r/s,pctTierra:100*a/s,horasComunicacion:o,horasAmbas:l,pctComunicacion:100*o/s,pctAmbas:100*l/s,horasSolTierra:c,pctSolTierra:100*c/s,horasRespaldo:n?u:null,pctRespaldo:n?100*u/s:null,ventanaSol:cr(i,e,t,f=>f.sol.visible),ventanaTierra:cr(i,e,t,f=>f.tierra.visible),sombraMax:cr(i,e,t,f=>!f.sol.visible),enlace:n?d:null,brecha:h}}var od={sol:{inicio:"Inicio de sombra",fin:"Vuelve el Sol"},tierra:{inicio:"Tierra oculta",fin:"Tierra visible"},enlace:{inicio:"Enlace local sin servicio",fin:"Enlace local restablecido"}};function _c(i,e,t,n){let s=[["sol",a=>a.sol.visible],["tierra",a=>a.tierra.visible]];n&&s.push(["enlace",a=>a.enlace.estado!=="sin_enlace"]);let r=[];for(let[a,o]of s)for(let l=e+1;l<=t;l++){let c=o(i[l-1]),u=o(i[l]);if(c===u)continue;let d=c&&!u,h=null;if(d){let f=l;for(;f<=t&&!o(i[f]);)f++;h=f-l}r.push({tipo:a,indice:l,inicio:d,horas:h,titulo:od[a][d?"inicio":"fin"]})}return r.sort((a,o)=>a.indice-o.indice||a.tipo.localeCompare(o.tipo))}function xc(i,e,t,n){let s=[];for(let r=e;r<=t;r++){let a=n(i[r]),o=s[s.length-1];o&&o.valor===a?o.hasta=r:s.push({valor:a,desde:r,hasta:r})}return s}var ps=[{clave:"pctSol",corta:"iluminaci\xF3n solar",etiqueta:"Horas con iluminaci\xF3n solar",unidad:"%",mejor:"max",frase:i=>`${i} presenta m\xE1s horas de iluminaci\xF3n en el periodo seleccionado.`},{clave:"pctTierra",corta:"vista directa a la Tierra",etiqueta:"Horas con vista directa a la Tierra",unidad:"%",mejor:"max",frase:i=>`${i} mantiene m\xE1s horas de vista directa a la Tierra.`},{clave:"pctSolTierra",corta:"Sol y Tierra a la vez",etiqueta:"Horas con Sol y Tierra visibles a la vez",unidad:"%",mejor:"max",frase:i=>`${i} tiene m\xE1s horas con Sol y vista directa a la Tierra al mismo tiempo.`},{clave:"ventanaTierra",corta:"ventana continua con la Tierra",etiqueta:"Mayor ventana continua con la Tierra visible",unidad:"h",mejor:"max",frase:i=>`${i} ofrece la ventana continua m\xE1s larga con la Tierra visible.`},{clave:"sombraMax",corta:"sombra continua m\xE1s corta",etiqueta:"Mayor periodo continuo en sombra",unidad:"h",mejor:"min",frase:i=>`${i} tiene el periodo en sombra m\xE1s corto.`},{clave:"pctRespaldo",corta:"respaldo que llega a la Tierra",etiqueta:"Horas con respaldo que llega a la Tierra",unidad:"%",mejor:"max",enlace:!0,frase:i=>`${i} tiene m\xE1s horas de respaldo efectivo hacia la Tierra.`},{clave:"rapido",corta:"enlace local r\xE1pido",etiqueta:"Enlace local r\xE1pido",unidad:"h",mejor:"max",enlace:!0,frase:i=>`${i} acumula m\xE1s horas de enlace local r\xE1pido.`},{clave:"robusto",etiqueta:"Enlace local robusto",unidad:"h",mejor:null,enlace:!0},{clave:"sin_enlace",corta:"menos horas sin enlace local",etiqueta:"Sin enlace local",unidad:"h",mejor:"min",enlace:!0,frase:i=>`${i} pasa menos horas sin enlace local.`},{clave:"brecha",corta:"interrupci\xF3n m\xE1s corta",etiqueta:"Mayor intervalo sin comunicaci\xF3n",unidad:"h",mejor:"min",frase:i=>`${i} tiene la interrupci\xF3n continua m\xE1s corta.`},{clave:"pendienteMedia",terreno:"pendiente_media_deg",corta:"pendiente m\xE1s suave",etiqueta:"Pendiente media (100 m de radio)",unidad:"\xB0",mejor:"min",frase:i=>`${i} tiene la pendiente media m\xE1s suave.`},{clave:"pendienteMax",terreno:"pendiente_max_deg",corta:"pendiente m\xE1xima m\xE1s baja",etiqueta:"Pendiente m\xE1xima (100 m de radio)",unidad:"\xB0",mejor:"min",frase:i=>`${i} tiene la pendiente m\xE1xima m\xE1s baja.`},{clave:"llano",terreno:"pct_llano_500m",corta:"m\xE1s \xE1rea llana",etiqueta:"\xC1rea con menos de 10\xB0 (500 m de radio)",unidad:"%",mejor:"max",frase:i=>`${i} tiene m\xE1s \xE1rea llana alrededor.`},{clave:"rugosidad",terreno:"rugosidad_100m_m",corta:"terreno m\xE1s liso",etiqueta:"Rugosidad a 100 m",unidad:"m",mejor:"min",frase:i=>`${i} tiene el terreno m\xE1s liso.`},{clave:"aproximacion",terreno:"aproximacion.mejor_obstaculo_deg",corta:"llegada m\xE1s despejada",etiqueta:"Obst\xE1culo en la mejor ruta de llegada",unidad:"\xB0",mejor:"min",frase:i=>`${i} tiene la ruta de llegada m\xE1s despejada.`},{clave:"hielo",terreno:"dist_psr_km",corta:"hielo m\xE1s cerca",etiqueta:"Distancia a sombra permanente (posible hielo)",unidad:"km",mejor:"min",frase:i=>`${i} est\xE1 m\xE1s cerca de una zona en sombra permanente, donde puede haber hielo.`}];function ld(i,e){return e.split(".").reduce((t,n)=>t==null?null:t[n],i)}function dr(i,e){let t=ps.find(n=>n.clave===e);if(t&&t.terreno){let n=ld(i.terreno,t.terreno);return typeof n=="number"&&Number.isFinite(n)?n:null}return["pctSol","pctTierra","pctSolTierra","pctRespaldo"].includes(e)?i[e]:["brecha","ventanaTierra","sombraMax","ventanaSol"].includes(e)?i[e].horas:i.enlace?i.enlace[e]:null}function vc(i,e){let t={},n=[];for(let s of ps){if(!s.mejor||s.enlace&&!e)continue;let r=i.map(l=>dr(l.metricas,s.clave));if(r.some(l=>l==null))continue;let a=s.mejor==="max"?Math.max(...r):Math.min(...r),o=i.filter((l,c)=>Math.abs(r[c]-a)<1e-9);t[s.clave]=o.map(l=>l.sitio.id),o.length===i.length?n.push(`${s.etiqueta}: los tres sitios empatan.`):o.length>1?n.push(`${s.etiqueta}: empate entre ${o.map(l=>l.sitio.etiqueta).join(" y ")}.`):n.push(s.frase(o[0].sitio.etiqueta))}return{mejores:t,conclusiones:n,resumen:cd(i,t)}}function cd(i,e){let t=Object.keys(e).length;return i.map(n=>({sitio:n.sitio,metricas:ps.filter(s=>e[s.clave]&&e[s.clave].length===1&&e[s.clave][0]===n.sitio.id).map(s=>s.corta),total:t})).filter(n=>n.metricas.length>0).sort((n,s)=>s.metricas.length-n.metricas.length)}var ms={energia:.25,comunicacion:.2,respaldo:.1,noche:.1,apagon:.05,terreno:.15,aproximacion:.05,hielo:.1},hd={horasAutonomia:72,pendienteBuena:5,pendienteMala:15,rugosidadBuena:.5,rugosidadMala:3,obstaculoBueno:2,obstaculoMalo:10,hieloCerca:1,hieloLejos:25},yo={energia:"iluminaci\xF3n",comunicacion:"Tierra directa",respaldo:"respaldo",noche:"noche m\xE1s larga",apagon:"apag\xF3n m\xE1s largo",terreno:"terreno",aproximacion:"ruta de llegada",hielo:"cercan\xEDa al hielo"};function Ri(i,e,t){if(!Number.isFinite(i))return null;let n=(i-t)/(e-t);return 100*Math.min(1,Math.max(0,n))}function Mo(i,e,t=null,n=ms){let s=hd,r={energia:i.pctSol,comunicacion:i.pctTierra,respaldo:e?i.pctRespaldo:null,noche:i.sombraMax?Ri(i.sombraMax.horas,0,s.horasAutonomia):null,apagon:i.brecha?Ri(i.brecha.horas,0,s.horasAutonomia):null,terreno:null,aproximacion:null,hielo:null};if(t){let l=Ri(t.pendiente_media_deg,s.pendienteBuena,s.pendienteMala),c=Ri(t.rugosidad_100m_m,s.rugosidadBuena,s.rugosidadMala);r.terreno=l===null?null:c===null?l:.7*l+.3*c,r.aproximacion=Ri(t.aproximacion?.mejor_obstaculo_deg,s.obstaculoBueno,s.obstaculoMalo),"dist_psr_km"in t&&(r.hielo=t.dist_psr_km===null?0:Ri(t.dist_psr_km,s.hieloCerca,s.hieloLejos))}let a=0,o=0;for(let[l,c]of Object.entries(n)){let u=r[l];u==null||!Number.isFinite(u)||(a+=c*u,o+=c)}return{total:o>0?a/o:0,partes:r,pesoUsado:o}}function ud(i,e,t=ms,n=i.terreno??null){return Mo(i,e,n,t).total}function dd(i){let e=i==null?"":String(i);return/[",\n;]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function yc(i,e){let n=[["sitio","nombre","primera_hora_utc","ultima_hora_utc","horas","pct_iluminacion","pct_tierra_directa","enlace_local","tipo_enlace","evento_polvo","horas_rapido","horas_robusto","horas_sin_enlace","mayor_intervalo_sin_comunicacion_h","horizonte","indice_conveniencia","pct_sol_y_tierra","pct_respaldo_tierra","mayor_ventana_tierra_h","mayor_sombra_h","pendiente_media_deg","pendiente_max_deg","pct_llano_500m","rugosidad_100m_m","obstaculo_mejor_llegada_deg","distancia_sombra_permanente_km"].join(",")];for(let{sitio:s,metricas:r}of i)n.push([s.etiqueta,s.nombre_corto,e.inicio,e.fin,r.horas,r.pctSol.toFixed(1),r.pctTierra.toFixed(1),e.enlaceActivo?"activado":"desactivado",e.enlaceActivo?e.tipoEnlace:"",e.enlaceActivo&&e.tipoEnlace==="optico"&&e.polvo?"si":"no",r.enlace?r.enlace.rapido:"",r.enlace?r.enlace.robusto:"",r.enlace?r.enlace.sin_enlace:"",r.brecha.horas,e.modoHorizonte,ud(r,e.enlaceActivo).toFixed(1),r.pctSolTierra.toFixed(1),r.pctRespaldo===null?"":r.pctRespaldo.toFixed(1),r.ventanaTierra.horas,r.sombraMax.horas,...["pendienteMedia","pendienteMax","llano","rugosidad","aproximacion","hielo"].map(a=>dr(r,a)??"")].map(dd).join(","));return n.join(`
`)+`
`}async function Sc(i="../"){let e=document.getElementById("datos-demo");if(e){let l=JSON.parse(e.textContent);return Mc(l.escenario,l.efemerides,l.coordenadas,l.generado,l.terreno??null)}let t=async l=>{let c=await fetch(i+l,{cache:"no-cache"});if(!c.ok)throw new Error(`No se pudo leer ${l} (HTTP ${c.status}).`);return c.json()},n=await t("data/escenario_demo.json"),s={},r={},a={};await Promise.all(n.sitios.map(async l=>{let c=await t(l.efemerides);s[l.id]=c.horas,r[l.id]=c.sitio,a[l.id]=c.meta?.generado_utc??null}));let o=null;try{o=await t("data/terreno_sitios.json")}catch{o=null}return Mc(n,s,r,a,o)}function Mc(i,e,t,n={},s=null){let r=dc(i);if(r.length)throw new Error(`Escenario no v\xE1lido. ${r.slice(0,5).join(" ")}`);let a=pc(i,t);if(a.length)throw new Error(`Coordenadas no v\xE1lidas. ${a.join(" ")}`);for(let d of i.sitios)Object.assign(d,{lat:t[d.id].lat,lon:t[d.id].lon,elev_km:t[d.id].elev_km??0});let o=i.sitios.map(d=>d.id),l=e[o[0]];for(let d of o){let h=e[d],f=hr(h,d);if(f.length)throw new Error(`Datos de efem\xE9rides no v\xE1lidos. ${f.join(" ")}`);if(h.length!==l.length||h[0].t!==l[0].t||h[h.length-1].t!==l[l.length-1].t)throw new Error(`Las efem\xE9rides de ${d} no cubren las mismas horas que ${o[0]}.`)}let c=fc(s,i);if(c.length)throw new Error(`Datos de terreno no v\xE1lidos. ${c.join(" ")}`);for(let d of i.sitios)d.terreno=s?s.sitios[d.id]:null;i.terreno_meta=s?s.meta??null:null;let u=Object.values(n||{}).filter(Boolean).sort();return i.generado_utc=u.length?u[0]:null,{escenario:i,efemerides:e}}var fd={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12},bc={sol:"10",tierra:"399"};function pd(i){let e=/^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/.exec(String(i).trim()),t=e&&fd[e[2].toLowerCase()];if(!t)throw new Error(`Fecha de Horizons no reconocida: ${i}`);return`${e[1]}-${String(t).padStart(2,"0")}-${e[3]}T${e[4]}:${e[5]}`}function md(i){if(typeof i!="string"||!i.includes("$$SOE")||!i.includes("$$EOE"))throw new Error("Horizons no devolvi\xF3 un bloque de datos.");let[e,t]=i.split("$$SOE"),n=t.split("$$EOE")[0].trim(),s=3,r=4,a=e.trim().split(`
`).map(l=>l.trim()).filter(l=>l&&!l.startsWith("*"));if(a.length){let l=a[a.length-1].split(",").map(d=>d.trim().toLowerCase()),c=l.findIndex(d=>d.startsWith("azi")),u=l.findIndex(d=>d.startsWith("elev"));c>=0&&u>=0&&(s=c,r=u)}let o=n.split(`
`).filter(l=>l.trim()).map(l=>{let c=l.split(",").map(h=>h.trim()),u=Number(c[s]),d=Number(c[r]);if(c[s]===""||c[r]===""||!Number.isFinite(u)||!Number.isFinite(d))throw new Error(`Fila de Horizons ilegible: ${l.trim()}`);return{t:pd(c[0]),el:d,az:u}});if(!o.length)throw new Error("Horizons devolvi\xF3 un bloque vac\xEDo.");return o}function gd(i,e,t){let n=new Map(e.map(r=>[r.t,r])),s=i.map(r=>{let a=n.get(r.t);if(!a)throw new Error(`${t}: Horizons no devolvi\xF3 la Tierra para ${r.t}.`);return{t:r.t,sol_el:r.el,sol_az:r.az,tierra_el:a.el,tierra_az:a.az}});if(s.length!==n.size)throw new Error(`${t}: Sol y Tierra no cubren las mismas horas.`);return s}function _d(i,e,t,n,s){let r=new URL(i);return r.search=new URLSearchParams({cuerpo:e,lat:String(t.lat),lon:String(t.lon),inicio:n,fin:s}).toString(),r.toString()}async function Ec({proxy:i,sitios:e,inicio:t,fin:n,fetchFn:s=fetch,timeoutMs:r=45e3}){let a=async(l,c)=>{let u=new AbortController,d=setTimeout(()=>u.abort(),r),h;try{h=await s(_d(i,l,c,t,n),{signal:u.signal})}catch(_){throw new Error(_?.name==="AbortError"?"JPL Horizons tard\xF3 demasiado en responder.":"No hay conexi\xF3n con el intermediario de JPL Horizons.")}finally{clearTimeout(d)}let f=null;try{f=await h.json()}catch{}if(!h.ok)throw new Error(f?.error||`El intermediario respondi\xF3 HTTP ${h.status}.`);if(typeof f?.result!="string")throw new Error("Respuesta inesperada del intermediario.");return md(f.result)},o={};return await Promise.all(e.map(async l=>{let[c,u]=await Promise.all([a(bc.sol,l),a(bc.tierra,l)]);o[l.id]=gd(c,u,l.id)})),o}var xd=new Intl.DateTimeFormat("es-MX",{timeZone:"UTC",day:"numeric",month:"short",year:"numeric"}),vd=new Intl.DateTimeFormat("es-MX",{timeZone:"UTC",day:"numeric",month:"short"}),yd=new Intl.DateTimeFormat("es-MX",{timeZone:"UTC",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}),Tc=i=>i.replace(".","");function Nn(i){return Tc(xd.format(i))}function _i(i){return Tc(vd.format(i))}function vn(i){return`${yd.format(i)} UTC`}function gs(i){return`${Nn(i)}, ${vn(i)}`}function _s(i){return new Date(i).toISOString().slice(0,10)}function _t(i,e=1){return i.toLocaleString("es-MX",{minimumFractionDigits:e,maximumFractionDigits:e})}function Qt(i,e=1){return`${_t(i,e)}\xB0`}function So(i,e=1){return`${i>=0?"+":"\u2212"}${_t(Math.abs(i),e)}\xB0`}function Un(i){return i===1?"1 h":`${i} h`}function De(i){return String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function fr(i,e,t,n){let s=n*Math.PI/180;return[i+t*Math.sin(s),e-t*Math.cos(s)]}function en(i,e){return typeof document>"u"?e:getComputedStyle(document.documentElement).getPropertyValue(i).trim()||e}var Ee={fondo:en("--fondo","#111214"),superficie:en("--panel-solido","#1B1D21"),texto:en("--texto","#F2F2EF"),texto2:en("--texto-2","#B1B3B6"),texto3:en("--texto-3","#8E9196"),acento:en("--acento","#C6A86A"),acentoClaro:en("--acento-claro","#E2C990"),sol:en("--sol","#E2C990"),tierra:en("--tierra","#A9C3DD"),ok:en("--ok","#82CFA2"),aviso:en("--aviso","#E3B65A"),error:en("--error","#EC8C84"),neutro:"rgba(255,255,255,.08)",sombra:"rgba(10,11,13,.6)"},Ot={rapido:{texto:"R\xE1pido",color:Ee.ok,clase:"c-ok",patron:null,ayuda:"El tramo local tiene margen: transmite a tasa alta."},robusto:{texto:"Robusto",color:Ee.aviso,clase:"c-aviso",patron:"p-rayas",ayuda:"Hay degradaci\xF3n: el enlace sigue, pero en modo de baja tasa con m\xE1s protecci\xF3n."},sin_enlace:{texto:"Sin enlace",color:Ee.error,clase:"c-error",patron:"p-cruces",ayuda:"El tramo local no funciona en esa hora."}},an={rf:"Radiofrecuencia",optico:"\xD3ptico"},Md={lola_skyline:"LOLA (DEM real)",sintetico:"perfil sint\xE9tico"};function pr(i,e){return i==="plano"?"plano (0\xB0)":Md[e.horizonte.fuente]||e.horizonte.fuente}function Ac(i,e){return i==="plano"?"plano":e.horizonte.fuente}var Nt={sol:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M4 4l1.6 1.6M14.4 14.4 16 16M4 16l1.6-1.6M14.4 5.6 16 4"/></g></svg>',tierra:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 7.5c2 .5 3 2 2.5 3.5S9 13 10 15M12 3.5c-.5 2 1 3 3 3.5M11.5 10.5c1.5-.5 3 .5 3.5 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',enlace:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 15 10 5l7 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="10" cy="5" r="2" fill="currentColor"/><path d="M6.5 3a5 5 0 0 0 0 4M13.5 3a5 5 0 0 1 0 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',eclipse:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 4a6 6 0 0 1 0 12z" fill="currentColor"/></svg>',respaldo:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16h4l3-5 3 5h4M10 11V4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="3.5" r="1.8" fill="currentColor"/></svg>'};function mr(){return`
    <pattern id="p-rayas" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="${Ee.aviso}"/><rect width="2.2" height="6" fill="rgba(0,0,0,.35)"/>
    </pattern>
    <pattern id="p-cruces" width="7" height="7" patternUnits="userSpaceOnUse">
      <rect width="7" height="7" fill="${Ee.error}"/><path d="M0 0l7 7M7 0 0 7" stroke="rgba(0,0,0,.4)" stroke-width="1.4"/>
    </pattern>
    <pattern id="p-polvo" width="5" height="5" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r=".9" fill="rgba(241,245,249,.55)"/><circle cx="4" cy="3.8" r=".6" fill="rgba(241,245,249,.4)"/>
    </pattern>`}function wc(i){let e=Ot[i];return e.patron?`url(#${e.patron})`:e.color}function gr(i,e,t,n,s,r){return`<div class="indicador">
    <span class="indicador__icono" style="color:${e}">${i}</span>
    <div>
      <div class="indicador__etq">${t}</div>
      <div class="indicador__valor">${n}${s?`<small>${s}</small>`:""}</div>
      ${r?`<div class="indicador__pie">${r}</div>`:""}
    </div>
  </div>`}function Cc(i,e){let{metricas:t,estado:n}=e,s;if(t.enlace){let r=t.enlace.rapido+t.enlace.robusto;s=gr(Nt.enlace,"var(--ok)",`Enlace local, ${an[n.tipoEnlace].toLowerCase()}`,`${_t(100*r/t.horas,0)} %`,`${Un(t.horasRespaldo)} llega a la Tierra`)}else s=gr(Nt.enlace,"var(--texto-3)","Enlace local","Desactivado","");i.innerHTML=gr(Nt.sol,"var(--acento-claro)","Iluminaci\xF3n solar",`${_t(t.pctSol,0)} %`,`${t.horasSol} de ${t.horas} h`)+gr(Nt.tierra,"var(--tierra)","Visibilidad de la Tierra",`${_t(t.pctTierra,0)} %`,`${t.horasTierra} de ${t.horas} h`)+s}function Rc(i,e){let{metricas:t}=e;i.innerHTML=`<p class="lectura">
    <strong>${_t(t.pctSol,1)} %</strong> de luz solar, <strong>${_t(t.pctTierra,1)} %</strong>
    con la Tierra visible, y un m\xE1ximo de <strong>${Un(t.sombraMax.horas)}</strong> seguidas
    en sombra. Hay <strong>${Un(t.horasSolTierra)}</strong> con Sol y Tierra visibles a la vez.
  </p>
  <div class="lectura__acciones">
    <a href="#enlace" class="boton boton--linea">Ver las ventanas</a>
    <a href="#comparador" class="boton boton--linea">Comparar sitios</a>
  </div>`}function Ic(i,e){let{metricas:t,estado:n}=e,s=n.enlaceActivo?"directa o respaldo":"solo directa";i.innerHTML=`
    <div class="meta">
      <div class="meta__valor">${_t(t.pctSolTierra,0)} %</div>
      <div class="barra" aria-hidden="true"><span style="width:${t.pctSolTierra}%"></span></div>
      <div class="meta__etq">Sol y Tierra visibles<br>${t.horasSolTierra} h a la vez</div>
    </div>
    <div class="meta">
      <div class="meta__valor">${_t(t.pctComunicacion,0)} %</div>
      <div class="barra barra--tierra" aria-hidden="true"><span style="width:${t.pctComunicacion}%"></span></div>
      <div class="meta__etq">Comunicaci\xF3n<br>${s}</div>
    </div>`}function Pc(i,e){let{filas:t,sitio:n}=e,s=t.reduce((a,o)=>o.metricas.pctSolTierra>a.metricas.pctSolTierra?o:a),r=t.filter(a=>Math.abs(a.metricas.pctSolTierra-s.metricas.pctSolTierra)<1e-9).length>1;i.innerHTML=t.map(({sitio:a,metricas:o})=>`
    <div class="mini-fila">
      <span class="mini-fila__nombre ${a.id===n.id?"activo":""}">${De(a.etiqueta)}</span>
      <span class="mini-fila__barras" role="img" aria-label="${De(a.etiqueta)}: ${_t(o.pctSol,0)} % de luz, ${_t(o.pctTierra,0)} % con la Tierra visible">
        <span class="barra"><span style="width:${o.pctSol}%"></span></span>
        <span class="barra barra--tierra"><span style="width:${o.pctTierra}%"></span></span>
      </span>
      <span class="mini-fila__valor">${_t(o.pctSol,0)} % luz<br>${_t(o.pctTierra,0)} % Tierra</span>
    </div>`).join("")+`
    <div class="mini-pie">
      <span>${r?"Empate en horas con Sol y Tierra.":`M\xE1s horas con Sol y Tierra: ${De(s.sitio.etiqueta)}`}</span>
      <a href="#comparador">Ver comparador</a>
    </div>`}var wt={izq:40,der:14,sup:40,inf:30};function Lc(i,{alCambiarIndice:e}){let t=null,n=null,s=!1;i.setAttribute("role","slider"),i.setAttribute("tabindex","0"),i.setAttribute("aria-label","Hora seleccionada en la gr\xE1fica de evoluci\xF3n");let r=c=>{let u=i.getBoundingClientRect(),d=(c-u.left)/u.width*t.W-wt.izq,h=Math.round(d/t.ancho*(t.n-1));return t.i0+Math.max(0,Math.min(t.n-1,h))};i.addEventListener("pointerdown",c=>{!t||c.button>0||(s=!0,i.setPointerCapture(c.pointerId),i.focus({preventScroll:!0}),e(r(c.clientX)))}),i.addEventListener("pointermove",c=>{s&&e(r(c.clientX))});let a=()=>{s=!1};i.addEventListener("pointerup",a),i.addEventListener("pointercancel",a),i.addEventListener("keydown",c=>{if(!t)return;let u={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:-24,PageDown:24},d=null;c.key in u?d=n.indice+u[c.key]:c.key==="Home"?d=t.i0:c.key==="End"&&(d=t.i1),d!==null&&(c.preventDefault(),e(Math.max(t.i0,Math.min(t.i1,d))))});function o(c){n=c;let{serie:u,i0:d,i1:h}=c,f=h-d+1,_=Math.max(300,Math.round(i.clientWidth||800)),v=_<600?220:300,p=_-wt.izq-wt.der,m=v-wt.sup-wt.inf,S=0,w=0;for(let I=d;I<=h;I++){let U=u[I];S=Math.min(S,U.sol.el-U.sol.horizonte,U.tierra.el-U.tierra.horizonte),w=Math.max(w,U.sol.el-U.sol.horizonte,U.tierra.el-U.tierra.horizonte)}S=Math.floor(S)-1,w=Math.ceil(w)+1;let M=I=>wt.izq+(f===1?p/2:(I-d)/(f-1)*p),A=I=>wt.sup+(w-I)/(w-S)*m,E=[],g=w-S>12?4:2;for(let I=Math.ceil(S/g)*g;I<=w;I+=g)E.push(`<line x1="${wt.izq}" x2="${_-wt.der}" y1="${A(I)}" y2="${A(I)}" stroke="rgba(255,255,255,${I===0?0:.06})"/>`),E.push(`<text x="${wt.izq-8}" y="${A(I)+4}" text-anchor="end" class="ev-eje">${I>0?"+":I<0?"\u2212":""}${Math.abs(I)}\xB0</text>`);E.push(`<rect x="${wt.izq}" y="${wt.sup}" width="${p}" height="${A(0)-wt.sup}" fill="rgba(255,255,255,.03)"/>`),E.push(`<line x1="${wt.izq}" x2="${_-wt.der}" y1="${A(0)}" y2="${A(0)}" stroke="rgba(255,255,255,.4)" stroke-dasharray="4 5"/>`);let b=[];for(let I=d;I<=h;I++)u[I].t.endsWith("T00:00")&&b.push(I);let N=Math.max(1,Math.ceil(b.length/Math.floor(p/64)));b.forEach((I,U)=>{U%N===0&&E.push(`<text x="${M(I)}" y="${v-8}" text-anchor="middle" class="ev-eje">${_i(u[I].ms)}</text>`)});let R=I=>{let U="";for(let V=d;V<=h;V++)U+=`${V===d?"M":"L"}${M(V).toFixed(1)},${A(I(u[V])).toFixed(1)}`;return U};E.push(`<path d="${R(I=>I.tierra.el-I.tierra.horizonte)}" fill="none" stroke="${Ee.tierra}" stroke-width="2" stroke-linejoin="round" opacity=".9"/>`),E.push(`<path d="${R(I=>I.sol.el-I.sol.horizonte)}" fill="none" stroke="${Ee.sol}" stroke-width="2.6" stroke-linejoin="round"/>`),E.push(`<text x="${_-wt.der}" y="${A(0)+14}" text-anchor="end" class="ev-eje ev-eje--halo">0\xB0 = horizonte local</text>`),i.innerHTML=`
      <svg viewBox="0 0 ${_} ${v}" aria-hidden="true">
        <style>.ev-eje{font:400 11px var(--fuente);fill:${Ee.texto3}}.ev-eje--halo{paint-order:stroke;stroke:#22242a;stroke-width:4px;stroke-linejoin:round}.ev-burbuja{font:600 11px var(--fuente);fill:${Ee.texto}}</style>
        ${E.join("")}
        <g id="ev-cursor"></g>
      </svg>`,t={W:_,H:v,ancho:p,n:f,i0:d,i1:h,x:M,y:A},l(c)}function l(c){if(n=c,!t)return;let{serie:u,indice:d}=c,h=u[d],f=t.x(d),_=t.y(h.sol.el-h.sol.horizonte),v=t.y(h.tierra.el-h.tierra.horizonte),p=`${_i(h.ms)}, ${vn(h.ms)}`,m=p.length*6.4+18,S=Math.min(Math.max(f-m/2,2),t.W-m-2);i.querySelector("#ev-cursor").innerHTML=`
      <line x1="${f}" x2="${f}" y1="${wt.sup-6}" y2="${t.H-wt.inf}" stroke="rgba(255,255,255,.35)"/>
      <rect x="${S}" y="6" width="${m}" height="22" rx="11" fill="rgba(17,18,20,.85)" stroke="rgba(255,255,255,.18)"/>
      <text x="${S+m/2}" y="21" text-anchor="middle" class="ev-burbuja">${p}</text>
      <circle cx="${f}" cy="${v}" r="5" fill="${h.tierra.visible?Ee.tierra:Ee.fondo}" stroke="${Ee.tierra}" stroke-width="2"/>
      <circle cx="${f}" cy="${_}" r="6" fill="${h.sol.visible?Ee.sol:Ee.fondo}" stroke="#fff" stroke-width="2"/>`,i.setAttribute("aria-valuemin",String(t.i0)),i.setAttribute("aria-valuemax",String(t.i1)),i.setAttribute("aria-valuenow",String(d)),i.setAttribute("aria-valuetext",`${gs(h.ms)}. Sol ${h.sol.visible?"visible":"en sombra"}, Tierra ${h.tierra.visible?"visible":"oculta"}.`)}return{dibujar:o,moverCursor:l}}var Sd='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor" opacity=".2"/><path d="M4.8 8.2 7 10.3l4.2-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',bd='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',Ed='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1a7 7 0 0 1 0 14z" fill="currentColor"/></svg>',Td=i=>({si:Sd,no:bd,medio:Ed})[i],_r=(i,e)=>`<li class="${i}">${Td(i)}${e}</li>`;function Nc(i,e,t){i.textContent=vn(t.ms),e.textContent=Nn(t.ms)}function Uc(i,e){let{sitio:t,muestra:n,estado:s}=e,r=[_r(n.sol.visible?"si":"no",n.sol.visible?"Sol visible":"Sombra"),_r(n.tierra.visible?"si":"no",n.tierra.visible?"Tierra visible":"Tierra oculta")];if(s.enlaceActivo){let o=n.enlace.estado;r.push(_r(o==="rapido"?"si":o==="robusto"?"medio":"no",`Enlace ${an[s.tipoEnlace].toLowerCase()}: ${Ot[o].texto}`))}else r.push(_r("no","Enlace local desactivado"));let a=vn(n.ms).replace(" UTC","");i.innerHTML=`
    <div class="destacada__cab">
      <span class="destacada__sitio">${De(t.etiqueta)}</span>
      <span class="destacada__etq">Condiciones ahora</span>
    </div>
    <div class="destacada__nombre">${De(t.nombre_corto)}</div>
    <div class="destacada__cuerpo">
      <ul class="destacada__estados">${r.join("")}</ul>
      <div class="destacada__hora"><small>UTC</small><b>${a}</b><small>${_i(n.ms)}</small></div>
    </div>`}var Ad={sol:[Nt.eclipse,Nt.sol],tierra:[Nt.tierra,Nt.tierra],enlace:[Nt.enlace,Nt.enlace]},Dc={sol:"var(--acento-claro)",tierra:"var(--tierra)",enlace:"var(--error)"};function Fc(i,e,t,n,s,r=4){if(e.textContent=n.length===1?"1 cambio":`${n.length} cambios`,!n.length){i.innerHTML='<li class="eventos__vacio">Sin cambios de estado en este periodo.</li>';return}let a=n.findIndex(l=>l.indice>=t.indice);a<0&&(a=Math.max(0,n.length-r));let o=n.slice(a,a+r);i.innerHTML=o.map(l=>{let c=t.serie[l.indice],u=Ad[l.tipo][l.inicio?0:1],d=l.inicio?Dc[l.tipo]:l.tipo==="enlace"?"var(--ok)":Dc[l.tipo],h=l.inicio?`<span class="evento__duracion">${Un(l.horas)}</span>`:'<span class="evento__duracion evento__duracion--neutro">Fin</span>';return`<li><button type="button" class="evento" data-indice="${l.indice}">
      <span class="evento__icono" style="color:${d}">${u}</span>
      <span><span class="evento__titulo">${l.titulo}</span><span class="evento__fecha">${Nn(c.ms)}, ${vn(c.ms)}</span></span>
      ${h}
    </button></li>`}).join(""),i.querySelectorAll("[data-indice]").forEach(l=>l.addEventListener("click",()=>s(Number(l.dataset.indice))))}var wd={geometria:"L\xEDnea de vista",energia:"Energ\xEDa del relevo",sol:"\xC1ngulo del Sol",polvo:"Polvo"};function Oc(i,e){let{muestra:t,estado:n,sitio:s}=e;if(!n.enlaceActivo){i.innerHTML='<h3>Enlace local desactivado</h3><p class="tarjeta__sub">Act\xEDvalo en el panel derecho para ver c\xF3mo se clasifica cada hora.</p>';return}let r=Ot[t.enlace.estado],a=["Sin enlace","Robusto","R\xE1pido"],o=["c-error","c-aviso","c-ok"];i.innerHTML=`
    <header class="tarjeta__cab" style="margin-bottom:0">
      <div>
        <h3>Por qu\xE9 el enlace est\xE1 as\xED a las ${vn(t.ms)}</h3>
        <p class="tarjeta__sub">${De(s.etiqueta)}, ${an[n.tipoEnlace].toLowerCase()}. Gana el factor m\xE1s limitante.</p>
      </div>
      <span class="pastilla ${r.clase}">${r.texto}</span>
    </header>
    <ul class="factores">
      ${t.enlace.factores.map(l=>`<li><span class="${o[l.nivel]}"><b>${wd[l.clave]}</b><br><small>${a[l.nivel]}</small></span><span>${De(l.texto)}</span></li>`).join("")}
      <li><span class="${t.respaldoTierra?"c-ok":"c-error"}"><b>Respaldo</b><br><small>${t.respaldoTierra?"Disponible":"No disponible"}</small></span><span>${t.respaldoTierra?`${De(s.relevo.nombre)} ve la Tierra y el tramo local funciona.`:t.enlace.estado==="sin_enlace"?"El tramo local no funciona en esta hora.":`${De(s.relevo.nombre)} no ve la Tierra en esta hora.`}</span></li>
    </ul>`}function xr(i,e,t,n,s,r){return`<li class="fila-estado">
    <span class="fila-estado__icono ${e}" style="background:rgba(255,255,255,.04)">${i}</span>
    <div>
      <div class="fila-estado__nombre">${t}</div>
      <div class="fila-estado__valor ${s}"><span class="pastilla">${n}</span></div>
      <div class="fila-estado__detalle">${r}</div>
    </div>
  </li>`}function Bc(i,e){let{muestra:t,sitio:n,estado:s}=e,r=t.sol,a=t.tierra,o=[xr(Nt.sol,"c-sol","Sol",r.visible?"Sol visible":"Sombra",r.visible?"c-sol":"c-neutro",`Elevaci\xF3n ${Qt(r.el,2)}, horizonte ${Qt(r.horizonte,2)} en azimut ${Qt(r.az,0)} (margen ${So(r.el-r.horizonte,2)}).`),xr(Nt.tierra,"c-tierra","Comunicaci\xF3n directa",a.visible?"Tierra visible":"Tierra oculta",a.visible?"c-tierra":"c-neutro",`Elevaci\xF3n ${Qt(a.el,2)}, horizonte ${Qt(a.horizonte,2)} en azimut ${Qt(a.az,0)} (margen ${So(a.el-a.horizonte,2)}).`)];if(s.enlaceActivo){let u=Ot[t.enlace.estado],d=t.enlace.limitantes.map(f=>De(f.texto)).join(" ");o.push(xr(Nt.enlace,u.clase,`Enlace local, ${an[s.tipoEnlace].toLowerCase()}`,u.texto,u.clase,d));let h;t.respaldoTierra?h=`${De(n.relevo.nombre)} ve la Tierra y el tramo local funciona.`:t.enlace.estado==="sin_enlace"?h="El tramo local no funciona en esta hora.":h=`${De(n.relevo.nombre)} tampoco ve la Tierra en esta hora.`,o.push(xr(Nt.respaldo,t.respaldoTierra?"c-ok":"c-error","Respaldo hacia la Tierra",t.respaldoTierra?"Disponible":"No disponible",t.respaldoTierra?"c-ok":"c-error",h))}let l=a.visible||s.enlaceActivo&&t.respaldoTierra,c=a.visible?"Comunicaci\xF3n por vista directa.":l?"Sin vista directa: la comunicaci\xF3n sigue por el respaldo local.":s.enlaceActivo?"Sin comunicaci\xF3n en esta hora: ni vista directa ni respaldo.":"Sin vista directa a la Tierra en esta hora.";i.innerHTML=`
    <header class="panel__cab" style="margin-bottom:var(--e-2)">
      <h3 id="t-estado">Hora seleccionada</h3>
      <span class="panel__meta">Valor instant\xE1neo</span>
    </header>
    <p class="estado__sitio"><b>${De(n.etiqueta)}</b>, ${De(n.nombre_corto)}</p>
    <p class="estado__hora">${vn(t.ms)}</p>
    <p class="estado__fecha">${Nn(t.ms)}</p>
    <ul class="estado__lista">${o.join("")}</ul>
    <p class="estado__nota ${l?"":"c-error"}">${c}</p>
    <p class="estado__nota">Los indicadores del Resumen cubren todo el periodo; este panel describe solo la hora del cursor.</p>`}var Fn=Math.PI/180;function xs(i,e,t=1){let n=i*Fn,s=e*Fn;return[t*Math.cos(n)*Math.cos(s),t*Math.sin(n),-t*Math.cos(n)*Math.sin(s)]}function zc(i,e,t,n){let s=n/1737.4,r=i*Fn,a=e*Fn,o=t*Fn,l=Math.asin(Math.sin(r)*Math.cos(s)+Math.cos(r)*Math.sin(s)*Math.cos(o)),c=a+Math.atan2(Math.sin(o)*Math.sin(s)*Math.cos(r),Math.cos(s)-Math.sin(r)*Math.sin(l));return{lat:l/Fn,lon:(c/Fn%360+360)%360}}function Pi([i,e,t,n],[s,r,a,o]){return[n*s+i*o+e*a-t*r,n*r-i*a+e*o+t*s,n*a+i*r-e*s+t*o,n*o-i*s-e*r-t*a]}function vr(i,[e,t,n]){let[s,r,a,o]=i,l=Pi(Pi(i,[e,t,n,0]),[-s,-r,-a,o]);return[l[0],l[1],l[2]]}function Ii(i){let e=Math.hypot(...i);return i.map(t=>t/e)}function kc(i,e){let[t,n,s]=Ii(i),[r,a,o]=Ii(e),l=t*r+n*a+s*o;if(l<-.999999)return[...Math.abs(t)<.9?Ii([0,-s,n]):Ii([-n,t,0]),0];let c=[n*o-s*a,s*r-t*o,t*a-n*r];return Ii([c[0],c[1],c[2],1+l])}function Hc(i,e,t){let[n,s,r,a]=e,o=i[0]*n+i[1]*s+i[2]*r+i[3]*a;if(o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o),o>.9995)return Ii(i.map((h,f)=>h+t*([n,s,r,a][f]-h)));let l=Math.acos(o),c=Math.sin(l),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return[i[0]*u+n*d,i[1]*u+s*d,i[2]*u+r*d,i[3]*u+a*d]}function vs(){let i=kc([0,-1,0],[0,0,1]),e=vr(i,[1,0,0]),t=Math.atan2(e[0],e[1]),n=[0,0,Math.sin(t/2),Math.cos(t/2)];return Pi(n,i)}function yr(i,e){let t=vs(),n=vr(t,xs(i,e));return Pi(kc(n,[0,0,1]),t)}function Vc(i){let e=Math.min(1,Math.max(0,i));return e<.5?4*e*e*e:1-(-2*e+2)**3/2}function Gc({semiladoKm:i=240,kmPorGrado:e=30.32,anillos:t=96,sectores:n=192,radio:s=1}={}){let r=[],a=[],o=[];for(let c=0;c<=t;c++){let u=i*c/t,d=-(90-u/e);for(let h=0;h<=n;h++){let f=360*h/n;r.push(...xs(d,f,s));let _=u*Math.sin(f*Fn),v=-u*Math.cos(f*Fn);a.push((_+i)/(2*i),1-(v+i)/(2*i))}}let l=n+1;for(let c=0;c<t;c++)for(let u=0;u<n;u++){let d=c*l+u,h=d+l;o.push(d,d+1,h,d+1,h+1,h)}return{posiciones:r,uvs:a,indices:o}}var bo=1e3,Li=760,on=bo/2,yn=Li/2,Eo=340,ys=4.6,Cd=Math.PI/180*1737.4;function Ms(i,e){let t=(90+i)/ys*Eo,n=e*Math.PI/180;return[on+t*Math.sin(n),yn-t*Math.cos(n)]}function Rd(){let i=[];for(let t=1;t<=4;t++){let n=t/ys*Eo;i.push(`<circle cx="${on}" cy="${yn}" r="${n}" class="ret"/>`),i.push(`<text x="${on+8}" y="${yn+n+20}" class="ret-etq">${90-t}\xB0 S</text>`)}for(let t=0;t<360;t+=30){let[n,s]=Ms(-90+ys,t);i.push(`<line x1="${on}" y1="${yn}" x2="${n}" y2="${s}" class="ret"/>`);let[r,a]=Ms(-90+ys+.32,t),o=t===0?"0\xB0":t===180?"180\xB0":`${t}\xB0 E`;i.push(`<text x="${r}" y="${a+4}" text-anchor="middle" class="ret-etq">${o}</text>`)}i.push(`<circle cx="${on}" cy="${yn}" r="3" fill="${Ee.texto3}"/><text x="${on}" y="${yn-10}" text-anchor="middle" class="ret-etq">Polo sur</text>`);let e=25/Cd/ys*Eo;return i.push(`<line x1="40" y1="${Li-40}" x2="${40+e}" y2="${Li-40}" stroke="${Ee.texto2}" stroke-width="2"/><text x="40" y="${Li-50}" class="ret-etq">25 km</text>`),i.join("")}function To(i,e){i.innerHTML=`
    <svg viewBox="0 0 ${bo} ${Li}" role="group" aria-label="Mapa polar sur con las coordenadas de los tres sitios">
      <defs>${mr()}</defs>
      <style>
        .ret { fill: none; stroke: rgba(255,255,255,.09); stroke-width: 1; }
        .ret-etq { font: 400 18px var(--fuente); fill: ${Ee.texto3}; }
        .etq { font: 600 20px var(--fuente); fill: ${Ee.texto}; }
        .etq2 { font: 500 22px var(--fuente); fill: ${Ee.texto2}; }
      </style>
      <rect width="${bo}" height="${Li}" fill="rgba(10,11,13,.35)"/>
      <g>${Rd()}</g>
      <g class="mapa-dinamico"></g>
    </svg>
    <div class="mapa__lista" role="group" aria-label="Elegir sitio"></div>`,i.addEventListener("click",r=>{let a=r.target.closest("[data-sitio]");a&&e(a.dataset.sitio)}),i.addEventListener("keydown",r=>{let a=r.target.closest("[data-sitio]");a&&(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),e(a.dataset.sitio))});let t=i.querySelector(".mapa-dinamico"),n=i.querySelector(".mapa__lista");function s(r){let{sitios:a,sitio:o,muestra:l,estado:c}=r,u=[],[d,h]=Ms(o.lat,o.lon);if(c.enlaceActivo){let E=zc(o.lat,o.lon,o.relevo.az_deg,o.relevo.distancia_km),[g,b]=Ms(E.lat,E.lon),N=Ot[l.enlace.estado],R=l.enlace.estado==="rapido"?"":l.enlace.estado==="robusto"?'stroke-dasharray="8 5"':'stroke-dasharray="2 6"';u.push(`<line x1="${d}" y1="${h}" x2="${g}" y2="${b}" stroke="${N.color}" stroke-width="3" stroke-linecap="round" ${R}/>`),u.push(`<path d="M${g},${b-9}l8,14h-16z" fill="${Ee.superficie}" stroke="${Ee.acento}" stroke-width="2"><title>${De(o.relevo.nombre)}: ${o.relevo.distancia_km} km a ${o.relevo.az_deg}\xB0 (supuesto)</title></path>`)}let f=Math.atan2(d-on,-(h-yn)),_=E=>E*Math.PI/180+f,v=46,[p,m]=fr(d,h,v,_(l.sol.az)*180/Math.PI),[S,w]=fr(d,h,v,_(l.tierra.az)*180/Math.PI),[M,A]=fr(d,h,v+14,f*180/Math.PI);u.push(`<g>
      <circle cx="${d}" cy="${h}" r="${v}" fill="none" stroke="rgba(226,201,144,.35)" stroke-dasharray="2 5"/>
      <text x="${M}" y="${A+4}" text-anchor="middle" class="ret-etq">N</text>
      <line x1="${d}" y1="${h}" x2="${p}" y2="${m}" stroke="${Ee.sol}" stroke-opacity="${l.sol.visible?.8:.3}"/>
      <circle cx="${p}" cy="${m}" r="8" fill="${l.sol.visible?Ee.sol:"none"}" stroke="${Ee.sol}" stroke-width="2"/>
      <line x1="${d}" y1="${h}" x2="${S}" y2="${w}" stroke="${Ee.tierra}" stroke-opacity="${l.tierra.visible?.8:.3}"/>
      <circle cx="${S}" cy="${w}" r="7" fill="${l.tierra.visible?Ee.tierra:"none"}" stroke="${Ee.tierra}" stroke-width="2"/>
    </g>`);for(let E of a){let[g,b]=Ms(E.lat,E.lon),N=E.id===o.id,R=E.etiqueta.slice(-1),I=Math.atan2(g-on,-(b-yn)),U=Math.hypot(g-on,b-yn),V=U>200&&Math.abs(Math.cos(I))>.9,C=V?U:Math.max(U+70,165),O=V?g+14:on+C*Math.sin(I),X=V?b+44:yn-C*Math.cos(I),F=V||O>=on?"start":"end",ie=F==="start"?8:-8,G=g+19*Math.sin(I),ee=b-19*Math.cos(I);u.push(`<g class="marcador" data-sitio="${E.id}" tabindex="0" role="button" aria-pressed="${N}" aria-label="${De(E.etiqueta)}: ${De(E.nombre_corto)}, ${Math.abs(E.lat).toFixed(3)}\xB0 S, ${E.lon.toFixed(3)}\xB0 E">
        <circle cx="${g}" cy="${b}" r="26" fill="transparent"/>
        ${V?"":`<line class="marcador__guia" x1="${G}" y1="${ee}" x2="${O}" y2="${X}" stroke="${N?Ee.acentoClaro:"rgba(255,255,255,.3)"}" stroke-width="1.2"/>`}
        <circle class="marcador__anillo" cx="${g}" cy="${b}" r="17" fill="${N?"rgba(198,168,106,.3)":"rgba(27,29,33,.9)"}" stroke="${N?Ee.acentoClaro:"rgba(255,255,255,.45)"}" stroke-width="2"/>
        <text x="${g}" y="${b+5}" text-anchor="middle" class="etq etq--letra">${R}</text>
        <text x="${O+ie}" y="${X+1}" text-anchor="${F}" class="etq2 etq--nombre" ${N?`fill="${Ee.texto}"`:""}>${De(E.nombre_corto)}</text>
        <text x="${O+ie}" y="${X+24}" text-anchor="${F}" class="ret-etq etq--coord">${Math.abs(E.lat).toFixed(3)}\xB0 S, ${E.lon.toFixed(3)}\xB0 E</text>
      </g>`)}t.innerHTML=u.join(""),n.innerHTML=a.map(E=>`<button type="button" class="chip-sitio${E.id===o.id?" activo":""}" data-sitio="${E.id}" aria-pressed="${E.id===o.id}"><span class="chip-sitio__letra">${De(E.etiqueta.slice(-1))}</span>${De(E.nombre_corto)}</button>`).join("")}return{render:s}}function Wc(i){i.innerHTML=`
    <li>Proyecci\xF3n polar azimutal equidistante; coordenadas de sitios.json</li>
    <li><span class="muestra" style="background:${Ee.sol};border-radius:50%"></span>Sol (relleno si es visible)</li>
    <li><span class="muestra" style="background:${Ee.tierra};border-radius:50%"></span>Tierra (relleno si es visible)</li>
    <li><span class="muestra" style="border:2px solid ${Ee.acento};border-radius:2px"></span>Punto de apoyo (ubicaci\xF3n supuesta)</li>
    <li><span class="muestra" style="background:${Ee.ok}"></span>Continua: r\xE1pido</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${Ee.aviso} 0 6px,transparent 6px 9px)"></span>Discontinua: robusto</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${Ee.error} 0 2px,transparent 2px 6px)"></span>Punteada: sin enlace</li>`}var mh=0,tl=1,gh=2;var qs=1,_h=2,as=3,ui=0,Xt=1,wn=2,Si=0,os=1,nl=2,il=3,sl=4,xh=5;var bi=100,vh=101,yh=102,Mh=103,Sh=104,bh=200,Eh=201,Th=202,Ah=203,rl=204,al=205,wh=206,Ch=207,Rh=208,Ih=209,Ph=210,Lh=211,Dh=212,Nh=213,Uh=214,Wr=0,$r=1,Xr=2,Yi=3,qr=4,Yr=5,Zr=6,Jr=7,ol=0,Fh=1,Oh=2,Cn=0,ll=1,cl=2,hl=3,ul=4,dl=5,fl=6,pl=7;var ml=300,Ei=301,ls=302,Ea=303,Ta=304,Kr=1e3,Sn=1001,jr=1002,Pt=1003,Bh=1004;var Ys=1005;var Wt=1006,Aa=1007;var qn=1008;var qt=1009,gl=1010,_l=1011,cs=1012,wa=1013,fn=1014,pn=1015,mn=1016,Ca=1017,Ra=1018,Ti=1020,xl=35902,vl=35899,yl=1021,Ml=1022,gn=1023,Wn=1026,Yn=1027,Sl=1028,Ia=1029,di=1030,Pa=1031;var La=1033,Zs=33776,Js=33777,Ks=33778,js=33779,Da=35840,Na=35841,Ua=35842,Fa=35843,Oa=36196,Ba=37492,za=37496,ka=37488,Ha=37489,Qs=37490,Va=37491,Ga=37808,Wa=37809,$a=37810,Xa=37811,qa=37812,Ya=37813,Za=37814,Ja=37815,Ka=37816,ja=37817,Qa=37818,eo=37819,to=37820,no=37821,io=36492,so=36494,ro=36495,ao=36283,oo=36284,er=36285,lo=36286;var ws=2300,Qr=2301,Hr=2302,Yo=2303,Zo=2400,Jo=2401,Ko=2402;var zh=3200;var co=0,kh=1,Zn="",Rt="srgb",Cs="srgb-linear",Rs="linear",it="srgb";var Vr=7680;var Hh=519,Vh=512,Gh=513,Wh=514,bl=515,$h=516,Xh=517,El=518,Tl=519,qh=35044;var Al="300 es",nn=2e3,Zi=2001;function Id(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Pd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ji(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Yh(){let i=Ji("canvas");return i.style.display="block",i}var $c={},Ki=null;function wl(...i){let e="THREE."+i.shift();Ki?Ki("log",e,...i):console.log(e,...i)}function Zh(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Be(...i){i=Zh(i);let e="THREE."+i.shift();if(Ki)Ki("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function ze(...i){i=Zh(i);let e="THREE."+i.shift();if(Ki)Ki("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function As(...i){let e=i.join(" ");e in $c||($c[e]=!0,Be(...i))}function Jh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Kh={[Wr]:Wr,[Xr]:Zr,[qr]:qr,[Yi]:Yr,[$r]:$r,[Zr]:Xr,[Jr]:Jr,[Yr]:Yi},En=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Bt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ao=Math.PI/180,ea=180/Math.PI;function tr(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Bt[i&255]+Bt[i>>8&255]+Bt[i>>16&255]+Bt[i>>24&255]+"-"+Bt[e&255]+Bt[e>>8&255]+"-"+Bt[e>>16&15|64]+Bt[e>>24&255]+"-"+Bt[t&63|128]+Bt[t>>8&255]+"-"+Bt[t>>16&255]+Bt[t>>24&255]+Bt[n&255]+Bt[n>>8&255]+Bt[n>>16&255]+Bt[n>>24&255]).toLowerCase()}function Ke(i,e,t){return Math.max(e,Math.min(t,i))}function Ld(i,e){return(i%e+e)%e}function wo(i,e,t){return(1-t)*i+t*e}function jh(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Cl(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Dd(i,e){if(e.constructor===Float32Array)return i;let t=Cl(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Nd(i,e){if(e.constructor===Float32Array)return i;let t=Cl(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}var Dl=class Dl{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Dl.prototype.isVector2=!0;var je=Dl,Tn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],d=n[s+3],h=r[a+0],f=r[a+1],_=r[a+2],v=r[a+3];if(d!==v||l!==h||c!==f||u!==_){let p=l*h+c*f+u*_+d*v;p<0&&(h=-h,f=-f,_=-_,v=-v,p=-p);let m=1-o;if(p<.9995){let S=Math.acos(p),w=Math.sin(S);m=Math.sin(m*S)/w,o=Math.sin(o*S)/w,l=l*m+h*o,c=c*m+f*o,u=u*m+_*o,d=d*m+v*o}else{l=l*m+h*o,c=c*m+f*o,u=u*m+_*o,d=d*m+v*o;let S=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=S,c*=S,u*=S,d*=S}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],d=r[a],h=r[a+1],f=r[a+2],_=r[a+3];return e[t]=o*_+u*d+l*f-c*h,e[t+1]=l*_+u*h+c*d-o*f,e[t+2]=c*_+u*f+o*h-l*d,e[t+3]=u*_-o*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),d=o(r/2),h=l(n/2),f=l(s/2),_=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d-h*f*_;break;case"YXZ":this._x=h*u*d+c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d+h*f*_;break;case"ZXY":this._x=h*u*d-c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d-h*f*_;break;case"ZYX":this._x=h*u*d-c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d+h*f*_;break;case"YZX":this._x=h*u*d+c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d-h*f*_;break;case"XZY":this._x=h*u*d-c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d+h*f*_;break;default:Be("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+o+d;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>d){let f=2*Math.sqrt(1+n-o-d);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-n-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+d-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ke(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Nl=class Nl{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+l*c+a*d-o*u,this.y=n+l*u+o*c-r*d,this.z=s+l*d+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Co.copy(this).projectOnVector(e),this.sub(Co)}reflect(e){return this.sub(Co.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Nl.prototype.isVector3=!0;var $=Nl,Co=new $,Xc=new Tn,Ul=class Ul{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],_=n[8],v=s[0],p=s[3],m=s[6],S=s[1],w=s[4],M=s[7],A=s[2],E=s[5],g=s[8];return r[0]=a*v+o*S+l*A,r[3]=a*p+o*w+l*E,r[6]=a*m+o*M+l*g,r[1]=c*v+u*S+d*A,r[4]=c*p+u*w+d*E,r[7]=c*m+u*M+d*g,r[2]=h*v+f*S+_*A,r[5]=h*p+f*w+_*E,r[8]=h*m+f*M+_*g,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=u*a-o*c,h=o*l-u*r,f=c*r-a*l,_=t*d+n*h+s*f;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/_;return e[0]=d*v,e[1]=(s*c-u*n)*v,e[2]=(o*n-s*a)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return As("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ro.makeScale(e,t)),this}rotate(e){return As("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ro.makeRotation(-e)),this}translate(e,t){return As("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ro.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Ul.prototype.isMatrix3=!0;var ke=Ul,Ro=new ke,qc=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Yc=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ud(){let i={enabled:!0,workingColorSpace:Cs,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===it&&(s.r=Gn(s.r),s.g=Gn(s.g),s.b=Gn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===it&&(s.r=qi(s.r),s.g=qi(s.g),s.b=qi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Zn?Rs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Cs]:{primaries:e,whitePoint:n,transfer:Rs,toXYZ:qc,fromXYZ:Yc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Rt},outputColorSpaceConfig:{drawingBufferColorSpace:Rt}},[Rt]:{primaries:e,whitePoint:n,transfer:it,toXYZ:qc,fromXYZ:Yc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Rt}}}),i}var Ye=Ud();function Gn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function qi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Di,ta=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Di===void 0&&(Di=Ji("canvas")),Di.width=e.width,Di.height=e.height;let s=Di.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Di}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ji("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Gn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Gn(t[n]/255)*255):t[n]=Gn(t[n]);return{data:t,width:e.width,height:e.height}}else return Be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Fd=0,ji=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Fd++}),this.uuid=tr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Io(s[a].image)):r.push(Io(s[a]))}else r=Io(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Io(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ta.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Be("Texture: Unable to serialize Texture."),{})}var Od=0,Po=new $,kt=class i extends En{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Sn,s=Sn,r=Wt,a=qn,o=gn,l=qt,c=i.DEFAULT_ANISOTROPY,u=Zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Od++}),this.uuid=tr(),this.name="",this.source=new ji(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new je(0,0),this.repeat=new je(1,1),this.center=new je(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Po).x}get height(){return this.source.getSize(Po).y}get depth(){return this.source.getSize(Po).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Be(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ml)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Kr:e.x=e.x-Math.floor(e.x);break;case Sn:e.x=e.x<0?0:1;break;case jr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Kr:e.y=e.y-Math.floor(e.y);break;case Sn:e.y=e.y<0?0:1;break;case jr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};kt.DEFAULT_IMAGE=null;kt.DEFAULT_MAPPING=ml;kt.DEFAULT_ANISOTROPY=1;var Fl=class Fl{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],_=l[9],v=l[2],p=l[6],m=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-v)<.01&&Math.abs(_-p)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+v)<.1&&Math.abs(_+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(c+1)/2,M=(f+1)/2,A=(m+1)/2,E=(u+h)/4,g=(d+v)/4,b=(_+p)/4;return w>M&&w>A?w<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(w),s=E/n,r=g/n):M>A?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=E/s,r=b/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=g/r,s=b/r),this.set(n,s,r,t),this}let S=Math.sqrt((p-_)*(p-_)+(d-v)*(d-v)+(h-u)*(h-u));return Math.abs(S)<.001&&(S=1),this.x=(p-_)/S,this.y=(d-v)/S,this.z=(h-u)/S,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this.w=Ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this.w=Ke(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Fl.prototype.isVector4=!0;var pt=Fl,na=class extends En{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Wt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new pt(0,0,e,t),this.scissorTest=!1,this.viewport=new pt(0,0,e,t),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new kt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Wt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new ji(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Jt=class extends na{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Is=class extends kt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ia=class extends kt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var ba=class ba{constructor(e,t,n,s,r,a,o,l,c,u,d,h,f,_,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,d,h,f,_,v,p)}set(e,t,n,s,r,a,o,l,c,u,d,h,f,_,v,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=u,m[10]=d,m[14]=h,m[3]=f,m[7]=_,m[11]=v,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ba().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Ni.setFromMatrixColumn(e,0).length(),r=1/Ni.setFromMatrixColumn(e,1).length(),a=1/Ni.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let h=a*u,f=a*d,_=o*u,v=o*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+_*c,t[5]=h-v*c,t[9]=-o*l,t[2]=v-h*c,t[6]=_+f*c,t[10]=a*l}else if(e.order==="YXZ"){let h=l*u,f=l*d,_=c*u,v=c*d;t[0]=h+v*o,t[4]=_*o-f,t[8]=a*c,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=f*o-_,t[6]=v+h*o,t[10]=a*l}else if(e.order==="ZXY"){let h=l*u,f=l*d,_=c*u,v=c*d;t[0]=h-v*o,t[4]=-a*d,t[8]=_+f*o,t[1]=f+_*o,t[5]=a*u,t[9]=v-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let h=a*u,f=a*d,_=o*u,v=o*d;t[0]=l*u,t[4]=_*c-f,t[8]=h*c+v,t[1]=l*d,t[5]=v*c+h,t[9]=f*c-_,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let h=a*l,f=a*c,_=o*l,v=o*c;t[0]=l*u,t[4]=v-h*d,t[8]=_*d+f,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*d+_,t[10]=h-v*d}else if(e.order==="XZY"){let h=a*l,f=a*c,_=o*l,v=o*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+v,t[5]=a*u,t[9]=f*d-_,t[2]=_*d-f,t[6]=o*u,t[10]=v*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Bd,e,zd)}lookAt(e,t,n){let s=this.elements;return Yt.subVectors(e,t),Yt.lengthSq()===0&&(Yt.z=1),Yt.normalize(),Qn.crossVectors(n,Yt),Qn.lengthSq()===0&&(Math.abs(n.z)===1?Yt.x+=1e-4:Yt.z+=1e-4,Yt.normalize(),Qn.crossVectors(n,Yt)),Qn.normalize(),Mr.crossVectors(Yt,Qn),s[0]=Qn.x,s[4]=Mr.x,s[8]=Yt.x,s[1]=Qn.y,s[5]=Mr.y,s[9]=Yt.y,s[2]=Qn.z,s[6]=Mr.z,s[10]=Yt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],_=n[2],v=n[6],p=n[10],m=n[14],S=n[3],w=n[7],M=n[11],A=n[15],E=s[0],g=s[4],b=s[8],N=s[12],R=s[1],I=s[5],U=s[9],V=s[13],C=s[2],O=s[6],X=s[10],F=s[14],ie=s[3],G=s[7],ee=s[11],se=s[15];return r[0]=a*E+o*R+l*C+c*ie,r[4]=a*g+o*I+l*O+c*G,r[8]=a*b+o*U+l*X+c*ee,r[12]=a*N+o*V+l*F+c*se,r[1]=u*E+d*R+h*C+f*ie,r[5]=u*g+d*I+h*O+f*G,r[9]=u*b+d*U+h*X+f*ee,r[13]=u*N+d*V+h*F+f*se,r[2]=_*E+v*R+p*C+m*ie,r[6]=_*g+v*I+p*O+m*G,r[10]=_*b+v*U+p*X+m*ee,r[14]=_*N+v*V+p*F+m*se,r[3]=S*E+w*R+M*C+A*ie,r[7]=S*g+w*I+M*O+A*G,r[11]=S*b+w*U+M*X+A*ee,r[15]=S*N+w*V+M*F+A*se,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],_=e[3],v=e[7],p=e[11],m=e[15],S=l*f-c*h,w=o*f-c*d,M=o*h-l*d,A=a*f-c*u,E=a*h-l*u,g=a*d-o*u;return t*(v*S-p*w+m*M)-n*(_*S-p*A+m*E)+s*(_*w-v*A+m*g)-r*(_*M-v*E+p*g)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],_=e[12],v=e[13],p=e[14],m=e[15],S=t*o-n*a,w=t*l-s*a,M=t*c-r*a,A=n*l-s*o,E=n*c-r*o,g=s*c-r*l,b=u*v-d*_,N=u*p-h*_,R=u*m-f*_,I=d*p-h*v,U=d*m-f*v,V=h*m-f*p,C=S*V-w*U+M*I+A*R-E*N+g*b;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/C;return e[0]=(o*V-l*U+c*I)*O,e[1]=(s*U-n*V-r*I)*O,e[2]=(v*g-p*E+m*A)*O,e[3]=(h*E-d*g-f*A)*O,e[4]=(l*R-a*V-c*N)*O,e[5]=(t*V-s*R+r*N)*O,e[6]=(p*M-_*g-m*w)*O,e[7]=(u*g-h*M+f*w)*O,e[8]=(a*U-o*R+c*b)*O,e[9]=(n*R-t*U-r*b)*O,e[10]=(_*E-v*M+m*S)*O,e[11]=(d*M-u*E-f*S)*O,e[12]=(o*N-a*I-l*b)*O,e[13]=(t*I-n*N+s*b)*O,e[14]=(v*w-_*A-p*S)*O,e[15]=(u*A-d*w+h*S)*O,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,d=o+o,h=r*c,f=r*u,_=r*d,v=a*u,p=a*d,m=o*d,S=l*c,w=l*u,M=l*d,A=n.x,E=n.y,g=n.z;return s[0]=(1-(v+m))*A,s[1]=(f+M)*A,s[2]=(_-w)*A,s[3]=0,s[4]=(f-M)*E,s[5]=(1-(h+m))*E,s[6]=(p+S)*E,s[7]=0,s[8]=(_+w)*g,s[9]=(p-S)*g,s[10]=(1-(h+v))*g,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ni.set(s[0],s[1],s[2]).length(),o=Ni.set(s[4],s[5],s[6]).length(),l=Ni.set(s[8],s[9],s[10]).length();r<0&&(a=-a),ln.copy(this);let c=1/a,u=1/o,d=1/l;return ln.elements[0]*=c,ln.elements[1]*=c,ln.elements[2]*=c,ln.elements[4]*=u,ln.elements[5]*=u,ln.elements[6]*=u,ln.elements[8]*=d,ln.elements[9]*=d,ln.elements[10]*=d,t.setFromRotationMatrix(ln),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=nn,l=!1){let c=this.elements,u=2*r/(t-e),d=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s),_,v;if(l)_=r/(a-r),v=a*r/(a-r);else if(o===nn)_=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Zi)_=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=nn,l=!1){let c=this.elements,u=2/(t-e),d=2/(n-s),h=-(t+e)/(t-e),f=-(n+s)/(n-s),_,v;if(l)_=1/(a-r),v=a/(a-r);else if(o===nn)_=-2/(a-r),v=-(a+r)/(a-r);else if(o===Zi)_=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};ba.prototype.isMatrix4=!0;var ft=ba,Ni=new $,ln=new ft,Bd=new $(0,0,0),zd=new $(1,1,1),Qn=new $,Mr=new $,Yt=new $,Zc=new ft,Jc=new Tn,$n=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ke(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ke(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Zc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Zc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Jc.setFromEuler(this),this.setFromQuaternion(Jc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};$n.DEFAULT_ORDER="XYZ";var Ps=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},kd=0,Kc=new $,Ui=new Tn,On=new ft,Sr=new $,Ss=new $,Hd=new $,Vd=new Tn,jc=new $(1,0,0),Qc=new $(0,1,0),eh=new $(0,0,1),th={type:"added"},Gd={type:"removed"},Fi={type:"childadded",child:null},Lo={type:"childremoved",child:null},$t=class i extends En{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=tr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new $,t=new $n,n=new Tn,s=new $(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ft},normalMatrix:{value:new ke}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ps,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ui.setFromAxisAngle(e,t),this.quaternion.multiply(Ui),this}rotateOnWorldAxis(e,t){return Ui.setFromAxisAngle(e,t),this.quaternion.premultiply(Ui),this}rotateX(e){return this.rotateOnAxis(jc,e)}rotateY(e){return this.rotateOnAxis(Qc,e)}rotateZ(e){return this.rotateOnAxis(eh,e)}translateOnAxis(e,t){return Kc.copy(e).applyQuaternion(this.quaternion),this.position.add(Kc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(jc,e)}translateY(e){return this.translateOnAxis(Qc,e)}translateZ(e){return this.translateOnAxis(eh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(On.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Sr.copy(e):Sr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ss.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?On.lookAt(Ss,Sr,this.up):On.lookAt(Sr,Ss,this.up),this.quaternion.setFromRotationMatrix(On),s&&(On.extractRotation(s.matrixWorld),Ui.setFromRotationMatrix(On),this.quaternion.premultiply(Ui.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ze("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(th),Fi.child=e,this.dispatchEvent(Fi),Fi.child=null):ze("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Gd),Lo.child=e,this.dispatchEvent(Lo),Lo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),On.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),On.multiply(e.parent.matrixWorld)),e.applyMatrix4(On),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(th),Fi.child=e,this.dispatchEvent(Fi),Fi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ss,e,Hd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ss,Vd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),d=a(e.shapes),h=a(e.skeletons),f=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};$t.DEFAULT_UP=new $(0,1,0);$t.DEFAULT_MATRIX_AUTO_UPDATE=!0;$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Vn=class extends $t{constructor(){super(),this.isGroup=!0,this.type="Group"}},Wd={type:"move"},Qi=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Vn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Vn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new $,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new $),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Vn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new $,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new $,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let v of e.hand.values()){let p=t.getJointPose(v,n),m=this._getHandJoint(c,v);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,_=.005;c.inputState.pinching&&h>f+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Wd)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Vn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Qh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ei={h:0,s:0,l:0},br={h:0,s:0,l:0};function Do(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ze=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Rt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ye.workingColorSpace){if(e=Ld(e,1),t=Ke(t,0,1),n=Ke(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Do(a,r,e+1/3),this.g=Do(a,r,e),this.b=Do(a,r,e-1/3)}return Ye.colorSpaceToWorking(this,s),this}setStyle(e,t=Rt){function n(r){r!==void 0&&parseFloat(r)<1&&Be("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Be("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Rt){let n=Qh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Gn(e.r),this.g=Gn(e.g),this.b=Gn(e.b),this}copyLinearToSRGB(e){return this.r=qi(e.r),this.g=qi(e.g),this.b=qi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Rt){return Ye.workingToColorSpace(zt.copy(this),e),Math.round(Ke(zt.r*255,0,255))*65536+Math.round(Ke(zt.g*255,0,255))*256+Math.round(Ke(zt.b*255,0,255))}getHexString(e=Rt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.workingToColorSpace(zt.copy(this),t);let n=zt.r,s=zt.g,r=zt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ye.workingColorSpace){return Ye.workingToColorSpace(zt.copy(this),t),e.r=zt.r,e.g=zt.g,e.b=zt.b,e}getStyle(e=Rt){Ye.workingToColorSpace(zt.copy(this),e);let t=zt.r,n=zt.g,s=zt.b;return e!==Rt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ei),this.setHSL(ei.h+e,ei.s+t,ei.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ei),e.getHSL(br);let n=wo(ei.h,br.h,t),s=wo(ei.s,br.s,t),r=wo(ei.l,br.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},zt=new Ze;Ze.NAMES=Qh;var Ls=class extends $t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $n,this.environmentIntensity=1,this.environmentRotation=new $n,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},cn=new $,Bn=new $,No=new $,zn=new $,Oi=new $,Bi=new $,nh=new $,Uo=new $,Fo=new $,Oo=new $,Bo=new pt,zo=new pt,ko=new pt,si=class i{constructor(e=new $,t=new $,n=new $){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),cn.subVectors(e,t),s.cross(cn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){cn.subVectors(s,t),Bn.subVectors(n,t),No.subVectors(e,t);let a=cn.dot(cn),o=cn.dot(Bn),l=cn.dot(No),c=Bn.dot(Bn),u=Bn.dot(No),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let h=1/d,f=(c*l-o*u)*h,_=(a*u-o*l)*h;return r.set(1-f-_,_,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,zn)===null?!1:zn.x>=0&&zn.y>=0&&zn.x+zn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,zn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,zn.x),l.addScaledVector(a,zn.y),l.addScaledVector(o,zn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Bo.setScalar(0),zo.setScalar(0),ko.setScalar(0),Bo.fromBufferAttribute(e,t),zo.fromBufferAttribute(e,n),ko.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Bo,r.x),a.addScaledVector(zo,r.y),a.addScaledVector(ko,r.z),a}static isFrontFacing(e,t,n,s){return cn.subVectors(n,t),Bn.subVectors(e,t),cn.cross(Bn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return cn.subVectors(this.c,this.b),Bn.subVectors(this.a,this.b),cn.cross(Bn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Oi.subVectors(s,n),Bi.subVectors(r,n),Uo.subVectors(e,n);let l=Oi.dot(Uo),c=Bi.dot(Uo);if(l<=0&&c<=0)return t.copy(n);Fo.subVectors(e,s);let u=Oi.dot(Fo),d=Bi.dot(Fo);if(u>=0&&d<=u)return t.copy(s);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return a=l/(l-u),t.copy(n).addScaledVector(Oi,a);Oo.subVectors(e,r);let f=Oi.dot(Oo),_=Bi.dot(Oo);if(_>=0&&f<=_)return t.copy(r);let v=f*c-l*_;if(v<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(n).addScaledVector(Bi,o);let p=u*_-f*d;if(p<=0&&d-u>=0&&f-_>=0)return nh.subVectors(r,s),o=(d-u)/(d-u+(f-_)),t.copy(s).addScaledVector(nh,o);let m=1/(p+v+h);return a=v*m,o=h*m,t.copy(n).addScaledVector(Oi,a).addScaledVector(Bi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ri=class{constructor(e=new $(1/0,1/0,1/0),t=new $(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(hn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(hn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=hn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,hn):hn.fromBufferAttribute(r,a),hn.applyMatrix4(e.matrixWorld),this.expandByPoint(hn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Er.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Er.copy(n.boundingBox)),Er.applyMatrix4(e.matrixWorld),this.union(Er)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,hn),hn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(bs),Tr.subVectors(this.max,bs),zi.subVectors(e.a,bs),ki.subVectors(e.b,bs),Hi.subVectors(e.c,bs),ti.subVectors(ki,zi),ni.subVectors(Hi,ki),xi.subVectors(zi,Hi);let t=[0,-ti.z,ti.y,0,-ni.z,ni.y,0,-xi.z,xi.y,ti.z,0,-ti.x,ni.z,0,-ni.x,xi.z,0,-xi.x,-ti.y,ti.x,0,-ni.y,ni.x,0,-xi.y,xi.x,0];return!Ho(t,zi,ki,Hi,Tr)||(t=[1,0,0,0,1,0,0,0,1],!Ho(t,zi,ki,Hi,Tr))?!1:(Ar.crossVectors(ti,ni),t=[Ar.x,Ar.y,Ar.z],Ho(t,zi,ki,Hi,Tr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,hn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(hn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(kn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},kn=[new $,new $,new $,new $,new $,new $,new $,new $],hn=new $,Er=new ri,zi=new $,ki=new $,Hi=new $,ti=new $,ni=new $,xi=new $,bs=new $,Tr=new $,Ar=new $,vi=new $;function Ho(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){vi.fromArray(i,r);let o=s.x*Math.abs(vi.x)+s.y*Math.abs(vi.y)+s.z*Math.abs(vi.z),l=e.dot(vi),c=t.dot(vi),u=n.dot(vi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var yt=new $,wr=new je,$d=0,bn=class extends En{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:$d++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=qh,this.updateRanges=[],this.gpuType=pn,this.version=0,this._normalizationScale=e!==void 0?Cl(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)wr.fromBufferAttribute(this,t),wr.applyMatrix3(e),this.setXY(t,wr.x,wr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix3(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix4(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyNormalMatrix(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.transformDirection(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Dd(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Nd(e,this.array)}};var Ds=class extends bn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ns=class extends bn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var It=class extends bn{constructor(e,t,n){super(new Float32Array(e),t,n)}},Xd=new ri,Es=new $,Vo=new $,es=class{constructor(e=new $,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Xd.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Es.subVectors(e,this.center);let t=Es.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Es,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Vo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Es.copy(e.center).add(Vo)),this.expandByPoint(Es.copy(e.center).sub(Vo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},qd=0,tn=new ft,Go=new $t,Vi=new $,Zt=new ri,Ts=new ri,Ct=new $,dn=class i extends En{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qd++}),this.uuid=tr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Id(e)?Ns:Ds)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ke().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,n){return tn.makeTranslation(e,t,n),this.applyMatrix4(tn),this}scale(e,t,n){return tn.makeScale(e,t,n),this.applyMatrix4(tn),this}lookAt(e){return Go.lookAt(e),Go.updateMatrix(),this.applyMatrix4(Go.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vi).negate(),this.translate(Vi.x,Vi.y,Vi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new It(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ri);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ze("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new $(-1/0,-1/0,-1/0),new $(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Zt.setFromBufferAttribute(r),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,Zt.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,Zt.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(Zt.min),this.boundingBox.expandByPoint(Zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ze('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new es);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ze("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new $,1/0);return}if(e){let n=this.boundingSphere.center;if(Zt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Ts.setFromBufferAttribute(o),this.morphTargetsRelative?(Ct.addVectors(Zt.min,Ts.min),Zt.expandByPoint(Ct),Ct.addVectors(Zt.max,Ts.max),Zt.expandByPoint(Ct)):(Zt.expandByPoint(Ts.min),Zt.expandByPoint(Ts.max))}Zt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Ct.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ct));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ct.fromBufferAttribute(o,c),l&&(Vi.fromBufferAttribute(e,c),Ct.add(Vi)),s=Math.max(s,n.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ze('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ze("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new bn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[],c=new Uint8Array(n.count);for(let N=0;N<n.count;N++)o[N]=new $,l[N]=new $;let u=new $,d=new $,h=new $,f=new je,_=new je,v=new je,p=new $,m=new $;function S(N,R,I){c[N]=c[R]=c[I]=1,u.fromBufferAttribute(n,N),d.fromBufferAttribute(n,R),h.fromBufferAttribute(n,I),f.fromBufferAttribute(r,N),_.fromBufferAttribute(r,R),v.fromBufferAttribute(r,I),d.sub(u),h.sub(u),_.sub(f),v.sub(f);let U=1/(_.x*v.y-v.x*_.y);isFinite(U)&&(p.copy(d).multiplyScalar(v.y).addScaledVector(h,-_.y).multiplyScalar(U),m.copy(h).multiplyScalar(_.x).addScaledVector(d,-v.x).multiplyScalar(U),o[N].add(p),o[R].add(p),o[I].add(p),l[N].add(m),l[R].add(m),l[I].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let N=0,R=w.length;N<R;++N){let I=w[N],U=I.start,V=I.count;for(let C=U,O=U+V;C<O;C+=3)S(e.getX(C+0),e.getX(C+1),e.getX(C+2))}let M=new $,A=new $,E=new $,g=new $;function b(N){E.fromBufferAttribute(s,N),g.copy(E);let R=o[N];M.copy(R),M.sub(E.multiplyScalar(E.dot(R))).normalize(),A.crossVectors(g,R);let U=A.dot(l[N])<0?-1:1;a.setXYZW(N,M.x,M.y,M.z,U)}for(let N=0,R=n.count;N<R;++N)c[N]&&b(N);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new bn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let s=new $,r=new $,a=new $,o=new $,l=new $,c=new $,u=new $,d=new $;if(e)for(let h=0,f=e.count;h<f;h+=3){let _=e.getX(h+0),v=e.getX(h+1),p=e.getX(h+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,p),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(u),l.add(u),c.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ct.fromBufferAttribute(e,t),Ct.normalize(),e.setXYZ(t,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u),f=0,_=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*u;for(let m=0;m<u;m++)h[_++]=c[f++]}return new bn(h,u,d)}if(this.index===null)return Be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){let h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],d=r[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Wo=new $,Yd=new $,Zd=new ke,un=class{constructor(e=new $(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Wo.subVectors(n,t).cross(Yd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Wo),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Zd.getNormalMatrix(e),s=this.coplanarPoint(Wo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Jd=0,ai=class extends En{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Jd++}),this.uuid=tr(),this.name="",this.type="Material",this.blending=os,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rl,this.blendDst=al,this.blendEquation=bi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=Yi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Hh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Vr,this.stencilZFail=Vr,this.stencilZPass=Vr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Be(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Be(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ze().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new un().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new je().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new je().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Hn=new $,$o=new $,Cr=new $,Rr=new $,sa=class{constructor(e=new $,t=new $(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Hn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Hn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Hn.copy(this.origin).addScaledVector(this.direction,t),Hn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){$o.copy(e).add(t).multiplyScalar(.5),Cr.copy(t).sub(e).normalize(),Rr.copy(this.origin).sub($o);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Cr),o=Rr.dot(this.direction),l=-Rr.dot(Cr),c=Rr.lengthSq(),u=Math.abs(1-a*a),d,h,f,_;if(u>0)if(d=a*l-o,h=a*o-l,_=r*u,d>=0)if(h>=-_)if(h<=_){let v=1/u;d*=v,h*=v,f=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h<=-_?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c):h<=_?(d=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy($o).addScaledVector(Cr,h),f}intersectSphere(e,t){if(e.radius<0)return null;Hn.subVectors(e.center,this.origin);let n=Hn.dot(this.direction),s=Hn.dot(Hn)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(o=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Hn)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,d=e.x-a.x,h=e.y-a.y,f=e.z-a.z,_=t.x-a.x,v=t.y-a.y,p=t.z-a.z,m=n.x-a.x,S=n.y-a.y,w=n.z-a.z,M=Math.abs(l),A=Math.abs(c),E=Math.abs(u),g,b,N,R,I,U,V,C,O,X,F,ie;if(M>=A&&M>=E?(N=l,U=d,O=_,ie=m,l>=0?(g=c,b=u,R=h,I=f,V=v,C=p,X=S,F=w):(g=u,b=c,R=f,I=h,V=p,C=v,X=w,F=S)):A>=E?(N=c,U=h,O=v,ie=S,c>=0?(g=u,b=l,R=f,I=d,V=p,C=_,X=w,F=m):(g=l,b=u,R=d,I=f,V=_,C=p,X=m,F=w)):(N=u,U=f,O=p,ie=w,u>=0?(g=l,b=c,R=d,I=h,V=_,C=v,X=m,F=S):(g=c,b=l,R=h,I=d,V=v,C=_,X=S,F=m)),N===0)return null;let G=g/N,ee=b/N,se=1/N,Se=R-G*U,Te=I-ee*U,Z=V-G*O,q=C-ee*O,Q=X-G*ie,fe=F-ee*ie,oe=Q*q-fe*Z,Pe=Se*fe-Te*Q,tt=Z*Te-q*Se;if(s){if(oe<0||Pe<0||tt<0)return null}else if((oe<0||Pe<0||tt<0)&&(oe>0||Pe>0||tt>0))return null;let Re=oe+Pe+tt;if(Re===0)return null;let H=se*(oe*U+Pe*O+tt*ie);return(Re>0?H<0:H>0)?null:this.at(H/Re,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ra=class extends ai{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $n,this.combine=ol,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ih=new ft,yi=new sa,Ir=new es,sh=new $,Pr=new $,Lr=new $,Dr=new $,Xo=new $,Nr=new $,rh=new $,Ur=new $,Kt=class extends $t{constructor(e=new dn,t=new ra){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Nr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],d=r[l];u!==0&&(Xo.fromBufferAttribute(d,e),a?Nr.addScaledVector(Xo,u):Nr.addScaledVector(Xo.sub(t),u))}t.add(Nr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ir.copy(n.boundingSphere),Ir.applyMatrix4(r),yi.copy(e.ray).recast(e.near),!(Ir.containsPoint(yi.origin)===!1&&(yi.intersectSphere(Ir,sh)===null||yi.origin.distanceToSquared(sh)>(e.far-e.near)**2))&&(ih.copy(r).invert(),yi.copy(e.ray).applyMatrix4(ih),!(n.boundingBox!==null&&yi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,yi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,v=h.length;_<v;_++){let p=h[_],m=a[p.materialIndex],S=Math.max(p.start,f.start),w=Math.min(o.count,Math.min(p.start+p.count,f.start+f.count));for(let M=S,A=w;M<A;M+=3){let E=o.getX(M),g=o.getX(M+1),b=o.getX(M+2);s=Fr(this,m,e,n,c,u,d,E,g,b),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let _=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let p=_,m=v;p<m;p+=3){let S=o.getX(p),w=o.getX(p+1),M=o.getX(p+2);s=Fr(this,a,e,n,c,u,d,S,w,M),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,v=h.length;_<v;_++){let p=h[_],m=a[p.materialIndex],S=Math.max(p.start,f.start),w=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let M=S,A=w;M<A;M+=3){let E=M,g=M+1,b=M+2;s=Fr(this,m,e,n,c,u,d,E,g,b),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let _=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=_,m=v;p<m;p+=3){let S=p,w=p+1,M=p+2;s=Fr(this,a,e,n,c,u,d,S,w,M),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}};function Kd(i,e,t,n,s,r,a,o){let l;if(e.side===Xt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===ui,o),l===null)return null;Ur.copy(o),Ur.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ur);return c<t.near||c>t.far?null:{distance:c,point:Ur.clone(),object:i}}function Fr(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Pr),i.getVertexPosition(l,Lr),i.getVertexPosition(c,Dr);let u=Kd(i,e,t,n,Pr,Lr,Dr,rh);if(u){let d=new $;si.getBarycoord(rh,Pr,Lr,Dr,d),s&&(u.uv=si.getInterpolatedAttribute(s,o,l,c,d,new je)),r&&(u.uv1=si.getInterpolatedAttribute(r,o,l,c,d,new je)),a&&(u.normal=si.getInterpolatedAttribute(a,o,l,c,d,new $),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new $,materialIndex:0};si.getNormal(Pr,Lr,Dr,h.normal),u.face=h,u.barycoord=d}return u}var aa=class extends kt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Pt,u=Pt,d,h){super(null,a,o,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Mi=new es,jd=new je(.5,.5),Or=new $,oi=class{constructor(e=new un,t=new un,n=new un,s=new un,r=new un,a=new un){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=nn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],f=r[7],_=r[8],v=r[9],p=r[10],m=r[11],S=r[12],w=r[13],M=r[14],A=r[15];if(s[0].setComponents(c-a,f-u,m-_,A-S).normalize(),s[1].setComponents(c+a,f+u,m+_,A+S).normalize(),s[2].setComponents(c+o,f+d,m+v,A+w).normalize(),s[3].setComponents(c-o,f-d,m-v,A-w).normalize(),n)s[4].setComponents(l,h,p,M).normalize(),s[5].setComponents(c-l,f-h,m-p,A-M).normalize();else if(s[4].setComponents(c-l,f-h,m-p,A-M).normalize(),t===nn)s[5].setComponents(c+l,f+h,m+p,A+M).normalize();else if(t===Zi)s[5].setComponents(l,h,p,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Mi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Mi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Mi)}intersectsSprite(e){Mi.center.set(0,0,0);let t=jd.distanceTo(e.center);return Mi.radius=.7071067811865476+t,Mi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Mi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Or.x=s.normal.x>0?e.max.x:e.min.x,Or.y=s.normal.y>0?e.max.y:e.min.y,Or.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Or)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ah=new ft,oa=class i{constructor(){this.coordinateSystem=nn,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];ah.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new oi),n[s].setFromProjectionMatrix(ah,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new oi),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};var Us=class extends kt{constructor(e=[],t=Ei,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Fs=class extends kt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Xn=class extends kt{constructor(e,t,n=fn,s,r,a,o=Pt,l=Pt,c,u=Wn,d=1){if(u!==Wn&&u!==Yn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:d};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ji(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Os=class extends Xn{constructor(e,t=fn,n=Ei,s,r,a=Pt,o=Pt,l,c=Wn){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Bs=class extends kt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ts=class i extends dn{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],d=[],h=0,f=0;_("z","y","x",-1,-1,n,t,e,a,r,0),_("z","y","x",1,-1,n,t,-e,a,r,1),_("x","z","y",1,1,e,n,t,s,a,2),_("x","z","y",1,-1,e,n,-t,s,a,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new It(c,3)),this.setAttribute("normal",new It(u,3)),this.setAttribute("uv",new It(d,2));function _(v,p,m,S,w,M,A,E,g,b,N){let R=M/g,I=A/b,U=M/2,V=A/2,C=E/2,O=g+1,X=b+1,F=0,ie=0,G=new $;for(let ee=0;ee<X;ee++){let se=ee*I-V;for(let Se=0;Se<O;Se++){let Te=Se*R-U;G[v]=Te*S,G[p]=se*w,G[m]=C,c.push(G.x,G.y,G.z),G[v]=0,G[p]=0,G[m]=E>0?1:-1,u.push(G.x,G.y,G.z),d.push(Se/g),d.push(1-ee/b),F+=1}}for(let ee=0;ee<b;ee++)for(let se=0;se<g;se++){let Se=h+se+O*ee,Te=h+se+O*(ee+1),Z=h+(se+1)+O*(ee+1),q=h+(se+1)+O*ee;l.push(Se,Te,q),l.push(Te,Z,q),ie+=6}o.addGroup(f,ie,N),f+=ie,h+=F}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var zs=class i extends dn{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,d=e/o,h=t/l,f=[],_=[],v=[],p=[];for(let m=0;m<u;m++){let S=m*h-a;for(let w=0;w<c;w++){let M=w*d-r;_.push(M,-S,0),v.push(0,0,1),p.push(w/o),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let S=0;S<o;S++){let w=S+c*m,M=S+c*(m+1),A=S+1+c*(m+1),E=S+1+c*m;f.push(w,M,E),f.push(M,A,E)}this.setIndex(f),this.setAttribute("position",new It(_,3)),this.setAttribute("normal",new It(v,3)),this.setAttribute("uv",new It(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var ks=class i extends dn{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],d=new $,h=new $,f=[],_=[],v=[],p=[];for(let m=0;m<=n;m++){let S=[],w=m/n,M=a+w*o,A=e*Math.cos(M),E=Math.sqrt(e*e-A*A),g=0;m===0&&a===0?g=.5/t:m===n&&l===Math.PI&&(g=-.5/t);for(let b=0;b<=t;b++){let N=b/t,R=s+N*r;d.x=-E*Math.cos(R),d.y=A,d.z=E*Math.sin(R),_.push(d.x,d.y,d.z),h.copy(d).normalize(),v.push(h.x,h.y,h.z),p.push(N+g,1-w),S.push(c++)}u.push(S)}for(let m=0;m<n;m++)for(let S=0;S<t;S++){let w=u[m][S+1],M=u[m][S],A=u[m+1][S],E=u[m+1][S+1];(m!==0||a>0)&&f.push(w,M,E),(m!==n-1||l<Math.PI)&&f.push(M,A,E)}this.setIndex(f),this.setAttribute("position",new It(_,3)),this.setAttribute("normal",new It(v,3)),this.setAttribute("uv",new It(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Ai(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(oh(s))s.isRenderTargetTexture?(Be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(oh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Ht(i){let e={};for(let t=0;t<i.length;t++){let n=Ai(i[t]);for(let s in n)e[s]=n[s]}return e}function oh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Qd(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Rl(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}var eu={clone:Ai,merge:Ht},ef=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,tf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,An=class extends ai{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ef,this.fragmentShader=tf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ai(e.uniforms),this.uniformsGroups=Qd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ze().setHex(s.value);break;case"v2":this.uniforms[n].value=new je().fromArray(s.value);break;case"v3":this.uniforms[n].value=new $().fromArray(s.value);break;case"v4":this.uniforms[n].value=new pt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ke().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ft().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},la=class extends An{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},ns=class extends ai{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=co,this.normalScale=new je(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $n,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var ca=class extends ai{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=zh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ha=class extends ai{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Gi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Br(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var li=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ua=class extends li{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Zo,endingEnd:Zo}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Jo:r=e,o=2*t-n;break;case Ko:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Jo:a=e,l=2*n-t;break;case Ko:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,_=(n-t)/(s-t),v=_*_,p=v*_,m=-h*p+2*h*v-h*_,S=(1+h)*p+(-1.5-2*h)*v+(-.5+h)*_+1,w=(-1-f)*p+(1.5+f)*v+.5*_,M=f*p-f*v;for(let A=0;A!==o;++A)r[A]=m*a[u+A]+S*a[c+A]+w*a[l+A]+M*a[d+A];return r}},da=class extends li{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),d=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*d+a[l+h]*u;return r}},fa=class extends li{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},pa=class extends li{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,d=this.outTangents;if(!u||!d){let _=(n-t)/(s-t),v=1-_;for(let p=0;p!==o;++p)r[p]=a[c+p]*v+a[l+p]*_;return r}let h=o*2,f=e-1;for(let _=0;_!==o;++_){let v=a[c+_],p=a[l+_],m=f*h+_*2,S=d[m],w=d[m+1],M=e*h+_*2,A=u[M],E=u[M+1],g=sf(n,t,S,A,s);r[_]=tu(g,v,w,E,p)}return r}};function tu(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function nf(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function sf(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=tu(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=nf(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var jt=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Gi(t,this.TimeBufferType),this.values=Gi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Gi(e.times,Array),values:Gi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Br(e.settings)&&(n.settings={inTangents:Gi(e.settings.inTangents,Array),outTangents:Gi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new da(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ua(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new pa(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case ws:t=this.InterpolantFactoryMethodDiscrete;break;case Qr:t=this.InterpolantFactoryMethodLinear;break;case Hr:t=this.InterpolantFactoryMethodSmooth;break;case Yo:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Be("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ws;case this.InterpolantFactoryMethodLinear:return Qr;case this.InterpolantFactoryMethodSmooth:return Hr;case this.InterpolantFactoryMethodBezier:return Yo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;Br(this.settings)&&(lh(this.settings.inTangents,e),lh(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Br(this.settings)&&(ch(this.settings.inTangents,e),ch(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ze("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(ze("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){ze("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){ze("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Pd(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){ze("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Hr,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let d=o*n,h=d-n,f=d+n;for(let _=0;_!==n;++_){let v=t[d+_];if(v!==t[h+_]||v!==t[f+_]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*n,h=a*n;for(let f=0;f!==n;++f)t[h+f]=t[d+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Br(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function lh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function ch(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}jt.prototype.ValueTypeName="";jt.prototype.TimeBufferType=Float32Array;jt.prototype.ValueBufferType=Float32Array;jt.prototype.DefaultInterpolation=Qr;var ci=class extends jt{constructor(e,t,n){super(e,t,n)}};ci.prototype.ValueTypeName="bool";ci.prototype.ValueBufferType=Array;ci.prototype.DefaultInterpolation=ws;ci.prototype.InterpolantFactoryMethodLinear=void 0;ci.prototype.InterpolantFactoryMethodSmooth=void 0;var ma=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}};ma.prototype.ValueTypeName="color";var ga=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}};ga.prototype.ValueTypeName="number";var _a=class extends li{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)Tn.slerpFlat(r,0,a,c-o,a,c,l);return r}},Hs=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new _a(this.times,this.values,this.getValueSize(),e)}};Hs.prototype.ValueTypeName="quaternion";Hs.prototype.InterpolantFactoryMethodSmooth=void 0;var hi=class extends jt{constructor(e,t,n){super(e,t,n)}};hi.prototype.ValueTypeName="string";hi.prototype.ValueBufferType=Array;hi.prototype.DefaultInterpolation=ws;hi.prototype.InterpolantFactoryMethodLinear=void 0;hi.prototype.InterpolantFactoryMethodSmooth=void 0;var xa=class extends jt{constructor(e,t,n,s){super(e,t,n,s)}};xa.prototype.ValueTypeName="vector";var Gr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(hh(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!hh(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function hh(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var va=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let f=c[d],_=c[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},nu=new va,is=class{constructor(e){this.manager=e!==void 0?e:nu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};is.DEFAULT_MATERIAL_NAME="__DEFAULT";var Wi=new WeakMap,ya=class extends is{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Gr.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let d=Wi.get(a);d===void 0&&(d=[],Wi.set(a,d)),d.push({onLoad:t,onError:s})}return a}let o=Ji("img");function l(){u(),t&&t(this);let d=Wi.get(this)||[];for(let h=0;h<d.length;h++){let f=d[h];f.onLoad&&f.onLoad(this)}Wi.delete(this),r.manager.itemEnd(e)}function c(d){u(),s&&s(d),Gr.remove(`image:${e}`);let h=Wi.get(this)||[];for(let f=0;f<h.length;f++){let _=h[f];_.onError&&_.onError(d)}Wi.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Gr.add(`image:${e}`,o),r.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}};var ss=class extends is{constructor(e){super(e)}load(e,t,n,s){let r=new kt,a=new ya(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Vs=class extends $t{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}};var qo=new ft,uh=new $,dh=new $,Ma=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new je(512,512),this.mapType=qt,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new oi,this._frameExtents=new je(1,1),this._viewportCount=1,this._viewports=[new pt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;uh.setFromMatrixPosition(e.matrixWorld),t.position.copy(uh),dh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(dh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){qo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(qo,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Zi||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(qo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},zr=new $,kr=new Tn,Mn=new $,Gs=class extends $t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(zr,kr,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(zr,kr,Mn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(zr,kr,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(zr,kr,Mn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ii=new $,fh=new je,ph=new je,Gt=class extends Gs{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ea*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ao*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ea*2*Math.atan(Math.tan(Ao*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ii.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ii.x,ii.y).multiplyScalar(-e/ii.z),ii.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ii.x,ii.y).multiplyScalar(-e/ii.z)}getViewSize(e,t){return this.getViewBounds(e,fh,ph),t.subVectors(ph,fh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ao*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Ws=class extends Gs{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},jo=class extends Ma{constructor(){super(new Ws(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},$s=class extends Vs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy($t.DEFAULT_UP),this.updateMatrix(),this.target=new $t,this.shadow=new jo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Xs=class extends Vs{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var $i=-90,Xi=1,rs=class extends $t{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Gt($i,Xi,e,t);s.layers=this.layers,this.add(s);let r=new Gt($i,Xi,e,t);r.layers=this.layers,this.add(r);let a=new Gt($i,Xi,e,t);a.layers=this.layers,this.add(a);let o=new Gt($i,Xi,e,t);o.layers=this.layers,this.add(o);let l=new Gt($i,Xi,e,t);l.layers=this.layers,this.add(l);let c=new Gt($i,Xi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===nn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Zi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=v,e.setRenderTarget(n,5,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Sa=class extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var Il="\\[\\]\\.:\\/",rf=new RegExp("["+Il+"]","g"),Pl="[^"+Il+"]",af="[^"+Il.replace("\\.","")+"]",of=/((?:WC+[\/:])*)/.source.replace("WC",Pl),lf=/(WCOD+)?/.source.replace("WCOD",af),cf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Pl),hf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Pl),uf=new RegExp("^"+of+lf+cf+hf+"$"),df=["material","materials","bones","map"],Qo=class{constructor(e,t,n){let s=n||dt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},dt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(rf,"")}static parseTrackName(e){let t=uf.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);df.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Be("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){ze("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ze("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ze("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ze("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ze("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){ze("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){ze("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;ze("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dt.Composite=Qo;dt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};dt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};dt.prototype.GetterByBindingType=[dt.prototype._getValue_direct,dt.prototype._getValue_array,dt.prototype._getValue_arrayElement,dt.prototype._getValue_toArray];dt.prototype.SetterByBindingTypeAndVersioning=[[dt.prototype._setValue_direct,dt.prototype._setValue_direct_setNeedsUpdate,dt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_array,dt.prototype._setValue_array_setNeedsUpdate,dt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_arrayElement,dt.prototype._setValue_arrayElement_setNeedsUpdate,dt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_fromArray,dt.prototype._setValue_fromArray_setNeedsUpdate,dt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var U_=new Float32Array(1);var Ol=class Ol{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};Ol.prototype.isMatrix2=!0;var el=Ol;function Ll(i,e,t,n){let s=ff(n);switch(t){case yl:return i*e;case Sl:return i*e/s.components*s.byteLength;case Ia:return i*e/s.components*s.byteLength;case di:return i*e*2/s.components*s.byteLength;case Pa:return i*e*2/s.components*s.byteLength;case Ml:return i*e*3/s.components*s.byteLength;case gn:return i*e*4/s.components*s.byteLength;case La:return i*e*4/s.components*s.byteLength;case Zs:case Js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ks:case js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Na:case Fa:return Math.max(i,16)*Math.max(e,8)/4;case Da:case Ua:return Math.max(i,8)*Math.max(e,8)/2;case Oa:case Ba:case ka:case Ha:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case za:case Qs:case Va:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ga:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Wa:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case $a:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Xa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case qa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Za:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ja:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ja:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Qa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case eo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case to:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case no:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case io:case so:case ro:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ao:case oo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case er:case lo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ff(i){switch(i){case qt:case gl:return{byteLength:1,components:1};case cs:case _l:case mn:return{byteLength:2,components:1};case Ca:case Ra:return{byteLength:2,components:4};case fn:case wa:case pn:return{byteLength:4,components:1};case xl:case vl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function Eu(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function mf(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let u=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,_)=>f.start-_.start);let h=0;for(let f=1;f<d.length;f++){let _=d[h],v=d[f];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++h,d[h]=v)}d.length=h+1;for(let f=0,_=d.length;f<_;f++){let v=d[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var gf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,_f=`#ifdef USE_ALPHAHASH
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
#endif`,xf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,vf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,yf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Mf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Sf=`#ifdef USE_AOMAP
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
#endif`,bf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ef=`#ifdef USE_BATCHING
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
#endif`,Tf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Af=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,wf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Cf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Rf=`#ifdef USE_IRIDESCENCE
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
#endif`,If=`#ifdef USE_BUMPMAP
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
#endif`,Pf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Lf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Df=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Nf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Uf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ff=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Of=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Bf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,zf=`#define PI 3.141592653589793
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
} // validated`,kf=`vec3 transformedNormal = objectNormal;
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
#endif`,Hf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Vf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Gf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Wf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$f="gl_FragColor = linearToOutputTexel( gl_FragColor );",Xf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,qf=`#ifdef USE_ENVMAP
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
#endif`,Yf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Zf=`#ifdef USE_ENVMAP
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
#endif`,Jf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Kf=`#ifdef USE_ENVMAP
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
#endif`,jf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Qf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ep=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,tp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,np=`#ifdef USE_GRADIENTMAP
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
}`,ip=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,sp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,rp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ap=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,op=`#ifdef USE_ENVMAP
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
#endif`,lp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,cp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,hp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,up=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,dp=`PhysicalMaterial material;
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
#endif`,fp=`uniform sampler2D dfgLUT;
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
}`,pp=`
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
#endif`,mp=`#if defined( RE_IndirectDiffuse )
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
#endif`,gp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,_p=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,xp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,yp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Sp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ep=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Tp=`#if defined( USE_POINTS_UV )
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
#endif`,Ap=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,wp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Cp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Rp=`#if defined( USE_MORPHCOLORS )
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
#endif`,Ip=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pp=`#ifdef USE_MORPHTARGETS
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
#endif`,Lp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Dp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Np=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Up=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Op=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Bp=`#ifdef USE_NORMALMAP
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
#endif`,zp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,kp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Hp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Vp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Gp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Wp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,$p=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Xp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,qp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Yp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Zp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Kp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,jp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Qp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,em=`float getShadowMask() {
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
}`,tm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,nm=`#ifdef USE_SKINNING
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
#endif`,im=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,sm=`#ifdef USE_SKINNING
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
#endif`,rm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,am=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,om=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,lm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,cm=`#ifdef USE_TRANSMISSION
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
#endif`,hm=`#ifdef USE_TRANSMISSION
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
#endif`,um=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,pm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,mm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,gm=`uniform sampler2D t2D;
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
}`,_m=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xm=`uniform float backgroundBlurriness;
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
}`,vm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ym=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mm=`#include <common>
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
}`,Sm=`#if DEPTH_PACKING == 3200
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
}`,bm=`#define DISTANCE
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
}`,Em=`#define DISTANCE
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
}`,Tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Am=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wm=`uniform float scale;
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
}`,Cm=`uniform vec3 diffuse;
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
}`,Rm=`#include <common>
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
}`,Im=`uniform vec3 diffuse;
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
}`,Pm=`#define LAMBERT
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
}`,Lm=`#define LAMBERT
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
}`,Dm=`#define MATCAP
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
}`,Nm=`#define MATCAP
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
}`,Um=`#define NORMAL
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
}`,Fm=`#define NORMAL
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
}`,Om=`#define PHONG
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
}`,Bm=`#define PHONG
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
}`,zm=`#define STANDARD
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
}`,km=`#define STANDARD
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
}`,Hm=`#define TOON
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
}`,Vm=`#define TOON
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
}`,Gm=`uniform float size;
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
}`,Wm=`uniform vec3 diffuse;
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
}`,$m=`#include <common>
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
}`,Xm=`uniform vec3 color;
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
}`,qm=`uniform float rotation;
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
}`,Ym=`uniform vec3 diffuse;
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
}`,$e={alphahash_fragment:gf,alphahash_pars_fragment:_f,alphamap_fragment:xf,alphamap_pars_fragment:vf,alphatest_fragment:yf,alphatest_pars_fragment:Mf,aomap_fragment:Sf,aomap_pars_fragment:bf,batching_pars_vertex:Ef,batching_vertex:Tf,begin_vertex:Af,beginnormal_vertex:wf,bsdfs:Cf,iridescence_fragment:Rf,bumpmap_pars_fragment:If,clipping_planes_fragment:Pf,clipping_planes_pars_fragment:Lf,clipping_planes_pars_vertex:Df,clipping_planes_vertex:Nf,color_fragment:Uf,color_pars_fragment:Ff,color_pars_vertex:Of,color_vertex:Bf,common:zf,defaultnormal_vertex:kf,displacementmap_pars_vertex:Hf,displacementmap_vertex:Vf,emissivemap_fragment:Gf,emissivemap_pars_fragment:Wf,colorspace_fragment:$f,colorspace_pars_fragment:Xf,envmap_fragment:qf,envmap_common_pars_fragment:Yf,envmap_pars_fragment:Zf,envmap_pars_vertex:Jf,envmap_physical_pars_fragment:op,envmap_vertex:Kf,fog_vertex:jf,fog_pars_vertex:Qf,fog_fragment:ep,fog_pars_fragment:tp,gradientmap_pars_fragment:np,lightmap_pars_fragment:ip,lights_lambert_fragment:sp,lights_lambert_pars_fragment:rp,lights_pars_begin:ap,lights_toon_fragment:lp,lights_toon_pars_fragment:cp,lights_phong_fragment:hp,lights_phong_pars_fragment:up,lights_physical_fragment:dp,lights_physical_pars_fragment:fp,lights_fragment_begin:pp,lights_fragment_maps:mp,lights_fragment_end:gp,lightprobes_pars_fragment:_p,logdepthbuf_fragment:xp,logdepthbuf_pars_fragment:vp,logdepthbuf_pars_vertex:yp,logdepthbuf_vertex:Mp,map_fragment:Sp,map_pars_fragment:bp,map_particle_fragment:Ep,map_particle_pars_fragment:Tp,metalnessmap_fragment:Ap,metalnessmap_pars_fragment:wp,morphinstance_vertex:Cp,morphcolor_vertex:Rp,morphnormal_vertex:Ip,morphtarget_pars_vertex:Pp,morphtarget_vertex:Lp,normal_fragment_begin:Dp,normal_fragment_maps:Np,normal_pars_fragment:Up,normal_pars_vertex:Fp,normal_vertex:Op,normalmap_pars_fragment:Bp,clearcoat_normal_fragment_begin:zp,clearcoat_normal_fragment_maps:kp,clearcoat_pars_fragment:Hp,iridescence_pars_fragment:Vp,opaque_fragment:Gp,packing:Wp,premultiplied_alpha_fragment:$p,project_vertex:Xp,dithering_fragment:qp,dithering_pars_fragment:Yp,roughnessmap_fragment:Zp,roughnessmap_pars_fragment:Jp,shadowmap_pars_fragment:Kp,shadowmap_pars_vertex:jp,shadowmap_vertex:Qp,shadowmask_pars_fragment:em,skinbase_vertex:tm,skinning_pars_vertex:nm,skinning_vertex:im,skinnormal_vertex:sm,specularmap_fragment:rm,specularmap_pars_fragment:am,tonemapping_fragment:om,tonemapping_pars_fragment:lm,transmission_fragment:cm,transmission_pars_fragment:hm,uv_pars_fragment:um,uv_pars_vertex:dm,uv_vertex:fm,worldpos_vertex:pm,background_vert:mm,background_frag:gm,backgroundCube_vert:_m,backgroundCube_frag:xm,cube_vert:vm,cube_frag:ym,depth_vert:Mm,depth_frag:Sm,distance_vert:bm,distance_frag:Em,equirect_vert:Tm,equirect_frag:Am,linedashed_vert:wm,linedashed_frag:Cm,meshbasic_vert:Rm,meshbasic_frag:Im,meshlambert_vert:Pm,meshlambert_frag:Lm,meshmatcap_vert:Dm,meshmatcap_frag:Nm,meshnormal_vert:Um,meshnormal_frag:Fm,meshphong_vert:Om,meshphong_frag:Bm,meshphysical_vert:zm,meshphysical_frag:km,meshtoon_vert:Hm,meshtoon_frag:Vm,points_vert:Gm,points_frag:Wm,shadow_vert:$m,shadow_frag:Xm,sprite_vert:qm,sprite_frag:Ym},Me={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new je(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new je(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},In={basic:{uniforms:Ht([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:Ht([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new Ze(0)},envMapIntensity:{value:1}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:Ht([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:Ht([Me.common,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.roughnessmap,Me.metalnessmap,Me.fog,Me.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:Ht([Me.common,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.gradientmap,Me.fog,Me.lights,{emissive:{value:new Ze(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:Ht([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:Ht([Me.points,Me.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:Ht([Me.common,Me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:Ht([Me.common,Me.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:Ht([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:Ht([Me.sprite,Me.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distance:{uniforms:Ht([Me.common,Me.displacementmap,{referencePosition:{value:new $},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distance_vert,fragmentShader:$e.distance_frag},shadow:{uniforms:Ht([Me.lights,Me.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};In.physical={uniforms:Ht([In.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new je(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new ke},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new je},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new je},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var ho={r:0,b:0,g:0},Zm=new ft,Tu=new ke;Tu.set(-1,0,0,0,1,0,0,0,1);function Jm(i,e,t,n,s,r){let a=new Ze(0),o=s===!0?0:1,l,c,u=null,d=0,h=null;function f(S){let w=S.isScene===!0?S.background:null;if(w&&w.isTexture){let M=S.backgroundBlurriness>0;w=e.get(w,M)}return w}function _(S){let w=!1,M=f(S);M===null?p(a,o):M&&M.isColor&&(p(M,1),w=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||w)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(S,w){let M=f(w);M&&M.isCubeTexture?(c===void 0&&(c=new Kt(new ts(1,1,1),new An({name:"BackgroundCubeMaterial",uniforms:Ai(In.backgroundCube.uniforms),vertexShader:In.backgroundCube.vertexShader,fragmentShader:In.backgroundCube.fragmentShader,side:Xt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,E,g){this.matrixWorld.copyPosition(g.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Zm.makeRotationFromEuler(w.backgroundRotation)).transpose(),M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Tu),c.material.toneMapped=Ye.getTransfer(M.colorSpace)!==it,(u!==M||d!==M.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,d=M.version,h=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new Kt(new zs(2,2),new An({name:"BackgroundMaterial",uniforms:Ai(In.background.uniforms),vertexShader:In.background.vertexShader,fragmentShader:In.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=Ye.getTransfer(M.colorSpace)!==it,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||d!==M.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=M,d=M.version,h=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function p(S,w){S.getRGB(ho,Rl(i)),t.buffers.color.setClear(ho.r,ho.g,ho.b,w,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,w=1){a.set(S),o=w,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,p(a,o)},render:_,addToRenderList:v,dispose:m}}function Km(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(I,U,V,C,O){let X=!1,F=d(I,C,V,U);r!==F&&(r=F,c(r.object)),X=f(I,C,V,O),X&&_(I,C,V,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,M(I,U,V,C),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function u(I){return i.deleteVertexArray(I)}function d(I,U,V,C){let O=C.wireframe===!0,X=n[U.id];X===void 0&&(X={},n[U.id]=X);let F=I.isInstancedMesh===!0?I.id:0,ie=X[F];ie===void 0&&(ie={},X[F]=ie);let G=ie[V.id];G===void 0&&(G={},ie[V.id]=G);let ee=G[O];return ee===void 0&&(ee=h(l()),G[O]=ee),ee}function h(I){let U=[],V=[],C=[];for(let O=0;O<t;O++)U[O]=0,V[O]=0,C[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:V,attributeDivisors:C,object:I,attributes:{},index:null}}function f(I,U,V,C){let O=r.attributes,X=U.attributes,F=0,ie=V.getAttributes();for(let G in ie)if(ie[G].location>=0){let se=O[G],Se=X[G];if(Se===void 0&&(G==="instanceMatrix"&&I.instanceMatrix&&(Se=I.instanceMatrix),G==="instanceColor"&&I.instanceColor&&(Se=I.instanceColor)),se===void 0||se.attribute!==Se||Se&&se.data!==Se.data)return!0;F++}return r.attributesNum!==F||r.index!==C}function _(I,U,V,C){let O={},X=U.attributes,F=0,ie=V.getAttributes();for(let G in ie)if(ie[G].location>=0){let se=X[G];se===void 0&&(G==="instanceMatrix"&&I.instanceMatrix&&(se=I.instanceMatrix),G==="instanceColor"&&I.instanceColor&&(se=I.instanceColor));let Se={};Se.attribute=se,se&&se.data&&(Se.data=se.data),O[G]=Se,F++}r.attributes=O,r.attributesNum=F,r.index=C}function v(){let I=r.newAttributes;for(let U=0,V=I.length;U<V;U++)I[U]=0}function p(I){m(I,0)}function m(I,U){let V=r.newAttributes,C=r.enabledAttributes,O=r.attributeDivisors;V[I]=1,C[I]===0&&(i.enableVertexAttribArray(I),C[I]=1),O[I]!==U&&(i.vertexAttribDivisor(I,U),O[I]=U)}function S(){let I=r.newAttributes,U=r.enabledAttributes;for(let V=0,C=U.length;V<C;V++)U[V]!==I[V]&&(i.disableVertexAttribArray(V),U[V]=0)}function w(I,U,V,C,O,X,F){F===!0?i.vertexAttribIPointer(I,U,V,O,X):i.vertexAttribPointer(I,U,V,C,O,X)}function M(I,U,V,C){v();let O=C.attributes,X=V.getAttributes(),F=U.defaultAttributeValues;for(let ie in X){let G=X[ie];if(G.location>=0){let ee=O[ie];if(ee===void 0&&(ie==="instanceMatrix"&&I.instanceMatrix&&(ee=I.instanceMatrix),ie==="instanceColor"&&I.instanceColor&&(ee=I.instanceColor)),ee!==void 0){let se=ee.normalized,Se=ee.itemSize,Te=e.get(ee);if(Te===void 0)continue;let Z=Te.buffer,q=Te.type,Q=Te.bytesPerElement,fe=q===i.INT||q===i.UNSIGNED_INT||ee.gpuType===wa;if(ee.isInterleavedBufferAttribute){let oe=ee.data,Pe=oe.isInterleavedBuffer===!0?oe.stride:oe.itemSize,tt=ee.offset;if(oe.isInstancedInterleavedBuffer||oe.isInstancedBufferAttribute){for(let Re=0;Re<G.locationSize;Re++)m(G.location+Re,oe.meshPerAttribute);I.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Re=0;Re<G.locationSize;Re++)p(G.location+Re);i.bindBuffer(i.ARRAY_BUFFER,Z);for(let Re=0;Re<G.locationSize;Re++)w(G.location+Re,Se/G.locationSize,q,se,Pe*Q,(tt+Se/G.locationSize*Re)*Q,fe)}else{if(ee.isInstancedBufferAttribute){for(let oe=0;oe<G.locationSize;oe++)m(G.location+oe,ee.meshPerAttribute);I.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let oe=0;oe<G.locationSize;oe++)p(G.location+oe);i.bindBuffer(i.ARRAY_BUFFER,Z);for(let oe=0;oe<G.locationSize;oe++)w(G.location+oe,Se/G.locationSize,q,se,Se*Q,Se/G.locationSize*oe*Q,fe)}}else if(F!==void 0){let se=F[ie];if(se!==void 0)switch(se.length){case 2:i.vertexAttrib2fv(G.location,se);break;case 3:i.vertexAttrib3fv(G.location,se);break;case 4:i.vertexAttrib4fv(G.location,se);break;default:i.vertexAttrib1fv(G.location,se)}}}}S()}function A(){N();for(let I in n){let U=n[I];for(let V in U){let C=U[V];for(let O in C){let X=C[O];for(let F in X)u(X[F].object),delete X[F];delete C[O]}}delete n[I]}}function E(I){if(n[I.id]===void 0)return;let U=n[I.id];for(let V in U){let C=U[V];for(let O in C){let X=C[O];for(let F in X)u(X[F].object),delete X[F];delete C[O]}}delete n[I.id]}function g(I){for(let U in n){let V=n[U];for(let C in V){let O=V[C];if(O[I.id]===void 0)continue;let X=O[I.id];for(let F in X)u(X[F].object),delete X[F];delete O[I.id]}}}function b(I){for(let U in n){let V=n[U],C=I.isInstancedMesh===!0?I.id:0,O=V[C];if(O!==void 0){for(let X in O){let F=O[X];for(let ie in F)u(F[ie].object),delete F[ie];delete O[X]}delete V[C],Object.keys(V).length===0&&delete n[U]}}}function N(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:N,resetDefaultState:R,dispose:A,releaseStatesOfGeometry:E,releaseStatesOfObject:b,releaseStatesOfProgram:g,initAttributes:v,enableAttribute:p,disableUnusedAttributes:S}}function jm(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let f=0;f<u;f++)h+=c[f];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Qm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let g=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(g.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(g){return!(g!==gn&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(g){let b=g===mn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(g!==qt&&g!==pn&&!b&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(g){if(g==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";g="mediump"}return g==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(Be("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&d===!1;t.reversedDepthBuffer===!0&&d===!1&&Be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&d===!0&&Be("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:S,maxVaryings:w,maxFragmentUniforms:M,maxSamples:A,samples:E}}function eg(i){let e=this,t=null,n=0,s=!1,r=!1,a=new un,o=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let f=d.length!==0||h||n!==0||s;return s=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){let _=d.clippingPlanes,v=d.clipIntersection,p=d.clipShadows,m=i.get(d);if(!s||_===null||_.length===0||r&&!p)r?u(null):c();else{let S=r?0:n,w=S*4,M=m.clippingState||null;l.value=M,M=u(_,h,w,f);for(let A=0;A!==w;++A)M[A]=t[A];m.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,_){let v=d!==null?d.length:0,p=null;if(v!==0){if(p=l.value,_!==!0||p===null){let m=f+v*4,S=h.matrixWorldInverse;o.getNormalMatrix(S),(p===null||p.length<m)&&(p=new Float32Array(m));for(let w=0,M=f;w!==v;++w,M+=4)a.copy(d[w]).applyMatrix4(S,o),a.normal.toArray(p,M),p[M+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}var sr=class extends Jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Us(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ts(5,5,5),r=new An({name:"CubemapFromEquirect",uniforms:Ai(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Xt,blending:Si});r.uniforms.tEquirect.value=t;let a=new Kt(s,r),o=t.minFilter;return t.minFilter===qn&&(t.minFilter=Wt),new rs(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},iu=256,tg=3,ng=20,Au=256,wu=16,ig=3,sg=new $,rg=new Ze,fo=class i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new rs(1,10,null),this._boxMesh=new Kt(new ts(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=sg}=r,l=this._renderer;this._setSize(a);let c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);let d=l.autoClear,h=l.autoClearColor,f=l.autoClearDepth,_=l.autoClearStencil,v=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,v===null&&(e.background=l.getClearColor(rg));let p=new rs(n,s,u);return p.position.copy(o),p.update(l,e),l.autoClear=d,l.autoClearColor=h,l.autoClearDepth=f,l.autoClearStencil=_,e.background=v,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=au(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ru(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(iu,jh(e))}_fromTexture(e,t){e.mapping===Ei||e.mapping===ls?this._setSize(e.image.length===0?iu:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=su(e,!1,!1),n=Math.log2(e)-tg;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=su(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Ei||e.mapping===ls?(this._cubemapMaterial===null&&(this._cubemapMaterial=au()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=ru()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=ag(),this._integrationMaterial=og());let t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/wu);for(let a=0;a<=n;a++){let o=i.lodToRoughness(a,n);if(a>n-ig)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{let l=o>0?Math.log2(t)+.5*Math.log2(6/(Au*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=lg());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}};function su(i,e,t){return new sr(i,{minFilter:qn,generateMipmaps:e,type:mn,colorSpace:Cs,depthBuffer:t})}function rr(i,e,t){return new An({name:i,uniforms:e,vertexShader:$e.cube_vert,fragmentShader:t,side:Xt,blending:Si,depthTest:!1,depthWrite:!1})}function ag(){return rr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Au}u

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
	`)}function og(){return rr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:wu}},`

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
	`)}function lg(){return rr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${ng}
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
	`)}function ru(){return rr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function au(){return rr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function cg(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,f=!1){return h==null?null:f?a(h):r(h)}function r(h){if(h&&h.isTexture){let f=h.mapping;if(f===Ea||f===Ta)if(e.has(h)){let _=e.get(h).texture;return o(_,h.mapping)}else{let _=h.image;if(_&&_.height>0){let v=new sr(_.height);return v.fromEquirectangularTexture(i,h),e.set(h,v),h.addEventListener("dispose",c),o(v.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){let f=h.mapping,_=f===Ea||f===Ta,v=f===Ei||f===ls;if(_||v){let p=t.get(h),m=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==m)return n===null&&(n=new fo(i)),p=_?n.fromEquirectangular(h,p):n.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),p.texture;if(p!==void 0)return p.texture;{let S=h.image;return _&&S&&S.height>0||v&&S&&l(S)?(n===null&&(n=new fo(i)),p=_?n.fromEquirectangular(h):n.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),h.addEventListener("dispose",u),p.texture):null}}}return h}function o(h,f){return f===Ea?h.mapping=Ei:f===Ta&&(h.mapping=ls),h}function l(h){let f=0,_=6;for(let v=0;v<_;v++)h[v]!==void 0&&f++;return f===_}function c(h){let f=h.target;f.removeEventListener("dispose",c);let _=e.get(f);_!==void 0&&(e.delete(f),_.dispose())}function u(h){let f=h.target;f.removeEventListener("dispose",u);let _=t.get(f);_!==void 0&&(t.delete(f),_.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function hg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&As("WebGLRenderer: "+n+" extension not supported."),s}}}function ug(i,e,t,n){let s={},r=new WeakMap,a=new FinalizationRegistry(_=>delete s[_]);function o(_){l(_.target)}function l(_){_.index!==null&&e.remove(_.index);for(let p in _.attributes)e.remove(_.attributes[p]);_.removeEventListener("dispose",o),delete s[_.id],a.unregister(_);let v=r.get(_);v&&(e.remove(v),r.delete(_)),n.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,t.memory.geometries--}function c(_,v){return s[v.id]!==void 0||(v.addEventListener("dispose",o),s[v.id]=new WeakRef(v),a.register(v,v.id,v),t.memory.geometries++),v}function u(_){let v=_.attributes;for(let p in v)e.update(v[p],i.ARRAY_BUFFER)}function d(_){let v=_.index,p=_.attributes.position,m=0;if(p===void 0)return;let S=v!==null?v.array.length:p.array.length/3-1,w=p.count>=65535?Ns:Ds,M=new w(Math.ceil(S/3)*6,1),A=M.array;if(v!==null){let g=v.array;m=v.version;for(let b=0,N=0;b<S;b+=3){let R=g[b+0],I=g[b+1],U=g[b+2];A[N++]=R,A[N++]=I,A[N++]=I,A[N++]=U,A[N++]=U,A[N++]=R}}else{m=p.version;for(let g=0,b=0;g<S;g+=3){let N=g+0,R=g+1,I=g+2;A[b++]=N,A[b++]=R,A[b++]=R,A[b++]=I,A[b++]=I,A[b++]=N}}M.version=m;let E=r.get(_);E&&e.remove(E),r.set(_,M)}function h(_){let v=r.get(_);if(v){let p=_.index;p!==null&&v.version<p.version&&d(_)}else d(_);return r.get(_)}function f(){for(let _ in s){let v=s[_].deref();v!==void 0&&l(v)}}return{get:c,update:u,getWireframeAttribute:h,dispose:f}}function dg(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,h){i.drawElements(n,h,r,d*a),t.update(h,n,1)}function c(d,h,f){f!==0&&(i.drawElementsInstanced(n,h,r,d*a,f),t.update(h,n,f))}function u(d,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,f);let v=0;for(let p=0;p<f;p++)v+=h[p];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function fg(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:ze("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function pg(i,e,t){let n=new WeakMap,s=new pt;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==d){let N=function(){g.dispose(),n.delete(o),o.removeEventListener("dispose",N)};h!==void 0&&h.texture.dispose();let f=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],S=o.morphAttributes.color||[],w=0;f===!0&&(w=1),_===!0&&(w=2),v===!0&&(w=3);let M=o.attributes.position.count*w,A=1;M>e.maxTextureSize&&(A=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let E=new Float32Array(M*A*4*d),g=new Is(E,M,A,d);g.type=pn,g.needsUpdate=!0;let b=w*4;for(let R=0;R<d;R++){let I=p[R],U=m[R],V=S[R],C=M*A*4*R;for(let O=0;O<I.count;O++){let X=O*b;f===!0&&(s.fromBufferAttribute(I,O),E[C+X+0]=s.x,E[C+X+1]=s.y,E[C+X+2]=s.z,E[C+X+3]=0),_===!0&&(s.fromBufferAttribute(U,O),E[C+X+4]=s.x,E[C+X+5]=s.y,E[C+X+6]=s.z,E[C+X+7]=0),v===!0&&(s.fromBufferAttribute(V,O),E[C+X+8]=s.x,E[C+X+9]=s.y,E[C+X+10]=s.z,E[C+X+11]=V.itemSize===4?s.w:1)}}h={count:d,texture:g,size:new je(M,A)},n.set(o,h),o.addEventListener("dispose",N)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let _=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function mg(i,e,t,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,d=c.geometry,h=e.get(c,d);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var gg={[ll]:"LINEAR_TONE_MAPPING",[cl]:"REINHARD_TONE_MAPPING",[hl]:"CINEON_TONE_MAPPING",[ul]:"ACES_FILMIC_TONE_MAPPING",[fl]:"AGX_TONE_MAPPING",[pl]:"NEUTRAL_TONE_MAPPING",[dl]:"CUSTOM_TONE_MAPPING"};function _g(i,e,t,n,s,r){let a=new Jt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=null,u=new dn;u.setAttribute("position",new It([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new It([0,2,0,0,2,0],2));let d=new la({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new Kt(u,d),f=new Ws(-1,1,1,-1,0,1),_=null,v=null,p=!1,m,S=null,w=[],M=!1;this.setSize=function(A,E){a.setSize(A,E),o!==null&&o.setSize(A,E),l!==null&&l.setSize(A,E);for(let g=0;g<w.length;g++){let b=w[g];b.setSize&&b.setSize(A,E)}},this.setEffects=function(A){w=A,M=w.length>0&&w[0].isRenderPass===!0;let E=a.width,g=a.height;w.length>0&&o===null&&(o=new Jt(E,g,{type:mn,depthBuffer:!1,stencilBuffer:!1}),l=new Jt(E,g,{type:mn,depthBuffer:!1,stencilBuffer:!1}));let b=s===!0&&w.some(N=>N.needsDepthTexture===!0);b!==(a.depthTexture!==null)&&(b===!0&&c===null&&(c=new Xn(E,g),r===!0&&(c.format=Yn,c.type=Ti)),a.dispose(),a.depthTexture=b?c:null,a.resolveDepthBuffer=b,a.storeMultisampledDepthBuffer=b);for(let N=0;N<w.length;N++){let R=w[N];R.setSize&&R.setSize(E,g),b&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(A,E){if(p||A.toneMapping===Cn&&w.length===0)return!1;if(S=E,E!==null){let g=E.width,b=E.height;(a.width!==g||a.height!==b)&&this.setSize(g,b)}return M===!1&&A.setRenderTarget(a),m=A.toneMapping,A.toneMapping=Cn,!0},this.hasRenderPass=function(){return M},this.end=function(A,E){A.toneMapping=m,p=!0;let g=a,b=o;for(let N=0;N<w.length;N++){let R=w[N];R.enabled!==!1&&(R.render(A,b,g,E),R.needsSwap!==!1&&(g=b,b=b===o?l:o))}if(_!==A.outputColorSpace||v!==A.toneMapping){_=A.outputColorSpace,v=A.toneMapping,d.defines={},Ye.getTransfer(_)===it&&(d.defines.SRGB_TRANSFER="");let N=gg[v];N&&(d.defines[N]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=g.texture,A.setRenderTarget(S),A.render(h,f),S=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),d.dispose()}}var Cu=new kt,Ru=new Xn(1,1),Iu=new Os(1),Pu=new Is,Lu=new ia,Du=new Us,ou=[],lu=[],cu=new Float32Array(16),hu=new Float32Array(9),uu=new Float32Array(4);function us(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=ou[s];if(r===void 0&&(r=new Float32Array(s),ou[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function bt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Et(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function mo(i,e){let t=lu[e];t===void 0&&(t=new Int32Array(e),lu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function xg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2fv(this.addr,e),Et(t,e)}}function yg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(bt(t,e))return;i.uniform3fv(this.addr,e),Et(t,e)}}function Mg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4fv(this.addr,e),Et(t,e)}}function Sg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Et(t,e)}else{if(bt(t,n))return;uu.set(n),i.uniformMatrix2fv(this.addr,!1,uu),Et(t,n)}}function bg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Et(t,e)}else{if(bt(t,n))return;hu.set(n),i.uniformMatrix3fv(this.addr,!1,hu),Et(t,n)}}function Eg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Et(t,e)}else{if(bt(t,n))return;cu.set(n),i.uniformMatrix4fv(this.addr,!1,cu),Et(t,n)}}function Tg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Ag(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2iv(this.addr,e),Et(t,e)}}function wg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3iv(this.addr,e),Et(t,e)}}function Cg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4iv(this.addr,e),Et(t,e)}}function Rg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Ig(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2uiv(this.addr,e),Et(t,e)}}function Pg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3uiv(this.addr,e),Et(t,e)}}function Lg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4uiv(this.addr,e),Et(t,e)}}function go(i){return i.version===0&&(i.compareFunction=Tl,i.needsUpdate=!0),i}function Dg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=go(Ru):r=Cu,t.setTexture2D(e||r,s)}function Ng(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Lu,s)}function Ug(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=go(Iu):r=Du,t.setTextureCube(e||r,s)}function Fg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Pu,s)}function Og(i){switch(i){case 5126:return xg;case 35664:return vg;case 35665:return yg;case 35666:return Mg;case 35674:return Sg;case 35675:return bg;case 35676:return Eg;case 5124:case 35670:return Tg;case 35667:case 35671:return Ag;case 35668:case 35672:return wg;case 35669:case 35673:return Cg;case 5125:return Rg;case 36294:return Ig;case 36295:return Pg;case 36296:return Lg;case 35678:case 36198:case 36298:case 36306:case 35682:return Dg;case 35679:case 36299:case 36307:return Ng;case 35680:case 36300:case 36308:case 36293:return Ug;case 36289:case 36303:case 36311:case 36292:return Fg}}function Bg(i,e){i.uniform1fv(this.addr,e)}function zg(i,e){let t=us(e,this.size,2);i.uniform2fv(this.addr,t)}function kg(i,e){let t=us(e,this.size,3);i.uniform3fv(this.addr,t)}function Hg(i,e){let t=us(e,this.size,4);i.uniform4fv(this.addr,t)}function Vg(i,e){let t=us(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Gg(i,e){let t=us(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Wg(i,e){let t=us(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function $g(i,e){i.uniform1iv(this.addr,e)}function Xg(i,e){i.uniform2iv(this.addr,e)}function qg(i,e){i.uniform3iv(this.addr,e)}function Yg(i,e){i.uniform4iv(this.addr,e)}function Zg(i,e){i.uniform1uiv(this.addr,e)}function Jg(i,e){i.uniform2uiv(this.addr,e)}function Kg(i,e){i.uniform3uiv(this.addr,e)}function jg(i,e){i.uniform4uiv(this.addr,e)}function Qg(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=go(Ru):a=Cu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function e0(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Lu,r[a])}function t0(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=go(Iu):a=Du;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function n0(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Pu,r[a])}function i0(i){switch(i){case 5126:return Bg;case 35664:return zg;case 35665:return kg;case 35666:return Hg;case 35674:return Vg;case 35675:return Gg;case 35676:return Wg;case 5124:case 35670:return $g;case 35667:case 35671:return Xg;case 35668:case 35672:return qg;case 35669:case 35673:return Yg;case 5125:return Zg;case 36294:return Jg;case 36295:return Kg;case 36296:return jg;case 35678:case 36198:case 36298:case 36306:case 35682:return Qg;case 35679:case 36299:case 36307:return e0;case 35680:case 36300:case 36308:case 36293:return t0;case 36289:case 36303:case 36311:case 36292:return n0}}var kl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Og(t.type)}},Hl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=i0(t.type)}},Vl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Bl=/(\w+)(\])?(\[|\.)?/g;function du(i,e){i.seq.push(e),i.map[e.id]=e}function s0(i,e,t){let n=i.name,s=n.length;for(Bl.lastIndex=0;;){let r=Bl.exec(n),a=Bl.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){du(t,c===void 0?new kl(o,i,e):new Hl(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new Vl(o),du(t,d)),t=d}}}var hs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);s0(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function fu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var r0=37297,a0=0;function o0(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var pu=new ke;function l0(i){Ye._getMatrix(pu,Ye.workingColorSpace,i);let e=`mat3( ${pu.elements.map(t=>t.toFixed(4))} )`;switch(Ye.getTransfer(i)){case Rs:return[e,"LinearTransferOETF"];case it:return[e,"sRGBTransferOETF"];default:return Be("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function mu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+o0(i.getShaderSource(e),o)}else return r}function c0(i,e){let t=l0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var h0={[ll]:"Linear",[cl]:"Reinhard",[hl]:"Cineon",[ul]:"ACESFilmic",[fl]:"AgX",[pl]:"Neutral",[dl]:"Custom"};function u0(i,e){let t=h0[e];return t===void 0?(Be("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var uo=new $;function d0(){Ye.getLuminanceCoefficients(uo);let i=uo.x.toFixed(4),e=uo.y.toFixed(4),t=uo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function f0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ir).join(`
`)}function p0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function m0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ir(i){return i!==""}function gu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function _u(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var g0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Gl(i){return i.replace(g0,_0)}function _0(i,e){let t=$e[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Gl(t)}var x0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function xu(i){return i.replace(x0,v0)}function v0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function vu(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var y0={[qs]:"SHADOWMAP_TYPE_PCF",[as]:"SHADOWMAP_TYPE_VSM"};function M0(i){return y0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var S0={[ls]:"ENVMAP_MODE_REFRACTION"};function b0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":S0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var E0={[ol]:"ENVMAP_BLENDING_MULTIPLY",[Fh]:"ENVMAP_BLENDING_MIX",[Oh]:"ENVMAP_BLENDING_ADD"};function T0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":E0[i.combine]||"ENVMAP_BLENDING_NONE"}function A0(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=M0(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=b0(t),d=T0(t),h=f0(t),f=p0(r),_=s.createProgram(),v,p,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ir).join(`
`),v.length>0&&(v+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ir).join(`
`),p.length>0&&(p+=`
`)):(v=[vu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ir).join(`
`),p=[vu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Cn?"#define TONE_MAPPING":"",t.toneMapping!==Cn?$e.tonemapping_pars_fragment:"",t.toneMapping!==Cn?u0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,c0("linearToOutputTexel",t.outputColorSpace),d0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ir).join(`
`)),a=Gl(a),a=gu(a,t),a=_u(a,t),o=Gl(o),o=gu(o,t),o=_u(o,t),a=xu(a),o=xu(o),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,v=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,p=["#define varying in",t.glslVersion===Al?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Al?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let S=m+v+a,w=m+p+o,M=fu(s,s.VERTEX_SHADER,S),A=fu(s,s.FRAGMENT_SHADER,w);s.attachShader(_,M),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function E(R){if(i.debug.checkShaderErrors){let I=s.getProgramInfoLog(_)||"",U=s.getShaderInfoLog(M)||"",V=s.getShaderInfoLog(A)||"",C=I.trim(),O=U.trim(),X=V.trim(),F=!0,ie=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(F=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,M,A);else{let G=mu(s,M,"vertex"),ee=mu(s,A,"fragment");ze("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+C+`
`+G+`
`+ee)}else C!==""?Be("WebGLProgram: Program Info Log:",C):(O===""||X==="")&&(ie=!1);ie&&(R.diagnostics={runnable:F,programLog:C,vertexShader:{log:O,prefix:v},fragmentShader:{log:X,prefix:p}})}s.deleteShader(M),s.deleteShader(A),g=new hs(s,_),b=m0(s,_)}let g;this.getUniforms=function(){return g===void 0&&E(this),g};let b;this.getAttributes=function(){return b===void 0&&E(this),b};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=s.getProgramParameter(_,r0)),N},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=a0++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=M,this.fragmentShader=A,this}var w0=0,Wl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new $l(e),t.set(e,n)),n}},$l=class{constructor(e){this.id=w0++,this.code=e,this.usedTimes=0}};function C0(i){return i===di||i===Qs||i===er}function R0(i,e,t,n,s,r){let a=new Ps,o=new Wl,l=new Set,c=[],u=new Map,d=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(g){return l.add(g),g===0?"uv":`uv${g}`}function _(g,b,N,R,I,U){let V=R.fog,C=I.geometry,O=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?R.environment:null,X=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,F=e.get(g.envMap||O,X),ie=h[g.type],G=n.precision;g.precision!==null&&(G=n.getMaxPrecision(g.precision),G!==g.precision&&Be("WebGLProgram.getParameters:",g.precision,"not supported, using",G,"instead."));let ee=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,se=ee!==void 0?ee.length:0,Se=0;C.morphAttributes.position!==void 0&&(Se=1),C.morphAttributes.normal!==void 0&&(Se=2),C.morphAttributes.color!==void 0&&(Se=3);let Te,Z,q,Q;if(ie){let ye=In[ie];Te=ye.vertexShader,Z=ye.fragmentShader}else{Te=g.vertexShader,Z=g.fragmentShader;let ye=o.getVertexShaderStage(g),rt=o.getFragmentShaderStage(g);o.update(g,ye,rt),q=ye.id,Q=rt.id}let fe=i.getRenderTarget(),oe=i.state.buffers.depth.getReversed(),Pe=I.isInstancedMesh===!0,tt=I.isBatchedMesh===!0,Re=!!g.map,H=!!g.matcap,te=!!F,pe=te&&F.isPMREMTexture===!0,Ne=!!g.aoMap,Je=!!g.lightMap,at=!!g.bumpMap&&g.wireframe===!1,Oe=!!g.normalMap,mt=!!g.displacementMap,ht=!!g.emissiveMap,ut=!!g.metalnessMap,lt=!!g.roughnessMap,Lt=g.anisotropy>0,D=g.clearcoat>0,Mt=g.diffuseRoughness>0,nt=g.dispersion>0,st=g.retroreflectivity>0,xe=g.iridescence>0,St=g.sheen>0,Fe=g.transmission>0,He=Lt&&!!g.anisotropyMap,T=D&&!!g.clearcoatMap,x=D&&!!g.clearcoatNormalMap,z=D&&!!g.clearcoatRoughnessMap,re=Mt&&!!g.diffuseRoughnessMap,ne=xe&&!!g.iridescenceMap,ce=xe&&!!g.iridescenceThicknessMap,ge=St&&!!g.sheenColorMap,J=St&&!!g.sheenRoughnessMap,K=!!g.specularMap,ue=!!g.specularColorMap,P=!!g.specularIntensityMap,j=Fe&&!!g.transmissionMap,Y=Fe&&!!g.thicknessMap,de=!!g.gradientMap,le=!!g.alphaMap,he=g.alphaTest>0,Le=!!g.alphaHash,We=!!g.extensions,ae=Cn;g.toneMapped&&(fe===null||fe.isXRRenderTarget===!0)&&(ae=i.toneMapping);let Ue=pe?F.isCompressedCubeTexture?F.image[0].mipmaps:F.mipmaps:null,Ge={shaderID:ie,shaderType:g.type,shaderName:g.name,vertexShader:Te,fragmentShader:Z,defines:g.defines,customVertexShaderID:q,customFragmentShaderID:Q,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:G,batching:tt,batchingColor:tt&&I._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&I.instanceColor!==null,instancingMorph:Pe&&I.morphTexture!==null,outputColorSpace:fe===null?i.outputColorSpace:fe.isXRRenderTarget===!0?fe.texture.colorSpace:Ye.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:Re,matcap:H,envMap:te,envMapMode:te&&F.mapping,envMapPMREM:pe,envMapMaxLod:pe?Ue.length-1:null,envMapSize:pe?Ue[0].width:null,aoMap:Ne,lightMap:Je,bumpMap:at,normalMap:Oe,displacementMap:mt,emissiveMap:ht,normalMapObjectSpace:Oe&&g.normalMapType===kh,normalMapTangentSpace:Oe&&g.normalMapType===co,packedNormalMap:Oe&&g.normalMapType===co&&C0(g.normalMap.format),metalnessMap:ut,roughnessMap:lt,anisotropy:Lt,anisotropyMap:He,clearcoat:D,clearcoatMap:T,clearcoatNormalMap:x,clearcoatRoughnessMap:z,diffuseRoughness:Mt,diffuseRoughnessMap:re,dispersion:nt,retroreflection:st,iridescence:xe,iridescenceMap:ne,iridescenceThicknessMap:ce,sheen:St,sheenColorMap:ge,sheenRoughnessMap:J,specularMap:K,specularColorMap:ue,specularIntensityMap:P,transmission:Fe,transmissionMap:j,thicknessMap:Y,gradientMap:de,opaque:g.transparent===!1&&g.blending===os&&g.alphaToCoverage===!1,alphaMap:le,alphaTest:he,alphaHash:Le,combine:g.combine,mapUv:Re&&f(g.map.channel),aoMapUv:Ne&&f(g.aoMap.channel),lightMapUv:Je&&f(g.lightMap.channel),bumpMapUv:at&&f(g.bumpMap.channel),normalMapUv:Oe&&f(g.normalMap.channel),displacementMapUv:mt&&f(g.displacementMap.channel),emissiveMapUv:ht&&f(g.emissiveMap.channel),metalnessMapUv:ut&&f(g.metalnessMap.channel),roughnessMapUv:lt&&f(g.roughnessMap.channel),anisotropyMapUv:He&&f(g.anisotropyMap.channel),clearcoatMapUv:T&&f(g.clearcoatMap.channel),clearcoatNormalMapUv:x&&f(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:z&&f(g.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:re&&f(g.diffuseRoughnessMap.channel),iridescenceMapUv:ne&&f(g.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&f(g.iridescenceThicknessMap.channel),sheenColorMapUv:ge&&f(g.sheenColorMap.channel),sheenRoughnessMapUv:J&&f(g.sheenRoughnessMap.channel),specularMapUv:K&&f(g.specularMap.channel),specularColorMapUv:ue&&f(g.specularColorMap.channel),specularIntensityMapUv:P&&f(g.specularIntensityMap.channel),transmissionMapUv:j&&f(g.transmissionMap.channel),thicknessMapUv:Y&&f(g.thicknessMap.channel),alphaMapUv:le&&f(g.alphaMap.channel),vertexTangents:!!C.attributes.tangent&&(Oe||Lt),vertexNormals:!!C.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!C.attributes.uv&&(Re||le),fog:!!V,useFog:g.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||C.attributes.normal===void 0&&Oe===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:oe,skinning:I.isSkinnedMesh===!0,hasPositionAttribute:C.attributes.position!==void 0,morphTargets:C.morphAttributes.position!==void 0,morphNormals:C.morphAttributes.normal!==void 0,morphColors:C.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:Se,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:U.filter(ye=>ye.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:ae,decodeVideoTexture:Re&&g.map.isVideoTexture===!0&&Ye.getTransfer(g.map.colorSpace)===it,decodeVideoTextureEmissive:ht&&g.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(g.emissiveMap.colorSpace)===it,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===wn,flipSided:g.side===Xt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:We&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(We&&g.extensions.multiDraw===!0||tt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Ge.vertexUv1s=l.has(1),Ge.vertexUv2s=l.has(2),Ge.vertexUv3s=l.has(3),l.clear(),Ge}function v(g){let b=[];if(g.shaderID?b.push(g.shaderID):(b.push(g.customVertexShaderID),b.push(g.customFragmentShaderID)),g.defines!==void 0)for(let N in g.defines)b.push(N),b.push(g.defines[N]);return g.isRawShaderMaterial===!1&&(p(b,g),m(b,g),b.push(i.outputColorSpace)),b.push(g.customProgramCacheKey),b.join()}function p(g,b){g.push(b.precision),g.push(b.outputColorSpace),g.push(b.envMapMode),g.push(b.envMapPMREM),g.push(b.envMapMaxLod),g.push(b.envMapSize),g.push(b.mapUv),g.push(b.alphaMapUv),g.push(b.lightMapUv),g.push(b.aoMapUv),g.push(b.bumpMapUv),g.push(b.normalMapUv),g.push(b.displacementMapUv),g.push(b.emissiveMapUv),g.push(b.metalnessMapUv),g.push(b.roughnessMapUv),g.push(b.anisotropyMapUv),g.push(b.clearcoatMapUv),g.push(b.clearcoatNormalMapUv),g.push(b.clearcoatRoughnessMapUv),g.push(b.diffuseRoughnessMapUv),g.push(b.iridescenceMapUv),g.push(b.iridescenceThicknessMapUv),g.push(b.sheenColorMapUv),g.push(b.sheenRoughnessMapUv),g.push(b.specularMapUv),g.push(b.specularColorMapUv),g.push(b.specularIntensityMapUv),g.push(b.transmissionMapUv),g.push(b.thicknessMapUv),g.push(b.combine),g.push(b.fogExp2),g.push(b.sizeAttenuation),g.push(b.morphTargetsCount),g.push(b.numSunLights),g.push(b.numDirLights),g.push(b.numPointLights),g.push(b.numSpotLights),g.push(b.numSpotLightMaps),g.push(b.numHemiLights),g.push(b.numRectAreaLights),g.push(b.numSunLightShadows),g.push(b.numDirLightShadows),g.push(b.numPointLightShadows),g.push(b.numSpotLightShadows),g.push(b.numSpotLightShadowsWithMaps),g.push(b.numLightProbes),g.push(b.numLightProbeGrids),g.push(b.shadowMapType),g.push(b.toneMapping),g.push(b.numClippingPlanes),g.push(b.numClipIntersection),g.push(b.depthPacking)}function m(g,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.retroreflection&&a.enable(24),b.diffuseRoughness&&a.enable(25),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),b.packedNormalMap&&a.enable(22),b.vertexNormals&&a.enable(23),g.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),b.numLightProbeGrids>0&&a.enable(22),b.hasPositionAttribute&&a.enable(23),g.push(a.mask)}function S(g){let b=h[g.type],N;if(b){let R=In[b];N=eu.clone(R.uniforms)}else N=g.uniforms;return N}function w(g,b){let N=u.get(b);return N!==void 0?++N.usedTimes:(N=new A0(i,b,g,s),c.push(N),u.set(b,N)),N}function M(g){if(--g.usedTimes===0){let b=c.indexOf(g);c[b]=c[c.length-1],c.pop(),u.delete(g.cacheKey),g.destroy()}}function A(g){o.remove(g)}function E(){o.dispose()}return{getParameters:_,getProgramCacheKey:v,getUniforms:S,acquireProgram:w,releaseProgram:M,releaseShaderCache:A,programs:c,dispose:E}}function I0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function P0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function yu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Mu(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function o(h,f,_,v,p,m){let S=i[e];return S===void 0?(S={id:h.id,object:h,geometry:f,material:_,materialVariant:a(h),groupOrder:v,renderOrder:h.renderOrder,z:p,group:m},i[e]=S):(S.id=h.id,S.object=h,S.geometry=f,S.material=_,S.materialVariant=a(h),S.groupOrder=v,S.renderOrder=h.renderOrder,S.z=p,S.group=m),e++,S}function l(h,f,_,v,p,m,S){S.reversedDepth===!0&&(p=-p);let w=o(h,f,_,v,p,m);_.transmission>0?n.push(w):_.transparent===!0?s.push(w):t.push(w)}function c(h,f,_,v,p,m){let S=o(h,f,_,v,p,m);_.transmission>0?n.unshift(S):_.transparent===!0?s.unshift(S):t.unshift(S)}function u(h,f){t.length>1&&t.sort(h||P0),n.length>1&&n.sort(f||yu),s.length>1&&s.sort(f||yu)}function d(){for(let h=e,f=i.length;h<f;h++){let _=i[h];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:u}}function L0(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new Mu,i.set(n,[a])):s>=r.length?(a=new Mu,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function D0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new $,color:new Ze};break;case"SpotLight":t={position:new $,direction:new $,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new $,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new $,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new $,halfWidth:new $,halfHeight:new $};break}return i[e.id]=t,t}}}function N0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var U0=0;function F0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function O0(i){let e=new D0,t=N0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new $);let s=new $,r=new ft,a=new ft;function o(c){let u=0,d=0,h=0;for(let U=0;U<9;U++)n.probe[U].set(0,0,0);let f=0,_=0,v=0,p=0,m=0,S=0,w=0,M=0,A=0,E=0,g=0,b=0,N=0,R=0;c.sort(F0);for(let U=0,V=c.length;U<V;U++){let C=c[U],O=C.color,X=C.intensity,F=C.distance,ie=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===di?ie=C.shadow.map.texture:ie=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)u+=O.r*X,d+=O.g*X,h+=O.b*X;else if(C.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(C.sh.coefficients[G],X);R++}else if(C.isSunLight){let G=e.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let ee=C.shadow,se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize.copy(ee.mapSize).multiply(ee.getFrameExtents()),n.sunShadow[_]=se,n.sunShadowMap[_]=ie;let Se=ee.getViewportCount();for(let Te=0;Te<Se;Te++)n.sunShadowMatrix[v+Te]=ee.getMatrix(Te),n.sunShadowCascade[v+Te]=ee._cascadeData[Te];v+=Se,_++}n.sun[f]=G,f++}else if(C.isDirectionalLight){let G=e.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let ee=C.shadow,se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,n.directionalShadow[p]=se,n.directionalShadowMap[p]=ie,n.directionalShadowMatrix[p]=C.shadow.matrix,A++}n.directional[p]=G,p++}else if(C.isSpotLight){let G=e.get(C);G.position.setFromMatrixPosition(C.matrixWorld),G.color.copy(O).multiplyScalar(X),G.distance=F,G.coneCos=Math.cos(C.angle),G.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),G.decay=C.decay,n.spot[S]=G;let ee=C.shadow;if(C.map&&(n.spotLightMap[b]=C.map,b++,ee.updateMatrices(C),C.castShadow&&N++),n.spotLightMatrix[S]=ee.matrix,C.castShadow){let se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,n.spotShadow[S]=se,n.spotShadowMap[S]=ie,g++}S++}else if(C.isRectAreaLight){let G=e.get(C);G.color.copy(O).multiplyScalar(X),G.halfWidth.set(C.width*.5,0,0),G.halfHeight.set(0,C.height*.5,0),n.rectArea[w]=G,w++}else if(C.isPointLight){let G=e.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),G.distance=C.distance,G.decay=C.decay,C.castShadow){let ee=C.shadow,se=t.get(C);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,se.shadowCameraNear=ee.camera.near,se.shadowCameraFar=ee.camera.far,n.pointShadow[m]=se,n.pointShadowMap[m]=ie,n.pointShadowMatrix[m]=C.shadow.matrix,E++}n.point[m]=G,m++}else if(C.isHemisphereLight){let G=e.get(C);G.skyColor.copy(C.color).multiplyScalar(X),G.groundColor.copy(C.groundColor).multiplyScalar(X),n.hemi[M]=G,M++}}w>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Me.LTC_FLOAT_1,n.rectAreaLTC2=Me.LTC_FLOAT_2):(n.rectAreaLTC1=Me.LTC_HALF_1,n.rectAreaLTC2=Me.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let I=n.hash;(I.sunLength!==f||I.directionalLength!==p||I.pointLength!==m||I.spotLength!==S||I.rectAreaLength!==w||I.hemiLength!==M||I.numSunShadows!==_||I.numDirectionalShadows!==A||I.numPointShadows!==E||I.numSpotShadows!==g||I.numSpotMaps!==b||I.numLightProbes!==R)&&(n.sun.length=f,n.directional.length=p,n.spot.length=S,n.rectArea.length=w,n.point.length=m,n.hemi.length=M,n.sunShadow.length=_,n.sunShadowMap.length=_,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=A,n.directionalShadowMap.length=A,n.directionalShadowMatrix.length=A,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=g,n.spotShadowMap.length=g,n.spotLightMatrix.length=g+b-N,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=N,n.numLightProbes=R,I.sunLength=f,I.directionalLength=p,I.pointLength=m,I.spotLength=S,I.rectAreaLength=w,I.hemiLength=M,I.numSunShadows=_,I.numDirectionalShadows=A,I.numPointShadows=E,I.numSpotShadows=g,I.numSpotMaps=b,I.numLightProbes=R,n.version=U0++)}function l(c,u){let d=0,h=0,f=0,_=0,v=0,p=0,m=u.matrixWorldInverse;for(let S=0,w=c.length;S<w;S++){let M=c[S];if(M.isSunLight){let A=n.sun[d];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(m),d++}else if(M.isDirectionalLight){let A=n.directional[h];A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(m),h++}else if(M.isSpotLight){let A=n.spot[_];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(m),A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(m),_++}else if(M.isRectAreaLight){let A=n.rectArea[v];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(m),a.identity(),r.copy(M.matrixWorld),r.premultiply(m),a.extractRotation(r),A.halfWidth.set(M.width*.5,0,0),A.halfHeight.set(0,M.height*.5,0),A.halfWidth.applyMatrix4(a),A.halfHeight.applyMatrix4(a),v++}else if(M.isPointLight){let A=n.point[f];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(m),f++}else if(M.isHemisphereLight){let A=n.hemi[p];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(m),p++}}}return{setup:o,setupView:l,state:n}}function Su(i){let e=new O0(i),t=[],n=[],s=[];function r(d){u.camera=d,t.length=0,n.length=0,s.length=0}function a(d){d.isLightProbeGrid?s.push(d):t.push(d)}function o(d){n.push(d)}function l(){e.setup(t),s.sort((d,h)=>d.priority-h.priority||d.id-h.id)}function c(d){e.setupView(t,d)}let u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function B0(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Su(i),e.set(s,[o])):r>=a.length?(o=new Su(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var z0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,k0=`uniform sampler2D shadow_pass;
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
}`,H0=[new $(1,0,0),new $(-1,0,0),new $(0,1,0),new $(0,-1,0),new $(0,0,1),new $(0,0,-1)],V0=[new $(0,-1,0),new $(0,-1,0),new $(0,0,1),new $(0,0,-1),new $(0,-1,0),new $(0,-1,0)],bu=new ft,nr=new $,zl=new $;function G0(i,e,t){let n=new oi,s=new je,r=new je,a=new pt,o=new ca,l=new ha,c={},u=t.maxTextureSize,d={[ui]:Xt,[Xt]:ui,[wn]:wn},h=new An({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new je},radius:{value:4}},vertexShader:z0,fragmentShader:k0}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let _=new dn;_.setAttribute("position",new bn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Kt(_,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=qs;let m=this.type;this.render=function(E,g,b){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;this.type===_h&&(Be("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=qs);let N=i.getRenderTarget(),R=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),U=i.state;U.setBlending(Si),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let V=m!==this.type;V&&g.traverse(function(C){C.material&&(Array.isArray(C.material)?C.material.forEach(O=>O.needsUpdate=!0):C.material.needsUpdate=!0)});for(let C=0,O=E.length;C<O;C++){let X=E[C],F=X.shadow;if(F===void 0){Be("WebGLShadowMap:",X,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;s.copy(F.mapSize);let ie=F.getFrameExtents();s.multiply(ie),r.copy(F.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ie.x),s.x=r.x*ie.x,F.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ie.y),s.y=r.y*ie.y,F.mapSize.y=r.y));let G=i.state.buffers.depth.getReversed();if(F.camera._reversedDepth=G,F.map===null||V===!0){if(F.map!==null&&(F.map.depthTexture!==null&&(F.map.depthTexture.dispose(),F.map.depthTexture=null),F.map.dispose()),this.type===as){if(X.isPointLight){Be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}F.map=new Jt(s.x,s.y,{format:di,type:mn,minFilter:Wt,magFilter:Wt,generateMipmaps:!1}),F.map.texture.name=X.name+".shadowMap",F.map.depthTexture=new Xn(s.x,s.y,pn),F.map.depthTexture.name=X.name+".shadowMapDepth",F.map.depthTexture.format=Wn,F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Pt,F.map.depthTexture.magFilter=Pt}else X.isPointLight?(F.map=new sr(s.x),F.map.depthTexture=new Os(s.x,fn)):(F.map=new Jt(s.x,s.y),F.map.depthTexture=new Xn(s.x,s.y,fn)),F.map.depthTexture.name=X.name+".shadowMap",F.map.depthTexture.format=Wn,this.type===qs?(F.map.depthTexture.compareFunction=G?El:bl,F.map.depthTexture.minFilter=Wt,F.map.depthTexture.magFilter=Wt):(F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Pt,F.map.depthTexture.magFilter=Pt);F.camera.updateProjectionMatrix()}F.map.isWebGLCubeRenderTarget!==!0&&(F.map.width!==s.x||F.map.height!==s.y)&&F.map.setSize(s.x,s.y);let ee=F.map.isWebGLCubeRenderTarget?6:F.getViewportCount();X.isPointLight!==!0&&F.updateMatrices(X,b);let se=(F.camera.layers.mask&4294967294)!==0?F.camera.layers:b.layers;for(let Se=0;Se<ee;Se++){let Te=F.getCamera(Se);if(X.isPointLight){let Z=F.camera,q=F.matrix,Q=X.distance||Z.far;Q!==Z.far&&(Z.far=Q,Z.updateProjectionMatrix()),nr.setFromMatrixPosition(X.matrixWorld),Z.position.copy(nr),zl.copy(Z.position),zl.add(H0[Se]),Z.up.copy(V0[Se]),Z.lookAt(zl),Z.updateMatrixWorld(),q.makeTranslation(-nr.x,-nr.y,-nr.z),bu.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),F._frustum.setFromProjectionMatrix(bu,Z.coordinateSystem,Z.reversedDepth)}if(F.map.isWebGLCubeRenderTarget)i.setRenderTarget(F.map,Se),i.clear();else{Se===0&&(i.setRenderTarget(F.map),i.clear());let Z=F.getViewport(Se);a.set(r.x*Z.x,r.y*Z.y,r.x*Z.z,r.y*Z.w),U.viewport(a)}n=F.getFrustum(Se),M(g,b,Te,X,se,this.type)}F.isPointLightShadow!==!0&&this.type===as&&S(F,b),F.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(N,R,I)};function S(E,g){let b=e.update(v);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new Jt(s.x,s.y,{format:di,type:mn}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),h.uniforms.shadow_pass.value=E.map.depthTexture,h.uniforms.resolution.value.set(E.map.width,E.map.height),h.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(g,null,b,h,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(g,null,b,f,v,null)}function w(E,g,b,N){let R=null,I=b.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(I!==void 0)R=I;else if(R=b.isPointLight===!0?l:o,i.localClippingEnabled&&g.clipShadows===!0&&Array.isArray(g.clippingPlanes)&&g.clippingPlanes.length!==0||g.displacementMap&&g.displacementScale!==0||g.alphaMap&&g.alphaTest>0||g.map&&g.alphaTest>0||g.alphaToCoverage===!0){let U=R.uuid,V=g.uuid,C=c[U];C===void 0&&(C={},c[U]=C);let O=C[V];O===void 0&&(O=R.clone(),C[V]=O,g.addEventListener("dispose",A)),R=O}if(R.visible=g.visible,R.wireframe=g.wireframe,N===as?R.side=g.shadowSide!==null?g.shadowSide:g.side:R.side=g.shadowSide!==null?g.shadowSide:d[g.side],R.alphaMap=g.alphaMap,R.alphaTest=g.alphaToCoverage===!0?.5:g.alphaTest,R.map=g.map,R.clipShadows=g.clipShadows,R.clippingPlanes=g.clippingPlanes,R.clipIntersection=g.clipIntersection,R.displacementMap=g.displacementMap,R.displacementScale=g.displacementScale,R.displacementBias=g.displacementBias,R.wireframeLinewidth=g.wireframeLinewidth,R.linewidth=g.linewidth,b.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let U=i.properties.get(R);U.light=b}return R}function M(E,g,b,N,R,I){if(E.visible===!1)return;if(E.layers.test(R)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&I===as)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,E.matrixWorld);let C=e.update(E),O=E.material;if(Array.isArray(O)){let X=C.groups;for(let F=0,ie=X.length;F<ie;F++){let G=X[F],ee=O[G.materialIndex];if(ee&&ee.visible){let se=w(E,ee,N,I);E.onBeforeShadow(i,E,g,b,C,se,G),i.renderBufferDirect(b,null,C,se,E,G),E.onAfterShadow(i,E,g,b,C,se,G)}}}else if(O.visible){let X=w(E,O,N,I);E.onBeforeShadow(i,E,g,b,C,X,null),i.renderBufferDirect(b,null,C,X,E,null),E.onAfterShadow(i,E,g,b,C,X,null)}}let V=E.children;for(let C=0,O=V.length;C<O;C++)M(V[C],g,b,N,R,I)}function A(E){E.target.removeEventListener("dispose",A);for(let b in c){let N=c[b],R=E.target.uuid;R in N&&(N[R].dispose(),delete N[R])}}}function W0(i,e){function t(){let P=!1,j=new pt,Y=null,de=new pt(0,0,0,0);return{setMask:function(le){Y!==le&&!P&&(i.colorMask(le,le,le,le),Y=le)},setLocked:function(le){P=le},setClear:function(le,he,Le,We,ae){ae===!0&&(le*=We,he*=We,Le*=We),j.set(le,he,Le,We),de.equals(j)===!1&&(i.clearColor(le,he,Le,We),de.copy(j))},reset:function(){P=!1,Y=null,de.set(-1,0,0,0)}}}function n(){let P=!1,j=!1,Y=null,de=null,le=null;return{setReversed:function(he){if(j!==he){let Le=e.get("EXT_clip_control");he?Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.ZERO_TO_ONE_EXT):Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.NEGATIVE_ONE_TO_ONE_EXT),j=he;let We=le;le=null,this.setClear(We)}},getReversed:function(){return j},setTest:function(he){he?oe(i.DEPTH_TEST):Pe(i.DEPTH_TEST)},setMask:function(he){Y!==he&&!P&&(i.depthMask(he),Y=he)},setFunc:function(he){if(j&&(he=Kh[he]),de!==he){switch(he){case Wr:i.depthFunc(i.NEVER);break;case $r:i.depthFunc(i.ALWAYS);break;case Xr:i.depthFunc(i.LESS);break;case Yi:i.depthFunc(i.LEQUAL);break;case qr:i.depthFunc(i.EQUAL);break;case Yr:i.depthFunc(i.GEQUAL);break;case Zr:i.depthFunc(i.GREATER);break;case Jr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}de=he}},setLocked:function(he){P=he},setClear:function(he){le!==he&&(le=he,j&&(he=1-he),i.clearDepth(he))},reset:function(){P=!1,Y=null,de=null,le=null,j=!1}}}function s(){let P=!1,j=null,Y=null,de=null,le=null,he=null,Le=null,We=null,ae=null;return{setTest:function(Ue){P||(Ue?oe(i.STENCIL_TEST):Pe(i.STENCIL_TEST))},setMask:function(Ue){j!==Ue&&!P&&(i.stencilMask(Ue),j=Ue)},setFunc:function(Ue,Ge,ye){(Y!==Ue||de!==Ge||le!==ye)&&(i.stencilFunc(Ue,Ge,ye),Y=Ue,de=Ge,le=ye)},setOp:function(Ue,Ge,ye){(he!==Ue||Le!==Ge||We!==ye)&&(i.stencilOp(Ue,Ge,ye),he=Ue,Le=Ge,We=ye)},setLocked:function(Ue){P=Ue},setClear:function(Ue){ae!==Ue&&(i.clearStencil(Ue),ae=Ue)},reset:function(){P=!1,j=null,Y=null,de=null,le=null,he=null,Le=null,We=null,ae=null}}}let r=new t,a=new n,o=new s,l={},c=new WeakMap,u={},d={},h={},f=new WeakMap,_=[],v=null,p=!1,m=null,S=null,w=null,M=null,A=null,E=null,g=null,b=new Ze(0,0,0),N=0,R=!1,I=null,U=null,V=null,C=null,O=null,X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),F=!1,ie=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(ie=parseFloat(/^WebGL (\d)/.exec(G)[1]),F=ie>=1):G.indexOf("OpenGL ES")!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),F=ie>=2);let ee=null,se={},Se=i.getParameter(i.SCISSOR_BOX),Te=i.getParameter(i.VIEWPORT),Z=new pt().fromArray(Se),q=new pt().fromArray(Te);function Q(P,j,Y,de){let le=new Uint8Array(4),he=i.createTexture();i.bindTexture(P,he),i.texParameteri(P,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(P,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Le=0;Le<Y;Le++)P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,de,0,i.RGBA,i.UNSIGNED_BYTE,le):i.texImage2D(j+Le,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,le);return he}let fe={};fe[i.TEXTURE_2D]=Q(i.TEXTURE_2D,i.TEXTURE_2D,1),fe[i.TEXTURE_CUBE_MAP]=Q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),fe[i.TEXTURE_2D_ARRAY]=Q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),fe[i.TEXTURE_3D]=Q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),oe(i.DEPTH_TEST),a.setFunc(Yi),at(!1),Oe(tl),oe(i.CULL_FACE),Ne(Si);function oe(P){u[P]!==!0&&(i.enable(P),u[P]=!0)}function Pe(P){u[P]!==!1&&(i.disable(P),u[P]=!1)}function tt(P,j){return h[P]!==j?(i.bindFramebuffer(P,j),h[P]=j,P===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=j),P===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=j),!0):!1}function Re(P,j){let Y=_,de=!1;if(P){Y=f.get(j),Y===void 0&&(Y=[],f.set(j,Y));let le=P.textures;if(Y.length!==le.length||Y[0]!==i.COLOR_ATTACHMENT0){for(let he=0,Le=le.length;he<Le;he++)Y[he]=i.COLOR_ATTACHMENT0+he;Y.length=le.length,de=!0}}else Y[0]!==i.BACK&&(Y[0]=i.BACK,de=!0);de&&i.drawBuffers(Y)}function H(P){return v!==P?(i.useProgram(P),v=P,!0):!1}let te={[bi]:i.FUNC_ADD,[vh]:i.FUNC_SUBTRACT,[yh]:i.FUNC_REVERSE_SUBTRACT};te[Mh]=i.MIN,te[Sh]=i.MAX;let pe={[bh]:i.ZERO,[Eh]:i.ONE,[Th]:i.SRC_COLOR,[rl]:i.SRC_ALPHA,[Ph]:i.SRC_ALPHA_SATURATE,[Rh]:i.DST_COLOR,[wh]:i.DST_ALPHA,[Ah]:i.ONE_MINUS_SRC_COLOR,[al]:i.ONE_MINUS_SRC_ALPHA,[Ih]:i.ONE_MINUS_DST_COLOR,[Ch]:i.ONE_MINUS_DST_ALPHA,[Lh]:i.CONSTANT_COLOR,[Dh]:i.ONE_MINUS_CONSTANT_COLOR,[Nh]:i.CONSTANT_ALPHA,[Uh]:i.ONE_MINUS_CONSTANT_ALPHA};function Ne(P,j,Y,de,le,he,Le,We,ae,Ue){if(P===Si){p===!0&&(Pe(i.BLEND),p=!1);return}if(p===!1&&(oe(i.BLEND),p=!0),P!==xh){if(P!==m||Ue!==R){if((S!==bi||A!==bi)&&(i.blendEquation(i.FUNC_ADD),S=bi,A=bi),Ue)switch(P){case os:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case nl:i.blendFunc(i.ONE,i.ONE);break;case il:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case sl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ze("WebGLState: Invalid blending: ",P);break}else switch(P){case os:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case nl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case il:ze("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sl:ze("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ze("WebGLState: Invalid blending: ",P);break}w=null,M=null,E=null,g=null,b.set(0,0,0),N=0,m=P,R=Ue}return}le=le||j,he=he||Y,Le=Le||de,(j!==S||le!==A)&&(i.blendEquationSeparate(te[j],te[le]),S=j,A=le),(Y!==w||de!==M||he!==E||Le!==g)&&(i.blendFuncSeparate(pe[Y],pe[de],pe[he],pe[Le]),w=Y,M=de,E=he,g=Le),(We.equals(b)===!1||ae!==N)&&(i.blendColor(We.r,We.g,We.b,ae),b.copy(We),N=ae),m=P,R=!1}function Je(P,j){P.side===wn?Pe(i.CULL_FACE):oe(i.CULL_FACE);let Y=P.side===Xt;j&&(Y=!Y),at(Y),P.blending===os&&P.transparent===!1?Ne(Si):Ne(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),a.setFunc(P.depthFunc),a.setTest(P.depthTest),a.setMask(P.depthWrite),r.setMask(P.colorWrite);let de=P.stencilWrite;o.setTest(de),de&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),ht(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?oe(i.SAMPLE_ALPHA_TO_COVERAGE):Pe(i.SAMPLE_ALPHA_TO_COVERAGE)}function at(P){I!==P&&(P?i.frontFace(i.CW):i.frontFace(i.CCW),I=P)}function Oe(P){P!==mh?(oe(i.CULL_FACE),P!==U&&(P===tl?i.cullFace(i.BACK):P===gh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Pe(i.CULL_FACE),U=P}function mt(P){P!==V&&(F&&i.lineWidth(P),V=P)}function ht(P,j,Y){P?(oe(i.POLYGON_OFFSET_FILL),(C!==j||O!==Y)&&(C=j,O=Y,a.getReversed()&&(j=-j,Y=-Y),i.polygonOffset(j,Y))):Pe(i.POLYGON_OFFSET_FILL)}function ut(P){P?oe(i.SCISSOR_TEST):Pe(i.SCISSOR_TEST)}function lt(P){P===void 0&&(P=i.TEXTURE0+X-1),ee!==P&&(i.activeTexture(P),ee=P)}function Lt(P,j,Y){Y===void 0&&(ee===null?Y=i.TEXTURE0+X-1:Y=ee);let de=se[Y];de===void 0&&(de={type:void 0,texture:void 0},se[Y]=de),(de.type!==P||de.texture!==j)&&(ee!==Y&&(i.activeTexture(Y),ee=Y),i.bindTexture(P,j||fe[P]),de.type=P,de.texture=j)}function D(){let P=se[ee];P!==void 0&&P.type!==void 0&&(i.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function Mt(){try{i.compressedTexImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function nt(){try{i.compressedTexImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function st(){try{i.texSubImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function xe(){try{i.texSubImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function St(){try{i.compressedTexSubImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function Fe(){try{i.compressedTexSubImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function He(){try{i.texStorage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function T(){try{i.texStorage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function x(){try{i.texImage2D(...arguments)}catch(P){ze("WebGLState:",P)}}function z(){try{i.texImage3D(...arguments)}catch(P){ze("WebGLState:",P)}}function re(P){return d[P]!==void 0?d[P]:i.getParameter(P)}function ne(P,j){d[P]!==j&&(i.pixelStorei(P,j),d[P]=j)}function ce(P){Z.equals(P)===!1&&(i.scissor(P.x,P.y,P.z,P.w),Z.copy(P))}function ge(P){q.equals(P)===!1&&(i.viewport(P.x,P.y,P.z,P.w),q.copy(P))}function J(P,j){let Y=c.get(j);Y===void 0&&(Y=new WeakMap,c.set(j,Y));let de=Y.get(P);de===void 0&&(de=i.getUniformBlockIndex(j,P.name),i.uniformBlockBinding(j,de,de),Y.set(P,de))}function K(P,j,Y){let le=c.get(j).get(P);l[le]!==Y&&(i.bindBufferBase(i.UNIFORM_BUFFER,le,Y),l[le]=Y)}function ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},d={},ee=null,se={},h={},l={},f=new WeakMap,_=[],v=null,p=!1,m=null,S=null,w=null,M=null,A=null,E=null,g=null,b=new Ze(0,0,0),N=0,R=!1,I=null,U=null,V=null,C=null,O=null,Z.set(0,0,i.canvas.width,i.canvas.height),q.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:oe,disable:Pe,bindFramebuffer:tt,drawBuffers:Re,useProgram:H,setBlending:Ne,setMaterial:Je,setFlipSided:at,setCullFace:Oe,setLineWidth:mt,setPolygonOffset:ht,setScissorTest:ut,activeTexture:lt,bindTexture:Lt,unbindTexture:D,compressedTexImage2D:Mt,compressedTexImage3D:nt,texImage2D:x,texImage3D:z,pixelStorei:ne,getParameter:re,updateUBOMapping:J,uniformBlockBinding:K,texStorage2D:He,texStorage3D:T,texSubImage2D:st,texSubImage3D:xe,compressedTexSubImage2D:St,compressedTexSubImage3D:Fe,scissor:ce,viewport:ge,reset:ue}}function $0(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new je,u=new WeakMap,d=new Set,h,f=new WeakMap,_=new Set,v=new FinalizationRegistry(T=>_.delete(T)),p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(T,x){return p?new OffscreenCanvas(T,x):Ji("canvas")}function S(T,x,z){let re=1,ne=He(T);if((ne.width>z||ne.height>z)&&(re=z/Math.max(ne.width,ne.height)),re<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let ce=Math.floor(re*ne.width),ge=Math.floor(re*ne.height);h===void 0&&(h=m(ce,ge));let J=x?m(ce,ge):h;return J.width=ce,J.height=ge,J.getContext("2d").drawImage(T,0,0,ce,ge),Be("WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+ce+"x"+ge+")."),J}else return"data"in T&&Be("WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),T;return T}function w(T){return T.generateMipmaps}function M(T){i.generateMipmap(T)}function A(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(T,x,z,re,ne,ce=!1){if(T!==null){if(i[T]!==void 0)return i[T];Be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ge;re&&(ge=e.get("EXT_texture_norm16"),ge||Be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=x;if(x===i.RED&&(z===i.FLOAT&&(J=i.R32F),z===i.HALF_FLOAT&&(J=i.R16F),z===i.UNSIGNED_BYTE&&(J=i.R8),z===i.UNSIGNED_SHORT&&ge&&(J=ge.R16_EXT),z===i.SHORT&&ge&&(J=ge.R16_SNORM_EXT)),x===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.R8UI),z===i.UNSIGNED_SHORT&&(J=i.R16UI),z===i.UNSIGNED_INT&&(J=i.R32UI),z===i.BYTE&&(J=i.R8I),z===i.SHORT&&(J=i.R16I),z===i.INT&&(J=i.R32I)),x===i.RG&&(z===i.FLOAT&&(J=i.RG32F),z===i.HALF_FLOAT&&(J=i.RG16F),z===i.UNSIGNED_BYTE&&(J=i.RG8),z===i.UNSIGNED_SHORT&&ge&&(J=ge.RG16_EXT),z===i.SHORT&&ge&&(J=ge.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.RG8UI),z===i.UNSIGNED_SHORT&&(J=i.RG16UI),z===i.UNSIGNED_INT&&(J=i.RG32UI),z===i.BYTE&&(J=i.RG8I),z===i.SHORT&&(J=i.RG16I),z===i.INT&&(J=i.RG32I)),x===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.RGB8UI),z===i.UNSIGNED_SHORT&&(J=i.RGB16UI),z===i.UNSIGNED_INT&&(J=i.RGB32UI),z===i.BYTE&&(J=i.RGB8I),z===i.SHORT&&(J=i.RGB16I),z===i.INT&&(J=i.RGB32I)),x===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),z===i.UNSIGNED_INT&&(J=i.RGBA32UI),z===i.BYTE&&(J=i.RGBA8I),z===i.SHORT&&(J=i.RGBA16I),z===i.INT&&(J=i.RGBA32I)),x===i.RGB&&(z===i.UNSIGNED_SHORT&&ge&&(J=ge.RGB16_EXT),z===i.SHORT&&ge&&(J=ge.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),x===i.RGBA){let K=ce?Rs:Ye.getTransfer(ne);z===i.FLOAT&&(J=i.RGBA32F),z===i.HALF_FLOAT&&(J=i.RGBA16F),z===i.UNSIGNED_BYTE&&(J=K===it?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&ge&&(J=ge.RGBA16_EXT),z===i.SHORT&&ge&&(J=ge.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function g(T,x){let z;return T?x===null||x===fn||x===Ti?z=i.DEPTH24_STENCIL8:x===pn?z=i.DEPTH32F_STENCIL8:x===cs&&(z=i.DEPTH24_STENCIL8,Be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===fn||x===Ti?z=i.DEPTH_COMPONENT24:x===pn?z=i.DEPTH_COMPONENT32F:x===cs&&(z=i.DEPTH_COMPONENT16),z}function b(T,x){return w(T)===!0||T.isFramebufferTexture&&T.minFilter!==Pt&&T.minFilter!==Wt?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function N(T){let x=new WeakRef(T);n.get(T).__ref=x,_.add(x),v.register(T,x,x)}function R(T){let x=n.get(T).__ref;x!==void 0&&(_.delete(x),v.unregister(x))}function I(T){V(T.target)}function U(T){C(T.target)}function V(T){T.removeEventListener("dispose",I),R(T),X(T),T.isVideoTexture&&u.delete(T),T.isHTMLTexture&&d.delete(T)}function C(T){T.removeEventListener("dispose",U),R(T),ie(T)}function O(){for(let T of _){let x=T.deref();x!==void 0&&(x.isRenderTarget===!0?C(x):V(x))}_.clear(),d.clear()}function X(T){let x=n.get(T);if(x.__webglInit===void 0)return;let z=T.source,re=f.get(z);if(re){let ne=re[x.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&F(T),Object.keys(re).length===0&&f.delete(z)}n.remove(T)}function F(T){let x=n.get(T);i.deleteTexture(x.__webglTexture);let z=T.source,re=f.get(z);delete re[x.__cacheKey],a.memory.textures--}function ie(T){let x=n.get(T);x.__depthDisposeCallback&&x.__depthDisposeCallback();let z=T.depthTexture;if(z&&z.renderTarget===T&&V(z),T.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(x.__webglFramebuffer[ne]))for(let ce=0;ce<x.__webglFramebuffer[ne].length;ce++)i.deleteFramebuffer(x.__webglFramebuffer[ne][ce]);else i.deleteFramebuffer(x.__webglFramebuffer[ne]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[ne])}else{if(Array.isArray(x.__webglFramebuffer))for(let ne=0;ne<x.__webglFramebuffer.length;ne++)i.deleteFramebuffer(x.__webglFramebuffer[ne]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let ne=0;ne<x.__webglColorRenderbuffer.length;ne++)x.__webglColorRenderbuffer[ne]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[ne]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let re=T.textures;for(let ne=0,ce=re.length;ne<ce;ne++){let ge=n.get(re[ne]);ge.__webglTexture&&(i.deleteTexture(ge.__webglTexture),a.memory.textures--),n.remove(re[ne])}n.remove(T)}let G=0;function ee(){G=0}function se(){return G}function Se(T){G=T}function Te(){let T=G;return T>=s.maxTextures&&Be("WebGLTextures: Trying to use "+(T+1)+" texture units while this GPU supports only "+s.maxTextures),G+=1,T}function Z(T){let x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.mipmapsAutoUpdate),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function q(T,x){let z=n.get(T);if(T.isVideoTexture&&St(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&z.__version!==T.version){let re=T.image;if(re===null)Be("WebGLRenderer: Texture marked for update but no image data found.");else if(re.complete===!1)Be("WebGLRenderer: Texture marked for update but image is incomplete");else{Je(z,T,x);return}}else T.isExternalTexture&&(z.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+x)}function Q(T,x){let z=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&z.__version!==T.version){Je(z,T,x);return}else T.isExternalTexture&&(z.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+x)}function fe(T,x){let z=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&z.__version!==T.version){Je(z,T,x);return}t.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+x)}function oe(T,x){let z=n.get(T);if(T.version>0&&z.__version!==T.version){at(z,T,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+x)}let Pe={[Kr]:i.REPEAT,[Sn]:i.CLAMP_TO_EDGE,[jr]:i.MIRRORED_REPEAT},tt={[Pt]:i.NEAREST,[Bh]:i.NEAREST_MIPMAP_NEAREST,[Ys]:i.NEAREST_MIPMAP_LINEAR,[Wt]:i.LINEAR,[Aa]:i.LINEAR_MIPMAP_NEAREST,[qn]:i.LINEAR_MIPMAP_LINEAR},Re={[Vh]:i.NEVER,[Tl]:i.ALWAYS,[Gh]:i.LESS,[bl]:i.LEQUAL,[Wh]:i.EQUAL,[El]:i.GEQUAL,[$h]:i.GREATER,[Xh]:i.NOTEQUAL};function H(T,x){if(x.type===pn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Wt||x.magFilter===Aa||x.magFilter===Ys||x.magFilter===qn||x.minFilter===Wt||x.minFilter===Aa||x.minFilter===Ys||x.minFilter===qn)&&Be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,Pe[x.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,Pe[x.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,Pe[x.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,tt[x.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,tt[x.minFilter]),x.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Re[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Pt||x.minFilter!==Ys&&x.minFilter!==qn||x.type===pn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function te(T,x){let z=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",I),N(x));let re=x.source,ne=f.get(re);ne===void 0&&(ne={},f.set(re,ne));let ce=Z(x);if(ce!==T.__cacheKey){ne[ce]===void 0&&(ne[ce]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,z=!0),ne[ce].usedTimes++;let ge=ne[T.__cacheKey];ge!==void 0&&(ne[T.__cacheKey].usedTimes--,ge.usedTimes===0&&F(x)),T.__cacheKey=ce,T.__webglTexture=ne[ce].texture}return z}function pe(T,x,z){return Math.floor(Math.floor(T/z)/x)}function Ne(T,x,z,re){let ce=T.updateRanges;if(ce.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,z,re,x.data);else{ce.sort((P,j)=>P.start-j.start);let ge=0;for(let P=1;P<ce.length;P++){let j=ce[ge],Y=ce[P],de=j.start+j.count,le=pe(Y.start,x.width,4),he=pe(j.start,x.width,4);Y.start<=de+1&&le===he&&pe(Y.start+Y.count-1,x.width,4)===le?j.count=Math.max(j.count,Y.start+Y.count-j.start):(++ge,ce[ge]=Y)}ce.length=ge+1;let J=t.getParameter(i.UNPACK_ROW_LENGTH),K=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let P=0,j=ce.length;P<j;P++){let Y=ce[P],de=Math.floor(Y.start/4),le=Math.ceil(Y.count/4),he=de%x.width,Le=Math.floor(de/x.width),We=le,ae=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,he),t.pixelStorei(i.UNPACK_SKIP_ROWS,Le),t.texSubImage2D(i.TEXTURE_2D,0,he,Le,We,ae,z,re,x.data)}T.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,K),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function Je(T,x,z){let re=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(re=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(re=i.TEXTURE_3D);let ne=te(T,x),ce=x.source;t.bindTexture(re,T.__webglTexture,i.TEXTURE0+z);let ge=n.get(ce);if(ce.version!==ge.__version||ne===!0){if(t.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let ae=Ye.getPrimaries(Ye.workingColorSpace),Ue=x.colorSpace===Zn?null:Ye.getPrimaries(x.colorSpace),Ge=x.colorSpace===Zn||ae===Ue?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let K=S(x.image,!1,s.maxTextureSize);K=Fe(x,K);let ue=r.convert(x.format,x.colorSpace),P=r.convert(x.type),j=E(x.internalFormat,ue,P,x.normalized,x.colorSpace,x.isVideoTexture);H(re,x);let Y,de=x.mipmaps,le=x.isVideoTexture!==!0,he=ge.__version===void 0||ne===!0,Le=ce.dataReady,We=b(x,K);if(x.isDepthTexture)j=g(x.format===Yn,x.type),he&&(le?t.texStorage2D(i.TEXTURE_2D,1,j,K.width,K.height):t.texImage2D(i.TEXTURE_2D,0,j,K.width,K.height,0,ue,P,null));else if(x.isDataTexture)if(de.length>0){le&&he&&t.texStorage2D(i.TEXTURE_2D,We,j,de[0].width,de[0].height);for(let ae=0,Ue=de.length;ae<Ue;ae++)Y=de[ae],le?Le&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Y.width,Y.height,ue,P,Y.data):t.texImage2D(i.TEXTURE_2D,ae,j,Y.width,Y.height,0,ue,P,Y.data);x.generateMipmaps=!1}else le?(he&&t.texStorage2D(i.TEXTURE_2D,We,j,K.width,K.height),Le&&Ne(x,K,ue,P)):t.texImage2D(i.TEXTURE_2D,0,j,K.width,K.height,0,ue,P,K.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){le&&he&&t.texStorage3D(i.TEXTURE_2D_ARRAY,We,j,de[0].width,de[0].height,K.depth);for(let ae=0,Ue=de.length;ae<Ue;ae++)if(Y=de[ae],x.format!==gn)if(ue!==null)if(le){if(Le)if(x.layerUpdates.size>0){let Ge=Ll(Y.width,Y.height,x.format,x.type);for(let ye of x.layerUpdates){let rt=Y.data.subarray(ye*Ge/Y.data.BYTES_PER_ELEMENT,(ye+1)*Ge/Y.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,ye,Y.width,Y.height,1,ue,rt)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,Y.width,Y.height,K.depth,ue,Y.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,j,Y.width,Y.height,K.depth,0,Y.data,0,0);else Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else le?Le&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,Y.width,Y.height,K.depth,ue,P,Y.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,j,Y.width,Y.height,K.depth,0,ue,P,Y.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{le&&he&&t.texStorage2D(i.TEXTURE_2D,We,j,de[0].width,de[0].height);for(let ae=0,Ue=de.length;ae<Ue;ae++)Y=de[ae],x.format!==gn?ue!==null?le?Le&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,Y.width,Y.height,ue,Y.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,j,Y.width,Y.height,0,Y.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):le?Le&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Y.width,Y.height,ue,P,Y.data):t.texImage2D(i.TEXTURE_2D,ae,j,Y.width,Y.height,0,ue,P,Y.data)}else if(x.isDataArrayTexture)if(le){if(he&&t.texStorage3D(i.TEXTURE_2D_ARRAY,We,j,K.width,K.height,K.depth),Le)if(x.layerUpdates.size>0){let ae=Ll(K.width,K.height,x.format,x.type);for(let Ue of x.layerUpdates){let Ge=K.data.subarray(Ue*ae/K.data.BYTES_PER_ELEMENT,(Ue+1)*ae/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ue,K.width,K.height,1,ue,P,Ge)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,ue,P,K.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,j,K.width,K.height,K.depth,0,ue,P,K.data);else if(x.isData3DTexture)le?(he&&t.texStorage3D(i.TEXTURE_3D,We,j,K.width,K.height,K.depth),Le&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,ue,P,K.data)):t.texImage3D(i.TEXTURE_3D,0,j,K.width,K.height,K.depth,0,ue,P,K.data);else if(x.isFramebufferTexture){if(he)if(le)t.texStorage2D(i.TEXTURE_2D,We,j,K.width,K.height);else{let ae=K.width,Ue=K.height;for(let Ge=0;Ge<We;Ge++)t.texImage2D(i.TEXTURE_2D,Ge,j,ae,Ue,0,ue,P,null),ae>>=1,Ue>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let ae=i.canvas;if(ae.hasAttribute("layoutsubtree")||ae.setAttribute("layoutsubtree","true"),K.parentNode!==ae){ae.appendChild(K),d.add(x),ae.onpaint=Ue=>{let Ge=Ue.changedElements;for(let ye of d)Ge.includes(ye.image)&&(ye.needsUpdate=!0)},ae.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,K);else{let Ge=i.RGBA,ye=i.RGBA,rt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ge,ye,rt,K)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(de.length>0){if(le&&he){let ae=He(de[0]);t.texStorage2D(i.TEXTURE_2D,We,j,ae.width,ae.height)}for(let ae=0,Ue=de.length;ae<Ue;ae++)Y=de[ae],le?Le&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,ue,P,Y):t.texImage2D(i.TEXTURE_2D,ae,j,ue,P,Y);x.generateMipmaps=!1}else if(le){if(he){let ae=He(K);t.texStorage2D(i.TEXTURE_2D,We,j,ae.width,ae.height)}Le&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,P,K)}else t.texImage2D(i.TEXTURE_2D,0,j,ue,P,K);w(x)&&x.mipmapsAutoUpdate===!0&&M(re),ge.__version=ce.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function at(T,x,z){if(x.image.length!==6)return;let re=te(T,x),ne=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+z);let ce=n.get(ne);if(ne.version!==ce.__version||re===!0){t.activeTexture(i.TEXTURE0+z);let ge=Ye.getPrimaries(Ye.workingColorSpace),J=x.colorSpace===Zn?null:Ye.getPrimaries(x.colorSpace),K=x.colorSpace===Zn||ge===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let ue=x.isCompressedTexture||x.image[0].isCompressedTexture,P=x.image[0]&&x.image[0].isDataTexture,j=[];for(let ye=0;ye<6;ye++)!ue&&!P?j[ye]=S(x.image[ye],!0,s.maxCubemapSize):j[ye]=P?x.image[ye].image:x.image[ye],j[ye]=Fe(x,j[ye]);let Y=j[0],de=r.convert(x.format,x.colorSpace),le=r.convert(x.type),he=E(x.internalFormat,de,le,x.normalized,x.colorSpace),Le=x.isVideoTexture!==!0,We=ce.__version===void 0||re===!0,ae=ne.dataReady,Ue=b(x,Y);H(i.TEXTURE_CUBE_MAP,x);let Ge;if(x.isDepthTexture){if(he=g(x.format===Yn,x.type),We)if(Le)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,he,Y.width,Y.height);else for(let ye=0;ye<6;ye++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,he,Y.width,Y.height,0,de,le,null)}else if(ue){Le&&We&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ue,he,Y.width,Y.height);for(let ye=0;ye<6;ye++){Ge=j[ye].mipmaps;for(let rt=0;rt<Ge.length;rt++){let Tt=Ge[rt];x.format!==gn?de!==null?Le?ae&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt,0,0,Tt.width,Tt.height,de,Tt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt,he,Tt.width,Tt.height,0,Tt.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt,0,0,Tt.width,Tt.height,de,le,Tt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt,he,Tt.width,Tt.height,0,de,le,Tt.data)}}}else{if(Ge=x.mipmaps,Le&&We){Ge.length>0&&Ue++;let ye=He(j[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ue,he,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(P){Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,j[ye].width,j[ye].height,de,le,j[ye].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,he,j[ye].width,j[ye].height,0,de,le,j[ye].data);for(let rt=0;rt<Ge.length;rt++){let Kn=Ge[rt].image[ye].image;Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt+1,0,0,Kn.width,Kn.height,de,le,Kn.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt+1,he,Kn.width,Kn.height,0,de,le,Kn.data)}}else{Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,de,le,j[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,he,de,le,j[ye]);for(let rt=0;rt<Ge.length;rt++){let Tt=Ge[rt];Le?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt+1,0,0,de,le,Tt.image[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,rt+1,he,de,le,Tt.image[ye])}}}w(x)&&x.mipmapsAutoUpdate===!0&&M(i.TEXTURE_CUBE_MAP),ce.__version=ne.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function Oe(T,x,z,re,ne,ce){let ge=r.convert(z.format,z.colorSpace),J=r.convert(z.type),K=E(z.internalFormat,ge,J,z.normalized,z.colorSpace),ue=n.get(x),P=n.get(z);if(P.__renderTarget=x,!ue.__hasExternalTextures){let j=Math.max(1,x.width>>ce),Y=Math.max(1,x.height>>ce);ne===i.TEXTURE_3D||ne===i.TEXTURE_2D_ARRAY?t.texImage3D(ne,ce,K,j,Y,x.depth,0,ge,J,null):t.texImage2D(ne,ce,K,j,Y,0,ge,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),xe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,re,ne,P.__webglTexture,0,st(x)):(ne===i.TEXTURE_2D||ne>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,re,ne,P.__webglTexture,ce),t.bindFramebuffer(i.FRAMEBUFFER,null)}function mt(T,x,z){if(i.bindRenderbuffer(i.RENDERBUFFER,T),x.depthBuffer){let re=x.depthTexture,ne=re&&re.isDepthTexture?re.type:null,ce=g(x.stencilBuffer,ne),ge=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;xe(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,st(x),ce,x.width,x.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,st(x),ce,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ce,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ge,i.RENDERBUFFER,T)}else{let re=x.textures;for(let ne=0;ne<re.length;ne++){let ce=re[ne],ge=r.convert(ce.format,ce.colorSpace),J=r.convert(ce.type),K=E(ce.internalFormat,ge,J,ce.normalized,ce.colorSpace);xe(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,st(x),K,x.width,x.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,st(x),K,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,K,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ht(T,x,z){let re=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ne=n.get(x.depthTexture);ne.__renderTarget=x;let ce=re?x.depthTexture.image[0]:x.depthTexture.image;(!ne.__webglTexture||ce.width!==x.width||ce.height!==x.height)&&(ce.width=x.width,ce.height=x.height,x.depthTexture.needsUpdate=!0),re?oe(x.depthTexture,0):q(x.depthTexture,0);let ge=ne.__webglTexture,J=st(x),K=re?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,ue=x.depthTexture.format===Yn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Wn)xe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,K,ge,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,ue,K,ge,0);else if(x.depthTexture.format===Yn)xe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,K,ge,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,ue,K,ge,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ut(T){let x=n.get(T),z=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){let re=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),re){let ne=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,re.removeEventListener("dispose",ne)};re.addEventListener("dispose",ne),x.__depthDisposeCallback=ne}x.__boundDepthTexture=re}if(T.depthTexture&&!x.__autoAllocateDepthBuffer)if(z)for(let re=0;re<6;re++)ht(x.__webglFramebuffer[re],T,re);else T.texture.mipmaps.length>0?ht(x.__webglFramebuffer[0],T,0):ht(x.__webglFramebuffer,T,0);else if(z){x.__webglDepthbuffer=[];for(let re=0;re<6;re++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[re]),x.__webglDepthbuffer[re]===void 0)x.__webglDepthbuffer[re]=i.createRenderbuffer(),mt(x.__webglDepthbuffer[re],T,!1);else{let ne=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=x.__webglDepthbuffer[re];i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,ce)}}else if(T.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),mt(x.__webglDepthbuffer,T,!1);else{let ne=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,ce)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function lt(T,x,z){let re=n.get(T);x!==void 0&&Oe(re.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&ut(T)}function Lt(T){let x=T.texture,z=n.get(T),re=n.get(x);T.addEventListener("dispose",U),N(T);let ne=T.textures,ce=T.isWebGLCubeRenderTarget===!0,ge=ne.length>1;if(ge||(re.__webglTexture===void 0&&(re.__webglTexture=i.createTexture()),re.__version=x.version,a.memory.textures++),ce){z.__webglFramebuffer=[];for(let J=0;J<6;J++)if(x.mipmaps.length>0){z.__webglFramebuffer[J]=[];for(let K=0;K<x.mipmaps.length;K++)z.__webglFramebuffer[J][K]=i.createFramebuffer()}else z.__webglFramebuffer[J]=i.createFramebuffer()}else{if(x.mipmaps.length>0){z.__webglFramebuffer=[];for(let J=0;J<x.mipmaps.length;J++)z.__webglFramebuffer[J]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(ge)for(let J=0,K=ne.length;J<K;J++){let ue=n.get(ne[J]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&xe(T)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let J=0;J<ne.length;J++){let K=ne[J];z.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[J]);let ue=r.convert(K.format,K.colorSpace),P=r.convert(K.type),j=E(K.internalFormat,ue,P,K.normalized,K.colorSpace,T.isXRRenderTarget===!0),Y=st(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Y,j,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,z.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),mt(z.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ce){t.bindTexture(i.TEXTURE_CUBE_MAP,re.__webglTexture),H(i.TEXTURE_CUBE_MAP,x);for(let J=0;J<6;J++)if(x.mipmaps.length>0)for(let K=0;K<x.mipmaps.length;K++)Oe(z.__webglFramebuffer[J][K],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,K);else Oe(z.__webglFramebuffer[J],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);w(x)?M(i.TEXTURE_CUBE_MAP):x.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),t.unbindTexture()}else if(ge){for(let J=0,K=ne.length;J<K;J++){let ue=ne[J],P=n.get(ue),j=i.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(j=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(j,P.__webglTexture),H(j,ue),Oe(z.__webglFramebuffer,T,ue,i.COLOR_ATTACHMENT0+J,j,0),w(ue)&&M(j)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(J=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,re.__webglTexture),H(J,x),x.mipmaps.length>0)for(let K=0;K<x.mipmaps.length;K++)Oe(z.__webglFramebuffer[K],T,x,i.COLOR_ATTACHMENT0,J,K);else Oe(z.__webglFramebuffer,T,x,i.COLOR_ATTACHMENT0,J,0);w(x)?M(J):x.mipmaps.length>0&&i.texParameteri(J,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),t.unbindTexture()}T.depthBuffer&&ut(T)}function D(T){let x=T.textures;for(let z=0,re=x.length;z<re;z++){let ne=x[z];if(w(ne)&&ne.mipmapsAutoUpdate===!0){let ce=A(T),ge=n.get(ne).__webglTexture;t.bindTexture(ce,ge),M(ce),t.unbindTexture()}}}let Mt=[];function nt(T){if(T.samples>0){if(xe(T)===!1){let x=T.textures,z=T.width,re=T.height,ne=i.COLOR_BUFFER_BIT,ce=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ge=n.get(T),J=x.length>1;if(J)for(let ue=0;ue<x.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer),T.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let ue=0;ue<x.length;ue++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(ne|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(ne|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ue]);let P=n.get(x[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,P,0)}i.blitFramebuffer(0,0,z,re,0,0,z,re,ne,i.NEAREST),l===!0&&(Mt.length=0,Mt.push(i.COLOR_ATTACHMENT0+ue),T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&Mt.push(ce),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Mt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let ue=0;ue<x.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ue]);let P=n.get(x[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,P,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&l){let x=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function st(T){return Math.min(s.maxSamples,T.samples)}function xe(T){let x=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function St(T){let x=a.render.frame;u.get(T)!==x&&(u.set(T,x),T.update())}function Fe(T,x){let z=T.colorSpace,re=T.format,ne=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||z!==Cs&&z!==Zn&&(Ye.getTransfer(z)===it?(re!==gn||ne!==qt)&&Be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ze("WebGLTextures: Unsupported texture color space:",z)),x}function He(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=Te,this.resetTextureUnits=ee,this.getTextureUnits=se,this.setTextureUnits=Se,this.setTexture2D=q,this.setTexture2DArray=Q,this.setTexture3D=fe,this.setTextureCube=oe,this.rebindTextures=lt,this.setupRenderTarget=Lt,this.updateRenderTargetMipmap=D,this.updateMultisampleRenderTarget=nt,this.setupDepthRenderbuffer=ut,this.setupFrameBufferTexture=Oe,this.useMultisampledRTT=xe,this.dispose=O}function X0(i,e){function t(n,s=Zn){let r,a=Ye.getTransfer(s);if(n===qt)return i.UNSIGNED_BYTE;if(n===Ca)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ra)return i.UNSIGNED_SHORT_5_5_5_1;if(n===xl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===vl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===gl)return i.BYTE;if(n===_l)return i.SHORT;if(n===cs)return i.UNSIGNED_SHORT;if(n===wa)return i.INT;if(n===fn)return i.UNSIGNED_INT;if(n===pn)return i.FLOAT;if(n===mn)return i.HALF_FLOAT;if(n===yl)return i.ALPHA;if(n===Ml)return i.RGB;if(n===gn)return i.RGBA;if(n===Wn)return i.DEPTH_COMPONENT;if(n===Yn)return i.DEPTH_STENCIL;if(n===Sl)return i.RED;if(n===Ia)return i.RED_INTEGER;if(n===di)return i.RG;if(n===Pa)return i.RG_INTEGER;if(n===La)return i.RGBA_INTEGER;if(n===Zs||n===Js||n===Ks||n===js)if(a===it)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Zs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ks)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Zs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Js)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ks)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===js)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Da||n===Na||n===Ua||n===Fa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Da)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Na)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ua)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Fa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Oa||n===Ba||n===za||n===ka||n===Ha||n===Qs||n===Va)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Oa||n===Ba)return a===it?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===za)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ka)return r.COMPRESSED_R11_EAC;if(n===Ha)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Qs)return r.COMPRESSED_RG11_EAC;if(n===Va)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ga||n===Wa||n===$a||n===Xa||n===qa||n===Ya||n===Za||n===Ja||n===Ka||n===ja||n===Qa||n===eo||n===to||n===no)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ga)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Wa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===$a)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Xa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===qa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ya)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Za)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ja)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ka)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ja)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Qa)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===eo)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===to)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===no)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===io||n===so||n===ro)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===io)return a===it?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===so)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ro)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ao||n===oo||n===er||n===lo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===ao)return r.COMPRESSED_RED_RGTC1_EXT;if(n===oo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===er)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===lo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ti?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var q0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Y0=`
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

}`,Xl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Bs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new An({vertexShader:q0,fragmentShader:Y0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Kt(new zs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ql=class extends En{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,_=null,v=typeof XRWebGLBinding<"u",p=new Xl,m={},S=t.getContextAttributes(),w=null,M=null,A=[],E=[],g=new je,b=null,N=null,R=new Gt;R.viewport=new pt;let I=new Gt;I.viewport=new pt;let U=[R,I],V=new Sa,C=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let q=A[Z];return q===void 0&&(q=new Qi,A[Z]=q),q.getTargetRaySpace()},this.getControllerGrip=function(Z){let q=A[Z];return q===void 0&&(q=new Qi,A[Z]=q),q.getGripSpace()},this.getHand=function(Z){let q=A[Z];return q===void 0&&(q=new Qi,A[Z]=q),q.getHandSpace()};function X(Z){let q=E.indexOf(Z.inputSource);if(q===-1)return;let Q=A[q];Q!==void 0&&(Q.update(Z.inputSource,Z.frame,c||a),Q.dispatchEvent({type:Z.type,data:Z.inputSource}))}function F(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",F),s.removeEventListener("inputsourceschange",ie);for(let Z=0;Z<A.length;Z++){let q=E[Z];q!==null&&(E[Z]=null,A[Z].disconnect(q))}C=null,O=null,p.reset();for(let Z in m)delete m[Z];if(e.setRenderTarget(w),f=null,h=null,d=null,s=null,M=null,Te.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(g.width,g.height,!1),N!==null){let Z=N.camera;Z.fov=N.fov,Z.zoom=N.zoom,Z.updateProjectionMatrix(),N=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&Be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&Be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(w=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",F),s.addEventListener("inputsourceschange",ie),S.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(g),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let Q=null,fe=null,oe=null;S.depth&&(oe=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Q=S.stencil?Yn:Wn,fe=S.stencil?Ti:fn);let Pe={colorFormat:t.RGBA8,depthFormat:oe,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Pe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),M=new Jt(h.textureWidth,h.textureHeight,{format:gn,type:qt,depthTexture:new Xn(h.textureWidth,h.textureHeight,fe,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let Q={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,Q),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new Jt(f.framebufferWidth,f.framebufferHeight,{format:gn,type:qt,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Te.setContext(s),Te.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function ie(Z){for(let q=0;q<Z.removed.length;q++){let Q=Z.removed[q],fe=E.indexOf(Q);fe>=0&&(E[fe]=null,A[fe].disconnect(Q))}for(let q=0;q<Z.added.length;q++){let Q=Z.added[q],fe=E.indexOf(Q);if(fe===-1){for(let Pe=0;Pe<A.length;Pe++)if(Pe>=E.length){E.push(Q),fe=Pe;break}else if(E[Pe]===null){E[Pe]=Q,fe=Pe;break}if(fe===-1)break}let oe=A[fe];oe&&oe.connect(Q)}}function G(Z,q){q===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(q.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let q=Z.near,Q=Z.far;p.texture!==null&&(p.depthNear>0&&(q=p.depthNear),p.depthFar>0&&(Q=p.depthFar)),V.near=I.near=R.near=q,V.far=I.far=R.far=Q,(C!==V.near||O!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),C=V.near,O=V.far),V.layers.mask=Z.layers.mask|6,R.layers.mask=V.layers.mask&-5,I.layers.mask=V.layers.mask&-3;let fe=Z.parent,oe=V.cameras;G(V,fe);for(let Pe=0;Pe<oe.length;Pe++)G(oe[Pe],fe);V.projectionMatrix.copy(R.projectionMatrix),V.projectionMatrixInverse.copy(R.projectionMatrixInverse),N===null&&Z.isPerspectiveCamera&&(N={camera:Z,fov:Z.fov,zoom:Z.zoom}),ee(Z,V,fe)};function ee(Z,q,Q){Q===null?Z.matrix.copy(q.matrixWorld):(Z.matrix.copy(Q.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(q.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(q.projectionMatrix),Z.projectionMatrixInverse.copy(q.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=ea*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Z){l=Z,h!==null&&(h.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(V)},this.getCameraTexture=function(Z){return m[Z]};let se=null;function Se(Z,q){if(u=q.getViewerPose(c||a),_=q,u!==null){let Q=u.views;f!==null&&(e.setRenderTargetFramebuffer(M,f.framebuffer),e.setRenderTarget(M));let fe=!1;Q.length!==V.cameras.length&&(V.cameras.length=0,fe=!0);for(let Re=0;Re<Q.length;Re++){let H=Q[Re],te=null;if(f!==null)te=f.getViewport(H);else{let Ne=d.getViewSubImage(h,H);te=Ne.viewport,Re===0&&(e.setRenderTargetTextures(M,Ne.colorTexture,Ne.depthStencilTexture),e.setRenderTarget(M))}let pe=U[Re];pe===void 0&&(pe=new Gt,pe.layers.enable(Re),pe.viewport=new pt,U[Re]=pe),pe.matrix.fromArray(H.transform.matrix),pe.matrix.decompose(pe.position,pe.quaternion,pe.scale),pe.projectionMatrix.fromArray(H.projectionMatrix),pe.projectionMatrixInverse.copy(pe.projectionMatrix).invert(),pe.viewport.set(te.x,te.y,te.width,te.height),Re===0&&(V.matrix.copy(pe.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),fe===!0&&V.cameras.push(pe)}let oe=s.enabledFeatures;if(oe&&oe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=n.getBinding();let Re=d.getDepthInformation(Q[0]);Re&&Re.isValid&&Re.texture&&p.init(Re,s.renderState)}if(oe&&oe.includes("camera-access")&&v){e.state.unbindTexture(),d=n.getBinding();for(let Re=0;Re<Q.length;Re++){let H=Q[Re].camera;if(H){let te=m[H];te||(te=new Bs,m[H]=te);let pe=d.getCameraImage(H);te.sourceTexture=pe}}}}for(let Q=0;Q<A.length;Q++){let fe=E[Q],oe=A[Q];fe!==null&&oe!==void 0&&oe.update(fe,q,c||a)}se&&se(Z,q),q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:q}),_=null}let Te=new Eu;Te.setAnimationLoop(Se),this.setAnimationLoop=function(Z){se=Z},this.dispose=function(){}}},Z0=new ft,Nu=new ke;Nu.set(-1,0,0,0,1,0,0,0,1);function J0(i,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Rl(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,S,w,M){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),d(p,m)):m.isMeshPhongMaterial?(r(p,m),u(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),h(p,m),m.isMeshPhysicalMaterial&&f(p,m,M)):m.isMeshMatcapMaterial?(r(p,m),_(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),v(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(a(p,m),m.isLineDashedMaterial&&o(p,m)):m.isPointsMaterial?l(p,m,S,w):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Xt&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Xt&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let S=e.get(m),w=S.envMap,M=S.envMapRotation;w&&(p.envMap.value=w,p.envMapRotation.value.setFromMatrix4(Z0.makeRotationFromEuler(M)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Nu),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function a(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function o(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,S,w){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*S,p.scale.value=w*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function h(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,S){p.ior.value=m.ior,m.diffuseRoughness>0&&(p.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(p.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,p.diffuseRoughnessMapTransform))),m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Xt&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,p.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=S.texture,p.transmissionSamplerSize.value.set(S.width,S.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function _(p,m){m.matcap&&(p.matcap.value=m.matcap)}function v(p,m){let S=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(S.matrixWorld),p.nearDistance.value=S.shadow.camera.near,p.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function K0(i,e,t,n){let s={},r={};function a(S,w){let M=w.program;n.uniformBlockBinding(S,M,s[S.id])}function o(S,w){let M=s[S.id];M===void 0&&(_(S),M=l(S),s[S.id]=M,S.addEventListener("dispose",p));let A=w.program;n.updateUBOMapping(S,A);let E=e.render.frame;r[S.id]!==E&&(c(S),r[S.id]=E)}function l(S){let w=i.createBuffer(),M=S.__size,A=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,M,A),i.bindBuffer(i.UNIFORM_BUFFER,null),w}function c(S){let w=s[S.id],M=S.uniforms,A=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let E=0,g=M.length;E<g;E++){let b=M[E];if(Array.isArray(b))for(let N=0,R=b.length;N<R;N++)u(b[N],E,N,A);else u(b,E,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(S,w,M,A){if(h(S,w,M,A)===!0){let E=S.__offset,g=S.value;if(Array.isArray(g)){let b=0;for(let N=0;N<g.length;N++){let R=g[N],I=v(R,!0);d(R,S.__data,b),b+=I.storage/Float32Array.BYTES_PER_ELEMENT}}else d(g,S.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,E,S.__data)}}function d(S,w,M){typeof S=="number"||typeof S=="boolean"?w[M]=S:S.isMatrix3?(w[M]=S.elements[0],w[M+1]=S.elements[1],w[M+2]=S.elements[2],w[M+3]=0,w[M+4]=S.elements[3],w[M+5]=S.elements[4],w[M+6]=S.elements[5],w[M+7]=0,w[M+8]=S.elements[6],w[M+9]=S.elements[7],w[M+10]=S.elements[8],w[M+11]=0):ArrayBuffer.isView(S)?w.set(S.subarray(0,w.length-M),M):S.toArray(w,M)}function h(S,w,M,A){let E=S.value,g=w+"_"+M;if(Array.isArray(E)){A[g]===void 0&&(A[g]=[]);let b=A[g],N=!1;for(let R=0;R<E.length;R++)f(E[R],b,R)===!0&&(N=!0);return N}return f(E,A,g)}function f(S,w,M){if(w[M]===void 0)return typeof S=="number"||typeof S=="boolean"?w[M]=S:ArrayBuffer.isView(S)?w[M]=S.slice():w[M]=S.clone(),!0;{let A=w[M];if(typeof S=="number"||typeof S=="boolean"){if(A!==S)return w[M]=S,!0}else{if(ArrayBuffer.isView(S))return!0;if(A.equals(S)===!1)return A.copy(S),!0}}return!1}function _(S){let w=S.uniforms,M=0,A=16;for(let g=0,b=w.length;g<b;g++){let N=Array.isArray(w[g])?w[g]:[w[g]];for(let R=0,I=N.length;R<I;R++){let U=N[R],V=Array.isArray(U.value)?U.value:[U.value],C=Array.isArray(w[g])||Array.isArray(U.value),O=M;for(let F=0,ie=V.length;F<ie;F++){let G=V[F],ee=v(G,C),se=M%A,Se=se%ee.boundary,Te=se+Se;M+=Se,Te!==0&&A-Te<ee.storage&&(M+=A-Te),F===0&&(O=M),M+=ee.storage}let X=U.type==="int"?Int32Array:U.type==="uint"?Uint32Array:Float32Array;U.__data=new X((M-O)/Float32Array.BYTES_PER_ELEMENT),U.__offset=O}}let E=M%A;return E>0&&(M+=A-E),S.__size=M,S.__cache={},this}function v(S,w){let M={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(M.boundary=4,M.storage=4):S.isVector2?(M.boundary=8,M.storage=8):S.isVector3||S.isColor?(M.boundary=16,M.storage=12):S.isVector4?(M.boundary=16,M.storage=16):S.isMatrix3?(M.boundary=16,M.storage=48):S.isMatrix4?(M.boundary=16,M.storage=64):S.isTexture?Be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(M.boundary=16,M.storage=S.byteLength):Be("WebGLRenderer: Unsupported uniform value type.",S),w===!0&&(M.boundary=16,M.storage=Math.ceil(M.storage/16)*16),M}function p(S){let w=S.target;w.removeEventListener("dispose",p),i.deleteBuffer(s[w.id]),delete s[w.id],delete r[w.id]}function m(){for(let S in s)i.deleteBuffer(s[S]);s={},r={}}return{bind:a,update:o,dispose:m}}var j0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Rn=null;function Q0(){return Rn===null&&(Rn=new aa(j0,16,16,di,mn),Rn.name="DFG_LUT",Rn.minFilter=Wt,Rn.magFilter=Wt,Rn.wrapS=Sn,Rn.wrapT=Sn,Rn.generateMipmaps=!1,Rn.needsUpdate=!0),Rn}var po=class{constructor(e={}){let{canvas:t=Yh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:f=qt}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=a;let v=f,p=new Set([La,Pa,Ia]),m=new Set([qt,fn,cs,Ti,Ca,Ra]),S=new Uint32Array(4),w=new Int32Array(4),M={textures:[],min:[],max:[],resolution:[]},A=null,E=null,g=[],b=[],N=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Cn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,U=null,V=null,C=null,O=null;this._outputColorSpace=Rt;let X=0,F=0,ie=null,G=-1,ee=null,se=new pt,Se=new pt,Te=null,Z=new Ze(0),q=0,Q=t.width,fe=t.height,oe=1,Pe=null,tt=null,Re=new pt(0,0,Q,fe),H=new pt(0,0,Q,fe),te=!1,pe=new oi,Ne=new oa,Je=!1,at=!1,Oe=new ft,mt=new $,ht=new pt,ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},lt=!1;function Lt(){return ie===null?oe:1}let D=n;function Mt(y,L){return t.getContext(y,L)}let nt,st,xe,St,Fe,He,T,x,z,re,ne,ce,ge,J,K,ue,P,j,Y,de,le,he,Le;try{let y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Ue,!1),t.addEventListener("webglcontextrestored",Ge,!1),t.addEventListener("webglcontextcreationerror",ye,!1),D===null){let L="webgl2";if(D=Mt(L,y),D===null)throw Mt(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}We()}catch(y){throw t.removeEventListener("webglcontextlost",Ue,!1),t.removeEventListener("webglcontextrestored",Ge,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),ze("WebGLRenderer: "+y.message),y}function We(){nt=new hg(D),nt.init(),le=new X0(D,nt),st=new Qm(D,nt,e,le),xe=new W0(D,nt),st.reversedDepthBuffer&&h&&xe.buffers.depth.setReversed(!0),V=D.createFramebuffer(),C=D.createFramebuffer(),O=D.createFramebuffer(),St=new fg(D),Fe=new I0,He=new $0(D,nt,xe,Fe,st,le,St),T=new cg(R),x=new mf(D),he=new Km(D,x),z=new ug(D,x,St,he),re=new mg(D,z,x,he,St),j=new pg(D,st,He),K=new eg(Fe),ne=new R0(R,T,nt,st,he,K),ce=new J0(R,Fe),ge=new L0,J=new B0(nt),P=new Jm(R,T,xe,re,_,l),ue=new G0(R,re,st),Le=new K0(D,St,st,xe),Y=new jm(D,nt,St),de=new dg(D,nt,St),St.programs=ne.programs,R.capabilities=st,R.extensions=nt,R.properties=Fe,R.renderLists=ge,R.shadowMap=ue,R.state=xe,R.info=St}v!==qt&&(N=new _g(v,t.width,t.height,o,s,r));let ae=new ql(R,D);this.xr=ae,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let y=nt.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){let y=nt.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return oe},this.setPixelRatio=function(y){y!==void 0&&(oe=y,this.setSize(Q,fe,!1))},this.getSize=function(y){return y.set(Q,fe)},this.setSize=function(y,L,W=!0){if(ae.isPresenting){Be("WebGLRenderer: Can't change size while VR device is presenting.");return}Q=y,fe=L,t.width=Math.floor(y*oe),t.height=Math.floor(L*oe),W===!0&&(t.style.width=y+"px",t.style.height=L+"px"),N!==null&&N.setSize(t.width,t.height),this.setViewport(0,0,y,L)},this.getDrawingBufferSize=function(y){return y.set(Q*oe,fe*oe).floor()},this.setDrawingBufferSize=function(y,L,W){Q=y,fe=L,oe=W,t.width=Math.floor(y*W),t.height=Math.floor(L*W),this.setViewport(0,0,y,L)},this.setEffects=function(y){if(v===qt){ze("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let L=0;L<y.length;L++)if(y[L].isOutputPass===!0){Be("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}N.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(se)},this.getViewport=function(y){return y.copy(Re)},this.setViewport=function(y,L,W,B){y.isVector4?Re.set(y.x,y.y,y.z,y.w):Re.set(y,L,W,B),xe.viewport(se.copy(Re).multiplyScalar(Lt()).round())},this.getScissor=function(y){return y.copy(H)},this.setScissor=function(y,L,W,B){y.isVector4?H.set(y.x,y.y,y.z,y.w):H.set(y,L,W,B),xe.scissor(Se.copy(H).multiplyScalar(Lt()).round())},this.getScissorTest=function(){return te},this.setScissorTest=function(y){xe.setScissorTest(te=y)},this.setOpaqueSort=function(y){Pe=y},this.setTransparentSort=function(y){tt=y},this.getClearColor=function(y){return y.copy(P.getClearColor())},this.setClearColor=function(){P.setClearColor(...arguments)},this.getClearAlpha=function(){return P.getClearAlpha()},this.setClearAlpha=function(){P.setClearAlpha(...arguments)},this.clear=function(y=!0,L=!0,W=!0){let B=0;if(y){let k=!1;if(ie!==null){let _e=ie.texture.format;k=p.has(_e)}if(k){let _e=ie.texture.type,Ae=m.has(_e),me=P.getClearColor(),be=P.getClearAlpha(),Ie=me.r,Ve=me.g,Xe=me.b;Ae?(S[0]=Ie,S[1]=Ve,S[2]=Xe,S[3]=be,D.clearBufferuiv(D.COLOR,0,S)):(w[0]=Ie,w[1]=Ve,w[2]=Xe,w[3]=be,D.clearBufferiv(D.COLOR,0,w))}else B|=D.COLOR_BUFFER_BIT}L&&(B|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(B|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B!==0&&D.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),U=y},this.dispose=function(){t.removeEventListener("webglcontextlost",Ue,!1),t.removeEventListener("webglcontextrestored",Ge,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),P.dispose(),ge.dispose(),J.dispose(),He.dispose(),Fe.dispose(),T.dispose(),re.dispose(),z.dispose(),he.dispose(),Le.dispose(),ne.dispose(),ae.dispose(),ae.removeEventListener("sessionstart",jl),ae.removeEventListener("sessionend",Ql),fi.stop()};function Ue(y){y.preventDefault(),wl("WebGLRenderer: Context Lost."),I=!0}function Ge(){wl("WebGLRenderer: Context Restored."),I=!1;let y=St.autoReset,L=ue.enabled,W=ue.autoUpdate,B=ue.needsUpdate,k=ue.type;We(),St.autoReset=y,ue.enabled=L,ue.autoUpdate=W,ue.needsUpdate=B,ue.type=k}function ye(y){ze("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function rt(y){let L=y.target;L.removeEventListener("dispose",rt),Tt(L)}function Tt(y){Kn(y),Fe.remove(y)}function Kn(y){let L=Fe.get(y).programs;L!==void 0&&(L.forEach(function(W){ne.releaseProgram(W)}),y.isShaderMaterial&&ne.releaseShaderCache(y))}this.renderBufferDirect=function(y,L,W,B,k,_e){L===null&&(L=ut);let Ae=k.isMesh&&k.matrixWorld.determinantAffine()<0,me=ju(y,L,W,B,k);xe.setMaterial(B,Ae);let be=W.index,Ie=1;if(B.wireframe===!0){if(be=z.getWireframeAttribute(W),be===void 0)return;Ie=2}let Ve=W.drawRange,Xe=W.attributes.position,we=Ve.start*Ie,qe=(Ve.start+Ve.count)*Ie;_e!==null&&(we=Math.max(we,_e.start*Ie),qe=Math.min(qe,(_e.start+_e.count)*Ie)),be!==null?(we=Math.max(we,0),qe=Math.min(qe,be.count)):Xe!=null&&(we=Math.max(we,0),qe=Math.min(qe,Xe.count));let vt=qe-we;if(vt<0||vt===1/0)return;he.setup(k,B,me,W,be);let ct,ot=Y;if(be!==null&&(ct=x.get(be),ot=de,ot.setIndex(ct)),k.isMesh)B.wireframe===!0?(xe.setLineWidth(B.wireframeLinewidth*Lt()),ot.setMode(D.LINES)):ot.setMode(D.TRIANGLES);else if(k.isLine){let Ut=B.linewidth;Ut===void 0&&(Ut=1),xe.setLineWidth(Ut*Lt()),k.isLineSegments?ot.setMode(D.LINES):k.isLineLoop?ot.setMode(D.LINE_LOOP):ot.setMode(D.LINE_STRIP)}else k.isPoints?ot.setMode(D.POINTS):k.isSprite&&ot.setMode(D.TRIANGLES);if(k.isBatchedMesh)if(nt.get("WEBGL_multi_draw"))ot.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{let Ut=k._multiDrawStarts,Ce=k._multiDrawCounts,Vt=k._multiDrawCount,et=be?x.get(be).bytesPerElement:1,pi=Fe.get(B).currentProgram.getUniforms();for(let Ft=0;Ft<Vt;Ft++)pi.setValue(D,"_gl_DrawID",Ft),ot.render(Ut[Ft]/et,Ce[Ft])}else if(k.isInstancedMesh)ot.renderInstances(we,vt,k.count);else if(W.isInstancedBufferGeometry){let Ut=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Ce=Math.min(W.instanceCount,Ut);ot.renderInstances(we,vt,Ce)}else ot.render(we,vt)};function Kl(y,L,W,B){U!==null&&y.isNodeMaterial&&U.setObject(B,y),Je===!0&&K.setState(y,W,!1),y.transparent===!0&&y.side===wn&&y.forceSinglePass===!1?(y.side=Xt,y.needsUpdate=!0,fs(y,L,B),y.side=ui,y.needsUpdate=!0,fs(y,L,B),y.side=wn):fs(y,L,B)}this.compile=function(y,L,W=null){W===null&&(W=y),U!==null&&U.renderStart(y,L,W),E=J.get(W),E.init(L),b.push(E),W.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(E.pushLight(k),k.castShadow&&E.pushShadow(k))}),y!==W&&y.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(E.pushLight(k),k.castShadow&&E.pushShadow(k))}),E.setupLights(),U!==null&&U.updateLights(E.state.lightsArray),at=this.localClippingEnabled,Je=K.init(this.clippingPlanes,at),Je===!0&&K.setGlobalState(this.clippingPlanes,L),U!==null&&ue.render(E.state.shadowsArray,W,L);let B=new Set;return y.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;let _e=k.material;if(_e)if(Array.isArray(_e))for(let Ae=0;Ae<_e.length;Ae++){let me=_e[Ae];Kl(me,W,L,k),B.add(me)}else Kl(_e,W,L,k),B.add(_e)}),E=b.pop(),U!==null&&U.renderEnd(),B},this.compileAsync=function(y,L,W=null){let B=this.compile(y,L,W);return new Promise(k=>{function _e(){if(B.forEach(function(Ae){let be=Fe.get(Ae).currentProgram;(be===void 0||be.isReady())&&B.delete(Ae)}),B.size===0){k(y);return}setTimeout(_e,10)}nt.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let xo=null;function Ju(y){xo&&xo(y)}function jl(){fi.stop()}function Ql(){fi.start()}let fi=new Eu;fi.setAnimationLoop(Ju),typeof self<"u"&&fi.setContext(self),this.setAnimationLoop=function(y){xo=y,ae.setAnimationLoop(y),y===null?fi.stop():fi.start()},ae.addEventListener("sessionstart",jl),ae.addEventListener("sessionend",Ql),this.render=function(y,L){if(L!==void 0&&L.isCamera!==!0){ze("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;U!==null&&U.renderStart(y,L);let W=ae.enabled===!0&&ae.isPresenting===!0,B=N!==null&&(ie===null||W)&&N.begin(R,ie);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),ae.enabled===!0&&ae.isPresenting===!0&&(N===null||N.isCompositing()===!1)&&(ae.cameraAutoUpdate===!0&&ae.updateCamera(L),L=ae.getCamera()),y.isScene===!0&&y.onBeforeRender(R,y,L,ie),E=J.get(y,b.length),E.init(L),E.state.textureUnits=He.getTextureUnits(),b.push(E),Oe.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),L.isArrayCamera?Ne.setFromArrayCamera(L):pe.setFromProjectionMatrix(Oe,nn,L.reversedDepth),at=this.localClippingEnabled,Je=K.init(this.clippingPlanes,at),A=ge.get(y,g.length),A.init(),g.push(A),this.info.render.frame++,ae.enabled===!0&&ae.isPresenting===!0){let Ae=R.xr.getDepthSensingMesh();Ae!==null&&vo(Ae,L,-1/0,R.sortObjects)}vo(y,L,0,R.sortObjects),A.finish(),U!==null&&U.updateLights(E.state.lightsArray),R.sortObjects===!0&&A.sort(Pe,tt),lt=ae.enabled===!1||ae.isPresenting===!1||ae.hasDepthSensing()===!1,lt&&P.addToRenderList(A,y),this.info.autoReset===!0&&this.info.reset(),Je===!0&&K.beginShadows();let k=E.state.shadowsArray;if(ue.render(k,y,L),Je===!0&&K.endShadows(),(B&&N.hasRenderPass())===!1){let Ae=A.opaque,me=A.transmissive;if(E.setupLights(),L.isArrayCamera){let be=L.cameras;if(me.length>0)for(let Ie=0,Ve=be.length;Ie<Ve;Ie++){let Xe=be[Ie];tc(Ae,me,y,Xe)}lt&&P.render(y);for(let Ie=0,Ve=be.length;Ie<Ve;Ie++){let Xe=be[Ie];ec(A,y,Xe,Xe.viewport)}}else me.length>0&&tc(Ae,me,y,L),lt&&P.render(y),ec(A,y,L)}ie!==null&&F===0&&(He.updateMultisampleRenderTarget(ie),He.updateRenderTargetMipmap(ie)),B&&N.end(R),y.isScene===!0&&y.onAfterRender(R,y,L),he.resetDefaultState(),G=-1,ee=null,b.pop(),b.length>0?(E=b[b.length-1],He.setTextureUnits(E.state.textureUnits),Je===!0&&K.setGlobalState(R.clippingPlanes,E.state.camera)):E=null,g.pop(),g.length>0?A=g[g.length-1]:A=null,U!==null&&U.renderEnd()};function vo(y,L,W,B){if(y.visible===!1)return;if(y.layers.test(L.layers)){if(y.isGroup)W=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(L);else if(y.isLight)E.pushLight(y),y.castShadow&&E.pushShadow(y);else if(y.isSprite){let Ae=L.isArrayCamera?Ne:pe;if(!y.frustumCulled||y.intersectsFrustum(Ae)){B&&ht.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Oe);let me=re.update(y),be=y.material;be.visible&&A.push(y,me,be,W,ht.z,null,L)}}else if(y.isMesh||y.isLine||y.isPoints){let Ae=L.isArrayCamera?Ne:pe;if(!y.frustumCulled||y.intersectsFrustum(Ae)){let me=re.update(y),be=y.material;if(B&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),ht.copy(y.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),ht.copy(me.boundingSphere.center)),ht.applyMatrix4(y.matrixWorld).applyMatrix4(Oe)),Array.isArray(be)){let Ie=me.groups;for(let Ve=0,Xe=Ie.length;Ve<Xe;Ve++){let we=Ie[Ve],qe=be[we.materialIndex];qe&&qe.visible&&A.push(y,me,qe,W,ht.z,we,L)}}else be.visible&&A.push(y,me,be,W,ht.z,null,L)}}}let _e=y.children;for(let Ae=0,me=_e.length;Ae<me;Ae++)vo(_e[Ae],L,W,B)}function ec(y,L,W,B){let{opaque:k,transmissive:_e,transparent:Ae}=y;E.setupLightsView(W),Je===!0&&K.setGlobalState(R.clippingPlanes,W),B&&xe.viewport(se.copy(B)),k.length>0&&or(k,L,W),_e.length>0&&or(_e,L,W),Ae.length>0&&or(Ae,L,W),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function tc(y,L,W,B){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[B.id]===void 0){let we=nt.has("EXT_color_buffer_half_float")||nt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[B.id]=new Jt(1,1,{generateMipmaps:!0,type:we?mn:qt,minFilter:qn,samples:Math.max(4,st.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ye.workingColorSpace})}let _e=E.state.transmissionRenderTarget[B.id],Ae=B.viewport||se;_e.setSize(Ae.z*R.transmissionResolutionScale,Ae.w*R.transmissionResolutionScale);let me=R.getRenderTarget(),be=R.getActiveCubeFace(),Ie=R.getActiveMipmapLevel();R.setRenderTarget(_e),R.getClearColor(Z),q=R.getClearAlpha(),q<1&&R.setClearColor(16777215,.5),R.clear(),lt&&P.render(W);let Ve=R.toneMapping;R.toneMapping=Cn;let Xe=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),E.setupLightsView(B),Je===!0&&K.setGlobalState(R.clippingPlanes,B),or(y,W,B),He.updateMultisampleRenderTarget(_e),He.updateRenderTargetMipmap(_e),nt.has("WEBGL_multisampled_render_to_texture")===!1){let we=!1;for(let qe=0,vt=L.length;qe<vt;qe++){let ct=L[qe],{object:ot,geometry:Ut,material:Ce,group:Vt}=ct;if(Ce.side===wn&&ot.layers.test(B.layers)){let et=Ce.side;Ce.side=Xt,Ce.needsUpdate=!0,nc(ot,W,B,Ut,Ce,Vt),Ce.side=et,Ce.needsUpdate=!0,we=!0}}we===!0&&(He.updateMultisampleRenderTarget(_e),He.updateRenderTargetMipmap(_e))}R.setRenderTarget(me,be,Ie),R.setClearColor(Z,q),Xe!==void 0&&(B.viewport=Xe),R.toneMapping=Ve}function or(y,L,W){let B=L.isScene===!0?L.overrideMaterial:null;for(let k=0,_e=y.length;k<_e;k++){let Ae=y[k],{object:me,geometry:be,group:Ie}=Ae,Ve=Ae.material;Ve.allowOverride===!0&&B!==null&&(Ve=B),me.layers.test(W.layers)&&nc(me,L,W,be,Ve,Ie)}}function nc(y,L,W,B,k,_e){U!==null&&k.isNodeMaterial&&U.setObject(y,k),y.onBeforeRender(R,L,W,B,k,_e),y.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),k.onBeforeRender(R,L,W,B,y,_e),k.transparent===!0&&k.side===wn&&k.forceSinglePass===!1?(k.side=Xt,k.needsUpdate=!0,R.renderBufferDirect(W,L,B,k,y,_e),k.side=ui,k.needsUpdate=!0,R.renderBufferDirect(W,L,B,k,y,_e),k.side=wn):R.renderBufferDirect(W,L,B,k,y,_e),y.onAfterRender(R,L,W,B,k,_e)}function ic(y){let L=0;for(let W of y)W.texture!==null&&L++;return L}function fs(y,L,W){L.isScene!==!0&&(L=ut);let B=Fe.get(y),k=E.state.lights,_e=E.state.shadowsArray,Ae=k.state.version,me=ne.getParameters(y,k.state,_e,L,W,E.state.lightProbeGridArray),be=ne.getProgramCacheKey(me),Ie=B.programs;B.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,B.fog=L.fog;let Ve=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;B.envMap=T.get(y.envMap||B.environment,Ve),B.envMapRotation=B.environment!==null&&y.envMap===null?L.environmentRotation:y.envMapRotation,Ie===void 0&&(y.addEventListener("dispose",rt),Ie=new Map,B.programs=Ie,B.programVariants=new Map);let Xe=Ie.get(be);if(Xe!==void 0){if(B.currentProgram===Xe&&B.lightsStateVersion===Ae)return rc(y,me),Xe}else me.uniforms=ne.getUniforms(y),U!==null&&y.isNodeMaterial&&U.build(y,W,me),y.onBeforeCompile(me,R),Xe=ne.acquireProgram(me,be),Ie.set(be,Xe),B.uniforms=me.uniforms;let we=B.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(we.clippingPlanes=K.uniform),rc(y,me),B.needsLights=ed(y),B.lightsStateVersion=Ae,B.needsLights&&(we.ambientLightColor.value=k.state.ambient,we.lightProbe.value=k.state.probe,we.sunLights.value=k.state.sun,we.sunLightShadows.value=k.state.sunShadow,we.directionalLights.value=k.state.directional,we.directionalLightShadows.value=k.state.directionalShadow,we.spotLights.value=k.state.spot,we.spotLightShadows.value=k.state.spotShadow,we.rectAreaLights.value=k.state.rectArea,we.ltc_1.value=k.state.rectAreaLTC1,we.ltc_2.value=k.state.rectAreaLTC2,we.pointLights.value=k.state.point,we.pointLightShadows.value=k.state.pointShadow,we.hemisphereLights.value=k.state.hemi,we.sunShadowMatrix.value=k.state.sunShadowMatrix,we.sunShadowCascade.value=k.state.sunShadowCascade,we.directionalShadowMatrix.value=k.state.directionalShadowMatrix,we.spotLightMatrix.value=k.state.spotLightMatrix,we.spotLightMap.value=k.state.spotLightMap,we.pointShadowMatrix.value=k.state.pointShadowMatrix),B.numLightProbeGrids=ic(E.state.lightProbeGridArray),B.currentProgram=Xe,B.uniformsList=null,Xe}function Ku(y,L,W,B,k){let _e=Fe.get(y),Ae=_e.currentProgram.id+","+B+","+k,me=_e.programVariants.get(Ae);return me===void 0?(me=fs(y,L,W),_e.programVariants.set(Ae,me)):(_e.currentProgram=me,_e.uniformsList=null,_e.outputColorSpace=B,_e.toneMapping=k),me}function sc(y){if(y.uniformsList===null){let L=y.currentProgram.getUniforms();y.uniformsList=hs.seqWithValue(L.seq,y.uniforms)}return y.uniformsList}function rc(y,L){let W=Fe.get(y);W.outputColorSpace=L.outputColorSpace,W.batching=L.batching,W.batchingColor=L.batchingColor,W.instancing=L.instancing,W.instancingColor=L.instancingColor,W.instancingMorph=L.instancingMorph,W.skinning=L.skinning,W.morphTargets=L.morphTargets,W.morphNormals=L.morphNormals,W.morphColors=L.morphColors,W.morphTargetsCount=L.morphTargetsCount,W.numClippingPlanes=L.numClippingPlanes,W.numIntersection=L.numClipIntersection,W.vertexAlphas=L.vertexAlphas,W.vertexTangents=L.vertexTangents,W.toneMapping=L.toneMapping}function ju(y,L,W,B,k){L.isScene!==!0&&(L=ut),He.resetTextureUnits();let _e=L.fog,Ae=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?L.environment:null,me=ie===null?R.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:Ye.workingColorSpace,be=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap,Ie=T.get(B.envMap||Ae,be),Ve=B.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Xe=!!W.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),we=!!W.morphAttributes.position,qe=!!W.morphAttributes.normal,vt=!!W.morphAttributes.color,ct=Cn;B.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(ct=R.toneMapping);let ot=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Ut=ot!==void 0?ot.length:0,Ce=Fe.get(B),Vt=E.state.lights;if(Je===!0&&(at===!0||y!==ee)){let gt=y===ee&&B.id===G;K.setState(B,y,gt)}let et=!1,pi=!1;B.version===Ce.__version?Ce.needsLights&&Ce.lightsStateVersion!==Vt.state.version||k.isBatchedMesh&&Ce.batching===!1||!k.isBatchedMesh&&Ce.batching===!0||k.isBatchedMesh&&Ce.batchingColor===!0&&k._colorsTexture===null||k.isBatchedMesh&&Ce.batchingColor===!1&&k._colorsTexture!==null||k.isInstancedMesh&&Ce.instancing===!1||!k.isInstancedMesh&&Ce.instancing===!0||k.isSkinnedMesh&&Ce.skinning===!1||!k.isSkinnedMesh&&Ce.skinning===!0||k.isInstancedMesh&&Ce.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Ce.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Ce.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Ce.instancingMorph===!1&&k.morphTexture!==null||Ce.envMap!==Ie||B.fog===!0&&Ce.fog!==_e||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==K.numPlanes||Ce.numIntersection!==K.numIntersection)||Ce.vertexAlphas!==Ve||Ce.vertexTangents!==Xe||Ce.morphTargets!==we||Ce.morphNormals!==qe||Ce.morphColors!==vt||Ce.morphTargetsCount!==Ut||Ce.numLightProbeGrids!==ic(E.state.lightProbeGridArray)?et=!0:(Ce.outputColorSpace!==me||Ce.toneMapping!==ct)&&(pi=!0):(et=!0,Ce.__version=B.version);let Ft=Ce.currentProgram;(et===!0||pi===!0)&&(Ft=pi===!0?Ku(B,L,k,me,ct):fs(B,L,k),U&&B.isNodeMaterial&&U.onUpdateProgram(B,Ft,Ce));let lr=!1,jn=!1,mi=!1,Qe=Ft.getUniforms(),Dt=Ce.uniforms;if(xe.useProgram(Ft.program)&&(lr=!0,jn=!0,mi=!0),B.id!==G&&(G=B.id,jn=!0),lr||ee!==y){xe.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),Qe.setValue(D,"projectionMatrix",y.projectionMatrix),Qe.setValue(D,"viewMatrix",y.matrixWorldInverse);let At=Qe.map.cameraPosition;At!==void 0&&At.setValue(D,mt.setFromMatrixPosition(y.matrixWorld)),st.logarithmicDepthBuffer&&Qe.setValue(D,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&Qe.setValue(D,"isOrthographic",y.isOrthographicCamera===!0),ee!==y&&(ee=y,jn=!0,mi=!0)}if(Ce.needsLights&&(Vt.state.sunShadowMap.length>0&&Qe.setValue(D,"sunShadowMap",Vt.state.sunShadowMap,He),Vt.state.directionalShadowMap.length>0&&Qe.setValue(D,"directionalShadowMap",Vt.state.directionalShadowMap,He),Vt.state.spotShadowMap.length>0&&Qe.setValue(D,"spotShadowMap",Vt.state.spotShadowMap,He),Vt.state.pointShadowMap.length>0&&Qe.setValue(D,"pointShadowMap",Vt.state.pointShadowMap,He)),k.isSkinnedMesh){Qe.setOptional(D,k,"bindMatrix"),Qe.setOptional(D,k,"bindMatrixInverse");let gt=k.skeleton;gt&&(gt.boneTexture===null&&gt.computeBoneTexture(),Qe.setValue(D,"boneTexture",gt.boneTexture,He))}k.isBatchedMesh&&(Qe.setOptional(D,k,"batchingTexture"),Qe.setValue(D,"batchingTexture",k._matricesTexture,He),Qe.setOptional(D,k,"batchingIdTexture"),Qe.setValue(D,"batchingIdTexture",k._indirectTexture,He),Qe.setOptional(D,k,"batchingColorTexture"),k._colorsTexture!==null&&Qe.setValue(D,"batchingColorTexture",k._colorsTexture,He));let sn=W.morphAttributes;if((sn.position!==void 0||sn.normal!==void 0||sn.color!==void 0)&&j.update(k,W,Ft),(jn||Ce.receiveShadow!==k.receiveShadow)&&(Ce.receiveShadow=k.receiveShadow,Qe.setValue(D,"receiveShadow",k.receiveShadow)),(B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial)&&B.envMap===null&&L.environment!==null&&(Dt.envMapIntensity.value=L.environmentIntensity),Dt.dfgLUT!==void 0&&(Dt.dfgLUT.value=Q0()),jn){if(Qe.setValue(D,"toneMappingExposure",R.toneMappingExposure),Ce.needsLights&&Qu(Dt,mi),_e&&B.fog===!0&&ce.refreshFogUniforms(Dt,_e),ce.refreshMaterialUniforms(Dt,B,oe,fe,E.state.transmissionRenderTarget[y.id]),Ce.needsLights&&Ce.numLightProbeGrids>0){let gt=M,At=0;for(let Ln of E.state.lightProbeGridArray)Ln.texture!==null&&(gt.textures[At]=Ln.texture,gt.min[At]=Ln.boundingBox.min,gt.max[At]=Ln.boundingBox.max,gt.resolution[At]=Ln.resolution,At++);for(let Ln in gt)gt[Ln].length=At;Dt.probesSH.value=gt.textures,Dt.probesMin.value=gt.min,Dt.probesMax.value=gt.max,Dt.probesResolution.value=gt.resolution}hs.upload(D,sc(Ce),Dt,He)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(hs.upload(D,sc(Ce),Dt,He),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&Qe.setValue(D,"center",k.center),Qe.setValue(D,"modelViewMatrix",k.modelViewMatrix),Qe.setValue(D,"normalMatrix",k.normalMatrix),Qe.setValue(D,"modelMatrix",k.matrixWorld),B.uniformsGroups!==void 0){let gt=B.uniformsGroups;for(let At=0,Ln=gt.length;At<Ln;At++){let oc=gt[At];Le.update(oc,Ft),Le.bind(oc,Ft)}}return Ft}function Qu(y,L){y.ambientLightColor.needsUpdate=L,y.lightProbe.needsUpdate=L,y.sunLights.needsUpdate=L,y.sunLightShadows.needsUpdate=L,y.directionalLights.needsUpdate=L,y.directionalLightShadows.needsUpdate=L,y.pointLights.needsUpdate=L,y.pointLightShadows.needsUpdate=L,y.spotLights.needsUpdate=L,y.spotLightShadows.needsUpdate=L,y.rectAreaLights.needsUpdate=L,y.hemisphereLights.needsUpdate=L}function ed(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return ie},this.setRenderTargetTextures=function(y,L,W){let B=Fe.get(y);B.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1&&(B.__useRenderToTexture=!1),Fe.get(y.texture).__webglTexture=L,Fe.get(y.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:W,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,L){let W=Fe.get(y);W.__webglFramebuffer=L,W.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(y,L=0,W=0){ie=y,X=L,F=W;let B=null,k=!1,_e=!1;if(y){let me=Fe.get(y);if(me.__useDefaultFramebuffer!==void 0){xe.bindFramebuffer(D.FRAMEBUFFER,me.__webglFramebuffer),se.copy(y.viewport),Se.copy(y.scissor),Te=y.scissorTest,xe.viewport(se),xe.scissor(Se),xe.setScissorTest(Te),G=-1;return}else if(me.__webglFramebuffer===void 0)He.setupRenderTarget(y);else if(me.__hasExternalTextures)He.rebindTextures(y,Fe.get(y.texture).__webglTexture,Fe.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let Ve=y.depthTexture;if(me.__boundDepthTexture!==Ve){if(Ve!==null&&Fe.has(Ve)&&(y.width!==Ve.image.width||y.height!==Ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");He.setupDepthRenderbuffer(y)}}let be=y.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(_e=!0);let Ie=Fe.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Ie[L])?B=Ie[L][W]:B=Ie[L],k=!0):y.samples>0&&He.useMultisampledRTT(y)===!1?B=Fe.get(y).__webglMultisampledFramebuffer:Array.isArray(Ie)?B=Ie[W]:B=Ie,se.copy(y.viewport),Se.copy(y.scissor),Te=y.scissorTest}else se.copy(Re).multiplyScalar(oe).floor(),Se.copy(H).multiplyScalar(oe).floor(),Te=te;if(W!==0&&(B=V),xe.bindFramebuffer(D.FRAMEBUFFER,B)&&xe.drawBuffers(y,B),xe.viewport(se),xe.scissor(Se),xe.setScissorTest(Te),k){let me=Fe.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+L,me.__webglTexture,W)}else if(_e){let me=L;for(let be=0;be<y.textures.length;be++){let Ie=Fe.get(y.textures[be]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+be,Ie.__webglTexture,W,me)}}else if(y!==null&&W!==0){let me=Fe.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,me.__webglTexture,W)}G=-1};function ac(y){let L=Fe.get(y);return(L.__readFormat!==y.format||L.__readType!==y.type)&&(L.__readFormat=y.format,L.__readType=y.type,L.__formatReadable=st.textureFormatReadable(y.format),L.__typeReadable=st.textureTypeReadable(y.type)),L}this.readRenderTargetPixels=function(y,L,W,B,k,_e,Ae,me=0){if(!(y&&y.isWebGLRenderTarget)){ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=Fe.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Ae!==void 0&&(be=be[Ae],Array.isArray(be)&&(be=be[0])),be){xe.bindFramebuffer(D.FRAMEBUFFER,be);try{let Ie=y.textures[me],Ve=Ie.format,Xe=Ie.type;y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+me);let we=ac(Ie);if(we.__formatReadable===!1){ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(we.__typeReadable===!1){ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=y.width-B&&W>=0&&W<=y.height-k&&D.readPixels(L,W,B,k,le.convert(Ve),le.convert(Xe),_e)}finally{let Ie=ie!==null?Fe.get(ie).__webglFramebuffer:null;xe.bindFramebuffer(D.FRAMEBUFFER,Ie)}}},this.readRenderTargetPixelsAsync=async function(y,L,W,B,k,_e,Ae,me=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=Fe.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Ae!==void 0&&(be=be[Ae],Array.isArray(be)&&(be=be[0])),be)if(L>=0&&L<=y.width-B&&W>=0&&W<=y.height-k){xe.bindFramebuffer(D.FRAMEBUFFER,be);let Ie=y.textures[me],Ve=Ie.format,Xe=Ie.type;y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+me);let we=ac(Ie);if(we.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(we.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let qe=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,qe),D.bufferData(D.PIXEL_PACK_BUFFER,_e.byteLength,D.STREAM_READ),D.readPixels(L,W,B,k,le.convert(Ve),le.convert(Xe),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let vt=ie!==null?Fe.get(ie).__webglFramebuffer:null;xe.bindFramebuffer(D.FRAMEBUFFER,vt);let ct=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Jh(D,ct,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,qe),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,_e),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(qe),D.deleteSync(ct),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,L=null,W=0){let B=Math.pow(2,-W),k=Math.floor(y.image.width*B),_e=Math.floor(y.image.height*B),Ae=L!==null?L.x:0,me=L!==null?L.y:0;He.setTexture2D(y,0),D.copyTexSubImage2D(D.TEXTURE_2D,W,0,0,Ae,me,k,_e),xe.unbindTexture()},this.copyTextureToTexture=function(y,L,W=null,B=null,k=0,_e=0){let Ae,me,be,Ie,Ve,Xe,we,qe,vt,ct=y.isCompressedTexture?y.mipmaps[_e]:y.image;if(W!==null)Ae=W.max.x-W.min.x,me=W.max.y-W.min.y,be=W.isBox3?W.max.z-W.min.z:1,Ie=W.min.x,Ve=W.min.y,Xe=W.isBox3?W.min.z:0;else{let Qe=Math.pow(2,-k);Ae=Math.floor(ct.width*Qe),me=Math.floor(ct.height*Qe),y.isDataArrayTexture?be=ct.depth:y.isData3DTexture?be=Math.floor(ct.depth*Qe):be=1,Ie=0,Ve=0,Xe=0}B!==null?(we=B.x,qe=B.y,vt=B.z):(we=0,qe=0,vt=0);let ot=le.convert(L.format),Ut=le.convert(L.type),Ce;L.isData3DTexture?(He.setTexture3D(L,0),Ce=D.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(He.setTexture2DArray(L,0),Ce=D.TEXTURE_2D_ARRAY):(He.setTexture2D(L,0),Ce=D.TEXTURE_2D),xe.activeTexture(D.TEXTURE0),xe.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,L.flipY),xe.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),xe.pixelStorei(D.UNPACK_ALIGNMENT,L.unpackAlignment);let Vt=xe.getParameter(D.UNPACK_ROW_LENGTH),et=xe.getParameter(D.UNPACK_IMAGE_HEIGHT),pi=xe.getParameter(D.UNPACK_SKIP_PIXELS),Ft=xe.getParameter(D.UNPACK_SKIP_ROWS),lr=xe.getParameter(D.UNPACK_SKIP_IMAGES);xe.pixelStorei(D.UNPACK_ROW_LENGTH,ct.width),xe.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ct.height),xe.pixelStorei(D.UNPACK_SKIP_PIXELS,Ie),xe.pixelStorei(D.UNPACK_SKIP_ROWS,Ve),xe.pixelStorei(D.UNPACK_SKIP_IMAGES,Xe);let jn=y.isDataArrayTexture||y.isData3DTexture,mi=L.isDataArrayTexture||L.isData3DTexture;if(y.isDepthTexture){let Qe=Fe.get(y),Dt=Fe.get(L),sn=Fe.get(Qe.__renderTarget),gt=Fe.get(Dt.__renderTarget);xe.bindFramebuffer(D.READ_FRAMEBUFFER,sn.__webglFramebuffer),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,gt.__webglFramebuffer);for(let At=0;At<be;At++)jn&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Fe.get(y).__webglTexture,k,Xe+At),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Fe.get(L).__webglTexture,_e,vt+At)),D.blitFramebuffer(Ie,Ve,Ie+Ae,Ve+me,we,qe,we+Ae,qe+me,D.DEPTH_BUFFER_BIT,D.NEAREST);xe.bindFramebuffer(D.READ_FRAMEBUFFER,null),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(k!==0||y.isRenderTargetTexture||Fe.has(y)){let Qe=Fe.get(y),Dt=Fe.get(L);xe.bindFramebuffer(D.READ_FRAMEBUFFER,C),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,O);for(let sn=0;sn<be;sn++)jn?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Qe.__webglTexture,k,Xe+sn):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Qe.__webglTexture,k),mi?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Dt.__webglTexture,_e,vt+sn):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Dt.__webglTexture,_e),k!==0?D.blitFramebuffer(Ie,Ve,Ie+Ae,Ve+me,we,qe,we+Ae,qe+me,D.COLOR_BUFFER_BIT,D.NEAREST):mi?D.copyTexSubImage3D(Ce,_e,we,qe,vt+sn,Ie,Ve,Ae,me):D.copyTexSubImage2D(Ce,_e,we,qe,Ie,Ve,Ae,me);xe.bindFramebuffer(D.READ_FRAMEBUFFER,null),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else mi?y.isDataTexture||y.isData3DTexture?D.texSubImage3D(Ce,_e,we,qe,vt,Ae,me,be,ot,Ut,ct.data):L.isCompressedArrayTexture?D.compressedTexSubImage3D(Ce,_e,we,qe,vt,Ae,me,be,ot,ct.data):D.texSubImage3D(Ce,_e,we,qe,vt,Ae,me,be,ot,Ut,ct):y.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,_e,we,qe,Ae,me,ot,Ut,ct.data):y.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,_e,we,qe,ct.width,ct.height,ot,ct.data):D.texSubImage2D(D.TEXTURE_2D,_e,we,qe,Ae,me,ot,Ut,ct);xe.pixelStorei(D.UNPACK_ROW_LENGTH,Vt),xe.pixelStorei(D.UNPACK_IMAGE_HEIGHT,et),xe.pixelStorei(D.UNPACK_SKIP_PIXELS,pi),xe.pixelStorei(D.UNPACK_SKIP_ROWS,Ft),xe.pixelStorei(D.UNPACK_SKIP_IMAGES,lr),_e===0&&L.generateMipmaps===!0&&L.mipmapsAutoUpdate===!0&&D.generateMipmap(Ce),xe.unbindTexture()},this.initRenderTarget=function(y){Fe.get(y).__webglFramebuffer===void 0&&He.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?He.setTextureCube(y,0):y.isData3DTexture?He.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?He.setTexture2DArray(y,0):He.setTexture2D(y,0),xe.unbindTexture()},this.resetState=function(){X=0,F=0,ie=null,xe.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}};var Yl=4.3,e_=1.32,Uu=1.12,t_=1.03,n_=4.5,i_=1e3,s_=1.6;function r_(){try{let i=document.createElement("canvas");return!!(window.WebGLRenderingContext&&(i.getContext("webgl2")||i.getContext("webgl")))}catch{return!1}}function a_(){let i=document.createElement("canvas");i.width=1024,i.height=512;let e=i.getContext("2d");e.fillStyle="#8d8d8a",e.fillRect(0,0,i.width,i.height);let t=7,n=()=>(t=t*16807%2147483647,t/2147483647);for(let r=0;r<900;r++){let a=n()*i.width,o=n()*i.height,l=2+n()**3*34,c=95+Math.floor(n()*70);e.fillStyle=`rgba(${c},${c},${c-3},${.25+n()*.35})`;let u=(.5-o/i.height)*Math.PI,d=Math.min(i.width/3,l/Math.max(.06,Math.cos(u)));e.beginPath(),e.ellipse(a,o,d,l*(.85+n()*.15),0,0,Math.PI*2),e.fill(),e.strokeStyle=`rgba(210,210,205,${.12+n()*.15})`,e.lineWidth=Math.max(1,l*.12),e.stroke()}let s=new Fs(i);return s.colorSpace=Rt,s}function Fu(i,{alElegir:e,urlTextura:t,urlPolo:n,reducirMovimiento:s}){if(!r_())return null;let r;try{r=new po({antialias:!0,alpha:!0,powerPreference:"low-power"})}catch{return null}r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),r.outputColorSpace=Rt,i.classList.add("luna"),i.innerHTML=`
    <div class="luna__lienzo" tabindex="0" role="group" aria-roledescription="visor 3D" aria-label="Luna interactiva. Arrastra o usa las flechas para girar, + y - para acercar, 0 para volver a la vista del polo sur."></div>
    <div class="luna__marcadores"></div>
    <div class="luna__controles" role="group" aria-label="Controles del visor">
      <button type="button" class="boton-icono" data-accion="polo" aria-label="Vista del polo sur"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="2"/></svg></button>
      <button type="button" class="boton-icono" data-accion="mas" aria-label="Acercar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 5v10M5 10h10"/></svg></button>
      <button type="button" class="boton-icono" data-accion="menos" aria-label="Alejar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10"/></svg></button>
    </div>
    <p class="luna__credito"></p>`;let a=i.querySelector(".luna__lienzo"),o=i.querySelector(".luna__marcadores"),l=i.querySelector(".luna__credito");a.append(r.domElement);let c=new Ls,u=new Gt(35,1,.001,50),d=new Vn,h=new ns({color:16777215,roughness:1,metalness:0});d.add(new Kt(new ks(1,160,120),h)),c.add(d),c.add(new Xs(16777215,.55));let f=new $s(16774368,2.2);f.position.set(-2,1.5,3),c.add(f);let _=vs(),v=Yl,p=null,m=[],S=null,w=!0,M=!1;function A(){h.map=a_(),h.needsUpdate=!0,b(),i.classList.add("luna--lista"),O()}let E=!1,g=!1,b=()=>{let q=E?"Textura: NASA CGI Moon Kit":"Textura provisional";l.textContent=`${q}${g?" + relieve LOLA":""} (solo visual)`,l.title=l.textContent};n&&new ss().load(n,q=>{q.colorSpace=Rt,q.anisotropy=Math.min(8,r.capabilities.getMaxAnisotropy());let Q=Gc({radio:1.0008}),fe=new dn;fe.setAttribute("position",new It(Q.posiciones,3)),fe.setAttribute("uv",new It(Q.uvs,2)),fe.setIndex(Q.indices),fe.computeVertexNormals();let oe=new Kt(fe,new ns({map:q,color:15722200,transparent:!0,depthWrite:!1,roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));oe.renderOrder=1,d.add(oe),g=!0,b(),O()},void 0,()=>{}),t?new ss().load(t,q=>{q.colorSpace=Rt,q.anisotropy=Math.min(8,r.capabilities.getMaxAnisotropy()),h.map=q,h.needsUpdate=!0,E=!0,b(),i.classList.add("luna--lista"),O()},void 0,A):A();function N(){d.quaternion.set(_[0],_[1],_[2],_[3]),u.position.set(0,0,v),u.lookAt(0,0,0)}function R(q,Q){if(s()){p=null,_=q,v=Q,O();return}p={q0:_,d0:v,q1:q,d1:Q,t0:performance.now()},O()}function I(q,Q,fe){let oe=Math.hypot(q,Q);if(!oe)return;let Pe=Math.sin(fe/2)/oe;_=Pi([q*Pe,Q*Pe,0,Math.cos(fe/2)],_);let tt=Math.hypot(..._);_=_.map(Re=>Re/tt)}function U(q){p=null,v=Math.min(n_,Math.max(t_,1+(v-1)*q)),O()}function V(q){let Q=vr(_,q),fe={x:Q[0],y:Q[1],z:Q[2]},oe=fe.z*(v-fe.z)-fe.x*fe.x-fe.y*fe.y>0,Pe=a.clientWidth,tt=a.clientHeight,Re={x:Q[0],y:Q[1],z:Q[2]-v},H=1/Math.tan(u.fov*Math.PI/360),te=Pe/2*(1+H/u.aspect*(Re.x/-Re.z)),pe=tt/2*(1-H*(Re.y/-Re.z));return{sx:te,sy:pe,visible:oe}}function C(){if(v>s_){let Q=V(xs(-89,60));o.innerHTML=Q.visible?`<button type="button" class="luna__grupo" data-accion="tres" style="left:${Q.sx}px;top:${Q.sy}px">${m.length} sitios del polo sur</button>`:"";return}o.innerHTML=m.map(Q=>{let fe=V(xs(Q.lat,Q.lon));if(!fe.visible)return"";let oe=Q.id===S;return`<button type="button" class="luna__sitio${oe?" activo":""}" data-sitio="${Q.id}" aria-pressed="${oe}" style="left:${fe.sx}px;top:${fe.sy}px" aria-label="${De(Q.etiqueta)}: ${De(Q.nombre_corto)}">
        <span class="luna__punto" aria-hidden="true">${De(Q.etiqueta.slice(-1))}</span><span class="luna__nombre">${De(Q.nombre_corto)}</span></button>`}).join("")}function O(){M||!w||(M=!0,requestAnimationFrame(X))}function X(q){if(M=!1,p){let Q=Vc((q-p.t0)/i_);_=Hc(p.q0,p.q1,Q),v=Math.exp(Math.log(p.d0-1)+(Math.log(p.d1-1)-Math.log(p.d0-1))*Q)+1,Q>=1&&(p=null)}N(),r.render(c,u),C(),p&&O()}function F(){let q=Math.max(1,a.clientWidth),Q=Math.max(1,a.clientHeight);r.setSize(q,Q,!1),u.aspect=q/Q,u.updateProjectionMatrix(),O()}let ie=new ResizeObserver(F);ie.observe(a);let G=new IntersectionObserver(([q])=>{w=q.isIntersecting&&!document.hidden,w&&O()});G.observe(i);let ee=()=>{w=!document.hidden,w&&O()};document.addEventListener("visibilitychange",ee);let se=new Map,Se=null;a.addEventListener("pointerdown",q=>{a.setPointerCapture(q.pointerId),se.set(q.pointerId,{x:q.clientX,y:q.clientY}),p=null}),a.addEventListener("pointermove",q=>{let Q=se.get(q.pointerId);if(!Q)return;if(se.set(q.pointerId,{x:q.clientX,y:q.clientY}),se.size===2){let[tt,Re]=[...se.values()],H=Math.hypot(tt.x-Re.x,tt.y-Re.y);Se&&U(Se/H),Se=H;return}let fe=q.clientX-Q.x,oe=q.clientY-Q.y,Pe=2.2*(v-1)/Math.max(200,a.clientHeight);I(oe,fe,Math.hypot(fe,oe)*Pe),O()});let Te=q=>{se.delete(q.pointerId),se.size<2&&(Se=null)};a.addEventListener("pointerup",Te),a.addEventListener("pointercancel",Te),a.addEventListener("wheel",q=>{q.preventDefault(),U(Math.exp(q.deltaY*.0012))},{passive:!1}),a.addEventListener("keydown",q=>{let Q=.15*(v-1),fe={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};if(q.key in fe)I(...fe[q.key],Q),p=null,O();else if(q.key==="+"||q.key==="=")U(.8);else if(q.key==="-"||q.key==="_")U(1.25);else if(q.key==="0")R(vs(),Yl);else return;q.preventDefault()});function Z(){R(yr(-88.4,330),e_)}return i.addEventListener("click",q=>{let Q=q.target.closest("button");Q&&(Q.dataset.sitio?e(Q.dataset.sitio):Q.dataset.accion==="polo"?R(vs(),Yl):Q.dataset.accion==="mas"?U(.7):Q.dataset.accion==="menos"?U(1.4):Q.dataset.accion==="tres"&&Z())}),F(),{render(q){m=q.sitios;let Q=q.sitio.id;S!==null&&Q!==S&&R(yr(q.sitio.lat,q.sitio.lon),Uu),S=Q,O()},enfocarSitio(q){R(yr(q.lat,q.lon),Uu)},verTres:Z,destruir(){ie.disconnect(),G.disconnect(),document.removeEventListener("visibilitychange",ee),r.dispose()}}}var o_=i=>`${Math.abs(i.lat).toFixed(3)}\xB0 S, ${i.lon.toFixed(3)}\xB0 E`;function Ou(i,e,t){i.innerHTML=e.sitios.map(n=>{let s=n.id===e.sitio.id;return`<button type="button" class="chip-sitio${s?" activo":""}" data-sitio="${n.id}" aria-pressed="${s}">
      <span aria-hidden="true">${De(n.etiqueta.slice(-1))}</span>${De(n.nombre_corto)}</button>`}).join("")+(t?'<button type="button" class="chip-sitio" data-accion="tres">Ver los tres</button>':"")}function Bu(i,e,t){let{sitio:n,muestra:s,estado:r}=e,a=(l,c,u,d)=>`<span class="pastilla ${l?d:"c-neutro"}">${l?c:u}</span>`,o=r.enlaceActivo?`<span class="pastilla ${Ot[s.enlace.estado].clase}">Enlace ${an[r.tipoEnlace].toLowerCase()}: ${Ot[s.enlace.estado].texto}</span>`:'<span class="pastilla c-neutro">Enlace local desactivado</span>';i.innerHTML=`
    <div>
      <p class="luna-ficha__nombre">${De(n.etiqueta)}: ${De(n.nombre_corto)}</p>
      <p class="luna-ficha__coord">${o_(n)}</p>
    </div>
    <div class="luna-ficha__estados">
      ${a(s.sol.visible,"Sol visible","Sombra","c-sol")}
      ${a(s.tierra.visible,"Tierra visible","Tierra oculta","c-tierra")}
      ${o}
    </div>
    ${t?"":'<p class="luna-ficha__aviso">Este navegador no ofrece WebGL: se muestra el mapa polar 2D con las mismas coordenadas.</p>'}`}var Jn=1e3,_n=300,xt={izq:52,der:18,sup:18,inf:46},ds=-4,wi=8,xn=i=>xt.izq+i/360*(Jn-xt.izq-xt.der),Hu=i=>xt.sup+(wi-i)/(wi-ds)*(_n-xt.sup-xt.inf),_o=i=>Hu(Math.max(ds,Math.min(wi,i)));function zu(i,e,t,n){let s=[],r=i-e,a=i+e,o=(l,c)=>s.push(`<rect x="${xn(l)}" y="${xt.sup}" width="${xn(c)-xn(l)}" height="${_n-xt.sup-xt.inf}" fill="${t}" opacity="${n}"/>`);return r<0?(o(0,a),o(360+r,360)):a>360?(o(r,360),o(0,a-360)):o(r,a),s.join("")}function ku(i,e,t,n,s,r){let a=xn(i),o=_o(e),l=e>wi||e<ds,c=a>Jn-140?a-14:a+14,u=a>Jn-140?"end":"start";return`
    <line x1="${a}" y1="${o}" x2="${a}" y2="${_o(r)}" stroke="${t}" stroke-dasharray="3 3" opacity=".7"/>
    <circle cx="${a}" cy="${o}" r="8" fill="${n?t:Ee.fondo}" stroke="${t}" stroke-width="2"/>
    <text x="${c}" y="${o-10}" text-anchor="${u}" fill="${t}" class="g-etq">${De(s)}${l?" (fuera de escala)":""}</text>`}function Vu(i,e){let{sitio:t,muestra:n,estado:s,escenario:r}=e,o=s.modoHorizonte==="plano"?null:t.horizonte;Jn=Math.max(560,Math.round(i.clientWidth||1e3)),_n=Jn<760?260:300;let l=o?o.elevacion_deg:[0],c=e.serie.reduce((v,p)=>Math.max(v,p.sol.el,p.tierra.el),Math.max(...l)),u=e.serie.reduce((v,p)=>Math.min(v,p.sol.el,p.tierra.el),Math.min(...l));wi=Math.max(6,Math.ceil(c/2)*2+2),ds=Math.min(-4,Math.floor(u/2)*2);let d=[],h=wi-ds>18?4:2;for(let v=ds;v<=wi;v+=h){let p=Hu(v);d.push(`<line x1="${xt.izq}" x2="${Jn-xt.der}" y1="${p}" y2="${p}" stroke="rgba(255,255,255,${v===0?.35:.08})"/>`),d.push(`<text x="${xt.izq-8}" y="${p+4}" text-anchor="end" class="g-eje">${v}\xB0</text>`)}let f={0:"N",90:"E",180:"S",270:"O",360:"N"};for(let v=0;v<=360;v+=45)d.push(`<line y1="${xt.sup}" y2="${_n-xt.inf}" x1="${xn(v)}" x2="${xn(v)}" stroke="rgba(255,255,255,.08)"/>`),d.push(`<text x="${xn(v)}" y="${_n-xt.inf+18}" text-anchor="${v===0?"start":v===360?"end":"middle"}" class="g-eje">${v}\xB0${f[v]?` ${f[v]}`:""}</text>`);if(d.push(`<text x="${(xt.izq+Jn-xt.der)/2}" y="${_n-6}" text-anchor="middle" class="g-titulo">Azimut (\xB0)</text>`),d.push(`<text transform="translate(14 ${(xt.sup+_n-xt.inf)/2}) rotate(-90)" text-anchor="middle" class="g-titulo">Elevaci\xF3n (\xB0)</text>`),s.enlaceActivo&&s.tipoEnlace==="optico"){let v=r.enlace_local.optico;for(let p of[t.relevo.az_deg,(t.relevo.az_deg+180)%360])d.push(zu(p,v.sep_robusto_deg,Ee.aviso,.08)),d.push(zu(p,v.sep_sin_enlace_deg,Ee.error,.14))}let _=[];for(let v=0;v<=360;v+=1)_.push(`${xn(v).toFixed(1)},${_o(gi(o,v)).toFixed(1)}`);if(d.push(`<path d="M${xn(0)},${_n-xt.inf} L${_.join(" L")} L${xn(360)},${_n-xt.inf} Z" fill="url(#g-terreno)"/>`),d.push(`<polyline points="${_.join(" ")}" fill="none" stroke="${Ee.texto2}" stroke-width="1.5"/>`),s.enlaceActivo){let v=t.relevo,p=xn(v.az_deg),m=_o(v.el_deg);d.push(`<path d="M${p},${m-9}l8,14h-16z" fill="${Ee.superficie}" stroke="${Ee.acento}" stroke-width="2"/>`),d.push(`<text x="${p-12}" y="${m+22}" text-anchor="end" class="g-etq" fill="${Ee.acento}">Punto de apoyo</text>`)}d.push(ku(n.tierra.az,n.tierra.el,Ee.tierra,n.tierra.visible,`Tierra ${Qt(n.tierra.el)}`,n.tierra.horizonte)),d.push(ku(n.sol.az,n.sol.el,Ee.sol,n.sol.visible,`Sol ${Qt(n.sol.el)}`,n.sol.horizonte)),i.innerHTML=`
    <svg viewBox="0 0 ${Jn} ${_n}" width="${Jn}" height="${_n}" role="img" aria-label="Horizonte de ${De(t.etiqueta)}: Sol a ${Qt(n.sol.el)} de elevaci\xF3n, ${n.sol.visible?"visible":"tapado por el terreno"}; Tierra a ${Qt(n.tierra.el)}, ${n.tierra.visible?"visible":"oculta"}.">
      <defs><linearGradient id="g-terreno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55585E" stop-opacity=".9"/><stop offset="1" stop-color="#1B1D21" stop-opacity=".9"/></linearGradient></defs>
      <style>
        .g-eje { font: 400 12px var(--fuente); fill: ${Ee.texto3}; }
        .g-titulo { font: 500 12px var(--fuente); fill: ${Ee.texto2}; }
        .g-etq { font: 600 13px var(--fuente); }
      </style>
      ${d.join("")}
    </svg>`}function Gu(i,e){let t=e.enlaceActivo&&e.tipoEnlace==="optico";i.innerHTML=`
    <li><span class="muestra" style="background:#55585E;border-top:2px solid ${Ee.texto2}"></span>Terreno (elevaci\xF3n por azimut)</li>
    <li><span class="muestra" style="background:${Ee.sol};border-radius:50%"></span>Sol: relleno si supera el horizonte</li>
    <li><span class="muestra" style="background:${Ee.tierra};border-radius:50%"></span>Tierra: relleno si supera el horizonte</li>
    ${e.enlaceActivo?`<li><span class="muestra" style="border:2px solid ${Ee.acento}"></span>Punto de apoyo</li>`:""}
    ${t?`<li><span class="muestra" style="background:${Ee.error};opacity:.6"></span><span class="muestra" style="background:${Ee.aviso};opacity:.35"></span>Zonas donde el Sol deslumbra el enlace (supuesto)</li>`:""}
    <li>Unidades: grados; azimut desde el norte local</li>`}var ar=26,Zl=30,Pn=28,Ci=8,Wu=8;function $u(i,e,{alCambiarIndice:t}){let n=null,s=null,r=!1;i.setAttribute("role","slider"),i.setAttribute("tabindex","0"),i.setAttribute("aria-label","Hora seleccionada en la l\xEDnea de tiempo");let a=h=>{let f=i.querySelector("svg").getBoundingClientRect(),_=n.W/f.width,v=(h-f.left)*_-Ci,p=Math.floor(v/n.ancho*n.n);return n.i0+Math.max(0,Math.min(n.n-1,p))};function o(h,f){let _=[`<li>${h.sol.visible?"Sol visible":"Sombra"}: el Sol est\xE1 ${h.sol.visible?"sobre":"bajo"} el horizonte local.</li>`,`<li>${h.tierra.visible?"Tierra visible":"Tierra oculta"}: ${h.tierra.visible?"hay":"no hay"} vista directa para comunicar.</li>`];return f.enlaceActivo&&_.push(`<li>Enlace local ${Ot[h.enlace.estado].texto.toLowerCase()}: ${De(h.enlace.limitantes[0].texto)}</li>`),`<b>${gs(h.ms)}</b><ul>${_.join("")}</ul>`}function l(h){if(!n||r)return;let f=a(h.clientX);e.innerHTML=o(s.serie[f],s.estado),e.hidden=!1;let _=e.offsetWidth,v=Math.min(window.innerWidth-_-12,Math.max(12,h.clientX+14));e.style.left=`${v}px`,e.style.top=`${h.clientY+18}px`}i.addEventListener("pointerdown",h=>{!n||h.button>0||(r=!0,e.hidden=!0,i.setPointerCapture(h.pointerId),i.focus({preventScroll:!0}),t(a(h.clientX)))}),i.addEventListener("pointermove",h=>{r?t(a(h.clientX)):h.pointerType==="mouse"&&l(h)});let c=()=>{r=!1};i.addEventListener("pointerup",c),i.addEventListener("pointercancel",c),i.addEventListener("pointerleave",()=>{e.hidden=!0}),i.addEventListener("keydown",h=>{if(!n)return;let f=s.indice,_={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:-24,PageDown:24},v=null;h.key in _?v=f+_[h.key]:h.key==="Home"?v=n.i0:h.key==="End"&&(v=n.i1),v!==null&&(h.preventDefault(),t(Math.max(n.i0,Math.min(n.i1,v))))});function u(h){s=h;let{serie:f,i0:_,i1:v,estado:p,metricas:m}=h,S=v-_+1,w=Math.max(560,Math.round(i.parentElement.clientWidth||1e3)),M=w-Ci-Wu,A=C=>Ci+(C-_)/S*M,E=[{nombre:"Iluminaci\xF3n",clave:C=>C.sol.visible?"si":"no",relleno:C=>C==="si"?Ee.sol:Ee.sombra,texto:C=>C==="si"?"Sol visible":"Sombra"},{nombre:"Comunicaci\xF3n directa",clave:C=>C.tierra.visible?"si":"no",relleno:C=>C==="si"?Ee.tierra:Ee.sombra,texto:C=>C==="si"?"Tierra visible":"Tierra oculta"}];p.enlaceActivo&&E.push({nombre:`Enlace local (${p.tipoEnlace==="rf"?"radiofrecuencia":"\xF3ptico"})`,clave:C=>C.enlace.estado,relleno:wc,texto:C=>Ot[C].texto});let g=[],b=Math.max(1,Math.ceil(S/24/(M/70))),N=0;for(let C=_;C<=v;C++){if(!f[C].t.endsWith("T00:00"))continue;let O=A(C);g.push(`<line x1="${O}" x2="${O}" y1="${Pn-8}" y2="${Pn+E.length*(ar+Zl)}" stroke="rgba(255,255,255,.1)"/>`),N%b===0&&g.push(`<text x="${O+3}" y="${Pn-12}">${_i(f[C].ms)}</text>`),N++}E.forEach((C,O)=>{let X=Pn+O*(ar+Zl)+14,F=X+8;g.push(`<text class="carril__nombre" x="${Ci+14}" y="${X}">${C.nombre}</text>`),g.push(`<rect x="${Ci}" y="${F}" width="${M}" height="${ar}" rx="6" fill="${Ee.neutro}"/>`);for(let ie of xc(f,_,v,C.clave)){let G=A(ie.desde),ee=A(ie.hasta+1);g.push(`<rect x="${G.toFixed(2)}" y="${F}" width="${Math.max(.6,ee-G).toFixed(2)}" height="${ar}" fill="${C.relleno(ie.valor)}"><title>${C.texto(ie.valor)}, ${Un(ie.hasta-ie.desde+1)}</title></rect>`)}});let R=Pn+E.length*(ar+Zl)+4,I=h.escenario.evento_polvo;if(p.enlaceActivo&&p.tipoEnlace==="optico"&&p.polvo){let C=ur(f,I);if(C&&C[1]>=_&&C[0]<=v){let O=Math.max(_,C[0]),X=Math.min(v,C[1])+1,F=A(O),ie=Math.max(6,A(X)-F);g.push(`<rect x="${F-(ie-(A(X)-F))/2}" y="${Pn+2}" width="${ie}" height="${R-Pn-2}" fill="url(#p-polvo)" opacity=".7" stroke="${Ee.texto}" stroke-opacity=".5"/>`);let G=F>w-260;g.push(`<text x="${G?F-6:F+ie+4}" y="${R+14}" text-anchor="${G?"end":"start"}" fill="${Ee.texto}">Evento de polvo: ${I.duracion_s} s (referencia Apollo)</text>`)}}let U=m.brecha;if(U.horas>0){let C=A(U.desde),O=A(U.hasta+1),X=R+34;g.push(`<path d="M${C},${X-6}V${X}H${O}V${X-6}" fill="none" stroke="${Ee.acento}" stroke-width="1.5"/>`);let F=`${p.enlaceActivo?"Mayor intervalo sin comunicaci\xF3n":"Mayor intervalo sin vista a la Tierra"}: ${Un(U.horas)}`,ie=Math.min(Math.max((C+O)/2,Ci+150),w-Wu-150);g.push(`<text x="${ie}" y="${X+16}" text-anchor="middle" fill="${Ee.acento}">${F}</text>`)}let V=R+60;i.innerHTML=`
      <svg viewBox="0 0 ${w} ${V}" width="${w}" height="${V}" aria-hidden="true">
        <defs>${mr()}</defs>
        ${g.join("")}
        <g id="cursor">
          <rect class="cursor__marco" x="-7" y="${Pn-4}" width="14" height="${R-Pn+2}" rx="7" fill="rgba(198,168,106,.14)" stroke="rgba(226,201,144,.5)"/>
          <line class="cursor__linea" x1="0" x2="0" y1="${Pn-4}" y2="${R-2}" stroke="${Ee.texto}" stroke-width="2"/>
        </g>
      </svg>`,n={W:w,ancho:M,n:S,i0:_,i1:v},d(h)}function d(h){if(s=h,!n)return;let{indice:f,serie:_}=h,v=Ci+(f-n.i0+.5)/n.n*n.ancho;i.querySelector("#cursor").setAttribute("transform",`translate(${v.toFixed(2)} 0)`),i.setAttribute("aria-valuemin",String(n.i0)),i.setAttribute("aria-valuemax",String(n.i1)),i.setAttribute("aria-valuenow",String(f)),i.setAttribute("aria-valuetext",gs(_[f].ms));let p=i.parentElement;if(p.scrollWidth>p.clientWidth){let m=i.querySelector("svg").getBoundingClientRect(),S=v*(m.width/n.W);(S<p.scrollLeft+24||S>p.scrollLeft+p.clientWidth-24)&&(p.scrollLeft=S-p.clientWidth/2)}}return{dibujar:u,moverCursor:d}}function Xu(i,e){let t=[`<li><span class="muestra" style="background:${Ee.sol}"></span>Sol visible</li>`,`<li><span class="muestra" style="background:${Ee.tierra}"></span>Tierra visible</li>`,`<li><span class="muestra" style="background:${Ee.sombra};border:1px solid rgba(255,255,255,.3)"></span>Sombra / Tierra oculta</li>`];e.enlaceActivo&&t.push(`<li><span class="muestra" style="background:${Ee.ok}"></span>R\xE1pido</li>`,`<li><span class="muestra" style="background:repeating-linear-gradient(45deg,${Ee.aviso} 0 3px,rgba(0,0,0,.35) 3px 5px)"></span>Robusto</li>`,`<li><span class="muestra" style="background:repeating-linear-gradient(45deg,${Ee.error} 0 2px,rgba(0,0,0,.4) 2px 4px)"></span>Sin enlace</li>`),t.push("<li>Cada columna es una hora UTC</li>"),i.innerHTML=t.join("")}function qu(i,e,t,n){let{filas:s,comparacion:r,estado:a,serie:o,i0:l,i1:c}=n;e.textContent=`Periodo: ${Nn(o[l].ms)} a ${Nn(o[c].ms)} (${c-l+1} h, UTC). Enlace local: ${a.enlaceActivo?an[a.tipoEnlace].toLowerCase():"desactivado"}${a.enlaceActivo&&a.tipoEnlace==="optico"&&a.polvo?", con evento de polvo":""}. Horizonte: ${pr(a.modoHorizonte,n.sitio)}. \xCDndice de conveniencia: ${Object.entries(ms).filter(([M])=>a.enlaceActivo||M!=="respaldo").map(([M,A])=>`${_t(A,2)}\xB7${yo[M]}`).join(" + ")} (propuesto por el equipo, no es un est\xE1ndar de NASA; sin enlace local los pesos se reparten entre los dem\xE1s t\xE9rminos). Resoluci\xF3n horaria: cada cambio se ubica con un margen de \xB11 h.`;let u=`<thead><tr><th scope="col">M\xE9trica</th>${s.map(M=>`<th scope="col"><b>${De(M.sitio.etiqueta)}</b>${De(M.sitio.nombre_corto)}</th>`).join("")}</tr></thead>`,d=s.map(M=>Mo(M.metricas,a.enlaceActivo,M.metricas.terreno)),h=d.map(M=>M.total),f=Math.max(...h),_='<tr class="fila-score"><th scope="row"><strong>\xCDndice de conveniencia (S)</strong><br><small class="c-neutro">de 0 a 100 \xB7 m\xE1s alto es mejor</small></th>'+s.map((M,A)=>{let E=Math.abs(h[A]-f)<1e-9;return`<td class="${E?"mejor":""}"><strong>${_t(h[A],1)}</strong>${E?'<span class="marca-mejor">Mejor</span>':""}</td>`}).join("")+"</tr>",v=Object.entries(ms).filter(([M])=>a.enlaceActivo||M!=="respaldo").map(([M,A])=>`<tr class="fila-desglose"><th scope="row">Puntaje: ${yo[M]}<br><small class="c-neutro">peso ${_t(A,2)} \xB7 0 a 100</small></th>`+d.map(E=>{let g=E.partes[M];return`<td>${g==null?'<span class="c-neutro">sin datos</span>':_t(g,0)}</td>`}).join("")+"</tr>").join(""),p={"\xB0":M=>`${_t(M,1)}\xB0`,m:M=>`${_t(M,2)} m`,km:M=>`${_t(M,1)} km`},m=ps.map(M=>{if(M.enlace&&!a.enlaceActivo)return`<tr class="sin-datos"><th scope="row">${M.etiqueta}</th><td colspan="${s.length}">Activa el enlace local para comparar esta m\xE9trica.</td></tr>`;let A=r.mejores[M.clave]||[],E=M.mejor==="max"?"m\xE1s alto es mejor":M.mejor==="min"?"m\xE1s bajo es mejor":"informativo",g=M.clave==="brecha"&&!a.enlaceActivo?"Mayor intervalo sin vista a la Tierra":M.etiqueta,b=s.map(N=>{let R=dr(N.metricas,M.clave);if(R==null)return`<td><span class="c-neutro">${M.clave==="hielo"&&N.metricas.terreno&&N.metricas.terreno.dist_psr_km===null?"m\xE1s de 25 km":"sin datos"}</span></td>`;let I=A.includes(N.sitio.id),U=M.unidad==="%"?`${_t(R,1)} %`:p[M.unidad]?p[M.unidad](R):`${R} h`,V={pctSol:"horasSol",pctTierra:"horasTierra",pctSolTierra:"horasSolTierra",pctRespaldo:"horasRespaldo"},C=N.metricas.terreno?.aproximacion,O=M.clave==="aproximacion"&&C?`<small>llegando desde ${C.mejor_az_deg}\xB0 (azimut)</small>`:M.clave==="hielo"&&N.metricas.terreno?.en_psr?"<small>el sitio est\xE1 en sombra permanente</small>":M.unidad==="%"&&V[M.clave]?`<small>${N.metricas[V[M.clave]]} h</small>`:"";return`<td class="${I?"mejor":""}">${U}${O}${I?'<span class="marca-mejor">Mejor</span>':""}</td>`}).join("");return`<tr><th scope="row">${g}<br><small class="c-neutro">${E}</small></th>${b}</tr>`}).join("");i.innerHTML=`<caption class="sr">Comparaci\xF3n de los tres sitios en el periodo seleccionado</caption>${u}<tbody>${_}${v}${m}</tbody>`;let S=r.resumen.map(M=>{let A=M.metricas.length;return`<li><strong>${De(M.sitio.etiqueta)}, ${De(M.sitio.nombre_corto)}</strong>: mejor en ${A} de ${M.total} m\xE9tricas (${De(M.metricas.join(", "))}).</li>`}),w=r.conclusiones.filter(M=>M.includes("empat"));t.innerHTML=[...S,...w.map(M=>`<li>${De(M)}</li>`)].join("")}var ve=i=>document.querySelector(i),Jl=["resumen","sitios","comparador","enlace","metodologia"],l_={resumen:"Luz, comunicaci\xF3n y enlace local del sitio activo en el periodo elegido.",sitios:"Ubicaci\xF3n real y horizonte LOLA del sitio en la hora seleccionada.",comparador:"Los tres sitios sobre el mismo periodo y los mismos supuestos.",enlace:"Estado del enlace de respaldo hora por hora y por qu\xE9 cambia.",metodologia:"Qu\xE9 se calcula, con qu\xE9 datos y qu\xE9 l\xEDmites tiene la demo."},c_={resumen:"Resumen",sitios:"Sitios",comparador:"Comparador",enlace:"Enlace local",metodologia:"Metodolog\xEDa"};function Zu(i){return{vista:"resumen",sitioId:"shackleton",desde:_s(i[0]),hasta:_s(i[i.length-1]),tipoEnlace:"rf",enlaceActivo:!0,polvo:!1,modoHorizonte:"perfil",indice:0,paso:1}}async function h_(){let i;try{i=await Sc()}catch(H){ve(".principal").insertAdjacentHTML("afterbegin",`<div class="tarjeta" role="alert"><h2>No se pudieron cargar los datos</h2><p>${De(H.message)} Abre la demo con un servidor local (ver README) o usa la versi\xF3n empaquetada.</p></div>`);return}let{escenario:e,efemerides:t}=i,n=e.sitios,s=t[n[0].id],r=s.map(H=>Dn(H.t)),a=Zu(r),o=location.hash.slice(1);Jl.includes(o)&&(a.vista=o);let l=n.find(H=>H.id===new URLSearchParams(location.search).get("sitio"));l&&(a.sitioId=l.id);let c="",u={};function d(){let H=[a.tipoEnlace,a.polvo,a.modoHorizonte].join("|");if(H!==c){u={};for(let Oe of n)u[Oe.id]=mc(Oe,t[Oe.id],{modoHorizonte:a.modoHorizonte,tipoEnlace:a.tipoEnlace,polvo:a.polvo,reglas:e.enlace_local,eventoPolvo:e.evento_polvo});c=H}let[te,pe]=h(),Ne=n.find(Oe=>Oe.id===a.sitioId),Je=u[Ne.id],at=n.map(Oe=>({sitio:Oe,metricas:{...gc(u[Oe.id],te,pe,a.enlaceActivo),terreno:Oe.terreno??null}}));return{escenario:e,sitios:n,sitio:Ne,serie:Je,i0:te,i1:pe,estado:a,indice:a.indice,muestra:Je[a.indice],metricas:at.find(Oe=>Oe.sitio.id===Ne.id).metricas,filas:at,comparacion:vc(at,a.enlaceActivo)}}function h(){let H=Dn(`${a.desde}T00`),te=Dn(`${a.hasta}T23`),pe=r.findIndex(Je=>Je>=H),Ne=r.length-1;for(;Ne>0&&r[Ne]>te;)Ne--;return pe<0&&(pe=0),Ne<pe&&(Ne=pe),[pe,Ne]}let f={sitio:ve("#c-sitio"),rf:ve("#c-rf"),optico:ve("#c-optico"),enlace:ve("#c-enlace"),polvo:ve("#c-polvo"),polvoEnv:ve("#c-polvo-envoltura"),horizonte:ve("#c-horizonte")};f.sitio.innerHTML=n.map(H=>`<option value="${H.id}">${De(H.etiqueta)}: ${De(H.nombre_corto)}</option>`).join("");let _=_s(r[0]),v=_s(r[r.length-1]),p=[...document.querySelectorAll("[data-periodo]")].map((H,te)=>{H.innerHTML=`
      <span aria-hidden="true">Periodo UTC</span>
      <label class="sr" for="p${te}-desde">Desde</label><input type="date" id="p${te}-desde" min="${_}" max="${v}" required>
      <span aria-hidden="true">a</span>
      <label class="sr" for="p${te}-hasta">Hasta</label><input type="date" id="p${te}-hasta" min="${_}" max="${v}" required>
      <p class="periodo__nota" aria-live="polite"></p>`;let pe=H.querySelector(`#p${te}-desde`),Ne=H.querySelector(`#p${te}-hasta`),Je=H.querySelector(".periodo__nota"),at=()=>{let Oe=pe.value||_,mt=Ne.value||v,ht=lt=>lt<_?_:lt>v?v:lt,ut="";(Oe!==ht(Oe)||mt!==ht(mt))&&(ut=`Los datos disponibles van del ${_} al ${v}; ajust\xE9 el periodo.`),Oe=ht(Oe),mt=ht(mt),Oe>mt&&([Oe,mt]=[mt,Oe],ut="La fecha final era anterior a la inicial; las intercambi\xE9."),p.forEach(lt=>{lt.nota.textContent=ut}),S({desde:Oe,hasta:mt})};return pe.addEventListener("change",at),Ne.addEventListener("change",at),{desde:pe,hasta:Ne,nota:Je}});function m(){f.sitio.value=a.sitioId;for(let H of p)H.desde.value=a.desde,H.hasta.value=a.hasta;f.rf.checked=a.tipoEnlace==="rf",f.optico.checked=a.tipoEnlace==="optico",f.rf.disabled=f.optico.disabled=!a.enlaceActivo,f.enlace.checked=a.enlaceActivo,f.polvo.checked=a.polvo,f.polvoEnv.hidden=!(a.enlaceActivo&&a.tipoEnlace==="optico"),f.horizonte.options[0].textContent=pr("perfil",n.find(H=>H.id===a.sitioId)),f.horizonte.value=a.modoHorizonte,ve("#t-paso").value=String(a.paso)}function S(H,{completo:te=!0}={}){a={...a,...H};let[pe,Ne]=h();a.indice=Math.max(pe,Math.min(Ne,a.indice)),Pe(te)}f.sitio.addEventListener("change",()=>S({sitioId:f.sitio.value})),f.rf.addEventListener("change",()=>S({tipoEnlace:"rf"})),f.optico.addEventListener("change",()=>S({tipoEnlace:"optico"})),f.enlace.addEventListener("change",()=>S({enlaceActivo:f.enlace.checked})),f.polvo.addEventListener("change",()=>{let H={polvo:f.polvo.checked};if(f.polvo.checked){let te=ur(r.map(Je=>({ms:Je})),e.evento_polvo),[pe,Ne]=h();te&&te[0]>=pe&&te[0]<=Ne&&(H.indice=te[0])}S(H)}),f.horizonte.addEventListener("change",()=>S({modoHorizonte:f.horizonte.value})),ve("#c-reset").addEventListener("click",()=>{U(),p.forEach(H=>{H.nota.textContent=""}),a={...Zu(r),vista:a.vista},Pe(!0)});let w=ve("#dialogo-ayuda");ve("#ayuda-estados").innerHTML=`
    <dt>Sol visible / Sombra</dt><dd>El Sol est\xE1 por encima o por debajo del horizonte local en esa hora.</dd>
    <dt>Tierra visible / Tierra oculta</dt><dd>Hay o no vista directa a la Tierra para comunicar sin intermediarios.</dd>
    ${Object.values(Ot).map(H=>`<dt class="${H.clase}">${H.texto}</dt><dd>${H.ayuda}</dd>`).join("")}
    <dt>Respaldo hacia la Tierra</dt><dd>Disponible solo si el tramo local funciona y el punto de apoyo ve la Tierra.</dd>`,ve("#c-ayuda").addEventListener("click",()=>w.showModal());let M={en_uso:["En uso","var(--ok)"],prevista:["Integraci\xF3n prevista","var(--acento-claro)"]};ve("#fuentes").innerHTML=Object.values(e.fuentes).map(H=>{let[te,pe]=M[H.estado]||[H.estado,"var(--texto-2)"],Ne=H===e.fuentes.efemerides&&e.generado_utc?` Datos pedidos a Horizons el ${De(e.generado_utc.replace("T"," ").replace("Z"," UTC"))}.`:"";return`<div><dt>${De(H.nombre)} <span class="estado-fuente" style="color:${pe}">${te}</span></dt><dd>${De(H.detalle)}${Ne}</dd></div>`}).join("")+'<div><dt>Punto de apoyo, umbrales y momento del evento de polvo <span class="estado-fuente" style="color:var(--acento-claro)">Supuestos de demostraci\xF3n</span></dt><dd>Precedentes: concepto de relevo LunaNet / Lunar Communications Relay (RF), l\xE1ser O2O de Artemis II y \u201Chorizon glow\u201D observado desde Apollo (\xF3ptico).</dd></div>';let A=e.enlace_local;if(ve("#reglas-enlace").innerHTML=`
    <li><strong>Radiofrecuencia:</strong> requiere l\xEDnea de vista al punto de apoyo. Si el punto de apoyo queda en sombra opera con bater\xEDa (robusto); tras ${A.rf.bateria_relevo_h} h en sombra se considera sin enlace.</li>
    <li><strong>\xD3ptico:</strong> si el Sol queda a menos de ${A.optico.sep_robusto_deg}\xB0 de la l\xEDnea de vista el enlace pasa a robusto; a menos de ${A.optico.sep_sin_enlace_deg}\xB0 queda sin enlace. El evento de polvo dura ${e.evento_polvo.duracion_s} s, calibrado con Apollo (10\u201312 s de polvo visible en el descenso final). Como cada muestra vale una hora, esa hora pasa a robusto; solo un evento de media hora o m\xE1s la dejar\xEDa sin enlace. El momento del aterrizaje cercano es un supuesto.</li>`,""){let H=ve("#consultar-horizons"),te=ve("#estado-horizons");ve("#consulta-vivo").hidden=!1;let pe=(Ne,Je=!1)=>{te.textContent=Ne,te.classList.toggle("consulta-vivo__estado--error",Je)};H.addEventListener("click",async()=>{H.disabled=!0,H.textContent="Consultando\u2026",pe(`Pidiendo a JPL Horizons el Sol y la Tierra de ${n.length} sitios\u2026`);try{let Ne=new Date(Dn(s[s.length-1].t)+864e5).toISOString().slice(0,10),Je=await Ec({proxy:"",sitios:n,inicio:s[0].t.slice(0,10),fin:Ne}),at=new Set(s.map(ut=>ut.t)),Oe=Object.fromEntries(Object.entries(Je).map(([ut,lt])=>[ut,lt.filter(Lt=>at.has(Lt.t))])),mt=0;for(let ut of n){let lt=Oe[ut.id],Lt=hr(lt,ut.id);if(Lt.length)throw new Error(Lt[0]);let D=t[ut.id];if(lt.length!==D.length||lt.some((Mt,nt)=>Mt.t!==D[nt].t))throw new Error(`Horizons devolvi\xF3 otras horas para ${ut.id}; se conservan los datos publicados.`);for(let Mt=0;Mt<lt.length;Mt++)for(let nt of["sol_el","sol_az","tierra_el","tierra_az"]){let st=Math.abs(lt[Mt][nt]-D[Mt][nt]);nt.endsWith("_az")&&(st=Math.min(st,360-st)),mt=Math.max(mt,st)}}Object.assign(t,Oe),c="",Pe(!0);let ht=new Date().toLocaleString("es-MX",{dateStyle:"medium",timeStyle:"short"});pe(`Datos en vivo de JPL Horizons (${ht}). Diferencia m\xE1xima con los publicados: ${mt.toFixed(6)}\xB0.`)}catch(Ne){pe(`${Ne.message} La demo sigue con los datos publicados.`,!0)}finally{H.disabled=!1,H.textContent="Consultar JPL Horizons ahora"}})}function E(){for(let H of Jl){let te=ve(`#vista-${H}`),pe=H===a.vista;pe&&te.hidden&&(te.classList.remove("vista--entra"),te.offsetWidth,te.classList.add("vista--entra")),te.hidden=!pe}document.querySelectorAll(".lateral__item").forEach(H=>{H.dataset.vista===a.vista?H.setAttribute("aria-current","page"):H.removeAttribute("aria-current")}),ve("#contenido").dataset.vista=a.vista,ve("#cab-titulo").textContent=c_[a.vista],ve("#cab-sub").textContent=l_[a.vista],ve("#luna-tarjeta").hidden=a.vista!=="resumen"}window.addEventListener("hashchange",()=>{let H=location.hash.slice(1);Jl.includes(H)&&(a.vista=H,Pe(!0))});let g=H=>{H!==a.indice&&S({indice:H},{completo:!1})},b=Lc(ve("#evolucion"),{alCambiarIndice:g}),N=$u(ve("#tiempo"),ve("#tooltip"),{alCambiarIndice:g}),R=null,I=ve("#t-play");function U(){clearInterval(R),R=null,I.setAttribute("aria-pressed","false"),I.querySelector(".accion__texto").textContent="Reproducir"}function V(){let[H,te]=h();a.indice>=te&&S({indice:H},{completo:!1}),I.setAttribute("aria-pressed","true"),I.querySelector(".accion__texto").textContent="Pausar",R=setInterval(()=>{let[,pe]=h(),Ne=a.indice+a.paso;if(Ne>pe){S({indice:pe},{completo:!1}),U();return}S({indice:Ne},{completo:!1})},160)}I.addEventListener("click",()=>R?U():V()),ve("#t-paso").addEventListener("change",H=>{a.paso=Number(H.target.value)}),ve("#t-adelante").addEventListener("click",()=>S({indice:a.indice+a.paso},{completo:!1})),ve("#t-atras").addEventListener("click",()=>S({indice:a.indice-a.paso},{completo:!1})),ve("#t-inicio").addEventListener("click",()=>S({indice:h()[0]},{completo:!1})),ve("#ir-brecha").addEventListener("click",()=>{let H=d();H.metricas.brecha.horas>0&&S({indice:H.metricas.brecha.desde},{completo:!1})});let C=window.claude?.use?window.claude.use("downloads").catch(()=>null):Promise.resolve(null);ve("#exportar-csv").addEventListener("click",async()=>{let H=d(),te="\uFEFF"+yc(H.filas,{inicio:`${H.serie[H.i0].t}Z`,fin:`${H.serie[H.i1].t}Z`,enlaceActivo:a.enlaceActivo,tipoEnlace:a.tipoEnlace,polvo:a.polvo,modoHorizonte:Ac(a.modoHorizonte,H.sitio)}),pe=`comparativo-sitios_${a.desde}_${a.hasta}.csv`,Ne=await C;if(Ne){try{await Ne.save({filename:pe,data:te})}catch(Oe){Oe?.code!=="declined"&&(ve("#comparador-meta").textContent+=" No se pudo exportar el CSV en esta vista.")}return}let Je=URL.createObjectURL(new Blob([te],{type:"text/csv;charset=utf-8"})),at=Object.assign(document.createElement("a"),{href:Je,download:pe});document.body.append(at),at.click(),at.remove(),setTimeout(()=>URL.revokeObjectURL(Je),1e3)});let O=()=>matchMedia("(prefers-reduced-motion: reduce)").matches,X=H=>{H===a.sitioId&&F?F.enfocarSitio(n.find(te=>te.id===H)):S({sitioId:H})},F=Fu(ve("#luna"),{alElegir:X,urlTextura:document.getElementById("textura-luna")?.getAttribute("href")||null,urlPolo:document.getElementById("relieve-polo")?.getAttribute("href")||null,reducirMovimiento:O}),ie=F?null:To(ve("#luna"),X);F||ve("#luna").classList.add("luna--sin-webgl");let G=To(ve("#mapa"),X),ee="../docs/mapeo-lunar-3d-ilustrativo.html?embebido=1&v=20261115e",se=location.protocol==="file:"||!!document.getElementById("datos-demo"),Se=se?"2d":"3d",Te=null,Z="lunar";function q(H=d(),te=!1){if(!Te||!Te.dataset.listo)return;let pe=Te.contentWindow,Ne=H.muestra;try{pe.postMessage({tipo:"sitio",id:a.sitioId},location.origin),pe.postMessage({tipo:"sol",theta:H.sitio.lon+Ne.sol.az,el:Ne.sol.el,visible:Ne.sol.visible,inmediato:te},location.origin),Te.dataset.modo!==Z&&(pe.postMessage({tipo:"modo",modo:Z},location.origin),Te.dataset.modo=Z)}catch{delete Te.dataset.listo}}function Q(){let H="Bajo",te="Alto";try{let pe=Te&&Te.contentDocument;H=pe?.getElementById("leyenda-min")?.textContent||H,te=pe?.getElementById("leyenda-max")?.textContent||te}catch{}ve("#leyenda-alturas").innerHTML=`<span>${De(H)}</span><span class="leyenda-alturas__barra" aria-hidden="true"></span><span>${De(te)}</span>`}function fe(){let H=Se==="3d";H&&!Te&&(Te=document.createElement("iframe"),Te.className="visor3d__marco",Te.title="Vista 3D del relieve LOLA con los tres sitios",Te.src=ee,Te.addEventListener("load",()=>{let te=!1;try{te=!!Te.contentDocument?.body?.classList.contains("m-visor")}catch{te=!1}if(!te){Se="2d",ve("#estado-terreno").textContent="No se pudo cargar la vista 3D; se muestra el mapa polar 2D.",fe(),G.render(d());return}ve("#estado-terreno").textContent="",Te.dataset.listo="1",delete Te.dataset.modo,q(d(),!0),Q()}),ve("#terreno").append(Te)),ve("#tarjeta-mapa").dataset.modo=H?"3d":"2d",ve("#terreno").hidden=!H,ve("#mapa").hidden=H,ve("#leyenda-mapa").hidden=H,ve("#relieve-visor").hidden=!H,ve("#leyenda-alturas").hidden=!(H&&Z==="topo"),ve("#sub-mapa").textContent=H?"Relieve real LOLA (promedio de 1 km); arrastra para girar y pulsa un sitio para elegirlo":"Proyecci\xF3n polar con coordenadas reales; pulsa un sitio para elegirlo";for(let te of ve("#modo-mapa").querySelectorAll("button"))te.setAttribute("aria-pressed",String(te.dataset.modo===Se))}window.addEventListener("message",H=>{!Te||H.source!==Te.contentWindow||H.origin!==location.origin||H.data&&H.data.tipo==="sitio-visor"&&n.some(te=>te.id===H.data.id)&&H.data.id!==a.sitioId&&S({sitioId:H.data.id})}),ve("#relieve-visor").addEventListener("click",H=>{let te=H.target.closest("button[data-relieve]");if(te){Z=te.dataset.relieve;for(let pe of ve("#relieve-visor").querySelectorAll("button"))pe.setAttribute("aria-pressed",String(pe===te));Q(),fe(),q()}}),ve("#modo-mapa").addEventListener("click",H=>{let te=H.target.closest("button[data-modo]");te&&(Se=te.dataset.modo,fe(),Se==="2d"&&G.render(d()))}),se?ve("#estado-terreno").textContent="La vista 3D necesita conexi\xF3n: aqu\xED se muestra el mapa polar 2D.":(ve("#modo-mapa").hidden=!1,ve("#visor-completo").hidden=!1),ve("#luna-sitios").addEventListener("click",H=>{let te=H.target.closest("button");te&&(te.dataset.sitio?X(te.dataset.sitio):te.dataset.accion==="tres"&&F&&F.verTres())});let oe=[];function Pe(H){let te=d();H&&(m(),E(),oe=_c(te.serie,te.i0,te.i1,a.enlaceActivo)),Nc(ve("#hora-utc"),ve("#fecha-utc"),te.muestra),Uc(ve("#destacada"),te),Fc(ve("#eventos"),ve("#eventos-total"),te,oe,pe=>S({indice:pe},{completo:!1})),a.vista==="resumen"?(Ou(ve("#luna-sitios"),te,!!F),Bu(ve("#luna-ficha"),te,!!F),F?F.render(te):ie.render(te),H?(Cc(ve("#franja"),te),Rc(ve("#lectura-resumen"),te),Ic(ve("#disponibilidad"),te),Pc(ve("#mini-comparativo"),te),b.dibujar(te)):b.moverCursor(te)):a.vista==="sitios"?(H&&Gu(ve("#leyenda-horizonte"),a),Bc(ve("#estado"),te),H&&!Te&&Se==="3d"&&fe(),Se==="3d"?q(te):G.render(te),Vu(ve("#grafica-horizonte"),te)):a.vista==="comparador"?H&&qu(ve("#tabla-comparador"),ve("#comparador-meta"),ve("#conclusiones"),te):a.vista==="enlace"&&(H?(Xu(ve("#leyenda-tiempo"),a),N.dibujar(te)):N.moverCursor(te),Oc(ve("#porque"),te))}let tt=window.innerWidth,Re=null;window.addEventListener("resize",()=>{window.innerWidth!==tt&&(tt=window.innerWidth,clearTimeout(Re),Re=setTimeout(()=>Pe(!0),150))}),Wc(ve("#leyenda-mapa")),Pe(!0),l&&F&&a.vista==="resumen"&&setTimeout(()=>F.enfocarSitio(l),450)}h_();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
