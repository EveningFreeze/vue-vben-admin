import type { RouteRecordRaw } from 'vue-router';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:read-outlined',
      keepAlive: true,
      order: 10,
      title: '智慧教育',
    },
    name: 'Education',
    path: '/english-learning',
    children: [
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
    ],
  },
];

export default routes;
