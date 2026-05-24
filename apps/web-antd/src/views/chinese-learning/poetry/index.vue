<template>
  <ChinesePageLayout showBlob2>
    <ChineseHero
      icon="📜"
      title="诗词鉴赏"
      subtitle="经典诗词深度赏析 · 知人论世 · 鉴赏批评"
      backTo="/chinese-learning"
      showXpBar
      decorativeEmoji="📜"
    />

      <!-- Decorative floating characters -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <span class="absolute top-12 left-8 text-4xl opacity-15 animate-float-char" style="animation-delay: 0s">诗</span>
        <span class="absolute top-24 right-16 text-3xl opacity-15 animate-float-char" style="animation-delay: 2s">词</span>
        <span class="absolute bottom-48 left-24 text-5xl opacity-10 animate-float-char" style="animation-delay: 4s">韵</span>
        <span class="absolute bottom-32 right-12 text-2xl opacity-15 animate-float-char" style="animation-delay: 1.5s">雅</span>
        <span class="absolute top-1/2 left-1/3 text-xl opacity-10 animate-float-char" style="animation-delay: 3s">赋</span>
      </div>

      <!-- Decorative emojis with wobble -->
      <div class="flex justify-center gap-6 text-2xl opacity-25 pointer-events-none select-none" aria-hidden="true">
        <span class="animate-wobble-slow">📜</span>
        <span class="animate-wobble-slow" style="animation-delay: 0.8s">🌸</span>
        <span class="animate-wobble-slow" style="animation-delay: 1.6s">🏮</span>
        <span class="animate-wobble-slow" style="animation-delay: 2.4s">🎋</span>
      </div>

      <!-- Stage tabs -->
      <div class="flex gap-2">
        <button
          v-for="stage in stages"
          :key="stage.key"
          :class="[
            'px-5 py-2.5 rounded-xl text-xs font-bold transition-all',
            activeStage === stage.key
              ? 'bg-gradient-to-r from-chinese-600 to-chinese-gold-500 text-white shadow-lg animate-pulse-glow'
              : 'bg-white dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-chinese-50 dark:hover:bg-zinc-200 border border-gray-200 dark:border-zinc-700',
          ]"
          @click="activeStage = stage.key"
        >
          {{ stage.label }}
        </button>
      </div>

      <!-- Poem Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
        <div
          v-for="(poem, idx) in filteredPoems"
          :key="poem.id"
          :data-delay="idx % 9"
          class="group bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-zinc-700 p-5 shadow-sm hover:shadow-lg hover:border-chinese-400/50 transition-all cursor-pointer animate-entrance hover-lift-glow"
          @click="selectPoem(poem)"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-base font-black text-gray-900 dark:text-zinc-100 group-hover:text-chinese-600 transition-colors">{{ poem.title }}</h3>
              <p class="text-xs text-gray-400 font-medium">{{ poem.dynasty }} · {{ poem.author }}</p>
            </div>
            <span class="text-[10px] px-2 py-1 rounded-full font-bold" :class="difficultyClass(poem.difficulty)">
              {{ ['', '入门', '进阶', '高阶'][poem.difficulty] }}
            </span>
          </div>
          <div class="text-sm text-gray-600 dark:text-zinc-400 italic leading-relaxed line-clamp-2 mb-3">
            「{{ poem.content.slice(0, 2).join('，') }}」
          </div>
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span v-if="poem.mastered" class="text-orange-500 font-bold animate-bounce-in">✅ 已掌握</span>
              <span v-else class="text-gray-400">{{ poem.content.length }} 句</span>
            </div>
            <span class="text-chinese-gold-500 font-bold">{{ ['', '★☆☆', '★★☆', '★★★'][poem.difficulty] }}</span>
          </div>
        </div>
      </div>

    <!-- Poem Detail Modal -->
    <Transition name="modal">
      <div
        v-if="currentPoem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="currentPoem = null"
      >
        <div class="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[85vh] flex flex-col">
          <div class="p-6 border-b border-gray-100 dark:border-zinc-700 bg-gradient-to-r from-chinese-600 to-chinese-gold-500 text-white flex-shrink-0 animate-gradient-shift">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold">{{ currentPoem.title }}</h3>
                <p class="text-yellow-200 text-sm">{{ currentPoem.dynasty }} · {{ currentPoem.author }}</p>
              </div>
              <button class="text-white/60 hover:text-white transition-colors text-xl" @click="currentPoem = null">✕</button>
            </div>
          </div>
          <div class="p-8 overflow-y-auto flex-1">
            <div class="text-center space-y-3 mb-6">
              <p
                v-for="(line, idx) in currentPoem.content"
                :key="idx"
                :class="[
                  'text-lg font-bold leading-loose',
                  idx % 2 === 0 ? 'text-gray-800 dark:text-zinc-100' : 'text-gray-600 dark:text-zinc-400',
                ]"
              >
                {{ practiceMode ? line.replace(/[一-龥]/g, '____') : line }}
              </p>
            </div>

            <!-- Annotations -->
            <div v-if="currentPoem.annotations.length" class="space-y-2 mb-6">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">注释</h4>
              <div v-for="(note, idx) in currentPoem.annotations" :key="idx" class="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <span class="text-chinese-gold-500 mt-0.5">·</span>
                <span>{{ note }}</span>
              </div>
            </div>

            <!-- Translation -->
            <div v-if="currentPoem.translation" class="bg-chinese-50 dark:bg-chinese-500/10 rounded-xl p-4 mb-6">
              <h4 class="text-xs font-bold text-chinese-600 dark:text-chinese-400 uppercase tracking-wider mb-2">译文</h4>
              <p class="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{{ currentPoem.translation }}</p>
            </div>

            <!-- Actions -->
            <div class="flex justify-center gap-4">
              <button
                class="px-6 py-3 bg-gradient-to-r from-chinese-600 to-chinese-gold-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                @click="markMastered"
              >
                {{ currentPoem.mastered ? '✅ 已掌握' : '📖 标记为已背诵' }}
              </button>
              <button
                class="px-6 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                @click="practiceMode = !practiceMode"
              >
                {{ practiceMode ? '📖 显示原文' : '✍️ 填空模式' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </ChinesePageLayout>
</template>

<script setup lang="ts">
import '../shared/animations.css';
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useGamification } from '../shared/use-gamification';
import { ChinesePageLayout, ChineseHero } from '../components';
import type { Poetry } from '../shared/types';

const gamification = useGamification();

const activeStage = ref<'foundation' | 'intermediate' | 'advanced'>('foundation');
const currentPoem = ref<Poetry | null>(null);
const practiceMode = ref(false);

const stages = [
  { key: 'foundation' as const, label: '📗 基础篇 (Foundation)' },
  { key: 'intermediate' as const, label: '📘 进阶篇 (Intermediate)' },
  { key: 'advanced' as const, label: '📕 高阶篇 (Advanced)' },
];

const poems = ref([
  // Foundation (基础篇) - 经典必读
  { id: 'f1', title: '关雎', author: '佚名', dynasty: '诗经·周南', content: ['关关雎鸠', '在河之洲', '窈窕淑女', '君子好逑', '参差荇菜', '左右流之', '窈窕淑女', '寤寐求之'], translation: '关关鸣叫的雎鸠鸟，在河中的沙洲上。文静美丽的好姑娘，是君子的好配偶。长短不齐的荇菜，左右捞取。文静美丽的好姑娘，日日夜夜都想追求她。', annotations: ['关关：水鸟鸣叫声', '雎鸠：一种水鸟', '窈窕：体态美好的样子', '逑：配偶', '寤寐：醒着和睡着'], difficulty: 1, stage: 'foundation', mastered: false },
  { id: 'f2', title: '离骚（节选）', author: '屈原', dynasty: '战国·楚', content: ['长太息以掩涕兮', '哀民生之多艰', '余虽好修姱以鞿羁兮', '謇朝谇而夕替', '既替余以蕙纕兮', '又申之以揽茝', '亦余心之所善兮', '虽九死其犹未悔'], translation: '我长叹一声擦干眼泪，哀叹人民的生活多么艰难。我虽然崇尚美德并约束自己，早上进谏晚上就被贬黜。既因佩用香蕙而被贬黜，又因采集白芷而加罪。只要是我心中所崇尚的，即使死多次也绝不后悔。', annotations: ['太息：叹息', '修姱：修洁美好', '鞿羁：约束', '谇：进谏', '替：废弃', '九死：多次死亡'], difficulty: 1, stage: 'foundation', mastered: false },
  { id: 'f3', title: '短歌行', author: '曹操', dynasty: '东汉', content: ['对酒当歌', '人生几何', '譬如朝露', '去日苦多', '慨当以慷', '忧思难忘', '何以解忧', '唯有杜康', '青青子衿', '悠悠我心', '但为君故', '沉吟至今'], translation: '面对美酒应当高歌，人生能有几何？就像早晨的露水，逝去的日子太多了。歌声慷慨激昂，心中的忧思难以忘怀。用什么来排解忧愁呢？只有美酒杜康。那穿着青衣的学子啊，使我心中长久思慕。只是为了你们的缘故，我沉吟直到如今。', annotations: ['几何：多少', '去日：逝去的日子', '杜康：代指酒', '子衿：指贤才'], difficulty: 1, stage: 'foundation', mastered: false },
  { id: 'f4', title: '归园田居（其一）', author: '陶渊明', dynasty: '东晋', content: ['少无适俗韵', '性本爱丘山', '误落尘网中', '一去三十年', '羁鸟恋旧林', '池鱼思故渊', '开荒南野际', '守拙归园田'], translation: '从小就没有适应世俗的性情，天性本来就喜爱山水。误落入世俗的罗网中，一去就是三十年。被束缚的鸟儿眷恋旧日山林，池中的鱼儿思念原来的深渊。在南边荒野开荒种地，固守愚拙回归田园。', annotations: ['适俗：适应世俗', '尘网：世俗官场', '羁鸟：被束缚的鸟', '守拙：坚守质朴本性'], difficulty: 1, stage: 'foundation', mastered: false },
  { id: 'f5', title: '春江花月夜', author: '张若虚', dynasty: '唐', content: ['春江潮水连海平', '海上明月共潮生', '滟滟随波千万里', '何处春江无月明', '江流宛转绕芳甸', '月照花林皆似霰', '空里流霜不觉飞', '汀上白沙看不见'], translation: '春天的江潮水势浩荡与海相连，海上一轮明月随着潮水一同升起。波光粼粼随波闪耀千万里，哪一处春江不在明月照耀之下。江流曲折绕过花草丛生的原野，月光照耀着花林仿佛撒下了雪珠。空中月光如流霜使人不觉其飞舞，洲上的白沙也与月色融为一体难以分辨。', annotations: ['滟滟：波光闪动的样子', '芳甸：花草丛生的原野', '霰：雪珠', '汀：水边平地'], difficulty: 2, stage: 'foundation', mastered: false },
  { id: 'f6', title: '将进酒', author: '李白', dynasty: '唐', content: ['君不见黄河之水天上来', '奔流到海不复回', '君不见高堂明镜悲白发', '朝如青丝暮成雪', '人生得意须尽欢', '莫使金樽空对月', '天生我材必有用', '千金散尽还复来'], translation: '你不见那黄河之水仿佛从天而降，奔流到海不再回还。你不见高堂明镜中悲叹白发，早晨还是青丝傍晚已成白雪。人生得意之时就该尽情欢乐，不要让金杯空对明月。上天生我这般人才必有用处，千金散尽了还会再回来。', annotations: ['将进酒：请饮酒', '金樽：精美的酒杯', '天生我材：上天生我的才能'], difficulty: 2, stage: 'foundation', mastered: false },
  { id: 'f7', title: '登高', author: '杜甫', dynasty: '唐', content: ['风急天高猿啸哀', '渚清沙白鸟飞回', '无边落木萧萧下', '不尽长江滚滚来', '万里悲秋常作客', '百年多病独登台', '艰难苦恨繁霜鬓', '潦倒新停浊酒杯'], translation: '秋风劲吹天空高远猿猴悲啸，水清沙白的河洲上鸟儿盘旋。无边无际的落叶纷纷飘落，没有尽头的长江滚滚而来。万里漂泊悲秋常在他乡作客，一生多病独自登上高台。艰难困苦愁恨使两鬓如霜，潦倒失意刚刚停下了酒杯。', annotations: ['渚：水中小洲', '落木：落叶', '百年：一生', '潦倒：困顿失意'], difficulty: 2, stage: 'foundation', mastered: false },
  { id: 'f8', title: '琵琶行（节选）', author: '白居易', dynasty: '唐', content: ['千呼万唤始出来', '犹抱琵琶半遮面', '转轴拨弦三两声', '未成曲调先有情', '弦弦掩抑声声思', '似诉平生不得志', '低眉信手续续弹', '说尽心中无限事'], translation: '千呼万唤她才走出来，还抱着琵琶半遮着脸。转轴拨弦三两声，还没弹成曲调就已充满情感。每一弦都压抑低沉每一声都带着愁思，好像在诉说自己一生的不得志。低着眉头随手继续弹奏，说尽了心中无限的心事。', annotations: ['琵琶行：白居易长篇叙事诗', '掩抑：低沉压抑的乐声', '信手：随手'], difficulty: 2, stage: 'foundation', mastered: false },
  { id: 'f9', title: '锦瑟', author: '李商隐', dynasty: '唐', content: ['锦瑟无端五十弦', '一弦一柱思华年', '庄生晓梦迷蝴蝶', '望帝春心托杜鹃', '沧海月明珠有泪', '蓝田日暖玉生烟', '此情可待成追忆', '只是当时已惘然'], translation: '华美的瑟为何无端有五十根弦，一弦一柱都令人追忆逝去的青春。庄周梦蝶迷离难辨，望帝化为杜鹃寄托春心。沧海月下鲛人泣珠，蓝田暖日宝玉生烟。此情岂待今日才追忆，在当时就已令人迷惘。', annotations: ['无端：没来由', '庄生：庄周梦蝶典故', '望帝：蜀王杜宇化为杜鹃', '蓝田：以产玉闻名'], difficulty: 2, stage: 'foundation', mastered: false },
  { id: 'f10', title: '水调歌头·明月几时有', author: '苏轼', dynasty: '宋', content: ['明月几时有', '把酒问青天', '不知天上宫阙', '今夕是何年', '我欲乘风归去', '又恐琼楼玉宇', '高处不胜寒', '起舞弄清影', '何似在人间'], translation: '明月什么时候开始有的？我端起酒杯询问青天。不知道天上的宫殿，今晚是哪一年。我想乘风回到天上去，又担心那美玉砌成的楼宇，高处太过寒冷。在月下起舞与自己的影子嬉戏，哪里像在人间呢！', annotations: ['水调歌头：词牌名', '琼楼玉宇：指月中宫殿', '不胜寒：太寒冷难以忍受'], difficulty: 1, stage: 'foundation', mastered: false },
  { id: 'f11', title: '声声慢', author: '李清照', dynasty: '宋', content: ['寻寻觅觅', '冷冷清清', '凄凄惨惨戚戚', '乍暖还寒时候', '最难将息', '三杯两盏淡酒', '怎敌他晚来风急', '雁过也', '正伤心', '却是旧时相识'], translation: '四处寻觅，冷冷清清，凄惨悲戚。乍暖还寒的时节，最难调养休息。三两杯淡酒，怎抵得过晚来寒风猛烈？大雁飞过，正伤心时，却发现是旧日相识。', annotations: ['将息：调养休息', '敌：抵挡', '旧时相识：曾经见过的大雁'], difficulty: 2, stage: 'foundation', mastered: false },
  { id: 'f12', title: '天净沙·秋思', author: '马致远', dynasty: '元', content: ['枯藤老树昏鸦', '小桥流水人家', '古道西风瘦马', '夕阳西下', '断肠人在天涯'], translation: '枯藤老树栖息着黄昏的乌鸦，小桥流水旁有几户人家。古道西风中一匹瘦马，夕阳缓缓西沉，断肠人漂泊在天涯。', annotations: ['天净沙：曲牌名', '昏鸦：黄昏时的乌鸦', '断肠人：漂泊天涯的游子'], difficulty: 1, stage: 'foundation', mastered: false },
  // Intermediate (进阶篇) - 比较分析与文学批评
  { id: 'i1', title: '采薇（节选）', author: '佚名', dynasty: '诗经·小雅', content: ['昔我往矣', '杨柳依依', '今我来思', '雨雪霏霏', '行道迟迟', '载渴载饥', '我心伤悲', '莫知我哀'], translation: '昔日我离开时，杨柳依依随风飘拂。如今我归来时，大雪纷纷扬扬。道路漫长走得迟缓，又渴又饥。我的心中充满伤悲，没有人知道我的哀痛。', annotations: ['依依：柳条随风飘拂的样子', '来思：归来', '霏霏：大雪纷飞的样子', '迟迟：缓慢'], difficulty: 2, stage: 'intermediate', mastered: false },
  { id: 'i2', title: '蒹葭', author: '佚名', dynasty: '诗经·秦风', content: ['蒹葭苍苍', '白露为霜', '所谓伊人', '在水一方', '溯洄从之', '道阻且长', '溯游从之', '宛在水中央'], translation: '芦苇长得茂盛苍翠，清晨的露水凝结成霜。我心中思念的那个人，就在河水的那一边。逆流而上去寻找，道路险阻又漫长。顺流而下去寻找，仿佛就在水的中央。', annotations: ['蒹葭：芦苇', '伊人：那个人', '溯洄：逆流而上', '溯游：顺流而下'], difficulty: 2, stage: 'intermediate', mastered: false },
  { id: 'i3', title: '陌上桑（节选）', author: '佚名', dynasty: '汉乐府', content: ['日出东南隅', '照我秦氏楼', '秦氏有好女', '自名为罗敷', '罗敷善蚕桑', '采桑城南隅', '青丝为笼系', '桂枝为笼钩'], translation: '太阳从东南方升起，照到我们秦家的小楼。秦家有位美丽的女子，她的名字叫罗敷。罗敷擅长养蚕采桑，到城南角去采桑。用青丝做篮子上的系绳，用桂枝做篮子上的提柄。', annotations: ['隅：角落', '罗敷：古代美女名', '笼系：篮子的提绳'], difficulty: 2, stage: 'intermediate', mastered: false },
  { id: 'i4', title: '梦游天姥吟留别（节选）', author: '李白', dynasty: '唐', content: ['海客谈瀛洲', '烟涛微茫信难求', '越人语天姥', '云霞明灭或可睹', '天姥连天向天横', '势拔五岳掩赤城', '天台四万八千丈', '对此欲倒东南倾'], translation: '海上来客谈论瀛洲仙山，烟波浩渺实在难以寻访。越地人说起天姥山，云霞明灭中或许还能看见。天姥山与天相连横亘天际，山势高过五岳遮蔽了赤城。天台山虽高四万八千丈，对着天姥山也像要向东南倾倒。', annotations: ['瀛洲：传说仙山', '天姥：山名，在今浙江', '拔：超出', '五岳：泰山、华山等'], difficulty: 3, stage: 'intermediate', mastered: false },
  { id: 'i5', title: '兵车行（节选）', author: '杜甫', dynasty: '唐', content: ['车辚辚', '马萧萧', '行人弓箭各在腰', '爷娘妻子走相送', '尘埃不见咸阳桥', '牵衣顿足拦道哭', '哭声直上干云霄'], translation: '战车隆隆作响，战马萧萧嘶鸣，出征的士兵把弓箭佩在腰间。爹娘妻子儿女跑来送行，扬起的尘埃遮蔽了咸阳桥。拉着衣襟顿足拦路痛哭，哭声直冲云霄。', annotations: ['辚辚：车行声', '萧萧：马鸣声', '干：冲上'], difficulty: 3, stage: 'intermediate', mastered: false },
  { id: 'i6', title: '念奴娇·赤壁怀古', author: '苏轼', dynasty: '宋', content: ['大江东去', '浪淘尽', '千古风流人物', '故垒西边', '人道是', '三国周郎赤壁', '乱石穿空', '惊涛拍岸', '卷起千堆雪'], translation: '长江向东流去，大浪淘尽了千古以来的英雄人物。在西边的旧营垒旁，人们说那就是三国时周瑜作战的赤壁。陡峭的石壁直刺天空，惊人的巨浪拍打着江岸，卷起千堆雪白的浪花。', annotations: ['念奴娇：词牌名', '周郎：指周瑜', '故垒：旧时的营垒'], difficulty: 3, stage: 'intermediate', mastered: false },
  { id: 'i7', title: '永遇乐·京口北固亭怀古', author: '辛弃疾', dynasty: '宋', content: ['千古江山', '英雄无觅', '孙仲谋处', '舞榭歌台', '风流总被', '雨打风吹去', '斜阳草树', '寻常巷陌', '人道寄奴曾住'], translation: '千古江山依旧，却已无处寻找英雄孙仲谋那样的地方。歌舞楼台，英雄业绩总被风雨吹打而去。斜阳照着草木丛生的普通街巷，人们说寄奴曾在这里居住。', annotations: ['孙仲谋：孙权', '寄奴：南朝宋武帝刘裕小名', '元嘉：刘裕之子年号'], difficulty: 3, stage: 'intermediate', mastered: false },
  { id: 'i8', title: '文心雕龙·神思（节选）', author: '刘勰', dynasty: '南朝·梁', content: ['古人云', '形在江海之上', '心存魏阙之下', '神思之谓也', '文之思也', '其神远矣', '故寂然凝虑', '思接千载', '悄焉动容', '视通万里'], translation: '古人说：身体住在江海边上，心思却系于朝廷之下，这就是神思。为文之思，其神思可驰骋至远方。所以静心凝神思考，思绪可连接千年之久；悄然动容之间，目光可通达万里之遥。', annotations: ['神思：想象活动', '魏阙：代指朝廷', '凝虑：聚精会神', '视通万里：视野可达万里'], difficulty: 2, stage: 'intermediate', mastered: false },
  { id: 'i9', title: '人间词话（节选）', author: '王国维', dynasty: '近代', content: ['古今之成大事业', '大学问者', '必经过三种之境界', '昨夜西风凋碧树', '独上高楼', '望尽天涯路', '此第一境也', '衣带渐宽终不悔', '为伊消得人憔悴', '此第二境也', '众里寻他千百度', '蓦然回首', '那人却在灯火阑珊处', '此第三境也'], translation: '古今成就大事业、大学问的人，必定经过三种境界：「昨夜西风凋碧树，独上高楼，望尽天涯路」，这是第一种境界。「衣带渐宽终不悔，为伊消得人憔悴」，这是第二种境界。「众里寻他千百度，蓦然回首，那人却在灯火阑珊处」，这是第三种境界。', annotations: ['三境界：王国维提出的治学三境界', '晏殊词：第一境', '柳永词：第二境', '辛弃疾词：第三境'], difficulty: 2, stage: 'intermediate', mastered: false },
  { id: 'i10', title: '湘夫人（节选）', author: '屈原', dynasty: '战国·楚', content: ['帝子降兮北渚', '目眇眇兮愁予', '袅袅兮秋风', '洞庭波兮木叶下', '登白薠兮骋望', '与佳期兮夕张', '鸟何萃兮蘋中', '罾何为兮木上'], translation: '湘夫人降临在北边洲渚上，我望眼欲穿心中愁苦。秋风袅袅吹拂，洞庭波起树叶飘落。登上长满白薠的高处纵目远望，与佳人相约在黄昏张设帷帐。鸟儿为何聚集在水蘋中？渔网为何挂在树梢上？', annotations: ['帝子：湘夫人', '渚：水中小洲', '眇眇：远望的样子', '罾：渔网'], difficulty: 3, stage: 'intermediate', mastered: false },
  { id: 'i11', title: '赤壁赋（节选）', author: '苏轼', dynasty: '宋', content: ['壬戌之秋', '七月既望', '苏子与客泛舟游于赤壁之下', '清风徐来', '水波不兴', '举酒属客', '诵明月之诗', '歌窈窕之章', '少焉', '月出于东山之上', '徘徊于斗牛之间'], translation: '壬戌年的秋天，七月十六日，我与客人在赤壁下泛舟游玩。清风徐徐吹来，水面波澜不起。举起酒杯劝客人共饮，吟诵明月的诗篇，歌唱窈窕的篇章。不一会儿，月亮从东山上升起，在斗宿和牛宿之间徘徊。', annotations: ['既望：每月十六日', '属：劝酒', '斗牛：斗宿和牛宿星'], difficulty: 2, stage: 'intermediate', mastered: false },
  { id: 'i12', title: '圆圆曲（节选）', author: '吴伟业', dynasty: '清', content: ['鼎湖当日弃人间', '破敌收京下玉关', '恸哭六军俱缟素', '冲冠一怒为红颜', '红颜流落非吾恋', '逆贼天亡自荒宴', '电扫黄巾定黑山', '哭罢君亲再相见'], translation: '崇祯皇帝当日弃世归天，攻破敌军收复京城直下玉门关。六军将士痛哭尽着白衣，但冲冠一怒却是为了红颜。红颜流落并非我所留恋，逆贼天亡自因荒淫宴乐。如闪电扫荡黄巾平定黑山，哭完君亲再相见。', annotations: ['鼎湖：指皇帝去世', '冲冠一怒：极度愤怒', '红颜：指陈圆圆'], difficulty: 3, stage: 'intermediate', mastered: false },
  // Advanced (高阶篇) - 专门研究与理论
  { id: 'a1', title: '国殇', author: '屈原', dynasty: '战国·楚', content: ['操吴戈兮被犀甲', '车错毂兮短兵接', '旌蔽日兮敌若云', '矢交坠兮士争先', '凌余阵兮躐余行', '左骖殪兮右刃伤', '霾两轮兮絷四马', '援玉枹兮击鸣鼓'], translation: '手持吴戈身披犀甲，战车交错短兵相接。旗帜遮天蔽日敌众如云，箭矢交错坠落将士争先。敌军侵犯我们的阵地践踏我们的行列，左边的骖马倒地右边被刀砍伤。埋住两轮绊住四马，举起玉槌擂响战鼓。', annotations: ['吴戈：吴地所产戈矛', '犀甲：犀牛皮甲', '骖：车两旁的马', '殪：倒地而死', '玉枹：玉饰鼓槌'], difficulty: 3, stage: 'advanced', mastered: false },
  { id: 'a2', title: '涉江（节选）', author: '屈原', dynasty: '战国·楚', content: ['余幼好此奇服兮', '年既老而不衰', '带长铗之陆离兮', '冠切云之崔嵬', '被明月兮佩宝璐', '世溷浊而莫余知兮', '吾方高驰而不顾', '驾青虬兮骖白螭'], translation: '我从小就爱好这奇特的服饰，年纪已老这种爱好仍然不减。佩带着长长的宝剑，戴着高高的切云冠。身披明月珠佩戴宝玉，世道混浊无人了解我，我将高驰远游不再回顾。驾着青龙和白龙拉的车。', annotations: ['长铗：长剑', '切云：高冠名', '溷浊：混浊', '虬：有角的龙', '螭：无角的龙'], difficulty: 3, stage: 'advanced', mastered: false },
  { id: 'a3', title: '秋声赋（节选）', author: '欧阳修', dynasty: '宋', content: ['欧阳子方夜读书', '闻有声自西南来者', '悚然而听之', '曰：异哉！', '初淅沥以萧飒', '忽奔腾而砰湃', '如波涛夜惊', '风雨骤至', '其触于物也', '鏦鏦铮铮', '金铁皆鸣', '又如赴敌之兵', '衔枚疾走', '不闻号令', '但闻人马之行声'], translation: '欧阳子正在夜里读书，听到有声音从西南方向传来，惊惧地倾听，说：奇怪啊！起初是淅沥的雨声夹杂萧飒风声，忽然奔腾澎湃起来，如同夜间惊涛骇浪，风雨突然降临。它碰到物体上，鏦鏦铮铮如同金属相击的声音；又像奔赴敌阵的士兵，衔枚急行军，听不到号令，只听到人马的行走声。', annotations: ['悚然：惊惧的样子', '淅沥：雨声', '萧飒：风声', '砰湃：波涛声', '衔枚：口中含枚禁止发声'], difficulty: 3, stage: 'advanced', mastered: false },
  { id: 'a4', title: '再别康桥', author: '徐志摩', dynasty: '现代', content: ['轻轻的我走了', '正如我轻轻的来', '我轻轻的招手', '作别西天的云彩', '那河畔的金柳', '是夕阳中的新娘', '波光里的艳影', '在我的心头荡漾', '软泥上的青荇', '油油的在水底招摇', '在康河的柔波里', '我甘心做一条水草'], translation: '我轻轻地走了，正如我轻轻地来。我轻轻地招手，作别西天的云彩。那河畔的金柳，是夕阳中的新娘。波光里的艳影，在我心头荡漾。软泥上的青荇，在水底油油地招摇。在康河的柔波里，我甘心做一条水草。', annotations: ['康桥：剑桥Cambridge', '青荇：水草', '康河：剑河River Cam'], difficulty: 2, stage: 'advanced', mastered: false },
  { id: 'a5', title: '雨巷', author: '戴望舒', dynasty: '现代', content: ['撑着油纸伞', '独自彷徨在悠长', '悠长又寂寥的雨巷', '我希望逢着', '一个丁香一样的', '结着愁怨的姑娘', '她是有', '丁香一样的颜色', '丁香一样的芬芳', '丁香一样的忧愁'], translation: '撑着油纸伞，独自彷徨在悠长又寂寥的雨巷，我希望遇着一个丁香一样结着愁怨的姑娘。她有丁香一样的颜色，丁香一样的芬芳，丁香一样的忧愁。', annotations: ['雨巷：戴望舒代表作', '油纸伞：传统雨具', '丁香：象征忧愁哀怨'], difficulty: 2, stage: 'advanced', mastered: false },
  { id: 'a6', title: '诗品序（节选）', author: '钟嵘', dynasty: '南朝·梁', content: ['气之动物', '物之感人', '故摇荡性情', '形诸舞咏', '照烛三才', '晖丽万有', '灵祇待之以致飨', '幽微藉之以昭告', '动天地', '感鬼神', '莫近于诗'], translation: '气使万物萌动，万物感动人心，于是人的性情被摇荡激荡，表现在舞蹈和歌唱中。诗歌照耀天地人三才，辉煌于万物。神灵依靠它来享用祭品，幽冥凭借它来昭告世人。感动天地，震撼鬼神，没有比诗更近于达到这种效果的。', annotations: ['气：构成万物的元气', '三才：天地人', '灵祇：神灵', '幽微：幽冥鬼神'], difficulty: 3, stage: 'advanced', mastered: false },
]);

const filteredPoems = computed(() => poems.value.filter(p => p.stage === activeStage.value));

function selectPoem(poem: Poetry) {
  currentPoem.value = poem;
  practiceMode.value = false;
}

function markMastered() {
  if (!currentPoem.value) return;
  currentPoem.value.mastered = !currentPoem.value.mastered;
  const p = poems.value.find(p => p.id === currentPoem.value!.id);
  if (p) p.mastered = currentPoem.value.mastered;

  const masteredCount = poems.value.filter(p => p.mastered).length;
  if (masteredCount >= 10) gamification.unlockAchievement('poem-10');
  if (masteredCount >= 50) gamification.unlockAchievement('poem-50');
  if (masteredCount >= 100) gamification.unlockAchievement('poem-100');

  if (currentPoem.value.mastered) {
    gamification.addXp(15);
    message.success(`✅ 已背诵！+15 XP`);
  }
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
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.6), 0 0 40px rgba(124, 58, 237, 0.3); }
}
.animate-pulse-glow {
  animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
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
