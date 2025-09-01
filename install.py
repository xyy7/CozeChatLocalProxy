#!/usr/bin/env python3
"""
CORS 代理服务器安装脚本
自动安装依赖并创建默认配置
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path

def check_python_version():
    """检查 Python 版本"""
    if sys.version_info < (3, 7):
        print("❌ 需要 Python 3.7 或更高版本")
        return False
    print(f"✅ Python 版本: {sys.version}")
    return True

def install_dependencies():
    """安装必要的依赖包"""
    dependencies = ["aiohttp", "certifi"]
    
    print("正在安装依赖包...")
    try:
        # 使用 pip 安装依赖
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + dependencies)
        print("✅ 依赖包安装成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 依赖包安装失败: {e}")
        return False

def create_default_config():
    """创建默认配置文件"""
    config = {
        "server": {
            "host": "127.0.0.1",
            "port": 8080,
            "debug": False,
            "max_connections": 100,
            "timeout": 30,
            "keep_alive": True
        },
        "security": {
            "allowed_domains": [
                "lf-cdn.coze.cn",
                "*.coze.cn",
                "coze.com",
                "*.coze.com"
            ],
            "max_request_size": "10MB",
            "enable_cors": True,
            "cors_origins": ["*"]
        },
        "logging": {
            "level": "INFO",
            "file": "cors_proxy.log",
            "max_size": "10MB",
            "backup_count": 5
        },
        "performance": {
            "connection_pool_size": 20,
            "ssl_verify": True,
            "compress_response": True
        }
    }
    
    config_file = "config.json"
    if not os.path.exists(config_file):
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print("✅ 默认配置文件创建成功")
    else:
        print("ℹ️  配置文件已存在，跳过创建")

def create_example_scripts():
    """创建示例使用脚本"""
    examples_dir = "examples"
    os.makedirs(examples_dir, exist_ok=True)
    
    # 创建 HTML 测试页面
    html_content = '''<!DOCTYPE html>
<html>
<head>
    <title>CORS 代理测试页面</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>CORS 代理测试页面</h1>
    <p>打开浏览器控制台查看加载结果</p>
    
    <script>
        // 测试本地代理
        const proxyUrl = 'http://127.0.0.1:8080';
        const targetUrl = 'https://lf-cdn.coze.cn/sdk.js';
        
        console.log('测试 CORS 代理...');
        
        // 方法1: 路径方式
        fetch(proxyUrl + '/' + targetUrl)
            .then(response => response.text())
            .then(data => {
                console.log('✅ 路径方式成功:', data.length, '字符');
            })
            .catch(error => {
                console.error('❌ 路径方式失败:', error);
            });
        
        // 方法2: 查询参数方式  
        fetch(proxyUrl + '/?url=' + encodeURIComponent(targetUrl))
            .then(response => response.text())
            .then(data => {
                console.log('✅ 查询参数方式成功:', data.length, '字符');
            })
            .catch(error => {
                console.error('❌ 查询参数方式失败:', error);
            });
    </script>
</body>
</html>'''
    
    with open(os.path.join(examples_dir, "test_page.html"), "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print("✅ 示例文件创建成功")

def show_usage():
    """显示使用说明"""
    print("\n" + "="*60)
    print("CORS 代理服务器安装完成")
    print("="*60)
    print("\n使用方法:")
    print("1. 启动代理服务器:")
    print("   python start_proxy.py")
    print("   python cors_proxy_server.py")
    print()
    print("2. 测试代理功能:")
    print("   python test_proxy.py")
    print()
    print("3. 打开测试页面:")
    print("   examples/test_page.html")
    print()
    print("4. 配置说明:")
    print("   编辑 config.json 文件来自定义设置")
    print()
    print("5. Tampermonkey 脚本:")
    print("   安装 coze-chat-tampermonkey-local-proxy.js")
    print("\n" + "="*60)

def main():
    """主安装函数"""
    print("🚀 CORS 代理服务器安装程序")
    print("="*40)
    
    # 检查 Python 版本
    if not check_python_version():
        return
    
    # 安装依赖
    if not install_dependencies():
        return
    
    # 创建配置文件
    create_default_config()
    
    # 创建示例文件
    create_example_scripts()
    
    # 显示使用说明
    show_usage()
    
    print("✅ 安装完成！")

if __name__ == "__main__":
    main()