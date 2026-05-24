<template>
  <ChinesePageLayout>
    <ChineseHero icon="🏯" title="人文闯关" subtitle="大学人文素养闯关 · 先秦文学 / 诗词 / 成语 / 修辞 / 文献学" backTo="/chinese-learning" showXpBar decorativeEmoji="🏯" />

    <!-- Decorative floating characters -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      <span class="absolute top-20 left-12 text-3xl opacity-15 dark:opacity-10 animate-float-char" style="animation-delay: 0s">文</span>
      <span class="absolute top-32 right-20 text-4xl opacity-15 dark:opacity-10 animate-float-char" style="animation-delay: 2s">史</span>
      <span class="absolute bottom-40 left-1/4 text-5xl opacity-10 dark:opacity-5 animate-float-char" style="animation-delay: 4s">哲</span>
      <span class="absolute bottom-24 right-1/3 text-2xl opacity-15 dark:opacity-10 animate-float-char" style="animation-delay: 1.5s">典</span>
    </div>

    <!-- Decorative wobble emojis -->
    <div class="flex justify-center gap-6 text-xl opacity-25 pointer-events-none select-none" aria-hidden="true">
      <span class="animate-wobble-slow">🏯</span>
      <span class="animate-wobble-slow" style="animation-delay: 1s">📜</span>
      <span class="animate-wobble-slow" style="animation-delay: 2s">🐉</span>
      <span class="animate-wobble-slow" style="animation-delay: 0.5s">🏮</span>
    </div>

    <!-- Level Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="(level, idx) in challengeLevels"
        :key="level.id"
        :data-delay="idx % 8"
        :class="[{
          'ring-2 ring-amber-400/50': level.category === 'poem',
          'ring-2 ring-red-400/50': level.category === 'idiom',
          'ring-2 ring-orange-400/50': level.category === 'culture',
          'ring-2 ring-amber-400/50': level.category === 'rhetoric',
          'animate-pulse-glow': level.completed,
        }]"
        class="group bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-zinc-700 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden animate-entrance hover-lift-glow"
        @click="startLevel(level)"
      >
        <!-- Level number badge -->
        <div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-chinese-600 to-chinese-gold-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
          {{ idx + 1 }}
        </div>
        <div class="flex items-center gap-3 mb-3">
          <div :class="level.iconBg" class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner">
            {{ level.icon }}
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-zinc-100">{{ level.title }}</h3>
            <span class="text-[10px] text-gray-400 font-medium">{{ level.description }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-blue-500 font-bold">+{{ level.xpReward }} XP</span>
          <span v-if="level.completed" class="text-orange-500 font-bold">✅ 已完成</span>
          <span v-else class="text-gray-400">{{ level.questions.length }} 题</span>
        </div>
        <!-- Progress bar -->
        <div class="mt-3 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="level.completed ? 'bg-orange-500' : 'bg-red-400'"
            :style="{ width: level.completed ? '100%' : '0%' }"
          />
        </div>
      </div>
    </div>

    <!-- Active Quiz Modal -->
    <Transition name="modal">
      <div
        v-if="activeLevel"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="activeLevel = null"
      >
        <div class="bg-white dark:bg-[#18181b] w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 dark:border-zinc-700 bg-gradient-to-r from-chinese-600 to-chinese-gold-500 text-white animate-gradient-shift">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-bold flex items-center gap-2">{{ activeLevel.icon }} {{ activeLevel.title }}</h3>
              <button class="text-white/60 hover:text-white transition-colors text-xl" @click="activeLevel = null">✕</button>
            </div>
            <div class="text-xs text-red-200">第 {{ currentQuestion + 1 }} / {{ activeLevel.questions.length }} 题</div>
            <div class="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                class="h-full bg-white rounded-full transition-all duration-300"
                :style="{ width: ((currentQuestion + 1) / activeLevel.questions.length) * 100 + '%' }"
              />
            </div>
          </div>

          <!-- Question -->
          <div class="p-6">
            <div :key="currentQuestion" class="animate-entrance">
              <p class="text-lg font-bold text-gray-900 dark:text-white mb-6">
                {{ activeLevel.questions[currentQuestion]?.q ?? '' }}
              </p>
              <div class="grid grid-cols-1 gap-3">
              <button
                v-for="opt in (activeLevel.questions[currentQuestion]?.options ?? [])"
                :key="opt"
                :class="[
                  'w-full p-4 text-left border rounded-2xl text-sm font-medium transition-all',
                  selectedAnswer === opt
                    ? answerResult === 'correct'
                      ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                      : answerResult === 'wrong'
                        ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-zinc-100 border-blue-500 text-zinc-700 dark:bg-zinc-8000/10 dark:text-zinc-400'
                    : 'bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-red-300 hover:bg-red-50/50',
                  { 'scale-[1.02] shadow-md': selectedAnswer === opt },
                ]"
                :disabled="!!selectedAnswer"
                @click="selectAnswer(opt)"
              >
                {{ opt }}
              </button>
            </div>

            <!-- Hint -->
            <div v-if="selectedAnswer && answerResult === 'wrong' && activeLevel.questions[currentQuestion]?.hint" class="mt-4 p-3 bg-zinc-100 dark:bg-zinc-8000/10 rounded-xl text-xs text-zinc-700 dark:text-zinc-400">
              💡 {{ activeLevel.questions[currentQuestion]?.hint }}
            </div>

            <!-- Next -->
            <div v-if="selectedAnswer" class="mt-6 text-center animate-fade-in">
              <button
                v-if="currentQuestion < activeLevel.questions.length - 1"
                class="px-8 py-3 bg-gradient-to-r from-chinese-600 to-chinese-gold-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                @click="nextQuestion"
              >
                下一题 →
              </button>
              <button
                v-else
                class="px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition-all"
                @click="finishLevel"
              >
                查看结果
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Transition>

    <!-- Result Modal -->
    <Transition name="modal">
      <div
        v-if="showResult"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="closeResult"
      >
        <div class="bg-white dark:bg-[#18181b] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
          <div class="bg-gradient-to-br from-chinese-600 to-chinese-gold-500 p-8 text-center text-white animate-gradient-shift">
            <div class="text-6xl mb-3 animate-bounce-in">{{ resultEmoji }}</div>
            <div class="text-4xl font-black mb-1">{{ score }} / {{ total }}</div>
            <div class="text-red-200 text-sm">正确率 {{ Math.round((score / total) * 100) }}%</div>
          </div>
          <div class="p-8 text-center space-y-4">
            <div class="text-2xl font-black text-blue-500 animate-bounce-in" style="animation-delay: 0.3s">+{{ earnedXp }} XP</div>
            <button
              class="w-full py-3 bg-gradient-to-r from-chinese-600 to-chinese-gold-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
              @click="closeResult"
            >
              返回闯关
            </button>
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
import type { ChallengeLevel } from '../shared/types';

