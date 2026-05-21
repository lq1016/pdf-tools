# Third-Party Notices

本工程使用了以下开源组件。按相关开源协议要求，在此列出各组件信息。

---

## 直接依赖

### jsPDF
- **版本：** 4.2.1
- **许可证：** MIT
- **仓库：** https://github.com/parallax/jsPDF
- **用途：** 客户端生成 PDF 文件（图片转 PDF 功能）
- **版权声明：** Copyright (c) 2010-2023 James Hall, https://github.com/parallax/jsPDF

### pdf-lib
- **版本：** 1.17.1
- **许可证：** MIT
- **仓库：** https://github.com/Hopding/pdf-lib
- **用途：** PDF 文件的创建、编辑、合并、拆分、旋转、压缩、页面提取
- **版权声明：** Copyright (c) 2019 Andrew Dillon

### pdfjs-dist (PDF.js)
- **版本：** 5.7.284
- **许可证：** Apache-2.0
- **仓库：** https://github.com/mozilla/pdf.js
- **用途：** 在浏览器中渲染 PDF 页面，用于 PDF 转图片功能
- **版权声明：** Copyright (c) 2025 Mozilla Foundation

### Next.js
- **版本：** 16.2.6
- **许可证：** MIT
- **仓库：** https://github.com/vercel/next.js
- **用途：** React 全栈 Web 框架，提供页面路由和构建工具
- **版权声明：** Copyright (c) 2025 Vercel, Inc.

### React
- **版本：** 19.2.6
- **许可证：** MIT
- **仓库：** https://github.com/facebook/react
- **用途：** 前端 UI 库
- **版权声明：** Copyright (c) Meta Platforms, Inc.

### React DOM
- **版本：** 19.2.6
- **许可证：** MIT
- **仓库：** https://github.com/facebook/react
- **用途：** React 浏览器渲染引擎
- **版权声明：** Copyright (c) Meta Platforms, Inc.

---

## 间接依赖（精选）

### @babel/runtime
- **许可证：** MIT
- **用途：** JavaScript 运行时辅助库

### canvg
- **许可证：** MIT
- **用途：** SVG 转 Canvas 渲染（jsPDF 依赖）

### core-js
- **许可证：** MIT
- **用途：** JavaScript 标准库 polyfill

### dompurify
- **许可证：** Apache-2.0 / MPL-2.0
- **用途：** HTML 净化（jsPDF 依赖）

### fflate
- **许可证：** MIT
- **用途：** 压缩/解压缩（jsPDF 依赖）

### html2canvas
- **许可证：** MIT
- **用途：** HTML 截图（jsPDF 依赖）

### sharp
- **许可证：** Apache-2.0
- **用途：** 图片处理（Next.js 依赖，服务端图片优化）

### styled-jsx
- **许可证：** MIT
- **用途：** CSS-in-JS（Next.js 依赖）

### @swc/helpers
- **许可证：** Apache-2.0
- **用途：** SWC 编译辅助（Next.js 依赖）

### postcss
- **许可证：** MIT
- **用途：** CSS 处理工具（Next.js 构建依赖）

### pako
- **许可证：** MIT
- **用途：** 数据压缩/解压缩（pdf-lib 依赖）

### tslib
- **许可证：** 0BSD
- **用途：** TypeScript 运行时辅助

### scheduler
- **许可证：** MIT
- **用途：** React 调度器（React 依赖）

---

> 完整依赖树可通过 `npm ls --all` 查看。各组件均按其原始许可证条款使用，不修改。
