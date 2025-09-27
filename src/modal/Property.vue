<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">&times;</button>
      
      <div v-if="property">
        <img :src="property.imageUrl" :alt="property.title" class="modal-image" />
        <h2 class="modal-title">{{ property.title }}</h2>
        <p class="modal-description">{{ property.description }}</p>
        <div class="modal-footer">
          <p class="modal-rent">{{ property.rentAmount }} ETH / mês</p>
          <router-link :to="{ name: 'CreateContract', params: { propertyId: property._id } }" class="rent-btn">
            Alugar Agora
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define as propriedades (props) que o componente espera receber do pai
const props = defineProps({
  property: {
    type: Object,
    required: true
  }
});

// Define os eventos que o componente pode emitir para o pai
const emit = defineEmits(['close']);

// Função para emitir o evento 'close' quando o usuário quiser fechar a modal
function close() {
  emit('close');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #333;
}
.modal-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}
.modal-title {
  font-size: 1.75rem;
  color: #1e293b;
  margin: 0 0 1rem 0;
}
.modal-description {
  color: #475569;
  font-size: 1rem;
  margin-bottom: 2rem;
}
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}
.modal-rent {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
}
.rent-btn {
  text-decoration: none;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: bold;
}
</style>