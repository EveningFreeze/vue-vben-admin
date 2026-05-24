<template>
  <ChinesePageLayout>
    <ChineseHero icon="✍️" title="学术写作" subtitle="AI 学术评估与论文指导 · 500-3000字" backTo="/chinese-learning" showXpBar decorativeEmoji="✍️" />

    <!-- Main layout -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-8">
      <!-- Left: Main content area (3/5) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Essay Input -->
        <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
              <span class="w-1.5 h-5 bg-red-500 rounded-full" />
              作文输入
            </h2>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span class="font-mono">{{ essayContent.replace(/\s+/g, '').length }} 字</span>
              <span v-if="essayContent.trim()" class="font-mono">约 {{ essayContent.split(/\n\n+/).filter(p => p.trim()).length }} 段落</span>
            </div>
          </div>
          <textarea
            v-model="essayContent"
            placeholder="在此输入或粘贴你的学术文章或论文草稿...&#10;&#10;支持 500-3000 字左右的学术写作评估&#10;&#10;提示：清晰的段落结构和明确的论点将获得更精准的评估"
            class="w-full h-48 p-5 rounded-xl border bg-slate-50/50 dark:bg-zinc-900/50 dark:border-zinc-700 text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all leading-relaxed"
            @input="autoSaveEssay"
          />
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                :class="[
                  'px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                  { 'animate-pulse-glow': canSubmit && !isScoring },
                ]"
                :disabled="!canSubmit || isScoring"
                @click="submitEssay"
              >
                <span class="flex items-center gap-2">
                  <span v-if="isScoring" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span v-else>🚀</span>
                  {{ isScoring ? 'AI 评估中...' : 'AI 学术评估' }}
                </span>
              </button>
              <button
                class="px-3 py-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                @click="clearEssay"
              >
                清空
              </button>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-gray-400" :class="{ 'text-emerald-500': essayContent.replace(/\s+/g, '').length >= 500 && essayContent.replace(/\s+/g, '').length <= 3000 }">
                {{ essayContent.replace(/\s+/g, '').length >= 500 ? '✅' : '⚠️' }} 500-3000字
              </span>
            </div>
          </div>

          <!-- Scoring Progress -->
          <div v-if="isScoring" class="mt-4 p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/20">
            <div class="flex items-center gap-3">
              <span class="text-lg animate-bounce">🤖</span>
              <div class="flex-1">
                <div class="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">AI 正在分析你的文章...</div>
                <div class="text-[11px] text-blue-500/70">正在评估论点深度、逻辑结构、学术规范等维度</div>
              </div>
            </div>
            <div class="mt-3 h-1.5 bg-blue-100 dark:bg-blue-500/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-shimmer" style="width: 100%; background-size: 200% 100%;" />
            </div>
          </div>

          <!-- API Status -->
          <div v-if="apiStatus" class="mt-3 flex items-center gap-2 text-[10px]" :class="apiStatus === 'llm' ? 'text-emerald-500' : 'text-amber-500'">
            <span>{{ apiStatus === 'llm' ? '🧠' : '📊' }}</span>
            <span>{{ apiStatus === 'llm' ? '由大模型精准评分' : '由本地智能算法评分 (配置 LLM_API_URL 以启用大模型评分)' }}</span>
          </div>
        </div>

        <!-- Analysis Results -->
        <Transition name="results">
          <div v-if="showResults && analysisResult" class="space-y-6">
            <!-- Overall Comment -->
            <div v-if="analysisResult.overallComment" class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
              <div class="flex items-start gap-3">
                <span class="text-2xl">🧠</span>
                <div>
                  <div class="text-xs text-gray-400 mb-1 font-bold">AI 总评</div>
                  <p class="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{{ analysisResult.overallComment }}</p>
                </div>
              </div>
            </div>

            <!-- Strengths -->
            <div v-if="analysisResult.strengths?.length" class="bg-white dark:bg-[#18181b] rounded-2xl border border-emerald-200 dark:border-emerald-500/20 p-5 shadow-sm">
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
            </div>

            <!-- Scoring Dimensions -->
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="(criterion, idx) in analysisResult.scores"
                :key="criterion.id"
                :data-delay="idx"
                class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all animate-entrance hover-lift-glow"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ criterion.icon }}</span>
                    <span class="text-sm font-bold text-gray-800 dark:text-zinc-100">{{ criterion.title }}</span>
                  </div>
                  <span
                    class="text-lg font-black animate-count-up"
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
              </div>
            </div>

            <!-- Overall Score -->
            <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm text-center">
              <div class="text-sm text-gray-500 mb-2">综合评分</div>
              <div class="text-5xl font-black text-red-600 dark:text-red-400 mb-4 animate-count-up">{{ analysisResult.overallScore }}</div>
              <div class="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                  :style="{ width: analysisResult.overallScore + '%' }"
                />
              </div>
              <div class="mt-3 text-xs text-gray-400">
                {{ analysisResult.overallScore >= 85 ? '🏆 优秀' : analysisResult.overallScore >= 70 ? '👍 良好' : analysisResult.overallScore >= 60 ? '📚 中等' : '💪 需努力' }}
              </div>
            </div>

            <!-- Suggestions -->
            <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-purple-500 rounded-full" />
                修改建议
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(suggestion, idx) in analysisResult.suggestions"
                  :key="idx"
                  class="flex items-start gap-3 p-3 bg-purple-50/30 dark:bg-purple-500/5 rounded-xl border border-purple-100 dark:border-purple-500/10"
                >
                  <span class="text-lg flex-shrink-0">💡</span>
                  <div class="flex-1">
                    <p class="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">{{ suggestion }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Empty state -->
        <div v-if="!showResults" class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-10 shadow-sm">
          <div class="text-center">
            <div class="text-6xl mb-4 animate-wobble-slow">✍️</div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-zinc-100 mb-2">等待你的第一篇学术写作</h3>
            <p class="text-sm text-gray-400 dark:text-zinc-500 max-w-md mx-auto">
              在上方输入你的学术文章或论文草稿，点击 "AI 学术评估" 获取基于大模型的五维评分和修改建议。
            </p>
            <div class="mt-6 flex justify-center gap-4 text-xs text-gray-400">
              <span>📊 5 维度评分</span>
              <span>💡 AI 学术建议</span>
              <span>🎯 论文提升</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right sidebar (2/5) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Daily Check-in -->
        <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <DailyCheckIn />
        </div>

        <!-- LLM API Settings -->
        <ApiSettingsPanel />

        <!-- Scoring Criteria Reference -->
        <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-rose-500 rounded-full" />
            评分维度参考
          </h2>
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="(item, idx) in criteria"
              :key="item.title"
              :data-delay="idx"
              :class="[item.bg]"
              class="p-4 rounded-xl border transition-all cursor-pointer animate-entrance hover-lift-glow"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">{{ item.icon }}</span>
                <span :class="item.text" class="text-sm font-bold tracking-wide">{{ item.title }}</span>
              </div>
              <p class="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed font-medium ml-8">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Writing Tips -->
        <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-red-500 rounded-full" />
            高分写作技巧
          </h2>
          <div class="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="tip in writingTips"
              :key="tip.title"
              class="group p-3.5 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-transparent hover:border-red-500/30 transition-all"
            >
              <div class="flex items-start gap-2">
                <span class="text-base flex-shrink-0">{{ tip.icon }}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-[13px] font-bold text-gray-800 dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {{ tip.title }}
                  </div>
                  <div class="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 font-medium">
                    {{ tip.desc }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Submissions -->
        <div v-if="recentSubmissions.length > 0" class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-amber-500 rounded-full" />
            最近提交
          </h2>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="(sub, idx) in recentSubmissions"
              :key="idx"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
              @click="loadSubmission(sub)"
            >
              <span class="text-sm">{{ sub.overallScore >= 80 ? '🟢' : sub.overallScore >= 60 ? '🟡' : '🔴' }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-[11px] font-bold text-gray-700 dark:text-zinc-300 truncate">
                  {{ sub.content.slice(0, 30) }}{{ sub.content.length > 30 ? '...' : '' }}
                </div>
                <div class="text-[10px] text-gray-400">{{ sub.submittedAt.slice(0, 10) }} · {{ sub.characterCount }}字</div>
              </div>
              <span class="text-sm font-black text-red-500">{{ sub.overallScore }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ChinesePageLayout>
</template>

<script setup lang="ts">
import '../shared/animations.css';
import { ref, computed, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { useGamification } from '../shared/use-gamification';
import type { WritingCriterion, WritingSubmission } from '../shared/types';
import { ChinesePageLayout, ChineseHero, DailyCheckIn } from '../components';
import ApiSettingsPanel from '../../shared-learning/components/ApiSettingsPanel.vue';
import { useLLMConfig } from '../../shared-learning/composables/use-llm-config';
import { scoreEssay } from '#/api/core/essay';

const gamification = useGamification();
const { isConfigured } = useLLMConfig();

const essayContent = ref(loadDraft());
const showResults = ref(false);
const isScoring = ref(false);
const apiStatus = ref<'llm' | 'heuristic' | ''>('');

const canSubmit = computed(() => {
  const len = essayContent.value.replace(/\s+/g, '').length;
  return len >= 500 && len <= 3000;
});

interface AnalysisResult {
  overallScore: number;
  overallComment: string;
  scores: WritingCriterion[];
  suggestions: string[];
  strengths: string[];
}

const analysisResult = ref<AnalysisResult | null>(null);

const recentSubmissions = ref<WritingSubmission[]>(loadHistory());

async function submitEssay() {
  if (!canSubmit.value) {
    message.warning('论文字数需在 500-3000 字之间');
    return;
  }

  isScoring.value = true;
  apiStatus.value = '';

  try {
    const result = await scoreEssay({
      content: essayContent.value,
      lang: 'zh',
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
        icon: s.icon,
      })),
      suggestions: result.suggestions,
      strengths: result.strengths || [],
    };

    showResults.value = true;

    gamification.addXp(50);
    gamification.unlockAchievement('essay-first');

    saveSubmission({
      content: essayContent.value,
      characterCount: essayContent.value.replace(/\s+/g, '').length,
      submittedAt: new Date().toISOString(),
      scores: analysisResult.value.scores,
      overallScore: result.overallScore,
      suggestions: result.suggestions,
    });

    recentSubmissions.value = loadHistory();
    message.success(`AI 批改完成！总分 ${result.overallScore}/100，获得 50 XP`);
  } catch (err) {
    message.error('评分失败，请重试');
    console.error('Essay scoring failed:', err);
  } finally {
    isScoring.value = false;
  }
}

function loadDraft(): string {
  try { return localStorage.getItem('zh-uni-essay-draft') || ''; } catch { return ''; }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function autoSaveEssay() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem('zh-uni-essay-draft', essayContent.value); } catch {}
  }, 300);
}

