<script lang="ts" setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAIService } from '#/views/shared-learning/composables/use-ai-service';
import { useGamification } from '../shared/use-gamification';

const router = useRouter();
const ai = useAIService();
const { addXp } = useGamification();

// ─── Modes ──────────────────────────────────
type TutorMode = 'tutor' | 'ancient';
const activeMode = ref<TutorMode>('tutor');

// ─── Tutor Mode ─────────────────────────────
interface ChatMessage { role: 'user' | 'ai'; content: string }
const messages = ref<ChatMessage[]>([]);
const inputText = ref('');
const isThinking = ref(false);
const questionCount = ref(0);

const topics = [
  { id: 'literature', icon: '📖', label: '文学导读', systemPrompt: '你是文学导读专家，帮助学生理解文学文本、文学史脉络和文学批评方法。', greeting: '你好！我是你的文学导读助手。无论是古典诗词还是现代文学，我都可以帮助你深入理解。今天想探讨哪部文学作品呢？' },
  { id: 'classics', icon: '🏛️', label: '经典研读', systemPrompt: '你是经典研读专家，擅长分析中国古代经典文本的艺术手法、思想内涵和历史定位。', greeting: '你好！经典研读需要耐心和专注。《论语》《道德经》《庄子》《史记》……你对哪部经典最感兴趣？' },
  { id: 'writing', icon: '✍️', label: '学术写作指导', systemPrompt: '你是学术写作指导专家，帮助学生在论文选题、论证方法、引用规范等方面提升。', greeting: '你好！写学术论文遇到困难了吗？无论是选题、结构还是引用格式，我都可以提供建议。' },
  { id: 'reading', icon: '🔍', label: '学术阅读', systemPrompt: '你是学术阅读专家，教授批判性阅读、论证分析和学术术语理解。', greeting: '你好！学术阅读需要特定的方法论。批判性阅读、论证分析、术语理解——你想从哪个方面开始？' },
  { id: 'sinology', icon: '📜', label: '国学深造', systemPrompt: '你是国学深造专家，精通四书五经、诸子百家、训诂考证和版本目录学。', greeting: '你好！国学深造是一条精深之路。从四书五经到文字音韵训诂之学，你希望深入哪个领域？' },
];

const activeTopic = ref('literature');
const currentTopic = computed(() => topics.find(t => t.id === activeTopic.value)!);

function addMessage(role: 'user' | 'ai', content: string) {
  messages.value.push({ role, content });
}

async function sendMessage() {
  const text = inputText.value.trim();
  if (!text || isThinking.value) return;
  inputText.value = '';
  addMessage('user', text);
  isThinking.value = true;
  questionCount.value++;
  addXp(3);

  if (ai.isReady()) {
    ai.streamChat(
      [{ role: 'system', content: currentTopic.value.systemPrompt }, ...messages.value.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))],
      (t) => { const last = messages.value[messages.value.length - 1]; if (last?.role === 'ai') last.content = t; else addMessage('ai', t); },
      (final) => { const last = messages.value[messages.value.length - 1]; if (last?.role === 'ai') last.content = final; isThinking.value = false; },
      (err) => { addMessage('ai', `[错误: ${err}]`); isThinking.value = false; },
      { temperature: 0.7, maxTokens: 2048 },
    );
  } else {
    setTimeout(() => {
      addMessage('ai', '这是一个很好的问题。让我从学术角度给你分析一下。首先，我们需要从文本内部和外部两个维度来考察。内部维度包括语言风格、修辞手法、结构安排等；外部维度则涉及历史背景、文化语境和社会影响……');
      isThinking.value = false;
    }, 1200);
  }
}

function switchTopic(tid: string) {
  activeTopic.value = tid;
  addMessage('ai', currentTopic.value.greeting);
  addXp(5);
}

// ─── Ancient Figure Mode ────────────────────
interface AncientFigure {
  id: string;
  name: string;
  icon: string;
  era: string;
  persona: string;
  systemPrompt: string;
  greeting: string;
  style: string;
}

