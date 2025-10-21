<template>
  <div>
    <h1 class="page-title">Solicitações de Aluguel Recebidas</h1>
    <p class="page-subtitle">Aqui estão os pedidos de aluguel pendentes para seus imóveis.</p>

    <div v-if="loading" class="loading-state">
      <p>Buscando solicitações...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>Ocorreu um erro: {{ error }}</p>
    </div>

    <div v-else-if="pendingRequests.length === 0" class="empty-state">
      <p>Nenhuma solicitação de aluguel pendente encontrada.</p>
    </div>

    <div v-else class="requests-list">
      <div v-for="req in pendingRequests" :key="req._id" class="card request-item">
        <div v-if="req.property && req.tenant">
          <h3>Imóvel: {{ req.property.title }}</h3>
          <p><strong>Valor:</strong> {{ req.property.fees.rentAmount }} ETH / mês</p>
          <p><strong>Interessado:</strong> {{ req.tenant.name }}</p>
          <p><strong>Carteira do Interessado:</strong> <code>{{ req.tenantWalletAddress }}</code></p>
          <p><strong>Recebido em:</strong> {{ new Date(req.createdAt).toLocaleString() }}</p>

          <div class="card-actions">
            <router-link :to="{ 
              name: 'CreateContract', 
              params: { propertyId: req.property._id },
              query: { 
                tenantWallet: req.tenantWalletAddress,
                requestId: req._id 
              }
            }" class="approve-btn">
              Aprovar e Criar Contrato
            </router-link>
            </div>
        </div>
        <div v-else>
          <p>Erro ao carregar dados da solicitação.</p>
        </div>
      </div>
    </div>

    <div v-if="!loading && otherRequests.length > 0" class="history-section">
      <h2>Histórico de Solicitações</h2>
      <div v-for="req in otherRequests" :key="req._id" class="card request-item-history">
        <p>{{ req.property?.title || 'Imóvel removido' }} - <strong>Status: {{ req.status }}</strong></p>
        <p>Interessado: {{ req.tenant?.name || 'Usuário removido' }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { requestService } from '../../services/requestService';
import { useToast } from 'vue-toastification';

const toast = useToast();
const allRequests = ref([]);
const loading = ref(true);
const error = ref(null);

const pendingRequests = computed(() => {
  return allRequests.value.filter(r => r.status === 'pending');
});

const otherRequests = computed(() => {
  return allRequests.value.filter(r => r.status !== 'pending');
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await requestService.getRequests();
    
    // O controller já populou 'property' e 'tenant'
    allRequests.value = response.data;

  } catch (err) {
    console.error('Erro ao buscar solicitações:', err);
    const message = err.response?.data?.error || 'Falha ao buscar solicitações.';
    error.value = message;
    toast.error(message);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Estilos da sua aplicação (page-title, card, etc.) */
.page-title { font-size: 2rem; font-weight: bold; color: #ffffff; margin-bottom: 0.5rem; }
.page-subtitle { color: #d1d5db; margin-bottom: 2rem; }
.card { background: #fff; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; margin-bottom: 1rem; }

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-item h3 { margin-top: 0; color: #1e293b; }
.request-item p { margin: 0.25rem 0; color: #334155; }
.request-item p strong { color: #1e293b; }
.request-item code {
  background-color: #f1f5f9;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #475569;
}

.card-actions {
  margin-top: 1rem;
  display: flex;
}

.approve-btn {
  border: none;
  background-color: #16a34a; /* Verde */
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}
.approve-btn:hover {
  background-color: #15803d;
}

/* Estados de carregamento/erro */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  color: #4a5568;
}
.error-state { background-color: #fee2e2; color: #b91c1c; }

/* Histórico */
.history-section {
  margin-top: 3rem;
}
.history-section h2 {
  font-size: 1.5rem;
  color: #ffffff;
  border-bottom: 1px solid #374151;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.request-item-history {
  background-color: #f8fafc; /* Um pouco diferente do card principal */
  border-color: #f1f5f9;
}
.request-item-history p { margin: 0; color: #475569; }
</style>