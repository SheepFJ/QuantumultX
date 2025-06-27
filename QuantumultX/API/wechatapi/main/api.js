// 通用工具函数和环境检测
const isLoon = typeof $persistentStore !== "undefined";
const isQuanX = typeof $prefs !== "undefined";
const isSurge = !isLoon && !isQuanX; // 其他环境按Surge处理
/**
 * 统一存储方法
 * @param {string} e - 存储键名
 * @param {any} r - 要存储的值，可以是对象或字符串
 * @returns {any} - 获取时返回存储的值，设置时返回操作成功状态
 */
const storage = { get: e => { let r = null; (isLoon || isSurge) && (r = $persistentStore.read(e)), isQuanX && (r = $prefs.valueForKey(e)); try { return r ? JSON.parse(r) : null } catch (e) { return r } }, set: (e, r) => { const t = "object" == typeof r ? JSON.stringify(r) : r; return isLoon || isSurge ? $persistentStore.write(t, e) : !!isQuanX && $prefs.setValueForKey(t, e) } };

/**
 * 统一通知方法
 * @param {string} title - 通知标题
 * @param {string} subtitle - 通知副标题
 * @param {string} message - 通知内容
 */
const notify = (title, subtitle, message) => {
    if (isLoon || isSurge) {
        $notification.post(title, subtitle, message);
    } else if (isQuanX) {
        $notify(title, subtitle, message);
    }
};

/**
 * 统一 HTTP 请求方法
 * @param {Object} options - 请求选项，包含url、method、headers、body等
 * @param {Function} callback - 回调函数，参数为(error, response, body)
 */
function fetchWithCallback(options, callback) {
    if (isLoon || isSurge) {
        if (options.method === "POST") {
            $httpClient.post(options, callback);
        } else {
            $httpClient.get(options, callback);
        }
    } else if (isQuanX) {
        $task.fetch(options).then(response => {
            callback(null, response, response.body);
        }).catch(error => {
            notify("获取失败", "切换网络重试或者问问作者吧～", JSON.stringify(error));
            callback(error, null, null);
        });
    }
}



/**
 * APP统一返回状态
 * @param {string} success - 成功状态
 * @param {string} data - 返回的信息
 * @param {Array|Object} array - 返回的数据数组或对象
 * @returns {Object} - 格式化的HTTP响应对象
 */
function responseStatusWEB(success, data, array) {
    return {
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            success: `${success}`,
            data: {
                information: `${data}`,
                array: array,

            }
        })
    }
}

/**
 * 微信api统一返回状态
 * @param {string} success - 成功状态
 * @param {string} data - 返回的信息
 * @param {Array|Object} array - 返回的数据数组或对象
 * @returns {Object} - 格式化的HTTP响应对象，内容类型为text/plain
 */
function responseStatusWeChatAPP(data) {
    return {
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: data
    }
}

//全局记录本次请求是web还是app
let isWeb = false;
/**
 * URL处理函数
 * 将URL解码，去除空格，替换中文冒号，并按特定规则解析参数
 * @param {string} url - 需要处理的URL
 * @returns {Array} - 解析后的数据数组
 */
function parseUrl(url) {
    // 第一步：URL解码
    let decodedUrl = decodeURIComponent(url);

    // 按?拆分取后半部分
    const parts = decodedUrl.split('?');
    const queryPart = parts[1];

    // 检查是否为app请求
    if (queryPart.toLowerCase().includes('app')) {
        // APP请求处理方式
        isWeb = false;
        // 去除空格
        decodedUrl = decodedUrl.replace(/\s+/g, '');
        // 将中文冒号替换成英文冒号
        decodedUrl = decodedUrl.replace(/：/g, ':');

        // 重新获取处理后的查询部分
        const parts = decodedUrl.split('?');
        const queryPart = parts[1];

        // 首先按=拆分
        const equalParts = queryPart.split('=');
        // 获取=后面的部分作为data1
        const data1 = equalParts[0];
        let remainingPart = equalParts[1];
        // 按:拆分获取data2和后续部分
        const colonParts = remainingPart.split(':');
        if (colonParts.length < 2) {
            return [data1, remainingPart]; // 如果没有:，则返回data1和=后面的部分
        }
        const data2 = colonParts[0];
        remainingPart = colonParts[1];
        // 按-拆分后半部分获取data3及以后的数据
        const data3AndBeyond = remainingPart.split('-');
        // 构建结果数组，包含data1, data2和data3及以后的数据
        const result = [data1, data2, ...data3AndBeyond];
        return result;
    } else {
        // WEB请求处理方式
        isWeb = true;
        // 解析查询参数
        const params = {};
        const queryParams = queryPart.split('&');

        // 获取第一个参数的键值对
        const firstParam = queryParams[0].split('=');
        const action = firstParam[1]; // 例如 AddKeyWord

        // 处理剩余参数
        for (let i = 1; i < queryParams.length; i++) {
            const param = queryParams[i].split('=');
            const key = param[0];
            const value = param[1];

            // 特殊处理 prompt_word 参数，将其拆分为数组
            if (key === 'prompt_word') {
                params[key] = value.split('-');
            } else {
                params[key] = value;
            }
        }

        // 构建结果数组 [请求类型, 动作, 参数对象]
        const result = [firstParam[0], action, params];
        return result;
    }


}

