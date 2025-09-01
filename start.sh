#!/bin/bash

# CORS 代理服务器启动脚本 (Linux/macOS)

echo
echo "========================================"
echo "   CORS Proxy Server Startup Script"
echo "========================================"
echo

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found, please install Python 3.7+"
    exit 1
fi

# 检查依赖是否安装
if ! python3 -c "import aiohttp" 2>/dev/null; then
    echo "⚠️  Dependencies not installed, installing automatically..."
    pip3 install aiohttp certifi
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
fi

echo
echo "🚀 Starting CORS Proxy Server..."
echo "📍 Local address: http://127.0.0.1:8080"
echo "📍 Press Ctrl+C to stop server"
echo

# 启动代理服务器
python3 start_proxy.py

if [ $? -ne 0 ]; then
    echo
    echo "❌ Server startup failed"
    echo "💡 Try running: python3 cors_proxy_server.py"
    exit 1
fi