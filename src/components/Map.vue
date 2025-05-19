<script setup>
import OccupationMap from './OccupationMap.vue'
import AppHeader from './AppHeader.vue'
import { ref, watch, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/store.js'
import WebSocketService from "../plugins/websocket.js"
import api from '../services/api.js'

const router = useRouter()


//====    State Variables    ====/

const options = ref([])
const selectedOption = ref('')
const calendar = ref(null)
const filter = ref([])
const selectedDate = ref(new Date())

const notifications = ref([])
let notificationIdCounter = 0

//====    WebSocket    ====/

function handleWebSocketMessage(message) {
  if (message.type === 'colorUpdate') {
    if (calendar.value && calendar.value.updateSlotColor) {
      calendar.value.updateSlotColor(message.data);
    }
  }
  else if (message.type === 'bulkUpdate') {
    if (calendar.value && calendar.value.updateMultipleSlots) {
      calendar.value.updateMultipleSlots(message.data);
    }
    let changedCount = 0
    for (const horario of message.data) {
      const cell = store.getRegisteredTextArea(horario.space, horario.date, horario.hour)
      if (cell && cell.selected) {
        changedCount += 1
      }
    }
    if (changedCount > 0) {
      createNotification(changedCount)
    }
  }
  else if (message.type === 'espacoDelete') {
    toReload()
  }
  else if (message.type === 'espacoUpdate') {
    toReload()
  }
  else if (message.type === 'espacoCreate') {
    toReload()
  }
  else if (message.type === 'userDelete' || message.type === 'userBlocked') {
    const id = message.data.id
    const userData = localStorage.getItem('userData')
    const userId = JSON.parse(userData).id
    if (id == userId) {
      handleLogout()
    }
  }
}


//====    Mount / UnMount    ====/

onBeforeMount(async () => {
  try {
    const response = await api.get("/api/spaces/active")
    options.value = response.data.map(espaco => espaco.name).sort()
  } catch (error) {
    console.error("Erro ao buscar espaços ativos:", error)
  }
})

onMounted(() => {
  const wsUrl = import.meta.env.VITE_WS_URL;
  WebSocketService.connect(wsUrl);

  if (WebSocketService.socket) {
    WebSocketService.setMessageHandler(handleWebSocketMessage);
  }
  wasReloaded()
})

onBeforeUnmount(() => {
  WebSocketService.disconnect();
})

//====    Space Change    ====//

function handleSpaceChange(option) {
  if (calendar.value) {
    calendar.value.changeSpace(option)
  }
}

//====    Logout    ====//

function handleLogout() {
  store.reset()
  localStorage.removeItem('token')
  localStorage.removeItem('userData');
  router.push("/")
}

//====    Filter    ====//

function handleApplyFilter(dates) {
  console.log('Filtro aplicado:', dates)
  if (calendar.value && calendar.value.handleFilterApply) {
    calendar.value.handleFilterApply(dates)
  }
}

function handleClearFilter() {
  console.log('Filtro limpo')
  if (calendar.value && calendar.value.handleFilterClear) {
    calendar.value.handleFilterClear()
  }
}

watch(() => filter.value, (newFilter) => {
  console.log('Filter changed:', newFilter)
}, { deep: true })

function toReload() {
  localStorage.setItem('reload', 'selectedOption')
  location.reload()
}

const reloaded = ref(false)

function wasReloaded() {
  const reload = localStorage.getItem('reload')
  if (reload) {
    localStorage.removeItem('reload')
    reloaded.value = true
    return
  }
  reloaded.value = false
  return
}

function createNotification(count) {
  const id = notificationIdCounter++
  notifications.value.push({
    id,
    count
  })

  // setTimeout(() => {
  //   removeNotification(id)
  // }, 10000)
}

function removeNotification(id) {
  const index = notifications.value.findIndex(notification => notification.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

</script>
<template>
  <AppHeader v-model="selectedOption" v-model:filter="filter" v-model:modelDate="selectedDate" :options="options"
    @space-change="handleSpaceChange" @apply-filter="handleApplyFilter" @clear-filter="handleClearFilter"
    @logout="handleLogout" />
  <div v-if="selectedOption" class="map-content">
    <OccupationMap ref="calendar" :space="selectedOption || 'Sem Quadra Cadastrada'" :filter="filter"
      :selectedDate="selectedDate" />
  </div>
  <div v-if="reloaded" class="bg-warning reload-warning" @click="wasReloaded()">
    <p class="fw-bold">A janela Foi recarregada devido a mudanças no sistema.</p>
    <p class="fw-bold">Perdão pelo inconveniente.</p>
    <p class="fw-normal">Clique para fechar!</p>
  </div>

  <div class="notifications-container">
    <div v-for="notification in notifications" :key="notification.id" class="notification-item"
      @click="removeNotification(notification.id)">
      <div class="notification-icon">
        <span class="exclamation">!</span>
      </div>
      <div class="notification-text">
        {{ notification.count }} {{ notification.count === 1 ? 'Horário selecionado mudou' :
          'Horários selecionados mudaram' }}
      </div>
    </div>
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

.reload-warning {
  position: absolute;
  right: 5px;
  bottom: 5px;
  height: 140px;
  width: 100%;
  max-width: 210px;
  text-align: center;
  overflow-wrap: normal;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 10px;
}

.reload-warning p {
  margin: 0;
  padding: 10px;
}

.notifications-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.notification-item {
  display: flex;
  align-items: center;
  background-color: rgba(156, 39, 176, 0.85);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s;
}

.notification-item:hover {
  background-color: rgba(156, 39, 176, 1);
  transform: translateY(-2px);
}

.notification-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: white;
  margin-right: 12px;
}

.exclamation {
  color: rgba(156, 39, 176, 1);
  font-weight: bold;
  font-size: 16px;
}

.notification-text {
  font-size: 14px;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
