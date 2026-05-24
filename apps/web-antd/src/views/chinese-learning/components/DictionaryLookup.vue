<template>
  <Transition name="slide">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div class="p-5 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📖</span> 汉语词典
          </h3>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-xl" @click="$emit('close')">✕</button>
        </div>

        <!-- Search -->
        <div class="p-4">
          <div class="flex gap-2">
            <input
              v-model="searchWord"
              placeholder="输入汉字查询..."
              class="flex-1 p-3 bg-slate-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm text-gray-800 dark:text-zinc-200 placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              @keyup.enter="search"
            />
            <button
              class="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
              @click="search"
            >
              查词
            </button>
          </div>
        </div>

        <!-- Result -->
        <div v-if="result" class="px-4 pb-5 space-y-4">
          <div class="bg-slate-50 dark:bg-zinc-700 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ result.word }}</span>
              <span class="text-sm text-gray-500 font-mono">{{ result.pinyin }}</span>
            </div>
            <div class="text-xs text-gray-400">
              <span>{{ result.radical }}</span>
              <span class="mx-2">·</span>
              <span>{{ result.strokes }} 画</span>
            </div>
          </div>
          <div v-for="(m, idx) in result.meanings" :key="idx" class="space-y-1">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ m.partOfSpeech }}</div>
            <p class="text-sm text-gray-700 dark:text-zinc-300">{{ m.definition }}</p>
            <p v-if="m.example" class="text-xs text-gray-400 italic">「{{ m.example }}」</p>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!result && searched" class="px-4 pb-5 text-center text-sm text-gray-400">
          未找到相关结果
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  visible: boolean;
  word?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const searchWord = ref('');
const searched = ref(false);

interface DictResult {
  word: string;
  pinyin: string;
  radical: string;
  strokes: number;
  meanings: { partOfSpeech: string; definition: string; example: string }[];
}

const result = ref<DictResult | null>(null);

const mockDict: Record<string, DictResult> = {
  '学': { word: '学', pinyin: 'xué', radical: '子', strokes: 8, meanings: [
    { partOfSpeech: '动词', definition: '学习，模仿', example: '学而时习之，不亦说乎。' },
    { partOfSpeech: '名词', definition: '学问，知识', example: '他很有学问。' },
  ]},
  '习': { word: '习', pinyin: 'xí', radical: '乙', strokes: 3, meanings: [
    { partOfSpeech: '动词', definition: '练习，复习', example: '温故而知新。' },
    { partOfSpeech: '名词', definition: '习惯', example: '养成良好的学习习惯。' },
  ]},
};

function search() {
  const w = searchWord.value.trim();
  if (!w) return;
  searched.value = true;
  result.value = mockDict[w] || null;
}
</script>

<style scoped>
.slide-enter-active { transition: all 0.3s ease-out; }
.slide-leave-active { transition: all 0.2s ease-in; }
.slide-enter-from, .slide-leave-to { opacity: 0; }
.slide-enter-from > div, .slide-leave-to > div { transform: scale(0.9); }
</style>
