/*************************************
项目名称：B站视频解析|PKC
更新日期：2025-03-08
脚本作者：@Sheepfj
使用声明：⚠️仅供参考，🈲转载与售卖！
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
脚本说明：用于PKC插件的视频与文本接口
============ Quantumult X ============

[rewrite_local]
^https:\/\/api\.sheep\.com\/sheep\/bilibili\/videotag\/([^\/]+)\/ url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/API/bilibilivideo/bilibilitag.js
^https:\/\/api\.sheep\.com\/sheep\/bilibili\/video\/([^\/]+)\/ url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/API/bilibilivideo/bilibilivideo.js
[mitm]
hostname = api.sheep.com

================ Loon ==================

[Script]
http-response ^https:\/\/api\.sheep\.com\/sheep\/bilibili\/videotag\/([^\/]+)\/ script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/API/bilibilivideo/bilibilitag.js,requires-body=false,tag=B站视频标签获取
http-response ^https:\/\/api\.sheep\.com\/sheep\/bilibili\/video\/([^\/]+)\/ script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/API/bilibilivideo/bilibilivideo.js,requires-body=false,tag=B站PKC视频接口

*************************************/
const _0x373538 = _0x122f; (function (_0x244f0a, _0x2d021d) { const _0x5e77a6 = _0x122f, _0x104c90 = _0x244f0a(); while (!![]) { try { const _0x50d9e7 = parseInt(_0x5e77a6(0x128)) / 0x1 + parseInt(_0x5e77a6(0x13e)) / 0x2 + -parseInt(_0x5e77a6(0x126)) / 0x3 * (-parseInt(_0x5e77a6(0x12c)) / 0x4) + parseInt(_0x5e77a6(0x13a)) / 0x5 * (parseInt(_0x5e77a6(0x139)) / 0x6) + -parseInt(_0x5e77a6(0x12f)) / 0x7 + parseInt(_0x5e77a6(0x12e)) / 0x8 * (-parseInt(_0x5e77a6(0x143)) / 0x9) + -parseInt(_0x5e77a6(0x133)) / 0xa; if (_0x50d9e7 === _0x2d021d) break; else _0x104c90['push'](_0x104c90['shift']()); } catch (_0x5b1b42) { _0x104c90['push'](_0x104c90['shift']()); } } }(_0x4217, 0x66f5f)); function _0x122f(_0x23fb6c, _0x36a9c5) { const _0x4217bd = _0x4217(); return _0x122f = function (_0x122f42, _0x53f949) { _0x122f42 = _0x122f42 - 0x125; let _0x1d3961 = _0x4217bd[_0x122f42]; return _0x1d3961; }, _0x122f(_0x23fb6c, _0x36a9c5); } function _0x4217() { const _0x79f12d = ['3CSkJqi', 'https://api.52vmy.cn/doc/query/bilibili/video.html', '646503ztJseH', '请求格式错误', 'parse', 'text/plain;\x20charset=utf-8', '857644qheZcC', 'push', '141248oxsCjK', '3138954mxfYTZ', 'title', '解析响应失败:', 'url', '7312240wFeSmd', 'join', 'https://api.52vmy.cn/api/query/bilibili/video', '未找到相关视频信息', 'application/json', '请求失败:', '234CTWroK', '28435djJjXt', 'Bad\x20Request', 'user', 'error', '1249204ThoZvW', '&n=', 'HTTP/1.1\x20', 'undefined', 'length', '54SSVeuR', ',\x20up主:\x20', 'get', 'Internal\x20Server\x20Error']; _0x4217 = function () { return _0x79f12d; }; return _0x4217(); } const isLoon = typeof $persistentStore !== _0x373538(0x141), isQuanX = typeof $prefs !== _0x373538(0x141), req = $request[_0x373538(0x132)], match = req['match'](/\/sheep\/bilibili\/videotag\/(.+?)\//); if (!match) sendResponse(0x190, _0x373538(0x129)); else { const keyword = encodeURIComponent(match[0x1]), baseURL = _0x373538(0x135), results = []; let completedRequests = 0x0; for (let n = 0x1; n <= 0x3; n++) { const apiUrl = baseURL + '?msg=' + keyword + _0x373538(0x13f) + n, myRequest = { 'url': apiUrl, 'method': 'GET', 'headers': { 'User-Agent': 'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2018_3_1\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/18.3\x20Mobile/15E148\x20Safari/604.1', 'Referer': _0x373538(0x127), 'Accept': _0x373538(0x137) } }; if (isLoon) $httpClient[_0x373538(0x145)](myRequest, function (_0x24c128, _0x1e79d9, _0x1e6872) { handleResponse(_0x24c128, _0x1e6872); }); else isQuanX && $task['fetch'](myRequest)['then'](_0x24a06a => { handleResponse(null, _0x24a06a['body']); }, _0x3376eb => { handleResponse(_0x3376eb['error'], null); }); } function handleResponse(_0x24ae21, _0x18f6cf) { const _0x1fd9eb = _0x373538; completedRequests++; if (!_0x24ae21) try { const _0x7a6862 = JSON[_0x1fd9eb(0x12a)](_0x18f6cf); _0x7a6862[_0x1fd9eb(0x130)] && _0x7a6862[_0x1fd9eb(0x13c)] && results[_0x1fd9eb(0x12d)]('标题:\x20' + _0x7a6862['title'] + _0x1fd9eb(0x144) + _0x7a6862[_0x1fd9eb(0x13c)]); } catch (_0x72996d) { console['error'](_0x1fd9eb(0x131), _0x72996d); } else console[_0x1fd9eb(0x13d)](_0x1fd9eb(0x138), _0x24ae21); if (completedRequests === 0x3) { let _0xed22f2 = results[_0x1fd9eb(0x142)] > 0x0 ? results[_0x1fd9eb(0x134)]('\x0a') : _0x1fd9eb(0x136); sendResponse(0xc8, _0xed22f2); } } } function sendResponse(_0x1281df, _0x1f0f94) { const _0x1b1f0b = _0x373538; $done({ 'status': _0x1b1f0b(0x140) + _0x1281df + '\x20' + getStatusText(_0x1281df), 'headers': { 'Content-Type': _0x1b1f0b(0x12b) }, 'body': _0x1f0f94 }); } function getStatusText(_0x5c0344) { const _0x21b657 = _0x373538, _0x5225d1 = { 0xc8: 'OK', 0x190: _0x21b657(0x13b), 0x1f4: _0x21b657(0x125) }; return _0x5225d1[_0x5c0344] || 'Error'; }


