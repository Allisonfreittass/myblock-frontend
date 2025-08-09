<template>
    <div class="container">
        <header>
            <h1>Plataforma de Contratos de Aluguel</h1>
            <nav>            
                <div class="button">
                <button @click="connectWallet" class="wallet-button">
                    {{ account ? "Conectado: " + formattedAccount : 'Conectar carteira' }}
                </button>
            </div>
            </nav>
        </header>

        <main v-if="account">
            <div class="card">
                <h2>Criar Novo Contrato</h2>
                <form @submit.prevent="createContract" class="form-group">
                    <input v-model="newContract.locatario" type="text" placeholder="Endereço do Locatário. EX: (0x...)"
                        required />
                    <input v-model="newContract.valor" type="text" placeholder="Valor do aluguel (em ETH)" required />
                    <input v-model="newContract.imovel" type="text" placeholder="Descrição do imóvel" required />
                    <button type="submit" :disabled="loading">
                        {{ loading ? 'Criando...' : 'Criar Contrato' }}
                    </button>
                </form>
                <p v-if="feedbackMessage" class="feedback">{{ feedbackMessage }}</p>
            </div>

            <div class="card-list">
                <div class="card">
                    <h2>Meus Contratos (Locador)</h2>
                    <ul v-if="contratosLocador.length > 0">
                        <li v-for="contract in contratosLocador" :key="contract.id">
                            <strong>Imóvel:</strong> {{ contract.imovel }} <br>
                            <strong>Locatário</strong> {{ contract.locatario }} <br>
                            <strong>Valor:</strong> {{ formatValue(contract.valor) }} ETH
                        </li>
                    </ul>
                    <p v-else>Nenhum Contrato encontrado</p>
                </div>

                <div class="card">
                    <h2>Meus Aluguéis (Locatário)</h2>
                    <ul v-if="contratosLocatario.length > 0">
                        <li v-for="contract in contratosLocatario" :key="contract.id">
                            <strong>Imóvel:</strong> {{ contract.imovel }} <br>
                            <strong>Locador:</strong> {{ contract.locador }} <br>
                            <strong>Valor:</strong> {{ formatValue(contract.valor) }} ETH
                        </li>
                    </ul>
                    <p v-else>Nenhum contrato encontrado.</p>
                </div>
            </div>
        </main>

        <div v-else class="connect-prompt">
            <p>Por favor, conecte sua carteira para continuar.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ethers } from 'ethers';
import contractInfo from '../../../../backend/abi/Rent.json';

// --- Variáveis Reativas ---
const account = ref(null);
const contractInstance = ref(null);
const loading = ref(false);
const feedbackMessage = ref('');

const allContracts = ref([]);
const contratosLocador = ref([]);
const contratosLocatario = ref([]);

const newContract = ref({
    locatario: '',
    valor: '',
    imovel: ''
});

const contractAddress = contractInfo.address;
const contractAbi = contractInfo.abi;

// --- Funções ---

// Computada para formatar o endereço da carteira
const formattedAccount = computed(() => {
    if (!account.value) return '';
    return `${account.value.substring(0, 6)}...${account.value.substring(account.value.length - 4)}`;
});

// Função principal para conectar e inicializar tudo
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 1. Cria o provider como uma constante local (NÃO use ref)
            const localProvider = new ethers.BrowserProvider(window.ethereum);

            // 2. Solicita a conta ao usuário
            const accounts = await localProvider.send("eth_requestAccounts", []);
            account.value = accounts[0];

            // 3. Obtém o 'signer' (a conta do usuário para assinar transações)
            const signer = await localProvider.getSigner();

            // 4. Cria a instância do contrato usando o signer
            contractInstance.value = new ethers.Contract(contractAddress, contractAbi, signer);

            // 5. Agora que tudo está conectado, busca os contratos
            await fetchContracts();

        } catch (error) {
            console.error("Erro ao conectar a carteira:", error);
            feedbackMessage.value = "Falha ao conectar. O usuário rejeitou a solicitação?";
        }
    } else {
        alert("MetaMask não está instalado!");
    }
}

// Função para buscar os contratos do seu backend
async function fetchContracts() {
    if (!contractInstance.value || !account.value) return;
    loading.value = true;
    feedbackMessage.value = 'Buscando contratos...';
    try {
        const response = await fetch('http://localhost:3000/api/contract');
        if (!response.ok) throw new Error('Falha na resposta da API');

        const data = await response.json();
        allContracts.value = data;
        filterContracts();
        feedbackMessage.value = ''; // Limpa a mensagem após sucesso
    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        feedbackMessage.value = "Não foi possível carregar os contratos.";
    } finally {
        loading.value = false;
    }
}

// Função para criar um novo contrato na blockchain
async function createContract() {
    if (!contractInstance.value) {
        feedbackMessage.value = "Por favor, conecte sua carteira primeiro.";
        return;
    }
    loading.value = true;
    feedbackMessage.value = 'Aguardando confirmação na sua carteira...';
    try {
        const valorEmWei = ethers.parseEther(newContract.value.valor);
        const tx = await contractInstance.value.createContract(
            newContract.value.locatario,
            valorEmWei,
            newContract.value.imovel
        );
        await tx.wait();
        feedbackMessage.value = `Contrato criado com sucesso!`;
        newContract.value = { locatario: '', valor: '', imovel: '' };
        await fetchContracts(); // Atualiza a lista
    } catch (error) {
        console.error("Erro ao criar contrato:", error);
        feedbackMessage.value = "Falha ao criar o contrato.";
    } finally {
        loading.value = false;
    }
}

// Filtra os contratos para o usuário atual
function filterContracts() {
    if (!account.value) return;
    const userAddress = account.value.toLowerCase();
    contratosLocador.value = allContracts.value.filter(c => c.locador.toLowerCase() === userAddress);
    contratosLocatario.value = allContracts.value.filter(c => c.locatario.toLowerCase() === userAddress);
}

// Formata o valor de Wei para Ether para exibição
function formatValue(valorEmWei) {
    return ethers.formatEther(valorEmWei);
}
</script>

<style scoped>
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: sans-serif;
    color: #333;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.wallet-button {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.wallet-button:disabled {
    background-color: #ccc;
}

.card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}

.card-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

h2 {
    margin-top: 0;
    color: #2c3e50;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
}

button {
    padding: 12px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
}

button:disabled {
    background-color: #aaa;
}

.feedback {
    margin-top: 1rem;
    color: #007bff;
    word-break: break-all;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    border: 1px solid #eee;
}

.connect-prompt {
    text-align: center;
    padding: 3rem;
    color: #666;
}
</style>