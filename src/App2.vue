<script setup>
import SideBar from './components/SideBar.vue'
import { ref } from 'vue'
import CalendarioContainer from './components/CalendarioContainer.vue'

let currentEspaco = ref('Quadra 1')
let currentTipo = ref('Movel')

function setState(newState) {
  currentEspaco.value = newState.currentEspaco
  currentTipo.value = newState.currentTipo
  console.log('Espaco:', currentEspaco.value)
  console.log('Tipo:', currentTipo.value)
}

</script>

<template>
  <div class="layout">
    <SideBar :currentTipo="currentTipo" :currentEspaco="currentEspaco" @changeState="setState" />
    <main class="content">
      <CalendarioContainer tipo="Movel" espaco="Quadra 1" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Movel" espaco="Quadra 2" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Movel" espaco="Quadra 3" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Movel" espaco="Sala 1" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Movel" espaco="Sala 2" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Movel" espaco="Sala 3" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Fixo" espaco="Quadra 1" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Fixo" espaco="Quadra 2" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Fixo" espaco="Quadra 3" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Fixo" espaco="Sala 1" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Fixo" espaco="Sala 2" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Fixo" espaco="Sala 3" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Editar" espaco="Quadra 1" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Editar" espaco="Quadra 2" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Editar" espaco="Quadra 3" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Editar" espaco="Sala 1" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Editar" espaco="Sala 2" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
      <CalendarioContainer tipo="Editar" espaco="Sala 3" :currentTipo="currentTipo" :currentEspaco="currentEspaco" />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
}

.content {
  position: absolute;
  width: 88%;
  height: 100%;
  left: 12%;
  top: 0;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
