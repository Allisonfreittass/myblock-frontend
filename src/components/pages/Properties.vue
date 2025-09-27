<template>
  <div>
    <h1 class="page-title">Imóveis Disponíveis para Aluguel</h1>
    
    <div v-if="loading" class="loading-text">Carregando imóveis...</div>
    <div v-else-if="properties.length === 0" class="empty-text">Nenhum imóvel disponível no momento.</div>
    
    <div v-else class="properties-grid">
      <div v-for="prop in properties" :key="prop._id" class="property-card">
        <img :src="prop.imageUrls[0]" :alt="prop.title" class="property-image" />
        <div class="property-info">
          <h3 class="property-title">{{ prop.title }}</h3>
          <p class="property-owner">Proprietário: {{ prop.owner.name || 'Não informado' }}</p>
          <p class="property-rent">{{ prop.rentAmount }} ETH / mês</p>
          
          <div class="card-actions">
            <template v-if="loggedInUserId && prop.owner && prop.owner._id === loggedInUserId">
              <button @click="openEditModal(prop)" class="edit-btn">Editar</button>
              <button @click="deleteProperty(prop._id)" class="delete-btn">Excluir</button>
            </template>

            <template v-else>
              <button @click="openDetailsModal(prop)" class="details-btn">Ver Detalhes</button>
              <router-link :to="{ name: 'CreateContract', params: { propertyId: prop._id } }" class="rent-btn">
                Alugar
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>

    <PropertyModal
      v-if="isModalVisible"
      :property="selectedProperty"
      @close="closeDetailsModal"
    />
    
    <EditProperty
      v-if="isEditModalVisible"
      :property="propertyToEdit"
      @close="closeEditModal"
      @property-updated="handlePropertyUpdate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import PropertyModal from '../../modal/Property.vue';
import  { propertyService } from '../../services/propertyService';
import { userService } from '../../services/userService';
import EditProperty from '../../modal/EditProperty.vue'; 

const toast = useToast();
const properties = ref([]);
const loading = ref(true);
const loggedInUserId = ref(null)

const isModalVisible = ref(false);
const selectedProperty = ref(null);

const isEditModalVisible = ref(false);
const propertyToEdit = ref(null);

function openDetailsModal(property) {
  selectedProperty.value = property;
  isModalVisible.value = true;
}

function closeDetailsModal() {
  isModalVisible.value = false;
  selectedProperty.value = null;
}

// NOVO: Funções para controlar o modal de edição
function openEditModal(property) {
  propertyToEdit.value = property;
  isEditModalVisible.value = true;
}

function closeEditModal() {
  isEditModalVisible.value = false;
  propertyToEdit.value = null;
}

function handlePropertyUpdate(updatedProperty) {
  const index = properties.value.findIndex(p => p._id === updatedProperty._id);
  if (index !== -1) {
    properties.value[index] = updatedProperty;
  }
  closeEditModal(); 
}

async function deleteProperty(propertyId) {
  if (!confirm('Tem certeza de que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    await propertyService.deleteProperty(propertyId);
    properties.value = properties.value.filter(p => p._id !== propertyId);
    
    toast.success('Imóvel excluído com sucesso!');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Falha ao excluir o imóvel.');
  }
}

async function fetchCurrentUser() {
  try {
    const response = await userService.getCLientById();
    const userData = response.data;
    loggedInUserId.value = userData._id;
  } catch(error) {
    console.error("Erro ao buscar usuário atual", error);

  }
}
async function fetchProperties() {
  loading.value = true;
  try {
    const response = await propertyService.getProperties();
    properties.value = await response.data;
  } catch (error) {
    toast.error(error.message || 'Erro ao carregar os imóveis.');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchCurrentUser();
  await fetchProperties();
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
.edit-btn, .delete-btn {
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

.edit-btn {
  background-color: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}
.edit-btn:hover {
  background-color: #e2e8f0;
}

.delete-btn {
  background-color: #ef4444; /* Vermelho para exclusão */
  color: white;
}
.delete-btn:hover {
  background-color: #dc2626;
}
</style>