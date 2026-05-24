<template>
  <ChinesePageLayout>
    <ChineseHero icon="🎮" title="古文阅读" subtitle="精读 · 句读 · 翻译 — 古代汉语综合训练" backTo="/chinese-learning" showXpBar decorativeEmoji="🎮" />

      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
          <div class="text-lg font-black text-gray-900 dark:text-white">{{ masteredCount }}</div>
          <div class="text-xs text-gray-500 font-medium">已精读古文</div>
        </div>
        <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
          <div class="text-lg font-black text-gray-900 dark:text-white">{{ classicalPassages.length }}</div>
          <div class="text-xs text-gray-500 font-medium">总古文篇目</div>
        </div>
        <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
          <div class="text-lg font-black text-orange-500">{{ punctCompletedCount }}</div>
          <div class="text-xs text-gray-500 font-medium">句读练习完成</div>
        </div>
        <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
          <div class="text-lg font-black text-orange-500">{{ studyProgress }}%</div>
          <div class="text-xs text-gray-500 font-medium">研读进度</div>
        </div>
      </div>

      <!-- Modes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Mode 1: 精读模式 -->
        <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm animate-fade-in-up opacity-0 delay-0 hover-lift-glow">
          <div class="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-xl mb-4 animate-pulse-glow">&#x1F4D6;</div>
          <h3 class="font-black text-gray-900 dark:text-white mb-2">精读模式</h3>
          <p class="text-xs text-gray-500 mb-4">精读古文原文，完成阅读理解</p>
          <div v-if="readingActive" class="space-y-4">
            <div class="text-xs text-gray-400 font-medium text-center">
              第 {{ readingIndex + 1 }} / {{ classicalPassages.length }} 篇
            </div>
            <div class="bg-slate-50 dark:bg-zinc-700 rounded-xl p-4 max-h-36 overflow-y-auto">
              <div class="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-1">{{ currentPassage.source }}</div>
              <p class="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{{ currentPassage.text }}</p>
            </div>
            <div v-if="!readingQuestionStarted" class="flex gap-2">
              <button
                class="flex-1 py-2 bg-gradient-to-r from-chinese-600 to-chinese-700 text-white rounded-xl font-bold text-sm animate-gradient-shift hover:shadow-lg transition-all"
                @click="startReadingQuestions"
              >
                开始答题
              </button>
              <button
                class="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                @click="exitReading"
              >
                退出
              </button>
            </div>
            <div v-else class="space-y-3">
              <div class="text-xs font-medium text-gray-500">
                {{ readingQIndex + 1 }} / 3
              </div>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ currentReadingQuestion.q }}</p>
              <div class="grid grid-cols-1 gap-2">
                <button
                  v-for="opt in currentReadingQuestion.options"
                  :key="opt"
                  :class="[
                    'p-2.5 text-xs border rounded-xl text-left transition-all font-medium',
                    readingSelected === opt
                      ? readingQResult === 'correct'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                        : readingQResult === 'wrong'
                          ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-zinc-800 border-blue-500 text-zinc-300 dark:bg-blue-500/10 dark:text-zinc-500'
                      : 'bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-orange-300 hover:bg-orange-50/50',
                  ]"
                  :disabled="!!readingSelected"
                  @click="checkReadingAnswer(opt)"
                >
                  {{ opt }}
                </button>
              </div>
              <div v-if="readingQResult === 'wrong' && currentReadingQuestion.hint" class="p-2 bg-zinc-800 dark:bg-blue-500/10 rounded-xl text-xs text-zinc-300 dark:text-zinc-500 animate-bounce-in">
                &#x1F4A1; {{ currentReadingQuestion.hint }}
              </div>
              <button
                v-if="readingQResult"
                class="w-full py-2 bg-gradient-to-r from-chinese-600 to-chinese-700 text-white rounded-xl font-bold text-sm animate-gradient-shift"
                @click="nextReadingQuestion"
              >
                {{ readingQIndex >= 2 ? '查看结果' : '下一题' }}
              </button>
            </div>
          </div>
          <button
            v-else
            class="w-full py-2.5 bg-gradient-to-r from-chinese-600 to-chinese-700 text-white rounded-xl font-bold text-sm animate-gradient-shift hover:shadow-lg transition-all"
            @click="startReading"
          >
            开始挑战
          </button>
        </div>

        <!-- Mode 2: 句读训练 -->
        <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm animate-fade-in-up opacity-0 delay-1 hover-lift-glow">
          <div class="w-12 h-12 rounded-xl bg-zinc-800 dark:bg-blue-500/10 flex items-center justify-center text-xl mb-4 animate-wobble-slow">&#x270D;&#xFE0F;</div>
          <h3 class="font-black text-gray-900 dark:text-white mb-2">句读训练</h3>
          <p class="text-xs text-gray-500 mb-4">为古文正确断句加标点</p>
          <div v-if="punctActive" class="space-y-4">
            <div class="text-xs text-gray-400 font-medium text-center">
              第 {{ punctIndex + 1 }} / {{ classicalPassages.length }} 题
            </div>
            <div class="bg-slate-50 dark:bg-zinc-700 rounded-xl p-4">
              <div class="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-1">{{ currentPunctPassage.source }}</div>
              <p class="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed tracking-wider">
                {{ currentPunctPassage.noPunct }}
              </p>
            </div>
            <p class="text-xs text-gray-500 font-medium">请选择正确的断句方式：</p>
            <div class="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto">
              <button
                v-for="(opt, oi) in currentPunctPassage.punctOptions"
                :key="oi"
                :class="[
                  'p-2.5 text-xs border rounded-xl text-left transition-all font-medium leading-relaxed',
                  punctSelected === oi
                    ? punctResult === 'correct'
                      ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                      : punctResult === 'wrong'
                        ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-zinc-800 border-blue-500 text-zinc-300 dark:bg-blue-500/10 dark:text-zinc-500'
                    : 'bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50',
                ]"
                :disabled="punctResult !== null"
                @click="checkPunctAnswer(oi)"
              >
                {{ opt }}
              </button>
            </div>
            <button
              v-if="punctResult"
              class="w-full py-2 bg-gradient-to-r from-chinese-600 to-chinese-700 text-white rounded-xl font-bold text-sm animate-gradient-shift"
              @click="nextPunct"
            >
              下一题
            </button>
          </div>
          <button
            v-else
            class="w-full py-2.5 bg-gradient-to-r from-chinese-600 to-chinese-700 text-white rounded-xl font-bold text-sm animate-gradient-shift hover:shadow-lg transition-all"
            @click="startPunct"
          >
            开始挑战
          </button>
        </div>

        <!-- Mode 3: 翻译练习 -->
        <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm animate-fade-in-up opacity-0 delay-2 hover-lift-glow">
          <div class="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-xl mb-4 animate-pulse-glow">&#x1F504;</div>
          <h3 class="font-black text-gray-900 dark:text-white mb-2">翻译练习</h3>
          <p class="text-xs text-gray-500 mb-4">将古文翻译为现代汉语</p>
          <div v-if="transActive" class="space-y-4">
            <div class="text-xs text-gray-400 font-medium text-center">
              第 {{ transIndex + 1 }} / {{ translationItems.length }} 题
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 mb-1">请选择最准确的现代汉语翻译</div>
              <div class="text-base font-black text-orange-500 dark:text-orange-400 mb-1 leading-relaxed px-2">
                &ldquo;{{ currentTransItem.original }}&rdquo;
              </div>
              <div class="text-[10px] text-gray-400">—— {{ currentTransItem.source }}</div>
            </div>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="(opt, oi) in currentTransItem.options"
                :key="oi"
                :class="[
                  'p-2.5 text-xs border rounded-xl text-left transition-all font-medium leading-relaxed',
                  transSelected === oi
                    ? transResult === 'correct'
                      ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                      : transResult === 'wrong'
                        ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-zinc-800 border-blue-500 text-zinc-300 dark:bg-blue-500/10 dark:text-zinc-500'
                    : 'bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-orange-300 hover:bg-orange-50/50',
                ]"
                :disabled="transResult !== null"
                @click="checkTransAnswer(oi)"
              >
                {{ opt }}
              </button>
            </div>
            <button
              v-if="transResult"
              class="w-full py-2 bg-gradient-to-r from-chinese-600 to-chinese-700 text-white rounded-xl font-bold text-sm animate-gradient-shift"
              @click="nextTrans"
            >
              下一题
            </button>
          </div>
          <button
            v-else
            class="w-full py-2.5 bg-gradient-to-r from-chinese-600 to-chinese-700 text-white rounded-xl font-bold text-sm animate-gradient-shift hover:shadow-lg transition-all"
            @click="startTrans"
          >
            开始挑战
          </button>
        </div>
      </div>
  </ChinesePageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useGamification } from '../shared/use-gamification';
import { ChinesePageLayout, ChineseHero } from '../components';
import '../shared/animations.css';

const gamification = useGamification();

// ---- Interfaces ----
interface ReadingQuestion {
  q: string;
  options: string[];
  answer: string;
  hint: string;
}

interface ClassicalPassage {
  id: number;
  source: string;
  text: string;
  noPunct: string;
  punctOptions: string[];
  punctAnswer: number;
  questions: ReadingQuestion[];
}

interface TranslationItem {
  id: number;
  original: string;
  source: string;
  options: string[];
  answer: number;
}

