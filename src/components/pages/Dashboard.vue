<template>
  <div>
    <h1 class="page-title">DASHBOARD</h1>

    <div v-if="properties && contracts" class="summary-cards">
      <div class="card">
        <h3>Properties</h3>
        <span class="count">{{ properties.length }}</span>
      </div>
      <div class="card">
        <h3>Contracts</h3>
        <span class="count">{{ contracts.length }}</span>
      </div>
    </div>
    <div v-else>
      <p>Loading data...</p>
    </div>

    <div v-if="properties" class="properties-section">
      <h2>PROPRIEDADES</h2>
      <div class="property-list">
        <div v-for="prop in properties" :key="prop._id" class="property-item" @click="openDetailsModal(prop)">
          <img :src="prop.imageUrls[0]" :alt="prop.address" class="property-image" />
        <div class="property-item">
          <span><strong>{{ prop.title }}</strong></span>
        </div>
        <div class="property-info-list">
            <span><strong>Tipo:</strong> {{ prop.details.PropertyType }}</span>
            <span><strong>Área:</strong> {{ prop.details.area }} m²</span>
            <span><strong>Quartos:</strong> {{ prop.details.bedrooms }}</span>
            <span><strong>Banheiros:</strong> {{ prop.details.bathrooms }}</span>
            <span><strong>Vagas:</strong> {{ prop.details.garageSpots }}</span>
            <span><strong>Mobiliado:</strong> {{ prop.details.isFurnished ? 'Sim' : 'Não' }}</span>
        </div>
        </div>
      </div>
    </div>
    <PropertyModal v-if="isModalVisible":property='selectedProperty'@close='closeDetailsModal'/>
  </div>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import axios from 'axios'
import Properties from './Properties.vue';
import PropertyModal from '../../modal/Property.vue';

const properties = ref([])
const contracts = ref([])
const isLoading = ref(true) 
const error = ref(null)

const isModalVisible = ref(false)
const selectedProperty = ref(null)

function openDetailsModal(property) {
  selectedProperty.value = property;
  isModalVisible.value = true
}

function closeDetailsModal(){
  isModalVisible.value = false
  selectedProperty.value = null
}

async function fetchProperties(userId) {
  try {
    const response = await axios.get(`http://localhost:3000/api/properties?owner=${userId}`);
    
    const formattedProperties = response.data.map(prop => {
      if (typeof prop.details === 'string') {
        try {
          prop.details = JSON.parse(prop.details);
        } catch (e) {
          console.error('Erro ao fazer o parse dos detalhes:', prop.details);
          prop.details = {}; 
        }
      }
      return prop;
    });
    properties.value = formattedProperties;
  } catch (err) {
    console.error('erro ao buscar propriedade', err);
    error.value = 'Não foi possível carregar suas propriedades.'
  }
}

async function fetchContracts(userId) {
  try {
    const response = await axios.get(`http://localhost:3000/api/contracts?owner=${userId}`)
    contracts.value = response.data
  } catch (err) {
    console.error('error ao buscar contratos', err)
    error.value = 'Não foi possível carregar seus contratos.'
  }
}

onMounted(async () => {
  isLoading.value = true
  error.value = null

  const userId = localStorage.getItem('authToken'); 

  if (!userId) {
    console.error('Usuário não autenticado.');
    error.value = 'Você precisa estar logado para ver seu dashboard.';
    isLoading.value = false;
    return; // Para a execução
  }

  await Promise.all([
    fetchProperties(userId),
    fetchContracts(userId)
  ]);
  
  isLoading.value = false
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
.property-info-list {
  color: #bdc1c6; /* Cor mais suave para os detalhes */
  font-size: 0.9rem;
  display: flex;
  flex-wrap: wrap; /* Permite que os itens quebrem para a próxima linha */
  gap: 0.5rem 1rem; /* Espaçamento vertical e horizontal entre os itens */
  margin-top: 0.5rem;
}

.property-info-list span {
  display: inline-block; 
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