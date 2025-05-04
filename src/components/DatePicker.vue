<template>
  <div class="border rounded p-3 d-inline-block" style="max-width: fit-content;">
    <!-- Calendário inline com v-model e key para controlar e resetar valor interno -->
    <VDatePicker v-model="date" mode="date" />
    <!-- Botões abaixo do calendário -->
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
const props = defineProps({
  selectedDate: Date,
});
const date = ref(props.selectedDate || new Date());
function applyDate() {
  emit('pickDate', date.value);
}

function applyToday() {
  date.value = new Date();
  emit('pickDate', date.value);
}

const emit = defineEmits(['pickDate']);

</script>
