/*************************************
项目名称：SiriAI
更新日期：2025-02-22
脚本作者：@Sheepfj
使用声明：⚠️仅供参考，🈲转载与售卖！
TG频道：https://t.me/sheep_007xiaoyang
GitHub：https://github.com/SheepFJ/QuantumultX
脚本说明：利用Siri与圈x的httpbackend功能去调用gpt接口实现问答与AI绘画
使用方法：
1.导入脚本重写：https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriAI/SiriAiall.js
2.圈x设置开启进入HTTP Backend开启该功能，并设置Backend监听地址：127.0.0.1与端口:9999  
3.在HTTP Backend里面右上角点➕填入backend路径及处理请求路径：
    Backend路径：
        ^/sheep/(wenti|daan|url)/
    处理请求路径：
        https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriAI/SiriAiall.js
4.配置好后重启圈x，引入苹果快捷指令即可使用：https://www.icloud.com/shortcuts/62cecddaaf5c4baf99da63009d80e237

============ Quantumult X ============

[rewrite_local]
 ^https:\/\/chatme-backend-d5f358e587a4\.herokuapp\.com\/chatme\/api\/v1\/ask\/text url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/SiriAI/chatPath.js  
 ^https:\/\/chatme-backend-d5f358e587a4\.herokuapp\.com\/chatme\/api\/v1\/ask\/text url script-request-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/SiriAI/chatPath.js  
 ^https:\/\/securetoken\.googleapis\.com\/v1\/token url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/SiriAI/tokenPath.js  
 ^https:\/\/genie-production-yfvxbm4e6q-uc\.a\.run\.app\/chats\/local\/completions url script-request-header https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/SiriAI/chatPathrequest.js
 ^https:\/\/genie-production-yfvxbm4e6q-uc\.a\.run\.app\/chats\/local\/completions url script-response-body https://raw.githubusercontent.com/SheepFJ/QuantumultX/refs/heads/main/QuantumultX/APP/SiriAI/chatPathresponse.js
[mitm]
hostname = chatme-backend-d5f358e587a4.herokuapp.com,securetoken.googleapis.com,genie-production-yfvxbm4e6q-uc.a.run.app

*************************************/
const backendPathUrl = "/sheep/url/";
const basePathWenti = "/sheep/wenti/";
const basePathDaan = "/sheep/daan/";

if ($request && $request.path.startsWith(basePathDaan)) {
    let baseKey = "combined_content_response";
    let index = 0;
    let latestResponseContent = "";

    while (true) {
        let storageKey = baseKey + (index === 0 ? "" : index);
        let storedValue = $prefs.valueForKey(storageKey);

        if (!storedValue) {
            break;
        }

        latestResponseContent = storedValue;
        index++;
    }
    if (latestResponseContent) {
        $done({
            status: "HTTP/1.1 200 OK",
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Connection": "Close"
            },
            body: latestResponseContent
        });
    } else {
        $done({
            status: "HTTP/1.1 404 Not Found",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Connection": "Close"
            },
            body: "<html><body><h1>没有获取到结果，可能的原因：0.第一个问题请选择“新问题”选项1. 没有添加重写 2. 没有添加主机名 3. 分流规则设置不当 </h1></body></html>"
        });
    }

    // 处理请求路径 "/sheep/wenti/"
} else if ($request && $request.path.startsWith(basePathWenti)) {
    let requestBaseKey = "combined_content_request";
    let responseBaseKey = "combined_content_response";
    let index = 0;
    let allCombinedWords = ""; // 用于存储所有读取到的内容

    while (true) {
        let requestStorageKey = requestBaseKey + (index === 0 ? "" : index);
        let requestStoredValue = $prefs.valueForKey(requestStorageKey); // 读取请求体存储值

        let responseStorageKey = responseBaseKey + (index === 0 ? "" : index);
        let responseStoredValue = $prefs.valueForKey(responseStorageKey); // 读取响应体存储值

        if (!requestStoredValue && !responseStoredValue) {
            break;
        }

        let requestAlreadyExists = requestStoredValue && allCombinedWords.indexOf(`"content": "${requestStoredValue}"`) !== -1;
        let responseAlreadyExists = responseStoredValue && allCombinedWords.indexOf(`"content": "${responseStoredValue}"`) !== -1;

        if (requestStoredValue && !requestAlreadyExists) {
            allCombinedWords += `{"content": "${requestStoredValue}", "role": "user"}, `;
        }

        if (responseStoredValue && !responseAlreadyExists) {
            allCombinedWords += `{"content": "${responseStoredValue}", "role": "assistant"}, `;
        }

        index++;
    }

    if (allCombinedWords.endsWith(", ")) {
        allCombinedWords = allCombinedWords.slice(0, -2);
    }

    if (allCombinedWords) {
        $done({
            status: "HTTP/1.1 200 OK",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Connection": "Close"
            },
            body: allCombinedWords
        });
    }
    else {
        $done({
            status: "HTTP/1.1 404 Not Found",
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Connection": "Close"
            },
            body: "<html><body><h1>没有获取到结果，可能的原因：0.第一个问题请选择“新问题”选项1. 没有添加重写 2. 没有添加主机名 3. 分流规则设置不当</h1></body></html>"
        });
    }


    // 处理请求和响应路径 "/chatme/api/v1/ask/text"
} else if ($request && $request.path.startsWith(backendPathUrl)) {
    //显示最近的 10 张图片 URL
    let storedUrls = $prefs.valueForKey("local_image_urls");

    if (storedUrls) {
        let urlList = JSON.parse(storedUrls);
        let latestUrls = urlList.slice(-10).reverse();

        let htmlContent = `
        <meta charset="UTF-8">
        <html>
        <body>
        <h1>显示最近的10张图片</h1>
        `;

        latestUrls.forEach((url, index) => {
            htmlContent += `
            <div>
                <h2>Image ${index + 1}</h2>
                <p><a href="${url}">${url}</a></p>
                <img src="${url}" alt="Image Preview" style="max-width:100%; height:auto;"/>
            </div>
            <hr/>
            `;
        });

        htmlContent += `
        </body>
        </html>
        `;

        $done({
            status: "HTTP/1.1 200 OK",
            headers: {
                "Content-Type": "text/html"
            },
            body: htmlContent
        });
    } else {
        let errorContent = `
        <html>
        <body>
        <h1>No URLs Found</h1>
        <p>没有获取到URL链接（对话功能可用的情况下，可能是服务器压力过大，晚些尝试）</p>
        </body>
        </html>
        `;

        $done({
            status: "HTTP/1.1 404 Not Found",
            headers: {
                "Content-Type": "text/html"
            },
            body: errorContent
        });
    }
} else {
    $done({
        status: "HTTP/1.1 404 Not Found",
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Connection": "Close"
        },
        body: "<html><body><h1>没有获取到结果，可能的原因：0.第一个问题请选择“新问题”选项1. 没有添加重写 2. 没有添加主机名 3. 分流规则设置不当</h1></body></html>"
    });
}
