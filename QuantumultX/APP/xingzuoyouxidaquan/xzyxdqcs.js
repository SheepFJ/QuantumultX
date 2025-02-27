let htmlBody = $response.body;

// 第一次替换：var isbuyed = \d+;
htmlBody = htmlBody.replace(/var isbuyed = \d+;/, function(match) {
    return 'var isbuyed = 1;';
});

// 第二次替换：var forcenothaoping = false;
htmlBody = htmlBody.replace(/var forcenothaoping = false;/, function(match) {
    return 'var forcenothaoping = true;';
});

// 第三次替换：分别替换 locked:1,selected:true 和 alt="btn-back"
htmlBody = htmlBody.replace(/locked:1,selected:true/g, function(match) {
    return 'locked:0,selected:true'; // 替换 locked:1,selected:true
});

htmlBody = htmlBody.replace(/alt="btn-back"/g, function(match) {
    return 'alt="btn-back" style="margin-top: 20px;"'; // 替换 alt="btn-back"
});

$done({ body: htmlBody });