const ancientFigures: AncientFigure[] = [
  {
    id: 'confucius', name: '孔子', icon: '👨‍🏫', era: '春秋', persona: '儒家创始人，仁爱智慧的长者',
    style: '语气温和庄重，言简意赅，循循善诱，常引经据典，以"子曰"开头',
    systemPrompt: `你是孔子（孔丘，字仲尼），春秋时期鲁国人，儒家学派创始人。你生活在公元前551-479年。你的核心思想是"仁"和"礼"。你现在正在与一位慕名而来的弟子对话。

性格特点：
- 温和而庄重，言简意赅
- 循循善诱，因材施教
- 重视道德修养和礼仪规范
- 常引用《诗》《书》等经典
- 对弟子的提问总是耐心回答

说话风格：
- 言简意赅，寓意深远
- 语气温和但充满智慧
- 善用比喻和举例
- 提及"仁""义""礼""智""信"
- 偶尔引用"诗云""书云"

限制：
- 只用文言与现代汉语混合的语言回复
- 保持在春秋时代的知识范围内
- 对现代事物表示不理解`,
    greeting: '有朋自远方来，不亦乐乎？吾乃孔丘，字仲尼。子欲问何道？',
  },
  {
    id: 'sushi', name: '苏轼', icon: '🍷', era: '北宋', persona: '豪放派词人，豁达多才的文豪',
    style: '洒脱豪放，幽默风趣，诗词信手拈来，对人生充满豁达',
    systemPrompt: `你是苏轼（苏子瞻，号东坡居士），北宋著名文学家、书法家、画家。你多才多艺，诗词文书画皆精，一生坎坷但始终保持豁达乐观。

性格特点：
- 豪放洒脱，幽默风趣
- 热爱美食和自然
- 对人生起伏泰然处之
- 诗词信手拈来，才华横溢
- 关心民间疾苦

说话风格：
- 风趣幽默，不拘小节
- 常引用自己的诗词
- 谈论美食、山水、人生哲理
- 用"呵呵""哈哈"表达乐观
- 将沉重话题化为轻松

限制：
- 保持北宋文人的知识范围
- 诗词融入日常对话
- 对人生的态度永远是豁达的`,
    greeting: '呵呵，子瞻在此！今日有酒有月有文章，人生之乐莫过于此。不知阁下欲谈诗论文，还是说说美食山水？',
  },
  {
    id: 'zhuangzi', name: '庄子', icon: '🦋', era: '战国', persona: '道家代表人物，逍遥洒脱的哲人',
    style: '汪洋恣肆，想象奇幻，善用寓言，超脱世俗',
    systemPrompt: `你是庄子（庄周），战国时期宋国人，道家学派的重要代表人物。你继承了老子思想并加以发展，主张"逍遥游"和"齐物论"。

性格特点：
- 超脱世俗，逍遥自在
- 想象力天马行空
- 善用寓言故事说理
- 对权力和名利不屑一顾
- 主张万物平等

说话风格：
- 想象奇特，汪洋恣肆
- 善用寓言和比喻
- 超然洒脱的语气
- 常提及鲲鹏、蝴蝶、庖丁等典故
- "此亦一是非，彼亦一是非"

限制：
- 保持在战国时代的知识范围内
- 对世俗之事表现出看淡的态度`,
    greeting: '不知是庄周梦为蝴蝶，还是蝴蝶梦为庄周？哈哈，此何妨！吾乃庄周，今日何不来一场逍遥游？',
  },
  {
    id: 'luxun', name: '鲁迅', icon: '✒️', era: '现代', persona: '文学巨匠，思想启蒙者',
    style: '犀利深刻，讽刺幽默，文白夹杂，关心民族命运',
    systemPrompt: `你是鲁迅（周树人），中国现代文学的奠基人。你以犀利的文笔和深刻的思考著称，关注国民性和社会问题。

性格特点：
- 文笔犀利，思想深刻
- 对社会问题高度关注
- 具有强烈的批判精神
- 表面冷峻，内心炽热
- "横眉冷对千夫指，俯首甘为孺子牛"

说话风格：
- 犀利直接，一针见血
- 善于讽刺和反语
- 文白夹杂，有独特的语言风格
- 常引用自己的作品和名言
- "我向来是不惮以最坏的恶意来推测..."

限制：
- 保持民国时期的知识视野
- 对社会问题的批判态度`,
    greeting: '我便是鲁迅。这世上本没有路，走的人多了，也便成了路。你有何疑问？尽管说来，不必客气。',
  },
];

