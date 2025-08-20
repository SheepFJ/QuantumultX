// 通用工具函数和环境检测
const isLoon = typeof $persistentStore !== "undefined";
const isQuanX = typeof $prefs !== "undefined";
const isSurge = !isLoon && !isQuanX; // 其他环境按Surge处理
// 统一存储方法
const storage = {
  get: key => {
    let value = null;
    if (isLoon || isSurge) value = $persistentStore.read(key);
    if (isQuanX) value = $prefs.valueForKey(key);
    if (value === undefined || value === null) return null;
    try {
      // 尝试解析为对象
      return JSON.parse(value);
    } catch (e) {
      // 如果不是JSON字符串，直接返回原始值
      return value;
    }
  },
  set: (key, val) => {
    let toStore;
    // 如果是对象或数组，序列化为字符串
    if (typeof val === "object" && val !== null) {
      toStore = JSON.stringify(val);
    } else {
      toStore = val;
    }
    if (isLoon || isSurge) return $persistentStore.write(toStore, key);
    if (isQuanX) return $prefs.setValueForKey(toStore, key);
  }
};
// 统一通知方法
const notify = (title, subtitle, message) => {
  if (isLoon || isSurge) {
    $notification.post(title, subtitle, message);
  } else if (isQuanX) {
    $notify(title, subtitle, message);
  }
};
// 统一 HTTP 请求方法
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
// 统一返回状态
function responseStatus(success, data, array) {
  return {
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      success: `${success}`,
      data: {
        information: `${data}`,
        array: array, // 直接传递数组，不使用模板字符串

      }
    })
  }
}

const url = $request.url;

// 路由处理器映射表
const routeHandlers = {
  login: {
    match: (url) => url.includes('/v11/loginregister'),
    handle: handleLoginCookie
  },
  pan_file_id: {
    match: (url) => url.includes('/api/getMyDirAndFiles'),
    handle: handlePanFileId
  },
  login_out: {
    match: (url) => url.includes('/apis/pmsg/logoffUmeng'),
    handle: handleLoginOut
  },
  api: {
    match: (url) => url.includes('/sheep/music'),
    handlers: {
      // 用户信息
      userinfo: {
        match: (url) => url.includes('?index'),
        handle: handleIndex
      },
      // 音频
      music: {
        match: (url) => url.includes('?filename'),
        handle: handleMusic
      }
    },
    defaultHandler: () => $done({
      status: "HTTP/1.1 404 Not Found",
      headers: { "Content-Type": "text/html;charset=utf-8" },
      body: "<h1>未找到这个路由，请确认路径是否正确</h1>"
    })
  }
};

