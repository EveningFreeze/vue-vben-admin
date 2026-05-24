<template>
  <ChinesePageLayout>
    <ChineseHero icon="🏛️" title="经典研读" subtitle="四书五经 · 诸子百家 · 中华元典深度研读" backTo="/chinese-learning" showXpBar decorativeEmoji="🏛️" />

      <!-- Classics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
        <div
          v-for="(work, idx) in classics"
          :key="work.id"
          class="group bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-zinc-700 p-6 shadow-sm hover:shadow-lg hover:border-yellow-400/50 transition-all cursor-pointer animate-fade-in-up opacity-0 hover-lift-glow"
          :class="'delay-' + (idx % 6)"
          @click="selectWork(work)"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-2xl shadow-inner animate-wobble-slow">
              {{ work.icon }}
            </div>
            <div>
              <h3 class="text-base font-black text-gray-900 dark:text-zinc-100 group-hover:text-yellow-700 transition-colors">{{ work.title }}</h3>
              <p class="text-xs text-gray-400">{{ work.dynasty }} · {{ work.author }}</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed mb-3">{{ work.description }}</p>
          <span class="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold">{{ work.content.length }} 章节</span>
        </div>
      </div>

    <!-- Detail Modal -->
    <Transition name="modal">
      <div
        v-if="currentWork"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="currentWork = null"
      >
        <div class="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[85vh] flex flex-col">
          <div class="p-6 border-b border-gray-100 dark:border-zinc-700 bg-gradient-to-r from-stone-700 to-yellow-700 text-white flex-shrink-0 animate-gradient-shift">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold">{{ currentWork.icon }} {{ currentWork.title }}</h3>
                <p class="text-stone-200 text-sm">{{ currentWork.dynasty }} · {{ currentWork.author }}</p>
              </div>
              <button class="text-white/60 hover:text-white transition-colors text-xl" @click="currentWork = null">✕</button>
            </div>
          </div>

          <div class="p-6 overflow-y-auto flex-1">
            <div class="space-y-6">
              <div class="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                {{ currentWork.description }}
              </div>

              <div
                v-for="(chapter, idx) in currentWork.content.slice(currentChapter, currentChapter + 1)"
                :key="idx"
                class="space-y-4"
              >
                <div class="bg-zinc-100 dark:bg-zinc-8000/10 rounded-2xl p-6 animate-pulse-glow">
                  <p class="text-lg text-gray-800 dark:text-zinc-200 leading-relaxed font-serif">
                    {{ chapter.text }}
                  </p>
                </div>
                <div class="bg-slate-50 dark:bg-zinc-700 rounded-2xl p-4">
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">释义</h4>
                  <p class="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{{ chapter.translation }}</p>
                </div>
              </div>

              <!-- Chapter Navigation -->
              <div class="flex items-center justify-between">
                <button
                  class="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-30"
                  :disabled="currentChapter === 0"
                  @click="currentChapter--"
                >
                  ← 上一章
                </button>
                <span class="text-xs text-gray-400 font-mono">{{ currentChapter + 1 }} / {{ currentWork.content.length }}</span>
                <button
                  class="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-30"
                  :disabled="currentChapter >= currentWork.content.length - 1"
                  @click="currentChapter++"
                >
                  下一章 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </ChinesePageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChinesePageLayout, ChineseHero } from '../components';
import type { ClassicWork } from '../shared/types';
import '../shared/animations.css';

const currentWork = ref<ClassicWork | null>(null);
const currentChapter = ref(0);

