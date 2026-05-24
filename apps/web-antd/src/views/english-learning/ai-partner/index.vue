<script lang="ts" setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAIService } from '#/views/shared-learning/composables/use-ai-service';

const router = useRouter();
const ai = useAIService();

// ─── Modes ──────────────────────────────────
type Mode = 'chat' | 'scenario' | 'shadowing';
const activeMode = ref<Mode>('chat');

// ─── Chat Mode ──────────────────────────────
interface ChatMessage { role: 'user' | 'ai'; content: string }
const chatMessages = ref<ChatMessage[]>([]);
const chatInput = ref('');
const isThinking = ref(false);
const sessionCount = ref(0);

const chatTopics = [
  { id: 'greeting', icon: '👋', label: '日常问候', greeting: 'Hello! How are you doing today? Let\'s practice some English conversation!' },
  { id: 'travel', icon: '✈️', label: '旅行英语', greeting: 'Welcome to the travel English session! Where would you like to travel? Let\'s talk about your dream destination.' },
  { id: 'interview', icon: '💼', label: '面试对话', greeting: 'Let\'s practice for a job interview. Tell me about yourself and your strengths.' },
  { id: 'daily', icon: '🏠', label: '日常生活', greeting: 'Let\'s chat about daily life. What does your typical day look like?' },
  { id: 'opinion', icon: '💭', label: '观点讨论', greeting: 'Let\'s discuss some interesting topics. What\'s your opinion on remote work versus office work?' },
  { id: 'academic', icon: '🎓', label: '学术讨论', greeting: 'Let\'s have an academic discussion. What field of study interests you the most, and why?' },
];

const activeTopic = ref('greeting');

function addMessage(role: 'user' | 'ai', content: string) {
  chatMessages.value.push({ role, content });
  if (role === 'user') sessionCount.value++;
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text || isThinking.value) return;
  chatInput.value = '';
  addMessage('user', text);
  isThinking.value = true;

  if (ai.isReady()) {
    const systemPrompt = `你是一位英语口语陪练。当前场景：${chatTopics.find(t => t.id === activeTopic.value)?.label}。用英语回复，适当纠正用户的语法和发音错误。保持对话自然流畅。`;
    ai.streamChat(
      [{ role: 'system', content: systemPrompt }, ...chatMessages.value.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))],
      (text) => { const last = chatMessages.value[chatMessages.value.length - 1]; if (last?.role === 'ai') { last.content = text; } else { addMessage('ai', text); } },
      (final) => { const last = chatMessages.value[chatMessages.value.length - 1]; if (last?.role === 'ai') last.content = final; isThinking.value = false; },
      (err) => { addMessage('ai', `Error: ${err}`); isThinking.value = false; },
      { temperature: 0.8, maxTokens: 1024 },
    );
  } else {
    const replies: Record<string, string[]> = {
      greeting: ["I'm doing great, thanks! How about you?", "Nice to meet you! What brings you here today?"],
      travel: ["That sounds amazing! Have you been to Europe?", "Traveling is such a great way to learn languages."],
      interview: ["That's impressive! Can you tell me more about your experience?", "Good answer! What are your career goals?"],
      daily: ["Sounds like a productive day! Do you have any hobbies?", "Interesting! I'd love to hear more about that."],
      opinion: ["That's a thoughtful perspective. What about work-life balance?", "I see your point. How do you think technology affects this?"],
      academic: ["Fascinating field! What specific aspect interests you most?", "That's a great topic. Have you read any recent papers about it?"],
    };
    const list = replies[activeTopic.value] || replies.greeting;
    setTimeout(() => {
      addMessage('ai', list[Math.floor(Math.random() * list.length)]);
      isThinking.value = false;
    }, 800 + Math.random() * 1200);
  }
}

