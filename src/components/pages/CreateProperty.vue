<template>
  <div>
    <h1 class="page-title">Anunciar Novo Imóvel</h1>
    <p class="page-subtitle">Preencha os dados abaixo para que seu imóvel fique disponível no nosso marketplace.</p>
    <div class="card">
      <form @submit.prevent="handleCreateProperty" class="form-container"> <!-- Seção: Informações Principais -->
        <div class="form-section">
          <h3>Informações Principais</h3>
          <div class="field-group"> <label for="title">Título do Anúncio</label> <input id="title" type="text"
              v-model="newProperty.title" placeholder="Ex: Apartamento de 2 quartos em Varginha" required /> </div>
          <div class="field-group"> <label for="description">Descrição</label> <textarea id="description"
              v-model="newProperty.description" rows="4" placeholder="Descreva os detalhes do imóvel, regras, etc..."
              required></textarea>
          </div>
        </div> 
        
        <!-- Seção: Imagens -->
        <div class="form-section">
          <h3>Galeria de Imagens</h3>
          <div class="field-group"> <label for="imageFile" class="file-input-label"> <i class="fas fa-upload"></i>
              Escolher arquivos... </label> <input id="imageFile" type="file" @change="handleFileSelect"
              accept="image/*" multiple required class="file-input" /> </div>
          <div v-if="imagePreviewUrls.length > 0" class="gallery-preview"> <img v-for="(url, index) in imagePreviewUrls"
              :key="index" :src="url" class="image-preview" /> </div>
        </div> 
        
        <!-- Seção: Localização -->

        <div class="form-section">
          <h3>Localização</h3>
          <div class="field-group"> <label for="cep">CEP</label> <input id="cep" type="text"
              v-model="newProperty.location.cep" placeholder="Ex: 37000-000" required /> </div>
          <div class="field-group"> <label for="address">Endereço</label> <input id="address" type="text"
              v-model="newProperty.location.address" placeholder="Rua Exemplo, 123" required /> </div>
          <div class="field-group"> <label for="city">Cidade</label> <input id="city" type="text"
              v-model="newProperty.location.city" placeholder="Ex: Varginha" required /> </div>
          <div class="field-group"> <label for="neighborhood">Bairro</label> <input id="neighborhood" type="text"
              v-model="newProperty.location.neighborhood" placeholder="Ex: Centro" required /> </div>
          <div class="field-group"> <label for="state">Estado</label> <input id="state" type="text"
              v-model="newProperty.location.state" placeholder="Ex: MG" required /> </div> <!-- Preview do mapa -->
          <div v-if="newProperty.location.city && newProperty.location.state" class="map-preview"> 
            <iframe 
                width="100%" 
                height="200" 
                style="border:0" 
                loading="lazy" 
                allowfullscreen
                :src="`https://maps.google.com/maps?q=${encodeURIComponent(newProperty.location.address + ', ' + newProperty.location.city + ', ' + newProperty.location.state)}&output=embed`">
            </iframe>
          </div>
        </div> 

        <!-- Seção: Detalhes -->

        <div class="form-section">
          <h3>Detalhes do Imóvel</h3>
          <div class="field-group"> <label for="PropertyType">Tipo de Imóvel</label> <select id="PropertyType"
              v-model="newProperty.details.PropertyType">
              <option>Apartamento</option>
              <option>Casa</option>
              <option>Kitnet</option>
              <option>Loft</option>
            </select> </div>
          <div class="field-group"> <label for="area">Área (m²)</label> <input id="area" type="number" min="10"
              v-model.number="newProperty.details.area" placeholder="Ex: 75" required /> </div>
          <div class="field-group"> <label for="bedrooms">Quartos</label> <input id="bedrooms" type="number" min="0"
              v-model.number="newProperty.details.bedrooms" required /> </div>
          <div class="field-group"> <label for="bathrooms">Banheiros</label> <input id="bathrooms" type="number" min="0"
              v-model.number="newProperty.details.bathrooms" required /> </div>
          <div class="field-group"> <label for="garageSpots">Vagas de Garagem</label> <input id="garageSpots"
              type="number" min="0" v-model.number="newProperty.details.garageSpots" required /> </div>
          <div class="checkbox-group"> <input id="isFurnished" type="checkbox"
              v-model="newProperty.details.isFurnished" /> <label for="isFurnished">Mobiliado</label> </div>
        </div> 
        
        <!-- Seção: Taxas -->

        <div class="form-section">
          <h3>Taxas e Condições</h3>
          <div class="field-group"> <label for="rentAmount">Aluguel (em ETH)</label> <input id="rentAmount"
              type="number" step="0.01" v-model.number="newProperty.fees.rentAmount" required /> </div>
          <div class="field-group"> <label for="securityDeposit">Depósito de Segurança (em ETH)</label> <input
              id="securityDeposit" type="number" step="0.01" v-model.number="newProperty.fees.securityDeposit"
              required /> </div>
          <div class="field-group"> <label for="condoFee">Taxa de Condomínio (em ETH)</label> <input id="condoFee"
              type="number" step="0.01" v-model.number="newProperty.fees.condoFee" /> </div>
          <div class="checkbox-group"> <input id="petsAllowed" type="checkbox"
              v-model="newProperty.rules.petsAllowed" /> <label for="petsAllowed">Permite animais</label> </div>
        </div>
        
        <!-- Seção: Web3 -->

        <div class="form-section">
          <h3>Informações Web3</h3>
          <div class="field-group"> <label for="ownerWallet">Sua Carteira (para recebimento)</label> <input
              id="ownerWallet" type="text" v-model="newProperty.ownerWalletAddress" readonly class="readonly-input"
              required />
            <p class="helper-text">Endereço preenchido automaticamente do seu perfil.</p>
          </div>
        </div> 
        
        <!-- Preview final -->

        <div v-if="showPreview" class="form-section preview-card">
          <h3>Pré-visualização do Anúncio</h3>
          <h4>{{ newProperty.title }}</h4>
          <p>{{ newProperty.description }}</p>
          <p><strong>Localização:</strong> {{ newProperty.location.address }}, {{ newProperty.location.city }} - {{
            newProperty.location.state }}</p>
          <p><strong>Valor:</strong> {{ newProperty.fees.rentAmount }} ETH/mês</p>
          <div class="gallery-preview"> <img v-for="(url, index) in imagePreviewUrls" :key="index" :src="url"
              class="image-preview" /> </div>
        </div> 
        
        <!-- Ações -->

        <div class="action-buttons"> <button type="button" @click="togglePreview" class="clear-btn"> {{ showPreview ?
          'Fechar Preview' : 'Ver Preview' }} </button> <button type="button" @click="clearForm"
            class="clear-btn">Limpar</button> <button type="submit" class="submit-btn" :disabled="loading"> {{ loading ?
              'Publicando...' : 'Publicar Anúncio' }} </button> </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const toast = useToast();
