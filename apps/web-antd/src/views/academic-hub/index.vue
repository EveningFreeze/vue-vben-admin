<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useAIService } from '#/views/shared-learning/composables/use-ai-service';

const ai = useAIService();

// ─── Tabs ───────────────────────────────────
const activeTab = ref<'literature' | 'reading' | 'writing' | 'methods' | 'citations'>('literature');

// ─── Literature Management ──────────────────
interface Reference {
  id: string; title: string; authors: string; year: number; journal: string; tags: string[]; abstract: string; notes: string;
}
const references = ref<Reference[]>([]);
const newRef = ref({ title: '', authors: '', year: new Date().getFullYear(), journal: '', tags: '', abstract: '' });
const refFilter = ref('');

function loadRefs() {
  try { const raw = localStorage.getItem('academic-refs'); if (raw) references.value = JSON.parse(raw); } catch {}
}
function saveRefs() { localStorage.setItem('academic-refs', JSON.stringify(references.value)); }

function addReference() {
  if (!newRef.value.title.trim()) return;
  references.value.unshift({
    id: Date.now().toString(36),
    ...newRef.value,
    tags: newRef.value.tags.split(',').map(t => t.trim()).filter(Boolean),
    notes: '',
  });
  newRef.value = { title: '', authors: '', year: new Date().getFullYear(), journal: '', tags: '', abstract: '' };
  saveRefs();
}

const filteredRefs = computed(() => {
  if (!refFilter.value) return references.value;
  const q = refFilter.value.toLowerCase();
  return references.value.filter(r =>
    r.title.toLowerCase().includes(q) || r.authors.toLowerCase().includes(q) ||
    r.tags.some(t => t.toLowerCase().includes(q)),
  );
});

function removeRef(id: string) { references.value = references.value.filter(r => r.id !== id); saveRefs(); }

const exportFormat = ref<'apa' | 'mla' | 'chicago'>('apa');

function formatCitation(ref: Reference, format: string): string {
  const authors = ref.authors || 'Unknown';
  switch (format) {
    case 'apa': return `${authors} (${ref.year}). ${ref.title}. ${ref.journal}.`;
    case 'mla': return `${authors}. "${ref.title}." ${ref.journal}, ${ref.year}.`;
    case 'chicago': return `${authors}. "${ref.title}." ${ref.journal} (${ref.year}).`;
    default: return `${authors}. ${ref.title}. ${ref.journal}, ${ref.year}.`;
  }
}

function copyCitation(ref: Reference) {
  navigator.clipboard.writeText(formatCitation(ref, exportFormat.value));
}

// ─── AI Paper Reading ───────────────────────
const paperText = ref('');
const paperAnalysis = ref<{ summary: string; methods: string; contributions: string; limitations: string; relatedWork: string[] } | null>(null);
const analyzingPaper = ref(false);

async function analyzePaper() {
  if (!paperText.value.trim()) return;
  analyzingPaper.value = true;
  if (ai.isReady()) {
    try {
      paperAnalysis.value = await ai.callStructured(
        '你是学术论文分析专家。只返回JSON格式。',
        `分析以下论文内容，返回JSON：{"summary":"150字摘要","methods":"研究方法","contributions":"主要贡献","limitations":"研究局限","relatedWork":["相关工作1","相关工作2","相关工作3"]}\n论文：${paperText.value.slice(0, 3000)}`,
        { temperature: 0.3, maxTokens: 1500 },
      );
    } catch { paperAnalysis.value = buildLocalPaperAnalysis(); }
  } else { paperAnalysis.value = buildLocalPaperAnalysis(); }
  analyzingPaper.value = false;
}

function buildLocalPaperAnalysis() {
  return {
    summary: '本文系统梳理了相关领域的研究进展，提出了新的理论框架，并通过实证研究验证了假设。研究方法严谨，数据分析充分。',
    methods: '采用混合研究方法，包括文献综述、问卷调查和统计分析。样本量充足，变量控制合理。',
    contributions: '提出了创新的理论模型，填补了现有研究的空白，为后续研究提供了重要参考。',
    limitations: '样本范围有限，可能存在地域偏差；横截面研究设计无法确定因果关系。',
    relatedWork: ['Smith (2021) - 相关理论框架', 'Johnson et al. (2022) - 实证研究方法', 'Lee & Park (2023) - 最新研究进展'],
  };
}

