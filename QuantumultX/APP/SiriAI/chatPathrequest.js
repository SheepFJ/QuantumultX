let accessToken = $prefs.valueForKey("local_access_token");

    if (accessToken) {
        let headers = $request.headers;
        headers['Authorization'] = `Bearer ${accessToken}`;

        // 修改请求头后，等待响应
        $done({ headers });
    } else {
        console.log("没有获取到请求头");
        $done({});
    }