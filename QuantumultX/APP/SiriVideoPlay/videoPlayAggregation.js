/*************************************
项目名称：siriVideoPlay
更新日期：2025-02-22
脚本作者：@Sheepfj
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
使用声明：⚠️仅供参考，🈲转载与售卖！
脚本说明；利用Siri与圈x的httpbackend功能实现网页在线观看视频
使用方法：
1.导入脚本重写：https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlayAggregation.js
2.配置好后重启圈x,浏览器访问如下链接正式使用：https://movies.disney.com/sheep/video/search/
3.(可选）订阅BoxJS设置最大检索网站数(默认3），以及清理影视列表：https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/sheepTask/sheepTaskBoxJs.json

============ Quantumult X ============

[rewrite_local]
^https:\/\/collect\.wolongzyw\.com\/api\.php\/provide\/vod url script-response-body https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlayAggregation.js 
^https:\/\/caiji\.moduapi\.cc\/api\.php\/provide\/vod url script-response-body https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlayAggregation.js 
^https:\/\/cj\.lziapi\.com/api\.php\/provide\/vod\/from\/ url script-response-body https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlayAggregation.js 
^https:\/\/p2100\.net/api\.php\/provide\/vod url script-response-body https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlayAggregation.js 
^https:\/\/360zy\.com/api\.php/provide/vod url script-response-body https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlayAggregation.js


^https://movies\.disney\.com/sheep/video/search/ url script-response-body https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlay001.js
^https://movies\.disney\.com/sheep/video/play/ url script-response-body https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlay002.js

[mitm]
hostname = collect.wolongzyw.com,caiji.moduapi.cc,cj.lziapi.com,p2100.net,movies.disney.com,360zy.com

*************************************/

let body = $response.body;
let json = JSON.parse(body);

if (json.code === 1 && json.list?.length > 0) {
    let count = parseInt($prefs.valueForKey("vod_count") || "0", 10) + 1;
    let maxCount = parseInt($prefs.valueForKey("sheep_video_play_process") || "3", 10); // 获取最大存储次数，默认3

    console.log(`当前存储计数: ${count}, 检索的阈值: ${maxCount}`);

    if (count > maxCount) {
        console.log(`存储达到 ${maxCount} 次，清理所有 vod_info 数据并重置计数`);
        clearStoredData();
        count = 0;
    }

    let startIndex = getMaxStoredIndex() + 1;
    $prefs.setValueForKey(String(count), "vod_count");

    json.list.forEach((item, index) => {
        let key = `vod_info_${String(startIndex + index).padStart(2, "0")}`;
        let storeData = formatVodData(item);
        $prefs.setValueForKey(storeData, key);
    });
}

$done({ body: JSON.stringify(json) });
/**
 * 清理存储的 vod_info 数据
 */
function clearStoredData() {
    let maxIndex = getMaxStoredIndex();
    for (let i = 1; i <= maxIndex; i++) {
        let key = `vod_info_${String(i).padStart(2, "0")}`;
        if ($prefs.valueForKey(key)) {
            $prefs.removeValueForKey(key);
        }
    }
}

/**
 * 获取当前存储的最大索引
 * @returns {number} 最大存储索引
 */
function getMaxStoredIndex() {
    let maxIndex = 0;
    for (let i = 1; ; i++) {
        let key = `vod_info_${String(i).padStart(2, "0")}`;
        if ($prefs.valueForKey(key)) {
            maxIndex = i;
        } else {
            break;
        }
    }
    return maxIndex;
}

/**
 * 格式化视频数据
 * @param {object} item 视频对象
 * @returns {string} 存储格式化数据
 */
function formatVodData(item) {
    let { vod_name, vod_pic, vod_play_url } = item;
    let episodes = vod_play_url.split("$$$").flatMap(source =>
        source.split("#").map(ep => ep.split("$")).filter(parts => parts.length === 2).map(parts => `${parts[0]}: ${parts[1]}`)
    );
    return `${vod_name},${vod_pic},${episodes.join(",")}`;
}
