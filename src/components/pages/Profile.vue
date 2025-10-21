<template>
  <div>
    <h1 class="page-title">Meu Perfil</h1>
    <p class="page-subtitle">Mantenha suas informações e carteira atualizadas.</p>

    <div class="card" v-if="formData">
      <div class="profile-layout">
        
        <div class="picture-column">
          <img 
            :src="imagePreviewUrl || formData.profilePictureUrl || 'https://via.placeholder.com/150'" 
            alt="Foto de Perfil" 
            class="profile-picture"
          />
          <input 
            type="file" 
            @change="handleFileChange" 
            ref="fileInput" 
            style="display: none;" 
            accept="image/*" 
          />
          <button @click="triggerFileInput" class="upload-btn">
            Trocar Foto
          </button>
          <p class="upload-hint">Max 2MB. (JPG, PNG)</p>
        </div>

        <div class="details-column">
          
          <h3 class="section-title">Dados Pessoais</h3>
          <div class="form-grid">
            <div class="field-group span-2">
              <label for="name" class="field-label">Nome Completo</label>
              <input type="text" id="name" class="text-input" v-model="formData.name" />
            </div>
            <div class="field-group span-2">
              <label for="email" class="field-label">Email</label>
              <input type="email" id="email" class="text-input" :value="formData.email" disabled />
            </div>
            <div class="field-group">
              <label for="phone" class="field-label">Telefone</label>
              <input type="text" id="phone" class="text-input" v-model="formData.phone" placeholder="(XX) XXXXX-XXXX" />
            </div>
          </div>

          <h3 class="section-title">Endereço</h3>
          <div class="form-grid">
            <div class="field-group zip-group">
              <label for="zipCode" class="field-label">CEP</label>
              <input 
                type="text" 
                id="zipCode" 
                class="text-input" 
                v-model="formData.zipCode" 
                @blur="fetchAddressFromZipCode"
                placeholder="00000-000"
              />
              <button @click="fetchAddressFromZipCode" class="zip-btn" :disabled="addressLoading">
                {{ addressLoading ? '...' : 'Buscar' }}
              </button>
            </div>
            <div class="field-group span-2">
              <label for="street" class="field-label">Rua / Logradouro</label>
              <input type="text" id="street" class="text-input" v-model="formData.address.street" :disabled="addressLoading" />
            </div>
            <div class="field-group">
              <label for="number" class="field-label">Número</label>
              <input type="text" id="number" class="text-input" v-model="formData.address.number" :disabled="addressLoading" />
            </div>
            <div class="field-group">
              <label for="neighborhood" class="field-label">Bairro</label>
              <input type="text" id="neighborhood" class="text-input" v-model="formData.address.neighborhood" :disabled="addressLoading" />
            </div>
            <div class="field-group">
              <label for="city" class="field-label">Cidade</label>
              <input type="text" id="city" class="text-input" v-model="formData.address.city" :disabled="addressLoading" />
            </div>
            <div class="field-group">
              <label for="state" class="field-label">Estado (UF)</label>
              <input type="text" id="state" class="text-input" v-model="formData.address.state" :disabled="addressLoading" />
            </div>
          </div>

          <h3 class="section-title">Carteira</h3>
          <div class="wallet-section">
            <div class="wallet-address">
              <code>{{ formData.walletAddress ? truncateWallet(formData.walletAddress) : 'Nenhuma carteira conectada' }}</code>
              <button 
                v-if="formData.walletAddress" 
                @click="copyToClipboard(formData.walletAddress)" 
                class="copy-btn"
                title="Copiar"
              >
                Copiar
              </button>
            </div>
            <button @click="connectWallet" class="change-wallet-btn">
              {{ formData.walletAddress ? 'Trocar Carteira' : 'Conectar Carteira' }}
            </button>
          </div>

        </div>
      </div>

      <div class="action-bar">
        <button @click="logout" class="logout-btn">Sair</button>
        <div class="main-actions">
          <button @click="cancelChanges" class="cancel-btn" :disabled="loading">
            Cancelar
          </button>
          <button @click="updateProfile" class="save-btn" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>Carregando perfil...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';
