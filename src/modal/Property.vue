<template>
  <transition name="fade">
    <div class="modal-backdrop" @click.self="close">
      <transition name="slide-up">
        <div class="modal-content">
          <button class="close-btn" @click="close" aria-label="Fechar modal">&times;</button>
          
          <div v-if="property" class="modal-body">
            <div class="gallery">
              <img :src="mainImageUrl" :alt="property.title" class="main-image" />
              <div v-if="property.imageUrls && property.imageUrls.length > 1" class="thumbnails">
                <img 
                  v-for="(url, index) in property.imageUrls" 
                  :key="index" 
                  :src="url" 
                  :alt="`Imagem ${index + 1}`"
                  :class="{ active: url === mainImageUrl }"
                  @click="mainImageUrl = url"
                  class="thumbnail-image"
                />
              </div>
            </div>

            <div class="info-section">
              <h2 class="modal-title">{{ property.title }}</h2>
              <p class="location"><i class="fas fa-map-marker-alt"></i> {{ formattedAddress }}</p>

              <div class="details-grid">
                <div class="detail-item"><i class="fas fa-ruler-combined"></i> {{ property.details.area }} m²</div>
                <div class="detail-item"><i class="fas fa-bed"></i> {{ property.details.bedrooms }} Quarto(s)</div>
                <div class="detail-item"><i class="fas fa-bath"></i> {{ property.details.bathrooms }} Banheiro(s)</div>
                <div class="detail-item"><i class="fas fa-couch"></i> Mobiliado: {{ property.details.isFurnished ? 'Sim' : 'Não' }}</div>
                <div class="detail-item"><i class="fas fa-paw"></i> Permite Animais: {{ property.rules.petsAllowed ? 'Sim' : 'Não' }}</div>
              </div>

              <h3 class="section-title">Descrição</h3>
              <p class="modal-description">{{ property.description }}</p>
              
              <h3 class="section-title">Valores</h3>
              <div class="fees-details">
                <p><strong>Aluguel Mensal:</strong> {{ property.fees.rentAmount }} ETH</p>
                <p><strong>Depósito de Segurança:</strong> {{ property.fees.securityDeposit }} ETH</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="rent-info">
              <span class="rent-label">Aluguel / mês</span>
              <span class="modal-rent">{{ property.fees.rentAmount }} ETH</span>
            </div>
            <router-link :to="{ name: 'CreateContract', params: { propertyId: property._id } }" class="rent-btn">
              Alugar Agora
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  property: { type: Object, required: true }
});

const emit = defineEmits(['close']);

const mainImageUrl = ref('');

// Quando o componente é montado, define a primeira imagem como a principal
onMounted(() => {
  if (props.property && props.property.imageUrls && props.property.imageUrls.length > 0) {
    mainImageUrl.value = props.property.imageUrls[0];
  }
});

// Formata o endereço para exibição
const formattedAddress = computed(() => {
  if (!props.property.location) return 'Endereço não informado';
  const { address, neighborhood, city, state } = props.property.location;
  return `${address}, ${neighborhood}, ${city} - ${state}`;
});

function close() {
  emit('close');
}
</script>

<style scoped>
/* Animações */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(30px); }

/* Estilos da Modal */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(15, 23, 42, 0.8);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: #ffffff;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 800px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.close-btn {
  position: absolute; top: 12px; right: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: none; border-radius: 50%;
  width: 36px; height: 36px;
  font-size: 1.5rem; cursor: pointer; color: #334155;
  display: flex; align-items: center; justify-content: center;
  line-height: 1; z-index: 10;
  transition: background-color 0.2s, transform 0.2s;
}
.close-btn:hover { background-color: #f1f5f9; transform: rotate(90deg); }

.modal-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Galeria de Imagens */
.gallery { margin-bottom: 2rem; }
.main-image {
  width: 100%; height: 400px; object-fit: cover;
  border-radius: 0.5rem; margin-bottom: 0.75rem;
  background-color: #f1f5f9;
}
.thumbnails { display: flex; gap: 0.75rem; }
.thumbnail-image {
  width: 80px; height: 60px; object-fit: cover;
  border-radius: 0.25rem; cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.2s;
}
.thumbnail-image:hover { transform: scale(1.05); }
.thumbnail-image.active { border-color: #2563eb; }

/* Seção de Informações */
.info-section { color: #334155; }
.modal-title {
  font-size: 2rem; color: #1e293b;
  font-weight: bold; margin: 0 0 0.5rem 0;
}
.location {
  font-size: 1rem; color: #64748b;
  margin-bottom: 1.5rem;
}
.location i { margin-right: 0.5rem; color: #94a3b8; }

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}
.detail-item { font-size: 0.95rem; display: flex; align-items: center; }
.detail-item i {
  margin-right: 0.75rem;
  color: #2563eb;
  width: 20px; text-align: center;
}

.section-title {
  font-size: 1.25rem; font-weight: 600;
  color: #1e293b; margin-bottom: 0.75rem;
}
.modal-description, .fees-details {
  color: #475569; line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Rodapé */
.modal-footer {
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  flex-shrink: 0;
}
.rent-info { display: flex; flex-direction: column; }
.rent-label { font-size: 0.875rem; color: #64748b; }
.modal-rent {
  font-size: 1.5rem; font-weight: bold;
  color: #1e293b; margin: 0;
}
.rent-btn {
  text-decoration: none; background-color: #2563eb; color: white;
  padding: 0.75rem 2rem; border-radius: 0.375rem; font-weight: bold;
  transition: background-color 0.2s;
}
.rent-btn:hover { background-color: #1d4ed8; }
</style>