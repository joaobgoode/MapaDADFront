<template>
  <div class="border rounded p-3 d-inline-block" style="max-width: fit-content;">
    <v-date-picker :key="pickerKey" v-model="pickerValue" is-inline timezone="-03:00" :select-attribute="{}"
      :drag-attribute="{}" :attributes="attributes" @dayclick="onDayClick" />
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

const pickerKey = ref(0)
const pickerValue = ref(null)
const selectedDates = ref([])

watch(() => props.filter, (newFilter) => {
  if (newFilter && newFilter.length > 0) {
    selectedDates.value = [...newFilter]
  }
}, { immediate: true, deep: true })

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
  pickerValue.value = null
}

function applyDates() {
  const sortedDates = [...selectedDates.value].sort((a, b) => a - b)

  emit('update:filter', sortedDates)

  emit('apply-dates', sortedDates)
}

function clearDates() {
  selectedDates.value = []
  pickerValue.value = null

  pickerKey.value++

  emit('update:filter', [])
  emit('clear-dates')
}

defineExpose({
  clearDates,
  applyDates,
  selectedDates
})
</script>

<style scoped></style>
