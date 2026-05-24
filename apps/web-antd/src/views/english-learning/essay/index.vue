<template>
  <EnglishPageLayout>
    <EnglishHero icon="✍️" title="智启英语 - 作文批改中心" subtitle="AI 大模型精准评分 · 六维分析" showXpBar backTo="/english-learning" decorativeEmoji="✍️" />

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-8">
      <!-- Left: Main content area (3/5) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Essay Input -->
        <EnglishCard>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
              <span class="en-accent-bar" />
              作文输入
            </h2>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span class="font-mono">{{ essayContent.length }} 字</span>
              <span v-if="essayContent.trim()" class="font-mono">约 {{ estimatedWords }} 词</span>
              <span v-if="essayContent.trim()" class="font-mono">{{ essayContent.split(/[.!?]+/).filter(s => s.trim()).length }} 句</span>
            </div>
          </div>
          <textarea
            v-model="essayContent"
            placeholder="在此输入或粘贴你的英语作文...&#10;&#10;支持 50-500 词左右的短文批改&#10;&#10;提示：包含明确的开头(introduction)、主体(body)和结尾(conclusion)将获得更精准的评估"
            class="w-full h-48 p-5 rounded-xl border bg-slate-50/50 dark:bg-zinc-900/50 dark:border-zinc-700 text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600 resize-none focus:ring-2 focus:ring-en-500 focus:border-transparent outline-none transition-all leading-relaxed"
            @dblclick="handleDoubleClick"
            @input="autoSaveEssay"
          />
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                class="px-4 py-2.5 bg-gradient-to-r from-en-600 to-en-cyan-500 text-white rounded-xl font-bold text-sm shadow-en-glow hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!canSubmit || isScoring"
                @click="submitEssay"
              >
                <span class="flex items-center gap-2">
                  <span v-if="isScoring" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span v-else>🚀</span>
                  {{ isScoring ? 'AI 批改中...' : 'AI 智能批改' }}
                </span>
              </button>
              <button
                class="px-3 py-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                @click="clearEssay"
              >
                清空
              </button>
            </div>
            <div class="flex items-center gap-2 text-[10px] text-gray-400">
              <span>💡 双击任意单词可查词典</span>
            </div>
          </div>

          <!-- Scoring Progress -->
          <div v-if="isScoring" class="mt-4 p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/20">
            <div class="flex items-center gap-3">
              <span class="text-lg animate-bounce">🤖</span>
              <div class="flex-1">
                <div class="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">AI 正在分析你的作文...</div>
                <div class="text-[11px] text-blue-500/70">评估语法、词汇、连贯性、风格、内容和结构六大维度</div>
              </div>
            </div>
            <div class="mt-3 h-1.5 bg-blue-100 dark:bg-blue-500/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style="width: 100%; background-size: 200% 100%; animation: shimmer 2.5s ease-in-out infinite;" />
            </div>
          </div>

          <!-- API Status -->
          <div v-if="apiStatus" class="mt-3 flex items-center gap-2 text-[10px]" :class="apiStatus === 'llm' ? 'text-emerald-500' : 'text-amber-500'">
            <span>{{ apiStatus === 'llm' ? '🧠' : '📊' }}</span>
            <span>{{ apiStatus === 'llm' ? '由大模型精准评分' : '由本地智能算法评分 (配置 VITE_LLM_API_URL 以启用大模型评分)' }}</span>
          </div>
        </EnglishCard>

        <!-- Analysis Results -->
        <Transition name="results">
          <div v-if="showResults && analysisResult" class="space-y-6">
            <!-- Overall AI Comment -->
            <EnglishCard v-if="analysisResult.overallComment">
              <div class="flex items-start gap-3">
                <span class="text-2xl">🧠</span>
                <div>
                  <div class="text-xs text-gray-400 mb-1 font-bold">AI 总评</div>
                  <p class="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{{ analysisResult.overallComment }}</p>
                </div>
              </div>
            </EnglishCard>

            <!-- Strengths + Vocabulary -->
            <div class="grid grid-cols-1 gap-4" :class="analysisResult.strengths?.length && analysisResult.vocabularyAnalysis ? 'md:grid-cols-2' : ''">
              <EnglishCard v-if="analysisResult.strengths?.length">
                <h3 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <span>🌟</span> 文章亮点
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(s, idx) in analysisResult.strengths"
                    :key="idx"
                    class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-medium"
                  >{{ s }}</span>
                </div>
              </EnglishCard>

              <EnglishCard v-if="analysisResult.vocabularyAnalysis">
                <h3 class="text-sm font-bold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                  <span>📖</span> 词汇分析
                </h3>
                <div class="space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">词汇等级</span>
                    <span class="font-bold text-purple-600 dark:text-purple-400">{{ analysisResult.vocabularyAnalysis.level }}</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">词汇多样性</span>
                    <span class="font-bold text-purple-600 dark:text-purple-400">{{ analysisResult.vocabularyAnalysis.diversity }}%</span>
                  </div>
                  <div v-if="analysisResult.vocabularyAnalysis.advancedWords?.length">
                    <div class="text-[10px] text-gray-400 mb-1 mt-2">高级词汇</div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="w in analysisResult.vocabularyAnalysis.advancedWords"
                        :key="w"
                        class="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] rounded font-mono"
                      >{{ w }}</span>
                    </div>
                  </div>
                </div>
              </EnglishCard>
            </div>

            <!-- Radar Chart -->
            <EnglishCard>
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-base font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                  <span class="w-1.5 h-5 bg-en-cyan-500 rounded-full" />
                  能力维度分析
                </h2>
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-black text-en-600 dark:text-en-400">{{ analysisResult.overallScore }}</span>
                  <span class="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <div class="h-72">
                <EchartsUI ref="radarChartRef" height="260px" />
              </div>
            </EnglishCard>

            <!-- Criterion Scores -->
            <div class="grid grid-cols-2 gap-4">
              <EnglishCard
                v-for="(criterion, idx) in analysisResult.scores"
                :key="criterion.id"
                class="p-5 hover:shadow-md transition-all"
                :style="{ animationDelay: idx * 100 + 'ms' }"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ criterion.icon }}</span>
                    <span class="text-sm font-bold text-gray-800 dark:text-zinc-100">{{ criterion.title }}</span>
                  </div>
                  <span
                    class="text-lg font-black"
                    :class="scoreColor(criterion.score)"
                  >{{ criterion.score }}</span>
                </div>
                <div class="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    class="h-full rounded-full transition-all duration-1000 ease-out"
                    :class="scoreBarColor(criterion.score)"
                    :style="{ width: criterion.score + '%', animationDelay: idx * 100 + 'ms' }"
                  />
                </div>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">{{ criterion.description }}</p>
                <p v-if="criterion.comment" class="text-[11px] text-gray-400 dark:text-zinc-500 mt-1.5 italic border-l-2 border-gray-200 dark:border-zinc-700 pl-2">{{ criterion.comment }}</p>
              </EnglishCard>
            </div>

            <!-- Suggestions -->
            <EnglishCard>
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-en-500 rounded-full" />
                修改建议
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(suggestion, idx) in analysisResult.suggestions"
                  :key="idx"
                  class="flex items-start gap-3 p-3 bg-en-50/50 dark:bg-en-500/5 rounded-xl border border-en-100 dark:border-en-500/10"
                >
                  <span class="text-lg flex-shrink-0">💡</span>
                  <p class="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">{{ suggestion }}</p>
                </div>
              </div>
            </EnglishCard>
          </div>
        </Transition>

        <!-- Empty state (no results yet) -->
        <EnglishCard v-if="!showResults" class="p-10">
          <div class="text-center">
            <div class="text-6xl mb-4">✍️</div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-zinc-100 mb-2">等待你的第一篇作文</h3>
            <p class="text-sm text-gray-400 dark:text-zinc-500 max-w-md mx-auto">
              在上方输入你的英语作文，点击 "AI 智能批改" 获取基于大模型的六维评分和修改建议。
            </p>
            <div class="mt-6 flex justify-center gap-4 text-xs text-gray-400">
              <span>📊 6 维度评分</span>
              <span>💡 个性化建议</span>
              <span>🎯 精准提分</span>
              <span>🧠 大模型驱动</span>
            </div>
          </div>
        </EnglishCard>
      </div>

      <!-- Right sidebar (2/5) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Daily Check-in + Stats -->
        <EnglishCard>
          <DailyCheckIn />
        </EnglishCard>

        <!-- LLM API Settings -->
        <ApiSettingsPanel />

        <!-- Scoring Criteria -->
        <EnglishCard>
          <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-en-500 rounded-full" />
            批改维度参考
          </h2>
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="(item, idx) in criteria"
              :key="item.title"
              :class="[item.bg, `delay-${idx}`]"
              class="p-4 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm cursor-pointer animate-fade-in-up opacity-0"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">{{ item.icon }}</span>
                <span :class="item.text" class="text-sm font-bold tracking-wide">{{ item.title }}</span>
              </div>
              <p class="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed font-medium ml-8">{{ item.desc }}</p>
            </div>
          </div>
        </EnglishCard>

        <!-- High-Score Phrases -->
        <EnglishCard>
          <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-en-cyan-500 rounded-full" />
            高分衔接句式
          </h2>
          <div class="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="phrase in phrases"
              :key="phrase.en"
              class="group p-3.5 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-transparent hover:border-en-cyan-500/30 transition-all"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="text-[13px] font-bold text-gray-800 dark:text-zinc-200 group-hover:text-en-600 dark:group-hover:text-en-400 transition-colors">
                    {{ phrase.en }}
                  </div>
                  <div class="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 font-medium italic">
                    {{ phrase.zh }}
                  </div>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <PronunciationBtn :word="phrase.en" size="sm" />
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors text-sm text-gray-400"
                    title="复制"
                    @click="copyPhrase(phrase.en)"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>
        </EnglishCard>

        <!-- Leaderboard -->
        <LeaderboardMini title="作文高分榜" />
      </div>
    </div>

    <!-- Dictionary Lookup Panel -->
    <DictionaryLookup :visible="showDictionary" :word="dictWord" @close="showDictionary = false" />
  </EnglishPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import type { EchartsUIType } from '@vben/plugins/echarts';
