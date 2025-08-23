<template>
  <div>
    <h1 class="page-title">Meus Contratos</h1>
    <p class="page-subtitle">Aqui estão os contratos de aluguel vinculados à sua carteira.</p>

    <div v-if="loading" class="loading-state">
      <p>Buscando contratos na blockchain...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>Ocorreu um erro ao buscar os contratos: {{ error }}</p>
    </div>

    <div v-else-if="contracts.length > 0" class="contracts-list">
      <div v-for="contract in contracts" :key="contract.id" class="card contract-item">
        <h3>Contrato #{{ contract.id }}</h3>
        <p><strong>Imóvel:</strong> {{ contract.imovel }}</p>
        <p><strong>Locador:</strong> {{ contract.locador }}</p>
        <p><strong>Locatário:</strong> {{ contract.locatario }}</p>
        <p><strong>Valor:</strong> {{ formatEth(contract.valor) }} ETH</p>
        <p><strong>Criado em:</strong> {{ new Date(Number(contract.createdAt) * 1000).toLocaleString() }}</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Nenhum contrato encontrado.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ethers } from 'ethers';

const contracts = ref([]);
const loading = ref(true);
const error = ref(null);

// Função para buscar os contratos da sua API
async function fetchContracts() {
  try {
    loading.value = true;
    error.value = null;
    // A URL deve corresponder à sua API do backend
    const response = await fetch('http://localhost:3000/api/contracts');
    
    if (!response.ok) {
      throw new Error('Falha ao conectar com o servidor.');
    }
    
    const data = await response.json();
    contracts.value = data;

  } catch (err) {
    console.error('Erro ao buscar contratos:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Função para formatar o valor de Wei para Ether
function formatEth(weiValue) {
  return ethers.formatEther(weiValue);
}

// Quando o componente for montado, busque os contratos
onMounted(() => {
  fetchContracts();
});
</script>

<style scoped>
/* Estilos para manter a consistência visual */
.page-title { font-size: 2rem; font-weight: bold; color: #ffffff; margin-bottom: 0.5rem; }
.page-subtitle { color: #d1d5db; margin-bottom: 2rem; }
.card { background: #fff; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; margin-bottom: 1rem; }
.contract-item h3 { margin-top: 0; }
.contract-item p { margin: 0.25rem 0; color: #334155; }
.contract-item p strong { color: #1e293b; }
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  color: #4a5568;
}
.error-state { background-color: #fee2e2; color: #b91c1c; }
</style>