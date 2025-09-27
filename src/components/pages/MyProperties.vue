```vue
<template>
  <div class="container">
    <h2 class="title">Minhas Propriedades</h2>

    <div v-if="loading" class="loading">Carregando propriedades...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <p v-if="properties.length === 0" class="empty">
        Você ainda não cadastrou nenhum imóvel.
      </p>

      <div v-else class="grid">
        <div
          v-for="property in properties"
          :key="property._id"
          class="card"
        >
          <img
            v-if="property.imageUrls && property.imageUrls.length"
            :src="property.imageUrls[0]"
            :alt="property.title"
            class="card-image"
          />
          <div class="card-body">
            <h3 class="card-title">{{ property.title }}</h3>
            <p class="card-description">{{ property.description }}</p>
            <p class="card-status">
              <strong>Status:</strong>
              <span
                :class="property.status === 'available' ? 'status-available' : 'status-rented'"
              >
                {{ property.status === 'available' ? 'Disponível' : 'Alugado' }}
              </span>
            </p>
            <button
              @click="handleStatusChange(property._id, property.status)"
              :class="property.status === 'available' ? 'btn-rented' : 'btn-available'"
            >
              {{ property.status === 'available'
                ? 'Marcar como Alugado'
                : 'Marcar como Disponível' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { propertyService } from "../../services/propertyService";

const properties = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchProperties = async () => {
  try {
    const res = await propertyService.getMyProperties();

    properties.value = await res.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleStatusChange = async (id, currentStatus) => {
  const newStatus = currentStatus === "available" ? "rented" : "available";

  try {
    const res = await propertyService.updatePropertyStatus(id, newStatus)

    if (!res.ok) throw new Error("Erro ao atualizar status");

    const data = await res.data.property;

    properties.value = properties.value.map((p) =>
      p._id === id ? data.property : p
    );
  } catch (err) {
    alert(err.message);
  }
};

onMounted(fetchProperties);
</script>

<style scoped>
.container {
  padding: 2rem;
}

.title {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #ffffff;
}

.loading,
.error,
.empty {
  font-size: 1rem;
  margin-top: 1rem;
}

.error {
  color: #dc2626;
}

.empty {
  color: #475569;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.card-body {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0f172a;
}

.card-description {
  flex-grow: 1;
  font-size: 0.95rem;
  color: #475569;
  margin-bottom: 0.75rem;
}

.card-status {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  text-align: center;
  align-items: center;
}

.status-available {
  color: #16a34a;
  font-weight: 600;
  align-items: center;
  text-align: center;
}

.status-rented {
  color: #dc2626;
  font-weight: 600;
}

button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-available {
  background-color: #16a34a;
  color: white;
}

.btn-available:hover {
  background-color: #15803d;
}

.btn-rented {
  background-color: #dc2626;
  color: white;
}

.btn-rented:hover {
  background-color: #b91c1c;
}
</style>