let userInfoArray = [];

fetch('https://api.sheep.com/sheep/wechat/api/?web=GetUserinfo')
    .then(response => response.json())
    .then(data => {
        userInfoArray = data.data.array;
    })
    .catch(error => {
        console.error('Error:', error);
    })
let currentPopup = null;

function showPopup(text) {
    // 隐藏所有内容区域
    document.querySelectorAll('.popup-content').forEach(item => {
        item.style.display = 'none';
    });
    // 显示弹出框与遮罩层
    document.getElementById('public-popup').style.display = 'block';
    document.getElementById('popup-overlay').style.display = 'block';

    // 显示对应内容区域
    const contentMap = {
        'randomnumber': ['popup-1', 'popup-2'],
        'help': ['popup-1', 'popup-5'],
        'about': ['popup-6'],
    };

    //根据userInfoArray的id，获取对应的数据然后渲染弹出页面
    const userInfo = userInfoArray.api.find(item => item.id === text);
    if (contentMap[text]) {
        contentMap[text].forEach(item => {

            // 如果是popup-1，更新标题、关键词列表和开关状态
            if (item === 'popup-1' && userInfo) {
                // 更新标题
                const titleElement = document.getElementById('popup-1-title');
                if (titleElement) {
                    titleElement.textContent = `${userInfo.name}`;
                }
                // 更新关键词列表
                const keywordsList = document.getElementById('keywords-list');
                if (keywordsList && userInfo.prompt_word) {
                    // 清空现有列表
                    keywordsList.innerHTML = '';
                    // 添加关键词
                    userInfo.prompt_word.forEach(keyword => {
                        const li = document.createElement('li');
                        li.innerHTML = `${keyword} <a class="delete-keyword">删除</a>`;
                        keywordsList.appendChild(li);
                        // 为新添加的删除按钮添加事件监听
                        li.querySelector('.delete-keyword').addEventListener('click', function () {
                            keywordsList.removeChild(li);
                        });
                    });
                }

                // 更新开关状态
                const toggleSwitch = document.getElementById("popup-1-toggle");
                if (toggleSwitch) {
                    toggleSwitch.checked = userInfo.enable === true;
                }
                // 更新帮助文本
                const helpTextarea = document.getElementById('help-content');
                if (helpTextarea && userInfo.help) {
                    helpTextarea.value = userInfo.help;
                }
            }


            if (item === 'popup-2' && userInfo) {
                // 更新前缀文本
                const prefixTextarea = document.getElementById('prefix-content');
                if (prefixTextarea && userInfo.prefix_text) {
                    prefixTextarea.value = userInfo.prefix_text;
                }
                // 更新后缀文本
                const suffixTextarea = document.getElementById('suffix-content');
                if (suffixTextarea && userInfo.suffix_text) {
                    suffixTextarea.value = userInfo.suffix_text;
                }
            }
            if (item === 'popup-5' && userInfo) {
                // 更新帮助文本
                const helpTextarea = document.getElementById('help-content-all');
                if (helpTextarea && userInfo.popup_help) {
                    helpTextarea.value = userInfo.popup_help.join('\n');
                }
            }
            document.getElementById(item).style.display = 'block';
        });
        currentPopup = text;
    }
}


// 刷新-重新打开https://api.sheep.com/sheep/wechat/api/?web=MainPage
document.getElementById('refresh-help-content').addEventListener('click', function () {
    window.location.href = 'https://api.sheep.com/sheep/wechat/api/?web=MainPage';
});




// 添加关键词
document.getElementById('add-keyword-btn').addEventListener('click', function () {
    const input = document.getElementById('keyword-input');
    const keyword = input.value.trim();

    if (keyword) {
        const list = document.getElementById('keywords-list');
        const li = document.createElement('li');
        li.innerHTML = `${keyword} <a class="delete-keyword">删除</a>`;
        list.appendChild(li);
        input.value = '';

        // 为新添加的删除按钮添加事件监听
        li.querySelector('.delete-keyword').addEventListener('click', function () {
            list.removeChild(li);
        });
    }
});

// 为已有的删除按钮添加事件监听
document.querySelectorAll('.delete-keyword').forEach(btn => {
    btn.addEventListener('click', function () {
        const li = this.parentElement;
        li.parentElement.removeChild(li);
    });
});



