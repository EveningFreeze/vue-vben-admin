<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGamification } from '../shared/use-gamification';

const router = useRouter();
const { xp, level } = useGamification();

interface RPGStage {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  xpRequired: number;
  route: string;
  skills: string[];
}

const stages: RPGStage[] = [
  { id: 'enlighten', name: '启蒙', subtitle: '蒙以养正', icon: '🌱', xpRequired: 0, route: '/chinese-learning/classics', skills: ['三字经', '弟子规', '千字文'] },
  { id: 'poetry-basic', name: '诗词基础', subtitle: '吟咏情性', icon: '🌸', xpRequired: 100, route: '/chinese-learning/poetry', skills: ['诗词背诵', '格律基础', '意象识别'] },
  { id: 'classical-intro', name: '古文入门', subtitle: '通经明义', icon: '📜', xpRequired: 300, route: '/chinese-learning/literacy', skills: ['句读训练', '文言词汇', '篇章理解'] },
  { id: 'literature-appreciation', name: '文学鉴赏', subtitle: '含英咀华', icon: '🎭', xpRequired: 600, route: '/chinese-learning/reading', skills: ['文本细读', '审美鉴赏', '风格辨析'] },
  { id: 'classics-deep', name: '经典研读', subtitle: '深造自得', icon: '🏛️', xpRequired: 1000, route: '/chinese-learning/classics', skills: ['原典精读', '注疏理解', '义理阐发'] },
  { id: 'academic-reading', name: '学术阅读', subtitle: '博观约取', icon: '📚', xpRequired: 1500, route: '/chinese-learning/textbook', skills: ['文献检索', '批判阅读', '理论应用'] },
  { id: 'academic-writing', name: '学术写作', subtitle: '著述立言', icon: '✍️', xpRequired: 2200, route: '/chinese-learning/writing', skills: ['论文写作', '文献引用', '论证方法'] },
  { id: 'research', name: '研究能力', subtitle: '格物致知', icon: '🔬', xpRequired: 3200, route: '/chinese-learning/literacy', skills: ['独立研究', '方法论', '学术创新'] },
  { id: 'mentor', name: '导师级', subtitle: '传道授业', icon: '👑', xpRequired: 5000, route: '/chinese-learning/ai-tutor', skills: ['学术指导', '知识输出', '引领研究'] },
];

const currentStageIndex = computed(() => {
  for (let i = stages.length - 1; i >= 0; i--) {
    if (xp.value >= stages[i].xpRequired) return i;
  }
  return 0;
});

const currentStage = computed(() => stages[currentStageIndex.value]);

const nextStage = computed(() => stages[currentStageIndex.value + 1] || null);

const progressInStage = computed(() => {
  if (!nextStage.value) return 100;
  const stageStart = currentStage.value.xpRequired;
  const stageEnd = nextStage.value.xpRequired;
  return Math.min(100, Math.round(((xp.value - stageStart) / (stageEnd - stageStart)) * 100));
});

function goToStage(stage: RPGStage) {
  if (xp.value >= stage.xpRequired) router.push(stage.route);
}

const treeConnections = computed(() => {
  const pairs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  // Will be positioned via CSS, this is for SVG lines if needed
  return pairs;
});
</script>

