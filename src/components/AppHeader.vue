<template>
  <header class="bg-primary text-white border-bottom w-100"
    style="position: fixed; top: 0; left: 0; z-index: 1000; height: 70px;">
    <div class="d-flex justify-content-between align-items-center px-3 w-100 h-100">
      <!-- Left Section -->
      <div class="d-flex align-items-center gap-3 h-100">
        <img class="unifor-logo" src="../../unifor-online.png" alt="Logotipo da Unifor">
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
            <a href="#" class="nav-link text-white d-flex align-items-center h-100" @click="handleLogout">Sair</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Overlays -->
    <div id="datepicker-overlay" v-if="showDatePicker" class="datepicker-overlay">
      <DatePicker :selectedDate="modelDate" @pickDate="onPickDate" />
    </div>

    <div id="filtercalendar-overlay" v-if="showFilterCalendar" class="filtercalendar-overlay">
      <FilterCalendar ref="filterCalendarRef" v-model:filter="localFilter" @apply-dates="handleApplyFilter"
        @clear-dates="handleClearFilter" />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits, computed } from 'vue'
import FilterCalendar from './FilterCalendar.vue'
import DatePicker from './DatePicker.vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => ['Quadra 1', 'Quadra 2', 'Quadra 3', "Sala 1", "Sala 2"]
  },
  modelValue: {
    type: String,
    default: ''
  },
  filter: {
    type: Array,
    default: () => []
  },
  modelDate: {
    type: Date,
    default: () => new Date()
  }
});

const emit = defineEmits([
  'update:modelValue',
  'update:filter',
  'update:modelDate',
  'apply-filter',
  'clear-filter',
  'logout',
  'space-change'
]);

const selectedOption = computed({
  get: () => props.modelValue || props.options[0],
  set: (value) => emit('update:modelValue', value)
});

const localFilter = computed({
  get: () => props.filter,
  set: (value) => emit('update:filter', value)
});

const showDatePicker = ref(false);
const showFilterCalendar = ref(false);
const filterCalendarRef = ref(null);

function chooseOption(option) {
  selectedOption.value = option;
  emit('space-change', option);
}

function handleLogout() {
  emit('logout');
}

function toggleDatePicker() {
  showDatePicker.value = !showDatePicker.value;
  if (showDatePicker.value) showFilterCalendar.value = false;
}

function toggleFilterCalendar() {
  showFilterCalendar.value = !showFilterCalendar.value;
  if (showFilterCalendar.value) showDatePicker.value = false;
}

function handleClickOutside(event) {
  const datePickerElement = document.getElementById('datepicker-overlay');
  const filterCalendarElement = document.getElementById('filtercalendar-overlay');
  const datePickerButton = document.getElementById('datepicker-button');
  const filterCalendarButton = document.getElementById('filtercalendar-button');

  if (showDatePicker.value &&
    datePickerElement &&
    !datePickerElement.contains(event.target) &&
    !datePickerButton.contains(event.target)) {
    showDatePicker.value = false;
  }

  if (showFilterCalendar.value &&
    filterCalendarElement &&
    !filterCalendarElement.contains(event.target) &&
    !filterCalendarButton.contains(event.target)) {
    showFilterCalendar.value = false;
  }
}

function handleApplyFilter(dates) {
  localFilter.value = dates;
  showFilterCalendar.value = false;
  emit('apply-filter', dates);
}

function handleClearFilter() {
  localFilter.value = [];
  showFilterCalendar.value = false;
  emit('clear-filter');
}

function onPickDate(date) {
  emit('update:modelDate', date);
  toggleDatePicker();
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
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
