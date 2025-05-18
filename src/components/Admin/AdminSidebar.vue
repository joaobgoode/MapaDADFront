<template>
  <div class="sidebar">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Dashboard</h5>
      </div>
      <div class="card-body">
        <div class="stats-container">
          <div class="stat-item">
            <h6>Total de Usuários</h6>
            <div class="stat-value">{{ userCount }}</div>
          </div>
          <div class="stat-item">
            <h6>Total de Espaços</h6>
            <div class="stat-value">{{ spaceCount }}</div>
          </div>
        </div>

        <div class="menu-container mt-4">
          <ul class="nav flex-column">
            <li class="nav-item">
              <a href="#" class="nav-link" :class="{ active: currentView == 'users' }"
                @click.prevent="$emit('switchView', 'users')">
                <i class="bi bi-people-fill me-2"></i>Gerenciar Usuários
              </a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link" :class="{ active: currentView == 'spaces' }"
                @click.prevent="$emit('switchView', 'spaces')">
                <i class="bi bi-grid-1x2-fill me-2"></i>Gerenciar Espaços
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  userCount: {
    type: Number,
    default: 0
  },
  spaceCount: {
    type: Number,
    default: 0
  },
  currentView: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['switchView']);
</script>

<style scoped>
.sidebar {
  width: 20%;
  padding-right: 15px;
  flex-shrink: 0;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background-color: #0d6efd !important;
  color: white;
  font-weight: bold;
  border-bottom: none;
  padding: 15px;
}

.card-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #0d6efd;
}

.menu-container .nav-link {
  border-radius: 5px;
  margin-bottom: 5px;
  color: #495057;
  transition: all 0.2s ease;
}

.menu-container .nav-link:hover,
.menu-container .nav-link.active {
  background-color: #e9ecef;
  color: #0d6efd;
  font-weight: 500;
}

.menu-container .nav-link i {
  margin-right: 8px;
}


@media (max-width: 992px) {
  .sidebar {
    width: 100%;
    padding: 0;
    margin-bottom: 20px;
  }

  .sidebar .card {
    height: auto;
  }
}
</style>