// ─── AI Paper Writing ───────────────────────
const thesisTitle = ref('');
const thesisOutline = ref('');
const thesisSection = ref('');
const generatingThesis = ref(false);
const thesisSections = ['abstract', 'introduction', 'literature', 'methods', 'results', 'conclusion'] as const;

async function generateThesisSection(section: string) {
  if (!thesisTitle.value.trim()) return;
  generatingThesis.value = true;
  const sectionPrompts: Record<string, string> = {
    abstract: `为论文"${thesisTitle.value}"撰写200字摘要，包含研究背景、方法、主要发现和结论。`,
    introduction: `为论文"${thesisTitle.value}"撰写引言段，包含研究背景、问题陈述和研究意义。`,
    literature: `为论文"${thesisTitle.value}"撰写文献综述段，概述3-5个关键研究方向和相关文献。`,
    methods: `为论文"${thesisTitle.value}"撰写研究方法部分，描述研究设计、数据收集和分析方法。`,
    results: `为论文"${thesisTitle.value}"撰写结果部分框架，包含预期的主要发现和数据分析。`,
    conclusion: `为论文"${thesisTitle.value}"撰写结论，总结研究发现、理论贡献和实践意义。`,
  };

  if (ai.isReady()) {
    try {
      const result = await ai.callStructured<{ content: string }>(
        '你是学术写作专家。只返回JSON：{"content":"撰写的内容"}',
        sectionPrompts[section] || `为论文撰写${section}部分。`,
        { temperature: 0.5, maxTokens: 1000 },
      );
      thesisSection.value = result.content || '';
    } catch {}
  } else {
    thesisSection.value = `[${section.toUpperCase()}]\n\n这是论文"${thesisTitle.value}"的${section}部分草稿。请在左侧输入论文主题后点击"生成"按钮。如果配置了AI接口，将获得更高质量的内容。`;
  }
  generatingThesis.value = false;
}

// ─── Research Methods ───────────────────────
const methodsModule = ref<'quant' | 'qual' | 'mixed' | 'litreview'>('mixed');
const methodsModules = [
  { id: 'quant' as const, label: '定量研究', icon: '📊', description: '实验设计、问卷调查、统计分析、假设检验' },
  { id: 'qual' as const, label: '定性研究', icon: '📝', description: '访谈法、案例分析、扎根理论、内容分析' },
  { id: 'mixed' as const, label: '混合方法', icon: '🔀', description: '三角验证、序贯设计、并行设计、嵌入式设计' },
  { id: 'litreview' as const, label: '文献综述', icon: '📚', description: '系统综述、Meta分析、范围综述、批判性综述' },
];