const router = useRouter();
const loading = ref(false);
const showPreview = ref(false)

const initialFormState = {
  title: '',
  description: '',
  location: {
    cep: '',
    address: '',
    neighborhood: '',
    city: '',
    state: ''
  },
  details: {
    PropertyType: 'Apartamento',
    area: '',
    bedrooms: '',
    bathrooms: '',
    garageSpots: 0,
    isFurnished: false
  },
  rules: {
    petsAllowed: false,
    minLeaseMonths: 12
  },
  fees: {
    rentAmount: '',
    securityDeposit: '',
    condoFee: ''
  },
  ownerWalletAddress: ''
};

const newProperty = ref({ ...initialFormState });

const imageFiles = ref([]);
const imagePreviewUrls = ref([]);

function togglePreview() { showPreview.value = !showPreview.value; }

async function fetchUserProfile() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.info('Você precisa estar logado para criar um anúncio.');
      router.push('/login');
      return;
    }

    const response = await fetch('http://localhost:3000/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao buscar dados do usuário.');
    }

    const userData = await response.json();

    if (userData && userData.walletAddress) {
      newProperty.value.ownerWalletAddress = userData.walletAddress;
    } else {
      throw new Error('Endereço da carteira não encontrado no perfil do usuário.');
    }

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    toast.error(error.message || 'Não foi possível carregar a carteira automaticamente.');
  }
}


onMounted(() => {
  fetchUserProfile();
})


function handleFileSelect(event) {
  const files = event.target.files;
  if (files) {
    imageFiles.value = Array.from(files);
    imagePreviewUrls.value = imageFiles.value.map(file => URL.createObjectURL(file));
  }
}

function clearForm() {
  newProperty.value = { ...initialFormState };
  imageFiles.value = [];
  imagePreviewUrls.value = [];
  document.getElementById('imageFile').value = null;
}

