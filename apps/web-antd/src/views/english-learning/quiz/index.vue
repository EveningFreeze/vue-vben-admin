<template>
  <div class="p-6 h-full bg-[#f8fafc] dark:bg-[#09090b] overflow-y-auto custom-scrollbar">
    
    <div v-if="!isReviewing" class="animate-fade-in">
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
          <div class="relative z-10">
            <h1 class="text-2xl font-bold mb-2">词汇能力测评</h1>
            <p class="text-indigo-100 opacity-90 text-sm">今日已坚持练习 15 分钟，继续加油！</p>
            <button 
              @click="startReview" 
              class="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
            >
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
            <span class="text-xs font-bold text-gray-400 group-hover:text-orange-500 transition-colors tracking-widest font-mono">Review ></span>
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
            <span class="w-2 h-6 bg-indigo-500 rounded-full shadow-lg"></span>
            阶段测试
          </h2>
        </div>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="test in stageTests" :key="test.title" 
               @click="navTo(test.path)"
               class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group relative">
            <div v-if="test.tag" class="absolute -top-2 -right-1 px-3 py-1 bg-red-500 text-white text-[10px] rounded-lg font-black shadow-md z-10 animate-bounce">
              {{ test.tag }}
            </div>
            <div :class="test.iconBg" class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl shadow-inner group-hover:scale-110 transition-transform">
              {{ test.icon }}
            </div>
            <h3 class="text-base font-black text-gray-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-600">
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
                 class="flex-1 p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-transparent hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-4">
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

    <div v-else class="animate-fade-in max-w-2xl mx-auto py-10">
      <div class="flex items-center justify-between mb-8">
        <button @click="isReviewing = false" class="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <span>← 返回测评中心</span>
        </button>
        <div class="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1 rounded-full">
          进度：{{ wordIndex + 1 }} / {{ reviewList.length }}
        </div>
      </div>

      <div class="bg-white dark:bg-[#18181b] rounded-[40px] p-12 shadow-2xl border border-indigo-100 dark:border-zinc-800 text-center relative">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl flex items-center justify-center text-4xl text-white">
          📖
        </div>

        <div class="mt-4">
          <h2 class="text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {{ currentWord.word }}
          </h2>
          <div class="flex justify-center items-center gap-3 mb-10">
            <span class="text-xl text-indigo-500 font-mono italic">[{{ currentWord.phonetic }}]</span>
            <button @click="playAudio" class="p-2 hover:bg-indigo-50 rounded-full transition-colors text-xl">🔊</button>
          </div>

          <div v-if="showAnswer" class="animate-slide-up">
            <div class="p-8 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[30px] text-left border border-indigo-100 dark:border-indigo-900/30 mb-8">
              <div class="text-sm font-black text-indigo-400 uppercase mb-2 tracking-widest">Meaning</div>
              <div class="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-4">{{ currentWord.meaning }}</div>
              <div class="text-sm font-black text-indigo-400 uppercase mb-2 tracking-widest">Example</div>
              <div class="text-base text-gray-600 dark:text-zinc-400 italic">"{{ currentWord.example }}"</div>
            </div>
            
            <button 
              @click="handleNext" 
              class="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all active:scale-95"
            >
              {{ wordIndex === reviewList.length - 1 ? '完成回顾' : '掌握了，下一个' }}
            </button>
          </div>

          <button 
            v-else 
            @click="showAnswer = true" 
            class="w-full py-5 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all"
          >
            点击查看词义解析
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

const router = useRouter();

// --- 状态控制 ---
const isReviewing = ref(false);  // 是否进入复习模式
const showAnswer = ref(false);   // 是否显示单词释义
const wordIndex = ref(0);        // 当前复习到第几个词

// --- 模拟回顾数据 ---
const reviewList = [
  { 
    word: 'Persistent', 
    phonetic: 'pərˈsɪstənt', 
    meaning: 'adj. 执着的，坚持不懈的', 
    example: 'He is a persistent investigator who never gives up.' 
  },
  { 
    word: 'Innovation', 
    phonetic: 'ˌɪnəˈveɪʃn', 
    meaning: 'n. 创新，革新；新方法', 
    example: 'Technical innovation is key to business success.' 
  },
  { 
    word: 'Framework', 
    phonetic: 'ˈfreɪmwɜːrk', 
    meaning: 'n. 框架，结构', 
    example: 'Vue.js is a progressive framework for building user interfaces.' 
  }
];

// 计算当前显示的单词对象
const currentWord = computed(() => reviewList[wordIndex.value]);

// --- 方法 ---
const startReview = () => {
  wordIndex.value = 0;
  showAnswer.value = false;
  isReviewing.value = true;
};

const handleNext = () => {
  if (wordIndex.value < reviewList.length - 1) {
    wordIndex.value++;
    showAnswer.value = false; // 切换新词时隐藏答案
  } else {
    message.success('恭喜！你已完成今日全部词汇回顾');
    isReviewing.value = false;
  }
};

const playAudio = () => {
  message.info(`正在播放 ${currentWord.value.word} 的标准发音...`);
};

const navTo = (path: string) => {
  if (!path) return;
  router.push(path);
};

// --- 原有静态数据 ---
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
/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

/* 动画效果 */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
