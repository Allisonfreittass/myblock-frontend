<template>
  <div class="page-container">
    <div class="header-section">
      <h1 class="page-title">Criação de Contrato</h1>
      <p class="page-subtitle">
        Preencha as informações abaixo para registrar um novo contrato de aluguel na blockchain.
      </p>
    </div>

    <div v-if="property" class="card selected-property-card animated fadeIn">
      <div class="property-image-wrapper">
         <img 
          v-if="property.imageUrls && property.imageUrls.length" 
          :src="property.imageUrls[0]" 
          alt="Imóvel" 
          class="property-thumb"
        />
        <div v-else class="property-placeholder">
          <span>Sem foto</span>
        </div>
      </div>
      <div class="property-info">
        <span class="badge-status">Imóvel Selecionado</span>
        <h3>{{ property.title }}</h3>
        <p class="property-location">{{ property.description }}</p>
        <p class="property-price">
          Valor sugerido: <strong>{{ property.fees?.rentAmount || '0.00' }} ETH</strong>
        </p>
      </div>
      <div class="property-actions" v-if="!route.params.propertyId">
        <button @click="clearSelectedProperty" class="change-property-btn">
          Trocar Imóvel
        </button>
      </div>
    </div>

    <div v-else class="card select-property-card animated fadeIn">
      <h2>Selecione o Imóvel</h2>
      <p class="card-description">Escolha qual dos seus imóveis disponíveis será alugado.</p>
      
      <div v-if="loadingProperties" class="loading-state">
        <span class="loader"></span> Carregando seus imóveis...
      </div>
      <div v-else-if="availableProperties.length === 0" class="empty-state">
        Você não tem imóveis disponíveis para alugar no momento.
      </div>
      <div v-else class="field-group full-width">
        <label for="property-select">Imóvel Disponível</label>
        <select 
          id="property-select" 
          @change="handlePropertySelect($event.target.value)"
          class="input-field custom-select"
        >
          <option value="">-- Selecione um imóvel --</option>
          <option 
            v-for="p in availableProperties" 
            :key="p._id" 
            :value="p._id"
          >
            {{ p.title }} ({{ p.status === 'available' ? 'Disponível' : p.status }})
          </option>
        </select>
      </div>
    </div>

    <div v-if="property" class="card create-contract-card animated fadeInUp">
      <div class="card-header">
        <h2>Dados do Contrato</h2>
        <p class="card-description">Confirme os valores e datas para finalizar o registro.</p>
      </div>

      <form @submit.prevent="handleCreateContract" class="form-grid">
        <div class="field-group full-width">
          <label for="tenant-address">Endereço da Carteira do Locatário</label>
          <input
            id="tenant-address"
            type="text"
            v-model="newContract.locatario"
            placeholder="0x..."
            required
            :disabled="!!route.query.tenantWallet"
            class="input-field mono-font"
          />
        </div>

        <div class="form-row-2">
          <div class="field-group">
            <label for="rent-value">Valor do Aluguel (ETH)</label>
             <div class="input-wrapper eth-wrapper">
               <input
                id="rent-value"
                type="number"
                step="0.0001"
                v-model="newContract.valor"
                required
                class="input-field"
                placeholder="0.00"
              />
              <span class="input-suffix">ETH</span>
            </div>
          </div>

           <div class="field-group">
            <label for="due-day">Dia de Vencimento</label>
            <input
              id="due-day"
              type="number"
              v-model="newContract.diaVencimento"
              min="1"
              max="31"
              required
              class="input-field"
              placeholder="Dia (1-31)"
            />
          </div>
        </div>

        <div class="form-row-2">
          <div class="field-group">
            <label for="start-date">Data de Início</label>
            <input
              id="start-date"
              type="date"
              v-model="newContract.dataInicio"
              required
              class="input-field"
            />
          </div>

          <div class="field-group">
            <label for="end-date">Data de Término</label>
            <input
              id="end-date"
              type="date"
              v-model="newContract.dataFim"
              required
              class="input-field"
            />
          </div>
        </div>
        
         <div class="field-group full-width" style="display: none;">
            <input type="text" v-model="newContract.imovel" />
         </div>

        <div class="form-actions full-width">
          <button type="submit" class="submit-btn" :disabled="loadingCreate">
            <span v-if="loadingCreate" class="loader-spin"></span>
            {{ loadingCreate ? "Processando na Blockchain..." : "Criar Contrato" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ethers } from "ethers";
import { useToast } from "vue-toastification";
import contractInfo from "../../../../backend/abi/Rent.json";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const property = ref(null);
const availableProperties = ref([]); // Lista para o dropdown
const loadingProperties = ref(false);
const loadingCreate = ref(false);

const newContract = ref({
  locatario: "",
  valor: "",
  imovel: "", // Título do imóvel
  dataInicio: "",
  dataFim: "",
  diaVencimento: "",
});

// --- Funções de Busca ---

// Busca um imóvel específico (quando vem pela rota)
async function fetchPropertyDetails(propertyId) {
  try {
    // Ajuste a URL conforme sua API real
    const response = await fetch(`http://localhost:3000/api/properties/${propertyId}`);
    if (!response.ok) throw new Error("Imóvel não encontrado.");
    const data = await response.json();
    selectProperty(data);
  } catch (error) {
    toast.error(error.message);
    router.push("/properties");
  }
}

// Busca todos os imóveis do usuário (para o dropdown manual)
async function fetchMyProperties() {
  loadingProperties.value = true;
  try {
    const token = localStorage.getItem("authToken");
    // Ajuste a URL para o seu endpoint que lista "meus imóveis"
    const response = await fetch(`http://localhost:3000/api/properties/my`, {
       headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Falha ao carregar seus imóveis.");
    
    const data = await response.json();
    // Opcional: Filtrar apenas por 'available' se quiser restringir
    // availableProperties.value = data.filter(p => p.status === 'available');
    availableProperties.value = data; 
  } catch (error) {
    toast.error("Erro ao carregar lista de imóveis.");
    console.error(error);
  } finally {
    loadingProperties.value = false;
  }
}

// --- Funções Auxiliares ---

// Função centralizada para selecionar um imóvel e preencher o formulário
function selectProperty(propData) {
  property.value = propData;
  // Preenche automaticamente os campos baseados no imóvel selecionado
  newContract.value.valor = propData.fees?.rentAmount || "";
  newContract.value.imovel = propData.title || ""; // A descrição no contrato será o Título do imóvel
}

// Manipulador do Dropdown
function handlePropertySelect(propertyId) {
  if (!propertyId) {
    property.value = null;
    return;
  }
  const selected = availableProperties.value.find(p => p._id === propertyId);
  if (selected) {
    selectProperty(selected);
    toast.info(`Imóvel "${selected.title}" selecionado.`);
  }
}

// Limpa a seleção (caso o usuário queira trocar no modo manual)
function clearSelectedProperty() {
  property.value = null;
  newContract.value.valor = "";
  newContract.value.imovel = "";
  // Se não tiver a lista carregada ainda, carrega agora
  if (availableProperties.value.length === 0) {
      fetchMyProperties();
  }
}

// --- Criação do Contrato ---

async function handleCreateContract() {
  if (!property.value) {
      toast.warning("Selecione um imóvel primeiro.");
      return;
  }

  loadingCreate.value = true;
  try {
    if (!window.ethereum) throw new Error("MetaMask não encontrada.");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const rentContract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
    
    // Garantir que o valor é uma string para o parseEther
    const valorString = newContract.value.valor.toString();
    const valorEmWei = ethers.parseEther(valorString);

    toast.info("Abrindo MetaMask... Por favor, aprove a transação.");

    // Chamada ao Smart Contract
    const tx = await rentContract.createContract(
      newContract.value.locatario,
      valorEmWei,
      newContract.value.imovel // Passando o título do imóvel como descrição na blockchain
    );

    toast.info("Transação enviada. Aguardando confirmação...");
    const receipt = await tx.wait();

    toast.success("Contrato registrado na blockchain!");

    // Salvar no Backend (MongoDB)
    const token = localStorage.getItem("authToken");
    
    // Tenta pegar o ID do evento da blockchain, fallback para 0 se algo falhar na leitura dos logs
    let blockchainId = 0;
    try {
        // Dependendo da versão do ethers e da ABI, o log pode estar em posições diferentes.
        // O ideal é filtrar pelo evento 'ContractCreated' se possível.
        blockchainId = Number(receipt.logs[0]?.args?.[0] || 0); 
    } catch (e) {
        console.warn("Não foi possível extrair o ID do contrato dos logs automaticamente", e);
    }

    await fetch("http://localhost:3000/api/contracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        blockchainId: blockchainId,
        txHash: receipt.hash, // ethers v6 usa .hash, v5 usava .transactionHash
        propertyId: property.value._id,
        locador: await signer.getAddress(),
        locatario: newContract.value.locatario,
        valor: newContract.value.valor,
        imovel: newContract.value.imovel, // Título
        dataInicio: newContract.value.dataInicio,
        dataFim: newContract.value.dataFim,
        diaVencimento: newContract.value.diaVencimento,
        status: "ativo",
      }),
    });

    // Atualiza status do imóvel para 'rented'
    await fetch(`http://localhost:3000/api/properties/${property.value._id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rented" }),
    });

    router.push("/contracts");
  } catch (error) {
    console.error(error);
    // Tratamento de erros comuns da MetaMask
    if (error.code === 'ACTION_REJECTED') {
        toast.error("Transação rejeitada pelo usuário.");
    } else {
        toast.error(error.message || "Falha ao criar o contrato.");
    }
  } finally {
    loadingCreate.value = false;
  }
}

onMounted(() => {
  const propertyId = route.params.propertyId;
  
  if (propertyId) {
    // Cenário 1: Veio com ID da rota -> Busca detalhes e trava seleção
    fetchPropertyDetails(propertyId);
  } else {
    // Cenário 2: Criação manual -> Busca lista para o dropdown
    fetchMyProperties();
  }

  if (route.query.tenantWallet) {
    newContract.value.locatario = route.query.tenantWallet;
  }
});
</script>

<style scoped>
/* --- Animações Básicas --- */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animated.fadeIn { animation: fadeIn 0.5s ease-out; }
.animated.fadeInUp { animation: fadeInUp 0.5s ease-out; }

/* --- Layout e Cards --- */
.page-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.card {
  background: var(--bg-card, #1e293b);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid var(--border-color, #334155);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

/* --- Novo Card de Imóvel Selecionado --- */
.selected-property-card {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    background: linear-gradient(to right, #1e293b, #0f172a);
    border: 1px solid var(--primary-color, #3b82f6); /* Borda azul para destaque */
}

.property-image-wrapper {
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 2px solid var(--border-color, #334155);
}

.property-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.property-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #334155;
    color: #94a3b8;
    font-size: 0.875rem;
}

.property-info {
    flex-grow: 1;
}

.badge-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 999px;
    margin-bottom: 0.5rem;
}

.property-info h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary, #f8fafc);
}

.property-location {
    color: var(--text-tertiary, #94a3b8);
    margin: 0.5rem 0;
    font-size: 0.95rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.property-price {
    color: var(--text-secondary, #cbd5e1);
    margin: 0;
}
.property-price strong {
    color: #10b981; /* Verde para o preço */
    font-size: 1.1rem;
}

.change-property-btn {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--border-color, #334155);
    color: var(--text-secondary, #cbd5e1);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
}
.change-property-btn:hover {
    border-color: var(--text-secondary, #cbd5e1);
    background: rgba(255,255,255,0.05);
}

/* --- Forms e Inputs --- */
.form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary, #cbd5e1);
}

.input-field {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #334155);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: var(--bg-input, #0f172a);
  color: var(--text-primary, #f8fafc);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input-field:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: #1e293b; /* Um pouco mais claro que o input normal para indicar disabled */
}

.mono-font {
    font-family: 'Courier New', Courier, monospace; /* Melhor para endereços de carteira */
}

.custom-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

/* --- Wrappers de Input (ETH) --- */
.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.input-wrapper .input-field {
    width: 100%;
    padding-right: 3.5rem; /* Espaço para o sufixo ETH */
}
.input-suffix {
    position: absolute;
    right: 1rem;
    color: var(--text-tertiary, #94a3b8);
    font-weight: 600;
    pointer-events: none;
}

/* --- Botão de Submit --- */
.submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover, #2563eb);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #475569;
}

/* --- Loader Simples --- */
.loader-spin {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsividade para telas menores */
@media (max-width: 640px) {
    .selected-property-card {
        flex-direction: column;
        text-align: center;
    }
    .property-info {
        width: 100%;
    }
    .form-row-2 {
        grid-template-columns: 1fr; /* Empilha em telas pequenas */
        gap: 1rem;
    }
}
</style>