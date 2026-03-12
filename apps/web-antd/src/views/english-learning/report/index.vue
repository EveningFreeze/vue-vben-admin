<template>
  <div class="p-6 h-full bg-[#f8fafc] dark:bg-[#09090b] overflow-y-auto custom-scrollbar">
    <div class="mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
      <div class="relative z-10">
        <h1 class="text-2xl font-black mb-2 flex items-center gap-2">
          📅 2026 英语备考冲刺计划
        </h1>
        <p class="text-indigo-100 text-sm opacity-90 font-medium">
          距离目标考试还有 <span class="text-yellow-300 font-black text-lg mx-1">45</span> 天
        </p>
        <div class="mt-6 flex flex-wrap gap-4">
          <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <span class="text-[10px] uppercase font-bold block opacity-70">当前进度</span>
            <span class="text-sm font-black">68% 完成</span>
          </div>
          <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <span class="text-[10px] uppercase font-bold block opacity-70">目标分数</span>
            <span class="text-sm font-black">600+</span>
          </div>
        </div>
      </div>
      <span class="absolute -bottom-10 -right-10 text-[180px] opacity-10">🎓</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
            备考阶段规划
          </h2>
          
          <div class="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-zinc-800">
            <div v-for="(phase, index) in prepPhases" :key="index" class="relative pl-10">
              <div :class="phase.active ? 'bg-indigo-500 ring-4 ring-indigo-500/20' : 'bg-slate-300 dark:bg-zinc-700'" 
                   class="absolute left-0 top-1.5 w-9 h-9 -ml-[1px] rounded-xl flex items-center justify-center text-white z-10 transition-all">
                <span class="text-xs font-bold">{{ index + 1 }}</span>
              </div>
              
              <div :class="phase.active ? 'border-indigo-100 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-gray-100 dark:border-zinc-800'" 
                   class="p-5 rounded-2xl border transition-all hover:shadow-md">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-base font-black text-gray-900 dark:text-zinc-100">{{ phase.title }}</h3>
                  <span :class="phase.active ? 'text-indigo-600 bg-indigo-100' : 'text-gray-400 bg-slate-100'" 
                        class="text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    {{ phase.status }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-medium mb-4">{{ phase.desc }}</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div v-for="task in phase.tasks" :key="task" class="flex items-center gap-2 text-[11px] text-gray-600 dark:text-zinc-300 font-bold">
                    <span class="text-emerald-500">✔</span> {{ task }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 class="text-sm font-black text-gray-800 dark:text-zinc-100 mb-4 uppercase tracking-widest">Today's Focus</h3>
          <div class="space-y-3">
            <div v-for="item in dailyTasks" :key="item.text" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-all">
              <div class="flex items-center gap-3">
                <div :class="item.done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-700'" class="w-2 h-2 rounded-full"></div>
                <span :class="item.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-zinc-200'" class="text-xs font-bold">{{ item.text }}</span>
              </div>
              <span class="text-[10px] font-mono text-gray-400 opacity-0 group-hover:opacity-100">{{ item.time }}</span>
            </div>
          </div>
        </div>

        <div class="bg-[#1e1b4b] p-6 rounded-3xl text-white relative overflow-hidden shadow-xl border border-indigo-500/30">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <span class="animate-pulse w-2 h-2 bg-emerald-400 rounded-full"></span>
              <h3 class="text-xs font-black uppercase tracking-widest">AI 智启建议</h3>
            </div>
            <p class="text-xs text-indigo-100 leading-relaxed font-medium">
              根据你在 <span class="text-yellow-400">词汇能力测评</span> 中的表现，建议本周重点突破 **非谓语动词**。
              在进行 <span class="text-emerald-400">衡水体作文训练</span> 时，多使用 "Having said that" 等高级连接词。
            </p>
          </div>
          <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const prepPhases = [
  { 
    title: '基础巩固期 (Weeks 1-4)', 
    status: 'Completed', 
    active: false,
    desc: '聚焦核心 3500 词汇与基础语法框架，建立写作衡水体字形基础。',
    tasks: ['核心词汇两轮复习', '五大基本句型掌握', '衡水体字母单项训练']
  },
  { 
    title: '强化突破期 (Weeks 5-8)', 
    status: 'In Progress', 
    active: true,
    desc: '专项突破听力长对话、阅读深度理解，以及作文的高级句式表达。',
    tasks: ['长难句拆解训练', 'AI 作文批改提分', '真题阅读分类解析']
  },
  { 
    title: '冲刺模拟期 (Weeks 9-12)', 
    status: 'Upcoming', 
    active: false,
    desc: '全真模拟套卷练习，严格控制答题时间，进行错词本最后扫盲。',
    tasks: ['全真模拟套卷 10 套', '考前错词本彻底清查', '考前心态管理']
  }
];

const dailyTasks = [
  { text: '单词速记 (50词)', time: '20min', done: true },
  { text: '衡水体临摹练习', time: '15min', done: true },
  { text: '阅读理解专项 (3篇)', time: '40min', done: false },
  { text: 'AI 作文练习与批改', time: '30min', done: false },
];
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
</style>
