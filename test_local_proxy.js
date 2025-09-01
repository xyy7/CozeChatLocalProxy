// 测试本地CORS代理服务器的脚本
// 使用方法：node test_local_proxy.js

const http = require('http');
const url = require('url');

// 测试配置
const PROXY_URL = 'http://127.0.0.1:8080/';
const TEST_URL = 'https://httpbin.org/get';

function testProxy() {
    console.log('🧪 测试本地CORS代理服务器...');
    console.log(`代理地址: ${PROXY_URL}`);
    console.log(`测试URL: ${TEST_URL}`);

    // 测试路径格式
    const pathFormatUrl = PROXY_URL + encodeURIComponent(TEST_URL);
    console.log(`\n📤 测试路径格式: ${pathFormatUrl}`);

    const req = http.get(pathFormatUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`📥 响应状态: ${res.statusCode}`);
            
            if (res.statusCode === 200) {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ 代理服务器工作正常（路径格式）');
                    console.log(`📊 响应包含: ${jsonData.url ? '✓' : '✗'} 原始URL`);
                    console.log(`🌐 代理成功访问: ${jsonData.url || '未知'}`);
                } catch (e) {
                    console.log('❌ 响应不是有效的JSON');
                    console.log('📄 响应内容:', data.substring(0, 200) + '...');
                }
            } else {
                console.log('❌ 代理服务器返回错误状态');
                console.log('📄 响应内容:', data);
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ 请求失败:', err.message);
        console.log('💡 请确保代理服务器正在运行: python start_proxy.py');
    });

    req.setTimeout(5000, () => {
        console.log('⏰ 请求超时');
        req.destroy();
    });
}

// 也测试查询参数格式
function testQueryFormat() {
    console.log(`\n📤 测试查询参数格式: ${PROXY_URL}?url=${encodeURIComponent(TEST_URL)}`);

    const req = http.get(`${PROXY_URL}?url=${encodeURIComponent(TEST_URL)}`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`📥 响应状态: ${res.statusCode}`);
            
            if (res.statusCode === 200) {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ 代理服务器工作正常（查询参数格式）');
                } catch (e) {
                    console.log('❌ 响应不是有效的JSON');
                }
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ 查询参数格式请求失败:', err.message);
    });
}

// 运行测试
testProxy();
setTimeout(testQueryFormat, 1000); // 稍后测试查询参数格式