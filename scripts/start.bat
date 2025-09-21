@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    CORS 代理服务器启动脚本
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Python，请先安装 Python 3.7+
    pause
    exit /b 1
)

REM 检查依赖是否安装
python -c "import aiohttp" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  依赖包未安装，正在自动安装...
    pip install aiohttp certifi
    if errorlevel 1 (
        echo ❌ 依赖包安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖包安装成功
)

echo.
echo 🚀 启动 CORS 代理服务器...
echo 📍 本地地址: http://127.0.0.1:8080
echo 📍 按 Ctrl+C 停止服务器
echo.

REM 启动代理服务器
python start_proxy.py

if errorlevel 1 (
    echo.
    echo ❌ 服务器启动失败
    echo 💡 尝试直接运行: python cors_proxy_server.py
    pause
    exit /b 1
)