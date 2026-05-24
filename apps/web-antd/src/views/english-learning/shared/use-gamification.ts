import { ref, computed } from 'vue';
import type { Achievement } from './types';

const ACHIEVEMENT_CATALOG: Achievement[] = [
  { id: 'first-checkin', title: '初次打卡', description: '首次完成每日打卡', icon: '🌅', unlockedAt: null, progress: 0, xpReward: 20 },
  { id: 'streak-7', title: '七日之约', description: '连续打卡 7 天', icon: '🔥', unlockedAt: null, progress: 0, xpReward: 100 },
  { id: 'streak-30', title: '月满勤', description: '连续打卡 30 天', icon: '💎', unlockedAt: null, progress: 0, xpReward: 500 },
  { id: 'vocab-100', title: '百词斩', description: '累计掌握 100 个单词', icon: '📚', unlockedAt: null, progress: 0, xpReward: 150 },
  { id: 'quiz-master', title: '测验达人', description: '任意测验获得满分', icon: '🏆', unlockedAt: null, progress: 0, xpReward: 200 },
  { id: 'essay-first', title: '初试锋芒', description: '完成第一篇作文批改', icon: '✍️', unlockedAt: null, progress: 0, xpReward: 50 },
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

const XP_KEY = 'en-xp';
const STREAK_KEY = 'en-streak';
const CHECKIN_KEY = 'en-last-checkin';
const CHECKIN_HISTORY_KEY = 'en-checkin-history';
const ACHIEVEMENTS_KEY = 'en-achievements';
const MINUTES_TODAY_KEY = 'en-minutes-today';
const TOTAL_MINUTES_KEY = 'en-total-minutes';

export function useGamification() {
  const xp = ref(loadFromStorage<number>(XP_KEY, 0));
  const streakDays = ref(loadFromStorage<number>(STREAK_KEY, 0));
  const lastCheckInDate = ref(loadFromStorage<string>(CHECKIN_KEY, ''));
  const checkInHistory = ref(loadFromStorage<string[]>(CHECKIN_HISTORY_KEY, []));
  const achievements = ref(loadFromStorage<Achievement[]>(ACHIEVEMENTS_KEY, ACHIEVEMENT_CATALOG));
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
    checkLevelUpAchievements();
    persist();
  }

  function dailyCheckIn(): { earned: number; bonus: boolean } {
    const today = (new Date().toISOString().split('T')[0] ?? '');
    if (lastCheckInDate.value === today) return { earned: 0, bonus: false };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
    if (lastCheckInDate.value === yesterday) {
      streakDays.value += 1;
    } else {
      streakDays.value = 1;
    }
    lastCheckInDate.value = today ?? '';
    checkInHistory.value = [...checkInHistory.value.filter(d => d !== today), today ?? ''];

    const bonusAmount = Math.min(streakDays.value * 5, 50);
    const earned = 10 + bonusAmount;
    addXp(earned);

    // Check streak achievements
    if (streakDays.value >= 7) unlockAchievement('streak-7');
    if (streakDays.value >= 30) unlockAchievement('streak-30');

    persist();
    return { earned, bonus: bonusAmount > 0 };
  }

  function isCheckedInToday(): boolean {
    const today = (new Date().toISOString().split('T')[0] ?? '');
    return lastCheckInDate.value === today;
  }

  function unlockAchievement(id: string): boolean {
    const achievement = achievements.value.find(a => a.id === id);
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = new Date().toISOString();
      achievement.progress = 100;
      addXp(achievement.xpReward);
      if (id === 'first-checkin') {
        // first check-in already handled via dailyCheckIn
      }
      persist();
      return true;
    }
    return false;
  }

  function checkLevelUpAchievements() {
    // Level up achievement check - could add level milestones
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

  function getRecentUnlocks(): Achievement[] {
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