//文本类前后缀
function handleTextPrefixSuffix(textdata) {
    // 通过action找到对应的API索引
    const apiIndex = WeChatAPIuserinfo.api.findIndex(item => item.id === action);

    if (apiIndex !== -1 && WeChatAPIuserinfo.api[apiIndex].grade === 1) {
        // 获取前缀和后缀
        const prefixText = WeChatAPIuserinfo.api[apiIndex].prefix_text || "";
        const suffixText = WeChatAPIuserinfo.api[apiIndex].suffix_text || "";
        // 拼接前缀和后缀到参数
        const responseWithPrefixSuffix = `${prefixText}${textdata}${suffixText}`;
        return responseWithPrefixSuffix;
    } else {
        return textdata;
    }
}

// 默认用户信息
const defaultWeChatAPIuserinfo = {
    "api": [
        {
            "id": "randomnumber",
            "name": "随机数",
            "grade": 1,
            "enable": true,
            "prompt_word": ["随机数", "sjs"],
            "prefix_text": "随机数：",
            "suffix_text": "---结束---",
            "help": "使用“/bot 随机数：最小-最大-数量”",
        },
        {
            "id": "help",
            "name": "帮助",
            "grade": 1,
            "enable": true,
            "prompt_word": ["帮助", "help"],
            "help": "使用‘/bot 帮助’查看帮助",
            "popup_help": [],
        },
        {
            "id": "about",
            "name": "更多",
            "grade": 1,
            "enable": true,
        }
    ]
}



/**
 * 初始化数据
 * @param {string} key - 存储键名
 * @param {Object} defaultValue - 默认值
 * @returns {Object} - 初始化后的数据
 */
function initializeData(key, defaultValue) {
    let data = storage.get(key);
    if (!data) {
        // 如果数据不存在，使用默认值并存储
        data = defaultValue;
        storage.set(key, data);
    } else {
        // 检查API数组是否需要更新
        if (key === "WeChatAPIuserinfo" && data.api && defaultValue.api) {
            // 检查API长度是否一致
            if (data.api.length !== defaultValue.api.length) {
                // 获取现有API的ID列表
                const existingIds = data.api.map(item => item.id);

                // 查找默认值中不存在于现有数据中的API
                const newApis = defaultValue.api.filter(item => !existingIds.includes(item.id));

                // 将新API添加到现有数据中
                if (newApis.length > 0) {
                    data.api = [...data.api, ...newApis];
                    storage.set(key, data);
                    console.log(`更新${key}数据，添加了${newApis.length}个新API`);
                }
            }
        }
    }
    return data;
}

// 全局数据变量
let WeChatAPIuserinfo = {};
// 初始化WeChatAPIuserinfo数据
WeChatAPIuserinfo = initializeData("WeChatAPIuserinfo", defaultWeChatAPIuserinfo);


const url = $request.url;
// 解析URL参数
const params = parseUrl(url);
console.log(`解析后的参数: ${JSON.stringify(params)}`);

// 路由配置对象
const routes = {
    app: {
        randomnumber: handleAppRandomnumber,
        help: handleAppHelp,

    },
    web: {
        AddkeyWord: handleAddkeyWord,
        MainPage: handleMainPage,
        GetUserinfo: handleGetUserinfo,

    }
};

