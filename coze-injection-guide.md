# Coze 聊天代码注入指南

## 方法一：直接注入方式

### 1. 手动注入到HTML文件

直接在目标网页的 `<body>` 标签结束前添加以下代码：

```html
<!-- Coze Web SDK 聊天组件 -->
<script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js"></script>
<script>
  new CozeWebSDK.WebChatClient({
    config: {
      bot_id: '7451481843796787219',
    },
    componentProps: {
      title: 'Coze AI 助手',
    },
    auth: {
      type: 'token',
      token: 'pat_xiXSWip6TOYrMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB',
      onRefreshToken: function () {
        return 'pat_xiXSWip6TOyMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB'
      }
    }
  });
</script>
```

### 2. 使用浏览器开发者工具注入

1. 打开目标网页
2. 按 F12 打开开发者工具
3. 切换到 Console 标签页
4. 依次执行以下代码：

```javascript
// 1. 加载 Coze SDK
var script = document.createElement('script');
script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';
script.onload = function() {
    // 2. 初始化聊天组件
    new CozeWebSDK.WebChatClient({
        config: { bot_id: '7451481843796786787219' },
        componentProps: { title: 'Coze AI 助手' },
        auth: {
            type: 'token',
            token: 'pat_xiXSWip6TOYrMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB',
            onRefreshToken: function() {
                return 'pat_xiXSWip6TOyMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB'
            }
        }
    });
    console.log('Coze 聊天组件注入成功');
};
document.head.appendChild(script);
```

## 方法二：浏览器插件注入方式

### 1. 创建 Chrome 扩展插件

创建以下文件结构：
```
coze-chat-extension/
├── manifest.json
├── content.js
└── icon.png
```

**manifest.json**:
```json
{
  "manifest_version": 3,
  "name": "Coze Chat Injector",
  "version": "1.0",
  "description": "注入 Coze 聊天组件到网页",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "icons": {
    "48": "icon.png"
  }
}
```

**content.js**:
```javascript
(function() {
    // 检查是否已经注入
    if (window.cozeInjected) return;
    window.cozeInjected = true;
    
    // 加载 Coze SDK
    var script = document.createElement('script');
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';
    script.onload = function() {
        // 初始化聊天组件
        new CozeWebSDK.WebChatClient({
            config: { bot_id: '7451481843796787219' },
            componentProps: { title: 'Coze AI 助手' },
            auth: {
                type: 'token',
                token: 'pat_xiXSWip6TOYrMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB',
                onRefreshToken: function() {
                    return 'pat_xiXSWip6TOyMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB'
                }
            }
        });
        console.log('Coze 聊天组件通过扩展注入成功');
    };
    document.head.appendChild(script);
})();
```

### 2. 安装和使用插件

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择包含上述文件的文件夹
5. 插件会自动在所有网页注入 Coze 聊天组件

## 方法三：使用用户脚本管理器（Tampermonkey/Greasemonkey）

### Tampermonkey 脚本

```javascript
// ==UserScript==
// @name         Coze Chat Injector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在任何网页注入 Coze 聊天组件
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // 防止重复注入
    if (window.cozeInjected) return;
    window.cozeInjected = true;
    
    // 加载 Coze SDK
    var script = document.createElement('script');
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';
    script.onload = function() {
        // 初始化聊天组件
        new CozeWebSDK.WebChatClient({
            config: { bot_id: '7451481843796787219' },
            componentProps: { title: 'Coze AI 助手' },
            auth: {
                type: 'token',
                token: 'pat_xiXSWip6TOYrMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB',
                onRefreshToken: function() {
                    return 'pat_xiXSWip6TOyMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB'
                }
            }
        });
        console.log('Coze 聊天组件通过 Tampermonkey 注入成功');
    };
    document.head.appendChild(script);
})();
```

## 注意事项

1. **跨域限制**：某些网站可能有严格的内容安全策略（CSP），可能会阻止外部脚本加载
2. **性能影响**：注入的脚本可能会影响页面加载性能
3. **兼容性**：确保目标网站没有冲突的JavaScript代码
4. **权限**：浏览器扩展需要适当的权限配置
5. **更新维护**：需要定期更新token和SDK版本

## 推荐方案

- **开发测试**：使用开发者工具控制台注入
- **个人使用**：使用 Tampermonkey 用户脚本
- **生产环境**：直接修改HTML源代码或使用浏览器扩展

选择最适合您需求的注入方式！