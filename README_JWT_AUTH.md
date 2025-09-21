# Coze JWT 认证系统

本文档介绍如何设置和使用基于JWT的Coze认证系统，替代原有的硬编码PAT token方式。

## 🎯 系统架构

系统包含三个主要组件：

1. **CORS代理服务器** (端口: 8080)
   - 处理跨域请求代理
   - 转发Coze API请求

2. **JWT OAuth服务器** (端口: 8081)  
   - 提供JWT token获取服务
   - 处理OAuth认证流程
   - 提供 `/callback` 端点返回JWT token

3. **Tampermonkey用户脚本**
   - 修改Coze网页的认证方式
   - 自动获取和刷新JWT token
   - 替换硬编码的PAT token

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

```bash
# 启动所有服务
python start_servers.py
```

### 方法二：手动启动

```bash
# 终端1：启动CORS代理服务器
python cors_proxy_server.py --host 127.0.0.1 --port 8080

# 终端2：启动JWT OAuth服务器  
cd JWTOauth
python main.py
```

## 🔧 配置要求

### 1. JWT OAuth 配置

确保 `JWTOauth/coze_oauth_config.json` 文件存在并正确配置：

```json
{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "coze_www_base": "https://www.coze.cn",
  "redirect_uri": "http://127.0.0.1:8081/callback"
}
```

### 2. Tampermonkey 脚本

安装或更新 `coze-chat-tampermonkey-local-proxy.js` 用户脚本。

## 🧪 测试验证

### 1. 验证服务器运行

访问以下URL检查服务状态：

- CORS代理服务器: http://127.0.0.1:8080
- JWT OAuth服务器: http://127.0.0.1:8081

### 2. 测试JWT token获取

```bash
# 测试获取JWT token
curl http://127.0.0.1:8081/callback
```

### 3. 验证Coze集成

1. 打开Coze网页 (https://www.coze.cn)
2. Tampermonkey脚本会自动运行
3. 检查浏览器控制台是否有JWT认证成功的日志

## 🔄 认证流程

1. **初始化**: Tampermonkey脚本检测到Coze页面加载
2. **Token获取**: 向JWT服务器请求access token
3. **认证配置**: 使用JWT token配置Coze SDK
4. **自动刷新**: token过期时自动重新获取

## 🛠️ 故障排除

### 常见问题

1. **端口冲突**
   - 确保8080和8081端口未被其他程序占用
   - 检查 `cors_proxy_server.py` 和 `JWTOauth/main.py` 的端口配置

2. **JWT服务器无法启动**
   - 检查 `coze_oauth_config.json` 文件是否存在且格式正确
   - 验证client_id和client_secret是否正确

3. **认证失败**
   - 检查浏览器控制台错误信息
   - 验证JWT服务器是否正常运行

### 日志查看

- **CORS代理日志**: 在启动终端中查看
- **JWT服务器日志**: 在JWTOauth启动终端中查看  
- **浏览器调试**: 按F12打开开发者工具，查看Console和Network标签

## 📁 文件说明

- `cors_proxy_server.py` - CORS代理服务器
- `JWTOauth/main.py` - JWT OAuth服务器主程序
- `JWTOauth/coze_oauth_config.json` - OAuth配置
- `coze-chat-tampermonkey-local-proxy.js` - 用户脚本
- `start_servers.py` - 一键启动脚本

## 🔒 安全说明

- JWT token不再硬编码在客户端
- token通过安全的服务器端流程获取
- 支持token自动刷新机制
- 减少了PAT token泄露的风险

## 📞 支持

如遇问题，请检查：
1. 所有服务是否正常启动
2. 配置文件是否正确
3. 浏览器控制台错误信息
4. 服务器终端输出日志