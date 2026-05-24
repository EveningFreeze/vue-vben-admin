import { ref, computed } from 'vue';
import type { ChineseAchievement } from './types';

const ACHIEVEMENT_CATALOG: ChineseAchievement[] = [
  { id: 'first-checkin', title: '初次打卡', description: '首次完成每日打卡', icon: '🌅', unlockedAt: null, progress: 0, xpReward: 20 },
  { id: 'streak-7', title: '七日之约', description: '连续打卡 7 天', icon: '🔥', unlockedAt: null, progress: 0, xpReward: 100 },
  { id: 'streak-30', title: '月满勤', description: '连续打卡 30 天', icon: '💎', unlockedAt: null, progress: 0, xpReward: 500 },
  { id: 'poem-10', title: '诗词鉴赏家', description: '累计精读 10 首诗词', icon: '📜', unlockedAt: null, progress: 0, xpReward: 50 },
  { id: 'poem-50', title: '诗词评论家', description: '累计精读 50 首诗词', icon: '🏅', unlockedAt: null, progress: 0, xpReward: 200 },
  { id: 'poem-100', title: '诗词学者', description: '累计精读 100 首诗词', icon: '👑', unlockedAt: null, progress: 0, xpReward: 500 },
  { id: 'char-100', title: '古文研习者', description: '累计研读 100 篇古文', icon: '📖', unlockedAt: null, progress: 0, xpReward: 100 },
  { id: 'char-500', title: '古文大家', description: '累计研读 500 篇古文', icon: '📚', unlockedAt: null, progress: 0, xpReward: 300 },
  { id: 'challenge-master', title: '闯关达人', description: '完成所有人文闯关', icon: '🏆', unlockedAt: null, progress: 0, xpReward: 300 },
  { id: 'essay-first', title: '学术新秀', description: '完成第一篇学术写作评估', icon: '✍️', unlockedAt: null, progress: 0, xpReward: 50 },
  { id: 'reading-star', title: '精读之星', description: '在名篇赏读中获得 90 分以上', icon: '⭐', unlockedAt: null, progress: 0, xpReward: 150 },
  { id: 'study-10h', title: '学海无涯', description: '累计学习 10 小时', icon: '⏰', unlockedAt: null, progress: 0, xpReward: 300 },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded - ignore */ }
}

const PREFIX = 'zh-uni-';
const XP_KEY = `${PREFIX}xp`;
const STREAK_KEY = `${PREFIX}streak`;
const CHECKIN_KEY = `${PREFIX}last-checkin`;
const CHECKIN_HISTORY_KEY = `${PREFIX}checkin-history`;
const ACHIEVEMENTS_KEY = `${PREFIX}achievements`;
const MINUTES_TODAY_KEY = `${PREFIX}minutes-today`;
const TOTAL_MINUTES_KEY = `${PREFIX}total-minutes`;

// Migrate old zh- keys to zh-uni- keys
function migrateFromOldKeys() {
  const oldPrefix = 'zh-';
  const oldKeys = [
    'xp', 'streak', 'last-checkin', 'checkin-history',
    'achievements', 'minutes-today', 'total-minutes',
  ];
  for (const key of oldKeys) {
    const oldKey = `${oldPrefix}${key}`;
    const newKey = `${PREFIX}${key}`;
    try {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldVal);
      }
    } catch { /* ignore */ }
  }
}

export function useGamification() {
  migrateFromOldKeys();

  const xp = ref(loadFromStorage<number>(XP_KEY, 0));
  const streakDays = ref(loadFromStorage<number>(STREAK_KEY, 0));
  const lastCheckInDate = ref(loadFromStorage<string>(CHECKIN_KEY, ''));
  const checkInHistory = ref(loadFromStorage<string[]>(CHECKIN_HISTORY_KEY, []));
  const achievements = ref(loadFromStorage<ChineseAchievement[]>(ACHIEVEMENTS_KEY, ACHIEVEMENT_CATALOG));
  const studyMinutesToday = ref(loadFromStorage<number>(MINUTES_TODAY_KEY, 0));
  const totalStudyMinutes = ref(loadFromStorage<number>(TOTAL_MINUTES_KEY, 0));

  function persist() {
    saveToStorage(XP_KEY, xp.value);
    saveToStorage(STREAK_KEY, streakDays.value);
    saveToStorage(CHECKIN_KEY, lastCheckInDate.value);
    saveToStorage(CHECKIN_HISTORY_KEY, checkInHistory.value);
    saveToStorage(ACHIEVEMENTS_KEY, achievements.value);
    saveToStorage(MINUTES_TODAY_KEY, studyMinutesToday.value);
    saveToStorage(TOTAL_MINUTES_KEY, totalStudyMinutes.value);
  }

  const level = computed(() => {
    if (xp.value < 100) return 1;
    return Math.floor(Math.sqrt(xp.value / 100)) + 1;
  });

  const nextLevelXp = computed(() => 100 * (level.value + 1) ** 2);
  const currentLevelXp = computed(() => 100 * level.value ** 2);

  const levelProgress = computed(() => {
    const total = nextLevelXp.value - currentLevelXp.value;
    if (total <= 0) return 100;
    return Math.min(100, ((xp.value - currentLevelXp.value) / total) * 100);
  });

  function addXp(amount: number) {
    xp.value += amount;
    persist();
  }

  function dailyCheckIn(): { earned: number; bonus: boolean } {
    const today = new Date().toISOString().split('T')[0] ?? '';
    if (lastCheckInDate.value === today) return { earned: 0, bonus: false };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
    if (lastCheckInDate.value === yesterday) {
      streakDays.value += 1;
    } else {
      streakDays.value = 1;
    }
    lastCheckInDate.value = today;
    checkInHistory.value = [...checkInHistory.value.filter((d): d is string => d !== today), today];

    const bonusAmount = Math.min(streakDays.value * 5, 50);
    const earned = 10 + bonusAmount;
    addXp(earned);

    if (streakDays.value >= 7) unlockAchievement('streak-7');
    if (streakDays.value >= 30) unlockAchievement('streak-30');

    persist();
    return { earned, bonus: bonusAmount > 0 };
  }

  function isCheckedInToday(): boolean {
    const today = new Date().toISOString().split('T')[0] ?? '';
    return lastCheckInDate.value === today;
  }

  function unlockAchievement(id: string): boolean {
    const achievement = achievements.value.find(a => a.id === id);
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = new Date().toISOString();
      achievement.progress = 100;
      addXp(achievement.xpReward);
      persist();
      return true;
    }
    return false;
  }

  function trackStudyMinutes(minutes: number) {
    if (minutes <= 0) return;
    studyMinutesToday.value += minutes;
    totalStudyMinutes.value += minutes;
    const xpFromTime = Math.floor(minutes / 30) * 10;
    if (xpFromTime > 0) addXp(xpFromTime);
    if (totalStudyMinutes.value >= 600) unlockAchievement('study-10h');
    persist();
  }

  function getRecentUnlocks(): ChineseAchievement[] {
    return achievements.value
      .filter(a => a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 3);
  }

  return {
    xp, level, streakDays, lastCheckInDate, checkInHistory,
    achievements, studyMinutesToday, totalStudyMinutes,
    nextLevelXp, currentLevelXp, levelProgress,
    addXp, dailyCheckIn, isCheckedInToday, unlockAchievement,
    trackStudyMinutes, getRecentUnlocks, persist,
  };
}
