#!/usr/bin/env python3
"""
验证JWT服务器会话名称支持脚本
用于测试服务器是否正确处理不同会话名称并生成不同的token
"""

import requests
import json
import sys
from urllib.parse import urlencode

def test_session_name_support():
    """测试JWT服务器对会话名称的支持"""
    base_url = "http://127.0.0.1:8081/callback"
    
    print("🔍 开始测试JWT服务器会话名称支持...")
    print("=" * 50)
    
    # 测试用例：不同的会话名称
    test_sessions = [
        "session_12345",
        "session_67890",
        "session_abcde",
        "session_fghij"
    ]
    
    tokens = {}
    results = []
    
    for session_name in test_sessions:
        try:
            print(f"\n💬 测试会话: {session_name}")
            
            # 方法1: 通过查询参数传递会话名称
            params = {'session_name': session_name}
            url_with_params = f"{base_url}?{urlencode(params)}"
            
            # 方法2: 通过请求头传递会话名称
            headers = {
                'X-Session-Name': session_name,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            print(f"🌐 请求URL: {url_with_params}")
            print(f"📋 请求头: X-Session-Name: {session_name}")
            
            # 发送请求
            response = requests.get(url_with_params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                access_token = data.get('access_token')
                
                if access_token:
                    tokens[session_name] = access_token
                    print(f"✅ 成功获取token: {access_token[:30]}...")
                    results.append({
                        'session_name': session_name,
                        'status': 'success',
                        'token_length': len(access_token),
                        'token_prefix': access_token[:20]
                    })
                else:
                    print(f"❌ 响应中缺少access_token")
                    results.append({
                        'session_name': session_name,
                        'status': 'error',
                        'message': 'Missing access_token in response'
                    })
            else:
                print(f"❌ 请求失败: HTTP {response.status_code}")
                print(f"响应内容: {response.text}")
                results.append({
                    'session_name': session_name,
                    'status': 'error',
                    'http_status': response.status_code,
                    'message': response.text[:100]
                })
                
        except requests.exceptions.ConnectionError:
            print(f"❌ 连接失败: 请确保JWT服务器正在运行在127.0.0.1:8081")
            return False
        except requests.exceptions.Timeout:
            print(f"❌ 请求超时")
            results.append({
                'session_name': session_name,
                'status': 'error',
                'message': 'Request timeout'
            })
        except Exception as e:
            print(f"❌ 发生异常: {str(e)}")
            results.append({
                'session_name': session_name,
                'status': 'error',
                'message': str(e)
            })
    
    # 分析结果
    print("\n" + "=" * 50)
    print("📊 测试结果分析")
    print("=" * 50)
    
    success_count = sum(1 for r in results if r['status'] == 'success')
    error_count = sum(1 for r in results if r['status'] == 'error')
    
    print(f"✅ 成功: {success_count}")
    print(f"❌ 失败: {error_count}")
    
    if success_count > 0:
        # 检查token唯一性
        unique_tokens = set(tokens.values())
        print(f"🔑 生成的唯一token数量: {len(unique_tokens)} / {success_count}")
        
        if len(unique_tokens) == success_count:
            print("🎉 所有用户都获得了不同的token!")
        else:
            print("⚠️  发现重复的token，会话名称可能没有被正确处理")
            
            # 找出重复的token
            token_sessions = {}
            for session_name, token in tokens.items():
                if token in token_sessions:
                    token_sessions[token].append(session_name)
                else:
                    token_sessions[token] = [session_name]
            
            for token, sessions in token_sessions.items():
                if len(sessions) > 1:
                    print(f"  重复token {token[:20]}... 被会话: {', '.join(sessions)}")
    
    # 显示详细结果
    print("\n📋 详细结果:")
    for result in results:
        status_icon = "✅" if result['status'] == 'success' else "❌"
        print(f"  {status_icon} {result['session_name']}: {result['status']}")
        if result['status'] == 'success':
            print(f"     Token长度: {result['token_length']}, 前缀: {result['token_prefix']}...")
    
    return success_count > 0 and len(set(tokens.values())) == success_count

def test_single_session_multiple_requests():
    """测试同一会话多次请求是否获得相同token"""
    print("\n" + "=" * 50)
    print("🔄 测试同一用户多次请求")
    print("=" * 50)
    
    session_name = "test_session_repeat"
    base_url = "http://127.0.0.1:8081/callback"
    tokens = []
    
    for i in range(3):
        try:
            params = {'session_name': session_name}
            url = f"{base_url}?{urlencode(params)}"
            headers = {'X-Session-Name': session_name, 'Accept': 'application/json'}
            
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('access_token')
                if token:
                    tokens.append(token)
                    print(f"请求 {i+1}: 获得token {token[:20]}...")
                else:
                    print(f"请求 {i+1}: 无token返回")
            else:
                print(f"请求 {i+1}: 失败 HTTP {response.status_code}")
                
        except Exception as e:
            print(f"请求 {i+1}: 异常 {str(e)}")
    
    # 检查token一致性
    if len(tokens) > 1:
        all_same = all(token == tokens[0] for token in tokens)
        if all_same:
            print("✅ 同一用户多次请求获得相同token (符合预期)")
        else:
            print("⚠️  同一用户多次请求获得不同token")
    else:
        print("ℹ️  无法验证token一致性")

if __name__ == "__main__":
    print("Coze JWT服务器会话名称支持验证工具")
    print("确保JWT服务器正在运行: python main.py (在JWTOauth目录)")
    print()
    
    try:
        # 测试基本功能
        success = test_session_name_support()
        
        # 测试同一会话多次请求
        test_single_session_multiple_requests()
        
        print("\n" + "=" * 50)
        if success:
            print("🎉 会话名称支持测试通过!")
            sys.exit(0)
        else:
            print("❌ 会话名称支持测试失败")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  测试被用户中断")
        sys.exit(1)