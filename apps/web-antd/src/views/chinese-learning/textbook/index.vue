<template>
  <ChinesePageLayout>
    <ChineseHero icon="📚" title="学术阅读" subtitle="文学 · 语言 · 文化 · 理论 — 学术文本深度研读" backTo="/chinese-learning" showXpBar decorativeEmoji="📚" />

      <!-- Academic Reading Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">
        <!-- Sidebar: Categories -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-gradient-to-br from-zinc-100/80 to-white dark:from-zinc-700 dark:to-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm animate-gradient-shift">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">学术方向</h3>
            <div class="space-y-2">
              <button
                v-for="(cat, catIdx) in categories"
                :key="cat"
                :class="[
                  `delay-${catIdx % 10}`,
                  'w-full text-left px-3 py-3 rounded-xl text-xs font-bold transition-all animate-fade-in-up opacity-0',
                  activeCategory === cat
                    ? 'bg-zinc-100 dark:bg-blue-500/10 text-blue-600 dark:text-zinc-500 border-l-2 border-blue-500 animate-pulse-glow'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-200',
                ]"
                @click="activeCategory = cat"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
            <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-400">
              <span class="font-medium">{{ filteredReadings.length }} 篇文献</span>
            </div>
          </div>
        </div>

        <!-- Reading Cards Grid -->
        <div class="lg:col-span-3 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(reading, idx) in filteredReadings"
              :key="reading.id"
              :class="[
                `delay-${Math.min(idx % 10, 9)}`,
                'group bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm transition-all animate-fade-in-up opacity-0 card-lift cursor-pointer hover-lift-glow',
              ]"
              @click="openReading(reading)"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-sm font-black text-gray-900 dark:text-white leading-snug flex-1">
                  {{ reading.title }}
                </h3>
              </div>

              <!-- Category Badge -->
              <span class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 dark:bg-blue-500/10 text-blue-600 dark:text-zinc-500 mb-3">
                {{ reading.category }}
              </span>

              <!-- Source -->
              <p class="text-xs text-gray-400 dark:text-zinc-400 mb-3 italic">
                {{ reading.source }}
              </p>

              <!-- Keywords Tags -->
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="kw in reading.keywords"
                  :key="kw"
                  class="px-2 py-0.5 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-lg text-[10px] font-medium"
                >
                  #{{ kw }}
                </span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredReadings.length === 0" class="text-center py-16 text-gray-400 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700">
            <div class="text-5xl mb-4">📚</div>
            <p class="text-sm">选择一个学术方向开始阅读</p>
          </div>
        </div>
      </div>

      <!-- Reading Detail Modal -->
      <Teleport to="body">
        <div
          v-if="selectedReading"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="selectedReading = null"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div class="relative bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in">
            <!-- Close button -->
            <button
              class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-sm font-bold"
              @click="selectedReading = null"
            >
              ✕
            </button>

            <!-- Modal Content -->
            <div class="p-8">
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 dark:bg-blue-500/10 text-blue-600 dark:text-zinc-500">
                  {{ selectedReading.category }}
                </span>
              </div>
              <h2 class="text-xl font-black text-gray-900 dark:text-white mb-4">{{ selectedReading.title }}</h2>
              <p class="text-xs text-gray-400 dark:text-zinc-400 mb-6 italic">来源：{{ selectedReading.source }}</p>

              <div class="bg-slate-50 dark:bg-zinc-700 rounded-2xl p-6 mb-6">
                <p class="text-sm text-gray-700 dark:text-zinc-300 leading-loose tracking-wide">
                  {{ selectedReading.content }}
                </p>
              </div>

              <!-- Keywords -->
              <div>
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">关键词</h4>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="kw in selectedReading.keywords"
                    :key="kw"
                    class="px-2.5 py-1 bg-zinc-100 dark:bg-blue-500/10 text-blue-600 dark:text-zinc-500 rounded-lg text-xs font-medium"
                  >
                    {{ kw }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
  </ChinesePageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChinesePageLayout, ChineseHero } from '../components';
import '../shared/animations.css';

const activeCategory = ref('文学专题研究');

const categories = ['文学专题研究', '语言学研究', '文化思想研究', '理论与方法'];

interface ReadingCard {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  keywords: string[];
}

