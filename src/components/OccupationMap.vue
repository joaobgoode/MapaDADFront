<template>
  <div class="calendar-container">
    <!-- Color Picker Dropdown -->
    <div class="color-picker-dropdown" :style="{ top: '1.5%', left: '-1%' }" ref="colorPickerRef">
      <button class="color-picker-btn" :class="paintMode ? 'bg-primary' : 'bg-light'" @click.stop="toggleColorPicker">
        <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
        <i class="bi bi-chevron-down"></i>
      </button>
      <div class="color-options" v-if="showColorPicker" @click.stop>
        <div v-for="(color, name) in colorOptions" :key="name" class="color-option" :style="{ backgroundColor: color }"
          @click.stop="selectColor(color, name)" :title="name">
        </div>
        <div class="color-option exit-option" @click.stop="exitPaintMode" title="Sair do modo pintura">
          <i class="bi bi-x-circle"></i>
        </div>
      </div>
    </div>

    <!-- Navegação -->
    <button class="ui-button prev-btn" @click="changeDay(-7)">
      <i class="bi bi-caret-left-square"></i>
    </button>
    <button class="ui-button next-btn" @click="changeDay(7)">
      <i class="bi bi-caret-right-square"></i>
    </button>


    <!-- Conteúdo principal -->
    <div class="content">
      <div class="day-headers">
        <div v-for="(day, index) in days" :key="`header-${index}`" class="day-header">
          <p class="date" :class="istoday(day) ? 'today' : ''">{{ dayToString(day) }}</p>
          <p class="weekday">{{ getWeekDay(day) }}</p>
        </div>
      </div>
      <div class="map-content">
        <div class="horarios">
          <div v-for="time in timeSlots" :key="`time-${time}`">
            {{ formatTime(time) }}
          </div>
        </div>
        <div class="days-container">
          <DaySlot v-if="show" v-for="(day, index) in days" :key="`${currentSpace}-${key}-${index}`" :day="day"
            :space="currentSpace" :paintColor="paintMode ? selectedColor : null" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { defineProps, onMounted, onUnmounted, ref, reactive, watch, computed, provide } from 'vue'
import { store } from '../store/store.js'
import DaySlot from './DaySlot.vue'

const props = defineProps({
  space: String,
  filter: {
    type: Array,
    default: () => []
  },
  selectedDate: Date,
})

const currentSpace = ref(props.space)
const startDate = ref(new Date())
const show = ref(true)
const key = ref(0)
const filterMode = ref(false)

// Color picker variables
const showColorPicker = ref(false)
const selectedColor = ref('#FFFFFF')
const selectedColorName = ref('Branco')
const paintMode = ref(false)
const selectedDate = ref(props.selectedDate)

provide('selectedColor', selectedColor)
provide('paintMode', paintMode)

// Event listener para fechar o dropdown ao clicar fora
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Se houver um filtro inicial, ative o modo de filtro
  if (props.filter && props.filter.length > 0) {
    filterMode.value = true
  }
})

// Remover listener ao desmontar o componente
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const colorPickerRef = ref(null)

function handleClickOutside(event) {
  if (colorPickerRef.value && !colorPickerRef.value.contains(event.target)) {
    showColorPicker.value = false
  }
}

const colorOptions = {
  'Branco': '#FFFFFF',
  'Verde': '#4CAF50',
  'Vermelho': '#F44336',
  'Azul': '#2196F3',
  'Amarelo': '#FFEB3B',
  'Roxo': '#9C27B0',
  'Cyan': '#00BCD4',
  'Magenta': '#E91E63'
}

const filterIndex = ref(0)
const appliedPicker = ref(true)
const days = computed(() => {
  const result = []
  // Verificar se estamos no modo filtro e se o array de filtro tem elementos
  if (filterMode.value && props.filter && props.filter.length > 0) {
    console.log("Usando filtro de datas:", props.filter)

    // Se não temos datas suficientes para mostrar, usamos apenas as disponíveis
    const maxIndex = Math.min(7, props.filter.length - filterIndex.value)

    // Usar apenas as datas do filtro
    for (let i = 0; i < maxIndex; i++) {
      result.push(props.filter[i + filterIndex.value])
    }
    return result
  }

  // Modo normal: mostrar semana a partir da data inicial
  let baseDate = new Date(startDate.value)
  if (!appliedPicker.value) {
    baseDate = selectedDate.value || new Date()
    appliedPicker.value = false
  }
  for (let i = 0; i < 7; i++) {
    const day = new Date(baseDate)
    day.setDate(baseDate.getDate() + i)
    result.push(day)
  }
  return result
})

// Observar mudanças no filtro para atualizar o calendário
watch(() => props.filter, (newFilter) => {
  if (newFilter && newFilter.length > 0) {
    // Ativar o modo filtro quando o filtro for aplicado
    filterMode.value = true
    filterIndex.value = 0  // Resetar para mostrar a partir do início do filtro
    refreshCalendar()
  } else {
    // Desativar o modo filtro quando o filtro for limpo
    filterMode.value = false
    // Voltar para a data atual
    startDate.value = new Date()
    refreshCalendar()
  }
}, { deep: true })



