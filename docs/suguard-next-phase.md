# Suguard — AI 智慧学习平台 · 下一阶段功能扩展方案

## 一、平台定位

**平台名称：** Suguard  
**含义：** Study + Guard — AI 学习守护平台  
**覆盖人群：** 中学 · 大学 · 考研  
**覆盖领域：** 英语学习 · 中文学习 · 学术写作

## 二、当前架构

| 模块 | 定位 | 特点 |
|------|------|------|
| Chinese Learning | 国风沉浸式学习系统 | 诗词/古文/闯关/国风设计 |
| English Learning | AI 工具化学习系统 | 作文批改/听力/词汇/AI 语伴 |

**技术栈：** Vue 3 · TypeScript · Vben Admin · Tailwind CSS v4 · ECharts · Composable 架构 · LocalStorage 持久化

**当前问题：** 两个模块的 XP/成就/学习数据完全割裂 (zh-xp / en-xp)，没有统一的用户学习层。

---

## 三、下一阶段目标

从"学习页面集合"升级为 **AI Learning OS（AI 学习操作系统）**，新增三个核心方向：

| 功能 | 类型 | 优先级 |
|------|------|--------|
| AI Academic Writing Center | 真正 AI 学术写作 | S |
| Personal Learning Center | 个人学习中心 | S |
| PDF Knowledge Workspace | PDF 阅读与笔记系统 | A |

---

## 四、AI 学术写作中心

### 4.1 现状与目标

当前 `essay/index.vue` 本质是 Mock AI — 随机评分、前端演示逻辑。下一阶段接入真实大模型 API。

### 4.2 推荐目录结构

```
english-learning/
└── writing-center/
    ├── index.vue          # 主页面
    ├── components/
    │   ├── Editor.vue          # Markdown/富文本编辑器
    │   ├── AIPanel.vue         # AI 分析侧栏
    │   ├── ScoreCard.vue       # 评分卡片
    │   ├── SuggestionList.vue  # 建议列表
    │   └── CitationTool.vue    # 引用工具
    ├── composables/
    │   ├── use-writing.ts      # 写作状态管理
    │   └── use-ai-scoring.ts   # AI 评分逻辑
    ├── services/
    │   └── api.ts              # 后端 API 代理层
    └── types.ts
```

> 注意：以 `writing-center` 替代 `essay`，因为"Writing Center"比"Essay"更产品化。

### 4.3 API 架构

```
Frontend (Vue)
    ↓
Suguard API Server (NestJS)
    ↓
LLM Provider (OpenAI / DeepSeek / Qwen / Claude / Gemini)
```

**不要前端直连 LLM。** 必须通过后端代理，保证 API Key 安全、支持模型切换、实现请求缓存和限流。

### 4.4 模型支持

```typescript
type AIProvider =
  | 'openai'
  | 'deepseek'
  | 'qwen'
  | 'claude'
  | 'gemini';
```

抽象 Provider 层，未来可随时切换。

### 4.5 核心 AI 功能

#### （1）作文评分

**输入：** 作文正文、考试类型 (IELTS/TOEFL/CET/考研)、目标分数  
**输出：**

```json
{
  "overallScore": 7.5,
  "grammar": 7,
  "vocabulary": 8,
  "coherence": 7,
  "taskResponse": 8,
  "suggestions": ["..."],
  "strengths": ["..."],
  "weaknesses": ["..."]
}
```

#### （2）段落优化

用户选中某一句 → AI 返回多个改写版本：
- 更高级表达
- 更学术化表达
- 更自然表达

#### （3）Grammar Explain

不仅改错，还要**解释为什么错**。这是学习产品的核心差异。

#### （4）Academic Rewrite

支持多种改写方向：
- Casual → Academic
- Simple → Advanced
- Wordy → Concise

#### （5）Citation Assist（后期扩展）

支持 APA / MLA / Chicago 格式的引用生成。

### 4.6 UI 结构

**左中右三栏布局：**

```
┌─────────────┬──────────────────────┬──────────────┐
│ 作文结构导航  │   编辑器              │  AI 分析面板   │
│             │   (Markdown/富文本)    │              │
│ Introduction │   AI Inline Suggestion │  Grammar     │
│ Body 1      │                       │  Vocabulary  │
│ Body 2      │                       │  Structure   │
│ Conclusion  │                       │  Tone        │
│             │                       │  Score       │
│             │                       │  Suggestions │
└─────────────┴──────────────────────┴──────────────┘
```

---

## 五、个人学习中心

### 5.1 功能定位

这是下一阶段**最重要的功能**。当前英语有 `report`、中文有 `dashboard`，但没有真正的"用户中心"。

**独立目录：** `learning-center/`（独立于 chinese-learning / english-learning），作为全平台学习中枢。

### 5.2 页面结构

