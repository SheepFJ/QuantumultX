const html = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>视频搜索</title>
    <style>
        body { 
            font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 0; 
            background: url("https://www.helloimg.com/i/2025/02/04/67a1f7b10b45e.jpeg") no-repeat center center fixed;
            background-size: cover;
            color: white;
            padding-top: 110px;
        }

        .header { 
            position: fixed; top: 0; width: 100%; padding: 10px 0;
            background: rgba(0, 0, 0, 0.7); text-align: center;
            box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.3);
        }

        .menu-buttons {
            display: flex; justify-content: center; gap: 15px;
        }
        .menu-buttons button { 
            padding: 12px 20px; font-size: 16px; font-weight: bold; 
            color: white; background: #007bff; border: none; border-radius: 8px; cursor: pointer; 
            transition: background 0.3s ease, transform 0.2s;
        }
        .menu-buttons button:hover { background: #0056b3; transform: scale(1.05); }

        .container { 
            padding: 20px; max-width: 800px; margin: auto; 
            background: rgba(0, 0, 0, 0.7); border-radius: 10px; 
            box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
        }
        input, button { 
            margin: 10px; padding: 12px; font-size: 18px; border-radius: 8px; border: none; outline: none;
        }
        input { width: 60%; }
        button { 
            background: #28a745; color: white; cursor: pointer;
            transition: background 0.3s ease, transform 0.2s;
        }
        button:hover { background: #218838; transform: scale(1.05); }

        label { font-size: 18px; margin-right: 15px; }
        input[type="checkbox"] { transform: scale(1.2); margin-right: 5px; }

        #results { 
            margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.2); 
            border-radius: 5px; font-size: 18px;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="menu-buttons">
            <button onclick="goToHistory()">剧集列表</button>
            <button onclick="toggleSearch()">搜索</button>
        </div>
    </div>

    <div class="container" id="searchContainer">
        <h2>搜索视频</h2>
        <label><input type="checkbox" value="https://caiji.moduapi.cc/api.php/provide/vod?ac=detail&wd=" checked> 魔都资源</label>
        <label><input type="checkbox" value="https://p2100.net/api.php/provide/vod?ac=detail&wd=" checked> 飘零资源</label>
        <label><input type="checkbox" value="https://cj.lziapi.com/api.php/provide/vod/from/lzm3u8/?ac=detail&wd=" checked> 量子资源</label>
        <label><input type="checkbox" value="https://collect.wolongzyw.com/api.php/provide/vod?ac=detail&wd="> 卧龙资源</label>
        
                <label><input type="checkbox" value="https://360zy.com/api.php/provide/vod/?ac=detail&wd="> 360资源</label>
        
        
        

        <input type="text" id="searchInput" placeholder="输入搜索内容">
        <button onclick="search()">搜索</button>
        <div id="results"></div>
        <p>默认最多同时选择3个，配合BoxJS进行修改，同时重置剧集列表</p>
    </div>

    <script>
        function goToHistory() {
            window.location.href = "https://www.video.com/sheep/video/play/";
        }

        function toggleSearch() {
            let searchContainer = document.getElementById("searchContainer");
            searchContainer.style.display = (searchContainer.style.display === "none" ? "block" : "none");
        }

        function search() {
            let query = document.getElementById("searchInput").value.trim();
            let checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            let resultsDiv = document.getElementById("results");

            if (!query) {
                resultsDiv.innerHTML = "<p style='color: red;'>请输入剧名后重试</p>";
                return;
            }
            if (checkboxes.length === 0) {
                resultsDiv.innerHTML = "<p style='color: red;'>请选择至少一个资源网站</p>";
                return;
            }

            resultsDiv.innerHTML = "<p>正在搜索...</p>";
            let requests = Array.from(checkboxes).map(cb => {
                let url = cb.value + encodeURIComponent(query);
                return fetch(url).catch(err => console.log("请求失败:", err));
            });

            Promise.all(requests).then(() => {
                resultsDiv.innerHTML = "<p>搜索结束，点击剧集列表按钮查看</p>";
            });
        }
    </script>

</body>
</html>`;

$done({
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html
});
