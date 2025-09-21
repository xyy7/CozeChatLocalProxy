#!/usr/bin/env python3
"""
端口配置检查脚本 - 验证所有服务的端口配置是否正确
"""

import re

def check_jwt_oauth_port():
    """检查JWTOauth服务器端口配置"""
    print("[检查] JWTOauth服务器端口配置...")
    
    try:
        with open('JWTOauth/main.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查REDIRECT_URI
        redirect_match = re.search(r'REDIRECT_URI\s*=\s*["\']([^"\']+)["\']', content)
        if redirect_match:
            redirect_uri = redirect_match.group(1)
            if ':8081/callback' in redirect_uri:
                print("[成功] REDIRECT_URI配置正确: " + redirect_uri)
            else:
                print("[错误] REDIRECT_URI配置错误: " + redirect_uri)
                return False
        
        # 检查端口配置
        port_match = re.search(r'port=(\d+)', content)
        if port_match:
            port = port_match.group(1)
            if port == '8081':
                print("[成功] 服务器端口配置正确: " + port)
            else:
                print("[错误] 服务器端口配置错误: " + port)
                return False
        
        return True
        
    except FileNotFoundError:
        print("[错误] JWTOauth/main.py 文件不存在")
        return False
    except Exception as e:
        print(f"[错误] 检查JWTOauth配置时出错: {e}")
        return False

def check_tampermonkey_config():
    """检查Tampermonkey脚本配置"""
    print("\n[检查] Tampermonkey脚本配置...")
    
    try:
        with open('coze-chat-tampermonkey-local-proxy.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查JWT服务器配置
        jwt_match = re.search(r"JWT_AUTH_SERVER:\s*['\"]([^'\"]+)['\"]", content)
        if jwt_match:
            jwt_server = jwt_match.group(1)
            if ':8081/callback' in jwt_server:
                print("[成功] JWT服务器配置正确: " + jwt_server)
            else:
                print("[错误] JWT服务器配置错误: " + jwt_server)
                return False
        
        return True
        
    except FileNotFoundError:
        print("[错误] coze-chat-tampermonkey-local-proxy.js 文件不存在")
        return False
    except Exception as e:
        print(f"[错误] 检查Tampermonkey配置时出错: {e}")
        return False

def check_cors_proxy_port():
    """检查CORS代理服务器端口配置"""
    print("\n[检查] CORS代理服务器端口配置...")
    
    try:
        with open('cors_proxy_server.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查默认端口配置
        port_match = re.search(r'port:\s*int\s*=\s*(\d+)', content)
        if port_match:
            port = port_match.group(1)
            if port == '8080':
                print("[成功] CORS代理默认端口配置正确: " + port)
            else:
                print("[错误] CORS代理默认端口配置错误: " + port)
                return False
        
        # 检查命令行参数默认值
        arg_match = re.search(r'default=(\d+)', content)
        if arg_match:
            port = arg_match.group(1)
            if port == '8080':
                print("[成功] CORS代理命令行默认端口正确: " + port)
            else:
                print("[错误] CORS代理命令行默认端口错误: " + port)
                return False
        
        return True
        
    except FileNotFoundError:
        print("[错误] cors_proxy_server.py 文件不存在")
        return False
    except Exception as e:
        print(f"[错误] 检查CORS代理配置时出错: {e}")
        return False

def main():
    """主函数"""
    print("=" * 50)
    print("端口配置检查")
    print("=" * 50)
    
    jwt_ok = check_jwt_oauth_port()
    tm_ok = check_tampermonkey_config()
    cors_ok = check_cors_proxy_port()
    
    print("\n" + "=" * 50)
    print("检查结果汇总")
    print("=" * 50)
    
    if jwt_ok and tm_ok and cors_ok:
        print("[成功] 所有端口配置正确！")
        print("\n端口分配:")
        print("  • CORS代理服务器: 8080")
        print("  • JWT OAuth服务器: 8081")
        print("  • JWT回调地址: http://127.0.0.1:8081/callback")
    else:
        print("[错误] 发现配置错误，请检查上述错误信息")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())