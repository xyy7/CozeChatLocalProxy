# JWT服务器通信修复测试指南

## 修复内容概述

已修复Tampermonkey脚本与JWT服务器之间的通信协议不匹配问题：

1. **主要问题**: 缺少 `X-Requested-With: XMLHttpRequest` 头
2. **修复方案**: 在fetch请求中添加必要的headers
3. **增强功能**: 添加详细的调试输出和错误处理

## 测试步骤

### 1. 启动JWT服务器

```bash
cd JWTOauth
python main.py
```

### 2. 验证服务器运行状态

在浏览器中访问: http://127.0.0.1:8081/

应该看到JWT认证服务器的欢迎页面。

### 3. 测试通信功能

在浏览器控制台中运行测试脚本：

```javascript
// 复制并运行 test_jwt_communication.js 中的代码
// 或者直接执行以下命令：
fetch('http://127.0.0.1:8081/callback', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'include'
})
.then(response => {
    console.log('状态码:', response.status);
    console.log('Content-Type:', response.headers.get('Content-Type'));
    return response.json();
})
.then(data => console.log('响应数据:', data))
.catch(error => console.error('错误:', error));
```

### 4. 启用Tampermonkey脚本

1. 安装或更新 `coze-chat-tampermonkey-local-proxy.js` 脚本
2. 访问Coze聊天页面
3. 打开浏览器开发者工具控制台
4. 观察调试输出

### 5. 验证修复效果

**预期输出应该包含：**

```
✅ fetchJWTAccessToken - 响应状态: 200
📋 fetchJWTAccessToken - 响应头: {content-type: "application/json", ...}
✅ fetchJWTAccessToken - 解析的JSON数据: {access_token: "xxx", token_type: "bearer", expires_in: 3600}
✅ JWT token获取成功并存储
```

## 常见问题排查

### 问题1: CORS错误
**症状**: `Cross-Origin Request Blocked`
**解决方案**: 确保JWT服务器设置了正确的CORS头

### 问题2: 返回HTML而不是JSON
**症状**: 响应Content-Type是text/html
**原因**: 缺少 `X-Requested-With: XMLHttpRequest` 头
**解决方案**: 检查headers配置

### 问题3: 401未授权
**症状**: 状态码401
**原因**: 缺少有效的session或cookie
**解决方案**: 确保浏览器中有有效的认证session

### 问题4: 连接拒绝
**症状**: `Failed to fetch` 或网络错误
**原因**: JWT服务器未运行或端口被占用
**解决方案**: 检查服务器状态和端口配置

## 调试技巧

1. **查看完整响应**: 使用 `console.log('完整响应:', response)` 查看所有响应信息
2. **检查headers**: 使用 `Object.fromEntries([...response.headers])` 查看所有响应头
3. **验证JSON结构**: 确保响应包含 `access_token`, `token_type`, `expires_in` 字段
4. **网络面板**: 使用浏览器开发者工具的Network面板查看实际请求和响应

## 验证标准

✅ **通信协议正确**: 包含 `X-Requested-With: XMLHttpRequest` 头  
✅ **内容协商正确**: 包含 `Accept: application/json` 和 `Content-Type: application/json`  
✅ **认证信息正确**: 包含 `credentials: include`  
✅ **错误处理完善**: 包含详细的错误日志和异常处理  
✅ **调试输出完整**: 包含响应状态、头部、完整响应和解析数据  

## 下一步操作

1. 运行测试脚本验证通信功能
2. 启用Tampermonkey脚本观察实际运行效果
3. 根据控制台输出进一步优化调试信息
4. 考虑添加重试机制和备用认证方案