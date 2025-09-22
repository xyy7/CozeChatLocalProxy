# Coze Chat Web 本地代理和认证系统

一个为 Coze Chat Web 设计的本地代理服务器和 JWT 认证系统，支持多用户会话管理和 Tampermonkey 脚本集成。

## 🚀 功能特性

### 核心功能
- **CORS 代理服务器** - 解决跨域问题，端口 8080
- **JWT 认证服务器** - 提供 OAuth 认证和会话管理，端口 8081
- **多用户支持** - 支持多个用户同时使用不同的会话
- **Tampermonkey 集成** - 通过用户脚本自动注入认证信息

### Coze应用Pat鉴权

* 鉴权方式是针对用户账户整体的鉴权，而非针对具体的应用，具体的应用有自己对应的id

* 使用步骤：
  1. 工作流/智能体发布为coze chatsdk，下载script
  2. 申请pat授权密钥
  3. 创建本地代理服务器
  4. 根据发布的script，创建油猴脚本（token填入pat密钥）
  5. 启动代理服务器，油猴脚本

### Coze应用JWT授权

* 官方文档版本对应不上，有些使用方式有问题，**需要结合代码，自行搜索推理**
* 注意：JWT是服务类型的，而不是web类型的授权
* 使用步骤：
  1. 工作流/智能体发布为coze chatsdk，下载script
  2. 创建oauth应用，下载config文件
  3. 创建本地代理服务器
  4. 创建JWT鉴权代理服务器
     * 鉴权服务器添加多用户隔离的方式 
  5. 根据发布的script，创建油猴脚本（token让油猴脚本和JWT鉴权代理服务器拿）
     * 油猴插件中添加多用户隔离的方式【根据"初次使用时间+随机字符串"来识别一个用户】 
  6. 启动代理服务器，JWT鉴权代理服务器，油猴脚本

### 技术特性
- Flask + Flask-CORS 框架
- JWT (JSON Web Token) 认证
- OAuth 2.0 兼容流程
- 数据持久化存储 (GM_setValue/GM_getValue)
- 自动化测试和验证套件

## 📁 项目结构

```
.
├── JWTOauth/                 # JWT 认证服务器
│   ├── main.py              # 命令行版服务器文件
│   ├── web_main.py          # 网页版服务器文件
│   ├── coze_oauth_config.json # 配置文件
│   ├── assets/              # 静态资源目录（网页版使用）
│   │   └── coze.png         # Coze 图标
│   ├── websites/            # HTML 模板目录（网页版使用）
│   │   ├── index.html       # 主页模板
│   │   ├── callback.html    # 回调页面模板
│   │   └── error.html       # 错误页面模板
│   └── __init__.py
├── scripts/                 # 脚本目录
│   ├── start_proxy.py      # 启动代理服务器
│   ├── start_servers.py    # 启动所有服务器
│   └── check_ports.py      # 端口检查脚本
├── tests/                  # 测试目录
│   ├── test_jwt_auth.py    # JWT 认证测试
│   ├── test_jwt_config.py  # 配置验证测试
│   ├── test_multi_user.js  # 多用户测试
│   └── verify_user_id_support.py # 用户ID支持验证
├── docs/                   # 文档目录
│   ├── TESTING_GUIDE.md    # 测试指南
│   ├── MULTI_USER_TEST_GUIDE.md # 多用户测试指南
│   ├── README_JWT_AUTH.md  # JWT 认证文档
│   ├── CHANGELOG_JWT_AUTH.md # JWT 变更日志
│   └── CHANGELOG_MULTI_USER.md # 多用户变更日志
├── cors_proxy_server.py    # CORS 代理服务器主文件
├── requirements.txt        # Python 依赖
├── start_servers.py        # 服务器启动入口
└── README.md              # 本项目文档
```

## 🛠️ 安装和配置

### 前置要求
- Python 3.8+
- Tampermonkey 浏览器扩展
- 现代浏览器 (Chrome/Firefox/Edge)

### 安装步骤

1. **克隆或下载项目**
   ```bash
   git clone <repository-url>
   cd cozeChatWeb
   ```

2. **安装 Python 依赖**
   ```bash
   # 安装主项目依赖
   pip install -r requirements.txt

   # 安装 JWT 认证服务器依赖
   pip install -r JWTOauth/requirements.txt
   ```