// ---- Classical Passage Pool (30) ----
const classicalPassages = ref<ClassicalPassage[]>([
  {
    id: 1,
    source: '《论语·学而》',
    text: '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"',
    noPunct: '子曰学而时习之不亦说乎有朋自远方来不亦乐乎人不知而不愠不亦君子乎',
    punctOptions: [
      '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"',
      '子曰："学而时习之，不亦说乎。有朋自远方来，不亦乐乎。人不知而不愠，不亦君子乎。"',
      '子曰："学而时习之不亦说乎？有朋自远方来不亦乐乎？人不知而不愠不亦君子乎？"',
      '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知，而不愠，不亦君子乎？"',
    ],
    punctAnswer: 0,
    questions: [
      { q: '这段文字主要体现了孔子关于什么的观点？', options: ['学习的乐趣与君子修养', '治国安邦的策略', '礼仪规范的细节', '天地自然的道理'], answer: '学习的乐趣与君子修养', hint: '孔子谈论了学习之乐、交友之乐以及不被理解的君子胸襟' },
      { q: '"人不知而不愠"中的"愠"字意思是？', options: ['恼怒', '忧虑', '恐惧', '悲伤'], answer: '恼怒', hint: '"愠"指内心暗暗生气' },
      { q: '"有朋自远方来，不亦乐乎"反映了中国文化的什么传统？', options: ['重视友谊与待客之道', '重视远行求学', '重视商业往来', '重视外交礼仪'], answer: '重视友谊与待客之道', hint: '孔子认为远方朋友来访是人生一大乐事' },
    ],
  },
  {
    id: 2,
    source: '《论语·为政》',
    text: '子曰："吾十有五而志于学，三十而立，四十而不惑，五十而知天命，六十而耳顺，七十而从心所欲，不逾矩。"',
    noPunct: '子曰吾十有五而志于学三十而立四十而不惑五十而知天命六十而耳顺七十而从心所欲不逾矩',
    punctOptions: [
      '子曰："吾十有五而志于学，三十而立，四十而不惑，五十而知天命，六十而耳顺，七十而从心所欲，不逾矩。"',
      '子曰："吾十有五而志于学，三十而立，四十而不惑。五十而知天命，六十而耳顺，七十而从心所欲，不逾矩。"',
      '子曰："吾十有五而志于学；三十而立；四十而不惑；五十而知天命；六十而耳顺；七十而从心所欲，不逾矩。"',
      '子曰："吾十有五而志于学，三十而立，四十而不惑，五十而知天命。六十而耳顺，七十而从心所欲，不逾矩。"',
    ],
    punctAnswer: 0,
    questions: [
      { q: '孔子说自己"三十而立"，"立"的意思是？', options: ['立业立足，有所成就', '站立不动', '独立生活', '成家立业'], answer: '立业立足，有所成就', hint: '三十岁能自立于社会，有所建树' },
      { q: '"不逾矩"中的"矩"指的是什么？', options: ['规矩法度', '矩形工具', '距离', '规章制度'], answer: '规矩法度', hint: '指不超越社会规范' },
      { q: '孔子描述的人生阶段体现了什么思想？', options: ['终身学习与自我完善', '天命不可违', '仕途升迁之路', '修道成仙之道'], answer: '终身学习与自我完善', hint: '孔子描述了人生各个阶段不断进步的过程' },
    ],
  },
  {
    id: 3,
    source: '《孟子·梁惠王上》',
    text: '孟子见梁惠王。王曰："叟！不远千里而来，亦将有以利吾国乎？"孟子对曰："王何必曰利？亦有仁义而已矣。"',
    noPunct: '孟子见梁惠王王曰叟不远千里而来亦将有以利吾国乎孟子对曰王何必曰利亦有仁义而已矣',
    punctOptions: [
      '孟子见梁惠王。王曰："叟！不远千里而来，亦将有以利吾国乎？"孟子对曰："王何必曰利？亦有仁义而已矣。"',
      '孟子见梁惠王。王曰："叟不远千里而来，亦将有以利吾国乎？"孟子对曰："王何必曰利？亦有仁义而已矣。"',
      '孟子见梁惠王，王曰："叟！不远千里而来，亦将有以利吾国乎？"孟子对曰："王何必曰利？亦有仁义而已矣。"',
      '孟子见梁惠王。王曰："叟！不远千里而来，亦将有以利吾国乎？"孟子对曰："王何必曰利？亦有仁义而已矣！"',
    ],
    punctAnswer: 0,
    questions: [
      { q: '孟子对梁惠王说"王何必曰利"体现了什么核心思想？', options: ['重义轻利，以仁义治国', '反对一切利益', '只讲利益不讲仁义', '利益和仁义并重'], answer: '重义轻利，以仁义治国', hint: '孟子强调仁义优先于利益' },
      { q: '梁惠王称孟子为"叟"，"叟"的意思是？', options: ['老者，老人家', '先生', '大夫', '贤人'], answer: '老者，老人家', hint: '梁惠王对年长的孟子的尊称' },
      { q: '孟子与梁惠王的这段对话发生在什么背景下？', options: ['战国时期诸侯争霸', '春秋时期礼崩乐坏', '秦统一六国之后', '西汉建立之初'], answer: '战国时期诸侯争霸', hint: '梁惠王是战国时期魏国的国君' },
    ],
  },
  {
    id: 4,
    source: '《大学》首章',
    text: '大学之道，在明明德，在亲民，在止于至善。知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。',
    noPunct: '大学之道在明明德在亲民在止于至善知止而后有定定而后能静静而后能安安而后能虑虑而后能得',
    punctOptions: [
      '大学之道，在明明德，在亲民，在止于至善。知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。',
      '大学之道，在明明德，在亲民，在止于至善。知止而后有定，定而后能静。静而后能安，安而后能虑，虑而后能得。',
      '大学之道在明明德，在亲民，在止于至善。知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。',
      '大学之道，在明明德，在亲民，在止于至善。知止而后有定，定而后能静，静而后能安。安而后能虑，虑而后能得。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"大学之道"的"明明德"中第一个"明"字的意思是？', options: ['彰明、弘扬', '明亮', '明白', '光明'], answer: '彰明、弘扬', hint: '"明明德"意为弘扬光明正大的品德' },
      { q: '"止于至善"的意思是？', options: ['达到最完善的境界', '停止在最好的地方', '善良就够了', '适可而止'], answer: '达到最完善的境界', hint: '追求最高的善' },
      { q: '《大学》原是"四书"之一，"四书"包括？', options: ['《大学》《中庸》《论语》《孟子》', '《大学》《论语》《孟子》《礼记》', '《诗经》《尚书》《礼记》《周易》', '《大学》《中庸》《论语》《诗经》'], answer: '《大学》《中庸》《论语》《孟子》', hint: '四书是儒家的重要经典' },
    ],
  },
  {
    id: 5,
    source: '《中庸》首章',
    text: '天命之谓性，率性之谓道，修道之谓教。道也者，不可须臾离也；可离，非道也。',
    noPunct: '天命之谓性率性之谓道修道之谓教道也者不可须臾离也可离非道也',
    punctOptions: [
      '天命之谓性，率性之谓道，修道之谓教。道也者，不可须臾离也；可离，非道也。',
      '天命之谓性，率性之谓道，修道之谓教。道也者，不可须臾离也，可离，非道也。',
      '天命之谓性，率性之谓道。修道之谓教。道也者，不可须臾离也；可离，非道也。',
      '天命之谓性；率性之谓道；修道之谓教。道也者，不可须臾离也；可离，非道也。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"天命之谓性"中"性"指的是？', options: ['人的本性禀赋', '性别', '性格', '性命'], answer: '人的本性禀赋', hint: '天所赋予人的叫作性' },
      { q: '"率性之谓道"的意思是？', options: ['遵循本性行事就是道', '率领众人就是道', '率真的性格就是道', '轻率的行为就是道'], answer: '遵循本性行事就是道', hint: '"率"是遵循的意思' },
      { q: '"不可须臾离也"体现了什么思想？', options: ['道无处不在，片刻不能背离', '须臾是指时间很短', '人应该远离世俗', '道是可以离开的'], answer: '道无处不在，片刻不能背离', hint: '强调道的普遍性和重要性' },
    ],
  },
  {
    id: 6,
    source: '《诗经·关雎》',
    text: '关关雎鸠，在河之洲。窈窕淑女，君子好逑。参差荇菜，左右流之。窈窕淑女，寤寐求之。',
    noPunct: '关关雎鸠在河之洲窈窕淑女君子好逑参差荇菜左右流之窈窕淑女寤寐求之',
    punctOptions: [
      '关关雎鸠，在河之洲。窈窕淑女，君子好逑。参差荇菜，左右流之。窈窕淑女，寤寐求之。',
      '关关雎鸠，在河之洲；窈窕淑女，君子好逑。参差荇菜，左右流之；窈窕淑女，寤寐求之。',
      '关关雎鸠在河之洲，窈窕淑女君子好逑。参差荇菜左右流之，窈窕淑女寤寐求之。',
      '关关雎鸠，在河之洲。窈窕淑女，君子好逑。参差荇菜，左右流之。窈窕淑女，寤寐求之！',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"窈窕淑女，君子好逑"中"好逑"的意思是？', options: ['好的配偶', '爱好追求', '美好的追求', '善于追求'], answer: '好的配偶', hint: '"逑"指配偶' },
      { q: '《关雎》在《诗经》中属于哪一类？', options: ['风（国风）', '雅（大雅）', '颂（周颂）', '赋'], answer: '风（国风）', hint: '《关雎》是《诗经·国风·周南》的第一篇' },
      { q: '"寤寐求之"中"寤寐"的意思是？', options: ['醒来和睡着，日夜', '做梦', '失眠', '清醒'], answer: '醒来和睡着，日夜', hint: '"寤"指醒着，"寐"指睡着' },
    ],
  },
  {
    id: 7,
    source: '《礼记·礼运》',
    text: '大道之行也，天下为公。选贤与能，讲信修睦。故人不独亲其亲，不独子其子，使老有所终，壮有所用，幼有所长。',
    noPunct: '大道之行也天下为公选贤与能讲信修睦故人不独亲其亲不独子其子使老有所终壮有所用幼有所长',
    punctOptions: [
      '大道之行也，天下为公。选贤与能，讲信修睦。故人不独亲其亲，不独子其子，使老有所终，壮有所用，幼有所长。',
      '大道之行也，天下为公。选贤与能，讲信修睦。故人不独亲其亲，不独子其子；使老有所终，壮有所用，幼有所长。',
      '大道之行也，天下为公。选贤与能，讲信修睦。故人不独亲其亲、不独子其子，使老有所终、壮有所用、幼有所长。',
      '大道之行也，天下为公。选贤与能，讲信修睦。故人不独亲其亲，不独子其子。使老有所终，壮有所用，幼有所长。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"天下为公"的意思是？', options: ['天下是公共的，属于全体人民', '天下为公有制', '天下人都很公正', '天下人为了公众'], answer: '天下是公共的，属于全体人民', hint: '这是儒家大同社会的核心思想' },
      { q: '"选贤与能"中"与"的意思是？', options: ['推举', '和、同', '给予', '参与'], answer: '推举', hint: '"选贤与能"即选拔贤才推举能人' },
      { q: '这段文字描绘的是什么样的社会理想？', options: ['大同社会', '小康社会', '封建社会', '理想国'], answer: '大同社会', hint: '这是儒家经典中对大同世界的描绘' },
    ],
  },
  {
    id: 8,
    source: '《老子》第一章',
    text: '道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。故常无欲，以观其妙；常有欲，以观其徼。',
    noPunct: '道可道非常道名可名非常名无名天地之始有名万物之母故常无欲以观其妙常有欲以观其徼',
    punctOptions: [
      '道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。故常无欲，以观其妙；常有欲，以观其徼。',
      '道可道，非常道；名可名，非常名。无名，天地之始；有名，万物之母。故常无欲，以观其妙；常有欲，以观其徼。',
      '道可道非常道，名可名非常名。无名天地之始，有名万物之母。故常无欲以观其妙，常有欲以观其徼。',
      '道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。故常无欲，以观其妙；常有欲，以观其徼。',
    ],
    punctAnswer: 1,
    questions: [
      { q: '"道可道，非常道"中第二个"道"字的意思是？', options: ['言说、描述', '道理、规律', '道路', '道德'], answer: '言说、描述', hint: '第一个"道"是名词（大道），第二个"道"是动词（说）' },
      { q: '"无名天地之始，有名万物之母"体现了什么哲学观点？', options: ['有与无的辩证关系', '有名比无名重要', '天地有始有终', '万物都有母亲'], answer: '有与无的辩证关系', hint: '老子认为"无"和"有"同出于道' },
      { q: '这段文字出自哪部经典？', options: ['《道德经》', '《庄子》', '《周易》', '《论语》'], answer: '《道德经》', hint: '《老子》即《道德经》，是道家最重要的经典' },
    ],
  },
  {
    id: 9,
    source: '《庄子·逍遥游》',
    text: '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云。',
    noPunct: '北冥有鱼其名为鲲鲲之大不知其几千里也化而为鸟其名为鹏鹏之背不知其几千里也怒而飞其翼若垂天之云',
    punctOptions: [
      '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云。',
      '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云！',
      '北冥有鱼，其名为鲲。鲲之大，不知其几千里也；化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云。',
      '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。化而为鸟，其名为鹏。鹏之背，不知其几千里也。怒而飞，其翼若垂天之云。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"鲲"和"鹏"是什么关系？', options: ['鲲化而为鹏，是同一事物的转化', '鲲和鹏是两种不同的动物', '鲲是鹏的食物', '鲲是鹏的幼体'], answer: '鲲化而为鹏，是同一事物的转化', hint: '庄子通过鲲鹏之变说明"化"的道理' },
      { q: '"怒而飞"中"怒"的意思是？', options: ['振奋、奋起', '愤怒', '怒气冲冲', '猛烈'], answer: '振奋、奋起', hint: '此处"怒"形容大鹏振翅高飞的气势' },
      { q: '《逍遥游》的主旨是？', options: ['追求绝对的精神自由', '追求功名利禄', '入世治国', '修身养性'], answer: '追求绝对的精神自由', hint: '庄子追求"无待"的逍遥境界' },
    ],
  },
  {
    id: 10,
    source: '《荀子·劝学》',
    text: '青，取之于蓝而青于蓝；冰，水为之而寒于水。学不可以已。君子博学而日参省乎己，则知明而行无过矣。',
    noPunct: '青取之于蓝而青于蓝冰水为之而寒于水学不可以已君子博学而日参省乎己则知明而行无过矣',
    punctOptions: [
      '青，取之于蓝而青于蓝；冰，水为之而寒于水。学不可以已。君子博学而日参省乎己，则知明而行无过矣。',
      '青，取之于蓝而青于蓝。冰，水为之而寒于水。学不可以已。君子博学而日参省乎己，则知明而行无过矣。',
      '青取之于蓝而青于蓝，冰水为之而寒于水。学不可以已。君子博学而日参省乎己，则知明而行无过矣。',
      '青，取之于蓝而青于蓝；冰，水为之而寒于水。学不可以已。君子博学而日参省乎己，则知明而行无过矣！',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"青，取之于蓝而青于蓝"常用来比喻什么？', options: ['学生超过老师，后人超越前人', '蓝色比青色好看', '染料来自植物', '颜色可以变化'], answer: '学生超过老师，后人超越前人', hint: '今义常用来形容弟子胜过老师' },
      { q: '"学不可以已"的意思是？', options: ['学习不可以停止', '学习不可以已经完成', '学习不可以太晚', '学习不可以太多'], answer: '学习不可以停止', hint: '"已"是停止的意思' },
      { q: '"知明而行无过"中"知"通哪个字？', options: ['智', '志', '之', '质'], answer: '智', hint: '此处"知"通"智"，智慧明达' },
    ],
  },
  {
    id: 11,
    source: '《史记·项羽本纪》',
    text: '项籍少时，学书不成，去学剑，又不成。项梁怒之。籍曰："书足以记名姓而已。剑一人敌，不足学，学万人敌。"',
    noPunct: '项籍少时学书不成去学剑又不成项梁怒之籍曰书足以记名姓而已剑一人敌不足学学万人敌',
    punctOptions: [
      '项籍少时，学书不成，去学剑，又不成。项梁怒之。籍曰："书足以记名姓而已。剑一人敌，不足学，学万人敌。"',
      '项籍少时，学书不成，去学剑，又不成。项梁怒之。籍曰："书足以记名姓而已；剑一人敌，不足学；学万人敌。"',
      '项籍少时学书不成，去学剑又不成。项梁怒之。籍曰："书足以记名姓而已。剑一人敌，不足学，学万人敌。"',
      '项籍少时，学书不成，去学剑，又不成。项梁怒之。籍曰："书足以记名姓而已。剑一人敌，不足学，学万人敌！"',
    ],
    punctAnswer: 0,
    questions: [
      { q: '项羽认为"书"的作用是什么？', options: ['只够记姓名', '可以治国安邦', '可以写文章', '可以读书明理'], answer: '只够记姓名', hint: '项羽志不在小，认为书法只够记名字' },
      { q: '"学万人敌"中的"万人敌"是指什么？', options: ['兵法韬略', '武艺高强', '以一敌万', '军事指挥'], answer: '兵法韬略', hint: '项羽要学的是能敌万人的兵法' },
      { q: '这段文字出自哪部史书？', options: ['《史记》', '《汉书》', '《资治通鉴》', '《左传》'], answer: '《史记》', hint: '《项羽本纪》是《史记》的名篇' },
    ],
  },
  {
    id: 12,
    source: '《出师表》诸葛亮',
    text: '臣亮言：先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。',
    noPunct: '臣亮言先帝创业未半而中道崩殂今天下三分益州疲弊此诚危急存亡之秋也然侍卫之臣不懈于内忠志之士忘身于外者盖追先帝之殊遇欲报之于陛下也',
    punctOptions: [
      '臣亮言：先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。',
      '臣亮言：先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也！',
      '臣亮言：先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者。盖追先帝之殊遇，欲报之于陛下也。',
      '臣亮言，先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"此诚危急存亡之秋也"中"秋"的意思是？', options: ['时刻、时期', '秋天', '年岁', '紧要关头'], answer: '时刻、时期', hint: '此处"秋"指关键时刻' },
      { q: '诸葛亮写《出师表》的主要目的是？', options: ['劝勉刘禅励精图治', '自述功绩', '辞官归隐', '弹劾奸臣'], answer: '劝勉刘禅励精图治', hint: '诸葛亮出师北伐前上表给后主刘禅' },
      { q: '"先帝创业未半而中道崩殂"中的"先帝"指的是？', options: ['刘备', '曹操', '孙权', '刘禅'], answer: '刘备', hint: '先帝指蜀汉昭烈帝刘备' },
    ],
  },
  {
    id: 13,
    source: '《桃花源记》陶渊明',
    text: '晋太元中，武陵人捕鱼为业。缘溪行，忘路之远近。忽逢桃花林，夹岸数百步，中无杂树，芳草鲜美，落英缤纷。',
    noPunct: '晋太元中武陵人捕鱼为业缘溪行忘路之远近忽逢桃花林夹岸数百步中无杂树芳草鲜美落英缤纷',
    punctOptions: [
      '晋太元中，武陵人捕鱼为业。缘溪行，忘路之远近。忽逢桃花林，夹岸数百步，中无杂树，芳草鲜美，落英缤纷。',
      '晋太元中，武陵人捕鱼为业。缘溪行，忘路之远近。忽逢桃花林，夹岸数百步，中无杂树，芳草鲜美，落英缤纷！',
      '晋太元中，武陵人捕鱼为业，缘溪行，忘路之远近。忽逢桃花林，夹岸数百步，中无杂树，芳草鲜美，落英缤纷。',
      '晋太元中武陵人捕鱼为业。缘溪行，忘路之远近。忽逢桃花林，夹岸数百步，中无杂树，芳草鲜美，落英缤纷。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"落英缤纷"的意思是？', options: ['落花繁多而纷乱', '落花飘零', '花瓣飘落', '草木茂盛'], answer: '落花繁多而纷乱', hint: '"英"指花，"缤纷"形容繁多而杂乱' },
      { q: '渔人"忘路之远近"的原因是？', options: ['被沿途美景吸引', '迷路了', '喝醉了', '天色已晚'], answer: '被沿途美景吸引', hint: '渔人被桃花林的美景所吸引' },
      { q: '《桃花源记》的作者是谁？', options: ['陶渊明', '王维', '孟浩然', '柳宗元'], answer: '陶渊明', hint: '陶渊明是东晋田园诗人' },
    ],
  },
  {
    id: 14,
    source: '《兰亭集序》王羲之',
    text: '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹。',
    noPunct: '永和九年岁在癸丑暮春之初会于会稽山阴之兰亭修禊事也群贤毕至少长咸集此地有崇山峻岭茂林修竹',
    punctOptions: [
      '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹。',
      '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集；此地有崇山峻岭，茂林修竹。',
      '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭、茂林修竹。',
      '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹！',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"修禊事也"中的"禊"指的是什么活动？', options: ['古人春日的祭祀祈福活动', '修建寺庙', '修桥补路', '读书讲学'], answer: '古人春日的祭祀祈福活动', hint: '禊是古人消除不祥的祭礼' },
      { q: '"群贤毕至，少长咸集"的意思是？', options: ['众多贤才都到了，年少年长都聚集在一起', '许多人来到，老少咸宜', '贤能的人离开了', '大家都在讨论'], answer: '众多贤才都到了，年少年长都聚集在一起', hint: '形容兰亭集会之盛况' },
      { q: '《兰亭集序》被誉为什么？', options: ['天下第一行书', '天下第一草书', '天下第一楷书', '天下第一隶书'], answer: '天下第一行书', hint: '王羲之的书法代表作' },
    ],
  },
  {
    id: 15,
    source: '《岳阳楼记》范仲淹',
    text: '予观夫巴陵胜状，在洞庭一湖。衔远山，吞长江，浩浩汤汤，横无际涯；朝晖夕阴，气象万千。此则岳阳楼之大观也。',
    noPunct: '予观夫巴陵胜状在洞庭一湖衔远山吞长江浩浩汤汤横无际涯朝晖夕阴气象万千此则岳阳楼之大观也',
    punctOptions: [
      '予观夫巴陵胜状，在洞庭一湖。衔远山，吞长江，浩浩汤汤，横无际涯；朝晖夕阴，气象万千。此则岳阳楼之大观也。',
      '予观夫巴陵胜状，在洞庭一湖。衔远山，吞长江，浩浩汤汤，横无际涯；朝晖夕阴，气象万千。此则岳阳楼之大观也！',
      '予观夫巴陵胜状，在洞庭一湖。衔远山，吞长江，浩浩汤汤，横无际涯。朝晖夕阴，气象万千。此则岳阳楼之大观也。',
      '予观夫巴陵胜状在洞庭一湖。衔远山，吞长江，浩浩汤汤，横无际涯；朝晖夕阴，气象万千。此则岳阳楼之大观也。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"浩浩汤汤"形容的是什么？', options: ['水势浩大的样子', '军队行进', '气势磅礴', '声音洪亮'], answer: '水势浩大的样子', hint: '形容洞庭湖的壮阔气势' },
      { q: '"朝晖夕阴，气象万千"的意思是？', options: ['早晨阳光灿烂傍晚阴暗，景色千变万化', '早晚天气不同', '日出日落', '阴阳变化'], answer: '早晨阳光灿烂傍晚阴暗，景色千变万化', hint: '描写洞庭湖早晚景色的变化' },
      { q: '《岳阳楼记》中表达作者志向的名句是？', options: ['先天下之忧而忧，后天下之乐而乐', '不以物喜，不以己悲', '居庙堂之高则忧其民', '微斯人，吾谁与归'], answer: '先天下之忧而忧，后天下之乐而乐', hint: '这是范仲淹最著名的政治抱负' },
    ],
  },
  {
    id: 16,
    source: '《醉翁亭记》欧阳修',
    text: '环滁皆山也。其西南诸峰，林壑尤美。望之蔚然而深秀者，琅琊也。山行六七里，渐闻水声潺潺而泻出于两峰之间者，酿泉也。',
    noPunct: '环滁皆山也其西南诸峰林壑尤美望之蔚然而深秀者琅琊也山行六七里渐闻水声潺潺而泻出于两峰之间者酿泉也',
    punctOptions: [
      '环滁皆山也。其西南诸峰，林壑尤美。望之蔚然而深秀者，琅琊也。山行六七里，渐闻水声潺潺而泻出于两峰之间者，酿泉也。',
      '环滁皆山也。其西南诸峰，林壑尤美；望之蔚然而深秀者，琅琊也。山行六七里，渐闻水声潺潺而泻出于两峰之间者，酿泉也。',
      '环滁皆山也。其西南诸峰，林壑尤美。望之蔚然而深秀者，琅琊也。山行六七里，渐闻水声潺潺，而泻出于两峰之间者，酿泉也。',
      '环滁皆山也。其西南诸峰，林壑尤美；望之蔚然而深秀者，琅琊也。山行六七里，渐闻水声潺潺，而泻出于两峰之间者，酿泉也。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"蔚然而深秀"描写的是什么？', options: ['树木茂盛幽深秀丽的样子', '颜色深绿', '高大雄伟', '深邃幽暗'], answer: '树木茂盛幽深秀丽的样子', hint: '形容琅琊山草木茂盛、景色秀丽' },
      { q: '"水声潺潺"是哪种类型的修辞？', options: ['拟声词（象声词）', '比喻', '拟人', '夸张'], answer: '拟声词（象声词）', hint: '潺潺是模拟流水声音的词' },
      { q: '《醉翁亭记》的作者欧阳修是哪个朝代的？', options: ['北宋', '南宋', '唐代', '元代'], answer: '北宋', hint: '欧阳修是北宋文坛领袖' },
    ],
  },
  {
    id: 17,
    source: '《师说》韩愈',
    text: '古之学者必有师。师者，所以传道受业解惑也。人非生而知之者，孰能无惑？惑而不从师，其为惑也，终不解矣。',
    noPunct: '古之学者必有师师者所以传道受业解惑也人非生而知之者孰能无惑惑而不从师其为惑也终不解矣',
    punctOptions: [
      '古之学者必有师。师者，所以传道受业解惑也。人非生而知之者，孰能无惑？惑而不从师，其为惑也，终不解矣。',
      '古之学者必有师。师者，所以传道受业解惑也。人非生而知之者，孰能无惑？惑而不从师，其为惑也，终不解矣！',
      '古之学者必有师。师者，所以传道受业解惑也。人非生而知之者，孰能无惑？惑而不从师，其为惑也，终不解矣？',
      '古之学者必有师。师者，所以传道受业解惑也。人非生而知之者，孰能无惑？惑而不从师，其为惑也终不解矣。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"师者，所以传道受业解惑也"中"受"通哪个字？', options: ['授', '守', '收', '售'], answer: '授', hint: '"受"通"授"，传授的意思' },
      { q: '韩愈认为"惑而不从师"的结果是什么？', options: ['疑惑永远无法解开', '会越来越迷惑', '会被别人嘲笑', '会失去学习机会'], answer: '疑惑永远无法解开', hint: '有疑惑却不跟老师学习，疑惑始终无法解决' },
      { q: '《师说》主要批判了当时什么样的社会风气？', options: ['耻于从师学习', '过度崇拜老师', '不重视教育', '科举制度'], answer: '耻于从师学习', hint: '韩愈批评当时士大夫耻于从师的不良风气' },
    ],
  },
  {
    id: 18,
    source: '《阿房宫赋》杜牧',
    text: '六王毕，四海一。蜀山兀，阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。',
    noPunct: '六王毕四海一蜀山兀阿房出覆压三百余里隔离天日骊山北构而西折直走咸阳二川溶溶流入宫墙',
    punctOptions: [
      '六王毕，四海一。蜀山兀，阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。',
      '六王毕，四海一。蜀山兀，阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。',
      '六王毕、四海一，蜀山兀、阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。',
      '六王毕，四海一；蜀山兀，阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"六王毕，四海一"指的是什么历史事件？', options: ['秦始皇统一六国', '六国联合抗秦', '项羽灭秦', '刘邦建立汉朝'], answer: '秦始皇统一六国', hint: '六国灭亡，天下被秦统一' },
      { q: '"蜀山兀，阿房出"中"兀"的意思是？', options: ['山秃、树木被砍光', '突兀、高耸', '稳固', '孤立'], answer: '山秃、树木被砍光', hint: '四川的山被砍光了树木用来修建阿房宫' },
      { q: '《阿房宫赋》的主旨是？', options: ['借古讽今，警告统治者不要奢靡', '歌颂秦朝的强大', '描写宫殿的壮丽', '怀念六国'], answer: '借古讽今，警告统治者不要奢靡', hint: '杜牧通过阿房宫的兴废警示当朝统治者' },
    ],
  },
  {
    id: 19,
    source: '《赤壁赋》苏轼',
    text: '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。',
    noPunct: '壬戌之秋七月既望苏子与客泛舟游于赤壁之下清风徐来水波不兴起举酒属客诵明月之诗歌窈窕之章',
    punctOptions: [
      '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。',
      '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴；举酒属客，诵明月之诗，歌窈窕之章。',
      '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗、歌窈窕之章。',
      '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗歌窈窕之章。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"七月既望"中的"既望"指的是？', options: ['农历十六日', '农历十五日', '望日之后', '月圆之夜'], answer: '农历十六日', hint: '"望"指农历十五，"既望"指十六日' },
      { q: '"清风徐来，水波不兴"营造了怎样的意境？', options: ['宁静闲适的意境', '狂风大浪', '凄清冷寂', '热闹非凡'], answer: '宁静闲适的意境', hint: '清风缓缓吹来，水面波澜不惊' },
      { q: '苏轼《赤壁赋》中的"赤壁"与历史上哪场战役有关？', options: ['赤壁之战', '官渡之战', '淝水之战', '垓下之战'], answer: '赤壁之战', hint: '苏轼游的是黄州赤壁，但联想到三国赤壁之战' },
    ],
  },
  {
    id: 20,
    source: '《秋声赋》欧阳修',
    text: '欧阳子方夜读书，闻有声自西南来者，悚然而听之，曰："异哉！"初淅沥以萧飒，忽奔腾而砰湃，如波涛夜惊，风雨骤至。',
    noPunct: '欧阳子方夜读书闻有声自西南来者悚然而听之曰异哉初淅沥以萧飒忽奔腾而砰湃如波涛夜惊风雨骤至',
    punctOptions: [
      '欧阳子方夜读书，闻有声自西南来者，悚然而听之，曰："异哉！"初淅沥以萧飒，忽奔腾而砰湃，如波涛夜惊，风雨骤至。',
      '欧阳子方夜读书，闻有声自西南来者，悚然而听之，曰："异哉！"初淅沥以萧飒；忽奔腾而砰湃；如波涛夜惊，风雨骤至。',
      '欧阳子方夜读书，闻有声自西南来者。悚然而听之，曰："异哉！"初淅沥以萧飒，忽奔腾而砰湃，如波涛夜惊，风雨骤至。',
      '欧阳子方夜读书，闻有声自西南来者，悚然而听之，曰："异哉！"初淅沥以萧飒，忽奔腾而砰湃。如波涛夜惊，风雨骤至。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"悚然而听之"中"悚然"的意思是？', options: ['惊恐的样子', '恭敬的样子', '认真的样子', '愉悦的样子'], answer: '惊恐的样子', hint: '欧阳修被突如其来的声音惊到' },
      { q: '作者用"淅沥""萧飒""奔腾""砰湃"描写什么？', options: ['秋声（秋天的声音）', '雨声', '风声', '水声'], answer: '秋声（秋天的声音）', hint: '这些都是作者对秋声的形容' },
      { q: '《秋声赋》中作者通过描写秋声表达了什么情感？', options: ['对人生易老、世事艰难的感慨', '对秋天美景的赞美', '对丰收的喜悦', '对战争的恐惧'], answer: '对人生易老、世事艰难的感慨', hint: '借秋声抒发对人生和世事的感慨' },
    ],
  },
  {
    id: 21,
    source: '《文心雕龙·原道》刘勰',
    text: '文之为德也大矣，与天地并生者何哉？夫玄黄色杂，方圆体分；日月叠璧，以垂丽天之象；山川焕绮，以铺理地之形。此盖道之文也。',
    noPunct: '文之为德也大矣与天地并生者何哉夫玄黄色杂方圆体分日月叠璧以垂丽天之象山川焕绮以铺理地之形此盖道之文也',
    punctOptions: [
      '文之为德也大矣，与天地并生者何哉？夫玄黄色杂，方圆体分；日月叠璧，以垂丽天之象；山川焕绮，以铺理地之形。此盖道之文也。',
      '文之为德也大矣，与天地并生者何哉？夫玄黄色杂，方圆体分；日月叠璧，以垂丽天之象；山川焕绮，以铺理地之形；此盖道之文也。',
      '文之为德也大矣，与天地并生者何哉。夫玄黄色杂，方圆体分；日月叠璧，以垂丽天之象；山川焕绮，以铺理地之形。此盖道之文也。',
      '文之为德也大矣，与天地并生者，何哉？夫玄黄色杂，方圆体分；日月叠璧，以垂丽天之象；山川焕绮，以铺理地之形。此盖道之文也。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"文之为德也大矣"中"文"指的是？', options: ['文章、文学、文化', '文字', '文采', '文明'], answer: '文章、文学、文化', hint: '刘勰在此讨论文学的起源和本质' },
      { q: '"此盖道之文也"中的"道"指的是？', options: ['自然之道、天地规律', '道家思想', '道理', '道路'], answer: '自然之道、天地规律', hint: '刘勰认为文章源于自然之道' },
      { q: '《文心雕龙》是中国文学批评史上什么地位？', options: ['第一部系统的文学理论著作', '第一部诗歌总集', '第一部小说', '第一部散文集'], answer: '第一部系统的文学理论著作', hint: '刘勰的《文心雕龙》体系完备' },
    ],
  },
  {
    id: 22,
    source: '《诗品序》钟嵘',
    text: '气之动物，物之感人，故摇荡性情，形诸舞咏。照烛三才，晖丽万有，灵祇待之以致飨，幽微藉之以昭告。动天地，感鬼神，莫近于诗。',
    noPunct: '气之动物物之感人故摇荡性情形诸舞咏照烛三才晖丽万有灵祇待之以致飨幽微藉之以昭告动天地感鬼神莫近于诗',
    punctOptions: [
      '气之动物，物之感人，故摇荡性情，形诸舞咏。照烛三才，晖丽万有，灵祇待之以致飨，幽微藉之以昭告。动天地，感鬼神，莫近于诗。',
      '气之动物，物之感人，故摇荡性情，形诸舞咏。照烛三才，晖丽万有；灵祇待之以致飨，幽微藉之以昭告。动天地，感鬼神，莫近于诗。',
      '气之动物，物之感人，故摇荡性情，形诸舞咏。照烛三才晖丽万有，灵祇待之以致飨，幽微藉之以昭告。动天地，感鬼神，莫近于诗。',
      '气之动物，物之感人，故摇荡性情，形诸舞咏。照烛三才，晖丽万有，灵祇待之以致飨，幽微藉之以昭告。动天地感鬼神，莫近于诗。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"气之动物，物之感人"的意思是？', options: ['节气使万物变化，万物又感动人心', '呼吸使动物运动', '气体推动物体', '空气流动使人感动'], answer: '节气使万物变化，万物又感动人心', hint: '这是钟嵘对诗歌起源的解释' },
      { q: '"动天地，感鬼神，莫近于诗"说明诗歌具有怎样的力量？', options: ['感动天地鬼神的巨大力量', '诗歌是宗教仪式', '诗歌可以召唤鬼神', '诗歌可以摇动天地'], answer: '感动天地鬼神的巨大力量', hint: '强调诗歌的感染力和影响力' },
      { q: '《诗品》的作者钟嵘是哪个朝代的？', options: ['南朝梁', '唐代', '汉代', '宋代'], answer: '南朝梁', hint: '钟嵘是南朝梁代的文学批评家' },
    ],
  },
  {
    id: 23,
    source: '《人间词话》王国维',
    text: '词以境界为最上。有境界则自成高格，自有名句。五代北宋之词所以独绝者在此。有造境，有写境，此理想与写实二派之所由分。',
    noPunct: '词以境界为最上有境界则自成高格自有名句五代北宋之词所以独绝者在此有造境有写境此理想与写实二派之所由分',
    punctOptions: [
      '词以境界为最上。有境界则自成高格，自有名句。五代北宋之词所以独绝者在此。有造境，有写境，此理想与写实二派之所由分。',
      '词以境界为最上。有境界则自成高格，自有名句。五代北宋之词所以独绝者在此；有造境，有写境，此理想与写实二派之所由分。',
      '词以境界为最上。有境界则自成高格，自有名句。五代北宋之词所以独绝者在此。有造境，有写境，此理想与写实二派之所由分。',
      '词以境界为最上。有境界则自成高格，自有名句。五代北宋之词所以独绝者在此。有造境有写境，此理想与写实二派之所由分。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '王国维认为"词以境界为最上"，"境界"指的是？', options: ['作品所营造的艺术意境', '人的道德境界', '作品的篇幅', '词人的地位'], answer: '作品所营造的艺术意境', hint: '境界是王国维词论的核心概念' },
      { q: '"有造境，有写境"中的"造境"和"写境"指的是什么？', options: ['理想派创造意境，写实派描写实境', '虚构和纪实', '创作和抄写', '建设环境和书写环境'], answer: '理想派创造意境，写实派描写实境', hint: '造境是理想派，写境是写实派' },
      { q: '《人间词话》的作者是谁？', options: ['王国维', '梁启超', '胡适', '鲁迅'], answer: '王国维', hint: '王国维是近代著名学者' },
    ],
  },
  {
    id: 24,
    source: '《说文解字序》许慎',
    text: '古者庖牺氏之王天下也，仰则观象于天，俯则观法于地，视鸟兽之文与地之宜，近取诸身，远取诸物，于是始作易八卦，以垂宪象。',
    noPunct: '古者庖牺氏之王天下也仰则观象于天俯则观法于地视鸟兽之文与地之宜近取诸身远取诸物于是始作易八卦以垂宪象',
    punctOptions: [
      '古者庖牺氏之王天下也，仰则观象于天，俯则观法于地，视鸟兽之文与地之宜，近取诸身，远取诸物，于是始作易八卦，以垂宪象。',
      '古者庖牺氏之王天下也，仰则观象于天，俯则观法于地，视鸟兽之文与地之宜，近取诸身，远取诸物，于是始作易八卦，以垂宪象。',
      '古者庖牺氏之王天下也，仰则观象于天，俯则观法于地，视鸟兽之文与地之宜，近取诸身，远取诸物。于是始作易八卦，以垂宪象。',
      '古者庖牺氏之王天下也，仰则观象于天，俯则观法于地，视鸟兽之文与地之宜。近取诸身，远取诸物，于是始作易八卦，以垂宪象。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"仰则观象于天，俯则观法于地"描述了庖牺氏创造什么的过程？', options: ['创造八卦', '创造文字', '制定历法', '制定法律'], answer: '创造八卦', hint: '庖牺氏（伏羲）通过观察天地万物创造了八卦' },
      { q: '"近取诸身，远取诸物"体现了什么方法论？', options: ['从自身和外界事物中获取灵感', '从近处和远处获取物品', '关心自己和他人', '取长补短'], answer: '从自身和外界事物中获取灵感', hint: '这是中国古代观物取象的思维方法' },
      { q: '《说文解字》的作者许慎是什么朝代的？', options: ['东汉', '西汉', '唐代', '宋代'], answer: '东汉', hint: '许慎是东汉著名文字学家' },
    ],
  },
  {
    id: 25,
    source: '《典论·论文》曹丕',
    text: '文人相轻，自古而然。傅毅之于班固，伯仲之间耳，而固小之。夫人善于自见，而文非一体，鲜能备善，是以各以所长，相轻所短。',
    noPunct: '文人相轻自古而然傅毅之于班固伯仲之间耳而固小之夫人善于自见而文非一体鲜能备善是以各以所长相轻所短',
    punctOptions: [
      '文人相轻，自古而然。傅毅之于班固，伯仲之间耳，而固小之。夫人善于自见，而文非一体，鲜能备善，是以各以所长，相轻所短。',
      '文人相轻，自古而然。傅毅之于班固，伯仲之间耳，而固小之。夫人善于自见；而文非一体；鲜能备善；是以各以所长，相轻所短。',
      '文人相轻，自古而然。傅毅之于班固，伯仲之间耳，而固小之。夫人善于自见，而文非一体鲜能备善，是以各以所长，相轻所短。',
      '文人相轻，自古而然。傅毅之于班固，伯仲之间耳，而固小之。夫人善于自见，而文非一体，鲜能备善。是以各以所长，相轻所短。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"文人相轻"的意思是？', options: ['文人之间互相轻视', '文人很轻浮', '文人身体轻盈', '文人性格轻率'], answer: '文人之间互相轻视', hint: '曹丕指出文人存在互相看不起的毛病' },
      { q: '"傅毅之于班固，伯仲之间耳"中的"伯仲"指？', options: ['水平相当，不相上下', '兄弟关系', '长辈和晚辈', '领导和下属'], answer: '水平相当，不相上下', hint: '伯仲原指兄弟长幼次序，引申为不相上下' },
      { q: '曹丕认为文人相轻的原因是什么？', options: ['各以所长，相轻所短', '文人天生骄傲', '社会风气不好', '竞争太激烈'], answer: '各以所长，相轻所短', hint: '每个人用自己的长处去轻视别人的短处' },
    ],
  },
  {
    id: 26,
    source: '《与山巨源绝交书》嵇康',
    text: '康白：足下昔称吾于颍川，吾常谓之知言。然经怪此意尚未熟悉于足下，何从便得之也？前年从河东还，显宗、阿都说足下议以吾自代，事虽不行，知足下故不知之。',
    noPunct: '康白足下昔称吾于颍川吾常谓之知言然经怪此意尚未熟悉于足下何从便得之也前年从河东还显宗阿都说足下议以吾自代事虽不行知足下故不知之',
    punctOptions: [
      '康白：足下昔称吾于颍川，吾常谓之知言。然经怪此意尚未熟悉于足下，何从便得之也？前年从河东还，显宗、阿都说足下议以吾自代，事虽不行，知足下故不知之。',
      '康白：足下昔称吾于颍川，吾常谓之知言。然经怪此意尚未熟悉于足下，何从便得之也？前年从河东还，显宗、阿都说足下议以吾自代。事虽不行，知足下故不知之。',
      '康白：足下昔称吾于颍川，吾常谓之知言。然经怪此意尚未熟悉于足下，何从便得之也；前年从河东还，显宗、阿都说足下议以吾自代，事虽不行，知足下故不知之。',
      '康白：足下昔称吾于颍川，吾常谓之知言。然经怪此意尚未熟悉于足下，何从便得之也？前年从河东还。显宗、阿都说足下议以吾自代，事虽不行，知足下故不知之。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '嵇康写这封信的主要目的是？', options: ['拒绝山涛的举荐并声明绝交', '感谢山涛的推荐', '讨论做官的好处', '推荐他人代替自己'], answer: '拒绝山涛的举荐并声明绝交', hint: '山巨源（山涛）想举荐嵇康代自己的官职' },
      { q: '"足下"在古文中是对对方的什么称呼？', options: ['敬称', '谦称', '蔑称', '昵称'], answer: '敬称', hint: '"足下"是古代对对方的尊称' },
      { q: '嵇康是"竹林七贤"之一，"竹林七贤"活跃于哪个时期？', options: ['魏晋时期', '春秋时期', '唐代', '宋代'], answer: '魏晋时期', hint: '竹林七贤是魏晋时期的文人群体' },
    ],
  },
  {
    id: 27,
    source: '《送东阳马生序》宋濂',
    text: '余幼时即嗜学。家贫，无从致书以观，每假借于藏书之家，手自笔录，计日以还。天大寒，砚冰坚，手指不可屈伸，弗之怠。录毕，走送之，不敢稍逾约。',
    noPunct: '余幼时即嗜学家贫无从致书以观每假借于藏书之家手自笔录计日以还天大寒砚冰坚手指不可屈伸弗之怠录毕走送之不敢稍逾约',
    punctOptions: [
      '余幼时即嗜学。家贫，无从致书以观，每假借于藏书之家，手自笔录，计日以还。天大寒，砚冰坚，手指不可屈伸，弗之怠。录毕，走送之，不敢稍逾约。',
      '余幼时即嗜学。家贫，无从致书以观，每假借于藏书之家，手自笔录，计日以还。天大寒砚冰坚，手指不可屈伸，弗之怠。录毕，走送之，不敢稍逾约。',
      '余幼时即嗜学。家贫，无从致书以观，每假借于藏书之家，手自笔录，计日以还。天大寒，砚冰坚，手指不可屈伸，弗之怠。录毕走送之，不敢稍逾约。',
      '余幼时即嗜学。家贫，无从致书以观，每假借于藏书之家，手自笔录，计日以还。天大寒，砚冰坚，手指不可屈伸。弗之怠。录毕，走送之，不敢稍逾约。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"无从致书以观"中"致"的意思是？', options: ['得到、获取', '导致', '精致', '招致'], answer: '得到、获取', hint: '没有钱买书来看' },
      { q: '"手自笔录，计日以还"体现了作者怎样的品质？', options: ['勤奋刻苦，守信守时', '手巧能写', '善于计算', '乐于助人'], answer: '勤奋刻苦，守信守时', hint: '亲手抄写，按时归还，体现作者的勤奋和诚信' },
      { q: '《送东阳马生序》的作者宋濂是哪个朝代的？', options: ['明代', '元代', '宋代', '清代'], answer: '明代', hint: '宋濂是明初文学家' },
    ],
  },
  {
    id: 28,
    source: '《黄生借书说》袁枚',
    text: '书非借不能读也。子不闻藏书者乎？七略四库，天子之书，然天子读书者有几？汗牛塞屋，富贵家之书，然富贵人读书者有几？其他祖父积、子孙弃者无论焉。',
    noPunct: '书非借不能读也子不闻藏书者乎七略四库天子之书然天子读书者有几汗牛塞屋富贵家之书然富贵人读书者有几其他祖父积子孙弃者无论焉',
    punctOptions: [
      '书非借不能读也。子不闻藏书者乎？七略四库，天子之书，然天子读书者有几？汗牛塞屋，富贵家之书，然富贵人读书者有几？其他祖父积、子孙弃者无论焉。',
      '书非借不能读也。子不闻藏书者乎；七略四库，天子之书，然天子读书者有几；汗牛塞屋，富贵家之书，然富贵人读书者有几；其他祖父积、子孙弃者无论焉。',
      '书非借不能读也，子不闻藏书者乎？七略四库，天子之书，然天子读书者有几？汗牛塞屋，富贵家之书，然富贵人读书者有几？其他祖父积、子孙弃者无论焉。',
      '书非借不能读也。子不闻藏书者乎？七略四库，天子之书，然天子读书者有几？汗牛塞屋，富贵家之书。然富贵人读书者有几？其他祖父积、子孙弃者无论焉。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"书非借不能读也"的意思是？', options: ['书不是借来的就不会认真去读', '借来的书不能读', '书不是借的就不能读', '书不借出去就不能读'], answer: '书不是借来的就不会认真去读', hint: '因为借的书要还，所以会抓紧时间读' },
      { q: '"汗牛塞屋"形容什么？', options: ['藏书极多', '牛出汗了', '屋子很挤', '工作辛苦'], answer: '藏书极多', hint: '形容富贵人家藏书之多' },
      { q: '作者袁枚是哪个朝代的文学家？', options: ['清代', '明代', '宋代', '元代'], answer: '清代', hint: '袁枚是清代性灵派诗人' },
    ],
  },
  {
    id: 29,
    source: '《病梅馆记》龚自珍',
    text: '江宁之龙蟠，苏州之邓尉，杭州之西溪，皆产梅。或曰：梅以曲为美，直则无姿；以欹为美，正则无景；以疏为美，密则无态。',
    noPunct: '江宁之龙蟠苏州之邓尉杭州之西溪皆产梅或曰梅以曲为美直则无姿以欹为美正则无景以疏为美密则无态',
    punctOptions: [
      '江宁之龙蟠，苏州之邓尉，杭州之西溪，皆产梅。或曰：梅以曲为美，直则无姿；以欹为美，正则无景；以疏为美，密则无态。',
      '江宁之龙蟠，苏州之邓尉，杭州之西溪，皆产梅。或曰：梅以曲为美，直则无姿；以欹为美，正则无景；以疏为美，密则无态。',
      '江宁之龙蟠，苏州之邓尉，杭州之西溪，皆产梅。或曰：梅以曲为美，直则无姿；以欹为美，正则无景；以疏为美，密则无态。',
      '江宁之龙蟠，苏州之邓尉，杭州之西溪，皆产梅。或曰：梅以曲为美，直则无姿；以欹为美，正则无景；以疏为美，密则无态。',
    ],
    punctAnswer: 0,
    questions: [
      { q: '"梅以曲为美"反映了当时什么样的审美风气？', options: ['病态扭曲的审美观', '崇尚自然美', '追求极致之美', '重视对称之美'], answer: '病态扭曲的审美观', hint: '龚自珍借病梅批判社会对人才的扭曲' },
      { q: '《病梅馆记》是一篇什么性质的文章？', options: ['托物言志的讽刺散文', '植物学论文', '游记', '传记'], answer: '托物言志的讽刺散文', hint: '借病梅批判社会压制人才的现象' },
      { q: '作者龚自珍是哪个时期的？', options: ['清末', '明末', '宋末', '元末'], answer: '清末', hint: '龚自珍是晚清思想家、文学家' },
    ],
  },
  {
    id: 30,
    source: '《少年中国说》梁启超',
    text: '欲言国之老少，请先言人之老少。老年人常思既往，少年人常思将来。惟思既往也，故生留恋心；惟思将来也，故生希望心。惟留恋也故保守，惟希望也故进取。',
    noPunct: '欲言国之老少请先言人之老少老年人常思既往少年人常思将来惟思既往也故生留恋心惟思将来也故生希望心惟留恋也故保守惟希望也故进取',
    punctOptions: [
      '欲言国之老少，请先言人之老少。老年人常思既往，少年人常思将来。惟思既往也，故生留恋心；惟思将来也，故生希望心。惟留恋也故保守，惟希望也故进取。',
      '欲言国之老少，请先言人之老少。老年人常思既往，少年人常思将来。惟思既往也，故生留恋心；惟思将来也，故生希望心。惟留恋也故保守；惟希望也故进取。',
      '欲言国之老少，请先言人之老少。老年人常思既往，少年人常思将来。惟思既往也，故生留恋心；惟思将来也，故生希望心。惟留恋也，故保守；惟希望也，故进取。',
      '欲言国之老少，请先言人之老少。老年人常思既往，少年人常思将来。惟思既往也故生留恋心，惟思将来也故生希望心。惟留恋也故保守，惟希望也故进取。',
    ],
    punctAnswer: 2,
    questions: [
      { q: '梁启超将老年人和少年人对比，意在说明什么？', options: ['少年进取则国进取，少年强则国强', '老年人应该退休', '少年应该听老年人的话', '老年人和少年人没有区别'], answer: '少年进取则国进取，少年强则国强', hint: '以人之老少比喻国之盛衰' },
      { q: '"惟思既往也，故生留恋心"中的"惟"意思是？', options: ['因为', '唯一', '只有', '希望'], answer: '因为', hint: '"惟"在此处表示原因' },
      { q: '《少年中国说》体现了梁启超什么思想？', options: ['维新变法、改造国民精神', '保守传统', '全盘西化', '恢复帝制'], answer: '维新变法、改造国民精神', hint: '梁启超是维新派的代表人物' },
    ],
  },
]);

