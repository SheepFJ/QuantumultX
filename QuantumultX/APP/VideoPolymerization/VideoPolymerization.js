/*************************************
项目名称：SHEEP视频聚合
更新日期：2025-03-31
脚本作者：@Sheepfj
使用声明：⚠️仅供参考，🈲转载与售卖！
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
脚本说明：视频聚合
============ Quantumult X ============

[rewrite_local]
^https:\/\/api\.sheep\.com\/sheep\/videoPolymerization\/(?:zhanshi\/sheep_vod_info_(\d+)|videoword\/([^\/]+)|) url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/VideoPolymerization/VideoPolymerization.js
[mitm]
hostname = api.sheep.com

================ Loon ==================

*************************************/




// 通用工具函数和环境检测
const isLoon = typeof $persistentStore !== "undefined";
const isQuanX = typeof $prefs !== "undefined";
const isSurge = typeof $httpClient !== "undefined" && typeof $prefs === "undefined";

// 统一存储方法
const storage = {
    get: key => {
        if (isLoon || isSurge) return $persistentStore.read(key);
        return $prefs.valueForKey(key);
    },
    set: (key, value) => {
        if (isLoon || isSurge) return $persistentStore.write(value, key);
        return $prefs.setValueForKey(value, key);
    }
};

// 统一 HTTP 请求方法
function fetchWithCallback(options, callback) {
    if (isLoon || isSurge) {
        const httpMethod = options.method === "POST" ? $httpClient.post : $httpClient.get;
        httpMethod(options, (error, response, body) => {
            callback(error, response, body);
        });
    } else {
        // QuanX 或其他环境
        const method = options.method || "GET";
        const fetchOptions = { method, url: options.url, headers: options.headers || {}, body: options.body || null };

        $task.fetch(fetchOptions).then(response => {
            callback(null, response, response.body);
        }).catch(error => callback(error, null, null));
    }
}

// 路由处理
const url = $request.url;

// 处理搜索请求 (sheepweb001.js)
if (url.includes('/sheep/videoPolymerization/videoword/')) {
    handleSearchRequest();
}
// 处理展示请求 (sheepzhanshi.js)
else if (url.includes('/sheep/videoPolymerization/zhanshi/')) {
    handleDisplayRequest();
}
// 处理主页请求 (sheepweb.js)
else {
    handleMainPageRequest();
}

// 处理搜索请求的函数 (sheepweb001.js 的主要逻辑)
function handleSearchRequest() {
    const urlMatch = $request.url.match(/sheep\/videoPolymerization\/videoword\/([^\/]+)\/\?wd=(.*)/);
    if (!urlMatch) {
        $done({ body: JSON.stringify({ error: "无效的请求格式" }) });
        return;
    }

    const source = urlMatch[1];
    const wd = decodeURIComponent(urlMatch[2]);

    // 定义不同 source 对应的 API 地址
    const apiSources = {
        "1": "https://caiji.moduapi.cc/api.php/provide/vod?ac=detail&wd=",
        "2": "https://cj.lziapi.com/api.php/provide/vod/from/lzm3u8/?ac=detail&wd="
    };

    // 获取对应 API 地址
    const baseUrl = apiSources[source];
    if (!baseUrl) {
        $done({ body: JSON.stringify({ error: "不支持的 source" }) });
        return;
    }

    // 构建完整请求 URL
    const requestUrl = baseUrl + encodeURIComponent(wd);

    // 发送请求
    fetchData(requestUrl, new URL(requestUrl).host);
}