// 记录action值用于判断后续是否启用
let action = params[1];

/**
 * 路由分发函数
 * @param {Array} params - 解析后的URL参数数组
 * @returns {Object} - 处理结果
 */
function routeDispatcher(params) {
    const category = params[0]; // app 或 web
    // 如果是app类别，在WeChatAPIuserinfo[api]数组中查找匹配的prompt_word
    console.log(`${params[1]}`);
    if (category === 'app') {
        // 在WeChatAPIuserinfo.api数组中查找匹配的prompt_word
        const userInput = params[1]; // 不转为小写，保持原始大小写
        // 遍历所有API项
        for (const apiItem of WeChatAPIuserinfo.api) {
            // 检查该API项是否有prompt_word数组
            if (apiItem.prompt_word && Array.isArray(apiItem.prompt_word)) {
                // 检查用户输入是否匹配任何一个prompt_word
                const matchFound = apiItem.prompt_word.some(keyword =>
                    userInput === keyword
                );

                // 如果找到匹配项，更新action为该API的id
                if (matchFound) {
                    console.log(`找到匹配的关键词，将action从${action}更新为${apiItem.id}`);
                    action = apiItem.id;
                    break; // 找到匹配项后退出循环
                }
            }
        }
    }
    // 检查操作是否存在
    if (!routes[category][action]) {
        return $done(responseStatusWeChatAPP("命令不存在，使用“/bot 帮助“查看使用方法"));
    }
    // 执行对应的处理函数
    return routes[category][action](params);
}



/** 
 * 判断是否启用
 * @param {string} id - 要判断的api id
 * @return {boolean} - 如果api已启用不做改变，否则直接done
*/
function isEnable(id) {
    if (WeChatAPIuserinfo.api.find(item => item.id === id).enable) {
    } else {
        return $done(responseStatusWeChatAPP("命令不存在，使用“/bot 帮助“查看使用方法"));
    }
}


//APP端-----------

//随机数
function handleAppRandomnumber() {
    isEnable(action);
    // 获取随机数范围和数量
    const min = parseInt(params[2]) || 1;  // 最小范围，默认为1
    const max = parseInt(params[3]) || 49; // 最大范围，默认为49
    const count = parseInt(params[4]) || 10; // 随机数个数，默认为10
    //默认可重复
    const repeat = params[5] !== "不重复"; // 没有提供时为true，提供"不重复"时为false，其他情况为true
    // 生成随机数数组
    let randomNumbers = [];
    if (repeat) {
        //可重复
        for (let i = 0; i < count; i++) {
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            randomNumbers.push(randomNum);
        }
    } else {
        //不可重复
        // 检查可取的数量是否足够
        const possibleNumbers = max - min + 1;
        if (possibleNumbers < count) {
            // 如果可取的数量不足，返回所有可能的数
            for (let i = min; i <= max; i++) {
                randomNumbers.push(i);
            }
        } else {
            // 使用Set来确保不重复
            const uniqueNumbers = new Set();
            while (uniqueNumbers.size < count) {
                const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                uniqueNumbers.add(randomNum);
            }
            randomNumbers = Array.from(uniqueNumbers);
        }

    }
    const result = `随机数(${min}-${max}): ${randomNumbers.join(', ')}`;
    let responsedata = handleTextPrefixSuffix(result);
    console.log(`处理后的数据:${responsedata}`);
    return $done(responseStatusWeChatAPP(responsedata));
}


//帮助
function handleAppHelp() {
    isEnable(action);
    // 获取帮助内容
    // 获取所有启用的API帮助内容
    const enabledApis = WeChatAPIuserinfo.api.filter(item => item.enable === true);
    let helpContent = "";
    // 添加序号表情符号
    const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    // 组合所有启用的API的帮助内容
    enabledApis.forEach((item, index) => {
        if (item.help) {
            let emoji;
            if (index < 10) {
                emoji = numberEmojis[index];
            } else {
                // 对于10以上的数字，组合使用表情符号
                const tens = Math.floor(index / 10);
                const ones = index % 10;
                emoji = numberEmojis[tens - 1] + numberEmojis[ones];
            }
            helpContent += `${emoji} ${item.help}\n\n`;
        }
    });
    // 如果没有启用的API，返回默认消息
    if (!helpContent) {
        helpContent = "当前没有启用的API功能";
    }
    return $done(responseStatusWeChatAPP(helpContent));
}

