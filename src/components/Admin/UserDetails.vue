<template>
  <div>
    <div class="user-details" :class="{ 'expanded': details }" @click.stop="toggleDetails">
      <div class="user-details-content">
        <div class="basic-info">
          <div class="user-name" :class="{ 'blocked-name': blocked }">{{ name }}</div>
          <div class="user-phone">{{ phone }}</div>
        </div>

        <div v-if="details" class="expanded-info">
          <div class="info-row">
            <span class="info-label">Usuário:</span>
            <span class="info-value">{{ user }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Cargo:</span>
            <span class="info-value">{{ role }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value" :class="blocked ? 'text-danger' : 'text-success'">
              {{ blocked ? 'Bloqueado' : 'Ativo' }}
            </span>
          </div>

          <div v-if="userCanEdit(role)" class="action-buttons">
            <div class="d-flex justify-content-between w-100">
              <button class="btn btn-sm" :class="blocked ? 'btn-outline-success' : 'btn-outline-danger'"
                @click.stop="toggleBlock">
                <i class="bi me-1" :class="blocked ? 'bi-unlock-fill' : 'bi-lock-fill'"></i>
                {{ blocked ? 'Desbloquear' : 'Bloquear' }}
              </button>
              <button class="btn btn-sm btn-outline-danger" @click.stop="deleteUser">
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
  usuario: String,
  email: String,
  telefone: String,
  role: String,
  bloqueado: Boolean,
  id: String,
})

watch(
  () => props.bloqueado,
  (newValue) => {
    console.log("aaa")
    blocked.value = newValue
  }
)

const emit = defineEmits(['blockUser', 'deleteUser'])

const name = ref(props.nome)
const user = ref(props.usuario)
const email = ref(props.email)
const phone = ref(props.telefone)
const role = ref(props.role)
const blocked = ref(props.bloqueado)
const details = ref(false)

function toggleDetails() {
  details.value = !details.value
}

function toggleBlock() {
  blocked.value = !blocked.value
  const userInfo = {
    bloqueado: blocked.value,
    nome: props.nome,
    id: props.id,
  }
  emit('blockUser', userInfo)
}

function deleteUser() {
  const userInfo = {
    nome: props.nome,
    role: props.role,
    id: props.id,
  }
  emit('deleteUser', userInfo)
}

function closeDetails(event) {
  if (details.value && !event.target.closest('.user-details')) {
    details.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDetails)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDetails)
})

function userCanEdit(role) {
  if (role == 'superuser') {
    return false
  }
  const userData = localStorage.getItem('userData')
  const userRole = JSON.parse(userData).role
  if (userRole == 'superuser') {
    return true
  }
  if (role == 'admin') {
    return false
  }
  return userRole != 'admin'
}

</script>

<style scoped>
.user-details {
  width: 100%;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-details:hover {
  background-color: #f1f3f5;
}

.user-details.expanded {
  height: auto;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-details-content {
  width: 100%;
}

.basic-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.user-name {
  font-weight: bold;
  font-size: 1rem;
}

.blocked-name {
  text-decoration: line-through;
}

.user-phone {
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