const activeFigure = ref('confucius');
const figureMessages = ref<ChatMessage[]>([]);
const figureInput = ref('');
const figureThinking = ref(false);

const currentFigure = computed(() => ancientFigures.find(f => f.id === activeFigure.value)!);

function startFigureDialogue(fid: string) {
  activeFigure.value = fid;
  figureMessages.value = [{ role: 'ai', content: currentFigure.value.greeting }];
}

async function sendFigureMessage() {
  const text = figureInput.value.trim();
  if (!text || figureThinking.value) return;
  figureInput.value = '';
  figureMessages.value.push({ role: 'user', content: text });
  figureThinking.value = true;
  addXp(3);

  if (ai.isReady()) {
    ai.streamChat(
      [{ role: 'system', content: currentFigure.value.systemPrompt }, ...figureMessages.value.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))],
      (t) => { const last = figureMessages.value[figureMessages.value.length - 1]; if (last?.role === 'ai') last.content = t; else figureMessages.value.push({ role: 'ai', content: t }); },
      (final) => { const last = figureMessages.value[figureMessages.value.length - 1]; if (last?.role === 'ai') last.content = final; figureThinking.value = false; },
      (err) => { figureMessages.value.push({ role: 'ai', content: `[${err}]` }); figureThinking.value = false; },
      { temperature: 0.9, maxTokens: 1500 },
    );
  } else {
    const localReplies: Record<string, string[]> = {
      confucius: ['学而不思则罔，思而不学则殆。子欲求学问，当先正心诚意也。', '三人行，必有我师焉。择其善者而从之，其不善者而改之。'],
      sushi: ['呵呵，此事说来话长。不如先饮一杯，容我慢慢道来。东坡肉配浊酒，人生一大快事！', '大江东去，浪淘尽，千古风流人物。阁下所言，令我想起当年赤壁之游……'],
      zhuangzi: ['北冥有鱼，其名为鲲。鲲之大，不知其几千里也。汝之所问，犹如井蛙之问海也。', '吾生也有涯，而知也无涯。以有涯随无涯，殆已！'],
      luxun: ['这正如地上的路，走的人多了，也便成了路。你说的这个问题，我当年也想过。', '哀其不幸，怒其不争。中国人最需要的是思想的觉醒。'],
    };
    const list = localReplies[activeFigure.value] || localReplies.confucius;
    setTimeout(() => {
      figureMessages.value.push({ role: 'ai', content: list[Math.floor(Math.random() * list.length)] });
      figureThinking.value = false;
    }, 1200);
  }
}

// Quick questions
const quickQuestions = ['请分析"床前明月光"的意境和艺术手法', '如何写好一篇学术论文的引言部分？', '"之"字在文言文中有哪些用法？', '能否推荐几本文艺理论的入门书籍？'];

function sendQuick(q: string) {
  inputText.value = q;
  sendMessage();
}

onMounted(() => {
  addMessage('ai', currentTopic.value.greeting);
  startFigureDialogue('confucius');
});
</script>

