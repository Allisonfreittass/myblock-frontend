<template>
  <div>
    <h1 class="page-title">Anunciar Novo Imóvel</h1>
    <p class="page-subtitle">Preencha os dados abaixo para que seu imóvel fique disponível no nosso marketplace.</p>

    <div class="card">
      <form @submit.prevent="handleCreateProperty" class="form-container">
        <div class="field-group">
          <label for="title">Título do Anúncio</label>
          <input id="title" type="text" v-model="newProperty.title" placeholder="Ex: Apartamento aconchegante no centro" required />
        </div>
        <div class="field-group">
          <label for="description">Descrição</label>
          <textarea id="description" v-model="newProperty.description" rows="4" placeholder="Descreva os detalhes do imóvel, regras, etc." required></textarea>
        </div>
        <div class="field-group">
          <label for="imageUrl">URL da Imagem Principal</label>
          <input id="imageUrl" type="text" v-model="newProperty.imageUrl" placeholder="https://..." required />
        </div>
        <div class="field-group">
          <label for="rentAmount">Valor do Aluguel (em ETH)</label>
          <input id="rentAmount" type="text" v-model="newProperty.rentAmount" placeholder="Ex: 0.1" required />
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Publicando...' : 'Publicar Anúncio' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const toast = useToast();
const router = useRouter();
const loading = ref(false);

const newProperty = ref({
  title: '',
  description: '',
  imageUrl: '',
  rentAmount: ''
});

async function handleCreateProperty() {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newProperty.value)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao criar anúncio.');
    }

    toast.success('Imóvel anunciado com sucesso!');
    router.push('/properties'); // Redireciona para o marketplace

  } catch (error) {
    toast.error(error.message);
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Estilos consistentes com o resto da aplicação */
.page-title { font-size: 2rem; font-weight: bold; color: #1a202c; }
.page-subtitle { color: #4a5568; margin-top: -1rem; margin-bottom: 2rem; }
.card { background: #fff; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
.form-container { display: flex; flex-direction: column; gap: 1.5rem; }
.field-group { display: flex; flex-direction: column; }
.field-group label { margin-bottom: 0.5rem; font-weight: 500; color: #4a5568; }
.field-group input, .field-group textarea { padding: 0.75rem; border: 1px solid #cbd5e7; border-radius: 0.375rem; font-size: 1rem; font-family: inherit; }
.submit-btn { border: none; background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: bold; cursor: pointer; margin-top: 1rem; align-self: flex-end; }
.submit-btn:disabled { background-color: #93c5fd; }
</style>