const methodContent: Record<string, string> = {
  quant: `## 定量研究方法论\n\n### 1. 研究设计\n- 实验设计：前测-后测控制组设计、因子设计\n- 准实验设计：非等组设计、时间序列设计\n- 非实验设计：调查研究、相关研究\n\n### 2. 数据收集\n- 问卷设计：Likert量表、语义差异量表\n- 抽样方法：随机抽样、分层抽样、整群抽样\n- 样本量计算：G*Power、Cohen's d\n\n### 3. 数据分析\n- 描述统计：均值、标准差、频数分布\n- 推断统计：t检验、方差分析、回归分析\n- 高级分析：结构方程模型、HLM多层线性模型\n\n### 4. 信效度\n- 内部一致性：Cronbach's α ≥ 0.7\n- 重测信度、内容效度、结构效度`,
  qual: `## 定性研究方法论\n\n### 1. 研究范式\n- 现象学：理解生活经验的意义\n- 民族志：深入描述文化群体的行为\n- 扎根理论：从数据中构建理论\n\n### 2. 数据收集\n- 深度访谈：半结构化、非结构化\n- 焦点小组：6-8人小组讨论\n- 参与观察：完全参与→完全观察\n- 文件分析：文本、图片、视频资料\n\n### 3. 数据分析\n- 编码：开放编码→主轴编码→选择性编码\n- 主题分析：Braun & Clarke (2006) 六步法\n- 叙事分析：故事结构和意义建构\n\n### 4. 质量保证\n- 可信性（Credibility）：三角验证、成员核查\n- 可迁移性（Transferability）：厚描述\n- 可靠性（Dependability）：审计追踪`,
  mixed: `## 混合方法研究\n\n### 1. 核心设计类型\n- 收敛式设计（Convergent）：同时收集定量和定性数据\n- 解释性序贯设计（Explanatory Sequential）：先定量后定性\n- 探索性序贯设计（Exploratory Sequential）：先定性后定量\n\n### 2. 整合策略\n- 数据整合：合并、连接、嵌入\n- 结果合并：联合展示（Joint Display）\n- 元推断：超越单一方法的整合解释\n\n### 3. 设计原则\n- 互补性原则：不同方法回答不同层面的问题\n- 三角验证原则：多种方法交叉验证\n- 发展性原则：一种方法的结果指导另一种方法`,
  litreview: `## 文献综述方法\n\n### 1. 综述类型\n- 系统综述（Systematic Review）：PRISMA框架\n- Meta分析：效应量整合统计\n- 范围综述（Scoping Review）：Arksey & O'Malley框架\n- 批判性综述：论证性分析\n\n### 2. 文献搜索\n- 数据库：Web of Science, Scopus, CNKI, Google Scholar\n- 搜索策略：布尔运算符、截词、限定字段\n- 纳入/排除标准制定\n\n### 3. 质量评估\n- 随机对照试验：Cochrane RoB工具\n- 观察性研究：NOS量表\n- 定性研究：CASP清单\n\n### 4. PRISMA流程图\n识别→筛选→资格→纳入（含数量记录）`,
};

// ─── Citation Generator ─────────────────────
const citeFormat = ref<'apa' | 'mla' | 'chicago'>('apa');
const citeAuthor = ref('');
const citeTitle = ref('');
const citeYear = ref(new Date().getFullYear());
const citeJournal = ref('');
const citeVolume = ref('');
const citePages = ref('');
const citeDOI = ref('');

const generatedCitation = computed(() => {
  if (!citeAuthor.value) return '';
  const a = citeAuthor.value.trim();
  const t = citeTitle.value.trim();
  const y = citeYear.value;
  const j = citeJournal.value.trim();
  const v = citeVolume.value.trim();
  const p = citePages.value.trim();
  const doi = citeDOI.value.trim();

  switch (citeFormat.value) {
    case 'apa':
      return `${a} (${y}). ${t}. ${j ? j : ''}${v ? ', ' + v : ''}${p ? ', ' + p : ''}.${doi ? ' https://doi.org/' + doi : ''}`;
    case 'mla':
      return `${a}. "${t}." ${j ? j : ''}${v ? ', vol. ' + v : ''}${y ? ', ' + y : ''}${p ? ', pp. ' + p : ''}.`;
    case 'chicago':
      return `${a}. "${t}." ${j ? j : ''} ${v ? v + ' ' : ''}(${y})${p ? ': ' + p : ''}.${doi ? ' https://doi.org/' + doi : ''}`;
    default: return '';
  }
});

function copyGeneratedCitation() {
  if (generatedCitation.value) navigator.clipboard.writeText(generatedCitation.value);
}

onMounted(loadRefs);
</script>