const gamification = useGamification();

const challengeLevels = ref<ChallengeLevel[]>([
  {
    id: 'poem-1', title: '先秦文学', description: '先秦文学基础', icon: '📜',
    iconBg: 'bg-red-50 dark:bg-red-500/10', category: 'poem', xpReward: 40, completed: false,
    questions: [
      { q: '《诗经》中"关关雎鸠，在河之洲"出自哪篇？', options: ['关雎', '蒹葭', '采薇', '鹿鸣'], answer: '关雎', hint: '出自《诗经·周南·关雎》' },
      { q: '"风雅颂"中"风"是指？', options: ['各地民歌', '宫廷音乐', '祭祀乐曲', '文人创作'], answer: '各地民歌', hint: '"风"为各地民歌，反映民间生活' },
      { q: '"春秋三传"不包括以下哪部？', options: ['《公羊传》', '《谷梁传》', '《左传》', '《国语》'], answer: '《国语》', hint: '春秋三传指《左传》《公羊传》《谷梁传》' },
      { q: '"楚材晋用"讲的是谁的故事？', options: ['声子', '屈原', '申包胥', '伍子胥'], answer: '声子', hint: '声子出使晋国，向楚令尹子木进言' },
    ],
  },
  {
    id: 'poem-2', title: '楚辞汉赋', description: '楚辞与汉赋专题', icon: '🌿',
    iconBg: 'bg-red-50 dark:bg-red-500/10', category: 'poem', xpReward: 45, completed: false,
    questions: [
      { q: '"路漫漫其修远兮，吾将上下而求索"出自？', options: ['《离骚》', '《九歌》', '《天问》', '《九章》'], answer: '《离骚》', hint: '出自屈原《离骚》' },
      { q: '《九歌》共多少篇？', options: ['11篇', '9篇', '12篇', '10篇'], answer: '11篇' },
      { q: '"赋"作为一种文体兴盛于哪个朝代？', options: ['汉代', '唐代', '宋代', '清代'], answer: '汉代', hint: '汉赋是汉代文学的代表性文体' },
      { q: '《上林赋》的作者是？', options: ['司马相如', '扬雄', '班固', '张衡'], answer: '司马相如' },
    ],
  },
  {
    id: 'poem-3', title: '唐诗专题', description: '唐代诗歌专题', icon: '🌸',
    iconBg: 'bg-red-50 dark:bg-red-500/10', category: 'poem', xpReward: 50, completed: false,
    questions: [
      { q: '"初唐四杰"不包括？', options: ['王勃', '杨炯', '卢照邻', '骆宾王', '陈子昂'], answer: '陈子昂', hint: '初唐四杰为王勃、杨炯、卢照邻、骆宾王' },
      { q: '"大李杜"指的是？', options: ['李白、杜甫', '李商隐、杜牧', '李贺、杜荀鹤', '李益、杜审言'], answer: '李白、杜甫' },
      { q: '"小李杜"指的是？', options: ['李商隐、杜牧', '李白、杜甫', '李贺、杜荀鹤', '李益、杜审言'], answer: '李商隐、杜牧' },
      { q: '"诗中有画，画中有诗"评价的是？', options: ['王维', '李白', '杜甫', '孟浩然'], answer: '王维', hint: '苏轼评价王维作品"诗中有画，画中有诗"' },
      { q: '"郊寒岛瘦"中"郊"指的是？', options: ['孟郊', '张籍', '贾岛', '姚合'], answer: '孟郊', hint: '孟郊诗风清冷，贾岛诗风清瘦，合称"郊寒岛瘦"' },
    ],
  },
  {
    id: 'poem-4', title: '宋词专题', description: '宋词基础知识', icon: '🎋',
    iconBg: 'bg-red-50 dark:bg-red-500/10', category: 'poem', xpReward: 50, completed: false,
    questions: [
      { q: '词别称不包括？', options: ['长短句', '诗余', '曲子词', '乐府诗'], answer: '乐府诗', hint: '词又称长短句、诗余、曲子词，乐府诗是汉代诗歌体裁' },
      { q: '"词中之龙"指的是？', options: ['辛弃疾', '苏轼', '李清照', '柳永'], answer: '辛弃疾' },
      { q: '"婉约派"代表人物不包括？', options: ['柳永', '李清照', '周邦彦', '苏轼'], answer: '苏轼', hint: '苏轼是豪放派代表人物，非婉约派' },
      { q: '"奉旨填词柳三变"中的"三变"是？', options: ['柳永原名', '柳永的字', '柳永的号', '柳永的笔名'], answer: '柳永原名', hint: '柳永原名柳三变，后改名柳永' },
      { q: '《词源》的作者是？', options: ['张炎', '周邦彦', '姜夔', '吴文英'], answer: '张炎' },
    ],
  },
  {
    id: 'poem-5', title: '元曲与明清小说', description: '元曲与明清小说', icon: '🏰',
    iconBg: 'bg-red-50 dark:bg-red-500/10', category: 'poem', xpReward: 45, completed: false,
    questions: [
      { q: '"元曲四大家"不包括？', options: ['关汉卿', '白朴', '马致远', '郑光祖', '王实甫'], answer: '王实甫', hint: '元曲四大家为关汉卿、白朴、马致远、郑光祖' },
      { q: '《西厢记》中"望夫石"典故出自？', options: ['等待丈夫归来的女子化石', '妻子盼望丈夫科举高中', '女子盼望情人归来', '母亲盼望儿子归来'], answer: '等待丈夫归来的女子化石' },
      { q: '"四大奇书"不包括？', options: ['《水浒传》', '《三国演义》', '《西游记》', '《金瓶梅》', '《红楼梦》'], answer: '《红楼梦》', hint: '明代四大奇书为《水浒传》《三国演义》《西游记》《金瓶梅》' },
      { q: '"脂砚斋"是？', options: ['《红楼梦》评点者', '《金瓶梅》评点者', '《水浒传》评点者', '《西游记》评点者'], answer: '《红楼梦》评点者' },
    ],
  },
  {
    id: 'idiom-1', title: '成语典故', description: '成语出处与典故', icon: '🐉',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'idiom', xpReward: 40, completed: false,
    questions: [
      { q: '"筚路蓝缕"形容什么？', options: ['创业艰辛', '衣着朴素', '道路艰难', '生活贫困'], answer: '创业艰辛', hint: '出自《左传》，形容驾着柴车、穿着破衣去开辟山林' },
      { q: '"尾大不掉"中的"掉"意思是？', options: ['摇动', '掉落', '失去', '改变'], answer: '摇动' },
      { q: '"七月流火"原意是？', options: ['天气转凉', '天气炎热', '流星如火', '火灾发生'], answer: '天气转凉', hint: '出自《诗经》，指夏历七月大火星西沉，天气转凉' },
      { q: '"他山之石"出自哪部经典？', options: ['《诗经》', '《尚书》', '《周易》', '《礼记》'], answer: '《诗经》', hint: '出自《诗经·小雅·鹤鸣》' },
      { q: '"尸位素餐"中"素餐"的意思是？', options: ['白吃饭不干事', '吃素斋饭', '简单饮食', '清淡饮食'], answer: '白吃饭不干事' },
    ],
  },
  {
    id: 'idiom-2', title: '成语辨析', description: '近义成语辨析', icon: '🔄',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'idiom', xpReward: 45, completed: false,
    questions: [
      { q: '与"目无全牛"意思相近的是？', options: ['游刃有余', '目光短浅', '目中无人', '一目十行'], answer: '游刃有余', hint: '二者皆出自《庄子·养生主》，形容技艺纯熟' },
      { q: '"不刊之论"的"刊"意思是？', options: ['削除修改', '刊登出版', '刊物杂志', '刻字雕版'], answer: '削除修改', hint: '"刊"意为削除，不刊之论指不可磨灭的言论' },
      { q: '"屡试不爽"的"爽"意思是？', options: ['差错', '爽快', '舒服', '失败'], answer: '差错' },
      { q: '"差强人意"的意思是？', options: ['大体上令人满意', '让人很不满意', '相差很远', '勉强接受'], answer: '大体上令人满意' },
      { q: '"万人空巷"形容什么？', options: ['人非常多', '街道空无一人', '人们离开家园', '城市空旷寂寥'], answer: '人非常多', hint: '"万人空巷"指家家户户的人都走出了巷子，形容盛况' },
    ],
  },
  {
    id: 'idiom-3', title: '成语运用', description: '成语实际运用', icon: '✨',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'idiom', xpReward: 40, completed: false,
    questions: [
      { q: '下列成语使用正确的一项是？', options: ['他对工作拈轻怕重，受到大家一致好评。', '这篇文章论点深刻，堪称不刊之论。', '同学们面面相觑，认真完成老师布置的作业。', '这部小说情节曲折，令人不忍卒读。'], answer: '这篇文章论点深刻，堪称不刊之论。', hint: '"不刊之论"中"刊"意为削除修改，指不可磨灭的言论' },
      { q: '"举案齐眉"原本描述的是？', options: ['夫妻相敬', '君臣相得', '朋友相交', '父子相亲'], answer: '夫妻相敬', hint: '举案齐眉讲的是梁鸿与孟光夫妻相敬如宾的故事' },
      { q: '"破镜重圆"典故出自哪个朝代？', options: ['南北朝/陈', '唐朝', '宋朝', '明朝'], answer: '南北朝/陈', hint: '出自唐代孟棨《本事诗》，讲陈朝乐昌公主与徐德言的故事' },
      { q: '"请君入瓮"与哪两位人物有关？', options: ['周兴、来俊臣', '秦桧、岳飞', '曹操、刘备', '高俅、林冲'], answer: '周兴、来俊臣', hint: '来俊臣请周兴入瓮，是唐代武则天时期的典故' },
    ],
  },
  {
    id: 'culture-1', title: '文学常识', description: '古代文学常识', icon: '📚',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'culture', xpReward: 55, completed: false,
    questions: [
      { q: '"四书"不包括？', options: ['《论语》', '《孟子》', '《大学》', '《中庸》', '《诗经》'], answer: '《诗经》', hint: '四书指《大学》《中庸》《论语》《孟子》' },
      { q: '"五经"包括？', options: ['《诗》《书》《礼》《易》《春秋》', '《论》《孟》《大》《中》', '《诗》《书》《礼》《乐》《春秋》', '《书》《礼》《易》《春秋》《论语》'], answer: '《诗》《书》《礼》《易》《春秋》' },
      { q: '"十三经"中最早的一部是？', options: ['《周易》', '《诗经》', '《尚书》', '《周礼》'], answer: '《周易》' },
      { q: '"史家之绝唱，无韵之离骚"评价的是？', options: ['《史记》', '《汉书》', '《资治通鉴》', '《左传》'], answer: '《史记》', hint: '鲁迅对《史记》的评价' },
      { q: '"前四史"不包括？', options: ['《史记》', '《汉书》', '《后汉书》', '《三国志》', '《资治通鉴》'], answer: '《资治通鉴》', hint: '前四史指《史记》《汉书》《后汉书》《三国志》' },
    ],
  },
  {
    id: 'culture-2', title: '文化常识', description: '古代文化常识', icon: '🏮',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'culture', xpReward: 50, completed: false,
    questions: [
      { q: '"三教九流"中"三教"指？', options: ['儒释道', '儒法道', '儒墨道', '儒道阴阳'], answer: '儒释道' },
      { q: '以下哪一项不属于"六艺"？', options: ['棋', '礼', '乐', '射', '御'], answer: '棋', hint: '六艺指礼、乐、射、御、书、数' },
      { q: '"二十四孝"故事中"卧冰求鲤"的主人公是？', options: ['王祥', '郭巨', '孟宗', '董永'], answer: '王祥' },
      { q: '"科举制度"中"连中三元"指？', options: ['解元、会元、状元', '乡元、省元、殿元', '秀才、举人、进士', '县元、府元、京元'], answer: '解元、会元、状元' },
      { q: '"四库全书"的分类是？', options: ['经史子集', '诗书礼乐', '经史子集丛', '甲乙丙丁'], answer: '经史子集' },
    ],
  },
  {
    id: 'culture-3', title: '文史典故', description: '文史典故与事件', icon: '👑',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'culture', xpReward: 60, completed: false,
    questions: [
      { q: '"退避三舍"出自哪场战役？', options: ['城濮之战', '淝水之战', '官渡之战', '赤壁之战'], answer: '城濮之战', hint: '晋文公退避三舍，最终在城濮之战大败楚军' },
      { q: '"卧薪尝胆"中越王勾践卧薪尝胆多少年？', options: ['十余年', '三年', '五年', '二十年'], answer: '十余年', hint: '勾践卧薪尝胆，十年生聚，十年教训' },
      { q: '"围魏救赵"的军事策略出自？', options: ['孙膑', '孙武', '庞涓', '鬼谷子'], answer: '孙膑', hint: '孙膑围魏救赵，在桂陵之战大败魏军' },
      { q: '"风声鹤唳、草木皆兵"出自哪场战役？', options: ['淝水之战', '赤壁之战', '官渡之战', '巨鹿之战'], answer: '淝水之战', hint: '前秦苻坚在淝水之战中被东晋击败，惊慌失措' },
      { q: '"成也萧何，败也萧何"说的是谁？', options: ['韩信', '刘邦', '项羽', '张良'], answer: '韩信' },
    ],
  },
  {
    id: 'culture-4', title: '语言学基础', description: '古代汉语基础', icon: '🔤',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'culture', xpReward: 55, completed: false,
    questions: [
      { q: '"三十六字母"是哪个朝代的声母系统？', options: ['宋代', '唐代', '明代', '清代'], answer: '宋代', hint: '三十六字母是宋代韵图中归纳的声母系统' },
      { q: '《说文解字》共收录多少字？', options: ['9353', '10516', '540', '12000'], answer: '9353' },
      { q: '"六书"不包括？', options: ['象形', '指事', '会意', '形声', '转注', '假借', '反切'], answer: '反切', hint: '六书指象形、指事、会意、形声、转注、假借' },
      { q: '"反切"注音法中"冬，都宗切"，"都"提供什么？', options: ['声母', '韵母', '声调', '韵母和声调'], answer: '声母', hint: '反切上字取声母，反切下字取韵母和声调' },
      { q: '《尔雅》是中国第一部什么著作？', options: ['词典/训诂书', '韵书', '字典', '语法书'], answer: '词典/训诂书', hint: '《尔雅》是中国第一部按义类编排的综合性辞书' },
    ],
  },
  {
    id: 'culture-5', title: '文献学基础', description: '古籍版本与目录', icon: '📜',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10', category: 'culture', xpReward: 55, completed: false,
    questions: [
      { q: '"版本学"中"宋版书"的特点不包括？', options: ['字体精美', '纸墨精良', '校勘精审', '价格便宜'], answer: '价格便宜', hint: '宋版书以字体精美、纸墨精良、校勘精审著称，价格昂贵' },
      { q: '"目录学"的创始人是？', options: ['刘向/刘歆', '班固', '郑樵', '纪昀'], answer: '刘向/刘歆' },
      { q: '"校勘四法"不包括？', options: ['对校', '本校', '他校', '理校', '译校'], answer: '译校', hint: '校勘四法指对校、本校、他校、理校，由陈垣提出' },
      { q: '《四库全书》编成于哪个朝代？', options: ['清代', '明代', '宋代', '元代'], answer: '清代' },
      { q: '"辨章学术，考镜源流"出自哪部目录学著作？', options: ['《校雠通义》', '《四库全书总目》', '《文献通考》', '《通志·校雠略》'], answer: '《校雠通义》', hint: '章学诚《校雠通义》提出了这一目录学宗旨' },
    ],
  },
  {
    id: 'rhetoric-1', title: '修辞格', description: '常见修辞手法', icon: '🎨',
    iconBg: 'bg-zinc-100 dark:bg-zinc-8000/10', category: 'rhetoric', xpReward: 45, completed: false,
    questions: [
      { q: '"对偶"与"对仗"的主要区别是？', options: ['对仗要求更严格', '对偶要求更严格', '两者完全相同', '对仗是对偶的一种'], answer: '对仗要求更严格', hint: '对仗除要求对偶外，还要求平仄相对' },
      { q: '"互文见义"是一种什么？', options: ['修辞手法', '注音方法', '文体类别', '训诂方式'], answer: '修辞手法', hint: '互文见义是古诗文中常见的修辞手法，上下文互相补充' },
      { q: '"通感"修辞的经典例子是？', options: ['红杏枝头春意闹', '大漠孤烟直', '春风又绿江南岸', '僧敲月下门'], answer: '红杏枝头春意闹', hint: '宋祁《玉楼春》中"闹"字将视觉与听觉相通' },
      { q: '"用典"分为哪几类？', options: ['明用、暗用、化用', '正用、反用、借用', '直用、曲用、隐用', '古用、今用、活用'], answer: '明用、暗用、化用' },
      { q: '"层递"与"排比"的主要区别？', options: ['层递有递进关系', '排比有递进关系', '两者完全相同', '层递是对偶的一种'], answer: '层递有递进关系' },
    ],
  },
  {
    id: 'rhetoric-2', title: '古代文论', description: '古代文学理论', icon: '🏛️',
    iconBg: 'bg-zinc-100 dark:bg-zinc-8000/10', category: 'rhetoric', xpReward: 60, completed: false,
    questions: [
      { q: '《文心雕龙》的作者是？', options: ['刘勰', '钟嵘', '陆机', '曹丕'], answer: '刘勰', hint: '刘勰《文心雕龙》是中国第一部系统的文学理论著作' },
      { q: '《诗品》将诗人分为几品？', options: ['三品', '四品', '五品', '九品'], answer: '三品', hint: '钟嵘《诗品》将自汉至梁的诗人分为上中下三品' },
      { q: '"《人间词话》"提出"三境界"说的作者是？', options: ['王国维', '梁启超', '胡适', '鲁迅'], answer: '王国维', hint: '王国维《人间词话》提出"昨夜西风""衣带渐宽""蓦然回首"三境界' },
      { q: '"文以载道"是谁提出的？', options: ['周敦颐', '韩愈', '柳宗元', '欧阳修'], answer: '周敦颐', hint: '周敦颐《通书·文辞》明确提出"文所以载道也"' },
      { q: '《沧浪诗话》的作者是？', options: ['严羽', '司空图', '刘勰', '钟嵘'], answer: '严羽' },
      { q: '《艺概》的作者是？', options: ['刘熙载', '王国维', '梁启超', '章学诚'], answer: '刘熙载' },
    ],
  },
]);

