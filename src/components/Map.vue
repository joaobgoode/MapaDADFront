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
</style>
