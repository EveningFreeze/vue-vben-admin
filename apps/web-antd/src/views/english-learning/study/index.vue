<template>
  <div class="flex h-full flex-col p-4 gap-4">
    <div class="flex items-center justify-between bg-white dark:bg-[#18181b] p-4 rounded-xl shadow-sm">
      <div>
        <h1 class="text-xl font-bold">智启英语 - 在线学习专区</h1>
        <p class="text-xs text-gray-500">当前正在学习：{{ currentVideo.title }}</p>
      </div>
      <div class="flex gap-2">
        <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">{{ currentCategory }}</span>
      </div>
    </div>

    <div class="flex flex-1 gap-4 overflow-hidden">
      <div class="w-1/4 bg-white dark:bg-[#18181b] rounded-xl shadow-sm flex flex-col">
        <div class="p-4 border-b dark:border-zinc-800 font-bold">课程目录</div>
        <div class="flex-1 overflow-y-auto p-2">
          <div v-for="(group, cat) in videoDict" :key="cat" class="mb-4">
            <div class="text-xs font-semibold text-gray-400 px-3 mb-2">{{ cat }}</div>
            <div
              v-for="video in group"
              :key="video.id"
              @click="selectVideo(video, cat)"
              :class="['cursor-pointer p-3 mb-1 rounded-lg text-sm transition-all', 
                currentVideo.id === video.id ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-zinc-800']"
            >
              {{ video.title }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 bg-black rounded-xl overflow-hidden shadow-lg flex flex-col">
        <div class="relative w-full h-0 pb-[56.25%] flex-1">
          <iframe
            :src="`//player.bilibili.com/player.html?bvid=${currentVideo.id}&page=1&high_quality=1&danmaku=0`"
            allowfullscreen="true"
            class="absolute top-0 left-0 w-full h-full border-0"
          ></iframe>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-4 border-t dark:border-zinc-800">
          <div class="flex justify-between items-center">
             <h2 class="font-bold text-lg text-gray-800 dark:text-gray-100">{{ currentVideo.title }}</h2>
             <button @click="showQuiz" class="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 shadow-md">📝 课后小测</button>
          </div>
        </div>
      </div>

      <div class="w-1/4 bg-white dark:bg-[#18181b] rounded-xl shadow-sm flex flex-col">
        <div class="p-3 border-b dark:border-zinc-800 font-bold text-indigo-600">AI 智能答疑</div>
        <div ref="messageBox" class="flex-1 p-4 overflow-y-auto space-y-4">
          <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="[
              'max-w-[90%] p-3 rounded-lg text-sm',
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 whitespace-pre-wrap'
            ]">
              {{ msg.content }}
            </div>
          </div>
          <div v-if="isTyping" class="text-xs text-gray-400 animate-pulse">AI 正在组织语言...</div>
        </div>
        <div class="p-3 border-t dark:border-zinc-800">
          <input 
            v-model="userInput" 
            @keyup.enter="sendMessage" 
            type="text" 
            placeholder="输入任何问题获取语法解析..." 
            class="w-full p-2 border rounded-lg text-sm dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500" 
          />
        </div>
      </div>
    </div>

    <div v-if="isQuizVisible" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-[#18181b] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden fade-in">
        <div class="p-6 border-b dark:border-zinc-800 bg-indigo-600 text-white flex justify-between items-center">
          <h3 class="font-bold">语法知识自测</h3>
          <button @click="isQuizVisible = false" class="text-xl">&times;</button>
        </div>
        <div class="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div v-for="(item, index) in currentVideo.questions" :key="index" class="space-y-3">
            <p class="font-bold">{{ index + 1 }}. {{ item.q }}</p>
            <div class="grid grid-cols-2 gap-3">
              <button 
                v-for="opt in item.options" :key="opt"
                @click="userAnswers[index] = opt"
                :class="['p-3 text-sm border rounded-xl text-left', userAnswers[index] === opt ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-zinc-900']"
              >
                {{ opt }}
              </button>
            </div>
          </div>
        </div>
        <div class="p-4 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900">
          <button @click="isQuizVisible = false" class="px-4 py-2 text-gray-500">取消</button>
          <button @click="submitQuiz" class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { message } from 'ant-design-vue';

// --- 基础状态 ---
const isQuizVisible = ref(false);
const userAnswers = ref<Record<number, string>>({});
const userInput = ref('');
const isTyping = ref(false);
const messageBox = ref<HTMLElement | null>(null);

// 初始化首条欢迎语
const chatMessages = ref([
  { role: 'ai', content: '你好！我是智启 AI。现在你可以问我相关问题了！' }
]);

// 预设的一般现在时语法介绍内容
const grammarIntro = `【一般现在时 (Simple Present Tense) 核心解析】

1. 概念：表示通常性、规律性、习惯性的动作或状态，以及客观真理。
2. 构成：
   - 主语 + 动词原形 (I/You/We/They)
   - 主语 + 动词s/es (当主语是第三人称单数 He/She/It 时)
3. 常用时间状语：
   - always, usually, often, sometimes, every day 等。
4. 示例：
   - I study English every day. (习惯)
   - The sun rises in the east. (真理)`;

// --- 视频与题目数据 ---
const videoDict = {
  '高考英语': [
    { 
      title: '核心语法特训', id: 'BV1XY411J7aG',
      questions: [
        { q: 'It is ______ that he will win the game.', options: ['likely', 'possible', 'probably', 'perhaps'], answer: 'likely' },
        { q: 'He suggested that we ______ the plan.', options: ['changed', 'change', 'should changed', 'changing'], answer: 'change' }
      ]
    },
    { title: '完形填空提分技巧', id: 'BV1vZnjzgEMY', questions: [] }
  ],
  '四六级英语': [
    { title: '四级听力必背词汇', id: 'BV1ZJVuzqELs', questions: [] },
    { title: '六级写作高分模板', id: 'BV1BG411N7xr', questions: [] },
  ],
  '考研英语': [
    { title: '长难句逻辑拆解', id: 'BV1nXARzjE6k', questions: [] },
    { title: '考研阅读真题精讲', id: 'BV1oDgrzREbD', questions: [] },
  ]
};

const currentCategory = ref('高考英语');
const currentVideo = ref(videoDict['高考英语'][0]);

// --- 自动回复逻辑 (不再使用接口) ---
const sendMessage = () => {
  if (!userInput.value.trim() || isTyping.value) return;

  // 1. 推送用户消息
  chatMessages.value.push({ role: 'user', content: userInput.value });
  userInput.value = '';
  isTyping.value = true;
  scrollToBottom();

  // 2. 模拟 AI 思考动画，800ms 后自动回复固定内容
  setTimeout(() => {
    isTyping.value = false;
    chatMessages.value.push({ 
      role: 'ai', 
      content: grammarIntro 
    });
    scrollToBottom();
  }, 800);
};

const scrollToBottom = () => {
  nextTick(() => { 
    if (messageBox.value) {
      messageBox.value.scrollTop = messageBox.value.scrollHeight; 
    }
  });
};

// --- 小测逻辑 ---
const showQuiz = () => {
  if (!currentVideo.value.questions?.length) return message.info('该视频暂无小测');
  userAnswers.value = {};
  isQuizVisible.value = true;
};

const submitQuiz = () => {
  const qs = currentVideo.value.questions;
  if (Object.keys(userAnswers.value).length < qs.length) return message.warning('请完成所有题目');
  let score = 0;
  qs.forEach((item, index) => { if (userAnswers.value[index] === item.answer) score++; });
  score === qs.length ? message.success(`全对！(${score}/${qs.length})`) : message.warning(`得分：${score}/${qs.length}`);
  isQuizVisible.value = false;
};

const selectVideo = (video: any, category: string) => {
  currentVideo.value = video;
  currentCategory.value = category;
  isQuizVisible.value = false;
};
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 10px; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
</style>
