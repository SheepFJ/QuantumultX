/*************************************
项目名称：转转大师
更新日期：2025-03-08
脚本作者：@Sheepfj
使用声明：⚠️仅供参考，🈲转载与售卖！
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
脚本说明：解锁VIP
============ Quantumult X ============

[mitm]
hostname = wxappzzds.55.la

================ Loon ==================

[Script]
http-response ^https:\/\/wxappzzds\.55\.la/api/wxapp/my script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/zhuanzhuandashi/zhuanzhuandashi_loon.js,requires-body=false,tag=转转大师

*************************************/

const _0x4f220a=_0x30a9;(function(_0x363fc3,_0x25425f){const _0x15a6cb=_0x30a9,_0x5ca356=_0x363fc3();while(!![]){try{const _0x317965=parseInt(_0x15a6cb(0x157))/0x1*(parseInt(_0x15a6cb(0x16a))/0x2)+-parseInt(_0x15a6cb(0x15c))/0x3*(-parseInt(_0x15a6cb(0x169))/0x4)+parseInt(_0x15a6cb(0x166))/0x5+parseInt(_0x15a6cb(0x158))/0x6+-parseInt(_0x15a6cb(0x159))/0x7*(parseInt(_0x15a6cb(0x15e))/0x8)+parseInt(_0x15a6cb(0x15b))/0x9*(parseInt(_0x15a6cb(0x163))/0xa)+-parseInt(_0x15a6cb(0x151))/0xb;if(_0x317965===_0x25425f)break;else _0x5ca356['push'](_0x5ca356['shift']());}catch(_0x566da0){_0x5ca356['push'](_0x5ca356['shift']());}}}(_0x5b31,0xa73ec));function _0x30a9(_0x2a5c4f,_0x202841){const _0x5b3171=_0x5b31();return _0x30a9=function(_0x30a911,_0x4b6c0c){_0x30a911=_0x30a911-0x151;let _0x2b6862=_0x5b3171[_0x30a911];return _0x2b6862;},_0x30a9(_0x2a5c4f,_0x202841);}const isLoon=typeof $persistentStore!==_0x4f220a(0x15f),isQuanX=typeof $prefs!=='undefined';let zhuanzhuandashi=isLoon?$persistentStore[_0x4f220a(0x154)](_0x4f220a(0x165)):$prefs['valueForKey'](_0x4f220a(0x165));function _0x5b31(){const _0x5b5631=['147pdSblh','本消息只通知一次','157149jwQnGs','961383VknsFy','parse','344896QfpoyZ','undefined','post','body','write','370FWWlUD','🌼脚本完全免费，失效请反馈🌼','zhuanzhuandashi','645325oKiDUC','isvip','stringify','8ATEkFq','1456HIEFyB','14003946gWgqQe','hasOwnProperty','setValueForKey','read','反馈/获取更多\x20\x0a📖TG：https://t.me/sheep_007_xiaoyang\x20\x0a📖gitHub：https://github.com/SheepFJ/QuantumultX','object','1567PKMzNM','1839924LJvZcS'];_0x5b31=function(){return _0x5b5631;};return _0x5b31();}zhuanzhuandashi=zhuanzhuandashi||'0';if(zhuanzhuandashi!=='1'){const title=_0x4f220a(0x164),message=_0x4f220a(0x15a),link=_0x4f220a(0x155);if(isLoon)$notification[_0x4f220a(0x160)](title,message,link),$persistentStore[_0x4f220a(0x162)]('1',_0x4f220a(0x165));else isQuanX&&($notify(title,message,link),$prefs[_0x4f220a(0x153)]('1',_0x4f220a(0x165)));}if(typeof $response!=='undefined'&&$response[_0x4f220a(0x161)]){let body=JSON[_0x4f220a(0x15d)]($response[_0x4f220a(0x161)]);function modifyObject(_0x419abe){const _0x43fa13=_0x4f220a;for(let _0x40c160 in _0x419abe){_0x419abe[_0x43fa13(0x152)](_0x40c160)&&(typeof _0x419abe[_0x40c160]===_0x43fa13(0x156)&&_0x419abe[_0x40c160]!==null?modifyObject(_0x419abe[_0x40c160]):_0x40c160===_0x43fa13(0x167)&&(_0x419abe[_0x40c160]=0x1));}}modifyObject(body),$done({'body':JSON[_0x4f220a(0x168)](body)});}else $done();