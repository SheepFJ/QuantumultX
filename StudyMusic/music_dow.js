const url = $request.url || "";

if (url.includes("longzhu_api")) {
    let headers = $response.headers || {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "*";

    $done({ headers });
} 

$done({});
