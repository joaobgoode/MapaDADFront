<template>
  <button class="ui-button prev-btn" @click="changeDay(-7)">
    <i class="bi bi-caret-left-square"></i>
  </button>
  <button class="ui-button next-btn" @click="changeDay(7)">
    <i class="bi bi-caret-right-square"></i>
  </button>
  <div class="content">
    <div class="day-headers">
      <div v-for="(day, index) in days" :key="`header-${index}`" class="day-header">
        <p class="date">{{ dayToString(day) }}</p>
        <p class="weekday">{{ getWeekDay(day) }}</p>
      </div>
    </div>
    <div class="map-content">
      <div class="horarios">
        <p v-for="time in timeSlots" :key="`time-${time}`">
          {{ formatTime(time) }}
        </p>
      </div>
      <div class="days-container">
        <DaySlot v-if="show" v-for="(day, index) in days" :key="`${currentSpace}-${key}-${index}`" :day="day"
          :space="currentSpace" />
      </div>
    </div>
  </div>
</template>
<script setup lang="js">
import { defineProps, onMounted, ref, reactive, watch, computed } from 'vue'
import { store } from '../store/store.js'
import DaySlot from './DaySlot.vue'
const props = defineProps({
  space: String,
})
const currentSpace = ref(props.space)
const startDate = ref(new Date())
const show = ref(true)
const key = ref(0)
const days = computed(() => {
  const result = []
  const baseDate = new Date(startDate.value)
  for (let i = 0; i < 7; i++) {
    const day = new Date(baseDate)
    day.setDate(baseDate.getDate() + i)
    result.push(day)
  }
  return result
})
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
  const newDate = new Date(startDate.value)
  newDate.setDate(newDate.getDate() + n)
  startDate.value = newDate
  key.value += 1
  show.value = true
}
function changeSpace(space) {
  show.value = false
  currentSpace.value = space
  key.value += 1
  show.value = true
}
function dayToString(date_obj) {
  return date_obj.toLocaleDateString('pt-BR').padStart(10, '0');
}
// Nova função para obter o nome do dia da semana
function getWeekDay(date_obj) {
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return weekDays[date_obj.getDay()];
}
defineExpose({
  changeDay,
  changeSpace,
})
</script>
<style scoped lang="css">
.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.day-headers {
  display: flex;
  width: calc(100% - 60px);
  background-color: #f0f0f0;
  padding: 10px;
  color: black;
  text-align: center;
  justify-content: space-around;
  margin-left: 60px;
  /* Corresponde à largura da coluna de horários */
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 5px;
  min-width: 80px;
}

.day-header .date {
  margin: 0;
  padding: 0;
}

.day-header .weekday {
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  color: #666;
}

.map-content {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: transparent;
  overflow: auto;
}

.horarios {
  display: flex;
  flex-direction: column;
  width: 60px;
  flex-shrink: 0;
}

.horarios p {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  padding: 0;
  margin: 0;
  min-height: calc(0.5em * 2 + 20px);
  font-size: 1rem;
  color: black;
  white-space: nowrap;
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
  top: 4%;
  z-index: 1000;
  font-size: 2rem;
  color: #c8c8c8;
}

.ui-button:hover {
  color: #4a90e2;
  transition: color 0.3s ease;
}

.prev-btn {
  left: 6%;
}

.next-btn {
  right: 2%;
}

/* Estilos específicos para o conteúdo do DaySlot, se necessário */
</style>
