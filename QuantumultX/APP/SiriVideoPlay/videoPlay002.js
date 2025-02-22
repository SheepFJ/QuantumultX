/**
 * 获取存储的影视键值
 * @returns {string[]} 影视键值列表
 */
function getVodKeys() {
    let keys = [];
    for (let i = 1; ; i++) {
        let key = `vod_info_${i.toString().padStart(2, "0")}`;
        if (!$prefs.valueForKey(key)) break; // 无数据时终止循环
        keys.push(key);
    }
    return keys;
}

/**
 * 生成完整的 HTML 页面
 * @param {string} title 页面标题
 * @param {string} content 主要内容
 * @returns {string} 生成的 HTML 页面
 */
function generatePage(title, content) {
    return `
    <html>
<head>
    <title>${title}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; text-align: center; font-size: 24px; margin: 0; padding: 0;
            background: url("https://www.helloimg.com/i/2025/02/04/67a1f7b10b45e.jpeg") no-repeat center center fixed;
            background-size: cover;
            color: white;
            padding-top: 220px; /* 确保内容不会被导航栏遮挡 */
        }

        /* 美观的顶部导航栏 */
        .header { 
            position: fixed; 
            top: 0; 
            width: 100%; 
            padding: 55px 0;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(50, 50, 50, 0.6)); 
            text-align: center;
            box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        .header .back { 
            display: inline-block; 
            margin: 8px 42px; 
            padding: 12px 34px; 
            font-size: 48px; 
            font-weight: bold; 
            text-decoration: none; 
            color: white; 
            background: linear-gradient(135deg, #007bff, #0056b3); 
            border-radius: 8px; 
            transition: background 0.3s ease, transform 0.2s, box-shadow 0.3s;
            box-shadow: 0px 3px 8px rgba(0, 123, 255, 0.4);
        }
        .header .back:hover { 
            background: linear-gradient(135deg, #0056b3, #003d80); 
            transform: scale(1.08);
            box-shadow: 0px 5px 12px rgba(0, 123, 255, 0.6);
        }

        .container { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            padding: 30px; 
            max-width: 1200px; 
            margin: auto; 
            color: #90EE90; /* 影视名称淡绿色 */
        }

        /* 影视卡片样式 */
        .vod-card { 
            width: 90%; 
            border: 2px solid rgba(255, 255, 255, 0.15); 
            padding: 15px; 
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.2); /* 透明度更淡 */
            text-align: center; 
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .vod-card:hover {
            transform: translateY(-5px);
            box-shadow: 0px 4px 15px rgba(255, 255, 255, 0.3);
        }
        .vod-card img { width: 100%; height: auto; border-radius: 5px; 
margin-bottom: 15px; 
}
        .vod-card a { 
            text-decoration: none; 
            color: #f8f8f8; 
            display: block; 
            margin-top: 15px; 
            font-weight: bold; 
            font-size: 22px; 
        }
.vod-card span{

color: #245372;
font-size:32px;

}

        /* 影视详情标题颜色 */
        h1 {
            color: #4b9fd7; /* 影视名称淡绿色 */
        }

        /* 剧集列表 */
        .episode-list { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 20px; 
            padding: 30px; 
            max-width: 800px; 
            margin: auto; 
        }
        .episode-item { 
            width: 110%; 
            height: 60px; 
            background: rgba(255, 255, 255, 0.3);
            color: #fff; 
            border-radius: 5px; 
            text-align: center; 
            line-height: 60px; 
            font-weight: bold; 
            font-size: 30px; 
            cursor: pointer; 
            transition: background 0.3s;
        }
        .episode-item:hover { 
            background: rgba(255, 255, 255, 0.6); 
            color: black; 
        }
    </style>
</head>
<body>
    <!-- 头部导航 -->
    <div class="header">
        <a class="back" href="/sheep/video/play/">影视列表</a>
        <a class="back" href="/sheep/video/search/">返回搜索</a>
    </div>

    ${content}

</body>
</html>`;
}
/**
 * 生成影视列表页面
 * @param {string[]} vodKeys 影视数据键值列表
 * @returns {string} 影视列表 HTML
 */
function generateVodListPage(vodKeys) {
    let content = `<h1>影视列表</h1><div class="container">`;

    content += vodKeys.map(key => {
        let vodInfo = $prefs.valueForKey(key);
        if (!vodInfo) return "";

        let [name, img] = vodInfo.split(",");
        return `
        <div class="vod-card">
            <a href="/sheep/video/play/${encodeURIComponent(name)}">
                <img src="${img}" alt="${name}">
                <span>${name}</span>
            </a>
        </div>`;
    }).join("");

    content += `</div>`;
    return generatePage("影视列表", content);
}

/**
 * 生成影视详情页面
 * @param {string} vodName 影视名称
 * @param {string} vodKey 影视存储键
 * @returns {string} 影视详情 HTML
 */
function generateVodDetailPage(vodName, vodKey) {
    let vodInfo = $prefs.valueForKey(vodKey);
    if (!vodInfo) return generatePage("错误", `<h1>未找到剧集</h1>`);

    let [name, img, ...episodes] = vodInfo.split(",");

    let content = `<h1>${name}</h1><img src="${img}" width="400"><br>`;
    content += `<div class="episode-list">`;

    content += episodes.map(ep => {
        let [epNum, epUrl] = ep.split(": ");
        return `<div class="episode-item">
                    <a href="${epUrl}" target="_blank">${epNum}</a>
                </div>`;
    }).join("");

    content += `</div>`;
    return generatePage(name, content);
}

// 解析请求路径
const vodKeys = getVodKeys();
let path = $request.path;
let html = "";

// 处理主页影视列表
if (path === "/sheep/video/play/") {
    html = generateVodListPage(vodKeys);
}
// 处理影视详情页
else if (path.startsWith("/sheep/video/play/")) {
    let vodName = decodeURIComponent(path.replace("/sheep/video/play/", ""));
    let vodKey = vodKeys.find(key => {
        let vodInfo = $prefs.valueForKey(key);
        return vodInfo && vodInfo.startsWith(vodName);
    });

    html = generateVodDetailPage(vodName, vodKey);
}

// 响应 HTML 页面
$done({
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html
});
