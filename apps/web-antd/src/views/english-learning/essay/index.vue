<template>
  <div class="p-6 h-full bg-slate-50 dark:bg-[#09090b] overflow-hidden">
    <div class="mb-6 bg-white dark:bg-[#18181b] p-5 rounded-2xl shadow-md flex items-center justify-between border border-gray-200 dark:border-zinc-800">
      <div class="flex items-center gap-5">
        <div class="bg-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-500/20">
          <span class="text-2xl">✍️</span>
        </div>
        <div>
          <h1 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            智启英语 - 作文批改中心
          </h1>
          <p class="text-sm text-gray-500 dark:text-zinc-400 font-medium">
            工作流驱动
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-bold border border-emerald-100 dark:border-emerald-500/20">
          ● AI 系统已就绪
        </div>
      </div>
    </div>

    <div class="flex gap-6 h-[calc(100vh-180px)]">
      <div class="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 class="text-base font-bold text-gray-800 dark:text-zinc-100 mb-5 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
            批改维度参考
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="item in criteria" :key="item.title" :class="item.bg" class="p-4 rounded-xl border transition-all hover:scale-[1.02]">
              <div :class="item.text" class="text-sm font-bold mb-2 tracking-wide">{{ item.title }}</div>
              <p class="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-medium">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm flex-1 flex flex-col overflow-hidden">
          <h2 class="text-base font-bold text-gray-800 dark:text-zinc-100 mb-5 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
            高分衔接句式
          </h2>
          <div class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <div v-for="phrase in phrases" :key="phrase.en" class="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-transparent hover:border-emerald-500/50 transition-all group">
              <div class="text-[13px] font-bold text-gray-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ phrase.en }}
              </div>
              <div class="text-[11px] text-gray-500 dark:text-zinc-500 mt-1.5 font-medium italic">
                {{ phrase.zh }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-[620px] bg-white dark:bg-[#18181b] rounded-2xl border-2 border-indigo-500/20 shadow-2xl overflow-hidden relative">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 z-20"></div>
        
        <iframe
          src="https://udify.app/chatbot/S4JfvEUUs4U0ZBuN" 
          class="w-full border-none"
          style="height: calc(100% + 64px); margin-top: -64px;"
          allow="microphone"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const criteria = [
  { title: 'Grammar (语法)', desc: '评估时态准确性与复杂句式应用。', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20' },
  { title: 'Vocabulary (词汇)', desc: '学术词汇广度、用词精准度与拼写。', text: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/20' },
  { title: 'Cohesion (连贯)', desc: '逻辑连接词的使用与段落承接质量。', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20' },
  { title: 'Writing Style (书写)', desc: '字间距、倾斜度及整体视觉美感。', text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20' },
];

const phrases = [
  { en: "It is widely acknowledged that...", zh: "众所周知..." },
  { en: "Confronted with such a challenge...", zh: "面对如此挑战..." },
  { en: "As the proverb goes...", zh: "正如谚语所说..." },
  { en: "From my own perspective...", zh: "在我看来..." },
  { en: "To put it in a nutshell...", zh: "概括来说..." },
  { en: "The underlying reason is that...", zh: "深层原因是..." },
  { en: "Given the facts mentioned above...", zh: "考虑到上述事实..." },
  { en: "An additional point to emphasize is...", zh: "另一个需要强调的点是..." }
];
</script>

<style scoped>
/* 滚动条美化：增加宽度和对比度 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