// ---- Translation Sentence Pool (30, one per passage, progressively harder) ----
const translationItems = ref<TranslationItem[]>([
  { id: 1, original: '学而时习之，不亦说乎？', source: '《论语·学而》', options: ['学习并时常温习，不也很愉快吗？', '学习并且按时练习，不是很能说吗？', '学过了要及时复习，不是很会说话吗？', '学习并时常练习，不是很能说会道吗？'], answer: 0 },
  { id: 2, original: '三十而立，四十而不惑。', source: '《论语·为政》', options: ['三十岁能自立，四十岁能不被外界事物迷惑', '三十岁站着，四十岁不疑惑', '三十岁立业成家，四十岁没有疑问', '三十岁独立，四十岁不再迷惑'], answer: 0 },
  { id: 3, original: '王何必曰利？亦有仁义而已矣。', source: '《孟子·梁惠王上》', options: ['大王何必谈利益？只要有仁义就够了', '大王为什么说利益？还是有仁义才行', '大王不一定要讲利，仁义就够了', '大王何必说利？也只有仁义罢了'], answer: 0 },
  { id: 4, original: '大学之道，在明明德，在亲民，在止于至善。', source: '《大学》', options: ['大学的宗旨在于弘扬光明正大的品德，在于使人弃旧图新，在于达到最完善的境界', '大学的道理在于明白道德，在于亲近民众，在于达到善良', '大学问的途径在于明白德行，在于爱民，在于追求完美', '大学的原理是阐明道德，是亲近人民，是止于至善'], answer: 0 },
  { id: 5, original: '天命之谓性，率性之谓道，修道之谓教。', source: '《中庸》', options: ['天所赋予的叫作性，遵循本性叫作道，修明道叫作教', '天命就是性，率领性就是道，修行道就是教', '天的命令是性，顺着性是道，修习道是教育', '天命的叫作本性，率性的叫作道路，修道的叫作教化'], answer: 0 },
  { id: 6, original: '窈窕淑女，君子好逑。', source: '《诗经·关雎》', options: ['美丽善良的姑娘，是君子的好配偶', '苗条的女子，君子都爱追求', '窈窕的淑女，君子喜欢追求', '美丽的女子，君子爱好追求'], answer: 0 },
  { id: 7, original: '大道之行也，天下为公。', source: '《礼记·礼运》', options: ['在大道施行的时候，天下是公共的', '大路通行的时候，天下人都很公正', '崇高的道德施行时，天下人都为公着想', '大道运行的时候，天下是公平的'], answer: 0 },
  { id: 8, original: '道可道，非常道；名可名，非常名。', source: '《老子》', options: ['可以用言语表述的道，就不是永恒的道；可以用名称命名的名，就不是永恒的名', '道理可以说道，不是通常的道理；名字可以命名，不是通常的名字', '道可以说，不是常道；名可以叫，不是常名', '可以说的道不是真正的道，可以命名的名不是真正的名'], answer: 0 },
  { id: 9, original: '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。', source: '《庄子·逍遥游》', options: ['北方的大海里有一条鱼，它的名字叫鲲。鲲之大，不知道它有几千里', '北冥有一种鱼，名字叫鲲。鲲的体型大，不知道有几千里', '北海有一种鱼叫鲲，鲲很大不知道几千里', '北冥有鱼名叫鲲，鲲非常大不知几千里'], answer: 0 },
  { id: 10, original: '青，取之于蓝而青于蓝；冰，水为之而寒于水。', source: '《荀子·劝学》', options: ['靛青是从蓝草中提取的，但比蓝草更青；冰是由水凝结成的，但比水更寒冷', '青色从蓝色来但比蓝更青，冰由水做成但比水更凉', '青从蓝草中来却胜过蓝，冰是水做的却比水冷', '青色来自蓝色却比蓝色青，冰由水变成却比水冷'], answer: 0 },
  { id: 11, original: '剑一人敌，不足学，学万人敌。', source: '《史记·项羽本纪》', options: ['剑术只能抵挡一人，不值得学，要学能抵挡万人的本事', '剑是一个人就能抵挡的，不够学，学对付万人的', '剑能敌一人不够学，要学敌万人', '剑术一对一可以，不值得学，学以一敌万的兵法'], answer: 0 },
  { id: 12, original: '此诚危急存亡之秋也。', source: '《出师表》诸葛亮', options: ['这确实是危急存亡的关键时刻', '这真是危急存亡的秋天', '这正是危急存亡的年头', '这的确是生死存亡之际'], answer: 0 },
  { id: 13, original: '芳草鲜美，落英缤纷。', source: '《桃花源记》陶渊明', options: ['芳香的青草鲜嫩美丽，坠落的花瓣繁多纷乱', '芳草味道鲜美，花瓣五彩缤纷', '青草和花朵都很美丽，落花四处飘散', '香草美丽新鲜，落花繁多'], answer: 0 },
  { id: 14, original: '群贤毕至，少长咸集。', source: '《兰亭集序》王羲之', options: ['众多贤才都到了，年少年长的都聚集在一起', '群贤全部到达，老少都来集合', '贤人们都来了，年少年长的都到了', '各路贤才都到了，不分老少都聚集了'], answer: 0 },
  { id: 15, original: '衔远山，吞长江，浩浩汤汤，横无际涯。', source: '《岳阳楼记》范仲淹', options: ['（洞庭湖）连接着远山，吞吐着长江，水势浩大，广阔无边', '嘴里衔着远山，吞下长江，浩浩荡荡没有边际', '含着远处的山，吞入长江水，波涛汹涌辽阔无际', '远山在口，长江入腹，水流浩大无边无际'], answer: 0 },
  { id: 16, original: '醉翁之意不在酒，在乎山水之间也。', source: '《醉翁亭记》欧阳修', options: ['醉翁的心思不在酒上，而在山水之间的景色中', '醉翁的意思不是喝酒，是看山水', '醉翁的意图不在于酒，在于山水风光', '醉翁的本意不在喝酒，在于山水之间'], answer: 0 },
  { id: 17, original: '师者，所以传道受业解惑也。', source: '《师说》韩愈', options: ['老师，是用来传授道理、教授学业、解答疑惑的', '老师是传道授业解惑的人', '老师是传播道义、授予学问、解决困惑的人', '老师就是讲道理、教课业、解疑惑的人'], answer: 0 },
  { id: 18, original: '六王毕，四海一。蜀山兀，阿房出。', source: '《阿房宫赋》杜牧', options: ['六国灭亡了，天下统一了。蜀地的山林被砍秃了，阿房宫才建起来', '六王完成了使命，四海归一，蜀山光秃，阿房宫出现了', '六位君王去世，天下统一，蜀山变秃，阿房宫建成', '六国君王死了，天下统一，四川的山秃了，阿房宫出来了'], answer: 0 },
  { id: 19, original: '清风徐来，水波不兴。', source: '《赤壁赋》苏轼', options: ['清风缓缓吹来，水面波澜不起', '清风吹来，水波不动', '凉风慢慢吹来，水面没有波浪', '清风慢慢吹过来，水波没有兴起'], answer: 0 },
  { id: 20, original: '初淅沥以萧飒，忽奔腾而砰湃。', source: '《秋声赋》欧阳修', options: ['起初是淅淅沥沥的雨声夹杂着萧飒的风声，忽然间奔腾澎湃起来', '开始时淅沥沥又萧飒飒，忽然间奔腾澎湃', '初时雨声风声淅沥萧飒，忽然波涛奔腾澎湃', '先是淅沥萧飒的声音，突然奔腾砰湃起来'], answer: 0 },
  { id: 21, original: '文之为德也大矣，与天地并生者何哉？', source: '《文心雕龙·原道》刘勰', options: ['文章的功用是多么广大啊，它和天地一起产生是为什么呢？', '文章的功德很大，和天地并存是为什么呢', '文学作为德行的作用很大，与天地同生是什么原因', '文章的道德很大，与天地共生的原因是什么'], answer: 0 },
  { id: 22, original: '动天地，感鬼神，莫近于诗。', source: '《诗品序》钟嵘', options: ['能够感动天地和鬼神的，没有比诗歌更贴近的了', '摇动天地感动鬼神，最快的是诗歌', '感动天地鬼神，没有比诗更好的了', '天地为之感动，鬼神为之感动的，最接近的是诗'], answer: 0 },
  { id: 23, original: '词以境界为最上。', source: '《人间词话》王国维', options: ['词以意境为最高的评判标准', '词以境界为最高级', '词最重要的是境界', '词以境界为最上乘'], answer: 0 },
  { id: 24, original: '仰则观象于天，俯则观法于地。', source: '《说文解字序》许慎', options: ['抬头观察天象，低头观察地理', '向上看天上的现象，向下看地上的法则', '仰头观测天象，俯身观察地理', '向上观察天文，向下观察地理'], answer: 0 },
  { id: 25, original: '文人相轻，自古而然。', source: '《典论·论文》曹丕', options: ['文人之间互相轻视，自古以来就是这样', '文人们互相看不起，从古代就如此', '文人互相看轻，自古以来就是这样的', '文人彼此轻视，从古到今都这样'], answer: 0 },
  { id: 26, original: '足下昔称吾于颍川，吾常谓之知言。', source: '《与山巨源绝交书》嵇康', options: ['您从前在颍川称赞我，我常常认为那是知己之言', '您过去在颍川称呼我，我经常说是知心话', '你从前在颍川推荐我，我常常认为是知音', '您之前称道我于颍川，我总说是知心话语'], answer: 0 },
  { id: 27, original: '天大寒，砚冰坚，手指不可屈伸，弗之怠。', source: '《送东阳马生序》宋濂', options: ['天气非常寒冷，砚台里的墨冻成了坚冰，手指冻得不能弯曲伸直，也不放松抄写', '天太冷砚台结冰，手指伸不直也不懈怠', '天气大寒砚冰坚硬，手指不能屈伸也不偷懒', '天大冷砚台冻冰，手指冻僵了也不停止'], answer: 0 },
  { id: 28, original: '书非借不能读也。', source: '《黄生借书说》袁枚', options: ['书不是借来的就不会认真去读', '书不是借来的就不能读', '书不借出去就不能读', '书如果不是借的就不能读'], answer: 0 },
  { id: 29, original: '梅以曲为美，直则无姿。', source: '《病梅馆记》龚自珍', options: ['梅花以弯曲为美，笔直了就没有姿态', '梅花认为弯曲是美的，直了就没姿态了', '梅树以曲折为美，直了就不好看了', '梅花以弯曲为美，直了就没有风姿'], answer: 0 },
  { id: 30, original: '老年人常思既往，少年人常思将来。', source: '《少年中国说》梁启超', options: ['老年人常常怀念过去，少年人常常思考未来', '老年人总是想以前，少年人总是想以后', '老年人常常回想过去的事，少年人常常考虑未来的事', '老年人经常想过去，少年人经常想将来'], answer: 0 },
]);