import { useToast } from 'vue-toastification';

const user = ref(null); 
const formData = ref(null); 
const loading = ref(false);
const addressLoading = ref(false);
const router = useRouter();
const toast = useToast();

const fileInput = ref(null);
const selectedFile = ref(null);
const imagePreviewUrl = ref(null);

function truncateWallet(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Endereço copiado!');
  } catch (err) {
    toast.error('Falha ao copiar.');
  }
}

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    const maxSizeInBytes = 2 * 1024 * 1024; 
    if (file.size > maxSizeInBytes) {
      toast.warning('O arquivo é muito grande! O máximo é 2MB.');
      fileInput.value.value = null;
      return;
    }
    selectedFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
}


async function fetchAddressFromZipCode() {
  const zipCode = formData.value.zipCode?.replace(/\D/g, '');
  if (zipCode?.length !== 8 || zipCode?.length === 0) {
    if(zipCode?.length >= 0) toast.error('CEP inválido.');
    return;
  }

  addressLoading.value = true;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
    if (!response.ok) throw new Error('Falha ao buscar CEP.');
    
    const data = await response.json();
    if (data.erro) {
      toast.error('CEP não encontrado.');
    } else {
      formData.value.street = data.logradouro;
      formData.value.neighborhood = data.bairro;
      formData.value.city = data.localidade;
      formData.value.state = data.uf;
      toast.success('Endereço encontrado!');
    }
  } catch (error) {
    console.error('Erro ViaCEP:', error);
    toast.error('Erro ao buscar endereço.');
  } finally {
    addressLoading.value = false;
  }
}


async function updateProfile() {
  if (!formData.value) return;
  loading.value = true;
  const dataToUpdate = new FormData();
  
  dataToUpdate.append('name', formData.value.name);
  dataToUpdate.append('phone', formData.value.phone);
  dataToUpdate.append('zipCode', formData.value.zipCode);
  dataToUpdate.append('street', formData.value.street);
  dataToUpdate.append('number', formData.value.number);
  dataToUpdate.append('neighborhood', formData.value.neighborhood);
  dataToUpdate.append('city', formData.value.city);
  dataToUpdate.append('state', formData.value.state);

  if (selectedFile.value) {
    dataToUpdate.append('profilePicture', selectedFile.value);
  }

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/auth/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: dataToUpdate
    });
    if (!response.ok) throw new Error('Falha ao atualizar o perfil.');

    const data = await response.json();
    
    user.value = data.user; 
    formData.value = { ...data.user }; 
    
    selectedFile.value = null;
    imagePreviewUrl.value = null;
    
    toast.success('Perfil atualizado com sucesso!');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao salvar perfil.');
  } finally {
    loading.value = false;
  }
}

async function fetchUserProfile() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    router.push('/login');
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/auth/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao buscar perfil.');
    
    const data = await response.json();
    
    user.value = data;
    formData.value = { ...data }; 
  
  } catch (error) {
    console.error('', error.message);
    logout();
  }
}

async function connectWallet() {
  if (typeof window.ethereum === 'undefined')
    return toast.error('MetaMask não está instalada');

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
    });

    if (!response.ok) throw new Error('Falha ao salvar carteira.');

    const data = await response.json();
    
    user.value = data.user;
    formData.value.walletAddress = data.user.walletAddress; 
    
    toast.success('Carteira Atualizada com sucesso');
  } catch (error) {
    console.error('', error);
    toast.error('Erro ao conectar carteira.');
  }
}

function logout() {
  localStorage.removeItem('authToken');
  user.value = null;
  formData.value = null;
  router.push('/login');
}


function cancelChanges() {
  formData.value = { ...user.value };
  selectedFile.value = null;
  imagePreviewUrl.value = null;
  toast.info('Alterações descartadas.');
}

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}
.page-subtitle {
  color: #d1d5db;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.profile-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2.5rem;
}

.picture-column {
  flex: 0 0 150px;
  text-align: center;
  padding-top: 1rem;
}

