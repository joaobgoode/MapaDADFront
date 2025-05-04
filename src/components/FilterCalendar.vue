<template>
  <div class="border rounded p-3 d-inline-block" style="max-width: fit-content;">
    <!-- Calendário inline com v-model e key para controlar e resetar valor interno -->
    <v-date-picker :key="pickerKey" v-model="pickerValue" is-inline timezone="-03:00" :select-attribute="{}"
      :drag-attribute="{}" :attributes="attributes" @dayclick="onDayClick" />
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  filter: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filter', 'apply-dates', 'clear-dates'])

// Contador de key para forçar re-render do DatePicker
const pickerKey = ref(0)
// Controla o valor interno do DatePicker
const pickerValue = ref(null)
// Datas selecionadas como objetos Date
const selectedDates = ref([])

// Inicializar selectedDates com props.filter se existir
watch(() => props.filter, (newFilter) => {
  if (newFilter && newFilter.length > 0) {
    selectedDates.value = [...newFilter]
  }
}, { immediate: true, deep: true })

// Atributos para highlight do calendário
const attributes = computed(() => {
  if (selectedDates.value.length === 0) {
    return []
  }
  return [
    {
      key: 'selected',
      highlight: { fillMode: 'solid' },
      dates: selectedDates.value,
    }
  ]
})

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
}

// Aplica as datas selecionadas
function applyDates() {
  // Ordena as datas selecionadas antes de emitir
  const sortedDates = [...selectedDates.value].sort((a, b) => a - b)

  // Emite evento para atualizar o filter
  emit('update:filter', sortedDates)

  // Emite evento para o componente pai
  emit('apply-dates', sortedDates)
}

// Limpa todas as datas selecionadas
function clearDates() {
  selectedDates.value = []
  pickerValue.value = null

  // Incrementa key para resetar o componente
  pickerKey.value++

  // Emite eventos para atualizar o componente pai
  emit('update:filter', [])
  emit('clear-dates')
}

// Expõe funções para o componente pai
defineExpose({
  clearDates,
  applyDates,
  selectedDates
})
</script>

<style scoped>
/* Estilos mantidos do componente original */
</style>
