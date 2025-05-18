<template>
  <div class="overlay-background">
    <div class="confirm-modal card">
      <div class="card-header bg-danger text-white">
        Confirmação de Exclusão
      </div>
      <div class="card-body">
        <p>Você tem certeza que deseja deletar o(a) <strong>{{ itemType }}</strong> chamado(a) <strong>"{{
          itemName }}"</strong>?</p>
        <p class="text-danger font-weight-bold">Esta ação é permanente e não pode ser desfeita.</p>
        <p>Para confirmar, digite o <strong>seu nome de usuário</strong> abaixo:</p>
        <input type="text" class="form-control mb-3" v-model="confirmationUsernameInput"
          :placeholder="'Digite seu usuário: ' + adminUsername">
        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="$emit('cancel')">Cancelar</button>
          <button class="btn btn-danger" @click="$emit('confirm', confirmationUsernameInput)">Confirmar
            Exclusão</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  itemType: {
    type: String,
    required: true // e.g., 'usuário' or 'espaço'
  },
  itemName: {
    type: String,
    required: true // The name or ID of the item
  },
  adminUsername: {
    type: String,
    required: true // The currently logged-in admin's username
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirmationUsernameInput = ref('');

// The confirmation logic (checking username) is handled in the parent component
// when it receives the 'confirm' event with the input value.
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

.confirm-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  z-index: 1051;
  overflow: hidden;
}

.confirm-modal .card-header {
  background-color: #dc3545 !important;
  color: white;
  font-weight: bold;
  border-bottom: none;
  padding: 15px;
}

.confirm-modal .card-body {
  padding-top: 20px;
  padding: 15px;
}
</style>
