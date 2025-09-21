#!/usr/bin/env python3
"""
JWT配置验证脚本 - 直接测试JWT认证配置
包含详细的错误检测和诊断功能
"""

import json
import sys
import os
import requests
import ssl
import socket
from datetime import datetime
from urllib.parse import urlparse
try:
    from cozepy import JWTOAuthApp
except ImportError as e:
    print(f"❌ 导入cozepy失败: {e}")
    print("请确保已安装: pip install cozepy")
    sys.exit(1)

def check_network_connectivity(hostname):
    """检查网络连接性"""
    print(f"🌐 检查网络连接到 {hostname}...")
    
    try:
        # 解析域名
        parsed_url = urlparse(hostname)
        domain = parsed_url.netloc or parsed_url.path
        
        # 检查DNS解析
        ip_address = socket.gethostbyname(domain)
        print(f"✅ DNS解析成功: {domain} -> {ip_address}")
        
        # 检查端口连通性 (HTTPS端口443)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((domain, 443))
        sock.close()
        
        if result == 0:
            print("✅ 端口443 (HTTPS) 连通性正常")
            return True
        else:
            print(f"❌ 端口443连接失败 (错误代码: {result})")
            return False
            
    except socket.gaierror:
        print(f"❌ DNS解析失败: 无法解析 {domain}")
        return False
    except socket.timeout:
        print("❌ 连接超时")
        return False
    except Exception as e:
        print(f"❌ 网络检查失败: {e}")
        return False

def validate_config_structure(config):
    """验证配置结构"""
    print("📋 验证配置结构...")
    
    required_fields = ["client_id", "private_key", "public_key_id", "coze_api_base"]
    missing_fields = []
    empty_fields = []
    
    for field in required_fields:
        if field not in config:
            missing_fields.append(field)
        elif not config[field]:
            empty_fields.append(field)
    
    if missing_fields:
        print(f"❌ 缺少必要字段: {', '.join(missing_fields)}")
        return False
    
    if empty_fields:
        print(f"❌ 字段值为空: {', '.join(empty_fields)}")
        return False
    
    print("✅ 所有必要字段都存在且非空")
    return True

def validate_private_key_format(private_key):
    """验证私钥格式"""
    print("🔐 验证私钥格式...")
    
    if not private_key.startswith("-----BEGIN PRIVATE KEY-----"):
        print("❌ 私钥格式不正确，应该以 '-----BEGIN PRIVATE KEY-----' 开头")
        return False
    
    if not private_key.endswith("-----END PRIVATE KEY-----"):
        print("❌ 私钥格式不正确，应该以 '-----END PRIVATE KEY-----' 结尾")
        return False
    
    # 检查私钥内容长度（RSA私钥通常有一定长度）
    key_content = private_key.strip()
    lines = key_content.split('\n')
    if len(lines) < 10:  # 典型的RSA私钥有多行
        print("❌ 私钥内容过短，可能不完整")
        return False
    
    print("✅ 私钥格式正确")
    return True

def test_jwt_config():
    """测试JWT配置是否正确"""
    print("🔍 开始JWT配置验证...")
    print("-" * 60)
    
    # 加载配置文件
    config_path = "../JWTOauth/coze_oauth_config.json"
    try:
        with open(config_path, "r", encoding='utf-8') as f:
            config = json.load(f)
        print("✅ 配置文件加载成功")
    except FileNotFoundError:
        print(f"❌ 配置文件不存在: {config_path}")
        print("请确保文件路径正确")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ 配置文件格式错误: {e}")
        print("请检查JSON格式是否正确")
        return False
    except Exception as e:
        print(f"❌ 读取配置文件失败: {e}")
        return False
    
    # 验证配置结构
    if not validate_config_structure(config):
        return False
    
    # 验证私钥格式
    if not validate_private_key_format(config["private_key"]):
        return False
    
    # 检查网络连接
    coze_api_base = config["coze_api_base"]
    if not check_network_connectivity(coze_api_base):
        print("⚠️  网络连接问题可能影响认证")
    
    # 尝试初始化JWTOAuthApp
    print("🔄 初始化JWTOAuthApp...")
    try:
        oauth_app = JWTOAuthApp(
            client_id=config["client_id"],
            private_key=config["private_key"],
            public_key_id=config["public_key_id"],
            base_url=config["coze_api_base"]
        )
        print("✅ JWTOAuthApp初始化成功")
    except Exception as e:
        print(f"❌ JWTOAuthApp初始化失败: {e}")
        print("\n💡 可能的原因:")
        print("1. 私钥格式不正确")
        print("2. 公钥ID格式错误")
        print("3. cozepy库版本不兼容")
        print("4. Python环境问题")
        return False
    
    # 尝试获取access token
    print("🔑 尝试获取access token...")
    try:
        start_time = datetime.now()
        token = oauth_app.get_access_token(ttl=300)  # 5分钟短时间测试
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("🎉 JWT认证成功！")
        print(f"   • Token类型: {token.token_type}")
        print(f"   • Access Token: {token.access_token[:50]}...")
        print(f"   • 过期时间: {token.expires_in}秒")
        print(f"   • 请求耗时: {duration:.2f}秒")
        
        # 验证token格式
        if len(token.access_token.split('.')) == 3:
            print("✅ Token格式正确 (JWT三段式结构)")
        else:
            print("⚠️  Token格式异常")
            
        return True
        
    except Exception as e:
        print(f"❌ JWT认证失败: {e}")
        print(f"❌ 错误类型: {type(e).__name__}")
        
        # 提供详细的错误诊断
        error_msg = str(e).lower()
        if "connection" in error_msg or "network" in error_msg:
            print("\n🔧 诊断: 网络连接问题")
            print("   1. 检查网络连接")
            print("   2. 验证api.coze.cn可访问")
            print("   3. 检查防火墙设置")
            
        elif "key" in error_msg or "signature" in error_msg:
            print("\n🔧 诊断: 密钥相关问题")
            print("   1. 检查私钥格式是否正确")
            print("   2. 验证公钥ID是否匹配")
            print("   3. 确认密钥对生成正确")
            
        elif "client" in error_msg or "id" in error_msg:
            print("\n🔧 诊断: 客户端配置问题")
            print("   1. 检查client_id是否正确")
            print("   2. 验证应用配置")
            
        elif "timeout" in error_msg:
            print("\n🔧 诊断: 请求超时")
            print("   1. 网络连接不稳定")
            print("   2. Coze API服务响应慢")
            
        else:
            print("\n🔧 诊断: 未知错误类型")
            print("   请检查完整的错误信息")
            
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("🔍 Coze JWT配置详细验证工具")
    print("=" * 60)
    print(f"运行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    success = test_jwt_config()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ 配置验证通过！")
        print("\n🎯 下一步操作:")
        print("1. 启动JWT认证服务器: python JWTOauth/main.py")
        print("2. 启动CORS代理服务器: python cors_proxy_server.py --host 127.0.0.1 --port 8080")
        print("3. 安装Tampermonkey脚本")
        print("4. 访问 https://www.coze.cn 测试功能")
    else:
        print("❌ 配置验证失败")
        print("\n🔧 故障排除步骤:")
        print("1. 检查 JWTOauth/coze_oauth_config.json 文件内容")
        print("2. 验证私钥和公钥ID是否正确匹配")
        print("3. 确认网络连接正常，可以访问 api.coze.cn")
        print("4. 检查 cozepy 库版本: pip show cozepy")
        print("5. 查看详细的错误信息进行诊断")
        sys.exit(1)

if __name__ == "__main__":
    main()