.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 4px solid #e2e8f0;
  background-color: #f8fafc;
}

.upload-btn {
  border: none;
  background-color: #2563eb;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}
.upload-btn:hover { background-color: #1d4ed8; }

.upload-hint {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.details-column {
  flex: 1;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}
.details-column .section-title:first-of-type {
  margin-top: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
.field-group {
  display: flex;
  flex-direction: column;
}
.field-group.span-2 {
  grid-column: span 2 / span 2;
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
  color: #1e293b;
  background-color: #ffffff; /* Fundo branco explícito */
}
.text-input:focus {
  outline: 2px solid #2563eb;
  border-color: #2563eb;
}
.text-input::placeholder { color: #94a3b8; }
.text-input:disabled {
  background-color: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.zip-group {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: flex-end;
}
.zip-group .text-input { grid-row: 2; }
.zip-group .field-label { grid-row: 1; grid-column: span 2; }
.zip-btn {
  grid-row: 2;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e7;
  background-color: #f1f5f9;
  color: #334155;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}
.zip-btn:hover { background-color: #e2e8f0; }
.zip-btn:disabled { opacity: 0.7; }

.wallet-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background-color: #f8fafc;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}
.wallet-address {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: monospace;
  color: #1e293b;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wallet-address code {
  background: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
.copy-btn {
  border: 1px solid #cbd5e7;
  background: #fff;
  cursor: pointer;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  color: #475569;
}
.change-wallet-btn {
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  background-color: #334155;
  color: #ffffff;
}
.change-wallet-btn:hover { background-color: #1e293b; }

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.main-actions {
  display: flex;
  gap: 0.75rem;
}

.cancel-btn {
  border: 1px solid #cbd5e7;
  background: #ffffff;
  color: #334155;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
}
.cancel-btn:hover { background-color: #f8fafc; }

.logout-btn {
  border: none;
  background: transparent;
  color: #ef4444;
  padding: 0.75rem 0;
  font-weight: bold;
  cursor: pointer;
}
.logout-btn:hover { text-decoration: underline; }

.save-btn {
  border: none;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
}
.save-btn:disabled, .cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  background-color: #fff;
  border-radius: 0.5rem;
  color: #4a5568;
}

@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .picture-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 0;
  }
  .upload-btn {
    max-width: 200px;
  }
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field-group.span-2 {
    grid-column: span 1 / span 1;
  }
  .action-bar {
    flex-direction: column;
    gap: 1rem;
  }
  .logout-btn {
    order: 2;
  }
  .main-actions {
    order: 1;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (prefers-color-scheme: dark) {
  .card {
    background: #1f2937; 
    border-color: #374151;
  }

  .profile-picture {
    border-color: #374151;
    background-color: #374151;
  }

  .section-title {
    color: #f3f4f6;
    border-color: #374151;
  }

  .field-label {
    color: #d1d5db;
  }

  .text-input {
    background: #374151;
    border-color: #4b5563;
    color: #ffffff;
  }
  
  .text-input::placeholder { 
    color: #9ca3af;
  }
  
  .text-input:disabled {
    background-color: #4b5563;
    color: #9ca3af;
  }


  .zip-btn {
    background: #4b5563;
    border-color: #6b7280;
    color: #f3f4f6;
  }
  .zip-btn:hover { background-color: #556070; }

  .wallet-section {
    background-color: #111827;
    border-color: #374151;
  }

  .wallet-address {
    color: #f3f4f6;
  }

  .wallet-address code {
    background: #374151;
    color: #f3f4f6;
  }
  
  .copy-btn {
    background: #4b5563;
    border-color: #6b7280;
    color: #f3f4f6;
  }
  
  .change-wallet-btn {
    background-color: #4b5563;
  }
  .change-wallet-btn:hover { background-color: #556070; }

  .cancel-btn {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
  }
  .cancel-btn:hover { background-color: #4b5563; }

  .loading-state {
    background: #1f2937;
    color: #d1d5db;
  }
}

</style>