const classics = ref<ClassicWork[]>([
  {
    id: 'c1', title: '三字经', author: '王应麟', dynasty: '南宋',
    icon: '📖', description: '《三字经》是中国的传统启蒙教材，用三字一句的形式，涵盖了中华传统文化的历史、地理、天文、伦理道德等丰富内容。',
    content: [
      { chapter: '开篇', text: '人之初，性本善。性相近，习相远。苟不教，性乃迁。教之道，贵以专。', translation: '人刚出生时，本性都是善良的。人的本性本来差不多，但因为后天环境和习惯的不同，就逐渐产生了差异。如果不进行教育，善良的本性就会改变。教育的方法，最重要的是专注和坚持。' },
      { chapter: '教育', text: '昔孟母，择邻处。子不学，断机杼。窦燕山，有义方。教五子，名俱扬。', translation: '古代孟子的母亲为了给孩子良好的成长环境，多次搬家。孟子逃学回家，孟母就把织布机上的布割断，以此教育他学习不能半途而废。窦燕山有很好的教育方法，他教出的五个儿子都很有成就，名扬天下。' },
      { chapter: '孝道', text: '香九龄，能温席。孝于亲，所当执。融四岁，能让梨。弟于长，宜先知。', translation: '黄香九岁时就知道在冬天为父母暖被窝，这种孝顺父母的行为是每个人都应该做到的。孔融四岁时就知道把大梨让给哥哥们吃，这种尊敬兄长的道理，应该从小就知道。' },
    ],
  },
  {
    id: 'c2', title: '弟子规', author: '李毓秀', dynasty: '清',
    icon: '📜', description: '《弟子规》以儒家的"孝、悌、谨、信、泛爱众、亲仁、余力学文"为纲，具体列述了为人子弟在家、出外、待人接物、求学等方面应有的行为规范。',
    content: [
      { chapter: '总叙', text: '弟子规，圣人训。首孝悌，次谨信。泛爱众，而亲仁。有余力，则学文。', translation: '《弟子规》是依据圣人的教诲编写的。首先要孝顺父母、尊敬兄长，其次要谨慎守信。要博爱众人，亲近有仁德的人。做好了这些，如果还有余力，就去学习文化知识。' },
      { chapter: '入则孝', text: '父母呼，应勿缓。父母命，行勿懒。父母教，须敬听。父母责，须顺承。', translation: '父母叫你的时候，要立刻答应，不能迟缓。父母让你做事的时候，要马上去做，不能偷懒。父母教导你的时候，要恭敬地聆听。父母责备你的时候，要顺从地接受。' },
      { chapter: '谨', text: '朝起早，夜眠迟。老易至，惜此时。晨必盥，兼漱口。便溺回，辄净手。', translation: '早上要早起，晚上要晚睡。人生易老，要珍惜时光。早上起床后必须洗脸漱口，上完厕所后要洗手。这些良好的生活习惯要从小养成。' },
    ],
  },
  {
    id: 'c3', title: '论语（节选）', author: '孔子及弟子', dynasty: '春秋',
    icon: '🏛️', description: '《论语》是儒家学派的经典著作，以语录体记录了孔子及其弟子的言行，集中体现了孔子的政治主张、伦理思想、道德观念及教育原则。',
    content: [
      { chapter: '学而篇', text: '学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？', translation: '学习了知识并经常温习，不也是很愉快吗？有志同道合的朋友从远方来，不也是很快乐吗？别人不了解我而我却不生气，不也算是君子吗？' },
      { chapter: '为政篇', text: '学而不思则罔，思而不学则殆。知之为知之，不知为不知，是知也。', translation: '只学习而不思考就会迷惘，只思考而不学习就会陷入困境。知道就是知道，不知道就是不知道，这才是真正的智慧。' },
      { chapter: '述而篇', text: '三人行，必有我师焉。择其善者而从之，其不善者而改之。', translation: '几个人一起走路，其中必定有可以做我老师的人。我要选择他们的优点来学习，看到他们的缺点就反省自己并加以改正。' },
    ],
  },
  {
    id: 'c4', title: '千字文', author: '周兴嗣', dynasty: '南北朝',
    icon: '🎋', description: '《千字文》由一千个不重复的汉字组成，涵盖了天文、地理、自然、社会、历史等多方面知识，是中国古代最著名的蒙学读物之一。',
    content: [
      { chapter: '开篇', text: '天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。寒来暑往，秋收冬藏。', translation: '天是青黑色的，地是黄色的，宇宙形成于混沌蒙昧的状态。太阳有正有斜，月亮有圆有缺，星辰布满在无边的太空中。寒冬过去暑夏到来，秋天收获冬天储藏。' },
      { chapter: '修身', text: '盖此身发，四大五常。恭惟鞠养，岂敢毁伤。女慕贞洁，男效才良。知过必改，得能莫忘。', translation: '人的身体发肤，由地火水风四大元素构成，要遵守仁义礼智信五常。要恭敬地想到父母的养育之恩，怎么敢毁坏损伤呢。女子要仰慕贞洁，男子要效法才德。知道错了就要改正，学到了本领不要忘记。' },
    ],
  },
  {
    id: 'c5', title: '诗经（节选）', author: '佚名', dynasty: '周代',
    icon: '🎵', description: '《诗经》是中国最早的诗歌总集，收录了西周初年至春秋中叶的诗歌，分为风、雅、颂三部分，反映了当时的社会生活和人民情感。',
    content: [
      { chapter: '关雎', text: '关关雎鸠，在河之洲。窈窕淑女，君子好逑。参差荇菜，左右流之。窈窕淑女，寤寐求之。', translation: '关关鸣叫的雎鸠鸟，在河中的沙洲上。文静美丽的好姑娘，是君子的好配偶。长短不齐的荇菜，左右捞取。文静美丽的好姑娘，日日夜夜都想追求她。' },
      { chapter: '蒹葭', text: '蒹葭苍苍，白露为霜。所谓伊人，在水一方。溯洄从之，道阻且长。溯游从之，宛在水中央。', translation: '芦苇长得茂盛苍翠，清晨的露水凝结成霜。我心中思念的那个人，就在河水的那一边。逆流而上去寻找，道路险阻又漫长。顺流而下去寻找，仿佛就在水的中央。' },
    ],
  },
  {
    id: 'c6', title: '孟子（节选）', author: '孟子', dynasty: '战国',
    icon: '📚', description: '《孟子》是儒家经典之一，记录了孟子及其弟子的政治、教育、哲学等思想，以论辩见长，气势磅礴，对后世影响深远。',
    content: [
      { chapter: '告子下', text: '故天将降大任于斯人也，必先苦其心志，劳其筋骨，饿其体肤，空乏其身，行拂乱其所为，所以动心忍性，曾益其所不能。', translation: '所以上天将要把重大责任降临给这个人时，一定要先使他的内心痛苦，使他的筋骨劳累，使他经受饥饿，使他身陷贫困，使他的所作所为都不顺利，这样来激励他的意志，坚韧他的性情，增长他的能力。' },
      { chapter: '梁惠王上', text: '老吾老以及人之老，幼吾幼以及人之幼，天下可运于掌。', translation: '尊敬自己的长辈，从而推广到尊敬别人的长辈；爱护自己的孩子，从而推广到爱护别人的孩子。做到这一点，治理天下就像在手掌中运转东西一样容易了。' },
    ],
  },
  {
    id: 'c7', title: '道德经', author: '老子', dynasty: '春秋',
    icon: '☯️', description: '《道德经》是道家哲学经典，相传为春秋时期老子所著。全书以"道"为核心，阐述了宇宙观、人生观和政治观，对中国哲学、文化、政治产生了深远影响。',
    content: [
      { chapter: '第一章', text: '道可道，非常道；名可名，非常名。无名，天地之始；有名，万物之母。故常无欲，以观其妙；常有欲，以观其徼。', translation: '可以用语言表述的道，就不是永恒的道；可以用名称命名的名，就不是永恒的名。无是天地的本始，有是万物的根源。所以常从"无"中去观照道的奥妙，常从"有"中去观照道的端倪。' },
      { chapter: '第八章', text: '上善若水。水善利万物而不争，处众人之所恶，故几于道。居善地，心善渊，与善仁，言善信，政善治，事善能，动善时。夫唯不争，故无尤。', translation: '最高的善就像水一样。水善于滋润万物而不与之争利，停留在众人所厌恶的低洼处，所以最接近于道。正因为不争，所以没有过失。' },
      { chapter: '第六十四章', text: '合抱之木，生于毫末；九层之台，起于累土；千里之行，始于足下。', translation: '合抱粗的大树，是从细小的萌芽生长起来的；九层的高台，是从一筐筐泥土堆积起来的；千里的远行，是从脚下一步步走出来的。' },
    ],
  },
  {
    id: 'c8', title: '庄子（节选）', author: '庄子', dynasty: '战国',
    icon: '🦋', description: '《庄子》是道家经典之一，以其汪洋恣肆的想象和深刻的哲学思辨著称。书中通过寓言故事阐述了"逍遥游""齐物论"等核心思想，对后世文学和哲学影响深远。',
    content: [
      { chapter: '逍遥游', text: '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。化而为鸟，其名为鹏。鹏之背，不知其几千里也。怒而飞，其翼若垂天之云。', translation: '北方的大海里有一条鱼，它的名字叫鲲。鲲非常大，不知道有几千里。它变化为鸟，名字叫鹏。鹏的脊背，不知道有几千里。当它振翅飞翔的时候，翅膀就像挂在天边的云彩。' },
      { chapter: '齐物论', text: '昔者庄周梦为蝴蝶，栩栩然蝴蝶也，自喻适志与！不知周也。俄然觉，则蘧蘧然周也。不知周之梦为蝴蝶与，蝴蝶之梦为周与？', translation: '从前庄周梦见自己变成了蝴蝶，一只翩翩飞舞的蝴蝶，悠然自得，不知道自己是庄周。忽然醒来，发现自己分明是庄周。不知道是庄周做梦变成了蝴蝶呢，还是蝴蝶做梦变成了庄周呢？' },
    ],
  },
  {
    id: 'c9', title: '大学（节选）', author: '曾子', dynasty: '春秋',
    icon: '🏮', description: '《大学》是儒家经典"四书"之一，相传为曾子所作。文章提出了"三纲领"（明明德、亲民、止于至善）和"八条目"（格物、致知、诚意、正心、修身、齐家、治国、平天下）的修身治国之道。',
    content: [
      { chapter: '经一章', text: '大学之道，在明明德，在亲民，在止于至善。知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。物有本末，事有终始，知所先后，则近道矣。', translation: '大学的宗旨，在于弘扬光明的品德，在于使人自新，在于达到至善的境地。知道目标所在才能志向坚定，志向坚定才能内心宁静，内心宁静才能安于处境，安于处境才能思虑周详，思虑周详才能有所收获。' },
      { chapter: '传七章', text: '所谓诚其意者，毋自欺也。如恶恶臭，如好好色，此之谓自谦。故君子必慎其独也。', translation: '所说的使意念真诚，就是不要自己欺骗自己。就像厌恶腐臭的气味，就像喜爱美好的颜色，这就叫做自我满足。所以君子在独处的时候也一定要谨慎。' },
    ],
  },
  {
    id: 'c10', title: '中庸（节选）', author: '子思', dynasty: '战国',
    icon: '⚖️', description: '《中庸》是儒家"四书"之一，相传为孔子之孙子思所作。全书以"中庸"为核心概念，阐述儒家关于人性修养、道德实践和治理国家的哲学思想，强调"致中和"的和谐境界。',
    content: [
      { chapter: '天命章', text: '天命之谓性，率性之谓道，修道之谓教。道也者，不可须臾离也，可离非道也。是故君子戒慎乎其所不睹，恐惧乎其所不闻。', translation: '天所赋予人的叫做性，遵循本性去做叫做道，修明道并加以推广叫做教。道是不可以片刻离开的，如果可以离开，那就不是道了。所以君子在别人看不见的地方也警惕谨慎，在别人听不到的地方也戒慎恐惧。' },
      { chapter: '中和章', text: '喜怒哀乐之未发，谓之中；发而皆中节，谓之和。中也者，天下之大本也；和也者，天下之达道也。致中和，天地位焉，万物育焉。', translation: '喜怒哀乐的感情没有表现出来的时候，叫做中；表现出来都符合节度，叫做和。中是天下万事万物的根本，和是天下通行的道理。达到中和的境界，天地便各安其位，万物便生长发育了。' },
    ],
  },
  {
    id: 'c11', title: '孝经（节选）', author: '孔子及曾子', dynasty: '春秋',
    icon: '🕊️', description: '《孝经》是儒家经典之一，以孔子与曾子问答的形式阐述了孝道思想。全书将孝道从家庭伦理扩展到社会治理，主张"以孝治天下"，对中国传统社会影响深远。',
    content: [
      { chapter: '开宗明义章', text: '身体发肤，受之父母，不敢毁伤，孝之始也。立身行道，扬名于后世，以显父母，孝之终也。夫孝，始于事亲，中于事君，终于立身。', translation: '人的身体毛发皮肤，都是父母给予的，不敢毁伤，这是孝的开始。人在世上遵循仁义道德，有所建树，显扬名声于后世，从而使父母荣耀，这是孝的终极目标。孝，从侍奉父母开始，以事奉君主作为继续，最终目的是成就自身。' },
      { chapter: '天子章', text: '爱亲者，不敢恶于人；敬亲者，不敢慢于人。爱敬尽于事亲，而德教加于百姓，刑于四海。盖天子之孝也。', translation: '爱自己父母的人，不敢厌恶别人的父母；尊敬自己父母的人，不敢怠慢别人的父母。将爱敬之心全部用于侍奉父母，并将这种美德教化百姓，成为天下的典范。这就是天子的孝道。' },
    ],
  },
]);

function selectWork(work: ClassicWork) {
  currentWork.value = work;
  currentChapter.value = 0;
}
</script>

<style scoped>
.modal-enter-active { transition: all 0.3s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.9); }
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
</style>
