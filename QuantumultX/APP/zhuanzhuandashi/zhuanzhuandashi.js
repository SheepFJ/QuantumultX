/*************************************
项目名称：转转大师
更新日期：2025-02-22
脚本作者：@Sheepfj
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
使用声明：⚠️仅供参考，🈲转载与售卖！
脚本说明：解锁vip功能

============ Quantumult X ============

[rewrite_local]
^https:\/\/wxappzzds\.55\.la/api/wxapp/my url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/zhuanzhuandashi/zhuanzhuandashi.js

 
[mitm]
hostname = wxappzzds.55.la

*************************************/

const _0x35b43c=_0x543d;function _0x9225(){const _0x37c9bd=['stringify','24IEhHEn','450CVxeZA','valueForKey','parse','本消息只通知一次','zhuanzhuandashi','2OAgTwU','153945mQmgnS','body','post','isvip','setValueForKey','57vfmCHp','write','undefined','hasOwnProperty','5393703CHjxWa','🌼脚本完全免费，失效请反馈🌼','10071581GebqIX','object','469541wFJSwr','6086980GrzVCy','368VhHJEZ','反馈/获取更多/长按跳转\x20\x0a📖TG：https://t.me/sheep_007_xiaoyang\x20\x0a📖TG：https://t.me/ddm1023\x20\x0a📖TG：https://t.me/yqc_777\x20\x0a📖gitHub：https://github.com/SheepFJ/QuantumultX','64380inCaeu','11bIBxZj','14460LGPkvr'];_0x9225=function(){return _0x37c9bd;};return _0x9225();}(function(_0x318484,_0x315ce9){const _0x48e704=_0x543d,_0x48fe06=_0x318484();while(!![]){try{const _0x2e2c46=parseInt(_0x48e704(0x1b4))/0x1*(parseInt(_0x48e704(0x1a6))/0x2)+parseInt(_0x48e704(0x1ac))/0x3*(parseInt(_0x48e704(0x1ba))/0x4)+-parseInt(_0x48e704(0x1bd))/0x5*(parseInt(_0x48e704(0x1b8))/0x6)+-parseInt(_0x48e704(0x1b0))/0x7+-parseInt(_0x48e704(0x1b6))/0x8*(-parseInt(_0x48e704(0x1a7))/0x9)+-parseInt(_0x48e704(0x1b5))/0xa*(parseInt(_0x48e704(0x1b9))/0xb)+parseInt(_0x48e704(0x1bc))/0xc*(parseInt(_0x48e704(0x1b2))/0xd);if(_0x2e2c46===_0x315ce9)break;else _0x48fe06['push'](_0x48fe06['shift']());}catch(_0xfae3dc){_0x48fe06['push'](_0x48fe06['shift']());}}}(_0x9225,0x814c3));function _0x543d(_0x395cf4,_0x6042f3){const _0x92259b=_0x9225();return _0x543d=function(_0x543d5c,_0x1ac24b){_0x543d5c=_0x543d5c-0x1a5;let _0x3a58c4=_0x92259b[_0x543d5c];return _0x3a58c4;},_0x543d(_0x395cf4,_0x6042f3);}const isLoon=typeof $persistentStore!=='undefined',isQuanX=typeof $prefs!==_0x35b43c(0x1ae);let zhuanzhuandashi=isLoon?$persistentStore['read']('zhuanzhuandashi'):$prefs[_0x35b43c(0x1be)](_0x35b43c(0x1a5));zhuanzhuandashi=zhuanzhuandashi||'0';if(zhuanzhuandashi!=='1'){const title=_0x35b43c(0x1b1),message=_0x35b43c(0x1c0),link=_0x35b43c(0x1b7);if(isLoon)$notification[_0x35b43c(0x1a9)](title,message,link),$persistentStore[_0x35b43c(0x1ad)]('1',_0x35b43c(0x1a5));else isQuanX&&($notify(title,message,link),$prefs[_0x35b43c(0x1ab)]('1',_0x35b43c(0x1a5)));}if(typeof $response!=='undefined'&&$response['body']){let body=JSON[_0x35b43c(0x1bf)]($response[_0x35b43c(0x1a8)]);function modifyObject(_0x28ecbb){const _0x245ae3=_0x35b43c;for(let _0xf6ebed in _0x28ecbb){_0x28ecbb[_0x245ae3(0x1af)](_0xf6ebed)&&(typeof _0x28ecbb[_0xf6ebed]===_0x245ae3(0x1b3)&&_0x28ecbb[_0xf6ebed]!==null?modifyObject(_0x28ecbb[_0xf6ebed]):_0xf6ebed===_0x245ae3(0x1aa)&&(_0x28ecbb[_0xf6ebed]=0x1));}}modifyObject(body),$done({'body':JSON[_0x35b43c(0x1bb)](body)});}else $done();