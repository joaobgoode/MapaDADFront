<template>
  <div class="calendar-container">


    <div class="content">
      <div class="day-headers">
        <div v-for="(day, index) in displayedDays" :key="`header-${index}`" class="day-header" :data-day="day"
          @click="clickDay">
          <p class="date" :class="istoday(day) ? 'today' : ''">{{ dayToString(day) }}</p>
          <p class="weekday">{{ getWeekDay(day) }}</p>
        </div>
      </div>
      <div class="map-content">
        <div class="horarios">
          <div v-for="time in timeSlots" :key="`time-${time}`" :data-time="time" @click="clickRow">
            {{ formatTime(time) }}
          </div>
        </div>
        <div class="days-container">
          <DaySlot v-if="show" v-for="(day, index) in displayedDays" :key="`${currentSpace}-${key}-${index}`" :day="day"
            :space="currentSpace" :paintColor="paintMode ? selectedColor : null" />
        </div>
      </div>
    </div>
    <ColorPicker :style="{ top: '1.5%', left: '-1%' }" v-model="paintMode" v-model:selectedColor="selectedColor"
      v-model:selectedColorName="selectedColorName" :initialColor="selectedColor" />

    <button class="ui-button prev-btn" @click="changeDay(-visibleDays)">
      <i class="bi bi-caret-left-square"></i>
    </button>

    <button class="ui-button next-btn" @click="changeDay(visibleDays)">
      <i class="bi bi-caret-right-square"></i>
    </button>
  </div>
</template>

<script setup lang="js">
import { onMounted, onBeforeUnmount, ref, watch, computed, provide, onUnmounted } from 'vue'
import { store } from '../store/store.js'
import DaySlot from './DaySlot.vue'
import ColorPicker from './ColorPicker.vue'

//====    Props    ====//

const props = defineProps({
  space: String,
  filter: {
    type: Array,
    default: () => []
  },
  selectedDate: Date,
})

//====    State Variables    ====//

const currentSpace = ref(props.space)
const startDate = ref(new Date())
const show = ref(true)
const key = ref(0)
const filterMode = ref(false)

const selectedColor = ref('#FFFFFF')
const selectedColorName = ref('Branco')
const paintMode = ref(false)
const appliedDate = ref(props.selectedDate)

provide('selectedColor', selectedColor)
provide('paintMode', paintMode)

const filterIndex = ref(0)
const appliedPicker = ref(true)

// Responsividade
const visibleDays = ref(7)
const windowWidth = ref(window.innerWidth)

const timeSlots = [
  600, 630, 700, 730, 800, 830, 900, 930, 1000, 1030,
  1100, 1130, 1200, 1230, 1300, 1330, 1400, 1430, 1500, 1530,
  1600, 1630, 1700, 1730, 1800, 1830, 1900, 1930, 2000, 2030,
  2100, 2130, 2200, 2230
]

//====    Mount / UnMount    ====//

onMounted(() => {
  if (props.filter && props.filter.length > 0) {
    filterMode.value = true
  }
  window.addEventListener('keydown', handleKey)
  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('resize', handleResize)
})

//==== Responsividade ====//

function handleResize() {
  windowWidth.value = window.innerWidth

  if (windowWidth.value < 480) {
    visibleDays.value = 1
  } else if (windowWidth.value < 768) {
    visibleDays.value = 2
  } else if (windowWidth.value < 992) {
    visibleDays.value = 3
  } else if (windowWidth.value < 1200) {
    visibleDays.value = 5
  } else {
    visibleDays.value = 7
  }

  refreshCalendar()
}

//==== Date Calculation ====//

const days = computed(() => {
  const result = []
  if (filterMode.value && props.filter && props.filter.length > 0) {
    console.log("Usando filtro de datas:", props.filter)

    const maxIndex = Math.min(visibleDays.value, props.filter.length - filterIndex.value)

    for (let i = 0; i < maxIndex; i++) {
      result.push(props.filter[i + filterIndex.value])
    }
    return result
  }

  let baseDate = new Date(startDate.value)
  if (!appliedPicker.value) {
    baseDate = appliedDate.value || new Date()
    appliedPicker.value = true
  }
  for (let i = 0; i < visibleDays.value; i++) {
    const day = new Date(baseDate)
    day.setDate(baseDate.getDate() + i)
    result.push(day)
  }
  return result
})

