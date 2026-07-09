import{g as m,j as h,D as _,m as f,c as t,a as o,v as a,b as r,x as c,t as p,av as y,p as k,o as n,_ as B}from"./DIcwXevQ.js";import{M as w}from"./b1g7WSj1.js";/**
 * @license lucide-vue-next v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=m("ArrowLeftIcon",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]),v={class:"main-layout"},M={class:"main-layout-header"},x={class:"main-layout-title"},g={class:"main-layout-body"},C=h({__name:"MainLayout",props:{title:{},showBackButton:{type:Boolean,default:!0},showMenuButton:{type:Boolean,default:!0}},setup(e){const i=_(),u=f();function l(){window.history.length>1?u.back():k("/home")}return(d,s)=>(n(),t("div",v,[o("header",M,[e.showMenuButton?(n(),t("button",{key:0,class:"header-icon-btn",onClick:s[0]||(s[0]=L=>a(i).openDrawer())},[r(a(w),{size:20})])):c("",!0),o("h1",x,p(e.title),1),e.showBackButton?(n(),t("button",{key:1,class:"header-icon-btn",onClick:l},[r(a(b),{size:20})])):c("",!0)]),o("main",g,[y(d.$slots,"default",{},void 0,!0)])]))}}),A=B(C,[["__scopeId","data-v-572dfc71"]]);export{b as A,A as _};
