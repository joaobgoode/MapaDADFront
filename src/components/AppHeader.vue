<template>
  <header class="bg-primary text-white border-bottom w-100"
    style="position: fixed; top: 0; left: 0; z-index: 1000; height: 70px;">
    <div class="d-flex justify-content-between align-items-center px-3 w-100 h-100">
      <!-- Left Section -->
      <div class="d-flex align-items-center gap-3 h-100">
        <img class="unifor-logo" src="../../unifor-online.png" alt="Logotipo da Unifor">
        <span class="fw-bold fs-5 d-none d-md-block">Mapa de Ocupação</span>
        <span class="fw-bold fs-5 d-md-none">Mapa</span>

        <!-- Desktop Navigation -->
        <div class="desktop-nav d-none d-md-flex align-items-center gap-3">
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

        <!-- Mobile Hamburger Button -->
        <button class="navbar-toggler d-md-none ms-auto" type="button" @click="toggleMobileMenu">
          <span class="navbar-toggler-icon">
            <i class="bi bi-list text-white fs-4"></i>
          </span>
        </button>
      </div>

      <!-- Right Section - Desktop -->
      <div class="d-none d-md-flex align-items-center h-100">
        <ul class="nav nav-pills m-0 h-100 d-flex align-items-center">
          <li class="nav-item sair-btn">
            <a href="#" class="nav-link text-white d-flex align-items-center h-100" @click="handleLogout">Sair</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'show': showMobileMenu }">
      <div class="p-3">
        <div class="mobile-menu-header d-flex justify-content-between align-items-center mb-3">
          <span class="fw-bold text-primary">Menu</span>
          <button class="btn-close" @click="toggleMobileMenu"></button>
        </div>

        <div class="mobile-option-selector mb-3">
          <label class="form-label text-dark">Selecionar Espaço</label>
          <select class="form-select" v-model="selectedOptionMobile" @change="handleMobileOptionChange">
            <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>

        <div class="d-flex gap-2 mb-3">
          <button class="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center"
            @click="handleMobileFilterCalendar">
            <i class="bi bi-funnel me-2"></i>
            <span v-if="filter.length > 0" class="filter-badge-mobile"></span>
            Filtrar
          </button>

          <button class="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center"
            @click="handleMobileDatePicker">
            <i class="bi bi-calendar me-2"></i>
            Calendário
          </button>
        </div>

        <hr>

        <button class="btn btn-outline-danger w-100" @click="handleLogout">
          <i class="bi bi-box-arrow-right me-2"></i>
          Sair
        </button>
      </div>
    </div>

    <!-- Overlay para fechar menu ao clicar fora -->
    <div class="mobile-overlay" v-if="showMobileMenu" @click="toggleMobileMenu"></div>

    <!-- Overlays -->
    <div id="datepicker-overlay" v-if="showDatePicker"
      :class="{ 'datepicker-overlay-desktop': !isMobile, 'datepicker-overlay-mobile': isMobile }">
      <DatePicker :selectedDate="modelDate" @pickDate="onPickDate" />
    </div>

    <div id="filtercalendar-overlay" v-if="showFilterCalendar"
      :class="{ 'filtercalendar-overlay-desktop': !isMobile, 'filtercalendar-overlay-mobile': isMobile }">
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

const selectedOptionMobile = ref(props.modelValue || props.options[0]);

const localFilter = computed({
  get: () => props.filter,
  set: (value) => emit('update:filter', value)
});

const showDatePicker = ref(false);
const showFilterCalendar = ref(false);
const showMobileMenu = ref(false);
const filterCalendarRef = ref(null);
const isMobile = ref(window.innerWidth < 750);

function handleMobileOptionChange() {
  selectedOption.value = selectedOptionMobile.value;
  emit('space-change', selectedOptionMobile.value);
}

function chooseOption(option) {
  selectedOption.value = option;
  selectedOptionMobile.value = option;
  emit('space-change', option);
}

function handleLogout() {
  emit('logout');
  if (showMobileMenu.value) {
    showMobileMenu.value = false;
  }
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    showDatePicker.value = false;
    showFilterCalendar.value = false;
  }
}

function toggleDatePicker() {
  showDatePicker.value = !showDatePicker.value;
  if (showDatePicker.value) {
    showFilterCalendar.value = false;
    showMobileMenu.value = false;
  }
}

function toggleFilterCalendar() {
  showFilterCalendar.value = !showFilterCalendar.value;
  if (showFilterCalendar.value) {
    showDatePicker.value = false;
    showMobileMenu.value = false;
  }
}

function handleMobileFilterCalendar() {
  showMobileMenu.value = false;
  showDatePicker.value = false;
  setTimeout(() => {
    showFilterCalendar.value = true;
    isMobile.value = true;
  }, 300);
}

function handleMobileDatePicker() {
  showMobileMenu.value = false;
  showFilterCalendar.value = false;
  setTimeout(() => {
    showDatePicker.value = true;
    isMobile.value = true;
  }, 300);
}

function handleClickOutside(event) {
  const datePickerElement = document.getElementById('datepicker-overlay');
  const filterCalendarElement = document.getElementById('filtercalendar-overlay');
  const datePickerButton = document.getElementById('datepicker-button');
  const filterCalendarButton = document.getElementById('filtercalendar-button');

  if (showDatePicker.value &&
    datePickerElement &&
    !datePickerElement.contains(event.target) &&
    (!datePickerButton || !datePickerButton.contains(event.target))) {
    showDatePicker.value = false;
  }

  if (showFilterCalendar.value &&
    filterCalendarElement &&
    !filterCalendarElement.contains(event.target) &&
    (!filterCalendarButton || !filterCalendarButton.contains(event.target))) {
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

function handleResize() {
  isMobile.value = window.innerWidth < 750;

  if (!isMobile.value) {
    showMobileMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  handleResize(); // Inicializar
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
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

.filter-badge-mobile {
  position: absolute;
  top: 6px;
  left: 24px;
  width: 8px;
  height: 8px;
  background-color: #ff9800;
  border-radius: 50%;
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 70px;
  right: -270px;
  width: 250px;
  height: calc(100vh - 70px);
  background-color: white;
  z-index: 1200;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  overflow-y: auto;
}

.mobile-menu.show {
  right: 0;
}

.mobile-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: calc(100vh - 70px);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1100;
}

.navbar-toggler {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  padding: 6px 10px;
}

/* Overlays */
.datepicker-overlay-desktop,
.filtercalendar-overlay-desktop {
  position: absolute;
  top: 100%;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  margin-top: 5px;
  width: max-content;
}

.datepicker-overlay-mobile,
.filtercalendar-overlay-mobile {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  z-index: 1300;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.filtercalendar-overlay-desktop {
  left: 208px;
}

.datepicker-overlay-desktop {
  left: 267px;
}

@media (max-width: 750px) {
  header {
    padding: 0 15px;
  }

  .unifor-logo {
    height: 25px;
  }
}
</style>
