<script setup>
import OccupationMap from './OccupationMap.vue'
import AppHeader from './AppHeader.vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/store.js'

const router = useRouter()
const options = ref(['Quadra 1', 'Quadra 2', 'Quadra 3', "Sala 1", "Sala 2"])
const selectedOption = ref(options.value[0])
const calendar = ref(null)
const filter = ref([])
const selectedDate = ref(new Date())

// Função para lidar com a mudança de espaço no header
function handleSpaceChange(option) {
  if (calendar.value) {
    calendar.value.changeSpace(option)
  }
}

// Função para lidar com o logout
function handleLogout() {
  router.push('/')
  store.reset()
}

// Função para lidar com a aplicação do filtro
function handleApplyFilter(dates) {
  console.log('Filtro aplicado:', dates)

  // Notificar o calendário sobre a mudança no filtro
  if (calendar.value && calendar.value.handleFilterApply) {
    calendar.value.handleFilterApply(dates)
  }
}

// Função para lidar com a limpeza do filtro
function handleClearFilter() {
  console.log('Filtro limpo')

  // Notificar o calendário sobre a limpeza do filtro
  if (calendar.value && calendar.value.handleFilterClear) {
    calendar.value.handleFilterClear()
  }
}

// Observar mudanças no filter
watch(() => filter.value, (newFilter) => {
  console.log('Filter changed:', newFilter)
}, { deep: true })
</script>

<template>
  <!-- Componente Header -->
  <AppHeader v-model="selectedOption" v-model:filter="filter" v-model:modelDate="selectedDate" :options="options"
    @space-change="handleSpaceChange" @apply-filter="handleApplyFilter" @clear-filter="handleClearFilter"
    @logout="handleLogout" />

  <div class="map-content">
    <OccupationMap ref="calendar" :space="selectedOption || 'Sem Quadra Cadastrada'" :filter="filter"
      :selectedDate="selectedDate" />
  </div>
</template>

<style scoped>
.map-content {
  position: absolute;
  top: 70px;
  right: 0;
  height: calc(100vh - 70px);
  padding: 20px;
  width: 100%;
  background-color: white;
}
</style>