// ---- State ----
const readingActive = ref(false);
const readingIndex = ref(0);
const readingQuestionStarted = ref(false);
const readingQIndex = ref(0);
const readingSelected = ref('');
const readingQResult = ref<'correct' | 'wrong' | null>(null);
const readingScore = ref(0);

const punctActive = ref(false);
const punctIndex = ref(0);
const punctSelected = ref<number | null>(null);
const punctResult = ref<'correct' | 'wrong' | null>(null);
const punctScore = ref(0);

const transActive = ref(false);
const transIndex = ref(0);
const transSelected = ref<number | null>(null);
const transResult = ref<'correct' | 'wrong' | null>(null);
const transScore = ref(0);

// ---- LocalStorage ----
const MASTERED_KEY = 'zh-uni-classical-mastered';
const PROGRESS_KEY = 'zh-uni-classical-progress';
const WRONG_KEY = 'zh-uni-classical-wrong';

function loadSet(key: string): Set<number> {
  try {
    const raw = localStorage.getItem(key);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<number>();
  }
}

function saveSet(key: string, set: Set<number>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

const masteredSet = ref<Set<number>>(loadSet(MASTERED_KEY));
const punctCompletedSet = ref<Set<number>>(loadSet(`${PROGRESS_KEY}-punct`));
const transCompletedSet = ref<Set<number>>(loadSet(`${PROGRESS_KEY}-trans`));
const wrongSet = ref<Set<number>>(loadSet(WRONG_KEY));

function persistMastered() { saveSet(MASTERED_KEY, masteredSet.value); }
function persistPunctCompleted() { saveSet(`${PROGRESS_KEY}-punct`, punctCompletedSet.value); }
function persistTransCompleted() { saveSet(`${PROGRESS_KEY}-trans`, transCompletedSet.value); }
function persistWrong() { saveSet(WRONG_KEY, wrongSet.value); }

// ---- Computed ----
const masteredCount = computed(() => masteredSet.value.size);
const punctCompletedCount = computed(() => punctCompletedSet.value.size);
const studyProgress = computed(() => {
  const total = classicalPassages.value.length;
  if (total === 0) return 0;
  return Math.round((masteredSet.value.size / total) * 100);
});

// ---- Current Item Helpers ----
const currentPassage = computed(() => {
  const idx = readingIndex.value % classicalPassages.value.length;
  return classicalPassages.value[idx] ?? classicalPassages.value[0];
});

const currentReadingQuestion = computed(() => {
  const qs = currentPassage.value.questions;
  const qi = readingQIndex.value % qs.length;
  return qs[qi] ?? qs[0];
});

const currentPunctPassage = computed(() => {
  const idx = punctIndex.value % classicalPassages.value.length;
  return classicalPassages.value[idx] ?? classicalPassages.value[0];
});

const currentTransItem = computed(() => {
  const idx = transIndex.value % translationItems.value.length;
  return translationItems.value[idx] ?? translationItems.value[0];
});

// ---- Reading Mode ----
function startReading() {
  readingActive.value = true;
  readingIndex.value = 0;
  readingQuestionStarted.value = false;
  readingQIndex.value = 0;
  readingSelected.value = '';
  readingQResult.value = null;
  readingScore.value = 0;
}

function startReadingQuestions() {
  readingQuestionStarted.value = true;
  readingQIndex.value = 0;
  readingSelected.value = '';
  readingQResult.value = null;
}

function exitReading() {
  readingActive.value = false;
  readingQuestionStarted.value = false;
}

function checkReadingAnswer(opt: string) {
  if (readingSelected.value) return;
  readingSelected.value = opt;
  const correct = opt === currentReadingQuestion.value.answer;
  readingQResult.value = correct ? 'correct' : 'wrong';
  if (correct) readingScore.value++;
}

function nextReadingQuestion() {
  if (readingQIndex.value < 2) {
    readingQIndex.value++;
    readingSelected.value = '';
    readingQResult.value = null;
  } else {
    // Finished all 3 questions for this passage
    const xpEarned = readingScore.value * 15;
    gamification.addXp(xpEarned);

    const passageId = currentPassage.value.id;
    if (readingScore.value === 3) {
      masteredSet.value.add(passageId);
      persistMastered();
      message.success(`&#x1F4D6; 精读完成！全部答对，获得 ${xpEarned} XP`);
      if (masteredSet.value.size >= 10) gamification.unlockAchievement('char-100');
      if (masteredSet.value.size >= 20) gamification.unlockAchievement('char-500');
    } else {
      wrongSet.value.add(passageId);
      persistWrong();
      message.success(`精读完成！答对 ${readingScore.value}/3 题，获得 ${xpEarned} XP`);
    }

    // Move to next passage or show results
    readingIndex.value++;
    readingQuestionStarted.value = false;
    readingQIndex.value = 0;
    readingSelected.value = '';
    readingQResult.value = null;
    readingScore.value = 0;

    if (readingIndex.value >= classicalPassages.value.length) {
      readingActive.value = false;
      message.info('已完成所有篇章精读！');
    }
  }
}

// ---- Punctuation Mode ----
function startPunct() {
  punctActive.value = true;
  punctIndex.value = 0;
  punctSelected.value = null;
  punctResult.value = null;
  punctScore.value = 0;
}

function checkPunctAnswer(optIndex: number) {
  if (punctResult.value !== null) return;
  punctSelected.value = optIndex;
  const correct = optIndex === currentPunctPassage.value.punctAnswer;
  punctResult.value = correct ? 'correct' : 'wrong';
  if (correct) {
    punctScore.value++;
    gamification.addXp(10);
    punctCompletedSet.value.add(currentPunctPassage.value.id);
    persistPunctCompleted();
  } else {
    wrongSet.value.add(currentPunctPassage.value.id);
    persistWrong();
  }
}

function nextPunct() {
  punctIndex.value++;
  punctSelected.value = null;
  punctResult.value = null;
  if (punctIndex.value >= classicalPassages.value.length) {
    punctActive.value = false;
    message.success(`句读训练完成！答对 ${punctScore.value}/${classicalPassages.value.length} 题`);
  }
}

// ---- Translation Mode ----
function startTrans() {
  transActive.value = true;
  transIndex.value = 0;
  transSelected.value = null;
  transResult.value = null;
  transScore.value = 0;
}

function checkTransAnswer(optIndex: number) {
  if (transResult.value !== null) return;
  transSelected.value = optIndex;
  const correct = optIndex === currentTransItem.value.answer;
  transResult.value = correct ? 'correct' : 'wrong';
  if (correct) {
    transScore.value++;
    gamification.addXp(10);
    transCompletedSet.value.add(currentTransItem.value.id);
    persistTransCompleted();
  } else {
    wrongSet.value.add(currentTransItem.value.id);
    persistWrong();
  }
}

function nextTrans() {
  transIndex.value++;
  transSelected.value = null;
  transResult.value = null;
  if (transIndex.value >= translationItems.value.length) {
    transActive.value = false;
    message.success(`翻译练习完成！答对 ${transScore.value}/${translationItems.value.length} 题`);
  }
}

// ---- Lifecycle ----
onMounted(() => {
  if (masteredSet.value.size >= 10) gamification.unlockAchievement('char-100');
  if (masteredSet.value.size >= 20) gamification.unlockAchievement('char-500');
});
</script>

<style scoped>
.modal-enter-active { transition: all 0.3s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.9); }

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 10px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.dark .overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); }
</style>