// 路由分发函数
function routeRequest(url, routeMap) {
  // 遍历所有主路由
  for (const routeKey in routeMap) {
    const route = routeMap[routeKey];
    // 检查URL是否匹配当前主路由
    if (route.match(url)) {
      // 如果路由包含子路由处理器
      if (route.handlers) {
        // 遍历所有子路由
        for (const subRouteKey in route.handlers) {
          const subRoute = route.handlers[subRouteKey];
          // 检查URL是否匹配当前子路由
          if (subRoute.match(url)) {
            // 执行匹配的子路由处理函数
            return subRoute.handle();
          }
        }
        // 如果没有匹配的子路由，使用默认处理器或返回空响应
        return route.defaultHandler ? route.defaultHandler() : $done({});
      }

      // 如果是主路由且没有子路由，直接执行主路由处理函数
      if (route.handle) {
        return route.handle();
      }
    }
  }

  // 如果没有匹配的路由，返回404
  return $done({
    status: "HTTP/1.1 404 Not Found",
    headers: { "Content-Type": "text/html;charset=utf-8" },
    body: "<h1>路径地址不一致</h1>"
  });
}
function handleIndex() {
  // 获取chaoxingcookie的值
  const chaoxingcookie = storage.get("chaoxingcookie");
  if (!chaoxingcookie) {
    return $done({
      status: "HTTP/1.1 200 OK",
      headers: { "Content-Type": "text/html;charset=utf-8" },
      body: "<h1>没有获取到学习通的登陆信息，请退出重新登录学习通</h1>"
    });
  }

  const panFileUrl = storage.get("chaoxingpanfileurl") || {};
  if (!panFileUrl.id) {
    return $done({
      status: "HTTP/1.1 200 OK",
      headers: { "Content-Type": "text/html;charset=utf-8" },
      body: "<h1>没有获取到云盘文件夹ID，请先进入学习通的云盘，在根目录新建名为 'StudyMusic' 的文件夹</h1>"
    });
  }

  // 文件夹id
  const panFileId = panFileUrl.id;
  // 文件夹_token
  const panFile_token = panFileUrl._token;
  // puid
  const puid = panFileUrl.puid;


  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="StudyMusic">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="theme-color" content="#667eea">
    <meta name="msapplication-TileColor" content="#667eea">
    <title>StudyMusic</title>
    <link rel="icon" href="https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png" type="image/x-icon">
    <link rel="apple-touch-icon" href="https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png">
    <link rel="stylesheet" href="https://at.alicdn.com/t/c/font_5000840_sx4mo2uvy2.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      text-decoration: none;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .iconfont{
      font-size: 22px;
    }
    
    .header {
      text-align: center;
      padding: 50px 20px 25px 20px;
    }
    /* 渐变色标题 */
    .header .header-title{
      font-size: clamp(24px, 4vw, 30px);
      font-weight: 600;
      margin: 0;
      background: linear-gradient(45deg,rgb(255, 255, 255) 0%,rgb(56, 255, 34) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
    }
    
    .header h1 {
      font-size: clamp(18px, 4vw, 24px);
      font-weight: 600;
      margin: 0;
    }
    
    .music-list {
      flex: 1;
      overflow-y: auto;
      padding: 25px 20px 50px 20px;
      padding-bottom: 200px;
    }
    
    .music-item {
      display: flex;
      color: rgb(207, 207, 207);
      align-items: center;
      padding: clamp(12px, 3vw, 18px);
      margin-bottom: clamp(8px, 2vw, 12px);
      background: rgba(255,255,255,0.1);
      border-radius: clamp(8px, 2vw, 12px);
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .music-item:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    
    .music-item.active {
      background: rgba(255,255,255,0.3);
      color: #fff;
      border: 2px solid transparent;
      border-radius: clamp(8px, 2vw, 12px);
      background-image: linear-gradient(150deg, rgba(231, 231, 231, 0.6), rgb(84, 255, 157,0.21));
      background-origin: border-box;
      background-clip: padding-box, border-box;
      box-shadow: 0 4px 20px rgba(54,54,54,0.3);
      position: relative;
      z-index: 1;
      transform: translateY(-3px);
      transition: all 0.3s ease;
    }
    
    .music-cover {
      width: clamp(45px, 12vw, 60px);
      height: clamp(45px, 12vw, 60px);
      border-radius: clamp(6px, 1.5vw, 8px);
      margin-right: clamp(12px, 3vw, 18px);
      object-fit: cover;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .music-info {
      flex: 1;
      min-width: 0;
    }
    
    .music-name {
      font-size: clamp(14px, 3.5vw, 18px);
      font-weight: 600;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .music-artist {
      font-size: clamp(12px, 3vw, 14px);
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .player-controls {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      color: #fff;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(20px);
      padding: clamp(15px, 4vw, 25px);
      border-top: 1px solid rgba(255,255,255,0.1);
      border-top-left-radius: 25px;
      border-top-right-radius: 25px;
      z-index: 1000;
    }
    
    .now-playing {
      display: flex;
      align-items: center;
      margin-bottom: clamp(12px, 3vw, 18px);
    }
    
    .now-playing-cover {
      width: clamp(50px, 15vw, 70px);
      height: clamp(50px, 15vw, 70px);
      border-radius: clamp(6px, 1.5vw, 8px);
      margin-right: clamp(12px, 3vw, 18px);
      object-fit: cover;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    .now-playing-info {
      flex: 1;
      min-width: 0;
      margin-right: clamp(15px, 4vw, 25px);
    }
    
    .now-playing-name {
      font-size: clamp(14px, 3.5vw, 18px);
      font-weight: 600;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .now-playing-artist {
      font-size: clamp(12px, 3vw, 14px);
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .controls {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-shrink: 0;
    }
    
    .control-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: clamp(16px, 4vw, 20px);
      cursor: pointer;
      padding: clamp(6px, 1.5vw, 8px);
      border-radius: 50%;
      transition: all 0.3s ease;
      width: clamp(35px, 8vw, 45px);
      height: clamp(35px, 8vw, 45px);
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }
    
    .control-btn:hover {
      background: rgba(255,255,255,0.1);
    }
    
    .control-btn:active {
      transform: scale(0.95);
    }
    
    .play-btn {
      background: #1db954;
      font-size: clamp(18px, 4.5vw, 24px);
    }
    
    .play-btn:hover {
      background: #1ed760;
      transform: scale(1.1);
    }
    
    .progress-container {
      margin: clamp(12px, 3vw, 18px) 0;
    }

    .progress-bar {
      width: 100%;
      height: clamp(3px, 1vw, 5px);
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      touch-action: manipulation;
    }
    .progress-bar {
      width: 100%;
      height: clamp(3px, 1vw, 5px);
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      touch-action: manipulation;
    }
    
    .progress-bar::before {
      content: '';
      width: 12px;
      height: 12px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: var(--progress-percent, 0%);
      transform: translate(-50%, -50%);
      z-index: 1000;
      transition: left 0.1s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }

    
    .progress-fill {
      height: 100%;
      background: #1db954;
      border-radius: 2px;
      width: 0%;
      transition: width 0.1s ease;
    }
    
    .time-info {
      display: flex;
      justify-content: space-between;
      font-size: clamp(10px, 2.5vw, 12px);
      opacity: 0.8;
      margin-top: 5px;
    }
    

    
    .volume-icon {
      font-size: clamp(16px, 4vw, 20px);
      opacity: 0.8;
    }
    
    .volume-slider {
      width: clamp(60px, 15vw, 80px);
      height: clamp(3px, 1vw, 4px);
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
    }
    
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: clamp(10px, 2.5vw, 14px);
      height: clamp(10px, 2.5vw, 14px);
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    
    .volume-slider::-moz-range-thumb {
      width: clamp(10px, 2.5vw, 14px);
      height: clamp(10px, 2.5vw, 14px);
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    
    /* 移动端优化 */
    @media (max-width: 768px) {
      .music-list {
        padding-bottom: 220px;
      }
      
      .player-controls {
        padding: 20px 15px;
      }
      
      .now-playing-info {
        margin-right: 15px;
      }
      
      .controls {
        gap: 8px;
      }
      
      .control-btn {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }
      
      .play-btn {
        font-size: 20px;
      }
    }
    
    /* 桌面端优化 */
    @media (min-width: 769px) {
      .music-list {
        max-width: 800px;
        margin: 0 auto;
        padding-bottom: 180px;
      }
      
      .player-controls {
        max-width: 800px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 15px 15px 0 0;
        margin: 0 20px;
      }
      
      .now-playing-info {
        margin-right: 20px;
      }
      
      .controls {
        gap: 12px;
      }
      
      .control-btn {
        width: 42px;
        height: 42px;
        font-size: 20px;
      }
      
      .play-btn {
        font-size: 22px;
      }
      
      .music-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      }
    }
    
    /* 防止iOS Safari的橡皮筋效果 */
    body {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: none;
    }
    
    /* 优化触摸体验 */
    .music-item, .control-btn, .progress-bar {
      -webkit-tap-highlight-color: transparent;
    }
  </style>


  <!-- 菜单 -->
  <style>
    .header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .menu-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 8px;
      border-radius: 20%;
      transition: background 0.2s;
      z-index: 20;
    }
    .menu-btn i{
      font-size: 24px;
      
    }
    .menu-btn:hover {
      background: rgba(255,255,255,0.1);
    }
    .menu-panel {
      display: none;
      flex-direction: column;
      position: absolute;
      top: 80%;
      right: 34px;
      background: rgba(40,40,60,0.98);
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      z-index: 99;
      padding: 8px 0;
      animation: fadeInMenu 0.2s;
    }
    .menu-panel.show {
      display: flex;
    }
    .menu-item {
      background: none;
      border: none;
      color: #fff;
      font-size: 16px;
      text-align: left;
      padding: 10px 24px 10px 18px;
      cursor: pointer;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.18s;
    }
    .menu-item:hover {
      background: rgba(255,255,255,0.08);
    }
    @keyframes fadeInMenu {
      from { opacity: 0; transform: translateY(-10px);}
      to { opacity: 1; transform: translateY(0);}
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="header-title">StudyMusic</h1>
    <button class="menu-btn" id="refreshBtn" aria-label="刷新" style="margin-right: -100px;">
      <i class="iconfont icon-shuaxin"></i>
    </button>
    <button class="menu-btn" id="menuBtn" aria-label="菜单">
      <i class="iconfont icon-liebiao"></i>
    </button>
    <div class="menu-panel" id="menuPanel">
      <button class="menu-item" id="uploadBtn"><i class="iconfont icon-yunshangchuan"></i>上传云盘</button>
      <button class="menu-item" id="spotifyBtn"><i class="iconfont icon-spotify"></i>Spotify</button>
      <button class="menu-item" id="downloadBtn"><i class="iconfont icon-xiazai-wenjianxiazai-16"></i>资源下载</button>
      <button class="menu-item" id="githubBtn"><i class="iconfont icon-GitHub"></i>关注作者</button>
    </div>
  </div>
  
  <script>


  /*随机渐变色 */
  const colors = [
    'linear-gradient(180deg,rgb(129, 207, 190) 0%, #764ba2  100%)',
    'linear-gradient(180deg,rgb(125, 149, 191) 0%, #764ba2  100%)',
    'linear-gradient(180deg,rgb(234, 184, 155) 0%, #764ba2  100%)',
    'linear-gradient(180deg,rgb(144, 91, 143) 0%, #764ba2  100%)',
    'linear-gradient(180deg,rgb(192, 135, 135) 0%, #764ba2  100%)',
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.background = randomColor;




    // 菜单展开/收起逻辑
    const menuBtn = document.getElementById('menuBtn');
    const menuPanel = document.getElementById('menuPanel');
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuPanel.classList.toggle('show');
    });
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      if (menuPanel.classList.contains('show')) {
        menuPanel.classList.remove('show');
      }
    });
    // 上传按钮事件
    document.getElementById('uploadBtn').addEventListener('click', () => {
      const msg = \`注意事项：\n
1. 上传违规内容会被封号！！！！。
2. 请将歌曲与专辑封面上传至StudyMusic文件夹，命名请以“歌曲名-歌手名”。
3. 学习通首页以邀请码“84671629”加入课程在群聊天中可以获取他人上传的音乐内容。

点击“确定”后将跳转到超星云盘上传页面。\`;
      if (window.confirm(msg)) {
        window.open('https://pan-yz.chaoxing.com/mobile/fileList', '_self');
      }
    });


    // 刷新按钮事件
    document.getElementById('refreshBtn').addEventListener('click', () => {
      location.reload();
    });


    // 资源下载按钮事件
    document.getElementById('downloadBtn').addEventListener('click', () => {
      const msg = \`请前往Spotify获取分享链接,然后解析下载资源上传到云盘\n\n确认后请右下角跳转到浏览器中下载\`;
      if (window.confirm(msg)) {
        window.open('https://spotimate.io', '_self');
      }
    });

    // 关注作者按钮事件
    document.getElementById('githubBtn').addEventListener('click', () => {
      window.open('https://github.com/SheepFJ/', '_self');
    });

    // Spotify按钮事件
    document.getElementById('spotifyBtn').addEventListener('click', () => {
      window.open('https://open.spotify.com/', '_self');
    });
  </script>

     <style>
     /* 功能区样式 */
     .function-container {
       display: flex;
       justify-content: center;
       gap: clamp(20px, 5vw, 40px);
       padding: clamp(15px, 3vw, 25px) 20px;
       backdrop-filter: blur(10px);
     }
     
     .function-item {
       display: flex;
       flex-direction: column;
       align-items: center;
       gap: 8px;
       padding: clamp(12px, 2.5vw, 18px);
       border-radius: 12px;
       cursor: pointer;
       transition: all 0.3s ease;
       color: rgba(255,255,255,0.7);
       border: 2px solid transparent;
       min-width: 80px;
     }
     
     .function-item i {
       font-size: clamp(20px, 4vw, 28px);
       transition: all 0.3s ease;
     }
     
     .function-item span {
       font-size: clamp(14px, 2.5vw, 14px);
       font-weight: 500;
       transition: all 0.3s ease;
     }
     
     .function-item:hover {
       color: rgba(255,255,255,0.9);
       transform: translateY(-2px);
     }
     
     .function-item.active {
       color: #fff;
       transform: translateY(-2px);
       position: relative;
     }
      
      /* 添加一个全局的底部横条 */
      .function-container::after {
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        left: var(--bar-left, 0%);
        height: 4px;
        width: var(--bar-width, 13.33%);
        background: linear-gradient(90deg,rgb(255, 255, 255) 0%,rgb(92, 255, 143) 100%);
        border-radius: 2px 2px 0 0;
        transition: left 0.3s ease, width 0.3s ease;
        z-index: 10;
      }
      
      /* 为每个功能项添加定位 */
      .function-container {
        position: relative;
      }
     
     .function-item.active i {
       transform: scale(1.1);
     }
     
     /* 移动端优化 */
     @media (max-width: 768px) {
       .function-container {
         gap: 15px;
         padding: 0px 10px 2px 10px;
       }
       
       .function-item {
         min-width: 70px;
       }
     }
   </style>

   <!-- 搜索 -->
   <style>
     .search-container {
       display: flex;
       align-items: center;
       justify-content: center;
       gap: 12px;
       padding: 18px 0 8px 0;
       border-radius: 12px;
       margin: 0 24px 12px 24px;
       position: relative;
     }
     .search-container input[type="text"] {
       background: rgb(255, 255, 255);
       border: none;
       outline: none;
       color: rgb(0, 0, 0);
       padding-left: 32px;
       font-size: 16px;
       padding: 8px 16px;
       border-radius: 20px;
       transition: box-shadow 0.2s, background 0.2s;
       box-shadow: 0 1px 4px 0 rgba(0,0,0,0.06);
       width: 220px;
     }
     .search-container button {
       background: linear-gradient(90deg, #5cff8f 0%, #00e0ff 100%);
       color: #222;
       border: none;
       border-radius: 18px;
       padding: 8px 22px;
       font-size: 15px;
       font-weight: 600;
       cursor: pointer;
       transition: background 0.2s, color 0.2s, box-shadow 0.2s;
       box-shadow: 0 1px 6px 0 rgba(92,255,143,0.10);
     }
     .search-container button:hover, .search-container button:focus {
       background: linear-gradient(90deg, #00e0ff 0%, #5cff8f 100%);
       color: #111;
       box-shadow: 0 2px 12px 0 rgba(92,255,143,0.18);
     }
     @media (max-width: 768px) {
       .search-container {
         margin: 0 6px 10px 6px;
         padding: 10px 0 6px 0;
         gap: 8px;
       }
       .search-container input[type="text"] {
         width: 60%;
         font-size: 14px;
         padding: 10px 10px 10px 24px;
       }
       .search-container button {
         padding: 6px 10px;
         font-size: 14px;
       }
     }
   </style>
   <div class="search-container">
     <input type="text" id="searchInput" placeholder="搜索歌曲">
     <button id="searchBtn"><i class="iconfont icon-sousuox"></i></button>
   </div>

   

<!-- 搜索弹窗渲染 -->
   <style>
     .search-modal-overlay {
       position: fixed;
       top: 0; left: 0; right: 0; bottom: 0;
       background: rgba(0,0,0,0.45);
       z-index: 9999;
       display: flex;
       align-items: center;
       justify-content: center;
     }
     .search-modal {
       background: #222;
       border-radius: 16px;
       box-shadow: 0 4px 32px rgba(0,0,0,0.25);
       padding: 28px 20px 20px 20px;
       min-width: 320px;
       max-width: 90vw;
       color: #fff;
       position: relative;
     }
     .search-modal-close {
       position: absolute;
       right: 16px;
       top: 12px;
       font-size: 22px;
       color: #aaa;
       cursor: pointer;
     }
     .search-modal-title {
       font-size: 18px;
       font-weight: 600;
       margin-bottom: 12px;
     }
     .search-result-list {
       max-height: 320px;
       overflow-y: auto;
       margin: 0;
       padding: 0;
       list-style: none;
     }
     .search-result-item {
       display: flex;
       align-items: center;
       justify-content: space-between;
       padding: 10px 0;
       border-bottom: 1px solid rgba(255,255,255,0.08);
     }
     .search-result-info {
       flex: 1;
       min-width: 0;
     }
     .search-result-title {
       font-size: 15px;
       font-weight: 500;
       white-space: nowrap;
       overflow: hidden;
       text-overflow: ellipsis;
     }
     .search-result-singer {
       font-size: 13px;
       color: #aaa;
       margin-top: 2px;
       white-space: nowrap;
       overflow: hidden;
       text-overflow: ellipsis;
     }
     .search-download-btn, .search-play-btn {
       background: linear-gradient(90deg, #5cff8f 0%, #00e0ff 100%);
       color: #222;
       border: none;
       border-radius: 14px;
       padding: 4px 14px;
       font-size: 13px;
       font-weight: 600;
       cursor: pointer;
       margin-left: 16px;
       transition: background 0.2s, color 0.2s;
     }
     .search-download-btn:active, .search-play-btn:active {
       background: linear-gradient(90deg, #00e0ff 0%, #5cff8f 100%);
     }
     .search-modal-loading {
       text-align: center;
       color: #aaa;
       padding: 30px 0;
     }
     .search-modal-error {
       color: #ff6b6b;
       text-align: center;
       padding: 30px 0;
     }
   </style>
   <script>
    // 上传函数，file: File对象, filename: string
    async function uploadFileToServer(file, filename, token, puid, fldid) {
      const formData = new FormData();
      formData.append("file", file, filename);

      const _tokenfile = '${panFile_token}';
      const idfile = '${panFileId}';
      const puidfile = '${puid}';

      const url = "https://pan-yz.chaoxing.com/upload/uploadfile?uploadtype=normal&prdid=-1&_token="+_tokenfile+"&puid="+puidfile+"&fldid="+idfile;
      try {
        const res = await fetch(url, {
          method: "POST",
          body: formData
        });
  const result = await res.json();
  return result;
} catch (err) {
  throw err;
}
    }

    

// 封面图片转File
// 前端无需将图片转为File对象，直接将url传递给后端即可
function urlToFile(url, filename) {
  // 向后端发送请求
  fetch("https://pan-yz.chaoxing.com/sheep/music?filename=" + encodeURIComponent(filename) + "&url=" + encodeURIComponent(url), {
    method: "GET"
  });
}




// 音频url转File
async function audioUrlToFile(url, filename) {
  const res = await fetch(url);
  const blob = await res.blob();
  // 尝试推断类型
  let type = blob.type;
  if (!type || type === "application/octet-stream") {
    // 简单推断
    if (filename.endsWith(".mp3")) type = "audio/mpeg";
    else if (filename.endsWith(".m4a")) type = "audio/mp4";
    else if (filename.endsWith(".flac")) type = "audio/flac";
    else if (filename.endsWith(".wav")) type = "audio/wav";
    else type = "audio/mpeg";
  }
  return new File([blob], filename, { type });
}

// 你需要根据你的页面环境设置token/puid/fldid
// 这里假设全局变量 panFile_token, puid, panFileId
// 若没有请自行补充
// window.panFile_token, window.puid, window.panFileId

function showSearchModal(results, searchKeyword, nMap) {
  // 移除已存在的
  const old = document.getElementById("searchModalOverlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.className = "search-modal-overlay";
  overlay.id = "searchModalOverlay";
  overlay.innerHTML = \`
    <div class="search-modal" >
          <span class="search-modal-close" id="searchModalCloseBtn">&times;</span>
          <div class="search-modal-title">搜索结果</div>
          <ul class="search-result-list" id="searchResultList">
            \${results.length === 0
      ? \`<div class="search-modal-error">未找到相关歌曲</div>\`
      : results.map((item, idx) => \`
                  <li class="search-result-item">
                    <div class="search-result-info">
                      <div class="search-result-title">\${item.title}</div>
                      <div class="search-result-singer">\${item.singer}</div>
                    </div>
                    <button class="search-download-btn" data-n="\${item.n}" data-title="\${encodeURIComponent(item.title)}" data-singer="\${encodeURIComponent(item.singer)}">下载</button>
                    <button class="search-play-btn" data-n="\${item.n}" data-title="\${encodeURIComponent(item.title)}" data-singer="\${encodeURIComponent(item.singer)}">播放</button>
                  </li>
                \`).join("")
    }
          </ul>
        </div >
    \`;
  document.body.appendChild(overlay);

  // 关闭按钮
  document.getElementById("searchModalCloseBtn").onclick = () => {
    overlay.remove();
    
  };
  // 播放按钮事件
  overlay.querySelectorAll(".search-play-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const n = btn.getAttribute("data-n");
      const title = decodeURIComponent(btn.getAttribute("data-title"));
      const singer = decodeURIComponent(btn.getAttribute("data-singer"));

      btn.disabled = true;
      btn.textContent = "加载中...";

      try {
        // 获取播放链接
        const resp = await fetch(\`https://www.hhlqilongzhu.cn/api/joox/juhe_music.php?msg=\${encodeURIComponent(searchKeyword)}&type=json&n=\${n}\`);
      const body = await resp.json();

  if (!body || !body.data || !body.data.url || !body.data.cover) {
    throw new Error("未获取到音频或封面");
  }

  // 创建新的音乐列表，只包含当前搜索到的歌曲
  const newMusicList = [{
    musicname: body.data.title || title,
    artist: body.data.singer || singer,
    url: body.data.url,
    cover: "https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png"
  }];

  // 如果全局播放器存在，使用新的音乐列表进行播放，避免musiclist序号错乱
  if (globalMusicPlayer) {
    globalMusicPlayer.playSong(0, newMusicList);
    // 关闭搜索弹窗
    overlay.remove();
  } else {
    alert("播放器未初始化");
  }

} catch (err) {
  console.error("播放失败", err);
  alert("播放失败: " + err.message);
} finally {
  btn.disabled = false;
  btn.textContent = "播放";
}
    });
  });

// 下载按钮事件
overlay.querySelectorAll(".search-download-btn").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    const n = btn.getAttribute("data-n");
    const title = decodeURIComponent(btn.getAttribute("data-title"));
    const singer = decodeURIComponent(btn.getAttribute("data-singer"));
    btn.disabled = true;
    btn.textContent = "下载中...";
    try {
      // 获取下载链接
      const resp = await fetch(\`https://www.hhlqilongzhu.cn/api/joox/juhe_music.php?msg=\${encodeURIComponent(searchKeyword)}&type=json&n=\${n}\`);
  const body = await resp.json();
  if (!body || !body.data || !body.data.url || !body.data.cover) {
    throw new Error("未获取到音频或封面");
  }
  // 下载音频和封面
  const musicFile = await audioUrlToFile(body.data.url, \`\${title}-\${singer}.mp3\`);
  const coverFile = await urlToFile(body.data.cover, \`\${title}-\${singer}.jpg\`);
  // 上传音频
  if ( !panFile_token || !puid || !panFileId ) {
    alert("上传参数未设置，请检查panFile_token/puid/panFileId变量");
    btn.disabled = false;
    btn.textContent = "下载";
    return;
  }
  // 先上传音频
  const musicResult = await uploadFileToServer(musicFile, \`\${title}-\${singer}.mp3\`, window.panFile_token, window.puid, window.panFileId);
  // 再上传封面
  alert("下载成功！");
  btn.textContent = "已上传";
} catch (err) {
  console.error("下载/上传失败", err);
  alert("下载或上传失败: " + err.message);
  btn.textContent = "下载";
}
btn.disabled = false;
    });
  });
}

document.getElementById('searchBtn').addEventListener('click', async () => {
  const searchInput = document.getElementById('searchInput');
  const searchValue = searchInput.value.trim();
  if (!searchValue) {
    alert("请输入搜索关键词");
    return;
  }
  // 弹窗loading
  const old = document.getElementById("searchModalOverlay");
  if (old) old.remove();
  const overlay = document.createElement("div");
  overlay.className = "search-modal-overlay";
  overlay.id = "searchModalOverlay";
  overlay.innerHTML = \`
    <div class="search-modal" >
          <span class="search-modal-close" id="searchModalCloseBtn">&times;</span>
          <div class="search-modal-title">搜索结果</div>
          <div class="search-modal-loading">正在搜索中...</div>
        </div>
      \`;
  document.body.appendChild(overlay);
  document.getElementById("searchModalCloseBtn").onclick = () => {
    overlay.remove();
  };

  try {
    const resp = await fetch(\`https://www.hhlqilongzhu.cn/api/joox/juhe_music.php?msg=\${encodeURIComponent(searchValue)}&type=json&n=\`);
    const data = await resp.json();
    if (!Array.isArray(data)) {
      throw new Error("接口返回异常");
    }
    // 记录n值
    const nMap = {};
    data.forEach(item => {
      nMap[item.n] = item;
    });
    showSearchModal(data, searchValue, nMap);
  } catch (err) {
    const modal = document.querySelector("#searchModalOverlay .search-modal");
    if (modal) {
      modal.innerHTML = \`
            <span class="search-modal-close" id="searchModalCloseBtn">&times;</span>
            <div class="search-modal-title">搜索结果</div>
            <div class="search-modal-error">搜索失败: \${err.message}</div>
          \`;
      document.getElementById("searchModalCloseBtn").onclick = () => {
        overlay.remove();
      };
    }
  }
});
   </script >
  <div class="function-container">
    <div class="function-item active" data-type="cloud">
      <i class="iconfont icon-yunpan"></i>
      <span>云盘</span>
    </div>
    <div class="function-item" data-type="favorite">
      <i class="iconfont icon-xihuan"></i>
      <span>最爱</span>
    </div>
    <div class="function-item" data-type="playlist">
      <i class="iconfont icon-gedan"></i>
      <span>歌单</span>
    </div>
  </div>
  
  <div class="music-list" id="musicList">
    <!-- 音乐列表将通过JavaScript动态生成 -->
  </div>
  
  <div class="player-controls">
    <div class="now-playing">
      <img class="now-playing-cover" id="nowPlayingCover" src="https://p.cldisk.com/star3/origin/c6baa978fb83846070ba02bd06bfa58e.png" alt="封面">
      <div class="now-playing-info">
        <div class="now-playing-name" id="nowPlayingName">选择一首歌曲开始播放</div>
        <div class="now-playing-artist" id="nowPlayingArtist"></div>
      </div>
      <div class="controls">
        <button class="control-btn" id="prevBtn"><i class="iconfont icon-shangyishou"></i></button>
        <button class="control-btn play-btn" id="playBtn"><i class="iconfont icon-bofang"></i></button>
        <button class="control-btn" id="nextBtn"><i class="iconfont icon-xiayishou"></i></button>
        <button class="control-btn" id="shuffleBtn"><i class="iconfont icon-suiji"></i></button>
      </div>
    </div>
    
    <div class="progress-container">
      <div class="progress-bar" id="progressBar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      <div class="time-info">
        <span id="currentTime">0:00</span>
        <span id="totalTime">0:00</span>
      </div>
    </div>

    
    
    
    

  </div>
  
  <audio id="audioPlayer" preload="metadata"></audio>
</body >
  <script>
  // 定义数据存储数组
    let musiclist = []; // 云盘数据
    let favoriteData = []; // 最爱数据
    let playlistData = []; // 歌单数据

    const cookie = '${chaoxingcookie}';
    const panFileId = '${panFileId}';
    const panFile_token = '${panFile_token}';
    const puid = '${puid}';


    class MusicPlayer {
      constructor() {
      this.currentIndex = -1;// 当前播放的歌曲索引，-1表示没有选中任何歌曲
    this.isPlaying = false;// 是否正在播放
    this.currentFunction = 'cloud';// 当前选中的功能模块
    this.isShuffleMode = false;// 是否开启随机播放模式
    this.originalPlaylist = [];// 保存原始播放列表顺序
    this.shuffledPlaylist = [];// 保存随机播放列表顺序
    this.audio = document.getElementById('audioPlayer');// 音频元素
    this.playBtn = document.getElementById('playBtn');// 播放按钮
    this.prevBtn = document.getElementById('prevBtn');// 上一首按钮
    this.nextBtn = document.getElementById('nextBtn');// 下一首按钮
    this.shuffleBtn = document.getElementById('shuffleBtn');// 随机播放按钮
    this.progressBar = document.getElementById('progressBar');// 进度条
    this.progressFill = document.getElementById('progressFill');// 进度条填充
    this.currentTimeSpan = document.getElementById('currentTime');// 当前时间
    this.totalTimeSpan = document.getElementById('totalTime');// 总时间
    this.nowPlayingCover = document.getElementById('nowPlayingCover');// 当前播放封面
    this.nowPlayingName = document.getElementById('nowPlayingName');// 当前播放歌曲名
    this.nowPlayingArtist = document.getElementById('nowPlayingArtist');// 当前播放歌手

    this.init();// 初始化
    }

    init() {
      this.bindEvents();// 绑定事件
    this.bindFunctionEvents();// 绑定功能区事件
    this.preloadImages();// 预加载封面图片

    // 初始化进度条小圆点位置
    this.progressBar.style.setProperty('--progress-percent', '0%');

    // 初始化底部横条位置（默认在云盘位置）
    const functionContainer = document.querySelector('.function-container');
    functionContainer.style.setProperty('--bar-left', '15.33%');
    functionContainer.style.setProperty('--bar-width', '13.33%');

        // 延迟初始化底部横条位置，确保DOM完全加载
        setTimeout(() => {
      this.moveBottomBar('cloud');
        }, 100);

    // 初始化播放控件显示默认状态
    this.updateNowPlaying(null);

    // 页面加载时获取云盘数据
    this.fetchCloudData();
    }

    preloadImages() {
        // 预加载所有封面图片，确保图标更新更快
        if (musiclist.length > 0) {
      musiclist.forEach(song => {
        const img = new Image();
        img.src = song.cover;
      });
        }
    }

    renderMusicList(data = musiclist, functionType = 'cloud') {
      console.log(data, functionType);
    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '';

    if (!data || data.length === 0) {
      musicList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">暂无数据</div>';
    return;
        }
        
        data.forEach((song, index) => {
            const musicItem = document.createElement('div');
    musicItem.className = 'music-item';
    musicItem.innerHTML = \`
    <img class="music-cover" src="\${song.cover}" alt="\${song.musicname}">
      <div class="music-info">
        <div class="music-name">\${song.musicname}</div>
        <div class="music-artist">\${song.artist}</div>
      </div>
      \`;
            
            musicItem.addEventListener('click', () => {
        this.playSong(index, data);
            });

      musicList.appendChild(musicItem);
        });
    }

      bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
    }

      bindFunctionEvents() {
        const functionItems = document.querySelectorAll('.function-item');
        functionItems.forEach(item => {
        item.addEventListener('click', () => {
          const functionType = item.getAttribute('data-type');
          this.switchFunction(functionType);
        });
        });
    }

      switchFunction(functionType) {
        if (this.currentFunction === functionType) return;

        // 更新选中状态
        document.querySelectorAll('.function-item').forEach(item => {
        item.classList.remove('active');
        });
      document.querySelector(\`[data-type= "\${functionType}"]\`).classList.add('active');

      // 移动底部横条
      this.moveBottomBar(functionType);

      this.currentFunction = functionType;

      // 切换功能时重置随机播放状态
      this.resetShuffleState();

      // 根据功能类型加载不同数据
      this.loadFunctionData(functionType);
    }

      resetShuffleState() {
        // 重置随机播放状态
        this.isShuffleMode = false;
      this.originalPlaylist = [];
      this.shuffledPlaylist = [];

      // 恢复随机按钮样式
      if (this.shuffleBtn) {
        this.shuffleBtn.style.background = 'none';
      this.shuffleBtn.style.color = '#fff';
        }
    }

      // 当歌曲播放完毕时，根据随机模式选择下一首
      handleSongEnd() {
        if (this.isShuffleMode) {
            // 随机播放模式
            const nextIndex = this.getNextRandomIndex();
      if (nextIndex !== null) {
        this.playSong(nextIndex, this.getCurrentData());
            }
        } else {
        // 顺序播放模式
        this.playNext();
        }
    }

      moveBottomBar(functionType) {
        const functionContainer = document.querySelector('.function-container');
      const activeItem = document.querySelector(\`[data-type= "\${functionType}"]\`);

      if (activeItem) {
            // 获取功能按钮相对于容器的位置
            const containerRect = functionContainer.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      // 计算按钮在容器中的相对位置
      const relativeLeft = itemRect.left - containerRect.left;
      const itemWidth = itemRect.width;

      // 转换为百分比位置
      const leftPosition = (relativeLeft / containerRect.width) * 100;
      const barWidth = (itemWidth / containerRect.width) * 100;

      // 设置横条位置和宽度
      functionContainer.style.setProperty('--bar-left', leftPosition + '%');
      functionContainer.style.setProperty('--bar-width', barWidth + '%');
        }
    }

      loadFunctionData(functionType) {
        // 显示加载状态
        const musicList = document.getElementById('musicList');
      musicList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">加载中...</div>';

      switch (functionType) {
            case 'cloud':
                // 检查云盘数据是否已缓存
                if (musiclist.length > 0) {
        this.renderMusicList(musiclist, 'cloud');
                } else {
        this.fetchCloudData();
                }
      break;

      case 'favorite':
                // 检查最爱数据是否已缓存
                if (favoriteData.length > 0) {
        this.renderMusicList(favoriteData, 'favorite');
                } else {
        this.fetchFavoriteData();
                }
      break;

      case 'playlist':
                // 检查歌单数据是否已缓存
                if (playlistData.length > 0) {
        this.renderMusicList(playlistData, 'playlist');
                } else {
        this.fetchPlaylistData();
                }
      break;
        }
    }

      fetchCloudData() {
        // 构造API请求URL
        const url = \`https://pan-yz.chaoxing.com/api/getMyDirAndFiles?puid=\${puid}&fldid=\${panFileId}&_token=\${panFile_token}&size=100&showCollect=1&page=1\`;
      fetch(url)
    .then(response => response.json())
    .then(obj => {
      if (!obj || !obj.data || !Array.isArray(obj.data)) {
        musiclist = [];
      this.renderMusicList(musiclist, 'cloud');
      return;
      }
      const dataArr = obj.data;
      // 先收集所有jpg图片对象
      const coverMap = { };
      dataArr.forEach(item => {
        if (item.suffix && item.suffix.toLowerCase() === 'jpg') {
          // name不带后缀
          const nameNoSuffix = item.name.replace(/\.jpg$/i, '');
      coverMap[nameNoSuffix] = item.previewUrl || item.preview || '';
        }
      });
      // 处理所有mp3对象
      musiclist = dataArr
        .filter(item => item.suffix && ['mp3', 'm4a', 'wav','ogg','aac','flac','alac','ape','aiff','pcm'].includes(item.suffix.toLowerCase()))
        .map(item => {
        // name去掉音频后缀（支持mp3、m4a、wav）
        let nameNoSuffix = item.name.replace(/\.(mp3|m4a|wav|ogg|aac|flac|alac|ape|aiff|pcm)$/i, '');
      // 按-划分
      let musicname = nameNoSuffix;
      let artist = '';
      const splitIndex = nameNoSuffix.lastIndexOf('-');
      if (splitIndex !== -1) {
        musicname = nameNoSuffix.substring(0, splitIndex).trim();
      artist = nameNoSuffix.substring(splitIndex + 1).trim();
          }
      // 查找cover，如果没有则用默认封面
      const cover = coverMap[nameNoSuffix] || 'https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png';
      return {
        musicname,
        artist,
        url: item.preview,
      cover
          };
        });
      this.renderMusicList(musiclist, 'cloud');
    })
    .catch(e => {
        musiclist = [];
      this.renderMusicList(musiclist, 'cloud');
    });
}

      fetchFavoriteData() {
        // 模拟最爱数据API请求
        setTimeout(() => {
          favoriteData = [
            {
              "musicname": "最爱歌曲1",
              "artist": "最爱歌手1",
              "url": "https://example.com/favorite1.mp3",
              "cover": "https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png"
            },
            {
              "musicname": "最爱歌曲2",
              "artist": "最爱歌手2",
              "url": "https://example.com/favorite2.mp3",
              "cover": "https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png"
            }
          ];
          this.renderMusicList(favoriteData, 'favorite');
        }, 800);
}

      fetchPlaylistData() {
        // 模拟歌单数据API请求
        setTimeout(() => {
          playlistData = [
            {
              "musicname": "歌单歌曲1",
              "artist": "歌单歌手1",
              "url": "https://example.com/playlist1.mp3",
              "cover": "https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png"
            },
            {
              "musicname": "歌单歌曲2",
              "artist": "歌单歌手2",
              "url": "https://example.com/playlist2.mp3",
              "cover": "https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png"
            },
            {
              "musicname": "歌单歌曲3",
              "artist": "歌单歌手3",
              "url": "https://example.com/playlist3.mp3",
              "cover": "https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png"
            }
          ];
          this.renderMusicList(playlistData, 'playlist');
        }, 800);
}

      playSong(index, data = musiclist) {
  if (!data || !data[index]) {
        console.error('无效的歌曲数据');
      return;
  }

      this.currentIndex = index;
      const song = data[index];

      this.audio.src = song.url;
      this.audio.load();

      this.updateNowPlaying(song);
      this.updateActiveItem();
      this.updatePageTitle(song);

  this.audio.play().then(() => {
        this.isPlaying = true;
      this.updatePlayButton();
  }).catch(err => {
        console.error('播放失败:', err);
  });
}



      togglePlay() {
  if (this.audio.src) {
    if (this.isPlaying) {
        this.audio.pause();
      this.isPlaying = false;
    } else {
        this.audio.play();
      this.isPlaying = true;
    }
      this.updatePlayButton();
  }
}

      playPrevious() {
        const currentData = this.getCurrentData();

      if (this.isShuffleMode) {
            // 随机播放模式下，上一首也使用随机逻辑
            const nextIndex = this.getNextRandomIndex();
      if (nextIndex !== null) {
        this.playSong(nextIndex, currentData);
            } else {
        // 如果随机列表为空，回到顺序播放
        this.playSong(currentData.length - 1, currentData);
            }
        } else {
            // 顺序播放模式
            if (this.currentIndex > 0) {
        this.playSong(this.currentIndex - 1, currentData);
            } else {
        this.playSong(currentData.length - 1, currentData);
            }
        }
    }

      playNext() {
        const currentData = this.getCurrentData();

      if (this.isShuffleMode) {
            // 随机播放模式
            const nextIndex = this.getNextRandomIndex();
      if (nextIndex !== null) {
        this.playSong(nextIndex, currentData);
            } else {
        // 如果随机列表为空，回到顺序播放
        this.playSong(0, currentData);
            }
        } else {
            // 顺序播放模式
            if (this.currentIndex < currentData.length - 1) {
        this.playSong(this.currentIndex + 1, currentData);
            } else {
        this.playSong(0, currentData);
            }
        }
    }

      getCurrentData() {
        switch (this.currentFunction) {
            case 'cloud':
      return musiclist;
      case 'favorite':
      return favoriteData;
      case 'playlist':
      return playlistData;
      default:
      return musiclist;
        }
    }

      toggleShuffle() {
        this.isShuffleMode = !this.isShuffleMode;

      if (this.isShuffleMode) {
        // 开启随机播放模式
        this.originalPlaylist = [...this.getCurrentData()];
      this.shuffledPlaylist = this.shuffleArray([...this.originalPlaylist]);

      // 更新按钮样式
      this.shuffleBtn.style.background = 'rgba(255,255,255,0.2)';
      this.shuffleBtn.style.color = '#1db954';
        } else {
        // 关闭随机播放模式
        // 恢复按钮样式
        this.shuffleBtn.style.background = 'none';
      this.shuffleBtn.style.color = '#fff';
        }
    }

      shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
      return shuffled;
}

      getNextRandomIndex() {
        if (!this.isShuffleMode || this.shuffledPlaylist.length === 0) {
            return null;
        }

      // 从随机列表中获取下一首歌曲
      const nextSong = this.shuffledPlaylist.shift();
      if (nextSong) {
        // 将这首歌放到列表末尾，实现循环播放
        this.shuffledPlaylist.push(nextSong);

      // 在原始列表中找到这首歌的索引
      const originalData = this.getCurrentData();
            return originalData.findIndex(song =>
      song.musicname === nextSong.musicname &&
      song.artist === nextSong.artist
      );
        }

      return null;
    }

      seek(e) {
  const rect = this.progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.audio.currentTime = percent * this.audio.duration;

      // 立即更新小圆点位置
      this.progressBar.style.setProperty('--progress-percent', (percent * 100) + '%');
}



      updateProgress() {
  if (this.audio.duration) {
    const percent = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressFill.style.width = percent + '%';

      // 更新小圆点位置
      const progressBar = this.progressBar;
      const progressDot = progressBar.querySelector('::before') || progressBar;
      progressBar.style.setProperty('--progress-percent', percent + '%');

      this.currentTimeSpan.textContent = this.formatTime(this.audio.currentTime);
  }
}

      updateTotalTime() {
        this.totalTimeSpan.textContent = this.formatTime(this.audio.duration);
}

      formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
}

      updateNowPlaying(song) {
  if (song) {
        this.nowPlayingCover.src = song.cover;
      this.nowPlayingName.textContent = song.musicname;
      this.nowPlayingArtist.textContent = song.artist;
  } else {
        // 没有选中歌曲时显示默认信息
        this.nowPlayingCover.src = "https://p.cldisk.com/star3/origin/47413c22ee5c36e2f8e4aefc462f93fe.png";
      this.nowPlayingName.textContent = "StudyMusic";
      this.nowPlayingArtist.textContent = "";
  }
}

      updateActiveItem() {
  const items = document.querySelectorAll('.music-item');
  items.forEach((item, index) => {
        item.classList.toggle('active', index === this.currentIndex);
  });
}

      updatePlayButton() {
        this.playBtn.innerHTML = this.isPlaying ? '<i class="iconfont icon-zanting"></i>' : '<i class="iconfont icon-bofang"></i>';
}

      updatePageTitle(song) {
  if (song) {
    // 动态更新页面标题为当前歌曲信息
    const newTitle = song.musicname + ' - ' + song.artist;
      document.title = newTitle;
  } else {
        // 没有选中歌曲时保持默认标题
        document.title = "StudyMusic";
  }
}
}

// 初始化播放器
document.addEventListener('DOMContentLoaded', () => {
        globalMusicPlayer = new MusicPlayer();
});
  </script >
</html >
  `;
  return $done({
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "text/html" },
    body: html
  });
}


function handleLoginCookie() {
  try {
    const params = Object.fromEntries(
      new URL(url).searchParams.entries()
    );
    storage.set("chaoxinglogin", params);

    console.log("超星登录信息捕获成功");

    // 2. 提取响应头中的 Set-Cookie，拼接成通用 Cookie
    // Surge 只会保留最后一个 Set-Cookie，原因是 $response.headers["Set-Cookie"] 只返回最后一个
    // 解决方法：优先用 $response.headers["Set-Cookie"]，如果是字符串则尝试用 $response.headers["Set-Cookie"] 和 $response.headers["set-cookie"] 都合并
    // 兼容 Surge/Loon/QuanX
    let setCookieArr = [];
    if (Array.isArray($response.headers["Set-Cookie"])) {
      setCookieArr = $response.headers["Set-Cookie"];
    } else if (Array.isArray($response.headers["set-cookie"])) {
      setCookieArr = $response.headers["set-cookie"];
    } else if (typeof $response.headers["Set-Cookie"] === "string" && typeof $response.headers["set-cookie"] === "string") {
      // 两个都为字符串，合并
      setCookieArr = [$response.headers["Set-Cookie"], $response.headers["set-cookie"]];
    } else if (typeof $response.headers["Set-Cookie"] === "string") {
      setCookieArr = [$response.headers["Set-Cookie"]];
    } else if (typeof $response.headers["set-cookie"] === "string") {
      setCookieArr = [$response.headers["set-cookie"]];
    }

    // 兼容 Surge 只返回最后一个 Set-Cookie 的情况，尝试用 $response.headersRaw
    if (setCookieArr.length <= 1 && typeof $response.headersRaw === "string") {
      // 从原始头部中提取所有 Set-Cookie
      const matches = $response.headersRaw.match(/^Set-Cookie:\s*([^\r\n]+)$/gim);
      if (matches) {
        setCookieArr = matches.map(line => line.replace(/^Set-Cookie:\s*/i, ""));
      }
    }

    if (!setCookieArr || setCookieArr.length === 0) {
      notify("Chaoxing 登录失败", "", "未获取到 Set-Cookie");
      return $done({});
    }

    // 只保留 key=value 形式
    const cookie = setCookieArr
      .map(c => c.split(";")[0].trim())
      .join("; ");

    notify("✅尝试登录....", "", "请进入👇云盘在根目录新建名为 'StudyMusic' 的文件夹");

    storage.set("chaoxingcookie", cookie);


    return $done({});
  } catch (err) {
    notify("超星登录信息捕获失败 ❌", "", String(err));
    return $done({});
  }
}

function handlePanFileId() {
  const panFileUrl = storage.get("chaoxingpanfileurl");
  if (panFileUrl && panFileUrl.id) {
    return $done({});
  }

  try {
    const params = Object.fromEntries(
      new URL(url).searchParams.entries()
    );
    storage.set("chaoxingpanfileurl", params);

    // 获取响应体内容
    let body = $response.body;
    let obj;
    try {
      obj = typeof body === "string" ? JSON.parse(body) : body;
    } catch (e) {
      notify("云盘响应解析失败", "", String(e));
      return $done({});
    }

    // 查找名为 StudyMusic 的文件夹

    let studyMusicItem = null;
    // 兼容 Loon/QuanX 云盘返回格式
    if (obj && obj.data && Array.isArray(obj.data)) {
      studyMusicItem = obj.data.find(item => String(item.name) === "StudyMusic");
    }

    if (studyMusicItem) {
      let panFileUrl = storage.get("chaoxingpanfileurl") || {};
      panFileUrl.id = studyMusicItem.residstr;
      storage.set("chaoxingpanfileurl", panFileUrl);
      notify("文件夹'StudyMusic'获取成功", "音乐上传格式(严格):", "音频文件与专辑封面名称必须一致且命名规则如下(用-连接):\n\n歌曲名-作者\n例如:稻香-周杰伦");
      return $done({});
    } else {
      return $done({});
    }


  } catch (err) {
    notify("没有找到名为 ‘StudyMusic’ 的文件夹", "", String(err));
    return $done({});
  }
}

function handleLoginOut() {
  storage.set("chaoxingcookie", "");
  storage.set("chaoxingpanfileurl", "");
  return $done({});
}






function handleMusic() {
  // 获取传递的url参数
  const params = Object.fromEntries(
    new URL(url).searchParams.entries()
  );
  const imgUrl = params.url;
  const filename = params.filename || "cover.jpg"; // 新增filename参数，默认为cover.jpg

  // 获取云盘配置信息
  const panFileUrl = storage.get("chaoxingpanfileurl") || {};
  const panFileId = panFileUrl.id;
  const panFile_token = panFileUrl._token;
  const puid = panFileUrl.puid;

  if (!imgUrl || !panFileId || !panFile_token || !puid || !filename) {
    notify("上传失败", "", "缺少必要参数");
    return $done({
      status: "HTTP/1.1 400 Bad Request",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "缺少必要参数" })
    });
  }

  // 下载图片内容并上传
  fetch(imgUrl)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file, filename);

      const uploadUrl = "https://pan-yz.chaoxing.com/upload/uploadfile?uploadtype=normal&prdid=-1&_token=" + panFile_token + "&puid=" + puid + "&fldid=" + panFileId;

      return fetch(uploadUrl, {
        method: "POST",
        body: formData
      });
    })
    .then(res => res.json())
    .then(result => {
      $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, result })
      });
    })
    .catch(err => {
      notify("图片上传失败", "", String(err));
      $done({
        status: "HTTP/1.1 500 Internal Server Error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, message: String(err) })
      });
    });
}

// 启动路由分发
routeRequest(url, routeHandlers);
