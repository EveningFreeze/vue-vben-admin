<template>
  <div class="chinese-page-bg min-h-screen p-6">
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-0">
      <div class="chinese-blob-1" />
      <div class="chinese-blob-2" />
    </div>

    <div class="chinese-container">
      <!-- Hero: Daily Quote + XP + CheckIn -->
      <div class="chinese-hero p-6 md:p-8">
        <div class="flex items-start justify-between mb-6">
          <div class="max-w-2xl">
            <div class="flex items-center gap-2 text-chinese-200 text-sm mb-2 font-medium">
              <span>📖 今日语录 · {{ currentDate }}</span>
            </div>
            <blockquote class="text-xl md:text-2xl font-bold leading-relaxed mb-2">
              「{{ dailyQuote.text }}」
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
        <StudyStatsCard :value="masteredChars" label="研读古文" icon="📖" color="chinese" />
        <StudyStatsCard :value="gamification.streakDays.value" label="连续打卡" icon="🔥" color="amber" />
        <StudyStatsCard
          :value="todayXp"
          label="今日 XP"
          icon="⭐"
          color="orange"
          :trend="todayXp > 0 ? { direction: 'up', percent: Math.round((todayXp / 100) * 100) } : undefined"
        />
        <StudyStatsCard :value="gamification.level.value" label="当前等级" icon="🏅" color="purple" />
      </div>

      <!-- RPG Growth Roadmap -->
      <ChineseCard>
        <RpgRoadmap />
      </ChineseCard>

      <!-- AI Companion -->
      <ChineseGlassPanel>
        <div class="p-5">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-chinese-600 to-chinese-gold-500 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
              🤖
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1">AI 学伴</h3>
              <p class="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{{ aiSuggestion }}</p>
            </div>
          </div>
          <div class="flex gap-2 mt-4 flex-wrap">
            <button
              v-for="action in quickActions"
              :key="action.label"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-chinese-400 hover:text-chinese-600 dark:hover:text-chinese-400 hover:shadow-sm"
              @click="navigateTo(action.path)"
            >
              {{ action.icon }} {{ action.label }}
            </button>
          </div>
        </div>
      </ChineseGlassPanel>

      <!-- Achievements & Calendar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        <div class="lg:col-span-2">
          <ChineseCard>
            <div class="flex items-center gap-2 mb-4">
              <span class="chinese-accent-bar" />
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100">最近成就</h3>
            </div>
            <div class="space-y-3">
              <AchievementCard v-for="ach in recentAchievements" :key="ach.id" :achievement="ach" />
              <div v-if="recentAchievements.length === 0" class="text-center py-8 text-gray-400 text-sm">
                还没有获得任何成就，开始学习吧！
              </div>
            </div>
          </ChineseCard>
        </div>
        <StreakCalendar />
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
  XpBar, StudyStatsCard, AchievementCard, DailyCheckIn, StreakCalendar,
  ChineseCard, ChineseGlassPanel, RpgRoadmap,
} from './components';

const router = useRouter();
const gamification = useGamification();

const todayXp = ref(0);
const masteredChars = ref(0);

// ─── Daily Quotes ────────────────────────────────────────
interface Quote { text: string; author: string }

