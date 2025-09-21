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
│   ├── main.py              # 主服务器文件
│   ├── coze_oauth_config.json # 配置文件
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
   pip install -r requirements.txt
   ```

3. **配置 JWT 认证**
   - 编辑 `JWTOauth/coze_oauth_config.json`
   - 设置您的 Coze API 密钥和其他配置

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
```

## 📖 使用指南

### 1. 安装 Tampermonkey 脚本
将 `coze-chat-tampermonkey-local-proxy.js` 安装到 Tampermonkey 中。

### 2. 配置用户脚本
脚本会自动检测本地服务器并注入认证信息。

### 3. 访问 Coze Chat Web
打开 Coze Chat Web 页面，脚本会自动处理认证。

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

### 调试模式
在 Tampermonkey 脚本中启用调试模式查看详细日志。

## 📝 开发文档

- [测试指南](./docs/TESTING_GUIDE.md)
- [多用户测试指南](./docs/MULTI_USER_TEST_GUIDE.md)
- [JWT 认证文档](./docs/README_JWT_AUTH.md)

## 🗂️ 文件说明

### 主要文件
- `cors_proxy_server.py` - CORS 代理服务器实现
- `JWTOauth/main.py` - JWT 认证服务器主文件
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