// ==UserScript==
// @name          Profanity Filter
// @author        adisib
// @namespace     namespace_adisib
// @description	  Basic filtering for profanity from website text. Designed to have minimal performance impact.
// @version       2016.08.06
// @include       http://*
// @include       https://*
// @noframes
// @grant         none
// ==/UserScript==

// -- NOTICE --
//
// This is the "compiled" version and as such is is OBFUSCATED
// It is recommended that you use the non-obfuscated version of scripts instead
//
// -----

(function(){
"use strict";
//let st = performance.now();
let a=new RegExp("\\b(?:(?:f(?:a(?:g(?:(?:g[eio]|o)t)??|tass)|u(?:ck(?:me)??|k)|(?:cu|vc)k|eg)|b(?:u(?:llshit|ttfuck)|[!i]tch|astard)|ass(?:(?:hol|wip)e|fuck|kiss|clown)??|d(?:amn|umbass|ouche(?:bag)??|ipshit)|p(?:hu(?:c?k|q)|iss(?:off)??)|sh(?:i(?:t(?:full)??|z)|!t)|moth(?:er|a)fuck|c(?:rap|unt)|goddamn|jackass|nig))[tgk]??(?=(?:(?:ing?(?:ess)??|ed|i??er|a))??(?:[syz]|es)??\\b)","gi"),b=document.evaluate("./*[not(self::script or self::noscript or self::code)]//text()[string-length(normalize-space()) > 2]",
document.body,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);if(a.test(document.title))document.title=document.title.replace(a,"*bleep*");for(let c=b.snapshotLength,d=0;d<c;++d){let e=b.snapshotItem(d);if(a.test(e.data))e.data=e.data.replace(a,"*bleep*");}
//let et = performance.now();
//console.log("PF | Run-Time (ms): " + (et - st).toString());
})();