// 处理数据获取和存储 (sheepweb001.js 的辅助函数)
function fetchData(url, host) {
    const headers = {
        "Sec-Fetch-Dest": "empty",
        "Connection": "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        "Priority": "u=3, i",
        "Sec-Fetch-Site": "cross-site",
        "Origin": "https://movies.disney.com",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15",
        "Sec-Fetch-Mode": "cors",
        "Referer": "https://movies.disney.com/",
        "Host": host,
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept": "*/*"
    };

    const myRequest = { url, method: "GET", headers };

    if (isLoon || isSurge) {
        $httpClient.get(myRequest, (error, response, body) => {
            if (error) {
                $done({ body: JSON.stringify({ error: "网络错误", detail: error }) });
                return;
            }

            if (response.status === 200) {
                try {
                    const json = JSON.parse(body);
                    storeVodData(json.list || []);
                    $done({ body: JSON.stringify({ success: "数据已存储", list: json.list }) });
                } catch (e) {
                    $done({ body: JSON.stringify({ error: "解析失败" }) });
                }
            } else {
                $done({ body: JSON.stringify({ error: "API 请求失败" }) });
            }
        });
    } else {
        // QuanX
        $task.fetch(myRequest).then(response => {
            if (response.statusCode === 200) {
                try {
                    const json = JSON.parse(response.body);
                    storeVodData(json.list || []);
                    $done({ body: JSON.stringify({ success: "数据已存储", list: json.list }) });
                } catch (e) {
                    $done({ body: JSON.stringify({ error: "解析失败" }) });
                }
            } else {
                $done({ body: JSON.stringify({ error: "API 请求失败" }) });
            }
        }, reason => {
            $done({ body: JSON.stringify({ error: "网络错误", detail: reason }) });
        });
    }
}

// 存储影视数据到本地 (sheepweb001.js 的辅助函数)
function storeVodData(vodList) {
    for (let i = 0; i < vodList.length; i++) {
        let vod = vodList[i];

        let vodName = vod.vod_name; // 标题
        let vodPic = vod.vod_pic; // 图片地址
        let vodContent = vod.vod_content; // 简介
        let vodPlayUrl = vod.vod_play_url; // 播放地址

        // 解析播放地址
        let episodes = [];
        let playParts = vodPlayUrl.split("#");  // 根据#符号分隔

        for (let j = 0; j < playParts.length; j++) {
            let episodeDetails = playParts[j].split("$");
            let episodeTitle = episodeDetails[0];
            let episodeUrl = episodeDetails[1] || "";
            episodes.push(`${episodeTitle}: ${episodeUrl}`);
        }

        // 拼接存储格式
        let storeValue = [vodName, vodPic, vodContent, ...episodes].join(",");

        // 存储到本地
        let key = `sheep_vod_info_${i}`; // 例如：sheep_vod_info_0, sheep_vod_info_1 ...
        storage.set(key, storeValue);
    }
}

// 处理展示请求的函数 (sheepzhanshi.js 的主要逻辑)
function handleDisplayRequest() {
    const urlMatch = $request.url.match(/sheep_vod_info_(\d+)/);
    if (!urlMatch) {
        $done({ status: "HTTP/1.1 400 Bad Request", body: "请求格式错误" });
        return;
    }

    // 添加特殊处理逻辑
    if (urlMatch[1] === "1000") {
        // 收集所有存在的视频数据
        let allVodData = [];
        for (let i = 0; i <= 20; i++) {
            const key = `sheep_vod_info_${i}`;
            const data = storage.get(key);
            if (data) {
                const vodArray = data.split(",");
                allVodData.push({
                    title: vodArray[0],
                    pic: vodArray[1],
                    content: vodArray[2],
                    index: i
                });
            }
        }

        // 生成列表页面 HTML
        const html = `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
            <title>影视列表</title>
            <style>
                body { 
                    background-color: #121212; 
                    color: #fff; 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: calc(env(safe-area-inset-bottom) + 20px);
                    min-height: 100vh;
                    overflow-x: hidden;
                }
                .grid { 
                    display: grid;   
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 20px; 
                }
                .item { 
                    text-align: center; 
                    cursor: pointer; 
                    margin-left:-25px;
                    padding:10px;
                }
                .item img { 
                    width: 100%; 
                    max-width: 150px; 
                    height: 200px; 
                    border-radius: 8px; 
                    object-fit: cover; 
                }
                .item p { 
                    margin: 8px 0; 
                    font-size: 14px; 
                }
                h1 { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    margin-left:-25px;
                }
                .fixed-bottom {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: rgba(18, 18, 18, 0.9);
                    padding: 10px;
                    text-align: center;
                    z-index: 999;
                    padding-bottom: env(safe-area-inset-bottom);
                }
            </style>
        </head>
        <body>
            <h1>影视列表</h1>
            <div class="grid">
                ${allVodData.map(vod => `
                    <div class="item" onclick="loadVideoInfo(${vod.index})">
                        <img src="${vod.pic}" alt="${vod.title}">
                        <p>${vod.title}</p>
                    </div>
                `).join('')}
            </div>
            <script>
                function loadVideoInfo(index) {
                    fetch("https://api.sheep.com/sheep/videoPolymerization/zhanshi/sheep_vod_info_" + index)
                        .then(res => res.text())
                        .then(html => {
                            document.documentElement.innerHTML = html.replace(/<html[^>]*>|<\/html>/g, '');
                        })
                        .catch(err => console.error("加载详情失败", err));
                }
            </script>
        </body>
        </html>
        `;

        $done({ status: "HTTP/1.1 200 OK", headers: { "Content-Type": "text/html" }, body: html });
        return;
    }

    const key = `sheep_vod_info_${urlMatch[1]}`;
    const vodData = storage.get(key);

    if (!vodData) {
        $done({ status: "HTTP/1.1 404 Not Found", body: "未找到该视频信息" });
        return;
    }

    // 解析存储的数据
    const vodArray = vodData.split(",");
    const vodTitle = vodArray[0];  // 标题
    const vodPic = vodArray[1];  // 图片地址
    const vodContent = vodArray[2];  // 简介
    const episodes = vodArray.slice(3);  // 剧集信息

    // 生成 HTML 播放页面
    const html = `<!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
        <title>${vodTitle}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background: #121212;
                color: #fff;
                font-family: Arial, sans-serif;
                padding-top: env(safe-area-inset-top);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                overflow-x: hidden;
            }
            .float-back {
                position: fixed;
                top: 40px;
                left: 20px;
                width: 44px;
                height: 44px;
                background:rgb(243,156,18);
                border-radius: 20%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 25px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                z-index: 10000;
                border: none;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
            }
            .float-back:active {
                transform: scale(0.95);
            }
            .content-container {
                padding: 15px;
                padding-top: calc(env(safe-area-inset-top) + 30px);
                padding-bottom: calc(env(safe-area-inset-bottom) + 80px);
                flex: 1;
                width: 100%;
                box-sizing: border-box;
            }
            .movie-info {
                text-align: center;
                margin-bottom: 20px;
            }
            .movie-info img {
                width: 100%;
                max-width: 300px;
                border-radius: 10px;
                margin: 10px auto;
                display: block;
            }
            .movie-info h2 {
                margin: 10px 0;
            }
            .episodes {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 10px;
                padding: 15px;
            }
            .episode-btn {
                text-decoration: none;
                background-color: #f39c12;
                color: white;
                padding: 10px;
                border-radius: 5px;
                text-align: center;
                font-size: 14px;
            }
            .episode-btn:hover {
                background-color: #e67e22;
            }
            .fixed-bottom {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background: rgba(18, 18, 18, 0.9);
                padding: 10px;
                text-align: center;
                z-index: 999;
                padding-bottom: env(safe-area-inset-bottom);
            }
        </style>
    </head>
    <body>
        <div id="content" class="content-container">
            <div class="movie-info">
                <h2>${vodTitle}</h2>
                <img src="${vodPic}" alt="${vodTitle}">
                <p>${vodContent}</p>
            </div>
            
            <div class="episodes">
                ${episodes.map((ep, index) => {
        const [epTitle, epUrl] = ep.split(": ");
        return `<a href="${epUrl}" target="_blank" class="episode-btn">${epTitle}</a>`;
    }).join('')}
            </div>
        </div>

        <button class="float-back" onclick="showList()">←</button>

        <script>
            function showList() {
                fetch("https://api.sheep.com/sheep/videoPolymerization/zhanshi/sheep_vod_info_1000")
                    .then(res => res.text())
                    .then(html => {
                        document.documentElement.innerHTML = html.replace(/<html[^>]*>|<\/html>/g, '');
                    })
                    .catch(err => console.error("加载列表失败", err));
            }
        </script>
    </body>
    </html>
    `;

    $done({ status: "HTTP/1.1 200 OK", headers: { "Content-Type": "text/html" }, body: html });
}

// 处理主页请求的函数 (sheepweb.js 的主要逻辑)
function handleMainPageRequest() {
    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="theme-color" content="#1e1e1e">
    <link rel="stylesheet" href="https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/VideoPolymerization/css/mian.css">

    <title>影视搜索</title>
    
</head>
<body>
    <!-- 顶部状态栏背景 -->
    <div class="status-bar-background"></div>
    
    <div id="main-container">
        <h1>影视搜索</h1>
        <div class="search-form">
            <input type="text" id="searchInput" placeholder="输入影视名称">
            <select id="sourceSelect">
                <option value="1">源1</option>
                <option value="2">源2</option>
            </select>
            <button onclick="search()">搜索</button>
        </div>

        <div id="results"></div>
    </div>

    <!-- 底部导航 -->
    <div id="bottom-nav">
        <div class="nav-button active" id="searchBtn" onclick="showSearch()">搜索</div>
        <div class="nav-button" id="listBtn" onclick="showList()">最近</div>
        <div class="nav-button" id="profileBtn" onclick="showProfile()">我的</div>
    </div>

    <script>
        // 当前活动页面
        let currentPage = 'search';
        
        function setActiveButton(buttonId) {
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(buttonId).classList.add('active');
        }

        function search() {
            var wd = encodeURIComponent(document.getElementById("searchInput").value);
            var source = document.getElementById("sourceSelect").value;

            if (!wd) {
                alert("请输入搜索内容");
                return;
            }

            // 显示加载提示
            var results = document.getElementById("results");
            results.innerHTML = \`
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <div class="loading"></div>
                    <div class="loading-text">请耐心等待</div>
                </div>
            \`;

            var apiUrl = "https://api.sheep.com/sheep/videoPolymerization/videoword/" + source + "/?wd=" + wd;

            fetch(apiUrl)
                .then(res => res.json())
                .then(data => {
                    results.innerHTML = "";

                    if (!data.list || data.list.length === 0) {
                        results.innerHTML = '<div class="no-results">未找到相关影视，尝试切换源~</div>';
                        return;
                    }

                    data.list.forEach((vod, index) => {
                        var container = document.createElement("div");
                        container.className = "movie-container";
                        container.style.width = "calc(33.33% - 30px)"; // 确保每行显示三个

                        var img = document.createElement("img");
                        img.src = vod.vod_pic;
                        img.onerror = function() { this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTAwIDE1MCIgZmlsbD0iIzMzMyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMyMjIiLz48dGV4dCB4PSI1MCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FhYSI+无图片</dGV4dD48L3N2Zz4='; };
                        img.onclick = function() { loadVideoInfo(index); };

                        var title = document.createElement("p");
                        title.textContent = vod.vod_name;

                        container.appendChild(img);
                        container.appendChild(title);
                        results.appendChild(container);

                        // **存储到本地，便于匹配点击事件**
                        localStorage.setItem("sheep_vod_info_" + index, JSON.stringify(vod));
                    });
                })
                .catch(err => {
                    console.error("请求失败", err);
                    results.innerHTML = '<div class="no-results">搜索失败，请稍后重试</div>';
                });
        }

        function loadVideoInfo(vodId) {
            // 显示加载提示
            document.getElementById("main-container").innerHTML = \`
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <div class="loading"></div>
                    <div class="loading-text">加载详情中...</div>
                </div>
            \`;
            
            var apiUrl = "https://api.sheep.com/sheep/videoPolymerization/zhanshi/sheep_vod_info_" + vodId;
            
            fetch(apiUrl)
                .then(res => res.text())
                .then(html => {
                    document.getElementById("main-container").innerHTML = html;
                })
                .catch(err => {
                    console.error("加载详情失败", err);
                    document.getElementById("main-container").innerHTML = '<div class="no-results">加载详情失败，请稍后重试</div>';
                });
        }

        function showSearch() {
            currentPage = 'search';
            setActiveButton('searchBtn');
            document.getElementById("main-container").innerHTML = \`
                <h1>影视搜索</h1>
                <div class="search-form">
                    <input type="text" id="searchInput" placeholder="输入影视名称">
                    <select id="sourceSelect">
                        <option value="1">源1</option>
                        <option value="2">源2</option>
                    </select>
                    <button onclick="search()">搜索</button>
                </div>
                <div id="results"></div>
            \`;
            
            // 确保状态栏背景存在
            ensureStatusBarBackground();
        }

        function showList() {
            currentPage = 'list';
            setActiveButton('listBtn');
            document.getElementById("main-container").innerHTML = \`
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <div class="loading"></div>
                    <div class="loading-text">请耐心等待</div>
                </div>
            \`;
            
            // 确保状态栏背景存在
            ensureStatusBarBackground();
            
            fetch("https://api.sheep.com/sheep/videoPolymerization/zhanshi/sheep_vod_info_1000")
                .then(res => res.text())
                .then(html => {
                    document.getElementById("main-container").innerHTML = html;
                    // 在加载新内容后再次确保状态栏背景存在
                    ensureStatusBarBackground();
                })
                .catch(err => {
                    console.error("加载列表失败", err);
                });
        }

        function showProfile() {
            currentPage = 'profile';
            setActiveButton('profileBtn');
            document.getElementById("main-container").innerHTML = \`
                <div style="padding: 20px; border-radius: 12px; margin-top: 30px; max-width: 400px; margin-left: auto; margin-right: auto;">
                    <h1 style="text-align: center; margin-bottom: 25px;">SHEEP</h1>
                    
                    <!-- 可折叠列表 -->
                    <div class="collapsible-container">
                        <!-- 关于我们 -->
                        <div class="collapsible-item">
                            <div class="collapsible-header">
                                <span>关于</span>
                                <span class="arrow">▼</span>
                            </div>
                            <div class="collapsible-content">
                                <div style="text-align: left; color: #ddd; line-height: 1.6; padding: 10px;">
                                    <h3 style="color: #f39c12; margin-top: 10px;">版本信息</h3>
                                    <p>当前版本:<a href=" https://t.me/sheep_007xiaoyang/43" style="color: #3498db; text-decoration: none;" target="_blank">v1.0.0</a> </p>
                                    <p>更新日期: 2025-03-31</p>
                                    <p>更新内容:</p>
                                    <ul style="padding-left: 20px;">
                                        <li>优化了页面布局</li>
                                        <li>兼容Loon</li>
                                    </ul>
                                    
                                    <h3 style="color: #f39c12; margin-top: 20px;">关注/反馈</h3>
                                    <p>GitHub: <a href="https://github.com/SheepFJ/QuantumultX" style="color: #3498db; text-decoration: none;" target="_blank">SheepFJ</a></p>
                                    <p>TG群组: <a href="https://t.me/sheep_007_xiaoyang" style="color: #3498db; text-decoration: none;" target="_blank">Sheep交流反馈</a></p>
                                    
                    
                                </div>
                            </div>
                        </div>
                        
                        <!-- 设置 -->
                        <div class="collapsible-item">
                            <div class="collapsible-header">
                                <span>设置</span>
                                <span class="arrow">▼</span>
                            </div>
                            <div class="collapsible-content">
                                <div style="text-align: left; color: #ddd; line-height: 1.6; padding: 10px;">
                                    <p>装修中...</p>
                                    <!-- 这里可以添加设置选项 -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- 收藏 -->
                        <div class="collapsible-item">
                            <div class="collapsible-header">
                                <span>我的收藏</span>
                                <span class="arrow">▼</span>
                            </div>
                            <div class="collapsible-content">
                                <div style="text-align: left; color: #ddd; line-height: 1.6; padding: 10px;">
                                    <p>装修中...</p>
                                    <!-- 这里可以添加收藏列表 -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- 免责声明 -->
                        <div class="collapsible-item">
                            <div class="collapsible-header">
                                <span>声明</span>
                                <span class="arrow">▼</span>
                            </div>
                            <div class="collapsible-content">
                                <div style="text-align: left; color: #ddd; line-height: 1.6; padding: 10px;">
                                    <p>本工具仅供学习交流使用，请勿用于非法用途。所有内容均来自互联网，与开发者无关。</p>
                                </div>
                            </div>
                        </div>
                       <div class="collapsible-item">
                            <div class="collapsible-header">
                                <span>历史版本</span>
                                <span class="arrow">▼</span>
                            </div>
                            <div class="collapsible-content">
                                <div style="text-align: left; color: #ddd; line-height: 1.6; padding: 10px;">

                                    <h3 style="color: #f39c12; margin-top: 10px;">v1.0.0</h3>
                                    <p>更新时间: 2025-03-31</p>
                                    <p>更新内容:</p>
                                    <ul style="padding-left: 20px;">
                                        <li>优化了页面布局</li>
                                        <li>兼容Loon</li>
                                    </ul>
                                
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                
            \`;
            
            // 确保状态栏背景存在
            ensureStatusBarBackground();
            

            // 定义toggleCollapsible函数在全局作用域
            window.toggleCollapsible = function (element) {
                // 先关闭所有已打开的折叠项
                const allActiveHeaders = document.querySelectorAll('.collapsible-header.active');
                allActiveHeaders.forEach(header => {
                    if (header !== element) {
                        header.classList.remove('active');
                        const content = header.nextElementSibling;
                        content.style.maxHeight = "0";
                    }
                });

                // 切换当前点击的折叠项
                element.classList.toggle('active');
                const content = element.nextElementSibling;

                if (element.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + "px";
                } else {
                    content.style.maxHeight = "0";
                }
            };

            // 使用setTimeout确保DOM已经更新
            setTimeout(() => {
                // 添加折叠功能
                const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
                collapsibleHeaders.forEach(header => {
                    header.addEventListener('click', function () {
                        toggleCollapsible(this);
                    });
                });
            }, 100);
        }
        // 确保状态栏背景元素存在的辅助函数
        function ensureStatusBarBackground() {
            if (!document.querySelector('.status-bar-background')) {
                const statusBar = document.createElement('div');
                statusBar.className = 'status-bar-background';
                document.body.insertBefore(statusBar, document.body.firstChild);
            }
        }
        
        // 在页面加载完成后确保状态栏背景存在
        document.addEventListener('DOMContentLoaded', function() {
            ensureStatusBarBackground();
            
            // 当按下回车键时触发搜索
            document.getElementById('searchInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    search();
                }
            });
        });
    </script>

</body>
</html>`;

    $done({ status: "HTTP/1.1 200 OK", headers: { "Content-Type": "text/html" }, body: html });
}