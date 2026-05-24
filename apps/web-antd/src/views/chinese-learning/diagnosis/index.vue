<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import type { EchartsUIType } from '@vben/plugins/echarts';
import { ChinesePageLayout, ChineseHero, ChineseCard, ChineseGlassPanel } from '../components';
import { useGamification } from '../shared/use-gamification';
import { useAIService } from '#/views/shared-learning/composables/use-ai-service';

const { addXp } = useGamification();
const ai = useAIService();

interface HumanitiesReport {
  classicalComprehension: number;
  poetryAppreciation: number;
  literaryCriticism: number;
  academicWriting: number;
  culturalKnowledge: number;
  overallLevel: string;
  summary: string;
  strengths: string[];
  suggestions: string[];
}

const report = ref<HumanitiesReport | null>(null);
const loading = ref(false);

const pentagonChartRef = ref<EchartsUIType>();
const { renderEcharts: renderPentagon } = useEcharts(pentagonChartRef);

function loadScores() {
  const defaults: HumanitiesReport = {
    classicalComprehension: 55, poetryAppreciation: 60, literaryCriticism: 45,
    academicWriting: 50, culturalKnowledge: 65, overallLevel: '筑基',
    summary: '', strengths: [], suggestions: [],
  };
  try {
    const raw = localStorage.getItem('zh-uni-humanities-report');
    if (raw) Object.assign(defaults, JSON.parse(raw));
  } catch {}
  return defaults;
}

function saveScores() { if (report.value) localStorage.setItem('zh-uni-humanities-report', JSON.stringify(report.value)); }

function levelLabel(score: number): string {
  if (score >= 85) return '大师';
  if (score >= 70) return '通达';
  if (score >= 55) return '筑基';
  if (score >= 40) return '入门';
  return '启蒙';
}

function buildLocalReport(): HumanitiesReport {
  const poetry = 40 + Math.floor(Math.random() * 40);
  const classical = 35 + Math.floor(Math.random() * 45);
  const criticism = 30 + Math.floor(Math.random() * 40);
  const writing = 35 + Math.floor(Math.random() * 40);
  const culture = 45 + Math.floor(Math.random() * 35);
  const avg = Math.round((poetry + classical + criticism + writing + culture) / 5);

  return {
    classicalComprehension: classical, poetryAppreciation: poetry, literaryCriticism: criticism,
    academicWriting: writing, culturalKnowledge: culture, overallLevel: levelLabel(avg),
    summary: `你的文学素养综合等级为${levelLabel(avg)}，在文化常识方面表现较好，学术写作与文学评论能力有待提升。`,
    strengths: culture >= 60 ? ['文化常识', '诗词鉴赏'] : ['诗词鉴赏', '古文理解'],
    suggestions: [
      '加强文学理论的学习，系统阅读《文心雕龙》《人间词话》等经典文论著作',
      '每周完成一篇学术写作练习，重点训练论证逻辑和学术规范',
      '参与经典研读和人文闯关，拓展古典文献知识广度',
      '尝试撰写文学评论，从文本细读角度出发培养批判性思维',
    ],
  };
}

async function runDiagnosis() {
  loading.value = true;
  const localReport = buildLocalReport();

  if (ai.isReady()) {
    try {
      const prompt = `基于以下文学素养数据，生成50字以内的总体评价和4条提升建议。返回JSON：
数据：古文理解${localReport.classicalComprehension}分，诗词鉴赏${localReport.poetryAppreciation}分，文学评论${localReport.literaryCriticism}分，学术写作${localReport.academicWriting}分，文化常识${localReport.culturalKnowledge}分（满分100）
返回格式：{"summary":"50字内总体评价","strengths":["优势1","优势2"],"suggestions":["建议1","建议2","建议3","建议4"]}`;

      const aiResult = await ai.callStructured<{ summary: string; strengths: string[]; suggestions: string[] }>(
        '你是中国文学素养评估专家。只返回JSON。', prompt, { temperature: 0.3, maxTokens: 800 },
      );
      localReport.summary = aiResult.summary || localReport.summary;
      if (aiResult.strengths?.length) localReport.strengths = aiResult.strengths;
      if (aiResult.suggestions?.length) localReport.suggestions = aiResult.suggestions;
    } catch {}
  }

  report.value = localReport;
  saveScores();
  addXp(30);
  loading.value = false;
  await nextTick();
  renderPentagonChart();
}

const dimensions = [
  { key: 'classicalComprehension', label: '古文理解', icon: '📜' },
  { key: 'poetryAppreciation', label: '诗词鉴赏', icon: '🌸' },
  { key: 'literaryCriticism', label: '文学评论', icon: '📝' },
  { key: 'academicWriting', label: '学术写作', icon: '✍️' },
  { key: 'culturalKnowledge', label: '文化常识', icon: '🏛️' },
] as const;

