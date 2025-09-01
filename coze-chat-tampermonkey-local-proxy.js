// ==UserScript==
// @name         Coze Chat Injector Pro - Local Proxy
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  高级 Coze 聊天组件注入器 - 使用本地CORS代理绕过CSP
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      lf-cdn.coze.cn
// @connect      localhost
// @connect      127.0.0.1
// ==/UserScript==

(function() {
    'use strict';
    
    // 全局状态管理
    window.cozeChatState = {
        sdkLoaded: false,
        initRetryCount: 0,
        maxRetries: 8,
        lastError: null,
        proxyMode: 'local' // local | external | direct
    };
    
    // 配置常量
    const CONFIG = {
        BOT_ID: '7451481843796787219',
        TITLE: 'Coze AI 助手',
        SDK_URL: 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js',
        TOKEN: 'pat_xiXSWip6TOYrMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB',
        REFRESH_TOKEN: 'pat_xiXSWip6TOyMRGbpL3PuNZNob6GomnvZCvkiT7sWaddMzhnHAa6aFomcx93CkfB',
        TIMEOUT: 15000,
        RETRY_ATTEMPTS: 3,
        LOCAL_PROXY_URL: 'http://127.0.0.1:8080/',
        PROXY_CHECK_TIMEOUT: 3000
    };
    
    // 代理服务列表（备用方案）
    const PROXY_SERVICES = [
        CONFIG.LOCAL_PROXY_URL, // 本地代理优先
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?',
        'https://proxy.cors.sh/?'
    ];
    
    // 防止重复注入
    if (window.cozeInjected) {
        log('🚫 Coze 聊天组件已注入，跳过重复注入', 'warn');
        return;
    }
    window.cozeInjected = true;
    
    // 初始化日志系统
    initLogging();
    
    // 主注入函数
    function injectCozeChat() {
        log('🔧 开始注入 Coze 聊天组件...', 'info');
        logEnvironmentInfo();
        
        // 首先检查本地代理是否可用
        checkLocalProxyAvailability().then(isAvailable => {
            if (isAvailable) {
                log('✅ 本地CORS代理可用，使用本地代理', 'success');
                window.cozeChatState.proxyMode = 'local';
                loadWithProxy(0); // 使用第一个代理（本地代理）
            } else {
                log('⚠️ 本地CORS代理不可用，尝试直接加载', 'warn');
                window.cozeChatState.proxyMode = 'direct';
                loadWithDirectMethod();
            }
        }).catch(error => {
            log('❌ 代理检查失败，尝试直接加载', 'error');
            window.cozeChatState.proxyMode = 'direct';
            loadWithDirectMethod();
        });
    }
    
    // 检查本地代理是否可用（测试代理功能）
    function checkLocalProxyAvailability() {
        return new Promise((resolve, reject) => {
            const testUrl = CONFIG.LOCAL_PROXY_URL + (CONFIG.LOCAL_PROXY_URL.endsWith('/') ? '' : '/') +
                           encodeURIComponent('https://httpbin.org/get');
            
            if (typeof GM_xmlhttpRequest === 'function') {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: testUrl,
                    timeout: CONFIG.PROXY_CHECK_TIMEOUT,
                    onload: function(response) {
                        // 检查代理是否真正工作（返回200且包含有效内容）
                        const isAvailable = response.status === 200 &&
                                          response.responseText.includes('httpbin.org');
                        resolve(isAvailable);
                    },
                    onerror: function() {
                        resolve(false);
                    },
                    ontimeout: function() {
                        resolve(false);
                    }
                });
            } else {
                // 如果没有GM_xmlhttpRequest，使用fetch尝试
                fetch(testUrl, {
                    method: 'GET',
                    mode: 'cors',
                    signal: AbortSignal.timeout(CONFIG.PROXY_CHECK_TIMEOUT)
                })
                .then(response => response.text())
                .then(text => resolve(response.ok && text.includes('httpbin.org')))
                .catch(() => resolve(false));
            }
        });
    }
    
    // 直接加载方法
    function loadWithDirectMethod() {
        log('📡 尝试直接加载 Coze SDK...', 'info');
        
        const script = document.createElement('script');
        script.src = CONFIG.SDK_URL;
        
        // 设置超时
        const loadTimeout = setTimeout(() => {
            log('⏰ Coze SDK 直接加载超时，尝试代理方案', 'warn');
            script.remove();
            window.cozeChatState.proxyMode = 'external';
            loadWithProxy(1); // 跳过本地代理，从外部代理开始
        }, CONFIG.TIMEOUT);
        
        script.onload = function() {
            clearTimeout(loadTimeout);
            log('✅ Coze SDK 直接加载成功', 'success');
            // 给SDK一些时间来初始化全局变量
            setTimeout(initializeChatClient, 100);
        };
        
        script.onerror = function(error) {
            clearTimeout(loadTimeout);
            log('❌ Coze SDK 直接加载失败', 'error');
            log(`📛 错误: ${error}`, 'error');
            analyzeCSPError();
            window.cozeChatState.proxyMode = 'external';
            loadWithProxy(1); // 跳过本地代理，从外部代理开始
        };
        
        document.head.appendChild(script);
    }
    
    // 使用代理加载
    function loadWithProxy(proxyIndex, attempt = 1) {
        if (proxyIndex >= PROXY_SERVICES.length) {
            log('💥 所有代理服务都失败了', 'error');
            showFinalError();
            return;
        }
        
        if (attempt > CONFIG.RETRY_ATTEMPTS) {
            log(`🔄 代理 ${proxyIndex} 重试次数耗尽，尝试下一个代理`, 'warn');
            loadWithProxy(proxyIndex + 1, 1);
            return;
        }
        
        const proxyBase = PROXY_SERVICES[proxyIndex];
        let proxyUrl;
        
        if (proxyIndex === 0) {
            // 本地代理 - 使用路径格式（与代理服务器实现一致）
            proxyUrl = proxyBase + (proxyBase.endsWith('/') ? '' : '/') +
                      encodeURIComponent(CONFIG.SDK_URL);
        } else {
            // 外部代理 - 使用查询参数方式
            proxyUrl = proxyBase + (proxyBase.includes('?') ? '' : '?') +
                      encodeURIComponent(CONFIG.SDK_URL);
        }
        
        log(`🔄 尝试代理 ${proxyIndex + 1}/${PROXY_SERVICES.length} (${window.cozeChatState.proxyMode}模式, 尝试 ${attempt}/${CONFIG.RETRY_ATTEMPTS})`, 'info');
        log(`🌐 代理URL: ${proxyUrl}`, 'debug');
        
        if (typeof GM_xmlhttpRequest === 'function') {
            // 使用 Tampermonkey 的跨域请求
            loadWithGMRequest(proxyUrl, proxyIndex, attempt);
        } else {
            // 使用常规 script 标签
            loadWithScriptTag(proxyUrl, proxyIndex, attempt);
        }
    }
    
    // 使用 GM_xmlhttpRequest 加载
    function loadWithGMRequest(url, proxyIndex, attempt) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            timeout: CONFIG.TIMEOUT,
            onload: function(response) {
                if (response.status === 200) {
                    log('✅ 代理请求成功', 'success');
                    injectScriptContent(response.responseText);
                } else {
                    log(`❌ 代理请求失败: HTTP ${response.status}`, 'error');
                    loadWithProxy(proxyIndex, attempt + 1);
                }
            },
            onerror: function(error) {
                log(`❌ 代理请求错误: ${error}`, 'error');
                loadWithProxy(proxyIndex, attempt + 1);
            },
            ontimeout: function() {
                log('⏰ 代理请求超时', 'warn');
                loadWithProxy(proxyIndex, attempt + 1);
            }
        });
    }
    
    // 使用 script 标签加载
    function loadWithScriptTag(url, proxyIndex, attempt) {
        const script = document.createElement('script');
        script.src = url;
        
        const timeout = setTimeout(() => {
            log('⏰ 代理脚本加载超时', 'warn');
            script.remove();
            loadWithProxy(proxyIndex, attempt + 1);
        }, CONFIG.TIMEOUT);
        
        script.onload = function() {
            clearTimeout(timeout);
            log('✅ 代理加载成功', 'success');
            // 给SDK一些时间来初始化全局变量
            setTimeout(initializeChatClient, 100);
        };
        
        script.onerror = function() {
            clearTimeout(timeout);
            log('❌ 代理加载失败', 'error');
            loadWithProxy(proxyIndex, attempt + 1);
        };
        
        document.head.appendChild(script);
    }
    
    // 注入脚本内容
    function injectScriptContent(content) {
        try {
            const script = document.createElement('script');
            script.textContent = content;
            
            script.onload = function() {
                log('✅ 脚本内容注入成功', 'success');
                // 给SDK一些时间来初始化全局变量
                setTimeout(initializeChatClient, 100);
            };
            
            script.onerror = function(error) {
                log('❌ 脚本内容注入失败', 'error');
                log(`📛 错误: ${error.message}`, 'error');
            };
            
            document.head.appendChild(script);
        } catch (error) {
            log('❌ 脚本内容注入失败', 'error');
            log(`📛 错误: ${error.message}`, 'error');
        }
    }
    
    // 检查SDK全局变量是否可用
    function isCozeSDKAvailable() {
        try {
            return typeof CozeWebSDK !== 'undefined' &&
                   typeof CozeWebSDK.WebChatClient !== 'undefined' &&
                   typeof CozeWebSDK.WebChatClient === 'function';
        } catch (e) {
            return false;
        }
    }
    
    // 初始化聊天客户端
    function initializeChatClient() {
        log('🔄 初始化聊天客户端...', 'info');
        
        // 检查CozeWebSDK是否已定义且可用
        if (!isCozeSDKAvailable()) {
            log('❌ CozeWebSDK 未定义或不可用，等待重试...', 'warn');
            
            if (window.cozeChatState.initRetryCount < window.cozeChatState.maxRetries) {
                window.cozeChatState.initRetryCount++;
                const delay = Math.min(1000, window.cozeChatState.initRetryCount * 200);
                log(`🔄 重试 ${window.cozeChatState.initRetryCount}/${window.cozeChatState.maxRetries} (${delay}ms)...`, 'info');
                setTimeout(initializeChatClient, delay);
            } else {
                log('💥 CozeWebSDK 初始化失败，已达到最大重试次数', 'error');
                log('🔧 详细诊断:', 'info');
                log('   - 检查浏览器控制台是否有CSP或加载错误', 'info');
                log('   - 尝试刷新页面或检查网络连接', 'info');
                log('   - 全局变量状态:', 'info');
                log(`     CozeWebSDK: ${typeof CozeWebSDK}`, 'info');
                
                // 尝试检测其他可能的全局变量名称
                detectAlternativeSDKNames();
            }
            return;
        }
        
        try {
            // 标记SDK已加载成功
            window.cozeChatState.sdkLoaded = true;
            window.cozeChatState.initRetryCount = 0;
            
            log('✅ CozeWebSDK 加载成功，开始创建聊天客户端', 'success');
            
            const chatClient = new CozeWebSDK.WebChatClient({
                config: {
                    bot_id: CONFIG.BOT_ID
                },
                componentProps: {
                    title: CONFIG.TITLE,
                    position: 'right',
                    width: 400,
                    height: 600
                },
                auth: {
                    type: 'token',
                    token: CONFIG.TOKEN,
                    onRefreshToken: function() {
                        log('🔄 Token 刷新中...', 'info');
                        return CONFIG.REFRESH_TOKEN;
                    }
                }
            });
            
            log('🎉 Coze 聊天组件初始化成功', 'success');
            setupChatEvents(chatClient);
            
            // 发送成功通知
            if (typeof GM_notification === 'function') {
                GM_notification({
                    title: 'Coze 聊天注入成功',
                    text: `使用${window.cozeChatState.proxyMode}模式加载`,
                    timeout: 3000
                });
            }
            
        } catch (error) {
            log('❌ Coze 聊天组件初始化失败', 'error');
            log(`📛 错误: ${error.message}`, 'error');
            log(`📋 堆栈: ${error.stack}`, 'debug');
        }
    }
    
    // 检测其他可能的SDK全局变量名称
    function detectAlternativeSDKNames() {
        const possibleNames = ['Coze', 'coze', 'CozeSDK', 'cozeSDK', 'WebChatSDK'];
        const detected = [];
        
        for (const name of possibleNames) {
            try {
                if (typeof window[name] !== 'undefined') {
                    detected.push(`${name}: ${typeof window[name]}`);
                }
            } catch (e) {
                // 忽略访问错误
            }
        }
        
        if (detected.length > 0) {
            log('🔍 检测到其他可能的全局变量:', 'info');
            detected.forEach(item => log(`   - ${item}`, 'info'));
        }
    }
    
    // 设置聊天事件
    function setupChatEvents(chatClient) {
        if (chatClient && typeof chatClient.on === 'function') {
            chatClient.on('message', function(data) {
                log(`💬 收到消息: ${JSON.stringify(data)}`, 'debug');
            });
            
            chatClient.on('error', function(error) {
                log(`❌ 聊天错误: ${error}`, 'error');
            });
            
            chatClient.on('ready', function() {
                log('✅ 聊天组件准备就绪', 'success');
            });
        }
    }
    
    // CSP 错误分析
    function analyzeCSPError() {
        log('🔍 分析可能的CSP限制...', 'info');
        log('📋 常见CSP绕过方案:', 'info');
        log('1. 使用CORS代理服务', 'info');
        log('2. 创建浏览器扩展修改CSP头', 'info');
        log('3. 使用Service Worker代理', 'info');
        log('4. 内联脚本注入', 'info');
        log('5. 使用本地CORS代理服务器', 'info');
    }
    
    // 显示最终错误
    function showFinalError() {
        log('💥 所有注入方法都失败了', 'error');
        log('🛠️ 最终解决方案建议:', 'info');
        log('1. 检查浏览器控制台的详细错误信息', 'info');
        log('2. 禁用所有广告拦截和隐私保护扩展', 'info');
        log('3. 尝试不同的浏览器', 'info');
        log('4. 使用开发者工具手动注入', 'info');
        log('5. 启动本地CORS代理: python start_proxy.py', 'info');
    }
    
    // 初始化日志系统
    function initLogging() {
        const styles = `
            .coze-log { padding: 4px 8px; margin: 2px 0; border-radius: 3px; font-family: monospace; }
            .coze-log-info { background: #e3f2fd; color: #0d47a1; }
            .coze-log-success { background: #e8f5e8; color: #2e7d32; }
            .coze-log-warn { background: #fff3e0; color: #f57c00; }
            .coze-log-error { background: #ffebee; color: #c62828; }
            .coze-log-debug { background: #f5f5f5; color: #616161; }
        `;
        
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }
    
    // 日志函数
    function log(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        switch(level) {
            case 'success':
                console.log('%c✅ ' + logMessage, 'color: #2e7d32; font-weight: bold;');
                break;
            case 'warn':
                console.warn('⚠️ ' + logMessage);
                break;
            case 'error':
                console.error('❌ ' + logMessage);
                break;
            case 'debug':
                console.debug('🐛 ' + logMessage);
                break;
            default:
                console.log('🔧 ' + logMessage);
        }
    }
    
    // 环境信息日志
    function logEnvironmentInfo() {
        log('📋 环境信息:', 'info');
        log(`🌐 页面: ${window.location.href}`, 'debug');
        log(`🕒 时间: ${new Date().toLocaleString()}`, 'debug');
        log(`📄 ReadyState: ${document.readyState}`, 'debug');
        log(`🖥️ UserAgent: ${navigator.userAgent}`, 'debug');
        log(`🔗 SDK URL: ${CONFIG.SDK_URL}`, 'debug');
        log(`🤖 Bot ID: ${CONFIG.BOT_ID}`, 'debug');
    }
    
    // 启动注入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCozeChat);
    } else {
        injectCozeChat();
    }
    
})();