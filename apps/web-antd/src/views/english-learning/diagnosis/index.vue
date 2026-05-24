<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import type { EchartsUIType } from '@vben/plugins/echarts';
import { EnglishPageLayout, EnglishHero, EnglishCard } from '../components';
import { useGamification } from '../shared/use-gamification';
import { useAIService } from '#/views/shared-learning/composables/use-ai-service';

const { addXp } = useGamification();
const ai = useAIService();

interface DiagnosisReport {
  cefr: Record<string, string>;
  ielts: { reading: number; writing: number; listening: number; speaking: number; overall: number };
  weakness: string;
  strengths: string[];
  improvementPath: { week: number; focus: string; tasks: string[] }[];
  overallLevel: string;
  summary: string;
}

interface AbilityScore { vocab: number; grammar: number; writing: number; listening: number; speaking: number; reading: number; }

const report = ref<DiagnosisReport | null>(null);
const loading = ref(false);
const diagnosticStep = ref(0);
const scores = ref<AbilityScore>({ vocab: 0, grammar: 0, writing: 0, listening: 0, speaking: 0, reading: 0 });
const showReport = ref(false);

const cefrChartRef = ref<EchartsUIType>();
const ieltsChartRef = ref<EchartsUIType>();
const { renderEcharts: renderCefr } = useEcharts(cefrChartRef);
const { renderEcharts: renderIelts } = useEcharts(ieltsChartRef);

const labelMap: Record<string, string> = { vocabulary: '词汇量', grammar: '语法', writing: '写作', listening: '听力', speaking: '口语', reading: '阅读' };
const cefrOrder = ['vocabulary', 'grammar', 'writing', 'listening', 'speaking', 'reading'];

function loadScores() {
  try {
    const raw = localStorage.getItem('en-ability-profile');
    if (raw) {
      const p = JSON.parse(raw);
      scores.value = {
        vocab: p.vocabulary || 55, grammar: p.grammar || 50, writing: p.writing || 60,
        listening: p.listening || 40, speaking: p.speaking || 45, reading: p.reading || 55,
      };
    }
  } catch {}
}

function cefrLevel(score: number): string {
  if (score >= 85) return 'C2';
  if (score >= 75) return 'C1';
  if (score >= 60) return 'B2';
  if (score >= 45) return 'B1';
  if (score >= 30) return 'A2';
  return 'A1';
}

function ieltsEstimate(score: number): number {
  const bands = [0, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
  return bands[Math.min(bands.length - 1, Math.floor(score / 6.25))] || 5.5;
}

function buildLocalReport(): DiagnosisReport {
  const s = scores.value;
  const avg = (s.vocab + s.grammar + s.writing + s.listening + s.speaking + s.reading) / 6;
  const overallIelts = ieltsEstimate(avg);
  return {
    cefr: {
      vocabulary: cefrLevel(s.vocab), writing: cefrLevel(s.writing), listening: cefrLevel(s.listening),
      speaking: cefrLevel(s.speaking), reading: cefrLevel(s.reading), grammar: cefrLevel(s.grammar),
    },
    ielts: {
      reading: ieltsEstimate(s.reading), writing: ieltsEstimate(s.writing),
      listening: ieltsEstimate(s.listening), speaking: ieltsEstimate(s.speaking),
      overall: Math.round(overallIelts * 2) / 2,
    },
    weakness: Object.entries(s).sort(([, a], [, b]) => a - b)[0]?.[0] || '',
    strengths: Object.entries(s).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k),
    improvementPath: [
      { week: 1, focus: '词汇强化', tasks: ['每日背词50个', '同义替换练习', '学术词汇专项'] },
      { week: 2, focus: '学术阅读', tasks: ['每日精读1篇', '长难句分析', '阅读速度训练'] },
      { week: 3, focus: '写作突破', tasks: ['每日一篇小作文', 'AI批改复盘', '高分范文模仿'] },
      { week: 4, focus: '听力冲刺', tasks: ['BBC每日精听', 'IELTS Section 2&3', '倍速听力训练'] },
    ],
    overallLevel: cefrLevel(avg),
    summary: '',
  };
}

