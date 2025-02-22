//直接执行，获取每日新闻

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

            // 构建通知内容
            let message = "📢 今日新闻:\n\n";
            newsList.forEach((item) => {
                message += `🌟 ${item}\n\n`;
            });

            // 发送通知
            $notify("今日新闻", "", message.trim());
        } else {
            $notify("错误", "", "未获取到新闻内容");
        }
    } catch (error) {
        console.error("解析响应失败:", error);
        $notify("错误", "", "请求失败或解析失败");
    }

    $done();
}, reason => {
    console.log(reason.error);
    $notify("错误", "", "请求失败");
    $done();
});