const displayedDays = computed(() => {
  return days.value.slice(0, visibleDays.value)
})

//====    Filter    ====//

watch(() => props.filter, (newFilter) => {
  if (newFilter && newFilter.length > 0) {
    filterMode.value = true
    filterIndex.value = 0
    refreshCalendar()
  } else {
    filterMode.value = false
    startDate.value = new Date()
    refreshCalendar()
    console.log("Filtro limpo")
  }
}, { deep: true })

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

//====    Refresh Calendar    ====//

function refreshCalendar() {
  show.value = false
  key.value += 1
  setTimeout(() => {
    show.value = true
  }, 10)
}

//====    Display Functions    ====//

function formatTime(time) {
  const hour = Math.floor(time / 100)
  const minute = time % 100
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

function changeDay(n) {
  show.value = false

  if (filterMode.value && props.filter && props.filter.length > 0) {
    const newIndex = filterIndex.value + n
    if (newIndex >= 0 && newIndex <= Math.max(0, props.filter.length - 1)) {
      filterIndex.value = newIndex
    }
  } else {
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

function dayToString(date_obj) {
  return date_obj.toLocaleDateString('pt-BR').padStart(10, '0');
}

function getWeekDay(date_obj) {
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return weekDays[date_obj.getDay()];
}

//====    Space Change    ====//

function changeSpace(space) {
  show.value = false
  currentSpace.value = space
  key.value += 1
  setTimeout(() => {
    show.value = true
  }, 10)
}

//====    Date Picker    ====//
function getDaysBetween(date1, date2) {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);

  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);

  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

watch(
  () => store.pickerDate.value,
  (newDate) => {
    if (filterMode.value) {
      return
    }
    const diff = getDaysBetween(appliedDate.value, newDate)
    appliedDate.value = newDate
    changeDay(diff)
  }
)

//====    Select Row/Collumn    ====//


function clickRow(event) {
  if (paintMode.value) {
    return
  }
  const time = event.target.dataset.time
  if (event.ctrlKey) {
    for (let day of displayedDays.value) {
      store.selectTextarea(currentSpace.value, day, time, false)
    }
    return
  }
  for (let day of displayedDays.value) {
    store.selectTextarea(currentSpace.value, day, time)
    console.log(day)
  }
}

function clickDay(event) {
  if (paintMode.value) {
    return
  }
  const selected_day = event.currentTarget.dataset.day
  const day = new Date(selected_day)
  if (event.ctrlKey) {
    for (let time of timeSlots) {
      store.selectTextarea(currentSpace.value, day, time, false)
    }
    return
  }
  for (let time of timeSlots) {
    store.selectTextarea(currentSpace.value, day, time)
  }
}

//====    Change Day with Arrow Keys    ====//

function handleKey(event) {
  const activeElement = document.activeElement;
  const isEditableElement =
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable;
  if (!isEditableElement) {
    if (event.key === 'ArrowLeft') {
      changeDay(-visibleDays.value)
    } else if (event.key === 'ArrowRight') {
      changeDay(visibleDays.value)
    }
  }
}

//====    Expose Methods    ====//

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

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  width: calc(100% - 60px);
  background-color: #f0f0f0;
  padding: 10px;
  color: black;
  text-align: center;
  margin-left: 60px;
  max-height: 10%;
  min-height: 10%;
  position: relative;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0;
  padding: 0 5px;
  border: 2px solid #f0f0f0;
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

.day-header:hover {
  border: 2px solid #3253fa;
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

.horarios div:hover {
  border: 2px solid #3253fa;
}

.days-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  width: 100%;
}

.ui-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: absolute;
  top: 5%;
  transform: translateY(-50%);
  font-size: 2rem;
  color: #c8c8c8;
}

.ui-button:hover {
  color: #4a90e2;
  transition: color 0.3s ease;
}

.prev-btn {
  left: 60px;
}

.next-btn {
  right: 0;
}

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

.days-container>* {
  height: 100%;
}

@media (max-width: 1200px) {
  .day-header .weekday {
    font-size: 0.7rem;
  }
}

@media (max-width: 992px) {
  .day-header .date {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .day-header .weekday {
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .day-headers {
    width: calc(100% - 50px);
    margin-left: 50px;
  }

  .horarios {
    width: 50px;
  }

  .horarios div {
    width: 50px;
    font-size: 0.7rem;
  }
}
</style>
