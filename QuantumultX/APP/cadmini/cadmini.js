/*************************************
项目名称：CADmini
脚本作者：chxm1023
电报频道：https://t.me/chxm1023
使用声明：⚠️仅供参考，🈲转载与售卖！

============ Quantumult X ============

[rewrite_local]
^https?:\/\/.*\.pcw365\.com\/(minicad\/api\/auth\/ioslogintoken|ios\/service_use) url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/cadmini/cadmini.js

[mitm]
hostname = *.pcw365.com

*************************************/

var chxm1023 = JSON.parse($response.body);

if(/auth\/ioslogintoken/.test($request.url)){
  chxm1023["CAD_end_time"] = "2099-09-09 09:09:09";
  chxm1023["CAD_vip"] = true;
  chxm1023["qycloud"] = true;
}

if(/service_use/.test($request.url)){
  chxm1023 = {
    "service" : "thinbody",
    "times" : 0,
    "msg" : "该服务第0次使用"
  };
}

$done({body : JSON.stringify(chxm1023)});