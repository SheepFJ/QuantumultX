let body = JSON.parse($response.body);
function modifyObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                modifyObject(obj[key]);
            } else {
                if (key === 'freeduration') {
                    obj[key] = 999999;
                }

if (key === 'isbuy') {
                    obj[key] = 1;
                }

 if (key === 'membertime') {
                    obj[key] = "2099-09-09 12:12:12";
                }
                if (key === 'ismember') {
                    obj[key] = "1";
                }

if (key === 'card_count') {
                    obj[key] = 10;
                }
            }
        }
    }
    
}
modifyObject(body);
$done({ body: JSON.stringify(body) });
