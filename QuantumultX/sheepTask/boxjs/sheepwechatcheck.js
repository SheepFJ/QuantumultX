// **存储封装（仅适用于 Quantumult X）**
const Storage = {
    get: key => JSON.parse($prefs.valueForKey(key) || "{}")
};

// **读取本地存储**
const storedData = Storage.get("sheep_wechat_data");

// **格式化输出**
if (Object.keys(storedData).length === 0) {
    console.log("⚠️ 没有任何用户数据");
    $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "暂无用户数据"
    });
} else {
    let output = "【📖 用户聊天记录】\n\n";
    for (const [username, messages] of Object.entries(storedData)) {
        output += `📌 **${username}**\n`;

        if (Array.isArray(messages) && messages.length) {
            messages.forEach(({ role, content }) => {
                output += `${role === "user" ? "👤 用户：" : "🤖 助手："} ${content}\n`;
            });
        } else {
            output += "⚠️ 该用户暂无聊天记录\n";
        }

        output += "\n"; // 分隔不同用户的数据
    }

    console.log(output); // ✅ 确保日志打印完整数据

    $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: output
    });
}