// ─── Scenario Mode ──────────────────────────
interface Scenario { id: string; icon: string; label: string; role: string; systemPrompt: string; greeting: string }
const scenarios: Scenario[] = [
  { id: 'ielts', icon: '🎯', label: '雅思口语考官', role: 'IELTS Examiner', systemPrompt: `你是雅思口语考官。严格按照雅思口语考试Part 1-3流程进行。Part 1: 个人介绍与日常话题(4-5分钟)。Part 2: 给考生一张话题卡(2分钟准备+2分钟陈述)。Part 3: 深入讨论(4-5分钟)。使用英语提问，结束后给出分数(1-9)和简短评语。`, greeting: "Good morning/afternoon. My name is James. Can you tell me your full name please? ... Thank you. Now, in this first part, I'd like to ask you some questions about yourself. Let's talk about where you live. Do you live in a house or an apartment?" },
  { id: 'college', icon: '🏫', label: '大学面试官', role: 'University Interviewer', systemPrompt: `你是美国大学招生面试官。评估申请者的学术兴趣、个人素质和英语能力。询问关于学术背景、课外活动、为什么选择该校、未来规划等问题。保持专业友好的态度。面试结束时给出评估。`, greeting: "Welcome! Thank you for taking the time to interview with us today. I've had a chance to look over your application, but I'd love to hear more about you directly. To start, could you tell me why you're interested in attending our university?" },
  { id: 'business', icon: '🏢', label: '商务会议', role: 'Business Partner', systemPrompt: `你是国际商务会议中的合作伙伴。讨论项目进展、市场策略、预算等商务话题。使用专业商务英语但不失友好。偶尔提出异议以测试对方的谈判技巧。`, greeting: "Good morning, everyone. Thanks for joining today's meeting. On the agenda, we have the Q3 project review and budget allocation. Let's start with the project update. Could you walk us through the current status on your end?" },
  { id: 'abroad', icon: '🎓', label: '留学申请', role: 'Study Abroad Advisor', systemPrompt: `你是留学申请顾问。帮助学生选择学校、准备申请材料、撰写personal statement。提供关于托福/雅思要求、奖学金、签证等实用信息。`, greeting: "Hi there! I'm glad you're considering studying abroad. It's such an exciting journey! To help me give you the best advice, could you tell me: what level of study are you interested in (undergraduate or graduate), and what field are you passionate about?" },
  { id: 'airport', icon: '🛫', label: '机场交流', role: 'Airport Staff', systemPrompt: `你在国际机场工作。模拟值机、安检、登机口、行李提取等场景的英语对话。提供清晰简单的指令和回应。`, greeting: "Good evening. Welcome to the check-in counter. May I see your passport and booking confirmation, please? ... How many pieces of luggage will you be checking in today?" },
  { id: 'defense', icon: '📊', label: '学术答辩', role: 'Thesis Committee', systemPrompt: `你是论文答辩委员会成员。向答辩者提出关于研究方法、数据分析、理论框架、研究贡献和局限性的问题。使用学术英语，严格但公正。提出2-3个深入问题后给出评价。`, greeting: "Thank you for your presentation. Your research on this topic is quite interesting. I have a few questions. First, could you elaborate on why you chose this particular methodology over alternative approaches? What are the key limitations of your chosen method?" },
];

const activeScenario = ref('ielts');
const scenarioMessages = ref<ChatMessage[]>([]);
const scenarioInput = ref('');
const scenarioThinking = ref(false);

const currentScenario = computed(() => scenarios.find(s => s.id === activeScenario.value)!);

function startScenario(sid: string) {
  activeScenario.value = sid;
  scenarioMessages.value = [{ role: 'ai', content: currentScenario.value.greeting }];
}

async function sendScenarioMessage() {
  const text = scenarioInput.value.trim();
  if (!text || scenarioThinking.value) return;
  scenarioInput.value = '';
  scenarioMessages.value.push({ role: 'user', content: text });
  scenarioThinking.value = true;

  if (ai.isReady()) {
    ai.streamChat(
      [{ role: 'system', content: currentScenario.value.systemPrompt }, ...scenarioMessages.value.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))],
      (t) => { const last = scenarioMessages.value[scenarioMessages.value.length - 1]; if (last?.role === 'ai') last.content = t; else scenarioMessages.value.push({ role: 'ai', content: t }); },
      (final) => { const last = scenarioMessages.value[scenarioMessages.value.length - 1]; if (last?.role === 'ai') last.content = final; scenarioThinking.value = false; },
      (err) => { scenarioMessages.value.push({ role: 'ai', content: `[Error: ${err}]` }); scenarioThinking.value = false; },
      { temperature: 0.8, maxTokens: 1500 },
    );
  } else {
    setTimeout(() => {
      scenarioMessages.value.push({ role: 'ai', content: "That's an interesting point. Let me ask you a follow-up question..." });
      scenarioThinking.value = false;
    }, 1000);
  }
}