// 关闭弹出框
const closePopup = document.querySelector('.close-popup');
closePopup.addEventListener('click', () => {
    document.getElementById('public-popup').style.display = 'none';
    document.getElementById('popup-overlay').style.display = 'none';
});

// 确认按钮
const confirmAI = document.querySelector('.confirm-popup');
confirmAI.addEventListener('click', () => {

    // 获取当前显示的弹窗
    const visiblePopups = document.querySelectorAll('.popup-content');
    let currentPopupId = '';
    let data = {};

    // 遍历所有弹窗，找到当前显示的弹窗
    visiblePopups.forEach(popup => {
        if (popup.style.display === 'block') {
            currentPopupId = popup.id;

            // 根据弹窗类型组装数据
            if (currentPopupId === 'popup-1') {
                // 获取标题（名称）
                const name = document.getElementById('popup-1-title').innerHTML;
                // 获取ID（从标题中提取或使用预设值）
                const id = currentPopup; // 使用当前弹窗的ID
                // 获取是否启用
                const enable = document.getElementById('popup-1-toggle').checked;
                // 获取帮助文本
                const helpContent = document.getElementById('help-content').value;
                // 获取关键词列表
                const keywordsList = document.getElementById('keywords-list');
                const keywords = [];
                keywordsList.querySelectorAll('li').forEach(li => {
                    // 提取关键词文本（去除"删除"按钮文本）
                    const keywordText = li.textContent.replace('删除', '').trim();
                    keywords.push(keywordText);
                });
                // 组装数据
                data = {
                    "id": id,
                    "name": name,
                    "grade": 1,
                    "enable": enable,
                    "prompt_word": keywords,
                    "help": helpContent
                };
            }

            if (currentPopupId === 'popup-2') {
                // 获取前缀和后缀内容
                const prefixContent = document.getElementById('prefix-content').value;
                const suffixContent = document.getElementById('suffix-content').value;
                data = {
                    ...data,
                    "prefix_text": prefixContent,
                    "suffix_text": suffixContent
                };
            }

            if (currentPopupId === 'popup-5') {
                // 获取帮助内容
                const helpContent = document.getElementById('help-content').value;
                data = {
                    ...data,
                    "help": helpContent
                };
            }

        }
    });



    // 更新userInfoArray中的数据
    if (userInfoArray && userInfoArray.api && data && data.id) {
        // 查找匹配的API项
        const apiIndex = userInfoArray.api.findIndex(item => item.id === data.id);
        // 如果找到匹配项，则替换数据
        if (apiIndex !== -1) {
            userInfoArray.api[apiIndex] = data;
        } else {
            console.log(`未找到ID为${data.id} 的API数据，无法更新`);
        }
        //发送请求，更新userInfoArray
        // 构建URL参数
        let urlParams = `web=AddkeyWord`;
        // 遍历data对象的每个属性
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                // 如果值是数组，用连字符拼接
                urlParams += `&${key}=${value.join('-')}`;
            } else {
                // 如果值是普通类型
                urlParams += `&${key}=${value}`;
            }
        }

        fetch(`https://api.sheep.com/sheep/wechat/api/?${urlParams}`)
            .then(response => response.json())
            .then(responseData => {
                console.log(responseData.data.information);
            })
            .catch(error => {
                console.error('更新数据失败:', error);
            });

    }
    // 关闭弹出框
    document.getElementById('public-popup').style.display = 'none';
    document.getElementById('popup-overlay').style.display = 'none';
});


// 导航栏
let currentSection = 'text';
function showSection(section) {
    // 更新当前选中的导航按钮
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('nav-active');
    });
    document.getElementById(section + 'Btn').classList.add('nav-active');

    // 隐藏所有内容区域
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    // 显示选中的内容区域
    document.getElementById(section + '-section').classList.add('active');
    // 更新当前section
    currentSection = section;
}

// 为所有content-section下面的wechat-api元素添加点击事件
document.addEventListener('DOMContentLoaded', function () {
    const contentSections = document.querySelectorAll('.content-section');

    contentSections.forEach(section => {
        const wechatApiElements = section.querySelectorAll('.wechat-api');
        wechatApiElements.forEach(element => {
            element.addEventListener('click', function () {
                const id = this.getAttribute('id');
                currentPopup = id;
                console.log('Current popup:', currentPopup);
                showPopup(currentPopup);
            });
        });
    });
});
