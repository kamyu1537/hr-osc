var app=function(){"use strict";function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function o(){return Object.create(null)}function i(t){t.forEach(n)}function r(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e,n,o){if(t){const i=l(t,e,n,o);return t[0](i)}}function l(t,n,o,i){return t[1]&&i?e(o.ctx.slice(),t[1](i(n))):o.ctx}function a(t,e,n,o,i,r,c){const s=function(t,e,n,o){if(t[2]&&o){const i=t[2](o(n));if(void 0===e.dirty)return i;if("object"==typeof i){const t=[],n=Math.max(e.dirty.length,i.length);for(let o=0;o<n;o+=1)t[o]=e.dirty[o]|i[o];return t}return e.dirty|i}return e.dirty}(e,o,i,r);if(s){const i=l(e,n,o,c);t.p(i,s)}}function u(t){const e={};for(const n in t)"$"!==n[0]&&(e[n]=t[n]);return e}function d(t){return null==t?"":t}let f,p=!1;function m(t,e,n,o){for(;t<e;){const i=t+(e-t>>1);n(i)<=o?t=i+1:e=i}return t}function h(t,e){p?(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;const e=t.childNodes,n=new Int32Array(e.length+1),o=new Int32Array(e.length);n[0]=-1;let i=0;for(let t=0;t<e.length;t++){const r=m(1,i+1,(t=>e[n[t]].claim_order),e[t].claim_order)-1;o[t]=n[r]+1;const c=r+1;n[c]=t,i=Math.max(c,i)}const r=[],c=[];let s=e.length-1;for(let t=n[i]+1;0!=t;t=o[t-1]){for(r.push(e[t-1]);s>=t;s--)c.push(e[s]);s--}for(;s>=0;s--)c.push(e[s]);r.reverse(),c.sort(((t,e)=>t.claim_order-e.claim_order));for(let e=0,n=0;e<c.length;e++){for(;n<r.length&&c[e].claim_order>=r[n].claim_order;)n++;const o=n<r.length?r[n]:null;t.insertBefore(c[e],o)}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild),e!==t.actual_end_child?t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling):e.parentNode!==t&&t.appendChild(e)}function g(t,e,n){p&&!n?h(t,e):(e.parentNode!==t||n&&e.nextSibling!==n)&&t.insertBefore(e,n||null)}function $(t){t.parentNode.removeChild(t)}function v(t){return document.createElement(t)}function w(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function x(t){return document.createTextNode(t)}function y(){return x(" ")}function _(){return x("")}function b(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function C(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function j(t){return""===t?null:+t}function S(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function E(t,e){t.value=null==e?"":e}function A(t,e,n,o){t.style.setProperty(e,n,o?"important":"")}function k(t){f=t}function z(){const t=function(){if(!f)throw new Error("Function called outside component initialization");return f}();return(e,n)=>{const o=t.$$.callbacks[e];if(o){const i=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);o.slice().forEach((e=>{e.call(t,i)}))}}}const N=[],P=[],B=[],q=[],M=Promise.resolve();let O=!1;function L(t){B.push(t)}let R=!1;const W=new Set;function G(){if(!R){R=!0;do{for(let t=0;t<N.length;t+=1){const e=N[t];k(e),H(e.$$)}for(k(null),N.length=0;P.length;)P.pop()();for(let t=0;t<B.length;t+=1){const e=B[t];W.has(e)||(W.add(e),e())}B.length=0}while(N.length);for(;q.length;)q.pop()();O=!1,R=!1,W.clear()}}function H(t){if(null!==t.fragment){t.update(),i(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(L)}}const I=new Set;let D;function T(){D={r:0,c:[],p:D}}function F(){D.r||i(D.c),D=D.p}function Q(t,e){t&&t.i&&(I.delete(t),t.i(e))}function Y(t,e,n,o){if(t&&t.o){if(I.has(t))return;I.add(t),D.c.push((()=>{I.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function J(t,e){const n={},o={},i={$$scope:1};let r=t.length;for(;r--;){const c=t[r],s=e[r];if(s){for(const t in c)t in s||(o[t]=1);for(const t in s)i[t]||(n[t]=s[t],i[t]=1);t[r]=s}else for(const t in c)i[t]=1}for(const t in o)t in n||(n[t]=void 0);return n}function K(t){return"object"==typeof t&&null!==t?t:{}}function U(t){t&&t.c()}function V(t,e,o,c){const{fragment:s,on_mount:l,on_destroy:a,after_update:u}=t.$$;s&&s.m(e,o),c||L((()=>{const e=l.map(n).filter(r);a?a.push(...e):i(e),t.$$.on_mount=[]})),u.forEach(L)}function X(t,e){const n=t.$$;null!==n.fragment&&(i(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Z(t,e){-1===t.$$.dirty[0]&&(N.push(t),O||(O=!0,M.then(G)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function tt(e,n,r,c,s,l,a=[-1]){const u=f;k(e);const d=e.$$={fragment:null,ctx:null,props:l,update:t,not_equal:s,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:n.context||[]),callbacks:o(),dirty:a,skip_bound:!1};let m=!1;if(d.ctx=r?r(e,n.props||{},((t,n,...o)=>{const i=o.length?o[0]:n;return d.ctx&&s(d.ctx[t],d.ctx[t]=i)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](i),m&&Z(e,t)),n})):[],d.update(),m=!0,i(d.before_update),d.fragment=!!c&&c(d.ctx),n.target){if(n.hydrate){p=!0;const t=function(t){return Array.from(t.childNodes)}(n.target);d.fragment&&d.fragment.l(t),t.forEach($)}else d.fragment&&d.fragment.c();n.intro&&Q(e.$$.fragment),V(e,n.target,n.anchor,n.customElement),p=!1,G()}k(u)}class et{$destroy(){X(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function nt(t,e){void 0===e&&(e={});var n=e.insertAt;if(t&&"undefined"!=typeof document){var o=document.head||document.getElementsByTagName("head")[0],i=document.createElement("style");i.type="text/css","top"===n&&o.firstChild?o.insertBefore(i,o.firstChild):o.appendChild(i),i.styleSheet?i.styleSheet.cssText=t:i.appendChild(document.createTextNode(t))}}function ot(t){let e,n;return{c(){e=w("title"),n=x(t[0])},m(t,o){g(t,e,o),h(e,n)},p(t,e){1&e&&S(n,t[0])},d(t){t&&$(e)}}}function it(t){let e,n,o,i=t[0]&&ot(t);const r=t[3].default,c=s(r,t,t[2],null);return{c(){e=w("svg"),i&&i.c(),n=_(),c&&c.c(),C(e,"xmlns","http://www.w3.org/2000/svg"),C(e,"viewBox",t[1]),C(e,"class","svelte-c8tyih")},m(t,r){g(t,e,r),i&&i.m(e,null),h(e,n),c&&c.m(e,null),o=!0},p(t,[s]){t[0]?i?i.p(t,s):(i=ot(t),i.c(),i.m(e,n)):i&&(i.d(1),i=null),c&&c.p&&(!o||4&s)&&a(c,r,t,t[2],o?s:-1,null,null),(!o||2&s)&&C(e,"viewBox",t[1])},i(t){o||(Q(c,t),o=!0)},o(t){Y(c,t),o=!1},d(t){t&&$(e),i&&i.d(),c&&c.d(t)}}}function rt(t,e,n){let{$$slots:o={},$$scope:i}=e,{title:r=null}=e,{viewBox:c}=e;return t.$$set=t=>{"title"in t&&n(0,r=t.title),"viewBox"in t&&n(1,c=t.viewBox),"$$scope"in t&&n(2,i=t.$$scope)},[r,c,i,o]}nt("svg.svelte-c8tyih{stroke:currentColor;fill:currentColor;stroke-width:0;width:100%;height:auto;max-height:100%}");class ct extends et{constructor(t){super(),tt(this,t,rt,it,c,{title:0,viewBox:1})}}function st(t){let e;return{c(){e=w("path"),C(e,"d","M416.3 256c0-21 13.1-38.9 31.7-46.1-4.9-20.5-13-39.7-23.7-57.1-6.4 2.8-13.2 4.3-20.1 4.3-12.6 0-25.2-4.8-34.9-14.4-14.9-14.9-18.2-36.8-10.2-55-17.3-10.7-36.6-18.8-57-23.7C295 82.5 277 95.7 256 95.7S217 82.5 209.9 64c-20.5 4.9-39.7 13-57.1 23.7 8.1 18.1 4.7 40.1-10.2 55-9.6 9.6-22.3 14.4-34.9 14.4-6.9 0-13.7-1.4-20.1-4.3C77 170.3 68.9 189.5 64 210c18.5 7.1 31.7 25 31.7 46.1 0 21-13.1 38.9-31.6 46.1 4.9 20.5 13 39.7 23.7 57.1 6.4-2.8 13.2-4.2 20-4.2 12.6 0 25.2 4.8 34.9 14.4 14.8 14.8 18.2 36.8 10.2 54.9 17.4 10.7 36.7 18.8 57.1 23.7 7.1-18.5 25-31.6 46-31.6s38.9 13.1 46 31.6c20.5-4.9 39.7-13 57.1-23.7-8-18.1-4.6-40 10.2-54.9 9.6-9.6 22.2-14.4 34.9-14.4 6.8 0 13.7 1.4 20 4.2 10.7-17.4 18.8-36.7 23.7-57.1-18.4-7.2-31.6-25.1-31.6-46.2zm-159.4 79.9c-44.3 0-80-35.9-80-80s35.7-80 80-80 80 35.9 80 80-35.7 80-80 80z")},m(t,n){g(t,e,n)},d(t){t&&$(e)}}}function lt(t){let n,o;const i=[{viewBox:"0 0 512 512"},t[0]];let r={$$slots:{default:[st]},$$scope:{ctx:t}};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return n=new ct({props:r}),{c(){U(n.$$.fragment)},m(t,e){V(n,t,e),o=!0},p(t,[e]){const o=1&e?J(i,[i[0],K(t[0])]):{};2&e&&(o.$$scope={dirty:e,ctx:t}),n.$set(o)},i(t){o||(Q(n.$$.fragment,t),o=!0)},o(t){Y(n.$$.fragment,t),o=!1},d(t){X(n,t)}}}function at(t,n,o){return t.$$set=t=>{o(0,n=e(e({},n),u(t)))},[n=u(n)]}class ut extends et{constructor(t){super(),tt(this,t,at,lt,c,{})}}function dt(t){let e;return{c(){e=w("path"),C(e,"d","M278.6 256l68.2-68.2c6.2-6.2 6.2-16.4 0-22.6-6.2-6.2-16.4-6.2-22.6 0L256 233.4l-68.2-68.2c-6.2-6.2-16.4-6.2-22.6 0-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3l68.2 68.2-68.2 68.2c-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3 6.2 6.2 16.4 6.2 22.6 0l68.2-68.2 68.2 68.2c6.2 6.2 16.4 6.2 22.6 0 6.2-6.2 6.2-16.4 0-22.6L278.6 256z")},m(t,n){g(t,e,n)},d(t){t&&$(e)}}}function ft(t){let n,o;const i=[{viewBox:"0 0 512 512"},t[0]];let r={$$slots:{default:[dt]},$$scope:{ctx:t}};for(let t=0;t<i.length;t+=1)r=e(r,i[t]);return n=new ct({props:r}),{c(){U(n.$$.fragment)},m(t,e){V(n,t,e),o=!0},p(t,[e]){const o=1&e?J(i,[i[0],K(t[0])]):{};2&e&&(o.$$scope={dirty:e,ctx:t}),n.$set(o)},i(t){o||(Q(n.$$.fragment,t),o=!0)},o(t){Y(n.$$.fragment,t),o=!1},d(t){X(n,t)}}}function pt(t,n,o){return t.$$set=t=>{o(0,n=e(e({},n),u(t)))},[n=u(n)]}class mt extends et{constructor(t){super(),tt(this,t,pt,ft,c,{})}}function ht(t){let e;return{c(){e=x("hr-osc")},m(t,n){g(t,e,n)},d(t){t&&$(e)}}}function gt(e){let n,o,i,r,c;return o=new mt({}),{c(){n=v("div"),U(o.$$.fragment),C(n,"data-wails-no-drag",""),C(n,"class","svelte-y2j0m0")},m(t,e){g(t,n,e),V(o,n,null),i=!0,r||(c=b(n,"click",vt),r=!0)},p:t,i(t){i||(Q(o.$$.fragment,t),i=!0)},o(t){Y(o.$$.fragment,t),i=!1},d(t){t&&$(n),X(o),r=!1,c()}}}function $t(t){let e,n,o,i,r,c,s,l,a,u,d,f="darwin"!==t[0]&&ht();s=new ut({});let p="darwin"!==t[0]&&gt();return{c(){e=v("div"),n=v("div"),f&&f.c(),o=y(),i=v("div"),r=v("div"),c=v("div"),U(s.$$.fragment),l=y(),p&&p.c(),C(n,"class","title svelte-y2j0m0"),C(c,"class","config_button svelte-y2j0m0"),C(r,"data-wails-no-drag",""),C(r,"class","svelte-y2j0m0"),C(i,"class","buttons svelte-y2j0m0"),C(e,"class","top_menu svelte-y2j0m0"),C(e,"data-wails-drag","")},m(m,$){g(m,e,$),h(e,n),f&&f.m(n,null),h(e,o),h(e,i),h(i,r),h(r,c),V(s,c,null),h(i,l),p&&p.m(i,null),a=!0,u||(d=b(r,"click",t[1]),u=!0)},p(t,[e]){"darwin"!==t[0]?f||(f=ht(),f.c(),f.m(n,null)):f&&(f.d(1),f=null),"darwin"!==t[0]?p?(p.p(t,e),1&e&&Q(p,1)):(p=gt(),p.c(),Q(p,1),p.m(i,null)):p&&(T(),Y(p,1,1,(()=>{p=null})),F())},i(t){a||(Q(s.$$.fragment,t),Q(p),a=!0)},o(t){Y(s.$$.fragment,t),Y(p),a=!1},d(t){t&&$(e),f&&f.d(),X(s),p&&p.d(),u=!1,d()}}}function vt(){window.runtime.Quit()}function wt(t,e,n){let o="";window.go.main.App.GetOS().then((t=>n(0,o=t)));const i=z();return[o,function(){i("showSettings")}]}nt(".top_menu.svelte-y2j0m0.svelte-y2j0m0.svelte-y2j0m0{display:flex;width:100%;box-sizing:border-box;margin:0;padding:7px;align-items:center;justify-content:space-between;cursor:all-scroll}.top_menu.svelte-y2j0m0>.title.svelte-y2j0m0.svelte-y2j0m0{flex-shrink:0;padding-left:7px}.top_menu.svelte-y2j0m0>.buttons.svelte-y2j0m0.svelte-y2j0m0{display:flex;width:100%;box-sizing:border-box;margin:0;padding:0;align-items:center;justify-content:flex-end;cursor:all-scroll}.top_menu.svelte-y2j0m0>.buttons.svelte-y2j0m0>div.svelte-y2j0m0{position:relative;display:flex;align-items:center;justify-content:center;margin:0;padding:0;border:0;width:24px;height:24px;border-radius:3px;text-decoration:none;cursor:pointer}.top_menu.svelte-y2j0m0>.buttons.svelte-y2j0m0>div.svelte-y2j0m0:hover{background:hsla(0,0%,100%,.15)}.config_button.svelte-y2j0m0.svelte-y2j0m0.svelte-y2j0m0{padding-bottom:2px;width:15px!important;height:15px!important}");class xt extends et{constructor(t){super(),tt(this,t,wt,$t,c,{})}}function yt(e){let n,o,i,r,c,s,l,a,u,f,p,m,w,_,b,j,E,k,z,N,P,B,q,M,O,L=e[1]?"Connected":"Disconnected",R=(e[0]||"No error.")+"";return{c(){n=v("div"),o=v("div"),i=v("h3"),i.textContent="Connection Status",r=y(),c=v("div"),s=x(L),a=y(),u=v("div"),f=v("h3"),f.textContent="Heart Rate",p=y(),m=v("div"),w=x(e[2]),_=x(" bpm\r\n      "),b=v("span"),j=x("("),E=x(e[3]),k=x(")"),z=y(),N=v("div"),P=v("h3"),P.textContent="Last Error",B=y(),q=v("div"),M=x(R),A(i,"margin-top","10px"),C(i,"class","svelte-qwp9ta"),C(c,"class",l=d(e[1]?"connected":"disconnected")+" svelte-qwp9ta"),C(f,"class","svelte-qwp9ta"),A(b,"color","gray"),A(b,"font-size","small"),C(P,"class","svelte-qwp9ta"),A(q,"font-size","small"),C(N,"class",O=d(e[0]?"disconnected":"")+" svelte-qwp9ta")},m(t,e){g(t,n,e),h(n,o),h(o,i),h(o,r),h(o,c),h(c,s),h(n,a),h(n,u),h(u,f),h(u,p),h(u,m),h(m,w),h(m,_),h(m,b),h(b,j),h(b,E),h(b,k),h(n,z),h(n,N),h(N,P),h(N,B),h(N,q),h(q,M)},p(t,[e]){2&e&&L!==(L=t[1]?"Connected":"Disconnected")&&S(s,L),2&e&&l!==(l=d(t[1]?"connected":"disconnected")+" svelte-qwp9ta")&&C(c,"class",l),4&e&&S(w,t[2]),8&e&&S(E,t[3]),1&e&&R!==(R=(t[0]||"No error.")+"")&&S(M,R),1&e&&O!==(O=d(t[0]?"disconnected":"")+" svelte-qwp9ta")&&C(N,"class",O)},i:t,o:t,d(t){t&&$(n)}}}function _t(t,e,n){let{error:o=""}=e,i=!1,r=0,c=0;return window.go.main.App.GetConnected().then((t=>n(1,i=t))),window.go.main.App.GetHeartRate().then((t=>n(2,r=t))),window.go.main.App.GetHeartRatePercent().then((t=>n(3,c=.01*Math.floor(100*t)))),window.runtime.EventsOn("onChangeConnected",(t=>{console.info("connected",t),n(1,i=t)})),window.runtime.EventsOn("onChangeHeartRate",(t=>{console.info("heartRate",t),n(2,r=t)})),window.runtime.EventsOn("onChangeHeartRatePercent",(t=>{console.info("heartRatePercent",t),n(3,c=.01*Math.floor(100*t))})),t.$$set=t=>{"error"in t&&n(0,o=t.error)},[o,i,r,c]}nt("h3.svelte-qwp9ta{margin-bottom:0}.connected.svelte-qwp9ta{color:#489348}.disconnected.svelte-qwp9ta{color:#da504c}");class bt extends et{constructor(t){super(),tt(this,t,_t,yt,c,{error:0})}}function Ct(t){let e,n,o,i,r;const c=t[1].default,l=s(c,t,t[0],null);return{c(){e=v("div"),n=v("h3"),n.textContent="Loading failed",o=y(),i=v("p"),l&&l.c()},m(t,c){g(t,e,c),h(e,n),h(e,o),h(e,i),l&&l.m(i,null),r=!0},p(t,[e]){l&&l.p&&(!r||1&e)&&a(l,c,t,t[0],r?e:-1,null,null)},i(t){r||(Q(l,t),r=!0)},o(t){Y(l,t),r=!1},d(t){t&&$(e),l&&l.d(t)}}}function jt(t,e,n){let{$$slots:o={},$$scope:i}=e;return t.$$set=t=>{"$$scope"in t&&n(0,i=t.$$scope)},[i,o]}class St extends et{constructor(t){super(),tt(this,t,jt,Ct,c,{})}}function Et(e){let n,o,r,c,s,l,a,u,d,f;return{c(){n=v("div"),o=v("div"),r=v("h3"),r.textContent="Your Stromno Widget ID",c=y(),s=v("div"),l=v("input"),a=y(),u=v("div"),u.textContent="Save",A(r,"margin-top","0"),C(l,"id","widget_id"),C(l,"placeholder","widget id"),C(l,"type","text"),C(u,"class","save_button"),C(n,"class","widget_id svelte-1pkfb2i")},m(t,i){g(t,n,i),h(n,o),h(o,r),h(o,c),h(o,s),h(s,l),E(l,e[0]),h(s,a),h(s,u),d||(f=[b(l,"input",e[2]),b(u,"click",e[1])],d=!0)},p(t,[e]){1&e&&l.value!==t[0]&&E(l,t[0])},i:t,o:t,d(t){t&&$(n),d=!1,i(f)}}}function At(t,e,n){let o;return[o,async function(){await window.go.main.App.SetWidgetId(o),await window.go.main.App.SaveConfig()},function(){o=this.value,n(0,o)}]}nt(".widget_id.svelte-1pkfb2i{width:100%;height:100%;display:flex;align-items:center;justify-content:center}");class kt extends et{constructor(t){super(),tt(this,t,At,Et,c,{})}}function zt(e){let n,o,r,c,s,l,a,u,d,f,p,m,w,x,_,S,k,z,N,P;return{c(){n=v("div"),o=v("h4"),o.textContent="Widget Id",r=y(),c=v("input"),s=y(),l=v("h4"),l.textContent="Max Heart Rate",a=y(),u=v("input"),d=y(),f=v("h4"),f.textContent="Connected Parameter Path",p=y(),m=v("input"),w=y(),x=v("h4"),x.textContent="Percent Parameter Path",_=y(),S=v("input"),k=y(),z=v("div"),z.textContent="Save",A(o,"margin-top","10px"),C(o,"class","svelte-1fbcmao"),C(c,"placeholder","widget id"),C(c,"class","svelte-1fbcmao"),C(l,"class","svelte-1fbcmao"),C(u,"min","0"),C(u,"placeholder","max heart rate (default: 200)"),C(u,"type","number"),C(u,"class","svelte-1fbcmao"),C(f,"class","svelte-1fbcmao"),C(m,"placeholder","/avatar/parameters/hr_connected"),C(m,"class","svelte-1fbcmao"),C(x,"class","svelte-1fbcmao"),C(S,"placeholder","/avatar/parameters/hr_percent"),C(S,"class","svelte-1fbcmao"),C(z,"class","save_button svelte-1fbcmao"),C(n,"class","settings svelte-1fbcmao")},m(t,i){g(t,n,i),h(n,o),h(n,r),h(n,c),E(c,e[0]),h(n,s),h(n,l),h(n,a),h(n,u),E(u,e[1]),h(n,d),h(n,f),h(n,p),h(n,m),E(m,e[2]),h(n,w),h(n,x),h(n,_),h(n,S),E(S,e[3]),h(n,k),h(n,z),N||(P=[b(c,"input",e[5]),b(u,"input",e[6]),b(m,"input",e[7]),b(S,"input",e[8]),b(z,"click",e[4])],N=!0)},p(t,[e]){1&e&&c.value!==t[0]&&E(c,t[0]),2&e&&j(u.value)!==t[1]&&E(u,t[1]),4&e&&m.value!==t[2]&&E(m,t[2]),8&e&&S.value!==t[3]&&E(S,t[3])},i:t,o:t,d(t){t&&$(n),N=!1,i(P)}}}function Nt(t,e,n){let o={},i="",r=0,c="",s="";window.go.main.App.GetConfig().then((t=>{n(0,i=t.widget_id),n(1,r=t.max_heart_rate),n(2,c=t.osc_path_connected),n(3,s=t.osc_path_percent),o=t})),window.runtime.EventsOn("onChangeConfig",(t=>{n(0,i=t.widget_id),n(1,r=t.max_heart_rate),n(2,c=t.osc_path_connected),n(3,s=t.osc_path_percent),o=t}));const l=z();return[i,r,c,s,async function(){let t=[];i!==o.widget_id&&t.push(window.go.main.App.SetWidgetId(i)),r!==o.max_heart_rate&&t.push(window.go.main.App.SetMaxHeartRate(i)),c!==o.osc_path_connected&&t.push(window.go.main.App.SetConnectedParameterName(i)),s!==o.osc_path_percent&&t.push(window.go.main.App.SetPercentParameterName(i)),t.length>0&&(await Promise.all(t),await window.go.main.App.SaveConfig()),l("onChangeConfig")},function(){i=this.value,n(0,i)},function(){r=j(this.value),n(1,r)},function(){c=this.value,n(2,c)},function(){s=this.value,n(3,s)}]}nt("div.settings.svelte-1fbcmao.svelte-1fbcmao{width:100%;padding:0 20px;box-sizing:border-box}div.settings.svelte-1fbcmao .svelte-1fbcmao{box-sizing:border-box;margin-top:5px;margin-bottom:0}div.settings.svelte-1fbcmao>h4.svelte-1fbcmao{margin-top:1.5rem}");class Pt extends et{constructor(t){super(),tt(this,t,Nt,zt,c,{})}}function Bt(e){let n,o;return n=new Pt({}),n.$on("onChangeConfig",e[4]),{c(){U(n.$$.fragment)},m(t,e){V(n,t,e),o=!0},p:t,i(t){o||(Q(n.$$.fragment,t),o=!0)},o(t){Y(n.$$.fragment,t),o=!1},d(t){X(n,t)}}}function qt(t){let e,n,o,i;const r=[Rt,Lt,Ot,Mt],c=[];function s(t,e){return t[1]?"widget_id"===t[2]?1:""!==t[2]?2:3:0}return e=s(t),n=c[e]=r[e](t),{c(){n.c(),o=_()},m(t,n){c[e].m(t,n),g(t,o,n),i=!0},p(t,i){let l=e;e=s(t),e===l?c[e].p(t,i):(T(),Y(c[l],1,1,(()=>{c[l]=null})),F(),n=c[e],n?n.p(t,i):(n=c[e]=r[e](t),n.c()),Q(n,1),n.m(o.parentNode,o))},i(t){i||(Q(n),i=!0)},o(t){Y(n),i=!1},d(t){c[e].d(t),t&&$(o)}}}function Mt(e){let n;return{c(){n=v("p"),n.textContent="Loading..."},m(t,e){g(t,n,e)},p:t,i:t,o:t,d(t){t&&$(n)}}}function Ot(t){let e,n;return e=new St({props:{$$slots:{default:[Wt]},$$scope:{ctx:t}}}),{c(){U(e.$$.fragment)},m(t,o){V(e,t,o),n=!0},p(t,n){const o={};68&n&&(o.$$scope={dirty:n,ctx:t}),e.$set(o)},i(t){n||(Q(e.$$.fragment,t),n=!0)},o(t){Y(e.$$.fragment,t),n=!1},d(t){X(e,t)}}}function Lt(e){let n,o;return n=new kt({}),{c(){U(n.$$.fragment)},m(t,e){V(n,t,e),o=!0},p:t,i(t){o||(Q(n.$$.fragment,t),o=!0)},o(t){Y(n.$$.fragment,t),o=!1},d(t){X(n,t)}}}function Rt(t){let e,n;return e=new bt({props:{error:t[2]}}),{c(){U(e.$$.fragment)},m(t,o){V(e,t,o),n=!0},p(t,n){const o={};4&n&&(o.error=t[2]),e.$set(o)},i(t){n||(Q(e.$$.fragment,t),n=!0)},o(t){Y(e.$$.fragment,t),n=!1},d(t){X(e,t)}}}function Wt(t){let e;return{c(){e=x(t[2])},m(t,n){g(t,e,n)},p(t,n){4&n&&S(e,t[2])},d(t){t&&$(e)}}}function Gt(t){let e,n,o,i,r,c,s;n=new xt({}),n.$on("showSettings",t[3]);const l=[qt,Bt],a=[];function u(t,e){return t[0]?1:0}return r=u(t),c=a[r]=l[r](t),{c(){e=v("main"),U(n.$$.fragment),o=y(),i=v("div"),c.c(),C(i,"data-wails-no-drag",""),A(i,"flex-grow","1"),A(i,"padding-bottom","32px"),C(e,"class","svelte-1j3ogha")},m(t,c){g(t,e,c),V(n,e,null),h(e,o),h(e,i),a[r].m(i,null),s=!0},p(t,[e]){let n=r;r=u(t),r===n?a[r].p(t,e):(T(),Y(a[n],1,1,(()=>{a[n]=null})),F(),c=a[r],c?c.p(t,e):(c=a[r]=l[r](t),c.c()),Q(c,1),c.m(i,null))},i(t){s||(Q(n.$$.fragment,t),Q(c),s=!0)},o(t){Y(n.$$.fragment,t),Y(c),s=!1},d(t){t&&$(e),X(n),a[r].d()}}}function Ht(t,e,n){let o=!1,i=!0,r="";function c(){o?(window.runtime.WindowSetMaxSize(300,390),window.runtime.WindowSetSize(300,390)):(window.runtime.WindowSetMaxSize(300,255),window.runtime.WindowSetSize(300,255))}function s(t){n(0,o="boolean"==typeof t?t:!o),c()}window.go.main.App.GetLoading().then((t=>n(1,i=t))),window.go.main.App.GetDisplayError().then((t=>n(2,r=t))),window.runtime.EventsOn("onChangeLoading",(t=>{console.info("loading",t),n(1,i=t)})),window.runtime.EventsOn("onChangeDisplayError",(t=>{console.info("error",t),n(2,r=t)})),c();return[o,i,r,s,()=>s(!1)]}nt("main.svelte-1j3ogha{display:flex;flex-direction:column}");return new class extends et{constructor(t){super(),tt(this,t,Ht,Gt,c,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
