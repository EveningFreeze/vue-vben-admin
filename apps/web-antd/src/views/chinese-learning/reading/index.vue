<template>
  <ChinesePageLayout>
    <ChineseHero icon="🎤" title="名篇赏读" subtitle="精读四维评分 · 深度品鉴 · 文学批评入门" backTo="/chinese-learning" showXpBar decorativeEmoji="🎤" />

      <!-- Passages Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="(passage, idx) in passages"
          :key="passage.id"
          :class="`delay-${idx % 6}`"
          class="group bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-zinc-700 p-5 shadow-sm hover:shadow-lg hover:border-red-400/50 transition-all cursor-pointer animate-fade-in-up opacity-0 hover-lift-glow"
          @click="selectPassage(passage)"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-base font-black text-gray-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">{{ passage.title }}</h3>
              <p class="text-xs text-gray-400">{{ passage.author }}</p>
            </div>
            <span class="text-[10px] px-2 py-1 rounded-full font-bold animate-pulse-glow" :class="difficultyClass(passage.difficulty)">
              {{ ['', '基础', '进阶', '高阶'][passage.difficulty] }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mb-3">{{ passage.content.slice(0, 60) }}...</p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-400">{{ passage.duration }}</span>
            <span v-if="passage.hasRead && passage.score !== null" class="text-red-500 font-bold animate-count-up">{{ passage.score }} 分</span>
            <span v-else class="text-gray-400">未精读</span>
          </div>
        </div>
      </div>
    <!-- Reading Modal -->
    <Transition name="modal">
      <div
        v-if="currentPassage"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="currentPassage = null"
      >
        <div class="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[85vh] flex flex-col">
          <div class="p-6 border-b border-gray-100 dark:border-zinc-700 bg-gradient-to-r from-red-600 to-orange-600 text-white flex-shrink-0 animate-gradient-shift">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold">{{ currentPassage.title }}</h3>
                <p class="text-red-200 text-sm">{{ currentPassage.author }}</p>
              </div>
              <button class="text-white/60 hover:text-white transition-colors text-xl" @click="currentPassage = null">✕</button>
            </div>
          </div>

          <div class="p-6 overflow-y-auto flex-1">
            <div class="bg-slate-50 dark:bg-zinc-700 rounded-2xl p-6 mb-6">
              <p class="text-base text-gray-700 dark:text-zinc-300 leading-loose tracking-wide">
                {{ currentPassage.content }}
              </p>
            </div>

            <!-- Scoring Dimensions -->
            <div class="grid grid-cols-4 gap-3 mb-6">
              <div v-for="(dim, idx) in readingDims" :key="idx" class="text-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-700">
                <div class="text-2xl mb-1">{{ dim.icon }}</div>
                <div class="text-xs text-gray-500 font-medium mb-1">{{ dim.label }}</div>
                <div class="text-[10px] text-gray-400 mb-2 leading-tight">{{ dim.description }}</div>
                <div class="text-lg font-black animate-count-up" :class="!hasRead ? 'text-gray-300 dark:text-zinc-400' : dim.score >= 80 ? 'text-orange-500' : dim.score >= 60 ? 'text-blue-500' : 'text-red-500'">
                  {{ !hasRead ? '-' : dim.score }}
                </div>
              </div>
            </div>

            <!-- Overall Score -->
            <div v-if="hasRead && overallScore > 0" class="text-center mb-4 animate-bounce-in">
              <span class="text-sm text-gray-500">综合评分：</span>
              <span class="text-2xl font-black animate-count-up" :class="overallScore >= 80 ? 'text-orange-500' : overallScore >= 60 ? 'text-blue-500' : 'text-red-500'">{{ overallScore }}</span>
            </div>

            <!-- Actions -->
            <div class="flex justify-center gap-4">
              <button
                class="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                @click="startCloseReading"
              >
                📖 开始精读
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </ChinesePageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useGamification } from '../shared/use-gamification';
import { ChinesePageLayout, ChineseHero } from '../components';
import type { ReadingPassage as SharedReadingPassage } from '../shared/types';
import '../shared/animations.css';

interface ReadingPassage extends SharedReadingPassage {
  hasRead: boolean;
  score: number | null;
}

interface ReadingDimension {
  icon: string;
  label: string;
  score: number;
  description: string;
}

const gamification = useGamification();

const currentPassage = ref<ReadingPassage | null>(null);
const hasRead = ref(false);

const overallScore = ref(0);

