<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from './layouts/AuthLayout.vue';
import DefaultLayout from './layouts/DefaultLayout.vue';

const route = useRoute();

const layouts = {
  Auth: AuthLayout,
  Default: DefaultLayout
};

const layout = computed(() => {
  return layouts[route.meta.layout] || 'div';
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

#app {
  height: 100vh;
  width: 100%;
}
</style>