/*************************************
项目名称：SiriAI--简易版
更新日期：2025-02-22
脚本作者：@Sheepfj
使用声明：⚠️仅供参考，🈲转载与售卖！
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
脚本说明：利用Siri与圈x重写实现AI问答
使用方法：
1.导入脚本重写：https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/Siri/aireply/aireply.js
2.导入快捷指令执行：https://www.icloud.com/shortcuts/b8995ccca91b46dfbab0c49115066496
============ Quantumult X ============

[rewrite_local]
^https:\/\/movies\.disney\.com\/sheep\/siri\/aireply\/? url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/Siri/aireply/aireply.js
 ^https:\/\/chatme-backend-d5f358e587a4\.herokuapp\.com\/chatme\/api\/v1\/ask\/text url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/Siri/aireply/huoqu.js  
[mitm]
hostname = chatme-backend-d5f358e587a4.herokuapp.com,securetoken.googleapis.com,genie-production-yfvxbm4e6q-uc.a.run.app

*************************************/
const saveResult = $prefs.valueForKey("sheep_siri_aireply"); 
$done({
status: "HTTP/1.1 200 OK",
headers: { "Content-Type": "text/plain; charset=utf-8" },
body:saveResult
})
