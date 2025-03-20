/*************************************
项目名称：快搜搜题
更新日期：2025-03-20
脚本作者：@Sheepfj
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
使用声明：⚠️仅供参考，🈲转载与售卖！
脚本说明: 解锁会员

============ Quantumult X ============

[rewrite_local]
^https://kspay\.iksdt\.com/pay\.php url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/kuaisousouti/kuaisousouti.js  
[mitm]
hostname = kspay.iksdt.com

*************************************/


let body = JSON.parse($response.body);
function modifyObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                modifyObject(obj[key]);
            } else {
                if (key === 'vip') {
                    obj[key] = 1;
                }
                if (key === 'vip_expire') {
                    obj[key] = "2099-09-09 18:18:18";
                }
            }
        }
    }
    
}
modifyObject(body);

$done({ body: JSON.stringify(body) });