const activeLevel = ref<ChallengeLevel | null>(null);
const currentQuestion = ref(0);
const selectedAnswer = ref('');
const answerResult = ref<'correct' | 'wrong' | null>(null);
const score = ref(0);
const total = ref(0);
const earnedXp = ref(0);
const showResult = ref(false);

function startLevel(level: ChallengeLevel) {
  activeLevel.value = { ...level, questions: [...level.questions] };
  currentQuestion.value = 0;
  selectedAnswer.value = '';
  answerResult.value = null;
  score.value = 0;
  total.value = level.questions.length;
  earnedXp.value = 0;
  showResult.value = false;
}

function selectAnswer(answer: string) {
  if (selectedAnswer.value) return;
  selectedAnswer.value = answer;
  const q = activeLevel.value?.questions[currentQuestion.value];
  const correct = q ? answer === q.answer : false;
  answerResult.value = correct ? 'correct' : 'wrong';
  if (correct) score.value++;
}

function nextQuestion() {
  currentQuestion.value++;
  selectedAnswer.value = '';
  answerResult.value = null;
}

function finishLevel() {
  const baseXp = Math.round((score.value / total.value) * activeLevel.value!.xpReward);
  earnedXp.value = baseXp;
  gamification.addXp(baseXp);

  if (score.value === total.value) {
    const level = challengeLevels.value.find(l => l.id === activeLevel.value!.id);
    if (level) level.completed = true;
    message.success(`🎉 完美通关！+${baseXp} XP`);
    gamification.unlockAchievement('challenge-master');
  } else {
    message.success(`闯关完成！得分 ${score.value}/${total.value}，获得 ${baseXp} XP`);
  }

  showResult.value = true;
}

function closeResult() {
  showResult.value = false;
  activeLevel.value = null;
}

const resultEmoji = computed(() => {
  if (!total.value) return '📚';
  const rate = score.value / total.value;
  if (rate === 1) return '🏆';
  if (rate >= 0.8) return '🎉';
  if (rate >= 0.6) return '💪';
  return '📚';
});
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

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Scrollbar */
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
</style>
