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

//视频/图片类型API重定向到指定url的函数
function redirectToUrl(url) {
    $done({
        status: "HTTP/1.1 302 Found",
        headers: {
            "Location": url, // 重定向到图片的 URL
            "Content-Type": "text/plain; charset=utf-8" // 可以设置为 text/plain，避免浏览器不正确处理
        },
        body: "Redirecting to image..." // 可选的消息，告知客户端正在重定向
    })
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
        let queryPart = parts[1];

        // 如果包含musicplay，直接移除第二个=号
        if (queryPart.includes('musicplay')) {
            let firstEqualIndex = queryPart.indexOf('=');
            let secondEqualIndex = queryPart.indexOf('=', firstEqualIndex + 1);
            if (secondEqualIndex !== -1) {
                queryPart = queryPart.slice(0, secondEqualIndex) + queryPart.slice(secondEqualIndex + 1);
            }
        }
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
        },
        {
            "id": "reset",
            "name": "重置",
            "grade": 1,
            "enable": true,
        },
        {
            "id": "image",
            "name": "360壁纸",
            "grade": 2,
            "enable": true,
            "prompt_word": ["360壁纸", "360"],
            "help": "使用‘/bot 360壁纸’获取一张随机壁纸",
        },
        {
            "id": "musicplay",
            "name": "音乐播放",
            "grade": 1,
            "enable": true,
            "prompt_word": ["点歌", "musicplay"],
            "help": "使用“点歌🟰歌曲名-序号(不加默认第一首)”歌曲名称为王者英雄时序号填0触发英雄随机语音",
        },
        {
            "id": "musiclist",
            "name": "音乐列表",
            "grade": 1,
            "enable": true,
            "prompt_word": ["音乐", "yl"],
            "help": "使用‘/bot 音乐:歌曲名/作者’查看音乐列表",
        },
        {
            "id": "xiaorenjupai",
            "name": "小人举牌",
            "grade": 2,
            "enable": true,
            "prompt_word": ["举牌", "jp"],
            "help": "使用‘/boi 举牌’获取一张随机小人举牌图片",
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
        console.log(`初始化${key}数据成功`);
    } else {
        console.log(`读取${key}数据成功`);

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
        image360: handleGet360image,
        musicplay: handleMusicplay,
        musiclist: handleMusiclist,
        xiaorenjupai: handleXiaorenjupai,

    },
    web: {
        AddkeyWord: handleAddkeyWord,
        MainPage: handleMainPage,
        GetUserinfo: handleGetUserinfo,
        reset: handleReset,


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
        console.log(`${id}已启用`);
    } else {
        return $done(responseStatusWeChatAPP("命令不存在，使用“/bot 帮助“查看使用方法"));
    }
}


//APP端-----------

