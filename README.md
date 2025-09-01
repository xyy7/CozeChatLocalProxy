# Coze Chat CORS 代理解决方案

这是一个用于绕过Coze Web SDK的CSP和同源策略限制的本地代理解决方案，包含Tampermonkey用户脚本和Python代理服务器。

## 项目文件说明

- `coze-chat-tampermonkey-local-proxy.js` - Tampermonkey用户脚本（浏览器端）
- `cors_proxy_server.py` - CORS代理服务器主程序
- `start_proxy.py` - 简化启动脚本
- `install.py` - 依赖安装脚本
- `start.bat` - Windows批处理启动文件
- `config.json` - 配置文件

## 安装流程

### 1. 安装Python环境
确保您已安装Python 3.7或更高版本：
```bash
python --version
```

### 2. 安装依赖包
运行安装脚本自动安装所需依赖：
```bash
python install.py
```

或者手动安装：
```bash
pip install aiohttp certifi
```

### 3. 安装Tampermonkey浏览器扩展
- Chrome: 从Chrome网上应用店安装Tampermonkey
- Firefox: 从Firefox附加组件商店安装Tampermonkey
- Edge: 从Microsoft Store安装Tampermonkey

## 脚本安装到浏览器

### 方法1：直接安装（推荐）
1. 打开Tampermonkey扩展
2. 点击"创建新脚本"
3. 复制 `coze-chat-tampermonkey-local-proxy.js` 的全部内容
4. 粘贴到编辑器中并保存

### 方法2：文件导入
1. 在Tampermonkey中点击"实用工具"
2. 选择"文件"标签页
3. 点击"选择文件"并选择 `coze-chat-tampermonkey-local-proxy.js`
4. 点击"安装"

### 方法3：URL安装
如果脚本托管在网络上，可以通过URL直接安装。

## 启动本地服务器

### Windows系统
双击运行 `start.bat` 文件，或命令行运行：
```cmd
start.bat
```

### macOS/Linux系统
```bash
python start_proxy.py
```

或者直接运行主服务器：
```bash
python cors_proxy_server.py
```

### 自定义配置启动
```bash
# 指定主机和端口
python start_proxy.py --host 127.0.0.1 --port 8080

# 使用自定义配置文件
python start_proxy.py --config my_config.json

# 启用调试模式
python start_proxy.py --debug
```

## 验证服务器运行

服务器启动后，访问以下地址验证：
```
http://127.0.0.1:8080/
```

应该看到类似这样的响应：
```json
{
  "service": "CORS Proxy Server",
  "version": "1.0.0",
  "endpoints": {
    "GET /{url}": "代理GET请求",
    "POST /{url}": "代理POST请求",
    "PUT /{url}": "代理PUT请求",
    "DELETE /{url}": "代理DELETE请求",
    "OPTIONS /{url}": "处理预检请求"
  },
  "usage": "将目标URL编码后附加到代理URL后，例如: /https://example.com/api/data"
}
```

## 使用流程

1. **启动代理服务器** - 运行上述启动命令
2. **安装用户脚本** - 在浏览器中安装Tampermonkey脚本
3. **访问Coze网站** - 打开 https://www.coze.cn/ 或 https://www.coze.com/
4. **自动注入** - 脚本会自动检测并注入Coze聊天组件

## 故障排除

### 常见问题

1. **Python未安装**
   - 下载并安装Python 3.7+ from python.org

2. **依赖安装失败**
   - 尝试使用管理员权限运行命令
   - 或者使用: `pip install --user aiohttp certifi`

3. **端口被占用**
   - 修改config.json中的端口号
   - 或使用: `python start_proxy.py --port 8081`

4. **代理服务器无法连接**
   - 检查防火墙设置
   - 确保代理服务器正在运行

5. **CSP限制仍然存在**
   - 检查浏览器控制台错误信息
   - 确保代理URL配置正确

### 日志查看

服务器日志默认输出到控制台，如需查看详细日志：
- 修改config.json中的logging配置
- 或查看生成的cors_proxy.log文件

## 配置说明

编辑 `config.json` 文件来自定义设置：

- `server` - 服务器配置（主机、端口、调试模式）
- `security` - 安全设置（允许的域名、最大请求大小）
- `logging` - 日志配置（级别、格式、文件）
- `performance` - 性能设置（超时、最大连接数）

## 技术支持

如果遇到问题：
1. 检查浏览器控制台错误信息
2. 查看服务器控制台输出
3. 确保所有步骤都正确执行

## 更新日志

- v1.0.0 - 初始版本发布
  - 支持Coze Web SDK代理
  - 自动CORS头处理
  - 多请求方法支持
  - Windows批处理支持