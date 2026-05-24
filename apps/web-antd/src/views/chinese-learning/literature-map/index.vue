<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { ChinesePageLayout, ChineseHero, ChineseCard, ChineseGlassPanel } from '../components';
import { useGamification } from '../shared/use-gamification';

const { addXp } = useGamification();
const activeTab = ref<'map' | 'timeline' | 'compare' | 'feihualing' | 'mingju'>('map');

// ─── Knowledge Graph ──────────────────────
interface LitNode { id: string; name: string; era: string; type: string; children?: string[] }
const litGraph = ref<Record<string, LitNode>>({
  libai: { id: 'libai', name: '李白', era: '盛唐', type: '诗人', children: ['shengtang', 'langman', 'jiangjinjiu', 'shudaonan'] },
  dufu: { id: 'dufu', name: '杜甫', era: '盛唐', type: '诗人', children: ['shengtang', 'xianshi', 'chunwang', 'denggao'] },
  sushi: { id: 'sushi', name: '苏轼', era: '北宋', type: '词人', children: ['songci', 'haofang', 'shuidiaotou', 'qianchibi'] },
  shengtang: { id: 'shengtang', name: '盛唐', era: '唐', type: '时代', children: ['tangsong', 'bianliang'] },
  langman: { id: 'langman', name: '浪漫主义', era: '', type: '流派', children: ['chuci', 'libai'] },
  xianshi: { id: 'xianshi', name: '现实主义', era: '', type: '流派', children: ['shijing', 'dufu'] },
  haofang: { id: 'haofang', name: '豪放派', era: '北宋', type: '流派', children: ['sushi', 'xinqiji'] },
  jiangjinjiu: { id: 'jiangjinjiu', name: '将进酒', era: '盛唐', type: '作品' },
  shudaonan: { id: 'shudaonan', name: '蜀道难', era: '盛唐', type: '作品' },
  chunwang: { id: 'chunwang', name: '春望', era: '盛唐', type: '作品' },
  denghao: { id: 'denggao', name: '登高', era: '盛唐', type: '作品' },
  shuidiaotou: { id: 'shuidiaotou', name: '水调歌头', era: '北宋', type: '作品' },
  qianchibi: { id: 'qianchibi', name: '前赤壁赋', era: '北宋', type: '作品' },
  tangsong: { id: 'tangsong', name: '唐宋文学', era: '', type: '时期' },
  bianliang: { id: 'bianliang', name: '边塞诗派', era: '唐', type: '流派' },
  chuci: { id: 'chuci', name: '楚辞', era: '先秦', type: '作品' },
  shijing: { id: 'shijing', name: '诗经', era: '先秦', type: '作品' },
  xinqiji: { id: 'xinqiji', name: '辛弃疾', era: '南宋', type: '词人' },
});

const selectedNode = ref<LitNode | null>(null);
const expandedNodes = ref<Set<string>>(new Set(['libai']));

function selectNode(id: string) {
  const node = litGraph.value[id];
  if (node) {
    selectedNode.value = node;
    expandedNodes.value.add(id);
  }
}

function nodeColor(type: string): string {
  const map: Record<string, string> = { '诗人': '#f59e0b', '词人': '#8b5cf6', '时代': '#3b82f6', '流派': '#22c55e', '作品': '#ef4444', '时期': '#06b6d4' };
  return map[type] || '#a1a1aa';
}

const rootNodes = computed(() => Object.values(litGraph.value).filter(n => ['诗人', '词人'].includes(n.type)));