<template>
  <div class="rpg-roadmap">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <span>🌳</span> 国学成长路线图
        </h2>
        <p class="text-sm text-zinc-500 mt-1">当前阶段：<span class="text-purple-400 font-semibold">{{ currentStage.name }} · {{ currentStage.subtitle }}</span></p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-white">{{ xp.toLocaleString() }}</p>
        <p class="text-xs text-zinc-500">累计学识值</p>
      </div>
    </div>

    <!-- RPG Tree Layout -->
    <div class="rpg-tree">
      <div
        v-for="(stage, i) in stages"
        :key="stage.id"
        class="rpg-node-wrapper"
        :style="{ gridRow: i + 1 }"
      >
        <!-- Connection line to next stage -->
        <div
          v-if="i < stages.length - 1"
          class="rpg-connector"
          :class="{ active: i < currentStageIndex }"
        >
          <div class="connector-line" :class="{ active: i < currentStageIndex, current: i === currentStageIndex }" />
          <div v-if="i === currentStageIndex" class="connector-progress">
            <div class="connector-fill" :style="{ height: progressInStage + '%' }" />
          </div>
        </div>

        <!-- Stage Node -->
        <div
          class="rpg-node"
          :class="{
            unlocked: xp >= stage.xpRequired,
            current: i === currentStageIndex,
            locked: xp < stage.xpRequired,
          }"
          @click="goToStage(stage)"
        >
          <div class="node-icon">{{ stage.icon }}</div>
          <div class="node-content">
            <div class="node-title">{{ stage.name }}</div>
            <div class="node-subtitle">{{ stage.subtitle }}</div>
            <div v-if="i === currentStageIndex && nextStage" class="node-progress mt-2">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressInStage + '%' }" />
              </div>
              <span class="progress-text">{{ progressInStage }}%</span>
            </div>
            <div v-if="xp < stage.xpRequired" class="node-lock mt-1">
              <span class="lock-icon">🔒</span>
              <span class="lock-text">{{ stage.xpRequired.toLocaleString() }} XP</span>
            </div>
            <div v-if="xp >= stage.xpRequired" class="node-skills mt-2">
              <span v-for="skill in stage.skills" :key="skill" class="skill-tag">{{ skill }}</span>
            </div>
          </div>
          <div v-if="i <= currentStageIndex" class="node-badge">✓</div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-6 mt-6 text-xs text-zinc-500">
      <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-purple-500"></span> 已达成</div>
      <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-purple-400/40 border border-purple-500/50"></span> 进行中</div>
      <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-zinc-700"></span> 未解锁</div>
    </div>
  </div>
</template>

<style scoped>
.rpg-roadmap {
  padding: 0.5rem 0;
}

.rpg-tree {
  display: grid;
  gap: 0;
  position: relative;
}

.rpg-node-wrapper {
  display: flex;
  align-items: stretch;
  position: relative;
  min-height: 80px;
}

.rpg-connector {
  width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

.connector-line {
  width: 2px;
  flex: 1;
  background: #27272a;
  transition: background 0.5s;
}
.connector-line.active {
  background: linear-gradient(to bottom, #8b5cf6, #7c3aed);
}
.connector-line.current {
  background: #27272a;
}

.connector-progress {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: #27272a;
}
.connector-fill {
  width: 100%;
  background: linear-gradient(to bottom, #a78bfa, #7c3aed);
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.rpg-node {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  border-radius: 1rem;
  background: #18181b;
  border: 1px solid #27272a;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.rpg-node:hover { border-color: #3f3f46; }
.rpg-node.unlocked { border-color: #7c3aed44; background: #18181b; }
.rpg-node.unlocked:hover { border-color: #8b5cf6; box-shadow: 0 4px 20px #8b5cf622; }
.rpg-node.current { border-color: #8b5cf6; background: linear-gradient(135deg, #7c3aed11 0%, #1e1b4b33 100%); box-shadow: 0 0 24px #8b5cf618; }
.rpg-node.locked { opacity: 0.45; cursor: not-allowed; }
.rpg-node.locked:hover { border-color: #27272a; }

.node-icon { font-size: 2rem; flex-shrink: 0; width: 48px; text-align: center; }
.node-content { flex: 1; min-width: 0; }
.node-title { font-size: 1rem; font-weight: 700; color: #fff; }
.node-subtitle { font-size: 0.8125rem; color: #71717a; margin-top: 0.125rem; }

.node-progress { display: flex; align-items: center; gap: 0.5rem; }
.progress-bar { flex: 1; height: 4px; border-radius: 2px; background: #27272a; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #7c3aed, #a78bfa); transition: width 0.6s; }
.progress-text { font-size: 0.75rem; color: #a78bfa; font-weight: 600; white-space: nowrap; }

.node-lock { display: flex; align-items: center; gap: 0.375rem; }
.lock-icon { font-size: 0.75rem; }
.lock-text { font-size: 0.75rem; color: #52525b; }

.node-skills { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.skill-tag {
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  color: #a78bfa;
  background: #7c3aed15;
  border: 1px solid #7c3aed22;
}

.node-badge {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .rpg-node { padding: 0.75rem; gap: 0.75rem; }
  .node-icon { font-size: 1.5rem; width: 36px; }
  .node-title { font-size: 0.875rem; }
}
</style>