import { useGamification } from '../shared/use-gamification';
import type { EssayCriterion, EssaySubmission } from '../shared/types';
import { message } from 'ant-design-vue';
import {
  EnglishPageLayout, EnglishHero, EnglishCard,
  DailyCheckIn, PronunciationBtn, DictionaryLookup, LeaderboardMini,
} from '../components';
import ApiSettingsPanel from '../../shared-learning/components/ApiSettingsPanel.vue';
import { useLLMConfig } from '../../shared-learning/composables/use-llm-config';
import { scoreEssay } from '#/api/core/essay';

const gamification = useGamification();
const { isConfigured } = useLLMConfig();

// --- Essay state ---
const essayContent = ref(loadDraft());
const showResults = ref(false);
const showDictionary = ref(false);
const dictWord = ref('');
const isScoring = ref(false);
const apiStatus = ref<'llm' | 'heuristic' | ''>('');

const estimatedWords = computed(() => {
  return essayContent.value.trim() ? essayContent.value.trim().split(/\s+/).length : 0;
});

const canSubmit = computed(() => {
  const words = estimatedWords.value;
  return words >= 10 && words <= 1000;
});

// --- Analysis result ---
interface AnalysisResult {
  overallScore: number;
  overallComment: string;
  scores: EssayCriterion[];
  suggestions: string[];
  strengths: string[];
  vocabularyAnalysis?: { level: string; diversity: number; advancedWords: string[] };
}

