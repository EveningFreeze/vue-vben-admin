<template>
  <div class="en-page-bg min-h-screen p-6">
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-0">
      <div class="en-blob-1" />
      <div class="en-blob-2" />
    </div>

    <div class="en-container">
      <!-- Hero: Daily Goal + Quote + CheckIn -->
      <div class="en-hero p-6 md:p-8">
        <div class="flex items-start justify-between mb-6">
          <div class="max-w-2xl">
            <div class="flex items-center gap-2 text-en-200 text-sm mb-2 font-medium">
              <span>🎯 今日目标 · {{ currentDate }}</span>
            </div>
            <blockquote class="text-lg md:text-xl font-bold leading-relaxed mb-2">
              "{{ dailyQuote.text }}"
            </blockquote>
            <cite class="text-sm text-white/60 not-italic">—— {{ dailyQuote.author }}</cite>
          </div>
          <DailyCheckIn />
        </div>
        <div class="max-w-xl">
          <XpBar />
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StudyStatsCard :value="masteredWords" label="已掌握词汇" icon="✅" color="en" />
        <StudyStatsCard :value="gamification.streakDays.value" label="连续打卡" icon="🔥" color="amber" />
        <StudyStatsCard
          :value="todayXp"
          label="今日 XP"
          icon="⭐"
          color="en-cyan"
          :trend="todayXp > 0 ? { direction: 'up', percent: Math.round((todayXp / 100) * 100) } : undefined"
        />
        <StudyStatsCard :value="gamification.level.value" label="当前等级" icon="🏅" color="en" />
      </div>

      <!-- Learning Journey -->
      <EnglishCard>
        <div class="flex items-center gap-2 mb-5">
          <span class="en-accent-bar" />
          <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100">学习旅程</h2>
        </div>
        <div class="overflow-x-auto pb-2 scrollbar-thin">
          <div class="flex items-center gap-0 min-w-max">
            <template v-for="(mod, idx) in journeyModules" :key="mod.id">
              <div
                v-if="idx > 0"
                :class="[
                  'w-10 h-0.5 rounded-full',
                  idx <= completedJourneySteps ? 'bg-en-400' : 'bg-gray-200 dark:bg-zinc-700',
                ]"
              />
              <div class="flex flex-col items-center gap-1.5 cursor-pointer group" @click="navigateTo(mod.path)">
                <div
                  :class="[
                    'w-14 h-14 rounded-xl flex items-center justify-center text-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1',
                    idx <= completedJourneySteps
                      ? 'bg-gradient-to-br from-en-500 to-en-cyan-500 text-white shadow-en-card'
                      : 'bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border-2 border-dashed border-gray-200 dark:border-zinc-700',
                  ]"
                >
                  {{ mod.icon }}
                </div>
                <span class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 whitespace-nowrap">{{ mod.title }}</span>
                <span
                  v-if="idx <= completedJourneySteps"
                  class="text-[9px] text-en-cyan-500 font-black whitespace-nowrap"
                >+{{ mod.xp }} XP</span>
              </div>
            </template>
          </div>
        </div>
      </EnglishCard>

      <!-- AI Learning Coach -->
      <EnglishGlassPanel>
        <div class="p-5">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-en-500 to-en-cyan-500 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
              🧠
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1">AI Learning Coach</h3>
              <p class="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{{ aiSuggestion }}</p>
            </div>
          </div>
          <div class="flex gap-2 mt-4 flex-wrap">
            <button
              v-for="action in quickActions"
              :key="action.label"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-en-400 hover:text-en-600 dark:hover:text-en-400 hover:shadow-sm"
              @click="navigateTo(action.path)"
            >
              {{ action.icon }} {{ action.label }}
            </button>
          </div>
        </div>
      </EnglishGlassPanel>

      <!-- Continue Learning + Achievements -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        <div class="lg:col-span-2">
          <EnglishCard>
            <div class="flex items-center gap-2 mb-4">
              <span class="en-accent-bar" />
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100">推荐继续学习</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="rec in continueLearning"
                :key="rec.label"
                class="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-en-50 to-en-cyan-50 dark:from-en-500/10 dark:to-en-cyan-500/10 border border-en-200/50 dark:border-en-500/20 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                @click="navigateTo(rec.path)"
              >
                <span class="text-2xl">{{ rec.icon }}</span>
                <div>
                  <div class="text-sm font-bold text-gray-800 dark:text-zinc-200">{{ rec.label }}</div>
                  <div class="text-xs text-gray-500 dark:text-zinc-400">{{ rec.desc }}</div>
                </div>
              </button>
            </div>
          </EnglishCard>

          <div class="mt-6">
            <EnglishCard>
              <div class="flex items-center gap-2 mb-4">
                <span class="en-accent-bar" />
                <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100">最近成就</h3>
              </div>
              <div class="space-y-3">
                <AchievementCard v-for="ach in recentAchievements" :key="ach.id" :achievement="ach" />
                <div v-if="recentAchievements.length === 0" class="text-center py-8 text-gray-400 text-sm">
                  还没有获得任何成就，开始学习吧！
                </div>
              </div>
            </EnglishCard>
          </div>
        </div>
        <div>
          <EnglishCard>
            <div class="flex items-center gap-2 mb-4">
              <span class="en-accent-bar" />
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100">打卡记录</h3>
            </div>
            <StreakCalendar />
          </EnglishCard>
          <div class="mt-6">
            <LeaderboardMini />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './shared/animations.css';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGamification } from './shared/use-gamification';
