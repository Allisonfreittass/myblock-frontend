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
  },
 {
    path: '/contracts/create/:propertyId?',
    name: 'CreateContract',
    component: () => import('../components/pages/Contracts.vue'),
    meta: { requiresAuth: true, layout: 'Default'}
  },
  {
    path: '/my-contracts', 
    name: 'MyContracts',
    component: () => import('../components/pages/MyContracts.vue'), 
    meta: { requiresAuth: true, layout: 'Default'}
  },
  {
    path: '/properties',
    name: 'Properties',
    component: () => import('../components/pages/Properties.vue'),
    meta: { layout: 'Default'}
  },
    {
    path: '/properties/create',
    name: 'CreateProperty',
    component: () => import('../components/pages/CreateProperty.vue'),
    meta: { requiresAuth: true, layout: 'Default'}
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

function isAuthenticate() {
  return !!localStorage.getItem('token')
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticate()){
    next({ name: 'Login'})
  } else if (to.meta.requiresGuest && isAuthenticate()) {
    next({ name: 'Dashboard'});
  } else {
    next()
  }
})
export default router;