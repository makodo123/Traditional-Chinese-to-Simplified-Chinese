/* ========================================
   繁簡轉換器 — Script (增強版 v1.2)
   ======================================== */

(function () {
    'use strict';

    // DOM elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const inputCount = document.getElementById('inputCount');
    const outputCount = document.getElementById('outputCount');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const toast = document.getElementById('toast');

    // OpenCC converter: Traditional (tw) → Simplified (cn)
    let converter = null;
    let isConverterReady = false;

    // Wait for OpenCC to load
    function initConverter() {
        if (typeof OpenCC !== 'undefined') {
            converter = OpenCC.Converter({ from: 'tw', to: 'cn' });
            isConverterReady = true;
            console.log('✅ OpenCC converter ready');
        } else {
            setTimeout(initConverter, 100);
        }
    }
    initConverter();

    // ── Conversion ──────────────────────────
    let debounceTimer = null;

    function convert() {
        const raw = inputText.value;
        const len = raw.length;
        inputCount.textContent = `${len} 字`;

        if (!raw.trim()) {
            outputText.innerHTML = '<span class="placeholder-text">轉換結果將顯示在這裡...</span>';
            outputCount.textContent = '0 字';
            return;
        }

        if (!isConverterReady) {
            outputText.innerHTML = '<span class="placeholder-text">⏳ 載入轉換引擎中...</span>';
            return;
        }

        try {
            const result = converter(raw);
            outputText.textContent = result;
            outputCount.textContent = `${result.length} 字`;
            
            // Save to localStorage + history
            saveToLocalStorage(raw, result);
            addToHistory(raw, result);
        } catch (error) {
            console.error('Conversion error:', error);
            showToast('❌ 轉換失敗，請重試');
        }
    }

    function debouncedConvert() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(convert, 80);
    }

    // ── 優化1: 增強鍵盤快捷鍵 ───────────────
    const shortcuts = {
        enabled: true,
        list: [
            { keys: 'Ctrl+Enter', desc: '快速轉換' },
            { keys: 'Ctrl+K', desc: '清除全部' },
            { keys: 'Ctrl+C', desc: '複製結果' },
            { keys: 'Ctrl+/', desc: '顯示快捷鍵幫助' }
        ]
    };

    document.addEventListener('keydown', (e) => {
        if (!shortcuts.enabled) return;

        // Ctrl+Enter / Cmd+Enter: Convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convert();
            showToast('⚡ 快速轉換完成');
            trackShortcut('convert');
        }
        
        // Ctrl+K / Cmd+K: Clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearBtn.click();
            showToast('🧹 已清除');
            trackShortcut('clear');
        }

        // Ctrl+C when focus on output: Copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === outputText) {
            e.preventDefault();
            copyBtn.click();
            trackShortcut('copy');
        }

        // Ctrl+/: Show shortcuts help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            showShortcutsHelp();
            trackShortcut('help');
        }
        
        // Escape: Clear (when focused on input)
        if (e.key === 'Escape' && document.activeElement === inputText) {
            e.preventDefault();
            clearBtn.click();
        }
    });

    function showShortcutsHelp() {
        const helpText = shortcuts.list.map(s => `${s.keys}: ${s.desc}`).join('\n');
        alert(`⌨️ 鍵盤快捷鍵:\n\n${helpText}`);
    }

    function trackShortcut(action) {
        const count = parseInt(localStorage.getItem('ttos_shortcuts_' + action) || '0');
        localStorage.setItem('ttos_shortcuts_' + action, count + 1);
    }

    // ── 優化2: 增強自動保存（多版本歷史）──────
    const STORAGE_KEY = 'ttos_last_conversion';
    const HISTORY_KEY = 'ttos_history';
    const MAX_HISTORY = 10;

    function saveToLocalStorage(input, output) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                input,
                output,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                // Only restore if less than 24 hours old
                if (Date.now() - data.timestamp < 86400000) {
                    inputText.value = data.input || '';
                    if (data.output) {
                        outputText.textContent = data.output;
                        outputCount.textContent = `${data.output.length} 字`;
                    }
                    inputCount.textContent = `${(data.input || '').length} 字`;
                    
                    // Show restore notification
                    const age = Math.floor((Date.now() - data.timestamp) / 60000);
                    showToast(`♻️ 已恢復 ${age} 分鐘前的內容`);
                }
            }
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
        }
    }

    function addToHistory(input, output) {
        try {
            let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            
            // Add new entry
            history.unshift({
                input: input.substring(0, 100), // First 100 chars only
                output: output.substring(0, 100),
                timestamp: Date.now(),
                inputLength: input.length,
                outputLength: output.length
            });

            // Keep only last MAX_HISTORY items
            history = history.slice(0, MAX_HISTORY);
            
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.warn('History save failed:', e);
        }
    }

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
        showToast('🗑️ 歷史記錄已清除');
    }

    // ── 優化3: 智能字數限制與警告 ───────────
    const CHAR_LIMITS = {
        warning: 8000,   // 警告閾值
        max: 10000,      // 最大限制
        optimal: 5000    // 建議範圍
    };

    let limitWarningShown = false;

    inputText.addEventListener('input', function() {
        const len = this.value.length;
        
        // Update count with color coding
        updateCharCountDisplay(len);
        
        // Warning at 80%
        if (len >= CHAR_LIMITS.warning && !limitWarningShown) {
            showToast(`⚠️ 字數接近上限 (${len}/${CHAR_LIMITS.max})`, false, 3000);
            limitWarningShown = true;
        }
        
        // Reset warning flag when below threshold
        if (len < CHAR_LIMITS.warning) {
            limitWarningShown = false;
        }
        
        // Hard limit
        if (len >= CHAR_LIMITS.max) {
            this.value = this.value.substring(0, CHAR_LIMITS.max);
            showToast(`🛑 已達字數上限 ${CHAR_LIMITS.max} 字`);
        }
        
        // Trigger conversion
        debouncedConvert();
    });

    function updateCharCountDisplay(len) {
        const percentage = (len / CHAR_LIMITS.max) * 100;
        
        if (len > CHAR_LIMITS.warning) {
            inputCount.style.color = '#f59e0b'; // Orange
        } else if (len > CHAR_LIMITS.optimal) {
            inputCount.style.color = '#fbbf24'; // Yellow
        } else {
            inputCount.style.color = ''; // Default
        }
    }

    // ── Events ──────────────────────────────
    convertBtn.addEventListener('click', () => {
        convert();
        convertBtn.style.transform = 'scale(0.9)';
        setTimeout(() => { convertBtn.style.transform = ''; }, 150);
    });

    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.innerHTML = '<span class="placeholder-text">轉換結果將顯示在這裡...</span>';
        inputCount.textContent = '0 字';
        outputCount.textContent = '0 字';
        inputCount.style.color = '';
        inputText.focus();
        localStorage.removeItem(STORAGE_KEY);
    });

    // ── Copy to clipboard ───────────────────
    copyBtn.addEventListener('click', async () => {
        const text = outputText.textContent;
        if (!text || outputText.querySelector('.placeholder-text')) {
            showToast('⚠️ 沒有可複製的內容');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast('✅ 已複製到剪貼簿', true);
            setCopiedState(true);
            trackEvent('copy', { length: text.length });
        } catch {
            fallbackCopy(text);
        }
    });

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('✅ 已複製到剪貼簿', true);
            setCopiedState(true);
        } catch {
            showToast('❌ 複製失敗，請手動選取複製');
        }
        document.body.removeChild(ta);
    }

    function setCopiedState(on) {
        const iconCopy = copyBtn.querySelector('.icon-copy');
        const iconCheck = copyBtn.querySelector('.icon-check');
        const label = copyBtn.querySelector('.copy-label');

        if (on) {
            copyBtn.classList.add('copied');
            iconCopy.style.display = 'none';
            iconCheck.style.display = 'inline';
            label.textContent = '已複製';
            setTimeout(() => setCopiedState(false), 2000);
        } else {
            copyBtn.classList.remove('copied');
            iconCopy.style.display = 'inline';
            iconCheck.style.display = 'none';
            label.textContent = '複製';
        }
    }

    // ── Toast notification ──────────────────
    let toastTimer = null;

    function showToast(msg, success, duration = 2200) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.classList.toggle('success', !!success);
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // ── Analytics ───────────────────────────
    function trackEvent(action, data) {
        console.log(`[Analytics] ${action}:`, data);
    }

    // ── Initialize ──────────────────────────
    window.addEventListener('DOMContentLoaded', () => {
        loadFromLocalStorage();
        trackEvent('page_load', { 
            referrer: document.referrer,
            historyCount: getHistory().length
        });
        
        // Show stats in console
        const stats = {
            shortcuts: {
                convert: localStorage.getItem('ttos_shortcuts_convert') || 0,
                clear: localStorage.getItem('ttos_shortcuts_clear') || 0,
                copy: localStorage.getItem('ttos_shortcuts_copy') || 0
            },
            historyEntries: getHistory().length
        };
        console.log('📊 TtoS Stats:', stats);
    });

    // ── Expose to window for debugging ──────
    window.TtoS = {
        version: '1.2.0',
        getHistory,
        clearHistory,
        shortcuts
    };

})();
