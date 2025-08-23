<template>
  <div>
    <h1 class="page-title">Imóveis Disponíveis para Aluguel</h1>
    
    <div v-if="loading" class="loading-text">Carregando imóveis...</div>
    <div v-else-if="properties.length === 0" class="empty-text">Nenhum imóvel disponível no momento.</div>
    
    <div v-else class="properties-grid">
      <div v-for="prop in properties" :key="prop._id" class="property-card">
        <img :src="prop.imageUrl" :alt="prop.title" class="property-image" />
        <div class="property-info">
          <h3 class="property-title">{{ prop.title }}</h3>
          <p class="property-owner">Proprietário: {{ prop.owner.name || 'Não informado' }}</p>
          <p class="property-rent">{{ prop.rentAmount }} ETH / mês</p>
          <router-link :to="{ name: 'CreateContract', params: { propertyId: prop._id } }" class="rent-btn">Alugar Agora</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const properties = ref([]);
const loading = ref(true);

async function fetchProperties() {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/properties');
    if (!response.ok) throw new Error('Falha ao buscar os imóveis.');
    properties.value = await response.json();
  } catch (error) {
    toast.error(error.message);
    console.error(error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProperties();
});
</script>

<style scoped>
.page-title { font-size: 2rem; font-weight: bold; color: #ffffff; margin-bottom: 2rem; margin-top: 80px; }
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.property-card {
  background: #fff;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}
.property-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}
.property-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.property-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.property-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #1e293b;
}
.property-owner {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}
.property-rent {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 auto 0; /* Empurra o aluguel para cima e o botão para baixo */
}
.rent-btn {
  margin-top: 1rem;
  border: none;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
}
.loading-text, .empty-text { color: #64748b; }
</style>