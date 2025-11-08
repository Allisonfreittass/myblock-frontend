<template>
  <div>
    <h1 class="page-title">Criação de Contrato</h1>
    <p v-if="property" class="page-subtitle">
      Você está criando um contrato para o imóvel:
      <strong>{{ property.title }}</strong>
    </p>

    <div class="card create-contract-card">
      <h2>Dados do Contrato</h2>

      <form @submit.prevent="handleCreateContract" class="form-container">
        <div class="field-group">
          <label for="tenant-address">Endereço da Carteira do Locatário</label>
          <input
            id="tenant-address"
            type="text"
            v-model="newContract.locatario"
            placeholder="0x..."
            required
            :disabled="!!route.query.tenantWallet"
          />
        </div>

        <div class="field-group">
          <label for="rent-value">Valor do Aluguel (em ETH)</label>
          <input
            id="rent-value"
            type="number"
            step="0.01"
            v-model="newContract.valor"
            required
          />
        </div>

        <div class="field-group">
          <label for="property-desc">Descrição do Imóvel</label>
          <input
            id="property-desc"
            type="text"
            v-model="newContract.imovel"
            required
            :disabled="!!property"
          />
        </div>

        <div class="field-group">
          <label for="start-date">Data de Início</label>
          <input id="start-date" type="date" v-model="newContract.dataInicio" required />
        </div>

        <div class="field-group">
          <label for="end-date">Data de Término</label>
          <input id="end-date" type="date" v-model="newContract.dataFim" required />
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
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loadingCreate">
          {{ loadingCreate ? "Enviando transação..." : "Criar Contrato na Blockchain" }}
        </button>
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
    const valorEmWei = ethers.parseEther(newContract.value.valor);

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
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 2rem;
}
.card {
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}
.field-group input {
  padding: 0.75rem;
  border: 1px solid #cbd5e7;
  border-radius: 0.375rem;
  font-size: 1rem;
}
.submit-btn {
  border: none;
  background-color: #16a34a;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  align-self: flex-end;
}
.submit-btn:disabled {
  background-color: #86efac;
}
</style>