<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-slate-900 via-[#130b1a] to-[#1a0f24] relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <span class="absolute top-20 left-1/4 text-6xl opacity-[0.04] animate-float-1">📖</span>
      <span class="absolute bottom-32 right-1/4 text-5xl opacity-[0.04] animate-float-2">📜</span>
      <span class="absolute top-1/3 right-12 text-4xl opacity-[0.04] animate-float-3">🏛️</span>
    </div>

    <!-- Top bar -->
    <div class="flex items-center justify-between px-5 py-3 bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center text-white">🤖</div>
        <div>
          <h1 class="text-base font-bold text-white">AI 导师 Pro</h1>
          <p class="text-[10px] text-white/40">学术指导 · 古人对话 · 深度学习</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button v-for="m in [{ id: 'tutor' as TutorMode, label: '🎓 学习场景' }, { id: 'ancient' as TutorMode, label: '⏳ 古人对话' }]" :key="m.id" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" :class="activeMode === m.id ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'text-white/40 hover:text-white/70'" @click="activeMode = m.id">
          {{ m.label }}
        </button>
        <router-link to="/chinese-learning" class="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-all ml-2">← 返回</router-link>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden relative z-10">
      <!-- ===== TUTOR MODE ===== -->
      <template v-if="activeMode === 'tutor'">
        <div class="w-56 bg-white/5 border-r border-white/10 p-4 flex flex-col flex-shrink-0">
          <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-4">学习场景</h3>
          <div class="space-y-2 flex-1 overflow-y-auto">
            <button v-for="t in topics" :key="t.id" class="w-full text-left p-3 rounded-xl text-xs font-bold transition-all" :class="activeTopic === t.id ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-400' : 'text-white/50 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent'" @click="switchTopic(t.id)">
              {{ t.icon }} {{ t.label }}
            </button>
          </div>
          <div class="mt-4 pt-4 border-t border-white/10 text-[10px] text-white/30 text-center">已提问 {{ questionCount }} 次</div>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="(msg, i) in messages" :key="i" :class="['flex gap-2', msg.role === 'user' ? 'justify-end' : '']">
              <div v-if="msg.role === 'ai'" class="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
              <div :class="['max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed', msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-md' : 'bg-white/10 text-white/90 rounded-bl-md']">
                {{ msg.content }}
                <span v-if="isThinking && i === messages.length - 1 && msg.role === 'ai'" class="animate-pulse">...</span>
              </div>
              <div v-if="msg.role === 'user'" class="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-sm flex-shrink-0">👤</div>
            </div>
          </div>

          <!-- Quick questions -->
          <div class="px-4 flex gap-2 flex-wrap">
            <button v-for="q in quickQuestions" :key="q" class="px-3 py-1 rounded-full text-[10px] bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition" @click="sendQuick(q)">{{ q }}</button>
          </div>

          <div class="p-4 border-t border-white/10">
            <div class="flex gap-2">
              <input v-model="inputText" class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-purple-500/50" placeholder="输入你的问题..." @keyup.enter="sendMessage" />
              <button class="px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition" :disabled="isThinking" @click="sendMessage">发送</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== ANCIENT FIGURE MODE ===== -->
      <template v-if="activeMode === 'ancient'">
        <div class="w-56 bg-white/5 border-r border-white/10 p-4 flex flex-col flex-shrink-0">
          <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-4">历史人物</h3>
          <div class="space-y-2 flex-1 overflow-y-auto">
            <button v-for="fig in ancientFigures" :key="fig.id" class="w-full text-left p-3 rounded-xl text-xs font-bold transition-all" :class="activeFigure === fig.id ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400' : 'text-white/50 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent'" @click="startFigureDialogue(fig.id)">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ fig.icon }}</span>
                <div>
                  <span>{{ fig.name }}</span>
                  <div class="text-[9px] text-white/30">{{ fig.era }} · {{ fig.persona }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <p class="text-xs text-amber-300">⏳ 正在与 <b>{{ currentFigure.name }}</b>（{{ currentFigure.era }}）对话 · {{ currentFigure.style }}</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="(msg, i) in figureMessages" :key="i" :class="['flex gap-2', msg.role === 'user' ? 'justify-end' : '']">
              <div v-if="msg.role === 'ai'" class="w-8 h-8 rounded-lg bg-amber-600/30 flex items-center justify-center text-lg flex-shrink-0">{{ currentFigure.icon }}</div>
              <div :class="['max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed', msg.role === 'user' ? 'bg-amber-600 text-white rounded-br-md' : 'bg-white/10 text-white/90 rounded-bl-md']">{{ msg.content }}</div>
              <div v-if="msg.role === 'user'" class="w-8 h-8 rounded-lg bg-amber-600/30 flex items-center justify-center text-sm flex-shrink-0">👤</div>
            </div>
          </div>
          <div class="p-4 border-t border-white/10">
            <div class="flex gap-2">
              <input v-model="figureInput" class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-amber-500/50" :placeholder="`向${currentFigure.name}提问...`" @keyup.enter="sendFigureMessage" />
              <button class="px-5 py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 transition" :disabled="figureThinking" @click="sendFigureMessage">发送</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
