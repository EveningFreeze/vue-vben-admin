<template>
  <ChinesePageLayout>
    <ChineseHero icon="🎯" title="语言基础" subtitle="音韵 · 文字 · 训诂 · 语法 · 修辞 — 大学语文核心素养训练" backTo="/chinese-learning" showXpBar decorativeEmoji="🎯" />

      <!-- Type Filter -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="(type, idx) in exerciseTypes"
          :key="type.key"
          :class="[
            'px-5 py-2.5 rounded-xl text-xs font-bold transition-all animate-fade-in-up opacity-0',
            'delay-' + idx,
            activeType === type.key
              ? 'bg-gradient-to-r from-chinese-600 to-chinese-700 text-white shadow-lg animate-pulse-glow animate-gradient-shift'
              : 'bg-white dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 hover-lift-glow',
          ]"
          @click="activeType = type.key; generateExercises(type.key)"
        >
          {{ type.icon }} {{ type.label }}
        </button>
      </div>

      <!-- Exercise Cards -->
      <div v-if="exercises.length > 0" class="grid grid-cols-1 gap-4 pb-8">
        <div
          v-for="(ex, idx) in exercises"
          :key="ex.question"
          class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm hover-lift-glow"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">第 {{ idx + 1 }} 题</span>
            <span class="text-[10px] font-bold" :class="ex.difficulty === 1 ? 'text-orange-500' : ex.difficulty === 2 ? 'text-blue-400' : 'text-red-500'">
              {{ ['', '基础', '进阶', '高阶'][ex.difficulty] }}
            </span>
          </div>
          <p class="text-base font-bold text-gray-900 dark:text-white mb-4">{{ ex.question }}</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="opt in ex.options"
              :key="opt"
              :class="[
                'p-3 text-sm border rounded-xl text-left transition-all font-medium',
                answers[idx] === opt
                  ? results[idx] === 'correct'
                    ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                    : results[idx] === 'wrong'
                      ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      : 'bg-zinc-800 border-blue-500 text-zinc-300 dark:bg-blue-500/10 dark:text-zinc-500'
                  : 'bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-orange-300 hover:bg-orange-50/50',
              ]"
              :disabled="!!answers[idx]"
              @click="checkAnswer(idx, opt, ex.answer)"
            >
              {{ opt }}
            </button>
          </div>
          <div v-if="ex.hint && answers[idx]" class="mt-2 text-xs text-blue-400 font-medium animate-bounce-in">
            💡 {{ ex.hint }}
          </div>
          <div v-if="results[idx] === 'wrong'" class="mt-2 text-xs text-red-500 font-medium animate-bounce-in">
            ❌ 正确答案：{{ ex.answer }}
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16 text-gray-400">
        <div class="text-5xl mb-4 animate-wobble-slow">🎯</div>
        <p class="text-sm">选择一个练习类型开始训练</p>
      </div>
  </ChinesePageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGamification } from '../shared/use-gamification';
import { ChinesePageLayout, ChineseHero } from '../components';
import type { PracticeExercise } from '../shared/types';
import '../shared/animations.css';

const gamification = useGamification();

const activeType = ref('');
const answers = ref<Record<number, string>>({});
const results = ref<Record<number, 'correct' | 'wrong'>>({});

type Exercise = Omit<PracticeExercise, 'id' | 'type'> & { hint?: string };

const exercises = ref<Exercise[]>([]);

const exerciseTypes = [
  { key: 'phonology', label: '音韵', icon: '🗣️' },
  { key: 'paleography', label: '文字', icon: '🔍' },
  { key: 'exegesis', label: '训诂', icon: '📖' },
  { key: 'grammar', label: '语法', icon: '🔗' },
  { key: 'rhetoric', label: '修辞', icon: '🎨' },
];

