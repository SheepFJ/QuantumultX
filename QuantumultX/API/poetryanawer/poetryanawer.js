/*************************************
项目名称：诗歌问答|PKC
更新日期：2025-03-08
脚本作者：@Sheepfj
使用声明：⚠️仅供参考，🈲转载与售卖！
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
脚本说明：用于PKC插件的视频与文本接口
============ Quantumult X ============

[rewrite_local]
^https:\/\/api\.sheep\.com\/sheep\/poetry\/answer\/([^\/]+)\/? url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/API/poetryanawer/poetryanawer.js
[mitm]
hostname = api.sheep.com

================ Loon ==================

*************************************/


const _0x5954f7=_0x1f66;function _0x1f66(_0x2cfc58,_0x29e209){const _0x2a6e62=_0x3e65();return _0x1f66=function(_0x320bbe,_0x2bef79){_0x320bbe=_0x320bbe-0x1ac;let _0x502249=_0x2a6e62[_0x320bbe];return _0x502249;},_0x1f66(_0x2cfc58,_0x29e209);}(function(_0x4f4d26,_0x29ed64){const _0xb7fe5b=_0x1f66,_0x4b7292=_0x4f4d26();while(!![]){try{const _0x19114c=-parseInt(_0xb7fe5b(0x1e3))/0x1+parseInt(_0xb7fe5b(0x1db))/0x2+-parseInt(_0xb7fe5b(0x1c4))/0x3+parseInt(_0xb7fe5b(0x1da))/0x4+parseInt(_0xb7fe5b(0x1d4))/0x5*(parseInt(_0xb7fe5b(0x1dc))/0x6)+parseInt(_0xb7fe5b(0x1be))/0x7+-parseInt(_0xb7fe5b(0x1c6))/0x8;if(_0x19114c===_0x29ed64)break;else _0x4b7292['push'](_0x4b7292['shift']());}catch(_0x5875be){_0x4b7292['push'](_0x4b7292['shift']());}}}(_0x3e65,0x72c7f));const _0x8ef7fe=(function(){let _0x2532eb=!![];return function(_0xe6826b,_0x4863c8){const _0x4f7164=_0x2532eb?function(){const _0x5f1bf2=_0x1f66;if(_0x4863c8){const _0xd64ec7=_0x4863c8[_0x5f1bf2(0x1e1)](_0xe6826b,arguments);return _0x4863c8=null,_0xd64ec7;}}:function(){};return _0x2532eb=![],_0x4f7164;};}()),_0x5e1314=_0x8ef7fe(this,function(){const _0x2c2d12=_0x1f66;return _0x5e1314['toString']()[_0x2c2d12(0x1ba)](_0x2c2d12(0x1b1))['toString']()[_0x2c2d12(0x1d9)](_0x5e1314)[_0x2c2d12(0x1ba)](_0x2c2d12(0x1b1));});_0x5e1314();const _0x2bef79=(function(){let _0x593be4=!![];return function(_0xad7a41,_0x5511c0){const _0x5c630f=_0x593be4?function(){const _0x16fcff=_0x1f66;if(_0x5511c0){const _0x21a98f=_0x5511c0[_0x16fcff(0x1e1)](_0xad7a41,arguments);return _0x5511c0=null,_0x21a98f;}}:function(){};return _0x593be4=![],_0x5c630f;};}()),_0x320bbe=_0x2bef79(this,function(){const _0x3435c4=_0x1f66,_0x141cc1=function(){const _0x59ec58=_0x1f66;let _0x161f73;try{_0x161f73=Function('return\x20(function()\x20'+_0x59ec58(0x1d7)+');')();}catch(_0x5c4bef){_0x161f73=window;}return _0x161f73;},_0x4d1f08=_0x141cc1(),_0x73d046=_0x4d1f08['console']=_0x4d1f08['console']||{},_0x20a441=[_0x3435c4(0x1bf),_0x3435c4(0x1d5),_0x3435c4(0x1c8),'error',_0x3435c4(0x1bb),_0x3435c4(0x1df),_0x3435c4(0x1b7)];for(let _0x549ae2=0x0;_0x549ae2<_0x20a441[_0x3435c4(0x1d2)];_0x549ae2++){const _0x4d38f6=_0x2bef79['constructor'][_0x3435c4(0x1c0)]['bind'](_0x2bef79),_0x49152e=_0x20a441[_0x549ae2],_0x1cba8e=_0x73d046[_0x49152e]||_0x4d38f6;_0x4d38f6[_0x3435c4(0x1d8)]=_0x2bef79[_0x3435c4(0x1cd)](_0x2bef79),_0x4d38f6[_0x3435c4(0x1ac)]=_0x1cba8e[_0x3435c4(0x1ac)][_0x3435c4(0x1cd)](_0x1cba8e),_0x73d046[_0x49152e]=_0x4d38f6;}});_0x320bbe();const isLoon=typeof $persistentStore!=='undefined',isQuanX=typeof $prefs!==_0x5954f7(0x1cc),storage={'get':_0x4bf74d=>isLoon?$persistentStore[_0x5954f7(0x1e2)](_0x4bf74d):$prefs[_0x5954f7(0x1cb)](_0x4bf74d),'set':(_0x310cc7,_0x2a0394)=>isLoon?$persistentStore[_0x5954f7(0x1b8)](_0x2a0394,_0x310cc7):$prefs[_0x5954f7(0x1d6)](_0x2a0394,_0x310cc7)},url=$request[_0x5954f7(0x1af)],match=url[_0x5954f7(0x1dd)](/\/sheep\/poetry\/answer\/([^\/]+)/);if(!match)$done();const answerInput=decodeURIComponent(match[0x1])['toUpperCase'](),questionAPI=_0x5954f7(0x1d3),answerKey='sheep_poetry_answer',analyticKey='sheep_poetry_analytic';if(answerInput==='出题')$task[_0x5954f7(0x1b3)]({'url':questionAPI})[_0x5954f7(0x1e0)](_0x22564f=>{const _0x47bb35=_0x5954f7;let _0x4d19e7=JSON[_0x47bb35(0x1ca)](_0x22564f[_0x47bb35(0x1b4)]);if(_0x4d19e7[_0x47bb35(0x1b0)]===0xc8){let {question:_0x48ff8c,answer_a:_0xed46e4,answer_b:_0x32d0bf,answer_c:_0x480008,answer:_0x22de7c,analytic:_0x54acb7}=_0x4d19e7[_0x47bb35(0x1b5)];storage[_0x47bb35(0x1ae)](answerKey,_0x22de7c),storage['set'](analyticKey,_0x54acb7);let _0x369aed=_0x48ff8c+_0x47bb35(0x1c9)+_0xed46e4+_0x47bb35(0x1cf)+_0x32d0bf+_0x47bb35(0x1b9)+_0x480008;$done({'status':_0x47bb35(0x1c3),'headers':{'Content-Type':_0x47bb35(0x1bd)},'body':_0x369aed});}else $done({'status':'HTTP/1.1\x20500\x20Internal\x20Server\x20Error','body':_0x47bb35(0x1ce)});})[_0x5954f7(0x1d1)](_0x1ddbc2=>{const _0x52289f=_0x5954f7;$done({'status':_0x52289f(0x1de),'body':_0x52289f(0x1b2)});});else{if(['A','B','C'][_0x5954f7(0x1c2)](answerInput)){let correctAnswer=storage[_0x5954f7(0x1c1)](answerKey),analytic=storage['get'](analyticKey);if(!correctAnswer)$done({'status':_0x5954f7(0x1c7),'body':_0x5954f7(0x1d0)});else{let responseText=answerInput===correctAnswer?_0x5954f7(0x1bc)+analytic:_0x5954f7(0x1c5)+correctAnswer+_0x5954f7(0x1b6)+analytic;$done({'status':_0x5954f7(0x1c3),'headers':{'Content-Type':_0x5954f7(0x1bd)},'body':responseText});}}else $done({'status':_0x5954f7(0x1c7),'body':_0x5954f7(0x1ad)});}function _0x3e65(){const _0x592989=['HTTP/1.1\x20400\x20Bad\x20Request','info','\x0aA.\x20','parse','valueForKey','undefined','bind','获取题目失败','\x0aB.\x20','请先使用‘诗歌=出题’命令','catch','length','https://apis.tianapi.com/scwd/index?key=5a1e06d347d0061539225b218156adbf','1405qnaktf','warn','setValueForKey','{}.constructor(\x22return\x20this\x22)(\x20)','__proto__','constructor','1715384MFLNpC','1558792DJAAXA','16566DWLCwl','match','HTTP/1.1\x20500\x20Internal\x20Server\x20Error','table','then','apply','read','336121KMkkNP','toString','‘诗歌=出题’/‘诗歌=选项’','set','url','code','(((.+)+)+)+$','请求失败','fetch','body','result','。\x0a解析：','trace','write','\x0aC.\x20','search','exception','回答正确！\x0a解析：','text/plain;\x20charset=utf-8','5983194dBDefA','log','prototype','get','includes','HTTP/1.1\x20200\x20OK','1333350zSWEGk','回答错误！正确答案是\x20','12704888DWzdhk'];_0x3e65=function(){return _0x592989;};return _0x3e65();}
