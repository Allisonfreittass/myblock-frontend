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
      <img src="../icons/empty-box.svg" alt="Caixa vazia" class="empty-icon" />
      <h3>Nenhuma solicitação pendente</h3>
      <p>Quando um inquilino se interessar por um imóvel seu, ele aparecerá aqui.</p>
    </div>

    <div v-else class="requests-grid">
      <div v-for="req in pendingRequests" :key="req._id" class="card request-card">
        <div v-if="req.property && req.tenant">
          
          <div class="card-image-wrapper">
            <img 
              :src="req.property.images?.[0] || 'https://via.placeholder.com/400x250.png?text=Imóvel+sem+foto'" 
              alt="Foto do imóvel" 
              class="property-image"
            />
          </div>

          <div class="card-content">
            <h3 class="property-title">{{ req.property.title }}</h3>
            <p class="property-location">{{ req.property.location?.city || 'Localização não informada' }}</p>
            <p class="property-price">
              <strong>{{ req.property.fees.rentAmount }} ETH</strong> / mês
            </p>

            <hr class="divider" />

            <div class="tenant-info">
              <img 
                :src="req.tenant.avatarUrl || 'https://via.placeholder.com/50.png?text=User'" 
                alt="Avatar" 
                class="tenant-avatar"
              />
              <div class="tenant-details">
                <strong>{{ req.tenant.name }}</strong>
                <div class="wallet-info">
                  <code>{{ truncateWallet(req.tenantWalletAddress) }}</code>
                  <button @click="copyToClipboard(req.tenantWalletAddress)" class="copy-btn" title="Copiar carteira">
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            <p class="request-date">Recebido em: {{ new Date(req.createdAt).toLocaleDateString() }}</p>
          </div>

          <div class="card-actions">
            <button @click="rejectRequest(req._id)" class="reject-btn" :disabled="isUpdating(req._id)">
              Rejeitar
            </button>
            <router-link :to="{ 
              name: 'CreateContract', 
              params: { propertyId: req.property._id },
              query: { 
                tenantWallet: req.tenantWalletAddress,
                requestId: req._id 
              }
            }" class="approve-btn" :class="{ 'disabled-link': isUpdating(req._id) }">
              Aprovar
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
      <div class="history-list">
        <div v-for="req in otherRequests" :key="req._id" class="card request-item-history">
          <div class="history-info">
            <p class="history-title">{{ req.property?.title || 'Imóvel removido' }}</p>
            <p class="history-tenant">Interessado: {{ req.tenant?.name || 'Usuário removido' }}</p>
          </div>
          <span :class="['badge', `badge-${req.status}`]">{{ getStatusLabel(req.status) }}</span>
        </div>
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
const updatingRequests = ref([]); 

const pendingRequests = computed(() => {
  return allRequests.value.filter(r => r.status === 'pending');
});

const otherRequests = computed(() => {
  return allRequests.value
    .filter(r => r.status !== 'pending')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
});

const isUpdating = (requestId) => {
  return updatingRequests.value.includes(requestId);
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await requestService.getRequests();
    allRequests.value = response.data.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt); 
    });

  } catch (err) {
    console.error('Erro ao buscar solicitações:', err);
    const message = err.response?.data?.error || 'Falha ao buscar solicitações.';
    error.value = message;
    toast.error(message);
  } finally {
    loading.value = false;
  }
});

async function rejectRequest(requestId) {
  if (isUpdating(requestId)) return;

  updatingRequests.value.push(requestId); 
  
  try {
    await requestService.updateRequestStatus(requestId, 'rejected'); 
    const index = allRequests.value.findIndex(r => r._id === requestId);
    if (index !== -1) {
      allRequests.value[index].status = 'rejected';
      allRequests.value[index].updatedAt = new Date().toISOString(); 
    }
    
    toast.success('Solicitação rejeitada.');

  } catch (err) {
    console.error('Erro ao rejeitar solicitação:', err);
    toast.error(err.response?.data?.error || 'Falha ao rejeitar solicitação.');
  } finally {
    updatingRequests.value = updatingRequests.value.filter(id => id !== requestId);
  }
}


function truncateWallet(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Endereço da carteira copiado!');
  } catch (err) {
    toast.error('Falha ao copiar.');
  }
}

