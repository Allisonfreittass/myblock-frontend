<template>
  <div>
    <h1 class="page-title">Criação de Contrato</h1>
    <p v-if="property" class="page-subtitle">Você está iniciando o contrato para o imóvel: **{{ property.title }}**</p>

    <div class="card create-contract-card">
      <h2>Dados do Contrato</h2>
      <form @submit.prevent="handleCreateContract" class="form-container">
        <div class="field-group">
          <label for="tenant-address">Endereço da Carteira do Locatário</label>
          <input id="tenant-address" type="text" v-model="newContract.locatario" placeholder="0x..." required />
        </div>
        <div class="field-group">
          <label for="rent-value">Valor do Aluguel (em ETH)</label>
          <input id="rent-value" type="text" v-model="newContract.valor" required :disabled="!!property" />
        </div>
        <div class="field-group">
          <label for="property-desc">Descrição do Imóvel</label>
          <input id="property-desc" type="text" v-model="newContract.imovel" required :disabled="!!property" />
        </div>
        <button type="submit" class="submit-btn" :disabled="loadingCreate">
          {{ loadingCreate ? 'Enviando transação...' : 'Criar Contrato na Blockchain' }}
        </button>
      </form>
    </div>
    
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ethers } from 'ethers';
import { useToast } from 'vue-toastification';
import contractInfo from '../../../../backend/abi/Rent.json';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const property = ref(null); 
const loadingCreate = ref(false);

const newContract = ref({
  locatario: '',
  valor: '',
  imovel: ''
});

async function fetchPropertyDetails(propertyId) {
  try {
    const response = await fetch(`http://localhost:3000/api/properties/${propertyId}`);
    if (!response.ok) throw new Error('Imóvel não encontrado.');
    
    const data = await response.json();
    property.value = data;
    
    newContract.value.valor = data.rentAmount;
    newContract.value.imovel = data.title; 

  } catch (error) {
    toast.error(error.message);
    router.push('/properties'); 
  }
}

async function handleCreateContract() {
  loadingCreate.value = true;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const rentContract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
    const valorEmWei = ethers.parseEther(newContract.value.valor);
    
    toast.info("Por favor, aprove a transação na sua MetaMask.");
    const tx = await rentContract.createContract(newContract.value.locatario, valorEmWei, newContract.value.imovel);
    await tx.wait();
    toast.success('Contrato criado com sucesso na blockchain!');
    if (property.value) {
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:3000/api/properties/${property.value._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rented' })
      });
      toast.info('Status do imóvel atualizado para "Alugado".');
    }
    
    router.push('/properties');

  } catch (error) {
    toast.error(error.message || 'Falha ao criar o contrato.');
    console.error(error);
  } finally {
    loadingCreate.value = false;
  }
}

onMounted(() => {
  const propertyId = route.params.propertyId;
  if (propertyId) {
    fetchPropertyDetails(propertyId);
  }
});
</script>

<style scoped>
.page-title { font-size: 2rem; font-weight: bold; color: #ffffff; margin-bottom: 2rem; }
.card { background: #fff; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
.create-contract-card { margin-bottom: 2.5rem; }
.form-container { display: flex; flex-direction: column; gap: 1rem; }
.field-group { display: flex; flex-direction: column; }
.field-group label { margin-bottom: 0.5rem; font-weight: 500; color: #4a5568; }
.field-group input { padding: 0.75rem; border: 1px solid #cbd5e7; border-radius: 0.375rem; font-size: 1rem; }
.submit-btn { border: none; background-color: #16a34a; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: bold; cursor: pointer; margin-top: 1rem; align-self: flex-end; }
.submit-btn:disabled { background-color: #86efac; }
.existing-contracts-section h2 { font-size: 1.5rem; margin-bottom: 1rem; }
.contract-list { display: flex; flex-direction: column; gap: 1rem; }
.contract-item p { margin: 0.25rem 0; color: #334155; }
.contract-item p strong { color: #1e293b; }
.loading-text, .empty-text { color: #64748b; }
</style>