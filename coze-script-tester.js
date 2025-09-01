// ==UserScript==
// @name         Coze Script Tester
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  测试 Coze Chat Tampermonkey 脚本在不同网站上的兼容性
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // 测试配置
    const TEST_CONFIG = {
        TEST_SITES: [
            'https://www.google.com',
            'https://www.youtube.com',
            'https://www.github.com',
            'https://www.microsoft.com',
            'https://www.msn.com',
            'https://www.reddit.com',
            'https://www.twitter.com',
            'https://www.facebook.com'
        ],
        TEST_INTERVAL: 5000, // 5秒测试间隔
        MAX_RETRIES: 3,
        TIMEOUT: 10000 // 10秒超时
    };

    // 测试状态
    let testResults = {
        basic: {},
        pro: {},
        currentSite: '',
        testIndex: 0
    };

    // 初始化测试
    function initTesting() {
        console.log('🧪 Coze Script Tester 初始化');
        console.log('📋 将测试以下网站:', TEST_CONFIG.TEST_SITES.join(', '));
        
        // 加载保存的测试结果
        const savedResults = GM_getValue('testResults', {});
        if (Object.keys(savedResults).length > 0) {
            testResults = savedResults;
            console.log('📊 加载了保存的测试结果');
        }

        startTesting();
    }

    // 开始测试
    function startTesting() {
        if (testIndex >= TEST_CONFIG.TEST_SITES.length) {
            console.log('✅ 所有网站测试完成');
            showFinalResults();
            return;
        }

        const site = TEST_CONFIG.TEST_SITES[testIndex];
        testResults.currentSite = site;
        testIndex++;

        console.log(`🌐 开始测试: ${site}`);
        testSite(site);
    }

    // 测试单个网站
    function testSite(site) {
        // 测试基础版脚本
        testScript('basic', site, () => {
            // 测试专业版脚本
            testScript('pro', site, () => {
                // 保存结果并继续下一个
                GM_setValue('testResults', testResults);
                setTimeout(startTesting, TEST_CONFIG.TEST_INTERVAL);
            });
        });
    }

    // 测试特定脚本
    function testScript(scriptType, site, callback) {
        console.log(`🔧 测试 ${scriptType} 版脚本在 ${site}`);

        GM_xmlhttpRequest({
            method: 'GET',
            url: site,
            timeout: TEST_CONFIG.TIMEOUT,
            onload: function(response) {
                analyzeResponse(scriptType, site, response, true, callback);
            },
            onerror: function(error) {
                analyzeResponse(scriptType, site, error, false, callback);
            },
            ontimeout: function() {
                console.log(`⏰ ${scriptType} 版在 ${site} 超时`);
                recordResult(scriptType, site, 'timeout');
                callback();
            }
        });
    }

    // 分析响应
    function analyzeResponse(scriptType, site, response, success, callback) {
        const hasCSP = checkCSP(response);
        const result = {
            success: success,
            hasCSP: hasCSP,
            status: response.status,
            timestamp: new Date().toISOString()
        };

        if (success) {
            console.log(`✅ ${scriptType} 版在 ${site} 访问成功`);
            if (hasCSP) {
                console.log(`🔒 检测到CSP限制`);
            }
        } else {
            console.log(`❌ ${scriptType} 版在 ${site} 访问失败`);
        }

        recordResult(scriptType, site, result);
        callback();
    }

    // 检查CSP
    function checkCSP(response) {
        const headers = response.responseHeaders;
        if (!headers) return false;

        const cspHeaders = headers.toLowerCase().includes('content-security-policy') ||
                          headers.toLowerCase().includes('x-content-security-policy');
        
        return cspHeaders;
    }

    // 记录结果
    function recordResult(scriptType, site, result) {
        if (!testResults[scriptType]) {
            testResults[scriptType] = {};
        }
        testResults[scriptType][site] = result;
    }

    // 显示最终结果
    function showFinalResults() {
        console.log('📊 ====== 最终测试结果 ======');
        
        Object.keys(testResults.basic).forEach(site => {
            const basicResult = testResults.basic[site];
            const proResult = testResults.pro[site];
            
            console.log(`\n🌐 ${site}`);
            console.log(`  基础版: ${formatResult(basicResult)}`);
            console.log(`  专业版: ${formatResult(proResult)}`);
            
            if (basicResult && proResult) {
                const basicSuccess = basicResult.success;
                const proSuccess = proResult.success;
                
                if (!basicSuccess && proSuccess) {
                    console.log(`  🎉 专业版成功解决了基础版的问题!`);
                } else if (!basicSuccess && !proSuccess) {
                    console.log(`  ❗ 两个版本都失败，可能需要其他解决方案`);
                }
            }
        });

        // 发送通知
        GM_notification({
            text: 'Coze脚本测试完成，查看控制台获取结果',
            title: '测试完成',
            timeout: 5000
        });
    }

    // 格式化结果
    function formatResult(result) {
        if (!result) return '未测试';
        
        if (result === 'timeout') {
            return '⏰ 超时';
        }
        
        return result.success ? 
            `✅ 成功${result.hasCSP ? ' (有CSP)' : ''}` : 
            `❌ 失败`;
    }

    // 导出测试结果
    function exportResults() {
        const data = JSON.stringify(testResults, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coze-test-results.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 添加测试控制界面
    function addTestUI() {
        const style = `
            .coze-tester {
                position: fixed;
                top: 10px;
                right: 10px;
                background: white;
                border: 2px solid #007bff;
                border-radius: 8px;
                padding: 15px;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-family: Arial, sans-serif;
                min-width: 250px;
            }
            .coze-tester h3 {
                margin: 0 0 10px 0;
                color: #007bff;
                font-size: 14px;
            }
            .coze-tester button {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin: 5px 0;
                width: 100%;
                font-size: 12px;
            }
            .coze-tester button:hover {
                background: #0056b3;
            }
            .coze-tester .status {
                font-size: 12px;
                margin: 5px 0;
                padding: 5px;
                border-radius: 3px;
            }
            .coze-tester .success {
                background: #d4edda;
                color: #155724;
            }
            .coze-tester .error {
                background: #f8d7da;
                color: #721c24;
            }
        `;

        const styleElem = document.createElement('style');
        styleElem.textContent = style;
        document.head.appendChild(styleElem);

        const div = document.createElement('div');
        div.className = 'coze-tester';
        div.innerHTML = `
            <h3>🧪 Coze 脚本测试器</h3>
            <div class="status" id="testStatus">就绪</div>
            <button onclick="window.startCozeTest()">开始测试</button>
            <button onclick="window.exportCozeResults()">导出结果</button>
            <button onclick="window.clearCozeResults()">清除结果</button>
        `;

        document.body.appendChild(div);

        // 暴露全局函数
        window.startCozeTest = initTesting;
        window.exportCozeResults = exportResults;
        window.clearCozeResults = function() {
            testResults = { basic: {}, pro: {} };
            GM_setValue('testResults', {});
            console.log('🗑️ 测试结果已清除');
        };
    }

    // 主执行
    setTimeout(() => {
        addTestUI();
        console.log('🔧 Coze Script Tester 已加载');
        console.log('💡 使用右上角的测试面板开始测试');
    }, 2000);

})();