const analysisResult = ref<AnalysisResult | null>(null);

// --- Radar Chart ---
const radarChartRef = ref<EchartsUIType>();
const { renderEcharts: renderRadar } = useEcharts(radarChartRef);

function updateRadarChart(scores: EssayCriterion[]) {
  renderRadar({
    legend: {
      data: ['当前得分'],
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    radar: {
      indicator: scores.map(s => ({ name: s.title.split('(')[0]?.trim() ?? '', max: 100 })),
      radius: '65%',
      splitNumber: 5,
    },
    series: [{
      type: 'radar',
      symbolSize: 0,
      areaStyle: {
        opacity: 0.3,
      },
      lineStyle: { width: 2, color: '#4F46E5' },
      data: [{
        name: '当前得分',
        value: scores.map(s => s.score),
        itemStyle: { color: '#4F46E5' },
        areaStyle: { color: 'rgba(79,70,229,0.2)' },
      }],
    }],
    tooltip: {},
  });
}

// --- Submit essay with LLM API ---
async function submitEssay() {
  if (!canSubmit.value) {
    message.warning('作文长度需在 10-1000 词之间');
    return;
  }

  isScoring.value = true;
  apiStatus.value = '';

  try {
    const result = await scoreEssay({
      content: essayContent.value,
      lang: 'en',
    });

    apiStatus.value = isConfigured() ? 'llm' : 'heuristic';

    analysisResult.value = {
      overallScore: result.overallScore,
      overallComment: result.overallComment,
      scores: result.scores.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        score: s.score,
        color: '',
        icon: s.icon,
      })),
      suggestions: result.suggestions,
      strengths: result.strengths || [],
      vocabularyAnalysis: result.vocabularyAnalysis,
    };

    showResults.value = true;

    // Award XP
    gamification.addXp(50);
    gamification.unlockAchievement('essay-first');

    // Save to history
    saveSubmission({
      content: essayContent.value,
      wordCount: estimatedWords.value,
      submittedAt: new Date().toISOString(),
      scores: analysisResult.value.scores,
      overallScore: result.overallScore,
      suggestions: result.suggestions,
    });

    message.success(`AI 批改完成！总分 ${result.overallScore}/100，获得 50 XP`);

    // Render radar chart after DOM update
    setTimeout(() => updateRadarChart(analysisResult.value!.scores), 100);
  } catch (err) {
    message.error('评分失败，请重试');
    console.error('Essay scoring failed:', err);
  } finally {
    isScoring.value = false;
  }
}

