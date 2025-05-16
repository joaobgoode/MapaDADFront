<script setup>
import OccupationMap from './OccupationMap.vue'
import AppHeader from './AppHeader.vue'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/store.js'
import WebSocketService from "../plugins/websocket.js"

const router = useRouter()


//====    State Variables    ====/

const options = ref(['Quadra 1', 'Quadra 2', 'Quadra 3', "Sala 1", "Sala 2"])
const selectedOption = ref(options.value[0])
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
}


//====    Mount / UnMount    ====/

onMounted(() => {
  const wsUrl = 'ws://localhost:3000';
  WebSocketService.connect(wsUrl);

  if (WebSocketService.socket) {
    WebSocketService.setMessageHandler(handleWebSocketMessage);
  }
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
  router.push('/')
  store.reset()
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



</script>
<template>
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
