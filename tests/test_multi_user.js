// ==UserScript==
// @name         Coze Multi-User Test
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  测试Coze多用户功能
// @author       You
// @match        https://www.coze.cn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🧪 开始Coze多用户功能测试...');
    
    // 测试用户ID生成功能
    function testUserIdGeneration() {
        console.log('🔧 测试用户ID生成功能...');
        
        // 清除现有存储
        if (typeof GM_deleteValue === 'function') {
            GM_deleteValue('coze_user_id');
            GM_deleteValue('coze_user_token');
        }
        
        // 模拟用户ID生成函数
        function generateUserId() {
            const timestamp = Date.now().toString(36);
            const randomStr = Math.random().toString(36).substr(2, 6);
            return 'user_' + timestamp + '_' + randomStr;
        }
        
        // 生成多个用户ID
        const userIds = [];
        for (let i = 0; i < 3; i++) {
            const userId = generateUserId();
            userIds.push(userId);
            console.log(`👤 生成用户ID ${i+1}: ${userId}`);
        }
        
        // 验证用户ID格式
        const testUserId = userIds[0];
        if (testUserId.startsWith('user_') && testUserId.includes('_')) {
            console.log('✅ 用户ID格式验证通过');
        } else {
            console.log('❌ 用户ID格式验证失败');
        }
        
        return userIds;
    }
    
    // 测试存储功能
    function testStorageFunctionality() {
        console.log('💾 测试存储功能...');
        
        if (typeof GM_setValue === 'function' && typeof GM_getValue === 'function') {
            const testUserId = 'test_user_' + Date.now();
            
            // 存储用户ID
            GM_setValue('coze_user_id', testUserId);
            
            // 读取用户ID
            const storedUserId = GM_getValue('coze_user_id');
            
            if (storedUserId === testUserId) {
                console.log('✅ 用户ID存储功能正常');
                return true;
            } else {
                console.log('❌ 用户ID存储功能异常');
                return false;
            }
        } else {
            console.log('⚠️  GM存储API不可用，跳过存储测试');
            return false;
        }
    }
    
    // 测试JWT服务器用户ID支持
    async function testJWTServerSupport() {
        console.log('🔐 测试JWT服务器用户ID支持...');
        
        try {
            // 测试带会话名称的请求
            const testSessionName = 'test_user_' + Date.now();
            const testUrl = `http://127.0.0.1:8081/callback?session_name=${encodeURIComponent(testSessionName)}`;
            
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Session-Name': testSessionName
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ JWT服务器响应正常');
                console.log(`📋 响应数据:`, data);
                
                if (data.access_token) {
                    console.log('✅ JWT token获取成功');
                    return true;
                } else {
                    console.log('❌ JWT token获取失败');
                    return false;
                }
            } else {
                console.log(`❌ JWT服务器返回错误状态: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.log('❌ JWT服务器测试失败:', error.message);
            return false;
        }
    }
    
    // 运行所有测试
    async function runAllTests() {
        console.log('🚀 开始运行多用户功能测试套件...\n');
        
        // 测试1: 用户ID生成
        console.log('=== 测试1: 用户ID生成 ===');
        testUserIdGeneration();
        console.log('');
        
        // 测试2: 存储功能
        console.log('=== 测试2: 存储功能 ===');
        const storageTest = testStorageFunctionality();
        console.log('');
        
        // 测试3: JWT服务器支持
        console.log('=== 测试3: JWT服务器支持 ===');
        const jwtTest = await testJWTServerSupport();
        console.log('');
        
        // 测试总结
        console.log('📊 测试总结:');
        console.log(`  用户ID生成: ✅ 完成`);
        console.log(`  存储功能: ${storageTest ? '✅ 通过' : '❌ 失败'}`);
        console.log(`  JWT服务器: ${jwtTest ? '✅ 通过' : '❌ 失败'}`);
        
        if (storageTest && jwtTest) {
            console.log('\n🎉 所有核心功能测试通过！多用户功能已就绪。');
        } else {
            console.log('\n⚠️  部分功能测试失败，请检查相关配置。');
        }
    }
    
    // 延迟执行测试，确保页面加载完成
    setTimeout(runAllTests, 2000);
    
})();