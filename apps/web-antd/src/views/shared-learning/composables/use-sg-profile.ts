import { ref, computed } from 'vue';
import type { Achievement } from '../../english-learning/shared/types';
import type { ChineseAchievement } from '../../chinese-learning/shared/types';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

/** Unified Suguard profile composable: aggregates data from en + zh modules */
export function useSgProfile() {
  // ── Raw module data ──
  const enXp = ref(load<number>('en-xp', 0));
  const enStreak = ref(load<number>('en-streak', 0));
  const enMinutes = ref(load<number>('en-minutes-today', 0));
  const enTotalMinutes = ref(load<number>('en-total-minutes', 0));
  const enAchievements = ref(load<Achievement[]>('en-achievements', []));

  const zhXp = ref(load<number>('zh-uni-xp', 0));
  const zhStreak = ref(load<number>('zh-uni-streak', 0));
  const zhMinutes = ref(load<number>('zh-uni-minutes-today', 0));
  const zhTotalMinutes = ref(load<number>('zh-uni-total-minutes', 0));
  const zhAchievements = ref(load<ChineseAchievement[]>('zh-uni-achievements', []));

  // ── Computed: aggregated metrics ──
  const totalXp = computed(() => enXp.value + zhXp.value);
  const maxStreak = computed(() => Math.max(enStreak.value, zhStreak.value));
  const studyMinutesToday = computed(() => enMinutes.value + zhMinutes.value);
  const totalStudyMinutes = computed(() => enTotalMinutes.value + zhTotalMinutes.value);
  const totalStudyHours = computed(() => Math.round(totalStudyMinutes.value / 60));

  const platformLevel = computed(() => {
    if (totalXp.value < 100) return 1;
    return Math.floor(Math.sqrt(totalXp.value / 100)) + 1;
  });

  const nextLevelXp = computed(() => 100 * (platformLevel.value + 1) ** 2);
  const currentLevelXp = computed(() => 100 * platformLevel.value ** 2);

  const levelProgress = computed(() => {
    const total = nextLevelXp.value - currentLevelXp.value;
    if (total <= 0) return 100;
    return Math.min(100, ((totalXp.value - currentLevelXp.value) / total) * 100);
  });

  // ── Achievement count ──
  const totalAchievements = computed(() => {
    const enUnlocked = enAchievements.value.filter(a => a.unlockedAt).length;
    const zhUnlocked = zhAchievements.value.filter(a => a.unlockedAt).length;
    return enUnlocked + zhUnlocked;
  });

  // ── Recent activity items (cross-module) ──
  const recentActivity = computed(() => {
    const items: { module: 'en' | 'zh'; label: string; time: string; icon: string }[] = [];
    if (enXp.value > 0) items.push({ module: 'en', label: '英语学习', time: '进行中', icon: '📝' });
    if (zhXp.value > 0) items.push({ module: 'zh', label: '文学学习', time: '进行中', icon: '📜' });
    if (enStreak.value >= 1) items.push({ module: 'en', label: `英语打卡 ${enStreak.value} 天`, time: '活跃', icon: '🔥' });
    if (zhStreak.value >= 1) items.push({ module: 'zh', label: `文学打卡 ${zhStreak.value} 天`, time: '活跃', icon: '🔥' });
    if (enTotalMinutes.value > 0) items.push({ module: 'en', label: `英语学习 ${Math.round(enTotalMinutes.value / 60)}h`, time: '累计', icon: '⏱' });
    if (zhTotalMinutes.value > 0) items.push({ module: 'zh', label: `文学学习 ${Math.round(zhTotalMinutes.value / 60)}h`, time: '累计', icon: '⏱' });
    if (totalAchievements.value > 0) items.push({ module: 'en', label: `获得 ${totalAchievements.value} 个成就`, time: '里程碑', icon: '🏆' });
    return items;
  });

  // ── Module breakdown ──
  const moduleStats = computed(() => [
    {
      name: '智慧英语', xp: enXp.value, streak: enStreak.value,
      color: 'from-en-500 to-en-cyan-500', bg: 'bg-en-50 dark:bg-en-500/10',
      textColor: 'text-en-600 dark:text-en-400',
    },
    {
      name: '文学素养', xp: zhXp.value, streak: zhStreak.value,
      color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-50 dark:bg-violet-500/10',
      textColor: 'text-violet-600 dark:text-violet-400',
    },
  ]);

  return {
    // Aggregated
    totalXp, maxStreak, studyMinutesToday, totalStudyMinutes, totalStudyHours,
    platformLevel, nextLevelXp, currentLevelXp, levelProgress,
    totalAchievements, recentActivity, moduleStats,
    // Raw
    enXp, enStreak, zhXp, zhStreak,
  };
}