const exerciseBank: Record<string, Exercise[]> = {
  phonology: [
    {
      question: '"三十六字母"中"帮滂並明"属于什么音？',
      options: ['重唇音', '轻唇音', '舌音', '齿音'],
      answer: '重唇音',
      difficulty: 2,
      hint: '重唇音即双唇音，轻唇音即唇齿音',
    },
    {
      question: '"平上去入"四声中"入"声的特点是？',
      options: ['发音短促', '声音上扬', '声音下降', '声音平直'],
      answer: '发音短促',
      difficulty: 1,
      hint: '入声以塞音-p/-t/-k收尾',
    },
    {
      question: '"反切"注音法最早出现在哪个朝代？',
      options: ['东汉', '隋唐', '宋代', '明代'],
      answer: '东汉',
      difficulty: 2,
      hint: '反切用两个字拼合注音',
    },
    {
      question: '"《广韵》"共多少韵？',
      options: ['206韵', '193韵', '160韵', '106韵'],
      answer: '206韵',
      difficulty: 2,
      hint: '《广韵》是北宋官修韵书',
    },
    {
      question: '"平分阴阳"中的"阴平"是指？',
      options: ['清声母平声字', '浊声母平声字', '上声字', '去声字'],
      answer: '清声母平声字',
      difficulty: 2,
      hint: '清声母包括全清和次清',
    },
    {
      question: '"入派四声"发生在哪个时期？',
      options: ['元代', '宋代', '唐代', '明代'],
      answer: '元代',
      difficulty: 2,
      hint: '《中原音韵》反映了这一变化',
    },
    {
      question: '"尖团合流"是指什么语音现象？',
      options: ['尖音和团音合并', '声母和韵母合并', '平声和仄声合并', '阴声和阳声合并'],
      answer: '尖音和团音合并',
      difficulty: 3,
      hint: 'z c s与j q x合流',
    },
    {
      question: '"《切韵》"的作者是？',
      options: ['陆法言', '许慎', '段玉裁', '顾炎武'],
      answer: '陆法言',
      difficulty: 1,
      hint: '《切韵》成书于隋代',
    },
    {
      question: '"等呼"中"开口呼"是指？',
      options: ['无介音或介音为i的韵母', '无介音或介音为u的韵母', '有介音为ü的韵母', '有介音为a的韵母'],
      answer: '无介音或介音为i的韵母',
      difficulty: 3,
      hint: '开口与合口相对',
    },
    {
      question: '"浊上变去"是指什么语音变化？',
      options: ['全浊上声字变为去声', '次浊上声字变为去声', '全浊去声字变为上声', '清上声字变为去声'],
      answer: '全浊上声字变为去声',
      difficulty: 3,
      hint: '这是中古到近古的重要音变规律',
    },
    {
      question: '"三十六字母"按发音部位分为几类？',
      options: ['七类', '五类', '八类', '六类'],
      answer: '七类',
      difficulty: 3,
      hint: '唇舌齿牙喉半舌半齿',
    },
    {
      question: '"阴声韵"是指以什么结尾的韵？',
      options: ['元音', '鼻音', '塞音', '辅音'],
      answer: '元音',
      difficulty: 2,
      hint: '与之相对的是阳声韵和入声韵',
    },
  ],

  paleography: [
    {
      question: '"六书"中哪一类造字法数量最多？',
      options: ['形声', '象形', '指事', '会意'],
      answer: '形声',
      difficulty: 1,
      hint: '占汉字总数80%以上',
    },
    {
      question: '"《说文解字》"的作者是？',
      options: ['许慎', '郑玄', '段玉裁', '刘熙'],
      answer: '许慎',
      difficulty: 1,
      hint: '成书于东汉',
    },
    {
      question: '甲骨文主要发现于哪个遗址？',
      options: ['殷墟', '周原', '二里头', '三星堆'],
      answer: '殷墟',
      difficulty: 1,
      hint: '位于河南安阳',
    },
    {
      question: '"隶变"主要发生在哪个时期？',
      options: ['秦汉之际', '魏晋时期', '隋唐时期', '宋元时期'],
      answer: '秦汉之际',
      difficulty: 2,
      hint: '隶变是古今文字的分水岭',
    },
    {
      question: '"武"字属于六书中的哪一类？',
      options: ['会意', '形声', '象形', '指事'],
      answer: '会意',
      difficulty: 2,
      hint: '止戈为武',
    },
    {
      question: '"本"字属于六书中的哪一类？',
      options: ['指事', '象形', '形声', '会意'],
      answer: '指事',
      difficulty: 2,
      hint: '在"木"下加指事符号',
    },
    {
      question: '"《说文解字》"共收录多少汉字？',
      options: ['9353个', '10516个', '540个', '12000个'],
      answer: '9353个',
      difficulty: 2,
      hint: '分540部首',
    },
    {
      question: '金文又称为什么？',
      options: ['钟鼎文', '石鼓文', '古文', '籀文'],
      answer: '钟鼎文',
      difficulty: 1,
      hint: '铸刻在青铜器上',
    },
    {
      question: '"楷书"又称什么？',
      options: ['真书正书', '隶书', '草书', '行书'],
      answer: '真书正书',
      difficulty: 1,
      hint: '始于汉末盛行于魏晋',
    },
    {
      question: '"象形"与"指事"的主要区别是什么？',
      options: ['象形表具体物指事表抽象概念', '象形是独体指事是合体', '象形有读音指事无读音', '象形是形声的基础指事是会意的变体'],
      answer: '象形表具体物指事表抽象概念',
      difficulty: 2,
      hint: '象形"画成其物"，指事"视而可识"',
    },
    {
      question: '"亦"字在《说文》中的解释是什么？',
      options: ['人之臂亦也', '大也', '亦也', '旁也'],
      answer: '人之臂亦也',
      difficulty: 3,
      hint: '"亦"的本义是腋窝',
    },
    {
      question: '"部首"分类法是由谁创立的？',
      options: ['许慎', '郑玄', '段玉裁', '顾炎武'],
      answer: '许慎',
      difficulty: 1,
      hint: '《说文解字》首创部首分类',
    },
  ],

  exegesis: [
    {
      question: '"《尔雅》"是中国最早的一部什么书？',
      options: ['词典', '语法书', '韵书', '字书'],
      answer: '词典',
      difficulty: 1,
      hint: '《尔雅》是中国第一部词典',
    },
    {
      question: '"古今词义"的变化中，"诛"的词义发生了什么变化？',
      options: ['由责备变为杀戮', '由杀戮变为责备', '由赞美变为批评', '由批评变为赞美'],
      answer: '由责备变为杀戮',
      difficulty: 3,
      hint: '"口诛笔伐"之"诛"尚存古义',
    },
    {
      question: '"通假字"指的是什么现象？',
      options: ['音同音近字的替代', '意义相同的字', '字形相近的字', '读音完全相同的字'],
      answer: '音同音近字的替代',
      difficulty: 2,
      hint: '通假是"本有其字"的替代',
    },
    {
      question: '"《方言》"的作者是？',
      options: ['扬雄', '许慎', '刘熙', '张揖'],
      answer: '扬雄',
      difficulty: 2,
      hint: '全称《輶轩使者绝代语释别国方言》',
    },
    {
      question: '"词义的扩大"指的是什么？',
      options: ['词义从个别到一般', '词义从一般到个别', '词义从具体到抽象', '词义从抽象到具体'],
      answer: '词义从个别到一般',
      difficulty: 2,
      hint: '如"江"从专指长江变为泛指河流',
    },
    {
      question: '"本义"是指什么？',
      options: ['词的原始意义', '词的常用意义', '词的引申意义', '词的比喻意义'],
      answer: '词的原始意义',
      difficulty: 1,
      hint: '可以通过字形分析来推求',
    },
    {
      question: '"《释名》"是一部什么性质的著作？',
      options: ['声训探求事物命名由来的著作', '形训著作', '义训著作', '语法著作'],
      answer: '声训探求事物命名由来的著作',
      difficulty: 2,
      hint: '刘熙著，用音训推究事物得名之由',
    },
    {
      question: '"词义的缩小"举例中，"瓦"在古代泛指什么？',
      options: ['陶制品', '屋顶瓦片', '建筑材料', '砖块'],
      answer: '陶制品',
      difficulty: 2,
      hint: '"弄瓦之喜"之"瓦"指陶纺轮',
    },
    {
      question: '"训诂"一词中"诂"的意思是？',
      options: ['解释古代的语言', '训导', '诂问', '考证'],
      answer: '解释古代的语言',
      difficulty: 1,
      hint: '诂者古也，通古今之言',
    },
    {
      question: '"引申义"与本义的关系是？',
      options: ['由本义派生发展而来', '与本义没有关系', '与本义完全相反', '与本义读音相同'],
      answer: '由本义派生发展而来',
      difficulty: 1,
      hint: '引申是词义演变的主要方式',
    },
    {
      question: '"《经籍籑诂》"的编者是？',
      options: ['阮元', '段玉裁', '王念孙', '戴震'],
      answer: '阮元',
      difficulty: 3,
      hint: '清代乾嘉学派的重要成果',
    },
    {
      question: '"互训"是指什么？',
      options: ['用同义词相互解释', '用反义词解释', '用例句解释', '用语音解释'],
      answer: '用同义词相互解释',
      difficulty: 2,
      hint: '如《说文》"讽，诵也；诵，讽也"',
    },
  ],

  grammar: [
    {
      question: '"使动用法"中"活之"的意思是？',
      options: ['使他活下来', '他活下来了', '活得很好', '生活的方式'],
      answer: '使他活下来',
      difficulty: 1,
      hint: '"活"在这里是使动用法',
    },
    {
      question: '"意动用法"中"轻之"的意思是？',
      options: ['认为他轻/轻视他', '他变轻了', '重量很轻', '轻佻的样子'],
      answer: '认为他轻/轻视他',
      difficulty: 1,
      hint: '"轻"在这里是形容词的意动用法',
    },
    {
      question: '"宾语前置"在古代汉语否定句中的规则是？',
      options: ['代词宾语放在动词前', '名词宾语放在动词前', '宾语放在句首', '宾语放在介词前'],
      answer: '代词宾语放在动词前',
      difficulty: 2,
      hint: '如"不吾知也"即"不知吾也"',
    },
    {
      question: '下列哪项是被动句的典型标志？',
      options: ['为……所', '把……给', '被……把', '于……被'],
      answer: '为……所',
      difficulty: 1,
      hint: '"为……所"是古汉语最典型的被动句式',
    },
    {
      question: '"左右欲刃相如"中的"刃"是什么用法？',
      options: ['名词用作动词', '动词用作名词', '名词用作状语', '形容词用作动词'],
      answer: '名词用作动词',
      difficulty: 2,
      hint: '"刃"本义为刀锋，这里意为"用刀杀"',
    },
    {
      question: '"之"在"师道之不传也久矣"中的作用是？',
      options: ['取消句子独立性', '代词', '助词', '宾语前置的标志'],
      answer: '取消句子独立性',
      difficulty: 2,
      hint: '主谓之间取消句子独立性',
    },
    {
      question: '"定语后置"如"马之千里者"中"千里"是？',
      options: ['后置定语', '前置定语', '状语', '补语'],
      answer: '后置定语',
      difficulty: 2,
      hint: '"千里"是"马"的后置定语',
    },
    {
      question: '"于"在"青出于蓝"中表示什么关系？',
      options: ['从/自', '在', '比', '到'],
      answer: '从/自',
      difficulty: 1,
      hint: '出"于"蓝即"从"蓝草中提取',
    },
    {
      question: '"而"在"学而时习之"中表示什么关系？',
      options: ['顺承关系', '转折关系', '并列关系', '因果关系'],
      answer: '顺承关系',
      difficulty: 1,
      hint: '学"而后"时习之',
    },
    {
      question: '"见……于"被动句式中的"于"的作用是？',
      options: ['引出动作施事者', '表示处所', '表示比较', '表示原因'],
      answer: '引出动作施事者',
      difficulty: 2,
      hint: '如"见欺于王"之"于王"引出施事者',
    },
    {
      question: '"双宾语"结构如"赐之百金"中"之"是？',
      options: ['间接宾语', '直接宾语', '主语', '状语'],
      answer: '间接宾语',
      difficulty: 2,
      hint: '"之"指人，"百金"为直接宾语',
    },
    {
      question: '"为"在"身死人手，为天下笑"中是？',
      options: ['介词表被动', '动词', '语气词', '连词'],
      answer: '介词表被动',
      difficulty: 2,
      hint: '"为天下笑"即"被天下人耻笑"',
    },
  ],

  rhetoric: [
    {
      question: '"比喻"中带有"像""如""似"等标志词的是哪种比喻？',
      options: ['明喻', '暗喻', '借喻', '隐喻'],
      answer: '明喻',
      difficulty: 1,
      hint: '明喻的本体和喻体都出现',
    },
    {
      question: '"白发三千丈"使用了什么修辞手法？',
      options: ['夸张', '比喻', '比拟', '排比'],
      answer: '夸张',
      difficulty: 1,
      hint: '故意言过其实',
    },
    {
      question: '"对偶"的基本要求是什么？',
      options: ['字数相等结构相同', '意义相反', '读音相同', '词性不同'],
      answer: '字数相等结构相同',
      difficulty: 1,
      hint: '对偶又称对仗',
    },
    {
      question: '"借代"与"借喻"的主要区别是？',
      options: ['借代重在相关性借喻重在相似性', '借代重在相似性借喻重在相关性', '借代是比喻的一种', '没有区别'],
      answer: '借代重在相关性借喻重在相似性',
      difficulty: 2,
      hint: '借代以部分代整体或以特征代本体',
    },
    {
      question: '"秦时明月汉时关"运用了"互文"手法，其正确理解是？',
      options: ['秦汉时的明月和关塞', '秦朝的月亮汉朝的关塞', '秦朝和汉朝两个朝代', '明月照耀着汉朝的关塞'],
      answer: '秦汉时的明月和关塞',
      difficulty: 2,
      hint: '互文指前后文互相补充',
    },
    {
      question: '"通感"修辞是指什么？',
      options: ['不同感官感觉的互通', '理解上的共鸣', '共同的感觉体验', '通顺流畅的感觉'],
      answer: '不同感官感觉的互通',
      difficulty: 2,
      hint: '如"热闹""冷静"即是通感',
    },
    {
      question: '"东边日出西边雨，道是无晴却有晴"中的"晴"谐音什么？',
      options: ['情', '清', '请', '晴'],
      answer: '情',
      difficulty: 1,
      hint: '这是典型的谐音双关',
    },
    {
      question: '"比拟"分为哪两种？',
      options: ['拟人和拟物', '拟声和拟色', '拟古和拟今', '拟形和拟态'],
      answer: '拟人和拟物',
      difficulty: 1,
      hint: '比拟是把人当物写或把物当人写',
    },
    {
      question: '"廉颇老矣，尚能饭否"使用了"用典"，出自谁的词作？',
      options: ['辛弃疾', '苏轼', '李清照', '陆游'],
      answer: '辛弃疾',
      difficulty: 2,
      hint: '出自《永遇乐·京口北固亭怀古》',
    },
    {
      question: '"排比"要求至少几个结构相似的句子或短语？',
      options: ['三个或三个以上', '两个或两个以上', '四个或四个以上', '五个或五个以上'],
      answer: '三个或三个以上',
      difficulty: 1,
      hint: '排比可以增强语势',
    },
    {
      question: '"反问"句的特点是？',
      options: ['无疑而问答案在问中', '有疑而问寻求答案', '提供选项供选择', '自问自答'],
      answer: '无疑而问答案在问中',
      difficulty: 1,
      hint: '反问即激问，用疑问形式表示肯定或否定',
    },
    {
      question: '"拈连"是指什么修辞手法？',
      options: ['将适用于甲事物的词语用到乙事物上', '连续使用多个比喻', '连续使用反问', '将两种事物并列对比'],
      answer: '将适用于甲事物的词语用到乙事物上',
      difficulty: 3,
      hint: '如"我种下了希望也种下了忧愁"',
    },
  ],
};

function generateExercises(type: string) {
  const bank = exerciseBank[type] || [];
  exercises.value = [...bank].sort(() => Math.random() - 0.5).slice(0, 8);
  answers.value = {};
  results.value = {};
}

function checkAnswer(idx: number, selected: string, correct: string) {
  answers.value[idx] = selected;
  const correct_bool = selected === correct;
  results.value[idx] = correct_bool ? 'correct' : 'wrong';

  if (correct_bool) {
    gamification.addXp(10);
  }
}
</script>

<style scoped>
/* Scoped overrides if any */
</style>
