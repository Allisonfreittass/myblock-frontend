<template>
  <div class="page-container">
    <div class="header-section">
      <h1 class="page-title">Criação de Contrato</h1>
      <p v-if="property" class="page-subtitle">
        Imóvel selecionado: <span class="highlight">{{ property.title }}</span>
      </p>
    </div>

    <div class="card create-contract-card">
      <div class="card-header">
        <h2>Dados do Contrato</h2>
        <p class="card-description">Preencha as informações para registrar o contrato na blockchain.</p>
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
            class="input-field"
          />
        </div>

        <div class="field-group full-width">
          <label for="property-desc">Descrição do Imóvel</label>
          <input
            id="property-desc"
            type="text"
            v-model="newContract.imovel"
            required
            :disabled="!!property"
            class="input-field"
            placeholder="Ex: Apartamento Centro..."
          />
        </div>

        <div class="field-group">
          <label for="rent-value">Valor do Aluguel (ETH)</label>
          <div class="input-wrapper eth-wrapper">
             <input
              id="rent-value"
              type="number"
              step="0.01"
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
            type="date"
            v-model="newContract.diaVencimento"
            min="1"
            max="31"
            required
            class="input-field"
            placeholder="Dia (1-31)"
          />
        </div>

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

        <div class="form-actions full-width">
          <button type="submit" class="submit-btn" :disabled="loadingCreate">
            <span v-if="loadingCreate" class="loader"></span>
            {{ loadingCreate ? "Processando..." : "Criar Contrato na Blockchain" }}
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
const loadingCreate = ref(false);

const newContract = ref({
  locatario: "",
  valor: "",
  imovel: "",
  dataInicio: "",
  dataFim: "",
  diaVencimento: "",
});

async function fetchPropertyDetails(propertyId) {
  try {
    const response = await fetch(`http://localhost:3000/api/properties/${propertyId}`);
    if (!response.ok) throw new Error("Imóvel não encontrado.");

    const data = await response.json();
    property.value = data;

    newContract.value.valor = data.fees?.rentAmount || "";
    newContract.value.imovel = data.title || "";
  } catch (error) {
    toast.error(error.message);
    router.push("/properties");
  }
}

