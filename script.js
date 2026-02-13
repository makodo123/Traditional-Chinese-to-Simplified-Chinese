/* ========================================
   繁簡轉換器 — Script
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
    const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

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

        const result = converter(raw);
        outputText.textContent = result;
        outputCount.textContent = `${result.length} 字`;
    }

    function debouncedConvert() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(convert, 80);
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

})();
