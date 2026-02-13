/* ========================================
   繁簡轉換器 — Script (優化版)
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
            // Retry if OpenCC not loaded yet
            setTimeout(initConverter, 100);
        }
    }

    // Start initialization
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
            
            // Save to localStorage for recovery
            saveToLocalStorage(raw, result);
        } catch (error) {
            console.error('Conversion error:', error);
            showToast('❌ 轉換失敗，請重試');
        }
    }

    function debouncedConvert() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(convert, 80);
    }

    // ── Local Storage (Auto-save) ───────────
    const STORAGE_KEY = 'ttos_last_conversion';

    function saveToLocalStorage(input, output) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                input,
                output,
                timestamp: Date.now()
            }));
        } catch (e) {
            // Quota exceeded or disabled
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
                }
            }
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
        }
    }

    // ── Events ──────────────────────────────
    inputText.addEventListener('input', debouncedConvert);

    convertBtn.addEventListener('click', () => {
        convert();
        // Pulse animation
        convertBtn.style.transform = 'scale(0.9)';
        setTimeout(() => { convertBtn.style.transform = ''; }, 150);
    });

    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.innerHTML = '<span class="placeholder-text">轉換結果將顯示在這裡...</span>';
        inputCount.textContent = '0 字';
        outputCount.textContent = '0 字';
        inputText.focus();
        localStorage.removeItem(STORAGE_KEY);
    });

    // ── Keyboard Shortcuts ──────────────────
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter or Cmd+Enter: Convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convert();
            showToast('⚡ 快速轉換完成');
        }
        
        // Escape: Clear
        if (e.key === 'Escape' && document.activeElement === inputText) {
            e.preventDefault();
            clearBtn.click();
        }
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
            
            // Track analytics (optional)
            trackEvent('copy', { length: text.length });
        } catch {
            // Fallback
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

    function showToast(msg, success) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.classList.toggle('success', !!success);
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    // ── Analytics (Simple) ──────────────────
    function trackEvent(action, data) {
        // Optional: integrate Google Analytics or other
        console.log(`[Analytics] ${action}:`, data);
    }

    // ── Initialize ──────────────────────────
    window.addEventListener('DOMContentLoaded', () => {
        loadFromLocalStorage();
        trackEvent('page_load', { referrer: document.referrer });
    });

    // ── PWA Install Prompt (Optional) ───────
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Show custom install button if desired
        console.log('PWA install available');
    });

})();