import {
  XpBar, DailyCheckIn, StudyStatsCard, AchievementCard, StreakCalendar,
  LeaderboardMini, EnglishCard, EnglishGlassPanel,
} from './components';

const router = useRouter();
const gamification = useGamification();

const todayXp = ref(0);
const masteredWords = ref(0);
const weeklyStudyMinutes = ref(0);

// ─── Daily Quotes ────────────────────────────────────────
interface Quote { text: string; author: string }

const dailyQuotes: Quote[] = [
  { text: 'The limits of my language are the limits of my world.', author: 'Ludwig Wittgenstein' },
  { text: 'To have another language is to possess a second soul.', author: 'Charlemagne' },
  { text: 'Language is the road map of a culture. It tells you where its people come from and where they are going.', author: 'Rita Mae Brown' },
  { text: 'A different language is a different vision of life.', author: 'Federico Fellini' },
  { text: 'Learning is a treasure that will follow its owner everywhere.', author: 'Chinese Proverb' },
  { text: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King' },
  { text: 'Language is not a genetic gift, it is a social gift.', author: 'Noam Chomsky' },
  { text: 'He who knows no foreign languages knows nothing of his own.', author: 'Johann Wolfgang von Goethe' },
  { text: 'Change your language and you change your thoughts.', author: 'Karl Albrecht' },
  { text: 'The soul that can speak multiple languages has more than one key to unlock the world.', author: 'Tshilidzi Marwala' },
  { text: 'Learning another language is not just learning different words for the same things, but learning another way to think about things.', author: 'Flora Lewis' },
  { text: 'Language is the blood of the soul into which thoughts run and out of which they grow.', author: 'Oliver Wendell Holmes' },
  { text: 'Speak a new language so that the world will be a new world.', author: 'Rumi' },
  { text: 'Do you know what a foreign accent is? It\'s a sign of bravery.', author: 'Amy Chua' },
  { text: 'If you talk to a man in a language he understands, that goes to his head. If you talk to him in his language, that goes to his heart.', author: 'Nelson Mandela' },
  { text: 'With languages, you are at home anywhere.', author: 'Edward De Waal' },
  { text: 'The conquest of learning is achieved through the knowledge of languages.', author: 'Roger Bacon' },
  { text: 'Language shapes the way we think, and determines what we can think about.', author: 'Benjamin Lee Whorf' },
  { text: 'One language sets you in a corridor for life. Two languages open every door along the way.', author: 'Frank Smith' },
  { text: 'We should learn languages because language is the only thing worth knowing even poorly.', author: 'Kató Lomb' },
  { text: 'A man who knows two languages is worth two men.', author: 'French Proverb' },
  { text: 'The greatest education is the knowledge of languages.', author: 'Isocrates' },
  { text: 'Learn everything you can, anytime you can, from anyone you can — there will always come a time when you will be grateful you did.', author: 'Sarah Caldwell' },
  { text: 'Knowledge of languages is the doorway to wisdom.', author: 'Roger Bacon' },
  { text: 'The most intimate temple of a people is its language.', author: 'Herder' },
  { text: 'Grammar is the art of using a language with correctness.', author: 'Dionysius Thrax' },
  { text: 'Reading is to the mind what exercise is to the body.', author: 'Joseph Addison' },
  { text: 'Words are the voice of the heart.', author: 'Confucius' },
  { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'The roots of education are bitter, but the fruit is sweet.', author: 'Aristotle' },
];

const currentDate = computed(() => {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
});

const dailyQuote = computed(() => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return dailyQuotes[dayOfYear % dailyQuotes.length];
});

