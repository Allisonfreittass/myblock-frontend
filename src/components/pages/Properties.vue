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
          
          <div class="card-actions">
            <button @click="openDetailsModal(prop)" class="details-btn">Ver Detalhes</button>
            <router-link :to="{ name: 'CreateContract', params: { propertyId: prop._id } }" class="rent-btn">Alugar</router-link>
          </div>
        </div>
      </div>
    </div>

    <PropertyModal
      v-if="isModalVisible"
      :property="selectedProperty"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import PropertyModal from '../../modal/Property.vue';

const toast = useToast();
const properties = ref([]);
const loading = ref(true);

const isModalVisible = ref(false);
const selectedProperty = ref(null);

function openDetailsModal(property) {
  selectedProperty.value = property;
  isModalVisible.value = true;
}

function closeDetailsModal() {
  isModalVisible.value = false;
  selectedProperty.value = null;
}

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
  margin: auto 0 1rem 0; /* Ajuste na margem */
}
.loading-text, .empty-text { color: #64748b; }

/* ESTILOS PARA OS NOVOS BOTÕES */
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto; /* Empurra os botões para o final do card */
}

.details-btn, .rent-btn {
  flex-grow: 1;
  text-align: center;
  text-decoration: none;
  border: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.details-btn {
  background-color: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}
.details-btn:hover {
  background-color: #e2e8f0;
}

.rent-btn {
  background-color: #2563eb;
  color: white;
}
.rent-btn:hover {
  background-color: #1d4ed8;
}
</style>