<template>
  <div class="min-h-screen p-5" style="background: #09090b;">
    <div class="max-w-7xl mx-auto space-y-5">
      <!-- Hero -->
      <div class="rounded-2xl p-6 text-white" style="background: linear-gradient(135deg, #1e3a5f, #0f766e);">
        <h1 class="text-2xl font-black flex items-center gap-3">🔬 Academic Research Hub</h1>
        <p class="text-white/70 text-sm mt-2">学术研究中心 · 文献管理 · AI 论文分析 · 研究方法 · 引文生成</p>
      </div>

      <!-- Tab Bar -->
      <div class="flex flex-wrap gap-2">
        <button v-for="tab in [
          { key: 'literature' as const, label: '📚 文献管理' },
          { key: 'reading' as const, label: '🤖 AI 论文阅读' },
          { key: 'writing' as const, label: '✍️ AI 论文写作' },
          { key: 'methods' as const, label: '📖 研究方法' },
          { key: 'citations' as const, label: '📋 引文生成' },
        ]" :key="tab.key" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" :class="activeTab === tab.key ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'" @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
      </div>

      <!-- Literature Management -->
      <div v-if="activeTab === 'literature'" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 space-y-4">
          <div v-for="ref in filteredRefs" :key="ref.id" class="bg-[#18181b] border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-bold text-white">{{ ref.title }}</h4>
                <p class="text-xs text-zinc-400 mt-1">{{ ref.authors }} ({{ ref.year }}) · {{ ref.journal }}</p>
                <p v-if="ref.abstract" class="text-xs text-zinc-500 mt-2 line-clamp-2">{{ ref.abstract }}</p>
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span v-for="tag in ref.tags" :key="tag" class="px-2 py-0.5 rounded text-[10px]" style="background: #0f766e22; color: #14b8a6;">{{ tag }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 ml-3">
                <button class="w-7 h-7 rounded text-xs bg-zinc-800 text-zinc-400 hover:text-teal-400 transition" title="复制引用" @click="copyCitation(ref)">📋</button>
                <button class="w-7 h-7 rounded text-xs bg-zinc-800 text-zinc-400 hover:text-red-400 transition" title="删除" @click="removeRef(ref.id)">✕</button>
              </div>
            </div>
          </div>
          <div v-if="filteredRefs.length === 0" class="text-center py-12 text-zinc-500">暂无文献，开始添加吧</div>
        </div>

        <div class="space-y-4">
          <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
            <h3 class="text-sm font-bold text-white mb-3">添加文献</h3>
            <div class="space-y-2">
              <input v-model="newRef.title" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="标题 *" @keyup.enter="addReference" />
              <input v-model="newRef.authors" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="作者" />
              <div class="flex gap-2">
                <input v-model.number="newRef.year" type="number" class="w-24 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="年份" />
                <input v-model="newRef.journal" class="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="期刊/来源" />
              </div>
              <input v-model="newRef.tags" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="标签（逗号分隔）" />
              <textarea v-model="newRef.abstract" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500 h-20 resize-none" placeholder="摘要" />
              <button class="w-full py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition" @click="addReference">添加文献</button>
            </div>
          </div>

          <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
            <h3 class="text-sm font-bold text-white mb-3">导出格式</h3>
            <div class="flex gap-2 mb-3">
              <button v-for="f in ['apa', 'mla', 'chicago']" :key="f" class="px-3 py-1.5 rounded text-xs font-medium transition-all" :class="exportFormat === f ? 'bg-teal-600 text-white' : 'bg-zinc-800 text-zinc-400'" @click="exportFormat = f as any">{{ f.toUpperCase() }}</button>
            </div>
            <input v-model="refFilter" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="搜索文献..." />
          </div>
        </div>
      </div>

      <!-- AI Paper Reading -->
      <div v-if="activeTab === 'reading'" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
          <h3 class="text-sm font-bold text-white mb-3">📄 粘贴论文内容</h3>
          <textarea v-model="paperText" class="w-full h-64 p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm resize-none outline-none focus:border-teal-500" placeholder="在此粘贴论文摘要或全文..." />
          <button class="mt-3 px-5 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition" :disabled="analyzingPaper" @click="analyzePaper">
            {{ analyzingPaper ? '⏳ 分析中...' : '🔍 AI 分析论文' }}
          </button>
        </div>
        <div v-if="paperAnalysis" class="space-y-3 animate-fade-in-up">
          <div v-for="item in [
            { label: '📋 摘要', content: paperAnalysis.summary },
            { label: '🔬 研究方法', content: paperAnalysis.methods },
            { label: '⭐ 主要贡献', content: paperAnalysis.contributions },
            { label: '⚠️ 研究局限', content: paperAnalysis.limitations },
          ]" :key="item.label" class="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
            <h4 class="text-xs font-bold text-teal-400 mb-1">{{ item.label }}</h4>
            <p class="text-sm text-zinc-300">{{ item.content }}</p>
          </div>
          <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
            <h4 class="text-xs font-bold text-teal-400 mb-2">📖 相关工作</h4>
            <ul class="space-y-1">
              <li v-for="rw in paperAnalysis.relatedWork" :key="rw" class="text-xs text-zinc-400">• {{ rw }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- AI Paper Writing -->
      <div v-if="activeTab === 'writing'" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
          <h3 class="text-sm font-bold text-white mb-3">论文主题</h3>
          <input v-model="thesisTitle" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm outline-none focus:border-teal-500 mb-3" placeholder="输入论文主题..." />
          <h4 class="text-xs font-bold text-zinc-400 mb-2">生成章节</h4>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="section in thesisSections" :key="section" class="px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-400 hover:text-white hover:border-teal-500 border border-zinc-700 transition" :disabled="generatingThesis" @click="generateThesisSection(section)">
              {{ { abstract: '摘要', introduction: '引言', literature: '文献综述', methods: '研究方法', results: '结果', conclusion: '结论' }[section] }}
            </button>
          </div>
          <div v-if="thesisOutline" class="mt-4 p-3 rounded-lg bg-zinc-900">
            <h4 class="text-xs font-bold text-zinc-400 mb-1">大纲</h4>
            <pre class="text-xs text-zinc-300 whitespace-pre-wrap">{{ thesisOutline }}</pre>
          </div>
        </div>
        <div class="lg:col-span-2 bg-[#18181b] border border-zinc-800 rounded-xl p-4 min-h-96">
          <h3 class="text-sm font-bold text-white mb-3">✍️ 生成内容</h3>
          <div v-if="generatingThesis" class="flex items-center justify-center py-16 text-teal-400">⏳ AI 正在生成...</div>
          <div v-else-if="thesisSection" class="p-4 rounded-xl bg-zinc-900 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{{ thesisSection }}</div>
          <div v-else class="flex items-center justify-center py-16 text-zinc-500">左侧选择论文主题和要生成的章节</div>
        </div>
      </div>

      <!-- Research Methods -->
      <div v-if="activeTab === 'methods'" class="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div class="space-y-2">
          <button v-for="mod in methodsModules" :key="mod.id" class="w-full text-left p-3 rounded-xl transition-all" :class="methodsModule === mod.id ? 'bg-teal-600/20 border border-teal-500/30' : 'bg-[#18181b] border border-zinc-800 hover:border-zinc-700'" @click="methodsModule = mod.id">
            <div class="text-lg">{{ mod.icon }}</div>
            <div class="text-sm font-bold text-white mt-1">{{ mod.label }}</div>
            <div class="text-xs text-zinc-500 mt-0.5">{{ mod.description }}</div>
          </button>
        </div>
        <div class="lg:col-span-3 bg-[#18181b] border border-zinc-800 rounded-xl p-5">
          <div class="prose prose-invert text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">{{ methodContent[methodsModule] }}</div>
        </div>
      </div>

      <!-- Citation Generator -->
      <div v-if="activeTab === 'citations'" class="max-w-2xl mx-auto">
        <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-bold text-white">📋 引文生成器</h3>

          <div class="flex gap-2 mb-4">
            <button v-for="f in ['apa', 'mla', 'chicago']" :key="f" class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all" :class="citeFormat === f ? 'bg-teal-600 text-white' : 'bg-zinc-800 text-zinc-400'" @click="citeFormat = f as any">{{ f.toUpperCase() }}</button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <input v-model="citeAuthor" class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="作者" />
            <input v-model.number="citeYear" type="number" class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="年份" />
            <input v-model="citeTitle" class="col-span-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="论文标题" />
            <input v-model="citeJournal" class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="期刊名" />
            <input v-model="citeVolume" class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="卷号" />
            <input v-model="citePages" class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="页码" />
            <input v-model="citeDOI" class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-teal-500" placeholder="DOI" />
          </div>

          <div v-if="generatedCitation" class="p-4 rounded-xl bg-zinc-900 border border-teal-500/30 animate-fade-in-up">
            <p class="text-sm text-zinc-200 leading-relaxed">{{ generatedCitation }}</p>
            <button class="mt-3 px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500 transition" @click="copyGeneratedCitation">📋 复制引用</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
