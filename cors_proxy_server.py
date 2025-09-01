#!/usr/bin/env python3
"""
CORS 代理服务器 - 用于绕过 CSP 和同源策略限制
支持多种代理模式和配置选项
"""

import asyncio
import aiohttp
import aiohttp.web
import urllib.parse
import logging
import json
from typing import Dict, Optional, List
import ssl
import certifi

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('cors-proxy')

class CORSProxyServer:
    def __init__(self, host: str = '127.0.0.1', port: int = 8080):
        self.host = host
        self.port = port
        self.app = aiohttp.web.Application()
        self.session: Optional[aiohttp.ClientSession] = None
        
        # 设置路由
        self.setup_routes()
        
        # 允许的域名白名单（可选）
        self.allowed_domains = [
            'lf-cdn.coze.cn',
            'coze.cn',
            '*.coze.cn',
            'localhost',
            '127.0.0.1'
        ]
    
    def setup_routes(self):
        """设置HTTP路由"""
        self.app.router.add_get('/', self.handle_root)
        self.app.router.add_get('/{path:.*}', self.handle_proxy_get)
        self.app.router.add_post('/{path:.*}', self.handle_proxy_post)
        self.app.router.add_put('/{path:.*}', self.handle_proxy_put)
        self.app.router.add_delete('/{path:.*}', self.handle_proxy_delete)
        self.app.router.add_options('/{path:.*}', self.handle_options)
    
    async def create_session(self):
        """创建HTTP会话"""
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        self.session = aiohttp.ClientSession(connector=connector)
    
    async def close_session(self):
        """关闭HTTP会话"""
        if self.session:
            await self.session.close()
    
    def is_domain_allowed(self, url: str) -> bool:
        """检查域名是否在白名单中"""
        try:
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc
            
            # 允许所有域名（在生产环境中应该更严格）
            return True
            
            # 严格的域名检查（取消注释启用）
            # for allowed in self.allowed_domains:
            #     if allowed.startswith('*.'):
            #         base_domain = allowed[2:]
            #         if domain.endswith(base_domain):
            #             return True
            #     elif domain == allowed:
            #         return True
            # return False
            
        except Exception:
            return False
    
    def add_cors_headers(self, response: aiohttp.web.Response) -> aiohttp.web.Response:
        """添加CORS头到响应"""
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '3600',
            'Access-Control-Allow-Credentials': 'true'
        })
        return response
    
    async def handle_root(self, request: aiohttp.web.Request) -> aiohttp.web.Response:
        """处理根路径请求"""
        info = {
            'service': 'CORS Proxy Server',
            'version': '1.0.0',
            'endpoints': {
                'GET /{url}': '代理GET请求',
                'POST /{url}': '代理POST请求',
                'PUT /{url}': '代理PUT请求',
                'DELETE /{url}': '代理DELETE请求',
                'OPTIONS /{url}': '处理预检请求'
            },
            'usage': '将目标URL编码后附加到代理URL后，例如: /https://example.com/api/data'
        }
        return aiohttp.web.json_response(info)
    
    async def handle_options(self, request: aiohttp.web.Request) -> aiohttp.web.Response:
        """处理OPTIONS预检请求"""
        response = aiohttp.web.Response(status=200)
        return self.add_cors_headers(response)
    
    async def proxy_request(self, request: aiohttp.web.Request, method: str) -> aiohttp.web.Response:
        """处理代理请求"""
        try:
            # 获取目标URL
            path = request.match_info['path']
            if not path.startswith(('http://', 'https://')):
                # 尝试从查询参数获取URL
                target_url = request.query.get('url') or request.query.get('quest')
                if not target_url:
                    return aiohttp.web.json_response(
                        {'error': 'URL parameter required'}, status=400
                    )
            else:
                target_url = path
            
            # 解码URL（如果被编码）
            if '%' in target_url:
                target_url = urllib.parse.unquote(target_url)
            
            # 检查域名是否允许
            if not self.is_domain_allowed(target_url):
                return aiohttp.web.json_response(
                    {'error': 'Domain not allowed'}, status=403
                )
            
            logger.info(f"Proxying {method} request to: {target_url}")
            
            # 准备请求头（移除不需要的代理头）
            headers = dict(request.headers)
            headers_to_remove = [
                'host', 'connection', 'accept-encoding', 
                'content-length', 'transfer-encoding'
            ]
            for header in headers_to_remove:
                headers.pop(header, None)
            
            # 准备请求数据
            data = None
            if method in ['POST', 'PUT']:
                if request.can_read_body:
                    data = await request.read()
            
            # 发送代理请求
            async with self.session.request(
                method=method,
                url=target_url,
                headers=headers,
                data=data,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as resp:
                # 读取响应内容
                content = await resp.read()
                
                # 创建响应
                response = aiohttp.web.Response(
                    status=resp.status,
                    body=content,
                    headers=dict(resp.headers)
                )
                
                # 添加CORS头
                return self.add_cors_headers(response)
                
        except asyncio.TimeoutError:
            logger.error(f"Timeout while proxying to {target_url}")
            return aiohttp.web.json_response(
                {'error': 'Request timeout'}, status=504
            )
        except aiohttp.ClientError as e:
            logger.error(f"Client error: {e}")
            return aiohttp.web.json_response(
                {'error': f'Proxy error: {str(e)}'}, status=502
            )
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return aiohttp.web.json_response(
                {'error': f'Internal server error: {str(e)}'}, status=500
            )
    
    async def handle_proxy_get(self, request: aiohttp.web.Request) -> aiohttp.web.Response:
        """处理GET代理请求"""
        return await self.proxy_request(request, 'GET')
    
    async def handle_proxy_post(self, request: aiohttp.web.Request) -> aiohttp.web.Response:
        """处理POST代理请求"""
        return await self.proxy_request(request, 'POST')
    
    async def handle_proxy_put(self, request: aiohttp.web.Request) -> aiohttp.web.Response:
        """处理PUT代理请求"""
        return await self.proxy_request(request, 'PUT')
    
    async def handle_proxy_delete(self, request: aiohttp.web.Request) -> aiohttp.web.Response:
        """处理DELETE代理请求"""
        return await self.proxy_request(request, 'DELETE')
    
    async def start(self):
        """启动服务器"""
        await self.create_session()
        runner = aiohttp.web.AppRunner(self.app)
        await runner.setup()
        
        site = aiohttp.web.TCPSite(runner, self.host, self.port)
        await site.start()
        
        logger.info(f"CORS Proxy Server started at http://{self.host}:{self.port}")
        logger.info("Press Ctrl+C to stop the server")
        
        try:
            # 保持服务器运行
            await asyncio.Future()
        except KeyboardInterrupt:
            logger.info("Shutting down server...")
        finally:
            await runner.cleanup()
            await self.close_session()

async def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='CORS Proxy Server')
    parser.add_argument('--host', default='127.0.0.1', help='Server host')
    parser.add_argument('--port', type=int, default=8080, help='Server port')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    server = CORSProxyServer(host=args.host, port=args.port)
    await server.start()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user")