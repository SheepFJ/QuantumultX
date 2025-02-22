// 代码一 - 修改响应体并存储 token
let body = $response.body;
let obj = JSON.parse(body);
let accessToken = obj.access_token;

if (accessToken) {
    $prefs.setValueForKey(accessToken, "local_access_token");
    console.log("成功获取access_token.");
}

$done({});