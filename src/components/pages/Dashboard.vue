<template>
  <div>
    <h1 class="page-title">DASHBOARD</h1>

    <div class="summary-cards">
      <div class="card">
        <h3>Properties</h3>
        <span class="count">{{ properties.length }}</span>
      </div>
      <div class="card">
        <h3>Contracts</h3>
        <span class="count">{{ contracts.length }}</span>
      </div>
    </div>

    <div class="properties-section">
      <h2>PROPRIEDADES</h2>
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
import { ref, onMounted} from 'vue'
import axios from 'axios'

const properties = ref([])
const contracts = ref([])

async function fetchProperties() {
  try {
  const response = axios.get('http://localhost:3000/api/properties')
  properties.value = response.data
  } catch (error) {
    console.error('erro ao buscar propriedade', error)
  }
}

async function fetchContracts() {
  try {
    const response = axios.get('http://localhost:3000/api/contracts')
    contracts.value = response.data
  } catch (error) {
    console.error('error ao buscar contratos', error)
  }
}

onMounted(() => {
  fetchProperties();
  fetchContracts();
})
</script>

<style scoped>
.page-title {
  text-align: left;
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
  text-align: left;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
}
.card:hover, .property-item:hover {
  transform: translateY(-1px);
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
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