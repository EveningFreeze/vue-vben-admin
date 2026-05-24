export interface ChineseAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  xpReward: number;
}

export interface ChineseGamificationState {
  xp: number;
  level: number;
  streakDays: number;
  lastCheckInDate: string;
  achievements: ChineseAchievement[];
  studyMinutesToday: number;
  totalStudyMinutes: number;
}

export interface Poetry {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  translation: string;
  annotations: string[];
  difficulty: 1 | 2 | 3;
  stage: 'foundation' | 'intermediate' | 'advanced';
  mastered: boolean;
}

export interface ChallengeLevel {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg?: string;
  category: 'poem' | 'idiom' | 'proverb' | 'culture' | 'rhetoric';
  questions: ChallengeQuestion[];
  xpReward: number;
  completed: boolean;
}

export interface ChallengeQuestion {
  q: string;
  options: string[];
  answer: string;
  hint?: string;
}

export interface WritingSubmission {
  content: string;
  characterCount: number;
  submittedAt: string;
  scores: WritingCriterion[];
  overallScore: number;
  suggestions: string[];
}

export interface WritingCriterion {
  id: string;
  title: string;
  description: string;
  score: number;
  icon: string;
  comment?: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  author: string;
  content: string;
  difficulty: 1 | 2 | 3;
  stage: 'foundation' | 'intermediate' | 'advanced';
  duration: string;
  score?: number;
}

export interface AcademicReading {
  id: string;
  title: string;
  author: string;
  category: 'literature' | 'language' | 'culture' | 'theory';
  content: string;
  annotations: string[];
  discussionQuestions: string[];
  references: string[];
  stage: 'foundation' | 'intermediate' | 'advanced';
}

export interface ClassicalText {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  source: string;
  original: string;
  translation: string;
  grammarNotes: { pattern: string; explanation: string; example: string }[];
  stage: 'foundation' | 'intermediate' | 'advanced';
  mastered: boolean;
}

export interface ClassicWork {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  description: string;
  icon: string;
  content: { chapter: string; text: string; translation: string }[];
}

export interface PracticeExercise {
  id: string;
  type: 'phonology' | 'paleography' | 'exegesis' | 'grammar' | 'rhetoric';
  question: string;
  options: string[];
  answer: string;
  difficulty: 1 | 2 | 3;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}