async function handleCreateContract() {
  loadingCreate.value = true;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const rentContract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
    const valorEmWei = ethers.parseEther(newContract.value.valor.toString()); // Garante que é string para o parseEther

    toast.info("Por favor, aprove a transação na sua MetaMask.");

    const tx = await rentContract.createContract(
      newContract.value.locatario,
      valorEmWei,
      newContract.value.imovel
    );

    const receipt = await tx.wait();

    toast.success("Contrato criado com sucesso na blockchain!");

    // Salvar no backend
    const token = localStorage.getItem("authToken");
    await fetch("http://localhost:3000/api/contracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        blockchainId: Number(receipt.logs[0]?.args?.id || 0),
        txHash: receipt.transactionHash,
        propertyId: property.value?._id,
        locador: await signer.getAddress(),
        locatario: newContract.value.locatario,
        valor: newContract.value.valor,
        imovel: newContract.value.imovel,
        dataInicio: newContract.value.dataInicio,
        dataFim: newContract.value.dataFim,
        diaVencimento: newContract.value.diaVencimento,
        status: "ativo",
      }),
    });

    if (property.value) {
      await fetch(`http://localhost:3000/api/properties/${property.value._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rented" }),
      });
      toast.info('Status do imóvel atualizado para "Alugado".');
    }

    router.push("/contracts");
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Falha ao criar o contrato.");
  } finally {
    loadingCreate.value = false;
  }
}

onMounted(() => {
  const propertyId = route.params.propertyId;
  if (propertyId) fetchPropertyDetails(propertyId);

  if (route.query.tenantWallet) {
    newContract.value.locatario = route.query.tenantWallet;
  }
});
</script>

<style scoped>
/* --- Cores e Variáveis (Tema Escuro) --- */
:root {
  --bg-card: #1e293b;      /* Slate 800 */
  --bg-input: #0f172a;     /* Slate 950 */
  --border-color: #334155; /* Slate 700 */
  --text-primary: #f8fafc; /* Slate 50 */
  --text-secondary: #cbd5e1; /* Slate 300 */
  --text-tertiary: #94a3b8;  /* Slate 400 */
  --primary-color: #3b82f6;  /* Blue 500 */
  --primary-hover: #2563eb;  /* Blue 600 */
}

/* --- Estilos Gerais --- */
.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: var(--text-primary, #f8fafc);
  letter-spacing: -0.025em;
}

.page-subtitle {
  color: var(--text-tertiary, #94a3b8);
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

/* --- Card Principal --- */
.card {
  background: var(--bg-card, #1e293b);
  padding: 2.5rem;
  border-radius: 1rem;
  border: 1px solid var(--border-color, #334155);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border-top: 1px solid var(--border-color, #334155);
  padding-top: 2rem;
  margin-top: 1rem;
}

.form-section:first-child {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

.form-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #f8fafc);
  margin-bottom: 1.5rem;
}

/* --- Campos e Inputs --- */
.field-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem; /* Espaçamento padrão inferior */
}

.field-group label {
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-secondary, #cbd5e1);
}

.field-group input,
.field-group textarea,
.field-group select {
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color, #334155);
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--bg-input, #0f172a);
  color: var(--text-primary, #f8fafc);
  transition: all 0.2s;
}

.field-group input:focus,
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); /* Aura azul ao focar */
}

.field-group input::placeholder,
.field-group textarea::placeholder {
  color: #475569; /* Slate 600 - mais escuro para placeholder */
}

/* --- Checkboxes --- */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.5rem 0;
}

.checkbox-group input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--primary-color, #3b82f6);
  cursor: pointer;
}

.checkbox-group label {
  color: var(--text-primary, #f8fafc);
  font-weight: 500;
  cursor: pointer;
}

/* --- Upload de Imagem --- */
.file-input {
  display: none;
}

.file-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px dashed var(--border-color, #334155);
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: rgba(15, 23, 42, 0.5); /* Slate 950 com transparência */
  color: var(--text-secondary, #cbd5e1);
  font-weight: 500;
  transition: all 0.2s;
}

.file-input-label:hover {
  border-color: var(--primary-color, #3b82f6);
  background-color: var(--bg-input, #0f172a);
  color: var(--primary-color, #3b82f6);
}

.gallery-preview {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 2px solid var(--border-color, #334155);
}

/* --- Inputs Somente Leitura --- */
.readonly-input {
  background-color: #334155 !important; /* Slate 700 */
  color: #94a3b8 !important; /* Slate 400 */
  cursor: not-allowed;
  border-color: transparent !important;
}

.helper-text {
  font-size: 0.875rem;
  color: var(--text-tertiary, #94a3b8);
  margin-top: 0.5rem;
}

/* --- Map Preview --- */
.map-preview {
  margin-top: 1.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color, #334155);
}

/* --- Preview Card (Azul) --- */
.preview-card {
  background: linear-gradient(135deg, #1e40af, #3b82f6); /* Gradiente azul */
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: none;
  color: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.preview-card h3 {
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 1rem;
}

/* --- Botões de Ação --- */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color, #334155);
}

.clear-btn,
.submit-btn {
  padding: 0.875rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.clear-btn {
  background: #334155; /* Slate 700 */
  color: var(--text-primary, #f8fafc);
}
.clear-btn:hover {
  background-color: #475569; /* Slate 600 */
}

.submit-btn {
  background-color: var(--primary-color, #3b82f6);
  color: white;
}
.submit-btn:hover {
  background-color: var(--primary-hover, #2563eb);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); /* Brilho azul no hover */
}
.submit-btn:disabled {
  background-color: #64748b; /* Slate 500 */
  cursor: not-allowed;
  opacity: 0.7;
}

/* Responsividade simples para grids em telas maiores */
@media (min-width: 768px) {
  .form-section {
     display: grid;
     grid-template-columns: repeat(2, 1fr);
     gap: 1.5rem;
  }
  .form-section h3,
  .map-preview,
  .gallery-preview,
  .checkbox-group {
    grid-column: 1 / -1; /* Ocupa toda a largura */
  }
  /* Exceções que devem ocupar linha inteira */
  #description {
     grid-column: 1 / -1;
  }
}
</style>