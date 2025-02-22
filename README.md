# 欢迎加入 :hearts:
> 加入Telegram交流群 [Sheep交流反馈](https://t.me/sheep_007_xiaoyang).  
> 关注Telegram通知群[Sheep资源备份分享](https://t.me/sheep_007xiaoyang).



<img src="https://count.getloli.com/get/@SheepFJ">


# 功能实现 :space_invader:

<details>
  ## <summary>:zap:圈x & PKC微信自动回复</summary>
 



## 使用方法  


**1**. QuantumultX设置开启进入HTTP Backend(右上角第二个)开启该功能，并设置(右上角第一个):    
监听地址:`127.0.0.1`  
端口:`9999`  
**2**.在HTTP Backend里面(右上角第三个)➕填入[backend]处理请求路径与脚本路径(第一次配置好重启圈x才能生效):       
处理请求路径:  `^/sheep/pkc/gpt/`      
脚本路径: [长按复制](https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/sheepTask/pkcWeChatGpt.js)         
**3**.设置微信pkc插件--关键词自动回复:      
pkc插件中打开关键词自动回复，进入关键词回复设置右上点添加，自动回复文本(必填)中填写 `/pkc text 1 [原文]`  
**4**.设置微信pkc插件--自定义接口Api：  
打开自定义文本api，然后进入配置，在API1(与第三步text 1对应第一个)中填写 `http://127.0.0.1:9999/sheep/pkc/gpt/[参数1]/`   
在自定义内容API1中填写 `[content]`（如果打开了文字转语言,在自定义前缀API1中填写 `yy` 可自动将文字转语音）    
**5**.配合BoxJs([怎么使用BoxJS](https://t.me/sheep_007xiaoyang/13))修改AI设定，猫娘风，幽默风，由你设置:boxjs订阅链接： [长按复制](https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/sheepTask/sheepTaskBoxJs.json)      


### 效果如下  

![效果如下](https://www.helloimg.com/i/2025/02/08/67a735a6a3b9d.jpeg)  



</details>

<details>
  <summary>:zap:圈x & 网页影视聚合</summary>
 
### 使用方法
**[获取帮助](https://t.me/sheep_007_xiaoyang)**  
**1:导入圈x脚本重写** [长按复制](https://raw.githubusercontent.com/SheepFJ/Sheep/refs/heads/main/SiriVideoPlay/videoPlayAggregation.js)  
**2:访问网页即可使用** [点击跳转](https://movies.disney.com/sheep/video/search/)



</details>

# 免责声明 :book:

<details>
  <summary>:trophy:声明</summary>
  
### :construction:免责声明：

* 本项目中的所有解锁与解密分析脚本仅供资源共享与学习交流之用，不对其合法性、准确性、完整性和有效性作任何保证，请用户自行评估和判断。

* 任何间接使用本项目脚本的行为，包括但不限于搭建 VPS 或在违反国家/地区法律及相关规定的情况下传播内容，由此导致的隐私泄漏或其他后果，概由用户自行承担责任。

* 禁止将本项目的任何内容用于商业用途或任何非法目的，因不当使用而引发的后果由使用者自行负责。

* 若任何单位或个人认为本项目的脚本可能侵犯其合法权益，请及时提供身份及权利证明，我们将在核实后移除相关内容。

* 对于脚本使用中可能出现的任何问题，包括但不限于因脚本错误而造成的损失或损害，项目不承担任何责任。

* 用户需在下载后 24 小时内从计算机或移动设备中完全删除上述内容。

* 任何以任何方式访问或使用本项目脚本的用户，均应仔细阅读并遵守本声明。我们保留随时修改或补充本免责声明的权利。使用或复制任何相关内容即视为您已接受本声明。


</details>