const dailyQuotes: Quote[] = [
  { text: '学而时习之，不亦说乎', author: '《论语·学而》' },
  { text: '学而不思则罔，思而不学则殆', author: '《论语·为政》' },
  { text: '温故而知新，可以为师矣', author: '《论语·为政》' },
  { text: '三人行，必有我师焉', author: '《论语·述而》' },
  { text: '知之者不如好之者，好之者不如乐之者', author: '《论语·雍也》' },
  { text: '博学之，审问之，慎思之，明辨之，笃行之', author: '《中庸》' },
  { text: '玉不琢，不成器；人不学，不知道', author: '《礼记·学记》' },
  { text: '青，取之于蓝，而青于蓝', author: '《荀子·劝学》' },
  { text: '不积跬步，无以至千里', author: '《荀子·劝学》' },
  { text: '学不可以已', author: '《荀子·劝学》' },
  { text: '吾生也有涯，而知也无涯', author: '《庄子·养生主》' },
  { text: '书山有路勤为径，学海无涯苦作舟', author: '韩愈' },
  { text: '业精于勤，荒于嬉；行成于思，毁于随', author: '韩愈《进学解》' },
  { text: '读书破万卷，下笔如有神', author: '杜甫《奉赠韦左丞丈二十二韵》' },
  { text: '纸上得来终觉浅，绝知此事要躬行', author: '陆游《冬夜读书示子聿》' },
  { text: '问渠那得清如许，为有源头活水来', author: '朱熹《观书有感》' },
  { text: '路漫漫其修远兮，吾将上下而求索', author: '屈原《离骚》' },
  { text: '工欲善其事，必先利其器', author: '《论语·卫灵公》' },
  { text: '知之为知之，不知为不知，是知也', author: '《论语·为政》' },
  { text: '见贤思齐焉，见不贤而内自省也', author: '《论语·里仁》' },
  { text: '天行健，君子以自强不息', author: '《周易·乾卦》' },
  { text: '富贵不能淫，贫贱不能移，威武不能屈', author: '《孟子·滕文公下》' },
  { text: '尽信书，则不如无书', author: '《孟子·尽心下》' },
  { text: '千里之行，始于足下', author: '《老子》' },
  { text: '博观而约取，厚积而薄发', author: '苏轼《稼说送张琥》' },
  { text: '古人学问无遗力，少壮工夫老始成', author: '陆游《冬夜读书示子聿》' },
  { text: '旧书不厌百回读，熟读深思子自知', author: '苏轼《送安惇秀才失解西归》' },
  { text: '学贵得师，亦贵得友', author: '唐甄《潜书·讲学》' },
  { text: '为学患无疑，疑则有进', author: '陆九渊《语录》' },
  { text: '学而不知道，与不学同；知而不能行，与不知同', author: '黄晞《聱隅子》' },
];

const currentDate = computed(() => {
  const d = new Date();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
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
  { id: 'practice', icon: '🎯', title: '语言基础', xp: 50, path: '/chinese-learning/practice' },
  { id: 'poetry', icon: '📜', title: '诗词鉴赏', xp: 100, path: '/chinese-learning/poetry' },
  { id: 'literacy', icon: '🎮', title: '古文阅读', xp: 100, path: '/chinese-learning/literacy' },
  { id: 'reading', icon: '🎤', title: '名篇赏读', xp: 100, path: '/chinese-learning/reading' },
  { id: 'challenge', icon: '🏯', title: '人文闯关', xp: 150, path: '/chinese-learning/challenge' },
  { id: 'writing', icon: '✍️', title: '学术写作', xp: 150, path: '/chinese-learning/writing' },
  { id: 'classics', icon: '🏛️', title: '经典研读', xp: 150, path: '/chinese-learning/classics' },
  { id: 'aitutor', icon: '🤖', title: 'AI 导师', xp: 200, path: '/chinese-learning/ai-tutor' },
];

const completedJourneySteps = computed(() => {
  const xp = gamification.xp.value;
  return Math.min(Math.floor(xp / 200), journeyModules.length - 1);
});

// ─── AI Companion ────────────────────────────────────────
const aiSuggestion = computed(() => {
  if (!gamification.isCheckedInToday()) {
    return '今天还没有打卡签到，开始今日的学习之旅吧！完成签到可获得 XP 奖励。';
  }
  if (gamification.streakDays.value >= 7) {
    return `你已经连续学习 ${gamification.streakDays.value} 天，坚持就是胜利！建议复习本周学习内容，巩固记忆。`;
  }
  if (gamification.streakDays.value >= 3) {
    return `连续打卡 ${gamification.streakDays.value} 天，保持良好节奏！建议尝试人文闯关，检验学习成果。`;
  }
  return '根据你的学习进度，建议从语言基础开始今天的练习，逐步提升。坚持每日打卡，积累 XP！';
});

const quickActions = [
  { icon: '✍️', label: '学术写作', path: '/chinese-learning/writing' },
  { icon: '🤖', label: 'AI 对话', path: '/chinese-learning/ai-tutor' },
  { icon: '🏯', label: '人文闯关', path: '/chinese-learning/challenge' },
];

// ─── Lifecycle ───────────────────────────────────────────
const recentAchievements = computed(() => gamification.getRecentUnlocks());

function loadSavedState() {
  try {
    const saved = localStorage.getItem('zh-uni-char-pool');
    if (saved) {
      const pool = JSON.parse(saved);
      masteredChars.value = pool.filter((c: any) => c.mastered).length;
    }
    const savedXp = localStorage.getItem('zh-uni-xp-today');
    if (savedXp) todayXp.value = JSON.parse(savedXp);
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
