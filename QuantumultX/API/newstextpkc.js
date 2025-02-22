/*************************************
项目名称：每日新闻60s--文本API
更新日期：2025-02-22
脚本作者：@Sheepfj
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
使用声明：⚠️仅供参考，🈲转载与售卖！
脚本说明：PKC微信API接口

============ Quantumult X ============

[rewrite_local]
^https:\/\/movies\.disney\.com\/sheep\/news\/text\/? url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/API/newstextpkc.js
[mitm]
hostname = movies.disney.com

*************************************/

const url = `https://uapi.woobx.cn/v2/app/daily-news`;
const method = `GET`;
const headers = {
    'user-agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4.1 Mobile/15E148 WoodBox-iOS/1.88.300 woodbox-vc/209`,
    'accept-language': `zh-CN`,
    'host': `uapi.woobx.cn`,
    'accept-encoding': `gzip`
};
const body = ``;

const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(myRequest).then(response => {
    try {
        const data = JSON.parse(response.body);
        if (data && data.data && Array.isArray(data.data.news)) {
            const newsList = data.data.news;

            // 直接构建文本响应，不使用 trim()
            let message = "📢 今日新闻:\n\n";
            newsList.forEach((item) => {
                message += `🌟 ${item}\n\n`; // 每条新闻前加上🌟 表情
            });

            // 以纯文本格式返回完整数据
            $done({
                status: "HTTP/1.1 200 OK",
                headers: { "Content-Type": "text/plain; charset=utf-8" },
                body: message
            });
        } else {
            $done({
                status: "HTTP/1.1 404 Not Found",
                headers: { "Content-Type": "text/plain; charset=utf-8" },
                body: "❌ 未获取到新闻内容\n"
            });
        }
    } catch (error) {
        console.error("解析响应失败:", error);
        $done({
            status: "HTTP/1.1 500 Internal Server Error",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: "❌ 服务器错误，解析新闻失败\n"
        });
    }
}, reason => {
    console.log(reason.error);
    $done({
        status: "HTTP/1.1 502 Bad Gateway",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "❌ 请求失败，请稍后重试\n"
    });
});