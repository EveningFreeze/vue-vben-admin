import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:home-outlined',
      order: -2,
      title: '学习中心',
    },
    name: 'SgLearningCenter',
    path: '/learning-center',
    component: () => import('#/views/learning-center/index.vue'),
  },
  {
    meta: {
      icon: 'ant-design:experiment-outlined',
      order: 12,
      title: '学术研究',
    },
    name: 'AcademicHub',
    path: '/academic-hub',
    component: () => import('#/views/academic-hub/index.vue'),
  },
];

export default routes;
