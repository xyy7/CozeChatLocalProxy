// ==UserScript==
// @name         Coze Chat Injector Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在任何网页注入 Coze 聊天组件 - 增强版带详细调试信息
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // 防止重复注入
    if (window.cozeInjected) {
        console.log('🚫 Coze 聊天组件已注入，跳过重复注入');
        return;
    }
    window.cozeInjected = true;
    
    console.log('🔧 开始注入 Coze 聊天组件...');
    console.log('📋 当前页面:', window.location.href);
    console.log('🕒 注入时间:', new Date().toLocaleString());
    
    // 显示注入信息
    console.group('📦 Coze 聊天组件注入信息');
    console.log('🤖 Bot ID: 7451481843796787219');
    console.log('🏷️ 标题: Coze AI 助手');
    console.log('🔗 SDK 版本: 1.2.0-beta.10');
    console.log('🌐 域名: lf-cdn.coze.cn');
    console.groupEnd();
    
    // 检查页面环境
    console.log('🔍 检查页面环境...');
    console.log('📄 Document readyState:', document.readyState);
    console.log('🖥️ User Agent:', navigator.userAgent);
    
    // 加载 Coze SDK
    var script = document.createElement('script');
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js';
    
    // 设置超时处理
    var loadTimeout = setTimeout(function() {
        console.warn('⏰ Coze SDK 加载超时（10秒）');
        console.log('💡 建议解决方案:');
        console.log('1. 检查网络连接');
        console.log('2. 禁用广告拦截器扩展');
        console.log('3. 尝试使用无痕/隐私模式');
    }, 10000);
    
    script.onload = function() {
        clearTimeout(loadTimeout);
        console.log('✅ Coze SDK 加载成功');
        
        try {
            // 初始化聊天组件
            var chatClient = new CozeWebSDK.WebChatClient({
                config: { 
                    bot_id: '7451481843796787219' 
                },
                componentProps: { 
                    title: 'Coze AI 助手',
                    position: 'right',
                    width: 400,
                    height: 600
                },
                auth: {
                    type: 'token',
                    token: 'pat_xiXSWip6TOYrMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB',
                    onRefreshToken: function() {
                        console.log('🔄 Token 刷新中...');
                        return 'pat_xiXSWip6TOyMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB';
                    }
                }
            });
            
            console.log('🎉 Coze 聊天组件通过 Tampermonkey 注入成功');
            console.log('📊 聊天组件状态: 已初始化');
            
            // 添加事件监听器
            if (chatClient && typeof chatClient.on === 'function') {
                chatClient.on('message', function(data) {
                    console.log('💬 收到消息:', data);
                });
                
                chatClient.on('error', function(error) {
                    console.error('❌ 聊天组件错误:', error);
                });
            }
            
        } catch (error) {
            console.error('❌ Coze Web SDK 初始化失败:', error);
            console.log('🔧 错误详情:', error.message);
            console.log('📋 堆栈跟踪:', error.stack);
            
            // 提供解决方案
            console.group('🛠️ 故障排除建议');
            console.log('1. 禁用广告拦截器扩展（如AdBlock、uBlock Origin等）');
            console.log('2. 禁用隐私保护扩展');
            console.log('3. 尝试使用无痕/隐私模式');
            console.log('4. 检查浏览器控制台是否有CSP错误');
            console.log('5. 监控服务错误通常不影响主要聊天功能');
            console.groupEnd();
        }
    };
    
    script.onerror = function(error) {
        clearTimeout(loadTimeout);
        console.error('❌ Coze SDK 加载失败');
        console.error('📛 错误信息:', error);
        
        // 详细的错误分析
        console.group('🔍 加载失败分析');
        console.log('🌐 请求URL:', script.src);
        console.log('🚫 可能的原因:');
        console.log('   - 网络连接问题');
        console.log('   - CSP（内容安全策略）限制');
        console.log('   - 域名被屏蔽');
        console.log('   - 浏览器扩展拦截');
        console.groupEnd();
        
        // 提供替代方案
        console.group('💡 替代解决方案');
        console.log('1. 使用CORS代理服务:');
        console.log('   const proxyUrl = "https://cors-anywhere.herokuapp.com/";');
        console.log('   const cozeScriptUrl = proxyUrl + "https://lf-cdn.coze.cn/...";');
        console.log('');
        console.log('2. 创建浏览器扩展来修改CSP头');
        console.log('3. 使用Service Worker代理请求');
        console.groupEnd();
    };
    
    // 添加到页面
    document.head.appendChild(script);
    console.log('📤 Coze SDK 脚本已添加到页面头部');
    
    // 页面加载完成后的额外信息
    window.addEventListener('load', function() {
        console.log('📄 页面完全加载完成');
        console.log('🔧 如果看到监控服务错误，请尝试以下解决方案：');
        console.log('   1. 禁用广告拦截器扩展');
        console.log('   2. 禁用隐私保护扩展'); 
        console.log('   3. 尝试使用无痕/隐私模式');
        console.log('   4. 这些错误通常不影响聊天功能的主要使用');
        
        // 检查聊天组件状态
        setTimeout(function() {
            if (typeof CozeWebSDK !== 'undefined' && typeof CozeWebSDK.WebChatClient !== 'undefined') {
                console.log('✅ Coze SDK 全局对象可用');
            } else {
                console.warn('⚠️ Coze SDK 全局对象未定义');
            }
        }, 2000);
    });
    
    // 添加样式提示
    console.log('🎨 提示: 聊天组件将出现在页面右下角');
    console.log('🖱️ 点击聊天图标即可开始对话');
    
})();