function renderCharts() {
  if (!report.value) return;

  const cefrMap: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  const cefrValues = cefrOrder.map(k => cefrMap[report.value!.cefr[k] || ''] || 1);

  renderCefr({
    radar: {
      indicator: cefrOrder.map(k => ({ name: labelMap[k], max: 6 })),
      center: ['50%', '55%'],
      radius: '65%',
      axisName: { color: '#a1a1aa', fontSize: 11 },
    },
    series: [{
      type: 'radar',
      data: [{
        value: cefrValues,
        name: 'CEFR Level',
        areaStyle: { color: 'rgba(59,130,246,0.2)' },
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' },
      }],
    }],
  });

  const ieltsVals = [
    report.value.ielts.reading, report.value.ielts.writing,
    report.value.ielts.listening, report.value.ielts.speaking, report.value.ielts.overall,
  ];
  renderIelts({
    xAxis: {
      type: 'category',
      data: ['Reading', 'Writing', 'Listening', 'Speaking', 'Overall'],
      axisLabel: { color: '#a1a1aa' },
    },
    yAxis: {
      type: 'value', min: 0, max: 9,
      axisLabel: { color: '#a1a1aa' },
      splitLine: { lineStyle: { color: '#27272a' } },
    },
    series: [{
      type: 'bar',
      data: ieltsVals.map(v => ({
        value: v,
        itemStyle: {
          color: v >= 7 ? '#22c55e' : v >= 6 ? '#3b82f6' : v >= 5 ? '#eab308' : '#ef4444',
          borderRadius: [6, 6, 0, 0],
        },
      })),
      barWidth: '40%',
      label: { show: true, position: 'top', color: '#fff', formatter: (p: any) => p.value },
    }],
    grid: { top: 30, bottom: 30, left: 40, right: 20 },
  });
}

async function runDiagnosis() {
  loading.value = true;
  diagnosticStep.value = 1;

  loadScores();
  await new Promise(r => setTimeout(r, 600));
  diagnosticStep.value = 2;

  const localReport = buildLocalReport();
  diagnosticStep.value = 3;

  if (ai.isReady()) {
    try {
      const prompt = `根据以下英语能力数据生成个性化诊断报告。返回JSON格式（不要markdown）：
能力分数(满分100)：词汇${scores.value.vocab}、语法${scores.value.grammar}、写作${scores.value.writing}、听力${scores.value.listening}、口语${scores.value.speaking}、阅读${scores.value.reading}
返回：{"summary":"50字以内的整体评估","weakness":"最短板的维度","improvementPath":[{"week":1,"focus":"第1周重点","tasks":["任务1","任务2","任务3"]},{"week":2,"focus":"第2周重点","tasks":["任务1","任务2","任务3"]},{"week":3,"focus":"第3周重点","tasks":["任务1","任务2","任务3"]},{"week":4,"focus":"第4周重点","tasks":["任务1","任务2","任务3"]}]}`;
      const aiResult = await ai.callStructured<{ summary: string; weakness: string; improvementPath: typeof localReport.improvementPath }>(
        '你是专业的英语诊断专家。只返回JSON。', prompt, { temperature: 0.3, maxTokens: 1000 },
      );
      localReport.summary = aiResult.summary || '';
      if (aiResult.improvementPath?.length) localReport.improvementPath = aiResult.improvementPath;
    } catch {}
  }

  if (!localReport.summary) {
    localReport.summary = `你的英语综合水平约为${localReport.overallLevel}，建议重点提升${labelMap[localReport.weakness] || localReport.weakness}能力。`;
  }

  report.value = localReport;
  showReport.value = true;
  addXp(30);
  diagnosticStep.value = 4;
  loading.value = false;

  setTimeout(() => renderCharts(), 100);
}

onMounted(loadScores);
</script>

