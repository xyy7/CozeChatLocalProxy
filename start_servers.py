#!/usr/bin/env python3
"""
启动脚本 - 同时启动CORS代理服务器和JWTOauth服务器
"""

import asyncio
import subprocess
import sys
import os

async def start_cors_proxy():
    """启动CORS代理服务器"""
    print("🚀 启动CORS代理服务器 (端口: 8080)...")
    cors_process = subprocess.Popen([
        sys.executable, "cors_proxy_server.py",
        "--host", "127.0.0.1",
        "--port", "8080"
    ], cwd=os.getcwd())
    return cors_process

async def start_jwt_oauth():
    """启动JWTOauth服务器"""
    print("🔐 启动JWTOauth服务器 (端口: 8081)...")
    jwt_process = subprocess.Popen([
        sys.executable, "JWTOauth/main.py"
    ], cwd=os.getcwd())
    return jwt_process

async def main():
    """主函数"""
    print("=" * 50)
    print("🌟 Coze JWT认证系统启动器")
    print("=" * 50)
    
    try:
        # 启动两个服务器
        cors_process = await start_cors_proxy()
        jwt_process = await start_jwt_oauth()
        
        print("\n✅ 服务器启动完成!")
        print("📊 服务状态:")
        print(f"   • CORS代理服务器: http://127.0.0.1:8080")
        print(f"   • JWT OAuth服务器: http://127.0.0.1:8081")
        print(f"   • JWT回调地址: http://127.0.0.1:8081/callback")
        print("\n🛑 按 Ctrl+C 停止所有服务器")
        
        # 等待用户中断
        await asyncio.Future()
        
    except KeyboardInterrupt:
        print("\n🛑 正在停止服务器...")
        cors_process.terminate()
        jwt_process.terminate()
        cors_process.wait()
        jwt_process.wait()
        print("✅ 所有服务器已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        if 'cors_process' in locals():
            cors_process.terminate()
        if 'jwt_process' in locals():
            jwt_process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 再见!")