3. **配置 JWT 认证**
   - 编辑 `JWTOauth/coze_oauth_config.json`
   - 设置您的 Coze API 密钥和其他配置
   - 确保配置文件包含正确的 `coze_www_base` 和 `coze_api_base` 地址

### 启动服务器

**方式一：启动所有服务器**
```bash
python start_servers.py
```

**方式二：分别启动**
```bash
# 启动 CORS 代理服务器 (端口 8080)
python scripts/start_proxy.py

# 启动 JWT 认证服务器 (端口 8081)
python JWTOauth/main.py

# 启动网页版 JWT 认证服务器 (端口 8081)
python JWTOauth/web_main.py
```

## 🚀 快速开始（网页版部署）

### 网页版快速部署步骤

1. **安装依赖**
   ```bash
   pip install -r requirements.txt
   pip install -r JWTOauth/requirements.txt
   ```

2. **配置认证信息**
   - 编辑 `JWTOauth/coze_oauth_config.json`
   - 填入您的 Coze OAuth 应用配置

3. **启动网页版服务器**
   ```bash
   cd JWTOauth
   python web_main.py
   ```

4. **访问网页界面**
   - 打开浏览器访问: http://127.0.0.1:8081
   - 查看认证状态和 token 信息

5. **集成到 Coze Chat**
   - 确保 CORS 代理服务器运行在端口 8080
   - 配置 Tampermonkey 脚本指向本地服务器

### 网页版功能演示

启动网页版服务器后，您可以：

- **查看主页**: 访问 http://127.0.0.1:8081 查看系统状态
- **测试认证**: 访问 http://127.0.0.1:8081/callback 获取 JWT token
- **错误调试**: 查看详细的错误信息和日志
- **多会话管理**: 通过 URL 参数管理不同用户会话

## 📖 使用指南

### 1. 安装 Tampermonkey 脚本
将 `coze-chat-tampermonkey-local-proxy.js` 安装到 Tampermonkey 中。

### 2. 配置用户脚本
脚本会自动检测本地服务器并注入认证信息。

### 3. 访问 Coze Chat Web
打开 Coze Chat Web 页面，脚本会自动处理认证。

## 🌐 网页部署启动方式

### 网页版 JWT 认证服务器 (web_main.py)

`JWTOauth/web_main.py` 是一个专门为网页部署设计的 JWT 认证服务器，提供以下特性：

#### 功能特点
- **Web 界面支持** - 提供完整的网页界面，支持浏览器直接访问
- **静态资源服务** - 内置静态文件服务，支持 CSS、图片等资源
- **CORS 支持** - 完整支持跨域请求，便于前端集成
- **错误处理** - 完善的错误处理和用户友好的错误页面
- **会话管理** - 支持多用户会话隔离

#### 启动方式
```bash
# 进入 JWT 认证目录
cd JWTOauth

# 启动网页版认证服务器
python web_main.py
```

#### 访问地址
- **主页**: http://127.0.0.1:8081
- **认证回调**: http://127.0.0.1:8081/callback
- **登录页面**: http://127.0.0.1:8081/login

#### 网页界面功能
1. **主页展示** - 显示 Coze 演示页面或配置信息
2. **认证流程** - 提供完整的 OAuth 认证流程界面
3. **Token 管理** - 显示生成的 JWT token 信息
4. **错误处理** - 友好的错误提示页面

#### 与命令行版本的区别
| 特性 | web_main.py (网页版) | main.py (命令行版) |
|------|---------------------|-------------------|
| 界面 | 完整的 Web 界面 | 纯命令行输出 |
| 静态资源 | 支持静态文件服务 | 无静态资源支持 |
| 错误显示 | 用户友好的错误页面 | 控制台错误信息 |
| 访问方式 | 浏览器直接访问 | 主要通过 API 调用 |

#### 使用场景
- **开发调试** - 便于查看认证流程和调试问题
- **演示展示** - 适合向他人展示认证流程
- **前端集成** - 便于前端开发人员测试集成
- **多用户管理** - 通过网页界面管理不同会话

## 🧪 测试和验证

### 运行测试套件

```bash
# 测试 JWT 配置
python tests/test_jwt_config.py

# 测试 JWT 认证
python tests/test_jwt_auth.py

# 测试多用户支持
node tests/test_multi_user.js
```

### 验证功能
- 使用 `check_ports.py` 检查服务器状态
- 使用 `verify_user_id_support.py` 验证用户ID支持

## 🔧 故障排除