//WEB端-----------
function handleAddkeyWord() {
    // 获取请求中的数据
    const requestData = params[2];
    if (!requestData || !requestData.id) {
        return $done(responseStatusWEB(false, "缺少必要参数", null));
    }
    // 处理数据类型转换
    if (requestData.enable !== undefined) {
        // 将enable字段转换为布尔型
        requestData.enable = requestData.enable === true || requestData.enable === "true";
    }
    if (requestData.grade !== undefined) {
        // 将grade字段转换为数字型
        requestData.grade = Number(requestData.grade);
    }
    // 在WeChatAPIuserinfo.api中查找匹配的id
    const apiIndex = WeChatAPIuserinfo.api.findIndex(item => item.id === requestData.id);
    if (apiIndex !== -1) {
        // 找到匹配项，更新数据
        WeChatAPIuserinfo.api[apiIndex] = {
            ...WeChatAPIuserinfo.api[apiIndex],
            ...requestData
        };
        console.log(`已更新ID为${requestData.id}的API数据`);
        storage.set("WeChatAPIuserinfo", WeChatAPIuserinfo);
    } else {
        // 未找到匹配项
        console.log(`未找到ID为${requestData.id}的API数据，无法更新`);
        return $done(responseStatusWEB(false, "未找到对应的API配置", null));
    }
    //根据id，去替换WeChatAPIuserinfo.api中的数据
    return $done(responseStatusWEB("success", "添加关键词"));

}




