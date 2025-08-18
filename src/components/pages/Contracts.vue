<template>
  <div>
    <h1 class="page-title">Contratos</h1>

    <div class="card create-contract-card">
      <h2>Criar Novo Contrato</h2>
      <form @submit.prevent="handleCreateContract" class="form-container">
        <div class="field-group">
          <label for="tenant-address">Endereço da Carteira do Locatário</label>
          <input id="tenant-address" type="text" v-model="newContract.locatario" placeholder="0x..." required />
        </div>
        <div class="field-group">
          <label for="rent-value">Valor do Aluguel (em ETH)</label>
          <input id="rent-value" type="text" v-model="newContract.valor" placeholder="Ex: 0.1" required />
        </div>
        <div class="field-group">
          <label for="property-desc">Descrição do Imóvel</label>
          <input id="property-desc" type="text" v-model="newContract.imovel" placeholder="Ex: Apartamento 2 quartos na Av. Brasil" required />
        </div>
        <button type="submit" class="submit-btn" :disabled="loadingCreate">
          {{ loadingCreate ? 'Enviando transação...' : 'Criar Contrato na Blockchain' }}
        </button>
      </form>
    </div>

    <div class="existing-contracts-section">
      <h2>Contratos Existentes</h2>
      <div v-if="loadingList" class="loading-text">Carregando contratos...</div>
      <div v-else-if="contracts.length === 0" class="empty-text">Nenhum contrato encontrado.</div>
      <div v-else class="contract-list">
        <div v-for="contract in contracts" :key="contract.id" class="card contract-item">
          <p><strong>ID do Contrato:</strong> {{ contract.id }}</p>
          <p><strong>Locador:</strong> {{ contract.locador }}</p>
          <p><strong>Locatário:</strong> {{ contract.locatario }}</p>
          <p><strong>Imóvel:</strong> {{ contract.imovel }}</p>
          <p><strong>Valor:</strong> {{ ethers.formatEther(contract.valor) }} ETH</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ethers } from 'ethers';
import { useToast } from 'vue-toastification';
import contractInfo from '../../../../backend/abi/Rent.json';

const toast = useToast();
const contracts = ref([]);
const loadingList = ref(true);
const loadingCreate = ref(false);

const newContract = ref({
  locatario: '',
  valor: '',
  imovel: ''
});

async function fetchContracts() {
  loadingList.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/contract');
    if (!response.ok) throw new Error('Falha ao buscar contratos da API.');
    contracts.value = await response.json();
  } catch (error) {
    toast.error(error.message);
    console.error(error);
  } finally {
    loadingList.value = false;
  }
}

async function handleCreateContract() {
  loadingCreate.value = true;
  if (typeof window.ethereum === 'undefined') {
    toast.error('MetaMask não está instalado!');
    loadingCreate.value = false;
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const rentContract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);

    const valorEmWei = ethers.parseEther(newContract.value.valor);

    toast.info("Por favor, aprove a transação na sua MetaMask.");
    const tx = await rentContract.createContract(
      newContract.value.locatario,
      valorEmWei,
      newContract.value.imovel
    );

    await tx.wait();

    toast.success('Contrato criado com sucesso na blockchain!');
    
    newContract.value = { locatario: '', valor: '', imovel: '' };
    fetchContracts();

  } catch (error) {
    toast.error(error.message || 'Falha ao criar o contrato.');
    console.error(error);
  } finally {
    loadingCreate.value = false;
  }
}

onMounted(() => {
  fetchContracts();
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