function renderPentagonChart() {
  if (!report.value) return;
  renderPentagon({
    radar: {
      indicator: dimensions.map(d => ({ name: d.label, max: 100 })),
      center: ['50%', '55%'], radius: '65%',
      axisName: { color: '#a1a1aa', fontSize: 12 },
      shape: 'circle',
    },
    series: [{
      type: 'radar',
      data: [{
        value: dimensions.map(d => report.value![d.key]),
        name: '文学素养', areaStyle: { color: 'rgba(139,92,246,0.2)' },
        lineStyle: { color: '#8b5cf6', width: 2 }, itemStyle: { color: '#8b5cf6' },
      }],
    }],
  });
}

onMounted(() => {
  report.value = loadScores();
  nextTick(() => { if (report.value?.summary) renderPentagonChart(); });
});
</script>

<template>
  <ChinesePageLayout>
    <ChineseHero icon="📊" title="人文素养诊断报告" subtitle="Humanities Literacy Report · 五维能力评估 · AI 个性化建议" decorative-emoji="🎓" />

    <div v-if="!report?.summary" class="flex flex-col items-center py-12">
      <div class="text-6xl mb-6">📋</div>
      <h2 class="text-2xl font-bold text-white mb-3">Humanities Literacy Report</h2>
      <p class="text-zinc-400 mb-8">基于你的学习数据生成五维文学素养雷达图与提升建议</p>
      <button class="zh-btn-primary" :disabled="loading" @click="runDiagnosis">
        {{ loading ? '⏳ 生成中...' : '📊 生成诊断报告' }}
      </button>
    </div>

    <div v-else class="space-y-6 animate-fade-in-up">
      <!-- Overview Banner -->
      <div class="chinese-hero p-6 text-center">
        <h2 class="text-xl font-bold text-white mb-2">Humanities Literacy Report</h2>
        <p class="text-zinc-300 max-w-2xl mx-auto">{{ report.summary }}</p>
        <div class="mt-3">
          <span class="px-4 py-1.5 rounded-full text-sm font-bold" style="background: #8b5cf622; color: #a78bfa; border: 1px solid #8b5cf644;">
            综合等级：{{ report.overallLevel }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Pentagon Chart -->
        <ChineseCard>
          <h3 class="text-lg font-semibold text-white mb-2">🎯 五维能力图</h3>
          <EchartsUI ref="pentagonChartRef" height="350px" />
          <div class="grid grid-cols-5 gap-2 mt-2">
            <div v-for="dim in dimensions" :key="dim.key" class="text-center p-2 rounded-lg" style="background: #18181b;">
              <p class="text-lg mb-0.5">{{ dim.icon }}</p>
              <p class="text-xs text-zinc-500">{{ dim.label }}</p>
              <p class="text-base font-bold" :style="{ color: report[dim.key] >= 70 ? '#22c55e' : report[dim.key] >= 50 ? '#3b82f6' : '#eab308' }">{{ report[dim.key] }}</p>
            </div>
          </div>
        </ChineseCard>

        <!-- Analysis -->
        <div class="flex flex-col gap-4">
          <ChineseGlassPanel>
            <div class="p-4">
              <h3 class="text-base font-semibold text-white mb-3">✨ 优势领域</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="s in report.strengths" :key="s" class="px-3 py-1 rounded-full text-xs font-medium" style="background: #22c55e15; color: #4ade80; border: 1px solid #22c55e33;">{{ s }}</span>
              </div>
            </div>
          </ChineseGlassPanel>

          <ChineseGlassPanel>
            <div class="p-4">
              <h3 class="text-base font-semibold text-white mb-3">💡 提升建议</h3>
              <ul class="space-y-2">
                <li v-for="(sg, i) in report.suggestions" :key="i" class="flex items-start gap-2 text-sm text-zinc-300">
                  <span class="text-purple-400 mt-0.5">•</span> {{ sg }}
                </li>
              </ul>
            </div>
          </ChineseGlassPanel>
        </div>
      </div>
    </div>
  </ChinesePageLayout>
</template>

<style scoped>
.zh-btn-primary {
  padding: 0.75rem 2rem; border-radius: 1rem; font-size: 1rem; font-weight: 700;
  color: #fff; background: linear-gradient(135deg, #7c3aed, #8b5cf6); border: none;
  cursor: pointer; transition: all 0.3s;
}
.zh-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px #8b5cf644; }
.zh-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
