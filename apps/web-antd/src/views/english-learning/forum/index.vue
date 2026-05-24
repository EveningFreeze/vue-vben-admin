<template>
  <EnglishPageLayout>
    <!-- Hero Banner -->
    <EnglishHero icon="💬" title="英语学习社区" subtitle="论坛交流 · 作文竞技 · 词汇PK" backTo="/english-learning" decorativeEmoji="💬" />

    <!-- Mode Toggle -->
    <div class="flex gap-2 mb-4">
      <button class="px-5 py-2 rounded-xl text-sm font-bold transition-all" :class="forumMode === 'forum' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'" @click="forumMode = 'forum'">💬 论坛</button>
      <button class="px-5 py-2 rounded-xl text-sm font-bold transition-all" :class="forumMode === 'arena' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'" @click="forumMode = 'arena'">🏆 竞技场</button>
    </div>

    <!-- ARENA MODE -->
    <div v-if="forumMode === 'arena'" class="space-y-5 pb-8">
      <div class="flex gap-2 mb-4">
        <button class="px-4 py-2 rounded-lg text-xs font-semibold transition-all" :class="arenaTab === 'essay' ? 'bg-orange-600/30 text-orange-300 border border-orange-500/40' : 'bg-zinc-800 text-zinc-400'" @click="arenaTab = 'essay'">✍️ Essay Arena</button>
        <button class="px-4 py-2 rounded-lg text-xs font-semibold transition-all" :class="arenaTab === 'vocab' ? 'bg-orange-600/30 text-orange-300 border border-orange-500/40' : 'bg-zinc-800 text-zinc-400'" @click="arenaTab = 'vocab'">⚡ Vocabulary Battle</button>
      </div>

      <!-- Essay Arena -->
      <div v-if="arenaTab === 'essay'" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 space-y-4">
          <EnglishCard v-for="(essay, ei) in arenaEssays" :key="ei">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="text-sm font-bold text-white">{{ essay.title }}</h4>
                <p class="text-xs text-zinc-500">by {{ essay.author }} · {{ essay.date }}</p>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold" :style="{ background: '#f59e0b22', color: '#fbbf24' }">⭐ {{ essay.score }}/100</span>
            </div>
            <p class="text-sm text-zinc-300 line-clamp-3 mb-3">{{ essay.content }}</p>
            <div class="flex items-center gap-4 text-xs text-zinc-500">
              <button class="flex items-center gap-1 hover:text-orange-400 transition" @click="essay.likes++; addXp(2)">👍 {{ essay.likes }}</button>
              <span>💬 {{ essay.comments.length }} 评论</span>
              <span v-if="essay.aiComment" class="text-blue-400">🤖 AI 已点评</span>
            </div>
            <div v-if="essay.aiComment" class="mt-3 p-3 rounded-xl text-xs" style="background: #3b82f611; border: 1px solid #3b82f622;">
              <span class="text-blue-400 font-semibold">🤖 AI 点评：</span>
              <span class="text-zinc-400">{{ essay.aiComment }}</span>
            </div>
          </EnglishCard>
        </div>
        <EnglishCard>
          <h3 class="text-sm font-bold text-white mb-3">🏆 本周排行</h3>
          <div class="space-y-2">
            <div v-for="(entry, ri) in arenaRanking" :key="ri" class="flex items-center gap-2 p-2 rounded-lg" :style="{ background: ri === 0 ? '#f59e0b11' : '#18181b' }">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" :style="{ background: ri === 0 ? '#f59e0b' : ri === 1 ? '#94a3b8' : ri === 2 ? '#92400e' : '#27272a', color: ri < 3 ? '#fff' : '#a1a1aa' }">{{ ri + 1 }}</span>
              <span class="text-sm text-zinc-300 flex-1">{{ entry.author }}</span>
              <span class="text-xs text-zinc-500">{{ entry.likes }} 👍</span>
            </div>
          </div>
        </EnglishCard>
      </div>

      <!-- Vocabulary Battle -->
      <div v-if="arenaTab === 'vocab'" class="max-w-2xl mx-auto">
        <EnglishCard>
          <div class="text-center py-4">
            <h3 class="text-xl font-bold text-white mb-1">⚡ Vocabulary Battle</h3>
            <p class="text-sm text-zinc-400 mb-4">限时 10 题，你 VS 系统</p>
            <div class="flex justify-center gap-6 mb-4 text-sm">
              <span class="text-zinc-400">得分：<b class="text-green-400">{{ vocabScore }}</b></span>
              <span class="text-zinc-400">剩余：<b :class="vocabTime <= 10 ? 'text-red-400' : 'text-blue-400'">{{ vocabTime }}s</b></span>
              <span class="text-zinc-400">题目：<b class="text-white">{{ vocabIndex + 1 }}/{{ vocabQuestions.length }}</b></span>
            </div>

            <div v-if="!vocabStarted" class="py-8">
              <p class="text-zinc-500 mb-4">10 道词汇选择题，每题限时 15 秒</p>
              <button class="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-500 transition" @click="startVocabBattle">🚀 开始挑战</button>
            </div>

            <div v-else-if="!vocabFinished && currentVocabQ" class="space-y-4">
              <div class="en-glass p-6 rounded-2xl">
                <p class="text-lg font-bold text-white mb-4">"{{ currentVocabQ.word }}" 的含义是？</p>
                <div class="grid grid-cols-2 gap-3">
                  <button v-for="(opt, oi) in currentVocabQ.options" :key="oi" class="p-3 rounded-xl text-sm text-left transition-all" style="background: #18181b; border: 1px solid #27272a; color: #d4d4d8;" @click="answerVocab(oi)">{{ String.fromCharCode(65 + oi) }}. {{ opt }}</button>
                </div>
              </div>
            </div>

            <div v-if="vocabFinished" class="py-6 space-y-3">
              <div class="text-4xl">{{ vocabScore >= 8 ? '🏆' : vocabScore >= 5 ? '👍' : '📚' }}</div>
              <p class="text-xl font-bold text-white">最终得分：{{ vocabScore }} / {{ vocabQuestions.length }}</p>
              <p class="text-sm text-zinc-400">{{ vocabScore >= 8 ? '太棒了！你是词汇大师！' : vocabScore >= 5 ? '不错！继续加油！' : '继续努力，多背单词！' }}</p>
              <button class="px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-500 transition" @click="startVocabBattle">🔄 再来一局</button>
            </div>
          </div>
        </EnglishCard>
      </div>
    </div>

    <!-- Main layout (FORUM MODE) -->
    <div v-if="forumMode === 'forum'" class="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">
      <!-- Left side: categories -->
      <div class="lg:col-span-1 space-y-3">
        <EnglishCard>
          <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">板块分类</h3>
          <div class="space-y-1">
            <button
              v-for="cat in forumCategories"
              :key="cat.id"
              :class="[
                'w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                activeCategory === cat.id
                  ? 'bg-en-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-en-50 dark:hover:bg-en-500/10 hover:text-en-600',
              ]"
              @click="activeCategory = cat.id; showDetail = null"
            >
              <span class="inline-block animate-wobble-slow">{{ cat.icon }}</span> {{ cat.label }}
              <span class="float-right text-[10px] opacity-60">{{ cat.count }}</span>
            </button>
          </div>
        </EnglishCard>
        <EnglishCard>
          <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3"><span class="inline-block animate-wobble-slow">🏆</span> 本周活跃</h3>
          <div class="space-y-2">
            <div v-for="(user, idx) in activeUsers" :key="user.name" class="flex items-center gap-2 text-xs">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" :class="{
                'bg-blue-500 text-white': idx === 0,
                'bg-slate-300 text-white': idx === 1,
                'bg-blue-700 text-white': idx === 2,
                'bg-slate-100 dark:bg-zinc-800 text-gray-400': idx > 2,
              }">{{ idx + 1 }}</span>
              <span class="font-bold text-gray-700 dark:text-zinc-300">{{ user.name }}</span>
              <span class="ml-auto text-gray-400 font-mono">{{ user.posts }} 帖</span>
            </div>
          </div>
        </EnglishCard>
      </div>

      <!-- Center: post list / detail -->
      <div class="lg:col-span-3 space-y-4">
        <!-- Post list -->
        <template v-if="!showDetail">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-600 dark:text-zinc-400">
              {{ forumCategories.find(c => c.id === activeCategory)?.label || '全部' }}
              <span class="font-mono text-gray-300 ml-1">{{ filteredPosts.length }} 帖</span>
            </h2>
            <div class="flex gap-2">
              <button :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all', sortBy === 'latest' ? 'bg-en-600 text-white' : 'text-gray-400 hover:text-en-600']" @click="sortBy = 'latest'">最新</button>
              <button :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all', sortBy === 'hot' ? 'bg-en-600 text-white' : 'text-gray-400 hover:text-en-600']" @click="sortBy = 'hot'">热门</button>
            </div>
          </div>

          <EnglishCard
            v-for="(post, idx) in sortedPosts"
            :key="post.id"
            hoverable
            class="group animate-fade-in-up opacity-0 hover-lift-glow"
            :class="`delay-${idx % 8}`"
            @click="showDetail = post"
          >
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-en-500 to-en-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm animate-gradient-shift">
                {{ post.author.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-bold text-gray-900 dark:text-zinc-100">{{ post.title }}</h3>
                  <span v-if="post.pinned" class="px-2 py-0.5 bg-red-100 dark:bg-red-500/10 text-red-600 text-[10px] rounded-full font-bold animate-pulse-glow">置顶</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mb-3">{{ post.content }}</p>
                <div class="flex items-center justify-between text-[10px] text-gray-400">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-600 dark:text-zinc-400">{{ post.author }}</span>
                    <span>{{ post.time }}</span>
                    <span class="px-2 py-0.5 rounded-full font-bold" :class="tagColor(post.tag)">{{ post.tag }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span>💬 <span class="animate-count inline-block">{{ post.replies }}</span></span>
                    <span>❤️ <span class="animate-count inline-block">{{ post.likes }}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </EnglishCard>
        </template>

        <!-- Post detail -->
        <template v-else>
          <button class="flex items-center gap-2 text-sm text-gray-500 hover:text-en-600 transition-colors font-bold mb-4" @click="showDetail = null">
            ← 返回列表
          </button>

          <EnglishCard class="overflow-hidden">
            <div class="p-6 border-b dark:border-zinc-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-en-500 to-en-cyan-500 flex items-center justify-center text-white text-lg font-bold animate-gradient-shift">{{ showDetail.author.charAt(0) }}</div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-zinc-100">{{ showDetail.author }}</h3>
                  <div class="text-xs text-gray-400">{{ showDetail.time }} · {{ showDetail.tag }}</div>
                </div>
              </div>
              <h2 class="text-xl font-black text-gray-900 dark:text-white mb-3">{{ showDetail.title }}</h2>
              <p class="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{{ showDetail.content }}</p>
              <div class="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span>💬 <span class="animate-count inline-block">{{ showDetail.replies }}</span></span>
                <span>❤️ <span class="animate-count inline-block">{{ showDetail.likes }}</span></span>
              </div>
            </div>

            <!-- Replies -->
            <div class="p-6 space-y-4">
              <h4 class="text-sm font-bold text-gray-700 dark:text-zinc-300">全部回复</h4>
              <div v-for="(reply, idx) in showDetail.replyList" :key="idx" class="flex gap-3 p-4 bg-slate-50 dark:bg-zinc-700/50 rounded-xl">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{{ reply.author.charAt(0) }}</div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-gray-700 dark:text-zinc-300">{{ reply.author }}</span>
                    <span class="text-[10px] text-gray-400">{{ reply.time }}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-zinc-400">{{ reply.content }}</p>
                </div>
              </div>

              <!-- Reply input -->
              <div class="flex gap-3 pt-2">
                <input
                  v-model="replyInput"
                  placeholder="写下你的评论..."
                  class="flex-1 p-3 border dark:border-zinc-600 rounded-xl text-sm dark:bg-zinc-700 focus:ring-1 focus:ring-en-500 outline-none transition-all"
                  @keyup.enter="addReply"
                />
                <button class="px-5 py-3 bg-en-600 text-white rounded-xl font-bold text-sm hover:bg-en-700 transition-all shadow-sm" @click="addReply">发送</button>
              </div>
            </div>
          </EnglishCard>
        </template>
      </div>
    </div>
  </EnglishPageLayout>
</template>

<script setup lang="ts">
import '../shared/animations.css';
import { EnglishPageLayout, EnglishHero, EnglishCard } from '../components';
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';

interface ForumPost {
  id: string; title: string; content: string; author: string; time: string; tag: string;
  replies: number; likes: number; pinned: boolean; category: string;
  replyList: { author: string; content: string; time: string }[];
}

const posts = ref<ForumPost[]>([
  { id: 'p1', title: '【精华】衡水体书写完整教程，从零开始', content: '衡水体是目前高考英语作文最受欢迎的字体之一。本教程从字母基础开始，详细讲解每个字母的书写要点和连笔技巧，配合 AI 批改系统效果更佳。', author: 'Teacher Wang', time: '2小时前', tag: '精华', replies: 28, likes: 156, pinned: true, category: 'writing',
    replyList: [
      { author: '李华', content: '太实用了！按照教程练了三天，字迹明显改善。', time: '1小时前' },
      { author: '小明', content: '请问字母 f 和 t 的写法有特殊要求吗？', time: '30分钟前' },
    ]},
  { id: 'p2', title: '六级听力 200+ 高分经验分享', content: '备考六级听力，关键在于精听和泛听的结合。我每天精听 15 分钟 VOA 慢速英语，然后做真题校对。考前一个月开始加速到常速，考试时感觉非常轻松。', author: '克里斯', time: '5小时前', tag: '经验', replies: 15, likes: 89, pinned: false, category: 'listening',
    replyList: [
      { author: 'Emma', content: '感谢分享！请问你用什么材料做精听？', time: '4小时前' },
    ]},
  { id: 'p3', title: '非谓语动词一篇文章讲清楚', content: '很多同学对非谓语动词感到困惑。其实掌握了核心逻辑就很简单：doing 表主动进行，done 表被动完成，to do 表目的将来。记住这三个核心含义，大部分题目都能迎刃而解。', author: '英语专业组', time: '1天前', tag: '语法', replies: 42, likes: 203, pinned: false, category: 'grammar',
    replyList: [
      { author: '小王', content: '终于搞懂了！原来这么简单。', time: '20小时前' },
      { author: 'Lisa', content: '能不能再讲讲独立主格结构？', time: '15小时前' },
    ]},
  { id: 'p4', title: 'AI 批改作文初体验——真的有用！', content: '第一次用智启英语的 AI 作文批改功能，被震撼到了。从语法、词汇、连贯性等多个维度给出评分，还有具体的修改建议。提交了一篇作文后按照建议修改，第二次评分提高了 15 分！', author: '追梦人', time: '2天前', tag: '评测', replies: 23, likes: 134, pinned: false, category: 'writing',
    replyList: [
      { author: '智启英语 AI', content: '感谢使用！我们会继续优化批改算法。', time: '1天前' },
    ]},
  { id: 'p5', title: '考研英语长难句每日一练 Day 30', content: '今日句子：The extent of that increase is only now becoming apparent, as the effects of the digital revolution continue to unfold. 解析：主语是 The extent，谓语是 is becoming apparent，as 引导时间状语从句。', author: '考研君', time: '3天前', tag: '每日一练', replies: 31, likes: 167, pinned: false, category: 'reading',
    replyList: [
      { author: '小张', content: '坚持跟了 30 天，阅读速度明显提升了！', time: '2天前' },
    ]},
  { id: 'p6', title: '词汇量 5000+ 的秘密：词根词缀记忆法', content: '掌握了常见的词根词缀，记单词效率提升 3 倍。比如 -spect 表示"看"，inspect(检查), respect(尊重), prospect(前景), retrospect(回顾)。学会了词根，遇见生词也能猜个大概。', author: 'Jack', time: '4天前', tag: '词汇', replies: 19, likes: 98, pinned: false, category: 'vocabulary',
    replyList: []},
  { id: 'p7', title: '雅思口语 Part 2 万能模板分享', content: '雅思口语 Part 2 其实有套路可循。先说 what，再说 when/where，接着说 why，最后说 how you feel。这个结构适用于 90% 的题目，背熟这个框架，考试不慌。', author: '雅思哥', time: '5天前', tag: '口语', replies: 36, likes: 211, pinned: false, category: 'speaking',
    replyList: [
      { author: 'Anna', content: '这个方法太棒了！上次考试用了这个框架拿了 7 分。', time: '4天前' },
    ]},
  { id: 'p8', title: '完形填空满分技巧——逻辑连接词大全', content: '完形填空考的就是逻辑。把连接词分类记忆：转折(but, however, yet), 因果(because, therefore, thus), 递进(moreover, furthermore), 举例(for example, such as)。做题时先判断逻辑关系再选词。', author: '学霸小明', time: '6天前', tag: '技巧', replies: 27, likes: 145, pinned: false, category: 'grammar',
    replyList: []},
]);

const forumCategories = [
  { id: 'all', label: '全部板块', icon: '📋', count: posts.value.length },
  { id: 'writing', label: '作文专区', icon: '✍️', count: posts.value.filter(p => p.category === 'writing').length },
  { id: 'grammar', label: '语法讨论', icon: '📝', count: posts.value.filter(p => p.category === 'grammar').length },
  { id: 'vocabulary', label: '词汇学习', icon: '📖', count: posts.value.filter(p => p.category === 'vocabulary').length },
  { id: 'reading', label: '阅读分享', icon: '📚', count: posts.value.filter(p => p.category === 'reading').length },
  { id: 'listening', label: '听力交流', icon: '🎧', count: posts.value.filter(p => p.category === 'listening').length },
  { id: 'speaking', label: '口语练习', icon: '💬', count: posts.value.filter(p => p.category === 'speaking').length },
];

const activeUsers = [
  { name: 'Teacher Wang', posts: 156 },
  { name: '学霸小明', posts: 132 },
  { name: '克里斯', posts: 98 },
  { name: '追梦人', posts: 67 },
  { name: '李华', posts: 45 },
];

const activeCategory = ref('all');
const sortBy = ref<'latest' | 'hot'>('hot');
const showDetail = ref<ForumPost | null>(null);
const replyInput = ref('');
const totalUsers = 1286;

const filteredPosts = computed(() =>
  activeCategory.value === 'all' ? posts.value : posts.value.filter(p => p.category === activeCategory.value)
);

const sortedPosts = computed(() => {
  const sorted = [...filteredPosts.value];
  // Pinned first
  sorted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  if (sortBy.value === 'hot') {
    sorted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.likes - a.likes);
  } else {
    // Sort by time approximation - just use the order
    sorted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }
  return sorted;
});

function addReply() {
  if (!replyInput.value.trim() || !showDetail.value) return;
  showDetail.value.replyList.push({
    author: '我',
    content: replyInput.value.trim(),
    time: '刚刚',
  });
  showDetail.value.replies++;
  replyInput.value = '';
  message.success('回复成功！');
}

// ─── Arena ──────────────────────────────────
interface ArenaEssay { title: string; author: string; date: string; content: string; score: number; likes: number; comments: Array<{ author: string; content: string }>; aiComment: string }
const arenaEssays = ref<ArenaEssay[]>([
  { title: 'The Impact of AI on Modern Education', author: '学霸小明', date: '2026-05-22', content: 'Artificial intelligence is revolutionizing the educational landscape in unprecedented ways. From personalized learning algorithms to automated assessment systems, AI technologies are reshaping how students learn and teachers teach...', score: 88, likes: 42, comments: [{ author: 'AI', content: 'Well-structured argument with good use of evidence.' }], aiComment: '文章结构清晰，论证充分。建议：增加更多具体案例来支撑论点，使用更多学术词汇如"pedagogical", "paradigm shift"。整体CEFR水平：B2+。' },
  { title: 'Should Remote Work Become the New Normal?', author: '追梦人', date: '2026-05-20', content: 'The COVID-19 pandemic has fundamentally changed how we think about work. Remote work, once considered a perk, has become a necessity. But should it become permanent?', score: 82, likes: 35, comments: [], aiComment: '议论文结构完整，观点明确。语法错误较少，词汇使用恰当。可改进之处：增加对立观点的讨论以使论证更加平衡。' },
  { title: 'Climate Change: Individual Action vs Government Policy', author: '克里斯', date: '2026-05-18', content: 'When addressing climate change, a recurring debate centers on whether individual actions or government policies are more effective...', score: 91, likes: 56, comments: [], aiComment: '出色的议论文！逻辑严密，词汇高级，句型多样。推荐放入"本周最佳"。建议尝试投稿学术期刊。' },
]);
const arenaRanking = computed(() => arenaEssays.value.map(e => ({ author: e.author, likes: e.likes })).sort((a, b) => b.likes - a.likes));

// Vocabulary Battle
const vocabQuestions = [
  { word: 'Ephemeral', options: ['永久的', '短暂的', '复杂的', '简单的'], answer: 1 },
  { word: 'Ubiquitous', options: ['罕见的', '无处不在的', '昂贵的', '危险的'], answer: 1 },
  { word: 'Paradigm', options: ['悖论', '范例/模式', '段落', '参数'], answer: 1 },
  { word: 'Meticulous', options: ['粗心的', '懒惰的', '一丝不苟的', '匆忙的'], answer: 2 },
  { word: 'Pragmatic', options: ['教条的', '浪漫的', '悲观的', '务实的'], answer: 3 },
  { word: 'Eloquent', options: ['沉默的', '雄辩的', '困惑的', '愤怒的'], answer: 1 },
  { word: 'Resilient', options: ['脆弱的', '有弹性的/坚韧的', '僵硬的', '柔软的'], answer: 1 },
  { word: 'Ambiguous', options: ['清晰的', '模糊的/歧义的', '具体的', '简短的'], answer: 1 },
  { word: 'Innovative', options: ['传统的', '创新的', '保守的', '重复的'], answer: 1 },
  { word: 'Comprehensive', options: ['片面的', '全面的', '简略的', '肤浅的'], answer: 1 },
  { word: 'Substantial', options: ['微小的', '大量的/实质的', '表面的', '临时的'], answer: 1 },
  { word: 'Articulate', options: ['口齿不清的', '清晰表达的', '书写潦草的', '犹豫不决的'], answer: 1 },
];
const vocabStarted = ref(false);
const vocabFinished = ref(false);
const vocabIndex = ref(0);
const vocabScore = ref(0);
const vocabTime = ref(15);
let vocabTimer: ReturnType<typeof setInterval> | null = null;

const currentVocabQ = computed(() => vocabQuestions[vocabIndex.value] || null);

function startVocabBattle() {
  vocabStarted.value = true;
  vocabFinished.value = false;
  vocabIndex.value = 0;
  vocabScore.value = 0;
  // Shuffle questions
  vocabQuestions.sort(() => Math.random() - 0.5);
  vocabTime.value = 15;
  if (vocabTimer) clearInterval(vocabTimer);
  vocabTimer = setInterval(() => {
    vocabTime.value--;
    if (vocabTime.value <= 0) {
      vocabIndex.value++;
      if (vocabIndex.value >= vocabQuestions.length) {
        finishVocabBattle();
      } else {
        vocabTime.value = 15;
      }
    }
  }, 1000);
}

function answerVocab(optionIndex: number) {
  if (vocabFinished.value) return;
  if (optionIndex === currentVocabQ.value?.answer) vocabScore.value++;
  vocabIndex.value++;
  if (vocabIndex.value >= vocabQuestions.length) {
    finishVocabBattle();
  } else {
    vocabTime.value = 15;
  }
}

function finishVocabBattle() {
  vocabFinished.value = true;
  vocabStarted.value = false;
  if (vocabTimer) clearInterval(vocabTimer);
  addXp(vocabScore.value * 5);
}

function tagColor(tag: string): string {
  const map: Record<string, string> = {
    '精华': 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    '经验': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    '语法': 'bg-zinc-200 text-zinc-700 dark:bg-blue-500/10 dark:text-zinc-500',
    '评测': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    '每日一练': 'bg-zinc-200 text-zinc-700 dark:bg-blue-500/10 dark:text-zinc-500',
    '词汇': 'bg-en-100 text-en-700 dark:bg-en-500/10 dark:text-en-400',
    '口语': 'bg-en-100 text-en-700 dark:bg-en-500/10 dark:text-en-400',
    '技巧': 'bg-zinc-200 text-zinc-700 dark:bg-blue-500/10 dark:text-zinc-500',
  };
  return map[tag] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
</style>