```
┌────────────────────────────────────────┐
│ 👋 欢迎回来，今日学习 2h               │
│ Lv.8 · 连续学习 12 天                  │
│ 🔥 ● XP 进度条                         │
└────────────────────────────────────────┘

┌───────────────────┬────────────────────┐
│ 🍅 番茄专注       │ 📚 最近学习         │
│ 25:00             │ 英语听力 / 古文阅读  │
│ [开始] [暂停]     │ 词汇闯关 / 诗词精读  │
│ 今日 4 次         │                    │
├───────────────────┼────────────────────┤
│ 🧠 AI 学习建议     │ 📈 本周学习分析     │
│ • 完成一篇英语写作  │ [双色柱状图]       │
│ • 复习昨日错词     │ 英语 文学          │
│ • 阅读《岳阳楼记》  │                    │
├───────────────────┴────────────────────┤
│ 📝 我的笔记                            │
│ • 英语作文常见错误汇总                  │
│ • 《将进酒》精读笔记                     │
│ • PDF 阅读笔记 — Chapter 3             │
└────────────────────────────────────────┘
```

**设计参考：** Notion Dashboard + Duolingo Progress + Studyverse + AI Coach

---

## 六、番茄钟系统升级

### 6.1 现状

当前 `report/index.vue` 中的番茄钟只是页面级组件。下一阶段要独立成为**全平台专注系统**。

### 6.2 目录

```
learning-center/
└── focus-room/
    ├── index.vue
    ├── components/
    │   ├── Timer.vue
    │   ├── Stats.vue
    │   ├── SoundPicker.vue
    │   └── SessionLog.vue
    └── composables/
        └── use-focus.ts
```

### 6.3 功能

| 功能 | 说明 |
|------|------|
| 专注时长 | 25 / 45 / 自定义 |
| 倒计时 | 暂停/继续/重置 |
| 自动休息 | 专注完成后自动进入休息 |
| 学习统计 | 总次数、总时长、连续专注天数 |
| 专注模式 | 深度专注 / 轻度学习 / 阅读模式 / 写作模式 |
| 背景音 | 白噪音 / 雨声 / 图书馆 / LoFi |

### 6.4 数据结构

```typescript
interface FocusSession {
  id: string;
  date: string;       // ISO date
  duration: number;    // minutes
  mode: FocusMode;
  completed: boolean;
  tags: string[];      // 关联学习模块
}

type FocusMode = 'deep' | 'light' | 'reading' | 'writing';
```

---

## 七、PDF 知识工作区

这是平台真正进入 AI 学习产品阶段的关键功能。

### 7.1 功能定位

用户可以导入 PDF、阅读教材、做笔记、AI 总结、AI 问答、高亮内容。

**参考产品：** Notion AI · ChatPDF · Readwise · MarginNote

### 7.2 目录

```
pdf-workspace/
├── index.vue
├── components/
│   ├── PDFViewer.vue       # PDF 阅读器（基于 pdf.js）
│   ├── Sidebar.vue          # 笔记/大纲侧栏
│   ├── AIQueryPanel.vue     # AI 问答面板
│   ├── HighlightLayer.vue   # 高亮层
│   └── FlashcardGen.vue     # 知识卡片生成
├── composables/
│   ├── use-pdf.ts
│   ├── use-annotation.ts
│   └── use-pdf-ai.ts
├── services/
│   └── pdf-api.ts
└── types.ts
```

### 7.3 核心功能

| 功能 | 说明 |
|------|------|
| PDF 导入 | 拖拽上传 + 本地文件选择 |
| PDF 阅读器 | 翻页 / 缩放 / 搜索 / 目录 / 高亮 |
| 侧边笔记 | 选中文本 → 添加笔记 → 自动保存 |
| AI 问答 | "总结第三章" / "解释这个概念的学术定义" / "生成复习提纲" |
| 知识卡片 | AI 自动生成 Quiz / Flashcards / Summary |

### 7.4 笔记数据模型

```typescript
interface PDFAnnotation {
  id: string;
  pdfId: string;
  page: number;
  selection: string;       // 选中文本
  note: string;            // 用户笔记
  highlightColor?: string;
  createdAt: string;
  aiSummary?: string;      // AI 自动摘要
}
```

---

## 八、统一平台架构

### 8.1 当前问题

两个模块是**平行关系**，数据完全割裂：

```
chinese-learning/  → zh-xp, zh-achievements
english-learning/  → en-xp, en-achievements
```

### 8.2 下一阶段：引入 Platform Layer

```
src/views/
├── learning-center/       # 平台学习中心（新）
├── chinese-learning/      # 文学素养模块
├── english-learning/      # 英语学习模块
├── pdf-workspace/         # PDF 知识工作区（新）
├── writing-center/        # 学术写作中心（新）
└── shared-learning/       # 跨模块共享组件（新）

src/
├── services/
│   └── ai/                # AI Service Layer（新）
└── stores/
    └── sg-user-profile/   # 统一用户状态（新）
```

### 8.3 统一学习系统

