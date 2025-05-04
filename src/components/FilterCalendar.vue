<template>
  <div class="p-4">
    <!-- Retângulo envolvendo o calendário e botões (ajustado para tamanho do conteúdo) -->
    <div class="border rounded p-3 d-inline-block" style="max-width: fit-content;">
      <!-- Calendário inline com v-model para controlar e resetar valor interno -->
      <v-date-picker v-model="pickerValue" is-inline timezone="-03:00" :select-attribute="{}" :drag-attribute="{}"
        :attributes="attributes" @dayclick="onDayClick" />

      <!-- Botões abaixo do calendário -->
      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-primary me-2" @click="applyDates">
          Aplicar
        </button>
        <button class="btn btn-danger" @click="clearDates">
          Apagar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Controla o valor interno do DatePicker
const pickerValue = ref(null)

// Datas selecionadas como objetos Date
const selectedDates = ref([])

// Atributos para highlight do calendário
const attributes = computed(() => [
  {
    key: 'selected',
    highlight: { fillMode: 'solid' },
    dates: selectedDates.value,
  },
])

// Handler de clique de dia
function onDayClick({ year, month, day }) {
  const clicked = new Date(year, month - 1, day)
  const idx = selectedDates.value.findIndex(
    d => d.getTime() === clicked.getTime()
  )

  if (idx >= 0) {
    selectedDates.value.splice(idx, 1)
  } else {
    selectedDates.value.push(clicked)
  }

  // Reseta o valor interno do picker para evitar seleção única
  pickerValue.value = null
  console.log('Datas selecionadas:', selectedDates.value)
}

// Aplica as datas selecionadas - exibe no console
function applyDates() {
  console.log('Aplicar datas:', selectedDates.value)
}

// Limpa todas as datas selecionadas

function clearDates() {
  selectedDates.value = []
  pickerValue.value = null
}
</script>

<style scoped>
.p-4 {
  padding: 1rem;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