// ─── Shadowing Mode ─────────────────────────
const shadowSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "I believe that education is the key to success.",
  "Could you please tell me how to get to the nearest station?",
  "The results of the experiment were quite surprising.",
  "It's important to maintain a healthy work-life balance.",
  "What would you do if you won a million dollars?",
  "The conference will be held next month in New York.",
  "I'd like to make a reservation for two at seven o'clock.",
  "The researchers found a significant correlation between the two variables.",
  "In my opinion, climate change is the biggest challenge we face today.",
];
const shadowIndex = ref(0);
const shadowText = ref('');
const shadowScore = ref<{ pronunciation: number; fluency: number; feedback: string } | null>(null);
const shadowSpeaking = ref(false);
const shadowUserText = ref('');

function nextShadowSentence() {
  shadowScore.value = null;
  shadowUserText.value = '';
  shadowIndex.value = (shadowIndex.value + 1) % shadowSentences.length;
  shadowText.value = shadowSentences[shadowIndex.value];
}

function playShadowSentence() {
  if (shadowSpeaking.value) return;
  const utterance = new SpeechSynthesisUtterance(shadowText.value);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  shadowSpeaking.value = true;
  utterance.onend = () => { shadowSpeaking.value = false; };
  speechSynthesis.speak(utterance);
}

function simulateShadowScore() {
  const pronunciation = 60 + Math.floor(Math.random() * 35);
  const fluency = 55 + Math.floor(Math.random() * 40);
  const comments = [
    '发音较为清晰，注意元音的准确度，继续练习连读技巧。',
    '节奏感不错！注意辅音簇的发音，保持匀速朗读。',
    '语调自然流畅，个别单词重音需要调整，整体表现良好。',
    '发音准确度较高，适当注意句子的停顿和意群划分。',
  ];
  shadowScore.value = {
    pronunciation,
    fluency,
    feedback: comments[Math.floor(Math.random() * comments.length)],
  };
}

onMounted(() => {
  addMessage('ai', chatTopics[0].greeting);
  shadowText.value = shadowSentences[0];
  startScenario('ielts');
});
</script>