// ─── Timeline ─────────────────────────────
interface EraData { name: string; period: string; figures: string[]; works: string[]; schools: string[] }
const timeline: EraData[] = [
  { name: '先秦', period: '前21世纪-前221年', figures: ['屈原', '宋玉', '孔子', '孟子', '庄子', '老子', '荀子', '韩非子'], works: ['诗经', '楚辞', '论语', '道德经', '庄子', '孟子'], schools: ['儒家', '道家', '法家', '墨家'] },
  { name: '汉', period: '前206-220', figures: ['司马迁', '司马相如', '班固', '扬雄', '张衡'], works: ['史记', '汉书', '上林赋', '子虚赋', '两都赋', '二京赋'], schools: ['汉赋', '史传文学'] },
  { name: '魏晋', period: '220-589', figures: ['曹植', '陶渊明', '阮籍', '嵇康', '谢灵运', '王羲之'], works: ['洛神赋', '归园田居', '桃花源记', '兰亭集序'], schools: ['建安文学', '山水诗', '田园诗', '玄言诗'] },
  { name: '唐', period: '618-907', figures: ['李白', '杜甫', '白居易', '王维', '李商隐', '杜牧', '韩愈', '柳宗元'], works: ['将进酒', '登高', '琵琶行', '滕王阁序'], schools: ['山水田园', '边塞诗派', '浪漫主义', '古文运动'] },
  { name: '宋', period: '960-1279', figures: ['苏轼', '辛弃疾', '李清照', '欧阳修', '王安石', '陆游', '柳永'], works: ['水调歌头', '念奴娇', '声声慢', '醉翁亭记'], schools: ['豪放派', '婉约派', '江西诗派'] },
  { name: '元', period: '1271-1368', figures: ['关汉卿', '马致远', '白朴', '王实甫', '郑光祖'], works: ['窦娥冤', '西厢记', '汉宫秋', '梧桐雨'], schools: ['元曲四大家', '杂剧', '散曲'] },
  { name: '明', period: '1368-1644', figures: ['罗贯中', '施耐庵', '吴承恩', '汤显祖', '冯梦龙'], works: ['三国演义', '水浒传', '西游记', '牡丹亭'], schools: ['四大奇书', '拟话本', '传奇戏曲'] },
  { name: '清', period: '1644-1912', figures: ['曹雪芹', '蒲松龄', '吴敬梓', '纳兰性德', '龚自珍'], works: ['红楼梦', '聊斋志异', '儒林外史'], schools: ['桐城派', '性灵派'] },
  { name: '现代', period: '1912至今', figures: ['鲁迅', '郭沫若', '茅盾', '巴金', '老舍', '沈从文', '钱钟书', '张爱玲'], works: ['呐喊', '彷徨', '家', '骆驼祥子', '围城'], schools: ['新文学运动', '左翼文学', '京派', '海派'] },
];

const selectedEra = ref<EraData | null>(null);

