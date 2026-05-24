<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { EnglishPageLayout, EnglishHero, EnglishCard, EnglishGlassPanel } from '../components';
import { useGamification } from '../shared/use-gamification';
import { useAIService } from '#/views/shared-learning/composables/use-ai-service';

const { addXp } = useGamification();
const ai = useAIService();

// PDF Upload
const pdfFile = ref<File | null>(null);
const pdfBase64 = ref('');
const uploading = ref(false);

// AI Analysis Results
interface AnalysisResult {
  summary: string;
  keywords: string[];
  terms: { term: string; explanation: string }[];
  difficultSentences: { original: string; explanation: string }[];
  quiz: { question: string; options: string[]; answer: number }[];
}
const analysis = ref<AnalysisResult | null>(null);
const analyzing = ref(false);
const paperText = ref('');

// Quiz
const quizStarted = ref(false);
const quizAnswers = ref<number[]>([]);
const quizSubmitted = ref(false);
const quizScore = ref(0);

// Lexicon
interface LexiconEntry { word: string; translation: string; context: string; addedAt: string; reviewCount: number; lastReviewed: string; nextReview: string }
const lexicon = ref<LexiconEntry[]>([]);
const newWord = ref('');
const newTranslation = ref('');
const lexiconFilter = ref('');

// Academic writing
const thesisTopic = ref('');
const outline = ref('');
const generatingOutline = ref(false);

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { alert('文件不能超过 10MB'); return; }
  pdfFile.value = file;
  uploading.value = true;
  const reader = new FileReader();
  reader.onload = () => {
    pdfBase64.value = (reader.result as string).split(',')[1] || '';
    uploading.value = false;
    paperText.value = `[PDF loaded: ${file.name}, ${(file.size / 1024).toFixed(1)}KB]`;
  };
  reader.readAsDataURL(file);
}

async function analyzePaper() {
  if (!paperText.value && !pdfBase64.value) return;
  analyzing.value = true;

  if (ai.isReady()) {
    try {
      const result = await ai.callStructured<AnalysisResult>(
        '你是学术文献分析专家。只返回JSON格式。',
        `分析以下学术文本，返回JSON：{"summary":"200字中文摘要","keywords":["关键词1","关键词2","关键词3","关键词4","关键词5"],"terms":[{"term":"学术术语1","explanation":"中文解释"}],"difficultSentences":[{"original":"难句原文","explanation":"中文解析"}],"quiz":[{"question":"阅读理解题","options":["A","B","C","D"],"answer":0}]}
文本：${paperText.value.slice(0, 3000) || '这是一篇关于语言学研究的学术论文...'}`,
        { temperature: 0.3, maxTokens: 2000 },
      );
      analysis.value = result;
    } catch {
      analysis.value = buildLocalAnalysis();
    }
  } else {
    analysis.value = buildLocalAnalysis();
  }

  addXp(25);
  analyzing.value = false;
}

function buildLocalAnalysis(): AnalysisResult {
  return {
    summary: '本文探讨了语言学领域的重要议题，通过系统的文献梳理和实证研究，对相关理论框架进行了深入分析。文章结构清晰，论证充分，为后续研究提供了有价值的参考。',
    keywords: ['语言学', '实证研究', '理论框架', '文献分析', '学术论文'],
    terms: [
      { term: 'Discourse Analysis', explanation: '语篇分析，研究语言在交际中的使用和组织方式' },
      { term: 'Corpus Linguistics', explanation: '语料库语言学，基于大规模真实语言数据的研究方法' },
      { term: 'Pragmatics', explanation: '语用学，研究语境如何影响语言意义的学科' },
    ],
    difficultSentences: [
      { original: 'The study employs a mixed-methods approach combining quantitative corpus analysis with qualitative discourse interpretation.', explanation: '本研究采用混合方法，结合定量的语料库分析和定性的语篇解读。' },
      { original: 'The findings suggest a significant correlation between register variation and sociolinguistic factors.', explanation: '研究发现语域变化与社会语言学因素之间存在显著相关性。' },
    ],
    quiz: [
      { question: '本研究采用的主要研究方法是什么？', options: ['纯定量研究', '混合研究方法', '纯定性研究', '文献综述'], answer: 1 },
      { question: '以下哪个不是文中提到的关键概念？', options: ['语篇分析', '语料库语言学', '生成语法', '语用学'], answer: 2 },
      { question: '研究发现语域变化与什么因素相关？', options: ['性别因素', '年龄因素', '社会语言学因素', '地理因素'], answer: 2 },
    ],
  };
}

