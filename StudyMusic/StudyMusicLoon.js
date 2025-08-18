/*************************************
项目名称：StudyMusic -- 1.0
更新日期：2025-08-18
脚本作者：@fangjun
使用声明：⚠️所有资源来源于互联网，仅供学习参考，🈲转载与售卖！
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX/
脚本说明：使用学习通云盘+Loon实现一个简易的云音乐
================ Loon==============

[Script]
http-response ^https:\/\/pan-yz\.chaoxing\.com\/sheep\/music script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js,requires-body=false,tag=StudyMusic1.0
http-response ^https:\/\/message\.chaoxing\.com\/apis\/pmsg\/logoffUmeng script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js,requires-body=false,tag=StudyMusic1.0
http-response ^https:\/\/passport2-api\.chaoxing\.com\/v11\/loginregister script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js,requires-body=false,tag=StudyMusic1.0
http-response ^https:\/\/pan-yz\.chaoxing\.com\/api\/getMyDirAndFiles script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/main.js,requires-body=true,tag=StudyMusic1.0
http-request ^https:\/\/((pan-yz\.chaoxing\.com)|(s2\.cldisk\.com)|(d0\.cldisk\.com))\/ script-path=https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/StudyMusic/userinfo.js,requires-body=false,tag=StudyMusic1.0
[mitm]
hostname = pan-yz.chaoxing.com,message.chaoxing.com,passport2-api.chaoxing.com,s2.cldisk.com,d0.cldisk.com

*************************************/
