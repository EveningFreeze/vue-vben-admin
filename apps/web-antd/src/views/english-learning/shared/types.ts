export interface GamificationState {
  xp: number;
  level: number;
  streakDays: number;
  lastCheckInDate: string;
  achievements: Achievement[];
  studyMinutesToday: number;
  totalStudyMinutes: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  xpReward: number;
}

export interface CheckInRecord {
  date: string;
  xpEarned: number;
  bonus: boolean;
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: { text: string; audio: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example: string }[];
    synonyms: string[];
    antonyms: string[];
  }[];
  sourceUrls: string[];
}

export interface QuizWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  stage: 'basic' | 'intermediate' | 'advanced' | 'core';
  mastered: boolean;
  reviewCount: number;
  lastReviewed: string | null;
}

export interface StudyTask {
  id: string;
  text: string;
  duration: string;
  done: boolean;
  category: 'vocab' | 'reading' | 'writing' | 'listening' | 'grammar';
  xpReward: number;
}

export interface StudyPhase {
  id: string;
  title: string;
  weekStart: number;
  weekEnd: number;
  status: 'completed' | 'in-progress' | 'upcoming';
  tasks: StudyTask[];
  color: string;
  desc: string;
}

export interface EssayCriterion {
  id: string;
  title: string;
  description: string;
  score: number;
  color: string;
  icon: string;
  comment?: string;
}

export interface EssaySubmission {
  content: string;
  wordCount: number;
  submittedAt: string;
  scores: EssayCriterion[];
  overallScore: number;
  suggestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface CourseVideo {
  id: string;
  title: string;
  bvid: string;
  category: string;
  duration: string;
  questions: { q: string; options: string[]; answer: string }[];
}
