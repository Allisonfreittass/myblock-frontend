<template>
    <div>
        <h1 class="page-title">Meu Perfil</h1>

        <div class="card" v-if="user">
            <div class="profile-content">
                <div class="picture-column">
                    <img :src="imagePreviewUrl || user.profilePictureUrl || 'https://via.placeholder.com/150'" alt="Foto de Perfil" class="profile-picture"/>
                   <input type="file" @change="handleFileChange" ref="fileInput" style="display: none;" accept="image/*" />
                   <button @click="triggerFileInput" class="upload-btn">Trocar Foto</button>
                </div>

                <div class="details-column">
                    <div class="field-group">
                        <label for="name" class="field-label">Nome Completo</label>
                        <input type="text" id="name" class="text-input" v-model="user.name" />
                    </div>
                    <div class="field-group">
                        <label for="email" class="field-label">Email</label>
                        <input type="email" id="email" class="text-input" :value="user.email" disabled />
                    </div>
                    <div class="field-group">
                        <label for="phone" class="field-label">Telefone</label>
                        <input type="text" id="phone" class="text-input" v-model="user.phone" />
                    </div>
                    <div class="field-group">
                        <label for="zipCode" class="field-label">CEP</label>
                        <input type="text" id="zipCode" class="text-input" v-model="user.zipCode" />
                    </div>
                </div>
            </div>

            <div class="wallet-section">
                <strong>Carteira Conectada:</strong>
                <div class="wallet-address">
                    <span>{{ user.walletAddress || 'Nenhuma carteira conectada' }}</span>
                    <button @click="connectWallet" class="change-wallet-btn">
                        {{ user.walletAddress ? 'Trocar' : 'Conectar' }}
                    </button>
                </div>
            </div>

            <div class="action-buttons">
                <button @click="logout" class="logout-btn">Sair</button>
                <button @click="updateProfile" class="save-btn" :disabled="loading">
                    {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
                </button>
            </div>
        </div>

        <div v-else class="loading">
            Carregando perfil...
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';

const user = ref(null);
const loading = ref(false);
const router = useRouter();

const fileInput = ref(null);
const selectedFile = ref(null)
const imagePreviewUrl = ref(null)

function triggerFileInput(){
    fileInput.value.click()
}

function handleFileChange(event) {
    const file = event.target.files[0]
    if (file) {
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSizeInBytes) {
        alert('O arquivo selecionado é muito grande! O tamanho máximo permitido é de 2MB.');
        fileInput.value.value = null; 
        return;
        }
    selectedFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
    }

}

async function updateProfile() {
    if (!user.value) return;
    loading.value = true;

    const formData = new FormData();
    formData.append('name', user.value.name);
    formData.append('phone', user.value.phone);
    formData.append('zipCode', user.value.zipCode);

    if (selectedFile.value) {
        formData.append('profilePicture', selectedFile.value);
    }
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3000/auth/me', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok) throw new Error('Falha ao atualizar o perfil.');
        const data = await response.json();
        user.value = data.user; 
        selectedFile.value = null
        imagePreviewUrl.value = null
        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar perfil.');
    } finally {
        loading.value = false;
    }
}

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
            body: JSON.stringify({ walletAddress: newWalletAddress })
        })

        if (!response.ok) throw new Error('Falha ao salvar carteira.')


        const data = await response.json();
        user.value = data.user;
        alert('Carteira Atualizada com successo')
    } catch (error) {
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
<style scoped>
.page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 2rem;
}

.card {
    background: #fff;
    padding: 2rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.profile-content {
    display: flex;
    gap: 2rem;
}

.picture-column {
    flex: 0 0 150px;
    text-align: center;
}

.profile-picture {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
    border: 3px solid #e2e8f0;
}

.details-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field-group {
    display: flex;
    flex-direction: column;
}

.field-label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
}

.text-input {
    padding: 0.75rem;
    border: 1px solid #cbd5e7;
    border-radius: 0.375rem;
    font-size: 1rem;
}

.text-input:disabled {
    background-color: #f8fafc;
    color: #64748b;
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

.change-wallet-btn {
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    background-color: #e2e8f0;
    color: #334155;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
}

.logout-btn {
    border: 1px solid #ef4444;
    background: transparent;
    color: #ef4444;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: bold;
    cursor: pointer;
}

.save-btn {
    border: none;
    background-color: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: bold;
    cursor: pointer;
}

.save-btn:disabled {
    background-color: #93c5fd;
}
</style>