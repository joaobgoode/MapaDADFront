<template>
  <div>
    <div class="space-details" :class="{ 'expanded': details }" @click.stop="toggleDetails">
      <div class="space-details-content">
        <div class="basic-info">
          <div class="space-name" :class="{ 'inactive-name': !active }">{{ name }}</div>
          <div class="space-active">{{ active ? 'Ativo' : 'Inativo' }}</div>
        </div>

        <div v-if="details" class="expanded-info">
          <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value">{{ name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value" :class="active ? 'text-success' : 'text-danger'">
              {{ active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <div v-if='userCanEdit()' class="action-buttons">
            <div class="d-flex justify-content-between w-100">
              <button class="btn btn-sm" :class="active ? 'btn-outline-success' : 'btn-outline-danger'"
                @click.stop="toggleActive">
                <i class="bi me-1" :class="active ? 'bi-unlock-fill' : 'bi-lock-fill'"></i>
                {{ active ? 'Desativar' : 'Ativar' }}
              </button>
              <button class="btn btn-sm btn-outline-danger" @click.stop="deleteSpace">
                <i class="bi bi-trash-fill me-1"></i>
                Remover
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  nome: String,
  active: Boolean,
})

const emit = defineEmits(['toggleActive', 'deleteSpace'])

const name = ref(props.nome)
const active = ref(props.active)
const details = ref(false)

watch(
  () => props.active,
  (newValue) => {
    active.value = newValue
  }
)

function toggleDetails() {
  details.value = !details.value
}

function toggleActive() {
  active.value = !active.value
  const spaceInfo = {
    ativo: active.value,
    nome: props.nome,
  }
  emit('toggleActive', spaceInfo)
}

function deleteSpace() {
  const spaceInfo = {
    nome: props.nome,
  }
  emit('deleteSpace', spaceInfo)
}

function closeDetails(event) {
  if (details.value && !event.target.closest('.space-details')) {
    details.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDetails)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDetails)
})

function userCanEdit() {
  const userData = localStorage.getItem('userData')
  const userRole = JSON.parse(userData).role
  return userRole === 'superuser' || userRole === 'admin'
}

</script>

<style scoped>
.space-details {
  width: 100%;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.space-details:hover {
  background-color: #f1f3f5;
}

.space-details.expanded {
  height: auto;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.space-details-content {
  width: 100%;
}

.basic-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.space-name {
  font-weight: bold;
  font-size: 1rem;
}

.inactive-name {
  text-decoration: line-through;
}

.space-phone {
  color: #6c757d;
}

.expanded-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.info-row {
  margin-bottom: 8px;
  display: flex;
}

.info-label {
  width: 80px;
  font-weight: 600;
  color: #495057;
}

.info-value {
  flex: 1;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}
</style>
