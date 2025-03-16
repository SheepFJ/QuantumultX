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

function _0x30a7(_0x3ac4b7,_0x322502){const _0x591c7f=_0x591c();return _0x30a7=function(_0x30a718,_0x46b90a){_0x30a718=_0x30a718-0x123;let _0x5d673c=_0x591c7f[_0x30a718];return _0x5d673c;},_0x30a7(_0x3ac4b7,_0x322502);}const _0x39051f=_0x30a7;(function(_0x178e41,_0x672dc8){const _0x23b2f5=_0x30a7,_0x239c71=_0x178e41();while(!![]){try{const _0x29ecb0=-parseInt(_0x23b2f5(0x127))/0x1+-parseInt(_0x23b2f5(0x134))/0x2*(parseInt(_0x23b2f5(0x12f))/0x3)+parseInt(_0x23b2f5(0x139))/0x4*(-parseInt(_0x23b2f5(0x135))/0x5)+parseInt(_0x23b2f5(0x131))/0x6*(parseInt(_0x23b2f5(0x12d))/0x7)+parseInt(_0x23b2f5(0x128))/0x8*(-parseInt(_0x23b2f5(0x133))/0x9)+parseInt(_0x23b2f5(0x13a))/0xa*(parseInt(_0x23b2f5(0x129))/0xb)+parseInt(_0x23b2f5(0x137))/0xc*(parseInt(_0x23b2f5(0x132))/0xd);if(_0x29ecb0===_0x672dc8)break;else _0x239c71['push'](_0x239c71['shift']());}catch(_0x54cf08){_0x239c71['push'](_0x239c71['shift']());}}}(_0x591c,0xf1aac));const isLoon=typeof $persistentStore!=='undefined',isQuanX=typeof $prefs!==_0x39051f(0x136);let zhuanzhuandashi=isLoon?$persistentStore[_0x39051f(0x125)](_0x39051f(0x12e)):$prefs['valueForKey'](_0x39051f(0x12e));zhuanzhuandashi=zhuanzhuandashi||'0';if(zhuanzhuandashi!=='1'){const title=_0x39051f(0x12b),message=_0x39051f(0x123),link='https://t.me/sheep_007_xiaoyang';if(isLoon)$notification[_0x39051f(0x12a)](title,message,link),$persistentStore['write']('1','zhuanzhuandashi');else isQuanX&&($notify(title,message,link),$prefs[_0x39051f(0x13b)]('1',_0x39051f(0x12e)));}if(typeof $response!=='undefined'&&$response[_0x39051f(0x138)]){let body=JSON[_0x39051f(0x12c)]($response['body']);function modifyObject(_0x50885f){const _0x3fc15e=_0x39051f;for(let _0x368260 in _0x50885f){_0x50885f['hasOwnProperty'](_0x368260)&&(typeof _0x50885f[_0x368260]===_0x3fc15e(0x124)&&_0x50885f[_0x368260]!==null?modifyObject(_0x50885f[_0x368260]):_0x368260===_0x3fc15e(0x126)&&(_0x50885f[_0x368260]=0x1));}}modifyObject(body),$done({'body':JSON[_0x39051f(0x130)](body)});}else $done();function _0x591c(){const _0x41ca15=['undefined','6556488BbOUKJ','body','12YXNRdZ','140cfyvsr','setValueForKey','本消息只通知一次','object','read','isvip','1216780mJYYmO','8OgPSHf','1149566OJXCyB','post','🌼脚本完全免费，失效请反馈🌼','parse','47831DgzlFl','zhuanzhuandashi','69WFQiIp','stringify','1668ESZACB','65RQKBsc','17451792YVooyd','75994JvhoSW','1791435HiDCZl'];_0x591c=function(){return _0x41ca15;};return _0x591c();}