// Função para atualizar o calendário
function refreshCalendar() {
  show.value = false
  key.value += 1
  setTimeout(() => {
    show.value = true
  }, 10)
}

const timeSlots = [
  600, 630, 700, 730, 800, 830, 900, 930, 1000, 1030,
  1100, 1130, 1200, 1230, 1300, 1330, 1400, 1430, 1500, 1530,
  1600, 1630, 1700, 1730, 1800, 1830, 1900, 1930, 2000, 2030,
  2100, 2130, 2200, 2230
]

function formatTime(time) {
  const hour = Math.floor(time / 100)
  const minute = time % 100
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

function changeDay(n) {
  show.value = false

  if (filterMode.value && props.filter && props.filter.length > 0) {
    // No modo filtro, navegar entre as datas filtradas
    const newIndex = filterIndex.value + n
    if (newIndex >= 0 && newIndex <= Math.max(0, props.filter.length - 1)) {
      filterIndex.value = newIndex
    }
  } else {
    // No modo normal, navegar pela semana
    const newDate = new Date(startDate.value)
    newDate.setDate(newDate.getDate() + n)
    startDate.value = newDate
  }

  key.value += 1
  setTimeout(() => {
    show.value = true
  }, 10)
}
function istoday(date) {
  return date.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR')
}

function changeSpace(space) {
  show.value = false
  currentSpace.value = space
  key.value += 1
  setTimeout(() => {
    show.value = true
  }, 10)
}

function dayToString(date_obj) {
  return date_obj.toLocaleDateString('pt-BR').padStart(10, '0');
}

function getWeekDay(date_obj) {
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return weekDays[date_obj.getDay()];
}

// Color picker functions
function toggleColorPicker(event) {
  event.stopPropagation();
  showColorPicker.value = !showColorPicker.value;
}

function selectColor(color, name) {
  selectedColor.value = color;
  selectedColorName.value = name;
  paintMode.value = true;
  showColorPicker.value = false;
}

function exitPaintMode() {
  paintMode.value = false;
  showColorPicker.value = false;
}

// Métodos para lidar com eventos do componente de filtro
function handleFilterApply(filteredDates) {
  if (filteredDates && filteredDates.length > 0) {
    filterMode.value = true
    filterIndex.value = 0
    refreshCalendar()
  }
}

function handleFilterClear() {
  filterMode.value = false
  startDate.value = new Date()
  refreshCalendar()
}


watch(
  () => props.selectedDate,
  (newDate) => {
    console.log(newDate)
    appliedPicker.value = false
    selectedDate.value = newDate
    changeDay(0)
  }
)

defineExpose({
  changeDay,
  changeSpace,
  handleFilterApply,
  handleFilterClear
})
</script>

<style scoped lang="css">
.calendar-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.color-picker-dropdown {
  position: absolute;
  z-index: 1001;
}

.color-picker-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker-btn:hover {
  background-color: #e0e0e0;
}

.color-preview {
  width: 24px;
  height: 24px;
  border: 1px solid #aaa;
  border-radius: 3px;
}

.color-options {
  position: absolute;
  top: 100%;
  left: 0;
  width: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1002;
}

.color-option {
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.color-option:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.exit-option {
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: span 4;
  width: 100%;
  height: 30px;
  border-radius: 15px;
  margin-top: 4px;
  border-top: 1px solid #eee;
  padding-top: 4px;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: calc(100% - 60px);
  background-color: #f0f0f0;
  padding: 10px;
  color: black;
  text-align: center;
  margin-left: 60px;
  max-height: 10%;
  min-height: 10%;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0;
  padding: 0 5px;
}

.day-header .date {
  margin: 0;
  padding: 0;
  color: #4a90e2;
}

.day-header .weekday {
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  color: #666;
}

.today {
  font-weight: 900;
  color: #001024;
  font-size: 1.0rem;
}

.map-content {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: transparent;
  overflow: auto;
}

.horarios {
  display: grid;
  grid-template-rows: repeat(34, 1fr);
  grid-auto-rows: 1fr;
  min-height: 100%;
  width: 60px;
  padding-right: 8px;
  font-size: 12px;
  color: #666;
  text-align: right;
  line-height: 1;
}

.horarios div {
  display: flex;
  align-items: center;
  width: 60px;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: black;
  white-space: nowrap;
  justify-content: center;
  height: calc(0.5em * 2 + 21px);
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}


.days-container {
  display: flex;
  flex-grow: 1;
  width: calc(100% - 60px);
}

.ui-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: absolute;
  top: 0.5%;
  z-index: 1000;
  font-size: 2rem;
  color: #c8c8c8;
}

.ui-button:hover {
  color: #4a90e2;
  transition: color 0.3s ease;
}

.prev-btn {
  left: 4%;
}

.next-btn {
  right: 1%;
}

/* Indicador de filtro ativo */
.filter-indicator {
  position: absolute;
  top: 1.5%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #495057;
  display: flex;
  align-items: center;
  z-index: 1000;
}

.filter-indicator i {
  font-size: 14px;
  color: #dc3545;
}

.days-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: 100%;
}

.days-container>* {
  height: 100%;
}
</style>
