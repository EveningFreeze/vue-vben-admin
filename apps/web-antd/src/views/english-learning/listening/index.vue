<template>
  <EnglishPageLayout>
    <EnglishHero icon="🎧" title="听力训练" subtitle="精听 · 泛听 · 磨耳朵 · 全面提升听力水平" backTo="/english-learning" decorativeEmoji="🎧" />

    <div class="space-y-6">
      <!-- Category Tabs -->
      <div class="flex flex-wrap gap-3">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="[
            'px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            activeCategory === cat.id
              ? 'bg-en-600 text-white shadow-en-glow'
              : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:border-en-300 hover:text-en-600',
          ]"
          @click="activeCategory = cat.id; currentIndex = 0; showTranscript = false; showAnswers = false"
        >
          <span class="inline-block animate-wobble-slow">{{ cat.icon }}</span> {{ cat.label }}
        </button>
      </div>

      <!-- Exercise List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnglishCard
          v-for="(ex, idx) in filteredExercises"
          :key="ex.id"
          :class="[`delay-${idx % 6}`, 'animate-fade-in-up opacity-0 p-5 transition-all cursor-pointer hover-lift-glow',
            currentIndex === idx && currentExercise?.id === ex.id
              ? 'border-en-400 ring-2 ring-en-400/30 shadow-lg'
              : 'border-gray-200 dark:border-zinc-700 hover:border-en-200 hover:shadow-md',
          ]"
          @click="selectExercise(idx)"
        >
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                currentIndex === idx && currentExercise?.id === ex.id && isPlaying
                  ? 'bg-en-600 text-white animate-pulse-glow'
                  : currentIndex === idx && currentExercise?.id === ex.id
                    ? 'bg-en-600 text-white'
                    : 'bg-en-50 dark:bg-orange-500/10 text-en-600',
              ]"
            >
              {{ currentIndex === idx && currentExercise?.id === ex.id && isPlaying ? '🔊' : '🎵' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-gray-800 dark:text-zinc-100">{{ ex.title }}</div>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold" :class="difficultyClass(ex.level)">
                  {{ ex.level === 'easy' ? '简单' : ex.level === 'medium' ? '中等' : '困难' }}
                </span>
                <span class="text-[10px] text-gray-400 font-mono">⏱ {{ ex.duration }}</span>
              </div>
            </div>
            <button
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
              :class="currentIndex === idx && currentExercise?.id === ex.id && isPlaying ? 'bg-en-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-gray-400 hover:bg-en-100 hover:text-en-600'"
              @click.stop="togglePlay(idx)"
            >
              {{ currentIndex === idx && currentExercise?.id === ex.id && isPlaying ? '⏸' : '▶' }}
            </button>
          </div>
        </EnglishCard>
      </div>

      <!-- Exercise Detail -->
      <EnglishCard v-if="currentExercise" class="p-6">
        <!-- Audio Progress -->
        <div class="flex items-center gap-4 mb-6">
          <button
            class="w-14 h-14 rounded-full bg-gradient-to-r from-en-600 to-en-cyan-500 text-white flex items-center justify-center text-xl shadow-lg hover:scale-105 active:scale-95 transition-all animate-gradient-shift"
            @click="togglePlay()"
          >
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <div class="flex-1">
            <div class="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-en-500 to-en-cyan-500 rounded-full transition-all duration-300" :style="{ width: audioProgress + '%' }" />
            </div>
            <div class="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
              <span>{{ currentTime }}</span>
              <span>{{ currentExercise.duration }}</span>
            </div>
          </div>
        </div>

        <!-- Transcript -->
        <div class="mb-6">
          <button
            class="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-zinc-400 mb-3 hover:text-en-600 transition-colors"
            @click="showTranscript = !showTranscript"
          >
            <span>{{ showTranscript ? '▼' : '▶' }} 查看原文</span>
          </button>
          <Transition name="fade">
            <div v-if="showTranscript" class="p-5 bg-slate-50 dark:bg-zinc-700/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
              {{ currentExercise.transcript }}
            </div>
          </Transition>
        </div>

        <!-- Questions -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <span class="en-accent-bar" />
            听力理解
          </h3>
          <div v-for="(q, qi) in currentExercise.questions" :key="qi" class="space-y-2">
            <p class="text-sm font-bold text-gray-700 dark:text-zinc-200">{{ qi + 1 }}. {{ q.q }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in q.options"
                :key="opt"
                :class="[
                  'px-4 py-2 text-sm border rounded-xl font-medium transition-all',
                  answers[qi] === opt && answers[qi] === q.answer
                    ? 'bg-en-50 border-en-500 text-en-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : answers[qi] === opt && answers[qi] !== q.answer
                      ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      : showAnswers && opt === q.answer
                        ? 'bg-en-50 border-en-500 text-en-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-en-300',
                ]"
                :disabled="showAnswers"
                @click="answers[qi] = opt"
              >
                {{ opt }}
              </button>
            </div>
          </div>
          <button
            v-if="!showAnswers"
            class="px-6 py-2.5 bg-en-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-en-700 transition-all"
            @click="submitAnswers"
          >
            提交答案
          </button>
          <div v-else class="text-sm font-bold animate-bounce-in" :class="score >= currentExercise.questions.length * 0.6 ? 'text-en-600' : 'text-zinc-400'">
            {{ score }}/{{ currentExercise.questions.length }} 正确
          </div>
        </div>
      </EnglishCard>
    </div>
  </EnglishPageLayout>
</template>

<script setup lang="ts">
import '../shared/animations.css';
import { ref, computed, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { useSpeech } from '../shared/use-speech';
import {
  EnglishPageLayout, EnglishHero, EnglishCard,
} from '../components';

const speech = useSpeech();

interface ListeningExercise {
  id: string; title: string; level: 'easy' | 'medium' | 'hard'; duration: string; category: string;
  transcript: string;
  questions: { q: string; options: string[]; answer: string }[];
}

const exercises = ref<ListeningExercise[]>([
  { id: 'l1', title: '机场出发广播', level: 'easy', duration: '01:30', category: 'daily',
    transcript: 'Attention, passengers. Flight CA1234 to Beijing is now boarding at Gate 23. Please have your boarding pass and passport ready. We wish you a pleasant journey.',
    questions: [
      { q: 'What is the flight number?', options: ['CA1234', 'CA4321', 'CB1234', 'CA1243'], answer: 'CA1234' },
      { q: 'Where should passengers go?', options: ['Gate 32', 'Gate 23', 'Gate 13', 'Gate 12'], answer: 'Gate 23' },
    ]},
  { id: 'l2', title: '课堂讨论：环保', level: 'medium', duration: '02:15', category: 'academic',
    transcript: 'Professor: Today we discuss environmental protection. The main causes of climate change include carbon emissions from industrial activities. What are possible solutions? Student: I think renewable energy is key.',
    questions: [
      { q: 'What is the topic?', options: ['Industrial Revolution', 'Environmental protection', 'Energy crisis', 'Population growth'], answer: 'Environmental protection' },
      { q: 'What solution does the student suggest?', options: ['Carbon tax', 'Renewable energy', 'Recycling', 'Tree planting'], answer: 'Renewable energy' },
    ]},
  { id: 'l3', title: '租房电话对话', level: 'medium', duration: '02:00', category: 'daily',
    transcript: 'A: Hello, I am calling about the apartment for rent. B: Yes, it is a two-bedroom apartment on the third floor. The rent is $1200 per month, including water and gas. Electricity is not included.',
    questions: [
      { q: 'How many bedrooms?', options: ['One', 'Two', 'Three', 'Studio'], answer: 'Two' },
      { q: 'What is included in the rent?', options: ['All utilities', 'Water and gas', 'Electricity only', 'Nothing'], answer: 'Water and gas' },
    ]},
  { id: 'l4', title: '新闻报道：科技', level: 'hard', duration: '02:45', category: 'academic',
    transcript: 'This is BBC News. Scientists have developed a new AI model that can predict protein structures with unprecedented accuracy. This breakthrough could accelerate drug discovery and disease treatment significantly.',
    questions: [
      { q: 'What did scientists develop?', options: ['New drug', 'AI model', 'Protein', 'Vaccine'], answer: 'AI model' },
      { q: 'What is the potential impact?', options: ['Faster drug discovery', 'Cheaper computers', 'Better phones', 'Cleaner energy'], answer: 'Faster drug discovery' },
    ]},
  { id: 'l5', title: '酒店入住办理', level: 'easy', duration: '01:45', category: 'daily',
    transcript: 'Good evening sir. Welcome to Grand Hotel. I have your reservation here. A deluxe room for three nights. Your room number is 1208. Here is your key card. Breakfast is served from 7 to 10 AM.',
    questions: [
      { q: 'What type of room?', options: ['Standard', 'Deluxe', 'Suite', 'Economy'], answer: 'Deluxe' },
      { q: 'What is the room number?', options: ['1280', '1208', '1028', '1820'], answer: '1208' },
    ]},
  { id: 'l6', title: '学术讲座：经济学', level: 'hard', duration: '03:00', category: 'academic',
    transcript: 'Today we examine the law of supply and demand. When demand exceeds supply, prices tend to rise. Conversely, when supply exceeds demand, prices fall. This fundamental principle drives market economies.',
    questions: [
      { q: 'What happens when demand exceeds supply?', options: ['Prices fall', 'Prices rise', 'Market crashes', 'Production stops'], answer: 'Prices rise' },
      { q: 'What is this principle called?', options: ['Market equilibrium', 'Supply and demand', 'Price control', 'Economic growth'], answer: 'Supply and demand' },
    ]},
]);

const categories = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: 'daily', label: '日常对话', icon: '💬' },
  { id: 'academic', label: '学术听力', icon: '📚' },
];

const activeCategory = ref('all');
const currentIndex = ref(0);
const isPlaying = ref(false);
const audioProgress = ref(0);
const showTranscript = ref(false);
const showAnswers = ref(false);
const answers = ref<Record<number, string>>({});
const score = ref(0);

const filteredExercises = computed(() =>
  activeCategory.value === 'all' ? exercises.value : exercises.value.filter(e => e.category === activeCategory.value)
);

const currentExercise = computed(() => filteredExercises.value[currentIndex.value] || null);

function selectExercise(idx: number) {
  speech.stop();
  currentIndex.value = idx;
  showTranscript.value = false;
  showAnswers.value = false;
  answers.value = {};
  score.value = 0;
  isPlaying.value = false;
  audioProgress.value = 0;
}

function togglePlay(idx?: number) {
  if (idx !== undefined && idx !== currentIndex.value) {
    selectExercise(idx);
  }

  if (speech.isSpeaking.value) {
    speech.stop();
    isPlaying.value = false;
    return;
  }

  const exercise = currentExercise.value;
  if (!exercise) return;

  if (!speech.supported) {
    message.warning('当前浏览器不支持语音合成，请使用 Chrome 或 Edge');
    return;
  }

  isPlaying.value = true;
  audioProgress.value = 0;

  const rate = exercise.level === 'easy' ? 0.75 : exercise.level === 'medium' ? 0.9 : 1.0;
  speech.speak(exercise.transcript, rate);

  // Poll isSpeaking to sync progress bar and playing state
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!speech.isSpeaking.value) {
      if (progressTimer) clearInterval(progressTimer);
      isPlaying.value = false;
      audioProgress.value = 100;
    } else {
      audioProgress.value = Math.min(95, audioProgress.value + 1.5);
    }
  }, 200);
}

let progressTimer: ReturnType<typeof setInterval> | null = null;
const SPEECH_DURATION_SEC = 30;

const currentTime = computed(() => {
  const totalSec = Math.floor((audioProgress.value / 100) * SPEECH_DURATION_SEC);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const totalCompleted = 12;
const accuracy = 78;
const level = 3;

function difficultyClass(exLevel: string): string {
  const map: Record<string, string> = {
    easy: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    medium: 'bg-zinc-700 text-zinc-300 dark:bg-blue-500/10 dark:text-zinc-500',
    hard: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  };
  return (map[exLevel] || map.easy) as string;
}

onUnmounted(() => {
  speech.stop();
  if (progressTimer) clearInterval(progressTimer);
});

function submitAnswers() {
  if (!currentExercise.value) return;
  score.value = 0;
  currentExercise.value.questions.forEach((q, i) => {
    if (answers.value[i] === q.answer) score.value++;
  });
  showAnswers.value = true;
  const total = currentExercise.value.questions.length;
  if (score.value === total) message.success(`🎉 全对！(${score.value}/${total})`);
  else if (score.value >= total * 0.6) message.info(`还不错！(${score.value}/${total})`);
  else message.warning(`继续加油！(${score.value}/${total})`);
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