<template>
  <EnglishPageLayout>
    <EnglishHero icon="🏥" title="学习诊断中心" subtitle="AI 驱动的英语能力全面诊断 · CEFR & IELTS 预测 · 30天提升路径" decorative-emoji="📋" />

    <div v-if="!showReport" class="flex flex-col items-center py-16">
      <div class="text-6xl mb-6">🔬</div>
      <h2 class="text-2xl font-bold text-white mb-3">English Competency Diagnosis</h2>
      <p class="text-zinc-400 mb-8 max-w-md text-center">
        完成以下三项数据采集后，AI 将生成你的专属英语能力报告：
        <br />作文评估 · 词汇测试 · 听力训练
      </p>
      <div class="flex gap-4 mb-8">
        <div class="en-card p-4 text-center w-40">
          <div class="text-2xl mb-2">✍️</div>
          <p class="text-sm text-zinc-300">作文评估</p>
          <p class="text-xs text-zinc-500 mt-1">{{ scores.vocab > 0 ? '✓ 已完成' : '待完成' }}</p>
        </div>
        <div class="en-card p-4 text-center w-40">
          <div class="text-2xl mb-2">📝</div>
          <p class="text-sm text-zinc-300">词汇测试</p>
          <p class="text-xs text-zinc-500 mt-1">待完成</p>
        </div>
        <div class="en-card p-4 text-center w-40">
          <div class="text-2xl mb-2">🎧</div>
          <p class="text-sm text-zinc-300">听力训练</p>
          <p class="text-xs text-zinc-500 mt-1">待完成</p>
        </div>
      </div>
      <button class="en-btn-primary-lg" :disabled="loading" @click="runDiagnosis">
        {{ loading ? '⏳ AI 分析中...' : '🚀 开始诊断分析' }}
      </button>
    </div>

    <div v-if="showReport && report" class="space-y-6 animate-fade-in-up">
      <!-- Summary Banner -->
      <div class="en-hero p-6 text-center">
        <h2 class="text-xl font-bold text-white mb-2">English Competency Report</h2>
        <p class="text-zinc-300">{{ report.summary }}</p>
        <div class="flex items-center justify-center gap-4 mt-4">
          <div class="en-glass px-4 py-2 rounded-xl">
            <span class="text-sm text-zinc-400">Overall CEFR</span>
            <span class="text-2xl font-bold text-blue-400 ml-2">{{ report.overallLevel }}</span>
          </div>
          <div class="en-glass px-4 py-2 rounded-xl">
            <span class="text-sm text-zinc-400">IELTS Overall</span>
            <span class="text-2xl font-bold text-green-400 ml-2">{{ report.ielts.overall }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnglishCard>
          <h3 class="text-lg font-semibold text-white mb-2">CEFR Estimation</h3>
          <EchartsUI ref="cefrChartRef" height="320px" />
          <div class="grid grid-cols-3 gap-2 mt-2">
            <div v-for="key in cefrOrder" :key="key" class="text-center p-2 rounded-lg" style="background: #18181b;">
              <p class="text-xs text-zinc-500">{{ labelMap[key] }}</p>
              <p class="text-lg font-bold" :style="{ color: report.cefr[key] === 'C1' || report.cefr[key] === 'C2' ? '#22c55e' : report.cefr[key] === 'B2' ? '#3b82f6' : '#eab308' }">{{ report.cefr[key] }}</p>
            </div>
          </div>
        </EnglishCard>

        <EnglishCard>
          <h3 class="text-lg font-semibold text-white mb-2">IELTS Band Prediction</h3>
          <EchartsUI ref="ieltsChartRef" height="320px" />
        </EnglishCard>
      </div>

      <!-- Improvement Path -->
      <EnglishCard>
        <h3 class="text-lg font-semibold text-white mb-4">📅 30天提升路径</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="week in report.improvementPath" :key="week.week" class="en-glass p-4 rounded-xl">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style="background: #3b82f622; color: #3b82f6;">W{{ week.week }}</span>
              <span class="font-semibold text-white">{{ week.focus }}</span>
            </div>
            <ul class="space-y-1.5">
              <li v-for="(task, ti) in week.tasks" :key="ti" class="text-xs text-zinc-400 flex items-start gap-1.5">
                <span class="text-blue-400 mt-0.5">•</span> {{ task }}
              </li>
            </ul>
          </div>
        </div>
      </EnglishCard>
    </div>
  </EnglishPageLayout>
</template>

<style scoped>
.en-btn-primary-lg {
  padding: 0.75rem 2.5rem; border-radius: 1rem; font-size: 1.125rem; font-weight: 700;
  color: #fff; background: linear-gradient(135deg, #2563eb, #3b82f6); border: none;
  cursor: pointer; transition: all 0.3s;
}
.en-btn-primary-lg:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px #3b82f644; }
.en-btn-primary-lg:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
