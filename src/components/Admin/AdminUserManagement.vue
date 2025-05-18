<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Gerenciamento de Usuários</h5>
      <div class="buttons d-flex align-items-center">
        <input type="text" class="search-bar form-control form-control-sm me-1" placeholder="Pesquisar..."
          v-model="searchQuery" @keydown.enter="applyFilters()" />
        <button class="btn btn-sm me-1" :class="searchQuery ? 'btn-primary' : 'btn-secondary'" @click="applyFilters()"
          title="Aplicar busca">
          <i class="bi bi-search"></i>
        </button>
        <button class="btn btn-sm me-1" @click="toggleFilterUnlocked"
          :class="filterUnlocked ? 'btn-primary' : 'btn-secondary'" title="Mostrar usuários desbloqueados">
          <i class="bi bi-unlock-fill"></i>
        </button>
        <button class="btn btn-sm me-1" @click="toggleFilterLocked"
          :class="filterLocked ? 'btn-primary' : 'btn-secondary'" title="Mostrar usuários bloqueados">
          <i class="bi bi-lock-fill"></i>
        </button>
        <button class="btn btn-sm btn-secondary me-1" @click="applyFilters()" title="Aplicar todos os filtros">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
        <button class="btn btn-sm btn-secondary me-1" @click="resetFilters()" title="Limpar todos os filtros">
          <i class="bi bi-x-circle"></i> </button>
        <button class="btn btn-sm btn-primary" @click="$emit('showCreateUserModal')" title="Criar novo usuário">
          <i class="bi bi-plus-circle me-1"></i>Novo Usuário
        </button>
      </div>
    </div>
    <div class="card-body">
      <div class="user-list">
        <div v-if="!displayedUsers || displayedUsers.length === 0" class="text-center py-5">
          <i class="bi bi-exclamation-circle fs-1 text-muted"></i>
          <p class="mt-3">{{ allUsers && allUsers.length > 0 ? 'Nenhum usuário encontrado com os filtros atuais.' :
            'Nenhum usuário encontrado.' }}</p>
        </div>
        <div v-else>
          <UserDetails v-for="user in displayedUsers" :key="`${user._id}`" :nome="user.nome" :usuario="user.usuario"
            :email="user.email" :telefone="user.telefone" :role="user.role" :bloqueado="user.bloqueado" :id="user._id"
            @deleteUser="$emit('deleteUser', { id: user._id, nome: user.nome })"
            @blockUser="$emit('blockUser', { id: user._id })" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import UserDetails from './UserDetails.vue';

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['showCreateUserModal', 'deleteUser', 'blockUser']);
const allUsers = ref([...props.users]);
const displayedUsers = ref([]);
const filterLocked = ref(true);
const filterUnlocked = ref(true);
const searchQuery = ref('');

watch(
  () => props.users,
  (newUsers) => {
    allUsers.value = [...newUsers];
    applyFilters();
    console.log("bbb")
  },
  { deep: true, immediate: true }
);

watch([filterLocked, filterUnlocked, searchQuery], () => {
  applyFilters();
}, { deep: true });

function toggleFilterLocked() {
  filterLocked.value = !filterLocked.value;
}

function toggleFilterUnlocked() {
  filterUnlocked.value = !filterUnlocked.value;
}

function shouldShowUser(user) {
  const searchMatch = !searchQuery.value ||
    user.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (user.usuario && user.usuario.toLowerCase().includes(searchQuery.value.toLowerCase()));

  const blockMatch = (filterLocked.value && user.bloqueado) || (filterUnlocked.value && !user.bloqueado);

  return searchMatch && blockMatch;
}

function applyFilters() {
  displayedUsers.value = allUsers.value.filter(user => shouldShowUser(user));
}

function resetFilters() {
  filterLocked.value = true;
  filterUnlocked.value = true;
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
  padding: 15px;
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
}
</style>
