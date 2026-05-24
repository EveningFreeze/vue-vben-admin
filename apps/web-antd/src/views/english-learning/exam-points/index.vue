<template>
  <EnglishPageLayout>
    <!-- Hero -->
    <EnglishHero icon="⭐" title="高频考点" subtitle="覆盖语法 · 词汇 · 阅读 · 写作 · 听力五大核心模块" backTo="/english-learning" decorativeEmoji="⭐" />

    <!-- Category tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="[
          'px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
          activeCat === cat.id
            ? 'bg-en-600 text-white shadow-lg shadow-en-glow animate-pulse-glow'
            : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:border-en-300 hover:text-en-600',
        ]"
        @click="activeCat = cat.id; filterPoints()"
      >
        <span class="inline-block animate-wobble-slow">{{ cat.icon }}</span> {{ cat.label }}
      </button>
    </div>

    <!-- Flashcard Review Mode -->
    <div v-if="isReviewing" class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <button class="text-sm text-gray-500 hover:text-en-600 transition-colors font-bold px-4 py-2 rounded-xl hover:bg-en-50 dark:hover:bg-en-500/10" @click="isReviewing = false">
          ← 返回列表
        </button>
        <div class="text-sm font-bold text-en-600 bg-en-50 dark:bg-en-500/10 px-4 py-1.5 rounded-full animate-bounce-in">
          {{ reviewIndex + 1 }} / {{ reviewPoints.length }}
        </div>
      </div>

      <div class="perspective-container mb-8" @click="flipCard">
        <div :class="['card-flipper', { flipped: isFlipped }]" class="min-h-[320px]">
          <!-- Front -->
          <div class="card-face front bg-white dark:bg-zinc-800 rounded-[32px] p-10 border border-en-200 dark:border-zinc-700 shadow-xl text-center flex flex-col items-center justify-center animate-pulse-glow">
            <div class="text-xs font-black text-en-500 uppercase tracking-wider mb-6">点击翻转查看详解</div>
            <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-4">{{ reviewPoints[reviewIndex]?.title }}</h2>
            <span class="px-4 py-1.5 rounded-full text-xs font-bold" :class="catColor(reviewPoints[reviewIndex]?.category || '')">
              {{ reviewPoints[reviewIndex]?.category }}
            </span>
          </div>
          <!-- Back -->
          <div class="card-face back bg-white dark:bg-zinc-800 rounded-[32px] p-10 border border-en-200 dark:border-zinc-700 shadow-xl overflow-y-auto">
            <div class="text-left">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-[10px] font-black text-en-500 uppercase tracking-wider">{{ reviewPoints[reviewIndex]?.category }}</span>
                <span v-for="i in reviewPoints[reviewIndex]?.importance || 0" :key="i" class="text-en-cyan-400 text-sm inline-block animate-wobble-slow">⭐</span>
              </div>
              <h3 class="text-xl font-black text-gray-900 dark:text-white mb-4">{{ reviewPoints[reviewIndex]?.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{{ reviewPoints[reviewIndex]?.detail }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <button class="px-6 py-3 bg-gradient-to-r from-en-600 to-en-cyan-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all animate-gradient-shift" @click="ratePoint(false)">
          😵 没掌握
        </button>
        <button class="px-6 py-3 bg-gradient-to-r from-en-500 to-en-cyan-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all animate-gradient-shift" @click="ratePoint(true)">
          😎 掌握了
        </button>
      </div>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
      <EnglishCard
        v-for="(point, idx) in displayPoints"
        :key="point.id"
        hoverable
        class="group animate-fade-in-up opacity-0 hover-lift-glow"
        :class="`delay-${idx % 6}`"
        @click="startReview(idx)"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" :class="catIcon(point.category).bg">
              {{ catIcon(point.category).icon }}
            </div>
            <span class="text-[10px] font-bold text-gray-400">{{ point.category }}</span>
          </div>
          <div class="flex">
            <span v-for="i in point.importance" :key="i" class="text-en-cyan-400 text-xs inline-block animate-wobble-slow">⭐</span>
          </div>
        </div>
        <h3 class="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-2 group-hover:text-en-600 transition-colors">{{ point.title }}</h3>
        <p class="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed line-clamp-3">{{ point.detail }}</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-[10px] px-2 py-0.5 rounded-full font-bold" :class="catColor(point.category)">{{ point.category }}</span>
          <span class="text-[10px] text-gray-400">{{ point.mastered ? '✅ 已掌握' : '📖 待复习' }}</span>
        </div>
      </EnglishCard>
    </div>
  </EnglishPageLayout>
</template>

<script setup lang="ts">
import '../shared/animations.css';
import { EnglishPageLayout, EnglishHero, EnglishCard } from '../components';
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';

interface ExamPoint {
  id: string; title: string; detail: string; category: string; importance: number; mastered: boolean;
}

const categories = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: '语法', label: '语法', icon: '📝' },
  { id: '词汇', label: '词汇', icon: '📖' },
  { id: '阅读', label: '阅读', icon: '📚' },
  { id: '写作', label: '写作', icon: '✍️' },
  { id: '听力', label: '听力', icon: '🎧' },
];

const allPoints = ref<ExamPoint[]>([
  { id: 'g1', title: '虚拟语气', category: '语法', importance: 5, mastered: false,
    detail: '与现在事实相反：If + 过去式(be→were), would/could + 动词原形\n例：If I were you, I would study harder.\n与过去事实相反：If + had + 过去分词, would/could + have + 过去分词\n例：If I had studied, I would have passed the exam.' },
  { id: 'g2', title: '定语从句', category: '语法', importance: 5, mastered: false,
    detail: '关系代词：who(人,主格), whom(人,宾格), which(物), that(人/物), whose(所属)\n限制性 vs 非限制性：非限制性不能用 that\n例：The book which I read is fascinating.' },
  { id: 'g3', title: '非谓语动词', category: '语法', importance: 4, mastered: true,
    detail: '动名词(V-ing)：作主语/宾语 → Swimming is good.\n不定式(to do)：表目的 → I want to learn.\n分词：现在分词(主动进行), 过去分词(被动完成) → The movie is exciting.' },
  { id: 'g4', title: '倒装句', category: '语法', importance: 4, mastered: false,
    detail: '否定词开头倒装：Never, Seldom, Rarely, Not only...\nOnly + 状语开头倒装\n例：Not until midnight did he finish his homework.' },
  { id: 'g5', title: '时态语态', category: '语法', importance: 5, mastered: false,
    detail: '一般现在/过去/将来 · 现在/过去/将来完成时 · 进行时\n被动语态：be + 过去分词 (各种时态均有被动形式)\n注意主谓一致和时态呼应原则。' },
  { id: 'v1', title: '高频词组', category: '词汇', importance: 4, mastered: false,
    detail: 'break down 出故障；carry out 执行；come up with 提出；deal with 处理；get along with 与...相处；look forward to 期待；make up for 弥补；put up with 忍受；run out of 用完；take part in 参加。' },
  { id: 'v2', title: '同义替换', category: '词汇', importance: 4, mastered: true,
    detail: 'important→significant/crucial/vital/essential\ngood→excellent/outstanding/remarkable\nbad→terrible/appalling/dreadful\nbig→massive/enormous/immense\nsmall→tiny/minute/compact' },
  { id: 'v3', title: '词根词缀', category: '词汇', importance: 3, mastered: false,
    detail: '前缀：un-/in-/dis-(否定), re-(再), pre-(前), mis-(错)\n后缀：-tion/-sion(名词), -ful(形容词), -ly(副词), -ize(动词)\n词根：-spect(看), -duce(引导), -tract(拉)' },
  { id: 'r1', title: '主旨题技巧', category: '阅读', importance: 5, mastered: false,
    detail: '1. 关注首段末段和每段首句\n2. 标志词：therefore, thus, in conclusion, overall\n3. 排除法：过于具体或过于宽泛的选项通常是干扰项\n4. 正确答案往往包含文中反复出现的关键词的同义替换。' },
  { id: 'r2', title: '推断题攻略', category: '阅读', importance: 4, mastered: false,
    detail: '1. 不要选择文中直接陈述的内容（那是细节题）\n2. 标志词：infer, imply, suggest, conclude\n3. 正确答案需要基于文本推理得出\n4. 注意作者语气和态度词（ironically, unfortunately等）。' },
  { id: 'w1', title: '高分句式', category: '写作', importance: 5, mastered: false,
    detail: '1. 定语从句：The reason why...is that...\n2. 倒装句：Only by...can we...\n3. 虚拟语气：It is high time that...\n4. 强调句：It is...that...\n5. 同位语从句：The fact that...suggests...' },
  { id: 'w2', title: '写作结构', category: '写作', importance: 4, mastered: true,
    detail: '三段式结构：\n开头段：背景引入 + 观点陈述\n主体段：论点1 + 论据 + 例子；论点2 + 论据 + 例子\n结尾段：重申观点 + 总结 + 展望\n注意段落间使用连接词过渡。' },
  { id: 'h1', title: '听力关键词', category: '听力', importance: 4, mastered: false,
    detail: '转折词后是重点：but, however, yet, actually, in fact\n因果关系：because, since, therefore, as a result\n建议句型：Why not..., How about..., You\'d better...\n数字信息：时间、价格、数量、日期要敏感。' },
  { id: 'h2', title: '听力题型', category: '听力', importance: 3, mastered: false,
    detail: '短对话：抓关键词和说话人语气\n长对话：注意一问一答的逻辑链\n讲座/独白：重点关注开场白和结论部分\n填空：注意单词拼写、大小写、单复数。' },
]);

const activeCat = ref('all');
const isReviewing = ref(false);
const isFlipped = ref(false);
const reviewIndex = ref(0);
const reviewPoints = ref<ExamPoint[]>([]);

const displayPoints = computed(() =>
  activeCat.value === 'all' ? allPoints.value : allPoints.value.filter(p => p.category === activeCat.value)
);

const totalPoints = computed(() => allPoints.value.length);
const masteredCount = computed(() => allPoints.value.filter(p => p.mastered).length);

function filterPoints() {
  isReviewing.value = false;
}

function startReview(idx: number) {
  reviewPoints.value = displayPoints.value;
  reviewIndex.value = idx;
  isFlipped.value = false;
  isReviewing.value = true;
}

function flipCard() { isFlipped.value = !isFlipped.value; }

function ratePoint(mastered: boolean) {
  const point = reviewPoints.value[reviewIndex.value]!;
  const original = allPoints.value.find(p => p.id === point.id);
  if (original) original.mastered = mastered;

  if (reviewIndex.value < reviewPoints.value.length - 1) {
    reviewIndex.value++;
    isFlipped.value = false;
  } else {
    message.success('🎉 本轮考点复习完成！');
    isReviewing.value = false;
  }
}

function catColor(cat: string): string {
  const map: Record<string, string> = {
    '语法': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    '词汇': 'bg-zinc-700 text-zinc-300 dark:bg-blue-500/10 dark:text-zinc-500',
    '阅读': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    '写作': 'bg-zinc-700 text-zinc-300 dark:bg-blue-500/10 dark:text-zinc-500',
    '听力': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  };
  return map[cat] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';
}

function catIcon(cat: string): { icon: string; bg: string } {
  const map: Record<string, { icon: string; bg: string }> = {
    '语法': { icon: '📝', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    '词汇': { icon: '📖', bg: 'bg-zinc-800 dark:bg-blue-500/10' },
    '阅读': { icon: '📚', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    '写作': { icon: '✍️', bg: 'bg-zinc-800 dark:bg-blue-500/10' },
    '听力': { icon: '🎧', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  };
  return map[cat] || { icon: '📋', bg: 'bg-gray-50 dark:bg-gray-500/10' };
}
</script>

<style scoped>
.perspective-container { perspective: 1000px; }
.card-flipper {
  position: relative;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.card-flipper.flipped { transform: rotateY(180deg); }
.card-face {
  position: absolute; width: 100%; min-height: 320px;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
}
.card-face.back { transform: rotateY(180deg); }

.line-clamp-3 {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
</style>
