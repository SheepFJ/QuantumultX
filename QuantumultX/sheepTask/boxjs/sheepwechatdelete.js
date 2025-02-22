const Storage = {
    get: key => $prefs.valueForKey(key) || "",
    set: (key, value) => $prefs.setValueForKey(value, key)
};

// **读取待删除用户列表**
let deleteList = Storage.get("sheep_wechat_delete").trim();

// **读取现有数据**
let storedData = Storage.get("sheep_wechat_data");
storedData = storedData ? JSON.parse(storedData) : {};

// **删除数据逻辑**
if (!deleteList) {
    // **如果 `sheep_wechat_delete` 为空，则清空所有数据**
    storedData = {};
    console.log("✅ 已清空所有用户数据");
} else {
    // **按 `@` 分割获取用户列表**
    let usersToDelete = deleteList.split("@").map(u => u.trim()).filter(u => u);

    usersToDelete.forEach(username => {
        if (storedData.hasOwnProperty(username)) {
            delete storedData[username];
            console.log(`✅ 已删除用户数据: ${username}`);
        } else {
            console.log(`⚠️ 未找到用户数据: ${username}`);
        }
    });
}

// **保存修改后的数据**
Storage.set("sheep_wechat_data", JSON.stringify(storedData));

// **返回结果**
$done({
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: "用户数据删除操作已完成"
});