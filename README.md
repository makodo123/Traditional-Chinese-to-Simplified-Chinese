# 繁簡轉換器 (Traditional Chinese to Simplified Chinese)

一個簡潔、美觀、高效的線上繁體中文轉簡體中文工具。

[![GitHub Pages](https://img.shields.io/badge/demo-online-brightgreen)](https://makodo123.github.io/TtoS/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ 特色功能

- 🚀 **即時轉換** - 輸入繁體中文，立即顯示簡體結果
- 📋 **一鍵複製** - 快速複製轉換結果到剪貼簿
- 🔒 **隱私保護** - 所有處理在瀏覽器本地完成，資料不上傳
- 📱 **響應式設計** - 完美支援桌面與行動裝置
- 🎨 **現代化介面** - 流暢動畫與優雅的視覺設計
- ⚡ **輕量快速** - 無需後端，純前端實現
- 🔤 **字數統計** - 即時顯示輸入與輸出字數

## 🎯 線上體驗

**立即使用：** [https://makodo123.github.io/TtoS/](https://makodo123.github.io/TtoS/)

## 🛠️ 技術架構

- **HTML5** - 語義化標記
- **CSS3** - 現代化樣式 + 動態背景效果
- **JavaScript** - 原生 JS，無框架依賴
- **OpenCC** - 開源中文轉換引擎 ([opencc-js](https://github.com/nk2028/opencc-js))
- **Google Fonts** - 思源黑體 (Noto Sans TC/SC)

## 📦 本地部署

### 方法一：直接開啟

1. 下載本專案
2. 用瀏覽器直接開啟 `index.html`

### 方法二：HTTP 伺服器

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 PHP
php -S localhost:8000
```

然後訪問 `http://localhost:8000`

## 📁 檔案結構

```
TtoS/
├── index.html      # 主頁面
├── style.css       # 樣式表
├── script.js       # 轉換邏輯
└── README.md       # 說明文件
```

## 🎨 介面預覽

- **簡潔設計** - 左右對稱的雙面板佈局
- **動態背景** - 漸變色彩球體浮動效果
- **即時反饋** - 複製成功提示、字數即時更新
- **無障礙支援** - 完整的 ARIA 標籤與鍵盤導航

## 🔧 核心功能

### 繁簡轉換

使用 [OpenCC](https://github.com/BYVoid/OpenCC) (Open Chinese Convert) 進行高精準度轉換：

- 支援台灣正體 → 大陸簡體
- 智能詞彙轉換（例如：軟體 → 软件）
- 保留原文格式與換行

### 互動功能

- **清除按鈕** - 快速清空輸入區
- **轉換按鈕** - 執行繁簡轉換
- **複製按鈕** - 一鍵複製結果 + 視覺確認
- **即時字數** - 動態顯示字數統計

## 📝 使用說明

1. 在左側「繁體中文」區域輸入或貼上文字
2. 點擊中間的 **→** 按鈕進行轉換
3. 右側「简体中文」區域會即時顯示結果
4. 點擊右上角的 **複製** 按鈕，將結果複製到剪貼簿

## 🌐 瀏覽器支援

- ✅ Chrome / Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ iOS Safari
- ✅ Android Chrome

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 🙏 致謝

- [OpenCC](https://github.com/BYVoid/OpenCC) - 優秀的開源中文轉換工具
- [opencc-js](https://github.com/nk2028/opencc-js) - JavaScript 移植版本
- [Google Fonts](https://fonts.google.com) - 思源黑體字型

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📧 聯絡

如有問題或建議，歡迎透過 [GitHub Issues](https://github.com/makodo123/TtoS/issues) 反饋。

---

<p align="center">Made with ❤️ | 繁體中文 → 簡體中文</p>
