#!/usr/bin/env python3
"""
CORS 代理服务器启动脚本
提供简单的启动方式和配置管理
"""

import asyncio
import json
import argparse
import logging
from ..cors_proxy_server import CORSProxyServer

def load_config(config_file='config.json'):
    """加载配置文件"""
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"配置文件 {config_file} 不存在，使用默认配置")
        return {
            "server": {
                "host": "127.0.0.1",
                "port": 8080,
                "debug": False
            }
        }
    except json.JSONDecodeError as e:
        print(f"配置文件格式错误: {e}")
        return None

def setup_logging(config):
    """设置日志配置"""
    log_config = config.get('logging', {})
    level = getattr(logging, log_config.get('level', 'INFO').upper())
    
    logging.basicConfig(
        level=level,
        format=log_config.get('format', '%(asctime)s - %(name)s - %(levelname)s - %(message)s'),
        filename=log_config.get('file')
    )

async def run_server():
    """运行服务器"""
    parser = argparse.ArgumentParser(description='启动 CORS 代理服务器')
    parser.add_argument('--config', '-c', default='config.json', help='配置文件路径')
    parser.add_argument('--host', help='服务器主机地址')
    parser.add_argument('--port', type=int, help='服务器端口')
    parser.add_argument('--debug', action='store_true', help='启用调试模式')
    
    args = parser.parse_args()
    
    # 加载配置
    config = load_config(args.config)
    if config is None:
        return
    
    # 应用命令行参数覆盖配置
    server_config = config.get('server', {})
    host = args.host or server_config.get('host', '127.0.0.1')
    port = args.port or server_config.get('port', 8080)
    debug = args.debug or server_config.get('debug', False)
    
    # 设置日志
    setup_logging(config)
    
    # 创建并启动服务器
    server = CORSProxyServer(host=host, port=port)
    
    print("=" * 50)
    print("CORS 代理服务器")
    print("=" * 50)
    print(f"主机: {host}")
    print(f"端口: {port}")
    print(f"调试模式: {'是' if debug else '否'}")
    print("=" * 50)
    print("使用方法:")
    print(f"GET  http://{host}:{port}/https://example.com/api/data")
    print(f"GET  http://{host}:{port}/?url=https://example.com/api/data")
    print("=" * 50)
    
    try:
        await server.start()
    except Exception as e:
        print(f"服务器启动失败: {e}")
        logging.error(f"服务器启动失败: {e}")

if __name__ == '__main__':
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        print("\n服务器已停止")
    except Exception as e:
        print(f"运行错误: {e}")