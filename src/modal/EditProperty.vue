<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <h2 class="modal-title">Editar Imóvel</h2>
      <button @click="closeModal" class="close-btn">&times;</button>
      
      <form v-if="formData" @submit.prevent="handleSubmit" class="edit-form">
        
        <fieldset>
          <legend>Informações Principais</legend>
          <div class="form-group">
            <label for="title">Título</label>
            <input id="title" v-model="formData.title" type="text" required>
          </div>
          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea id="description" v-model="formData.description" rows="4" required></textarea>
          </div>
        </fieldset>

        <fieldset>
          <legend>Localização</legend>
          <div class="grid-2-cols">
            <div class="form-group">
              <label for="cep">CEP</label>
              <input id="cep" v-model="formData.location.cep" type="text">
            </div>
            <div class="form-group">
              <label for="address">Endereço</label>
              <input id="address" v-model="formData.location.address" type="text">
            </div>
            <div class="form-group">
              <label for="neighborhood">Bairro</label>
              <input id="neighborhood" v-model="formData.location.neighborhood" type="text">
            </div>
            <div class="form-group">
              <label for="city">Cidade</label>
              <input id="city" v-model="formData.location.city" type="text">
            </div>
             <div class="form-group">
              <label for="state">Estado</label>
              <input id="state" v-model="formData.location.state" type="text">
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Detalhes do Imóvel</legend>
          <div class="grid-3-cols">
            <div class="form-group">
              <label for="propertyType">Tipo de Imóvel</label>
              <input id="propertyType" v-model="formData.details.PropertyType" type="text">
            </div>
            <div class="form-group">
              <label for="area">Área (m²)</label>
              <input id="area" v-model.number="formData.details.area" type="number">
            </div>
             <div class="form-group">
              <label for="bedrooms">Quartos</label>
              <input id="bedrooms" v-model.number="formData.details.bedrooms" type="number">
            </div>
             <div class="form-group">
              <label for="bathrooms">Banheiros</label>
              <input id="bathrooms" v-model.number="formData.details.bathrooms" type="number">
            </div>
            <div class="form-group">
              <label for="garageSpots">Vagas de Garagem</label>
              <input id="garageSpots" v-model.number="formData.details.garageSpots" type="number">
            </div>
          </div>
           <div class="form-group-checkbox">
              <input id="isFurnished" v-model="formData.details.isFurnished" type="checkbox">
              <label for="isFurnished">É mobiliado?</label>
            </div>
        </fieldset>

        <fieldset>
          <legend>Regras e Valores</legend>
          <div class="grid-3-cols">
              <div class="form-group">
                <label for="rentAmount">Aluguel (ETH)</label>
                <input id="rentAmount" v-model="formData.fees.rentAmount" type="text">
              </div>
              <div class="form-group">
                <label for="securityDeposit">Depósito Caução (ETH)</label>
                <input id="securityDeposit" v-model="formData.fees.securityDeposit" type="text">
              </div>
              <div class="form-group">
                <label for="condoFee">Condomínio (ETH)</label>
                <input id="condoFee" v-model="formData.fees.condoFee" type="text" placeholder="Deixe em branco se não houver">
              </div>
               <div class="form-group">
                <label for="minLeaseMonths">Mínimo de Meses</label>
                <input id="minLeaseMonths" v-model.number="formData.rules.minLeaseMonths" type="number">
              </div>
          </div>
           <div class="form-group-checkbox">
              <input id="petsAllowed" v-model="formData.rules.petsAllowed" type="checkbox">
              <label for="petsAllowed">Permite animais?</label>
            </div>
        </fieldset>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
          <button type="submit" class="btn-save" :disabled="isSubmitting">
            {{ isSubmitting ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { propertyService } from '../services/propertyService';

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['close', 'property-updated']);

const toast = useToast();
const formData = ref(null);
const isSubmitting = ref(false);

onMounted(() => {
  // ATENÇÃO: Usamos JSON.parse(JSON.stringify(...)) para criar uma "cópia profunda" (deep copy).
  // Isso garante que, se o usuário alterar os dados no formulário e cancelar,
  // o objeto original na lista não seja modificado.
  formData.value = JSON.parse(JSON.stringify(props.property));
});

async function handleSubmit() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // A API de update deve receber o objeto completo com a mesma estrutura
    const updatedData = await propertyService.updateProperty(props.property._id, formData.value);
    toast.success('Imóvel atualizado com sucesso!');
    
    emit('property-updated', updatedData.data);
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Falha ao atualizar o imóvel.');
  } finally {
    isSubmitting.value = false;
  }
}

function closeModal() {
  emit('close');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  overflow-y: auto; /* Permite rolagem se o modal for muito grande */
  padding: 2rem 0;
}
.modal-content {
  background: white; padding: 2rem; border-radius: 0.5rem;
  width: 90%; max-width: 800px; position: relative;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.modal-title { margin-top: 0; color: #1e293b; }
.close-btn {
  position: absolute; top: 1rem; right: 1rem; border: none;
  background: transparent; font-size: 1.5rem; cursor: pointer;
}
.edit-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 0.5rem; font-weight: bold; color: #334155; }
.form-group input, .form-group textarea {
  padding: 0.75rem; border: 1px solid #cbd5e1;
  border-radius: 0.375rem; font-size: 1rem;
}
.form-group-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.form-group-checkbox label {
  margin-bottom: 0;
  font-weight: normal;
}
fieldset {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}
legend {
  font-weight: bold;
  color: #334155;
  padding: 0 0.5rem;
}
.grid-2-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.grid-3-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.form-actions {
  display: flex; justify-content: flex-end; gap: 1rem;
  margin-top: 1.5rem;
}
.btn-cancel, .btn-save {
  padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem;
  font-weight: bold; cursor: pointer; transition: background-color 0.2s;
}
.btn-cancel { background-color: #f1f5f9; color: #1e293b; }
.btn-cancel:hover { background-color: #e2e8f0; }
.btn-save { background-color: #2563eb; color: white; }
.btn-save:hover { background-color: #1d4ed8; }
.btn-save:disabled { background-color: #94a3b8; cursor: not-allowed; }
</style>