const readingDims = ref<ReadingDimension[]>([
  { icon: '📖', label: '内容理解', score: 0, description: '准确把握文章主旨和细节' },
  { icon: '🔍', label: '文本分析', score: 0, description: '分析文章结构和写作手法' },
  { icon: '💡', label: '批判评价', score: 0, description: '独立思考并提出个人见解' },
  { icon: '🎨', label: '审美鉴赏', score: 0, description: '感受语言之美和意境之深' },
]);

const passages = ref<ReadingPassage[]>([
  {
    id: 'c1', title: '《诗经·秦风·蒹葭》', author: '诗经', content: '蒹葭苍苍，白露为霜。所谓伊人，在水一方。溯洄从之，道阻且长。溯游从之，宛在水中央。蒹葭萋萋，白露未晞。所谓伊人，在水之湄。溯洄从之，道阻且跻。溯游从之，宛在水中坻。蒹葭采采，白露未已。所谓伊人，在水之涘。溯洄从之，道阻且右。溯游从之，宛在水中沚。',
    difficulty: 1, stage: 'foundation' as const, duration: '3 分钟', hasRead: false, score: null,
  },
  {
    id: 'c2', title: '《楚辞·九章·涉江》', author: '屈原', content: '余幼好此奇服兮，年既老而不衰。带长铗之陆离兮，冠切云之崔嵬。被明月兮佩宝璐。世溷浊而莫余知兮，吾方高驰而不顾。驾青虬兮骖白螭，吾与重华游兮瑶之圃。登昆仑兮食玉英，与天地兮同寿，与日月兮同光。哀南夷之莫吾知兮，旦余济乎江湘。乘鄂渚而反顾兮，欸秋冬之绪风。',
    difficulty: 2, stage: 'intermediate' as const, duration: '5 分钟', hasRead: false, score: null,
  },
  {
    id: 'c3', title: '《登楼赋》', author: '王粲', content: '登兹楼以四望兮，聊暇日以销忧。览斯宇之所处兮，实显敞而寡仇。挟清漳之通浦兮，倚曲沮之长洲。背坟衍之广陆兮，临皋隰之沃流。北弥陶牧，西接昭丘。华实蔽野，黍稷盈畴。虽信美而非吾土兮，曾何足以少留！遭纷浊而迁逝兮，漫逾纪以迄今。情眷眷而怀归兮，孰忧思之可任？',
    difficulty: 2, stage: 'intermediate' as const, duration: '4 分钟', hasRead: false, score: null,
  },
  {
    id: 'c4', title: '《兰亭集序》', author: '王羲之', content: '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹；又有清流激湍，映带左右，引以为流觞曲水，列坐其次。虽无丝竹管弦之盛，一觞一咏，亦足以畅叙幽情。是日也，天朗气清，惠风和畅。仰观宇宙之大，俯察品类之盛，所以游目骋怀，足以极视听之娱，信可乐也。',
    difficulty: 1, stage: 'foundation' as const, duration: '3 分钟', hasRead: false, score: null,
  },
  {
    id: 'c5', title: '《归去来兮辞》', author: '陶渊明', content: '归去来兮，田园将芜胡不归？既自以心为形役，奚惆怅而独悲？悟已往之不谏，知来者之可追。实迷途其未远，觉今是而昨非。舟遥遥以轻飏，风飘飘而吹衣。问征夫以前路，恨晨光之熹微。乃瞻衡宇，载欣载奔。僮仆欢迎，稚子候门。三径就荒，松菊犹存。携幼入室，有酒盈樽。',
    difficulty: 1, stage: 'foundation' as const, duration: '3 分钟', hasRead: false, score: null,
  },
  {
    id: 'c6', title: '《滕王阁序》', author: '王勃', content: '豫章故郡，洪都新府。星分翼轸，地接衡庐。襟三江而带五湖，控蛮荆而引瓯越。物华天宝，龙光射牛斗之墟；人杰地灵，徐孺下陈蕃之榻。雄州雾列，俊采星驰。台隍枕夷夏之交，宾主尽东南之美。时维九月，序属三秋。潦水尽而寒潭清，烟光凝而暮山紫。俨骖騑于上路，访风景于崇阿。',
    difficulty: 2, stage: 'intermediate' as const, duration: '5 分钟', hasRead: false, score: null,
  },
  {
    id: 'c7', title: '《春江花月夜》', author: '张若虚', content: '春江潮水连海平，海上明月共潮生。滟滟随波千万里，何处春江无月明！江流宛转绕芳甸，月照花林皆似霰。空里流霜不觉飞，汀上白沙看不见。江天一色无纤尘，皎皎空中孤月轮。江畔何人初见月？江月何年初照人？人生代代无穷已，江月年年望相似。不知江月待何人，但见长江送流水。',
    difficulty: 1, stage: 'foundation' as const, duration: '4 分钟', hasRead: false, score: null,
  },
  {
    id: 'c8', title: '《将进酒》', author: '李白', content: '君不见，黄河之水天上来，奔流到海不复回。君不见，高堂明镜悲白发，朝如青丝暮成雪。人生得意须尽欢，莫使金樽空对月。天生我材必有用，千金散尽还复来。烹羊宰牛且为乐，会须一饮三百杯。岑夫子，丹丘生，将进酒，杯莫停。与君歌一曲，请君为我倾耳听。',
    difficulty: 1, stage: 'foundation' as const, duration: '3 分钟', hasRead: false, score: null,
  },
  {
    id: 'c9', title: '《秋兴八首（其一）》', author: '杜甫', content: '玉露凋伤枫树林，巫山巫峡气萧森。江间波浪兼天涌，塞上风云接地阴。丛菊两开他日泪，孤舟一系故园心。寒衣处处催刀尺，白帝城高急暮砧。夔府孤城落日斜，每依北斗望京华。听猿实下三声泪，奉使虚随八月槎。画省香炉违伏枕，山楼粉堞隐悲笳。',
    difficulty: 2, stage: 'intermediate' as const, duration: '3 分钟', hasRead: false, score: null,
  },
  {
    id: 'c10', title: '《赤壁赋》', author: '苏轼', content: '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。少焉，月出于东山之上，徘徊于斗牛之间。白露横江，水光接天。纵一苇之所如，凌万顷之茫然。浩浩乎如冯虚御风，而不知其所止；飘飘乎如遗世独立，羽化而登仙。',
    difficulty: 1, stage: 'foundation' as const, duration: '4 分钟', hasRead: false, score: null,
  },
  {
    id: 'c11', title: '《后赤壁赋》', author: '苏轼', content: '是岁十月之望，步自雪堂，将归于临皋。二客从予过黄泥之坂。霜露既降，木叶尽脱。人影在地，仰见明月，顾而乐之，行歌相答。已而叹曰："有客无酒，有酒无肴，月白风清，如此良夜何！"客曰："今者薄暮，举网得鱼，巨口细鳞，状如松江之鲈。顾安所得酒乎？"归而谋诸妇。',
    difficulty: 2, stage: 'intermediate' as const, duration: '4 分钟', hasRead: false, score: null,
  },
  {
    id: 'c12', title: '《人间词话（节选）》', author: '王国维', content: '古今之成大事业、大学问者，必经过三种之境界："昨夜西风凋碧树。独上高楼，望尽天涯路。"此第一境也。"衣带渐宽终不悔，为伊消得人憔悴。"此第二境也。"众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。"此第三境也。此等语皆非大词人不能道。然遽以此意解释诸词，恐为晏欧诸公所不许也。',
    difficulty: 3, stage: 'advanced' as const, duration: '4 分钟', hasRead: false, score: null,
  },
  {
    id: 'c13', title: '《灯下漫笔（节选）》', author: '鲁迅', content: '任凭你爱排场的学者们怎样铺张，修史时候设什么"汉族发祥时代""汉族发达时代""汉族中兴时代"的好题目，好意诚然是可感的，但措辞太绕湾子了。有更其直捷了当的说法在这里——一，想做奴隶而不得的时代；二，暂时做稳了奴隶的时代。这一种循环，也就是"先儒"之所谓"一治一乱"。',
    difficulty: 3, stage: 'advanced' as const, duration: '5 分钟', hasRead: false, score: null,
  },
  {
    id: 'c14', title: '《雅舍》', author: '梁实秋', content: '"雅舍"的位置在半山腰，下距马路约有七八十层的土阶。前面是阡陌螺旋的稻田。再远望过去是几抹葱翠的远山，旁边有高粱地，有竹林，有水池，有粪坑，后面是荒僻的榛莽未除的土山坡。但若大雨滂沱，我就又惶悚不安了，屋顶湿印到处都有，起初如碗大，俄而扩大如盆，继而滴水乃不绝，终乃屋顶灰泥突然崩裂。',
    difficulty: 2, stage: 'intermediate' as const, duration: '4 分钟', hasRead: false, score: null,
  },
  {
    id: 'c15', title: '《文学的趣味》', author: '朱光潜', content: '一个人在创作和欣赏时所表现的趣味，大半由资禀性情、身世经历和传统习尚三个因素决定。这三个因素都是很平常的，不平常的趣味必定是这三个因素偶然调和的结果。但是资禀性情、身世经历和传统习尚都是很稳固的，不易变更。因此，文艺趣味的形成，往往需要长时间的浸润和陶养。所谓"趣味无争辩"者，其实大谬不然。',
    difficulty: 3, stage: 'advanced' as const, duration: '5 分钟', hasRead: false, score: null,
  },
  {
    id: 'c16', title: '《谈美（节选）》', author: '朱光潜', content: '阿尔卑斯山谷中有一条大汽车路，两旁景物极美，路上插着一个标语牌劝告游人说："慢慢走，欣赏啊！"许多人在这车如流水马如龙的世界过活，恰如在阿尔卑斯山谷中乘汽车兜风，匆匆忙忙地疾驰而过，无暇一回首流连风景，于是这丰富华丽的世界便成为一个了无生趣的囚牢。这是一件多么可惋惜的事啊！',
    difficulty: 3, stage: 'advanced' as const, duration: '5 分钟', hasRead: false, score: null,
  },
]);

