<template>
  <div>
    <h1 class="title">Login</h1>
    <p class="subtitle">Bem vindo de volta! Por favor, acesse com suas informações</p>

    <form @submit.prevent="handleLogin" class="form-container">
      <div class="input-group">
        <label for="email">Email</label>
        <input id="email" type="email" v-model="email" required />
      </div>
      <div class="input-group">
        <label for="password">Senha</label>
        <input id="password" type="password" v-model="password" required />
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
      
      <button type="submit" class="submit-button" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Log In' }}
      </button>

      <p class="switch-form">
        Não tem uma conta?
        <router-link to="/register">Registrar</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref(null);
const loading = ref(false);
const router = useRouter();

async function handleLogin() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha no login.');
    }
    
    localStorage.setItem('authToken', data.token);
    router.push('/dashboard'); // Redireciona para o painel principal
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
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