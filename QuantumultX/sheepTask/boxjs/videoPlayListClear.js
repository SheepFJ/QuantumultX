(() => {
    clearStoredData();
    $prefs.setValueForKey("0", "vod_count"); // 重置存储计数
    console.log("所有 vod_info_ 相关数据已清除，vod_count 已重置为 0");
    $done();

    /**
     * 清理存储的 vod_info 数据
     */
    function clearStoredData() {
        let maxIndex = getMaxStoredIndex();
        for (let i = 1; i <= maxIndex; i++) {
            let key = `vod_info_${String(i).padStart(2, "0")}`;
            if ($prefs.valueForKey(key)) {
                $prefs.removeValueForKey(key);
            }
        }
    }

    /**
     * 获取当前存储的最大索引
     * @returns {number} 最大存储索引
     */
    function getMaxStoredIndex() {
        let maxIndex = 0;
        for (let i = 1; ; i++) {
            let key = `vod_info_${String(i).padStart(2, "0")}`;
            if ($prefs.valueForKey(key)) {
                maxIndex = i;
            } else {
                break;
            }
        }
        return maxIndex;
    }
})();