const readings = ref<ReadingCard[]>([
  // === 文学专题研究 (1-4) ===
  {
    id: 'r1',
    title: '《诗经》的比兴传统及其文化内涵',
    content: '《诗经》开创了"比兴"这一中国诗歌最核心的艺术表现手法。"比"是以彼物比此物，如《关雎》以雎鸠和鸣比喻君子淑女之配；"兴"是先言他物以引起所咏之辞，如《桃夭》以桃花的盛开来烘托新娘的青春美丽。比兴手法的运用使《诗经》中的自然物象获得了超越其本身的象征意义——桃符婚姻，鱼兆丰产，薪喻婚姻——形成了一套影响中国文学数千年的意象符号系统。后世文人不断阐释和丰富比兴传统，使其成为中国诗学的核心范畴。',
    category: '文学专题研究',
    source: '《诗经》研究  ·  古代文论',
    keywords: ['诗经', '比兴', '意象', '象征'],
  },
  {
    id: 'r2',
    title: '唐诗的意象系统与审美范式',
    content: '唐代诗歌形成了高度成熟的意象系统与审美范式。诗人在长期创作实践中，使特定物象与特定情感之间建立了稳定的对应关系：明月寄相思，折柳表惜别，落日寓沧桑，流水叹逝川，秋蝉感零落，大雁传乡信。在意象经营的基础上，唐诗形成了"兴象"与"意境"的核心审美范畴，主张情景交融、虚实相生。王昌龄《诗格》首标"意境"之说，皎然《诗式》倡"取境"之法，至司空图《二十四诗品》则系统阐述了雄浑、冲淡、纤秾等二十四种审美风格。',
    category: '文学专题研究',
    source: '唐代文学  ·  诗学研究',
    keywords: ['唐诗', '意象', '意境', '审美范式'],
  },
  {
    id: 'r3',
    title: '宋词的音乐性与文体特征',
    content: '宋词起源于隋唐燕乐，是一种与音乐紧密结合的诗歌形式。每首词皆有词牌，词牌规定了词的句式长短、平仄押韵和情感基调——《满江红》激越慷慨，《雨霖铃》凄婉缠绵，《念奴娇》雄浑豪放。与格律严整的唐诗相比，词的长短句形式更富于变化，更便于表达细腻幽微的情感。宋代词人不断探索词体艺术的独特性：柳永发展了慢词长调，苏轼以诗为词拓展了词的题材，周邦彦精于音律格调，辛弃疾以文为词融会经史，使词成为与诗并峙的文学高峰。',
    category: '文学专题研究',
    source: '宋代文学  ·  词学研究',
    keywords: ['宋词', '词牌', '音乐性', '文体'],
  },
  {
    id: 'r4',
    title: '鲁迅小说中的知识分子形象',
    content: '鲁迅的小说塑造了一系列具有深刻时代内涵的知识分子形象，构成了一部中国现代知识分子的精神史诗。《狂人日记》中的"狂人"在疯癫表象下揭示了封建礼教"吃人"的本质，是中国文学史上第一个现代主义式的反抗者形象。《孔乙己》中的落魄读书人在科举制度的废墟上徒劳地维持着最后的尊严，他的悲剧不仅是个人的，更是整个旧时代读书人命运的缩影。《伤逝》中的涓生和子君则展示了新式知识分子在追求个性解放过程中的彷徨与无力。这些形象凝聚了鲁迅对中国知识分子命运最深沉的思考。',
    category: '文学专题研究',
    source: '中国现代文学  ·  鲁迅研究',
    keywords: ['鲁迅', '知识分子', '狂人日记', '现代文学'],
  },

  // === 语言学研究 (5-8) ===
  {
    id: 'r5',
    title: '现代汉语的欧化语法现象',
    content: '五四运动以来，随着大量西方著作的翻译引进，现代汉语的语法结构发生了显著变化，这一现象被称为"欧化语法"。具体表现为：长定语的大量使用打破了汉语"短则明"的传统表达习惯；被动句式中的"被"字使用范围从"不幸义"扩展到"中性义"和"受益义"；"当……时""关于……""对于……"等关联结构逐渐增多；复数标记"们"的使用更加普遍；人称代词前可加修饰语，如"勤劳勇敢的中国人民"。这些变化丰富和精密了现代汉语的表达能力，但过度的欧化也引发了关于汉语纯洁性的讨论。',
    category: '语言学研究',
    source: '现代汉语  ·  语法学',
    keywords: ['欧化语法', '五四', '翻译', '语言接触'],
  },
  {
    id: 'r6',
    title: '古代汉语的使动用法与意动用法',
    content: '使动用法和意动用法是古代汉语中两种重要的特殊动宾关系，体现了古汉语灵活而经济的表达特点。使动用法是主语使宾语发出某种动作或具有某种性质，动词和宾语之间含有"使……为……"的关系。例如"项伯杀人，臣活之"中的"活之"意为"使之活"；"春风又绿江南岸"中的"绿"意为"使……变绿"。意动用法则是主语主观上认为宾语具有某种性质，含有"以……为……"或"认为……"的关系。例如"孔子登东山而小鲁"中的"小鲁"意为"认为鲁国变小"。掌握这两种用法是研读古文的基本功。',
    category: '语言学研究',
    source: '古代汉语  ·  语法学',
    keywords: ['使动用法', '意动用法', '古代汉语', '语法'],
  },
  {
    id: 'r7',
    title: '方言与共同语的辩证关系',
    content: '汉语方言与普通话之间存在着既对立又统一的辩证关系。普通话以北京语音为标准音、北方方言为基础方言，作为国家通用语言在公共领域占据主导地位，承担着沟通交流和社会整合的功能。但各地方言并非可有可无的附属品——它们保存了中古汉语的声调系统（如粤语保留入声）、古汉语词汇和语法特征，是汉语史的活化石。近年来方言保护意识的觉醒促使学界重新思考二者的关系：不是非此即彼的对立，而是互补共生的双轨并行。方言传承地方文化，普通话服务全国交流，二者各安其位方为健康的语言生态。',
    category: '语言学研究',
    source: '社会语言学  ·  方言学',
    keywords: ['方言', '普通话', '语言生态', '语言保护'],
  },
  {
    id: 'r8',
    title: '汉字的构形理据与文化意蕴',
    content: '汉字不是任意的符号系统，其构形具有深厚的理据性，每个汉字都蕴含着先民观察世界的方式和文化观念。许慎《说文解字》归纳的六书体系揭示了汉字构造的内在规律：象形字描摹物形（日、月、山、水），指事字标记抽象概念（上、下、本、末），会意字组合意义（休、信、武、男），形声字兼表音义占汉字总数80%以上。以"家"字为例，从宀从豕，反映了古代定居农业生活中家屋与家畜的密切关系。汉字的构形理据使其成为理解中华文化精神的活化石。',
    category: '语言学研究',
    source: '文字学  ·  《说文解字》研究',
    keywords: ['汉字', '六书', '构形', '说文解字'],
  },

  // === 文化思想研究 (9-12) ===
  {
    id: 'r9',
    title: '儒家的仁爱思想及其现代意义',
    content: '"仁"是孔子思想的核心范畴，《论语》中孔子对"仁"的阐释构成了儒家伦理体系的基石。"仁"的基本内涵是"爱人"，孔子还以"己所不欲勿施于人"和"己欲立而立人，己欲达而达人"进一步阐发了践行仁道的方法。儒家的爱不是无差别的兼爱，而是以血缘亲情为基础、由近及远层层推扩的差序之爱——亲亲而仁民，仁民而爱物。在当代社会，儒家仁爱思想为人际关系疏离、社会信任缺失等问题提供了有益的思想资源，"己所不欲勿施于人"更被视为全球伦理的黄金法则。',
    category: '文化思想研究',
    source: '儒家哲学  ·  中国伦理思想',
    keywords: ['儒家', '仁', '爱人', '忠恕之道'],
  },
  {
    id: 'r10',
    title: '道家的自然观与生态美学',
    content: '道家哲学以"道法自然"为核心命题，主张人应当效法天地自然的运行法则。"自然"在老子和庄子思想中不仅指外在于人的自然界，更指事物本然的存在方式和状态——"道之尊，德之贵，夫莫之命而常自然"。庄子"天地与我并生，而万物与我为一"的思想表达了一种人与宇宙相融通的精神境界，批判了人类中心主义的局限。在生态危机日益严峻的今天，道家顺应自然、节制物欲、尊重生命的思想为生态美学和环境保护提供了深刻的哲学启示，也成为当代生态批评的重要理论资源。',
    category: '文化思想研究',
    source: '道家哲学  ·  生态美学',
    keywords: ['道家', '自然', '生态', '天人合一'],
  },
  {
    id: 'r11',
    title: '佛学与中国文学的因缘',
    content: '佛教自汉代传入中国后，与中国文学发生了深远的因缘互动。佛经翻译不仅带来了大量新词汇（如"因果""觉悟""刹那""因缘"），也促进了中国叙事文学的发展——佛经中的譬喻故事和"变文"形式直接影响了唐代传奇、宋元话本和章回小说的叙事结构。禅宗思想深刻影响了唐宋以来的诗歌创作，王维诗中的空灵禅意、苏轼诗中的超脱旷达、王安石晚年的淡泊诗风无不浸润着佛学智慧。佛教的"空"观、"意境"说和"妙悟"说也极大丰富了中国古代美学的理论内涵。',
    category: '文化思想研究',
    source: '佛学  ·  中国文学',
    keywords: ['佛教', '禅宗', '变文', '意境'],
  },
  {
    id: 'r12',
    title: '晚清思想启蒙与中国文学转型',
    content: '晚清时期，随着西方列强的入侵和新思想的传播，中国文学经历了一场深刻的变革。梁启超提出"小说界革命"，将小说从"小道"提升为"文学之最上乘"，强调其开启民智、改良社会的启蒙功能。严复的翻译引进了西方的进化论和社会政治学说，林纾的翻译小说让中国读者接触到了西方文学经典。白话报刊的兴起为文学语言的变革奠定了基础，谴责小说、政治小说的繁荣反映了文学与现实政治的紧密结合。这场文学转型标志着中国文学从古典向现代形态的历史转折，为五四新文学运动铺平了道路。',
    category: '文化思想研究',
    source: '晚清文学  ·  近代思想史',
    keywords: ['晚清', '文学转型', '小说界革命', '启蒙'],
  },

  // === 理论与方法 (13-16) ===
  {
    id: 'r13',
    title: '文学批评的多元视角',
    content: '当代文学批评呈现出多元视角并存的理论格局，不同批评方法各有其关注的焦点和阐释路径。形式主义批评关注"文学性"，将研究重心放在语言的陌生化效果上；结构主义批评探寻文本的深层结构，追求共时性的模式分析；精神分析批评挖掘文本中的无意识内容和欲望投射；马克思主义批评将文学置于生产关系和意识形态的语境中考察；女性主义批评揭示文学创作和批评中的性别政治；后殖民主义批评反思东方与西方之间的文化权力关系。对于中国文学研究而言，融合中西视角、取长补短，能够获得更为深入的阐释。',
    category: '理论与方法',
    source: '文学理论  ·  批评方法',
    keywords: ['文学批评', '形式主义', '结构主义', '后殖民'],
  },
  {
    id: 'r14',
    title: '叙事学理论与中国小说分析',
    content: '叙事学为分析中国小说的艺术成就提供了精细的理论工具。法国学者热奈特在《叙事话语》中通过区分"故事""叙事"和"叙述"三个层面，系统构建了分析叙事时间、叙事语式和叙事语态的理论框架。运用这一框架考察《红楼梦》可以发现，曹雪芹通过多重叙述视角的自由转换——时而全知叙事，时而限知叙事，时而以人物视角呈现——实现了对人物心理的多维度刻画。叙事学方法同样适用于分析鲁迅小说的叙事反讽、沈从文小说的抒情叙事以及莫言小说的复调叙事，揭示中国小说叙事的独特贡献。',
    category: '理论与方法',
    source: '叙事学  ·  小说研究',
    keywords: ['叙事学', '热奈特', '叙述视角', '红楼梦'],
  },
  {
    id: 'r15',
    title: '接受美学与读者反应批评',
    content: '接受美学由德国学者姚斯和伊瑟尔于20世纪60年代创立，将文学研究的重心从作者和文本转向读者。姚斯提出"期待视野"概念，指读者在阅读前已经具备的经验背景和审美框架，文学作品的接受是期待视野与文本结构之间对话与融合的过程——同一作品在不同时代被不同读者理解，正是期待视野变化的结果。伊瑟尔则提出了"隐含的读者"和"空白"理论，强调文本中未言明的部分需要读者主动参与填充。接受美学为理解中国古典诗歌的含蓄之美、留白之妙提供了新的阐释路径，也启发我们重新思考经典的形成机制。',
    category: '理论与方法',
    source: '接受美学  ·  读者反应批评',
    keywords: ['接受美学', '期待视野', '隐含的读者', '空白'],
  },
  {
    id: 'r16',
    title: '跨文化比较文学的研究方法',
    content: '跨文化比较文学研究为中国文学走向世界学术舞台提供了有力的方法论支撑。比较文学的研究路径主要包括：影响研究——追溯不同文学传统之间的实际接触和相互影响，如佛经翻译对中国文学的影响、中国古典诗歌对美国意象派诗歌的影响；平行研究——在没有直接联系的文学现象之间寻找共通规律和类型学上的相似性，如汤显祖与莎士比亚的悲剧意识比较；跨文化研究——聚焦文学如何在不同的文化语境中传播、接受和变异。在全球化时代，比较文学方法对于阐发中国文学的普世价值和独特贡献具有不可替代的意义。',
    category: '理论与方法',
    source: '比较文学  ·  跨文化研究',
    keywords: ['比较文学', '影响研究', '平行研究', '跨文化'],
  },
]);

const selectedReading = ref<AcademicReading | null>(null);

const filteredReadings = computed(() => {
  return readings.value.filter((r) => r.category === activeCategory.value);
});

function openReading(reading: AcademicReading) {
  selectedReading.value = reading;
}
</script>

