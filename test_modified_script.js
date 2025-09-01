/**
 * 测试修改后的Tampermonkey脚本功能
 * 验证本地代理URL格式兼容性和代理检测逻辑
 */

// 模拟GM_xmlhttpRequest函数
const GM_xmlhttpRequest = function(options) {
    console.log('GM_xmlhttpRequest called with:', {
        method: options.method,
        url: options.url,
        timeout: options.timeout
    });

    // 模拟本地代理测试请求
    if (options.url.includes('httpbin.org/get')) {
        setTimeout(() => {
            if (options.url.startsWith('http://127.0.0.1:8080/')) {
                console.log('✅ 本地代理测试成功 - 使用路径格式');
                options.onload({
                    status: 200,
                    responseText: JSON.stringify({
                        url: 'https://httpbin.org/get',
                        headers: {},
                        args: {}
                    })
                });
            } else {
                console.log('❌ 本地代理测试失败 - URL格式错误');
                options.onerror(new Error('Connection failed'));
            }
        }, 100);
        return;
    }

    // 模拟SDK加载请求
    if (options.url.includes('lf-cdn.coze.cn')) {
        setTimeout(() => {
            if (options.url.startsWith('http://127.0.0.1:8080/https%3A%2F%2Flf-cdn.coze.cn')) {
                console.log('✅ SDK代理请求成功 - 使用路径格式');
                options.onload({
                    status: 200,
                    responseText: '// Mock Coze SDK content\nwindow.CozeWebSDK = { WebChatClient: function() {} };'
                });
            } else {
                console.log('❌ SDK代理请求失败 - URL格式错误');
                options.onerror(new Error('Proxy error'));
            }
        }, 100);
    }
};

// 模拟GM_notification函数
const GM_notification = function(options) {
    console.log('📢 Notification:', options.title, options.text);
};

// 测试代理URL构造函数
function testProxyUrlConstruction() {
    console.log('🧪 测试代理URL构造...');

    const CONFIG = {
        LOCAL_PROXY_URL: 'http://127.0.0.1:8080/',
        SDK_URL: 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js'
    };

    const PROXY_SERVICES = [
        CONFIG.LOCAL_PROXY_URL,
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?',
        'https://proxy.cors.sh/?'
    ];

    // 测试本地代理URL构造（路径格式）
    const localProxyBase = PROXY_SERVICES[0];
    const localProxyUrl = localProxyBase + (localProxyBase.endsWith('/') ? '' : '/') +
                         encodeURIComponent(CONFIG.SDK_URL);
    
    console.log('本地代理URL:', localProxyUrl);
    console.log('预期格式: http://127.0.0.1:8080/https%3A%2F%2Flf-cdn.coze.cn%2F...');
    console.log('格式正确:', localProxyUrl.startsWith('http://127.0.0.1:8080/https%3A%2F%2F'));

    // 测试外部代理URL构造（查询参数格式）
    for (let i = 1; i < PROXY_SERVICES.length; i++) {
        const proxyBase = PROXY_SERVICES[i];
        const proxyUrl = proxyBase + (proxyBase.includes('?') ? '' : '?') +
                        encodeURIComponent(CONFIG.SDK_URL);
        
        console.log(`外部代理 ${i} URL:`, proxyUrl);
        console.log(`格式正确:`, proxyUrl.includes('?') && proxyUrl.includes('http'));
    }
}

// 测试代理检测功能
function testProxyDetection() {
    console.log('\n🧪 测试代理检测功能...');

    const testUrl = 'http://127.0.0.1:8080/' + encodeURIComponent('https://httpbin.org/get');
    console.log('测试URL:', testUrl);

    // 模拟代理检测
    GM_xmlhttpRequest({
        method: 'GET',
        url: testUrl,
        timeout: 3000,
        onload: function(response) {
            const isAvailable = response.status === 200;
            console.log('代理可用性:', isAvailable ? '✅ 可用' : '❌ 不可用');
        },
        onerror: function() {
            console.log('代理可用性: ❌ 不可用 (错误)');
        },
        ontimeout: function() {
            console.log('代理可用性: ❌ 不可用 (超时)');
        }
    });
}

// 运行测试
console.log('🚀 开始测试修改后的Tampermonkey脚本功能\n');
testProxyUrlConstruction();
setTimeout(testProxyDetection, 200);

// 验证URL格式兼容性
console.log('\n🔍 验证URL格式兼容性:');
const testUrls = [
    'http://127.0.0.1:8080/https%3A%2F%2Fexample.com', // 路径格式
    'http://127.0.0.1:8080/?url=https%3A%2F%2Fexample.com' // 查询参数格式
];

testUrls.forEach((url, index) => {
    const isPathFormat = url.startsWith('http://127.0.0.1:8080/http') && !url.includes('?url=');
    console.log(`URL ${index + 1}: ${url}`);
    console.log(`  格式: ${isPathFormat ? '路径格式 ✅' : '查询参数格式 ⚠️'}`);
    console.log(`  兼容性: ${isPathFormat ? '与代理服务器兼容' : '可能需要代理服务器支持查询参数'}`);
});