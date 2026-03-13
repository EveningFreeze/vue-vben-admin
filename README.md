## 🌟 项目简介

本项目由 **海底一队** 开发，是在开源框架 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) 基础上深度定制的智慧英语教育系统。通过集成 Gemini AI 大模型与大数据可视化技术，我们为英语学习者提供从**作文批改、词汇测评、备考规划**到**在线交互学习**的全链路支撑。

### 🚀 海底一队定制功能

- **学情分析大屏**：重写了 Dashboard 模块，引入核心能力雷达图与学习热力图。
- **AI 作文深度批改**：集成 OCR 识别，支持衡水体视觉纠偏与多维语义评分。
- **局部打卡交互逻辑**：在工作台（Workbench）实现了无跳转的原地词汇回顾功能。
- **智能备考引擎**：基于动态路由与 Pinia 状态管理实现的个性化备考周期规划。

------

## 🛠️ 源码使用指南

### 1. 环境准备

- **Node.js**: `18.12.0` 或 `20.0.0`
- **pnpm**: `8.1.0`
- **IDE**: VS Code (推荐安装插件: Vben Admin Extension, Volar)

### 2. 快速启动

Bash

```
# 克隆仓库
git clone https://github.com/EveningFreeze/vue-vben-admin.git

# 安装依赖 (Vben 推荐使用 pnpm)
pnpm install

# 配置环境变量
# 请在 .env.development 中配置你的 Gemini API Key 或 后端接口地址
VITE_GLOB_API_URL=/api

# 运行项目
pnpm dev
```

### 3. 项目打包

Bash

```
# 构建生产环境
pnpm build
```

------

## 🏗️ 二次开发文档 (Vben 规范)

### 1. 业务代码目录说明

我们将业务逻辑高度解耦，主要开发位于以下路径：

- `src/views/english-learning/`: **核心业务**。包含作文批改（Essay）、词汇测评（Quiz）、备考规划（Report）等页面。
- `src/views/dashboard/workspace/`: **工作台中枢**。定制化了用户打卡逻辑与模块预览。
- `src/components/English/`: **业务组件**。封装了单词卡片、AI 聊天框等通用 UI。

### 2. 如何添加新功能模块

1. **定义路由**：在 `src/router/routes/modules/english.ts` 中添加新的路由配置。
2. **创建页面**：在 `src/views/english-learning/` 下新建文件夹，利用 Vben 提供的 `PageWrapper` 组件包裹页面，保持 UI 风格统一。
3. **状态管理**：复杂的学习进度逻辑请在 `src/store/modules/english.ts` 中维护。

### 3. 调用 AI 接口说明

项目在 `src/api/` 下新增了 `aiService.ts`。

- **作文批改**：调用 `postEssayReview` 接口，传入 OCR 识别后的文本或 Base64 图片。
- **语法答疑**：利用 `useSSE` (Server-Sent Events) 或标准 API 实现与 Gemini 的流式交互。

### 4. 样式规范

- 遵循 Vben 的 **Tailwind CSS** 优先原则。
- 主题色修改请查阅 `build/config/themeConfig.ts` 或使用页面右侧的配置面板。

------

## 🤝 团队信息

- **开发团队**: 海底一队 
- **技术栈**: Vue 3 + TypeScript + Ant Design Vue + Gemini AI
- **致谢**: 感谢 `vue-vben-admin` 提供的优秀企业级后台架构。

------

