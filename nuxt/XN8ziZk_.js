import{_ as h}from"./XeBM0mME.js";import{_ as y}from"./DGQDFDqB.js";import{_ as v}from"./D3PCs1Vf.js";import{g as o,j as _,s as f,w as i,o as k,a as t,b as s,v as e,N as x,y as M,A as b,B as z,r as c,p as g,_ as q}from"./CFOLWpXS.js";import"./DnPRtPRg.js";/**
 * @license lucide-vue-next v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=o("CameraIcon",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-vue-next v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=o("FlashlightIcon",[["path",{d:"M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z",key:"1orkel"}],["line",{x1:"6",x2:"18",y1:"6",y2:"6",key:"1z11jq"}],["line",{x1:"12",x2:"12",y1:"12",y2:"12",key:"1f4yc1"}]]);/**
 * @license lucide-vue-next v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=o("KeyboardIcon",[["path",{d:"M10 8h.01",key:"1r9ogq"}],["path",{d:"M12 12h.01",key:"1mp3jc"}],["path",{d:"M14 8h.01",key:"1primd"}],["path",{d:"M16 12h.01",key:"1l6xoz"}],["path",{d:"M18 8h.01",key:"emo2bl"}],["path",{d:"M6 8h.01",key:"x9i8wu"}],["path",{d:"M7 16h10",key:"wp8him"}],["path",{d:"M8 12h.01",key:"czm47f"}],["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}]]);/**
 * @license lucide-vue-next v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=o("ScanLineIcon",[["path",{d:"M3 7V5a2 2 0 0 1 2-2h2",key:"aa7l1z"}],["path",{d:"M17 3h2a2 2 0 0 1 2 2v2",key:"4qcy5o"}],["path",{d:"M21 17v2a2 2 0 0 1-2 2h-2",key:"6vwrx8"}],["path",{d:"M7 21H5a2 2 0 0 1-2-2v-2",key:"ioqczr"}],["path",{d:"M7 12h10",key:"b7w52i"}]]),L={class:"qr-page"},B={class:"scanner-frame"},R={class:"scanner-placeholder"},S={class:"scanner-overlay"},j={class:"manual-head"},N=_({__name:"qr-scan",setup(Q){const n=c(""),l=c(!1);function d(){n.value.trim()&&g("/bike-details")}return(U,a)=>{const p=h,u=y,m=v;return k(),f(m,{title:"اسکن QR"},{default:i(()=>[t("div",L,[t("div",B,[t("div",R,[s(e(w),{size:48,class:"text-muted"}),a[2]||(a[2]=t("p",null,"دوربین QR",-1)),a[3]||(a[3]=t("span",{class:"text-muted"},"دوربین را به سمت کد QR دوچرخه بگیرید",-1))]),t("div",S,[a[4]||(a[4]=t("div",{class:"corner corner-tl"},null,-1)),a[5]||(a[5]=t("div",{class:"corner corner-tr"},null,-1)),a[6]||(a[6]=t("div",{class:"corner corner-bl"},null,-1)),a[7]||(a[7]=t("div",{class:"corner corner-br"},null,-1)),s(e(I),{size:32,class:"scan-line"})]),t("button",{class:"flash-btn",onClick:a[0]||(a[0]=r=>l.value=!e(l))},[s(e(C),{size:20,class:x({active:e(l)})},null,8,["class"])])]),s(u,{padding:"20px",class:"manual-card"},{default:i(()=>[t("div",j,[s(e(V),{size:20,class:"text-primary"}),a[8]||(a[8]=t("span",null,"ورود دستی کد",-1))]),M(t("input",{"onUpdate:modelValue":a[1]||(a[1]=r=>b(n)?n.value=r:null),type:"text",dir:"ltr",class:"app-input",placeholder:"کد دوچرخه را وارد کنید"},null,512),[[z,e(n)]]),s(p,{"button-text":"تأیید کد","is-enabled":e(n).trim().length>0,"on-tap":d},null,8,["is-enabled"])]),_:1})])]),_:1})}}}),T=q(N,[["__scopeId","data-v-a9787ff7"]]);export{T as default};