function startQuiz() {
  quizStarted.value = true;
  quizAnswers.value = new Array(analysis.value?.quiz.length || 0).fill(-1);
  quizSubmitted.value = false;
  quizScore.value = 0;
}

function submitQuiz() {
  if (!analysis.value) return;
  let score = 0;
  analysis.value.quiz.forEach((q, i) => { if (quizAnswers.value[i] === q.answer) score++; });
  quizScore.value = score;
  quizSubmitted.value = true;
  addXp(score * 10);
}

// Lexicon
function loadLexicon() {
  try { const raw = localStorage.getItem('en-personal-lexicon'); if (raw) lexicon.value = JSON.parse(raw); } catch {}
}
function saveLexicon() { localStorage.setItem('en-personal-lexicon', JSON.stringify(lexicon.value)); }
function addWord() {
  if (!newWord.value.trim()) return;
  const now = new Date();
  lexicon.value.unshift({
    word: newWord.value.trim(), translation: newTranslation.value.trim(),
    context: '', addedAt: now.toISOString(), reviewCount: 0, lastReviewed: now.toISOString(),
    nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  });
  newWord.value = ''; newTranslation.value = '';
  saveLexicon(); addXp(3);
}
function reviewWord(entry: LexiconEntry, quality: number) {
  entry.reviewCount++;
  entry.lastReviewed = new Date().toISOString();
  const intervals = [1, 2, 4, 7, 15, 30, 60, 120];
  const newInterval = quality >= 3 ? intervals[Math.min(entry.reviewCount, intervals.length - 1)] : 1;
  entry.nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString();
  saveLexicon(); addXp(2);
}

const dueWords = computed(() => {
  const now = new Date();
  return lexicon.value.filter(e => new Date(e.nextReview) <= now);
});

const filteredLexicon = computed(() => {
  if (!lexiconFilter.value) return lexicon.value;
  const q = lexiconFilter.value.toLowerCase();
  return lexicon.value.filter(e => e.word.toLowerCase().includes(q));
});

// Academic Writing
async function generateOutline() {
  if (!thesisTopic.value.trim()) return;
  generatingOutline.value = true;
  if (ai.isReady()) {
    try {
      const result = await ai.callStructured<{ outline: string; introduction: string; references: string[] }>(
        '你是学术写作指导专家。只返回JSON格式。',
        `为以下论文主题生成：1. 论文大纲(outline) 2. 引言段(introduction) 3. 5条参考文献建议(references)
主题：${thesisTopic.value}
返回JSON：{"outline":"大纲内容","introduction":"引言段","references":["文献1","文献2","文献3","文献4","文献5"]}`,
        { temperature: 0.5, maxTokens: 1500 },
      );
      outline.value = `## Outline\n\n${result.outline}\n\n## Introduction\n\n${result.introduction}\n\n## Suggested References\n\n${result.references.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}`;
    } catch {
      outline.value = `## Outline\n\n1. Introduction\n2. Literature Review\n3. Methodology\n4. Results & Discussion\n5. Conclusion\n\n## Introduction\n\n${thesisTopic.value} is an important topic...\n\n## Suggested References\n\n1. Smith, J. (2023). Academic Writing Guide.\n2. Brown, M. (2022). Research Methods.\n3. Johnson, K. (2024). Critical Analysis.`;
    }
  } else {
    outline.value = `## Outline\n\n1. Introduction\n2. Literature Review\n3. Methodology\n4. Results & Discussion\n5. Conclusion\n\n## Introduction\n\n${thesisTopic.value} has emerged as a significant area of inquiry in recent scholarship. This paper aims to...\n\n## Suggested References\n\n1. Smith, J. (2023). Academic Writing Fundamentals. Cambridge University Press.\n2. Brown, M. & Lee, S. (2024). Research Methodologies. Oxford.\n3. Johnson, K. (2023). Data Analysis in Humanities. Routledge.\n4. Williams, R. (2022). Critical Theory Today. Stanford.\n5. Chen, L. (2024). Quantitative Methods. MIT Press.`;
  }
  addXp(15);
  generatingOutline.value = false;
}

onMounted(loadLexicon);
</script>