// ─── Learning Journey ────────────────────────────────────
interface JourneyModule {
  id: string;
  icon: string;
  title: string;
  xp: number;
  path: string;
}

const journeyModules: JourneyModule[] = [
  { id: 'vocabulary', icon: '🔤', title: '词汇积累', xp: 50, path: '/english-learning/quiz' },
  { id: 'listening', icon: '👂', title: '听力训练', xp: 100, path: '/english-learning/listening' },
  { id: 'reading', icon: '📖', title: '在线学习', xp: 100, path: '/english-learning/study' },
  { id: 'writing', icon: '✍️', title: '作文批改', xp: 100, path: '/english-learning/essay' },
  { id: 'speaking', icon: '🗣️', title: 'AI 语伴', xp: 150, path: '/english-learning/ai-partner' },
  { id: 'exam', icon: '🧠', title: '高频考点', xp: 150, path: '/english-learning/exam-points' },
  { id: 'planning', icon: '📅', title: '备考规划', xp: 150, path: '/english-learning/planner' },
  { id: 'forum', icon: '💬', title: '英语论坛', xp: 200, path: '/english-learning/forum' },
];

const completedJourneySteps = computed(() => {
  const xp = gamification.xp.value;
  return Math.min(Math.floor(xp / 200), journeyModules.length - 1);
});

// ─── AI Coach ────────────────────────────────────────────
const aiSuggestion = computed(() => {
  if (!gamification.isCheckedInToday()) {
    return 'Start your learning journey today! Complete a check-in to earn XP and build your streak.';
  }
  if (gamification.streakDays.value >= 7) {
    return `Amazing! You've been studying for ${gamification.streakDays.value} consecutive days. Review this week's content to reinforce your memory.`;
  }
  if (gamification.streakDays.value >= 3) {
    return `Good momentum! You're on a ${gamification.streakDays.value}-day streak. Try a vocabulary quiz to test your progress.`;
  }
  return 'Begin with vocabulary practice to warm up, then move to listening or writing exercises. Consistent daily practice leads to mastery!';
});

const quickActions = [
  { icon: '✍️', label: '作文批改', path: '/english-learning/essay' },
  { icon: '🧠', label: 'AI 对话', path: '/english-learning/ai-partner' },
  { icon: '📚', label: '词汇测评', path: '/english-learning/quiz' },
];

// ─── Continue Learning ───────────────────────────────────
const continueLearning = [
  { icon: '👂', label: '继续听力', desc: '上次学到 Unit 3', path: '/english-learning/listening' },
  { icon: '✍️', label: '继续作文', desc: '还有 1 篇待批改', path: '/english-learning/essay' },
];

// ─── Lifecycle ───────────────────────────────────────────
const recentAchievements = computed(() => gamification.getRecentUnlocks());

function loadSavedState() {
  try {
    const saved = localStorage.getItem('en-char-pool');
    if (saved) {
      const pool = JSON.parse(saved);
      masteredWords.value = pool.filter((c: any) => c.mastered).length;
    }
    const savedXp = localStorage.getItem('en-xp-today');
    if (savedXp) todayXp.value = JSON.parse(savedXp);
    const savedMinutes = localStorage.getItem('en-minutes-today');
    if (savedMinutes) weeklyStudyMinutes.value = JSON.parse(savedMinutes);
  } catch { /* ignore */ }
}

function navigateTo(path: string) {
  router.push(path);
}

onMounted(() => {
  loadSavedState();
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
</style>