function getStatusLabel(status) {
  const labels = {
    'rejected': 'Rejeitado',
    'approved': 'Aprovado',
    'pending': 'Pendente'
  };
  return labels[status] || status;
}
</script>

<style scoped>
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
  display: flex;
  background-color: #16a34a; 
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

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  color: #4a5568;
}
.error-state { background-color: #fee2e2; color: #b91c1c; }

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
/* Estilos da Página (como antes) */
.page-title { font-size: 2rem; font-weight: bold; color: #ffffff; margin-bottom: 0.5rem; }
.page-subtitle { color: #d1d5db; margin-bottom: 2rem; }
.card { 
  background: #fff; 
  border-radius: 0.75rem; /* Um pouco mais arredondado */
  border: 1px solid #e2e8f0; 
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Para conter a imagem */
}

/* NOVO: Layout em Grid */
.requests-grid {
  display: grid;
  /* Cria colunas responsivas:
     - Tenta criar colunas de no mínimo 350px.
     - auto-fill: preenche o espaço com quantas colunas couberem.
     - 1fr: faz com que as colunas se estiquem para ocupar o espaço total.
  */
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.request-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.request-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* NOVO: Estilos da Imagem */
.card-image-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9; /* Proporção da imagem */
  background-color: #f1f5f9;
}
.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Garante que a imagem cubra o espaço */
}

/* NOVO: Conteúdo do Card */
.card-content {
  padding: 1.5rem;
  flex-grow: 1; /* Faz o conteúdo crescer para preencher o card */
}

.property-title { margin: 0; font-size: 1.25rem; font-weight: 600; color: #1e293b; }
.property-location { margin: 0.25rem 0; color: #64748b; font-size: 0.9rem; }
.property-price { margin: 0.5rem 0 0 0; color: #1e293b; font-size: 1.1rem; }
.property-price strong { font-weight: bold; color: #059669; /* Verde mais escuro */ }

.divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1rem 0;
}

/* NOVO: Info do Inquilino */
.tenant-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.tenant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}
.tenant-details {
  display: flex;
  flex-direction: column;
}
.tenant-details strong { color: #1e293b; }

.wallet-info { display: flex; align-items: center; gap: 0.5rem; }
.wallet-info code {
  background-color: #f1f5f9;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.8rem; /* Menor para caber */
  color: #475569;
}
.copy-btn {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #475569;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
}
.copy-btn:hover { background-color: #f8fafc; }

.request-date { font-size: 0.875rem; color: #64748b; margin: 0; }

/* Ações do Card (Agora no rodapé) */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem 1.5rem; /* Alinhado com o card-content */
}
.card-actions .approve-btn,
.card-actions .reject-btn {
  flex: 1; /* Faz os botões ocuparem o mesmo espaço */
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s;
}

.approve-btn {
  background-color: #16a34a; 
  color: white;
}
.approve-btn:hover { background-color: #15803d; }

/* NOVO: Botão Rejeitar */
.reject-btn {
  background-color: #f1f5f9; /* Cor neutra */
  color: #475569;
}
.reject-btn:hover { background-color: #e2e8f0; }

/* NOVO: Estilo para desabilitar botões */
.reject-btn:disabled,
.approve-btn.disabled-link {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #e2e8f0;
}
.approve-btn.disabled-link {
   background-color: #16a34a; /* Manter cor para link, mas com opacidade */
   opacity: 0.6;
}


/* Estados */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #ffffff; /* Fundo branco para combinar com os cards */
  border-radius: 0.75rem;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}
.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  opacity: 0.5;
}
.empty-state h3 { font-size: 1.25rem; color: #1e293b; margin: 0.5rem 0; }
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

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-item-history {
  background-color: #fff;
  border-color: #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}
.history-info p { margin: 0; color: #475569; }
.history-info .history-title { font-weight: 500; color: #334155; }
.history-info .history-tenant { font-size: 0.9rem; }

/* NOVO: Badges de Status */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px; /* Formato de pílula */
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}
.badge-rejected {
  background-color: #fee2e2; /* Fundo vermelho claro */
  color: #b91c1c; /* Texto vermelho escuro */
}
.badge-approved,
.badge-completed {
  background-color: #dcfce7; /* Fundo verde claro */
  color: #166534; /* Texto verde escuro */
}
.badge-cancelled {
  background-color: #f1f5f9; /* Fundo cinza claro */
  color: #475569; /* Texto cinza escuro */
}
</style>