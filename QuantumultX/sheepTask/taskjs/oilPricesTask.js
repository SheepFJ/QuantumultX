let region =$prefs.valueForKey("sheep_oilprices_province") || "湖北";// 输入的地区名称

// URL 编码地区名称
let encodedRegion = encodeURIComponent(region);

// 生成请求 URL
const url = `https://apis.tianapi.com/oilprice/index?key=cef8e38ada89df5f8db03854dc6a96a5&prov=${encodedRegion}`;
const method = `GET`;
const headers = {
  'Connection': `keep-alive`,
  'Host': `apis.tianapi.com`,
  'content-type': `application/json`,
  'Accept-Encoding': `gzip,compress,br,deflate`,
  'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003831) NetType/4G Language/zh_CN`
};

const body = ``;

const myRequest = {
  url: url,
  method: method,
  headers: headers,
  body: body
};

$task.fetch(myRequest).then(response => {
  const data = JSON.parse(response.body);

  if (data.code === 200) {
    const result = data.result;

    // 提取油价数据
    const msg = `油价信息 (地区: ${region})\n\n` +
                `⛽️92号汽油: ${result.p92} 元\n` +
                `⛽️95号汽油: ${result.p95} 元\n` +
                `⛽️0号柴油: ${result.p0} 元\n` +
                `⛽️98号汽油: ${result.p98} 元\n` +
                `🔔更新时间: ${result.time}\n`;

    // 发送通知给圈X
console.log(msg);
    $notify("油价信息", "更新成功", msg);
  } else {
    $notify("油价信息", "获取失败", "无法获取油价数据，请稍后再试。");
  }

  $done();
}, reason => {
  $notify("油价信息", "请求失败", `错误: ${reason.error}`);
  $done();
});
