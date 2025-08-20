
/*************************************
项目名称：StudyMusic -- 1.3
更新日期：2025-08-18
脚本作者：@fangjun
使用声明：⚠️所有资源来源于互联网，仅供学习参考，🈲转载与售卖！
TG频道：https://t.me/fangjun_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX/
脚本说明：使用学习通云盘+圈x/Loon实现一个简易的云音乐
============ Quantumult X ============

[rewrite_local]
^https:\/\/pan-yz\.chaoxing\.com\/sheep\/music url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js
^https:\/\/message\.chaoxing\.com\/apis\/pmsg\/logoffUmeng url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js
^https:\/\/passport2-api\.chaoxing\.com\/v11\/loginregister url script-response-header https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js
^https:\/\/pan-yz\.chaoxing\.com\/api\/getMyDirAndFiles url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js
^https:\/\/((pan-yz\.chaoxing\.com)|(s2\.cldisk\.com)|(d0\.cldisk\.com))\/ url script-request-header https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/userinfo.js
^https?:\/\/.*(sycdn\.kuwo\.cn|music\.126\.net|migu\.cn|douyinvod\.com|kugou\.com)\/.* url script-response-header https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/music_dow.js
[mitm]
hostname = pan-yz.chaoxing.com,message.chaoxing.com,passport2-api.chaoxing.com,s2.cldisk.com,d0.cldisk.com,*.kuwo.cn,*.126.net,*.migu.cn,*.douyinvod.com,*.kugou.com

*************************************/
