//实现本地展示10张存储的图片
// 1. 获取响应体
let body = $response.body;

// 2. 初始化变量用于存储数据
let contentArray = [];

// 3. 使用正则表达式匹配 "content" 数据
let contentRegex = /data: \{"content":"(.*?)"\}/g;
let matchContent = contentRegex.exec(body);

// 4. 使用正则表达式匹配 "url" 数据
let urlRegex = /"url":"(https:\/\/[^"]+)"/g;
let matchUrl = urlRegex.exec(body);

// 5. 根据响应体内容处理
if (matchContent) {
    // 如果匹配到 content 数据
    while ((matchContent = contentRegex.exec(body)) !== null) {
        // 每次匹配到的 content 都推入数组
        contentArray.push(matchContent[1]);
    }

    // 将新获取的内容拼接起来
    let combinedContent = contentArray.join("");

    // 将拼接好的内容存储到圈X的本地存储中
    $prefs.setValueForKey(combinedContent, "combinedContent");
    console.log("拼接后的内容: " + combinedContent);

} else if (matchUrl) {
    // 如果匹配到 URL 数据
    let newUrl = matchUrl[1];

    // 获取已存储的 URL 列表
    let existingUrls = $prefs.valueForKey("local_image_urls");

    if (existingUrls) {
        existingUrls = JSON.parse(existingUrls);

        // 检查是否已有相同的 URL，避免重复
        if (!existingUrls.includes(newUrl)) {
            existingUrls.push(newUrl);
        }

        // 如果存储的 URL 超过 10 个，移除最早的 URL
        if (existingUrls.length > 10) {
            existingUrls.shift(); // 移除数组第一个元素
        }
    } else {
        // 如果没有存储的 URL，则初始化一个数组
        existingUrls = [newUrl];
    }

    // 将新的 URL 列表存储回本地
    $prefs.setValueForKey(JSON.stringify(existingUrls), "local_image_urls");
    console.log("Successfully saved image URL: " + newUrl);
} else {
    // 如果既没有 content 也没有 url
    console.log("没有获取到图片链接");
}
$done({ body });