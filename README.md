# CORS 代理服务器解决方案

这是一个完整的 CORS 代理解决方案，用于绕过浏览器的同源策略和 CSP 限制，特别针对 Coze 聊天 SDK 的注入问题。

## 文件结构

```
.
├── cors_proxy_server.py      # CORS 代理服务器主程序
├── start_proxy.py           # 启动脚本
├── config.json              # 配置文件
├── coze-chat-tampermonkey-local-proxy.js  # 更新版的 Tampermonkey 脚本
└── README.md               # 说明文档
```

## 功能特性

- ✅ 完整的 CORS 代理服务器，支持 GET/POST/PUT/DELETE/OPTIONS
- ✅ 自动添加 CORS 头信息，绕过同源策略
- ✅ 支持本地代理优先，外部代理备用的智能策略
- ✅ 详细的日志记录和错误处理
- ✅ 可配置的安全策略和域名白名单
- ✅ 与 Tampermonkey 脚本完美集成

## 安装依赖

首先需要安装 Python 依赖：

```bash
pip install aiohttp certifi
```

## 启动代理服务器

### 方法一：使用启动脚本（推荐）

```bash
python start_proxy.py
```

可选参数：
- `--host 0.0.0.0` - 绑定到所有网络接口
- `--port 8080` - 使用指定端口
- `--debug` - 启用调试模式
- `--config config.json` - 使用指定配置文件

### 方法二：直接运行主程序

```bash
python cors_proxy_server.py
```

## 配置说明

编辑 `config.json` 文件来自定义服务器行为：

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 8080,
    "debug": false
  },
  "security": {
    "allowed_domains": ["lf-cdn.coze.cn", "*.coze.cn"],
    "max_request_size": "10MB"
  }
}
```

## 使用方法

### 1. 基本代理请求

```javascript
// 使用路径方式
const proxyUrl = `http://127.0.0.1:8080/https://lf-cdn.coze.cn/sdk.js`;

// 使用查询参数方式  
const proxyUrl = `http://127.0.0.1:8080/?url=https://lf-cdn.coze.cn/sdk.js`;
```

### 2. 在 Tampermonkey 脚本中使用

更新你的 Tampermonkey 脚本，使用新的 `coze-chat-tampermonkey-local-proxy.js` 文件。

### 3. 测试代理服务器

```bash
# 测试代理是否工作
curl "http://127.0.0.1:8080/https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js"

# 查看服务器信息
curl http://127.0.0.1:8080/
```

## 代理策略

脚本采用智能代理策略：

1. **首先检查本地代理** - 如果本地代理服务器运行中，优先使用
2. **尝试直接加载** - 如果本地代理不可用，尝试直接加载
3. **使用外部代理** - 如果直接加载失败，使用外部 CORS 代理服务
4. **备用代理列表** - 包含多个可靠的 CORS 代理服务

## 安全注意事项

- 默认只允许访问白名单中的域名
- 在生产环境中应该配置更严格的安全策略
- 不建议将代理服务器暴露到公网
- 定期更新依赖包以确保安全

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   netstat -ano | findstr :8080
   # 或者使用其他端口
   python start_proxy.py --port 8081
   ```

2. **代理连接失败**
   - 检查防火墙设置
   - 确认代理服务器正在运行
   - 查看日志文件获取详细信息

3. **CSP 仍然阻止**
   - 尝试使用不同的注入方法
   - 检查浏览器控制台的详细错误信息

### 日志查看

日志默认输出到控制台，也可以配置输出到文件：

```json
{
  "logging": {
    "level": "DEBUG",
    "file": "cors_proxy.log"
  }
}
```

## 性能优化

- 调整 `max_connections` 参数控制并发连接数
- 启用 `keep_alive` 提高连接复用率
- 设置适当的 `timeout` 值避免资源浪费

## 许可证

MIT License - 可以自由使用和修改。