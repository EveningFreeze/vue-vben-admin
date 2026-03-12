<template>
  <div class="p-6 h-full bg-[#f8fafc] dark:bg-[#09090b] overflow-y-auto custom-scrollbar">
    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-2xl font-bold mb-2">词汇能力测评</h1>
          <p class="text-indigo-100 opacity-90 text-sm">今日已坚持练习 15 分钟，继续加油！</p>
          <button class="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all active:scale-95">
            开始今日回顾
          </button>
        </div>
        <div class="hidden sm:block opacity-20 transform scale-150 rotate-12">
          <span class="text-[120px]">📚</span>
        </div>
      </div>

      <div 
        @click="navTo('/english/report')"
        class="bg-white dark:bg-[#18181b] rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
      >
        <div class="flex justify-between items-start">
          <div class="p-4 bg-orange-100 dark:bg-orange-500/10 rounded-2xl text-orange-600 shadow-sm">
            <span class="text-3xl">📙</span>
          </div>
          <span class="text-xs font-bold text-gray-400 group-hover:text-orange-500 transition-colors uppercase tracking-widest font-mono">Review ></span>
        </div>
        <div>
          <div class="text-3xl font-black text-gray-900 dark:text-white mb-1">127</div>
          <div class="text-sm text-gray-500 dark:text-zinc-400 font-bold">错词本待复习</div>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-extrabold text-gray-800 dark:text-zinc-100 flex items-center gap-3">
          <span class="w-2 h-6 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20"></span>
          阶段测试
        </h2>
      </div>
      
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="test in stageTests" :key="test.title" 
             @click="navTo(test.path)"
             class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer group relative">
          
          <div v-if="test.tag" class="absolute -top-2 -right-1 px-3 py-1 bg-red-500 text-white text-[10px] rounded-lg font-black shadow-md z-10 animate-bounce">
            {{ test.tag }}
          </div>
          
          <div :class="test.iconBg" class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl shadow-inner group-hover:scale-110 transition-transform">
            {{ test.icon }}
          </div>
          
          <h3 class="text-base font-black text-gray-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-600 transition-colors">
            {{ test.title }}
          </h3>
          <p class="text-[12px] text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">
            {{ test.desc }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
      <div class="bg-white dark:bg-[#18181b] rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-sm">
        <h2 class="text-base font-bold text-gray-800 dark:text-zinc-100 mb-6">词汇量测试精准分析</h2>
        <div class="flex flex-col sm:flex-row gap-4">
          <div v-for="item in vocabTests" :key="item.title" 
               class="flex-1 p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-4">
            <div class="text-3xl">{{ item.icon }}</div>
            <div>
              <div class="text-sm font-bold text-gray-800 dark:text-zinc-200">{{ item.title }}</div>
              <div class="text-xs text-gray-400 mt-1 font-medium">{{ item.sub }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-[#18181b] rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
        <div class="flex justify-between items-end mb-5">
          <div>
            <div class="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Efficiency</div>
            <div class="text-3xl font-black text-gray-900 dark:text-white">84.2%</div>
          </div>
          <div class="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">↑ 2.4% Progress</div>
        </div>
        <div class="space-y-4">
          <div v-for="p in progress" :key="p.label">
            <div class="flex justify-between text-xs mb-2">
              <span class="font-bold text-gray-600 dark:text-zinc-400">{{ p.label }}</span>
              <span class="font-mono text-gray-400">{{ p.val }}%</span>
            </div>
            <div class="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div :style="{ width: p.val + '%' }" :class="p.color" class="h-full rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * 通用路由跳转函数
 * @param path 目标路由路径
 */
const navTo = (path: string) => {
  if (!path) return;
  router.push(path);
};

const stageTests = [
  { title: '看英选中', desc: '根据英文单词选出对应含义，强化核心记忆', icon: '🔍', iconBg: 'bg-blue-50 dark:bg-blue-500/10', tag: '', path: '/english/quiz/detail' },
  { title: '听音辨义', desc: '训练听力敏感度与词义联想，实战听力环境', icon: '🎧', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', tag: '', path: '' },
  { title: '看中选英', desc: '强化中文释义到英文的转化，提升口语表达', icon: '💡', iconBg: 'bg-amber-50 dark:bg-amber-500/10', tag: 'DIAMOND', path: '' },
  { title: '拼写测试', desc: '全拼练习，拒绝提笔忘字，夯实写作基础', icon: '🖋️', iconBg: 'bg-rose-50 dark:bg-rose-500/10', tag: '', path: '' },
];

const vocabTests = [
  { title: '阅读词汇', sub: '评估学术阅读量', icon: '📖' },
  { title: '听力词汇', sub: '专项突破听力瓶颈', icon: '🎙️' },
];

const progress = [
  { label: '基础词汇 (Level 1-2)', val: 95, color: 'bg-emerald-500' },
  { label: '进阶词汇 (Level 3-4)', val: 72, color: 'bg-indigo-500' },
  { label: '核心词汇 (Level 5+)', val: 38, color: 'bg-rose-400' },
];
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
</style>
