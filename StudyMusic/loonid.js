/*
Loon 脚本
用途：检测云盘响应中是否有名为 "StudyMusic" 的文件夹，并保存 residstr
*/

let body = $response.body;
let obj = null;

try {
    // 尝试解析 JSON
    obj = typeof body === "string" ? JSON.parse(body) : body;

    // ✅ 调试时可以打开日志
    // console.log(JSON.stringify(obj));

    // 查找名为 StudyMusic 的文件夹
    let studyMusicItem = null;
    if (obj && obj.data && Object.prototype.toString.call(obj.data) === "[object Array]") {
        studyMusicItem = obj.data.find(item => String(item.name) === "StudyMusic");
    }

    if (studyMusicItem && studyMusicItem.residstr) {
        let panFileUrl = $persistentStore.read("chaoxingpanfileurl");
        try {
            panFileUrl = panFileUrl ? JSON.parse(panFileUrl) : {};
        } catch (e) {
            panFileUrl = {};
        }

        panFileUrl.id = studyMusicItem.residstr;

        // 存储为 JSON 字符串
        $persistentStore.write(JSON.stringify(panFileUrl), "chaoxingpanfileurl");

        $notification.post(
            "文件夹 'StudyMusic' 获取成功",
            "音乐上传格式(严格):",
            "音频文件与专辑封面名称必须一致且命名规则如下(用-连接):\n\n歌曲名-作者\n例如:稻香-周杰伦"
        );
        $done({ body });
    } else {
        $done({ body });
    }

} catch (err) {
    $notification.post("云盘响应解析失败", "", String(err));
    $done({ body });
}