// --- Persistence ---
function loadDraft(): string {
  try {
    return localStorage.getItem('en-essay-draft') || '';
  } catch { return ''; }
}

function autoSaveEssay() {
  try {
    localStorage.setItem('en-essay-draft', essayContent.value);
  } catch {}
}

function clearEssay() {
  essayContent.value = '';
  localStorage.removeItem('en-essay-draft');
  showResults.value = false;
  analysisResult.value = null;
  apiStatus.value = '';
}

function saveSubmission(submission: EssaySubmission) {
  try {
    const history = JSON.parse(localStorage.getItem('en-essay-history') || '[]');
    history.unshift(submission);
    localStorage.setItem('en-essay-history', JSON.stringify(history.slice(0, 20)));
  } catch {}
}

// --- Dictionary lookup via double-click ---
function handleDoubleClick(e: MouseEvent) {
  const target = e.target as HTMLTextAreaElement;
  const text = target.value.substring(target.selectionStart, target.selectionEnd).trim();
  if (text && /^[a-zA-Z]+$/.test(text)) {
    dictWord.value = text;
    showDictionary.value = true;
  }
}

// --- Copy phrase ---
function copyPhrase(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制到剪贴板');
  }).catch(() => {
    message.warning('复制失败');
  });
}

// --- Helpers ---
function scoreColor(score: number): string {
  if (score >= 80) return 'text-en-600 dark:text-en-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-gradient-to-r from-en-500 to-en-cyan-500';
  if (score >= 60) return 'bg-gradient-to-r from-en-600 to-blue-500';
  return 'bg-gradient-to-r from-red-500 to-rose-500';
}

// --- Static data ---
const criteria = [
  { title: 'Grammar (语法)', desc: '评估时态准确性与复杂句式应用。', icon: '📝', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20' },
  { title: 'Vocabulary (词汇)', desc: '学术词汇广度、用词精准度与拼写。', icon: '📖', text: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/20' },
  { title: 'Cohesion (连贯)', desc: '逻辑连接词的使用与段落承接质量。', icon: '🔗', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-en-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20' },
  { title: 'Writing Style (风格)', desc: '句式多样性、语气把握及整体表达。', icon: '🎨', text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20' },
];

const phrases = [
  { en: 'It is widely acknowledged that...', zh: '众所周知...' },
  { en: 'Confronted with such a challenge...', zh: '面对如此挑战...' },
  { en: 'As the proverb goes...', zh: '正如谚语所说...' },
  { en: 'From my own perspective...', zh: '在我看来...' },
  { en: 'To put it in a nutshell...', zh: '概括来说...' },
  { en: 'The underlying reason is that...', zh: '深层原因是...' },
  { en: 'Given the facts mentioned above...', zh: '考虑到上述事实...' },
  { en: 'An additional point to emphasize is...', zh: '另一个需要强调的点是...' },
  { en: 'There is no denying that...', zh: '毋庸置疑...' },
  { en: 'It goes without saying that...', zh: '不言而喻...' },
];
</script>

<style scoped>
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
.results-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.results-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>
