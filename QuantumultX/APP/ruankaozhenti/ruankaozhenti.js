/*************************************
项目名称：软考真题
更新日期：2025-12-23
脚本作者：@Sheepfj
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
使用声明：⚠️仅供参考，🈲转载与售卖！
脚本说明：解锁试用

============ Quantumult X ============

[rewrite_local]
^https:\/\/app\.lightsoft\.tech\/rkv3\/apiiosv2\/GetOrderHistory url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/ruankaozhenti/ruankaozhenti.js
[mitm]
hostname = app.lightsoft.tech
*************************************/

let body = JSON.parse($response.body);
function modifyObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                modifyObject(obj[key]);
            } else {
                if (key === 'effectiveDate') {
                    obj[key] = "2055-10-17T11:16:14.132659";
                }
            }
        }
    }
    
}
modifyObject(body);

$done({ body: JSON.stringify(body) });
