#!/usr/bin/env python3
"""
JWT认证测试脚本 - 验证JWT服务器功能
使用标准库，避免第三方依赖
"""

import urllib.request
import urllib.error
import json
import sys

def test_jwt_server():
    """测试JWT服务器功能"""
    print("🧪 测试JWT认证服务器...")
    
    try:
        # 测试JWT服务器健康状态
        with urllib.request.urlopen('http://127.0.0.1:8081/', timeout=5) as response:
            if response.status == 200:
                print("✅ JWT服务器主页访问正常")
            else:
                print(f"❌ JWT服务器主页返回状态码: {response.status}")
                return False
                
        # 测试获取JWT token
        print("\n🔐 测试获取JWT token...")
        req = urllib.request.Request('http://127.0.0.1:8081/callback')
        req.add_header('X-Requested-With', 'XMLHttpRequest')  # 模拟AJAX请求
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                content = response.read().decode('utf-8')
                content_type = response.headers.get('Content-Type', '')
                
                if 'application/json' in content_type:
                    # JSON响应
                    try:
                        token_data = json.loads(content)
                        if 'access_token' in token_data:
                            print("✅ JWT token获取成功!")
                            print(f"   • Token类型: {token_data.get('token_type', 'N/A')}")
                            print(f"   • Access Token: {token_data['access_token'][:50]}...")
                            print(f"   • 过期时间: {token_data.get('expires_in', 'N/A')}")
                            return True
                        else:
                            print("❌ 响应中缺少access_token字段")
                            print(f"响应内容: {json.dumps(token_data, indent=2)}")
                            return False
                    except json.JSONDecodeError:
                        print("❌ JSON解析失败")
                        print(f"响应内容: {content[:200]}...")
                        return False
                else:
                    # HTML响应
                    print("✅ JWT服务器回调页面正常")
                    print("ℹ️  返回HTML页面（非AJAX请求）")
                    return True
                    
            else:
                print(f"❌ JWT token获取失败，状态码: {response.status}")
                return False
                
    except urllib.error.URLError as e:
        if isinstance(e.reason, ConnectionRefusedError):
            print("❌ 无法连接到JWT服务器，请确保服务器正在运行")
            print("   运行命令: python JWTOauth/main.py")
        else:
            print(f"❌ 网络错误: {e}")
        return False
    except TimeoutError:
        print("❌ JWT服务器响应超时")
        return False
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {e}")
        return False

def test_cors_proxy():
    """测试CORS代理服务器功能"""
    print("\n🌐 测试CORS代理服务器...")
    
    try:
        with urllib.request.urlopen('http://127.0.0.1:8080/', timeout=5) as response:
            if response.status == 200:
                content = response.read().decode('utf-8')
                try:
                    data = json.loads(content)
                    if data.get('service') == 'CORS Proxy Server':
                        print("✅ CORS代理服务器运行正常")
                        return True
                    else:
                        print("❌ CORS代理服务器响应格式异常")
                        return False
                except json.JSONDecodeError:
                    print("❌ CORS代理服务器返回非JSON响应")
                    return False
            else:
                print(f"❌ CORS代理服务器返回状态码: {response.status}")
                return False
                
    except urllib.error.URLError as e:
        if isinstance(e.reason, ConnectionRefusedError):
            print("❌ 无法连接到CORS代理服务器，请确保服务器正在运行")
            print("   运行命令: python cors_proxy_server.py --host 127.0.0.1 --port 8080")
        else:
            print(f"❌ 网络错误: {e}")
        return False
    except Exception as e:
        print(f"❌ CORS代理测试错误: {e}")
        return False

def main():
    """主测试函数"""
    print("=" * 50)
    print("🔍 Coze JWT认证系统测试")
    print("=" * 50)
    
    jwt_success = test_jwt_server()
    cors_success = test_cors_proxy()
    
    print("\n" + "=" * 50)
    print("📊 测试结果汇总")
    print("=" * 50)
    
    if jwt_success and cors_success:
        print("🎉 所有测试通过！系统准备就绪")
        print("\n下一步:")
        print("1. 确保Tampermonkey脚本已安装")
        print("2. 访问 https://www.coze.cn")
        print("3. 检查浏览器控制台是否有JWT认证成功日志")
    else:
        print("❌ 部分测试失败，请检查服务器状态和配置")
        sys.exit(1)

if __name__ == "__main__":
    main()