#!/usr/bin/env python3
"""
CORS 代理服务器测试脚本
用于验证代理服务器是否正常工作
"""

import asyncio
import aiohttp
import sys
import json
from urllib.parse import quote

async def test_proxy(proxy_url, target_url):
    """测试代理服务器功能"""
    try:
        async with aiohttp.ClientSession() as session:
            # 测试路径方式
            path_proxy_url = f"{proxy_url}/{target_url}"
            print(f"测试路径方式: {path_proxy_url}")
            
            async with session.get(path_proxy_url) as response:
                content = await response.text()
                print(f"状态码: {response.status}")
                print(f"内容长度: {len(content)} 字符")
                print(f"CORS 头信息:")
                for header in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']:
                    if header in response.headers:
                        print(f"  {header}: {response.headers[header]}")
                print()
            
            # 测试查询参数方式
            query_proxy_url = f"{proxy_url}/?url={quote(target_url)}"
            print(f"测试查询参数方式: {query_proxy_url}")
            
            async with session.get(query_proxy_url) as response:
                content = await response.text()
                print(f"状态码: {response.status}")
                print(f"内容长度: {len(content)} 字符")
                print()
            
            return True
            
    except Exception as e:
        print(f"测试失败: {e}")
        return False

async def test_server_info(proxy_url):
    """测试服务器信息接口"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(proxy_url) as response:
                if response.status == 200:
                    info = await response.json()
                    print("服务器信息:")
                    print(json.dumps(info, indent=2, ensure_ascii=False))
                    return True
                else:
                    print(f"获取服务器信息失败: {response.status}")
                    return False
    except Exception as e:
        print(f"获取服务器信息失败: {e}")
        return False

async def main():
    """主测试函数"""
    proxy_base = "http://127.0.0.1:8080"
    test_urls = [
        "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js",
        "https://lf-cdn.coze.cn/sdk.js"
    ]
    
    print("=" * 60)
    print("CORS 代理服务器测试")
    print("=" * 60)
    
    # 首先测试服务器信息
    print("1. 测试服务器信息接口...")
    if not await test_server_info(proxy_base):
        print("⚠️  服务器可能未启动，请先运行: python start_proxy.py")
        return
    
    print("\n2. 测试代理功能...")
    all_passed = True
    
    for test_url in test_urls:
        print(f"\n测试目标: {test_url}")
        if not await test_proxy(proxy_base, test_url):
            all_passed = False
    
    print("\n3. 测试结果汇总:")
    if all_passed:
        print("✅ 所有测试通过！代理服务器工作正常")
    else:
        print("❌ 部分测试失败，请检查代理服务器配置")
    
    print("\n4. 使用说明:")
    print(f"   本地代理地址: {proxy_base}")
    print(f"   示例用法: {proxy_base}/https://lf-cdn.coze.cn/sdk.js")
    print(f"   或: {proxy_base}/?url=https://lf-cdn.coze.cn/sdk.js")

if __name__ == "__main__":
    # 检查是否提供了自定义代理地址
    if len(sys.argv) > 1:
        proxy_url = sys.argv[1]
        asyncio.run(main())
    else:
        asyncio.run(main())