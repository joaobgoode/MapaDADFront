<template>
  <div class="day-content">
    <div v-if="loading" class="loading-indicator">
      Carregando horários...
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchTimeSlotData" class="retry-button">Tentar novamente</button>
    </div>
    <div v-else class="time-content">
      <TimeSlot v-for="time in timeSlots" :key="time" :initial-text="getInitialText(time)" :space="props.space"
        :initialColor="getInitialColor(time)" :day="day" :time="time" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, onBeforeMount, ref, reactive, watch } from 'vue'
import { store } from '../store/store.js'
import TimeSlot from './TimeSlot.vue'
import axios from 'axios'

const props = defineProps({
  day: Date,
  space: String,
})

const processedData = ref({})
const processedDataColor = ref({})
const loading = ref(true)
const error = ref(null)
const day = ref(props.day)
const displayDate = ref(dayToString(props.day))

// Array de todos os horários possíveis de 30 em 30 minutos
const timeSlots = [
  600, 630, 700, 730, 800, 830, 900, 930, 1000, 1030,
  1100, 1130, 1200, 1230, 1300, 1330, 1400, 1430, 1500, 1530,
  1600, 1630, 1700, 1730, 1800, 1830, 1900, 1930, 2000, 2030,
  2100, 2130, 2200, 2230
]

function dayToString(date_obj) {
  return date_obj.toLocaleDateString('pt-BR').padStart(10, '0')
}

function getInitialText(time) {
  return processedData.value[time] || ''
}

function getInitialColor(time) {
  return processedDataColor.value[time] || 'white'
}



watch(day, () => {
  displayDate.value = dayToString(day.value)
  fetchTimeSlotData() // Refetch data when day changes
})

async function fetchTimeSlotData() {
  loading.value = true
  error.value = null

  try {
    const dateStr = day.value.toISOString().split('T')[0]
    const space = props.space

    const response = await axios.get(`http://localhost:3000/api/horarios`, {
      params: {
        date: dateStr,
        space: space
      }
    })

    // Process the array into an object with time keys
    const data = {}
    const colors = {}

    if (Array.isArray(response.data)) {
      response.data.forEach(booking => {
        if (booking.hour && booking.client) {
          data[booking.hour] = booking.client
        }
        if (booking.hour && booking.color) {
          colors[booking.hour] = booking.color
        }
      })
    }

    // Store processed data
    processedData.value = data
    processedDataColor.value = colors
    console.log('Processed data:', day, processedData.value)
  } catch (err) {
    console.error('Error fetching time slot data:', err)
    error.value = 'Falha ao carregar dados. Tente novamente mais tarde.'
  } finally {
    loading.value = false
  }
}

onBeforeMount(() => {
  fetchTimeSlotData()
})
</script>

<style scoped>
.time-content {
  background-color: transparent;
  width: 100%;
}

.day-content {
  position: relative;
  left: 0;
  color: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
}

TimeSlot {
  left: 0;
  width: 13%;
  height: 100%;
}

.day-header {
  position: sticky;
  top: 0;
  background-color: white;
  text-align: center;
  color: black;
  width: 100%;
  height: 5%;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 20px;
  color: #d32f2f;
}

.retry-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #e0e0e0;
}
</style>
