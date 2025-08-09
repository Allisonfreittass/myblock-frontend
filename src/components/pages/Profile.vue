<template>
    <div>
        <h1 class="page-title">Meu Perfil</h1>

        <div class="card" v-if="user">
            <div class="profile-info">
                <p><strong>Nome:</strong>{{ user.name}} </p>
                <p><strong>Email:</strong> {{ user.email }}</p>

                <div class="wallet-section">
                    <strong>Carteira:</strong>
                    <div v-if="user.walletAddress" class="wallet-address">
                        <span>{{ user.walletAddress }}</span>
                        <button @click="connectWallet" class="change-wallet-btn">Trocar</button>
                    </div>
                    <div v-else>
                        <p>Nenhuma Carteira Conectada.</p>
                        <button @click="connectWallet" class="connect-wallet-btn">Conectar Carteira</button>
                    </div>
                </div>
            </div>
            <button @click="logout" class="logout-btn">Sair (logout)</button>
        </div>

        <div v-else class="loading">
            Carregando Perfil...
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';

const user = ref(null)
const router = useRouter();

async function fetchUserProfile() {
    const token = localStorage.getItem('authToken')
    if (!token) {
        router.push('/login');
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Falha ao salvar carteira.')

        user.value = await response.json();

    } catch (error) {
        console.error('', error.message)
        logout();
    }
}

    async function connectWallet() {
        if (typeof window.ethereum === 'undefined')
        return alert('MetaMask não está instalada')

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const newWalletAddress = accounts[0];

        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3000/auth/associate-wallet', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ walletAddress: newWalletAddress})
        })

        if (!response.ok) throw new Error('Falha ao salvar carteira.')


        const data = await response.json();
        user.value = data.user;
        alert('Carteira Atualizada com successo')
    } catch(error) {
        console.error('', error)
        throw error
    }
}

    function logout() {
        localStorage.removeItem('authToken');
        router.push('/login')
    };

    onMounted(() => {
        fetchUserProfile();
    });

</script>
<style>
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 2rem;
}
.card {
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}
.profile-info p {
  font-size: 1.1rem;
  color: #4a5568;
}
.wallet-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.wallet-address {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  background-color: #f8fafc;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-family: monospace;
  color: #1e293b;
}
.change-wallet-btn, .connect-wallet-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}
.connect-wallet-btn {
  background-color: #2563eb;
  color: white;
}
.change-wallet-btn {
  background-color: #e2e8f0;
  color: #334155;
}
.logout-btn {
  margin-top: 2rem;
  border: 1px solid #ef4444;
  background-color: transparent;
  color: #ef4444;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.logout-btn:hover {
  background-color: #ef4444;
  color: white;
}
</style>