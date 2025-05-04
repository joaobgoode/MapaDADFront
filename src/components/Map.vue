<script setup>
import OccupationMap from './OccupationMap.vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/store.js'
import FilterCalendar from './FilterCalendar.vue'
import DatePicker from './DatePicker.vue'

const router = useRouter()
const options = ref(['Quadra 1', 'Quadra 2', 'Quadra 3', "Sala 1", "Sala 2"])
const selectedOption = ref(options.value[0])
const calendar = ref(null)
const filter = ref([])
const selectedDate = ref(new Date())
const filterCalendarRef = ref(null)

const showDatePicker = ref(false)
const showFilterCalendar = ref(false)

function chooseOption(option) {
  selectedOption.value = option
  if (calendar.value) {
    calendar.value.changeSpace(option)
  }
}

function sair() {
  router.push('/')
  store.reset()
}

function toggleDatePicker() {
  showDatePicker.value = !showDatePicker.value
  if (showDatePicker.value) showFilterCalendar.value = false
}

function toggleFilterCalendar() {
  showFilterCalendar.value = !showFilterCalendar.value
  if (showFilterCalendar.value) showDatePicker.value = false
}

function handleClickOutside(event) {
  const datePickerElement = document.getElementById('datepicker-overlay')
  const filterCalendarElement = document.getElementById('filtercalendar-overlay')
  const datePickerButton = document.getElementById('datepicker-button')
  const filterCalendarButton = document.getElementById('filtercalendar-button')

  if (showDatePicker.value &&
    datePickerElement &&
    !datePickerElement.contains(event.target) &&
    !datePickerButton.contains(event.target)) {
    showDatePicker.value = false
  }

  if (showFilterCalendar.value &&
    filterCalendarElement &&
    !filterCalendarElement.contains(event.target) &&
    !filterCalendarButton.contains(event.target)) {
    showFilterCalendar.value = false
  }
}

// Função para lidar com a aplicação do filtro
function handleApplyFilter(dates) {
  console.log('Filtro aplicado:', dates)
  filter.value = dates

  // Fechar o overlay do filtro após aplicar
  showFilterCalendar.value = false

  // Notificar o calendário sobre a mudança no filtro
  if (calendar.value && calendar.value.handleFilterApply) {
    calendar.value.handleFilterApply(dates)
  }
  toggleFilterCalendar()
}

// Função para lidar com a limpeza do filtro
function handleClearFilter() {
  console.log('Filtro limpo')
  filter.value = []

  // Notificar o calendário sobre a limpeza do filtro
  if (calendar.value && calendar.value.handleFilterClear) {
    calendar.value.handleFilterClear()
  }
  toggleFilterCalendar()
}

function onPickDate(date) {
  selectedDate.value = date
  toggleDatePicker()
}

// Observar mudanças no filter
watch(() => filter.value, (newFilter) => {
  console.log('Filter changed:', newFilter)
}, { deep: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="bg-primary text-white border-bottom w-100"
    style="position: fixed; top: 0; left: 0; z-index: 1000; height: 70px;">
    <div class="d-flex justify-content-between align-items-center px-3 w-100 h-100">
      <!-- Left Section -->
      <div class="d-flex align-items-center gap-3 h-100">
        <img class="unifor-logo" src="../assets/imagens/unifor-online.png" alt="Logotipo da Unifor">
        <span class="fw-bold fs-5">Mapa de Ocupação</span>

        <div class="dropdown d-flex align-items-center">
          <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            {{ selectedOption }}
          </button>
          <ul class="dropdown-menu">
            <li v-for="option in options" :key="option" @click.prevent="chooseOption(option)">
              <a class="dropdown-item" href="#">{{ option }}</a>
            </li>
          </ul>
        </div>

        <button id="filtercalendar-button"
          class="btn btn-outline-light d-flex align-items-center justify-content-center"
          @click.stop="toggleFilterCalendar">
          <i class="bi bi-funnel"></i>
          <span v-if="filter.length > 0" class="filter-badge"></span>
        </button>

        <button id="datepicker-button" class="btn btn-outline-light d-flex align-items-center justify-content-center"
          @click.stop="toggleDatePicker">
          <i class="bi bi-calendar"></i>
        </button>
      </div>

      <!-- Right Section -->
      <div class="d-flex align-items-center h-100">
        <ul class="nav nav-pills m-0 h-100 d-flex align-items-center">
          <li class="nav-item sair-btn">
            <a href="#" class="nav-link text-white d-flex align-items-center h-100" @click="sair">Sair</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Overlays -->
    <div id="datepicker-overlay" v-if="showDatePicker" class="datepicker-overlay">
      <DatePicker :selectedDate="selectedDate" @pickDate="onPickDate" />
    </div>

    <div id="filtercalendar-overlay" v-if="showFilterCalendar" class="filtercalendar-overlay">
      <FilterCalendar ref="filterCalendarRef" v-model:filter="filter" @apply-dates="handleApplyFilter"
        @clear-dates="handleClearFilter" />
    </div>
  </header>

  <div class="map-content">
    <OccupationMap ref="calendar" :space="selectedOption || 'Sem Quadra Cadastrada'" :filter="filter"
      :selectedDate="selectedDate" />
  </div>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
}

.map-content {
  position: absolute;
  top: 70px;
  right: 0;
  height: calc(100vh - 70px);
  padding: 20px;
  width: 100%;
  background-color: white;
}

.unifor-logo {
  height: 30px;
  object-fit: contain;
  margin-right: 10px;
}

.sair-btn {
  font-size: 1.2rem;
  font-weight: bold;
  height: 100%;
  display: flex;
  align-items: center;
}

/* Botões com tamanho consistente */
.btn-outline-light {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Indicador de filtro ativo */
.filter-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  background-color: #ff9800;
  border-radius: 50%;
}

/* Overlays */
.datepicker-overlay,
.filtercalendar-overlay {
  position: absolute;
  top: 100%;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  margin-top: 5px;
  width: max-content;
}

.filtercalendar-overlay {
  left: 208px;
}

.datepicker-overlay {
  left: 267px;
}
</style>
