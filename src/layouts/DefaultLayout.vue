<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="content-area">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue';
</script> 

<style scoped>
.page-wrapper {
  background-color: #0a101d;
  min-height: 100vh;
}

.content-area {
  padding: 2rem;
  margin-left: 80px; 
}
</style>