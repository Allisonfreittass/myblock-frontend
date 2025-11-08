<template>
  <div>
    <h1 class="page-title">Meus Contratos</h1>
    <p class="page-subtitle">
      Aqui estão todos os contratos de aluguel registrados na blockchain e vinculados à sua conta.
    </p>

    <!-- Estado de carregamento -->
    <div v-if="loading" class="loading-state">
      <p>Buscando contratos na blockchain...</p>
    </div>

    <!-- Estado de erro -->
    <div v-else-if="error" class="error-state">
      <p>Ocorreu um erro ao buscar os contratos: {{ error }}</p>
    </div>

    <!-- Lista de contratos -->
    <div v-else-if="contracts.length > 0" class="contracts-list">
      <div v-for="contract in contracts" :key="contract._id || contract.id" class="card contract-item">
        <h3>Contrato #{{ contract.id }}</h3>
        <p><strong>Imóvel:</strong> {{ contract.imovel }}</p>
        <p><strong>Locador:</strong> {{ contract.locador }}</p>
        <p><strong>Locatário:</strong> {{ contract.locatario }}</p>
        <p><strong>Valor:</strong> {{ formatEth(contract.valor) }} ETH</p>
        <p><strong>Status:</strong>
          <span :class="['status', contract.status]">{{ contract.status || 'ativo' }}</span>
        </p>
        <p><strong>Criado em:</strong> {{ formatDate(contract.createdAt) }}</p>

        <div class="action-buttons">
          <button
            v-if="contract.status === 'ativo'"
            @click="confirmCancel(contract.id)"
            class="cancel-btn"
          >
            Cancelar Contrato
          </button>
          <span v-else class="status-text">Contrato {{ contract.status }}</span>
        </div>
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-else class="empty-state">
      <p>Nenhum contrato encontrado.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification'

const toast = useToast()
const contracts = ref([])
const loading = ref(true)
const error = ref(null)

// === Buscar contratos ===
async function fetchContracts() {
  try {
    loading.value = true
    error.value = null

    const token = localStorage.getItem('authToken')
    const response = await fetch('http://localhost:3000/api/contracts', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) throw new Error('Falha ao conectar com o servidor.')

    const data = await response.json()
    contracts.value = Array.isArray(data) ? data : []

  } catch (err) {
    console.error('Erro ao buscar contratos:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function confirmCancel(id) {
  if (!confirm('Tem certeza que deseja cancelar este contrato?')) return
  await cancelContract(id)
}

async function cancelContract(id) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`http://localhost:3000/api/contracts/${id}/cancel`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro ao cancelar contrato.')

    toast.success(data.message || 'Contrato cancelado com sucesso.')
    fetchContracts()
  } catch (err) {
    toast.error(err.message || 'Falha ao cancelar contrato.')
  }
}

// === Utilitários ===
function formatEth(weiValue) {
  try {
    return ethers.formatEther(weiValue)
  } catch {
    return weiValue
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '—'
  const date = new Date(Number(timestamp) * 1000 || timestamp)
  return date.toLocaleString('pt-BR')
}

onMounted(fetchContracts)
</script>

<style scoped>
.page-title { font-size: 2rem; font-weight: bold; color: #ffffff; margin-bottom: 0.5rem; }
.page-subtitle { color: #d1d5db; margin-bottom: 2rem; }

.card { background: #fff; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; margin-bottom: 1rem; }
.contract-item h3 { margin-top: 0; }
.contract-item p { margin: 0.25rem 0; color: #334155; }

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  text-transform: capitalize;
}
.status.ativo { color: #15803d; background-color: #dcfce7; }
.status.cancelado { color: #b91c1c; background-color: #fee2e2; }
.status.expirado { color: #92400e; background-color: #fef3c7; }

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  color: #4a5568;
}
.error-state { background-color: #fee2e2; color: #b91c1c; }

.cancel-btn {
  border: none;
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.cancel-btn:hover { background-color: #b91c1c; }

.action-buttons { margin-top: 1rem; }
</style>
