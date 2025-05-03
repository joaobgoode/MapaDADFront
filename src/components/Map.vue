<script setup>
import OccupationMap from './OccupationMap.vue'
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/store.js'

const router = useRouter()
const options = ref(['Quadra 1', 'Quadra 2', 'Quadra 3', "Sala 1", "Sala 2"])
const selectedOption = ref(options.value[0])
const calendar = ref(null)

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
</script>

<template>
  <header class="bg-primary text-white py-3 border-bottom w-100"
    style="position: fixed; top: 0; left: 0; z-index: 1000;">
    <div class="d-flex justify-content-between align-items-center px-3 w-100">
      <div class="d-flex align-items-center">
        <img class="unifor-logo" src="../assets/imagens/unifor-online.png" alt="Logotipo da Unifor">
        <span class="me-3 fw-bold fs-5">Mapa de Ocupação</span>
        <div class="dropdown">
          <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            {{ selectedOption }}
          </button>
          <ul class="dropdown-menu">
            <!-- Loop através do array de opções -->
            <li v-for="option in options" :key="option" @click.prevent="chooseOption(option)">
              <a class="dropdown-item" href="#">{{ option }}</a>
            </li>
          </ul>
        </div>
      </div>
      <ul class="nav nav-pills ms-auto">
        <li class="nav-item sair-btn"><a href="#" class="nav-link text-white" @click="sair">Sair</a></li>
      </ul>
    </div>
  </header>
  <div class="map-content">
    <OccupationMap ref="calendar" :space="selectedOption || 'Sem Quadra Cadastrada'" />
  </div>
</template>

<style scoped>
header {
  max-height: 10%;
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
  position: relative;
  left: 0;
  height: 30px;
  object-fit: contain;
  padding-right: 7vh;
}

.sair-btn {
  margin-left: auto;
  padding-right: 20px;
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
