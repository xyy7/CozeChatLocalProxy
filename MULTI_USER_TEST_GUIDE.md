# Coze多用户功能测试指南

## 概述
本文档指导如何测试Coze聊天插件的多用户功能，包括用户ID生成、存储管理和JWT服务器支持。

## 测试环境要求
- Tampermonkey插件已安装
- JWT认证服务器运行在 `127.0.0.1:8081`
- Coze网站可访问 (`https://www.coze.cn/`)

## 测试步骤

### 1. 启动JWT服务器
```bash
cd JWTOauth
python main.py
```

### 2. 安装测试脚本
将 `test_multi_user.js` 安装到Tampermonkey中，或者直接在浏览器控制台运行测试代码。

### 3. 运行自动化测试
打开Coze网站，测试脚本会自动运行并输出结果到控制台。

### 4. 手动验证功能

#### 验证用户ID生成
```javascript
// 在浏览器控制台测试用户ID生成
function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 6);
    return 'user_' + timestamp + '_' + randomStr;
}

// 生成多个用户ID验证唯一性
const ids = new Set();
for (let i = 0; i < 10; i++) {
    ids.add(generateUserId());
}
console.log('生成的唯一用户ID数量:', ids.size);
```

#### 验证存储功能
```javascript
// 测试GM存储API
if (typeof GM_setValue !== 'undefined') {
    const testId = 'test_user_' + Date.now();
    GM_setValue('coze_user_id', testId);
    const storedId = GM_getValue('coze_user_id');
    console.log('存储测试:', storedId === testId ? '✅ 通过' : '❌ 失败');
}
```

#### 验证JWT服务器
```javascript
// 测试带用户ID的JWT请求
async function testJWTWithUserId(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:8081/callback?session_name=${userId}`, {
            headers: {
                'X-Session-Name': userId,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('用户', userId, '的JWT token:', data.access_token ? '✅ 获取成功' : '❌ 获取失败');
            return data.access_token;
        }
        return null;
    } catch (error) {
        console.error('JWT请求失败:', error);
        return null;
    }
}

// 测试多个用户
const testUsers = ['user_123', 'user_456', 'user_789'];
testUsers.forEach(userId => testJWTWithUserId(userId));
```

### 5. 多浏览器实例测试
1. 打开Chrome浏览器，访问Coze网站，查看生成的用户ID
2. 打开Firefox浏览器，访问Coze网站，查看生成的用户ID
3. 验证两个浏览器实例的用户ID不同
4. 验证两个实例获取的JWT token不同

### 6. 清除测试数据
```javascript
// 清除存储的用户数据
if (typeof GM_deleteValue !== 'undefined') {
    GM_deleteValue('coze_user_id');
    GM_deleteValue('coze_user_token');
    console.log('✅ 用户数据已清除');
}
```

## 预期结果

### 成功指标
1. ✅ 每个浏览器实例生成唯一的用户ID
2. ✅ 用户ID正确存储和读取
3. ✅ JWT服务器为不同用户ID返回不同的token
4. ✅ 跨浏览器实例的用户ID保持唯一性
5. ✅ 页面刷新后用户ID保持不变

### 故障排查

#### 用户ID不唯一
- 检查随机数生成算法
- 验证时间戳精度

#### 存储功能失败
- 确认Tampermonkey权限配置
- 检查GM API可用性

#### JWT服务器无响应
- 确认服务器运行状态
- 检查端口8081是否被占用
- 验证CORS配置

#### Token相同
- 检查JWT服务器是否正确处理session_name参数
- 验证会话名称设置

## 测试用例

| 测试场景 | 预期结果 | 状态 |
|---------|---------|------|
| 首次访问生成用户ID | 生成唯一用户ID并存储 | ✅ |
| 再次访问读取用户ID | 读取已存储的用户ID | ✅ |
| 多浏览器实例 | 每个实例有唯一用户ID | ✅ |
| 不同用户获取token | 每个用户获得不同token | ✅ |
| 清除数据后重新生成 | 生成新的用户ID | ✅ |

## 日志监控
检查浏览器控制台输出，确认所有测试步骤正常执行。

## 性能考虑
- 用户ID生成应在毫秒级完成
- 存储操作不应影响页面性能
- JWT请求响应时间应小于1秒