function handleMainPage() {

    const html = `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
         <link rel="icon" href="https://img.picgo.net/2025/06/27/s_4_613609915462486589b6f121e4fb.jpeg" type="image/x-icon">
    <link rel="apple-touch-icon" href="https://img.picgo.net/2025/06/27/s_4_613609915462486589b6f121e4fb.jpeg">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="WeChatAPI">
        <title>WeChatAPI</title>
        <link rel="stylesheet" href="https://at.alicdn.com/t/c/font_4951863_9u033n9ghun.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SheepFJ/QuantumultX/QuantumultX/API/wechatapi/css/main.css">
    </head>
    <body>
    <!-- 背景 -->
    <div id="background"></div>
    <!-- 灰色遮罩层 -->
    <div id="popup-overlay" class="popup-overlay"></div>
    <!-- 公共弹出框 -->
    <div id="public-popup" class="public-popup-active">
        <div class="public-popup-content">
            <div class="popup-container">
                <!-- popup-1类型api-->
                <div id="popup-1" class="popup-content">
                    <h2 id="popup-1-title"></h2>
                    <div class="popup-section">
                        <span>触发关键词</span>
                        <div class="input-group">
                            <input type="text" id="keyword-input" placeholder="请输入关键词">
                            <button id="add-keyword-btn">添加</button>
                        </div>
                        <ul id="keywords-list">
                            <li>关键词1 <a class="delete-keyword">删除</a></li>
                            <li>关键词2 <a class="delete-keyword">删除</a></li>
                            <li>关键词3 <a class="delete-keyword">删除</a></li>
                        </ul>
                        <div class="toggle-container">
                            <span>启用</span>
                            <label class="switch">
                                <input type="checkbox" id="popup-1-toggle" value="true">
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="popup-section">
                            <span style="margin-top: 40px;">书写帮助</span>
                            <textarea id="help-content"></textarea>
                        </div>
                    </div>
                </div>

                <!-- popup-2类型api-->
                <div id="popup-2" class="popup-content">
                    <h2>文本类前后缀设置</h2>
                    <div class="popup-section">
                        <span>回复前缀的内容:</span>
                        <textarea id="prefix-content"></textarea>
                    </div>
                    <div class="popup-section">
                        <span>回复后缀的内容:</span>
                        <textarea id="suffix-content"></textarea>
                    </div>
                </div>

                <div id="popup-3" class="popup-content">
                    <h2>图片类扩展设置</h2>
                </div>

                <div id="popup-4" class="popup-content">
                    <h2>视频类扩展设置</h2>
                </div>

                <div id="popup-5" class="popup-content">
                    <h2>帮助总览</h2>
                    <div class="popup-section">
                        <span>帮助内容:</span>
                        <button id="refresh-help-content">刷新</button>
                        <textarea id="help-content-all"></textarea>
                    </div>
                </div>

                <div id="popup-6" class="popup-content">
                    <h2>更多</h2>
                    <div id="about">
                        <h2>关于</h2>
                        <span class="app-name">WechatAPI</span>
                        <span class="app-version">版本号：1.0</span>
                        <span class="update-title">当前版本优化的内容如下⬇</span>
                        <ul>
                            <li>
                                <span class="update-item">1.可为一个API设置多个触发关键词</span>
                                <span class="update-item">2. 动态设置前后缀</span>
                            </li>
                        </ul>
                        <span class="disclaimer">声明：资源来源于互联网，仅供个人学习使用，请勿用于商业用途，否则后果自负。</span>
                        <span class="disclaimer">目前API还在不断完善中，作者将保持每周更新，欢迎反馈</span>
                        <span class="contact-link">Github：<a href="https://github.com/SheepFJ/QuantumultX">为作者点点Star🙏</a></span>
                        <span class="contact-link">TG群组：<a href="https://t.me/sheep_007_xiaoyang">Sheep交流反馈</a></span>
                        <span class="contact-link" style="margin-bottom: 50px;">TG频道：<a href="https://t.me/sheep_007xiaoyang" target="_blank">Sheep资源备份分享</a></span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 按钮区域 -->
        <button id="close-popup" class="close-popup">关闭</button>
        <button id="confirm-popup" class="confirm-popup">确认</button>
    </div>

    <div id="main-container">
        <!-- 占顶 -->
        <div style="height: 6%;"></div>


        <!-- 文本类 -->
        <div id="text-section" class="content-section active">
            <h3 class="section-title">文本类API</h3>
            <div class="api-grid">
                <!--随机数api-->
                <div id="randomnumber" class="wechat-api">
                    <h2>随机数</h2>
                </div>
                <!--帮助api-->
                <div id="help" class="wechat-api">
                    <h2>帮助</h2>
                </div>
                <!--关于api-->
                <div id="about" class="wechat-api">
                    <h2>更多</h2>
                </div>
            </div>
        </div>



        <!-- 图片类 -->
        <div id="image-section" class="content-section">
            <h3 class="section-title">图片类API</h3>
            <div class="api-grid">
                <h1>持续更新中......</h1>
            </div>
        </div>

        <!-- 视频类 -->
        <div id="video-section" class="content-section">
            <h3 class="section-title">视频类API</h3>
            <div class="api-grid">
                <h1>持续更新中......</h1>
            </div>
        </div>

        <!-- 占底 -->
        <div style="height: 6%;"></div>
    </div>
        <footer>
        <div id="bottom-nav">
            <div class="nav-button nav-active" id="textBtn" onclick="showSection('text')">
                <i class="iconfont icon-chat-bubble-filled"></i>
                <span>文本</span>
            </div>
            <div class="nav-button" id="imageBtn" onclick="showSection('image')">
                <i class="iconfont icon-image-filled"></i>
                <span>图片</span>
            </div>
            <div class="nav-button" id="videoBtn" onclick="showSection('video')">
                <i class="iconfont  icon-chevron-right-circle-filled"></i>
                <span>视频</span>
            </div>
        </div>
    </footer>
    </body >
    <script src="https://cdn.jsdelivr.net/gh/SheepFJ/QuantumultX/QuantumultX/API/wechatapi/js/page.js"></script>
    </html >
`;
    return $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "text/html" },
        body: html
    });
}
// 获取用户信息
function handleGetUserinfo() {
    let userinfo = WeChatAPIuserinfo;
    //将userinfo.api每一项的help加入到userinfo.id=help的api的popup_help数组
    const helpArray = [];
    // 遍历所有API项，收集help字段
    userinfo.api.forEach(item => {
        if (item.help) {
            helpArray.push(item.help);
        }
    });
    // 找到id为help的API项，更新其popup_help字段
    const helpApiIndex = userinfo.api.findIndex(item => item.id === 'help');
    if (helpApiIndex !== -1) {
        userinfo.api[helpApiIndex].popup_help = helpArray;
    }
    //响应配置信息
    return $done(responseStatusWEB(true, userinfo, userinfo));
}
// 执行路由分发
routeDispatcher(params);