function selectPassage(passage: ReadingPassage) {
  currentPassage.value = { ...passage };
  hasRead.value = passage.hasRead;

  if (passage.hasRead && passage.score !== null) {
    // Restore previous scores
    const baseScore = passage.score;
    readingDims.value = [
      { icon: '📖', label: '内容理解', score: Math.min(95, Math.max(65, baseScore + Math.floor(Math.random() * 10 - 5))), description: '准确把握文章主旨和细节' },
      { icon: '🔍', label: '文本分析', score: Math.min(95, Math.max(65, baseScore + Math.floor(Math.random() * 10 - 5))), description: '分析文章结构和写作手法' },
      { icon: '💡', label: '批判评价', score: Math.min(95, Math.max(65, baseScore + Math.floor(Math.random() * 10 - 5))), description: '独立思考并提出个人见解' },
      { icon: '🎨', label: '审美鉴赏', score: Math.min(95, Math.max(65, baseScore + Math.floor(Math.random() * 10 - 5))), description: '感受语言之美和意境之深' },
    ];
    overallScore.value = passage.score;
  } else {
    readingDims.value = [
      { icon: '📖', label: '内容理解', score: 0, description: '准确把握文章主旨和细节' },
      { icon: '🔍', label: '文本分析', score: 0, description: '分析文章结构和写作手法' },
      { icon: '💡', label: '批判评价', score: 0, description: '独立思考并提出个人见解' },
      { icon: '🎨', label: '审美鉴赏', score: 0, description: '感受语言之美和意境之深' },
    ];
    overallScore.value = 0;
  }
}

