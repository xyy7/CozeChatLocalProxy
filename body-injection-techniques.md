# 在 `<body>` 前注入代码的技术指南

## 方法一：使用 DOMContentLoaded 事件

在页面DOM加载完成但外部资源（如图片）尚未加载时注入：

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // 在body开始标签后立即注入
    var cozeScript = document.createElement('script');
    cozeScript.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';
    cozeScript.onload = function() {
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
    document.body.appendChild(cozeScript);
});
```

## 方法二：使用 MutationObserver 监听 body 元素

监听body元素的出现并在其创建后立即注入：

```javascript
// 监听body元素的创建
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i];
                if (node.nodeName === 'BODY') {
                    // body元素已创建，立即注入代码
                    injectCozeChat();
                    observer.disconnect(); // 停止监听
                    break;
                }
            }
        }
    });
});

// 开始监听document的变化
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

function injectCozeChat() {
    var script = document.createElement('script');
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';
    script.onload = function() {
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
    document.body.appendChild(script);
}
```

## 方法三：直接修改 HTML 并刷新页面

### 1. 使用开发者工具修改并刷新

```javascript
// 获取当前页面的HTML内容
var htmlContent = document.documentElement.outerHTML;

// 在</body>前插入Coze代码
var cozeCode = `
<script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js"></script>
<script>
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
</script>
`;

// 替换HTML内容并刷新
var newHtml = htmlContent.replace('</body>', cozeCode + '</body>');
document.documentElement.outerHTML = newHtml;

// 强制刷新页面
location.reload(true);
```

### 2. 使用 document.write 在解析时注入

```javascript
// 这种方法必须在页面加载过程中执行
document.write(`
<script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
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
  });
</script>
`);
```

## 页面刷新方法

### 1. 普通刷新
```javascript
// 重新加载当前页面
location.reload();

// 强制从服务器重新加载（跳过缓存）
location.reload(true);
```

### 2. 带参数的刷新
```javascript
// 刷新并添加hash参数
location.href = location.href.split('#')[0] + '#coze-injected';
location.reload();

// 刷新并添加查询参数
var url = new URL(location.href);
url.searchParams.set('coze', 'injected');
location.href = url.toString();
```

### 3. 定时刷新
```javascript
// 5秒后刷新页面
setTimeout(function() {
    location.reload();
}, 5000);

// 每30秒刷新一次（不推荐，仅用于演示）
setInterval(function() {
    location.reload();
}, 30000);
```

## 最佳实践

1. **使用 MutationObserver**：最可靠的方法，确保在body元素可用后立即注入
2. **避免使用 document.write**：在现代Web开发中不推荐使用
3. **合理的刷新策略**：只在必要时刷新页面，避免用户体验中断
4. **错误处理**：添加适当的错误处理机制

## 完整示例：自动注入 + 智能刷新

```javascript
// 检查是否已经注入
if (!window.cozeInjected) {
    window.cozeInjected = true;
    
    // 监听body创建
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    if (mutation.addedNodes[i].nodeName === 'BODY') {
                        injectCozeChat();
                        observer.disconnect();
                        break;
                    }
                }
            }
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // 10秒后如果仍未注入，强制刷新
    setTimeout(function() {
        if (!document.querySelector('.coze-chat-container')) {
            console.log('Coze注入超时，刷新页面...');
            location.reload();
        }
    }, 10000);
}

function injectCozeChat() {
    // 注入代码逻辑...
}
```

选择最适合您场景的注入和刷新策略！