<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-slate-900 via-[#0c0c1d] to-[#0a0a12]">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-5 py-3 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white">🤖</div>
        <div>
          <h1 class="text-base font-bold text-white">AI 语伴 Pro</h1>
          <p class="text-[10px] text-white/40">场景模拟 · 实时对话 · 跟读训练</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button v-for="m in [{ id: 'chat' as Mode, label: '💬 自由对话' }, { id: 'scenario' as Mode, label: '🎭 场景模拟' }, { id: 'shadowing' as Mode, label: '🎤 跟读训练' }]" :key="m.id" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" :class="activeMode === m.id ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-white/40 hover:text-white/70'" @click="activeMode = m.id">
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- ===== CHAT MODE ===== -->
      <template v-if="activeMode === 'chat'">
        <div class="w-56 bg-white/5 border-r border-white/10 p-4 flex flex-col flex-shrink-0">
          <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-4">话题分类</h3>
          <div class="space-y-2 flex-1">
            <button v-for="topic in chatTopics" :key="topic.id" class="w-full text-left p-3 rounded-xl text-xs font-bold transition-all" :class="activeTopic === topic.id ? 'bg-blue-500/20 text-blue-300 border-l-2 border-blue-400' : 'text-white/50 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent'" @click="activeTopic = topic.id; addMessage('ai', topic.greeting)">
              {{ topic.icon }} {{ topic.label }}
            </button>
          </div>
          <div class="mt-4 pt-4 border-t border-white/10 text-[10px] text-white/30 text-center">已练习 {{ sessionCount }} 次</div>
        </div>
        <div class="flex-1 flex flex-col">
          <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="chatContainer">
            <div v-for="(msg, i) in chatMessages" :key="i" :class="['flex gap-2', msg.role === 'user' ? 'justify-end' : '']">
              <div v-if="msg.role === 'ai'" class="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
              <div :class="['max-w-[75%] p-3 rounded-2xl text-sm', msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white/10 text-white/90 rounded-bl-md']">
                {{ msg.content }}
                <span v-if="isThinking && i === chatMessages.length - 1 && msg.role === 'ai'" class="inline-block ml-1 animate-pulse">...</span>
              </div>
              <div v-if="msg.role === 'user'" class="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-sm flex-shrink-0">👤</div>
            </div>
          </div>
          <div class="p-4 border-t border-white/10">
            <div class="flex gap-2">
              <input v-model="chatInput" class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" placeholder="输入消息..." @keyup.enter="sendChatMessage" />
              <button class="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition" :disabled="isThinking" @click="sendChatMessage">发送</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== SCENARIO MODE ===== -->
      <template v-if="activeMode === 'scenario'">
        <div class="w-56 bg-white/5 border-r border-white/10 p-4 flex flex-col flex-shrink-0">
          <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-4">角色场景</h3>
          <div class="space-y-2 flex-1 overflow-y-auto">
            <button v-for="sc in scenarios" :key="sc.id" class="w-full text-left p-3 rounded-xl text-xs font-bold transition-all" :class="activeScenario === sc.id ? 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-400' : 'text-white/50 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent'" @click="startScenario(sc.id)">
              {{ sc.icon }} {{ sc.label }}
              <div class="text-[9px] text-white/30 mt-0.5">{{ sc.role }}</div>
            </button>
          </div>
        </div>
        <div class="flex-1 flex flex-col">
          <div class="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
            <p class="text-xs text-emerald-300">🎭 Role: <b>{{ currentScenario.role }}</b> — {{ currentScenario.label }}</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="(msg, i) in scenarioMessages" :key="i" :class="['flex gap-2', msg.role === 'user' ? 'justify-end' : '']">
              <div v-if="msg.role === 'ai'" class="w-8 h-8 rounded-lg bg-emerald-600/30 flex items-center justify-center text-sm flex-shrink-0">🎭</div>
              <div :class="['max-w-[75%] p-3 rounded-2xl text-sm', msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-white/10 text-white/90 rounded-bl-md']">{{ msg.content }}</div>
              <div v-if="msg.role === 'user'" class="w-8 h-8 rounded-lg bg-emerald-600/30 flex items-center justify-center text-sm flex-shrink-0">👤</div>
            </div>
          </div>
          <div class="p-4 border-t border-white/10">
            <div class="flex gap-2">
              <input v-model="scenarioInput" class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-emerald-500/50" placeholder="输入回复..." @keyup.enter="sendScenarioMessage" />
              <button class="px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition" :disabled="scenarioThinking" @click="sendScenarioMessage">发送</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== SHADOWING MODE ===== -->
      <div v-if="activeMode === 'shadowing'" class="flex-1 flex flex-col items-center justify-center p-6">
        <div class="max-w-lg w-full space-y-6 text-center">
          <div class="text-6xl">🎤</div>
          <h2 class="text-2xl font-bold text-white">Shadowing 跟读训练</h2>
          <p class="text-sm text-zinc-400">AI 播放一句英文，你跟着朗读，获得发音和流利度评分</p>

          <div class="en-glass p-6 rounded-2xl space-y-4">
            <p class="text-xl font-bold text-white leading-relaxed">{{ shadowText }}</p>
            <button class="px-6 py-3 rounded-xl font-semibold text-white transition-all" :class="shadowSpeaking ? 'bg-zinc-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'" :disabled="shadowSpeaking" @click="playShadowSentence">
              {{ shadowSpeaking ? '🔊 播放中...' : '🔊 播放句子' }}
            </button>
          </div>

          <div class="en-card p-4 text-center">
            <p class="text-sm text-zinc-400 mb-2">跟读后输入你听到的句子，并获取评分</p>
            <input v-model="shadowUserText" class="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-blue-500 mb-3" placeholder="输入你听到/跟读的句子..." @keyup.enter="simulateShadowScore" />
            <button class="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition" @click="simulateShadowScore">获取评分</button>
          </div>

          <div v-if="shadowScore" class="en-card p-5 space-y-3 animate-fade-in-up">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 rounded-xl" style="background: #18181b;">
                <p class="text-xs text-zinc-500 mb-1">Pronunciation</p>
                <p class="text-2xl font-bold" :style="{ color: shadowScore.pronunciation >= 80 ? '#22c55e' : shadowScore.pronunciation >= 60 ? '#3b82f6' : '#eab308' }">{{ shadowScore.pronunciation }}</p>
              </div>
              <div class="text-center p-3 rounded-xl" style="background: #18181b;">
                <p class="text-xs text-zinc-500 mb-1">Fluency</p>
                <p class="text-2xl font-bold" :style="{ color: shadowScore.fluency >= 80 ? '#22c55e' : shadowScore.fluency >= 60 ? '#3b82f6' : '#eab308' }">{{ shadowScore.fluency }}</p>
              </div>
            </div>
            <p class="text-xs text-zinc-400">{{ shadowScore.feedback }}</p>
          </div>

          <button class="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-sm hover:text-white transition" @click="nextShadowSentence">🔄 下一句</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-w-2xl { max-width: 42rem; }
</style>
