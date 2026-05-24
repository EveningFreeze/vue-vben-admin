<template>
  <Transition name="panel-slide">
    <div
      v-if="visible"
      class="fixed inset-y-0 right-0 w-96 bg-white/95 dark:bg-zinc-700/95 backdrop-blur-xl shadow-2xl border-l border-gray-200 dark:border-zinc-600 z-50 flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b dark:border-zinc-700 bg-gradient-to-r from-en-500/5 to-en-cyan-500/5">
        <h3 class="font-bold text-sm text-gray-700 dark:text-zinc-300 flex items-center gap-2">
          <span>📖</span> 词典查询
        </h3>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors text-lg"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Search bar -->
      <div class="p-4">
        <div class="relative">
          <input
            v-model="searchWord"
            placeholder="输入英文单词..."
            class="w-full p-3 pr-10 rounded-xl border dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-en-500 focus:border-transparent outline-none transition-all"
            @keyup.enter="handleSearch"
          />
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-en-100 dark:hover:bg-en-500/20 transition-colors"
            @click="handleSearch"
          >
            🔍
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div class="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
        <!-- Loading state -->
        <div v-if="loading" class="space-y-4 pt-4">
          <div class="h-8 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div class="h-4 w-1/2 bg-slate-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div class="h-24 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div class="h-24 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="flex flex-col items-center justify-center pt-10 text-center">
          <span class="text-4xl mb-4">😕</span>
          <p class="text-gray-500 dark:text-zinc-400 text-sm font-medium">{{ error }}</p>
          <button
            class="mt-4 px-4 py-2 bg-en-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
            @click="handleSearch"
          >
            重新查询
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!lastSearched" class="flex flex-col items-center justify-center pt-16 text-center">
          <span class="text-5xl mb-4">🔍</span>
          <p class="text-gray-400 dark:text-zinc-400 text-sm font-medium">搜索一个单词来查看释义</p>
          <p class="text-gray-300 dark:text-zinc-500 text-xs mt-2">支持形容词、名词、动词等查询</p>
        </div>

        <!-- Result -->
        <div v-else-if="dictResult" class="space-y-4 pt-2">
          <!-- Word header -->
          <div class="flex items-center gap-3">
            <h2 class="text-3xl font-black text-gray-900 dark:text-white">{{ dictResult.word }}</h2>
            <PronunciationBtn :word="dictResult.word" size="md" />
          </div>

          <!-- Phonetic -->
          <p class="text-sm text-en-500 dark:text-en-400 font-mono italic">
            {{ dictResult.phonetic || dictResult.phonetics?.[0]?.text || '' }}
          </p>

          <!-- Meanings -->
          <div v-for="(meaning, idx) in dictResult.meanings" :key="idx" class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-white bg-en-500 px-2 py-0.5 rounded uppercase tracking-wider">{{ meaning.partOfSpeech }}</span>
            </div>

            <div class="space-y-2 pl-2">
              <div v-for="(def, didx) in meaning.definitions.slice(0, 3)" :key="didx" class="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-transparent hover:border-en-200/50 transition-colors">
                <p class="text-sm text-gray-700 dark:text-zinc-300">{{ def.definition }}</p>
                <p v-if="def.example" class="text-xs text-gray-400 dark:text-zinc-400 mt-1 italic">“{{ def.example }}”</p>
              </div>
            </div>

            <!-- Synonyms -->
            <div v-if="meaning.synonyms.length > 0" class="flex flex-wrap gap-1.5">
              <span class="text-[10px] text-gray-400 font-bold uppercase mr-1 self-center">近义词:</span>
              <span
                v-for="syn in meaning.synonyms.slice(0, 5)"
                :key="syn"
                class="text-xs px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full font-medium cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                @click="lookupWord(syn)"
              >
                {{ syn }}
              </span>
            </div>
          </div>
        </div>

        <!-- Previously searched word -->
        <div v-else class="text-center pt-10 text-gray-400 text-sm">
          未找到结果
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDictionary } from '../shared/use-dictionary';
import PronunciationBtn from './PronunciationBtn.vue';

const props = withDefaults(defineProps<{
  visible: boolean;
  word?: string;
}>(), {
  visible: false,
  word: '',
});

const emit = defineEmits<{
  close: [];
}>();

const { result, loading, error, lookup, clear } = useDictionary();
const searchWord = ref(props.word || '');
const lastSearched = ref(false);

const dictResult = result;

watch(() => props.word, (newWord) => {
  if (newWord) {
    searchWord.value = newWord;
    handleSearch();
  }
});

watch(() => props.visible, (val) => {
  if (val && props.word) {
    searchWord.value = props.word;
    handleSearch();
  } else if (!val) {
    clear();
    lastSearched.value = false;
  }
});

async function handleSearch() {
  const word = searchWord.value.trim();
  if (!word) return;
  lastSearched.value = true;
  await lookup(word);
}

function lookupWord(word: string) {
  searchWord.value = word;
  handleSearch();
}
</script>

<style scoped>
.panel-slide-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.panel-slide-leave-active { transition: all 0.2s ease-in; }
.panel-slide-enter-from { transform: translateX(100%); opacity: 0; }
.panel-slide-leave-to { transform: translateX(100%); opacity: 0; }
</style>
