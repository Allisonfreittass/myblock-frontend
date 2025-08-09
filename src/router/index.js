// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/pages/Login.vue';
import { compile } from 'vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { layout: 'Auth' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/pages/Register.vue'),
    meta: { layout: 'Auth' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../components/pages/Profile.vue'),
    meta: { requiresAuth: true, layout: 'Default' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/pages/Dashboard.vue'),
    meta: { requiresAuth: true, layout: 'Default'}
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;