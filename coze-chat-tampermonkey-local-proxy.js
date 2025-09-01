// ==UserScript==
// @name         Coze Chat Local Proxy
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  为Coze Web SDK提供本地CORS代理支持
// @author       You
// @match        https://www.coze.cn/*
// @match        https://www.coze.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
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
        lastError: null
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
    
    // 不再需要PROXY_SERVICES数组，直接使用CONFIG.LOCAL_PROXY_URL
    
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
                loadWithProxy(); // 使用本地代理
            } else {
                log('⚠️ 本地CORS代理不可用，尝试直接加载', 'warn');
                loadWithDirectMethod();
            }
        }).catch(error => {
            log('❌ 代理检查失败，尝试直接加载', 'error');
            loadWithDirectMethod();
        });
    }
    
    // 检查本地代理是否可用（测试代理功能）
    function checkLocalProxyAvailability() {
        return new Promise((resolve, reject) => {
            const testUrl = CONFIG.LOCAL_PROXY_URL + (CONFIG.LOCAL_PROXY_URL.endsWith('/') ? '' : '/') +
                           encodeURIComponent('https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js');
            
            if (typeof GM_xmlhttpRequest === 'function') {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: testUrl,
                    timeout: CONFIG.PROXY_CHECK_TIMEOUT,
                    onload: function(response) {
                        // 检查代理是否真正工作（返回200状态码）
                        const isAvailable = response.status === 200;
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
                .then(text => resolve(response.ok))
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
            log('⏰ Coze SDK 直接加载超时', 'warn');
            script.remove();
            log('❌ 直接加载失败，请启动本地CORS代理服务器', 'error');
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
            log('❌ 直接加载失败，请启动本地CORS代理服务器', 'error');
        };
        
        document.head.appendChild(script);
    }
    
    // 使用本地代理加载
    function loadWithProxy(attempt = 1) {
        if (attempt > CONFIG.RETRY_ATTEMPTS) {
            log('❌ 本地代理重试次数耗尽', 'error');
            log('💡 请检查本地代理服务器是否正常运行', 'info');
            return;
        }

        // 本地代理 - 使用路径格式（与代理服务器实现一致）
        const proxyUrl = CONFIG.LOCAL_PROXY_URL + (CONFIG.LOCAL_PROXY_URL.endsWith('/') ? '' : '/') +
                      encodeURIComponent(CONFIG.SDK_URL);

        log(`🔄 尝试本地代理 (尝试 ${attempt}/${CONFIG.RETRY_ATTEMPTS})`, 'info');
        log(`🌐 代理URL: ${proxyUrl}`, 'debug');

        if (typeof GM_xmlhttpRequest === 'function') {
            // 使用 Tampermonkey 的跨域请求
            loadWithGMRequest(proxyUrl, attempt);
        } else {
            // 使用常规 script 标签
            loadWithScriptTag(proxyUrl, attempt);
        }
    }
    
    // 使用 GM_xmlhttpRequest 加载
    function loadWithGMRequest(url, attempt) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            timeout: CONFIG.TIMEOUT,
            onload: function(response) {
                if (response.status === 200) {
                    log('✅ 代理请求成功', 'success');
                    injectScriptContent(response.responseText);
                } else {
                    log(`❌ 本地代理请求失败: HTTP ${response.status}`, 'error');
                    if (attempt < CONFIG.RETRY_ATTEMPTS) {
                        log(`🔄 将在 ${attempt * 1000}ms 后重试...`, 'info');
                        setTimeout(() => loadWithProxy(attempt + 1), attempt * 1000);
                    } else {
                        log('❌ 本地代理重试次数耗尽', 'error');
                        log('💡 请检查本地代理服务器是否正常运行', 'info');
                    }
                }
            },
            onerror: function(error) {
                log(`❌ 本地代理请求错误: ${error}`, 'error');
                if (attempt < CONFIG.RETRY_ATTEMPTS) {
                    log(`🔄 将在 ${attempt * 1000}ms 后重试...`, 'info');
                    setTimeout(() => loadWithProxy(attempt + 1), attempt * 1000);
                } else {
                    log('❌ 本地代理重试次数耗尽', 'error');
                    log('💡 请检查本地代理服务器是否正常运行', 'info');
                }
            },
            ontimeout: function() {
                log('⏰ 本地代理请求超时', 'warn');
                if (attempt < CONFIG.RETRY_ATTEMPTS) {
                    log(`🔄 将在 ${attempt * 1000}ms 后重试...`, 'info');
                    setTimeout(() => loadWithProxy(attempt + 1), attempt * 1000);
                } else {
                    log('❌ 本地代理重试次数耗尽', 'error');
                    log('💡 请检查本地代理服务器是否正常运行', 'info');
                }
            }
        });
    }
    
    // 使用 script 标签加载
    function loadWithScriptTag(url, attempt) {
        const script = document.createElement('script');
        script.src = url;
        
        const timeout = setTimeout(() => {
            log('⏰ 本地代理脚本加载超时', 'warn');
            script.remove();
            if (attempt < CONFIG.RETRY_ATTEMPTS) {
                log(`🔄 将在 ${attempt * 1000}ms 后重试...`, 'info');
                setTimeout(() => loadWithProxy(attempt + 1), attempt * 1000);
            } else {
                log('❌ 本地代理重试次数耗尽', 'error');
                log('💡 请检查本地代理服务器是否正常运行', 'info');
            }
        }, CONFIG.TIMEOUT);
        
        script.onload = function() {
            clearTimeout(timeout);
            log('✅ 代理加载成功', 'success');
            // 给SDK一些时间来初始化全局变量
            setTimeout(initializeChatClient, 100);
        };
        
        script.onerror = function() {
            clearTimeout(timeout);
            log('❌ 本地代理加载失败', 'error');
            if (attempt < CONFIG.RETRY_ATTEMPTS) {
                log(`🔄 将在 ${attempt * 1000}ms 后重试...`, 'info');
                setTimeout(() => loadWithProxy(attempt + 1), attempt * 1000);
            } else {
                log('❌ 本地代理重试次数耗尽', 'error');
                log('💡 请检查本地代理服务器是否正常运行', 'info');
            }
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
                    text: '使用本地代理模式加载',
                    timeout: 3000
                });
            }
            
        } catch (error) {
            log('❌ Coze 聊天组件初始化失败', 'error');
            log(`📛 错误: ${error.message}`, 'error');
            log(`📋 堆栈: ${error.stack}`, 'debug');
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
        log('📋 建议解决方案:', 'info');
        log('1. 启动本地CORS代理服务器: python start_proxy.py', 'info');
        log('2. 检查代理服务器是否在 127.0.0.1:8080 运行', 'info');
        log('3. 查看浏览器控制台获取详细错误信息', 'info');
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