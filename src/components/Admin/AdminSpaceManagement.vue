<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Gerenciamento de Espaços</h5>
      <div class="buttons d-flex align-items-center">
        <input type="text" class="search-bar form-control form-control-sm me-1" placeholder="Pesquisar..."
          v-model="searchQuery" @keydown.enter="applyFilters()" />
        <button class="btn btn-sm me-1" :class="searchQuery ? 'btn-primary' : 'btn-secondary'" @click="applyFilters()"
          title="Aplicar busca">
          <i class="bi bi-search"></i>
        </button>
        <button class="btn btn-sm me-1" @click="toggleFilterActive"
          :class="filterActive ? 'btn-primary' : 'btn-secondary'" title="Mostrar espaços ativos">
          <i class="bi bi-unlock-fill"></i>
        </button>
        <button class="btn btn-sm me-1" @click="toggleFilterInactive"
          :class="filterInactive ? 'btn-primary' : 'btn-secondary'" title="Mostrar espaços inativos">
          <i class="bi bi-lock-fill"></i>
        </button>
        <button class="btn btn-sm btn-secondary me-1" @click="applyFilters()" title="Aplicar todos os filtros">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
        <button class="btn btn-sm btn-secondary me-1" @click="resetFilters()" title="Limpar todos os filtros">
          <i class="bi bi-x-circle"></i>
        </button>
        <button class="btn btn-sm btn-primary" @click="$emit('showCreateSpaceModal')" title="Criar novo espaço">
          <i class="bi bi-plus-circle me-1"></i>Novo Espaço
        </button>
      </div>
    </div>
    <div class="card-body">
      <div class="space-list">
        <div v-if="!displayedSpaces || displayedSpaces.length === 0" class="text-center py-5">
          <i class="bi bi-exclamation-circle fs-1 text-muted"></i>
          <p class="mt-3">
            {{ allSpaces && allSpaces.length > 0 ? 'Nenhum espaço encontrado com os filtros atuais.' :
              'Nenhum espaço encontrado.' }}
          </p>
        </div>
        <div v-else>
          <SpaceDetails v-for="space in displayedSpaces" :key="space._id" :nome="space.name" :active="space.active"
            @deleteSpace="$emit('deleteSpace', { nome: space.name })"
            @toggleActive="$emit('toggleActive', { nome: space.name })" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import SpaceDetails from './SpaceDetails.vue';

const props = defineProps({
  spaces: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['showCreateSpaceModal', 'deleteSpace', 'toggleActive']);
const allSpaces = ref([...props.spaces]);
const displayedSpaces = ref([]);
const filterActive = ref(true);
const filterInactive = ref(true);
const searchQuery = ref('');

watch(
  () => props.spaces,
  (newSpaces) => {
    allSpaces.value = [...newSpaces];
    applyFilters();
  },
  { deep: true, immediate: true }
);

watch([filterActive, filterInactive, searchQuery], () => {
  applyFilters();
}, { deep: true });

function toggleFilterInactive() {
  filterInactive.value = !filterInactive.value;
}

function toggleFilterActive() {
  filterActive.value = !filterActive.value;
}

function shouldShowSpace(space) {
  const searchMatch = !searchQuery.value ||
    space.name.toLowerCase().includes(searchQuery.value.toLowerCase());

  const statusMatch = (filterActive.value && space.active) || (filterInactive.value && !space.active);

  return searchMatch && statusMatch;
}

function applyFilters() {
  displayedSpaces.value = allSpaces.value.filter(space => shouldShowSpace(space));
}

function resetFilters() {
  filterActive.value = true;
  filterInactive.value = true;
  searchQuery.value = '';
  applyFilters();
}

onMounted(() => {
  applyFilters();
});
</script>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background-color: #f8f9fa;
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
}

.card-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

.space-list {
  height: 100%;
}

.buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.search-bar {
  width: 150px;
  flex-grow: 0;
}

@media (max-width: 992px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .buttons {
    margin-top: 10px;
    justify-content: flex-start;
    width: 100%;
  }

  .search-bar {
    width: 100%;
  }

  .space-list {
    max-height: calc(100vh - 450px);
  }
}
</style>
