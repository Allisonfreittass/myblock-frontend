<template>
  <div>
    <h1 class="page-title">Dashboard</h1>

    <div class="summary-cards">
      <div class="card">
        <h3>Properties</h3>
        <span class="count">{{ properties.length }}</span>
      </div>
      <div class="card">
        <h3>Contracts</h3>
        <span class="count">5</span> </div>
    </div>

    <div class="properties-section">
      <h2>Properties</h2>
      <div class="property-list">
        <div v-for="prop in properties" :key="prop.id" class="property-item">
          <img :src="prop.imageUrl" :alt="prop.address" class="property-image" />
          <div class="property-details">
            <p class="address">{{ prop.address }}</p>
            <p class="info">{{ prop.details }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const properties = ref([
  { id: 1, address: '123 Maple St', details: '3 bathroom 1.2 bathroom', imageUrl: 'https://via.placeholder.com/150' },
  { id: 2, address: '456 Oak Ave', details: '4 bathroom 1.4 bathroom', imageUrl: 'https://via.placeholder.com/150' },
  { id: 3, address: '123 Maple St', details: '2 bathroom 1.2 bathroom', imageUrl: 'https://via.placeholder.com/150' },
]);
</script>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #eeeeee;
  align-items: center;
  align-content: left;
  margin-bottom: 2rem;
}
.summary-cards {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.card {
  flex: 1;
  background: #121b2d;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}
.card h3 {
  margin: 0 0 0.5rem 0;
  color: #ffffff;
}
.card .count {
  font-size: 2.25rem;
  font-weight: bold;
  color: #ffffff;
}
.properties-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
}
.property-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.property-item {
  display: flex;
  align-items: center;
  background: #121b2d;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}
.property-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.375rem;
  margin-right: 1.5rem;
}
.property-details .address {
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}
.property-details .info {
  color: #ffffff;
  margin: 0.25rem 0 0 0;
}
</style>