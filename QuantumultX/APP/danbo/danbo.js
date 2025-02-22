/*************************************
项目名称：蛋波
更新日期：2025-02-22
脚本作者：@Sheepfj
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
使用声明：⚠️仅供参考，🈲转载与售卖！
脚本说明：解锁vip功能
版本：1.3.00

============ Quantumult X ============

[rewrite_local]
^https://api-sub\.meitu\.com/v2/user/vip_info_by_group url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/danbo/danbovip.js
^https://ai\.xiuxiu\.meitu\.com/v1/tool/mtlab/ai_graffiti_permission url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/danbo/danboai.js
 
[mitm]
hostname = ai.xiuxiu.meitu.com,api-sub.meitu.com

*************************************/