// ─── Text Comparison ──────────────────────
interface ComparisonText { id: string; title: string; original: string; modern: string; english: string }
const comparisons: ComparisonText[] = [
  { id: 'lunyu1', title: '论语·学而', original: '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"', modern: '孔子说："学了知识然后按时温习，不也很愉快吗？有志同道合的朋友从远方来，不也很快乐吗？别人不了解我却不生气，不也是有德行的君子吗？"', english: 'The Master said: "Is it not a pleasure to learn and constantly practice what is learned? Is it not a delight to have friends coming from afar? Is he not a gentleman who feels no discontent though others may take no note of him?"' },
  { id: 'jiangjinjiu', title: '将进酒（节选）', original: '君不见，黄河之水天上来，奔流到海不复回。君不见，高堂明镜悲白发，朝如青丝暮成雪。', modern: '你可见黄河水从天上流下来，波涛滚滚直奔东海永不回头。你可见高堂明镜中苍苍白发，早上满头青丝晚上就如白雪。', english: 'Do you not see the Yellow River come from the sky, Rushing into the sea and ne\'er come back? Do you not see the mirrors bright in chambers high, Grieve o\'er the snow-white hair though once silk-black?' },
  { id: 'shuidiaotou', title: '水调歌头（节选）', original: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。', modern: '明月从什么时候开始出现的？我端起酒杯遥问苍天。不知道在天上的宫殿，今晚是何年何月。', english: 'How long will the full moon appear? Wine cup in hand, I ask the sky. I do not know what time of the year, It would be tonight in the palace on high.' },
];

const selectedComparison = ref<ComparisonText>(comparisons[0]);

// ─── 飞花令 ──────────────────────────────
const feihuaKeyword = ref('');
const feihuaInput = ref('');
const feihuaHistory = ref<string[]>([]);
const feihuaScore = ref(0);
const feihuaFeedback = ref('');
const feihuaKeywords = ['月', '花', '风', '雪', '山', '水', '云', '春', '秋', '人'];

const poetryDB: Record<string, string[]> = {
  '月': ['海上生明月，天涯共此时', '床前明月光，疑是地上霜', '月落乌啼霜满天，江枫渔火对愁眠', '举头望明月，低头思故乡', '露从今夜白，月是故乡明', '春花秋月何时了，往事知多少', '明月几时有，把酒问青天'],
  '花': ['感时花溅泪，恨别鸟惊心', '忽如一夜春风来，千树万树梨花开', '人面不知何处去，桃花依旧笑春风', '夜来风雨声，花落知多少', '待到重阳日，还来就菊花'],
  '风': ['春风又绿江南岸，明月何时照我还', '夜来风雨声，花落知多少', '忽如一夜春风来，千树万树梨花开', '随风潜入夜，润物细无声'],
  '雪': ['孤舟蓑笠翁，独钓寒江雪', '忽如一夜春风来，千树万树梨花开', '窗含西岭千秋雪，门泊东吴万里船'],
  '山': ['会当凌绝顶，一览众山小', '空山新雨后，天气晚来秋', '千山鸟飞绝，万径人踪灭', '白日依山尽，黄河入海流'],
  '水': ['桃花潭水深千尺，不及汪伦送我情', '日出江花红胜火，春来江水绿如蓝', '问君能有几多愁，恰似一江春水向东流'],
  '云': ['远上寒山石径斜，白云生处有人家', '朝辞白帝彩云间，千里江陵一日还', '黄河远上白云间，一片孤城万仞山'],
  '春': ['春眠不觉晓，处处闻啼鸟', '等闲识得东风面，万紫千红总是春', '不知细叶谁裁出，二月春风似剪刀'],
  '秋': ['空山新雨后，天气晚来秋', '停车坐爱枫林晚，霜叶红于二月花', '自古逢秋悲寂寥，我言秋日胜春朝'],
  '人': ['人面不知何处去，桃花依旧笑春风', '但愿人长久，千里共婵娟', '人生自古谁无死，留取丹心照汗青'],
};

function startFeihua() {
  const kw = feihuaKeywords[Math.floor(Math.random() * feihuaKeywords.length)];
  feihuaKeyword.value = kw;
  feihuaHistory.value = [];
  feihuaScore.value = 0;
  feihuaFeedback.value = '';
}

function submitFeihua() {
  const input = feihuaInput.value.trim();
  if (!input || !feihuaKeyword.value) return;

  const key = feihuaKeyword.value;
  if (!input.includes(key)) {
    feihuaFeedback.value = `❌ 诗句中不包含"${key}"字！`;
    return;
  }

  if (feihuaHistory.value.includes(input)) {
    feihuaFeedback.value = '⚠️ 此诗句已被使用过！';
    return;
  }

  const validList = poetryDB[key] || [];
  if (validList.includes(input)) {
    feihuaHistory.value.unshift(input);
    feihuaScore.value += 10;
    addXp(5);
    feihuaFeedback.value = '✅ 正确！+10分 +5XP';
  } else {
    feihuaFeedback.value = '🤔 无法验证此诗句，请尝试经典名句';
  }
  feihuaInput.value = '';
}

const feihuaHint = computed(() => {
  if (!feihuaKeyword.value) return '';
  const list = poetryDB[feihuaKeyword.value] || [];
  return list.filter(p => !feihuaHistory.value.includes(p)).slice(0, 3);
});

// ─── 名句挑战 ─────────────────────────────
interface QuoteChallenge { quote: string; answer: { author: string; source: string }; options: string[] }
const quoteChallenges: QuoteChallenge[] = [
  { quote: '路漫漫其修远兮，吾将上下而求索', answer: { author: '屈原', source: '离骚' }, options: ['屈原·离骚', '司马迁·史记', '陶渊明·归去来兮辞', '李白·行路难'] },
  { quote: '先天下之忧而忧，后天下之乐而乐', answer: { author: '范仲淹', source: '岳阳楼记' }, options: ['范仲淹·岳阳楼记', '欧阳修·醉翁亭记', '苏轼·赤壁赋', '韩愈·师说'] },
  { quote: '落霞与孤鹜齐飞，秋水共长天一色', answer: { author: '王勃', source: '滕王阁序' }, options: ['王勃·滕王阁序', '李白·登金陵凤凰台', '杜甫·登高', '崔颢·黄鹤楼'] },
  { quote: '人生自古谁无死，留取丹心照汗青', answer: { author: '文天祥', source: '过零丁洋' }, options: ['文天祥·过零丁洋', '陆游·示儿', '辛弃疾·永遇乐', '岳飞·满江红'] },
  { quote: '山重水复疑无路，柳暗花明又一村', answer: { author: '陆游', source: '游山西村' }, options: ['陆游·游山西村', '李白·望庐山瀑布', '杜甫·春望', '孟浩然·过故人庄'] },
  { quote: '纸上得来终觉浅，绝知此事要躬行', answer: { author: '陆游', source: '冬夜读书示子聿' }, options: ['陆游·冬夜读书示子聿', '朱熹·观书有感', '韩愈·进学解', '苏轼·和董传留别'] },
  { quote: '天行健，君子以自强不息', answer: { author: '周文王', source: '周易' }, options: ['周文王·周易', '孔子·论语', '孟子·孟子', '老子·道德经'] },
  { quote: '富贵不能淫，贫贱不能移，威武不能屈', answer: { author: '孟子', source: '孟子·滕文公下' }, options: ['孟子·滕文公下', '荀子·劝学', '孔子·论语', '韩非子·五蠹'] },
];

const quoteIndex = ref(0);
const quoteScore = ref(0);
const quoteTotal = ref(0);
const quoteResult = ref('');
const quoteStreak = ref(0);

const currentQuoteChallenge = computed(() => quoteChallenges[quoteIndex.value % quoteChallenges.length]);

function answerQuote(option: string) {
  quoteTotal.value++;
  if (option === currentQuoteChallenge.value.answer.author + '·' + currentQuoteChallenge.value.answer.source) {
    quoteResult.value = '✅ 正确！';
    quoteScore.value += 10;
    quoteStreak.value++;
    addXp(5);
  } else {
    quoteResult.value = `❌ 正确答案是：${currentQuoteChallenge.value.answer.author}·${currentQuoteChallenge.value.answer.source}`;
    quoteStreak.value = 0;
  }
  setTimeout(() => { quoteIndex.value++; quoteResult.value = ''; }, 1500);
}

onMounted(() => { startFeihua(); });
</script>

<template>
  <ChinesePageLayout>
    <ChineseHero icon="🗺️" title="文学知识图谱" subtitle="可视化中国文学脉络 · 交互式知识探索" decorative-emoji="📚" />

    <!-- Tab Bar -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="tab in [
        { key: 'map', label: '🗺️ 知识图谱' },
        { key: 'timeline', label: '📅 文学时间轴' },
        { key: 'compare', label: '📖 文本对读' },
        { key: 'feihualing', label: '🌸 飞花令' },
        { key: 'mingju', label: '🏆 名句挑战' },
      ]" :key="tab.key" class="zh-tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <!-- Knowledge Graph Tab -->
    <div v-if="activeTab === 'map'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <ChineseCard>
          <h3 class="text-lg font-semibold text-white mb-4">文学关系图谱</h3>
          <div class="graph-container p-4 rounded-xl" style="background: #0a0a0f; min-height: 400px;">
            <div class="flex flex-wrap gap-3 mb-6">
              <div v-for="node in rootNodes" :key="node.id" class="graph-node cursor-pointer" :style="{ borderColor: nodeColor(node.type) }" @click="selectNode(node.id)">
                <span class="text-sm font-semibold" :style="{ color: nodeColor(node.type) }">{{ node.name }}</span>
                <span class="text-xs text-zinc-500">{{ node.type }}</span>
              </div>
            </div>
            <div v-if="selectedNode" class="mt-4 p-4 rounded-xl animate-fade-in-up" style="background: #18181b;">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-0.5 rounded text-xs font-medium" :style="{ background: nodeColor(selectedNode.type) + '22', color: nodeColor(selectedNode.type) }">{{ selectedNode.type }}</span>
                <span class="font-bold text-white">{{ selectedNode.name }}</span>
                <span class="text-xs text-zinc-500">{{ selectedNode.era }}</span>
              </div>
              <div v-if="selectedNode.children?.length" class="flex flex-wrap gap-2">
                <span class="text-xs text-zinc-400 mr-1">关联：</span>
                <span v-for="cid in selectedNode.children" :key="cid" class="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity" :style="{ background: '#27272a', color: nodeColor(litGraph[cid]?.type || '') }" @click="selectNode(cid)">
                  {{ litGraph[cid]?.name || cid }}
                </span>
              </div>
            </div>
            <div v-else class="text-center py-12 text-zinc-500">点击上方节点开始探索</div>
          </div>
        </ChineseCard>
      </div>
      <ChineseCard>
        <h3 class="text-lg font-semibold text-white mb-4">图例</h3>
        <div class="space-y-2">
          <div v-for="(color, type) in { '诗人/词人': '#f59e0b', '时代': '#3b82f6', '流派': '#22c55e', '作品': '#ef4444', '时期': '#06b6d4' }" :key="type" class="flex items-center gap-2 text-sm text-zinc-300">
            <span class="w-3 h-3 rounded-full" :style="{ background: color }" /> {{ type }}
          </div>
        </div>
        <div class="mt-4 text-xs text-zinc-500">点击节点查看关联关系，支持逐层展开探索</div>
      </ChineseCard>
    </div>

    <!-- Timeline Tab -->
    <div v-if="activeTab === 'timeline'" class="space-y-4">
      <div v-for="era in timeline" :key="era.name" class="en-card chinese-card-hover p-5 cursor-pointer" @click="selectedEra = selectedEra?.name === era.name ? null : era">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style="background: #8b5cf618; color: #a78bfa;">{{ era.name }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-base font-bold text-white">{{ era.name }}</h4>
              <span class="text-xs text-zinc-500">{{ era.period }}</span>
            </div>
            <p class="text-sm text-zinc-400">代表人物：{{ era.figures.slice(0, 5).join('、') }}{{ era.figures.length > 5 ? '等' : '' }}</p>
          </div>
        </div>
        <div v-if="selectedEra?.name === era.name" class="mt-4 pt-4 border-t border-zinc-800 animate-fade-in-up">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-zinc-500 mb-2">代表人物</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="f in era.figures" :key="f" class="px-2 py-0.5 rounded text-xs" style="background: #f59e0b15; color: #f59e0b;">{{ f }}</span>
              </div>
            </div>
            <div>
              <p class="text-xs text-zinc-500 mb-2">代表作品</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="w in era.works" :key="w" class="px-2 py-0.5 rounded text-xs" style="background: #ef444415; color: #f87171;">{{ w }}</span>
              </div>
            </div>
            <div>
              <p class="text-xs text-zinc-500 mb-2">文学流派</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="s in era.schools" :key="s" class="px-2 py-0.5 rounded text-xs" style="background: #22c55e15; color: #4ade80;">{{ s }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Comparison Tab -->
    <div v-if="activeTab === 'compare'">
      <div class="flex gap-2 mb-4 flex-wrap">
        <button v-for="c in comparisons" :key="c.id" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" :class="selectedComparison.id === c.id ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'" @click="selectedComparison = c">
          {{ c.title }}
        </button>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="chinese-glass p-5 rounded-2xl">
          <h4 class="text-sm font-semibold text-white mb-3">📜 原文</h4>
          <p class="text-base leading-relaxed text-zinc-200">{{ selectedComparison.original }}</p>
        </div>
        <div class="chinese-glass p-5 rounded-2xl">
          <h4 class="text-sm font-semibold text-white mb-3">📝 现代译文</h4>
          <p class="text-sm leading-relaxed text-zinc-300">{{ selectedComparison.modern }}</p>
        </div>
        <div class="chinese-glass p-5 rounded-2xl">
          <h4 class="text-sm font-semibold text-white mb-3">🌍 English</h4>
          <p class="text-sm leading-relaxed text-zinc-300 italic">{{ selectedComparison.english }}</p>
        </div>
      </div>
    </div>

    <!-- 飞花令 Tab -->
    <div v-if="activeTab === 'feihualing'" class="max-w-2xl mx-auto space-y-6">
      <ChineseCard>
        <div class="text-center py-4">
          <h3 class="text-xl font-bold text-white mb-2">🌸 飞花令</h3>
          <p class="text-sm text-zinc-400 mb-4">输入包含 "<span class="text-purple-400 font-bold text-lg">{{ feihuaKeyword || '...' }}</span>" 字的诗句</p>
          <div class="text-3xl font-black mb-4" :style="{ color: '#a78bfa' }">{{ feihuaScore }} 分</div>
          <div class="flex gap-2 mb-4">
            <input v-model="feihuaInput" class="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-purple-500 outline-none" placeholder="输入含关键字的诗句..." @keyup.enter="submitFeihua" />
            <button class="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition" @click="submitFeihua">提交</button>
          </div>
          <p v-if="feihuaFeedback" class="text-sm mb-3">{{ feihuaFeedback }}</p>
          <div v-if="feihuaHint.length" class="text-left p-3 rounded-xl" style="background: #18181b;">
            <p class="text-xs text-zinc-500 mb-1">💡 提示：</p>
            <p v-for="h in feihuaHint" :key="h" class="text-xs text-zinc-400">"{{ h }}"</p>
          </div>
          <button class="mt-4 px-4 py-2 rounded-lg text-sm text-zinc-400 bg-zinc-800 hover:text-white transition" @click="startFeihua">🔄 换个字</button>
        </div>
      </ChineseCard>
      <div v-if="feihuaHistory.length" class="chinese-glass p-4 rounded-2xl">
        <h4 class="text-sm font-semibold text-white mb-3">📜 历史记录</h4>
        <div v-for="(h, i) in feihuaHistory" :key="i" class="text-sm text-zinc-300 py-1 border-b border-zinc-800 last:border-0">
          {{ i + 1 }}. {{ h }}
        </div>
      </div>
    </div>

    <!-- 名句挑战 Tab -->
    <div v-if="activeTab === 'mingju'" class="max-w-2xl mx-auto">
      <ChineseCard>
        <div class="text-center py-4">
          <h3 class="text-xl font-bold text-white mb-1">🏆 名句挑战</h3>
          <div class="flex justify-center gap-6 mt-2 mb-6 text-sm">
            <span class="text-zinc-400">得分：<b class="text-green-400">{{ quoteScore }}</b></span>
            <span class="text-zinc-400">正确率：<b class="text-blue-400">{{ quoteTotal ? Math.round((quoteStreak > 0 ? (quoteScore / 10) / quoteTotal * 100 : 50)) : 0 }}%</b></span>
          </div>
          <div class="chinese-glass p-6 rounded-2xl mb-4">
            <p class="text-lg font-bold text-white mb-1">「{{ currentQuoteChallenge.quote }}」</p>
            <p class="text-xs text-zinc-500">这句名言的作者和出处是？</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button v-for="opt in currentQuoteChallenge.options" :key="opt" class="p-3 rounded-xl text-sm text-left transition-all hover:border-purple-500" style="background: #18181b; border: 1px solid #27272a; color: #d4d4d8;" @click="answerQuote(opt)">
              {{ opt }}
            </button>
          </div>
          <p v-if="quoteResult" class="mt-4 text-sm font-medium">{{ quoteResult }}</p>
        </div>
      </ChineseCard>
    </div>
  </ChinesePageLayout>
</template>

<style scoped>
.zh-tab-btn {
  padding: 0.5rem 1.25rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500;
  background: #18181b; border: 1px solid #27272a; color: #a1a1aa; cursor: pointer; transition: all 0.2s;
}
.zh-tab-btn:hover { color: #fff; border-color: #3f3f46; }
.zh-tab-btn.active { background: #8b5cf618; border-color: #8b5cf6; color: #a78bfa; }
.graph-node {
  padding: 0.5rem 1rem; border-radius: 0.75rem; background: #18181b;
  border: 1px solid #27272a; transition: all 0.2s;
}
.graph-node:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(139, 92, 246, 0.15); }
</style>
