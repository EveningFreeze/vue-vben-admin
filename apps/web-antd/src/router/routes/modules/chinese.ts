import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:book-outlined',
      keepAlive: true,
      order: 10,
      title: '文学素养提升',
    },
    name: 'ChineseEducation',
    path: '/chinese-learning',
    children: [
      {
        meta: {
          title: '学习中心',
          icon: 'ant-design:home-outlined',
        },
        name: 'ChineseDashboard',
        path: '/chinese-learning',
        component: () => import('#/views/chinese-learning/index.vue'),
      },
      {
        meta: {
          title: '人文闯关',
          icon: 'ant-design:trophy-outlined',
        },
        name: 'ChineseChallenge',
        path: '/chinese-learning/challenge',
        component: () => import('#/views/chinese-learning/challenge/index.vue'),
      },
      {
        meta: {
          title: '诗词鉴赏',
          icon: 'ant-design:file-text-outlined',
        },
        name: 'ChinesePoetry',
        path: '/chinese-learning/poetry',
        component: () => import('#/views/chinese-learning/poetry/index.vue'),
      },
      {
        meta: {
          title: '古文阅读',
          icon: 'ant-design:highlight-outlined',
        },
        name: 'ChineseLiteracy',
        path: '/chinese-learning/literacy',
        component: () => import('#/views/chinese-learning/literacy/index.vue'),
      },
      {
        meta: {
          title: '学术写作',
          icon: 'ant-design:edit-outlined',
        },
        name: 'ChineseWriting',
        path: '/chinese-learning/writing',
        component: () => import('#/views/chinese-learning/writing/index.vue'),
      },
      {
        meta: {
          title: '名篇赏读',
          icon: 'ant-design:audio-outlined',
        },
        name: 'ChineseReading',
        path: '/chinese-learning/reading',
        component: () => import('#/views/chinese-learning/reading/index.vue'),
      },
      {
        meta: {
          title: 'AI 导师',
          icon: 'ant-design:robot-outlined',
        },
        name: 'ChineseAiTutor',
        path: '/chinese-learning/ai-tutor',
        component: () => import('#/views/chinese-learning/ai-tutor/index.vue'),
      },
      {
        meta: {
          title: '语言基础',
          icon: 'ant-design:check-square-outlined',
        },
        name: 'ChinesePractice',
        path: '/chinese-learning/practice',
        component: () => import('#/views/chinese-learning/practice/index.vue'),
      },
      {
        meta: {
          title: '学术阅读',
          icon: 'ant-design:book-outlined',
        },
        name: 'ChineseTextbook',
        path: '/chinese-learning/textbook',
        component: () => import('#/views/chinese-learning/textbook/index.vue'),
      },
      {
        meta: {
          title: '经典研读',
          icon: 'ant-design:compass-outlined',
        },
        name: 'ChineseClassics',
        path: '/chinese-learning/classics',
        component: () => import('#/views/chinese-learning/classics/index.vue'),
      },
      {
        meta: { title: '人文诊断', icon: 'ant-design:radar-chart-outlined' },
        name: 'ChineseDiagnosis',
        path: '/chinese-learning/diagnosis',
        component: () => import('#/views/chinese-learning/diagnosis/index.vue'),
      },
      {
        meta: { title: '文学图谱', icon: 'ant-design:apartment-outlined' },
        name: 'ChineseLiteratureMap',
        path: '/chinese-learning/literature-map',
        component: () => import('#/views/chinese-learning/literature-map/index.vue'),
      },
    ],
  },
];

export default routes;
