// 通用工具函数和环境检测
const isLoon = typeof $persistentStore !== "undefined";
const isQuanX = typeof $prefs !== "undefined";
const isSurge = !isLoon && !isQuanX; // 其他环境按Surge处理
// 统一存储方法
const storage = {
    get: key => {
        let value = null;
        if (isLoon || isSurge) value = $persistentStore.read(key);
        if (isQuanX) value = $prefs.valueForKey(key);
        if (value === undefined || value === null) return null;
        try {
            // 尝试解析为对象
            return JSON.parse(value);
        } catch (e) {
            // 如果不是JSON字符串，直接返回原始值
            return value;
        }
    },
    set: (key, val) => {
        let toStore;
        // 如果是对象或数组，序列化为字符串
        if (typeof val === "object" && val !== null) {
            toStore = JSON.stringify(val);
        } else {
            toStore = val;
        }
        if (isLoon || isSurge) return $persistentStore.write(toStore, key);
        if (isQuanX) return $prefs.setValueForKey(toStore, key);
    }
};

let chaoxingcookie = storage.get("chaoxingcookie");
if (!chaoxingcookie) {
    chaoxingcookie = "";
}

(function () {
    if (typeof $request === 'undefined' || !$request.headers) {
        console.log('set_ua_cookie.js: no $request.headers found');
        $done({});
        return;
    }

    const url = $request.url || "";
    const headers = Object.assign({}, $request.headers);

    if (
        (url.includes("douyinvod") || url.includes("migu")) &&
        url.includes("longzhu_api")
    ) {
        // 只设置 Referer 为 url
        headers['Referer'] = url;
        $done({ headers });
        return;
    }

    // 设置 Referer
    headers['Referer'] = "https://pan-yz.chaoxing.com/mobile/fileList";
    // 设置 UA
    headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 (schild:a15e7e463b68b1f4ea43e7c67bf066ac) (device:iPhone14,2) Language/zh-Hans com.ssreader.ChaoXingStudy/ChaoXingStudy_3_6.3.2_ios_phone_202409020930_249 (@Kalimdor)_1580206625949903736';
    // 设置 Cookie
    headers['Cookie'] = chaoxingcookie;

    $done({ headers });
})();

