<template>
  <div>
    <h1 class="title">Crie sua Conta! </h1>
    <p class="subtitle">Comece já a alugar seus imoveis.</p>

    <form @submit.prevent="handleRegister" class="form-container">
      <div class="input-group">
        <button type="button" @click="connectWallet" v-if="!walletAddress" class="wallet-button" :disabled="loading">
          {{ loading ? 'Conectando...' : 'Conectar carteira' }}
        </button>
        <div v-else class="wallet-address">
          Conectado: {{ formattedWalletAddress }}
        </div>
      </div>
      <div class="input-group">
        <label for="email">Email</label>
        <input id="email" type="email" v-model="email" required />
      </div>
      <div class="input-group">
        <label for="password">Senha</label>
        <input id="password" type="password" v-model="password" required />
      </div>
       <div class="input-group">
        <label for="confirmPassword">Confirme sua senha</label>
        <input id="confirmPassword" type="password" v-model="confirmPassword" required />
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
      
      <button type="submit" class="submit-button" :disabled="loading">
        {{ loading ? 'Criando conta...' : 'Criar conta' }}
      </button>

      <p class="switch-form">
        Já tem uma conta?
        <router-link to="/login">Entre aqui!</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const walletAddress = ref(null);
const error = ref(null);
const loading = ref(false);
const router = useRouter();

const formattedWalletAddress = computed(() => {
  if (!walletAddress.value ) return '';
  const addr = walletAddress.value
  return `${addr.substring(0,6)}...${addr.substring(addr.length - 4)}`
})

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      walletAddress.value = accounts[0]
    } catch(error){
      console.error('Conexão com a carteira falhou', error.message)
      throw error
    }
  } else {
    alert('MetaMask não instalado no navegador')
  }
}

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não coincidem.";
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value, walletAddress: walletAddress.value })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao criar conta.');
    }
    alert('Conta criada com sucesso! Por favor, faça o login.');
    router.push('/login'); // Redireciona para o login após o sucesso
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.wallet-button {
  background-color: #4a5568;
  color: white;
  padding: 0.75rem;
  border: 1px solid #718096;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
}
.wallet-address {
  background-color: #2d3748;
  border: 1px solid #4a5568;
  color: #a0aec0;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: monospace;
  text-align: center;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.subtitle {
  color: #a0aec0;
  margin-bottom: 2rem;
}
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.input-group {
  display: flex;
  flex-direction: column;
}
.input-group label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #cbd5e0;
}
.input-group input {
  background-color: #2d3748;
  border: 1px solid #4a5568;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
}
.input-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}
.submit-button {
  background-color: #3182ce;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}
.submit-button:disabled {
  background-color: #4a5568;
}
.error-message {
  color: #f56565;
  text-align: center;
}
.switch-form {
  text-align: center;
  color: #a0aec0;
}
.switch-form a {
  color: #4299e1;
  font-weight: bold;
  text-decoration: none;
}
</style>