async function handleCreateProperty() {
  if (imageFiles.value.length === 0) {
    toast.error('Por favor, selecione pelo menos uma imagem.');
    return;
  }
  loading.value = true;

  const formData = new FormData();

  formData.append('title', newProperty.value.title);
  formData.append('description', newProperty.value.description);
  formData.append('ownerWalletAddress', newProperty.value.ownerWalletAddress);
  formData.append('location', JSON.stringify(newProperty.value.location));
  formData.append('details', JSON.stringify(newProperty.value.details));
  formData.append('rules', JSON.stringify(newProperty.value.rules));
  formData.append('fees', JSON.stringify(newProperty.value.fees));


  for (const file of imageFiles.value) {
    formData.append('imageFiles', file);
  }

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/properties', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao criar anúncio.');
    }

    toast.success('Imóvel anunciado com sucesso!');
    router.push('/properties');



  } catch (error) {
    toast.error(error.message);
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Estilos Base (Light Mode) */
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
}

.page-subtitle {
  color: #cccccc;
  margin-top: 1rem;
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
  gap: 1.5rem;
}

.form-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.form-section:first-child {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

.form-section h3 {
  font-size: 1.25rem;
  color: #334155;
  margin-bottom: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.field-group input,
.field-group textarea,
.field-group select {
  padding: 0.75rem;
  border: 1px solid #cbd5e7;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
  background-color: #fff;
  color: #1e293b;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.checkbox-group input {
  width: auto;
}

.checkbox-group label {
  color: #4a5568;
  font-weight: 500;
}

.gallery-preview {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.375rem;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.clear-btn,
.submit-btn {
  border: 1px solid transparent;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
}

.clear-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #4a5568;
}
.clear-btn:hover {
  background-color: #e2e8f0;
}

.submit-btn {
  background-color: #2563eb;
  color: white;
}
.submit-btn:hover {
  background-color: #1d4ed8;
}
.submit-btn:disabled {
  background-color: #93c5fd;
  opacity: 0.7;
}

.file-input {
  display: none;
}

.file-input-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 1px solid #cbd5e7;
  border-radius: 0.375rem;
  cursor: pointer;
  background-color: #f8fafc;
  font-weight: 500;
  text-align: center;
}

.file-input-label:hover {
  background-color: #f1f5f9;
}

.readonly-input {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.8;
}

.helper-text {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.map-preview {
  margin-top: 1rem;
  border-radius: 0.375rem;
  overflow: hidden;
}

.preview-card {
  background: #165fa8;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  color: #ffffff; 
}

@media (prefers-color-scheme: dark) {
  .card {
    background: #1f2937; /* gray-800 */
    border-color: #374151; /* gray-700 */
  }

  .form-section {
    border-color: #374151; /* gray-700 */
  }

  .form-section h3 {
    color: #f3f4f6; /* gray-100 */
  }

  .field-group label,
  .checkbox-group label {
    color: #d1d5db; /* gray-300 */
  }

  .field-group input,
  .field-group textarea,
  .field-group select {
    background: #374151; /* gray-700 */
    border-color: #4b5563; /* gray-600 */
    color: #ffffff;
  }
  
  .field-group input::placeholder,
  .field-group textarea::placeholder {
    color: #9ca3af; /* gray-400 */
  }

  .readonly-input {
    background-color: #4b5563; /* gray-600 */
    color: #d1d5db;
    opacity: 0.7;
  }
  
  .helper-text {
    color: #9ca3af; /* gray-400 */
  }

  .file-input-label {
    background-color: #374151; /* gray-700 */
    border-color: #4b5563; /* gray-600 */
    color: #f3f4f6; /* gray-100 */
  }
  .file-input-label:hover {
    background-color: #4b5563; /* gray-600 */
  }

  .clear-btn {
    background: #374151; /* gray-700 */
    border-color: #4b5563; /* gray-600 */
    color: #f3f4f6; /* gray-100 */
  }
  .clear-btn:hover {
     background: #4b5563; /* gray-600 */
  }

  .submit-btn:disabled {
    background-color: #1e40af; /* Azul mais escuro */
    opacity: 0.6;
  }

  .preview-card {
    border-color: #374151; /* gray-700 */
    /* O fundo azul e o texto branco (corrigido acima) já funcionam bem */
  }
}
</style>