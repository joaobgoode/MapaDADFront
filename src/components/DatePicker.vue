<template>
  <div class="border rounded p-3 d-inline-block" style="max-width: fit-content;">
    <VDatePicker v-model="date" mode="date" />
    <div class="d-flex justify-content-end mt-3">
      <button class="btn btn-primary me-2" @click="applyDate">
        Aplicar
      </button>
      <button class="btn btn-primary me-2" @click="applyToday">
        Hoje
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import { store } from '../store/store.js'

const props = defineProps({
  selectedDate: Date,
});

// Mova esta linha para cima antes das funções que a utilizam
const emit = defineEmits(['pickDate']);

const date = ref(props.selectedDate || new Date());

function applyDate() {
  emit('pickDate', date.value);
  store.pickerDate.value = date.value;
}

function applyToday() {
  date.value = new Date();
  emit('pickDate', date.value);
  store.pickerDate.value = date.value;
}
</script>
