import{s as z,n as B,r as U,o as q}from"../chunks/scheduler.e108d1fd.js";import{S as H,i as N,g as V,s as D,m as y,h as P,j,f as m,c as E,y as O,n as I,k as v,l as W,a as w,x as u,z as R,A as $,o as A,B as F,r as G,u as J,v as K,d as Q,t as X,w as Y}from"../chunks/index.54605d54.js";import{_ as Z}from"../chunks/preload-helper.a4192956.js";function tt(o){let s,i,e,n,p,t,c="reset",g,l,_,T,b,C,S,k,L,M,d,h;return{c(){s=V("div"),i=D(),e=V("div"),n=V("input"),p=D(),t=V("button"),t.textContent=c,g=D(),l=V("div"),_=y("speed: "),T=y(o[2]),b=y(`m/s\r
        long: `),C=y(o[0]),S=y(`\r
        lat: `),k=y(o[1]),L=D(),M=y(x),this.h()},l(a){s=P(a,"DIV",{id:!0,style:!0}),j(s).forEach(m),i=E(a),e=P(a,"DIV",{class:!0});var r=j(e);n=P(r,"INPUT",{class:!0,type:!0,min:!0,max:!0}),p=E(r),t=P(r,"BUTTON",{class:!0,"data-svelte-h":!0}),O(t)!=="svelte-fomk9w"&&(t.textContent=c),r.forEach(m),g=E(a),l=P(a,"DIV",{});var f=j(l);_=I(f,"speed: "),T=I(f,o[2]),b=I(f,`m/s\r
        long: `),C=I(f,o[0]),S=I(f,`\r
        lat: `),k=I(f,o[1]),L=E(f),M=I(f,x),f.forEach(m),this.h()},h(){v(s,"id","map"),W(s,"height","500px"),v(n,"class","slider"),v(n,"type","range"),v(n,"min","0"),v(n,"max","100"),v(t,"class","button"),v(e,"class","slider-container")},m(a,r){w(a,s,r),w(a,i,r),w(a,e,r),u(e,n),R(n,o[3]),u(e,p),u(e,t),w(a,g,r),w(a,l,r),u(l,_),u(l,T),u(l,b),u(l,C),u(l,S),u(l,k),u(l,L),u(l,M),d||(h=[$(n,"change",o[4]),$(n,"change",o[6]),$(n,"input",o[6]),$(t,"click",o[5])],d=!0)},p(a,[r]){r&8&&R(n,a[3]),r&4&&A(T,a[2]),r&1&&A(C,a[0]),r&2&&A(k,a[1])},i:B,o:B,d(a){a&&(m(s),m(i),m(e),m(g),m(l)),d=!1,U(h)}}}let x=0;function et(o,s,i){let e,n,p,t=0,c=0,g=0,l=0;q(async()=>{n=await Z(()=>import("../chunks/leaflet-src.e35a4304.js").then(L=>L.l),[],import.meta.url),e=n.map("map").setView([0,0],1),n.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(e);const S=async()=>{const M=await(await fetch("http://api.open-notify.org/iss-now.json")).json(),d=M.iss_position.latitude,h=M.iss_position.longitude;p?p.setLatLng([d,h]):p=n.marker([d,h]).addTo(e).bindPopup("ISS Current Location").openPopup(),e.setView([d,h],4),l<60,console.log(),l+=6,i(2,g=Math.pow(Math.pow(h-t,2)+Math.pow(d-c,2),.5)/6),i(0,t=h),i(1,c=d)};S();const k=setInterval(S,6e3);return()=>{clearInterval(k)}});let _=50,T=()=>{console.log(_)},b=()=>{i(3,_=50)};function C(){_=F(this.value),i(3,_)}return[t,c,g,_,T,b,C]}class st extends H{constructor(s){super(),N(this,s,et,tt,z,{})}}function nt(o){let s,i,e,n='<h1 class="typing-animation">Welcome to the International Space Station real time Tracker (ISSRTT).</h1>',p;return s=new st({}),{c(){G(s.$$.fragment),i=D(),e=V("div"),e.innerHTML=n,this.h()},l(t){J(s.$$.fragment,t),i=E(t),e=P(t,"DIV",{class:!0,"data-svelte-h":!0}),O(e)!=="svelte-1dn0h87"&&(e.innerHTML=n),this.h()},h(){v(e,"class","container")},m(t,c){K(s,t,c),w(t,i,c),w(t,e,c),p=!0},p:B,i(t){p||(Q(s.$$.fragment,t),p=!0)},o(t){X(s.$$.fragment,t),p=!1},d(t){t&&(m(i),m(e)),Y(s,t)}}}class it extends H{constructor(s){super(),N(this,s,null,nt,z,{})}}export{it as component};