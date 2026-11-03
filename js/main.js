(function(){
'use strict';
const App=window.App;
App.initNav();
App.route();
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
})();
