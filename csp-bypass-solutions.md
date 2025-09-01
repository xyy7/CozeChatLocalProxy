# 绕过MSN页面CSP限制的解决方案

## 问题分析

MSN页面有严格的内容安全策略（CSP），阻止了外部域的脚本加载：
- **Trusted Types**：要求所有脚本URL通过Trusted Types验证
- **script-src限制**：只允许特定域的脚本加载
- **coze.cn域名**：不在MSN的白名单中

## 解决方案一：使用代理服务器

### 1. 创建简单的HTTP代理

```javascript
// 使用CORS代理服务
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const cozeScriptUrl = proxyUrl + 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';

var script = document.createElement('script');
script.src = cozeScriptUrl;
script.onload = function() {
    // 初始化Coze聊天
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
};
document.head.appendChild(script);
```

### 2. 可用的CORS代理服务

```javascript
// 多个代理选项
const proxyServices = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/?'
];

function loadWithProxy(url, proxyIndex = 0) {
    if (proxyIndex >= proxyServices.length) {
        console.error('所有代理服务都失败了');
        return;
    }
    
    const proxyUrl = proxyServices[proxyIndex] + encodeURIComponent(url);
    const script = document.createElement('script');
    script.src = proxyUrl;
    script.onerror = function() {
        console.log(`代理 ${proxyIndex} 失败，尝试下一个`);
        loadWithProxy(url, proxyIndex + 1);
    };
    script.onload = function() {
        console.log('Coze SDK 加载成功');
        initCozeChat();
    };
    document.head.appendChild(script);
}

// 使用代理加载
loadWithProxy('https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js');
```

## 解决方案二：使用浏览器扩展修改CSP

### Chrome扩展manifest.json

```json
{
  "manifest_version": 3,
  "name": "Coze Chat CSP Bypass",
  "version": "1.0",
  "description": "绕过CSP限制注入Coze聊天",
  "permissions": [
    "webRequest",
    "webRequestBlocking",
    "scripting"
  ],
  "host_permissions": [
    "https://ntp.msn.com/*",
    "https://lf-cdn.coze.cn/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://ntp.msn.com/*"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ]
}
```

### background.js - 修改响应头

```javascript
chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    // 移除或修改CSP头
    for (let i = 0; i < details.responseHeaders.length; i++) {
      if (details.responseHeaders[i].name.toLowerCase() === 'content-security-policy') {
        // 修改CSP策略，允许coze.cn
        details.responseHeaders[i].value = details.responseHeaders[i].value
          .replace(/script-src[^;]*;/, 'script-src * \'unsafe-inline\' \'unsafe-eval\';');
        break;
      }
    }
    return { responseHeaders: details.responseHeaders };
  },
  { urls: ["https://ntp.msn.com/*"] },
  ["blocking", "responseHeaders"]
);
```

### content.js - 安全注入

```javascript
// 等待页面加载完成后注入
function injectCozeSafely() {
    // 检查是否已经注入
    if (window.cozeInjected) return;
    window.cozeInjected = true;
    
    // 创建script元素
    const script = document.createElement('script');
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';
    
    script.onload = function() {
        // 延迟初始化，确保SDK完全加载
        setTimeout(function() {
            try {
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
                console.log('Coze聊天注入成功');
            } catch (error) {
                console.error('Coze初始化失败:', error);
            }
        }, 1000);
    };
    
    script.onerror = function() {
        console.error('Coze SDK加载失败');
    };
    
    document.head.appendChild(script);
}

// 在合适的时机注入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCozeSafely);
} else {
    injectCozeSafely();
}
```

## 解决方案三：使用数据URI内联脚本

```javascript
// 将Coze SDK代码内联（需要先下载SDK代码）
const cozeSDKCode = `/* Coze SDK 代码内容 */`;

// 创建内联script
const script = document.createElement('script');
script.textContent = cozeSDKCode;

script.onload = function() {
    // 初始化Coze
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
};

document.head.appendChild(script);
```

## 解决方案四：使用Service Worker代理

```javascript
// 注册Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function(registration) {
            console.log('Service Worker 注册成功');
        });
}

// sw.js - Service Worker代码
self.addEventListener('fetch', function(event) {
    if (event.request.url.includes('lf-cdn.coze.cn')) {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(error => {
                    console.log('代理请求失败:', error);
                    return new Response('');
                })
        );
    }
});
```

## 推荐方案

1. **快速测试**：使用CORS代理服务（方案一）
2. **稳定使用**：创建浏览器扩展（方案二）
3. **生产环境**：自建代理服务器或使用CDN

## 注意事项

- **遵守网站条款**：确保您的操作不违反MSN的使用条款
- **性能考虑**：代理可能会增加加载时间
- **可靠性**：免费代理服务可能不稳定
- **更新维护**：需要定期检查代理服务和扩展的兼容性

选择最适合您需求的解决方案！