
/*
❕使用教程
1.下载Zeep Life（记住账号密码）,app里面--我的👉第三方接入👉绑定微信或者支付宝
2.安装boxjs然后导入订阅链接写入数据：https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/sheepTask/sheepTaskBoxJs.json  "
*/

const account = encodeURIComponent($prefs.valueForKey("sheep_account_xiaomishuabushu") || "");
const password = encodeURIComponent($prefs.valueForKey("sheep_password_xiaomishuabushu") || "");
const minSteps = parseInt($prefs.valueForKey("sheep_min_steps_xiaomishuabushu") || "5000");
const maxSteps = parseInt($prefs.valueForKey("sheep_max_steps_xiaomishuabushu") || "15000");

// 生成随机步数，范围在 minSteps 和 maxSteps 之间
const steps = Math.floor(Math.random() * (maxSteps - minSteps + 1)) + minSteps;
const encodedSteps = encodeURIComponent(steps);

// 构建请求的 URL
//api接口来自作者Mingyu：https://github.com/ymyuuu/Steps-API
const url = `https://steps.api.030101.xyz/api?account=${account}&password=${password}&steps=${encodedSteps}`;

const method = "GET";
const myRequest = {
    url: url,
    method: method,
};

// 发起请求
$task.fetch(myRequest).then(response => {
    // 解析返回状态码和响应内容
    const statusCode = response.statusCode;
    const responseBody = response.body;
    
    // 显示步数和响应结果的通知
    $notify("提交成功","", `刷的步数: ${steps}`);
    $done();
}, reason => {
    // 请求出错时显示通知
    $notify("步数提交失败","", `请配置boxjs数据后手动执行`);
    $done();
});