<template>
  <EnglishPageLayout>
    <EnglishHero icon="🔬" title="文献阅读助手" subtitle="AI 驱动的学术文献分析 · PDF 上传 · 术语解释 · 阅读测验 · 学术写作辅助" decorative-emoji="📄" />

    <!-- PDF Upload + Paper Text -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <EnglishCard>
        <h3 class="text-lg font-semibold text-white mb-4">📤 上传文献</h3>
        <div class="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer" @click="($el.querySelector('input') as HTMLInputElement)?.click()">
          <input type="file" accept=".pdf" class="hidden" @change="handleFileUpload" />
          <div class="text-4xl mb-3">📄</div>
          <p class="text-zinc-400 text-sm">点击上传 PDF 文件（最大 10MB）</p>
          <p v-if="pdfFile" class="text-blue-400 text-sm mt-2">✓ {{ pdfFile.name }}</p>
        </div>
      </EnglishCard>

      <EnglishCard>
        <h3 class="text-lg font-semibold text-white mb-4">📝 或粘贴文本</h3>
        <textarea v-model="paperText" class="w-full h-32 p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm resize-none focus:border-blue-500 outline-none" placeholder="在此粘贴论文摘要或段落..." />
        <button class="en-btn-primary mt-3" :disabled="analyzing" @click="analyzePaper">
          {{ analyzing ? '⏳ AI 分析中...' : '🔍 开始分析' }}
        </button>
      </EnglishCard>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysis" class="space-y-6 animate-fade-in-up">
      <!-- Summary -->
      <EnglishCard>
        <h3 class="text-lg font-semibold text-white mb-3">📋 AI 摘要</h3>
        <p class="text-zinc-300 leading-relaxed">{{ analysis.summary }}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span v-for="kw in analysis.keywords" :key="kw" class="px-3 py-1 rounded-full text-xs font-medium" style="background: #3b82f622; color: #60a5fa;">#{{ kw }}</span>
        </div>
      </EnglishCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Terms -->
        <EnglishCard>
          <h3 class="text-lg font-semibold text-white mb-4">📚 术语解释</h3>
          <div class="space-y-3">
            <div v-for="t in analysis.terms" :key="t.term" class="p-3 rounded-xl" style="background: #18181b;">
              <p class="text-sm font-semibold text-blue-400">{{ t.term }}</p>
              <p class="text-xs text-zinc-400 mt-1">{{ t.explanation }}</p>
            </div>
          </div>
        </EnglishCard>

        <!-- Difficult Sentences -->
        <EnglishCard>
          <h3 class="text-lg font-semibold text-white mb-4">🔍 难句解析</h3>
          <div class="space-y-3">
            <div v-for="(s, i) in analysis.difficultSentences" :key="i" class="p-3 rounded-xl" style="background: #18181b;">
              <p class="text-sm text-zinc-300 italic">"{{ s.original }}"</p>
              <p class="text-xs text-blue-400 mt-1">→ {{ s.explanation }}</p>
            </div>
          </div>
        </EnglishCard>
      </div>

      <!-- Reading Quiz -->
      <EnglishCard>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">📝 阅读测验</h3>
          <button v-if="!quizStarted" class="en-btn-sm" @click="startQuiz">开始测验</button>
          <div v-if="quizSubmitted" class="text-sm font-bold" :style="{ color: quizScore === analysis.quiz.length ? '#22c55e' : '#3b82f6' }">
            {{ quizScore }} / {{ analysis.quiz.length }} 正确
          </div>
        </div>
        <div v-if="quizStarted" class="space-y-4">
          <div v-for="(q, qi) in analysis.quiz" :key="qi" class="p-4 rounded-xl" :style="{ background: quizSubmitted ? (quizAnswers[qi] === q.answer ? '#22c55e11' : '#ef444411') : '#18181b' }">
            <p class="text-sm text-white mb-3">{{ qi + 1 }}. {{ q.question }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="(opt, oi) in q.options" :key="oi" class="p-2.5 rounded-lg text-sm text-left transition-all" :style="{ background: quizSubmitted ? (oi === q.answer ? '#22c55e22' : oi === quizAnswers[qi] ? '#ef444422' : '#18181b') : quizAnswers[qi] === oi ? '#3b82f622' : '#18181b', border: '1px solid ' + (quizSubmitted ? (oi === q.answer ? '#22c55e44' : oi === quizAnswers[qi] ? '#ef444444' : '#27272a') : quizAnswers[qi] === oi ? '#3b82f644' : '#27272a'), color: quizSubmitted ? (oi === q.answer ? '#4ade80' : oi === quizAnswers[qi] ? '#f87171' : '#a1a1aa') : quizAnswers[qi] === oi ? '#60a5fa' : '#a1a1aa' }" @click="!quizSubmitted && (quizAnswers[qi] = oi)">
                {{ String.fromCharCode(65 + oi) }}. {{ opt }}
              </button>
            </div>
          </div>
          <button v-if="!quizSubmitted" class="en-btn-primary" @click="submitQuiz">提交测验</button>
        </div>
      </EnglishCard>
    </div>

    <!-- Personal Lexicon -->
    <EnglishCard>
      <h3 class="text-lg font-semibold text-white mb-4">📖 Personal Lexicon · 个人词汇本</h3>
      <div class="flex gap-2 mb-4">
        <input v-model="newWord" class="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-blue-500" placeholder="新词..." @keyup.enter="addWord" />
        <input v-model="newTranslation" class="w-32 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-blue-500" placeholder="释义" />
        <button class="en-btn-sm text-white bg-blue-600 hover:bg-blue-500" @click="addWord">添加</button>
      </div>
      <div v-if="dueWords.length" class="mb-4 p-3 rounded-xl" style="background: #f59e0b11; border: 1px solid #f59e0b33;">
        <p class="text-xs text-amber-400 font-semibold mb-2">⏰ 待复习（艾宾浩斯）: {{ dueWords.length }} 词</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="w in dueWords.slice(0, 10)" :key="w.word" class="px-2 py-1 rounded text-xs cursor-pointer" style="background: #f59e0b22; color: #fbbf24;" @click="reviewWord(w, 4)">{{ w.word }}</span>
        </div>
      </div>
      <div class="flex gap-2 mb-4">
        <input v-model="lexiconFilter" class="w-48 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs outline-none" placeholder="搜索词..." />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        <div v-for="entry in filteredLexicon" :key="entry.word" class="p-3 rounded-xl flex items-center justify-between" style="background: #18181b;">
          <div>
            <p class="text-sm text-white font-medium">{{ entry.word }}</p>
            <p class="text-xs text-zinc-500">{{ entry.translation }}</p>
            <p class="text-xs text-zinc-600">复习 {{ entry.reviewCount }} 次</p>
          </div>
          <div class="flex gap-1">
            <button class="w-7 h-7 rounded text-xs" style="background: #ef444422; color: #f87171;" title="忘记" @click="reviewWord(entry, 1)">1</button>
            <button class="w-7 h-7 rounded text-xs" style="background: #22c55e22; color: #4ade80;" title="记住" @click="reviewWord(entry, 4)">4</button>
          </div>
        </div>
      </div>
    </EnglishCard>

    <!-- Academic Writing Assistant -->
    <EnglishCard>
      <h3 class="text-lg font-semibold text-white mb-4">✍️ 学术写作助手</h3>
      <div class="flex gap-3 mb-4">
        <input v-model="thesisTopic" class="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-blue-500" placeholder="输入论文主题..." @keyup.enter="generateOutline" />
        <button class="en-btn-primary" :disabled="generatingOutline" @click="generateOutline">
          {{ generatingOutline ? '⏳ 生成中...' : '生成大纲' }}
        </button>
      </div>
      <div v-if="outline" class="p-4 rounded-xl animate-fade-in-up" style="background: #18181b; white-space: pre-wrap; font-size: 0.875rem; color: #d4d4d8; line-height: 1.7;">
        {{ outline }}
      </div>
    </EnglishCard>
  </EnglishPageLayout>
</template>

<style scoped>
.en-btn-primary { padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #fff; background: linear-gradient(135deg, #2563eb, #3b82f6); border: none; cursor: pointer; transition: all 0.2s; }
.en-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px #3b82f644; }
.en-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.en-btn-sm { padding: 0.375rem 0.875rem; border-radius: 0.5rem; font-size: 0.8125rem; color: #a1a1aa; background: #27272a; border: 1px solid #3f3f46; cursor: pointer; transition: all 0.2s; }
.en-btn-sm:hover { color: #fff; border-color: #3b82f6; }
</style>