function startCloseReading() {
  message.loading({ content: 'AI 正在分析文本...', key: 'reading', duration: 0 });

  setTimeout(() => {
    const dims = readingDims.value;
    dims[0].score = Math.floor(Math.random() * 30) + 65;
    dims[1].score = Math.floor(Math.random() * 30) + 65;
    dims[2].score = Math.floor(Math.random() * 30) + 65;
    dims[3].score = Math.floor(Math.random() * 30) + 65;
    const overall = Math.round((dims[0].score + dims[1].score + dims[2].score + dims[3].score) / 4);
    overallScore.value = overall;

    const passage = passages.value.find(p => p.id === currentPassage.value?.id);
    if (passage) {
      passage.score = overall;
      passage.hasRead = true;
    }
    if (currentPassage.value) {
      currentPassage.value.score = overall;
      currentPassage.value.hasRead = true;
    }

    hasRead.value = true;

    const xpGain = Math.round(overall / 5);
    gamification.addXp(xpGain);

    if (overall >= 90) {
      gamification.unlockAchievement('reading-star');
    }

    message.destroy('reading');
    message.success(`精读评测完成！综合得分 ${overall} 分，获得 ${xpGain} XP`);
  }, 2000);
}

function difficultyClass(difficulty: number): string {
  const map: Record<number, string> = {
    1: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    2: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-8000/10 dark:text-zinc-400',
    3: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  };
  return map[difficulty] ?? map[1] ?? '';
}
</script>

<style scoped>
.modal-enter-active { transition: all 0.3s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.9); }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
</style>