**平台级数据存储（必须做）：**

```
sg-user-profile    → 用户画像
sg-learning-stats  → 跨模块学习统计
sg-achievements    → 统一成就系统
sg-focus-data      → 专注数据
```

统一 Storage 前缀 `sg-`，替代现:
- `en-xp` / `zh-uni-xp` → `sg-xp`
- `en-streak` / `zh-uni-streak` → `sg-streak`

### 8.4 XP 系统升级

从模块级 XP → **平台级 XP**：

```typescript
interface SgXP {
  total: number;
  breakdown: {
    english: number;
    chinese: number;
    writing: number;
    reading: number;
    focus: number;
  };
  level: number;
  history: { date: string; amount: number; source: string }[];
}
```

### 8.5 Skill Tree 系统（推荐）

用户将拥有跨模块的学习画像：

```
Vocabulary:    Lv.3  ■■■□□□
Writing:       Lv.5  ■■■■■■
Listening:     Lv.2  ■■□□□□
Classical:     Lv.4  ■■■■□□
Grammar:       Lv.3  ■■■□□□
```

---

## 九、AI 中枢（未来核心）

### 9.1 Suguard AI Coach

最终形态：全平台顶部的统一 AI 助手。

**功能：**
- 每日学习建议（根据跨模块数据分析）
- 智能学习路径规划
- 薄弱点识别与推荐练习
- 跨模块知识关联提醒

**示例：**

```
🧠 今天的学习建议：
1. 完成一篇英语写作（距离上次写作已过 3 天）
2. 复习昨日错词本中的 15 个单词（遗忘曲线临界点）
3. 阅读《岳阳楼记》—— 与当前英语议论文论证结构有共通之处
```

---

## 十、统一设计语言

### 10.1 当前问题

- 中文偏国风（紫金色系 + 古风元素）
- 英语偏渐变科技（靛蓝 + 电蓝）

### 10.2 下一阶段

建立 **Suguard Design System**，中文 / 英语只是 Theme Variant：

```
design/
├── sg-tokens.css        # 统一设计令牌
├── sg-layout.css        # 布局系统
├── sg-typography.css    # 排版系统
├── sg-animations.css    # 动效系统
└── themes/
    ├── chinese.css      # 文学素养主题变体
    └── english.css      # 英语学习主题变体
```

### 10.3 视觉方向

"现代 AI 学习平台"——关键词：

| 方向 | 说明 |
|------|------|
| Calm | 安静、专注的视觉氛围 |
| Focused | 内容优先、减少干扰 |
| Academic | 学术质感、信息密度适中 |
| AI-native | AI 交互自然融入 |
| Productive | 工具导向、效率优先 |

**设计参考：**

| 产品 | 可借鉴 |
|------|--------|
| Notion | 信息结构 |
| Linear | 深色质感 |
| Duolingo | Gamification |
| Readwise | 阅读体验 |
| ChatGPT | AI 对话 |
| Khan Academy | 学习路径 |

---

## 十一、技术建议

### 11.1 localStorage 已接近极限

当前所有数据存储于 localStorage。下一阶段 AI 历史、PDF、笔记、学习记录等数据量将远超 localStorage 容量限制（约 5-10MB）。

**必须引入后端。**

### 11.2 推荐后端架构

| 组件 | 方案 |
|------|------|
| 框架 | NestJS |
| 数据库 | PostgreSQL |
| 缓存 | Redis |
| AI 代理 | 自建 AI Service Layer |

### 11.3 AI Service Layer

必须抽象独立层：

```
services/
└── ai/
    ├── index.ts              # 统一入口
    ├── providers/
    │   ├── openai.ts
    │   ├── deepseek.ts
    │   ├── qwen.ts
    │   ├── claude.ts
    │   └── gemini.ts
    ├── prompts/
    │   ├── essay-scoring.ts
    │   ├── grammar-check.ts
    │   ├── academic-rewrite.ts
    │   └── pdf-summary.ts
    └── types.ts
```

页面不得直接请求 LLM，必须通过 Service Layer。

---

## 十二、最终目标

Suguard 不应该只是"学习页面集合"，而应该成为 **AI Learning Operating System**。

**核心能力：**

```
学习  ────  写作  ────  阅读
 │                    │
 AI 辅助 ──── 数据分析
 │                    │
专注管理 ──── 知识沉淀
 │                    │
 统 一 到 一 个 长 期 成 长 系 统
```

**阶段路线图：**

| 阶段 | 内容 | 时间 |
|------|------|------|
| Phase 1 | Personal Learning Center + 统一学习系统 | 近期 |
| Phase 2 | AI Academic Writing Center（真实 API） | 中期 |
| Phase 3 | PDF Knowledge Workspace | 中期 |
| Phase 4 | AI Coach 中枢 + Skill Tree | 远期 |
| Phase 5 | 后端 + 数据库 + 用户系统 | 贯穿 |