onUnmounted(() => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    try { localStorage.setItem('zh-uni-essay-draft', essayContent.value); } catch {}
  }
});

function clearEssay() {
  essayContent.value = '';
  localStorage.removeItem('zh-uni-essay-draft');
  showResults.value = false;
  analysisResult.value = null;
  apiStatus.value = '';
}

function saveSubmission(submission: WritingSubmission) {
  try {
    const history = JSON.parse(localStorage.getItem('zh-uni-essay-history') || '[]');
    history.unshift(submission);
    localStorage.setItem('zh-uni-essay-history', JSON.stringify(history.slice(0, 20)));
  } catch {}
}

function loadHistory(): WritingSubmission[] {
  try {
    return JSON.parse(localStorage.getItem('zh-uni-essay-history') || '[]');
  } catch { return []; }
}

function loadSubmission(sub: WritingSubmission) {
  essayContent.value = sub.content;
  analysisResult.value = {
    overallScore: sub.overallScore,
    overallComment: '',
    scores: sub.scores,
    suggestions: sub.suggestions,
    strengths: [],
  };
  showResults.value = true;
  apiStatus.value = '';
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-green-500';
  if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-blue-600';
  return 'bg-gradient-to-r from-red-500 to-rose-500';
}

const criteria = [
  { title: '论点深度', desc: '论点明确性、问题意识和论证的深刻程度。', icon: '🎯', text: 'text-red-700 dark:text-red-400', bg: 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20' },
  { title: '逻辑结构', desc: '论证层次清晰性、逻辑严谨性与首尾连贯度。', icon: '🔗', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20' },
  { title: '学术规范', desc: '引用格式规范性、术语准确性与学术诚信度。', icon: '📋', text: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20' },
  { title: '创新见解', desc: '视角新颖性、独立思考能力与学术贡献度。', icon: '💎', text: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/20' },
  { title: '文献运用', desc: '文献掌握广度、运用恰当性与理论支撑力。', icon: '📚', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20' },
];

const writingTips = [
  { icon: '📌', title: '论文选题', desc: '选择有价值、有创新空间且资料可及的学术问题，明确研究边界。' },
  { icon: '📋', title: '文献综述', desc: '系统梳理已有研究成果，指出研究空白，确立自己的学术定位。' },
  { icon: '🔗', title: '论证方法', desc: '综合运用例证、引证、比较、分析等方法，层层推进论证。' },
  { icon: '📚', title: '学术引用规范', desc: '遵循 GB/T 7714 或 APA 格式，做到引必有据、注必清晰。' },
  { icon: '📐', title: '论文结构', desc: '引言→文献综述→方法论→分析论证→结论的标准学术结构。' },
  { icon: '✏️', title: '学术语言', desc: '使用准确、规范、简洁的学术表达，避免口语化和情绪化用语。' },
];
</script>

<style scoped>
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(225, 29, 72, 0.3); }
}
.animate-pulse-glow {
  animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  background: linear-gradient(90deg, transparent 25%, rgba(59,130,246,0.15) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 2.5s ease-in-out infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
.results-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.results-enter-from { opacity: 0; transform: translateY(20px); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>
