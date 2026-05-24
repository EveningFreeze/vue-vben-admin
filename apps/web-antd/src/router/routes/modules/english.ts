import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:read-outlined',
      keepAlive: true,
      order: 10,
      title: '智慧英语',
    },
    name: 'Education',
    path: '/english-learning',
    children: [
      {
        meta: {
          title: '学习中心',
          icon: 'ant-design:home-outlined',
        },
        name: 'EnglishHub',
        path: '/english-learning',
        component: () => import('#/views/english-learning/index.vue'),
      },
      {
        meta: {
          title: '英语作文评分',
          icon: 'ant-design:edit-outlined',
        },
        name: 'Tutor',
        path: '/english-learning/essay',
        component: () => import('#/views/english-learning/essay/index.vue'),
      },
      {
        meta: {
          title: '词汇测评',
          icon: 'ant-design:form-outlined',
        },
        name: 'Quiz',
        path: '/english-learning/quiz',
        component: () => import('#/views/english-learning/quiz/index.vue'),
      },
      {
        meta: {
          title: '备考规划',
          icon: 'ant-design:schedule-outlined',
        },
        name: 'Planner',
        path: '/english-learning/planner',
        component: () => import('#/views/english-learning/report/index.vue'),
      },
            {
        meta: {
          title: '在线学习',
          icon: 'ant-design:schedule-outlined',
        },
        name: 'Online-study',
        path: '/english-learning/study',
        component: () => import('#/views/english-learning/study/index.vue'),
      },
      {
        meta: {
          title: '听力训练',
          icon: 'ant-design:audio-outlined',
        },
        name: 'Listening',
        path: '/english-learning/listening',
        component: () => import('#/views/english-learning/listening/index.vue'),
      },
      {
        meta: {
          title: 'AI语伴',
          icon: 'ant-design:customer-service-outlined',
        },
        name: 'AiPartner',
        path: '/english-learning/ai-partner',
        component: () => import('#/views/english-learning/ai-partner/index.vue'),
      },
      {
        meta: {
          title: '高频考点',
          icon: 'ant-design:star-outlined',
        },
        name: 'ExamPoints',
        path: '/english-learning/exam-points',
        component: () => import('#/views/english-learning/exam-points/index.vue'),
      },
      {
        meta: {
          title: '英语论坛',
          icon: 'ant-design:message-outlined',
        },
        name: 'Forum',
        path: '/english-learning/forum',
        component: () => import('#/views/english-learning/forum/index.vue'),
      },
      {
        meta: { title: '学习诊断', icon: 'ant-design:medicine-box-outlined' },
        name: 'EnDiagnosis',
        path: '/english-learning/diagnosis',
        component: () => import('#/views/english-learning/diagnosis/index.vue'),
      },
      {
        meta: { title: '文献阅读', icon: 'ant-design:file-search-outlined' },
        name: 'ResearchReading',
        path: '/english-learning/research-reading',
        component: () => import('#/views/english-learning/research-reading/index.vue'),
      },
    ],
  },
];

export default routes;