### 常见问题

1. **端口冲突**
   - 检查 8080 和 8081 端口是否被占用
   - 使用 `check_ports.py` 诊断问题

2. **认证失败**
   - 验证 JWT 服务器是否正常运行
   - 检查配置文件是否正确

3. **跨域问题**
   - 确保 CORS 代理服务器正在运行

### 网页部署特殊配置

#### 静态资源配置
网页版服务器 (`web_main.py`) 需要以下静态资源：
- `JWTOauth/assets/` - 图片和样式文件目录
- `JWTOauth/websites/` - HTML 模板文件目录

确保这些目录存在且包含必要的文件。

#### 端口配置
- **默认端口**: 8081
- **如需修改端口**: 编辑 `web_main.py` 文件末尾的 `port` 参数

#### 跨域配置
网页版已配置 CORS 支持，允许来自以下域的请求：
- https://www.coze.cn
- https://coze.cn

### 调试模式
在 Tampermonkey 脚本中启用调试模式查看详细日志。

### 网页部署故障排除

#### 常见网页部署问题

1. **静态资源加载失败**
   - 检查 `JWTOauth/assets/` 和 `JWTOauth/websites/` 目录是否存在
   - 验证文件权限和路径配置

2. **CORS 错误**
   - 确认 `web_main.py` 中的 CORS 配置正确
   - 检查浏览器控制台的具体错误信息

3. **模板渲染错误**
   - 验证 HTML 模板文件语法正确
   - 检查模板变量替换逻辑

4. **端口占用**
   - 使用 `check_ports.py` 检查端口状态
   - 修改 `web_main.py` 中的端口号

#### 日志查看
网页版服务器会在控制台输出详细日志，包括：
- 配置文件加载状态
- 认证流程进度
- 错误和异常信息

## ⚠️ 重要注意事项

### JWT 配置更新
- **JWT 服务器配置**: 如果重新下载项目，需要更新 `JWTOauth\coze_oauth_config.json` 文件
- **配置同步**: 确保配置文件中的 API 密钥和认证信息与您的 Coze 应用配置一致

### 智能体替换
- **替换智能体**: 如果需要更换智能体，需要修改油猴脚本或者html中的 JS 脚本里的配置
- **配置更新**: 更新脚本中的智能体 ID、API 端点等相关配置参数

### 聊天框属性方法
Coze Chat SDK 提供了丰富的聊天框控制方法，包括：

#### 显示/隐藏控制
- `showChatBot()` - 显示聊天框
- `hideChatBot()` - 隐藏聊天框
- `isNeed` - 检查是否需要显示悬浮球

#### 尺寸和属性
- `chatBot.width` - 获取或设置聊天框宽度
- `chatBot.height` - 获取或设置聊天框高度
- `chatBot.el` - 获取聊天框 DOM 元素

#### 详细文档
更多属性和方法请参考 [Coze Chat SDK 官方文档](https://www.coze.cn/docs/chat_sdk)

### 配置同步提醒
- **多环境配置**: 确保开发、测试、生产环境的配置保持一致
- **版本控制**: 配置文件不应提交到版本控制系统，建议使用环境变量或配置文件模板
- **备份重要配置**: 定期备份您的认证配置和智能体设置

## 📝 开发文档

- [测试指南](./docs/TESTING_GUIDE.md)
- [多用户测试指南](./docs/MULTI_USER_TEST_GUIDE.md)
- [JWT 认证文档](./docs/README_JWT_AUTH.md)

## 🗂️ 文件说明

### 主要文件
- `cors_proxy_server.py` - CORS 代理服务器实现
- `JWTOauth/main.py` - JWT 认证服务器主文件
- `JWTOauth/web_main.py` - 网页版 JWT 认证服务器
- `start_servers.py` - 统一启动脚本

### 脚本文件
- `scripts/start_proxy.py` - 代理服务器启动脚本
- `scripts/check_ports.py` - 端口检查工具
- `coze-chat-tampermonkey-local-proxy.js` - 用户脚本

### 测试文件
- `tests/` - 所有测试和验证脚本
- `verify_*.py` - 功能验证脚本

## 🔄 更新日志

详细变更记录请查看：
- [JWT 认证变更日志](./docs/CHANGELOG_JWT_AUTH.md)
- [多用户功能变更日志](./docs/CHANGELOG_MULTI_USER.md)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如有问题，请提交 Issue 或查看相关文档。