//点歌
function handleMusicplay() {
    isEnable(action);
    const songName = params[2];
    const songlist = params[3] || 1;
    //构建响应json
    const responseData = {
        code: 200,
        title: "英雄名称不对哦～",
        singer: "瑶瑶公主",
        cover: "https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/505/505-bigskin-1.jpg",
        music_url: "https://game.gtimg.cn/images/yxzj/zlkdatasys/audios//music/20190403/791ce1d0c6968540c05726d6e3e159f9.mp3"
    };



    if (songlist == 0) {
        let url = "https://api.tangdouz.com/wzyyb.php?nr=" + encodeURIComponent(songName);

        const options = {
            url: url,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
                'Accept': 'application/json'
            }
        };
        fetchWithCallback(options, (error, response, body) => {
            if (error) {
                console.log('Error:', error);
                return $done({
                    status: "HTTP/1.1 200 OK",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(responseData)
                });
            }
            try {
                const res = JSON.parse(body);
                // img -> cover, name -> singer, data: random content->title, url->music_url
                if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
                    responseData.cover = res.img || responseData.cover;
                    responseData.singer = res.name || responseData.singer;
                    const randomIndex = Math.floor(Math.random() * res.data.length);
                    const randomItem = res.data[randomIndex];
                    responseData.title = randomItem.content || responseData.title;
                    responseData.music_url = randomItem.url || responseData.music_url;
                }
            } catch (e) {
                console.log('Parse wz music api response error:', e);
            }
            return $done({
                status: "HTTP/1.1 200 OK",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(responseData)
            });
        });
    }


    let url = 'https://api.52vmy.cn/api/music/kw?word=' + encodeURIComponent(songName) + '&n=' + songlist;
    console.log(`url:${url}`);


    // 构造响应数据
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json'
        }
    };
    fetchWithCallback(options, (error, response, body) => {
        if (error) {
            console.log('Error:', error);
            return $done({
                status: "HTTP/1.1 200 OK",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(responseData)
            });
        }

        try {
            const res = JSON.parse(body);
            if (res && res.data) {
                responseData.cover = res.data.picture || responseData.cover;
                responseData.title = res.data.name || responseData.title;
                responseData.singer = res.data.artist || responseData.singer;
                responseData.music_url = res.data.url || responseData.music_url;
            }
        } catch (e) {
            console.log('Parse music api response error:', e);
        }
        return $done({
            status: "HTTP/1.1 200 OK",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(responseData)
        });
    });

}

//获取歌曲列表
function handleMusiclist() {
    isEnable(action);
    const songName = params[2];
    // 对 songName 进行 encodeURIComponent 编码，防止中文导致 bad url
    const url = 'https://api.52vmy.cn/api/music/kw?word=' + encodeURIComponent(songName);

    const options = {
        url: url,
        method: 'GET',
        headers: {
            // 只保留必要头部
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json'
        }
    };

    fetchWithCallback(options, (error, response, body) => {
        if (error) {
            console.log('Error:', error);
            return $done(responseStatusWeChatAPP("获取音乐列表失败，请稍后重试"));
        }
        return $done(responseStatusWeChatAPP(body));
    });

}

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
    console.log(`处理app帮助`);
    console.log(`action:${action}`);
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

//360壁纸
function handleGet360image() {
    isEnable(action);
    const options = {
        url: 'https://api.tangdouz.com/a/360bza.php',
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Sec-Fetch-Mode': 'navigate',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Priority': 'u=0, i',
            'Host': 'api.tangdouz.com',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Site': 'none',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1'
        }
    };
    fetchWithCallback(options, (error, response, body) => {
        if (error) {
            console.log('Error:', error);
            return $done(responseStatusWeChatAPP("获取图片失败，请稍后重试"));
        }
        return redirectToUrl(body);
    });
}

