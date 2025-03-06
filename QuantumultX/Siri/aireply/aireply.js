const saveResult = $prefs.valueForKey("sheep_siri_aireply");
    
console.log(saveResult)
$done({


status: "HTTP/1.1 200 OK",
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                    body:saveResult

})
