let body = $response.body;
const matches = body.match(/"content":"(.*?)"/g);
if (matches) {
    const contents = matches.map(match => match.replace(/"content":"|"/g, ''));
    const combinedContent = contents.join(''); // 合并所有内容
    const saveResult = $prefs.setValueForKey(combinedContent, "sheep_siri_aireply");
}
$done($response);