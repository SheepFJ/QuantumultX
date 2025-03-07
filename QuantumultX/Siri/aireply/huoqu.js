const isLoon = typeof $persistentStore !== "undefined";
const isQuanX = typeof $prefs !== "undefined";

if (isLoon) {
    
    let body = typeof $response.body === "string" ? $response.body : JSON.stringify($response.body || "");
const matches = body.match(/"content":"(.*?)"/g) || [];

if (matches.length) {
    const combinedContent = matches.map(m => m.replace(/"content":"|"/g, '')).join('').trim();
    if (combinedContent) $persistentStore.write(combinedContent, "sheep_wechat_content");
}

$done($response);
    
    
} else if (isQuanX) {
    let body = $response.body;
const matches = body.match(/"content":"(.*?)"/g);
if (matches) {
    const contents = matches.map(match => match.replace(/"content":"|"/g, ''));
    const combinedContent = contents.join(''); // 合并所有内容
    const saveResult = $prefs.setValueForKey(combinedContent, "sheep_siri_aireply");
}
$done($response);
} else {
    console.log("当前环境未知");
}

$done();