/**
 * @project        base
 * @author         tomHopkins <tom@tom-hopkins.co.uk>
 * @build          Mon, Sep 4, 2017 11:39 AM GMT
 * @release        6a8cfdd07fc102958164f0cfe3aa916e60537c65 [master]
 * @copyright      Copyright (c) 2017, tomHopkins
 *
 */

webpackJsonp([0],{"9O98":function(a,b,c){"use strict";function d(){sessionStorage.fullFontLoaded?l.classList.add(p):sessionStorage.subFontLoaded?(l.classList.add(o),f()):e()}function e(){if(!m.length)return void f();for(var a=[],b=0;b<m.length;b++){var c=m[b].option||{},d=new r.a(m[b].name,c);a.push(d.load())}Promise.all(a).then(function(){sessionStorage.subFontLoaded=!0,l.classList.add(o),f()}).catch(g)}function f(){if(n.length){for(var a=[],b=0;b<n.length;b++){var c=n[b].option||{},d=new r.a(n[b].name,c);a.push(d.load())}Promise.all(a).then(function(){sessionStorage.fullFontLoaded=!0,l.classList.remove(o),l.classList.add(p)}).catch(h)}}function g(){l.classList.remove(o),sessionStorage.subFontLoaded=!1,console.error("sub-setted font failed to load!")}function h(){l.classList.remove(p),sessionStorage.fullFontLoaded=!1,console.error("full-setted font failed to load!")}function i(){u()(),window.Promise||(window.Promise=w.a)}function j(){i(),k()}function k(){s({subFonts:[{name:"fira sans subset",option:{weight:400}}],fullFonts:[{name:"fira sans",option:{weight:400}}]})}Object.defineProperty(b,"__esModule",{value:!0});var l,m,n,o,p,q=c("FG6U"),r=c.n(q),s=function(a){a||(a={}),m=a.subFonts||[],n=a.fullFonts||[],l=document.documentElement,o=a.subFontClass||"subfont-loaded",p=a.subFontClass||"font-loaded",(m.length||p.length)&&d()},t=c("YB9v"),u=c.n(t),v=c("ju79"),w=c.n(v),x=c("rplX"),y=c.n(x);window.Element&&function(a){a.matches=a.matches||a.matchesSelector||a.webkitMatchesSelector||a.msMatchesSelector||function(a){for(var b=this,c=(b.parentNode||b.document).querySelectorAll(a),d=-1;c[++d]&&c[d]!=b;);return!!c[d]}}(Element.prototype),window.Element&&function(a){a.closest=a.closest||function(a){for(var b=this;b.matches&&!b.matches(a);)b=b.parentNode;return b.matches?b:null}}(Element.prototype),"loading"==document.readyState?document.addEventListener("DOMContentLoaded",j):j()}},["9O98"]);
//# sourceMappingURL=main.e8a52f7898756dccf842.js.map