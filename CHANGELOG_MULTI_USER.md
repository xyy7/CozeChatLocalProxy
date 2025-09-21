# Coze多用户功能更新日志

## 版本 1.0.0 - 2025/9/22
### 新增功能
- ✅ **多用户支持**: 为Tampermonkey插件添加多用户认证支持
- ✅ **用户ID生成**: 实现随机用户ID生成算法
- ✅ **数据持久化**: 使用GM_setValue/GM_getValue API存储用户数据
- ✅ **JWT服务器扩展**: 支持会话名称参数和自定义声明

### 技术实现

#### Tampermonkey插件 (`coze-chat-tampermonkey-local-proxy.js`)
- 添加 `generateUserId()` 函数生成唯一用户标识
- 实现 `fetchUserJWTAccessToken()` 函数处理用户特定的token请求
- 使用GM存储API持久化用户ID和token
- 添加用户配置管理功能

#### JWT服务器 (`JWTOauth/main.py`)
- 修改 `/callback` 路由支持 `session_name` 查询参数
- 添加 `X-Session-Name` 请求头支持
- 在JWT token中添加自定义声明包含会话名称信息
- 保持向后兼容性（无session_name时使用默认client_id）

### 会话名称生成算法
```javascript
function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 6);
    return 'user_' + timestamp + '_' + randomStr;
}
```

### 存储机制
- `coze_session_name`: 存储生成的会话名称
- `coze_user_token`: 存储用户特定的JWT token
- 数据在浏览器关闭后仍然保持
- 支持多浏览器实例独立存储

### 测试验证
- 创建测试脚本 `test_multi_user.js`
- 添加验证工具 `verify_user_id_support.py`
- 编写详细测试指南 `MULTI_USER_TEST_GUIDE.md`

## 解决的问题
1. **单用户限制**: 原设计所有用户共享同一个client_id和token
2. **缺乏会话标识**: 无法区分不同浏览器实例的会话
3. **token共享问题**: 所有用户使用相同的认证token

## 兼容性说明
- ✅ 向后兼容：无会话名称时使用原有逻辑
- ✅ 跨浏览器支持：每个浏览器实例独立会话标识
- ✅ 数据持久化：会话名称在页面刷新后保持不变

## 使用方式
1. 用户首次访问Coze网站时自动生成唯一会话名称
2. 使用会话名称向JWT服务器请求特定的认证token
3. 后续访问使用存储的会话名称和token
4. 不同浏览器实例获得不同的会话名称和token

## 性能考虑
- 会话名称生成: < 1ms
- 存储操作: 内存操作，无性能影响
- JWT请求: 与原有性能相同

## 安全考虑
- 会话名称不包含敏感信息
- token仍然通过安全渠道获取
- 每个用户有独立的认证凭证

## 后续优化方向
- 用户ID加密存储
- token自动刷新机制
- 用户配置导出/导入功能
- 多设备同步支持