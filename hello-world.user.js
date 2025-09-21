// ==UserScript==
// @name         Hello World Script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  最简单的油猴脚本，打印hello world
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('hello world');
})();