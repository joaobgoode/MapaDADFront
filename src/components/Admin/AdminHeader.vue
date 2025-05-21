<template>
  <header class="bg-primary text-white border-bottom w-100"
    style="position: fixed; top: 0; left: 0; z-index: 1000; height: 70px;">
    <div class="d-flex justify-content-between align-items-center px-3 w-100 h-100">
      <div class="d-flex align-items-center gap-3 h-100">
        <img class="unifor-logo" src="../../../public/unifor-online.png" alt="Logotipo da Unifor">
        <span class="fw-bold fs-5 d-none d-md-block">Admin</span>
        <span class="fw-bold fs-5 d-md-none">Admin</span>
        <ul class="nav nav-pills m-0 h-100 d-flex align-items-center">
          <li class="nav-item sair-btn">
            <a href="#" class="nav-link text-white d-flex align-items-center h-100" @click="goToMap">Mapa</a>
          </li>
        </ul>

      </div>

      <div class="d-flex align-items-center h-100">
        <ul class="nav nav-pills m-0 h-100 d-flex align-items-center">
          <li class="nav-item sair-btn">
            <a href="#" class="nav-link text-white d-flex align-items-center h-100" @click="handleLogout">Sair</a>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { defineEmits } from 'vue'


const emit = defineEmits(['logout', 'goToMap'])

function handleLogout() {
  emit('logout');
}

function goToMap() {
  emit('goToMap')
}

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
  font-size: 1rem;
  font-weight: bold;
  height: 100%;
  display: flex;
  align-items: center;
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