//小人举牌
function handleXiaorenjupai() {
    isEnable(action);
    const songName = params[2];
    const apiUrl = `https://shanhe.kim/api/qq/ju2.php?msg=${encodeURIComponent(songName)}`;

    const options = {
        url: apiUrl,
        method: 'GET',
        headers: {
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1`,
            'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
        }
    }
    fetchWithCallback(options, (error, response, body) => {
        if (error) {
            console.log('Error:', error);
            return $done(responseStatusWeChatAPP("获取图片失败，请稍后重试"));
        }
        return redirectToUrl(apiUrl);
    });
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

//重置
function handleReset() {
    storage.set("WeChatAPIuserinfo", defaultWeChatAPIuserinfo);
    return $done(responseStatusWEB("success", "重置成功"));
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
    </head>
    <style>
        <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        text-decoration: none;
    }
    html,
    body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        -webkit-overflow-scrolling: touch;
    }
    body {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: scroll;
        position: relative;
        height: 100vh;
        margin: 0;
        overflow: hidden;
    }
    #background {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        background-image: url('https://img-new-cdn.whalean.com/wallpaper-material/2cldMlKoKhAP_1713334763158.jpg?imageMogr2/auto-orient/fomat/webp/thumbnail/1280%3E');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
    #main-container {
        width: 100%;
        min-height: 100%;
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        height: calc(100vh - 50px);
        padding-bottom: 50px;
    }

    /* 底部导航栏 */
    #bottom-nav {
        padding: 10px 0;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 8%;
        background: rgba(0, 0, 0, 1);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 10000;

    }

    .nav-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #999;
        width: 33.33%;
        height: 100%;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .nav-button i {
        font-size: 30px;
        margin-bottom: 4px;
    }

    .nav-button span {
        font-size: 14px;
    }

    .nav-active {
        color: #f04949;
    }

    /* 内容区域样式 */
    .content-section {
        display: none;
        width: 100%;
        padding: 100px;
        padding-bottom: 200px;
        padding: 0;
        color: #fff;
    }

    .content-section.active {
        display: block;
    }
    </style>
    <body>

    <!-- 背景 -->
    <div id="background"></div>



    <style>
        .public-popup-active {
            z-index: 997;
            height: 80%;
            width: 92%;
            margin-left: 4%;
            background-color: #f8f8f8;
            position: fixed;
            top: 7%;
            display: none;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            transition: all 0.3s ease;
        }

        /* 灰色遮罩层 */
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 997;
            display: none;
        }

        .popup-content {
            padding: 20px;
            margin-bottom: 45px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: none;
        }

        .popup-content h2 {
            text-align: center;
            margin-bottom: 15px;
            color: #333;
            font-size: 20px;
            font-weight: 600;
        }

        .popup-section {
            margin-bottom: 15px;
        }

        .popup-section span {
            display: block;
            color: #555;
            font-weight: 500;
        }

        .popup-section .input-group {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .popup-section .input-group input[type="text"] {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px 0 0 8px;
            font-size: 14px;
            margin: 10px 0;
        }

        .popup-section .input-group button {
            padding: 10px 15px;
            background: linear-gradient(125deg, #4a90e2, #63b3ed);
            color: white;
            border: none;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .popup-section button:hover {
            background: linear-gradient(125deg, #3a80d2, #539fe3);
            transform: scale(0.98);
        }

        .popup-section ul {
            list-style: none;
            padding: 0;
            margin: 25px 0;
        }

        .popup-section li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            background-color: #f5f5f5;
            border-radius: 6px;
            margin-bottom: 5px;
        }

        .popup-section li a {
            color: #e74c3c;
            cursor: pointer;
            font-size: 14px;
        }

        .popup-section textarea {
            width: 100%;
            margin-top: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            resize: vertical;
            min-height: 100px;
            font-size: 14px;
            font-family: inherit;
        }

        /* 开关按钮样式 */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
            margin-left: 10px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: #4a90e2;
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }

        .popup-section .toggle-container {
            display: flex;
            align-items: center;
            margin-top: 40px;
        }

        .close-popup, .confirm-popup {
            position: absolute;
            bottom: 15px;
            padding: 10px 25px;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        }

        .close-popup {
            left: 35%;
            transform: translateX(-50%);
            background: linear-gradient(125deg, #ff5e62, #ff9966);
        }

        .confirm-popup {
            left: 65%;
            transform: translateX(-50%);
            background: linear-gradient(125deg, #4a90e2, #63b3ed);
        }

        .close-popup:hover, .confirm-popup:hover {
            transform: translateX(-50%) scale(0.95);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        }

        .public-popup-content {
            position: relative;
            height: 100%;
            padding: 20px;
            padding-bottom: 70px;
            overflow-y: auto;
        }

        .popup-container {
            margin-bottom: 20px;
        }
    </style>

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

                <style>
                .app-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    display: block;
                }
                .app-version {
                    font-size: 16px;
                    margin-bottom: 20px;
                    display: block;
                }
                .update-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    display: block;
                }
                .update-item {
                    display: block;
                    margin-bottom: 5px;
                }
                .disclaimer {
                    font-style: italic;
                    margin-top: 20px;
                    display: block;
                }
                .contact-link {
                    display: block;
                    margin-top: 10px;
                }
                </style>
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

                <div id="popup-7" class="popup-content">
                    <h2>重置</h2>
                    <div class="popup-section">
                        <span>重置所有数据</span>
                        <button id="reset-all-data">重置</button>
                    </div>
                </div>
               
            </div>
        </div>

        <!-- 按钮区域 -->
        <button id="close-popup" class="close-popup">关闭</button>
        <button id="confirm-popup" class="confirm-popup">确认</button>
    </div>

    <script>
        let userInfoArray = [];
        fetch('http://www.360.cn/sheep/wechat/api/?web=GetUserinfo')
                .then(response => response.json())
                .then(data => {
                   userInfoArray = data.data.array;    
                })
                .catch(error => {
                    console.error('Error:', error);
                })

        let currentPopup = null;


        document.getElementById('reset-all-data').addEventListener('click', function () {
                        fetch('http://www.360.cn/sheep/wechat/api/?web=reset')
                            .then(response => response.json())
                            .then(data => {
                                console.log("重置成功");
                                //刷新页面
                                window.location.href = 'http://www.360.cn/sheep/wechat/api/?web=MainPage';
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            })
                    });

        function showPopup(text) {
        // 隐藏所有内容区域
        document.querySelectorAll('.popup-content').forEach(item => {
            item.style.display = 'none';
        });
        // 显示弹出框与遮罩层
        document.getElementById('public-popup').style.display = 'block';
        document.getElementById('popup-overlay').style.display = 'block';

        // 显示对应内容区域
        const contentMap = {
            'randomnumber': ['popup-1', 'popup-2'],
            'help': ['popup-1','popup-5'],
            'about': ['popup-6'],
            'image360': ['popup-1'],
            'musicplay': ['popup-1'],
            'musiclist': ['popup-1'],
            'reset': ['popup-7'],
            'xiaorenjupai': ['popup-1'],
        };

        //根据userInfoArray的id，获取对应的数据然后渲染弹出页面
        const userInfo = userInfoArray.api.find(item => item.id === text);
        console.log(userInfo);

        if (contentMap[text]) {
            contentMap[text].forEach(item => {

                // 如果是popup-1，更新标题、关键词列表和开关状态
                if (item === 'popup-1' && userInfo) {
                    // 更新标题
                    const titleElement = document.getElementById('popup-1-title');
                    if (titleElement) {
                        titleElement.textContent = \`\${userInfo.name}\`;
                    }

                    // 更新关键词列表
                    const keywordsList = document.getElementById('keywords-list');
                    if (keywordsList && userInfo.prompt_word) {
                        // 清空现有列表
                        keywordsList.innerHTML = '';

                        // 添加关键词
                        userInfo.prompt_word.forEach(keyword => {
                            const li = document.createElement('li');
                            li.innerHTML = \`\${keyword} <a class="delete-keyword">删除</a>\`;
                            keywordsList.appendChild(li);

                            // 为新添加的删除按钮添加事件监听
                            li.querySelector('.delete-keyword').addEventListener('click', function () {
                                keywordsList.removeChild(li);
                            });
                        });
                    }

                    // 更新开关状态
                    const toggleSwitch = document.getElementById("popup-1-toggle");
                    if (toggleSwitch) {
                        toggleSwitch.checked = userInfo.enable === true;
                    }

                    // 更新帮助文本
                    const helpTextarea = document.getElementById('help-content');
                    if (helpTextarea && userInfo.help) {
                        helpTextarea.value = userInfo.help;
                    }
                }


                if (item === 'popup-2' && userInfo) {
                    // 更新前缀文本
                    const prefixTextarea = document.getElementById('prefix-content');
                    if (prefixTextarea && userInfo.prefix_text) {
                        prefixTextarea.value = userInfo.prefix_text;
                    }
                    
                    // 更新后缀文本
                    const suffixTextarea = document.getElementById('suffix-content');
                    if (suffixTextarea && userInfo.suffix_text) {
                        suffixTextarea.value = userInfo.suffix_text;
                    }
                }

                if (item === 'popup-5' && userInfo) {
                    // 更新帮助文本
                    const helpTextarea = document.getElementById('help-content-all');
                    if (helpTextarea && userInfo.popup_help) {
                        helpTextarea.value = userInfo.popup_help.join('\\n');
                    }
                }

            
            document.getElementById(item).style.display = 'block';
            });

            currentPopup = text;
        }
    }


    // 刷新-重新打开http://www.360.cn/sheep/wechat/api/?web=MainPage
    document.getElementById('refresh-help-content').addEventListener('click', function () {
        window.location.href = 'http://www.360.cn/sheep/wechat/api/?web=MainPage';
    });

// 添加关键词
document.getElementById('add-keyword-btn').addEventListener('click', function () {
    const input = document.getElementById('keyword-input');
    const keyword = input.value.trim();

    if (keyword) {
        const list = document.getElementById('keywords-list');
        const li = document.createElement('li');
        li.innerHTML = \`\${ keyword } <a class="delete-keyword">删除</a>\`;
                list.appendChild(li);
                input.value = '';
                
                // 为新添加的删除按钮添加事件监听
                li.querySelector('.delete-keyword').addEventListener('click', function() {
                    list.removeChild(li);
                });
            }
        });

        // 为已有的删除按钮添加事件监听
        document.querySelectorAll('.delete-keyword').forEach(btn => {
            btn.addEventListener('click', function() {
                const li = this.parentElement;
                li.parentElement.removeChild(li);
            });
        });

        // 关闭弹出框
        const closePopup = document.querySelector('.close-popup');
        closePopup.addEventListener('click', () => {
            document.getElementById('public-popup').style.display = 'none';
            document.getElementById('popup-overlay').style.display = 'none';
        });

        // 确认按钮
        const confirmAI = document.querySelector('.confirm-popup');
        confirmAI.addEventListener('click', () => {

            // 获取当前显示的弹窗
            const visiblePopups = document.querySelectorAll('.popup-content');
            let currentPopupId = '';
            let data = {};
            
            // 遍历所有弹窗，找到当前显示的弹窗
            visiblePopups.forEach(popup => {
                if (popup.style.display === 'block') {
                    currentPopupId = popup.id;
                    
                    // 根据弹窗类型组装数据
                    if (currentPopupId === 'popup-1') {
                        // 获取标题（名称）
                        const name = document.getElementById('popup-1-title').innerHTML;
                        
                        // 获取ID（从标题中提取或使用预设值）
                        const id = currentPopup; // 使用当前弹窗的ID
                        
                        // 获取是否启用
                        const enable = document.getElementById('popup-1-toggle').checked;
                        
                        // 获取帮助文本
                        const helpContent = document.getElementById('help-content').value;

                        
                        // 获取关键词列表
                        const keywordsList = document.getElementById('keywords-list');
                        const keywords = [];
                        keywordsList.querySelectorAll('li').forEach(li => {
                            // 提取关键词文本（去除"删除"按钮文本）
                            const keywordText = li.textContent.replace('删除', '').trim();
                            keywords.push(keywordText);
                        });
                        
                        // 组装数据
                        data = {
                            "id": id,
                            "name": name,
                            "grade": 1,
                            "enable": enable,
                            "prompt_word": keywords,
                            "help": helpContent
                        };
                    } 
                        
                    if (currentPopupId === 'popup-2') {
                        // 获取前缀和后缀内容
                        const prefixContent = document.getElementById('prefix-content').value;
                        const suffixContent = document.getElementById('suffix-content').value;
                        data = {
                            ...data,
                            "prefix_text": prefixContent,
                            "suffix_text": suffixContent
                        };
                    }

                    if (currentPopupId === 'popup-5') {
                        // 获取帮助内容
                        const helpContent = document.getElementById('help-content').value;
                        data = {
                            ...data,
                            "help": helpContent
                        };
                    }
                    
                }
            });
            
            console.log("保存的数据:", data);
            

            // 更新userInfoArray中的数据
            if (userInfoArray && userInfoArray.api && data && data.id) {
                // 查找匹配的API项
                const apiIndex = userInfoArray.api.findIndex(item => item.id === data.id);
                
                // 如果找到匹配项，则替换数据
                if (apiIndex !== -1) {
                    userInfoArray.api[apiIndex] = data;
                    console.log(\`已更新ID为\${ data.id }的API数据\`);
                } else {
                    console.log(\`未找到ID为\${ data.id } 的API数据，无法更新\`);
                }
                
                //发送请求，更新userInfoArray
                // 构建URL参数
                let urlParams = \`web=AddkeyWord\`;
                
                // 遍历data对象的每个属性
                for (const [key, value] of Object.entries(data)) {
                    if (Array.isArray(value)) {
                        // 如果值是数组，用连字符拼接
                        urlParams += \`&\${key}=\${value.join('-')}\`;
                    } else {
                        // 如果值是普通类型
                        urlParams += \`&\${key}=\${value}\`;
                    }
                }
                
                fetch(\`http://www.360.cn/sheep/wechat/api/?\${urlParams}\`)
                .then(response => response.json())
    .then(responseData => {
        console.log(responseData.data.information);
    })
    .catch(error => {
        console.error('更新数据失败:', error);
    });
                
            }

// 关闭弹出框
document.getElementById('public-popup').style.display = 'none';
document.getElementById('popup-overlay').style.display = 'none';
});
    </script >

    <style>
        .api-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding: 20px;
        }
        
        .wechat-api {
            width: 30%;
            margin-bottom: 15px;
            padding: 15px;
            background: linear-gradient(135deg, #f5f7fa, #e9ecef);
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .wechat-api:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .wechat-api h2 {
            margin: 0;
            font-size: 16px;
            color: #333;
        }
        
        .content-section {
            display: none;
        }
        
        .content-section.active {
            display: block;
        }
        
        .section-title {
            margin-left: 10px;
            margin-bottom: 15px;
            padding-left: 10px;
            font-size: 30px;
            color: #333;
            border-left: 4px solid #ff9966;
        }
    </style>


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

                

                <!--点歌api-->
                <div id="musicplay" class="wechat-api">
                    <h2>点歌</h2>
                </div>

                <!--音乐列表api-->
                <div id="musiclist" class="wechat-api">
                    <h2>音乐列表</h2>
                </div>

                <!--重置api-->
                <div id="reset" class="wechat-api">
                    <h2>重置</h2>
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
                <div id="image360" class="wechat-api">
                    <h2>360图壁纸</h2>
                </div>

                <div id="xiaorenjupai" class="wechat-api">
                    <h2>小人举牌</h2>
                </div>
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
    </html >
    <script>
        // 导航栏
        let currentSection = 'text';
        function showSection(section) {
            // 更新当前选中的导航按钮
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('nav-active');
            });
        document.getElementById(section + 'Btn').classList.add('nav-active');

            // 隐藏所有内容区域
            document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            });

        // 显示选中的内容区域
        document.getElementById(section + '-section').classList.add('active');

        // 更新当前section
        currentSection = section;
        }

        // 为所有content-section下面的wechat-api元素添加点击事件
        document.addEventListener('DOMContentLoaded', function() {
            const contentSections = document.querySelectorAll('.content-section');
            
            contentSections.forEach(section => {
                const wechatApiElements = section.querySelectorAll('.wechat-api');
                
                wechatApiElements.forEach(element => {
            element.addEventListener('click', function () {
                const id = this.getAttribute('id');
                currentPopup = id;
                console.log('Current popup:', currentPopup);
                showPopup(currentPopup);
            });
                });
            });
        });


    </script>

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
