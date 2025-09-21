// JWT服务器通信测试脚本
// 在浏览器控制台中运行此代码来测试与JWT服务器的通信

async function testJWTServerCommunication() {
    console.log('🧪 开始测试JWT服务器通信...');
    
    // 测试服务器主页
    try {
        console.log('1. 测试JWT服务器主页...');
        const homeResponse = await fetch('http://127.0.0.1:8081/', {
            method: 'GET',
            headers: { 'Accept': 'text/html' }
        });
        
        console.log(`✅ 主页状态码: ${homeResponse.status}`);
        console.log(`📋 Content-Type: ${homeResponse.headers.get('Content-Type')}`);
        
        if (homeResponse.ok) {
            console.log('✅ JWT服务器主页访问正常');
        } else {
            console.log('❌ JWT服务器主页访问失败');
        }
    } catch (error) {
        console.log('❌ JWT服务器主页测试失败:', error.message);
    }
    
    // 测试获取JWT token
    try {
        console.log('\n2. 测试获取JWT token...');
        const tokenResponse = await fetch('http://127.0.0.1:8081/callback', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });
        
        console.log(`✅ Token请求状态码: ${tokenResponse.status}`);
        console.log(`📋 Content-Type: ${tokenResponse.headers.get('Content-Type')}`);
        
        if (tokenResponse.ok) {
            const data = await tokenResponse.json();
            console.log('✅ JWT token获取成功!');
            console.log('📋 响应数据:', data);
            
            if (data && data.access_token) {
                console.log('✅ 包含有效的access_token');
                console.log(`🔑 Token类型: ${data.token_type || 'N/A'}`);
                console.log(`⏰ 过期时间: ${data.expires_in || 'N/A'}`);
            } else {
                console.log('❌ 响应中缺少access_token字段');
            }
        } else {
            console.log('❌ JWT token获取失败');
            console.log('📋 响应文本:', await tokenResponse.text());
        }
    } catch (error) {
        console.log('❌ JWT token获取测试失败:', error.message);
    }
    
    console.log('\n🧪 测试完成');
}

// 运行测试
testJWTServerCommunication().catch(console.error);