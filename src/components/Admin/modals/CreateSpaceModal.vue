<template>
  <div class="overlay-background">
    <div class="create-modal card">
      <div class="card-header bg-primary text-white">
        Criar Novo Espaço
      </div>
      <div class="card-body">
        <p>Digite o nome do novo espaço. O nome deve ser único.</p>
        <div class="mb-3">
          <label for="newSpaceName" class="form-label">Nome do Espaço:</label>
          <input type="text" id="newSpaceName" class="form-control" :class="{ 'is-invalid': nameError }"
            v-model="newSpaceNameInput" @input="nameError = false" placeholder="Nome único para o espaço">
          <div v-if="nameError" class="invalid-feedback">
            Este nome de espaço já existe ou é inválido.
          </div>
        </div>
        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="$emit('cancel')">Cancelar</button>
          <button class="btn btn-primary" @click="handleCreateSpace">Criar Espaço</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  existingSpaces: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['create', 'cancel']);

const newSpaceNameInput = ref('');
const nameError = ref(false);

function handleCreateSpace() {
  const nameToCreate = newSpaceNameInput.value.trim();

  if (!nameToCreate) {
    nameError.value = true;
    alert("Nome do espaço não pode ser vazio.");
    return;
  }

  const isDuplicate = props.existingSpaces.some(space => space.name === nameToCreate);

  if (isDuplicate) {
    nameError.value = true;
    console.log(`Erro: O espaço "${nameToCreate}" já existe.`);
    alert(`Erro: O espaço "${nameToCreate}" já existe.`);
  } else {
    nameError.value = false;
    emit('create', nameToCreate); // Emit the name to the parent for creation
    // Parent will close the modal on success/failure
  }
}
</script>

<style scoped>
/* Keep the overlay and modal styles here */
.overlay-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.create-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  z-index: 1051;
  overflow: hidden;
}

.create-modal .card-header {
  background-color: #0d6efd !important;
  color: white;
  font-weight: bold;
  border-bottom: none;
  padding: 15px;
}

.create-modal .card-body {
  padding-top: 20px;
  padding: 15px;
}

.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linecap='round' d='M3 6l2 2 4-4'/%3e%3c/svg%3e") !important;
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style>
